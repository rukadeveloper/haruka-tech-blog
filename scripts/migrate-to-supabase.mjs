// content/ 의 글·카테고리·댓글을 Supabase 로 옮긴다. 여러 번 실행해도 같은 결과 (upsert).
// 사용: node --env-file=.env scripts/migrate-to-supabase.mjs   (먼저 db/schema.sql 을 실행해 둘 것)
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.");
const db = createClient(url, key, { auth: { persistSession: false } });

const check = (label, { error }) => {
  if (error) throw new Error(`${label}: ${error.message}`);
};
const root = path.join(process.cwd(), "content");
const KNOWN = new Set(["title", "date", "category", "description", "tags", "thumbnail", "format", "draft"]);

const toDate = (v) => {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).slice(0, 10);
};

/* ---------- 글 ---------- */
const postsDir = path.join(root, "posts");
const posts = fs
  .readdirSync(postsDir)
  .filter((f) => f.endsWith(".md"))
  .map((f) => {
    const slug = f.replace(/\.md$/, "");
    const { data, content } = matter(fs.readFileSync(path.join(postsDir, f), "utf8"));
    return {
      slug,
      title: data.title ?? slug,
      date: toDate(data.date),
      category: data.category ?? "",
      description: data.description ?? "",
      tags: data.tags ?? [],
      thumbnail: data.thumbnail ?? "",
      format: data.format === "html" ? "html" : "markdown",
      draft: data.draft === true,
      body: content,
      extra: Object.fromEntries(Object.entries(data).filter(([k]) => !KNOWN.has(k))),
    };
  });
for (let i = 0; i < posts.length; i += 25) check("posts", await db.from("posts").upsert(posts.slice(i, i + 25)));
console.log(`글 ${posts.length}개`);

/* ---------- 카테고리 ---------- */
const catFile = path.join(root, "categories.json");
if (fs.existsSync(catFile)) {
  const cats = JSON.parse(fs.readFileSync(catFile, "utf8"));
  const rows = cats.flatMap((c, i) => [
    { path: c.name, position: i * 1000 },
    ...c.children.map((s, j) => ({ path: `${c.name}/${s}`, position: i * 1000 + j + 1 })),
  ]);
  check("categories", await db.from("categories").upsert(rows));
  console.log(`카테고리 ${rows.length}개`);
}

/* ---------- 댓글 ---------- */
const commentsDir = path.join(root, "comments");
let commentCount = 0;
if (fs.existsSync(commentsDir)) {
  const slugs = new Set(posts.map((p) => p.slug));
  for (const f of fs.readdirSync(commentsDir).filter((f) => f.endsWith(".json"))) {
    const slug = f.replace(/\.json$/, "");
    if (!slugs.has(slug)) {
      console.warn(`건너뜀: 글이 없는 댓글 파일 ${f}`);
      continue;
    }
    const list = JSON.parse(fs.readFileSync(path.join(commentsDir, f), "utf8"));
    const row = (c) => ({
      id: c.id, post_slug: slug, parent_id: c.parentId, author_id: c.authorId,
      login: c.login, name: c.name, avatar: c.avatar, body: c.body, created_at: c.createdAt,
    });
    // 원댓글을 먼저 넣어야 답글의 외래키가 맞는다
    check("comments", await db.from("comments").upsert(list.filter((c) => !c.parentId).map(row)));
    check("replies", await db.from("comments").upsert(list.filter((c) => c.parentId).map(row)));
    commentCount += list.length;
  }
}
console.log(`댓글 ${commentCount}개`);

/* ---------- 검증 ---------- */
const { count } = await db.from("posts").select("*", { count: "exact", head: true });
console.log(`DB 글 수: ${count} / 파일 수: ${posts.length}`, count === posts.length ? "✔ 일치" : "✘ 불일치");
