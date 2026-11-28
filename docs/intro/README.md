# 인트로 화면 (/intro)
블로그 홈 앞에 한 번 보이는 전체 화면 소개 페이지. 점 매트릭스로 그린 두 손이 서로 뻗는 캔버스 애니메이션과 문구 · 링크로 이루어진다. `src/app/intro/**`.

## 언제 읽나
- 인트로 문구 · 색 · 간격 · 글꼴을 바꿀 때
- 점 매트릭스 손(`DotHands`) 애니메이션을 만질 때
- 홈(`/`)으로 가는 링크를 추가하거나 `proxy.ts` 의 홈 리다이렉트를 고칠 때

## 관련 파일
- `src/app/intro/page.tsx` — 문구, 링크, STACK, 메타데이터
- `src/app/intro/intro.css` — 전용 스타일 (`intro-` 접두사)
- `src/app/intro/DotHands.tsx` — 캔버스 점 매트릭스 손
- `src/app/intro/StageLock.tsx` — html 에 `data-intro` 부착
- `src/app/globals.css` — `html[data-intro]` 규칙
- `src/proxy.ts`, `src/lib/intro-gate.ts` — 진입 규칙
- `src/components/ui/common/BrandMark.tsx` — 브랜드 마크(점 H)

## 꼭 지킬 규칙
- 인트로는 `(site)` 라우트 그룹 밖(`src/app/intro`)에 둔다 — 사이트 헤더 · 푸터가 없는 전체 화면이다 (`page.tsx`)
- 홈(`/`)으로 가는 링크는 `next/link` 의 `<Link href="/">` 만 쓴다. `<a href="/">` 는 문서를 새로 받아 프록시가 다시 인트로로 보낸다 (`page.tsx`, `proxy.ts`, `intro-gate.ts`)
- 화면 잠금은 `StageLock` 의 이펙트로 `data-intro` 를 붙이고 정리 함수에서 뗀다. CSS `:has()` 로 화면 안 표식을 찾지 않는다 — cacheComponents 가 떠난 화면의 DOM 을 숨긴 채 남겨 블로그 화면까지 잠기기 때문 (`StageLock.tsx`)
- 리다이렉트 응답에는 `Cache-Control: no-store` 를 붙인다 — 브라우저나 CDN 이 기억하면 사이트 안 이동까지 인트로로 튕긴다 (`proxy.ts`)
- 리다이렉트 판정은 `Sec-Fetch-Dest: document` 일 때만 한다. 이 헤더가 없는 클라이언트(검색 로봇 등)는 통과시킨다 (`intro-gate.ts`)
- 클래스는 `intro-` 접두사로 짓는다. CSS 모듈을 쓰지 않는다 — 이 저장소는 모든 `*.css` 를 Tailwind 로더로 처리해 CSS 모듈을 못 쓴다 (`intro.css`)
- 인트로 색 · 크기 · 문구를 바꾸면 이 문서의 `## 고정 값` 도 같이 고친다 (`page.tsx`, `intro.css`)
- 캔버스 루프와 리스너는 이펙트 정리 함수에서 멈춘다 (`DotHands.tsx`)

## 진입 규칙
- `proxy.ts` 의 `matcher` 는 `/`, `/admin`, `/admin/:path*`. `pathname === "/"` 일 때 `isFullPageLoad(request.headers)` 가 참이면 `/intro`(`INTRO_PATH`)로 `NextResponse.redirect` 한다. 거짓이면 `NextResponse.next()`.
- `isFullPageLoad` = `headers.get("sec-fetch-dest") === "document"`. 주소창 입력, 새로고침, 다른 사이트에서 온 링크가 문서 요청이다. 사이트 안 이동(Next 의 RSC 요청)과 프리패치는 `empty` 라서 걸리지 않는다. Next 는 프록시에서 `rsc` 같은 내부 헤더를 지우므로 그 헤더로는 구분할 수 없다.
- 리다이렉트에 `Cache-Control: no-store` — 이동을 저장하면 사이트 안 이동까지 인트로로 튕긴다.
- 이 헤더를 보내지 않는 클라이언트(검색 로봇, 아주 오래된 브라우저)는 `false` 라 통과한다 — 로봇은 글 목록을 그대로 읽어야 한다.
- 결과: 인트로 안의 링크(`/`, `/about`, `/guestbook`)는 `next/link` 라 사이트 안 이동이어서 인트로로 되돌아가지 않는다. 일반 `<a href="/">` 는 문서 로드라 다시 인트로로 간다.
- 같은 프록시가 관리자 경로를 IP 로 제한한다(허용 안 되면 `/_blocked` 로 rewrite, 404). 인트로와 무관한 별개 규칙.
- 클래스에 `intro-` 접두사를 쓰는 이유: `*.css` 전부가 Tailwind 로더를 거쳐 CSS 모듈을 쓸 수 없다.

## 고정 값
`page.tsx`:
- 제목 `title: { absolute: "은하 테크 블로그 | Intro" }` — 루트 레이아웃의 `"%s | Eunhaa Tech Developer Blog"` 틀을 쓰지 않는다.
- description: "배운 것을 내 말로 정리하고, 다시 꺼내 쓸 수 있게 남겨 두는 개발 기록장 eunhaa tech 를 소개합니다"
- `viewport.themeColor`: `#f7f7f5`
- 글꼴: Inter(`--font-inter`, latin, weight 400/500/600, swap) 다음 `var(--font-pretendard)` (루트 `layout.tsx` 에서 정의), system-ui, sans-serif.
- 내비: 브랜드(`BrandMark` + "eunhaa tech", `/`), Blog(`/`), About(`/about`), 방명록(`/guestbook`), GitHub 알약(`https://github.com/rukadeveloper`, 새 탭 `rel="noopener noreferrer"`).
- 제목 h1: 윗줄 "Learning by"(회색 `--mute`), 아랫줄 "Writing Code."
- 설명: "배운 것을 내 말로 정리하고, 다시 꺼내 쓸 수 있게 남겨 두는 개발 기록장입니다."
- CTA: "블로그 보러 가기" → `/`
- STACK(simple-icons 24×24 path, 17×17 로 그림): JavaScript, TypeScript, React, Next.js, Node.js, Python.

`intro.css`:

| 항목 | 값 |
|---|---|
| `--bg` | #f7f7f5 |
| `--ink` | #111111 |
| `--mute` | #9a9a9a |
| `--sub` | #7b7b7b |
| 안티앨리어싱 | `-webkit-font-smoothing: antialiased` |
| 히어로 | `height: 100vh`, `min-height: 660px`, `overflow: hidden` |
| 내비 | 가운데 정렬, gap `clamp(18px, 2.6vw, 40px)`, padding-top 36px, 글자 13.5px |
| 브랜드 | 15px, weight 600, letter-spacing -0.01em, gap 8px, margin-right 10px |
| 내비 링크 | 색 #3a3a3a, hover #000 |
| GitHub 알약 | margin-left 10px, padding 10px 21px, 둥근 999px, 배경 #111, 글자 #fff, weight 500, hover translateY(-1px) |
| 문구 박스 | 절대 위치, left 50%, top 24.5%, 폭 `min(92vw, 720px)`, 가운데 정렬 |
| h1 | weight 500, `clamp(38px, 3.75vw, 68px)`, line-height 1.04, letter-spacing -0.035em |
| 설명 p | max-width 340px, margin 20px auto 0, 색 `--sub`, `clamp(13px, 1.02vw, 15.5px)`, line-height 1.4, `word-break: keep-all`, `text-wrap: balance` |
| CTA 래퍼 | margin-top `clamp(34px, 3.6vw, 52px)` |
| CTA 밑빛 | left/right 10%, bottom -6px, 높이 16px, 둥근 50%, 그라디언트 `#ffcf5a, #7dffa8, #5ad7ff, #9b7bff, #ff6fd8, #ffb36b`, blur 9px, opacity .85. hover 시 opacity 1, blur 12px, bottom -9px |
| CTA 버튼 | padding 11px 20px, 둥근 999px, 배경 #111, 글자 #fff, 13.5px, weight 500, hover translateY(-1px) |
| 포커스 | `outline: 2px solid var(--ink)`, offset 3px |
| 로고 줄 | 절대 위치 left/right 0, bottom `clamp(28px, 6vh, 64px)`, gap `clamp(26px, 4.6vw, 66px)`, 색 #8d8d8d, 글자 `clamp(14px, 1.18vw, 17px)`, weight 500 |
| 로고 항목 | inline-flex, gap 7px |
| 760px 이하 | 내비 `space-between`, padding 22px 18px 0, `.intro-link` 숨김, 문구 top 20%, 로고 줄 gap 14px 24px · 글자 13px |
| reduced-motion | `.intro-root *`, `*::before` 의 transition 제거 |

## 점 매트릭스 손
`DotHands.tsx`. 시트 이미지의 손 네 개(`LA`, `RA`, `LB`, `RB`)를 저해상도 필드 캔버스에 그린 뒤, 필드 밝기를 읽어 점 크기로 바꿔 보이는 캔버스에 그린다.

| 상수 | 값 | 뜻 |
|---|---|---|
| `SRC.LA` | [0, 0.06, 0.47, 0.4] | 시트 안 손 위치 [x, y, w, h] (시트 비율) |
| `SRC.RA` | [0.53, 0.06, 0.47, 0.4] | 〃 |
| `SRC.LB` | [0, 0.55, 0.47, 0.4] | 〃 |
| `SRC.RB` | [0.53, 0.55, 0.47, 0.4] | 〃 |
| `LOOP` | 20 | 한 루프 초 |
| `LEVELS` | [0, 0.26, 0.52, 0.78, 1] | 점 크기 단계 |
| `DOT` | #0d0d0d | 점 색 |
| `TILE_ASPECT` | (0.4×1520)/(0.47×2688) | 손 한 칸의 세로/가로 비율 |
| 타일 폭 | 420px | 손마다 미리 줄여 두는 타일 너비 |
| `SHEET_URL` | higgs.ai 이미지 프록시 URL, `w=1600&q=85`, webp | 손 시트 (외부 URL, `crossOrigin="anonymous"`) |

캔버스 계산 (`resize`):
- `DPR = min(2, devicePixelRatio)`.
- `step = max(5, W / 205)` (가로 점 간격), `rowStep = step × 2.05`, `cols = ceil(W / step)`, `rows = ceil(H / rowStep)`, 점 반지름 `R = step × 0.46`.
- 필드 캔버스 `fA`, `fB` 는 `cols × rows` 크기. 칸별 `seed = 0.55×hash(i,j) + 0.45×hash(j×3.1, 7.7)`.

손 그리기 (`drawHand`), `a = 2π·t/LOOP`, 왼손 위상 0 · 오른손 π. 세로 화면(`H > W`)이면 일부 값이 다르다:
- 폭 `hw = W × (세로 0.66 / 가로 0.53)`, 높이 `hw × TILE_ASPECT`, 세로 중심 `cy = H × (세로 0.66 / 가로 0.54)`.
- `reach = (0.035·sin(a+ph) + 0.012·sin(2a+1.3+ph)) × W`
- `scale = 1 + 0.07·sin(a+0.9+ph)`
- `rot = ±0.045·sin(a+2.1+ph)` (왼손 +, 오른손 −)
- x 위치: 왼손 `reach − 0.045W`, 오른손 `W − hw + 0.045W − reach`. 회전 · 확대 축은 왼손 왼쪽 끝, 오른손 오른쪽 끝.

프레임 (`render(time)`):
- `t = time mod 20`. A 세트(`LA`/`RA`)와 B 세트(`LB`/`RB`) 두 필드를 만들어 칸별 seed 와 섞음 비율 `m` 으로 고른다. 왼쪽 절반은 `mL = mixAt(t, 6.2, 14.6, 1.6)`, 오른쪽 절반은 `mR = mixAt(t, 2.4, 10.4, 1.6)` (`mixAt` = smoothstep 올림 × (1 − smoothstep 내림), 전환 1.6초).
- 줄 글리치: `tick = floor(t×7)`, `hash(j,tick) > 0.965` 인 줄은 `round((hash(tick,j) − 0.5)×8)` 칸 밀린다.
- 밝기 → 값: `v = clamp01((1 − lum − 0.16) / 0.42)`. 전환 중(0.001 < m < 0.999)이고 `|seed − m| < 0.12` 면 `v *= gap/0.12`, `hash(i+tick, j) <= 0.4` 면 `v *= 0.3`.
- 깜빡임: `v *= 0.86 + 0.14·sin(t×3.2 + seed×40)`.
- 가장자리 소거: `cx = |(i+.5)/cols − .5|`, `v *= smooth(0.035, 0.11, cx)` (손가락 끝이 닿기 전에 사라짐).
- 문구 뒤 비움: `qx = 세로 0.44 / 가로 0.2`, `qy = 세로 0.33 / 가로 0.385`, `ey = (cyDot/H − qy)/0.085`, `v *= smooth(0.85, 1.25, hypot(cx/qx, ey))`.
- 단계 선택: `v >= LEVELS[k] − 0.13` 인 가장 큰 k. 반지름 `r = R × (level === 1 ? 0.38 : LEVELS[level])`. 모든 점을 한 path 로 모아 한 번에 `fill`.

동작:
- `prefers-reduced-motion: reduce` 이면 루프를 돌리지 않고 `render(0)` 한 장만 그린다 (리사이즈 때도 한 장 다시).
- 아니면 `requestAnimationFrame` 루프, 시작 시각 `t0` 기준.
- `window.__render(t)` 를 노출한다 — 녹화 도구가 시간을 직접 넘겨 그리게 하는 훅. 정리 시 자기 것일 때만 삭제.
- 이미지 로드 실패 시 `console.error("[intro] 손 시트 이미지를 불러오지 못했습니다")`. 캔버스는 `aria-hidden`.
- 정리 함수: `disposed = true`, `cancelAnimationFrame`, resize 리스너 제거, 이미지 핸들러 해제.

## 화면 잠금
- `StageLock`(클라이언트)이 마운트되면 `document.documentElement.dataset.intro = ""`, 정리 시 삭제한다.
- `globals.css`: `html[data-intro], html[data-intro] body { background: #f7f7f5; overflow: hidden; }` — 바탕을 인트로 색으로 바꾸고 스크롤을 끈다. (`StageLock.tsx` 주석은 "바탕을 검게" 라고 적혀 있으나 실제 CSS 값은 `#f7f7f5` 다. 코드 기준으로 `#f7f7f5` 가 맞고 주석이 낡은 것으로 추정한다.)
- `:has()` 를 쓰지 않는 이유: cacheComponents 에서는 다른 화면으로 넘어가도 이전 화면의 DOM 이 숨겨진 채 남는다. `:has()` 로 인트로 표식을 찾으면 블로그 화면까지 잠긴다. 이펙트는 화면이 숨겨질 때 정리되므로 속성이 정확히 떨어진다.

## 바꿀 때 함께 고칠 것
- 인트로 문구 · 색 · 크기를 바꾸면 이 문서 `## 고정 값` 표를 같이 고친다.
- `DotHands.tsx` 상수를 바꾸면 이 문서 `## 점 매트릭스 손` 표를 같이 고친다.
- 홈으로 가는 링크를 넣을 때는 `next/link` 인지 확인한다. 리다이렉트 판정을 바꾸면 `intro-gate.ts` 와 `proxy.ts` 를 함께 보고 `## 진입 규칙` 을 고친다.
- `data-intro` 규칙은 `globals.css` 와 `StageLock.tsx` 를 함께 고친다.
