"use client";

import type { Editor } from "@tiptap/react";
import Select from "@/components/ui/common/Select";
import { CODE_LANGUAGES } from "@/lib/code-languages";
import { FILE_TREE_SAMPLE } from "@/lib/file-tree";
import { Icon } from "./icons";

function Btn({
  label,
  title,
  active,
  disabled,
  wide,
  onClick,
}: {
  label: React.ReactNode;
  title: string;
  active?: boolean;
  disabled?: boolean;
  /** 아이콘 옆에 글자가 붙는 버튼 (정사각이 아님) */
  wide?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      // 에디터 선택(포커스)이 풀리지 않도록
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`pressable inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg text-sm whitespace-nowrap disabled:opacity-30 ${
        wide ? "px-2.5" : "w-9"
      } ${active ? "bg-strong-soft font-semibold text-strong" : "text-muted hover:bg-surface hover:text-foreground"}`}
    >
      {label}
    </button>
  );
}

const Sep = () => <span className="mx-1 h-5 w-px shrink-0 bg-line" aria-hidden />;

/**
 * 에디터 툴바: 삽입 | 제목 | 글자 | 목록 | (표 안에서만) 표 편집 | 실행 취소 (DESIGN.md "글 편집 화면").
 * 헤더 아래에 붙어 따라오고, 모바일은 한 줄 가로 스크롤이다.
 */
export default function EditorToolbar({ editor, onPickImage }: { editor: Editor; onPickImage: () => void }) {
  const c = () => editor.chain().focus();
  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("링크 주소 (비우면 링크 제거)", prev ?? "https://");
    if (url === null) return;
    if (url === "") c().unsetLink().run();
    else c().extendMarkRange("link").setLink({ href: url }).run();
  };
  // 코드 블록: 언어를 골라 삽입하고, 코드 블록 안에서는 언어 변경·해제
  const codeActive = editor.isActive("codeBlock");
  const codeLang = (editor.getAttributes("codeBlock").language as string | null | undefined) ?? "";
  const knownLang = CODE_LANGUAGES.some((l) => l.value === codeLang);
  const onCodeLanguage = (value: string) => {
    if (!value) return;
    if (value === "__off") return void c().toggleCodeBlock().run();
    if (codeActive) c().updateAttributes("codeBlock", { language: value }).run();
    else c().toggleCodeBlock({ language: value }).run();
  };
  const inTable = editor.isActive("table");

  return (
    <div
      role="toolbar"
      aria-label="서식"
      className="scroll-row sticky top-[68px] z-20 items-center gap-0.5! border-y border-line bg-background py-2 sm:top-[72px] lg:mx-0 lg:rounded-xl lg:border lg:bg-elevated lg:px-2 lg:py-1.5"
    >
      {/* 삽입 묶음(코드 블록·파일 트리·사진·표)을 앞에 둔다 — 모바일 가로 스크롤에서도 바로 보이도록 */}
      <Select
        title="코드 블록 — 언어를 골라 삽입 (코드 안에서는 언어 변경)"
        aria-label="코드 블록 언어"
        placeholder="{ } 코드 블록"
        keepFocus
        value={codeActive ? codeLang || "plaintext" : ""}
        onChange={onCodeLanguage}
        options={[
          ...(codeActive && !knownLang && codeLang ? [{ value: codeLang, label: codeLang }] : []),
          ...CODE_LANGUAGES.map((l) => ({ value: l.value, label: l.label })),
          ...(codeActive ? [{ value: "__off", label: "코드 블록 해제", tone: "danger" as const }] : []),
        ]}
        className={`h-9 shrink-0 rounded-lg border px-2 text-sm ${codeActive ? "border-transparent bg-strong-soft font-semibold text-strong" : "border-line bg-background text-muted [&>span]:text-muted"}`}
      />
      <Btn label={<Icon.inlineCode />} title="인라인 코드" active={editor.isActive("code")} onClick={() => c().toggleCode().run()} />
      <Btn label={<Icon.image />} title="사진 업로드" onClick={onPickImage} />
      <Btn
        wide
        label={
          <>
            <Icon.fileTree />
            파일 트리
          </>
        }
        title="파일 트리 삽입 — 들여쓰기로 폴더 구조를 적으면 트리로 그려집니다"
        onClick={() => c().insertContent({ type: "fileTree", attrs: { tree: FILE_TREE_SAMPLE } }).run()}
      />
      <Btn label={<Icon.table />} title="표 삽입" onClick={() => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />
      <Sep />
      <Btn label="H2" title="제목 1 (H2)" active={editor.isActive("heading", { level: 2 })} onClick={() => c().toggleHeading({ level: 2 }).run()} />
      <Btn label="H3" title="제목 2 (H3)" active={editor.isActive("heading", { level: 3 })} onClick={() => c().toggleHeading({ level: 3 }).run()} />
      <Btn label="H4" title="제목 3 (H4)" active={editor.isActive("heading", { level: 4 })} onClick={() => c().toggleHeading({ level: 4 }).run()} />
      <Btn label={<Icon.paragraph />} title="본문" active={editor.isActive("paragraph")} onClick={() => c().setParagraph().run()} />
      <Sep />
      <Btn label={<Icon.bold />} title="굵게" active={editor.isActive("bold")} onClick={() => c().toggleBold().run()} />
      <Btn label={<Icon.italic />} title="기울임" active={editor.isActive("italic")} onClick={() => c().toggleItalic().run()} />
      <Btn label={<Icon.underline />} title="밑줄" active={editor.isActive("underline")} onClick={() => c().toggleUnderline().run()} />
      <Btn label={<Icon.strike />} title="취소선" active={editor.isActive("strike")} onClick={() => c().toggleStrike().run()} />
      <Btn label={<Icon.link />} title="링크" active={editor.isActive("link")} onClick={setLink} />
      <Sep />
      <Btn label={<Icon.bulletList />} title="글머리 기호 목록" active={editor.isActive("bulletList")} onClick={() => c().toggleBulletList().run()} />
      <Btn label={<Icon.orderedList />} title="번호 목록" active={editor.isActive("orderedList")} onClick={() => c().toggleOrderedList().run()} />
      <Btn label={<Icon.quote />} title="인용구" active={editor.isActive("blockquote")} onClick={() => c().toggleBlockquote().run()} />
      <Btn label={<Icon.hr />} title="구분선" onClick={() => c().setHorizontalRule().run()} />
      {inTable && (
        <>
          <Sep />
          <Btn wide label="+열" title="오른쪽에 열 추가" onClick={() => c().addColumnAfter().run()} />
          <Btn wide label="+행" title="아래에 행 추가" onClick={() => c().addRowAfter().run()} />
          <Btn wide label="−열" title="열 삭제" onClick={() => c().deleteColumn().run()} />
          <Btn wide label="−행" title="행 삭제" onClick={() => c().deleteRow().run()} />
          <Btn wide label="표 삭제" title="표 삭제" onClick={() => c().deleteTable().run()} />
        </>
      )}
      <span className="ml-auto flex shrink-0 gap-0.5 pl-1">
        <Btn label={<Icon.undo />} title="실행 취소" disabled={!editor.can().undo()} onClick={() => c().undo().run()} />
        <Btn label={<Icon.redo />} title="다시 실행" disabled={!editor.can().redo()} onClick={() => c().redo().run()} />
      </span>
    </div>
  );
}
