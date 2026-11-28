# 아키텍처 점검표 (A 항목)

code-reviewer 와 finding-verifier 가 쓰는 기준이다. 지적에는 항목 번호(`rule`)를 단다. 각 항목의 "확인 방법" 으로 실제 위반인지 가린다.

| # | 규칙 | 어기면 | 확인 방법 |
|---|---|---|---|
| A1 | params · searchParams · cookies() · headers() 를 읽는 컴포넌트는 `<Suspense>` 안에 있다. 페이지 default export 는 동기 함수다 | `next build` 실패 (Uncached data accessed outside Suspense) | 바뀐 page/layout 에서 `await params`, `await searchParams`, `getUser()`, `isAdmin()`, `headers()` 를 찾고 위로 Suspense 경계를 따라간다 |
| A2 | 공개 화면 읽기 함수는 `"use cache"` + `cacheTag(TAGS.*)` + `cacheLife(LIFE.*)`. 태그 · 수명은 `src/lib/cache.ts` 에서만 | 매 요청 DB 조회, 또는 무효화되지 않는 캐시 | 새 `get*` 함수의 첫 줄들. 문자열 태그 리터럴 grep |
| A3 | 쓰기(Server Action · Route Handler)는 영향받는 모든 태그를 `updateTag` 로 비운다 | 쓴 사람이 다음 화면에서 옛 내용을 본다 | 쓰는 테이블 → 그 테이블을 읽는 `get*` 의 태그 목록과 대조 |
| A4 | 관리자 액션 · 관리자 Route Handler · 관리자 페이지는 스스로 `requireAdmin()` / `isAdmin()` 을 부른다 | 프록시만 믿으면 다른 경로로 들어온 POST 에 권한 우회 | `src/app/(site)/admin/**`, `src/app/(studio)/**` 의 export async function 마다 첫 줄 |
| A5 | 방문자 쓰기(댓글 · 방명록)는 `getUser()` 로 로그인 확인, 삭제는 본인 또는 관리자만 | 남의 글 삭제 | `authorId === user.id` 또는 `isAdmin()` 비교 |
| A6 | `"use client"` 파일과 그 import 체인에 `lib/db`, `lib/posts`, `lib/auth`, `lib/session`, `lib/s3` 가 없다 | 빌드 실패(server-only) 또는 비밀 값 노출 | 바뀐 client 파일의 import 를 따라간다 |
| A7 | 공개 조회에서 `draft: true` 글이 빠진다 | 임시저장 글 공개 | 새 공개 읽기 경로가 `getAllPosts` / `getPost` 를 거치는지 |
| A8 | 입력 검증: 슬러그 `SLUG_RE`, 본문 길이 제한, 카테고리는 존재하는 경로만, 업로드는 확장자 · 크기 제한 | 잘못된 데이터 저장, 경로 조작 | 새 액션의 `formData.get` 값이 DB 에 닿기 전 검사 |
| A9 | 에디터 폼 필드 이름 = `savePost` 가 읽는 이름 | 값이 조용히 비어 저장 | `name="..."` 와 `str(formData, "...")` 대조 (`docs/editor` "폼 필드") |
| A10 | prerender · 캐시 코드에서 `Date.now()` · `new Date()` 대신 `nowMs()`. 액션 · Route Handler 는 예외 | 빌드 실패 또는 캐시 값 고정 | 서버 컴포넌트 · `"use cache"` 함수 안의 시각 함수 |
| A11 | 홈(`/`) 링크는 `next/link`. `html` 상태를 CSS `:has()` 로 바꾸지 않는다 | 사이트 안 이동이 인트로로 튕김 / 다른 화면까지 스타일 오염 | `href="/"` 가 `<a` 에 있는지, CSS 의 `html:has(` |
| A12 | 사용자 입력이 HTML 로 렌더링되지 않는다. `dangerouslySetInnerHTML` 은 관리자가 쓴 본문을 `renderHtml`/`renderMarkdown` 거친 결과에만 | XSS | 새 `dangerouslySetInnerHTML` 의 값 출처 |
| A13 | 비밀 값에 `NEXT_PUBLIC_` 없음. 새 환경 변수는 `.env.example` 에 추가 | 키 노출, 배포 후 설정 누락 | `process.env.` grep |
| A14 | 실패 처리: 폼 액션은 `{ error }` 반환, 예상 못 한 오류는 `console.error` 후 일반 문구. Supabase 응답은 `unwrap()` | 화면이 오류 페이지로 깨지거나 오류가 조용히 묻힘 | `await db()` 결과를 `unwrap` 없이 쓰는지 |
| A15 | Next.js 16 API 를 맞게 쓴다 (`proxy.ts`, `updateTag`/`revalidateTag(tag, profile)`, 전역 `PageProps`) | 동작 안 하거나 빌드 실패 | 의심되면 `node_modules/next/dist/docs/` 에서 확인 |
| A16 | 관리자처럼 매 요청 렌더링하는 페이지는 `export const instant = false` | 빌드 시 instant 검증 실패 (추정) | 새 관리자 page.tsx |
| A17 | 코드 주석 · 화면 문구는 한국어 | 일관성 | nit 으로만 |

## 지적하지 않는 것

- 바뀌지 않은 코드의 문제 (변경과 연결될 때만 `pre_existing`).
- 이름 · 포맷 · 취향.
- 인트로(`src/app/intro/**`) · 에디터(`src/app/(studio)/**`)의 자체 색 · 글꼴 — 디자인 예외 영역이다.
