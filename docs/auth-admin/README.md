# 인증 · 관리자
관리자는 "허용 IP" 와 "관리자 GitHub 계정" 을 모두 만족해야 하고, 방문자는 GitHub OAuth 로그인으로 댓글·방명록을 쓴다. 둘 다 서명 쿠키 하나(`gh_session`)를 쓴다.

## 언제 읽나
- 관리자 페이지·액션·라우트를 추가하거나 권한 검사를 바꿀 때
- 접속 IP 허용 목록, `proxy.ts` matcher 를 바꿀 때
- GitHub 로그인, 세션 쿠키, 환경변수를 다룰 때
- 댓글·방명록 작성/삭제 권한, 이미지 업로드 권한을 바꿀 때

## 관련 파일
- `src/lib/admin-ip.ts` — `ADMIN_ALLOWED_IPS` 해석, `isAdminIpAllowed`, `clientIp`
- `src/lib/auth.ts` — `isAdminIp()`, `isAdmin()`, `requireAdmin()`, `ADMIN_GITHUB_LOGIN`
- `src/proxy.ts` — `/admin` 계열 IP 차단(404 rewrite) + 인트로 리다이렉트
- `src/lib/session.ts` — `gh_session` 서명 쿠키, `getUser` / `setUserSession` / `clearUserSession`, `githubApp`, `isGithubConfigured`
- `src/app/api/auth/github/login/route.ts`, `callback/route.ts` — OAuth 시작·완료
- `src/app/(site)/admin/login/page.tsx` — 관리자 로그인 화면
- `src/app/(site)/admin/upload/route.ts` — 이미지 업로드
- `scripts/admin-ip.mjs` — `npm run admin:ip`
- `.env.example` — 환경변수 목록

## 꼭 지킬 규칙
- 관리자 Server Action 은 첫 줄에서 `await requireAdmin()` 을 호출한다 — proxy 는 화면 숨김용이고 권한의 기준은 각 액션이다 (`proxy.ts` 주석, `admin/actions.ts`).
- 관리자 서버 컴포넌트 페이지(`admin/page.tsx`, `categories/page.tsx`, `posts/[slug]/preview/page.tsx`, `(studio)` 의 `posts/new` · `posts/[slug]/edit`)는 `requireAdmin()` 을 호출한다. 레이아웃의 `isAdmin()` 은 메뉴 표시용이지 보호가 아니다.
- 관리자 Route Handler 는 `isAdmin()` 으로 직접 확인하고 아니면 401 을 반환한다 (`admin/upload/route.ts`). `/api/*` 는 `proxy.ts` matcher 에 없으므로 proxy 의 보호를 받지 못한다.
- 관리자 여부는 `isAdmin()` = 허용 IP **그리고** GitHub 계정이 `ADMIN_GITHUB_LOGIN`(기본 `rukadeveloper`, 대소문자 무시)과 같을 때만 true 다. IP 검사를 빼거나 로그인만으로 통과시키지 않는다 (`auth.ts`).
- 관리자 URL 은 `/admin` 하위에 둔다 — `src/proxy.ts` 의 `config.matcher`(`"/"`, `"/admin"`, `"/admin/:path*"`) 밖에 두면 IP 차단이 걸리지 않는다.
- 차단된 IP 에는 로그인 화면도 드러내지 않고 `/_blocked`(없는 경로)로 rewrite 해 404 를 준다. 403 이나 로그인 화면 이동으로 바꾸지 않는다 (`proxy.ts`).
- `ADMIN_ALLOWED_IPS` 가 프로덕션에서 비면 전부 차단한다 (열리는 것보다 잠기는 쪽이 안전). 개발 모드(`NODE_ENV=development`)에서만 localhost(`127.0.0.1`, `::1`, IP 없음)를 허용한다 (`admin-ip.ts`).
- 클라이언트 IP 는 `x-forwarded-for` 첫 값(없으면 `x-real-ip`)을 쓴다 — Vercel 이 덮어써서 위조할 수 없다는 전제이므로, 다른 호스팅으로 옮기면 앞단 프록시가 이 헤더를 덮어쓰는지 먼저 확인한다.
- 세션 쿠키는 HMAC-SHA256 서명 + `timingSafeEqual` 로 검증하고 `httpOnly`, `sameSite: "lax"`, 프로덕션 `secure` 를 유지한다 (`session.ts`). 만료 비교는 `nowMs()`.
- OAuth `returnTo` 는 `/` 로 시작하고 `//` 로 시작하지 않는 내부 경로만 허용한다 — 열린 리다이렉트 방지 (`login/route.ts` `safePath`, `callback/route.ts`). OAuth `state` 는 `gh_oauth` 쿠키(10분)와 대조한다.
- 비밀값은 `NEXT_PUBLIC_` 접두사 없이 서버에서만 읽는다 (`SESSION_SECRET`, `GITHUB_CLIENT_SECRET`, `GITHUB_OAUTH_APPS`, `REVALIDATE_SECRET`). `.env.local` 은 커밋하지 않는다.
- 업로드는 확장자 `png/jpg/jpeg/gif/webp` 만, 4MB 이하만 허용한다 (Vercel 요청 본문 한도 4.5MB 보다 작게). 올릴 때는 호스팅 한도를 먼저 확인한다 (`upload/route.ts`).
- 댓글·방명록 삭제는 `본인(authorId 일치) || 관리자` 일 때만 한다 (`comment-actions.ts`, `guestbook/actions.ts`).

## 관리자 접근 흐름
1. 요청이 `/admin`, `/admin/*` 에 오면 `proxy.ts` 가 `isAdminIpAllowed` 로 IP 를 본다. 불허면 404 rewrite. 서버 액션도 화면과 같은 경로로 POST 되므로 여기서 함께 걸린다.
2. 허용 IP 라도 페이지/액션이 `requireAdmin()` 으로 IP 를 다시 확인하고 GitHub 계정까지 확인한다. 아니면 `/admin/login` 으로 `redirect`.
3. `/admin/login` — 관리자면 `/admin` 으로 보낸다. 로그인했지만 관리자 계정이 아니면 "관리자 권한이 없습니다" 와 로그아웃 버튼(`logout` 액션), 로그인 전이면 `GithubLoginLink`(returnTo `/admin`), GitHub 설정이 없으면 `.env.local` 설정 안내를 보여 준다. 이 화면도 IP 허용이 선행된다.
4. 관리자 전용 세션은 따로 없다. 방문자 세션(`gh_session`)의 `login` 이 관리자 계정이면 관리자가 된다. (`session.ts` 주석은 "관리자 세션(auth.ts)과 별개" 라고 하나 현재 코드에는 별도 관리자 쿠키가 없다.)

## 허용 IP (`ADMIN_ALLOWED_IPS`)
- 쉼표로 구분, IPv4/IPv6, CIDR 가능. 예: `203.0.113.7, 198.51.100.0/24, 2001:db8::/32`.
- `::ffff:1.2.3.4` 형태는 IPv4 로 정규화한다. 잘못된 항목은 경고 로그를 남기고 무시한다.
- 환경변수를 해석해 캐시하고 값이 바뀌면 다시 만든다. 차단된 IP 는 한 번씩만 로그에 남긴다.
- 내 공인 IP 확인: `npm run admin:ip` (ipify 로 조회해 `ADMIN_ALLOWED_IPS=...` 를 출력). 로컬 `next start` 확인용은 `.env.local`, 배포는 Vercel 환경변수에 넣는다.
- `AdminLink` 컴포넌트는 `isAdminIp()` 만 확인해 관리자 진입 링크를 허용 IP 방문자에게만 보인다 (`src/components/AdminLink.tsx`).

## 방문자 GitHub OAuth
- `/api/auth/github/login?returnTo=/path` — `state` 를 만들어 `gh_oauth` 쿠키에 저장하고 GitHub 승인 화면(`scope=read:user`)으로 보낸다. 설정이 없으면 `returnTo` 로 그냥 돌려보낸다.
- `/api/auth/github/callback` — `state` 검증 → 코드로 토큰 교환 → `api.github.com/user` 조회 → `setUserSession({id, login, name, avatar})` → `returnTo` 로 이동. 실패하면 `?login=error` 를 붙여 돌려보낸다.
- 호스트별 앱: OAuth App 은 콜백 URL 이 하나뿐이라 `GITHUB_OAUTH_APPS='{"호스트":{"id":"...","secret":"..."}}'` 에 호스트별 키를 두고, 없는 호스트는 `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` 으로 대체한다 (`githubApp(host)`). JSON 이 깨져도 기본 키로 대체한다.
- 서명 비밀은 `SESSION_SECRET`, 없으면 `ADMIN_SECRET`. 둘 다 없으면 `getUser()` 는 항상 null 이고 `isGithubConfigured()` 는 false.
- 쿠키 `gh_session` = `base64url(JSON{id,login,name,avatar,exp}).서명`, 유효기간 30일.

## 권한 표
| 동작 | 조건 |
|---|---|
| 글·카테고리 관리, 미리보기, 이미지 업로드 | `isAdmin()` (허용 IP + 관리자 계정) |
| 댓글·방명록 작성 | GitHub 로그인 (`getUser()`) |
| 댓글·방명록 삭제 | 본인 또는 `isAdmin()` |
| 글·댓글·방명록 읽기 | 누구나 |

## 바꿀 때 함께 고칠 것
- 관리자 계정/IP 규칙 변경: `auth.ts`, `admin-ip.ts`, `.env.example`, `scripts/admin-ip.mjs` 안내 문구.
- 새 관리자 경로: `proxy.ts` matcher 포함 여부, `requireAdmin()` / `isAdmin()`, `instant = false` (`docs/caching/README.md`).
- 세션 필드 변경: `SessionUser`, `setUserSession`, `getUser`, 댓글·방명록 저장 컬럼 (`docs/data/README.md`).
- OAuth 앱 호스트 추가: `GITHUB_OAUTH_APPS` 와 GitHub 쪽 콜백 URL(`{origin}/api/auth/github/callback`).
