"use server";

import crypto from "node:crypto";
import { revalidatePath, updateTag } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { TAGS } from "@/lib/cache";
import { SLUG_RE, insertComment, readComments, removeComment } from "@/lib/comments";
import { postExists } from "@/lib/posts";
import { clearUserSession, getUser } from "@/lib/session";

const MAX_LEN = 2000;
const MIN_INTERVAL_MS = 5000;

export type CommentState = { error?: string; ok?: number } | null;

export async function addComment(_prev: CommentState, formData: FormData): Promise<CommentState> {
  const user = await getUser();
  if (!user) return { error: "GitHub 로그인이 필요합니다." };

  const slug = String(formData.get("slug") ?? "");
  if (!SLUG_RE.test(slug) || !(await postExists(slug))) {
    return { error: "존재하지 않는 글입니다." };
  }

  const body = String(formData.get("body") ?? "").replace(/\r\n/g, "\n").trim();
  if (!body) return { error: "내용을 입력하세요." };
  if (body.length > MAX_LEN) return { error: `${MAX_LEN}자 이내로 작성하세요.` };

  const comments = await readComments(slug);

  // 답글은 한 단계만: 부모가 답글이면 그 부모의 부모에 붙인다
  let parentId = String(formData.get("parentId") ?? "") || null;
  if (parentId) {
    const parent = comments.find((c) => c.id === parentId);
    if (!parent) return { error: "원본 댓글을 찾을 수 없습니다." };
    parentId = parent.parentId ?? parent.id;
  }

  const mine = comments.filter((c) => c.authorId === user.id).at(-1);
  if (mine && Date.now() - Date.parse(mine.createdAt) < MIN_INTERVAL_MS) {
    return { error: "잠시 후 다시 작성해 주세요." };
  }

  const comment = {
    id: crypto.randomUUID(),
    parentId,
    authorId: user.id,
    login: user.login,
    name: user.name,
    avatar: user.avatar,
    body,
    createdAt: new Date().toISOString(),
  };
  try {
    await insertComment(slug, comment);
  } catch (e) {
    console.error(e);
    return { error: "지금은 댓글을 저장할 수 없습니다." };
  }
  updateTag(TAGS.comments(slug));
  return { ok: Date.now() };
}

export async function deleteComment(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const id = String(formData.get("id") ?? "");
  const user = await getUser();
  const admin = await isAdmin();
  if (!user && !admin) return;

  const target = (await readComments(slug)).find((c) => c.id === id);
  if (!target || !(admin || target.authorId === user?.id)) return;

  // 원댓글을 지우면 달린 답글도 함께 삭제 (DB 외래키 CASCADE)
  await removeComment(id);
  updateTag(TAGS.comments(slug));
}

export async function githubLogout(formData: FormData) {
  await clearUserSession();
  const slug = String(formData.get("slug") ?? "");
  if (SLUG_RE.test(slug)) revalidatePath(`/posts/${slug}`);
}
