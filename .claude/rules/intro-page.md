---
paths:
  - "src/app/intro/**"
  - "src/proxy.ts"
  - "src/lib/intro-gate.ts"
---

# 인트로 페이지 (`/intro`) 규칙

Three.js 캔버스 하나에 언어 로고를 입체로 만든 3D 오브젝트를 올린 랜딩 화면입니다. 원본은 스크롤로 움직이는 단일 HTML 명세(히어로 캐러셀 → 뒷면 스토리 → 매니페스토 → 라인업)이고, **병 대신 언어 로고를 입체화**해 블로그에 맞게 옮깁니다. 아래 값은 명세 값이므로 임의로 바꾸지 않습니다.

## 진행 단계

| 단계 | 내용 | 상태 |
|---|---|---|
| 1 | 히어로 캐러셀 (입장 · 드래그 · 던지기 · 화살표 · 제목 굴림 · 원판 · 바닥 빛줄) | 완료 |
| 2 | 스토리 (뒷면 · 행 하이라이트 · 디코드 문구) | 예정 |
| 3 | 매니페스토 (구름 · 문자 텍스처 셰이더) | 예정 |
| 4 | 라인업 (어두운 바탕 · 멀어지는 줄) + 805vh 스크롤 트랙 | 예정 |

1단계에서는 스크롤이 없어 한 화면에 고정합니다 (`html[data-intro]` 가 스크롤을 끕니다). 4단계에서 스크롤 트랙을 붙일 때 이 잠금을 다시 정합니다.

## 이 화면만의 예외

CLAUDE.md 와 DESIGN.md 의 디자인 규칙은 이 화면에 적용하지 않습니다.

- 테마는 아래 피치 팔레트 하나뿐입니다. 라이트/다크 전환, `data-theme`, DESIGN.md 의 색 · 글래스 · 움직임 토큰과 `.glass*`, `.btn`, `.chip` 같은 클래스를 쓰지 않습니다.
- 분기는 모바일 퍼스트가 아니라 명세대로 `max-width: 820px` 또는 세로 화면, `max-width: 360px`, 낮은 가로 화면(`max-height: 520px` + 가로)입니다. 3D 배치는 화면비 `k = smoothstep(.72, 1.25, aspect)` (0 세로, 1 가로) 로 값을 섞습니다.
- 메뉴 시트는 `hidden` 속성으로 여닫습니다 (`data-open` + `inert` 규칙을 따르지 않습니다).
- 블로그 헤더 · 푸터가 붙지 않도록 라우트 그룹 `(site)` 밖(`src/app/intro`)에 둡니다.
- 그대로 지키는 규칙: 코드 주석은 한국어, 화면 문구는 한국어(제목 · 워드마크 · 버튼 같은 표시 글꼴 문구는 영어 대문자).

## 파일

| 파일 | 역할 |
|---|---|
| `page.tsx` | 서버 컴포넌트. 메타데이터, 글꼴, 전체 마크업 |
| `intro.css` | 스타일 전부. 이 저장소는 모든 `*.css` 를 Tailwind 로더로 처리해 CSS 모듈을 쓸 수 없으므로, 클래스와 키프레임에 `intro-` 접두사를 붙입니다 |
| `IntroNav.tsx` | 클라이언트. 워드마크 · MENU · BLOG 알약 · 메뉴 시트 |
| `IntroStage.tsx` | 클라이언트. 캔버스와 히어로 오버레이(제목 · 화살표 · 빛줄). three 는 이펙트 안에서 동적 import |
| `stage/languages.ts` | 언어 표 · 칸별 기울기 |
| `stage/scene.ts` | 렌더러 · 카메라 · 환경 조명 · 배경 셰이더 |
| `stage/logo-mesh.ts` | SVG path → 입체 지오메트리 · 재질 |
| `stage/carousel.ts` | 히어로 배치 함수 · 입장 진행 |
| `stage/math.ts` | 스프링 · 이징 · smoothstep 같은 작은 수학 함수 |
| `stage/index.ts` | `createStage()` — 캔버스 생성, 입력, 프레임 루프, 정리 |
| `StageLock.tsx` | 클라이언트. 인트로가 보이는 동안만 `html` 에 `data-intro` 를 붙임 |

cacheComponents 에서는 다른 화면으로 넘어가도 인트로의 DOM 이 숨겨진 채 남습니다. 그래서 화면에 묶인 것은 CSS 선택자(`:has()`)가 아니라 이펙트로 켜고 정리 함수에서 끕니다 — 바탕 잠금(`StageLock`), WebGL 장면(`IntroStage`: rAF 취소 · 리스너 해제 · 지오메트리 · 재질 · 렌더러 dispose)이 그렇게 되어 있습니다.

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

## 색 · 글꼴 (`.intro-root`)

```css
--cocoa: #4A1E17;   /* 글자 */
--coral: #E25B45;   /* 강조 */
--cream: #FFF3EC;
--peach: #FCD9C8;
--peach2: #F5B39A;  /* html · body 바탕 (globals.css 의 html[data-intro]) */
--ease: cubic-bezier(.22, 1, .36, 1);
--disp: var(--font-barlow), "Barlow Condensed", Impact, sans-serif;
--body: var(--font-manrope), var(--font-pretendard), system-ui, sans-serif;
```

| 글꼴 | 쓰임 | 불러오는 방법 |
|---|---|---|
| Barlow Condensed 800 · 900 italic | 워드마크, 제목 | `next/font/google` → `--font-barlow` (`display: block`) |
| Manrope 400–700 | 본문, 메뉴, 버튼 | `next/font/google` → `--font-manrope` |
| Pretendard | 한글 대체 | 루트 레이아웃의 `--font-pretendard` |

## 언어 (16칸, 칸 i 는 언어 `i % 8`)

| # | 제목 | 아이콘 (`simple-icons`, CC0) | 몸체 색 | 강조색 (원판 고리 · 빛줄) |
|---|---|---|---|---|
| 0 | JAVASCRIPT | `siJavascript` | #F7DF1E | #E8C400 |
| 1 | TYPESCRIPT | `siTypescript` | #3178C6 | #2A6BB0 |
| 2 | REACT | `siReact` | #61DAFB | #3FB8D9 |
| 3 | NEXT.JS | `siNextdotjs` | #1A1A1A | #4A1E17 |
| 4 | NODE.JS | `siNodedotjs` | #5FA04E | #4C8A3D |
| 5 | PYTHON | `siPython` | #3776AB | #FFD43B |
| 6 | JAVA | `siOpenjdk` | #E76F00 | #5382A1 |
| 7 | HTML · CSS | `siHtml5` | #E34F26 | #D2421C |

칸별 기울기(rad): .10, −.15, .07, −.09, .14, −.06, .12, −.13, .08, −.11, .15, −.07, .09, −.14, .06, −.10.

로고는 각 회사 · 재단의 상표입니다. 소개 화면에서 다루는 기술을 가리키는 용도로만 씁니다.

## 3D 장면

- 렌더러: antialias, pixel ratio `min(dpr, 1.5)`. 평균 프레임이 19.5ms 를 넘으면 .15 낮춤(최소 .7, 8초간 올리지 않음), 17.3ms 아래면 1.2초마다 .05 올림. ACESFilmic 노출 1.0, sRGB.
- 카메라: fov 30, z = 10. `VH = 20·tan(15°) = 5.359`, `W = VH × aspect`.
- 환경(PMREM, blur .035): 바탕 #2c1b17 과 원점을 향한 발광 판 — 1.0×16 흰색 ×7 (−5.5,0,4.2) / .55×16 흰색 ×5 (4.8,.5,3.6) / .35×16 #fff4ea ×3.5 (1.4,0,6.5) / 12×2.5 #fff1e6 ×2.4 (0,7.5,1.5) / 10×9 #ff9466 ×1.3 (0,−1,−8) / 7×8 #ffc6a8 ×1.1 (−8,−1,−3) / 7×8 #ffb08c ×.9 (8,−1,−2). DirectionalLight 흰색 1.1 (−3,5,6), AmbientLight #ffe8dc .35.
- **로고 오브젝트**: 24×24 SVG path → `SVGLoader.createShapes` → `ExtrudeGeometry`(깊이 = 높이의 .16, 얇은 bevel) → 가운데 정렬, 긴 변 1 로 정규화. 재질은 `MeshPhysicalMaterial` 몸체 색, roughness .22, clearcoat 1 (roughness .05), envMapIntensity 1.3 (명세 2.1 은 투명 유리 기준이라 불투명한 넓은 면에서는 반사가 색을 덮음). `opaque_fragment` 앞에서 `fresnel·.3 + smoothstep(.22,1.1,maxRGB)·.05` 를 더해 테두리가 빛나게 합니다. 명세의 병 높이(BH) 자리는 이 정규화 높이가 대신합니다.
- **원판**: 반지름 1 · 높이 .05 투명 원기둥(.22), 가산 토러스 고리(반지름 1, 굵기 .007, 강조색을 흰색 쪽으로 .25 섞고 ×1.5), 납작한 빛 번짐 판(3.2×1.1). 전체를 `(hc·1.25, hc·1.2, hc·1.25)` 로 키워 가운데 오브젝트 아래에 둡니다.
- **배경 셰이더**(전체 화면 쿼드): hero 팔레트 위 #EE9F84 / 아래 #F7BBA2, 빛 #FFD8C4 at (.5,.2), 양 .42, 반경 2.4. 필름 그레인 ±.0225.

## 히어로 캐러셀

- 가운데 오브젝트 크기: 명세의 병 높이 `lerp(.38,.5,k)·VH` · 너비 상한 `lerp(.36,.2,k)·W` 를 로고에 맞게 줄여, 로고의 긴 변 `size = min(lerp(.38,.5,k)·VH·lerp(.75,.6,k), lerp(.36,.2,k)·W·lerp(1.05,.75,k))`. 로고는 병보다 넓어 명세 값 그대로면 옆 오브젝트와 겹칩니다. 바닥 `y = lerp(−.3,−.35,k)·VH`, 원판 배율 `hc = size / 1.2`.
- 칸 거리 d: `x = sign(d)·(min(|d|,1)·s1 + max(0,|d|−1)·s2)·W` (s1 = `lerp(.36,.15,k)`, s2 = `lerp(.25,.104,k)`), 크기 `hc·(1 − .3·min(|d|,1) − .035·max(0,|d|−1))`, 바닥 높이 같음(옆은 +.05·VH), `z = −min(|d|,6)·.32`, `rotZ = tilt·smoothstep(0,1,|d|)`, `rotY = −d·.2`. 유휴: `y += sin(1.1t+1.7i)·.035`, `rotZ += sin(.8t+2.3i)·.025`, `rotY += sin(.5t+i)·.06`.
- 입장 1.9초: 칸별 진행 `(intro − .06·|d|)/.62`. 가운데는 화면 높이 75% 아래에서 easeOutCubic, 옆은 ±.85W 에서 easeOutBack(1.15) 으로 날아오며 기울기 ±.5 rad 가 풀림. 원판은 easeOutCubic 으로 솟고, 헤더는 70%, 제목 · 화살표는 75% 에 나타납니다.
- `car` 는 임계 감쇠 스프링(k = 46)으로 목표를 따릅니다. 드래그 한 칸 = `s1·innerWidth` px. 놓으면 속도(이동마다 lerp .35, ±14칸/초, 90ms 이상 멈추면 0)로 목표 `round(car + v·.22)`. 6px 미만 이동은 클릭 → 레이캐스트로 옆 오브젝트를 가운데로. ‹ › 버튼 · ← → 키는 ±1. 가로 휠은 `deltaX/220` 을 더하고 마지막 휠 130ms 뒤 스냅.
- hover: 옆 오브젝트가 .09 들리고 밝아짐, 커서 grab / grabbing / pointer.
- 밝기: 가운데 1, 옆은 최대 48% 어둡게 (색 ×(.42 + .58L), 발광 (.08 + .34L)×.2 — 로고는 몸체가 바로 보여 명세 발광 그대로면 색이 하얗게 뜸).
- 가운데 언어가 바뀌면 제목이 .62초 `--ease` 로 아래에서(뒤로 가면 위에서) 굴러 들어오고, 원판 고리 · 빛 · 바닥 빛줄 색은 `exp(−4dt)` 로 강조색을 따라갑니다 (CSS 변수 `--sc`, `--sg` 를 매 프레임 씀).

## 오버레이

- 헤더: 고정, 높이 84px, z-index 5. 처음 `opacity 0; translateY(-12px)`, `.intro-root` 에 `is-ui` 가 붙으면 .9초에 걸쳐 들어옴. 가운데 워드마크 `EUNHAA` + 위첨자 `TECH`(Manrope 600 9px): Barlow 900 italic 40px, 자간 −.01em, cream, `text-shadow 0 1px 14px rgba(120,40,20,.18)`. 오른쪽 48px 에서 34px 간격으로 MENU 버튼(4px 둥근 사각형 2×2, 간격 3px + "MENU" Manrope 700 13px 자간 .08em) 과 BLOG 알약(Manrope 800 12px, 자간 .08em, 1.5px cream 테두리, 패딩 9px 24px, hover 시 cream 채움 + cocoa 글자). BLOG 는 `next/link` 로 `/`.
- MENU 를 누르면 cream 시트 메뉴(Home · Blog · About · 방명록 · GitHub)가 열립니다. 딤 클릭 · Esc · 링크 클릭으로 닫히고, 버튼의 `aria-expanded` 와 시트의 `hidden` 을 함께 바꿉니다.
- 제목 h1: 왼쪽 3.4vw, 위 `max(92px, 11vh)`, Barlow 900 italic `clamp(54px, 7.4vw, 112px)`, 줄 간격 1, 자간 −.015em, cocoa, 대문자, 한 줄 높이로 잘라 세로로 굴림.
- 화살표: 오른쪽 3.2vw, 아래 `max(40px, 6vh)`, 간격 16px. 52px 원, 2px cream 테두리(.95), cream 채움 .08, 그림자 `0 4px 18px rgba(150,60,30,.12)`, 18px 꺾쇠(선 2). hover 채움 .22 + scale 1.06, 누름 .96.
- 바닥 빛줄 `.intro-strip`: 3px, 그러데이션 투명 → `--sc`(18%) → 흰색(50%) → `--sc`(82%) → 투명, 그림자 `0 0 22px 6px` · `0 0 70px 18px` 에 `--sg`.
- 캔버스는 opacity 0 에서 준비가 끝나면(글꼴 · 셰이더 컴파일) 1초에 걸쳐 1.

## 반응형

- 820px 이하 또는 세로: 헤더 68px, 워드마크 30px, "MENU" 글자 숨김. 제목 왼쪽 20px, 위 `max(78px, 10vh)`, `clamp(46px, 13vw, 80px)`. 화살표 48px, 오른쪽 아래 20px.
- 440px 이하: 워드마크를 왼쪽 20px 로 옮깁니다 (가운데면 오른쪽 버튼과 겹침).
- 360px 이하: 워드마크 25px, BLOG 패딩 7px 11px.
- 움직임 줄이기: 입장 생략, 유휴 흔들림 끔, 전환 거의 즉시. 드래그 · 화살표는 동작.

## 하지 않는 것

- 로고 오브젝트에 이미지 텍스처를 붙이지 않습니다. 모양은 SVG path 를 입체화한 것뿐입니다.
- 블로그 홈으로 가는 링크에 `<a href="/">` 나 `location.href` 를 쓰지 않습니다 (진입 규칙 참고).
- 320px ~ 2560px 어느 폭에서도 가로 스크롤이 생기면 안 됩니다.
