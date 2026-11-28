---
name: blog-design-check
description: haruka-tech-blog 의 화면 변경이 DESIGN.md(색 · 움직임 · 면 토큰, 컴포넌트 클래스, 모바일 퍼스트, 라이트/다크, 움직임 줄이기 · 대비 높이기)와 인트로 · 에디터 rules 를 지키는지 검사한다. 컴포넌트 · CSS 를 바꾼 뒤 디자인 검토를 할 때, 또는 "디자인 규칙 맞는지 봐줘", "토큰 안 쓴 곳 찾아줘" 요청에 쓴다. 새 애니메이션을 설계하는 일은 animate 스킬, 실제 화면 확인은 blog-qa 를 쓴다.
---

# 디자인 규칙 검사

## 왜 토큰만 써야 하나

이 블로그는 라이트/다크, `prefers-reduced-motion`, `prefers-contrast` 를 **토큰 값을 바꾸는 방식으로 한곳에서** 처리합니다 (DESIGN.md "원칙"). 컴포넌트에 `#fff` 나 `200ms` 를 직접 쓰면 그 요소만 다크 모드 · 움직임 줄이기 설정에서 빠집니다. 그래서 검사의 핵심은 "값을 직접 쓴 곳"을 찾는 것입니다.

## 절차

1. **영역 정하기** — 파일 위치로 기준 문서를 고릅니다.
   - `src/app/(site)/**`, `src/components/**`, 그 밖 → `DESIGN.md`
   - `src/app/intro/**` → `.claude/rules/intro-page.md` (자체 색 · 글꼴 · 움직임 허용, 수치가 그 파일과 같은지 본다)
   - `src/app/(studio)/**` → `.claude/rules/editor-bento.md` (자체 색 · 글꼴 허용, 움직임은 DESIGN.md 토큰)
2. **자동 후보 뽑기**

   ```bash
   node .claude/skills/blog-design-check/scripts/scan-design.mjs          # 바뀐 파일만
   node .claude/skills/blog-design-check/scripts/scan-design.mjs --all    # 전체
   ```

   결과는 후보입니다. 아래 "예외"에 해당하면 버립니다.
3. **직접 읽어서 보는 항목** (스크립트가 못 잡음)
   - 모바일 퍼스트: 접두사 없는 클래스가 375px 기준이고 `sm:` · `lg:` 로 키우는가. 데스크톱 값을 기본으로 두고 `max-*` 로 줄이고 있지 않은가.
   - 터치 크기: 누를 수 있는 요소 최소 36px, 주요 버튼 · 입력 44px.
   - 눌림 반응: 링크 · 카드에 `.pressable` (카드는 `.pressable-lg`). `.btn` · `.chip` · `.icon-btn` 은 이미 들어 있음.
   - 여닫는 요소: 조건부 렌더링이 아니라 `data-open` + `inert`, 팝오버 `transform-origin` 이 연 버튼 쪽.
   - 면: 카드 테두리 · 그림자 없음, 구획은 `--line` 구분선. 그림자는 팝오버 · 모바일 메뉴 · 플로팅 버튼(`--shadow-pop`)만. 면 클래스는 `.glass` · `.glass-thick` · `.glass-tint`.
   - 글 목록(`PostRow`)은 썸네일이 없고, 제목 · 요약만 글로 링크 (DESIGN.md "글 목록").
   - 다크 모드에서 대비가 무너지는 조합(토큰을 썼어도 `--meta` 위에 `--muted` 같은 경우).
   - 화면 문구가 한국어인가.
4. **보고** — design-reviewer 의 보고 기준(파일 · 줄 · 규칙 출처 · 시나리오 · 심각도)으로 씁니다.

## 예외 (지적하지 않음)

- 로고: `#191f28` 바탕 + 흰 점은 테마와 무관한 고정색입니다 (DESIGN.md "로고"). `PostRow` 의 작성자 로고 타일, `BrandMark`, `icon.svg` 가 여기에 해당합니다.
- `src/app/globals.css` 의 토큰 정의 자체.
- `src/app/layout.tsx` 의 `viewport.themeColor` 값 — 메타 태그라 CSS 변수를 쓸 수 없습니다. 대신 `--background` 라이트/다크 값과 같은지 봅니다.
- 인트로 · 에디터의 자체 색 · 글꼴 값이 각 rules 파일의 값과 같으면 정상입니다. 값이 rules 파일과 **다르면** 지적합니다.
- `transition: none` 이나 `0ms` 처럼 움직임을 끄는 값.

## 더 볼 때

- 움직임 자체의 품질(곡선, 길이, 끊김)은 `animate` · `animation-performance` 스킬로 따로 봅니다. 이 스킬은 규칙 준수만 봅니다.
