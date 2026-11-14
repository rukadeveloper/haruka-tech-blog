import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import ThumbImage from "@/components/ui/common/ThumbImage";

/** 글 목록의 카드 하나: 썸네일을 품은 유리 카드 — 썸네일 + 카테고리 + 제목 + 요약 + 날짜 */
export default function PostCard({ post }: { post: PostMeta }) {
  const label = post.category.split("/").pop();
  return (
    <Link href={`/posts/${post.slug}`} className="card pressable pressable-lg group flex h-full flex-col p-2.5">
      {/* 썸네일 모서리(14px) = 카드 모서리(20px) - 안쪽 여백(10px) 에 가깝게 맞춰 테두리가 나란히 돈다 */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-[14px] bg-thumb">
        {post.thumbnail ? (
          // 확대는 감싼 div 가 맡는다 — ThumbImage 의 img 는 투명도 전환을 쓰고 있어 transition 이 겹친다
          <div className="h-full w-full transition-transform duration-(--dur-slow) ease-(--ease-out) motion-safe:group-hover:scale-[1.03]">
            <ThumbImage src={post.thumbnail} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-3xl font-black text-meta/40">{label || "Blog"}</div>
        )}
      </div>
      <div className="px-2 pt-4 pb-2.5">
        <div className="flex items-center gap-2">
          {label && <span className="badge badge-primary">{label}</span>}
          <time className="text-caption">{post.date.replaceAll("-", ".")}</time>
        </div>
        <h2 className="text-heading mt-2 line-clamp-2 transition-colors group-hover:text-strong">{post.title}</h2>
        <p className="text-body-sm mt-1.5 line-clamp-2 text-muted">{post.description}</p>
      </div>
    </Link>
  );
}
