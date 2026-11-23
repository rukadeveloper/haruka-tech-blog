---
paths:
  - "src/app/intro/**"
  - "src/proxy.ts"
  - "src/lib/intro-gate.ts"
---

# 인트로 페이지 (`/intro`) 규칙

따뜻한 흰 바탕 한 화면에 가운데 제목 · 검은 알약 CTA(무지개 밑빛) · 맨 아래 기술 로고 줄을 두고, 그 뒤에 **서로를 향해 손을 뻗는 두 손을 검은 점 매트릭스(LED 하프톤)로 매 프레임 캔버스에 그리는** 랜딩 화면입니다. 원본은 단일 HTML 명세("Dot-Matrix Hands Hero")이고, **디자인(배치 · 수치 · 캔버스 동작)은 명세 그대로 두고 문구와 로고 줄만 블로그에 맞게 바꿨습니다.** 아래 값은 임의로 바꾸지 않습니다.

## 이 화면만의 예외

CLAUDE.md 와 DESIGN.md 의 디자인 규칙은 이 화면에 적용하지 않습니다.

- 테마는 `#f7f7f5` 바탕 하나뿐입니다. 라이트/다크 전환, `data-theme`, DESIGN.md 의 색 · 글래스 · 움직임 토큰과 `.glass*`, `.btn`, `.chip` 같은 클래스를 쓰지 않습니다.
- 분기는 모바일 퍼스트가 아니라 명세대로 `max-width: 760px` 하나이고, 캔버스는 세로 화면(H > W)일 때 손 배치를 바꿉니다.
- 블로그 헤더 · 푸터가 붙지 않도록 라우트 그룹 `(site)` 밖(`src/app/intro`)에 둡니다.
- 그대로 지키는 규칙: 코드 주석은 한국어. 화면 문구는 제목 · CTA 를 빼고 한국어 (제목은 명세의 영어 두 줄 구성을 살림).
- 무지개 밑빛만 유일한 색입니다. 그 밖에는 검정과 회색뿐입니다.

## 파일

| 파일 | 역할 |
|---|---|
| `page.tsx` | 서버 컴포넌트. 메타데이터, Inter 글꼴, 내비 · 문구 · CTA · 로고 줄 마크업 |
| `DotHands.tsx` | 클라이언트. 손 시트 이미지를 읽어 점 매트릭스 손을 매 프레임 캔버스에 그림 |
| `intro.css` | 스타일 전부. 이 저장소는 모든 `*.css` 를 Tailwind 로더로 처리해 CSS 모듈을 쓸 수 없으므로, 클래스에 `intro-` 접두사를 붙입니다 |
| `StageLock.tsx` | 클라이언트. 인트로가 보이는 동안만 `html` 에 `data-intro` 를 붙임 |

인트로가 보이는 동안 `StageLock` 이 `html` 에 `data-intro` 를 붙이고, `src/app/globals.css` 의 `html[data-intro]` 규칙이 바탕을 `#f7f7f5` 로 바꾸고 스크롤과 색 번짐(`body::before`)을 끕니다.

cacheComponents 에서는 다른 화면으로 넘어가도 인트로의 DOM 이 숨겨진 채 남습니다. 그래서 화면에 묶인 것은 CSS 선택자(`:has()`)가 아니라 이펙트로 켜고 정리 함수에서 끕니다 — 바탕 잠금(`StageLock`), 캔버스 루프(`DotHands`: rAF 취소 · resize 리스너 해제)가 그렇게 되어 있습니다.

## 진입 규칙

**블로그 홈(`/`)에 처음 들어오거나 홈에서 새로고침하면 인트로로 보냅니다.** 사이트 안에서 이동할 때는 보내지 않습니다.

| 상황 | 결과 |
|---|---|
| 사이트 주소(`/`)로 들어옴 | `/intro` 로 이동 |
| 홈(`/`, `/?page=2`)에서 새로고침 | `/intro` 로 이동 |
| 인트로에서 Blog · CTA · 로고를 눌러 홈으로 | 홈이 그대로 열림 |
| 블로그 안에서 헤더의 Blog · 로고를 눌러 홈으로 | 홈이 그대로 열림 |
| 글 · 카테고리 · About · 방명록 · 관리자 주소로 들어오거나 새로고침 | 그 화면이 그대로 열림 |
| `/intro` 에서 새로고침 | 인트로 그대로 |

- 처리하는 곳은 `src/proxy.ts` 이고, 판정은 `src/lib/intro-gate.ts` 의 `isFullPageLoad()` 하나입니다.
- "처음 들어옴"과 "새로고침"은 둘 다 브라우저가 문서를 새로 받는 요청이라 `Sec-Fetch-Dest: document` 헤더가 붙습니다. 사이트 안 이동(Next 의 RSC 요청)과 프리패치는 `empty` 라서 통과합니다. Next 는 프록시에서 `rsc` 같은 내부 헤더를 지우므로 그 헤더로 구분하면 안 됩니다.
- 이 헤더를 보내지 않는 클라이언트(검색 로봇, 아주 오래된 브라우저)는 인트로로 보내지 않습니다. 로봇이 글 목록을 읽을 수 있어야 하기 때문입니다.
- 이동은 307 + `Cache-Control: no-store` 입니다. 브라우저나 CDN 이 이동을 기억하면 사이트 안 이동까지 인트로로 튕깁니다.
- 인트로에서 홈으로 가는 링크는 반드시 `next/link` 를 씁니다. `<a href="/">` 나 `location.href` 로 가면 문서를 새로 받아 다시 인트로로 돌아옵니다.

범위는 홈뿐입니다. 넓히더라도 아래는 반드시 뺍니다.

- 글 · 카테고리 주소: 공유한 링크와 검색 유입이 글 대신 인트로에 도착하고, 글을 읽다 새로고침하면 읽던 자리를 잃습니다.
- `/admin` 이하: 에디터에서 새로고침하면 쓰던 화면을 잃습니다.
- GitHub 로그인 직후의 복귀(`/api/auth/github/callback` → `returnTo`): 문서를 새로 받는 이동이라, 걸리면 댓글을 쓰려던 글로 돌아오지 못합니다.

## 외부 자원

| 쓰임 | 주소 |
|---|---|
| 손 시트 (흰 바탕 위 손 사진 2×2, 원본 2688×1520, w=1600 요청 → 1600×905). `crossOrigin="anonymous"` 로 받아야 `getImageData` 가 됩니다 (프록시가 `access-control-allow-origin: *` 를 보냄) | `https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261030_025250_100df7b8-31fd-4614-aa4a-c1b7d5b6b273.png&w=1600&q=85` |

이 이미지가 실패하면 캔버스만 비고 나머지 화면은 그대로입니다. 그 밖의 이미지는 없고, 로고는 인라인 SVG 입니다.

시트 좌표 (시트 너비 · 높이의 비율 `[x, y, w, h]`):

| 이름 | 좌표 | 모습 |
|---|---|---|
| `LA` | `[0, .06, .47, .40]` | 왼쪽에서 들어오는 왼손, 검지로 오른쪽을 가리킴 (자세 A) |
| `RA` | `[.53, .06, .47, .40]` | 오른쪽에서 들어오는 오른손, 검지로 왼쪽을 가리킴 (자세 A) |
| `LB` | `[0, .55, .47, .40]` | 손가락을 편 왼손 (자세 B) |
| `RB` | `[.53, .55, .47, .40]` | 손바닥을 위로 편 오른손 (자세 B) |

## 토큰 · 글꼴

```css
--bg: #f7f7f5;   /* 바탕 */
--ink: #111111;
--mute: #9a9a9a; /* 제목 1줄 */
--sub: #7b7b7b;  /* 서브라인 */
```

점 색은 `#0d0d0d`. 글꼴은 Inter 400 · 500 · 600 (`next/font/google` → `--font-inter`, 한글은 Pretendard 로 대체), `-webkit-font-smoothing: antialiased`.

## 배치

`.intro-hero`: `position: relative; height: 100vh; min-height: 660px; overflow: hidden`. 캔버스는 `absolute; inset: 0; 100% × 100%`, 나머지는 모두 `z-index: 3`.

- **내비**: 가로 가운데, `gap: clamp(18px, 2.6vw, 40px)`, `padding-top: 36px`, 13.5px.
  - 브랜드: 블로그 로고 18px + `eunhaa tech`, 600, 15px, 자간 −.01em, 간격 8px, 오른쪽 여백 10px.
  - 링크: 색 `#3a3a3a`, 밑줄 없음, hover `#000` (.2s).
  - 오른쪽 알약: 바탕 `#111`, 흰 글자, 패딩 10px 21px, 모서리 999, 500, 왼쪽 여백 10px, hover `translateY(-1px)` (.25s).
- **문구**: `left: 50%; top: 24.5%; translateX(-50%)`, 가운데 정렬, `width: min(92vw, 720px)`.
  - 제목: 500, 자간 −.035em, 줄 간격 1.04, `clamp(38px, 3.75vw, 68px)`. 1줄은 블록 span 회색 `#9a9a9a`, 2줄은 `#111`.
  - 서브라인: 위 여백 20px, `max-width: 340px`, `#7b7b7b`, `clamp(13px, 1.02vw, 15.5px)`, 줄 간격 1.4. 가운데 두 줄.
  - CTA: `margin-top: clamp(34px, 3.6vw, 52px)`. 검은 알약(`#111`, 흰 13.5px 500, 패딩 11px 20px, 모서리 999). **무지개 밑빛** `::before`: `left: 10%; right: 10%; bottom: -6px; height: 16px; border-radius: 50%`, `linear-gradient(90deg, #ffcf5a, #7dffa8, #5ad7ff, #9b7bff, #ff6fd8, #ffb36b)`, `blur(9px)`, 불투명도 .85, 알약 뒤. hover 시 불투명도 1, `blur(12px)`, `bottom: -9px`, 알약 1px 올라감. 전환 .3s.
- **로고 줄**: `bottom: clamp(28px, 6vh, 64px)`, 가로 가운데, `gap: clamp(26px, 4.6vw, 66px)`, 줄바꿈, 패딩 0 16px. 색 `#8d8d8d`, `clamp(14px, 1.18vw, 17px)`, 500, 자간 −.01em. 항목마다 17×17 아이콘(`fill: currentColor`) + 이름, 간격 7px.

## 점 매트릭스 손 (`DotHands.tsx`)

### 프레임마다
1. 시트를 한 번 받아 `SRC` 좌표마다 너비 420px 타일로 미리 줄여 둡니다 (`imageSmoothingQuality = 'high'`).
2. cols × rows 크기의 필드 캔버스 `fA` · `fB` (`willReadFrequently: true`) 를 흰색으로 칠하고, 자세 A 타일(LA, RA)을 `fA` 에, 자세 B 타일(LB, RB)을 `fB` 에 각 손의 변환으로 그린 뒤 `getImageData`.
3. 보이는 캔버스를 지우고, 칸마다 필드를 골라 밝기 → 점 크기로 바꿔 `#0d0d0d` 원을 그립니다. 모든 점을 한 path 에 모아 `fill()` 한 번으로 그립니다.

### 격자
- `DPR = min(2, devicePixelRatio)`, `setTransform(DPR, 0, 0, DPR, 0, 0)`.
- 가로 간격 `step = max(5, W/205)`, 줄 간격 `rowStep = step × 2.05`, `cols = ceil(W/step)`, `rows = ceil(H/rowStep)`, 점 중심 `((i+.5)·step, (j+.5)·rowStep)`, 기본 반지름 `R = step × .46`.
- 칸별 seed `= .55·hash(i,j) + .45·hash(j·3.1, 7.7)`, `hash(a,b) = fract(sin(a·127.1 + b·311.7)·43758.5453)`.
- 창 크기가 바뀌면 전부 다시 계산합니다.

### 손 배치 · 움직임
- `LOOP = 20` 초, `a = 2π·t/LOOP`, 왼손 `ph = 0`, 오른손 `ph = π`.
- `hw = W·.53` (세로 화면 `W·.66`), `hh = hw · (.40·1520)/(.47·2688)`, `cy = H·.54` (세로 `H·.66`).
- `reach = (.035·sin(a+ph) + .012·sin(2a+1.3+ph))·W`. 왼손 `x = reach − W·.045`, 오른손 `x = W − hw + W·.045 − reach`.
- `scale = 1 + .07·sin(a+.9+ph)`, `rot = (왼손 1 / 오른손 −1)·.045·sin(a+2.1+ph)`.
- 필드에 그릴 때: 필드 비율 `(cols/W, rows/H)` 로 줄임 → 축(왼손은 왼쪽 끝, 오른손은 오른쪽 끝, `cy`)으로 이동 → 회전 → 확대 → 되돌림 → `drawImage(tile, x, cy − hh/2, hw, hh)`.

### 자세 바꾸기 (디졸브)
- `smooth` 는 clamp 된 smoothstep, `mixAt(t, on, off, dur) = smooth(on, on+dur, t)·(1 − smooth(off, off+dur, t))`.
- 왼쪽 절반(`i < cols/2`) `mL = mixAt(t, 6.2, 14.6, 1.6)`, 오른쪽 절반 `mR = mixAt(t, 2.4, 10.4, 1.6)`. 20초가 끝나기 전에 둘 다 자세 A 로 돌아와 루프가 이어집니다.
- 칸마다 `seed < m` 이면 `fB`, 아니면 `fA`.
- 바뀌는 중(`.001 < m < .999`)에 `|seed − m| < .12` 인 칸은 값에 `|seed − m|/.12` 를 곱하고, `hash(i + tick, j) ≤ .4` 이면 `.3` 을 더 곱합니다.

### 밝기 → 점
- `lum = red/255`, `v = clamp((1 − lum − .16)/.42)`, 반짝임 `v *= .86 + .14·sin(t·3.2 + seed·40)`.
- 가운데 사라짐: `cx = |(i+.5)/cols − .5|`, `v *= smooth(.035, .11, cx)` — 손가락 끝이 CTA 앞에서 사라져 닿지 않습니다.
- 문구 조용한 영역: `ex = cx/.2` (세로 `.44`), `ey = ((j+.5)·rowStep/H − .385)/.085` (세로 중심 `.33`), `v *= smooth(.85, 1.25, hypot(ex, ey))`.
- 단계 `LEVELS = [0, .26, .52, .78, 1]` 중 `v ≥ level − .13` 인 가장 높은 단계. 0 은 그리지 않고, 반지름 `R × level` (가장 낮은 단계만 `R × .38`).

### 줄 글리치
- `tick = floor(t·7)`. 줄마다 `hash(j, tick) > .965` 이면 그 줄을 `round((hash(tick, j) − .5)·8)` 칸 밀어 읽습니다 (`clamp(i − shift)`).

### 루프
- rAF 가 `render((now − t0)/1000)` 를 부르고, `render` 는 `t` 를 `[0, LOOP)` 로 감습니다. `window.__render = render` 를 노출합니다 (녹화용).
- 움직임 줄이기(`prefers-reduced-motion: reduce`)에서는 루프를 돌리지 않고 `t = 0` 한 장만 그립니다 (명세에 없는 접근성 보강).

## 반응형 (760px 이하)

- 내비: 오른쪽 알약만 남기고 링크를 숨김, `justify-content: space-between`, 패딩 `22px 18px 0`.
- 문구 `top: 20%`.
- 로고 줄은 두 줄로, `gap: 14px 24px`, 13px.
- 세로 화면에서는 손 띠가 `cy = .66H` 로 내려가고 `.66W` 로 넓어지며, 조용한 영역이 `.33H` · 너비 `.44` 로 옮겨 CTA 아래에 손이 놓입니다.

## 블로그에 맞게 바꾼 내용

| 자리 | 명세 원문 | 지금 내용 |
|---|---|---|
| 브랜드 | K 마크 + Kindred | `src/app/icon.svg` + `eunhaa tech` → `/` |
| 내비 링크 | Platform · Marketplace · Creators · Resources · Company | Blog(`/`) · About(`/about`) · 방명록(`/guestbook`) |
| 알약 | Sign In | GitHub (`github.com/rukadeveloper`, 새 탭) |
| 제목 | Reconnecting / Human Creativity. | Learning by / Writing Code. |
| 서브라인 | We’re not building another platform… | 배운 것을 내 말로 정리하고, 다시 꺼내 쓸 수 있게 남겨 두는 개발 기록장입니다. |
| CTA | Join the circle | 블로그 보러 가기 (`/`) |
| 로고 줄 | Lumenix · Velora · Nimbus · Quanta · Solstice · Parallax (가상) | JavaScript · TypeScript · React · Next.js · Node.js · Python (`simple-icons`, CC0. viewBox 24) |

로고는 각 회사 · 재단의 상표입니다. 블로그가 다루는 기술을 가리키는 용도로만 씁니다.

## 하지 않는 것

- 손을 영상 · GIF 로 바꾸지 않습니다. 매 프레임 캔버스에 그립니다.
- 무지개 밑빛 말고 색을 넣지 않습니다.
- 블로그 홈으로 가는 링크에 `<a href="/">` 나 `location.href` 를 쓰지 않습니다 (진입 규칙 참고).
