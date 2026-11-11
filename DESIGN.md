# DESIGN.md

이 블로그의 디자인 토큰과 클래스 정의입니다. 구현은 `src/app/globals.css` 에 있으며, 이 문서와 항상 같은 값을 유지합니다.

## 원칙

- **모바일 퍼스트**: 클래스의 기본값은 모바일(375px 기준)이고, `sm`(640px) · `lg`(1024px) 에서 키웁니다. Tailwind 유틸리티도 접두사 없는 값이 모바일입니다.
- **라이트 / 다크**: 색은 반드시 토큰으로 씁니다. `#fff` 같은 값을 컴포넌트에 직접 쓰지 않습니다. 테마는 `html[data-theme="light" | "dark"]` 로 정해지며 Tailwind 의 `dark:` 변형도 이 속성을 따릅니다.
- **글꼴**: Pretendard Variable (`--font-sans`), 코드는 Geist Mono (`--font-mono`).
- **터치 크기**: 누를 수 있는 요소의 높이는 최소 36px, 주요 버튼과 입력은 44px.
- 모서리는 둥글게(12–16px), 선은 얇게, 그림자는 꼭 떠 있어야 하는 요소(팝오버, 플로팅 버튼)에만 씁니다.

## 색 토큰

Tailwind 에서는 `bg-surface`, `text-muted`, `border-line` 처럼 이름 그대로 씁니다.

```css
:root {                          /* 라이트 */
  --background: #ffffff;         /* 페이지 바탕 */
  --elevated: #ffffff;           /* 카드, 팝오버 바탕 */
  --subtle: #f9fafb;             /* 아주 옅은 구획 바탕 */
  --surface: #f2f4f6;            /* 입력, 칩, 보조 버튼 바탕 */
  --surface-hover: #e5e8eb;
  --line: #e5e8eb;               /* 테두리, 구분선 */
  --foreground: #191f28;         /* 기본 글자 */
  --muted: #4e5968;              /* 보조 글자 */
  --meta: #8b95a1;               /* 날짜, 캡션, 플레이스홀더 */
  --strong: #3182f6;             /* 강조(브랜드) 색 */
  --strong-hover: #1b64da;
  --strong-soft: #e8f3ff;        /* 강조 색의 옅은 바탕 */
  --on-strong: #ffffff;
  --danger: #f04452;   --danger-soft: rgba(240, 68, 82, 0.1);
  --success: #03b26c;  --success-soft: rgba(3, 178, 108, 0.12);
  --warning: #dd7d02;  --warning-soft: rgba(254, 152, 0, 0.14);
  --detail-title: #191f28;       /* 본문 제목 */
  --detail-desc: #333d4b;        /* 본문 글자 */
}

[data-theme="dark"] {            /* 다크 */
  --background: #17171c;
  --elevated: #202027;
  --subtle: #1b1b21;
  --surface: #26262e;
  --surface-hover: #30303a;
  --line: #2c2c35;
  --foreground: #ececf0;
  --muted: #b0b0ba;
  --meta: #7e7e8a;
  --strong: #4593fc;
  --strong-hover: #64a8ff;
  --strong-soft: rgba(69, 147, 252, 0.16);
  --danger: #f66570;   --danger-soft: rgba(246, 101, 112, 0.16);
  --success: #3fd599;  --success-soft: rgba(63, 213, 153, 0.14);
  --warning: #ffa927;  --warning-soft: rgba(255, 169, 39, 0.14);
  --detail-title: #f2f2f5;
  --detail-desc: #c9c9d1;
}
```

그림자: `shadow-card` (카드가 떠 보여야 할 때), `shadow-pop` (팝오버, 모달).

## 레이아웃

```css
.container-page  { max-width: 1120px; margin-inline: auto; padding-inline: 20px; }  /* sm: 24px */
.container-prose { max-width: 768px;  margin-inline: auto; }                        /* 글 읽는 폭 */
.scroll-row      { display: flex; gap: 8px; overflow-x: auto; margin-inline: -20px; padding-inline: 20px; }
                 /* 모바일에서 칩·툴바를 한 줄로 가로 스크롤 */
```

간격은 Tailwind 기본 단위(4px)를 씁니다. 구획 사이 40–64px, 카드 안쪽 20px(sm: 24px), 요소 사이 8–16px.

## 타이포

```css
.text-display { font-size: 28px; line-height: 1.3;  font-weight: 800; letter-spacing: -0.02em; }  /* sm: 40px, lg: 48px — 페이지 제목 */
.text-title   { font-size: 22px; line-height: 1.35; font-weight: 700; letter-spacing: -0.01em; }  /* sm: 28px — 구획 제목 */
.text-heading { font-size: 18px; line-height: 1.4;  font-weight: 700; }                           /* sm: 20px — 카드 제목 */
.text-body    { font-size: 16px; line-height: 1.7; }
.text-body-sm { font-size: 15px; line-height: 1.6; }
.text-caption { font-size: 13px; line-height: 1.5;  color: var(--meta); }
```

## 컴포넌트 클래스

```css
/* 카드 */
.card     { background: var(--elevated); border: 1px solid var(--line); border-radius: 16px; }
.card-pad { padding: 20px; }                                         /* sm: 24px */

/* 버튼: .btn + 모양 하나. 작게는 .btn-sm, 가로로 꽉 채울 때 .btn-block */
.btn              { height: 44px; padding-inline: 16px; border-radius: 12px; font-size: 15px; font-weight: 600; }
.btn-sm           { height: 36px; padding-inline: 12px; border-radius: 10px; font-size: 14px; }
.btn-block        { width: 100%; }
.btn-primary      { background: var(--strong);  color: var(--on-strong); }   /* 화면의 주된 행동 하나 */
.btn-secondary    { background: var(--surface); color: var(--foreground); }
.btn-ghost        { color: var(--muted); }                                   /* 바탕 없음, hover 시 surface */
.btn-danger       { color: var(--danger); }                                  /* 삭제 (바탕 없음) */
.btn-danger-solid { background: var(--danger);  color: #fff; }               /* 삭제 확인 */
.btn-github       { background: #24292f;        color: #fff; }               /* GitHub 로그인 */
.icon-btn         { width: 40px; height: 40px; border-radius: 12px; color: var(--muted); }

/* 칩: 선택된 항목은 aria-current="page" 또는 data-active="true" */
.chip       { height: 36px; padding-inline: 14px; border-radius: 999px; background: var(--surface); color: var(--muted); font-size: 15px; }
.chip[aria-current="page"] { background: var(--foreground); color: var(--background); }
.chip-count { font-size: 13px; opacity: 0.7; }

/* 배지 */
.badge         { height: 22px; padding-inline: 8px; border-radius: 6px; background: var(--surface); color: var(--muted); font-size: 12px; font-weight: 600; }
.badge-primary { background: var(--strong-soft);  color: var(--strong); }
.badge-success { background: var(--success-soft); color: var(--success); }   /* 발행됨 */
.badge-warning { background: var(--warning-soft); color: var(--warning); }   /* 임시저장 */

/* 입력: input, select, textarea 공통 */
.field       { min-height: 44px; padding: 10px 14px; border-radius: 12px; background: var(--surface); font-size: 15px; }
.field:focus { border-color: var(--strong); background: var(--background); }
.field-label { margin-bottom: 6px; font-size: 13px; font-weight: 600; color: var(--muted); }

/* 기타 */
.nav-link { color: var(--muted); font-weight: 500; }      /* 현재 위치: aria-current="page" → foreground, 700 */
.skeleton { border-radius: 8px; background: var(--surface); animation: pulse; }
.empty    { padding: 56px 16px; border: 1px dashed var(--line); border-radius: 16px; text-align: center; color: var(--meta); }
```

같은 모양은 `src/components/ui/common` 의 컴포넌트(`Button`, `Chip`, `Card`)로도 쓸 수 있습니다. 링크나 `form` 버튼처럼 태그가 정해진 곳에서는 클래스를 직접 붙입니다.

## 본문 (`.post-body`)

글 본문은 HTML 문자열이라 클래스를 붙일 수 없으므로 `.post-body` 아래 태그 선택자로 꾸밉니다. 공개 글, 관리자 미리보기, 에디터(`.post-body.editor-body`)가 같은 규칙을 써서 쓰는 화면과 발행된 화면이 같게 보입니다.

- 읽는 폭 768px, 본문 16px(sm: 17px) / 줄 간격 1.8.
- `h2` 22px(sm: 26px), `h3` 19px(sm: 21px). 목차는 `h2`·`h3` 로 만듭니다.
- 표와 코드는 좁은 화면에서 가로로 스크롤합니다.
- **코드 블록**: 테마와 무관하게 어두운 맥 창 모양 — 상단 바(점 3개 + 언어 라벨), 줄 번호, 모서리 14px. 토큰은 `--cb-body`, `--cb-head`, `--cb-text`, `--cb-num`, `--cb-lang`. 언어 라벨은 `src/lib/code-languages.ts` 의 목록과 맞춥니다.
- **파일 트리** (`.file-tree`): 코드 블록과 짝을 이루는 창 모양 — `FILES` 상단 바, 폴더(강조 색)·파일 아이콘, 가지 선, `# 설명`.
- **목차** (`.toc-box`, `.toc-float`, `.toc-panel`): 글 위쪽 상자 + 스크롤하면 나타나는 고정 버튼. 고정 버튼은 모바일에서 오른쪽 아래, `lg` 이상에서 오른쪽 위.
