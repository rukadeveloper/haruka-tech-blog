# 문서 목차

주제마다 폴더 하나(`docs/{주제}/README.md`)를 둔다. 지금 작업에 해당하는 문서만 연다. 새 주제가 생기면 폴더를 만들고 아래 표에 한 줄 추가한다.

| 문서 | 내용 | 언제 |
|---|---|---|
| [architecture](architecture/README.md) | 기술 스택, 폴더 구조, 라우트 그룹, 주요 라우트, 명령어, 환경 변수 | 새 화면 · 라우트, 파일 위치를 정할 때 |
| [data](data/README.md) | Supabase 테이블, `db()`, lib 읽기 · 쓰기 함수, Server Action 검증 | DB 읽기 · 쓰기, 새 테이블 · 액션 |
| [caching](caching/README.md) | 캐시 태그 · 수명, `updateTag`, `/api/revalidate`, Suspense · `nowMs()` · `instant` | 읽기 함수, 액션, 동적 값을 읽는 페이지 |
| [auth-admin](auth-admin/README.md) | 관리자 = 허용 IP + GitHub 계정, `requireAdmin()`, 방문자 OAuth 세션, 권한 표 | 관리자 화면 · 액션, 로그인, 댓글 · 방명록 권한 |
| [posts](posts/README.md) | 글 형식(markdown · html), 렌더 파이프라인, 파일 트리 · 코드 하이라이트 · 콜아웃, 이미지 · 커버 | 글 본문 렌더링, 본문 스타일, 이미지 |
| [design](design/README.md) | 공개 · 관리자 화면 디자인 토큰 · 클래스 · 화면별 배치 · 로고 · 컴포넌트 | 공개 · 관리자 화면 UI |
| [editor](editor/README.md) | 벤토 블록 에디터(`(studio)`) 토큰 · 글꼴 · 레이아웃 · 폼 필드 · 발행 전 체크 | `src/app/(studio)/**` |
| [intro](intro/README.md) | 인트로 화면, 홈 → 인트로 진입 규칙, 고정 값, 화면 잠금 | `src/app/intro/**`, `src/proxy.ts`, 홈으로 가는 링크 |
| [deploy](deploy/README.md) | Vercel 배포, `[skip deploy]`, 배포 환경 변수, scripts/ | 커밋 메시지, 배포, 스크립트 실행 |

구현 · 검토 방법(하네스 스킬)은 `.claude/skills/` 에 있다: `blog-conventions`(코드 쓰는 방법 · 점검표), `blog-design-check`(디자인 점검), `blog-qa`(QA 절차), `blog-dev`(작업 흐름).
