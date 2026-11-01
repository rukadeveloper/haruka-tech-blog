"use server";

import fs from "node:fs";
import path from "node:path";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import matter from "gray-matter";
import { requireAdmin } from "@/lib/auth";
import { clearUserSession } from "@/lib/session";
import {
  flattenCategories,
  readCategories,
  splitCategory,
  writeCategories,
} from "@/lib/categories";
import { POSTS_DIR, POSTS_TAG, listPostMetas, readPostSource, renderHtml } from "@/lib/posts";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const SLUG_RE = /^[a-z0-9][a-z0-9_-]*$/i;
const postFile = (slug: string) => path.join(POSTS_DIR, `${slug}.md`);

/* ---------- 인증 ---------- */

export async function logout() {
  await clearUserSession();
  redirect("/admin/login");
}

/* ---------- 글 ---------- */

/** error: 저장 실패 사유. slug/savedAt: 임시저장 성공 시 (에디터에 남아 같은 글을 계속 갱신) */
export type SaveState = { error?: string; slug?: string; savedAt?: string } | null;

/** intent=draft 는 비공개로 저장하고 에디터에 남고, 그 외(발행)는 저장 후 목록으로 이동 */
export async function savePost(_prev: SaveState, formData: FormData): Promise<SaveState> {
  await requireAdmin();

  const isDraft = str(formData, "intent") === "draft";
  const originalSlug = str(formData, "originalSlug");
  const title = str(formData, "title");
  if (!title) return { error: "제목을 입력하세요." };

  let slug = str(formData, "slug");
  if (!slug) slug = originalSlug || String(Date.now());
  if (!SLUG_RE.test(slug)) return { error: "슬러그는 영문/숫자/-/_ 만 사용할 수 있습니다." };
  if (slug !== originalSlug && fs.existsSync(postFile(slug))) return { error: "이미 존재하는 슬러그입니다." };

  const category = str(formData, "category");
  if (category && !flattenCategories(readCategories()).includes(category)) {
    return { error: "존재하지 않는 카테고리입니다." };
  }

  const tags = str(formData, "tags").split(",").map((t) => t.trim()).filter(Boolean);
  const data = {
    title,
    date: str(formData, "date") || new Date().toISOString().slice(0, 10),
    category,
    description: str(formData, "description"),
    tags,
    thumbnail: str(formData, "thumbnail"),
    format: "html",
    ...(isDraft ? { draft: true } : {}),
  };
  const content = String(formData.get("content") ?? "");

  fs.mkdirSync(POSTS_DIR, { recursive: true });
  fs.writeFileSync(postFile(slug), matter.stringify(content, data));
  if (originalSlug && originalSlug !== slug && SLUG_RE.test(originalSlug)) {
    fs.rmSync(postFile(originalSlug), { force: true });
  }

  updateTag(POSTS_TAG);
  if (isDraft) return { slug, savedAt: new Date().toISOString() };
  redirect("/admin");
}

/** 에디터의 저장 전 내용을 실제 글과 같은 방식(코드 하이라이팅 포함)으로 렌더링 */
export async function previewHtml(html: string) {
  await requireAdmin();
  return renderHtml(html);
}

export async function deletePost(formData: FormData) {
  await requireAdmin();
  const slug = str(formData, "slug");
  if (!SLUG_RE.test(slug)) throw new Error("잘못된 슬러그입니다.");
  fs.rmSync(postFile(slug), { force: true });
  updateTag(POSTS_TAG);
  redirect("/admin");
}

/* ---------- 카테고리 ---------- */

/** 대분류/소분류 추가. parent 가 비어 있으면 대분류. */
export async function addCategory(formData: FormData) {
  await requireAdmin();
  const name = str(formData, "name");
  const parent = str(formData, "parent");
  if (!name || name.includes("/")) throw new Error("카테고리 이름이 올바르지 않습니다.");

  const cats = readCategories();
  if (!parent) {
    if (cats.some((c) => c.name === name)) throw new Error("이미 존재하는 카테고리입니다.");
    cats.push({ name, children: [] });
  } else {
    const p = cats.find((c) => c.name === parent);
    if (!p) throw new Error("상위 카테고리를 찾을 수 없습니다.");
    if (p.children.includes(name)) throw new Error("이미 존재하는 카테고리입니다.");
    p.children.push(name);
  }
  writeCategories(cats);
  updateTag(POSTS_TAG);
  redirect("/admin/categories");
}

/** category: "FE" 또는 "FE/Next.js". 글이 남아 있으면 삭제 불가. */
export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const category = str(formData, "category");
  const [top, sub] = splitCategory(category);
  const inUse = listPostMetas().some(
    (p) => p.category === category || p.category.startsWith(category + "/")
  );
  if (inUse) throw new Error("글이 있는 카테고리는 삭제할 수 없습니다. 글을 먼저 이동하세요.");

  let cats = readCategories();
  cats = sub
    ? cats.map((c) => (c.name === top ? { ...c, children: c.children.filter((s) => s !== sub) } : c))
    : cats.filter((c) => c.name !== top);
  writeCategories(cats);
  updateTag(POSTS_TAG);
  redirect("/admin/categories");
}

/** 이름 변경 + 해당 카테고리를 쓰는 글들의 frontmatter 도 함께 갱신 */
export async function renameCategory(formData: FormData) {
  await requireAdmin();
  const category = str(formData, "category");
  const newName = str(formData, "newName");
  if (!newName || newName.includes("/")) throw new Error("카테고리 이름이 올바르지 않습니다.");
  const [top, sub] = splitCategory(category);

  const cats = readCategories();
  const t = cats.find((c) => c.name === top);
  if (!t) throw new Error("카테고리를 찾을 수 없습니다.");
  if (sub) {
    if (!t.children.includes(sub)) throw new Error("카테고리를 찾을 수 없습니다.");
    if (t.children.includes(newName)) throw new Error("이미 존재하는 카테고리입니다.");
    t.children = t.children.map((s) => (s === sub ? newName : s));
  } else {
    if (cats.some((c) => c.name === newName)) throw new Error("이미 존재하는 카테고리입니다.");
    t.name = newName;
  }
  const next = sub ? `${top}/${newName}` : newName;

  for (const meta of listPostMetas()) {
    if (meta.category === category || meta.category.startsWith(category + "/")) {
      const { meta: { slug, draft, ...m }, content, format } = readPostSource(meta.slug);
      const updated = next + m.category.slice(category.length);
      fs.writeFileSync(postFile(slug), matter.stringify(content, { ...m, category: updated, ...(format === "html" ? { format } : {}), ...(draft ? { draft } : {}) }));
    }
  }
  writeCategories(cats);
  updateTag(POSTS_TAG);
  redirect("/admin/categories");
}
