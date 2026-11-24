import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import ThumbImage from "@/components/ui/common/ThumbImage";

/**
 * 글 목록의 한 줄 — 왼쪽 정사각 썸네일, 오른쪽 제목 · 요약 · 카테고리 · 날짜 (DESIGN.md "글 목록").
 * 바탕 · 테두리 없이 행 아래 구분선만 둔다.
 */
export default function PostRow({ post }: { post: PostMeta }) {
  const label = post.category.split("/").pop();

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="pressable pressable-lg group flex items-start gap-4 border-b border-line py-6 sm:gap-6 sm:py-8 lg:gap-8 lg:py-9"
    >
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-line bg-thumb sm:size-28 lg:size-37">
        {post.thumbnail ? (
          // 확대는 감싼 div 가 맡는다 — ThumbImage 의 img 는 투명도 전환을 쓰고 있어 transition 이 겹친다
          <div className="h-full w-full transition-transform duration-(--dur-slow) ease-(--ease-out) motion-safe:group-hover:scale-[1.03]">
            <ThumbImage src={post.thumbnail} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center px-2 text-center text-sm font-black break-all text-meta/50 sm:text-lg">
            {label || "Blog"}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="line-clamp-2 text-[18px] leading-snug font-bold tracking-[-0.01em] transition-colors group-hover:text-strong sm:line-clamp-1 sm:text-2xl sm:tracking-[-0.02em] lg:text-[28px]">
          {post.title}
        </h2>
        {post.description && (
          <p className="mt-1.5 line-clamp-2 text-[15px] leading-7 text-muted sm:mt-2 sm:line-clamp-3 sm:text-base">
            {post.description}
          </p>
        )}
        <p className="mt-3 flex items-center gap-2 text-[13px] sm:mt-4">
          {label && <span className="font-semibold text-strong">{label}</span>}
          <time dateTime={post.date} className="text-meta">
            {post.date.replaceAll("-", ".")}
          </time>
        </p>
      </div>
    </Link>
  );
}
