# 글 본문
글은 DB 에 마크다운(가져온 옛 글) 또는 HTML(에디터 저장)로 저장되고, `src/lib/posts.ts` 가 HTML 로 바꿔 `.post-body` 스타일로 그린다.

## 언제 읽나
- 글 본문 렌더링(마크다운 · HTML 변환, 코드 하이라이트, 파일 트리, 콜아웃, 목차, 이미지)을 고칠 때
- 글 데이터(draft · featured · 썸네일) 처리나 `content/` 폴더, 커버 이미지 스크립트를 만질 때
- 에디터가 저장하는 HTML 이 공개 화면에서 어떻게 보이는지 확인할 때

## 관련 파일
- `src/lib/posts.ts` — 글 읽기 · 캐시 · 렌더 함수(`renderMarkdown`, `renderHtml`, `markdownToEditorHtml`), `resolveThumbnail`
- `src/lib/file-tree.ts` — 들여쓰기 텍스트 → 파일 트리 HTML (서버 · 에디터 공용)
- `src/lib/highlight.ts`, `src/lib/code-languages.ts` — rehype-pretty-code 옵션, 언어 목록 · 별칭
- `src/lib/toc.ts` — h2 · h3 에 id 를 붙이고 목차 항목 생성
- `src/lib/images.ts` — `markImagesPending` (`data-pending`)
- `src/lib/post-covers.json` — 글 slug → 원래 커버 경로 (`resolveThumbnail` 의 비교 기준)
- `src/lib/cache.ts` — 글 캐시 태그 · 수명
- `src/components/ui/post/PostArticleBody.tsx`, `PostToc.tsx`, `PostRow.tsx`
- `src/app/(site)/posts/[slug]/page.tsx`, `src/app/(site)/admin/posts/[slug]/preview/page.tsx`
- `src/app/(site)/admin/upload/route.ts`, `src/app/media/[...key]/route.ts`, `src/lib/s3.ts` — 이미지 업로드 · 제공
- `src/app/globals.css` — `.post-body`, 코드 블록, 언어 라벨, 파일 트리, 이미지 로딩 스피너, 목차
- `src/app/(studio)/admin/editor/extensions/Callout.ts` — 콜아웃 블록(저장 형태)
- `content/` — 옛 글 원본(`posts/*.md`, `categories.json`, `comments/`)
- `public/images/post-covers/`, `public/images/thumbs/`, `public/images/posts/`
- `scripts/generate-post-covers.mjs`, `generate-thumbnails.mjs`, `import-tistory*.mjs`, `migrate-to-supabase.mjs`

## 꼭 지킬 규칙
- 본문 렌더링은 `getPost` → `renderHtml` / `renderMarkdown` 한 경로로만 한다. 페이지에서 글 HTML 을 따로 변환하지 않는다 — 공개 글과 관리자 미리보기가 같은 결과를 내야 한다 (`posts.ts`, `preview/page.tsx`).
- `format` 이 `"html"` 이면 `renderHtml`, 그 밖에는 `renderMarkdown` 이다. 새 형식을 추가하면 `PostFormat` · `loadPostSource` · `getPost` · 미리보기를 함께 고친다 (`posts.ts`).
- 임시저장(`draft: true`) 글은 공개 화면에서 숨긴다: `getAllPosts` 는 draft 를 거르고 `getPost` 는 draft 면 오류를 던진다. 관리자 목록은 `loadPostMetas`(draft 포함)를 쓴다 (`posts.ts`).
- 글 읽기 함수는 `"use cache"` + `cacheTag(POSTS_TAG)` + `cacheLife(LIFE.posts)` 를 쓴다. 글을 바꾸는 서버 액션은 `updateTag` 로 태그를 비운다 (`cache.ts`, `posts.ts`).
- 코드 블록 배경은 CSS(`.post-body figure[data-rehype-pretty-code-figure]`, `--cb-body`)가 그린다. rehype-pretty-code 는 `keepBackground: false` 로 토큰 색(`one-dark-pro`)만 입힌다. 테마 배경을 JS 옵션으로 되돌리지 않는다 (`highlight.ts`, `globals.css`).
- 코드 언어를 추가하면 `code-languages.ts` 의 `CODE_LANGUAGES`(필요하면 `LANG_ALIAS`)와 `globals.css` 의 "코드 블록 언어 라벨" 규칙(공개 글용 + `.editor-body pre` 용 두 선택자)을 함께 고친다. 둘이 어긋나면 라벨이 안 나온다 (`code-languages.ts` 주석).
- `lib/file-tree.ts` · `lib/toc.ts` · `lib/images.ts` · `lib/code-languages.ts` 는 클라이언트(에디터 · 미리보기)에서도 가져오므로 `node:fs` 등 node 전용 모듈을 가져오지 않는다 — 번들이 깨진다 (각 파일 첫 주석).
- 본문 이미지의 로딩 표시는 `markImagesPending` 이 `data-pending` + 인라인 `onload` / `onerror` 로 단다. 본문은 HTML 문자열이라 React `onLoad` 를 쓸 수 없기 때문이다. 본문 컨테이너는 `suppressHydrationWarning` 을 유지한다 (`images.ts`, `PostArticleBody.tsx`).
- `.post-body` 에서 `margin` 단축 속성을 쓰지 않는다. 레이어 밖 CSS 라 Tailwind `mt-*` 를 덮어쓴다 — `margin-left/right: auto` 만 쓴다 (`globals.css`).
- 본문 색은 `--detail-title` · `--detail-desc` · `--strong` · `--rule` 등 토큰만 쓴다. hex 를 쓰지 않는다. 예외: 코드 블록 `--cb-*`, 언어 라벨 색 (`globals.css`).
- 업로드 이미지는 비공개 S3 에 두고 `/media/images/uploads/<이름>.<확장자>` 프록시로만 제공한다. 프록시는 `^images/uploads/[\w-]+\.(png|jpg|jpeg|gif|webp)$` 만 통과시킨다. S3 주소를 본문에 직접 쓰지 않는다 (`media/[...key]/route.ts`, `s3.ts` `mediaUrl`).
- 업로드는 관리자만, 허용 확장자 png · jpg · jpeg · gif · webp, 4MB 이하다 (Vercel 본문 한도 4.5MB 보다 작게). 한도를 바꿀 때 이 수치와 에디터 안내를 함께 고친다 (`upload/route.ts`).
- 콜아웃은 `<div data-callout="warning">…</div>` 로 저장한다. 공개 · 미리보기는 `.post-body div[data-callout]` 가, 에디터 안은 `(studio)/studio.css` 가 모양을 정한다 (`Callout.ts`, `globals.css`).
- 목차는 h2 · h3 만 대상이고 제목이 2개 미만이면 만들지 않는다. 제목에 이미 `id` 가 있으면 보존하고 없으면 `toc-<순번>` 을 붙인다 (`toc.ts`).

## 저장 형식과 렌더 파이프라인
- 글 한 건 = DB(Supabase `posts` 테이블)의 한 행: 메타(`slug,title,date,category,description,tags,thumbnail,draft,featured`) + `format` + `body`. `loadPostSource(slug)` 가 읽고 `PostSource { meta, content, format }` 를 돌려준다. 없으면 오류.
- `format: "markdown"` — 티스토리에서 가져온 옛 글. `renderMarkdown`: `remark-parse` → `remark-gfm` → `remark-rehype`(`allowDangerousHtml`) → `rehype-raw` → `rehype-pretty-code` → `rehype-stringify`. 마크다운 안의 HTML 은 그대로 통과한다.
- `format: "html"` — 에디터(Tiptap)가 저장한 글. `renderHtml`: `rehype-parse`(fragment) → `rehypeFileTree`(`div[data-file-tree]` 를 트리 HTML 로 교체) → `rehype-pretty-code` → `rehype-stringify`(`allowDangerousHtml`).
- `markdownToEditorHtml` — 마크다운 글을 에디터에 불러올 때만 쓰는 순수 HTML 변환(`remarkGfm` + `rehypeRaw`, 하이라이트 · 파일 트리 변환 없음). 에디터가 열면 형식이 html 로 바뀐다(`FormatPill`, `actions.ts` 가 `format: "html"` 로 저장).
- `getPost(slug)` → `{ meta, html }` (캐시됨). 페이지는 `PostArticleBody` 에서 `buildToc(html)` → `markImagesPending(body)` 를 거쳐 `<div class="post-body">` 에 `dangerouslySetInnerHTML` 로 넣는다.
- 정렬: `byNewest` — 날짜 내림차순, 같으면 slug 를 숫자 인식 비교로 내림차순.
- 카테고리 필터: `inCategory(post, "FE")` 는 `FE` 와 `FE/*` 모두, `"FE/Next.js"` 는 정확히 일치.

## 파일 트리 블록
- 저장 형태: `<div data-file-tree="들여쓰기 텍스트">`. `renderHtml` 의 `rehypeFileTree` 가 `renderFileTreeHtml` 로 `<div class="file-tree"><ul>…` 로 교체한다. 서버(공개 글 · 미리보기)와 에디터가 같은 함수를 쓴다. 마크다운 경로(`renderMarkdown`)에는 변환이 없다.
- 입력은 두 형식을 섞어 써도 된다: (1) 공백 2칸(또는 탭)마다 한 단계 들여쓰기, (2) `tree` 명령 출력(`├── └── │`) 붙여넣기. 이름 뒤 `/` 이거나 하위 항목이 있으면 폴더. ` # 설명` 으로 오른쪽에 설명. 들여쓰기 단위는 0 이 아닌 가장 작은 들여쓰기(1–8칸).
- 항목: `<li class="ft-dir|ft-file" data-ext="확장자">` + `<span class="ft-name">` + 선택적 `<span class="ft-comment">`. 이름 · 설명은 HTML 이스케이프한다.
- 스타일(`globals.css` `.post-body .file-tree`): 코드 블록과 짝인 창 모양 — 상단 바(`FILES`) + 폴더 · 파일 아이콘(CSS mask, 테마 색을 따름) + 가지 선. 폴더 아이콘 `--strong`, 파일 아이콘 `--meta`.

## 코드 하이라이트
- `highlight.ts` 의 `prettyCodeOptions`: 테마 `one-dark-pro`, `keepBackground: false`, `defaultLang: { block: "plaintext" }`(언어 없는 블록도 같은 창 디자인), `getHighlighter` 는 `createHighlighter({ ...opts, langAlias: LANG_ALIAS })`.
- `code-languages.ts`: 에디터 선택 목록 `CODE_LANGUAGES`(javascript · typescript · react · nextjs · html · css · json · bash · python · sql · plaintext, 값은 `<code class="language-값">` 로 저장). `LANG_ALIAS`: `react` · `nextjs` → `tsx` 문법. `data-language` 에는 원래 이름이 남아 라벨에 쓰인다.
- 창 모양(`globals.css`): 공개 글은 rehype-pretty-code 가 만든 `figure[data-rehype-pretty-code-figure]`, 에디터는 `.post-body.editor-body pre` 에 같은 디자인. 상단 바 40px(점 3개 + 오른쪽 언어 라벨), 본문 14px / 1.7, 줄 번호는 `[data-line]::before` 카운터.
- 언어 라벨(`::after content`)과 색은 언어마다 CSS 규칙이다: JavaScript(js 포함) · TypeScript(ts 포함) · React · JSX · TSX · Next.js · HTML · CSS · JSON · Bash · Python · SQL · TEXT(plaintext). 목록에 없는 언어는 라벨이 비어 있다(추정: `::after` 에 content 가 없으면 표시되지 않는다).

## 콜아웃
- 저장 형태 `<div data-callout="warning">…블록…</div>`(에디터 확장 `Callout.ts`, 기본 kind `warning`). 공개 · 미리보기에서는 `.post-body div[data-callout]` — 바탕 `--warning-soft`, 글자 `--detail-title`, 패딩 16×20px, 반경 12px, 첫 · 마지막 자식 여백 0.
- 같은 안내 상자로 인용문(`blockquote`)도 있다: 왼쪽 3px `--strong` 선 + `--subtle` 바탕.

## 목차
- `buildToc(html)` (`toc.ts`): 정규식으로 `<h2>` · `<h3>` 를 찾아 텍스트(태그 제거 · 엔티티 해제 · 공백 정리)를 얻는다. 비어 있지 않은 제목이 2개 미만이면 `items: []` 로 목차를 숨긴다. h3 만 있는 글은 h3 를 최상위로 본다. 번호는 `1.` / `1.1.`. 반환: id 를 붙인 HTML + `TocItem { id, text, depth: 0|1, number }`.
- `PostToc` 와 화면 배치는 `docs/design "글 상세"` 를 따른다. `.post-body h2, h3` 의 `scroll-margin-top: 100px`.

## 이미지 · 썸네일 · 커버
- 본문 이미지: `.post-body img` 는 `max-width: 100%`, 가운데, 반경 12px. 로드 전에는 `img[data-pending]` 이 스피너(SVG 데이터 URI 배경, 최소 220px 높이)를 보인다. `onload` / `onerror` 가 속성을 지운다(오류여도 스피너가 남지 않게).
- 업로드: 에디터 → `POST /admin/upload`(관리자만) → S3 `images/uploads/<타임스탬프>.<확장자>` 저장 → 응답 `{ url: mediaUrl(key) }` → 본문에는 `/media/images/uploads/...` 가 들어간다. 제공은 `src/app/media/[...key]/route.ts` 가 S3 객체를 스트리밍하고 `Cache-Control: public, max-age=31536000, immutable`. 키가 규칙에 안 맞으면 404, 없으면 404, 그 외 오류는 500.
- `PostMeta.thumbnail`: DB 값이다. 글 목록 화면(`PostRow`)에는 썸네일이 없고, 관리자 카드(`AdminPostCard`)에서 쓴다.
- `resolveThumbnail`(`posts.ts`): DB 의 `thumbnail` 이 `post-covers.json` 의 원래 값(`/media/images/uploads/cover-<slug>-….webp` 등)과 같으면 `/images/post-covers/<slug>.webp` 로 바꾼다. 다르면(에디터에서 직접 바꾼 경우) DB 값을 그대로 쓴다 — 에디터에서 한 수정이 우선한다.
- `public/images/post-covers/<slug>.webp` — 새 디자인의 글 커버(`scripts/generate-post-covers.mjs` 가 만들고 `post-covers.json` 을 갱신하는 것으로 보인다(추정)). `public/images/thumbs/<slug>.webp` — `generate-thumbnails.mjs` 가 만든 제목 · 카테고리 썸네일(1280×800), 같은 스크립트가 DB `thumbnail` 을 `/images/thumbs/<slug>.webp` 로 갱신한다. `public/images/posts/<slug>/` — 글별 이미지 폴더(용도는 추정: 가져온 옛 글의 본문 이미지).

## `.post-body` 스타일
`globals.css`. 공개 글 · 관리자 미리보기 · 에디터가 함께 쓴다.
- 컨테이너: 최대 768px, 좌우 `auto`, `overflow-wrap: break-word`, `word-break: normal`, 글자색 `--detail-desc`.
- 문단 16px(sm 17px) / 1.8, `margin: 20px 0 14px`. h2 22px(sm 26px, 위 48px), h3 19px(sm 21px, 위 36px), h4 16px 굵게, h5 · h6 16px 보통. 제목은 `--detail-title`.
- 인용문, 콜아웃, 목록(`decimal` / `disc`, 마커 `--meta`), 구분선(`--rule`), 표(가로 스크롤, 머리 `--subtle`), 이미지 · 영상 · iframe, 링크(`--strong` 밑줄 굵게), 굵게, 인라인 `code`(`--code-bg`, `font: 86% var(--font-mono)`).
- 코드 블록 · 파일 트리 · 이미지 스피너는 위 절과 같다.
- 에디터 보정: `.editor-body` 표(`table-layout: fixed`, 셀 테두리 `--rule`, 선택 셀 `--strong-soft`), 빈 문단 placeholder.

## `PostArticleBody`
`ui/post/PostArticleBody.tsx` — 글 머리(카테고리 배지 · 제목 · 날짜) + 목차 + `.post-body`. 공개 글 페이지와 관리자 미리보기가 함께 쓰고, 클라이언트에서도 쓸 수 있도록 서버 전용 모듈(`lib/categories`)을 가져오지 않고 `categoryHref` 규칙을 복제해 둔다. 제목이 비면 `(제목 없음)`. 목차가 없으면 본문에 `mt-8` 을 준다.

## `content/` 폴더
- 구성: `content/posts/*.md`(옛 마크다운 글 원본, frontmatter 포함), `content/categories.json`(카테고리 트리), `content/comments/`.
- 현재 역할: 런타임 코드(`src/`)는 `content/` 를 읽지 않고 글은 DB 에서 읽는다. `content/` 는 가져오기 · 이전 스크립트의 입력이다 — `scripts/import-tistory*.mjs` 가 티스토리 글을 이 폴더에 만들고(추정), `scripts/migrate-to-supabase.mjs` 가 글 · 카테고리 · 댓글을 Supabase 로 upsert 한다(여러 번 실행해도 같은 결과). 따라서 이미 이전한 글을 `content/*.md` 에서 고쳐도 공개 화면에 반영되지 않는다(스크립트를 다시 실행하기 전까지).
- slug 는 파일 이름(숫자 또는 `draft-<번호>` 등)과 대응한다(추정).

## draft · featured
- `draft: true` — 공개 목록 · 글 상세에서 숨김, 관리자에서만 보임(`임시저장` 배지, 관리자 목록 · 카드는 수정 화면으로 링크). 티스토리 임시저장 글을 가져온 것도 draft 다.
- `featured: true` — 관리자에서 `추천` 배지(`badge-primary`)로 표시한다. 공개 화면에서는 아직 쓰지 않는다 (홈 목록 `BlogList` 에 추천 구획이 없다). 공개 화면에 추천 구획을 만들면 이 줄과 `PostMeta` · `db/schema.sql` 주석을 함께 고친다.
- 둘 다 에디터 사이드(`BentoSide`)의 체크 · 저장 액션(`admin/actions.ts`)이 정한다.

## 바꿀 때 함께 고칠 것
- 렌더 파이프라인(rehype 플러그인)을 바꾸면: `renderMarkdown` · `renderHtml` · `markdownToEditorHtml` 세 함수를 비교하고, 공개 글 · 미리보기 · 에디터 결과가 같은지 확인한다.
- 본문 HTML 형태(블록 종류)를 바꾸면: 에디터 확장, `globals.css` `.post-body`, `studio.css`(에디터 안 모양), 이 문서.
- 코드 언어를 추가하면: `code-languages.ts` + `globals.css` 언어 라벨 규칙(두 선택자).
- 파일 트리 문법을 바꾸면: `file-tree.ts`(파서 · 렌더) + 에디터의 트리 블록 + `.file-tree` CSS.
- 업로드 · 프록시 규칙을 바꾸면: `upload/route.ts` 의 확장자 · 크기, `media/[...key]/route.ts` 의 `KEY` 정규식, `lib/s3.ts`를 같이 맞춘다.
- 썸네일 · 커버를 바꾸면: `post-covers.json` · `resolveThumbnail` · 생성 스크립트 · `public/images/*`.
- 캐시 수명 · 태그를 바꾸면: `lib/cache.ts` 와 이를 쓰는 읽기 함수 · 쓰기 액션의 `updateTag`.
- 헤더 높이를 바꾸면 목차 기준선(`scroll-margin-top`, `ACTIVE_OFFSET`)도 고친다(`docs/design`).
