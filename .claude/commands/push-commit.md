---
description: 새 브랜치를 만들고 변경 사항을 커밋한 뒤 PR 을 엽니다
argument-hint: "[브랜치 이름 또는 작업 설명]"
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git branch:*), Bash(git checkout:*), Bash(git switch:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(gh pr:*), Bash(npm run lint:*)
---

현재 변경 사항을 새 브랜치에 커밋하고 PR 을 만듭니다. 인자: $ARGUMENTS

1. `git status` 와 `git diff` 로 변경 내용을 확인합니다. 변경이 없으면 그 사실만 알리고 멈춥니다.
2. `npm run lint` 를 실행해 오류가 있으면 고치지 말고 보고한 뒤 멈춥니다.
3. 브랜치
   - 지금 `main` 이면 새 브랜치를 만듭니다. 이름은 인자가 브랜치 이름 형태면 그대로, 아니면 변경 내용에서 `feat/…`, `fix/…`, `chore/…` 형식으로 짓습니다.
   - 이미 작업 브랜치라면 그 브랜치를 그대로 씁니다.
4. 커밋
   - 기능 단위로 나눠 커밋합니다. 서로 관련 없는 변경은 한 커밋에 섞지 않습니다.
   - `.env*` 등 비밀 값이 든 파일은 올리지 않습니다.
   - 메시지는 이 저장소의 기존 커밋처럼 한국어 한 줄 요약으로 씁니다.
   - 배포가 필요 없는 변경(문서, 설정)만 있으면 메시지 끝에 `[skip deploy]` 를 붙입니다.
5. `git push -u origin <브랜치>` 로 올립니다.
6. `gh pr create` 로 `main` 대상 PR 을 만듭니다. 이미 PR 이 있으면 새로 만들지 않고 그 주소를 알려줍니다. 본문에는 무엇을 왜 바꿨는지와 확인 방법을 적습니다.
7. PR 주소를 알려줍니다.
