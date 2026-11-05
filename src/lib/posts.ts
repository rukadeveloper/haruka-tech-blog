import { cacheLife, cacheTag } from "next/cache";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeParse from "rehype-parse";
import rehypeRaw from "rehype-raw";
import rehypePrettyCode from "rehype-pretty-code";
import { prettyCodeOptions } from "./highlight";
import rehypeStringify from "rehype-stringify";
import { loadCategories, type Category } from "./categories";
import { db, unwrap } from "./db";

export const POSTS_TAG = "posts";
/**
 * 공개 화면 캐시 수명. 관리자 화면에서 저장·삭제하면 POSTS_TAG 로 바로 무효화되고,
 * 화면 밖(스크립트, Supabase 대시보드)에서 DB 를 바꾼 경우에도 revalidate 안에는 최신 내용으로 갱신된다.
 * revalidate: 이 시간이 지난 뒤 첫 요청이 오면 백그라운드에서 새로 만든다 / expire: 이 시간이 지나면 새로 만들 때까지 기다린다
 */
const POSTS_CACHE = { stale: 60, revalidate: 300, expire: 3600 };

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  category: string;
  description: string;
  tags: string[];
  thumbnail: string;
  /** true 면 공개 화면에서 숨기고 관리자에서만 보인다 (티스토리 임시저장 등) */
  draft: boolean;
};

/** markdown: 기존 가져온 글 / html: 에디터(WYSIWYG)로 저장한 글 */
export type PostFormat = "markdown" | "html";
export type PostSource = { meta: PostMeta; content: string; format: PostFormat };

const META_COLUMNS = "slug,title,date,category,description,tags,thumbnail,draft";

type MetaRow = {
  slug: string;
  title: string;
  date: string | null;
  category: string;
  description: string;
  tags: string[];
  thumbnail: string;
  draft: boolean;
};

const toMeta = (r: MetaRow): PostMeta => ({
  slug: r.slug,
  title: r.title || r.slug,
  date: r.date ? r.date.slice(0, 10) : "",
  category: r.category,
  description: r.description,
  tags: r.tags ?? [],
  thumbnail: r.thumbnail,
  draft: r.draft,
});

/** 글 하나를 DB 에서 읽는다. 없으면 오류 */
export async function loadPostSource(slug: string): Promise<PostSource> {
  const row = unwrap(
    await db().from("posts").select(`${META_COLUMNS},format,body`).eq("slug", slug).maybeSingle(),
  ) as (MetaRow & { format: PostFormat; body: string }) | null;
  if (!row) throw new Error(`post not found: ${slug}`);
  return { meta: toMeta(row), content: row.body, format: row.format === "html" ? "html" : "markdown" };
}

export async function postExists(slug: string): Promise<boolean> {
  const rows = unwrap(await db().from("posts").select("slug").eq("slug", slug)) as unknown[];
  return rows.length > 0;
}

const byNewest = (a: PostMeta, b: PostMeta) =>
  a.date === b.date
    ? b.slug.localeCompare(a.slug, undefined, { numeric: true })
    : a.date < b.date ? 1 : -1;

/** 관리자 화면용 전체 글 목록 (임시저장 포함) */
export async function loadPostMetas(): Promise<PostMeta[]> {
  const rows = unwrap(await db().from("posts").select(META_COLUMNS)) as MetaRow[];
  return rows.map(toMeta).sort(byNewest);
}

export async function getAllPosts(): Promise<PostMeta[]> {
  "use cache";
  cacheTag(POSTS_TAG);
  cacheLife(POSTS_CACHE);
  return (await loadPostMetas()).filter((p) => !p.draft);
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheTag(POSTS_TAG);
  cacheLife(POSTS_CACHE);
  return loadCategories();
}

/** category 가 "FE" 이면 FE 및 FE/* 모두, "FE/Next.js" 이면 정확히 일치하는 글 */
export const inCategory = (post: PostMeta, category: string) =>
  post.category === category || post.category.startsWith(category + "/");

export async function getPost(slug: string) {
  "use cache";
  cacheTag(POSTS_TAG);
  cacheLife(POSTS_CACHE);
  const { meta, content, format } = await loadPostSource(slug);
  if (meta.draft) throw new Error("draft");
  const html = format === "html" ? await renderHtml(content) : await renderMarkdown(content);
  return { meta, html };
}

export async function renderMarkdown(content: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypePrettyCode, prettyCodeOptions)
    .use(rehypeStringify)
    .process(content);
  return String(file);
}

/** 에디터가 저장한 HTML 본문 — 코드 하이라이팅만 입힌다 */
export async function renderHtml(content: string) {
  const file = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypePrettyCode, prettyCodeOptions)
    .use(rehypeStringify)
    .process(content);
  return String(file);
}

/** 마크다운 글을 에디터에 불러오기 위한 순수 HTML 변환 (하이라이팅 없음) */
export async function markdownToEditorHtml(content: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(content);
  return String(file);
}
