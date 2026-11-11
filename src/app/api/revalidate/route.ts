import crypto from "node:crypto";
import { revalidateTag } from "next/cache";
import { TAGS } from "@/lib/cache";

/**
 * 관리자 화면 밖에서 글·카테고리·썸네일·방명록을 바꾼 뒤(스크립트, Supabase 대시보드) 공개 화면 캐시를 바로 비운다.
 * POST /api/revalidate  헤더 Authorization: Bearer <REVALIDATE_SECRET>
 * REVALIDATE_SECRET 이 없으면 비활성화된다.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return Response.json({ error: "disabled" }, { status: 503 });

  const given = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  // 'max': 오래된 캐시를 즉시 비우지 않고 다음 요청 때 새로 만든다 (stale-while-revalidate)
  revalidateTag(TAGS.posts, "max");
  revalidateTag(TAGS.guestbook, "max");
  return Response.json({ revalidated: true, at: new Date().toISOString() });
}
