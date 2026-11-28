import { categoryHref } from "@/lib/categories";
import { getAllPosts, getCategories, inCategory, type PostMeta } from "@/lib/posts";
import Pagination from "@/components/ui/common/Pagination";
import PostRow from "@/components/ui/post/PostRow";
import BlogSidebar from "./BlogSidebar";

/** 한 페이지에 보이는 글 수 */
export const PAGE_SIZE = 10;

/** 목록 | 사이드바 2열 (LINE Engineering 배치). 스켈레톤도 같은 틀을 쓴다 */
export const LIST_GRID = "pt-8 pb-20 sm:pt-10 sm:pb-24 lg:grid lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-16";

const matches = (p: PostMeta, q: string) =>
  [p.title, p.description, p.category, ...p.tags].some((s) => s.toLowerCase().includes(q));

/**
 * 홈 · 카테고리 화면: [글자만 있는 목록 → 페이지네이션 | 사이드바(검색 · 카테고리)] (docs/design "글 목록").
 * category 가 비면 전체 글, q 가 있으면 전체 글에서 검색한다. 글 · 카테고리는 캐시된 읽기 함수에서 가져와 거른다.
 */
export default async function BlogList({ category = "", page = 1, q = "" }: { category?: string; page?: number; q?: string }) {
  const [categories, all] = await Promise.all([getCategories(), getAllPosts()]);
  const query = q.trim();

  const posts = query
    ? all.filter((p) => matches(p, query.toLowerCase()))
    : category
      ? all.filter((p) => inCategory(p, category))
      : all;

  const total = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, page), total);
  const visible = posts.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const heading = query ? `‘${query}’ 검색 결과` : category ? category.split("/").join(" · ") : "전체 글";

  return (
    <div className={LIST_GRID}>
      <h1 className="sr-only">{heading}</h1>
      <BlogSidebar categories={categories} category={category} q={query} />

      <div className="mt-6 min-w-0 lg:col-start-1 lg:row-start-1 lg:mt-0">
        {query ? (
          <p className="border-b border-line pb-5 text-[15px] text-muted" aria-live="polite">
            ‘<strong className="text-foreground">{query}</strong>’ 검색 결과 <span className="font-semibold text-foreground">{posts.length}</span>건
          </p>
        ) : category ? (
          <p className="flex items-baseline gap-2 border-b border-line pb-5">
            <span className="text-xl font-bold">{category.split("/").join(" › ")}</span>
            <span className="text-sm text-meta">{posts.length}편</span>
          </p>
        ) : null}

        {visible.length === 0 ? (
          <p className="empty mt-8">{query ? "검색 결과가 없습니다." : "등록된 글이 없습니다."}</p>
        ) : (
          <ul>
            {visible.map((p) => (
              <li key={p.slug}>
                <PostRow post={p} />
              </li>
            ))}
          </ul>
        )}

        <Pagination
          base={query || !category ? "/" : categoryHref(category)}
          query={query ? { q: query } : undefined}
          page={current}
          total={total}
        />
      </div>
    </div>
  );
}
