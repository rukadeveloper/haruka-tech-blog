# haruka-tech-blog 컨텍스트 목차

개발 · 기술 공부와 생각을 올리는 블로그입니다 (Next.js 16 App Router + cacheComponents · Supabase · Tailwind v4 · Vercel).

이 파일은 **목차**입니다. 어떤 코딩 에이전트든 여기서 시작해, 지금 작업에 해당하는 항목의 문서만 열어 읽습니다. 내용은 각 문서에 있고, 이 파일에는 링크와 "언제 읽는지"만 둡니다. 새 주제가 생기면 `docs/{도메인 혹은 특징명}.md` 를 만들고 아래 표에 한 줄 추가합니다.

맨 아래 `nextjs-agent-rules` 블록은 `next dev` 가 관리합니다. 블록 안은 고치지 않습니다 (`next dev` 는 블록만 바꾸고 나머지는 그대로 둡니다).

## 0. 먼저 읽기

| 문서 | 내용 | 언제 |
|---|---|---|
| [CLAUDE.md](CLAUDE.md) | 프로젝트 셋팅(스택 · 구조 · 명령어 · 환경 변수) · 전체 규칙 · 디자인 원칙 · 꼭 지킬 아키텍처 규칙 | 항상 (Claude Code 는 자동으로 읽음) |
| [docs/workflow.md](docs/workflow.md) | 작업 절차: 계획 → 구현 → 검토 → QA → 수정 · 커밋, 역할 | 코드를 바꾸는 모든 작업 |

## 1. 화면 · 디자인

| 문서 | 내용 | 언제 |
|---|---|---|
| [DESIGN.md](DESIGN.md) | 디자인 토큰(색 · 움직임 · 면) · 컴포넌트 클래스 · 로고 · 타이포 · 화면별 배치 | 공개 · 관리자 화면 UI 를 바꿀 때 |
| [docs/layout.md](docs/layout.md) | 루트 레이아웃, `SiteFrame`, 라우트 그룹, `not-found` | 새 화면 추가, 헤더 · 푸터 · 레이아웃 변경 |
| [docs/home-category.md](docs/home-category.md) | 홈 · 카테고리 목록(LINE Engineering 배치), 사이드바, 검색 · 페이지네이션 | `BlogList` · `PostRow` · `BlogSidebar` · 홈 · 카테고리 |
| [docs/intro.md](docs/intro.md) | 인트로 화면, 홈 → 인트로 진입 규칙, `StageLock` | `/intro`, `proxy.ts`, 홈으로 가는 링크 |
| [.claude/rules/intro-page.md](.claude/rules/intro-page.md) | 인트로 고정 수치 · 글꼴 · 캔버스 계산 | `src/app/intro/` 를 고칠 때 |
| [.claude/rules/editor-bento.md](.claude/rules/editor-bento.md) | 벤토 블록 에디터 토큰 · 글꼴 · 배치 | `src/app/(studio)/` 를 고칠 때 |

## 2. 데이터 · 캐시 · 글

| 문서 | 내용 | 언제 |
|---|---|---|
| [docs/data.md](docs/data.md) | Supabase 테이블, `db()`, 읽기 함수 · Server Action 위치, 카테고리 경로 | DB 읽기 · 쓰기, 새 테이블 · 액션 |
| [docs/caching.md](docs/caching.md) | 캐시 태그 · 수명, `updateTag`, `/api/revalidate`, cacheComponents 제약(Suspense · `nowMs()`) | 읽기 함수 · 액션 · 동적 값을 읽는 페이지 |
| [docs/post-format.md](docs/post-format.md) | html/markdown 글, draft · featured, 에디터 구성 · 폼 필드, 콜아웃 · 파일 트리 · 코드 하이라이트, `.post-body` | 글 본문 렌더링, 에디터, 본문 스타일 |
| [docs/images.md](docs/images.md) | 에디터 업로드(S3 · `/media`), 정적 이미지 | 업로드 · 이미지 경로 |

## 3. 인증 · 배포

| 문서 | 내용 | 언제 |
|---|---|---|
| [docs/auth-admin.md](docs/auth-admin.md) | GitHub OAuth 쿠키, 관리자 = 허용 IP + 계정, `requireAdmin()`, 관리자 화면 그리드 | 관리자 화면 · 액션, 로그인, 댓글 작성자 |
| [docs/deploy.md](docs/deploy.md) | Vercel 배포, `[skip deploy]`, 환경 변수 | 커밋 메시지, 배포 · 환경 변수 |

## 4. 구현 · 검토 방법 (하네스 스킬)

| 문서 | 내용 | 언제 |
|---|---|---|
| [.claude/skills/blog-conventions/SKILL.md](.claude/skills/blog-conventions/SKILL.md) | 코드 쓰는 방법(페이지 형태 · 읽기 함수 · 액션 예시) | 구현할 때 |
| [.claude/skills/blog-conventions/references/review-checklist.md](.claude/skills/blog-conventions/references/review-checklist.md) | 아키텍처 점검표 A1–A15 | 검토할 때 |
| [.claude/skills/blog-design-check/SKILL.md](.claude/skills/blog-design-check/SKILL.md) | 디자인 규칙 검사 절차 · 자동 스캔 스크립트 | 화면 변경 검토 |
| [.claude/skills/blog-qa/SKILL.md](.claude/skills/blog-qa/SKILL.md) | lint · build · 브라우저 확인 절차 | QA |

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
