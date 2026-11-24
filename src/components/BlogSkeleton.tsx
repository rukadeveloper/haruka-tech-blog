import { LIST_WIDTH } from "./BlogList";

function RowSkeleton() {
  return (
    <li className="flex items-start gap-4 border-b border-line py-6 sm:gap-6 sm:py-8 lg:gap-8 lg:py-9">
      <div className="skeleton size-20 shrink-0 !rounded-xl sm:size-28 lg:size-37" />
      <div className="min-w-0 flex-1">
        <div className="skeleton h-7 w-4/5 sm:h-8 lg:h-9" />
        <div className="skeleton mt-2.5 h-5 w-full" />
        <div className="skeleton mt-2 h-5 w-11/12" />
        <div className="skeleton mt-2 hidden h-5 w-2/3 sm:block" />
        <div className="skeleton mt-4 h-4 w-32" />
      </div>
    </li>
  );
}

/**
 * 홈 · 카테고리 화면 로딩 자리표시자.
 * 화면을 옮기는 동안 빈 화면이 보이지 않도록 실제 배치(탭 줄 + 한 줄 목록)와 같은 크기로 그린다.
 */
export default function BlogSkeleton() {
  return (
    <div className={`${LIST_WIDTH} pt-8 pb-20 sm:pt-10 sm:pb-24`} aria-busy="true" aria-label="글 목록을 불러오는 중">
      <div className="sm:flex sm:items-center sm:gap-4" aria-hidden>
        <div className="scroll-row sm:mr-0 sm:pr-0 sm:flex-1 lg:mx-0 lg:justify-center lg:px-0">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex h-12 shrink-0 items-center px-2 sm:px-3">
              <div className="skeleton h-5 w-16" />
            </div>
          ))}
        </div>
        <div className="skeleton mt-3 h-11 w-full !rounded-xl sm:mt-0 sm:w-56 sm:shrink-0" />
      </div>
      <ul className="mt-4 sm:mt-6" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <RowSkeleton key={i} />
        ))}
      </ul>
    </div>
  );
}
