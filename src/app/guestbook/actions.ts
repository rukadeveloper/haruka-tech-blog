"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { GUESTBOOK_MAX_LEN, getEntry, insertEntry, latestEntryOf, removeEntry } from "@/lib/guestbook";
import { clearUserSession, getUser } from "@/lib/session";

const MIN_INTERVAL_MS = 30_000;

export type GuestbookState = { error?: string; ok?: number } | null;

export async function addEntry(_prev: GuestbookState, formData: FormData): Promise<GuestbookState> {
  const user = await getUser();
  if (!user) return { error: "GitHub 로그인이 필요합니다." };

  const body = String(formData.get("body") ?? "").replace(/\r\n/g, "\n").trim();
  if (!body) return { error: "내용을 입력하세요." };
  if (body.length > GUESTBOOK_MAX_LEN) return { error: `${GUESTBOOK_MAX_LEN}자 이내로 작성하세요.` };

  try {
    const last = await latestEntryOf(user.id);
    if (last && Date.now() - Date.parse(last.createdAt) < MIN_INTERVAL_MS) {
      return { error: "잠시 후 다시 작성해 주세요." };
    }
    await insertEntry({
      id: crypto.randomUUID(),
      authorId: user.id,
      login: user.login,
      name: user.name,
      avatar: user.avatar,
      body,
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error(e);
    return { error: "지금은 방명록을 저장할 수 없습니다." };
  }
  revalidatePath("/guestbook");
  return { ok: Date.now() };
}

/** 본인이 쓴 글이거나 관리자일 때만 삭제 */
export async function deleteEntry(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const [user, admin] = await Promise.all([getUser(), isAdmin()]);
  if (!user && !admin) return;
  const target = await getEntry(id);
  if (!target || !(admin || target.authorId === user?.id)) return;
  await removeEntry(id);
  revalidatePath("/guestbook");
}

export async function guestbookLogout() {
  await clearUserSession();
  revalidatePath("/guestbook");
}
