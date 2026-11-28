# 글 에디터 (벤토 블록 에디터)
관리자가 글을 쓰고 고치는 전체 화면 Tiptap 에디터. `src/app/(studio)/**` 에 있고, 블로그 토큰 이름은 그대로 둔 채 값만 벤토 색으로 덮어쓴다.

## 목차
언제 읽나 · 관련 파일 · 꼭 지킬 규칙 · 라우트 · 토큰 · 글꼴 · 레이아웃 · Tiptap 확장 · 콜아웃 블록 · 파일 트리 블록 · 폼 필드 · 저장 흐름 · 발행 전 체크 · 미리보기 · 옛 마크다운 글 · 이미지 업로드 · 바꿀 때 함께 고칠 것

## 언제 읽나
- 에디터 화면(색, 레이아웃, 블록, 서식 알약)을 고칠 때
- 폼 필드나 `savePost` 를 건드릴 때
- 발행 전 체크 항목이나 미리보기를 바꿀 때

## 관련 파일
- `src/app/(studio)/layout.tsx` — 틀, 글꼴 3종, `robots: noindex`
- `src/app/(studio)/StudioTheme.tsx` — html 에 `data-studio` · 글꼴 클래스 부착
- `src/app/(studio)/studio.css` — 토큰 덮어쓰기, 블록 카드 모양
- `src/app/(studio)/admin/posts/new/page.tsx`, `admin/posts/[slug]/edit/page.tsx` — 진입 페이지
- `src/app/(studio)/admin/editor/` — `PostStudio`, `BentoTopBar`, `BentoSide`, `StudioWriter`, `FormatPill`, `BlockAddMenu`, `panels/OutlinePanel`, `PreviewOverlay`, `StudioPreview`, `PublishConfirm`, `status.tsx`, `checklist.ts`, `ResizableImage.tsx`, `FileTree.tsx`, `extensions/Callout.ts`, `icons.tsx`
- `src/app/(site)/admin/actions.ts` — `savePost`, `previewHtml`
- `src/app/(site)/admin/upload/route.ts` — 이미지 업로드
- `src/lib/posts.ts` — `loadPostSource`, `markdownToEditorHtml`, `renderHtml`

## 꼭 지킬 규칙
- 에디터 화면은 `(studio)` 라우트 그룹에 둔다 — 사이트 헤더 · 푸터 · 관리자 메뉴 없이 화면 전체를 쓰기 위해 (`(studio)/layout.tsx`)
- 폼 필드 이름은 `savePost` 가 읽는 이름(`intent`, `originalSlug`, `title`, `slug`, `category`, `tags`, `date`, `description`, `thumbnail`, `featured`, `content`)과 정확히 같아야 한다 — 다르면 서버가 빈 값으로 읽는다 (`actions.ts`, `PostStudio.tsx`)
- 벤토 색은 `html[data-studio]` 에서 기존 토큰(`--background`, `--elevated` 등)의 값만 덮어쓴다. 새 이름의 토큰으로 갈아타지 않는다 — `.btn` · `.field` · `.badge` · Select 목록이 그대로 벤토 색을 받게 하려고 (`studio.css`)
- `data-studio` 는 `StudioTheme` 의 이펙트로만 붙이고 정리 함수에서 뗀다 — cacheComponents 가 화면을 숨겨도 블로그 화면이 원래 토큰으로 돌아오게 하려고 (`StudioTheme.tsx`)
- 발행 버튼은 제출 버튼(`type="submit"`)이 아니다. 발행 전 체크를 거쳐 `requestSubmit` 한다 — 입력칸 Enter 로 발행되지 않게 하려고 (`PostStudio.tsx`, `BentoTopBar.tsx`)
- 발행된 글은 임시저장으로 되돌리지 않는다 (`canDraft = !isEdit || initial.draft`) — 공개 글이 비공개로 바뀌는 것을 막으려고 (`PostStudio.tsx`)
- 본문 저장 형태는 HTML(`format: "html"`)이다. 새 블록 노드는 저장 HTML 과 공개 렌더가 모두 읽을 수 있는 `div[data-…]` 형태로 만든다 (`Callout.ts`, `FileTree.tsx`, `actions.ts`)
- 발행 전 체크는 `checklist.ts` 한 곳에서만 계산하고 사이드 카드 · 확인 창이 같은 결과를 쓴다 (`checklist.ts`)
- 이미지는 `/admin/upload` 로만 올린다 — 확장자 png/jpg/jpeg/gif/webp, 4MB 이하 (`upload/route.ts`)
- 저장 중 모달에는 취소 버튼을 두지 않는다 — 서버 액션은 중간에 취소할 수 없다 (`PostStudio.tsx`)

## 라우트
- 새 글: `/admin/posts/new`, 수정: `/admin/posts/[slug]/edit`. 둘 다 `(studio)` 그룹이라 `/admin` 아래 주소를 쓰지만 `(site)` 의 관리자 레이아웃(메뉴)은 적용되지 않는다.
- 두 페이지 모두 `requireAdmin()` 으로 로그인을 확인하고 `export const instant = false` 로 즉시 이동 검증에서 제외한다.
- 레이아웃이 `Suspense` 로 children 을 감싸고 fallback 은 "에디터를 여는 중…" 이다 (페이지가 params · 쿠키를 읽기 때문).
- `metadata`: 제목 "글 편집", `robots: { index: false, follow: false }`.
- 새 글을 처음 임시저장하면 `history.replaceState` 로 주소를 `/admin/posts/{slug}/edit` 로 바꾼다 (새로고침해도 이어서 쓰기).

## 토큰
`html[data-studio]` 가 기존 블로그 토큰 값을 덮어쓴다. 다크는 `html[data-studio][data-theme="dark"]`. 다크 값은 파일 주석에 "컨셉에 없어 라이트에서 끌어낸 제안값" 으로 적혀 있다.

특이도: `html[data-studio]` (0,1,1) 가 `:root` · `[data-theme="dark"]` (0,1,0) 를 이기고, 다크 규칙 (0,2,1) 이 라이트 규칙을 이긴다. 그래서 순서와 상관없이 에디터가 떠 있는 동안 벤토 값이 이긴다.

| 토큰 | 라이트 | 다크 |
|---|---|---|
| `color-scheme` | light | dark |
| `--background` | #e9e9e4 | #121211 |
| `--elevated` | #ffffff | #1c1c1a |
| `--subtle` | #f2f2ee | #262622 |
| `--surface` | #f2f2ee | #262622 |
| `--surface-hover` | #e6e6e0 | #30302b |
| `--line` | #deded7 | #2e2e2a |
| `--rule` | #deded7 | #2e2e2a |
| `--foreground` | #1a1a18 | #ededE8 |
| `--muted` | #3d3d38 | #c9c9c2 |
| `--meta` | #6b6b64 | #9a9a92 |
| `--strong` | #ff8a4c | (라이트 값 그대로) |
| `--strong-hover` | #f47a38 | (라이트 값 그대로) |
| `--strong-soft` | rgba(255,138,76,0.16) | rgba(255,138,76,0.2) |
| `--on-strong` | #1a1a18 (포인트 위 글자는 항상 #1A1A18) | (그대로) |
| `--sub` | #ff8a4c | (그대로) |
| `--danger` | #b3261e | #f2766b |
| `--danger-soft` | rgba(179,38,30,0.1) | rgba(242,118,107,0.14) |
| `--success` | #2f7a3e | #6bc07b |
| `--success-soft` | rgba(47,122,62,0.12) | rgba(107,192,123,0.14) |
| `--warning` | #7a4e00 | #ffd27a |
| `--warning-soft` | #fff4d6 | #3a3220 |
| `--thumb` | #f2f2ee | #262622 |
| `--detail-title` | #1a1a18 | #ededE8 |
| `--detail-desc` | #3d3d38 | #c9c9c2 |
| `--code-bg` | #f2f2ee | #262622 |
| `--shadow-card` | 0 1px 2px rgba(26,26,24,0.04) | none |
| `--shadow-pop` | 0 2px 6px rgba(26,26,24,0.08), 0 16px 40px rgba(26,26,24,0.16) | 0 2px 6px rgba(0,0,0,0.3), 0 16px 40px rgba(0,0,0,0.5) |
| `--bento-ink` | #1a1a18 (진한 카드: 코드 · 서식 알약, 테마와 무관) | (그대로) |
| `--bento-on-ink` | #f2f2ee (진한 카드 위 글자) | (그대로) |
| `--bento-callout` | #fff4d6 | #3a3220 |
| `--font-mono` | var(--font-jetbrains), "JetBrains Mono", Consolas, monospace | (그대로) |

- `prefers-contrast: more` 이면 `html[data-studio] { --line: var(--meta) }`.
- 코드 블록 카드: `--cb-body: var(--bento-ink)`, `--cb-head: #262622`, 모서리 20px.
- 카드 모서리는 20px(`rounded-[20px]`). 글 덩어리 카드의 안쪽 여백은 가로 32px(639px 이하 20px), 세로 7px, 카드 시작 위 28px · 끝 아래 28px, 카드 사이 12px.

## 글꼴
`(studio)/layout.tsx` 에서 `next/font/google` 로 에디터 화면에서만 불러온다.

| 글꼴 | CSS 변수 | 설정 |
|---|---|---|
| IBM Plex Sans KR | `--font-plex` | weight 400/500/600/700, `display: swap`, `preload: false` (한글 글꼴은 하위 집합 미리 받기 미지원) |
| Space Grotesk | `--font-grotesk` | subsets latin, `display: swap` |
| JetBrains Mono | `--font-jetbrains` | subsets latin, `display: swap` |

- 세 변수 클래스를 레이아웃 래퍼 div 와 (`StudioTheme` 이) `html` 양쪽에 붙인다 — body 로 띄우는 팝오버도 글꼴을 받게 하려고.
- `html[data-studio] body` 의 글꼴: `var(--font-plex)`, -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif.
- 숫자 · 로고 강조에 `.font-grotesk` (`var(--font-grotesk)`, `var(--font-plex)`, sans-serif).

## 레이아웃
`PostStudio` 가 `<form>` 하나로 화면 전체를 구성한다 (`max-w-[1440px]`, 패딩 `p-3 lg:p-5`). 위 상단 바 카드, 아래 `[메인 열 | 사이드 360px]` (`lg:grid-cols-[minmax(0,1fr)_360px]`).

- `BentoTopBar` — 흰 카드, sticky. `haruka-admin-log` 로고(→ `/admin`) · "새 글 / 글 수정 · 블록 N개" · 상태 배지 · 저장 상태 | `[임시저장] [미리보기] [발행 →]`. 발행된 글은 "업데이트". 좁은 화면은 문구를 줄인다.
- `StudioWriter`(메인 열) — 커버 드롭존(`CoverDrop`, 1200×630 권장, 드래그 · 클릭 · URL) → 제목 카드(`TagChips` · 제목 textarea · 요약 textarea, 요약 권장 160자) → 본문 `EditorContent`(`.bento-doc`) → `BlockAddMenu` → 아래 가운데 sticky `FormatPill`. 제목 · 요약은 Enter 로 줄을 바꾸지 않는다.
- `FormatPill` — 진한 알약(`--bento-ink`). 글자 서식만 둔다: 코드 블록 언어 Select, 인라인 코드, 굵게/기울임/밑줄/취소선/링크, H2/H3/본문, 글머리/번호 목록/인용, (표 안일 때만) 열 · 행 추가 삭제 · 표 삭제, 실행 취소/다시 실행. 사진 · 파일 트리 · 표 · 구분선처럼 넣기만 하는 것은 `BlockAddMenu` 가 맡는다.
- `BlockAddMenu` — 타일 10개: 문단, 제목 2, 제목 3, 코드(기본 typescript), 콜아웃, 파일 트리, 표(3×3, 머리 1행), 사진(파일 선택), 인용, 구분선. 본문을 눌러 본 뒤(`touched`)에는 커서가 든 최상위 블록 바로 뒤에, 아니면 문서 끝에 넣는다.
- `BentoSide`(`<aside>`, sticky `lg:top-[100px]`) — 2열 그리드: 발행 전 체크, 글자 수, 읽는 시간(글자 수/500 올림, 최소 1분), 카테고리 Select, 목차(`panels/OutlinePanel`, H2~H4), 블록 구성(문단/코드/이미지), 마지막 저장, URL · 날짜(슬러그 · 날짜 · 추천 글 체크박스). 폼 입력은 항상 그려 둬서 제출에 실린다.
- `PublishConfirm` — 체크에 `fail` 이 있을 때만 뜨는 확인 창. `pass` 가 아닌 항목(주의 포함)을 보여 주고 처음 포커스는 "돌아가기", Esc 로 닫는다.
- `PreviewOverlay` · `StudioPreview` — 아래 `## 미리보기`.
- `status.tsx` — `PostState`(`new` 새 글 / `draft` 임시저장 / `published` 발행됨) 배지와 `SaveStatus` 한 줄(진행 문구 → 오류 → 저장 중… → 임시저장됨 HH:MM → 편집 중).
- 저장 중 모달(`z-[80]`)은 `pending` 이면서 마지막 의도가 `publish` 일 때만 뜬다. 확인 창 `z-[70]`, 미리보기 `z-[60]`.
- 단축키: Ctrl/⌘+S 임시저장(제목이 있을 때), 3분(180000ms)마다 변경이 있고 제목이 있으면 자동 임시저장.

블록 카드 규칙(`studio.css`, `.bento-doc` = ProseMirror 루트): h2 · p · ul · ol · h3 · h4 는 이어 붙여 한 카드로 보이고 H2 마다 새 카드다. 코드 · 콜아웃 · 인용 · 파일 트리 · 표 · 이미지는 각자 카드. 간격은 margin 대신 padding. 카드 끝 판정에 쓰는 `:has(+ …)` 는 형제만 본다.

## Tiptap 확장
`PostStudio.tsx` 의 `useEditor` 에서 import 한 것:
- `StarterKit` — `link: { openOnClick: false, autolink: true }`
- `ResizableImage` (자체, `@tiptap/extension-image` 확장) — 속성 `width`, `align`(left/center/right, 저장 시 `data-align` + 인라인 style), 드래그로 크기 조절, 최소 폭 40px
- `FileTree` (자체) — 파일 트리 블록
- `Callout` (자체, `extensions/Callout.ts`) — 콜아웃 블록
- `Table.configure({ resizable: false })`, `TableRow`, `TableHeader`, `TableCell` (`@tiptap/extension-table`)
- `Placeholder` (`@tiptap/extension-placeholder`)
- 에디터 옵션: `immediatelyRender: false`, `shouldRerenderOnTransaction: true`, 루트 클래스 `post-body editor-body bento-doc outline-none`.
- 이미지 붙여넣기 · 드롭은 `image/*` 파일만 가로채 업로드 후 `setImage`.

## 콜아웃 블록
- 노드 `callout`: `group: "block"`, `content: "block+"`, `defining: true`. 속성 `kind` 기본 `"warning"`.
- 저장 형태: `<div data-callout="warning">…블록…</div>`. 파싱 태그는 `div[data-callout]`.
- 명령 `toggleCallout` — 이미 콜아웃 안이면 `lift`, 아니면 `wrapIn`.
- 공개 글은 `globals.css` 의 `.post-body div[data-callout]` 가 그린다. 에디터 안 모양은 `studio.css` (패딩 20px 24px, 모서리 20px, 바탕 `--bento-callout`, 글자 `--foreground`).

## 파일 트리 블록
- 노드 `fileTree`: `group: "block"`, `atom: true`, `draggable: true`. 속성 `tree`(문자열).
- 저장 형태: `<div data-file-tree="텍스트"></div>`. 공개 글 · 미리보기에서는 서버가 트리 HTML 로 바꿔 그린다 (`lib/posts.ts`, 변환 함수는 `lib/file-tree.ts` 의 `renderFileTreeHtml`).
- 에디터 안: 왼쪽 textarea 에 들여쓰기 텍스트를 쓰면 오른쪽(좁은 화면은 아래)에 바로 렌더된다. 문법 안내: 들여쓰기 2칸 = 한 단계, 폴더는 이름 뒤에 `/`, ` # 설명` 으로 설명 추가, `tree` 명령 출력 붙여넣기 가능. 입력 중 키 · 붙여넣기 · 드롭은 `stopPropagation` 으로 본문에 새지 않게 한다.

## 폼 필드
`savePost(prev, formData)` 가 읽는 이름과 에디터가 보내는 이름은 같아야 한다.

| 이름 | 에디터에서 보내는 곳 | `savePost` 처리 |
|---|---|---|
| `intent` | `PostStudio` hidden, 기본 `publish`, 제출 직전 `draft`/`publish` 로 바꿨다 되돌림 | `draft` 면 비공개 저장 후 에디터 유지, 그 외는 저장 후 `/admin` 이동 |
| `originalSlug` | `PostStudio` hidden = `currentSlug` | 슬러그 변경 · 새 글 판별. 바뀌면 기존 행 키를 먼저 update (댓글 ON UPDATE CASCADE) |
| `title` | `StudioWriter` textarea (`required`) | 비면 "제목을 입력하세요." |
| `slug` | `BentoSide` input (`defaultValue`) | 비면 `originalSlug` 또는 `Date.now()`. `^[a-z0-9][a-z0-9_-]*$` 검사, 중복 검사 |
| `category` | `BentoSide` Select(`name="category"`) | 비어 있지 않으면 존재하는 카테고리여야 함 |
| `tags` | `TagChips` hidden (쉼표+공백으로 이음) | 쉼표로 쪼개 trim · 빈 값 제거 |
| `date` | `BentoSide` date input (`required`) | 비면 오늘 날짜 |
| `description` | `StudioWriter` textarea | 요약 |
| `thumbnail` | `CoverDrop` hidden | 커버 URL |
| `featured` | `BentoSide` 체크박스 | `=== "on"` |
| `content` | `PostStudio` hidden = `editor.getHTML()` | `body` 로 저장, `format: "html"` |

- 입력칸에서 Enter 는 막는다(체크박스 제외). 폼 `onChange` 와 에디터 `onUpdate` 가 `dirty` 를 올린다.
- 반환 `SaveState`: `{ error?, slug?, savedAt? }`. 임시저장 성공 시 `slug` 를 받아 이후 저장이 같은 글을 갱신한다 (`currentSlug = saved?.slug ?? (isEdit ? initial.slug : "")`).

## 저장 흐름
- 임시저장: `submit("draft")` → `savePost` 가 `draft: true` 로 upsert, 에디터에 남는다. 새 글이면 주소를 수정 화면으로 교체한다.
- 발행: `requestPublish` → 체크에 `fail` 이 있으면 `PublishConfirm`, 없으면 바로 `submit("publish")` → `draft: false` 로 저장하고 `/admin` 으로 이동.
- 저장 후 `updateTag(POSTS_TAG)` 로 글 캐시를 무효화한다.
- 발행된 글(`isEdit` 이면서 `initial.draft` 가 거짓)은 임시저장 버튼이 비활성이고 발행 버튼 문구가 "업데이트" 다.
- 상태(`PostState`): 슬러그가 없으면 `new`, 수정 중이면서 `draft` 가 아니면 `published`, 나머지는 `draft`.

## 발행 전 체크
`checklist.ts` 의 `prepublishChecks`. 상태는 `pass`(통과) / `warn`(주의) / `fail`(필요). 항목을 누르면 해당 입력으로 이동한다(`goToCheck`).

| id | 라벨 | pass | warn | fail |
|---|---|---|---|---|
| `title` | 제목 길이 | 10~60자 | 1~9자, 61~80자 | 0자, 80자 초과 |
| `tags` | 태그 3개 이상 | 3개 이상 | 1~2개 | 0개 |
| `thumbnail` | 썸네일 | 커버 URL 있음 | (없음) | 커버 URL 없음 |
| `code` | 코드 블록 언어 | 언어 없는 코드 0개(코드 블록 없음 포함) | 언어가 비었거나 `plaintext` 인 코드 있음 | (없음) |

- 제목 길이는 `[...title.trim()].length` (코드포인트 기준).
- 발행 확인 창은 `fail` 이 하나라도 있을 때만 뜬다. `warn` 만 있으면 확인 없이 발행된다.
- 태그 분해는 `splitTags` (쉼표 기준 trim).

## 미리보기
- 상단 바 `미리보기` → `PreviewOverlay`(전체 화면 다이얼로그, Esc · 닫기, 열려 있는 동안 `html` 스크롤 잠금) → `StudioPreview`.
- `StudioPreview` 는 본문이 바뀌면 800ms 뒤 서버 액션 `previewHtml(html)` 을 호출한다. `previewHtml` 은 `requireAdmin()` 후 `renderHtml(html)` — 공개 글과 같은 렌더(코드 하이라이팅 포함)를 쓴다. 마지막 요청 결과만 반영한다(`seq` 비교).
- 결과는 `PostArticleBody`(공개 글 본문 컴포넌트)로 그린다. 본문이 비었거나 첫 결과 전이면 제목 · 날짜와 스켈레톤을 보인다. 실패 시 "미리보기 실패" 표시.
- 시트 폭 768px(공개 글의 읽는 폭 `.container-prose` 와 같다고 주석에 적혀 있다), 시트 패딩 48. 영역 폭에 맞춘 "맞춤" 배율(최대 1), 확대 단계 `[0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.25, 1.5]`, 최소 배율 0.3. 시트에 `inert` 를 줘 링크 · 목차를 누를 수 없다.
- 저장하지 않은 현재 내용을 그린다.

## 옛 마크다운 글
- 수정 페이지는 `loadPostSource(slug)` 로 `format` 을 읽는다. `format !== "html"` 이면 `legacyMarkdown` 이 참이고 본문을 `markdownToEditorHtml(content)` (remark-parse · remark-gfm · remark-rehype · rehype-raw · rehype-stringify, 코드 하이라이팅 없음)로 HTML 로 바꿔 에디터에 넣는다.
- `legacyMarkdown` 이면 제목 카드 아래에 "티스토리에서 가져온 마크다운 글입니다. 저장하면 에디터(HTML) 형식으로 변환됩니다." 안내가 뜬다. 저장하면 `format: "html"` 로 기록된다.

## 이미지 업로드
- 본문 이미지(사진 타일 · 붙여넣기 · 드롭)와 커버는 모두 `uploadImage(file)` → `POST /admin/upload` (FormData `file`) → `{ url }`.
- 서버(`upload/route.ts`): 관리자만(`isAdmin`, 아니면 401), 확장자 png/jpg/jpeg/gif/webp, 4MB 이하(Vercel 본문 한도 4.5MB 보다 작게), 키 `images/uploads/{Date.now()}.{ext}`, S3 업로드 후 `mediaUrl(key)` 반환. 실패 응답 `{ error }`.
- 에디터는 오류 메시지를 상단 바 저장 상태 줄에 보인다.

## 바꿀 때 함께 고칠 것
- 폼 필드 이름을 바꾸면 `savePost`(`actions.ts`)와 이 문서의 `## 폼 필드` 를 같이 고친다.
- 체크 항목을 바꾸면 `checklist.ts`, `CheckId` 타입, `BentoSide` 의 "4개 중" 접근성 문구(`aria-label`)와 4칸 진행 막대(`grid-cols-4`), 이 문서의 표를 같이 고친다.
- 새 블록(Tiptap 노드)을 만들면 `PostStudio` 확장 목록, `BlockAddMenu` 타일, 공개 글 CSS(`globals.css` `.post-body`)와 서버 렌더(`lib/posts.ts`)를 같이 확인한다.
- 토큰 값을 바꾸면 `studio.css` 와 이 문서의 `## 토큰` 표를 같이 고친다.
- 미리보기 시트 폭은 공개 글 읽는 폭과 같게 유지한다.
