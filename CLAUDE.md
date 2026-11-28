# 개발 테크 블로그

개발 및 기술 관련 공부 사항을 업로드하거나, 나의 생각 등을 적는 블로그

# 스택

- 기술 스택 : Next.js (App Router) + Typescript + TailwindCSS
- 배포 : Vercel

# 구조

- src/components/ui : 재사용할 컴포넌트들을 도메인 별로 관리합니다.

- src/components: 주로 한번만 사용되는 컴포넌트 UI 조각들을 위치시킵니다.

- src/lib : S3 업로드, 카테고리 관리 등 공통으로 사용할 로직들을 관리합니다.

- src/app/(site) : 헤더와 푸터가 붙는 블로그 화면(홈, 글, 카테고리, About, 방명록, 관리자)입니다. 라우트 그룹이라 주소에는 나타나지 않습니다.

- src/app/intro : 인트로 페이지(`/intro`)입니다. 헤더와 푸터가 붙지 않도록 `(site)` 밖에 둡니다.

- src/app/(studio) : 헤더 · 푸터 · 관리자 메뉴 없이 화면 전체를 쓰는 관리자 도구(글 에디터 스튜디오)입니다. 라우트 그룹이라 주소는 `/admin/posts/new`, `/admin/posts/[slug]/edit` 그대로입니다.

# 명령어

- 개발 서버 : npm run dev

- 빌드 : npm run build (타입 검사 포함. 테스트 스위트는 없습니다)

- 린트 : npm run lint

- 내 공인 IP 확인 (관리자 허용 목록용) : npm run admin:ip

- 로고에서 파비콘 · 애플 아이콘 다시 만들기 : npm run icons (`src/app/icon.svg` 를 고친 뒤 실행. 모양 규칙은 DESIGN.md "로고")

- 클로드 내부 명령 (새 브랜치 생성 & 커밋 & PR) : push-commit (`.claude/commands/push-commit.md`)

# 디자인 원칙

- DESIGN.md 파일을 생성하여 디자인 토큰 파일을 만듭니다. (클래스 정의 형식으로 만듭니다.)

- 라이트와 다크모드를 모두 지원합니다.

- 글꼴은 Pretendard 를 사용합니다. (토스 프로덕트 산스는 외부에서 쓸 수 있는 배포본이 없어, 인상이 가장 가까운 오픈 라이선스 글꼴로 대체했습니다.)

- 모바일 퍼스트 디자인으로 구성합니다.

- 공개 화면과 관리자 화면 모두 평평한 면입니다 (채널톡 기술블로그처럼 흰 바탕 · 테두리 없는 카드 · 옅은 구분선). 면과 움직임은 DESIGN.md 의 토큰(`--ease-out`, `--dur*`, `--press*`, `--glass*`)과 클래스(`.glass`, `.glass-thick`, `.glass-tint`)로만 씁니다. `--glass*` 는 예전 유리 디자인의 이름을 남긴 것으로 지금은 불투명한 값입니다. 움직임 줄이기 · 대비 높이기 설정은 그 토큰 값을 바꿔 처리하므로, 값을 직접 쓰면 설정이 무시됩니다.

- 인트로 페이지(`/intro`)와 글 에디터(`(studio)`)만 위 원칙의 예외입니다.
  - 인트로: 따뜻한 흰 바탕(#f7f7f5) 하나에 자체 색 · 글꼴 · 움직임 값을 쓰며, 그 값은 `.claude/rules/intro-page.md` 에 고정해 두었습니다.
  - 글 에디터: "벤토 블록 에디터" — 자체 토큰(바탕 #E9E9E4 · 포인트 #FF8A4C) · 글꼴(IBM Plex Sans KR · Space Grotesk · JetBrains Mono)을 쓰고, 라이트 · 다크를 모두 지원합니다. 값은 `.claude/rules/editor-bento.md` 에 고정해 두었습니다.

# 전체 규칙

- 먼저 계획 모드로 확인 후 최종 CLAUDE.md 파일을 구성 후 수정합니다.

- 기능 하나가 끝날 때 마다 커밋합니다. (PR 범위는 자유롭게 조정해도 좋습니다)

- Server Actions으로 DB와 소통하며, 백엔드는 따로 구축하지 않습니다.

- 캐싱 전략은 cacheTag와 cacheLife를 적극 이용하여, 생명주기가 있는 캐싱 전략을 사용합니다. 필요할 경우, 캐시 무효화를 해도 좋습니다.

- 글 수정에서 파일 트리 디자인과, 코드 디자인은 반드시 추가하세요.

- 관리자 페이지의 경우, 등록한 IP 주소에서만 보이게 합니다. (DX적으로도 구성해주세요.)

- DB는 기존 Supabase를 사용하여 가져옵니다.

- 코드 주석과 화면 문구는 한국어로 씁니다.

# 아키텍처

## 레이아웃

- 루트 레이아웃(`src/app/layout.tsx`)은 `html`, `body`, 글꼴, 테마 초기화 스크립트만 가집니다.
- 블로그 헤더 · 본문 폭 · 푸터는 `src/components/SiteFrame.tsx` 이고, `src/app/(site)/layout.tsx` 가 블로그 화면에 씌웁니다.
- `src/app/not-found.tsx` 는 없는 주소와 `notFound()` 를 함께 받습니다. 루트 레이아웃 바로 아래에 그려지므로 `SiteFrame` 을 직접 감쌉니다 (차단된 관리자 IP 도 이 화면을 봅니다).

## 인트로 페이지 (`/intro`)

- 따뜻한 흰 바탕에 제목 · CTA · 기술 로고 줄을 두고, 그 뒤에 서로를 향해 뻗는 두 손을 점 매트릭스로 매 프레임 캔버스에 그리는(`DotHands.tsx`) 랜딩 화면입니다. 구성 파일은 `src/app/intro/` 에 모여 있고 스타일은 `intro.css` 하나입니다.
- 디자인 수치, 글꼴, 손 시트 이미지 주소, 캔버스 계산, 반응형 동작은 `.claude/rules/intro-page.md` 에 고정해 두었습니다. 인트로를 고칠 때는 그 파일을 따르고, 값을 바꾸면 그 파일도 함께 고칩니다.
- 외부에 기대는 것: 손 시트 이미지(images.higgs.ai, CORS 필요). 로고 줄 아이콘은 `simple-icons` 의 path 입니다. 캔버스 루프는 이펙트 정리 함수에서 멈춥니다.
- 블로그 홈(`/`)에 처음 들어오거나 홈에서 새로고침하면 `src/proxy.ts` 가 `/intro` 로 보냅니다. 사이트 안 이동은 보내지 않으며, 글 · 카테고리 · About · 방명록 · 관리자 주소는 대상이 아닙니다. 판정은 `src/lib/intro-gate.ts` (`Sec-Fetch-Dest: document`).
- 그래서 홈으로 가는 링크는 `next/link` 로 씁니다. 문서를 새로 받는 이동(`<a href="/">`, `location.href`)은 인트로로 되돌아옵니다.
- 인트로가 보이는 동안 `StageLock` 이 `html` 에 `data-intro` 를 붙이고, `globals.css` 의 `html[data-intro]` 규칙이 바탕을 인트로 색(#f7f7f5)으로 바꾸고 스크롤과 색 번짐을 끕니다. `:has()` 로 화면 안의 표식을 찾으면 안 됩니다 — cacheComponents 는 떠난 화면의 DOM 을 숨긴 채 남겨 두므로 블로그 화면까지 잠깁니다.

## 데이터 (Supabase)

- 테이블: `posts`, `categories`, `comments`, `guestbook` (정의는 `db/schema.sql`).
- 접근은 `src/lib/db.ts` 의 `db()` 하나로만 합니다. service role 키를 쓰는 서버 전용 클라이언트(`server-only`)라 클라이언트 컴포넌트에서 import 하면 빌드가 실패합니다.
- 읽기는 `src/lib/*.ts` 의 함수, 쓰기는 Server Actions (`src/app/(site)/admin/actions.ts`, `src/app/(site)/posts/[slug]/comment-actions.ts`, `src/app/(site)/guestbook/actions.ts`).
- 카테고리는 2단계이며 DB 에는 경로(`"FE"`, `"FE/Next.js"`)와 `position` 만 저장하고 트리는 읽을 때 만듭니다. 글의 `category` 는 그 경로 문자열입니다.

## 캐싱

- 캐시 태그와 수명은 `src/lib/cache.ts` 에 모아 둡니다.
- 공개 화면이 쓰는 읽기 함수(`getAllPosts`, `getPost`, `getCategories`, 댓글, 방명록)는 `"use cache"` + `cacheTag` + `cacheLife` 를 씁니다. 관리자 화면용 `load*` 함수는 캐시 없이 DB 를 직접 읽습니다.
- 쓰기 Server Action 은 해당 태그를 `updateTag` 로 바로 무효화합니다.
- 화면 밖(스크립트, Supabase 대시보드)에서 DB 를 바꿨을 때는 `POST /api/revalidate` (`REVALIDATE_SECRET`) 로 비우거나 수명이 끝나길 기다립니다.

## 글 형식

- `format: "html"` 은 Tiptap 에디터로 저장한 글(`renderHtml`), `"markdown"` 은 티스토리에서 가져온 글(`renderMarkdown`)입니다. 마크다운 글을 에디터로 열면 `markdownToEditorHtml` 로 변환되고, 저장하면 항상 html 이 됩니다.
- `draft: true` 인 글은 공개 조회에서 모두 빠집니다.
- `featured: true` 는 관리자 에디터의 발행 설정에서 켜는 추천 표시입니다. DB · 관리자에는 남아 있지만 지금 공개 화면(홈)은 이 값을 쓰지 않습니다.
- 에디터는 벤토 블록 에디터입니다 (`src/app/(studio)/admin/editor/`, 값과 배치는 `.claude/rules/editor-bento.md`). `PostStudio`(폼 · 상태 · Tiptap · 업로드 · 자동 임시저장 · 발행 흐름)가 `BentoTopBar`(임시저장 · 미리보기 · 발행), `StudioWriter`(커버 드롭존 · 제목 카드 · 본문 블록 카드 · `BlockAddMenu` · `FormatPill`), `BentoSide`(발행 전 체크 · 통계 · 카테고리 · 목차 · URL 카드)를 묶고, 미리보기는 `PreviewOverlay` 가 `StudioPreview`(`previewHtml` 800ms 디바운스)로 그립니다. 발행 전 체크 규칙은 `checklist.ts` 이고 '필요' 항목이 있으면 발행 전에 `PublishConfirm` 으로 한 번 묻습니다. 폼 필드 이름(`title`, `category`, `slug`, `date`, `description`, `tags`, `thumbnail`, `featured`, `content`, `intent`, `originalSlug`)은 `savePost` 가 읽는 이름과 같아야 하고, 입력칸의 Enter 는 제출하지 않습니다 (발행은 버튼으로만).
- 콜아웃 블록은 `<div data-callout="warning">` 로 저장되고(Tiptap 노드 `extensions/Callout.ts`), 공개 글에서는 `.post-body div[data-callout]` 스타일로 그립니다.

## 홈 · 카테고리 화면 (LINE Engineering 블로그 배치)

- 둘 다 `BlogList` 하나가 그립니다: [글자만 있는 목록(`PostRow`) → 페이지네이션 | 오른쪽 사이드바(`BlogSidebar`)]. 목록에는 썸네일이 없습니다 (커버는 글 화면 · 관리자 · 에디터 · 공유 이미지에서 씀).
- 글 한 줄 = 제목 → 작성자 줄(로고 타일 · 이름 · 날짜 · 한 줄 소개, 값은 `src/lib/site.ts` 의 `AUTHOR`) → 요약 3줄 → 분류 칩(카테고리 링크 + 태그). 행 전체가 아니라 제목 · 요약만 글로 링크합니다 (칩 링크와 겹치지 않게).
- 사이드바(lg 이상, 화면에 `fixed` — 스크롤 · 페이지 끝에서도 움직이지 않고, 끝에서는 푸터가 위로 덮음)는 밑줄형 검색창 → "카테고리" 아래 대분류 묶음 제목 + 소분류 `#이름` 링크입니다. lg 미만에서는 목록 위에 검색창 + 헤더 아래에 붙는(sticky) 대분류 칩 줄(현재 대분류의 소분류 칩 줄)로 바뀝니다. 검색은 홈의 `?q=` 로 거릅니다 (캐시된 `getAllPosts()` 를 거름).
- 한 페이지 10편, `?page=N`. 홈(전체)은 최신순 모든 글, 카테고리 화면은 그 카테고리(하위 포함) 글이고 목록 위에 카테고리 이름 · 글 수 줄이 붙습니다. 검색 중에도 검색어를 유지한 채 페이지를 넘깁니다.
- 파일 트리 블록은 `<div data-file-tree>` 로 저장되고 `src/lib/file-tree.ts` 가 트리 HTML 로 바꿉니다. 코드 블록 하이라이팅 옵션은 `src/lib/highlight.ts`, 지원 언어는 `src/lib/code-languages.ts` 입니다.
- 본문 스타일은 `.post-body` 하나를 공개 글, 관리자 미리보기, 에디터가 함께 씁니다. `PostArticleBody` 는 에디터 미리보기(클라이언트)에서도 import 되므로 서버 전용 모듈을 끌어오면 안 됩니다.

## 인증과 관리자 접근

- GitHub OAuth 로 만든 서명 쿠키 하나(`gh_session`, `src/lib/session.ts`)를 댓글 작성자와 관리자가 함께 씁니다.
- 관리자 = **허용 IP** 이면서 **`ADMIN_GITHUB_LOGIN` 계정으로 로그인**한 경우입니다.
  - `src/proxy.ts` 가 `/admin` 이하 요청을 IP 로 걸러 허용되지 않으면 404 를 보여줍니다. (같은 파일이 홈 진입을 인트로로 보내는 일도 합니다 — "인트로 페이지" 참고)
  - `isAdmin()` (`src/lib/auth.ts`) 도 IP 를 다시 확인하므로 모든 Server Action 이 같은 규칙을 따릅니다. 각 관리자 액션은 스스로 `requireAdmin()` 을 호출해야 합니다.
  - 판정 로직은 `src/lib/admin-ip.ts`.
- 허용 IP 설정: `ADMIN_ALLOWED_IPS` 에 쉼표로 구분해 적습니다 (IPv4/IPv6, CIDR 가능). 개발 모드에서는 localhost 가 자동 허용되고, 프로덕션에서 비어 있으면 전부 차단됩니다. 차단된 IP 는 서버 로그에 찍히므로 그대로 복사해 추가하면 됩니다.
- 관리자 화면은 그리드 배치입니다 (DESIGN.md "관리자 화면"). 글 관리는 카드 그리드(`AdminPostCard`)가 기본이고 리스트로 바꿀 수 있으며, 고른 보기는 `localStorage` 의 `admin-post-view` 에 둡니다. 카테고리는 대분류마다 카드 하나인 그리드입니다. 미리보기 · 수정 · 삭제 버튼은 두 보기가 `PostActions` 를 함께 씁니다.

## 이미지

- 에디터 업로드: `POST /admin/upload` → 비공개 S3 버킷 `images/uploads/` → `/media/[...key]` 가 대신 내려줍니다. 4MB 제한(Vercel 요청 본문 한도).
- 티스토리에서 가져온 글의 이미지와 썸네일은 `public/images/` 의 정적 파일입니다.

## cacheComponents 제약 (`next.config.ts`)

- `params`, `searchParams`, 쿠키, 헤더를 읽는 컴포넌트는 `<Suspense>` 안에 있어야 합니다. 페이지는 동기 default export 가 비동기 내부 컴포넌트를 감싸는 형태를 따릅니다.
- prerender 중에는 `Date.now()` 가 막히므로 그런 코드에서는 `src/lib/clock.ts` 의 `nowMs()` 를 씁니다.

## 배포

- `main` 에 푸시하면 Vercel 이 배포합니다. 커밋 메시지에 `[skip deploy]` 가 있으면 `vercel.json` 의 `ignoreCommand` 가 빌드를 건너뜁니다.
- 필요한 환경 변수는 `.env.example` 에 있습니다.

## 하네스: 블로그 개발

**목표:** 기능 개발 · UI 개편 · 버그 수정을 규칙 문서 반영 → 구현 → 아키텍처 · 디자인 검토(적대적 검증) + QA → 수정 → 커밋까지 같은 절차로 진행한다.

**호출 조건:** 이 블로그의 코드 변경(기능 추가, 화면 개편, 버그 수정)이나 그 후속 요청(다시 검토, QA 만 다시, 이어서)을 받으면 `blog-dev` 스킬을 사용한다. 한 줄 문구 · 오타 수정이나 코드 설명 질문에는 직접 답해도 된다.

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
| --- | --- | --- | --- |
| 2026-11-29 | Harness v2로 처음 구성 | 전체 | - |
