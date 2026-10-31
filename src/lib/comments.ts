import fs from "node:fs";
import path from "node:path";

export type Comment = {
  id: string;
  parentId: string | null;
  authorId: number;
  login: string;
  name: string;
  avatar: string;
  body: string;
  createdAt: string; // ISO
};

const DIR = path.join(process.cwd(), "content", "comments");
export const SLUG_RE = /^[a-z0-9][a-z0-9_-]*$/i;
const file = (slug: string) => path.join(DIR, `${slug}.json`);

export function readComments(slug: string): Comment[] {
  if (!SLUG_RE.test(slug) || !fs.existsSync(file(slug))) return [];
  try {
    return JSON.parse(fs.readFileSync(file(slug), "utf8"));
  } catch {
    return [];
  }
}

/** 임시 파일에 쓰고 교체해서, 쓰는 도중 읽혀 깨지는 일을 막는다 */
export function writeComments(slug: string, comments: Comment[]) {
  if (!SLUG_RE.test(slug)) throw new Error("invalid slug");
  fs.mkdirSync(DIR, { recursive: true });
  const tmp = `${file(slug)}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(comments, null, 2) + "\n");
  fs.renameSync(tmp, file(slug));
}
