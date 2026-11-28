# 개발 테크 블로그

개발 및 기술 관련 공부 사항을 업로드하거나, 나의 생각 등을 적는 블로그

이 파일은 **프로젝트 셋팅과 규칙**입니다. 주제별 상세 컨텍스트는 아래에서 불러오는 `AGENTS.md` 목차를 따라 `docs/*` · `DESIGN.md` · `.claude/rules/*` 에서 필요한 것만 읽습니다.

@AGENTS.md

# 프로젝트 셋팅

## 스택

- 기술 스택 : Next.js 16 (App Router, `cacheComponents`) + Typescript + TailwindCSS v4
- DB : Supabase (기존 프로젝트) · 이미지 : 비공개 S3 버킷
- 에디터 : Tiptap · 코드 하이라이트 : shiki (rehype-pretty-code)
- 배포 : Vercel (`main` 푸시 → 배포)

## 구조

- src/components/ui : 재사용할 컴포넌트들을 도메인 별로 관리합니다.

- src/components: 주로 한번만 사용되는 컴포넌트 UI 조각들을 위치시킵니다.

- src/lib : S3 업로드, 카테고리 관리 등 공통으로 사용할 로직들을 관리합니다.

- src/app/(site) : 헤더와 푸터가 붙는 블로그 화면(홈, 글, 카테고리, About, 방명록, 관리자)입니다. 라우트 그룹이라 주소에는 나타나지 않습니다.

- src/app/intro : 인트로 페이지(`/intro`)입니다. 헤더와 푸터가 붙지 않도록 `(site)` 밖에 둡니다.

- src/app/(studio) : 헤더 · 푸터 · 관리자 메뉴 없이 화면 전체를 쓰는 관리자 도구(글 에디터 스튜디오)입니다. 라우트 그룹이라 주소는 `/admin/posts/new`, `/admin/posts/[slug]/edit` 그대로입니다.

- docs/ : 주제별 컨텍스트 문서 (목차는 `AGENTS.md`). DESIGN.md : 디자인 토큰. scripts/ : 아이콘 · 커버 생성, 티스토리 가져오기, Supabase 이전 스크립트.

## 명령어

- 개발 서버 : npm run dev

- 빌드 : npm run build (타입 검사 포함. 테스트 스위트는 없습니다)

- 린트 : npm run lint

- 내 공인 IP 확인 (관리자 허용 목록용) : npm run admin:ip

- 로고에서 파비콘 · 애플 아이콘 다시 만들기 : npm run icons (`src/app/icon.svg` 를 고친 뒤 실행. 모양 규칙은 DESIGN.md "로고")

- 디자인 규칙 위반 후보 찾기 : `node .claude/skills/blog-design-check/scripts/scan-design.mjs` (바뀐 파일만, `--all` 이면 전체)

- 새 브랜치 생성 & 커밋 & PR : `/push-commit` (`.claude/commands/push-commit.md`)

## 환경 변수

- 목록은 `.env.example`, 실제 값은 `.env.local` (git 에 올리지 않음).
- 관리자 접근 : `ADMIN_ALLOWED_IPS` (쉼표 구분, CIDR 가능), `ADMIN_GITHUB_LOGIN`. 캐시 비우기 : `REVALIDATE_SECRET`.

# 규칙

## 전체 규칙

- 먼저 계획 모드로 확인 후 최종 CLAUDE.md 파일을 구성 후 수정합니다.

- 기능 하나가 끝날 때 마다 커밋합니다. (PR 범위는 자유롭게 조정해도 좋습니다)

- Server Actions으로 DB와 소통하며, 백엔드는 따로 구축하지 않습니다.

- 캐싱 전략은 cacheTag와 cacheLife를 적극 이용하여, 생명주기가 있는 캐싱 전략을 사용합니다. 필요할 경우, 캐시 무효화를 해도 좋습니다.

- 글 수정에서 파일 트리 디자인과, 코드 디자인은 반드시 추가하세요.

- 관리자 페이지의 경우, 등록한 IP 주소에서만 보이게 합니다. (DX적으로도 구성해주세요.)

- DB는 기존 Supabase를 사용하여 가져옵니다.

- 코드 주석과 화면 문구는 한국어로 씁니다.

- 코드를 바꾸는 작업은 `blog-dev` 하네스로 진행합니다 (아래 "하네스: 블로그 개발", 절차는 `docs/workflow.md`).

- 규칙이 바뀌면 해당 컨텍스트 문서(`docs/*` · DESIGN.md · `.claude/rules/*`)를 먼저 고쳐 `[skip deploy]` 로 커밋한 뒤 구현합니다. 새 주제는 `docs/{도메인 혹은 특징명}.md` 로 만들고 `AGENTS.md` 목차에 추가합니다.

## 디자인 원칙

- DESIGN.md 파일을 생성하여 디자인 토큰 파일을 만듭니다. (클래스 정의 형식으로 만듭니다.)

- 라이트와 다크모드를 모두 지원합니다.

- 글꼴은 Pretendard 를 사용합니다. (토스 프로덕트 산스는 외부에서 쓸 수 있는 배포본이 없어, 인상이 가장 가까운 오픈 라이선스 글꼴로 대체했습니다.)

- 모바일 퍼스트 디자인으로 구성합니다.

- 공개 화면과 관리자 화면 모두 평평한 면입니다 (채널톡 기술블로그처럼 흰 바탕 · 테두리 없는 카드 · 옅은 구분선). 면과 움직임은 DESIGN.md 의 토큰(`--ease-out`, `--dur*`, `--press*`, `--glass*`)과 클래스(`.glass`, `.glass-thick`, `.glass-tint`)로만 씁니다. `--glass*` 는 예전 유리 디자인의 이름을 남긴 것으로 지금은 불투명한 값입니다. 움직임 줄이기 · 대비 높이기 설정은 그 토큰 값을 바꿔 처리하므로, 값을 직접 쓰면 설정이 무시됩니다.

- 인트로 페이지(`/intro`)와 글 에디터(`(studio)`)만 위 원칙의 예외입니다.
  - 인트로: 따뜻한 흰 바탕(#f7f7f5) 하나에 자체 색 · 글꼴 · 움직임 값을 쓰며, 그 값은 `.claude/rules/intro-page.md` 에 고정해 두었습니다.
  - 글 에디터: "벤토 블록 에디터" — 자체 토큰(바탕 #E9E9E4 · 포인트 #FF8A4C) · 글꼴(IBM Plex Sans KR · Space Grotesk · JetBrains Mono)을 쓰고, 라이트 · 다크를 모두 지원합니다. 값은 `.claude/rules/editor-bento.md` 에 고정해 두었습니다.

## 꼭 지킬 아키텍처 규칙

어기면 build 가 깨지거나 보안 · 캐시 문제가 생기는 것만 모았습니다. 이유와 상세는 괄호 안 문서에 있습니다.

- `params` · `searchParams` · 쿠키 · 헤더를 읽는 컴포넌트는 `<Suspense>` 안에 둡니다. 페이지는 동기 default export 가 비동기 내부 컴포넌트를 감쌉니다. prerender 코드에서는 `Date.now()` 대신 `nowMs()` (`docs/caching.md`)
- 공개 화면 읽기 함수는 `"use cache"` + `cacheTag` + `cacheLife` (값은 `src/lib/cache.ts`), 관리자 화면은 캐시 없는 `load*`. 쓰기 액션은 영향받는 태그를 `updateTag` 로 바로 비웁니다 (`docs/caching.md`)
- DB 는 `src/lib/db.ts` 의 `db()` 로만 접근하며 서버 전용입니다. 클라이언트에서 import 되는 모듈은 서버 전용 모듈을 끌어오지 않습니다 (`docs/data.md`)
- 관리자 액션은 스스로 `await requireAdmin()` 을 부릅니다. `/admin` 이하는 `src/proxy.ts` 가 IP 로 거릅니다 (`docs/auth-admin.md`)
- `draft: true` 글은 공개 조회에서 뺍니다. 에디터 폼 필드 이름은 `savePost` 가 읽는 이름과 같게 둡니다 (`docs/post-format.md`)
- 홈(`/`) 링크는 `next/link` 로 씁니다. `html` 상태를 `:has()` 로 바꾸지 않습니다 — cacheComponents 가 떠난 화면 DOM 을 남깁니다 (`docs/intro.md`)
- Next.js 16 API 는 `node_modules/next/dist/docs/` 에서 확인한 뒤 씁니다 (`AGENTS.md` 맨 아래 블록)

# 하네스: 블로그 개발

**목표:** 기능 개발 · UI 개편 · 버그 수정을 규칙 문서 반영 → 구현 → 아키텍처 · 디자인 검토(적대적 검증) + QA → 수정 → 커밋까지 같은 절차(`docs/workflow.md`)로 진행합니다.

**호출 조건:** 이 블로그의 코드 변경(기능 추가, 화면 개편, 버그 수정)이나 그 후속 요청(다시 검토, QA 만 다시, 이어서, 검토 결과 반영)을 받으면 `blog-dev` 스킬을 사용합니다. 한 줄 문구 · 오타 수정이나 코드 설명 질문에는 직접 답해도 됩니다. 하네스 회고 · 피드백 반영 요청에는 `harness:evolve` 를 씁니다.

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
| --- | --- | --- | --- |
| 2026-11-29 | Harness v2로 처음 구성 | 전체 | - |
| 2026-11-29 | 하네스 절을 최상위로 올리고 "전체 규칙"에서 연결 | CLAUDE.md | 아키텍처 하위 절로 묻혀 있었음 |
| 2026-11-29 | 프로젝트 규칙을 AGENTS.md 로 옮기고 CLAUDE.md 는 `@AGENTS.md` + 하네스 연결만 남김 | CLAUDE.md · AGENTS.md · .gitignore | CLAUDE.md 가 지워진 뒤 새로 구성 |
| 2026-11-29 | CLAUDE.md = 셋팅 · 규칙, AGENTS.md = 컨텍스트 목차, 상세는 `docs/{도메인}.md` 로 분리. DESIGN.md 복원 | CLAUDE.md · AGENTS.md · docs/ · 하네스 스킬 참조 | 필요한 컨텍스트만 골라 읽도록 |
