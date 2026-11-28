---
name: blog-dev
description: haruka-tech-blog 의 기능 추가 · 화면 개편 · 버그 수정을 끝까지 진행하는 오케스트레이터 — 계획 확인 → (필요하면) docs 규칙 문서 먼저 수정 → blog-implementer 구현 → 코드 · 디자인 검토(지적마다 적대적 검증) + QA(lint · build · 브라우저) → 수정 → 기능 단위 커밋. "~ 기능 추가해줘", "~ 화면 바꿔줘", "~ 개편해줘", "~ 버그 고쳐줘" 같은 이 블로그의 코드 변경 요청에 사용한다. "다시 검토해줘", "QA 만 다시", "지난 작업 이어서", "검토 결과 반영해줘", "수정 사항 보완해줘" 같은 후속 요청에도 사용한다. 한 줄 문구 · 오타 수정, 코드 설명 질문, 문서만 고치는 요청에는 쓰지 않고 직접 처리한다. 하네스 자체의 회고 · 개선은 harness:evolve.
---

# 블로그 개발 오케스트레이터

메인 세션이 리더다. 계획 · 문서 수정 · 커밋 · 사용자 소통은 메인이 직접 하고, 구현 · 검토 · QA 는 에이전트에게 맡긴다.

| 에이전트 (`.claude/agents/`) | 맡는 일 | 모델 | 따르는 스킬 · 기준 |
|---|---|---|---|
| `blog-implementer` | 구현, 확정된 지적 수정 | opus | `blog-conventions` |
| `code-reviewer` | 아키텍처 · 정확성 · 보안 검토 (읽기 전용) | opus | `blog-conventions/references/review-checklist.md` + `docs/*` |
| `design-reviewer` | 디자인 규칙 검토 (읽기 전용) | sonnet | `blog-design-check` |
| `finding-verifier` | 지적 한 건씩 반박 시도 (읽기 전용) | opus | 점검표 + `docs/*` |
| `qa-runner` | lint · tsc · build · 화면 확인 | sonnet | `blog-qa` |

## 작업 폴더

중간 산출물은 `_workspace/{run}/` 에 둔다 (`.gitignore` 에 있음). `{run}` = `YYYYMMDD-짧은-작업명` (예: `20261129-guestbook-paging`).

| 파일 | 쓰는 쪽 |
|---|---|
| `01_plan.md` | 메인 (1단계) |
| `02_implementer_report.md` (수정 차례는 `_r{N}`) | blog-implementer |
| `03_review_confirmed.json` (`_r{N}`) | 메인 (검토 결과 저장) |
| `04_qa_report.md` (`_r{N}`) | qa-runner |
| `05_summary.md` | 메인 (마지막 보고) |

## 0단계: 어디서 시작할지

1. `git status` 와 현재 브랜치를 본다. 이번 작업과 무관한 변경이 있으면 사용자에게 알리고 커밋에 섞지 않는다. `main` 이면 `feat/…` · `fix/…` 브랜치를 먼저 만든다.
2. `_workspace/` 를 본다.
   - 같은 작업 폴더가 있고 후속 요청("다시 검토", "QA 만 다시", "이어서", "반영해줘")이면 → 해당 단계부터. 마지막 `_r{N}` 파일을 읽어 어디까지 왔는지 확인한다. 검토 Workflow 의 직전 runId 가 있고 그 뒤로 파일이 바뀌지 않았으면 `resumeFromRunId` 로 재개한다.
   - 같은 작업인데 요구 사항이 바뀌었으면 → 기존 폴더를 `{run}-old` 로 옮기고 새로 시작하되 이전 `01_plan.md` 를 참고한다.
   - 그 밖에는 1단계부터.

## 1단계: 계획 (메인 직접)

**실행 모드:** 메인 세션

1. 영향받는 파일을 찾고, `blog-conventions` 의 표에서 해당 `docs/{주제}/README.md` 만 골라 읽는다.
2. `01_plan.md` 를 쓴다:

```markdown
# {작업명}
## 목표
## 바꿀 파일 (예상)
## 읽을 문서        — docs/{주제} 목록 (구현자가 이것만 읽는다)
## 문서 변경        — 없음 | docs/{주제} 의 어느 절을 어떻게
## 지켜야 할 규칙   — 구체적으로: 어떤 태그를 updateTag, 어느 컴포넌트를 Suspense, 어떤 토큰 …
## 완료 조건        — QA 가 확인할 주소 · 동작 · 화면 폭 · 테마
```

3. **계획을 사용자에게 보여 주고 확인받는다.** 묻는 것은 화면 배치 · 문구처럼 정답이 여러 개인 결정뿐이다. 저장소 규칙으로 정해지는 것(캐시 방식, 권한 확인)은 묻지 않는다.
4. 화면 배치 · 동작 규칙이 바뀌는 작업이면 해당 `docs/*` 를 먼저 고치고 `... 규칙을 docs/{주제} 에 반영 [skip deploy]` 형식으로 커밋한다. `[skip deploy]` 는 Vercel 배포를 건너뛴다 (`docs/deploy`). 버그 수정은 보통 건너뛴다.

## 2단계: 구현

**실행 모드:** 서브에이전트 위임 (이름을 붙여 실행 — 4단계에서 같은 맥락으로 다시 부른다)

```
Agent(subagent_type: "blog-implementer", name: "implementer",
      prompt: "_workspace/{run}/01_plan.md 를 구현하라. 보고는 _workspace/{run}/02_implementer_report.md")
```

보고가 "실패" 거나 "결정 필요" 가 있으면 3단계로 가지 말고 사용자와 정리한다.

## 3단계: 검토 + QA (동시에)

**실행 모드:** 검토는 워크플로 조율 또는 서브에이전트, QA 는 서브에이전트. 둘 다 소스를 고치지 않으므로 한 메시지에서 함께 시작한다.

### 3-1. 바뀐 파일과 검토 규모

`git diff --name-only main...HEAD` + `git diff --name-only` + 새 파일로 목록을 만든다.

- **가벼운 검토** — 바뀐 파일이 2개 이하이고 Server Action · `src/lib/` · `src/proxy.ts` · layout 을 건드리지 않았다: Workflow 없이 `code-reviewer` (화면 파일이 있으면 `design-reviewer` 도)를 서브에이전트로 한 번씩 부르고, 메인이 지적마다 해당 줄을 직접 확인해 확정한다.
- **기본 검토** — 그 밖: 아래 Workflow. 화면 파일(.tsx 중 컴포넌트 · page, .css)이 없으면 design 차원을 뺀다.

### 3-2. 검토 Workflow

사용자가 이 스킬을 불러 개발을 맡긴 것이 Workflow 실행 동의다. 규모는 검토자 2명 + 지적 수만큼의 검증자로 작게 유지한다.

`args` 로 `{ run, files, plan, dimensions }` 를 넘긴다. `plan` 은 `01_plan.md` 의 목표 · 지켜야 할 규칙 요약, `dimensions` 는 `["code"]` 또는 `["code","design"]`. 반환값을 `03_review_confirmed.json` 에 저장한다.

```javascript
export const meta = {
  name: 'blog-review',
  description: '블로그 변경을 코드 · 디자인 관점에서 검토하고 지적마다 반박을 시도해 확정된 것만 남긴다',
  phases: [
    { title: '검토', detail: '관점별 검토자가 바뀐 파일을 본다' },
    { title: '검증', detail: '지적 한 건마다 finding-verifier 가 반박을 시도한다' },
  ],
}

const FINDINGS = { type: 'object', required: ['findings'], properties: {
  findings: { type: 'array', items: { type: 'object',
    required: ['id', 'rule', 'file', 'title', 'evidence', 'fix', 'severity'],
    properties: {
      id: { type: 'string' }, rule: { type: 'string' }, file: { type: 'string' },
      line: { type: 'integer' }, title: { type: 'string' }, evidence: { type: 'string' },
      fix: { type: 'string' },
      severity: { type: 'string', enum: ['important', 'pre_existing', 'nit'] } } } } } }
const VERDICT = { type: 'object', required: ['status', 'reason'], properties: {
  status: { type: 'string', enum: ['confirmed', 'refuted', 'uncertain'] },
  reason: { type: 'string' } } }

const REVIEWERS = {
  code: { agentType: 'code-reviewer',
    focus: '.claude/skills/blog-conventions/references/review-checklist.md 의 A 항목과 관련 docs/{주제} 의 꼭 지킬 규칙, 실제 버그' },
  design: { agentType: 'design-reviewer',
    focus: 'blog-design-check 스킬의 절차와 D 규칙 (영역별로 다른 기준)' },
}
const files = args.files.join('\n')

const results = await pipeline(
  args.dimensions,
  dim => agent(
    `haruka-tech-blog 변경을 검토하라. 기준: ${REVIEWERS[dim].focus}.\n` +
    `작업 목표와 지켜야 할 규칙:\n${args.plan}\n바뀐 파일:\n${files}\n` +
    `바뀐 줄과 그 줄이 만드는 동작만 본다. 파일을 고치지 않는다.`,
    { label: `검토:${dim}`, phase: '검토', agentType: REVIEWERS[dim].agentType, schema: FINDINGS }),
  // 검토자가 실패(null)하면 null 을 넘겨 failedReviews 로 센다. 지적 0건이면 [] (성공)
  review => !review ? null : parallel(review.findings
    .filter(f => f.severity !== 'nit')
    .map(f => () => agent(
      `다음 지적을 반박하려고 시도하라. 해당 파일 · 줄과 인용한 규칙 원문을 직접 확인하라. ` +
      `반박에 실패하고 실제로 문제가 일어나는 경로를 재구성할 수 있을 때만 confirmed.\n${JSON.stringify(f)}`,
      { label: `검증:${f.id}`, phase: '검증', agentType: 'finding-verifier', schema: VERDICT })
      .then(v => (v ? { ...f, verdict: v } : null))))
)

const reviewed = results.filter(Boolean).flat().filter(Boolean)
const failedReviews = args.dimensions.length - results.filter(Boolean).length
const confirmed = reviewed.filter(f => f.verdict.status === 'confirmed')
const uncertain = reviewed.filter(f => f.verdict.status === 'uncertain')
log(`검증한 지적 ${reviewed.length}건 → 확정 ${confirmed.length} · 불확실 ${uncertain.length}` +
    (failedReviews ? ` · 실패한 검토 ${failedReviews}개` : ''))
return { confirmed, uncertain, refutedCount: reviewed.length - confirmed.length - uncertain.length, failedReviews }
```

- `nit` 는 검증하지 않고 버린다 (토큰 낭비 대비 가치가 낮다).
- `uncertain` 은 구현자에게 넘기지 않고 메인이 직접 해당 줄을 보고 판단한다. 판단이 어려우면 사용자 보고에 "확인 필요" 로 남긴다.
- `failedReviews` 가 1 이상이면 그 차원을 서브에이전트로 한 번 다시 돌린다.

### 3-3. QA

```
Agent(subagent_type: "qa-runner",
      prompt: "_workspace/{run}/01_plan.md 의 완료 조건을 blog-qa 절차로 확인하라. 바뀐 파일: … 보고는 _workspace/{run}/04_qa_report.md")
```

## 4단계: 수정 루프

**실행 모드:** 서브에이전트 (2단계의 `implementer` 에게 SendMessage 로 이어서 지시. 응답이 없으면 같은 유형을 새로 부르고 보고서 경로를 넘긴다)

1. 확정된 지적(`important`, 변경과 연결된 `pre_existing`)과 QA 실패를 모아 구현자에게 넘긴다: "`03_review_confirmed.json` 과 `04_qa_report.md` 의 항목을 고쳐라. 보고는 `02_implementer_report_r{N}.md`".
2. 고친 뒤 **바뀐 파일만** 다시 3단계를 돌린다 (파일 이름에 `_r{N}`).
3. 최대 2회 반복한다. 그래도 남은 문제는 사용자에게 그대로 보고하고 결정을 받는다. 같은 지적이 되풀이되면 구현자와 검토자 중 어느 쪽 판단이 맞는지 메인이 직접 확인한다.

## 5단계: 커밋과 보고 (메인 직접)

1. 기능 하나가 끝날 때마다 커밋한다. 메시지는 한국어 한 문장으로 무엇을 바꿨는지 쓴다. 코드가 바뀐 커밋에는 `[skip deploy]` 를 붙이지 않는다.
2. `_workspace/` · `.env*` 가 스테이징되지 않았는지 확인한다.
3. push · PR 은 사용자가 요청할 때만 한다.
4. `05_summary.md` 를 쓰고 사용자에게 보고한다: 바꾼 것, 확정 · 수정한 지적 수, QA 결과(미확인 항목은 미확인이라고), 남은 결정 사항.

## 데이터 전달

| 단계 → 단계 | 방법 |
|---|---|
| 계획 → 구현 · 검토 · QA | `01_plan.md` 파일 (검토 Workflow 에는 요약을 `args.plan` 으로) |
| 구현 → 메인 | `02_implementer_report*.md` + Agent 반환 메시지 |
| 검토 → 메인 | Workflow 반환값(구조화 JSON) → 메인이 `03_review_confirmed*.json` 으로 저장 |
| QA → 메인 | `04_qa_report*.md` |
| 메인 → 구현(수정) | SendMessage + 위 파일 경로 |

## 오류 처리

- 에이전트가 실패하면 한 번 다시 부른다. 또 실패하면 그 결과 없이 진행하고 `05_summary.md` 와 보고에 빠진 단계를 적는다.
- 사용량 한도 · 인증 만료 · 권한 거부는 다시 시도하지 않는다. `_workspace/` 의 부분 산출물을 열어 실제 진행 상황을 확인하고, 빠진 것을 파일로 남긴 뒤 사용자에게 알린다 (한도라면 풀리는 시각도).
- 멈춘 에이전트의 빈자리를 메인이 메울 때는 직접 확인한 사실만 적는다. 에이전트의 판단을 추측으로 채우지 않는다.
- 검토 Workflow 가 빈 결과를 돌려주면 "문제 없음" 으로 읽기 전에 `failedReviews` 와 실행 기록을 확인한다.
- 빌드가 환경 문제(환경 변수, 네트워크)로 실패하면 코드 문제와 구분해 보고하고, 구현자에게 넘기지 않는다.

## 테스트 시나리오

**정상 흐름 — "방명록에 페이지네이션 추가해줘"**
1. 0단계: 브랜치 `feat/guestbook-paging`, `_workspace/20261129-guestbook-paging/`.
2. 1단계: 계획에 `docs/data`, `docs/caching`, `docs/design` "글 목록"(Pagination), 완료 조건 `/guestbook?page=2` 200 · 모바일 배치. 사용자 확인.
3. 2단계: 구현자가 `src/lib/guestbook.ts`, `src/app/(site)/guestbook/page.tsx` 수정 → 보고 완료.
4. 3단계: 파일 2개지만 `src/lib/` 를 건드렸으므로 기본 검토 Workflow(code + design) + QA 동시 실행.
5. 지적 1건 확정(searchParams 를 Suspense 밖에서 읽음, A1) + QA 빌드 실패(같은 원인) → 4단계 1회로 해결 → 재검토 통과.
6. 5단계: 커밋 1개, 요약 보고.

**오류 흐름 — 검토자 한 명 실패 + 환경 문제**
1. design 검토 agent 가 null → `failedReviews: 1` → design-reviewer 를 서브에이전트로 한 번 다시 실행해 결과를 합친다.
2. QA 의 build 가 `NEXT_PUBLIC_SUPABASE_URL` 누락으로 실패 → 환경 문제로 분류, 구현자에게 넘기지 않음. 나머지(lint · tsc · curl 확인)는 진행.
3. 보고에 "빌드 미확인 — 환경 변수 필요" 를 명시하고 커밋은 사용자 확인 후.
