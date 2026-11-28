@AGENTS.md

# Claude Code 설정

프로젝트 규칙 · 구조 · 아키텍처는 위에서 불러온 `AGENTS.md` 가 원본입니다. 이 파일에는 Claude Code 에서만 쓰는 연결만 둡니다. 프로젝트 규칙을 바꿀 때는 `AGENTS.md` 를 고칩니다.

- 영역별 규칙: `.claude/rules/intro-page.md` (`/intro`), `.claude/rules/editor-bento.md` (`(studio)`) — 해당 경로를 고칠 때 자동으로 읽힙니다.
- 새 브랜치 생성 & 커밋 & PR : `/push-commit` (`.claude/commands/push-commit.md`)

# 하네스: 블로그 개발

**목표:** 기능 개발 · UI 개편 · 버그 수정을 규칙 문서 반영 → 구현 → 아키텍처 · 디자인 검토(적대적 검증) + QA → 수정 → 커밋까지 같은 절차(`AGENTS.md` "작업 절차")로 진행합니다.

**호출 조건:** 이 블로그의 코드 변경(기능 추가, 화면 개편, 버그 수정)이나 그 후속 요청(다시 검토, QA 만 다시, 이어서, 검토 결과 반영)을 받으면 `blog-dev` 스킬을 사용합니다. 한 줄 문구 · 오타 수정이나 코드 설명 질문에는 직접 답해도 됩니다. 하네스 회고 · 피드백 반영 요청에는 `harness:evolve` 를 씁니다.

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
| --- | --- | --- | --- |
| 2026-11-29 | Harness v2로 처음 구성 | 전체 | - |
| 2026-11-29 | 하네스 절을 최상위로 올리고 "전체 규칙"에서 연결 | CLAUDE.md | 아키텍처 하위 절로 묻혀 있었음 |
| 2026-11-29 | 프로젝트 규칙을 AGENTS.md 로 옮기고 CLAUDE.md 는 `@AGENTS.md` + 하네스 연결만 남김. AGENTS.md 에 도구 공통 "작업 절차" 추가, git 추적 시작 | CLAUDE.md · AGENTS.md · .gitignore | CLAUDE.md 가 지워진 뒤 두 파일을 하네스에 맞춰 새로 구성 |
