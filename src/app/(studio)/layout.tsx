import { Suspense } from "react";

// 관리자 도구라 검색에 노출하지 않는다
export const metadata = { title: "글 편집", robots: { index: false, follow: false } };

/**
 * 스튜디오(글 에디터) 틀: 사이트 헤더 · 푸터 · 관리자 메뉴 없이 화면 전체를 쓴다 (DESIGN.md "글 편집 화면").
 * 페이지가 params · 쿠키를 읽으므로 Suspense 로 감싼다 (cacheComponents).
 */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-ui h-dvh overflow-hidden bg-background">
      <Suspense
        fallback={
          <div className="grid h-full place-items-center text-sm text-meta" aria-busy="true">
            에디터를 여는 중…
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}
