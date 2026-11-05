import { db, unwrap } from "./db";

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

export const SLUG_RE = /^[a-z0-9][a-z0-9_-]*$/i;

type Row = {
  id: string;
  parent_id: string | null;
  author_id: number;
  login: string;
  name: string;
  avatar: string;
  body: string;
  created_at: string;
};

const toComment = (r: Row): Comment => ({
  id: r.id,
  parentId: r.parent_id,
  authorId: Number(r.author_id),
  login: r.login,
  name: r.name,
  avatar: r.avatar,
  body: r.body,
  createdAt: new Date(r.created_at).toISOString(),
});

export async function readComments(slug: string): Promise<Comment[]> {
  if (!SLUG_RE.test(slug)) return [];
  const rows = unwrap(await db().from("comments").select("*").eq("post_slug", slug).order("created_at")) as Row[];
  return rows.map(toComment);
}

export async function insertComment(slug: string, c: Comment) {
  unwrap(
    await db().from("comments").insert({
      id: c.id,
      post_slug: slug,
      parent_id: c.parentId,
      author_id: c.authorId,
      login: c.login,
      name: c.name,
      avatar: c.avatar,
      body: c.body,
      created_at: c.createdAt,
    }),
  );
}

/** 답글은 parent_id 외래키(ON DELETE CASCADE)로 함께 지워진다 */
export async function removeComment(id: string) {
  unwrap(await db().from("comments").delete().eq("id", id));
}
