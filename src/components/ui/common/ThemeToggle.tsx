"use client";

/** localStorage 키. layout.tsx 의 초기화 스크립트와 같은 값을 쓴다 */
export const THEME_KEY = "theme";

/**
 * 라이트/다크 전환 버튼. 처음에는 시스템 설정을 따르고, 누르면 선택을 저장한다.
 * 현재 테마는 html[data-theme] 에만 두고 아이콘은 CSS(dark:)로 바꾼다 —
 * 서버가 그린 화면과 달라질 상태가 없어 하이드레이션이 어긋나지 않는다.
 */
export default function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* 저장이 막힌 브라우저(사생활 보호 모드)에서는 이번 방문에만 적용 */
    }
  };

  return (
    <button type="button" onClick={toggle} className="icon-btn" aria-label="라이트/다크 모드 전환" title="라이트/다크 모드 전환">
      <svg className="dark:hidden" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
      <svg className="hidden dark:block" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
