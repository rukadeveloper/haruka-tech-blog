# 작업 절차 (블로그 개발 하네스)

> 관련 파일: .claude/skills/blog-dev/SKILL.md (전체 절차), .claude/agents/ (역할), .claude/skills/blog-* (방법)
> 목차: [AGENTS.md](../AGENTS.md)

기능 개발 · UI 개편 · 버그 수정은 모두 같은 순서로 진행합니다. Claude Code 에서는 `blog-dev` 스킬이 이 순서를 에이전트로 자동 진행하고, 다른 도구에서는 같은 순서를 직접 따릅니다.

1. **계획** — 영향받는 파일과 규칙을 정리해 확인받습니다. 화면 배치 · 동작 규칙이 바뀌면 규칙 문서(CLAUDE.md, `docs/*`, DESIGN.md, `.claude/rules/*`)를 먼저 고쳐 `[skip deploy]` 로 커밋합니다.
2. **구현** — `.claude/skills/blog-conventions/SKILL.md` 의 구현 규칙을 따릅니다.
3. **검토** — 아키텍처는 `.claude/skills/blog-conventions/references/review-checklist.md`, 디자인은 `.claude/skills/blog-design-check/SKILL.md` 기준. 실패 시나리오를 댈 수 있는 지적만 남깁니다.
4. **QA** — `.claude/skills/blog-qa/SKILL.md`: lint → build → 바뀐 화면을 라이트/다크 · 375px/1280px 에서 확인.
5. **수정 · 커밋** — 확정된 심각한 지적과 QA 실패만 고치고(최대 2회), 기능 하나마다 한국어 한 줄 메시지로 커밋합니다. 문서 · 설정만 바뀌면 `[skip deploy]`.

| 역할 (`.claude/agents/`) | 맡는 일 |
|---|---|
| `blog-implementer` | 구현, 확정된 지적 수정 |
| `arch-reviewer` | 아키텍처 · 정확성 검토 (읽기 전용) |
| `design-reviewer` | 디자인 규칙 검토 (읽기 전용) |
| `finding-verifier` | 지적 한 건씩 반박 시도 (읽기 전용) |
| `qa-runner` | lint · build · 브라우저 확인 |

중간 산출물은 `_workspace/` 에 두며 git 에 올리지 않습니다.
