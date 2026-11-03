import fs from "node:fs";
import path from "node:path";
import { cacheTag } from "next/cache";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeParse from "rehype-parse";
import rehypeRaw from "rehype-raw";
import rehypePrettyCode from "rehype-pretty-code";
import { prettyCodeOptions } from "./highlight";
import rehypeStringify from "rehype-stringify";
import { readCategories, type Category } from "./categories";
import { readContent, readContentDir } from "./content-store";

export const POSTS_DIR = path.join(process.cwd(), "content", "posts");
export const POSTS_TAG = "posts";
/** 저장소 루트 기준 글 파일 경로 */
export const postPath = (slug: string) => `content/posts/${slug}.md`;

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

function parsePost(slug: string, raw: string): PostSource {
  const { data, content } = matter(raw);
  return {
    content,
    format: data.format === "html" ? "html" : "markdown",
    meta: {
      slug,
      title: data.title ?? slug,
      date: data.date ? String(data.date).slice(0, 10) : "",
      category: data.category ?? "",
      description: data.description ?? "",
      tags: data.tags ?? [],
      thumbnail: data.thumbnail ?? "",
      draft: data.draft === true,
    },
  };
}

/** 파일 시스템에서 직접 읽기 (캐시 함수 내부용) */
export function readPostSource(slug: string): PostSource {
  return parsePost(slug, fs.readFileSync(path.join(POSTS_DIR, `${slug}.md`), "utf8"));
}

/** 관리자 화면용: 재배포 전에도 최신 내용을 보도록 저장소에서 읽는다 */
export async function loadPostSource(slug: string): Promise<PostSource> {
  const raw = await readContent(postPath(slug));
  if (raw === null) throw new Error(`post not found: ${slug}`);
  return parsePost(slug, raw);
}

const byNewest = (a: PostMeta, b: PostMeta) =>
  a.date === b.date
    ? b.slug.localeCompare(a.slug, undefined, { numeric: true })
    : a.date < b.date ? 1 : -1;

export function listPostMetas(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => readPostSource(f.replace(/\.md$/, "")).meta)
    .sort(byNewest);
}

/** 관리자 화면용 전체 글 목록 (임시저장 포함) */
export async function loadPostMetas(): Promise<PostMeta[]> {
  const files = await readContentDir("content/posts");
  return Object.entries(files)
    .filter(([name]) => name.endsWith(".md"))
    .map(([name, raw]) => parsePost(name.replace(/\.md$/, ""), raw).meta)
    .sort(byNewest);
}

export async function getAllPosts(): Promise<PostMeta[]> {
  "use cache";
  cacheTag(POSTS_TAG);
  return listPostMetas().filter((p) => !p.draft);
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheTag(POSTS_TAG);
  return readCategories();
}

/** category 가 "FE" 이면 FE 및 FE/* 모두, "FE/Next.js" 이면 정확히 일치하는 글 */
export const inCategory = (post: PostMeta, category: string) =>
  post.category === category || post.category.startsWith(category + "/");

export async function getPost(slug: string) {
  "use cache";
  cacheTag(POSTS_TAG);
  const { meta, content, format } = readPostSource(slug);
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
