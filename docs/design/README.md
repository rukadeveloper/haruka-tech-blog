# 공개 · 관리자 화면 디자인 시스템
공개 블로그 화면과 `/admin` 화면이 함께 쓰는 토큰 · 클래스 · 화면 배치 규칙이다. 원천은 `src/app/globals.css`이다.

## 목차
색 · 면 · 움직임 · 글꼴 · 타이포 · 클래스 · 헤더 · 푸터 · 글 목록 · 글 상세 · 관리자 화면 · 방명록 · About · 로고 · 컴포넌트

## 언제 읽나
- 색 · 간격 · 그림자 · 전환 시간 등 스타일을 바꾸거나 새 화면 · 컴포넌트를 만들 때
- 다크 모드, 접근성 설정(움직임 줄이기 · 대비 높이기)에 걸리는 작업을 할 때
- 헤더 · 푸터 · 글 목록 · 글 상세 · 관리자 · 방명록 · About · 로고를 고칠 때
- 인트로(`/intro`)와 글 에디터(`(studio)`)는 이 시스템의 예외다. 인트로는 `docs/intro/`, 에디터는 `docs/editor/`에 따로 있다. 단 `.post-body` 와 코드 블록 · 파일 트리 CSS는 공개 글 · 미리보기 · 에디터가 함께 쓰므로 이 문서와 `docs/posts/`를 따른다.

## 관련 파일
- `src/app/globals.css` — 토큰(`:root`, `[data-theme="dark"]`), `@theme inline`, `@layer components` 클래스, `.post-body`, 목차, 코드 블록, 파일 트리
- `src/app/layout.tsx` — 글꼴 로딩, 테마 초기화 스크립트, `<body class="flex min-h-full flex-col">`
- `src/components/ui/common/*` — 공용 컴포넌트 (ThemeToggle, Button, Card, Chip, Pagination, Select, BrandMark 등)
- `src/components/{SiteFrame,Header,HeaderNav,BlogList,BlogSidebar,BlogSkeleton}.tsx`, `src/components/ui/post/*`
- `src/app/(site)/**` — 공개 · 관리자 페이지, `src/app/not-found.tsx`
- `src/app/icon.svg`, `src/app/favicon.ico`, `src/app/apple-icon.png`, `scripts/generate-icons.mjs`

## 꼭 지킬 규칙
- 색은 토큰 유틸리티(`bg-surface`, `text-muted`, `border-line` …)나 `var(--토큰)`만 쓴다. 컴포넌트 · 페이지에 hex · rgb 를 직접 쓰지 않는다 — 다크 모드가 `[data-theme="dark"]` 에서 토큰 값만 바꾸기 때문이다 (`globals.css`). 현재 예외: `PostRow.tsx`의 로고 타일 `bg-[#191f28]`(파비콘과 같은 고정색), `.btn-github`, `.btn-danger-solid` 의 흰 글자, 코드 블록 `--cb-*`, 인트로 바탕.
- 다크 변형이 필요하면 `dark:` 유틸리티를 쓴다 — `@custom-variant dark` 가 `html[data-theme="dark"]` 기준으로 정의돼 있고, `prefers-color-scheme` 를 직접 읽지 않는다 (`globals.css`).
- 전환 시간 · 곡선은 `var(--dur)` · `var(--dur-press)` · `var(--dur-slow)` · `var(--ease-out)` 만 쓴다. Tailwind 에서는 `duration-(--dur)` · `ease-(--ease-out)` 로 쓴다 — 시간을 `200ms` 처럼 직접 쓰면 접근성 설정 처리가 빠진다 (`globals.css`, `HeaderNav.tsx`, `AdminPostCard.tsx`).
- 눌림 크기 · 팝오버 시작 모양 · 슬라이드 거리는 `var(--press)` · `var(--press-lg)` · `var(--pop-from)` · `var(--slide-from)` · `var(--knob-stretch)` 만 쓴다 — 움직임 줄이기에서 이 토큰 값이 `1` · `none` · `0px` 로 바뀌어 크기 · 위치 변화가 사라진다 (`globals.css` `@media (prefers-reduced-motion: reduce)`).
- 눌림 반응은 `.pressable`(큰 요소는 `.pressable-lg` 를 함께)이나 `.btn` · `.chip` · `.icon-btn` 을 쓴다. `active:scale-95` 같은 값을 직접 쓰지 않는다 (`globals.css`).
- hover 스타일은 `@media (hover: hover)` 안에만 둔다 — 터치 화면에서 hover 가 눌린 뒤에도 남는다 (`globals.css` `.btn`, `.chip`, `.nav-link`). Tailwind `hover:` 변형은 같은 처리를 하지만 새 CSS 클래스를 쓸 때는 직접 감싼다.
- 면(카드 · 헤더 · 팝오버)은 `.card` · `.glass` · `.glass-thick` · `.glass-tint` 나 `--glass*` 토큰으로 칠한다. 새 `backdrop-filter` · 반투명 배경을 직접 쓰지 않는다 — 현재 디자인은 평평한 불투명 면이고, 값은 `--glass*` 토큰 한 곳에서 정한다 (`globals.css` "면").
- 면 안쪽의 입력 · hover · 선택 표시는 단색(`bg-surface` 등)을 쓴다. 면 위에 면(`.glass` 안의 `.glass`)을 겹치지 않는다 (`globals.css` `.glass` 주석).
- 모바일 값을 기본으로 쓰고 `sm:`(640px) · `lg:`(1024px) 에서 키운다. `max-width` 미디어 쿼리나 데스크톱 우선 값을 쓰지 않는다 (`globals.css` "클래스 정의").
- 터치 대상은 44px 이상(`.btn` 44px, `.field` min-height 44px, 아이콘 버튼 40px+)을 지킨다. 작은 버튼 `.btn-sm` 은 36px 이다 (`globals.css`).
- 페이지 폭은 `.container-page`(최대 1120px, 좌우 20px → sm 24px), 글 · 소개 본문 폭은 `.container-prose`(768px)를 쓴다. `max-w-*` · `px-*` 로 새 폭을 만들지 않는다 (`SiteFrame.tsx`, `PostArticleBody.tsx`, `about/page.tsx`).
- 글꼴은 `font-sans` / `font-mono` 만 쓴다(`--font-sans`, `--font-mono`). 글꼴 이름을 직접 쓰지 않는다. 예외: 코드 블록 `pre` 의 `"JetBrains Mono", "Fira Code"` 우선 지정 (`globals.css`).
- 텍스트 크기는 `.text-display/-title/-heading/-body/-body-sm/-caption` 을 우선 쓴다. 글 목록처럼 Tailwind 임의 크기(`text-[22px]`)를 쓰는 화면은 `글 목록` 절의 값을 따른다 (`PostRow.tsx`).
- 헤더 높이 56px · 위 여백 8px(sm 12px) 는 목차 기준선(`PostToc` ACTIVE_OFFSET 108, `scroll-margin-top: 100px`)과 사이드바 sticky 위치(`top-16` / `sm:top-[68px]`)가 의존한다. 바꾸면 함께 고친다 (`globals.css`, `PostToc.tsx`, `BlogSidebar.tsx`).
- 키보드 포커스 표시는 `:focus-visible` 전역 규칙(2px `--strong` 외곽선)을 유지한다. 지우려면 `.admin-ui` 의 글 입력 요소처럼 한정된 범위에서만 한다 (`globals.css`).
- 상태는 색만으로 구분하지 않는다. 현재 위치는 `aria-current="page"` 로 표시하고 CSS가 그 속성을 읽는다(`.nav-link`, `.chip`) (`HeaderNav.tsx`, `Chip.tsx`).
- 다크 모드 초기화는 `layout.tsx` 의 `<head>` 인라인 스크립트가 맡는다. `ThemeToggle` 의 저장 키(`THEME_KEY = "theme"`)와 같은 값을 쓴다. 상태를 React 에 두지 않는다 — 서버 HTML 과 어긋나 하이드레이션 경고가 난다 (`layout.tsx`, `ThemeToggle.tsx`).
- 새 클래스 · 토큰은 `globals.css` 에 추가하고 이 문서의 `클래스` · `색` 절에 한 줄을 더한다.

## 색
토큰은 `:root`(라이트) 와 `[data-theme="dark"]`(다크) 에 같은 이름으로 정의한다. 컴포넌트는 값이 아니라 이름만 쓴다.

| 토큰 | 라이트 | 다크 | 용도 |
| --- | --- | --- | --- |
| `--background` | #ffffff | #17171c | 페이지 바탕, `.field:focus` 배경, 활성 칩의 글자색 |
| `--elevated` | #ffffff | #202027 | 카드 · 헤더 · 팝오버 면(`--glass` 가 가리킨다), 썸네일 위 배지 바탕 |
| `--subtle` | #f9fafb | #1b1b21 | 인용문 · 표 머리 · 파일 트리 · 통계 카드 바탕, 리스트 행 hover |
| `--surface` | #f2f4f6 | #26262e | 입력 · 칩 · 배지 · 스켈레톤 바탕 |
| `--surface-hover` | #e5e8eb | #30303a | 칩 · 보조 버튼 hover, 토글 트랙 |
| `--line` | #e5e8eb | #2c2c35 | 구분선 · 테두리 |
| `--foreground` | #191f28 | #ececf0 | 기본 글자, 활성 칩 바탕 |
| `--muted` | #4e5968 | #b0b0ba | 보조 글자 |
| `--meta` | #8b95a1 | #7e7e8a | 날짜 · 안내 · placeholder 등 약한 글자 |
| `--strong` | #3182f6 | #4593fc | 강조(링크 · 기본 버튼 · 포커스 링) |
| `--strong-hover` / `--strong-soft` | #1b64da / #e8f3ff | #64a8ff / 파랑 16% | 강조 hover / 옅은 강조 바탕(배지 · 목차 활성) |
| `--on-strong` | #ffffff | #ffffff | 강조 바탕 위 글자 |
| `--sub` | #3182f6 | #64a8ff | 보조 강조 |
| `--danger` / `--danger-soft` | #f04452 / 빨강 10% | #f66570 / 빨강 16% | 삭제 · 오류 |
| `--success` / `--success-soft` | #03b26c / 초록 12% | #3fd599 / 초록 14% | 발행됨 |
| `--warning` / `--warning-soft` | #dd7d02 / 주황 14% | #ffa927 / 주황 14% | 임시저장 · 콜아웃 바탕 |
| `--thumb` | #f2f4f6 | #26262e | 썸네일 · 이미지 로딩 자리 바탕 |
| `--footer` | #f9fafb | #131317 | 푸터용 토큰 (현재 `.site-footer` 는 `--glass` 를 쓴다) |
| `--detail-title` / `--detail-desc` | #191f28 / #333d4b | #f2f2f5 / #c9c9d1 | 글 본문 제목 / 본문 글자 |
| `--rule` | #e5e8eb | #2c2c35 | 본문 안 구분선 · 표 선 |
| `--code-bg` | #f2f4f6 | #26262e | 인라인 `code` 바탕 |
| `--shadow-card` / `--shadow-pop` | 라이트용 그림자 | 더 진한 그림자 | 카드 · 선택된 탭 / 팝오버 |

- `color-scheme` 은 `:root` 에서 `light`, `[data-theme="dark"]` 에서 `dark` 이다.
- `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *))` — Tailwind `dark:` 는 `html[data-theme="dark"]` 아래에서만 켜진다.
- `prefers-contrast: more` 이면 `--line` 이 `--meta` 값으로 바뀌어 구분선이 진해진다.
- 코드 블록 색 `--cb-body/-head/-text/-num/-lang` 은 `:root` 에만 있고 다크에서도 같다(항상 어두운 창).
- `@theme inline` 매핑 — 토큰이 Tailwind 유틸리티로 노출된다.
  - 색: `background elevated subtle surface surface-hover line foreground muted meta strong strong-hover strong-soft sub danger danger-soft success success-soft warning warning-soft thumb footer detail-title detail-desc` → `bg-*` `text-*` `border-*` `ring-*` 등 (예: `text-muted`, `bg-surface`, `border-line`, `text-strong`, `bg-danger-soft`, `text-detail-desc`)
  - 그림자: `shadow-card`, `shadow-pop`
  - 글꼴: `font-sans`, `font-mono`
- `--rule`, `--code-bg`, `--glass*`, `--cb-*` 는 `@theme` 에 없다. 유틸리티가 아니라 CSS 안에서 `var()` 로만 쓴다.
- 인트로 바탕 `#f7f7f5` 는 `html[data-intro]` 규칙에만 있다 (`globals.css`).

## 면
이름은 예전 유리 디자인의 것이고 값은 불투명한 평평한 면이다. 면의 모양을 바꾸려면 컴포넌트가 아니라 이 토큰을 바꾼다.

| 토큰 | 값 | 쓰는 곳 |
| --- | --- | --- |
| `--glass` | `var(--elevated)` | 카드, 헤더 바, 푸터, 목차 상자 |
| `--glass-thick` | `var(--elevated)` | 팝오버 · 메뉴 · 확인 창 (`--shadow-pop` 으로 떠 보인다) |
| `--glass-tint` | `var(--surface)` | 칩 · 보조 버튼 · 페이지 번호 |
| `--glass-border` | `var(--line)` | 면의 테두리 |
| `--glass-edge` | `transparent` | 위쪽 안쪽 하이라이트(`inset 0 1px 0`) |
| `--glass-filter` | `none` | `backdrop-filter` |
| `--shadow-glass` / `--shadow-tint` | `none` | 면 · 옅은 면의 그림자 |

- `.card`, `.glass`, `.glass-thick`, `.site-header-bg`, `.site-footer`, `.toc-box`, `.toc-panel`, `.toc-float-btn` 이 이 토큰을 읽는다.
- 라이트 · 다크 모두 `--elevated` · `--surface` · `--line` 을 따라가므로 면 토큰은 모드별로 따로 정의하지 않는다.
- 면 위에 면을 겹치지 않는다. 면 안쪽 요소는 `bg-surface` 같은 단색이다.

## 움직임
튀지 않고 빠르게 붙는 곡선 하나(`--ease-out`)를 함께 쓴다.

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | 모든 transform · 열림 전환의 곡선 |
| `--dur-press` | 100ms | 눌림(transform) — 누르는 순간 바로 반응한다 |
| `--dur` | 200ms | 색 · 투명도 · 팝오버 · 메뉴 |
| `--dur-slow` | 320ms | 토글 스위치 · 썸네일 hover 확대 |
| `--press` / `--press-lg` | 0.97 / 0.98 | 눌렀을 때 크기 (버튼 · 칩 / 카드) |
| `--pop-from` | `scale(0.96)` | 팝오버 · 목차 패널 시작 모양 |
| `--slide-from` | `translateY(-8px)` | 모바일 메뉴가 내려오기 시작하는 위치 |
| `--knob-stretch` | 6px | 토글 손잡이가 눌릴 때 늘어나는 길이 |

- `prefers-reduced-motion: reduce` 이면 `--press: 1; --press-lg: 1; --pop-from: none; --slide-from: none; --knob-stretch: 0px` 로 바뀐다. 크기 · 위치 변화는 사라지고 짧은 투명도 전환만 남는다. 값을 CSS 에 직접 쓰면 이 처리가 무시된다.
- 테마 전환은 View Transitions 로 화면 전체를 240ms 교차 페이드한다. `ThemeToggle` 은 지원하지 않거나 움직임 줄이기가 켜져 있으면 바로 전환한다. `.theme-switch` 는 `view-transition-name: theme-switch` 로 교차 페이드에서 빠진다.
- 열림 · 닫힘 요소(`.mobile-menu`, `.menu-scrim`, `.toc-panel`, `.toc-float`)는 항상 DOM 에 두고 `data-open` / `data-show` 로 여닫는다. 닫힐 때도 같은 길로 돌아가게 하려는 것이다. 숨겨진 상태에는 `visibility: hidden` + `inert` 를 쓴다.
- `.select-pop` 은 `@starting-style` 로 `--pop-from` 에서 시작한다.
- 알려진 예외(직접 값): `Select.tsx` 의 화살표 `transition-transform`(Tailwind 기본 시간), `ThumbImage.tsx` 의 `duration-300`, `.skeleton` 의 `pulse 2s`. 새 코드에서는 따라 쓰지 않는다.

## 글꼴 · 타이포
- 본문 글꼴은 Pretendard 가변(45–920, `src/app/fonts/PretendardVariable.woff2`, `localFont`, `display: swap`)이다. 굵기를 하나의 파일로 모두 쓴다. 변수 `--font-pretendard` → `--font-sans`(뒤에 시스템 한글 글꼴 대체).
- 코드 글꼴은 Geist Mono(`next/font/google`, 변수 `--font-geist-mono` → `--font-mono`, 뒤에 JetBrains Mono · Consolas). 코드 블록 `pre` 만 `"JetBrains Mono", "Fira Code"` 를 먼저 지정한다.
- `body` 는 `word-break: keep-all`(한글 어절 단위 줄바꿈)이다. `.post-body` 는 `word-break: normal` + `overflow-wrap: break-word` 로 되돌린다.
- `html` 에 `h-full antialiased`, `body` 에 `flex min-h-full flex-col`. 푸터는 `margin-top: auto` 로 바닥에 붙는다.
- 타이포 클래스(모바일 → sm → lg):

| 클래스 | 모바일 | sm(640+) | lg(1024+) |
| --- | --- | --- | --- |
| `.text-display` | 28px / 1.3 / 800 / -0.02em | 40px / 1.2 / -0.025em | 48px / 1.15 / -0.03em |
| `.text-title` | 22px / 1.35 / 700 | 28px / 1.3 | 같음 |
| `.text-heading` | 18px / 1.4 / 700 | 20px | 같음 |
| `.text-body` | 16px / 1.7 | — | — |
| `.text-body-sm` | 15px / 1.6 | — | — |
| `.text-caption` | 13px / 1.5, 색 `--meta` | — | — |

- 자간과 줄 간격은 크기를 따라간다(커질수록 좁게). `display` · `title` 은 `text-wrap: balance`.
- 글 본문(`.post-body`)은 별도 크기를 쓴다: p 16px(sm 17px) / 1.8, h2 22px(sm 26px), h3 19px(sm 21px). 자세한 내용은 `docs/posts/`.

## 클래스
`globals.css` 의 `@layer components`(레이아웃 · 타이포 · 컴포넌트)와 그 밖의 전역 규칙이다. 레이어 밖 CSS 는 Tailwind 유틸리티보다 우선하므로 `.post-body` 에서 `margin` 단축 속성을 쓰지 않는다.

| 클래스 | 언제 쓰나 |
| --- | --- |
| `.container-page` | 페이지 전체 폭(최대 1120px, 좌우 20/24px). `SiteFrame` 의 `<main>` 과 푸터 안쪽 |
| `.container-prose` | 글 · 소개 · 이전/다음 글 등 읽는 폭(768px) |
| `.text-display/-title/-heading/-body/-body-sm/-caption` | 위 타이포 표 |
| `.card` | 테두리 있는 둥근(20px) 면. `.card-pad` 는 안쪽 여백(20px, sm 24px). `Card` 컴포넌트가 조합 |
| `.btn` + `.btn-primary/-secondary/-ghost/-danger/-danger-solid/-github` | 버튼. 높이 44px, 반경 12px. `.btn-sm`(36px), `.btn-block`(전체 폭). `buttonClass()` 가 조합 |
| `.chip` (`.chip-count`) | 카테고리 선택 칩(높이 36px, 둥근 알약). `aria-current="page"` 또는 `data-active="true"` 이면 반전색 |
| `.badge` + `.badge-primary/-success/-warning` | 작은 상태 · 분류 표시(높이 22px) |
| `.field` / `.field-label` | 입력 · 텍스트 영역 · `Select` 여는 버튼 / 입력 라벨 |
| `.skeleton` | 로딩 자리표시자(`pulse` 애니메이션) |
| `.empty` | 비어 있음 · 오류 안내(점선 테두리 상자) |
| `.nav-link` | 헤더 · 관리자 메뉴 링크. 현재 위치는 `aria-current="page"` (굵게 + 진한 색) |
| `.icon-btn` | 40px 정사각 아이콘 버튼(메뉴 · 보기 전환) |
| `.theme-switch` (+ `-track`, `-knob`, `-sun`, `-moon`) | `ThemeToggle` 전용. 손잡이 위치 · 아이콘은 `html[data-theme]` 를 따른다 |
| `.pressable` / `.pressable-lg` | 눌림 반응만 필요한 링크 · 카드. 큰 요소는 `-lg` 를 함께 |
| `.glass` / `.glass-thick` / `.glass-tint` | 면 클래스: 일반 면 / 팝오버 · 메뉴(그림자 깊음) / 작은 옅은 면 |
| `.site-header` · `.site-header-bar` · `.site-header-bg` | 헤더. 아래 `헤더 · 푸터` 절 |
| `.site-footer` | 푸터 면. `margin-top: auto` |
| `.menu-scrim` · `.mobile-menu` | 모바일 메뉴 딤 · 패널 (`data-open="true"` 로 열림) |
| `.select-pop` | `Select` 의 드롭다운 목록. `data-up="true"` 이면 아래쪽 모서리에서 펼쳐진다 |
| `.scroll-row` | 가로 스크롤 줄(모바일 칩). 스크롤바를 숨기고 화면 끝까지 붙인다(`margin -4px -20px`) |
| `.toc-box` · `.toc-title` · `.toc-list` · `.toc-num` | 글 상단 목차 상자 |
| `.toc-float` · `.toc-float-btn` · `.toc-panel` · `.toc-backdrop` | 스크롤하면 나타나는 고정 목차 (`data-show`, `data-open`) |
| `.post-body` | 글 본문 스타일. 공개 글 · 관리자 미리보기 · 에디터 공통 (`docs/posts/`) |
| `.admin-ui` | `admin/layout.tsx` 의 감싸개. 글 입력 요소(input · textarea · contenteditable)의 포커스 외곽선을 끈다 |
| `.editor-body` | 에디터 본문 보정(표 · 빈 문단 placeholder). 에디터 쪽 문서 참고 |

- 전역: `:focus-visible { outline: 2px solid var(--strong); outline-offset: 2px }`, `body` 의 배경 · 글자색 · 글꼴.
- `html[data-intro]` 는 인트로가 보이는 동안만 `app/intro/StageLock` 이 붙인다(바탕 `#f7f7f5`, 스크롤 끔).

## 헤더 · 푸터
- 구성: `SiteFrame`(`components/SiteFrame.tsx`) = `Header` + `<main class="container-page flex-1">` + `<footer class="site-footer relative z-20">`. `(site)/layout.tsx` 와 `not-found.tsx` 가 함께 쓴다. 인트로는 이 틀을 쓰지 않는다.
- `Header`: 화면 위에 8px(sm 12px) 띄운 둥근 면 바. `.site-header`(sticky, z-50, 최대 1120px) 안에 `.site-header-bar`(높이 56px, 안쪽 좌우 24px). 바 안쪽 여백이 `.container-page` 여백과 같아 로고가 본문과 줄이 맞는다.
- 면은 바 자체가 아니라 `.site-header-bg`(절대 위치, z-index -1) 층에 깐다. 바에 `backdrop-filter` 를 걸면 안의 fixed 요소(메뉴 딤)가 바에 갇힌다.
- 로고: `BrandMark`(22px) + `eunhaa tech`(600 · 15px · 자간 -0.01em · 간격 8px)를 `pressable` 링크로 감싼다. 색은 글자색을 따라 다크에서도 보인다.
- `HeaderNav`(클라이언트): `LINKS` = 블로그(`/`, `/posts`, `/category` 에서 활성) · 소개(`/about`) · 방명록(`/guestbook`). sm 이상은 가로 `.nav-link`, 모바일은 `.icon-btn` 햄버거 + `.mobile-menu.glass-thick`(`.menu-scrim` 딤은 바 뒤 z-index -2). Esc 로 닫는다. 현재 경로 확인은 `Suspense` 로 감싸고 그 전에는 강조 없이 그린다.
- 관리자 링크(`AdminLink`)는 허용 IP 에서만 내용이 그려진다. 가로 메뉴용 / 모바일 메뉴용 두 벌을 `Header` 가 만들어 `HeaderNav` 에 넘긴다.
- `ThemeToggle` 은 바 오른쪽에 있다 (`테마 초기화 스크립트와 ThemeToggle` 아래).
- 푸터: `eunhaa tech`(`tech` 는 `text-strong`) + `AUTHOR.bio`, 오른쪽 `© Eunhaa. All rights reserved.`(`.text-caption`). `relative z-20` 은 홈 · 카테고리의 고정 사이드바(z-10)를 페이지 끝에서 덮기 위한 것이다.
- 테마 초기화: `layout.tsx` 의 `themeScript` 가 `<head>` 에서 첫 페인트 전에 실행한다(저장된 `localStorage.theme` → 없으면 `prefers-color-scheme`). `html` 은 `suppressHydrationWarning`. `viewport.themeColor` 는 라이트 `#ffffff` / 다크 `#17171c`.
- `ThemeToggle`(`ui/common/ThemeToggle.tsx`): `role="switch"`, 켜짐 = 다크. 상태는 `html[data-theme]` 에만 두고 `aria-checked` 는 ref · 이벤트에서 DOM 에 직접 쓴다. 저장 실패(사생활 보호 모드)는 무시한다.

## 글 목록
홈(`(site)/page.tsx`)과 카테고리(`(site)/category/[...path]`)가 `BlogList` 를 쓴다. LINE Engineering 식 배치: 글자만 있는 목록 | 오른쪽 사이드바.
- `BlogList`(서버): `PAGE_SIZE = 10`. `LIST_GRID` = `pt-8 pb-20 sm:pt-10 sm:pb-24 lg:grid lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-16`. 스켈레톤도 같은 틀을 쓴다. 검색어(`q`)가 있으면 전체 글에서 제목 · 설명 · 카테고리 · 태그를 대소문자 무시로 거르고, 없으면 카테고리(`inCategory`)로 거른다. `<h1 class="sr-only">` 에 화면 제목을 둔다. 결과 없음은 `.empty`.
- `PostRow`(`ui/post/PostRow.tsx`): 제목(22px, sm 26px, 2줄 제한) → 작성자 줄(`AuthorAvatar` 48px 로고 타일 · 이름 · 날짜 · bio) → 요약 3줄 → 분류 칩(최대 태그 4개). 썸네일은 없다. 행 전체가 아니라 제목 · 요약만 글로 링크하고, 요약 링크는 `tabIndex={-1}` `aria-hidden` 으로 탭 순서에서 뺀다. 칩은 `h-7 rounded-md bg-surface text-xs`.
- `BlogSidebar`: lg 이상은 `fixed`(top-24, right = `max(24px, 50% - 536px)`, 폭 260px, 최대 높이 `100dvh - 120px`) 밑줄형 검색 + 카테고리(대분류 굵게, 소분류 `#이름`). lg 미만은 목록 위 검색창 + 헤더 아래 `sticky`(`top-16`, sm `top-[68px]`) 대분류 칩 줄(`.scroll-row` + `.chip`), 현재 대분류의 소분류 칩 줄(더 작은 칩). 검색은 `next/form` 으로 사이트 안 이동한다(일반 form 은 문서를 새로 받아 프록시가 인트로로 돌려보낸다).
- `Pagination`: `‹ 1 … 4 5 [6] 7 8 … 13 ›`. 1 · 마지막 · 현재 ±2 를 보이고 건너뛴 자리는 `…`. 현재 쪽은 `!bg-foreground !text-background`. `total <= 1` 이면 그리지 않는다. 검색 조건은 `query` 로 유지한다. 쪽 번호 · 화살표는 `.pressable`.
- `BlogSkeleton`: `RowSkeleton` 4개 + 사이드바 자리표시자. 실제 배치와 같은 크기로 그려 화면 전환 중 빈 화면이 보이지 않게 한다. `aria-busy="true"`.

## 글 상세
`(site)/posts/[slug]/page.tsx`. 본문은 `PostArticleBody` 가 그린다(관리자 미리보기도 같은 컴포넌트).
- 틀: `<article class="pt-8 pb-20 sm:pt-14 sm:pb-24">`. 머리(`.container-prose`): 카테고리 배지(`badge badge-primary`, 카테고리 링크) → 제목(`.text-display`) → 날짜(`.text-caption`), 아래 구분선. 그 아래 목차(`.container-prose mt-8`) → 본문(`.post-body`).
- `PostToc`(클라이언트): 제목(h2 · h3)이 2개 미만이면 목차 없음(`buildToc`). 본문 위 `.toc-box` 와, 상자가 화면에서 벗어나면 나타나는 `.toc-float`(모바일은 오른쪽 아래, lg 는 오른쪽 위 `top: 96px`) + `.toc-panel`. 현재 제목은 기준선(`ACTIVE_OFFSET = 108`)을 지난 마지막 제목이고 `data-active="true"` 로 강조한다. 항목 클릭은 부드러운 스크롤 + `history.replaceState`. 패널은 `inert` 로 닫는다. Esc 로 닫는다.
- 이전 · 다음 글: `nav` 가 `.container-prose mt-14 grid gap-3 sm:mt-20 sm:grid-cols-2`(모바일 위아래, sm 좌우). 항목은 `.card.pressable.pressable-lg` + `hover:border-strong`, 다음 글은 `sm:text-right`. 이전 = 목록에서 더 오래된 글, 다음 = 더 최근 글. 그 아래 `목록으로` 보조 버튼(`buttonClass({ variant: "secondary" })`).
- 그 밖: 관리자 전용 `PostAdminActions`(Suspense), 댓글 `Comments`(Suspense). 글 안에서 `generateStaticParams` 로 정적 생성한다.

## 관리자 화면
`src/app/(site)/admin/*`. 공개 화면과 같은 틀(`SiteFrame`)과 토큰을 쓰고, 글 쓰기 화면만 `(studio)` 로 분리돼 있다.
- `admin/layout.tsx`: `<div class="admin-ui py-6 sm:py-10">`. `AdminNav`(관리자일 때만): `AdminNavLinks`(글 관리 · 새 글 · 카테고리, `.nav-link` + `aria-current`) + 로그아웃. 로그인 확인 때문에 `instant = false`, `robots: noindex`.
- `admin/page.tsx`: 제목 + `+ 새 글 작성`(`btn-primary`), 통계 4칸(`Stat` = `.card.bg-subtle`: 전체 · 발행됨(`text-success`) · 임시저장(`text-warning`) · 카테고리 수, 모바일 2열 / sm 4열), `AdminPostTable`.
- `AdminPostTable`(클라이언트): `.card` 안에 상태 탭(전체 · 발행 · 임시저장, `role="tablist"`, 선택된 탭 `bg-elevated shadow-card`) + 검색(`.field`) + 보기 전환(`.icon-btn` 2개). 보기는 그리드(기본, 1열 → sm 2열 → lg 3열) 또는 리스트(`divide-y`). 고른 보기는 `localStorage` `admin-post-view` 에 저장하며 서버 렌더 · 첫 하이드레이션은 그리드로 그린다(`useSyncExternalStore`).
- `AdminPostCard`: `.card` 세로 구성 — 썸네일(16:9, 없으면 카테고리 글자) 위 상태 배지(`StatusBadge`: 임시저장 `badge-warning` / 발행됨 `badge-success`, 추천 `badge-primary`)는 바탕이 비치지 않게 `bg-elevated` 를 깔고, 제목 → 카테고리 배지 · 날짜 → 작업 줄(`PostActions`, 위 `border-t`). 썸네일 hover 확대는 `duration-(--dur-slow) ease-(--ease-out) motion-safe:group-hover:scale-[1.03]`. 임시저장 글은 수정 화면, 발행 글은 공개 화면으로 링크한다.
- `PostActions`: `btn btn-sm btn-ghost` 미리보기 · 수정 + `ConfirmDeleteButton`(삭제).
- `admin/posts/[slug]/preview`: 안내 줄(`rounded-xl bg-surface`, `미리보기` 배지) + `PostArticleBody` (공개 화면과 같은 모양).
- `admin/login`: `Card` 가운데 정렬(`max-w-sm`), `GithubLoginLink`. `admin/categories`: 카테고리 이름 바꾸기(`RenameCategory`).
- `admin/upload/route.ts`: 에디터 이미지 업로드 API(화면 없음). `docs/posts/` 참고.
- 글 입력 요소는 `.admin-ui` 안에서 포커스해도 외곽선 · 테두리가 바뀌지 않는다(`.field:focus` 는 테두리 투명 + `--surface` 배경). 버튼 · 링크의 키보드 포커스 표시는 유지한다.

## 방명록 · About
- 방명록(`(site)/guestbook/page.tsx`): `Card as="section"` 안에 로그인 상태에 따라 `UserBar` + `GuestbookForm` / `GithubLoginLink` / 설정 안내. 아래에 `남겨진 글 {n}`(`.text-heading`, 숫자는 `text-strong`)과 항목 `Card as="li"`(아바타 40px · 이름 · 시각 `.text-caption` · 본문 `.text-body-sm text-detail-desc`). 관리자는 삭제 버튼(`text-meta hover:text-danger`). 비었거나 불러오지 못하면 `.empty`. 로그인 상태에 따라 달라지므로 `connection()` 으로 요청 시점에 렌더링한다.
- About(`(site)/about/page.tsx`): 전체가 `.container-prose pb-20 sm:pb-24`. `h1.text-display` → `H2`(`.text-title`, 위 여백 `mt-14 sm:mt-20`) 절들. 주제는 `.card.card-pad` 2열 그리드(`sm:grid-cols-2`), 기술 목록은 `dl` + `divide-y divide-line border-y`. 본문 글자는 `.text-body text-detail-desc sm:text-[17px]`. 링크는 `font-semibold text-strong underline underline-offset-4`.
- 404(`not-found.tsx`): `SiteFrame` 안에 가운데 정렬 `404` `.text-caption` + `.text-display` + 홈으로 가는 `btn-primary`.

## 로고
- 원본은 `src/app/icon.svg`: 64×64 viewBox, 바탕 둥근 사각형(`rx=14`, `#191f28`), 흰 점으로 그린 H. 점은 16×16 칸 격자(한 칸 4)에 놓이고 중심은 `(열×4+2, 행×4+2)`.
- 점 배치: 기둥은 열 3 · 4 · 9 · 10 의 행 4–11, 가로획은 열 5–8 의 행 7 · 8, 오른쪽 "지평선"은 열 11–13 의 행 7 · 8 이고 반지름이 1.4 → 1.05 → 0.7 로 줄어든다. 기둥 · 가로획 반지름은 1.7.
- `BrandMark`(`ui/common/BrandMark.tsx`): 같은 점 배치를 `BRAND_DOTS` 로 가지고 `currentColor` 단색 SVG(`viewBox="10 14 46 36"`, 기본 22px)로 그린다. 인트로 내비 · 블로그 헤더 · `PostRow` 의 로고 타일이 쓴다. `icon.svg` 의 점 배치를 바꾸면 `BRAND_DOTS` 도 고친다.
- `scripts/generate-icons.mjs` 가 `icon.svg` 에서 `src/app/favicon.ico`(16 · 32 · 48px PNG 묶음, 모서리 투명)와 `src/app/apple-icon.png`(180px, 모서리까지 바탕색으로 채움 — iOS 가 직접 둥글리며 투명이면 검게 나온다)를 만든다. 실행: `npm run icons`. 바탕색은 SVG 첫 `<rect>` 의 `fill` 에서 읽는다(색을 두 곳에 적지 않는다). 작은 크기는 처음부터 그 크기로 렌더한다(줄여 그리면 획이 번진다).
- 로고 타일(`PostRow` 의 `AuthorAvatar`)은 진한 바탕 `#191f28` + 흰 마크로 다크에서도 같다.

## 컴포넌트
`src/components/ui/common/*` 와 화면 컴포넌트.
| 컴포넌트 | 용도 |
| --- | --- |
| `Button` / `buttonClass()` | `.btn` 조합. `variant`(primary · secondary(기본) · ghost · danger · danger-solid · github), `size`(md · sm), `block`. `Link` · `a` 에는 `buttonClass()` 로 같은 모양을 준다 |
| `Card` | `.card` 상자. `as`(div · section · li · form), `pad=false` 면 안쪽 여백 없음 |
| `Chip` | 카테고리 선택 링크 칩. `active` → `aria-current`, `count` 표시 |
| `Pagination` | 쪽 번호 줄 (`글 목록` 절) |
| `Select` | 기본 select 대신 쓰는 콤보박스 드롭다운. 목록은 body 로 포털해 `fixed` 로 띄워 `.scroll-row` · overflow 에 잘리지 않는다. `name` 을 주면 숨은 input 으로 form 에 실린다. 키보드(↑↓ Home End Enter Esc) 지원. `.glass-thick.select-pop` |
| `ConfirmDeleteButton` | form 안의 삭제 버튼. 누르면 `alertdialog` 모달(포털, `glass-thick`)로 한 번 더 확인한 뒤 `requestSubmit` |
| `GithubLoginLink` | GitHub OAuth 로그인 링크(`/api/auth/github/login?returnTo=`), `btn-github btn-block` |
| `UserBar` | 로그인한 GitHub 계정 표시 + 로그아웃 폼 |
| `Spinner` | 로딩 스피너(`role="status"`) |
| `ThumbImage` | 썸네일: 로딩 중 스피너, 다 받으면 서서히 나타낸다. 부모가 `relative` 여야 한다 |
| `ThemeToggle` | 라이트/다크 스위치 (`헤더 · 푸터` 절) |
| `BrandMark` | 로고 마크 (`로고` 절) |
| `ui/post/PostRow` · `PostToc` · `PostArticleBody` | 글 목록 한 줄 · 목차 · 글 머리 + 본문 |
| `ui/comment/CommentForm` · `ReplyToggle`, `components/Comments` | 댓글 입력 · 답글 토글 · 댓글 영역 |
| `components/{Header,HeaderNav,SiteFrame,AdminLink,PostAdminActions}` | 헤더 · 틀 · 관리자 전용 링크 · 글 상세의 관리자 작업 |
| `components/{BlogList,BlogSidebar,BlogSkeleton,GuestbookForm}` | 글 목록 화면 조각 · 방명록 입력 |

- `ui/common` 컴포넌트는 `.btn` · `.card` · `.chip` 클래스를 감싼 얇은 래퍼다. 모양은 CSS 에서 바꾼다.
- `lib/categories` 는 서버(DB) 전용이라 클라이언트에서 쓰는 `PostRow` · `PostArticleBody` 는 `categoryHref` 와 같은 규칙을 파일 안에 복제해 둔다. 주소 규칙을 바꾸면 세 곳(`lib/categories`, `PostRow`, `PostArticleBody`)을 함께 고친다.

## 바꿀 때 함께 고칠 것
- 토큰을 추가 · 삭제하면: `:root` · `[data-theme="dark"]` 양쪽 + `@theme inline` 매핑 + 이 문서의 `색` 표.
- `--glass*` · `--dur*` · `--press*` 값을 바꾸면: 읽는 클래스(`면` · `움직임` 절 목록)와 `prefers-reduced-motion` 블록.
- 헤더 높이 · 위 여백을 바꾸면: `PostToc` 의 `ACTIVE_OFFSET` · `IntersectionObserver` rootMargin(`-68px`), `.post-body h2/h3` 의 `scroll-margin-top`, `BlogSidebar` 의 sticky `top-16` / `sm:top-[68px]` · `lg:top-24`.
- `.container-page` 폭을 바꾸면: `BlogSidebar` 의 `right-[max(24px,calc(50%-536px))]`(1120/2 − 24)와 `.site-header` 최대 폭, `.scroll-row` 의 음수 마진(`-20px`).
- 로고 점 배치를 바꾸면: `icon.svg` · `BrandMark.tsx` 의 `BRAND_DOTS` · `npm run icons` 로 `favicon.ico` / `apple-icon.png` 재생성.
- 코드 블록 언어를 추가하면: `lib/code-languages.ts` + `globals.css` 의 언어 라벨 규칙 (`docs/posts/`).
- 새 클래스를 만들면: `globals.css` + 이 문서 `클래스` 표. 컴포넌트 주석의 `docs/design "…"` 인용은 이 문서의 절 이름과 맞춘다.
- 인트로 · 에디터 스타일은 각각 `src/app/intro/intro.css`, `src/app/(studio)/studio.css` 에 있고 `docs/intro/`, `docs/editor/` 를 따른다.
