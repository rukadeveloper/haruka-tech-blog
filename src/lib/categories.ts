import fs from "node:fs";
import path from "node:path";

export type Category = { name: string; children: string[] };

export const CATEGORIES_FILE = path.join(process.cwd(), "content", "categories.json");

export function readCategories(): Category[] {
  if (!fs.existsSync(CATEGORIES_FILE)) return [];
  return JSON.parse(fs.readFileSync(CATEGORIES_FILE, "utf8"));
}

export function writeCategories(categories: Category[]) {
  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2) + "\n");
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
