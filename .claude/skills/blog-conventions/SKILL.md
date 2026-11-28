---
name: blog-conventions
description: haruka-tech-blog 에서 코드를 쓰는 방법 — 페이지 형태(Suspense 로 감싼 비동기 내부 컴포넌트), 공개용 캐시 읽기 함수와 관리자용 캐시 없는 읽기, Server Action 작성(권한 · 검증 · updateTag), 컴포넌트 위치, 서버 전용 모듈 경계. 이 블로그의 화면 · 액션 · lib 함수를 새로 쓰거나 고칠 때 사용한다 (blog-implementer 가 구현 전에 읽고, 검토자는 references/review-checklist.md 를 쓴다). 다른 프로젝트의 Next.js 일반 질문에는 쓰지 않는다.
---

# 블로그 코드 작성 규칙

이 블로그는 Next.js 16 App Router + `cacheComponents: true` 위에서 돈다. 이 설정에서는 요청 때마다 달라지는 값(params, searchParams, cookies, headers)을 읽는 순간 그 컴포넌트가 동적이 되고, `<Suspense>` 밖에서 읽으면 빌드가 실패한다. 아래 형태는 모두 이 제약에서 나온다.

주제별 상세와 이유는 `docs/{주제}/README.md` 에 있다. 지금 작업에 해당하는 것만 읽는다.

| 바꾸는 것 | 읽을 문서 |
|---|---|
| 새 화면, 라우트, 폴더 위치 | `docs/architecture` |
| DB 읽기 · 쓰기, 새 테이블 · 액션 | `docs/data` |
| 읽기 함수, 액션, 동적 값을 읽는 페이지 | `docs/caching` |
| 관리자 화면 · 액션, 로그인, 댓글 · 방명록 권한 | `docs/auth-admin` |
| 글 본문 렌더링, 코드 블록, 파일 트리, 이미지 | `docs/posts` |
| 공개 · 관리자 화면 UI | `docs/design` |
| 글 에디터 `src/app/(studio)/**` | `docs/editor` |
| 인트로 `src/app/intro/**`, `src/proxy.ts`, 홈 링크 | `docs/intro` |
| 배포, 환경 변수, scripts/ | `docs/deploy` |

## 1. 페이지 형태

동기 default export 가 `<Suspense>` 로 비동기 내부 컴포넌트를 감싼다. 동적 값은 내부 컴포넌트 안에서만 `await` 한다.

```tsx
async function Content({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const { q } = await searchParams;          // 동적 값은 Suspense 안에서
  return <BlogList q={typeof q === "string" ? q : ""} />;
}

export default function Home(props: PageProps<"/">) {
  return (
    <Suspense fallback={<BlogSkeleton />}>
      <Content searchParams={props.searchParams} />
    </Suspense>
  );
}
```

- `PageProps<"/경로">`, `LayoutProps<"/경로">` 는 Next 가 만드는 전역 타입이다. import 하지 않는다.
- 관리자 화면처럼 로그인 확인 · DB 조회로 매 요청 렌더링하는 페이지는 `export const instant = false;` 를 둔다 (`src/app/(site)/admin/page.tsx`).
- 레이아웃이 쿠키를 읽는 조각(예: 관리자 메뉴)을 가지면 그 조각도 따로 `<Suspense>` 로 감싼다.
- prerender 되는 코드(캐시 함수, 서버 컴포넌트)에서 현재 시각이 필요하면 `Date.now()` 대신 `nowMs()` (`src/lib/clock.ts`). Server Action · Route Handler 안에서는 `Date.now()` 를 써도 된다.

## 2. 읽기 함수

| 쓰는 곳 | 형태 | 예 |
|---|---|---|
| 공개 화면 | `"use cache"` + `cacheTag(TAGS.x)` + `cacheLife(LIFE.x)` | `getAllPosts`, `getComments(slug)`, `getGuestbook` |
| 관리자 화면 · 액션 내부 검증 | 캐시 없음, 이름은 `load*` / `read*` | `loadPostMetas`, `readComments` |

```ts
export async function getGuestbook() {
  "use cache";
  cacheTag(TAGS.guestbook);
  cacheLife(LIFE.guestbook);
  return readGuestbook();
}
```

- 태그와 수명은 `src/lib/cache.ts` 의 `TAGS` · `LIFE` 에서만 가져온다. 문자열을 새로 쓰지 않는다. 새 데이터 종류면 거기에 먼저 추가한다.
- 공개 읽기는 `draft: true` 글을 빼야 한다 (`getAllPosts` 가 거르고 `getPost` 가 던진다).
- DB 는 `src/lib/db.ts` 의 `db()` 와 `unwrap()` 으로만 접근한다. `db.ts` 는 `server-only` 라 클라이언트 번들에 들어가면 빌드가 깨진다.

## 3. Server Action

파일 맨 위 `"use server"`. 순서는 **권한 → 입력 검증 → 쓰기 → 태그 비우기 → 결과**.

```ts
export async function deleteSomething(formData: FormData) {
  await requireAdmin();                                   // 1. 권한 (관리자 액션은 반드시 스스로)
  const slug = String(formData.get("slug") ?? "").trim();
  if (!SLUG_RE.test(slug)) throw new Error("잘못된 슬러그입니다.");   // 2. 검증
  unwrap(await db().from("posts").delete().eq("slug", slug));     // 3. 쓰기
  updateTag(TAGS.posts);                                  // 4. 영향받는 태그 모두
  redirect("/admin");                                     // 5. 결과
}
```

- `src/proxy.ts` 가 `/admin` 이하를 IP 로 막지만, 권한의 기준은 액션 안의 `requireAdmin()` (관리자) 또는 `getUser()` (방문자) 다. 프록시에 기대지 않는다. Route Handler 도 같다 (`isAdmin()` 확인 후 401).
- 폼에서 쓰는 액션(`useActionState`)은 사용자에게 보여 줄 실패를 `{ error: "..." }` 로 돌려주고, 예상 못 한 오류는 `console.error` 후 일반 문구로 돌려준다 (`savePost`, `addComment`).
- 쓰기 후에는 화면에 영향을 주는 **모든** 태그를 `updateTag` 로 비운다. 글 · 카테고리 → `TAGS.posts`, 댓글 → `TAGS.comments(slug)`, 방명록 → `TAGS.guestbook`.
- 에디터 폼 필드 이름은 `savePost` 가 `formData.get(...)` 으로 읽는 이름과 같아야 한다 (`docs/editor` "폼 필드"). 한쪽만 바꾸면 값이 조용히 빈 문자열이 된다.

## 4. 컴포넌트 위치와 클라이언트 경계

- `src/components/ui/{common,post,comment}/` — 여러 곳에서 다시 쓰는 조각. `src/components/` — 한 번 쓰는 화면 조각. 화면 전용 클라이언트 조각은 그 라우트 폴더 옆에 둔다 (`src/app/(site)/admin/AdminPostTable.tsx`).
- `"use client"` 파일은 `lib/db`, `lib/posts`, `lib/auth`, `lib/session`, `lib/s3` 를 import 하지 않는다 (서버 전용 · 비밀 값). 클라이언트에 필요한 값은 서버 컴포넌트가 props 로 넘기거나, 순수 함수만 있는 모듈(`lib/format.ts`, `lib/categories.ts` 의 순수 함수처럼)로 분리한다.
- 홈(`/`)으로 가는 링크는 `next/link` 를 쓴다. `<a href="/">` 는 문서를 새로 받아 프록시가 인트로로 보낸다 (`docs/intro` "진입 규칙").
- `html` 의 상태를 CSS `:has()` 로 바꾸지 않는다. cacheComponents 는 떠난 화면 DOM 을 숨긴 채 남기므로 다른 화면까지 영향을 받는다. 필요하면 `useEffect` 에서 속성을 붙였다 떼는 방식(`StageLock`, `StudioTheme`)을 쓴다.

## 5. 화면 디자인

공개 · 관리자 화면의 색 · 움직임 · 면은 `src/app/globals.css` 의 토큰과 클래스로만 쓴다 (`docs/design`). 인트로와 글 에디터는 자체 값을 쓰는 예외다. 상세 점검은 `blog-design-check` 스킬.

## 6. 그 밖

- 코드 주석과 화면 문구는 한국어.
- Next.js API 는 `node_modules/next/dist/docs/` 에서 확인한 뒤 쓴다. 미들웨어 파일은 `src/proxy.ts` (함수 이름 `proxy`) 이다.
- 테스트 스위트는 없다. 확인은 `npm run lint`, `npm run build`, 브라우저.
- 비밀 값 환경 변수에 `NEXT_PUBLIC_` 을 붙이지 않는다. 새 환경 변수는 `.env.example` 에 설명과 함께 추가한다.
