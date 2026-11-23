import Link from "next/link";
import { categoryHref } from "@/lib/categories";
import { getAllPosts, getCategories, inCategory, type PostMeta } from "@/lib/posts";
import PostCard from "@/components/ui/post/PostCard";
import BlogLayout, { BlogSection } from "./BlogLayout";
import BlogSidebar from "./BlogSidebar";
import PostList from "./PostList";

/** 큰 카드 1편 + 다음 3편 3열 */
function Spotlight({ posts }: { posts: PostMeta[] }) {
  const [first, ...rest] = posts;
  return (
    <>
      <PostCard post={first} variant="featured" />
      {rest.length > 0 && (
        <div className="mt-10 sm:mt-12">
          <PostList posts={rest.slice(0, 3)} />
        </div>
      )}
    </>
  );
}

function MoreLink({ href }: { href: string }) {
  return (
    <Link href={href} className="pressable inline-flex shrink-0 items-center gap-1 text-[15px] font-semibold text-strong hover:text-strong-hover">
      모두보기
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <path d="m9 6 6 6-6 6" />
      </svg>
    </Link>
  );
}

const matches = (p: PostMeta, q: string) =>
  [p.title, p.description, p.category, ...p.tags].some((s) => s.toLowerCase().includes(q));

/**
 * 홈: 최신 아티클 → 추천 아티클 → 대분류마다 최신 3편. ?q= 가 있으면 검색 결과 그리드.
 * 글 · 카테고리는 캐시된 읽기 함수에서 가져와 거른다.
 */
export default async function HomeSections({ q = "" }: { q?: string }) {
  const [categories, posts] = await Promise.all([getCategories(), getAllPosts()]);
  const query = q.trim();
  const sidebar = <BlogSidebar categories={categories} q={query} />;

  if (query) {
    const found = posts.filter((p) => matches(p, query.toLowerCase()));
    return (
      <BlogLayout sidebar={sidebar}>
        <BlogSection title={<>‘{query}’ 검색 결과 <span className="text-meta">{found.length}</span></>}>
          <PostList posts={found} empty="검색 결과가 없습니다." />
        </BlogSection>
      </BlogLayout>
    );
  }

  const featured = posts.filter((p) => p.featured);
  const byCategory = categories
    .map((c) => ({ name: c.name, posts: posts.filter((p) => inCategory(p, c.name)) }))
    .filter((c) => c.posts.length > 0);

  return (
    <BlogLayout sidebar={sidebar}>
      {posts.length === 0 ? (
        <p className="empty">등록된 글이 없습니다.</p>
      ) : (
        <>
          <BlogSection title="최신 아티클">
            <Spotlight posts={posts} />
          </BlogSection>

          {featured.length > 0 && (
            <BlogSection title="추천 아티클">
              <Spotlight posts={featured} />
            </BlogSection>
          )}

          {byCategory.map((c) => (
            <BlogSection key={c.name} title={c.name} action={<MoreLink href={categoryHref(c.name)} />}>
              <PostList posts={c.posts.slice(0, 3)} />
            </BlogSection>
          ))}
        </>
      )}
    </BlogLayout>
  );
}
