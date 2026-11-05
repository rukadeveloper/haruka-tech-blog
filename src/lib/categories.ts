import { db, unwrap } from "./db";

export type Category = { name: string; children: string[] };

/** DB 에는 경로("FE", "FE/Next.js")와 순서만 저장하고, 화면용 트리는 읽을 때 만든다 */
export async function loadCategories(): Promise<Category[]> {
  const rows = unwrap(await db().from("categories").select("path").order("position")) as { path: string }[];
  const tree: Category[] = [];
  for (const { path } of rows) {
    const [top, sub] = splitCategory(path);
    let node = tree.find((c) => c.name === top);
    if (!node) tree.push((node = { name: top, children: [] }));
    if (sub) node.children.push(sub);
  }
  return tree;
}

/** 카테고리 트리 전체를 저장한다 (없어진 항목은 지운다) */
export async function saveCategories(categories: Category[]) {
  const rows = categories.flatMap((c, i) => [
    { path: c.name, position: i * 1000 },
    ...c.children.map((s, j) => ({ path: `${c.name}/${s}`, position: i * 1000 + j + 1 })),
  ]);
  const existing = unwrap(await db().from("categories").select("path")) as { path: string }[];
  if (rows.length) unwrap(await db().from("categories").upsert(rows));
  const keep = new Set(rows.map((r) => r.path));
  const stale = existing.map((r) => r.path).filter((p) => !keep.has(p));
  if (stale.length) unwrap(await db().from("categories").delete().in("path", stale));
}

/** "FE/Next.js" -> ["FE", "Next.js"] */
export const splitCategory = (c: string) => c.split("/").filter(Boolean);

/** "FE/Next.js" -> "/category/FE/Next.js" (URL-encoded) */
export const categoryHref = (c: string) =>
  "/category/" + splitCategory(c).map(encodeURIComponent).join("/");

/** 선택 가능한 전체 카테고리 경로 (대분류 + 소분류) */
export function flattenCategories(categories: Category[]): string[] {
  return categories.flatMap((c) => [c.name, ...c.children.map((s) => `${c.name}/${s}`)]);
}
