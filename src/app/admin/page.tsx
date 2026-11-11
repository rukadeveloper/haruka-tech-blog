import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { loadPostMetas } from "@/lib/posts";
import AdminPostTable from "./AdminPostTable";

// 로그인 확인과 DB 조회로 요청마다 렌더링하는 화면이라 즉시 이동(instant) 검증에서 제외
export const instant = false;

function Stat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="card bg-subtle px-4 py-4 sm:px-5">
      <div className="text-caption font-medium">{label}</div>
      <div className={`text-title mt-1 tabular-nums ${tone ?? ""}`}>{value}</div>
    </div>
  );
}

export default async function AdminHome() {
  await requireAdmin();
  const posts = await loadPostMetas();
  const drafts = posts.filter((p) => p.draft).length;
  const categories = new Set(posts.map((p) => p.category).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-title">글 관리</h1>
          <p className="mt-1 text-sm text-muted">작성한 글을 확인하고 수정·삭제합니다.</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="btn btn-primary shrink-0"
        >
          <span aria-hidden className="text-base leading-none">+</span> 새 글 작성
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="전체 글" value={posts.length} />
        <Stat label="발행됨" value={posts.length - drafts} tone="text-success" />
        <Stat label="임시저장" value={drafts} tone="text-warning" />
        <Stat label="사용 중인 카테고리" value={categories} />
      </div>

      <AdminPostTable posts={posts.map(({ slug, title, category, date, draft }) => ({ slug, title, category, date, draft }))} />
    </div>
  );
}
