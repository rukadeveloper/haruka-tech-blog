/* 에디터 툴바 · 사이드바용 16px 선 아이콘 (24 격자, currentColor). 의미는 버튼의 title · aria-label 이 전한다 */

function Svg({ children, size = 16 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export const Icon = {
  code: () => (
    <Svg>
      <path d="m8 7-5 5 5 5M16 7l5 5-5 5" />
    </Svg>
  ),
  inlineCode: () => (
    <Svg>
      <path d="m10 8-4 4 4 4M14 8l4 4-4 4" />
    </Svg>
  ),
  image: () => (
    <Svg>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m21 16-5-5-9 9" />
    </Svg>
  ),
  fileTree: () => (
    <Svg>
      <path d="M4 4v13a2 2 0 0 0 2 2h3M4 9h5" />
      <rect x="11" y="6" width="9" height="6" rx="1.5" />
      <rect x="11" y="15" width="9" height="6" rx="1.5" />
    </Svg>
  ),
  table: () => (
    <Svg>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M3 15h18M10 10v10" />
    </Svg>
  ),
  paragraph: () => (
    <Svg>
      <path d="M13 4v16M17 4v16M19 4H9.5a4.5 4.5 0 0 0 0 9H13" />
    </Svg>
  ),
  bold: () => (
    <Svg>
      <path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z" />
    </Svg>
  ),
  italic: () => (
    <Svg>
      <path d="M15 5h-5M14 19H9M14 5l-4 14" />
    </Svg>
  ),
  underline: () => (
    <Svg>
      <path d="M7 4v7a5 5 0 0 0 10 0V4M5 20h14" />
    </Svg>
  ),
  strike: () => (
    <Svg>
      <path d="M4 12h16M16.5 7.5A4 3 0 0 0 12 5c-2.5 0-4.5 1.3-4.5 3.2 0 1.4 1 2.3 2.6 2.8M8 16.5c.6 1.6 2.2 2.5 4.2 2.5 2.6 0 4.6-1.3 4.6-3.3 0-.6-.2-1.2-.5-1.7" />
    </Svg>
  ),
  link: () => (
    <Svg>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </Svg>
  ),
  bulletList: () => (
    <Svg>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.5" cy="6" r="1" fill="currentColor" />
      <circle cx="4.5" cy="12" r="1" fill="currentColor" />
      <circle cx="4.5" cy="18" r="1" fill="currentColor" />
    </Svg>
  ),
  orderedList: () => (
    <Svg>
      <path d="M10 6h10M10 12h10M10 18h10M4 4.5 5.5 4v4M4 8h3M4 14.5a1.5 1.5 0 0 1 3 .2c0 1.3-3 1.8-3 3.3h3" />
    </Svg>
  ),
  quote: () => (
    <Svg>
      <path d="M4 7h6v6c0 2.5-1.5 4-4 4.5M14 7h6v6c0 2.5-1.5 4-4 4.5" />
    </Svg>
  ),
  hr: () => (
    <Svg>
      <path d="M3 12h18M8 6h8M8 18h8" />
    </Svg>
  ),
  undo: () => (
    <Svg>
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
    </Svg>
  ),
  redo: () => (
    <Svg>
      <path d="m15 14 5-5-5-5" />
      <path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />
    </Svg>
  ),
  arrowLeft: () => (
    <Svg>
      <path d="m15 6-6 6 6 6" />
    </Svg>
  ),
  upload: () => (
    <Svg>
      <path d="M12 15V4M7 9l5-5 5 5M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </Svg>
  ),
  x: () => (
    <Svg>
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  ),
  /* ---- 스튜디오: 레일 · 상단 바 · 미리보기 ---- */
  outline: () => (
    <Svg size={18}>
      <path d="M4 5h16M8 10h12M8 15h12M12 20h8" />
    </Svg>
  ),
  blocks: () => (
    <Svg size={18}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <path d="M16.5 13.5v6M13.5 16.5h6" />
    </Svg>
  ),
  settings: () => (
    <Svg size={18}>
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </Svg>
  ),
  eye: () => (
    <Svg size={18}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  ),
  pen: () => (
    <Svg size={18}>
      <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" />
      <path d="m13.5 6.5 4 4" />
    </Svg>
  ),
  doc: () => (
    <Svg size={18}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </Svg>
  ),
  menu: () => (
    <Svg size={18}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  ),
  chevronDown: () => (
    <Svg size={14}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  ),
  fit: () => (
    <Svg>
      <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
    </Svg>
  ),
  plus: () => (
    <Svg>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  ),
  minus: () => (
    <Svg>
      <path d="M5 12h14" />
    </Svg>
  ),
  grip: () => (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor" aria-hidden>
      <circle cx="4" cy="3" r="1.3" />
      <circle cx="8" cy="3" r="1.3" />
      <circle cx="4" cy="8" r="1.3" />
      <circle cx="8" cy="8" r="1.3" />
      <circle cx="4" cy="13" r="1.3" />
      <circle cx="8" cy="13" r="1.3" />
    </svg>
  ),
  logout: () => (
    <Svg size={18}>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 8l-4 4 4 4M6 12h10" />
    </Svg>
  ),
};
