"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import { savePost } from "../actions";
import { ResizableImage } from "./ResizableImage";

export type PostFormValues = {
  slug: string;
  title: string;
  date: string;
  category: string;
  description: string;
  tags: string;
  thumbnail: string;
  html: string;
};

const field =
  "w-full rounded border border-line bg-transparent px-3 py-2 text-sm";

async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/admin/upload", { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "업로드 실패");
  return json.url as string;
}

function Btn({
  label,
  title,
  active,
  disabled,
  onClick,
}: {
  label: React.ReactNode;
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      // 에디터 선택(포커스)이 풀리지 않도록
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`h-8 min-w-8 rounded px-2 text-sm disabled:opacity-30 ${
        active ? "bg-foreground text-background" : "hover:bg-surface"
      }`}
    >
      {label}
    </button>
  );
}

const Sep = () => <span className="mx-1 h-5 w-px bg-line" />;

function Toolbar({ editor, onPickImage }: { editor: Editor; onPickImage: () => void }) {
  const c = () => editor.chain().focus();
  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("링크 주소 (비우면 링크 제거)", prev ?? "https://");
    if (url === null) return;
    if (url === "") c().unsetLink().run();
    else c().extendMarkRange("link").setLink({ href: url }).run();
  };
  const toggleCodeBlock = () => {
    if (editor.isActive("codeBlock")) return void c().toggleCodeBlock().run();
    const language = window.prompt("코드 언어 (예: javascript, tsx, python — 비워도 됩니다)", "") ?? "";
    c().toggleCodeBlock({ language: language.trim() }).run();
  };
  const inTable = editor.isActive("table");

  return (
    <div className="sticky top-14 z-20 flex flex-wrap items-center gap-0.5 border-y border-line bg-background px-1 py-1.5">
      <Btn label="H2" title="제목 1" active={editor.isActive("heading", { level: 2 })} onClick={() => c().toggleHeading({ level: 2 }).run()} />
      <Btn label="H3" title="제목 2" active={editor.isActive("heading", { level: 3 })} onClick={() => c().toggleHeading({ level: 3 }).run()} />
      <Btn label="H4" title="제목 3" active={editor.isActive("heading", { level: 4 })} onClick={() => c().toggleHeading({ level: 4 }).run()} />
      <Btn label="본문" title="본문" active={editor.isActive("paragraph")} onClick={() => c().setParagraph().run()} />
      <Sep />
      <Btn label={<b>B</b>} title="굵게" active={editor.isActive("bold")} onClick={() => c().toggleBold().run()} />
      <Btn label={<i>I</i>} title="기울임" active={editor.isActive("italic")} onClick={() => c().toggleItalic().run()} />
      <Btn label={<u>U</u>} title="밑줄" active={editor.isActive("underline")} onClick={() => c().toggleUnderline().run()} />
      <Btn label={<s>S</s>} title="취소선" active={editor.isActive("strike")} onClick={() => c().toggleStrike().run()} />
      <Btn label="🔗" title="링크" active={editor.isActive("link")} onClick={setLink} />
      <Sep />
      <Btn label="• 목록" title="글머리 기호" active={editor.isActive("bulletList")} onClick={() => c().toggleBulletList().run()} />
      <Btn label="1. 목록" title="번호 목록" active={editor.isActive("orderedList")} onClick={() => c().toggleOrderedList().run()} />
      <Btn label="❝" title="인용구" active={editor.isActive("blockquote")} onClick={() => c().toggleBlockquote().run()} />
      <Btn label="―" title="구분선" onClick={() => c().setHorizontalRule().run()} />
      <Sep />
      <Btn label="{ }" title="코드 블록" active={editor.isActive("codeBlock")} onClick={toggleCodeBlock} />
      <Btn label="`c`" title="인라인 코드" active={editor.isActive("code")} onClick={() => c().toggleCode().run()} />
      <Sep />
      <Btn label="🖼 사진" title="이미지 업로드" onClick={onPickImage} />
      <Btn label="▦ 표" title="표 삽입" onClick={() => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />
      {inTable && (
        <>
          <Btn label="+열" title="오른쪽에 열 추가" onClick={() => c().addColumnAfter().run()} />
          <Btn label="+행" title="아래에 행 추가" onClick={() => c().addRowAfter().run()} />
          <Btn label="−열" title="열 삭제" onClick={() => c().deleteColumn().run()} />
          <Btn label="−행" title="행 삭제" onClick={() => c().deleteRow().run()} />
          <Btn label="표 삭제" title="표 삭제" onClick={() => c().deleteTable().run()} />
        </>
      )}
      <span className="ml-auto flex gap-0.5">
        <Btn label="↶" title="실행 취소" disabled={!editor.can().undo()} onClick={() => c().undo().run()} />
        <Btn label="↷" title="다시 실행" disabled={!editor.can().redo()} onClick={() => c().redo().run()} />
      </span>
    </div>
  );
}

export default function PostEditor({
  initial,
  categories,
  isEdit,
  legacyMarkdown,
}: {
  initial: PostFormValues;
  categories: string[];
  isEdit: boolean;
  legacyMarkdown: boolean;
}) {
  const [error, action, pending] = useActionState(savePost, null);
  const [html, setHtml] = useState(initial.html);
  const [chars, setChars] = useState(0);
  const [status, setStatus] = useState("");
  const editorRef = useRef<Editor | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);
  const thumbFileRef = useRef<HTMLInputElement>(null);

  const insertFiles = async (ed: Editor, files: File[]) => {
    for (const file of files) {
      try {
        setStatus("이미지 업로드 중…");
        const src = await uploadImage(file);
        ed.chain().focus().setImage({ src }).run();
        setStatus("");
      } catch (e) {
        setStatus(e instanceof Error ? e.message : "업로드 실패");
      }
    }
  };

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    content: initial.html,
    extensions: [
      StarterKit.configure({ link: { openOnClick: false, autolink: true } }),
      ResizableImage,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: "내용을 입력하세요. 사진은 붙여넣기/끌어놓기로도 추가할 수 있습니다." }),
    ],
    editorProps: {
      attributes: { class: "post-body editor-body min-h-[60vh] py-6 outline-none" },
      handlePaste: (view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []).filter((f) => f.type.startsWith("image/"));
        if (!files.length) return false;
        const ed = editorRef.current;
        if (ed) void insertFiles(ed, files);
        return true;
      },
      handleDrop: (view, event) => {
        const files = Array.from(event.dataTransfer?.files ?? []).filter((f) => f.type.startsWith("image/"));
        if (!files.length) return false;
        event.preventDefault();
        const ed = editorRef.current;
        if (ed) void insertFiles(ed, files);
        return true;
      },
    },
    onUpdate: ({ editor }) => {
      setHtml(editor.getHTML());
      setChars(editor.getText().length);
    },
    onCreate: ({ editor }) => {
      editorRef.current = editor;
      setChars(editor.getText().length);
    },
  });
  const onThumbFile = async (file?: File) => {
    if (!file) return;
    try {
      const url = await uploadImage(file);
      if (thumbRef.current) thumbRef.current.value = url;
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "업로드 실패");
    }
  };

  return (
    <form action={action} className="pb-28">
      <input type="hidden" name="originalSlug" value={isEdit ? initial.slug : ""} />
      <input type="hidden" name="content" value={html} />

      <div className="mx-auto max-w-[768px]">
        <select name="category" defaultValue={initial.category} className="mb-4 rounded border border-line bg-transparent px-3 py-2 text-sm">
          <option value="">카테고리 없음</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c.split("/").join(" › ")}
            </option>
          ))}
        </select>

        <input
          name="title"
          defaultValue={initial.title}
          required
          placeholder="제목을 입력하세요"
          className="mb-4 w-full border-b border-line bg-transparent pb-3 text-3xl font-bold outline-none placeholder:text-meta"
        />
      </div>

      {editor && <Toolbar editor={editor} onPickImage={() => fileRef.current?.click()} />}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          if (editor && e.target.files) void insertFiles(editor, Array.from(e.target.files));
          e.target.value = "";
        }}
      />

      <div className="mx-auto max-w-[768px]">
        {legacyMarkdown && (
          <p className="mt-4 rounded bg-surface px-3 py-2 text-xs text-muted">
            티스토리에서 가져온 마크다운 글입니다. 저장하면 에디터(HTML) 형식으로 변환됩니다.
          </p>
        )}
        <EditorContent editor={editor} />

        <details className="mt-8 rounded border border-line p-4">
          <summary className="cursor-pointer text-sm font-semibold">발행 설정 (슬러그 · 날짜 · 요약 · 태그 · 썸네일)</summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-sm font-medium">슬러그 (URL)</span>
              <input name="slug" defaultValue={initial.slug} placeholder="비우면 자동 생성" className={field} />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">날짜</span>
              <input type="date" name="date" defaultValue={initial.date} required className={field} />
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-sm font-medium">요약</span>
              <input name="description" defaultValue={initial.description} className={field} />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">태그 (쉼표로 구분)</span>
              <input name="tags" defaultValue={initial.tags} className={field} />
            </label>
            <div className="space-y-1">
              <span className="text-sm font-medium">썸네일 URL</span>
              <div className="flex gap-2">
                <input ref={thumbRef} name="thumbnail" defaultValue={initial.thumbnail} className={field} />
                <button
                  type="button"
                  onClick={() => thumbFileRef.current?.click()}
                  className="whitespace-nowrap rounded border border-line px-3 py-2 text-sm"
                >
                  업로드
                </button>
                <input ref={thumbFileRef} type="file" accept="image/*" hidden onChange={(e) => onThumbFile(e.target.files?.[0])} />
              </div>
            </div>
          </div>
        </details>
      </div>

      {/* 티스토리처럼 하단 고정 바 */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3 text-sm">
          <span className="text-meta">글자수 {chars.toLocaleString()}</span>
          {status && <span className="text-muted">{status}</span>}
          {error && <span className="text-red-500">{error}</span>}
          <Link href="/admin" className="ml-auto text-muted hover:text-foreground">
            취소
          </Link>
          <button
            disabled={pending}
            className="rounded-full bg-strong px-6 py-2 font-semibold text-white disabled:opacity-50"
          >
            {pending ? "저장 중…" : "완료"}
          </button>
        </div>
      </div>
    </form>
  );
}
