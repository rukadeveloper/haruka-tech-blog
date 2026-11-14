"use client";

/** localStorage 키. layout.tsx 의 초기화 스크립트와 같은 값을 쓴다 */
export const THEME_KEY = "theme";

const isDark = () => document.documentElement.dataset.theme === "dark";

/**
 * 라이트/다크 토글 스위치 (켜짐 = 다크). 처음에는 시스템 설정을 따르고, 누르면 선택을 저장한다.
 * 현재 테마는 html[data-theme] 에만 두고 손잡이 위치와 아이콘은 CSS(.theme-switch)가 그 값을 읽어 정한다 —
 * 서버가 그린 화면과 달라질 상태가 없어 하이드레이션이 어긋나지 않는다.
 * aria-checked 만은 같은 이유로 React 가 아니라 DOM 에 직접 쓴다.
 */
export default function ThemeToggle() {
  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const root = document.documentElement;
    const next = isDark() ? "light" : "dark";
    const apply = () => {
      root.dataset.theme = next;
      button.setAttribute("aria-checked", String(next === "dark"));
    };
    // 밝기가 갑자기 바뀌지 않도록 화면을 교차 페이드한다 (지원하지 않거나 움직임 줄이기를 켠 경우는 바로 전환)
    if ("startViewTransition" in document && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.startViewTransition(apply);
    } else {
      apply();
    }
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* 저장이 막힌 브라우저(사생활 보호 모드)에서는 이번 방문에만 적용 */
    }
  };

  return (
    <button
      type="button"
      role="switch"
      ref={(el) => el?.setAttribute("aria-checked", String(isDark()))}
      onClick={toggle}
      className="theme-switch"
      aria-label="다크 모드"
      title="라이트/다크 모드 전환"
    >
      <span className="theme-switch-track">
        <span className="theme-switch-knob">
          {/* 해(라이트)와 달(다크)을 겹쳐 두고 교차 페이드한다 */}
          <svg className="theme-switch-sun" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
          <svg className="theme-switch-moon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
