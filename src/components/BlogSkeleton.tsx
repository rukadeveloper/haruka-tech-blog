import { POST_GRID } from "./PostList";

/**
 * 목록 화면(BlogShell) 로딩 자리표시자.
 * 카테고리·페이지를 옮기는 동안 빈 화면이 보이지 않도록 실제 레이아웃과 같은 크기로 그린다.
 */
export default function BlogSkeleton() {
  return (
    <div className="pb-20 sm:pb-24" aria-busy="true" aria-label="글 목록을 불러오는 중">
      <section className="pt-10 pb-7 sm:pt-16 sm:pb-10">
        <div className="skeleton h-9 w-28 sm:h-[52px] sm:w-40 lg:h-[62px]" />
        <div className="skeleton mt-2 h-7 w-72 max-w-full sm:mt-3 sm:w-[28rem]" />
      </section>

      <ul className="scroll-row mb-8 sm:mx-0 sm:mb-12 sm:px-0">
        {Array.from({ length: 5 }, (_, i) => (
          <li key={i} className="skeleton h-9 w-20 shrink-0 !rounded-full" />
        ))}
      </ul>

      <ul className={POST_GRID}>
        {Array.from({ length: 9 }, (_, i) => (
          <li key={i} className="card flex flex-col p-2.5">
            <div className="skeleton aspect-[16/9] !rounded-[14px]" />
            <div className="px-2 pt-4 pb-2.5">
              <div className="skeleton h-[22px] w-28" />
              <div className="skeleton mt-2 h-7 w-full" />
              <div className="skeleton mt-1.5 h-6 w-5/6" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
