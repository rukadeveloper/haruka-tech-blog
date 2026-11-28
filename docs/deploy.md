# 배포

> 관련 파일: vercel.json, .env.example
> 목차: [AGENTS.md](../AGENTS.md)

- `main` 에 푸시하면 Vercel 이 배포합니다. 커밋 메시지에 `[skip deploy]` 가 있으면 `vercel.json` 의 `ignoreCommand` 가 빌드를 건너뜁니다.
- 필요한 환경 변수는 `.env.example` 에 있습니다.
