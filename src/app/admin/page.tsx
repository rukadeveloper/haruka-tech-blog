import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { loadPostMetas } from "@/lib/posts";
import { deletePost } from "./actions";
import ConfirmDeleteButton from "./ConfirmDeleteButton";

export default async function AdminHome() {
  await requireAdmin();
  const posts = await loadPostMetas();
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">글 관리 ({posts.length})</h1>
        <Link href="/admin/posts/new" className="rounded bg-foreground px-3 py-1.5 text-sm text-background">
          새 글 작성
        </Link>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="border-b border-black/10 dark:border-white/10">
          <tr>
            <th className="py-2">제목</th>
            <th>카테고리</th>
            <th>날짜</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.slug} className="border-b border-black/5 dark:border-white/5">
              <td className="py-2 pr-2">
                {p.draft && <span className="mr-2 rounded bg-surface px-1.5 py-0.5 text-xs text-muted">임시저장</span>}
                <Link href={p.draft ? `/admin/posts/${p.slug}/edit` : `/posts/${p.slug}`} className="hover:underline">{p.title}</Link>
              </td>
              <td className="pr-2 opacity-70">{p.category || "-"}</td>
              <td className="pr-2 whitespace-nowrap opacity-70">{p.date}</td>
              <td className="whitespace-nowrap text-right">
                <Link href={`/admin/posts/${p.slug}/preview`} className="mr-3 hover:underline">미리보기</Link>
                <Link href={`/admin/posts/${p.slug}/edit`} className="mr-3 hover:underline">수정</Link>
                <form action={deletePost} className="inline">
                  <input type="hidden" name="slug" value={p.slug} />
                  <ConfirmDeleteButton target={p.title} />
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
