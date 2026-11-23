/**
 * 홈 · 카테고리 화면의 틀: lg 이상은 [사이드바 | 본문] 2열, 그보다 좁으면 사이드바가 본문 위로 올라온다.
 * 사이드바는 서버에서 그려 넘긴다 (BlogSidebar 또는 로딩 자리표시자).
 */
export default function BlogLayout({ sidebar, children }: { sidebar: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="pt-8 pb-20 sm:pt-12 sm:pb-24 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
      {sidebar}
      <div className="mt-8 min-w-0 lg:mt-0">{children}</div>
    </div>
  );
}

/** 구획 하나: 제목(+ 오른쪽 링크) → 내용, 아래는 옅은 구분선. 마지막 구획은 선이 없다 */
export function BlogSection({
  title,
  action,
  children,
}: {
  title: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-line pb-12 not-first:pt-12 last:border-b-0 sm:pb-14 sm:not-first:pt-14">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="text-title">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
