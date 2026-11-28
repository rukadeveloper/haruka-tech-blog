---
name: blog-design-check
description: haruka-tech-blog 화면 변경이 디자인 시스템을 지키는지 점검하는 절차와 자동 스캔 스크립트(scripts/scan-design.mjs). 토큰 밖의 색 · 움직임 · 그림자 값, 모바일 퍼스트, 다크 모드, 터치 크기, 포커스, 홈 링크 규칙을 본다. design-reviewer 가 검토할 때, 또는 "디자인 규칙 지켰는지 봐줘", "토큰 안 쓴 곳 찾아줘" 같은 요청에 사용한다. 새 화면을 디자인하거나 구현하는 작업 자체에는 쓰지 않는다(그건 blog-dev).
---

# 디자인 규칙 점검

이 블로그는 화면 영역마다 디자인 규칙이 다르다. 먼저 영역을 나누고, 그 영역의 규칙만 적용한다. 섞어 적용하면 인트로 · 에디터의 의도된 자체 색을 위반으로 잘못 지적한다.

| 영역 | 파일 | 기준 문서 |
|---|---|---|
| public — 공개 · 관리자 화면 | 아래 둘을 뺀 `src/**` | `docs/design` |
| studio — 벤토 블록 에디터 | `src/app/(studio)/**` | `docs/editor` |
| intro — 인트로 | `src/app/intro/**` | `docs/intro` |

## 1. 후보 모으기 (자동)

저장소 루트에서:

```bash
node .claude/skills/blog-design-check/scripts/scan-design.mjs          # 바뀐 파일 (main 대비 + 작업 트리)
node .claude/skills/blog-design-check/scripts/scan-design.mjs --all    # src 전체
```

스크립트는 정규식으로 **후보**만 찾는다. 줄을 읽고 판정한다. D1–D6, D9 는 public 영역에만, D7–D8 은 모든 영역에 적용된다.

## 2. 규칙

| # | 규칙 | 이유 | 자동 |
|---|---|---|---|
| D1 | 색은 토큰 유틸리티(`bg-surface`, `text-muted`, `border-line`, `text-strong` …) 또는 `var(--토큰)` 로만 쓴다. hex · rgb 직접 금지 | 라이트 · 다크 · 대비 높이기 설정이 토큰 값을 바꿔 처리한다 | ✓ |
| D2 | Tailwind 기본 팔레트(`text-gray-500`, `bg-white`, `bg-black/50`)를 쓰지 않는다 | 다크 모드에서 바뀌지 않는다 | ✓ |
| D3 | 전환 시간 · 곡선은 `var(--dur-press \| --dur \| --dur-slow)` · `var(--ease-out)`. Tailwind 에서는 `duration-(--dur)` · `ease-(--ease-out)` | 움직임 줄이기 설정을 토큰으로 처리한다 | ✓ |
| D4 | 누름 반응은 `.pressable` / `.pressable-lg` 또는 `.btn` · `.chip` · `.icon-btn`. `active:scale-*` 직접 금지 | `--press` 가 reduced-motion 에서 1 이 된다 | ✓ |
| D5 | 그림자는 `shadow-card` · `shadow-pop` 또는 `.card` · `.glass-thick` | 평평한 면 · 다크 그림자 값 | ✓ |
| D6 | 흐림(`backdrop-blur`)과 반투명 면을 새로 만들지 않는다. 면은 `.card` · `.glass*` | 면은 불투명하고 평평하다 (`--glass*` 는 이름만 남은 불투명 값) | ✓ |
| D7 | 홈(`/`) 링크는 `next/link` | `<a href="/">` 는 문서 로드라 인트로로 튕긴다 | ✓ |
| D8 | `html` · `body` 상태를 CSS `:has()` 로 바꾸지 않는다 | cacheComponents 가 떠난 화면 DOM 을 남긴다 | ✓ |
| D9 | 포커스 표시(`:focus-visible`)를 지우지 않는다. `.admin-ui` 의 입력 요소만 예외 | 키보드 사용자 | ✓ |
| D10 | 모바일 값이 기본, `sm:`(640) · `lg:`(1024) 에서 키운다. 모바일 화면(360px)에서 가로 스크롤 · 겹침이 없다 | 모바일 퍼스트 | 직접 |
| D11 | 터치 대상은 44px 이상 (`.btn` 44px). 예외: `.btn-sm` 36px, 아이콘 버튼 | 터치 정확도 | 직접 |
| D12 | hover 스타일은 `@media (hover: hover)` 안 (Tailwind `hover:` 는 v4 에서 이미 그렇게 동작) | 터치 기기에서 hover 가 눌린 채 남음 | 직접 |
| D13 | 폭은 `.container-page`(1120) · `.container-prose`(768). 글자 크기는 `.text-*` 클래스 우선 | 화면 간 일관성 | 직접 |
| D14 | 현재 위치는 `aria-current="page"`, 아이콘만 있는 버튼은 `aria-label` | 접근성 · CSS 가 그 속성을 읽음 | 직접 |
| D15 | 다크 모드 변형은 `dark:` (= `html[data-theme="dark"]`). `prefers-color-scheme` 를 직접 읽지 않는다 | 사용자가 고른 테마가 우선 | 직접 |
| D16 | 헤더 높이 · 여백을 바꾸면 목차 기준선 · 사이드바 sticky 위치도 함께 고친다 | 서로 의존 (`docs/design` "헤더 · 푸터") | 직접 |

규칙의 상세와 **알려진 예외**(PostRow 로고 타일, `.btn-github`, 코드 블록 언어 색, `layout.tsx` 의 themeColor 등)는 `docs/design` 의 "꼭 지킬 규칙" 을 본다. 알려진 예외는 지적하지 않는다.

## 3. studio · intro 영역

자체 색 · 글꼴 · 움직임 값을 쓰는 것이 정상이다. 대신 확인한다:

- studio: 색은 `html[data-studio]` 가 덮어쓴 블로그 토큰 이름(`--strong`, `--surface` …)과 `--bento-*` 로만 쓴다. 새 색이 필요하면 `studio.css` 의 두 블록(라이트 · 다크)에 함께 추가한다. 상세는 `docs/editor` "꼭 지킬 규칙" · "토큰".
- intro: 값은 `docs/intro` "고정 값" · "점 매트릭스 손" 표와 같아야 한다. 값을 바꿨다면 문서도 바뀌었는지 본다. 클래스는 `intro-` 접두사.

## 4. 판정 기준

- 지적: 규칙을 어기고, 다크 모드 · 접근성 설정 · 모바일에서 실제로 다르게 보이거나 동작하는 경우.
- 지적하지 않음: 바뀌지 않은 줄(변경과 연결될 때만 `pre_existing`), 알려진 예외, 토큰을 정의하는 줄 자체.
- 지적마다 규칙 번호, 파일 · 줄, 고칠 토큰 · 클래스를 적는다.
