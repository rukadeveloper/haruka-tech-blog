# 레이아웃 · 라우트 그룹

> 관련 파일: src/app/layout.tsx, src/app/(site)/layout.tsx, src/components/SiteFrame.tsx, src/app/not-found.tsx
> 목차: [AGENTS.md](../AGENTS.md)

- 루트 레이아웃(`src/app/layout.tsx`)은 `html`, `body`, 글꼴, 테마 초기화 스크립트만 가집니다.
- 블로그 헤더 · 본문 폭 · 푸터는 `src/components/SiteFrame.tsx` 이고, `src/app/(site)/layout.tsx` 가 블로그 화면에 씌웁니다.
- `src/app/not-found.tsx` 는 없는 주소와 `notFound()` 를 함께 받습니다. 루트 레이아웃 바로 아래에 그려지므로 `SiteFrame` 을 직접 감쌉니다 (차단된 관리자 IP 도 이 화면을 봅니다).
