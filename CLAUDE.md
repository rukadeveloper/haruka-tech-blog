# 개발 테크 블로그

개발 및 기술 관련 공부 사항을 업로드하거나, 나의 생각 등을 적는 블로그

# 스택

- 기술 스택 : Next.js (App Router) + Typescript + TailwindCSS
- 배포 : Vercel

# 구조

- src/components/ui : 재사용할 컴포넌트들을 도메인 별로 관리합니다.

- src/components: 주로 한번만 사용되는 컴포넌트 UI 조각들을 위치시킵니다.

- src/lib : S3 업로드, 카테고리 관리 등 공통으로 사용할 로직들을 관리합니다.

# 명령어

- 개발 서버 : npm run dev

- 빌드 : npm run build (타입 검사 포함. 테스트 스위트는 없습니다)

- 린트 : npm run lint

- 내 공인 IP 확인 (관리자 허용 목록용) : npm run admin:ip

- 클로드 내부 명령 (새 브랜치 생성 & 커밋 & PR) : push-commit (`.claude/commands/push-commit.md`)

# 디자인 원칙

- DESIGN.md 파일을 생성하여 디자인 토큰 파일을 만듭니다. (클래스 정의 형식으로 만듭니다.)

- 라이트와 다크모드를 모두 지원합니다.

- 글꼴은 Pretendard 를 사용합니다. (토스 프로덕트 산스는 외부에서 쓸 수 있는 배포본이 없어, 인상이 가장 가까운 오픈 라이선스 글꼴로 대체했습니다.)

- 모바일 퍼스트 디자인으로 구성합니다.

- 공개 화면은 글래스(유리) 디자인이고 관리자 화면은 불투명합니다. 움직임과 유리 면은 DESIGN.md 의 토큰(`--ease-out`, `--dur*`, `--press*`, `--glass*`)과 클래스(`.glass`, `.glass-thick`, `.glass-tint`)로만 씁니다. 움직임 줄이기 · 투명도 줄이기 · 대비 높이기 설정은 그 토큰 값을 바꿔 처리하므로, 값을 직접 쓰면 설정이 무시됩니다.

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

## 데이터 (Supabase)

- 테이블: `posts`, `categories`, `comments`, `guestbook` (정의는 `db/schema.sql`).
- 접근은 `src/lib/db.ts` 의 `db()` 하나로만 합니다. service role 키를 쓰는 서버 전용 클라이언트(`server-only`)라 클라이언트 컴포넌트에서 import 하면 빌드가 실패합니다.
- 읽기는 `src/lib/*.ts` 의 함수, 쓰기는 Server Actions (`src/app/admin/actions.ts`, `src/app/posts/[slug]/comment-actions.ts`, `src/app/guestbook/actions.ts`).
- 카테고리는 2단계이며 DB 에는 경로(`"FE"`, `"FE/Next.js"`)와 `position` 만 저장하고 트리는 읽을 때 만듭니다. 글의 `category` 는 그 경로 문자열입니다.

## 캐싱

- 캐시 태그와 수명은 `src/lib/cache.ts` 에 모아 둡니다.
- 공개 화면이 쓰는 읽기 함수(`getAllPosts`, `getPost`, `getCategories`, 댓글, 방명록)는 `"use cache"` + `cacheTag` + `cacheLife` 를 씁니다. 관리자 화면용 `load*` 함수는 캐시 없이 DB 를 직접 읽습니다.
- 쓰기 Server Action 은 해당 태그를 `updateTag` 로 바로 무효화합니다.
- 화면 밖(스크립트, Supabase 대시보드)에서 DB 를 바꿨을 때는 `POST /api/revalidate` (`REVALIDATE_SECRET`) 로 비우거나 수명이 끝나길 기다립니다.

## 글 형식

- `format: "html"` 은 Tiptap 에디터로 저장한 글(`renderHtml`), `"markdown"` 은 티스토리에서 가져온 글(`renderMarkdown`)입니다. 마크다운 글을 에디터로 열면 `markdownToEditorHtml` 로 변환되고, 저장하면 항상 html 이 됩니다.
- `draft: true` 인 글은 공개 조회에서 모두 빠집니다.
- 파일 트리 블록은 `<div data-file-tree>` 로 저장되고 `src/lib/file-tree.ts` 가 트리 HTML 로 바꿉니다. 코드 블록 하이라이팅 옵션은 `src/lib/highlight.ts`, 지원 언어는 `src/lib/code-languages.ts` 입니다.
- 본문 스타일은 `.post-body` 하나를 공개 글, 관리자 미리보기, 에디터가 함께 씁니다. `PostArticleBody` 는 에디터 미리보기(클라이언트)에서도 import 되므로 서버 전용 모듈을 끌어오면 안 됩니다.

## 인증과 관리자 접근

- GitHub OAuth 로 만든 서명 쿠키 하나(`gh_session`, `src/lib/session.ts`)를 댓글 작성자와 관리자가 함께 씁니다.
- 관리자 = **허용 IP** 이면서 **`ADMIN_GITHUB_LOGIN` 계정으로 로그인**한 경우입니다.
  - `src/proxy.ts` 가 `/admin` 이하 요청을 IP 로 걸러 허용되지 않으면 404 를 보여줍니다.
  - `isAdmin()` (`src/lib/auth.ts`) 도 IP 를 다시 확인하므로 모든 Server Action 이 같은 규칙을 따릅니다. 각 관리자 액션은 스스로 `requireAdmin()` 을 호출해야 합니다.
  - 판정 로직은 `src/lib/admin-ip.ts`.
- 허용 IP 설정: `ADMIN_ALLOWED_IPS` 에 쉼표로 구분해 적습니다 (IPv4/IPv6, CIDR 가능). 개발 모드에서는 localhost 가 자동 허용되고, 프로덕션에서 비어 있으면 전부 차단됩니다. 차단된 IP 는 서버 로그에 찍히므로 그대로 복사해 추가하면 됩니다.

## 이미지

- 에디터 업로드: `POST /admin/upload` → 비공개 S3 버킷 `images/uploads/` → `/media/[...key]` 가 대신 내려줍니다. 4MB 제한(Vercel 요청 본문 한도).
- 티스토리에서 가져온 글의 이미지와 썸네일은 `public/images/` 의 정적 파일입니다.

## cacheComponents 제약 (`next.config.ts`)

- `params`, `searchParams`, 쿠키, 헤더를 읽는 컴포넌트는 `<Suspense>` 안에 있어야 합니다. 페이지는 동기 default export 가 비동기 내부 컴포넌트를 감싸는 형태를 따릅니다.
- prerender 중에는 `Date.now()` 가 막히므로 그런 코드에서는 `src/lib/clock.ts` 의 `nowMs()` 를 씁니다.

## 배포

- `main` 에 푸시하면 Vercel 이 배포합니다. 커밋 메시지에 `[skip deploy]` 가 있으면 `vercel.json` 의 `ignoreCommand` 가 빌드를 건너뜁니다.
- 필요한 환경 변수는 `.env.example` 에 있습니다.
