"use client";

import type { Editor } from "@tiptap/react";
import Select from "@/components/ui/common/Select";
import { CODE_LANGUAGES } from "@/lib/code-languages";
import { Icon } from "./icons";

function Btn({ label, title, active, disabled, onClick }: { label: React.ReactNode; title: string; active?: boolean; disabled?: boolean; onClick: () => void }) {
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
      className={`pressable inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full px-1.5 text-[13px] font-semibold whitespace-nowrap disabled:opacity-30 ${
        active ? "bg-white/20 text-(--bento-on-ink)" : "text-(--bento-on-ink)/70 hover:bg-white/10 hover:text-(--bento-on-ink)"
      }`}
    >
      {label}
    </button>
  );
}

const Sep = () => <span className="mx-1 h-4 w-px shrink-0 bg-white/20" aria-hidden />;

/**
 * 쓰기 영역 아래 가운데에 떠 있는 어두운 서식 알약 (DESIGN.md "글 편집 화면").
 * 글자 서식만 둔다 — 사진 · 파일 트리 · 표 · 구분선처럼 넣기만 하는 것은 블록 패널이 맡는다.
 */
export default function FormatPill({ editor }: { editor: Editor }) {
  const c = () => editor.chain().focus();
  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("링크 주소 (비우면 링크 제거)", prev ?? "https://");
    if (url === null) return;
    if (url === "") c().unsetLink().run();
    else c().extendMarkRange("link").setLink({ href: url }).run();
  };
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
      className="flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full bg-(--bento-ink) p-1.5 text-(--bento-on-ink) shadow-pop [scrollbar-width:none]"
    >
      <Select
        title="코드 블록 — 언어를 골라 삽입 (코드 안에서는 언어 변경)"
        aria-label="코드 블록 언어"
        placeholder="{ } 코드"
        keepFocus
        value={codeActive ? codeLang || "plaintext" : ""}
        onChange={onCodeLanguage}
        options={[
          ...(codeActive && !knownLang && codeLang ? [{ value: codeLang, label: codeLang }] : []),
          ...CODE_LANGUAGES.map((l) => ({ value: l.value, label: l.label })),
          ...(codeActive ? [{ value: "__off", label: "코드 블록 해제", tone: "danger" as const }] : []),
        ]}
        className={`h-8 shrink-0 rounded-full px-3 text-[13px] font-semibold ${
          codeActive ? "bg-white/20 text-(--bento-on-ink)" : "text-(--bento-on-ink)/70 hover:bg-white/10 [&>span]:text-(--bento-on-ink)/70"
        }`}
      />
      <Btn label={<Icon.inlineCode />} title="인라인 코드" active={editor.isActive("code")} onClick={() => c().toggleCode().run()} />
      <Sep />
      <Btn label={<Icon.bold />} title="굵게" active={editor.isActive("bold")} onClick={() => c().toggleBold().run()} />
      <Btn label={<Icon.italic />} title="기울임" active={editor.isActive("italic")} onClick={() => c().toggleItalic().run()} />
      <Btn label={<Icon.underline />} title="밑줄" active={editor.isActive("underline")} onClick={() => c().toggleUnderline().run()} />
      <Btn label={<Icon.strike />} title="취소선" active={editor.isActive("strike")} onClick={() => c().toggleStrike().run()} />
      <Btn label={<Icon.link />} title="링크" active={editor.isActive("link")} onClick={setLink} />
      <Sep />
      <Btn label="H2" title="제목 1 (H2)" active={editor.isActive("heading", { level: 2 })} onClick={() => c().toggleHeading({ level: 2 }).run()} />
      <Btn label="H3" title="제목 2 (H3)" active={editor.isActive("heading", { level: 3 })} onClick={() => c().toggleHeading({ level: 3 }).run()} />
      <Btn label={<Icon.paragraph />} title="본문" active={editor.isActive("paragraph")} onClick={() => c().setParagraph().run()} />
      <Sep />
      <Btn label={<Icon.bulletList />} title="글머리 기호 목록" active={editor.isActive("bulletList")} onClick={() => c().toggleBulletList().run()} />
      <Btn label={<Icon.orderedList />} title="번호 목록" active={editor.isActive("orderedList")} onClick={() => c().toggleOrderedList().run()} />
      <Btn label={<Icon.quote />} title="인용구" active={editor.isActive("blockquote")} onClick={() => c().toggleBlockquote().run()} />
      {inTable && (
        <>
          <Sep />
          <Btn label="+열" title="오른쪽에 열 추가" onClick={() => c().addColumnAfter().run()} />
          <Btn label="+행" title="아래에 행 추가" onClick={() => c().addRowAfter().run()} />
          <Btn label="−열" title="열 삭제" onClick={() => c().deleteColumn().run()} />
          <Btn label="−행" title="행 삭제" onClick={() => c().deleteRow().run()} />
          <Btn label="표 삭제" title="표 삭제" onClick={() => c().deleteTable().run()} />
        </>
      )}
      <Sep />
      <Btn label={<Icon.undo />} title="실행 취소" disabled={!editor.can().undo()} onClick={() => c().undo().run()} />
      <Btn label={<Icon.redo />} title="다시 실행" disabled={!editor.can().redo()} onClick={() => c().redo().run()} />
    </div>
  );
}
