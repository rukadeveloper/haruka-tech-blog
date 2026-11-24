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
};
