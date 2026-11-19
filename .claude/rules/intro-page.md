---
paths:
  - "src/app/intro/**"
---

# 인트로 페이지 (`/intro`) 규칙

한 화면(스크롤 없음)을 꽉 채운 영상 위에 헤더 · 히어로 · 통계를 올린 랜딩 화면입니다. 원본은 정적 HTML + CSS + JS 명세이고, 이 저장소에서는 Next.js 라우트로 옮겼습니다. **디자인(배치 · 글꼴 · 수치 · 움직임)은 명세 그대로 두고, 내용만 블로그에 맞게 바꿨습니다.** 아래 값은 임의로 바꾸지 않습니다.

## 이 화면만의 예외

CLAUDE.md 와 DESIGN.md 의 디자인 규칙은 이 화면에 적용하지 않습니다.

- 테마는 검은 바탕 하나뿐입니다. 라이트/다크 전환, `data-theme`, DESIGN.md 의 색 · 글래스 · 움직임 토큰과 `.glass*`, `.btn`, `.chip` 같은 클래스를 쓰지 않습니다.
- 색과 수치는 `intro.module.css` 의 `.root` 에 선언한 자체 변수와 명세의 값을 그대로 씁니다.
- 분기는 모바일 퍼스트가 아니라 명세대로 `max-width: 720px`, `max-width: 420px`, `max-height: 700px` 입니다.
- 모바일 메뉴는 `hidden` 속성으로 여닫고 나타날 때만 움직입니다 (`data-open` + `inert` 규칙을 따르지 않습니다).
- 블로그 헤더 · 푸터가 붙지 않도록 라우트 그룹 `(site)` 밖(`src/app/intro`)에 둡니다.
- 그대로 지키는 규칙: 코드 주석은 한국어, 화면 문구는 한국어(도트 글꼴은 한글이 없어 헤드라인만 영어), DB 읽기는 `src/lib` 의 캐시된 함수.

## 파일

| 파일 | 역할 |
|---|---|
| `page.tsx` | 서버 컴포넌트. 메타데이터, 글꼴, 외부 스타일시트, 전체 마크업, 통계 값 조회 |
| `intro.module.css` | 스타일 전부. 클래스 이름이 흔해서(`.page`, `.header`, `.anim`) CSS 모듈로 가둡니다 |
| `IntroHeader.tsx` | 클라이언트. 로고 · 내비 · 우측 필 · 모바일 메뉴 |
| `CountUp.tsx` | 클라이언트. 통계 숫자 카운트업 |
| `BgVideo.tsx` | 클라이언트. 배경 영상 (자동 재생 보장) |

`src/app/globals.css` 의 `html:has([data-intro])` 규칙이 바탕을 검게 하고 스크롤과 색 번짐(`body::before`)을 끕니다. 최상위 요소의 `data-intro` 속성을 지우면 안 됩니다.

## 배경 영상

부모 `.bg` 는 `#000`, `position: absolute; inset: 0; overflow: hidden`. 영상은 `position: absolute; inset: 0; object-fit: cover; pointer-events: none; z-index: 0` 이고 `autoplay muted loop playsinline` 입니다. 주소는 아래 것만 씁니다.

```
https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4
```

헤더 · 히어로 · 통계 · 모바일 메뉴는 `z-index: 1` 로 영상 위에 둡니다.

## 글꼴

| 글꼴 | 쓰임 | 불러오는 방법 |
|---|---|---|
| Inter 400 · 500 · 600 | UI | `next/font/google` → `--font-inter` |
| Pretendard | UI 의 한글 | 루트 레이아웃의 `--font-pretendard` (Inter 에 한글이 없어 스택에 추가) |
| BubbledotICG-FinePos | 헤드라인, 통계 기호 | OnlineWebFonts CDN `<link>` — **로컬 Bubbledot 파일을 쓰지 않습니다** |
| Geist Pixel Circle | 위 글꼴의 대체 | `src/app/fonts/GeistPixel-Circle.woff2` → `next/font/local` → `--font-geist-pixel` (400, `swap`, preload 안 함) |
| Font Awesome 6.5.2 | 신뢰 배지 아이콘 | cdnjs `<link>` + `integrity` |

```
https://db.onlinewebfonts.com/c/8cb707a9b8a73f8a7403336b861c3074?family=BubbledotICG-FinePos
https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css
integrity: sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A==
```

BubbledotICG 는 상용 글꼴이고 이 CDN 의 권리 관계는 확인되지 않았습니다. 공개 배포 전에 라이선스를 확인합니다.

## CSS 변수 (`.root`)

```css
--bg: #000000;
--text: #ffffff;
--muted: #8e8e8e;
--nav-text: #2e2e2e;
--pill-dark: #28282a;
--sign-in-text: #c8c8c8;
--nav-shadow: 0 4px 14px rgba(0, 0, 0, 0.16);
--trust-bg: #28282a;
--trust-border: rgba(255, 255, 255, 0.4);
--trust-text: #c4c2c3;
--font-sans: var(--font-inter), var(--font-pretendard), "Segoe UI", system-ui, sans-serif;
--font-display: "BubbledotICG-FinePos", var(--font-geist-pixel), monospace;
```

## 배치

`.page`: 세로 flex, 가운데 정렬, `padding: clamp(16px, 2.4vh, 28px) clamp(14px, 3vw, 32px)`, 높이 `100vh` / `100dvh`, `overflow: hidden`. 위에서부터 헤더(줄어들지 않음) · 히어로(`flex: 1`, 가운데) · 통계(줄어들지 않음).

### 헤더 (데스크톱)

가운데 정렬한 한 줄, `max-width: 720px`, `gap: clamp(18px, 2.8vw, 28px)`. 입장: `slideDown 0.7s cubic-bezier(0.22, 1, 0.36, 1) both` (`opacity: 0; translateY(-18px)` 에서).

- **로고**: 원형 `clamp(40px, 4.4vw, 46px)`, 바탕 `#fff`, 그림자 `--nav-shadow`. 그림은 원 안에서 72% 크기(`object-fit: contain`, grid 로 가운데), hover `scale(1.04)`.
- **내비 필**: 흰 바탕, 높이 `clamp(44px, 5.2vw, 48px)`, `max-width: 430px`, `flex: 1`, `padding: 4px 8px`, 모서리 999, 같은 그림자. 링크는 Inter 500, `clamp(13px, 1.4vw, 15px)`, 자간 `-0.01em`, 색 `#2e2e2e`, 불투명도 기본 `0.5` / hover `0.75` / 현재 `1`. 현재 표시는 글자 아래 3×3px 검은 점 세 개(`::after` + `box-shadow` `-5px` / `+5px`, `bottom: 5px`).
- **우측 필**: 바탕 `#28282a`, 글자 `#c8c8c8`, 내비와 같은 높이 · 모서리 · 그림자. hover 는 바탕 `#323234`, 글자 `#fff`, `translateY(-1px)`.

### 히어로

세로 배치, 가운데 정렬, `max-width: 900px`.

- **신뢰 배지 줄**: `--trust-size: clamp(36px, 4.5vw, 42px)` (420px 이하 34px), 아래 여백 `clamp(16px, 2.5vh, 26px)`, 지연 `0.05s`.
  - 아바타 3개: 바깥 고리는 `--trust-size` 크기, 바탕 `#28282a`, 테두리 `1px solid rgba(255,255,255,0.4)`, **`padding: 5px`**. 그 안을 흰 원이 채웁니다. 아이콘은 `#111`, 크기 `calc(var(--trust-size) * 0.34)`.
  - 겹침: 뒤 아바타 `margin-left: calc(var(--trust-size) * -0.42)`, `z-index` 1 / 2 / 4. hover 시 `-2px` / `-4px` / `-2px` (0.35s).
  - 알약: 아바타와 같은 높이 · 바탕 · 테두리, 모서리 999, 왼쪽 여백 `-0.42 × trust-size`, 왼쪽 안쪽 여백 `0.58 × trust-size`. 글자는 Inter 500, `#c4c2c3`, `clamp(12px, 1.4vw, 13.5px)` (모바일 12px).
- **헤드라인**: 줄마다 `<span>` 블록 두 개. 표시 글꼴, **단색 흰색**, `clamp(28px, 6.2vw, 80px)`, 자간 `-0.04em` (720px 이하 `-0.08em`, 420px 이하 `-0.09em`), 줄 간격 `1.12` (`1.05` / `1.04`), `white-space: nowrap`, `overflow: hidden`. 줄마다 `opacity: 0; translateY(14px)` 에서 `headlineFade 0.85s cubic-bezier(0.22, 1, 0.36, 1)`, 지연 `0.12s` / `0.3s`. 제목 요소 자체에는 입장 애니메이션을 걸지 않습니다.
- **서브헤드**: `max-width: min(500px, 92%)`, 크기 `clamp(calc(13.5px + 2pt), calc(1.55vw + 2pt), calc(16.5px + 2pt))`, 색 `#d0d0d0`, 불투명도 `0.8`, 줄 간격 `1.55`, 굵기 400, 지연 `0.28s`.
- **CTA**: 흰 알약에 검은 글자, Inter 600, `clamp(13.5px, 1.5vw, 14.5px)`, `padding: clamp(11px, 1.6vh, 13px) clamp(22px, 3vw, 28px)`. 빛 번짐 `0 0 0 1px rgba(255,255,255,0.15), 0 0 22px rgba(255,255,255,0.32), 0 0 44px rgba(255,255,255,0.12)`. hover 는 `translateY(-2px) scale(1.02)` + 더 강한 빛. 입장은 `revealPulse`, 지연 `0.4s`.

### 통계

4열 그리드(720px 이하 2×2), `max-width: 920px`. 항목마다 기호(표시 글꼴, 흰색) → 숫자 → 흐린 라벨.

- 기호 `clamp(22px, 3vw, 33px)`, 숫자는 Inter 흰색 `clamp(18px, 2.2vw, 26px)` · 자간 `-0.025em` · `tabular-nums`, 라벨은 `#8e8e8e` · `clamp(11px, 1.2vw, 12.5px)`.
- 입장 지연 `0.5s`, `0.58s`, `0.66s`, `0.74s`.
- 카운트업: easeOutCubic, 길이 `1500 + i*80`ms, 시작 지연 `480 + i*90`ms, IntersectionObserver `threshold: 0.25` 로 한 번만.

## 입장 애니메이션

`.anim` 은 `opacity: 0; translateY(22px) scale(0.98); blur(6px)` 에서 `reveal 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards` 로 들어오고, 지연은 인라인 `--d` 로 줍니다. `prefers-reduced-motion: reduce` 에서는 애니메이션을 모두 끄고 최종 상태를 바로 보여 줍니다 (카운트업도 최종 값으로).

## 모바일 (720px 이하)

- 데스크톱 내비와 우측 필을 숨깁니다. 헤더는 양 끝 정렬: 왼쪽 로고 48×48, 오른쪽 원형 버거 48×48 (`#28282a`, 흰 막대 18×1.5px 세 개).
- 열리면 버거는 흰 원 + 검은 X (막대 `translateY(±6.5px)` + `rotate(±45deg)`).
- 딤: 화면 전체 고정, `rgba(0,0,0,0.62)`, blur 6px, `overlayIn 0.28s`.
- 흰 시트 메뉴: 헤더 아래 가운데, 모서리 28px, `padding: 22px 18px 20px`, 그림자 `0 20px 60px rgba(0,0,0,0.45)`, `menuIn 0.38s`. 링크 + 가로로 꽉 찬 우측 필, 차례로 `linkIn`, 현재 표시 점 세 개는 `bottom: 8px`.
- 닫히는 조건: 딤 클릭, Esc, 링크 클릭, 창 너비가 720px 를 넘을 때. 버튼의 `aria-expanded` 와 메뉴의 `hidden` 을 함께 바꿉니다.
- 통계는 2열.
- 그 밖에 420px 이하에서 헤드라인 · 신뢰 배지 값을 조정하고, 높이 700px 이하에서 히어로 간격을 줄입니다.

## 하지 않는 것

- 히어로에 카드를 넣지 않습니다. 화면 전체가 하나의 구성입니다.
- 헤드라인에 그러데이션 · 반짝임 · 스캔 애니메이션을 넣지 않습니다. 단색 흰색입니다.
- 신뢰 배지 아바타를 꽉 찬 흰 원으로 만들지 않습니다. 어두운 고리 안의 작은 흰 원입니다.
- 로고는 글자가 아니라 실제 원형 마크입니다.
- 내비 · 로고 그림자는 `0 4px 14px rgba(0,0,0,0.16)` 보다 무겁게 하지 않습니다.
- 첫 화면에 헤더 · 신뢰 배지 · 헤드라인 · 서브헤드 · CTA · 통계가 모두 보여야 합니다 (데스크톱과 모바일 모두).

## 블로그에 맞게 바꾼 내용

| 자리 | 명세 원문 | 지금 내용 |
|---|---|---|
| 로고 | `assets/logo.webp` | `src/app/icon.svg` (블로그 로고) |
| 내비 | Home / Product / Case Studies / Contact | Home(`/intro`, 현재) / Blog(`/`) / About(`/about`) / 방명록(`/guestbook`) |
| 우측 필 | Sign in | GitHub (`github.com/rukadeveloper`, 새 탭) |
| 신뢰 배지 | Microsoft · Amazon · Google / Trusted by 2000+ Enterprises | `fa-js` · `fa-react` · `fa-python` / FE · BE · AI 공부 기록 |
| 헤드라인 | Intelligence / Designed To Evolve | 그대로 |
| 서브헤드 | Build applications that reason, adapt and collaborate… | 개발과 AI를 공부하며 이해한 것을 내 말로 정리하고, 다시 꺼내 쓸 수 있게 남깁니다. |
| CTA | Get Started | 블로그 보러 가기 (`/`) |

통계 네 개는 기호와 순서를 그대로 두고 값만 실제 데이터로 바꿨습니다.

| 기호 | 값 | 접미사 | 라벨 | 출처 |
|---|---|---|---|---|
| `<` | 카테고리 수 (대분류 + 소분류) | `개` | 다루는 주제 | `getCategories()` + `flattenCategories()` |
| `%` | 100 | `%` | 직접 만든 블로그 | 고정값 |
| `*` | 첫 글부터 지난 날 수 | `일` | 기록을 이어 온 날 | `getAllPosts()` 의 가장 오래된 날짜. 날 수는 브라우저에서 계산 (캐시된 화면에서도 오늘 기준) |
| `#` | 공개 글 수 | `편` | 작성한 글 | `getAllPosts()` |
