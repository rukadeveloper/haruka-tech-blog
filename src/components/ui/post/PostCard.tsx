import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import ThumbImage from "@/components/ui/common/ThumbImage";

/** 글 목록의 카드 하나: 썸네일 + 카테고리 + 제목 + 요약 + 날짜 */
export default function PostCard({ post }: { post: PostMeta }) {
  const label = post.category.split("/").pop();
  return (
    <Link href={`/posts/${post.slug}`} className="group flex h-full flex-col">
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-thumb">
        {post.thumbnail ? (
          <ThumbImage
            src={post.thumbnail}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl font-black text-meta/40">{label || "Blog"}</div>
        )}
      </div>
      <div className="mt-4 flex items-center gap-2">
        {label && <span className="badge badge-primary">{label}</span>}
        <time className="text-caption">{post.date.replaceAll("-", ".")}</time>
      </div>
      <h2 className="text-heading mt-2 line-clamp-2 transition-colors group-hover:text-strong">{post.title}</h2>
      <p className="text-body-sm mt-1.5 line-clamp-2 text-muted">{post.description}</p>
    </Link>
  );
}
