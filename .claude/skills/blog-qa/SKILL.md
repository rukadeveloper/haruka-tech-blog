---
name: blog-qa
description: haruka-tech-blog 의 변경을 실제로 실행해 확인한다 — npm run lint, npm run build(타입 · cacheComponents prerender 검사), 개발 서버를 띄워 바뀐 주소를 라이트/다크 · 375px/1280px 로 브라우저 확인, Server Action 의 캐시 무효화 확인. "빌드 되는지 봐줘", "화면 깨지는지 확인해줘", 기능 구현 뒤 QA 단계에서 쓴다. 코드 규칙 검토는 blog-conventions, 디자인 토큰 검사는 blog-design-check 를 쓴다.
---

# 블로그 QA 절차

테스트 스위트가 없으므로 **lint → build → 실제 화면** 세 단계가 전부입니다. 앞 단계가 실패하면 뒤 단계 결과는 믿을 수 없으니, 실패를 기록하고 멈춥니다 (화면 확인은 build 실패여도 dev 서버로 할 수 있으면 하되 "build 실패 상태"라고 적습니다).

## 1. 정적 검사

```bash
npm run lint
npm run build      # 타입 검사 포함. 1~3분
```

- build 실패에서 자주 보는 원인과 연결할 규칙:
  - `Uncached data was accessed outside of <Suspense>` / `cookies()`·`headers()`·`searchParams` 관련 → blog-conventions 2절 (Suspense)
  - `Date.now()` 관련 prerender 오류 → `nowMs()`
  - `server-only` import 오류 → 클라이언트 컴포넌트가 `@/lib/db` 를 끌어옴
- 출력은 오류 줄과 그 앞뒤 몇 줄을 그대로 옮깁니다. 요약해서 바꿔 쓰지 않습니다.
- `.env.local` 이 없거나 Supabase 에 닿지 않아 실패하면 코드 결함이 아니라 "환경 문제"로 따로 분류합니다. 비밀 값 파일 내용은 읽거나 출력하지 않습니다.

## 2. 개발 서버

```bash
npm run dev        # 백그라운드로 실행, http://localhost:3000
```

- 준비 확인은 `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/about` 가 200 을 돌려줄 때까지 기다립니다 (고정 sleep 대신 조건으로 기다림).
- **홈(`/`)은 브라우저로 처음 열면 `/intro` 로 보내집니다** (`Sec-Fetch-Dest: document`, `src/lib/intro-gate.ts`). 홈 목록을 보려면 `/intro` 에서 CTA 를 눌러 사이트 안 이동으로 들어가거나 `/about` 등에서 헤더 링크로 이동합니다. `curl` 은 이 헤더를 보내지 않아 홈 HTML 을 그대로 받습니다.
- 개발 모드에서는 localhost 가 관리자 허용 IP 로 자동 허용됩니다. 관리자 화면은 GitHub 로그인(`ADMIN_GITHUB_LOGIN`)이 필요하므로, 로그인할 수 없으면 `/admin` 이 로그인 화면으로 가는지만 확인하고 나머지는 "미확인"으로 적습니다.
- 끝나면 개발 서버 프로세스를 끕니다.

## 3. 화면 확인

`claude-in-chrome` 스킬을 먼저 읽고 브라우저 도구를 씁니다. 바뀐 파일에서 영향받는 주소를 고릅니다.

| 바뀐 곳 | 열어 볼 주소 |
|---|---|
| `BlogList` · `PostRow` · `BlogSidebar` | `/`(사이트 안 이동으로), `/category/FE`, `/?q=검색어`, `/?page=2` |
| 글 본문 · `.post-body` · `highlight` · `file-tree` | 코드 블록 · 파일 트리가 있는 글 `/posts/{slug}` |
| `SiteFrame` · 헤더 · 푸터 · `globals.css` | `/about`, `/guestbook`, 없는 주소(404) |
| `src/app/intro/` | `/intro` |
| `(studio)` 에디터 | `/admin/posts/new` (로그인 필요) |
| 관리자 화면 | `/admin`, `/admin/categories` (로그인 필요) |

각 주소마다 확인합니다.

1. 폭 375px 와 1280px (`resize_window`). lg(1024px) 경계를 바꿨으면 1023px · 1024px 도 봅니다.
2. 라이트와 다크 — 헤더의 테마 토글을 누르거나 `document.documentElement.dataset.theme = "dark"` 를 설정합니다.
3. 콘솔 오류(`read_console_messages`, 패턴 `Error|Warning|hydrat`)와 가로 스크롤이 없는지.
4. Server Action 을 바꿨다면: 실행 → 공개 화면에서 바뀐 값이 바로 보이는지 (안 보이면 `updateTag` 누락 의심).

브라우저 도구를 쓸 수 없으면 `curl` 로 상태 코드와 HTML 안의 핵심 문구만 확인하고, 화면 칸은 "미확인"으로 둡니다.

## 4. 보고

qa-runner 의 출력 형식(lint · build · 화면 표 · 실패 목록)으로 `_workspace/{run}/04_qa_report.md` 에 씁니다. 실패 항목에는 재현 단계 · 기대 · 실제 · 관련 파일 추정을 넣습니다.
