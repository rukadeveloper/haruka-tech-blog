import { db, unwrap } from "./db";

export type GuestbookEntry = {
  id: string;
  authorId: number;
  login: string;
  name: string;
  avatar: string;
  body: string;
  createdAt: string; // ISO
};

export { GUESTBOOK_MAX_LEN } from "./guestbook-config";
const PAGE_LIMIT = 100;

type Row = {
  id: string;
  author_id: number;
  login: string;
  name: string;
  avatar: string;
  body: string;
  created_at: string;
};

const toEntry = (r: Row): GuestbookEntry => ({
  id: r.id,
  authorId: Number(r.author_id),
  login: r.login,
  name: r.name,
  avatar: r.avatar,
  body: r.body,
  createdAt: new Date(r.created_at).toISOString(),
});

/** 최신순. 많아지면 페이지로 나누도록 확장한다 */
export async function readGuestbook(): Promise<{ entries: GuestbookEntry[]; total: number }> {
  const { data, error, count } = await db()
    .from("guestbook")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(PAGE_LIMIT);
  if (error) throw new Error(`Supabase: ${error.message}`);
  return { entries: (data as Row[]).map(toEntry), total: count ?? data.length };
}

export async function latestEntryOf(authorId: number): Promise<GuestbookEntry | null> {
  const rows = unwrap(
    await db().from("guestbook").select("*").eq("author_id", authorId).order("created_at", { ascending: false }).limit(1),
  ) as Row[];
  return rows[0] ? toEntry(rows[0]) : null;
}

export async function getEntry(id: string): Promise<GuestbookEntry | null> {
  const row = unwrap(await db().from("guestbook").select("*").eq("id", id).maybeSingle()) as Row | null;
  return row ? toEntry(row) : null;
}

export async function insertEntry(e: GuestbookEntry) {
  unwrap(
    await db().from("guestbook").insert({
      id: e.id,
      author_id: e.authorId,
      login: e.login,
      name: e.name,
      avatar: e.avatar,
      body: e.body,
      created_at: e.createdAt,
    }),
  );
}

export async function removeEntry(id: string) {
  unwrap(await db().from("guestbook").delete().eq("id", id));
}
