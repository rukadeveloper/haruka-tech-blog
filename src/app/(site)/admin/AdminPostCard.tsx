import Link from "next/link";
import ThumbImage from "@/components/ui/common/ThumbImage";
import PostActions from "./PostActions";

export type AdminPost = {
  slug: string;
  title: string;
  category: string;
  date: string;
  draft: boolean;
  featured: boolean;
  thumbnail: string;
};

/** 임시저장 글은 수정 화면으로, 발행된 글은 공개 화면으로 간다 */
export const postHref = (p: AdminPost) => (p.draft ? `/admin/posts/${p.slug}/edit` : `/posts/${p.slug}`);

export function StatusBadge({ draft }: { draft: boolean }) {
  return draft ? <span className="badge badge-warning">임시저장</span> : <span className="badge badge-success">발행됨</span>;
}

/** 관리자 글 그리드의 카드 하나: 썸네일(상태 배지) → 제목 · 카테고리 · 날짜 → 작업 줄 (DESIGN.md "관리자 화면") */
export default function AdminPostCard({ post }: { post: AdminPost }) {
  const label = post.category.split("/").pop();

  return (
    <article className="card flex h-full flex-col overflow-hidden">
      <Link href={postHref(post)} className="group relative block aspect-[16/9] overflow-hidden bg-thumb" tabIndex={-1} aria-hidden>
        {post.thumbnail ? (
          <div className="h-full w-full transition-transform duration-(--dur-slow) ease-(--ease-out) motion-safe:group-hover:scale-[1.03]">
            <ThumbImage src={post.thumbnail} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-2xl font-black text-meta/40">{label || "Blog"}</div>
        )}
        {/* 썸네일 위에 겹쳐 두는 배지는 바탕이 비치지 않게 elevated 를 깐다 */}
        <span className="absolute top-2.5 left-2.5 flex gap-1">
          <span className="rounded-md bg-elevated">
            <StatusBadge draft={post.draft} />
          </span>
          {post.featured && (
            <span className="rounded-md bg-elevated">
              <span className="badge badge-primary">추천</span>
            </span>
          )}
        </span>
      </Link>

      <div className="flex-1 p-4">
        <Link href={postHref(post)} className="line-clamp-2 font-semibold hover:text-strong">
          {post.title}
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          {post.category && <span className="badge">{post.category}</span>}
          <time className="text-caption">{post.date}</time>
        </div>
      </div>

      <PostActions slug={post.slug} title={post.title} className="border-t border-line px-2 py-1.5" />
    </article>
  );
}
