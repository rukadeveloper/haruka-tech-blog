# 인트로 페이지 (`/intro`)

> 관련 파일: src/app/intro/, src/proxy.ts, src/lib/intro-gate.ts — 디자인 수치는 .claude/rules/intro-page.md
> 목차: [AGENTS.md](../AGENTS.md)

- 따뜻한 흰 바탕에 제목 · CTA · 기술 로고 줄을 두고, 그 뒤에 서로를 향해 뻗는 두 손을 점 매트릭스로 매 프레임 캔버스에 그리는(`DotHands.tsx`) 랜딩 화면입니다. 구성 파일은 `src/app/intro/` 에 모여 있고 스타일은 `intro.css` 하나입니다.
- 디자인 수치, 글꼴, 손 시트 이미지 주소, 캔버스 계산, 반응형 동작은 `.claude/rules/intro-page.md` 에 고정해 두었습니다. 인트로를 고칠 때는 그 파일을 따르고, 값을 바꾸면 그 파일도 함께 고칩니다.
- 외부에 기대는 것: 손 시트 이미지(images.higgs.ai, CORS 필요). 로고 줄 아이콘은 `simple-icons` 의 path 입니다. 캔버스 루프는 이펙트 정리 함수에서 멈춥니다.
- 블로그 홈(`/`)에 처음 들어오거나 홈에서 새로고침하면 `src/proxy.ts` 가 `/intro` 로 보냅니다. 사이트 안 이동은 보내지 않으며, 글 · 카테고리 · About · 방명록 · 관리자 주소는 대상이 아닙니다. 판정은 `src/lib/intro-gate.ts` (`Sec-Fetch-Dest: document`).
- 그래서 홈으로 가는 링크는 `next/link` 로 씁니다. 문서를 새로 받는 이동(`<a href="/">`, `location.href`)은 인트로로 되돌아옵니다.
- 인트로가 보이는 동안 `StageLock` 이 `html` 에 `data-intro` 를 붙이고, `globals.css` 의 `html[data-intro]` 규칙이 바탕을 인트로 색(#f7f7f5)으로 바꾸고 스크롤과 색 번짐을 끕니다. `:has()` 로 화면 안의 표식을 찾으면 안 됩니다 — cacheComponents 는 떠난 화면의 DOM 을 숨긴 채 남겨 두므로 블로그 화면까지 잠깁니다.
