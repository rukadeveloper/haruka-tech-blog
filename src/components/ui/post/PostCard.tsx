import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import ThumbImage from "@/components/ui/common/ThumbImage";

/**
 * 글 목록의 카드 하나 — 바탕 · 테두리 없이 썸네일 + 제목 + 요약 + 날짜 · 카테고리 (DESIGN.md "글 목록").
 * variant="featured" 는 구획 맨 위의 큰 카드: sm 이상에서 썸네일(3/5)과 글(2/5)이 가로로 놓인다.
 */
export default function PostCard({ post, variant = "default" }: { post: PostMeta; variant?: "default" | "featured" }) {
  const label = post.category.split("/").pop();
  const featured = variant === "featured";

  return (
    <Link
      href={`/posts/${post.slug}`}
      className={`pressable pressable-lg group flex h-full flex-col ${featured ? "sm:grid sm:grid-cols-5 sm:items-center sm:gap-8" : ""}`}
    >
      <div
        className={`relative aspect-[16/9] overflow-hidden rounded-xl border border-line bg-thumb ${featured ? "sm:col-span-3" : ""}`}
      >
        {post.thumbnail ? (
          // 확대는 감싼 div 가 맡는다 — ThumbImage 의 img 는 투명도 전환을 쓰고 있어 transition 이 겹친다
          <div className="h-full w-full transition-transform duration-(--dur-slow) ease-(--ease-out) motion-safe:group-hover:scale-[1.03]">
            <ThumbImage src={post.thumbnail} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-3xl font-black text-meta/40">{label || "Blog"}</div>
        )}
      </div>

      <div className={`pt-4 ${featured ? "sm:col-span-2 sm:pt-0" : ""}`}>
        <h3
          className={`transition-colors group-hover:text-strong ${
            featured ? "text-title line-clamp-2 sm:line-clamp-3" : "text-heading line-clamp-2"
          }`}
        >
          {post.title}
        </h3>
        {post.description && <p className="text-body-sm mt-1.5 line-clamp-2 text-muted">{post.description}</p>}
        <p className="text-caption mt-3">
          <time dateTime={post.date}>{post.date.replaceAll("-", ".")}</time>
          {label && <> · {label}</>}
        </p>
      </div>
    </Link>
  );
}
