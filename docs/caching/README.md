# 캐싱 (cacheComponents · use cache · 태그)
`next.config.ts` 의 `cacheComponents: true` 아래에서 공개 읽기는 `"use cache"` 로 태그 캐시하고, 쓰기 Server Action 이 `updateTag` 로 즉시 비운다.

## 언제 읽나
- 읽기 함수를 새로 만들거나 캐시 수명·태그를 바꿀 때
- 쓰기 액션을 추가하거나 화면 밖에서 DB 를 바꾼 뒤 캐시를 비워야 할 때
- 페이지에서 params / searchParams / cookies / headers 를 읽을 때, 또는 prerender 에러(blocking route, 불안정한 값)가 날 때

## 관련 파일
- `next.config.ts` — `cacheComponents: true`, `partialPrefetching: true`
- `src/lib/cache.ts` — `TAGS`, `LIFE`
- `src/lib/clock.ts` — `nowMs()`
- `src/lib/posts.ts`, `comments.ts`, `guestbook.ts` — `"use cache"` 읽기 함수
- `src/app/api/revalidate/route.ts` — 화면 밖 변경용 무효화 엔드포인트
- `src/app/(site)/page.tsx`, `posts/[slug]/page.tsx`, `category/[...path]/page.tsx` — Suspense 패턴, `generateStaticParams`
- `src/app/(site)/admin/layout.tsx` 외 관리자 페이지 — `export const instant = false`

## 꼭 지킬 규칙
- 태그와 수명은 `src/lib/cache.ts` 의 `TAGS` / `LIFE` 에서만 가져온다 — 문자열 리터럴이나 숫자를 직접 쓰면 읽기와 무효화의 태그가 어긋난다.
- 캐시되는 읽기 함수는 본문 맨 앞에 `"use cache"` 를 두고 `cacheTag(...)` 와 `cacheLife(LIFE.x)` 를 모두 호출한다 (`posts.ts`, `comments.ts`, `guestbook.ts`).
- `"use cache"` 함수 안에서 `cookies()` / `headers()` / `searchParams` 를 읽지 않는다 — 사용자별 값은 캐시 밖(컴포넌트)에서 읽는다. 이 코드베이스의 `get*` 은 모두 인자(slug)만 받는다.
- 쓰기 Server Action 은 성공 직후 `updateTag(TAGS.x)` 를 호출한다 — 글·카테고리는 `POSTS_TAG`, 댓글은 `TAGS.comments(slug)`, 방명록은 `TAGS.guestbook`. 새 쓰기 경로를 만들면 어느 태그를 비울지 정한다.
- `updateTag` 는 Server Action 에서만 호출한다. Route Handler 에서는 쓸 수 없으므로 `/api/revalidate` 는 `revalidateTag(tag, "max")` 를 쓴다 (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/updateTag.md`).
- 요청 데이터(`params`, `searchParams`, `cookies()`, `headers()`)를 읽는 컴포넌트는 `<Suspense>` 안에 둔다 — 밖에서 읽으면 블로킹 라우트 오류가 난다.
- 페이지의 default export 는 동기 함수로 두고, `await` 하는 일은 내부 async 컴포넌트로 옮겨 `<Suspense>` 로 감싼다. promise(`props.searchParams`)는 `await` 없이 그대로 내려 보낸다 (`(site)/page.tsx`).
- prerender 될 수 있는 코드에서 `Date.now()` / `new Date()` / `Math.random()` / `crypto.randomUUID()` 를 부르지 않는다 — 시각 비교가 필요하면 `nowMs()` 를 쓴다 (`session.ts` `getUser`). Server Action·Route Handler 의 `Date.now()` 는 요청 시점에 실행되므로 해당 없다 (추정, 기존 코드가 그렇게 쓴다).
- 요청마다 렌더링하는 관리자 페이지(`admin/layout.tsx`, `admin/page.tsx`, `admin/categories/page.tsx`, `admin/posts/[slug]/preview/page.tsx`, `(studio)` 의 `posts/new` · `posts/[slug]/edit`)에는 `export const instant = false` 를 둔다. 새 관리자 페이지도 같다.
- 동적 라우트의 `generateStaticParams` 는 `getAllPosts()` / `getCategories()` 에서 목록을 만든다 — 하드코딩하지 않는다.
- 공개 화면에서 `load*` / `read*` 를 직접 부르지 않는다 (`docs/data/README.md`).

## TAGS 와 LIFE (`src/lib/cache.ts`)
- `TAGS.posts = "posts"` — 글 목록·본문·카테고리 (`posts.ts` 가 `POSTS_TAG` 로 재노출).
- `TAGS.comments(slug) = "comments:{slug}"` — 글 하나의 댓글. 글별로 독립 무효화.
- `TAGS.guestbook = "guestbook"` — 방명록.

수명 값(초). `stale` 은 브라우저가 서버에 다시 묻지 않는 시간, `revalidate` 는 지난 뒤 첫 요청에 옛 내용을 주고 백그라운드에서 새로 만드는 시간, `expire` 는 지나면 새로 만들 때까지 기다리는 시간.

| 키 | stale | revalidate | expire | 이유 |
|---|---|---|---|---|
| `LIFE.posts` | 60 | 300 | 3600 | 관리자만 바꾸고 액션이 태그를 비운다 |
| `LIFE.comments` | 30 | 60 | 600 | 방문자가 쓰는 내용 |
| `LIFE.guestbook` | 30 | 60 | 600 | 방문자가 쓰는 내용 |

태그 무효화가 기본 경로이고, 수명은 화면 밖(스크립트, Supabase 대시보드)에서 DB 를 바꾼 경우의 안전망이다.

## 읽기 패턴
```ts
export async function getComments(slug: string): Promise<Comment[]> {
  "use cache";
  cacheTag(TAGS.comments(slug));
  cacheLife(LIFE.comments);
  return readComments(slug);
}
```
캐시 없는 `readComments` 를 안에서 호출하는 형태다. `getPost` 는 본문 렌더링(`renderHtml` / `renderMarkdown`)까지 캐시 안에서 한다.

## 쓰기 패턴
```ts
await insertComment(slug, comment);
updateTag(TAGS.comments(slug));   // 쓴 사람이 다음 화면에서 곧바로 결과를 본다
```
`updateTag` 는 태그를 즉시 만료시켜 다음 요청이 새 데이터를 기다리게 한다. 로그아웃 액션은 태그가 아니라 `revalidatePath` 로 해당 페이지를 갱신한다.

## 화면 밖 변경: `/api/revalidate`
`POST /api/revalidate` + `Authorization: Bearer <REVALIDATE_SECRET>`.
- `REVALIDATE_SECRET` 이 없으면 503(비활성), 값이 다르면 401. 비교는 `timingSafeEqual`.
- `revalidateTag(TAGS.posts, "max")` 와 `revalidateTag(TAGS.guestbook, "max")` 를 호출한다. `"max"` 는 즉시 지우지 않고 다음 요청 때 새로 만든다(stale-while-revalidate). 댓글 태그는 글별 동적 값이라 여기서 비우지 않는다.

## Suspense 패턴 (`(site)/page.tsx`)
```tsx
async function Content({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const { q, page } = await searchParams;
  return <BlogList q={first(q) ?? ""} page={Number(first(page)) || 1} />;
}
export default function Home(props: PageProps<"/">) {
  return <Suspense fallback={<BlogSkeleton />}><Content searchParams={props.searchParams} /></Suspense>;
}
```
`posts/[slug]/page.tsx` 도 같은 형태(`Article` 이 `params` 를 await)이고, 그 안의 `PostAdminActions`(관리자 확인)와 `Comments`(쿠키 읽기)는 각각 별도 `<Suspense fallback={null}>` 로 감싸 요청 데이터 읽기를 격리한다. 근거: 캐시되지 않는 읽기를 `<Suspense>` 로 감싸 fallback 을 prerender 셸에 싣는 것이 문서의 해법이다 (`node_modules/next/dist/docs/01-app/01-getting-started/` 의 캐싱 문서, `01-app/02-guides/migrating-to-cache-components.md`).

## 정적 경로와 instant
- `posts/[slug]/page.tsx`, `category/[...path]/page.tsx` 는 `generateStaticParams` 로 글·카테고리 목록을 미리 만든다. 목록에 없는 새 글이 요청 시 렌더되는지는 코드에 명시돼 있지 않다 (추정).
- `export const instant = false` — 즉시 이동(instant navigation) 검증에서 제외한다. 관리자 화면은 로그인 확인 때문에 요청마다 렌더링하기 때문이다 (`01-app/02-guides/instant-navigation.md`). 단, prerender 중 동기 IO(`Date.now()` 등)는 `instant = false` 로도 해결되지 않으므로 `nowMs()` 를 쓴다 (`migrating-to-cache-components.md`).
- `nowMs()` = `performance.timeOrigin + performance.now()` — `Date.now()` 와 같은 시각을 주지만 prerender 에서 막히지 않는다 (`clock.ts` 주석).
- `proxy.ts` 의 인트로 리다이렉트는 `Cache-Control: no-store` 를 붙인다 — 브라우저·CDN 이 기억하면 사이트 안 이동까지 인트로로 튕긴다.

## 바꿀 때 함께 고칠 것
- 새 캐시 읽기 함수: `TAGS`/`LIFE` 에 항목 추가, 이를 비우는 쓰기 액션의 `updateTag`, 필요하면 `/api/revalidate`.
- 태그 이름 변경: `cache.ts`, 모든 `updateTag` 호출부, `/api/revalidate`.
- 수명 변경: `LIFE` 한 곳, 그리고 이 문서의 표.
- 관리자 페이지 추가: `instant = false`, `requireAdmin()` (`docs/auth-admin/README.md`).
