# 데이터 (Supabase · lib · Server Action)
별도 백엔드 없이 서버 코드(`src/lib/*`)가 Supabase 를 service role 키로 직접 읽고 쓰며, 쓰기는 모두 Server Action 이 맡는다.

## 언제 읽나
- 테이블 컬럼을 추가하거나 바꿀 때
- 글·카테고리·댓글·방명록의 읽기/쓰기 함수를 만들거나 고칠 때
- Server Action 의 검증 로직(슬러그, 길이, 작성 간격 등)을 건드릴 때

## 관련 파일
- `db/schema.sql` — 테이블 정의 (Supabase SQL Editor 에 붙여 넣어 실행, 여러 번 실행해도 안전)
- `src/lib/db.ts` — `db()` Supabase 클라이언트, `unwrap()` 오류 처리
- `src/lib/posts.ts` — 글 읽기, 마크다운/HTML 렌더링
- `src/lib/categories.ts` — 카테고리 읽기/저장, 경로 유틸
- `src/lib/comments.ts` — 댓글 읽기/쓰기, `SLUG_RE`
- `src/lib/guestbook.ts`, `src/lib/guestbook-config.ts` — 방명록 읽기/쓰기, 최대 길이
- `src/app/(site)/admin/actions.ts` — 글·카테고리 관리 액션
- `src/app/(site)/posts/[slug]/comment-actions.ts` — 댓글 액션
- `src/app/(site)/guestbook/actions.ts` — 방명록 액션

## 꼭 지킬 규칙
- DB 접근은 `db()` 로만 하고 서버 코드에서만 호출한다 — service role 키는 RLS 를 우회하므로 클라이언트에 들어가면 안 된다 (`src/lib/db.ts` 의 `import "server-only"`, 키에 `NEXT_PUBLIC_` 금지).
- 새 테이블은 `enable row level security` 를 켜고 정책은 만들지 않는다 — anon 키 접근을 전부 막고 service role 만 쓰는 구조다 (`db/schema.sql`).
- Supabase 응답은 `unwrap()` 으로 감싼다 — 오류를 던지지 않으면 실패가 조용히 빈 결과로 보인다 (`db.ts`). 예외인 `readGuestbook` 은 count 가 필요해 `error` 를 직접 검사해 던진다.
- 공개 화면용 읽기는 `get*`(캐시됨)만 쓴다. `load*`/`read*`(캐시 없음)는 관리자 화면과 액션 검증에서만 쓴다 — 공개 화면이 `load*` 를 부르면 요청마다 DB 를 친다 (`posts.ts`, `comments.ts`, `guestbook.ts`).
- 쓰기는 Server Action 안에서만 하고, 성공 뒤 반드시 해당 태그에 `updateTag` 를 호출한다 (`docs/caching/README.md`).
- 관리자 액션은 첫 줄에서 `await requireAdmin()` 을 호출한다 (`admin/actions.ts`, 예외는 `logout`).
- 슬러그는 `^[a-z0-9][a-z0-9_-]*$`(대소문자 무시)만 허용하고 DB 에 넣기 전에 검사한다 — `SLUG_RE` 가 `comments.ts` 와 `admin/actions.ts` 에 각각 정의돼 있으므로 바꿀 때 둘을 함께 바꾼다.
- 댓글은 2000자, 방명록은 500자(`GUESTBOOK_MAX_LEN`) 이내이고, `\r\n` 을 `\n` 으로 바꾼 뒤 `trim` 해서 비어 있으면 거부한다 (`comment-actions.ts`, `guestbook/actions.ts`).
- 작성 간격 제한을 유지한다 — 댓글 5초(해당 글에서 같은 작성자의 마지막 댓글 기준), 방명록 30초(작성자의 마지막 글 기준).
- 답글은 1단계만 허용한다 — 부모가 답글이면 그 부모의 `parentId` 에 붙인다 (`comment-actions.ts`).
- 댓글·방명록 삭제는 본인 글이거나 관리자일 때만 한다. 로그인도 관리자도 아니면 조용히 반환한다.
- 글 슬러그를 바꿀 때는 기존 행의 `slug` 를 먼저 `update` 한 뒤 `upsert` 한다 — `comments.post_slug` 의 `ON UPDATE CASCADE` 로 댓글이 따라온다 (`admin/actions.ts` `savePost`).
- 카테고리가 쓰이는 글이 있으면 삭제하지 않고, 이름을 바꾸면 글의 `category` 도 함께 갱신한다 (`deleteCategory`, `renameCategory`).

## 구조
별도 API 서버가 없다. 클라이언트는 `<form action={serverAction}>` 으로 서버 액션을 호출하고, 액션이 `src/lib/*` 함수를 거쳐 Supabase 를 쓴다. 읽기는 서버 컴포넌트가 `get*` 을 호출한다. 외부에서 호출되는 HTTP 경로는 `/api/auth/github/*`, `/api/revalidate`, `/admin/upload` 뿐이다.

## 테이블 (`db/schema.sql`)
- `posts` — `slug`(PK), `title`, `date`, `category`(경로 문자열), `description`, `tags text[]`, `thumbnail`, `format`('markdown' | 'html'), `draft`, `featured`, `body`, `extra jsonb`, `created_at`, `updated_at`. 인덱스 `posts_date_idx`.
- `categories` — `path`(PK, "FE" 또는 "FE/Next.js"), `position`(표시 순서).
- `comments` — `id uuid`, `post_slug`(FK → `posts.slug`, ON UPDATE CASCADE, ON DELETE CASCADE), `parent_id`(자기 참조 FK, ON DELETE CASCADE), `author_id`, `login`, `name`, `avatar`, `body`, `created_at`. 인덱스 `comments_post_idx`.
- `guestbook` — `id uuid`, `author_id`, `login`, `name`, `avatar`, `body`, `created_at`. 인덱스 `guestbook_created_idx`.
- 네 테이블 모두 RLS 를 켜고 정책이 없다. 정책이 없으면 anon 키로는 읽기·쓰기가 전부 막힌다.
- 작성자 정보(`login`, `name`, `avatar`)는 GitHub 세션의 `SessionUser` 값을 댓글·방명록 행에 복사해 저장한다.

## 의미 규칙
- 카테고리 경로: `"FE"`(대분류) 또는 `"FE/Next.js"`(소분류), 1단계 하위만. `categories.path` 와 `posts.category` 가 같은 형식이고 이름에 `/` 는 쓸 수 없다. 화면용 트리(`Category = {name, children}`)는 읽을 때 만든다.
- `saveCategories` 의 `position` — 대분류 `i*1000`, 소분류 `i*1000 + j + 1`. 트리 전체를 upsert 하고 빠진 경로는 지운다.
- 카테고리 필터: `inCategory(post, "FE")` 는 `FE` 와 `FE/*` 모두, `"FE/Next.js"` 는 정확히 일치하는 글만.
- `draft = true` — 공개 화면에서 숨기고 관리자에서만 보인다. `getAllPosts` 가 draft 를 걸러내고 `getPost` 는 draft 면 던진다. 에디터의 임시저장(`intent=draft`)이 켠다.
- `featured = true` — 홈의 "추천 아티클" 구획에 나온다. 에디터 발행 설정의 `featured=on` 으로 켠다.
- `format` — `html`(에디터로 저장한 글, `savePost` 는 항상 `html`) / `markdown`(가져온 글). 렌더 경로가 다르다 (`renderHtml` / `renderMarkdown`).
- 썸네일: DB 값이 `post-covers.json` 에 기록된 원본 값과 같을 때만 `/images/post-covers/{slug}.webp` 로 치환한다 (스튜디오에서 바꾼 값이 우선).

## lib 함수 목록
캐시되는 공개용 (`"use cache"` + `cacheTag` + `cacheLife`)
- `posts.ts` — `getAllPosts()`(draft 제외 메타), `getCategories()`, `getPost(slug)`(메타 + 렌더된 HTML)
- `comments.ts` — `getComments(slug)`
- `guestbook.ts` — `getGuestbook()`

캐시 없는 직접 읽기 (관리자 화면 · 액션 검증용)
- `posts.ts` — `loadPostSource(slug)`(없으면 오류), `loadPostMetas()`(draft 포함), `postExists(slug)`
- `categories.ts` — `loadCategories()`
- `comments.ts` — `readComments(slug)`(슬러그 형식이 틀리면 빈 배열)
- `guestbook.ts` — `readGuestbook()`(최신순 100건 + 총 개수), `latestEntryOf(authorId)`, `getEntry(id)` (이름은 `get` 이지만 캐시가 없다)

쓰기 (액션에서만)
- `categories.ts` `saveCategories`, `comments.ts` `insertComment` / `removeComment`, `guestbook.ts` `insertEntry` / `removeEntry`
- 글 쓰기(upsert, update, delete)는 lib 함수 없이 `admin/actions.ts` 가 `db()` 로 직접 한다.

## Server Action 검증 요약
`admin/actions.ts` (모두 `requireAdmin()`)
- `savePost` — 제목 필수. 슬러그가 비면 `originalSlug` 또는 `Date.now()` 문자열. 슬러그 정규식 검사, 슬러그가 바뀌면 `postExists` 로 중복 검사, 카테고리는 `flattenCategories` 에 있는 값만 허용(빈 값 허용). 발행하면 `/admin` 으로 이동, 임시저장은 에디터에 남는다.
- `deletePost` — 슬러그 정규식 검사 후 삭제. 댓글은 FK CASCADE 로 함께 삭제.
- `addCategory` — 이름에 `/` 금지, 중복 금지, 소분류는 부모가 있어야 한다.
- `deleteCategory` — 해당 경로(하위 포함)를 쓰는 글이 있으면 거부.
- `renameCategory` — 이름 변경 후 해당 카테고리를 쓰는 글의 `category` 도 갱신.
- `previewHtml` — 저장 없이 렌더링만 한다.

`comment-actions.ts`
- `addComment` — 로그인 필수 → 슬러그 정규식 + `postExists` → 본문 검증 → 답글 부모 존재 확인 → 5초 간격 → insert → `updateTag(TAGS.comments(slug))`.
- `deleteComment` — 본인 또는 관리자. 원댓글을 지우면 답글도 CASCADE 로 삭제.
- `githubLogout` — 세션 쿠키 삭제 후 `revalidatePath("/posts/{slug}")`.

`guestbook/actions.ts`
- `addEntry` — 로그인 필수 → 본문 검증 → 30초 간격 → insert → `updateTag(TAGS.guestbook)`.
- `deleteEntry` — 본인 또는 관리자. `guestbookLogout` 은 `revalidatePath("/guestbook")`.

## 바꿀 때 함께 고칠 것
- 컬럼 추가: `db/schema.sql`(`add column if not exists` 로 덧붙임), `posts.ts` 의 `META_COLUMNS` · `MetaRow` · `toMeta` · `PostMeta`, `savePost` 의 `row`, 에디터 폼.
- 슬러그 규칙 변경: `comments.ts` 와 `admin/actions.ts` 의 `SLUG_RE`.
- 길이·간격 제한 변경: 액션 상수와 입력 폼의 `maxLength`/안내 문구. 방명록 길이는 `guestbook-config.ts`.
- 쓰기 액션을 추가하면 `updateTag` 대상과 `/api/revalidate` 가 비우는 태그를 점검한다.
