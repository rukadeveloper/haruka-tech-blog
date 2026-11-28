# 글 형식 · 본문 · 에디터

> 관련 파일: src/lib/posts.ts, src/lib/file-tree.ts, src/lib/highlight.ts, src/app/(studio)/admin/editor/ — 에디터 디자인은 .claude/rules/editor-bento.md
> 목차: [AGENTS.md](../AGENTS.md)

- `format: "html"` 은 Tiptap 에디터로 저장한 글(`renderHtml`), `"markdown"` 은 티스토리에서 가져온 글(`renderMarkdown`)입니다. 마크다운 글을 에디터로 열면 `markdownToEditorHtml` 로 변환되고, 저장하면 항상 html 이 됩니다.
- `draft: true` 인 글은 공개 조회에서 모두 빠집니다.
- `featured: true` 는 관리자 에디터의 발행 설정에서 켜는 추천 표시입니다. DB · 관리자에는 남아 있지만 지금 공개 화면(홈)은 이 값을 쓰지 않습니다.
- 에디터는 벤토 블록 에디터입니다 (`src/app/(studio)/admin/editor/`, 값과 배치는 `.claude/rules/editor-bento.md`). `PostStudio`(폼 · 상태 · Tiptap · 업로드 · 자동 임시저장 · 발행 흐름)가 `BentoTopBar`(임시저장 · 미리보기 · 발행), `StudioWriter`(커버 드롭존 · 제목 카드 · 본문 블록 카드 · `BlockAddMenu` · `FormatPill`), `BentoSide`(발행 전 체크 · 통계 · 카테고리 · 목차 · URL 카드)를 묶고, 미리보기는 `PreviewOverlay` 가 `StudioPreview`(`previewHtml` 800ms 디바운스)로 그립니다. 발행 전 체크 규칙은 `checklist.ts` 이고 '필요' 항목이 있으면 발행 전에 `PublishConfirm` 으로 한 번 묻습니다. 폼 필드 이름(`title`, `category`, `slug`, `date`, `description`, `tags`, `thumbnail`, `featured`, `content`, `intent`, `originalSlug`)은 `savePost` 가 읽는 이름과 같아야 하고, 입력칸의 Enter 는 제출하지 않습니다 (발행은 버튼으로만).
- 콜아웃 블록은 `<div data-callout="warning">` 로 저장되고(Tiptap 노드 `extensions/Callout.ts`), 공개 글에서는 `.post-body div[data-callout]` 스타일로 그립니다.
- 파일 트리 블록은 `<div data-file-tree>` 로 저장되고 `src/lib/file-tree.ts` 가 트리 HTML 로 바꿉니다. 코드 블록 하이라이팅 옵션은 `src/lib/highlight.ts`, 지원 언어는 `src/lib/code-languages.ts` 입니다.
- 본문 스타일은 `.post-body` 하나를 공개 글, 관리자 미리보기, 에디터가 함께 씁니다. `PostArticleBody` 는 에디터 미리보기(클라이언트)에서도 import 되므로 서버 전용 모듈을 끌어오면 안 됩니다.
