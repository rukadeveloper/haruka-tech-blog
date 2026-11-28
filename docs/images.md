# 이미지

> 관련 파일: src/app/(site)/admin/upload/, src/app/media/, src/lib/s3.ts, public/images/
> 목차: [AGENTS.md](../AGENTS.md)

- 에디터 업로드: `POST /admin/upload` → 비공개 S3 버킷 `images/uploads/` → `/media/[...key]` 가 대신 내려줍니다. 4MB 제한(Vercel 요청 본문 한도).
- 티스토리에서 가져온 글의 이미지와 썸네일은 `public/images/` 의 정적 파일입니다.
