import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { loadPostMetas } from "@/lib/posts";
import AdminPostTable from "./AdminPostTable";

// 로그인 확인과 DB 조회로 요청마다 렌더링하는 화면이라 즉시 이동(instant) 검증에서 제외
export const instant = false;

function Stat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface/50 px-4 py-4 sm:px-5">
      <div className="text-xs font-medium text-meta">{label}</div>
      <div className={`mt-1 text-2xl font-bold tracking-tight sm:text-3xl ${tone ?? ""}`}>{value}</div>
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
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">글 관리</h1>
          <p className="mt-1 text-sm text-muted">작성한 글을 확인하고 수정·삭제합니다.</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-strong px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
        >
          <span aria-hidden className="text-base leading-none">+</span> 새 글 작성
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="전체 글" value={posts.length} />
        <Stat label="발행됨" value={posts.length - drafts} tone="text-emerald-600 dark:text-emerald-400" />
        <Stat label="임시저장" value={drafts} tone="text-amber-600 dark:text-amber-400" />
        <Stat label="사용 중인 카테고리" value={categories} />
      </div>

      <AdminPostTable posts={posts.map(({ slug, title, category, date, draft }) => ({ slug, title, category, date, draft }))} />
    </div>
  );
}
