import { Suspense } from "react";
import { IBM_Plex_Sans_KR, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import StudioTheme from "./StudioTheme";
import "./studio.css";

// 벤토 블록 에디터 글꼴 (.claude/rules/editor-bento.md) — 에디터 화면에서만 불러온다
const plex = IBM_Plex_Sans_KR({
  variable: "--font-plex",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  // 한글 글꼴은 하위 집합 미리 받기를 지원하지 않는다
  preload: false,
});
const grotesk = Space_Grotesk({ variable: "--font-grotesk", subsets: ["latin"], display: "swap" });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], display: "swap" });

// 관리자 도구라 검색에 노출하지 않는다
export const metadata = { title: "글 편집", robots: { index: false, follow: false } };

const fontClassName = `${plex.variable} ${grotesk.variable} ${jetbrains.variable}`;

/**
 * 글 에디터 틀: 사이트 헤더 · 푸터 · 관리자 메뉴 없이 화면 전체를 쓴다.
 * 색 · 글꼴은 StudioTheme 이 html 에 data-studio 를 붙여 바꾼다. 페이지가 params · 쿠키를 읽으므로 Suspense 로 감싼다.
 */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`admin-ui min-h-dvh bg-background ${fontClassName}`}>
      <StudioTheme fontClassName={fontClassName} />
      <Suspense
        fallback={
          <div className="grid min-h-dvh place-items-center text-sm text-meta" aria-busy="true">
            에디터를 여는 중…
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}
