# 배포와 운영 스크립트
Vercel 로 배포하고, DB 를 화면 밖에서 바꾼 뒤에는 `/api/revalidate` 로 캐시를 비운다.

## 언제 읽나
- 커밋을 푸시하기 전에 배포가 필요한지 판단할 때
- 배포 환경 변수를 설정할 때
- `scripts/*.mjs` 로 글·썸네일·아이콘을 만들거나 데이터를 옮길 때
- Supabase 를 직접 고친 뒤 화면이 안 바뀔 때

## 관련 파일
- `vercel.json` — `ignoreCommand` 로 배포 건너뛰기 판정
- `.env.example` — 환경 변수 목록
- `scripts/*.mjs` — 운영 스크립트 7개
- `src/app/api/revalidate/route.ts` — 캐시 무효화 엔드포인트
- `src/lib/cache.ts` — `TAGS`, `LIFE` (캐시 태그와 수명)
- `db/schema.sql` — Supabase 스키마

## 꼭 지킬 규칙
- 화면에 영향이 없는 커밋(문서·설정 등)의 메시지에는 `[skip deploy]` 를 붙인다 — Vercel 이 마지막 커밋 메시지에 이 문자열이 있으면 빌드를 건너뛴다 (`vercel.json`).
- 배포 환경에서 `ADMIN_ALLOWED_IPS` 가 비어 있으면 관리자 화면이 전부 막힌다. `npm run admin:ip` 로 확인한 값을 넣는다 (`.env.example`, `scripts/admin-ip.mjs`).
- `SUPABASE_SERVICE_ROLE_KEY` 는 `NEXT_PUBLIC_` 을 붙이지 않고 커밋하지 않는다 — RLS 를 우회하는 비밀 키다 (`.env.example`).
- 스크립트는 프로젝트 루트에서 실행한다 — `process.cwd()` 와 상대 경로를 기준으로 파일을 읽고 쓴다 (`scripts/import-tistory.mjs`, `migrate-to-supabase.mjs`).
- DB 를 화면 밖에서 바꾸면 `/api/revalidate` 를 호출한다 — 안 하면 `LIFE.posts` 수명(revalidate 300초, expire 3600초)이 지나야 반영된다 (`src/lib/cache.ts`).

## Vercel 배포
- 설정 파일은 `vercel.json` 하나다.
  ```
  "ignoreCommand": "git log -1 --pretty=%B | grep -qF '[skip deploy]'"
  ```
- 마지막 커밋 메시지에 `[skip deploy]` 가 있으면 명령이 0 으로 끝나 Vercel 이 빌드를 건너뛴다 (Vercel 의 Ignored Build Step 동작).
- 빌드 명령은 따로 지정돼 있지 않다. 기본 `npm run build` 를 쓰는 것으로 본다 (추정).
- 업로드 본문은 Vercel 함수 한도(4.5MB) 때문에 4MB 로 제한한다 (`src/app/(site)/admin/upload/route.ts`).

## 배포 환경 변수
Vercel 프로젝트 설정에 넣는다. 각 변수의 설명은 `docs/architecture/README.md` 의 환경 변수 표를 본다.
- 필수: `SESSION_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- 관리자: `ADMIN_GITHUB_LOGIN`, `ADMIN_ALLOWED_IPS`
- 댓글 로그인: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (호스트별 키가 필요하면 `GITHUB_OAUTH_APPS`)
- 이미지: `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`
- 캐시 무효화: `REVALIDATE_SECRET` (선택)
- GitHub OAuth 콜백 URL 은 배포 도메인 기준으로 따로 등록해야 한다 (`.env.example` 은 로컬 `http://localhost:3000/api/auth/github/callback` 만 적는다).

## 스크립트
모두 프로젝트 루트에서 실행한다. `sharp` 를 쓰는 스크립트는 `sharp` 가 설치돼 있어야 한다.

| 스크립트 | 하는 일 | 실행 |
|---|---|---|
| `admin-ip.mjs` | ipify 로 현재 공인 IP 를 조회해 `ADMIN_ALLOWED_IPS=` 에 넣을 값을 출력한다. 조회에 실패하면 종료 코드 1 | `npm run admin:ip` |
| `generate-icons.mjs` | `src/app/icon.svg` 에서 `src/app/favicon.ico` (16·32·48px)와 `src/app/apple-icon.png` (180px)를 만든다. 바탕색은 SVG 첫 `<rect fill>` 에서 읽는다 | `npm run icons` |
| `generate-post-covers.mjs` | 스크립트 안 `catalog` 에 적힌 slug 의 표지 WebP (640x640)를 `public/images/post-covers/<slug>.webp` 로 만들고, 원래 thumbnail 값을 `src/lib/post-covers.json` 에 기록한다. Supabase 에서 posts 를 읽는다 | `node --env-file=.env.local scripts/generate-post-covers.mjs` |
| `generate-thumbnails.mjs` | 글마다 제목·카테고리가 든 1280x800 썸네일을 `public/images/thumbs/<slug>.webp` 로 만들고 DB `thumbnail` 을 갱신한다. Chrome 또는 Edge(코드에 Windows 설치 경로가 고정)를 헤드리스로 띄워 캡처한다. `REVALIDATE_URL` 과 `REVALIDATE_SECRET` 이 있으면 끝에 `/api/revalidate` 를 호출한다 | `node --env-file=.env scripts/generate-thumbnails.mjs [--dry] [--only=slug,slug]` (`--dry`: DB·캐시를 바꾸지 않음) |
| `import-tistory.mjs` | Tistory 블로그 전체 글을 `content/posts/*.md` 로, 이미지를 `public/images/posts/` 로 가져온다. 기본 주소 `https://eun-haa.tistory.com` | `node scripts/import-tistory.mjs [blogUrl]` |
| `import-tistory-drafts.mjs` | Tistory 임시저장 글을 `content/posts/draft-<번호>.md` (`draft: true`)로 가져온다. 로그인 쿠키 `TISTORY_SESSION` (TSSESSION 값)이 필요하다. 이미 가져온 글은 건너뛴다 | `node --env-file=.env scripts/import-tistory-drafts.mjs [blogUrl] [--force]` (`--force`: 덮어쓰기) |
| `migrate-to-supabase.mjs` | `content/` 의 글·카테고리·댓글을 Supabase 로 upsert 한다 (재실행 안전). 먼저 `db/schema.sql` 을 실행해 둔다. `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` 필요 | `node --env-file=.env scripts/migrate-to-supabase.mjs` |

참고
- `generate-post-covers.mjs` 의 안내 주석은 `.env.local`, 다른 Supabase 스크립트는 `.env` 를 쓴다. 주석대로 파일명을 맞춰 실행한다.
- 데이터를 Supabase 로 옮기는 경로는 `import-tistory` → `content/` → `migrate-to-supabase` 순이다 (스크립트 주석 기준).
- 스크립트로 DB 를 바꾼 뒤에는 아래 캐시 무효화를 한다.

## 캐시 무효화 (`/api/revalidate`)
관리자 화면 밖(스크립트, Supabase 대시보드)에서 글·카테고리·썸네일·방명록을 바꿨을 때 쓴다.

```
curl -X POST -H "Authorization: Bearer <REVALIDATE_SECRET 값>" https://내도메인/api/revalidate
```
- 성공하면 `{ "revalidated": true, "at": "..." }` 를 돌려준다.
- 서버에 `REVALIDATE_SECRET` 이 없으면 503 `disabled`, 토큰이 다르면 401 `unauthorized` 다 (상수 시간 비교).
- `posts` 와 `guestbook` 태그를 `revalidateTag(tag, "max")` 로 무효화한다. 옛 캐시를 바로 지우지 않고 다음 요청 때 새로 만드는 방식(stale-while-revalidate)이라 호출 직후 첫 요청은 옛 내용일 수 있다 (route.ts 주석).
- 댓글 태그(`comments:<slug>`)는 이 엔드포인트가 비우지 않는다. 댓글은 수명이 짧아(`LIFE.comments`: revalidate 60초, expire 600초) 시간이 지나면 갱신된다.
- `generate-thumbnails.mjs` 는 환경에 `REVALIDATE_URL=https://내도메인` 과 `REVALIDATE_SECRET` 이 있으면 자동으로 호출한다.

## 바꿀 때 함께 고칠 것
- 스크립트를 추가·변경하면 위 "스크립트" 표를 함께 고친다.
- 새 캐시 태그를 만들면 `src/app/api/revalidate/route.ts` 에 추가할지 정하고 이 문서의 무효화 절을 고친다.
- 환경 변수를 추가하면 `.env.example`, Vercel 설정, 이 문서의 "배포 환경 변수" 를 함께 고친다.
- `vercel.json` 의 `ignoreCommand` 를 바꾸면 "꼭 지킬 규칙" 의 `[skip deploy]` 설명을 고친다.
