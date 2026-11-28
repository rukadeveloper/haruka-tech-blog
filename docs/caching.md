# 캐싱 · cacheComponents 제약

> 관련 파일: src/lib/cache.ts, src/lib/clock.ts, next.config.ts, src/app/api/revalidate/
> 목차: [AGENTS.md](../AGENTS.md)

- 캐시 태그와 수명은 `src/lib/cache.ts` 에 모아 둡니다.
- 공개 화면이 쓰는 읽기 함수(`getAllPosts`, `getPost`, `getCategories`, 댓글, 방명록)는 `"use cache"` + `cacheTag` + `cacheLife` 를 씁니다. 관리자 화면용 `load*` 함수는 캐시 없이 DB 를 직접 읽습니다.
- 쓰기 Server Action 은 해당 태그를 `updateTag` 로 바로 무효화합니다.
- 화면 밖(스크립트, Supabase 대시보드)에서 DB 를 바꿨을 때는 `POST /api/revalidate` (`REVALIDATE_SECRET`) 로 비우거나 수명이 끝나길 기다립니다.

## cacheComponents 제약 (`next.config.ts`)

- `params`, `searchParams`, 쿠키, 헤더를 읽는 컴포넌트는 `<Suspense>` 안에 있어야 합니다. 페이지는 동기 default export 가 비동기 내부 컴포넌트를 감싸는 형태를 따릅니다.
- prerender 중에는 `Date.now()` 가 막히므로 그런 코드에서는 `src/lib/clock.ts` 의 `nowMs()` 를 씁니다.
