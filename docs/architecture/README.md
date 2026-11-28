# 아키텍처
Next.js 16 App Router 기반 개인 기술 블로그. 글·댓글·카테고리는 Supabase, 이미지는 S3, 배포는 Vercel 이다.

## 언제 읽나
- 처음 프로젝트에 들어와 폴더·라우트·명령어를 파악할 때
- 새 파일을 어느 폴더에 둘지 정할 때
- 환경 변수를 추가하거나 바꿀 때

## 관련 파일
- `package.json` — 의존성과 npm 스크립트
- `next.config.ts` — cacheComponents, partialPrefetching, turbopack css 로더
- `.env.example` — 환경 변수 목록(값은 비어 있거나 예시)
- `src/proxy.ts` — 홈 인트로 리다이렉트, 관리자 IP 차단 (matcher: `/`, `/admin`, `/admin/:path*`)
- `src/app/layout.tsx` — 루트 레이아웃 (`<html lang="ko">`, Pretendard · Geist Mono 폰트)
- `src/lib/cache.ts` — 캐시 태그(`TAGS`)와 수명(`LIFE`)
- `db/schema.sql` — Supabase 테이블 정의
- `node_modules/next/dist/docs/` — 설치된 Next.js 16 공식 문서 (`01-app`, `02-pages`, `03-architecture`, `04-community`)

## 꼭 지킬 규칙
- Next.js 16 API 를 쓰기 전에 `node_modules/next/dist/docs/` 를 먼저 확인한다 — 이 버전은 학습 데이터와 다르다 (`package.json` 의 `next` 16.4.6, `react` 19.3.0).
- 읽기 함수는 `"use cache"` + `cacheTag(TAGS.x)` + `cacheLife(LIFE.x)` 를 쓰고, 쓰기 서버 액션은 `updateTag(TAGS.x)` 로 비운다 — 쓴 사람이 다음 화면에서 바로 결과를 보게 하려는 것이다 (`src/lib/cache.ts`).
- Supabase service role 키와 `db()` 는 서버 코드에서만 쓰고 `NEXT_PUBLIC_` 을 붙이지 않는다 — RLS 를 우회하는 키라서 (`src/lib/db.ts`, `.env.example`).
- 관리자 권한의 기준은 각 서버 액션의 `requireAdmin()` 이다. `proxy.ts` 의 IP 차단은 1차 방어다 (`src/proxy.ts` 주석).
- 실제 값이 든 `.env`, `.env.local` 은 커밋하지 않는다 (`.env.example` 주석).

## 기술 스택
| 영역 | 사용 |
|---|---|
| 프레임워크 | Next.js 16.4.6 (App Router), React 19.3.0, TypeScript 5 |
| 스타일 | Tailwind CSS 4, `@tailwindcss/typography`, `@tailwindcss/turbopack` |
| 데이터 | Supabase (`@supabase/supabase-js`) — posts · categories · comments (+ 방명록 `src/lib/guestbook.ts`) |
| 이미지 저장 | AWS S3 (`@aws-sdk/client-s3`), `/media/*` 로 중계 |
| 에디터 | TipTap 3 (starter-kit, image, table, placeholder) |
| 본문 렌더 | unified · remark(+gfm) · rehype(raw, pretty-code) · shiki |
| 기타 | gray-matter(frontmatter), simple-icons, cheerio · turndown (가져오기 스크립트용 devDependency) |

`next.config.ts` 설정
- `cacheComponents: true` — `"use cache"` 지시어(Cache Components) 사용
- `partialPrefetching: true`
- `experimental.agentUpgrade: "security"`
- `turbopack.rules["*.css"]` — `@tailwindcss/turbopack` 로더를 CSS 에 적용

`sharp` 는 `package.json` 에 직접 선언돼 있지 않은데 `scripts/` 가 import 한다. Next 의 하위 의존성으로 설치된 것을 쓰는 것으로 보인다 (추정).

## 폴더 구조
- `src/app/` — 라우트
  - `(site)/` — 공개 블로그 화면과 관리자 목록 화면 (공통 레이아웃 `layout.tsx`)
  - `(studio)/` — 전체 화면 글쓰기 에디터 (`admin/posts/new`, `admin/posts/[slug]/edit`). 자체 `studio.css`, `StudioTheme.tsx`
  - `intro/` — 첫 진입 인트로 화면 (`DotHands.tsx`, `StageLock.tsx`, `intro.css`)
  - `api/` — `auth/github/{login,callback}` (OAuth), `revalidate` (캐시 무효화)
  - `media/[...key]/` — S3 에 올린 `images/uploads/*` 이미지를 내려주는 라우트
  - `fonts/` — Pretendard 가변 폰트
  - `globals.css`, `icon.svg`, `favicon.ico`, `apple-icon.png`, `not-found.tsx`
- `src/components/` — 페이지 단위 컴포넌트 (`Header`, `BlogList`, `BlogSidebar`, `Comments`, `GuestbookForm`, `SiteFrame`, `PostAdminActions` 등)
  - `ui/common/` — 여러 화면이 쓰는 범용 부품 (`Button`, `Card`, `Chip`, `Pagination`, `Select`, `Spinner`, `ThemeToggle`, `ThumbImage`, `UserBar`, `BrandMark` 등)
  - `ui/post/` — 글 전용 부품 (`PostArticleBody`, `PostRow`, `PostToc`)
  - `ui/comment/` — 댓글 전용 부품 (`CommentForm`, `ReplyToggle`)
- `src/lib/` — 서버 로직·유틸. 데이터 접근(`db`, `posts`, `categories`, `comments`, `guestbook`), 인증(`auth`, `session`, `admin-ip`), 저장소(`s3`, `images`), 캐시(`cache`), 렌더(`highlight`, `toc`, `code-languages`, `format`), 인트로 판정(`intro-gate`), `site`, `clock`, `file-tree`, `post-covers.json`
- `src/proxy.ts` — Next.js 16 의 proxy (구 middleware)
- `content/` — 초기 글 원본. `posts/*.md`, `categories.json`, `comments/`. 런타임 원본은 Supabase 이고 이 폴더는 `migrate-to-supabase.mjs` 의 입력이다
- `db/schema.sql` — Supabase SQL Editor 에 붙여 넣는 스키마 (여러 번 실행해도 안전)
- `scripts/` — 운영 스크립트 (상세는 `docs/deploy/README.md`)
- `public/` — 정적 파일. `images/posts`, `images/post-covers`, `images/thumbs`

## 주요 라우트
| 주소 | 파일 |
|---|---|
| `/` | `src/app/(site)/page.tsx` (첫 진입·새로고침은 `/intro` 로 이동) |
| `/intro` | `src/app/intro/page.tsx` |
| `/posts/[slug]` | `src/app/(site)/posts/[slug]/page.tsx` |
| `/category/[...path]` | `src/app/(site)/category/[...path]/page.tsx` |
| `/about` | `src/app/(site)/about/page.tsx` |
| `/guestbook` | `src/app/(site)/guestbook/page.tsx` |
| `/admin` | `src/app/(site)/admin/page.tsx` |
| `/admin/login` | `src/app/(site)/admin/login/page.tsx` |
| `/admin/categories` | `src/app/(site)/admin/categories/page.tsx` |
| `/admin/posts/[slug]/preview` | `src/app/(site)/admin/posts/[slug]/preview/page.tsx` |
| `/admin/posts/new` | `src/app/(studio)/admin/posts/new/page.tsx` |
| `/admin/posts/[slug]/edit` | `src/app/(studio)/admin/posts/[slug]/edit/page.tsx` |
| `POST /admin/upload` | `src/app/(site)/admin/upload/route.ts` (관리자만, png/jpg/jpeg/gif/webp, 4MB 이하) |
| `GET /media/images/uploads/*` | `src/app/media/[...key]/route.ts` |
| `/api/auth/github/login`, `/callback` | `src/app/api/auth/github/*/route.ts` |
| `POST /api/revalidate` | `src/app/api/revalidate/route.ts` |

## npm 명령어
| 명령 | 동작 |
|---|---|
| `npm run dev` | `next dev` 개발 서버 (localhost 는 관리자 IP 가 자동 허용) |
| `npm run build` | `next build` |
| `npm run start` | `next start` |
| `npm run lint` | `eslint` (`eslint.config.mjs`) |
| `npm run admin:ip` | 현재 공인 IP 출력 (`scripts/admin-ip.mjs`) |
| `npm run icons` | 파비콘·애플 아이콘 생성 (`scripts/generate-icons.mjs`) |

## 환경 변수
`.env.example` 과 `src/` 의 `process.env` 사용처 기준.

| 변수 | 용도 | 필수 |
|---|---|---|
| `ADMIN_GITHUB_LOGIN` | 관리자로 허용할 GitHub 계정 (기본 `rukadeveloper`) | 선택 |
| `ADMIN_ALLOWED_IPS` | `/admin` 접근 허용 IP, 쉼표 구분·CIDR 가능. 배포 환경에서 비면 전부 차단 | 배포 시 사실상 필수 |
| `SESSION_SECRET` | 로그인 쿠키 서명 (없으면 `ADMIN_SECRET` 을 대신 읽음, `src/lib/session.ts`) | 필수 |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | GitHub OAuth (댓글 로그인) | 로그인 사용 시 |
| `GITHUB_OAUTH_APPS` | 호스트별 OAuth 키 JSON (`{"호스트":{"id","secret"}}`). `.env.example` 에는 없고 `session.ts` 에서 읽는다 | 선택 |
| `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase 연결 | 필수 |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET` | 이미지 S3 | 업로드·`/media` 사용 시 |
| `REVALIDATE_SECRET` | `/api/revalidate` Bearer 토큰. 없으면 503 으로 비활성 | 선택 |
| `REVALIDATE_URL`, `TISTORY_SESSION` | 스크립트 전용 (`.env.example` 에 없음) | 해당 스크립트 실행 시 |

## 테스트와 언어
- 테스트 스위트는 없다. 테스트 러너 설정, `tests/` 폴더, `*.test.*` 파일이 없고 `package.json` 에 test 스크립트도 없다. 검증은 `npm run lint` 와 `npm run build` 로 한다.
- 코드 주석과 화면 문구는 한국어다. `<html lang="ko">`.

## 바꿀 때 함께 고칠 것
- 환경 변수를 추가하면 `.env.example`, Vercel 환경 변수, `docs/deploy/README.md` 를 함께 고친다.
- 라우트를 추가·이동하면 위 "주요 라우트" 표를 고치고, 관리자 경로면 `src/proxy.ts` 의 `matcher` 도 확인한다.
- 캐시 태그를 추가하면 `src/lib/cache.ts` 와 `src/app/api/revalidate/route.ts` 의 `revalidateTag` 목록을 함께 본다.
- DB 컬럼을 바꾸면 `db/schema.sql` 과 `scripts/migrate-to-supabase.mjs` 를 함께 고친다.
- 코드 주석이 규칙의 출처로 문서를 가리킬 때는 `docs/{주제} "절 이름"` 형식으로 쓴다. 문서의 절 이름을 바꾸면 그 이름을 인용한 주석도 함께 고친다 (`grep -rn 'docs/{주제}' src scripts`).
