import { LIST_GRID } from "./BlogList";

function RowSkeleton() {
  return (
    <li className="border-b border-line py-8 sm:py-10">
      <div className="skeleton h-8 w-4/5 sm:h-9" />
      <div className="mt-3 flex items-center gap-3">
        <div className="skeleton size-12 shrink-0 !rounded-xl" />
        <div className="flex-1">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton mt-1.5 h-3.5 w-48" />
        </div>
      </div>
      <div className="skeleton mt-5 h-5 w-full" />
      <div className="skeleton mt-2 h-5 w-11/12" />
      <div className="skeleton mt-2 h-5 w-2/3" />
      <div className="mt-5 flex gap-1.5">
        <div className="skeleton h-7 w-24 !rounded-md" />
        <div className="skeleton h-7 w-16 !rounded-md" />
      </div>
    </li>
  );
}

/**
 * 홈 · 카테고리 화면 로딩 자리표시자.
 * 화면을 옮기는 동안 빈 화면이 보이지 않도록 실제 배치(글자 목록 | 사이드바)와 같은 크기로 그린다.
 */
export default function BlogSkeleton() {
  return (
    <div className={LIST_GRID} aria-busy="true" aria-label="글 목록을 불러오는 중">
      {/* 좁은 화면: 검색창 + 칩 줄 */}
      <div className="lg:hidden" aria-hidden>
        <div className="skeleton h-11 w-full !rounded-xl" />
        <div className="scroll-row mt-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="skeleton h-9 w-16 shrink-0 !rounded-full" />
          ))}
        </div>
      </div>
      {/* 넓은 화면: 사이드바 */}
      <div className="hidden lg:col-start-2 lg:row-start-1 lg:block" aria-hidden>
        <div className="skeleton h-11 w-full" />
        <div className="skeleton mt-10 h-6 w-24" />
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className={`skeleton mt-4 h-4 ${i % 3 === 0 ? "w-20" : "ml-4 w-28"}`} />
        ))}
      </div>
      <ul className="mt-6 min-w-0 lg:col-start-1 lg:row-start-1 lg:mt-0" aria-hidden>
        {Array.from({ length: 4 }, (_, i) => (
          <RowSkeleton key={i} />
        ))}
      </ul>
    </div>
  );
}
