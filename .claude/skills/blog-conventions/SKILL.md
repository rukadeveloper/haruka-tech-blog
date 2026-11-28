---
name: blog-conventions
description: haruka-tech-blog 에서 코드를 쓰는 방법 — Next.js 16 cacheComponents 페이지 형태, "use cache" + cacheTag/cacheLife 읽기 함수, updateTag 로 무효화하는 Server Action, requireAdmin, server-only db(), 레이아웃 그룹((site) · intro · (studio)), 인트로 게이트, 글 형식(html/markdown). 이 저장소의 src/ 를 고치거나 새 화면 · 액션 · 읽기 함수를 만들 때 반드시 읽는다. 디자인 토큰 검사는 blog-design-check, 실행 확인은 blog-qa 를 쓴다.
---

# 블로그 구현 규칙

CLAUDE.md 의 "아키텍처" 절이 원본입니다. 이 스킬은 그 규칙을 **코드를 쓸 때 실제로 어떻게 하는지**로 옮긴 것입니다. 둘이 다르면 CLAUDE.md 를 따르고, 이 파일을 고쳐 맞춥니다.

## 0. 먼저 확인할 것

- **Next.js 는 16.x 이고 학습 데이터와 다릅니다.** `cacheComponents`, `updateTag`, `cacheLife`, `PageProps<"/route">`, `src/proxy.ts`(예전 middleware) 같은 API 는 `node_modules/next/dist/docs/` 에서 확인한 뒤 씁니다.
- 고칠 영역의 규칙 문서를 엽니다: 공개 · 관리자 화면 → `DESIGN.md`, `/intro` → `.claude/rules/intro-page.md`, 글 에디터 → `.claude/rules/editor-bento.md`.

## 1. 규칙 문서를 먼저 고친다 (스펙 우선)

이 저장소는 **화면 배치나 동작 규칙이 바뀌는 작업이면 CLAUDE.md · DESIGN.md · rules 를 먼저 고쳐 `[skip deploy]` 커밋**하고, 그다음 구현 커밋을 올립니다 (git log 참고). 문서가 코드보다 앞서야 검토자가 무엇을 기준으로 볼지 정해지기 때문입니다. 버그 수정처럼 규칙이 그대로인 작업은 문서를 건드리지 않습니다.

## 2. 페이지 형태 (cacheComponents)

`params`, `searchParams`, 쿠키, 헤더를 읽는 코드는 `<Suspense>` 안에 있어야 합니다. 그렇지 않으면 build 의 prerender 가 실패합니다.

```tsx
async function Content({ props }: { props: PageProps<"/category/[...path]"> }) {
  const { path } = await props.params;          // 동적 값은 안쪽 비동기 컴포넌트에서만 읽는다
  return <BlogList category={path.join("/")} page={1} />;
}

export default function CategoryPage(props: PageProps<"/category/[...path]">) {
  return (
    <Suspense fallback={<BlogSkeleton />}>    {/* 동기 default export 가 감싼다 */}
      <Content props={props} />
    </Suspense>
  );
}
```

- prerender 되는 코드에서 `Date.now()` 대신 `src/lib/clock.ts` 의 `nowMs()` 를 씁니다.
- 새 화면은 어느 그룹에 둘지 먼저 정합니다: 헤더 · 푸터가 붙는 블로그 화면은 `src/app/(site)/`, 전체 화면 관리자 도구는 `src/app/(studio)/`. 그룹 이름은 주소에 나타나지 않습니다.
- 홈(`/`)으로 가는 링크는 `next/link` 로 씁니다. `<a href="/">` 는 문서를 새로 받아 인트로로 되돌아갑니다.
- 화면 안 표식을 `:has()` 로 찾아 `html` 상태를 바꾸지 않습니다. cacheComponents 가 떠난 화면의 DOM 을 숨긴 채 남깁니다. `StageLock` · `StudioTheme` 처럼 마운트 동안만 `html` 에 data 속성을 붙입니다.

## 3. 읽기 함수 (캐시)

- DB 접근은 `src/lib/db.ts` 의 `db()` 하나로만 합니다. `server-only` 라 클라이언트 컴포넌트가 import 하면 build 가 실패합니다. 클라이언트에서도 쓰이는 모듈(예: `PostArticleBody`)은 서버 전용 모듈을 끌어오면 안 됩니다.
- **공개 화면용** 읽기 함수는 이렇게 씁니다. 태그 · 수명 값은 `src/lib/cache.ts` 의 `TAGS` · `LIFE` 에만 두고, 새 종류의 데이터면 거기에 먼저 추가합니다.

```ts
export async function getGuestbook() {
  "use cache";
  cacheTag(TAGS.guestbook);
  cacheLife(LIFE.guestbook);
  return unwrap(await db().from("guestbook").select("*"));
}
```

- **관리자 화면용**은 `load*` 이름으로, 캐시 없이 DB 를 직접 읽습니다 (방금 저장한 값이 바로 보여야 하므로).
- `draft: true` 글은 공개 조회 결과에서 빠져야 합니다. 새 공개 조회를 만들면 이 조건을 넣습니다.

## 4. 쓰기 (Server Actions)

- 쓰기는 Server Action 으로만 합니다 (별도 백엔드 없음). 위치: 관리자 `src/app/(site)/admin/actions.ts`, 댓글 `src/app/(site)/posts/[slug]/comment-actions.ts`, 방명록 `src/app/(site)/guestbook/actions.ts`.
- 관리자 액션은 **첫 줄에서 `await requireAdmin()`** 을 부릅니다. proxy 가 `/admin` 화면을 막아도 액션은 어디서든 POST 로 불릴 수 있기 때문입니다.
- 쓴 뒤에는 영향을 받는 태그를 `updateTag(TAGS.x)` 로 바로 비웁니다. 글을 바꾸면 `TAGS.posts`, 댓글은 `TAGS.comments(slug)`. 빠뜨리면 공개 화면이 최대 `LIFE` 의 수명만큼 옛 내용을 보여 줍니다.
- 에디터 폼 필드 이름은 `savePost` 가 읽는 이름(`title`, `category`, `slug`, `date`, `description`, `tags`, `thumbnail`, `featured`, `content`, `intent`, `originalSlug`)과 같아야 합니다. 입력칸의 Enter 는 제출하지 않습니다.
- 사용자에게 보여 줄 오류는 한국어 문장으로 반환합니다.

## 5. 글 본문

- `format: "html"` → `renderHtml`, `"markdown"` → `renderMarkdown`. 에디터로 저장하면 항상 html.
- 본문 스타일은 `.post-body` 하나를 공개 글 · 관리자 미리보기 · 에디터가 함께 씁니다. 한 곳만 바꾸려고 별도 클래스를 만들지 않습니다.
- 특수 블록: 파일 트리 `<div data-file-tree>` (`src/lib/file-tree.ts`), 콜아웃 `<div data-callout="…">` (`extensions/Callout.ts`), 코드 하이라이트 `src/lib/highlight.ts` · 언어 목록 `src/lib/code-languages.ts`.

## 6. 그 밖

- 코드 주석 · 화면 문구 · 커밋 메시지는 한국어입니다. 커밋은 기능 하나마다, 이 저장소의 기존 메시지처럼 한국어 한 줄로 씁니다. 문서 · 설정만 바뀌면 `[skip deploy]`.
- 재사용 컴포넌트는 `src/components/ui/{도메인}/`, 한 번만 쓰는 조각은 `src/components/`, 공통 로직은 `src/lib/`.
- 화면 밖(스크립트)에서 DB 를 바꾸면 `POST /api/revalidate` 로 비웁니다.

검토자는 같은 규칙을 `references/review-checklist.md` 의 점검 항목으로 봅니다.
