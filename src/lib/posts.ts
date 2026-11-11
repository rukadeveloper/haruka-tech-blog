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
import type { Root } from "hast";
import { renderFileTreeHtml } from "./file-tree";
import { loadCategories, type Category } from "./categories";
import { LIFE, TAGS } from "./cache";
import { db, unwrap } from "./db";

/** 글·카테고리 캐시 태그 (수명과 무효화 규칙은 lib/cache.ts) */
export const POSTS_TAG = TAGS.posts;

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
  cacheLife(LIFE.posts);
  return (await loadPostMetas()).filter((p) => !p.draft);
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheTag(POSTS_TAG);
  cacheLife(LIFE.posts);
  return loadCategories();
}

/** category 가 "FE" 이면 FE 및 FE/* 모두, "FE/Next.js" 이면 정확히 일치하는 글 */
export const inCategory = (post: PostMeta, category: string) =>
  post.category === category || post.category.startsWith(category + "/");

export async function getPost(slug: string) {
  "use cache";
  cacheTag(POSTS_TAG);
  cacheLife(LIFE.posts);
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

/** <div data-file-tree="…"> (에디터의 파일 트리 블록)를 트리 HTML 로 바꾼다 */
function rehypeFileTree() {
  return (tree: Root) => {
    type Parent = { children?: unknown[] };
    const walk = (parent: Parent) => {
      parent.children = parent.children?.map((child) => {
        const el = child as { type: string; tagName?: string; properties?: Record<string, unknown> } & Parent;
        if (el.type === "element" && el.tagName === "div" && el.properties && "dataFileTree" in el.properties) {
          return { type: "raw", value: renderFileTreeHtml(String(el.properties.dataFileTree ?? "")) };
        }
        walk(el);
        return child;
      });
    };
    walk(tree as Parent);
  };
}

/** 에디터가 저장한 HTML 본문 — 파일 트리를 그리고 코드 하이라이팅을 입힌다 */
export async function renderHtml(content: string) {
  const file = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeFileTree)
    .use(rehypePrettyCode, prettyCodeOptions)
    .use(rehypeStringify, { allowDangerousHtml: true })
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
