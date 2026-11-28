# 인증 · 관리자 접근

> 관련 파일: src/lib/session.ts, src/lib/auth.ts, src/lib/admin-ip.ts, src/proxy.ts, src/app/(site)/admin/
> 목차: [AGENTS.md](../AGENTS.md)

- GitHub OAuth 로 만든 서명 쿠키 하나(`gh_session`, `src/lib/session.ts`)를 댓글 작성자와 관리자가 함께 씁니다.
- 관리자 = **허용 IP** 이면서 **`ADMIN_GITHUB_LOGIN` 계정으로 로그인**한 경우입니다.
  - `src/proxy.ts` 가 `/admin` 이하 요청을 IP 로 걸러 허용되지 않으면 404 를 보여줍니다. (같은 파일이 홈 진입을 인트로로 보내는 일도 합니다 — "인트로 페이지" 참고)
  - `isAdmin()` (`src/lib/auth.ts`) 도 IP 를 다시 확인하므로 모든 Server Action 이 같은 규칙을 따릅니다. 각 관리자 액션은 스스로 `requireAdmin()` 을 호출해야 합니다.
  - 판정 로직은 `src/lib/admin-ip.ts`.
- 허용 IP 설정: `ADMIN_ALLOWED_IPS` 에 쉼표로 구분해 적습니다 (IPv4/IPv6, CIDR 가능). 개발 모드에서는 localhost 가 자동 허용되고, 프로덕션에서 비어 있으면 전부 차단됩니다. 차단된 IP 는 서버 로그에 찍히므로 그대로 복사해 추가하면 됩니다.
- 관리자 화면은 그리드 배치입니다 (DESIGN.md "관리자 화면"). 글 관리는 카드 그리드(`AdminPostCard`)가 기본이고 리스트로 바꿀 수 있으며, 고른 보기는 `localStorage` 의 `admin-post-view` 에 둡니다. 카테고리는 대분류마다 카드 하나인 그리드입니다. 미리보기 · 수정 · 삭제 버튼은 두 보기가 `PostActions` 를 함께 씁니다.
