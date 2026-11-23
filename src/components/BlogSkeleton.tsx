import BlogLayout, { BlogSection } from "./BlogLayout";
import { POST_GRID } from "./PostList";

function CardSkeleton() {
  return (
    <li>
      <div className="skeleton aspect-[16/9] !rounded-xl" />
      <div className="skeleton mt-4 h-7 w-full" />
      <div className="skeleton mt-1.5 h-6 w-5/6" />
      <div className="skeleton mt-3 h-5 w-32" />
    </li>
  );
}

/**
 * 홈 · 카테고리 화면 로딩 자리표시자.
 * 화면을 옮기는 동안 빈 화면이 보이지 않도록 실제 배치(사이드바 + 구획 + 3열)와 같은 크기로 그린다.
 */
export default function BlogSkeleton() {
  const sidebar = (
    <div aria-hidden>
      <div className="skeleton hidden h-8 w-28 lg:mb-5 lg:block" />
      <ul className="scroll-row lg:mx-0 lg:flex-col lg:gap-1 lg:px-0">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className="skeleton h-9 w-20 shrink-0 lg:w-full" />
        ))}
      </ul>
      <div className="skeleton mt-3 h-11 w-full lg:mt-10" />
    </div>
  );

  return (
    <div aria-busy="true" aria-label="글 목록을 불러오는 중">
      <BlogLayout sidebar={sidebar}>
        <BlogSection title={<span className="skeleton block h-8 w-36" />}>
          <div className="sm:grid sm:grid-cols-5 sm:items-center sm:gap-8">
            <div className="skeleton aspect-[16/9] !rounded-xl sm:col-span-3" />
            <div className="mt-4 sm:col-span-2 sm:mt-0">
              <div className="skeleton h-8 w-full" />
              <div className="skeleton mt-2 h-8 w-3/4" />
              <div className="skeleton mt-3 h-5 w-32" />
            </div>
          </div>
          <ul className={`${POST_GRID} mt-10 sm:mt-12`}>
            {Array.from({ length: 3 }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </ul>
        </BlogSection>
      </BlogLayout>
    </div>
  );
}
