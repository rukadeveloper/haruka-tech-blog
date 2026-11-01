import fs from "node:fs";
import path from "node:path";
import { readContent } from "./content-store";

export type Category = { name: string; children: string[] };

/** 저장소 루트 기준 경로 */
export const CATEGORIES_PATH = "content/categories.json";
const CATEGORIES_FILE = path.join(process.cwd(), CATEGORIES_PATH);

export function readCategories(): Category[] {
  if (!fs.existsSync(CATEGORIES_FILE)) return [];
  return JSON.parse(fs.readFileSync(CATEGORIES_FILE, "utf8"));
}

/** 관리자 화면용: 재배포 전에도 최신 내용을 보도록 저장소에서 읽는다 */
export async function loadCategories(): Promise<Category[]> {
  return JSON.parse((await readContent(CATEGORIES_PATH)) ?? "[]");
}

export const stringifyCategories = (categories: Category[]) => JSON.stringify(categories, null, 2) + "\n";

/** "FE/Next.js" -> ["FE", "Next.js"] */
export const splitCategory = (c: string) => c.split("/").filter(Boolean);

/** "FE/Next.js" -> "/category/FE/Next.js" (URL-encoded) */
export const categoryHref = (c: string) =>
  "/category/" + splitCategory(c).map(encodeURIComponent).join("/");

/** 선택 가능한 전체 카테고리 경로 (대분류 + 소분류) */
export function flattenCategories(categories: Category[]): string[] {
  return categories.flatMap((c) => [c.name, ...c.children.map((s) => `${c.name}/${s}`)]);
}
