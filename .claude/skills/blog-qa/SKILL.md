---
name: blog-qa
description: haruka-tech-blog 변경분을 실제로 실행해 확인하는 QA 절차 — lint, 타입 검사, 프로덕션 빌드(cacheComponents prerender 검증 포함), dev 서버를 띄워 계획의 완료 조건을 브라우저 또는 HTTP 요청으로 확인. qa-runner 가 따르며, "QA 해줘", "빌드 되는지 확인해줘", "화면에서 동작 확인해줘" 같은 요청에도 쓴다. 코드 검토(읽고 판단)는 code-reviewer · design-reviewer 의 일이다.
---

# 블로그 QA 절차

테스트 스위트가 없으므로 build 와 실제 화면이 유일한 실행 확인이다. 특히 cacheComponents 에서는 Suspense 누락 · `Date.now()` 같은 실수가 **빌드할 때만** 드러난다.

## 1. 정적 확인

```bash
npm run lint
npx next typegen && npx tsc --noEmit -p .
```

경고 · 오류를 바뀐 파일 기준으로 나눠 적는다 (기존 파일의 경고는 "기존" 으로 표시).

## 2. 프로덕션 빌드

```bash
npm run build 2>&1 | tee _workspace/{run}/qa_build.log
```

- 실패하면 오류 첫 부분과 해당 파일 · 줄을 보고서에 옮긴다. 흔한 원인: Suspense 밖 동적 값(`Uncached data was accessed outside of <Suspense>`), prerender 중 `Date.now()`, 클라이언트 파일이 `server-only` 모듈을 import.
- 빌드는 Supabase 에서 글을 읽어 prerender 한다. `.env.local` 이 없거나 네트워크가 막혀 실패하면 "환경 문제" 로 적고 다음 단계로 간다. `.env*` 파일 내용은 열거나 출력하지 않는다.
- 빌드 출력의 라우트 표에서 바뀐 라우트가 예상한 방식(정적 ◐/○, 동적 ƒ)으로 나오는지 본다.

## 3. dev 서버와 화면 확인

```bash
npm run dev    # 백그라운드로 띄우고 http://localhost:3000 이 응답할 때까지 기다린다
```

- 빌드와 dev 를 동시에 돌리지 않는다. 빌드가 끝난 뒤 띄운다.
- 3000 포트가 이미 쓰이면 그 서버를 쓰지 말고 보고한다.

계획의 "완료 조건" 하나마다 확인 방법을 고른다:

| 확인할 것 | 방법 |
|---|---|
| 응답 코드, 리다이렉트, 렌더된 문구 | `curl -s -o /dev/null -w "%{http_code}" URL`, `curl -s URL \| grep` |
| 홈 → 인트로 진입 규칙 | `curl -sI -H "Sec-Fetch-Dest: document" http://localhost:3000/` → 307 `/intro`, 헤더 없이 → 200 |
| 배치 · 다크 모드 · 모바일 · 상호작용 | 브라우저 도구 (`claude-in-chrome` 스킬을 먼저 불러온다) |

브라우저로 확인할 때:

1. 탭 정보를 먼저 확인하고 새 탭에서 연다.
2. 데스크톱 폭과 모바일 폭(약 390px)을 모두 본다. `localStorage.theme` 를 `"dark"` 로 바꾸고 새로고침해 다크 모드도 본다.
3. 콘솔 오류(`read_console_messages`, 패턴 `error|Error|hydrat`)를 확인한다. 하이드레이션 경고는 실패로 적는다.
4. 삭제 확인 버튼처럼 브라우저 대화 상자를 띄울 수 있는 동작은 누르지 않는다.

## 4. 관리자 화면 한계

dev 에서는 localhost IP 가 허용되지만 관리자 판정에는 GitHub 로그인(`ADMIN_GITHUB_LOGIN` 계정)도 필요하다. 브라우저에 그 로그인 쿠키가 없으면 `/admin/*` 는 `/admin/login` 으로 간다. 이때는:

- 로그인 화면으로 가는 것(권한 확인이 살아 있음)만 확인하고,
- 관리자 화면의 동작은 "미확인 — 로그인 필요" 로 적는다. 로그인을 시도하거나 쿠키를 만들지 않는다.

DB 에 쓰는 동작(글 저장, 댓글 작성)은 실제 Supabase 에 기록되므로 계획에 명시된 경우에만 하고, 만든 데이터는 보고서에 적는다.

## 5. 정리와 보고

- dev 서버를 끈다 (띄운 프로세스만).
- `qa-runner` 정의의 보고서 형식으로 `_workspace/{run}/04_qa_report.md` 를 쓴다. 확인하지 못한 항목은 통과가 아니라 "미확인" 이다.
