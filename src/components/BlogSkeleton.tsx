const bar = "animate-pulse rounded-md bg-surface";

/**
 * 목록 화면(BlogShell) 로딩 자리표시자.
 * 카테고리·페이지를 옮기는 동안 빈 화면이 보이지 않도록 실제 레이아웃과 같은 크기로 그린다.
 */
export default function BlogSkeleton() {
  return (
    <div className="pb-24" aria-busy="true" aria-label="글 목록을 불러오는 중">
      <section className="flex flex-col items-center pt-12 pb-10 sm:pt-20">
        <div className={`${bar} h-10 w-40 sm:h-[60px] sm:w-64`} />
        <div className={`${bar} mt-5 h-6 w-72 max-w-full sm:h-7 sm:w-[28rem]`} />
      </section>

      <div className="mb-16">
        <ul className="flex flex-wrap justify-center gap-3">
          {Array.from({ length: 5 }, (_, i) => (
            <li key={i} className={`${bar} h-[34px] w-20 !rounded-full`} />
          ))}
        </ul>
      </div>

      <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-16">
        {Array.from({ length: 9 }, (_, i) => (
          <li key={i} className="flex h-full flex-col">
            <div className="aspect-[16/10] animate-pulse rounded-md bg-thumb" />
            <div className={`${bar} mt-5 h-5 w-24`} />
            <div className={`${bar} mt-2 h-7 w-full`} />
            <div className={`${bar} mt-2 h-5 w-5/6`} />
            <div className={`${bar} mt-3 h-5 w-20`} />
          </li>
        ))}
      </ul>
    </div>
  );
}
