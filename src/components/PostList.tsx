import type { PostMeta } from "@/lib/posts";
import PostCard from "@/components/ui/post/PostCard";

/** 카드 그리드: 모바일 1열 → sm 2열 → lg 3열 */
export const POST_GRID = "grid gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-y-12 lg:grid-cols-3 lg:gap-x-8";

export default function PostList({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) return <p className="empty">등록된 글이 없습니다.</p>;
  return (
    <ul className={POST_GRID}>
      {posts.map((p) => (
        <li key={p.slug}>
          <PostCard post={p} />
        </li>
      ))}
    </ul>
  );
}
