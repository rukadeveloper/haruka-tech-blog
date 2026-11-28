# 데이터 (Supabase)

> 관련 파일: src/lib/db.ts, src/lib/*.ts, db/schema.sql, Server Actions 파일
> 목차: [AGENTS.md](../AGENTS.md)

- 테이블: `posts`, `categories`, `comments`, `guestbook` (정의는 `db/schema.sql`).
- 접근은 `src/lib/db.ts` 의 `db()` 하나로만 합니다. service role 키를 쓰는 서버 전용 클라이언트(`server-only`)라 클라이언트 컴포넌트에서 import 하면 빌드가 실패합니다.
- 읽기는 `src/lib/*.ts` 의 함수, 쓰기는 Server Actions (`src/app/(site)/admin/actions.ts`, `src/app/(site)/posts/[slug]/comment-actions.ts`, `src/app/(site)/guestbook/actions.ts`).
- 카테고리는 2단계이며 DB 에는 경로(`"FE"`, `"FE/Next.js"`)와 `position` 만 저장하고 트리는 읽을 때 만듭니다. 글의 `category` 는 그 경로 문자열입니다.
