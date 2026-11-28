---
name: blog-dev
description: haruka-tech-blog 의 기능 개발 · UI 개편 · 버그 수정을 끝까지 진행하는 오케스트레이터 — 계획과 규칙 문서(AGENTS.md · DESIGN.md · rules) 먼저 반영 → blog-implementer 구현 → 아키텍처 · 디자인 검토(Workflow, 지적마다 적대적 검증)와 QA(lint · build · 브라우저) → 수정 루프 → 기능 단위 커밋. "~ 기능 추가해줘", "~ 화면 바꿔줘", "~ 개편", "~ 버그 고쳐줘" 같은 이 블로그의 코드 변경 요청에 쓴다. "다시 검토해줘", "QA 만 다시", "지난 작업 이어서", "검토 결과 반영해줘" 같은 후속 요청에도 쓴다. 한 줄짜리 문구 · 오타 수정이나 코드 설명 질문에는 쓰지 않고 직접 처리한다.
---

# 블로그 개발 오케스트레이터

메인 세션이 리더입니다. 계획 · 규칙 문서 · 커밋은 메인이 직접 하고, 구현 · 검토 · QA 는 아래 에이전트에게 맡깁니다.

| 에이전트 (`.claude/agents/`) | 맡는 일 | 모델 | 따르는 스킬 |
|---|---|---|---|
| `blog-implementer` | 구현, 확정된 지적 수정 | opus | `blog-conventions` |
| `arch-reviewer` | 아키텍처 · 정확성 검토 (읽기 전용) | opus | `blog-conventions/references/review-checklist.md` |
| `design-reviewer` | 디자인 규칙 검토 (읽기 전용) | sonnet | `blog-design-check` |
| `finding-verifier` | 지적 한 건씩 반박 시도 (읽기 전용) | opus | 점검표 + 규칙 문서 |
| `qa-runner` | lint · build · 브라우저 확인 | sonnet | `blog-qa` |

## 작업 폴더

중간 산출물은 `_workspace/{run}/` 에 둡니다. `{run}` 은 `YYYYMMDD-짧은-작업명` (예: `20261129-guestbook-paging`). `_workspace/` 는 git 에 올리지 않습니다.

| 파일 | 쓰는 쪽 |
|---|---|
| `01_plan.md` | 메인 (1단계) |
| `02_implementer_report.md` | blog-implementer |
| `03_review_confirmed.json` | 메인 (검토 Workflow 반환값을 저장) |
| `04_qa_report.md` | qa-runner |
| `05_summary.md` | 메인 (마지막 보고) |

## 0단계: 어디서 시작할지 정하기

- `_workspace/` 에 이번 요청과 같은 작업 폴더가 있고 "다시 검토", "QA 만 다시", "이어서" 같은 후속 요청이면 → 해당 단계만 다시 실행합니다. 검토 Workflow 의 직전 `runId` 를 알고 있고 바뀐 파일이 없으면 `resumeFromRunId` 로 재개합니다.
- 같은 작업인데 요구 사항이 바뀌었으면 → 기존 폴더 이름 뒤에 `-v2` 를 붙여 새로 시작하고, 이전 `01_plan.md` 를 참고합니다.
- 그 밖에는 1단계부터.
- 시작 전에 `git status` 로 작업 트리를 확인합니다. 이번 작업과 무관한 변경이 있으면 사용자에게 알리고 섞지 않습니다. `main` 이면 `feat/…` · `fix/…` 브랜치를 먼저 만듭니다.

## 1단계: 계획 (메인 직접)

**실행 모드:** 메인 세션

1. 요청을 읽고 영향받는 파일을 찾습니다. 영역별 규칙 문서(DESIGN.md 해당 절, `.claude/rules/*`)와 `blog-conventions` 를 읽습니다.
2. `01_plan.md` 를 씁니다: 목표 / 바꿀 파일 / 규칙 문서 변경 여부 / 지켜야 할 규칙(캐시 태그, Suspense, 토큰 등 구체적으로) / 완료 조건(QA 에서 볼 주소와 동작).
3. **사용자에게 계획을 보여 주고 확인받습니다** (AGENTS.md "전체 규칙"의 첫 항목). 화면 배치처럼 정답이 여러 개인 결정만 묻고, 저장소 규칙으로 정해지는 것은 묻지 않습니다.
4. 화면 배치 · 동작 규칙이 바뀌는 작업이면 AGENTS.md · DESIGN.md · rules 를 먼저 고치고 `... 규칙을 AGENTS.md · DESIGN.md 에 반영 [skip deploy]` 형식으로 커밋합니다. 버그 수정은 건너뜁니다.

## 2단계: 구현

**실행 모드:** 서브에이전트 위임 (이름을 붙여 실행 — 4단계에서 같은 맥락으로 다시 부름)

```
Agent(subagent_type: "blog-implementer", name: "implementer",
      prompt: "_workspace/{run}/01_plan.md 를 구현하라. 보고는 _workspace/{run}/02_implementer_report.md")
```

보고가 "실패"거나 "결정 필요"가 있으면 3단계로 넘어가지 말고 그 내용을 사용자와 정리합니다.

## 3단계: 검토 + QA (동시에)

**실행 모드:** 검토는 워크플로 조율, QA 는 서브에이전트 — 한 메시지에서 함께 시작합니다. 둘 다 소스를 고치지 않으므로 동시에 돌려도 됩니다.

### 3-1. 검토 규모 정하기

바뀐 파일 목록(`git diff --name-only main...` + 작업 트리)을 보고 정합니다.

- **가벼운 검토**: 바뀐 파일 2개 이하이고 Server Action · `src/lib/` · `proxy.ts` · 레이아웃을 건드리지 않았다 → Workflow 없이 `arch-reviewer`, `design-reviewer` 를 서브에이전트로 한 번씩 부르고, 메인이 지적을 직접 확인합니다.
- **기본 검토**: 그 밖 → 아래 Workflow. 화면 파일이 없으면 `dimensions` 에서 design 을 뺍니다.

### 3-2. 검토 Workflow

`args` 로 `{ run, files, plan }` 을 넘깁니다 (`plan` 은 `01_plan.md` 요약 몇 줄). 반환된 `confirmed` 를 `03_review_confirmed.json` 에 저장합니다.

```javascript
export const meta = {
  name: 'blog-review',
  description: '블로그 변경을 아키텍처 · 디자인 관점에서 검토하고 지적마다 반박을 시도해 확정된 것만 남긴다',
  phases: [
    { title: '검토', detail: '관점별 검토자가 바뀐 파일을 본다' },
    { title: '검증', detail: '지적 한 건마다 finding-verifier 가 반박을 시도한다' },
  ],
}

const FINDINGS = { type: 'object', required: ['findings'], properties: {
  findings: { type: 'array', items: { type: 'object',
    required: ['file', 'line', 'title', 'evidence', 'scenario', 'severity'], properties: {
      file: { type: 'string' }, line: { type: 'integer' }, title: { type: 'string' },
      evidence: { type: 'string' }, scenario: { type: 'string' },
      severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
      pre_existing: { type: 'boolean' } } } } } }
const VERDICT = { type: 'object', required: ['status', 'reason'], properties: {
  status: { type: 'string', enum: ['confirmed', 'refuted', 'uncertain'] },
  reason: { type: 'string' } } }

const files = (args.files ?? []).join('\n')
const base = `작업: ${args.plan ?? ''}\n바뀐 파일:\n${files}\n` +
  `바뀐 파일과 그 호출처만 보라. 실패 시나리오를 댈 수 있는 지적만 반환하라. 없으면 빈 배열.`

const all = [
  { key: 'arch', agentType: 'arch-reviewer',
    prompt: `${base}\n.claude/skills/blog-conventions/references/review-checklist.md 의 아키텍처 · 정확성 항목으로 검토하라.` },
  { key: 'design', agentType: 'design-reviewer',
    prompt: `${base}\nblog-design-check 스킬 절차로 검토하라. scan-design.mjs 를 먼저 돌려라.` },
]
const dimensions = all.filter(d => (args.dimensions ?? ['arch', 'design']).includes(d.key))

// 검토자가 실패(null)해도 다음 단계로 넘겨 failed 로 표시한다 — null 을 그대로 두면 누락을 셀 수 없다.
const results = await pipeline(
  dimensions,
  d => agent(d.prompt, { label: `검토:${d.key}`, phase: '검토', agentType: d.agentType, schema: FINDINGS })
    .then(r => ({ key: d.key, failed: !r, findings: r?.findings ?? [] })),
  review => parallel(review.findings.map(f => () =>
    agent(`다음 지적을 반박해 보라. 파일을 직접 열어 확인하고 confirmed / refuted / uncertain 으로 판정하라.\n${JSON.stringify(f)}`,
      { label: `검증:${f.file}:${f.line}`, phase: '검증', agentType: 'finding-verifier', schema: VERDICT })
      .then(v => v && { ...f, dimension: review.key, verdict: v })))
    .then(judged => ({ key: review.key, failed: review.failed, total: review.findings.length, judged: judged.filter(Boolean) }))
)

const done = results.filter(Boolean)
const missingReviews = dimensions.filter(d => !done.some(r => r.key === d.key && !r.failed)).map(d => d.key)
const unverified = done.reduce((n, r) => n + r.total - r.judged.length, 0)
if (missingReviews.length) log(`검토하지 못한 관점: ${missingReviews.join(', ')}`)
if (unverified) log(`검증 결과를 받지 못한 지적 ${unverified}건 (통과로 세지 않음)`)
const judged = done.flatMap(r => r.judged)
const confirmed = judged.filter(f => f.verdict?.status === 'confirmed')
const uncertain = judged.filter(f => f.verdict?.status === 'uncertain')
log(`지적 ${judged.length}건 중 확정 ${confirmed.length}건, 불확실 ${uncertain.length}건`)
return { confirmed, uncertain, missingReviews, unverified }
```

### 3-3. QA (같은 메시지에서)

```
Agent(subagent_type: "qa-runner",
      prompt: "blog-qa 절차로 확인하라. 완료 조건: {01_plan.md 의 완료 조건}. 바뀐 파일: {목록}. 보고는 _workspace/{run}/04_qa_report.md")
```

## 4단계: 수정 루프

**실행 모드:** 지속형 에이전트 — 2단계의 `implementer` 에게 `SendMessage` 로 보냅니다 (구현 맥락을 유지한 채 고치도록). 응답이 없으면 같은 유형을 새 이름으로 실행하고 `01_plan.md` · `02_implementer_report.md` 를 읽게 합니다.

1. 고칠 목록 = `confirmed` 중 `blocker` · `major` 이면서 `pre_existing` 이 아닌 것 + QA 실패 중 "환경 문제"가 아닌 것.
   - `minor`, `pre_existing`, `uncertain` 은 고치지 않고 마지막 보고에 "참고"로 올립니다 (범위를 넓히지 않기 위해).
2. 목록이 비었으면 5단계로.
3. `SendMessage({to: "implementer"}, "03_review_confirmed.json 과 04_qa_report.md 의 다음 항목만 고쳐라: …")`
4. 고친 뒤 **영향받는 것만** 다시 확인합니다: 아키텍처 지적을 고쳤으면 arch 만 Workflow 재실행(`dimensions: ['arch']`), QA 실패를 고쳤으면 qa-runner 에게 실패 항목만 다시 확인시킵니다.
5. 최대 2회 반복합니다. 2회 뒤에도 남으면 멈추고 남은 항목을 사용자에게 보여 줍니다 — 같은 결함을 계속 못 고치면 계획이 틀렸을 가능성이 크기 때문입니다.

## 5단계: 커밋과 보고 (메인 직접)

1. 기능 하나마다 커밋합니다. 메시지는 기존 기록처럼 한국어 한 줄(무엇을 어떻게 바꿨는지), 문서 · 설정만이면 `[skip deploy]`. `.env*` 와 `_workspace/` 는 올리지 않습니다.
2. 푸시 · PR 은 사용자가 요청할 때만 합니다 (`/push-commit` 또는 `/ship`).
3. `05_summary.md` 를 쓰고 사용자에게 보고합니다: 바뀐 것, 검토 결과(확정 / 고침 / 남김), QA 표, 확인하지 못한 것, 참고 사항(minor · pre_existing).

## 오류 처리

- 에이전트가 실패하면 한 번 다시 부릅니다. 또 실패하면 그 결과 없이 진행하고 보고에 누락을 적습니다. Workflow 의 `missingReviews` 에 든 관점은 "검토 안 됨", `unverified` 건수는 "검증 안 된 지적"으로 보고합니다.
- 사용량 한도, 인증 만료, 권한 거부는 다시 시도하지 않습니다. `_workspace/` 의 부분 산출물로 어디까지 됐는지 확인하고 사용자에게 알립니다 (한도면 풀리는 시각도).
- 에이전트가 남긴 빈칸은 메인이 직접 확인한 사실로만 채웁니다. 검토자의 판단을 추측해 적지 않습니다.
- 검토 지적과 QA 결과가 충돌하면(예: 검토는 Suspense 누락이라는데 build 는 통과) 둘 다 남기고 finding-verifier 판정과 build 출력을 함께 보고합니다.
- build 가 환경 변수 · Supabase 접속 때문에 실패하면 코드 결함으로 세지 않고 "환경 문제"로 보고합니다.

## 테스트 시나리오

**정상 흐름** — "방명록에 페이지네이션 추가해줘"
1. 1단계: `guestbook.ts` · `guestbook/page.tsx` 영향, `?page=` 규칙 → DESIGN.md 에 방명록 페이지네이션 규칙 추가 후 `[skip deploy]` 커밋.
2. 2단계: implementer 가 `getGuestbook` 에 범위 조회 추가(캐시 태그 유지), 페이지는 Suspense 안에서 `searchParams` 를 읽음.
3. 3단계: 파일 3개 이상 + `src/lib/` → 기본 검토 Workflow + qa-runner 동시 실행.
4. 4단계: 확정 지적 0건, QA `/guestbook?page=2` 통과 → 5단계.
5. 5단계: `방명록에 페이지 나누기(?page=N, 한 페이지 20개) 추가` 커밋, 요약 보고.

**오류 흐름** — 검토에서 "새 액션이 `updateTag(TAGS.guestbook)` 를 안 부름" 이 confirmed, QA 에서 build 가 `.env.local` 없음으로 실패
1. 고칠 목록: 태그 무효화 누락 1건. build 실패는 "환경 문제"로 분류해 목록에서 뺌.
2. implementer 에게 SendMessage → 수정 → arch 만 재검토 → 확정 0건.
3. 보고: "build 는 환경 변수가 없어 확인하지 못함" 을 명시하고 커밋은 사용자 확인 뒤 진행.
