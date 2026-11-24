"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import PostArticleBody from "@/components/ui/post/PostArticleBody";
import { previewHtml, savePost } from "../actions";
import { ResizableImage } from "./ResizableImage";
import { FileTree } from "./FileTree";
import EditorToolbar from "./EditorToolbar";
import EditorSidebar, { SaveStatus, StateBadge, type PostState } from "./EditorSidebar";
import { Icon } from "./icons";

export type PostFormValues = {
  slug: string;
  title: string;
  date: string;
  category: string;
  description: string;
  tags: string;
  thumbnail: string;
  draft: boolean;
  /** 추천 표시 (관리자 목록 배지) */
  featured: boolean;
  html: string;
};

async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/admin/upload", { method: "POST", body: fd });
  const json = await res.json().catch(() => ({})); // 플랫폼 오류 응답은 JSON 이 아니다
  if (!res.ok) throw new Error(json.error ?? "업로드 실패");
  return json.url as string;
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
  const [saved, action, pending] = useActionState(savePost, null);
  const error = saved?.error;
  // 임시저장하면 서버가 슬러그를 정해 주므로, 새 글도 이후 저장은 같은 글을 갱신한다
  const currentSlug = saved?.slug ?? (isEdit ? initial.slug : "");
  // 발행된 글을 임시저장으로 되돌려 비공개로 만들지는 않는다
  const canDraft = !isEdit || initial.draft;
  const dirtyRef = useRef(false);
  const intentRef = useRef<HTMLInputElement>(null);
  const [html, setHtml] = useState(initial.html);
  const [chars, setChars] = useState(0);
  const [status, setStatus] = useState("");
  const [preview, setPreview] = useState<{ title: string; category: string; date: string; html: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // 사이드바 미리보기(썸네일 · 태그 칩 · 요약 글자수)를 위해 제어 상태로 둔다
  const [thumbnail, setThumbnail] = useState(initial.thumbnail);
  const [tags, setTags] = useState(initial.tags);
  const [description, setDescription] = useState(initial.description);
  const markDirty = () => (dirtyRef.current = true);
  const state: PostState = !currentSlug ? "new" : isEdit && !initial.draft ? "published" : "draft";

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
      FileTree,
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
      dirtyRef.current = true;
      setHtml(editor.getHTML());
      setChars(editor.getText().length);
    },
    onCreate: ({ editor }) => {
      editorRef.current = editor;
      setChars(editor.getText().length);
    },
  });
  const saveDraft = () => {
    const form = formRef.current;
    if (!form || !intentRef.current || !form.elements.namedItem("title")) return;
    dirtyRef.current = false;
    intentRef.current.value = "draft";
    form.requestSubmit();
    intentRef.current.value = "publish";
  };

  // 새 글을 처음 임시저장하면 주소를 수정 화면으로 바꿔 새로고침해도 이어서 쓸 수 있게 한다
  useEffect(() => {
    if (!isEdit && saved?.slug) window.history.replaceState(null, "", `/admin/posts/${saved.slug}/edit`);
  }, [isEdit, saved?.slug, saved?.savedAt]);

  // 3분마다 변경이 있으면 자동 임시저장 (제목이 있을 때만). 저장 요청이 너무 잦지 않게 한다
  useEffect(() => {
    if (!canDraft) return;
    const t = setInterval(() => {
      const title = formRef.current?.elements.namedItem("title") as HTMLTextAreaElement | null;
      if (dirtyRef.current && !pending && title?.value.trim()) saveDraft();
    }, 180000);
    return () => clearInterval(t);
  });

  const openPreview = async () => {
    const f = new FormData(formRef.current!);
    try {
      setStatus("미리보기 생성 중…");
      const rendered = await previewHtml(html);
      setPreview({
        title: String(f.get("title") ?? ""),
        category: String(f.get("category") ?? ""),
        date: String(f.get("date") ?? ""),
        html: rendered,
      });
      window.history.pushState(null, "");
      setStatus("");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "미리보기 실패");
    }
  };

  // 미리보기는 페이지가 아니라 오버레이이므로, 뒤로가기가 에디터를 떠나지 않고 미리보기만 닫게 한다
  useEffect(() => {
    if (!preview) return;
    const close = () => setPreview(null);
    window.addEventListener("popstate", close);
    return () => window.removeEventListener("popstate", close);
  }, [preview]);

  // 오버레이 자체 스크롤바와 페이지 스크롤바가 겹쳐 보이지 않도록 미리보기 동안 페이지 스크롤을 잠근다
  useEffect(() => {
    if (!preview) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [preview]);

  const uploadThumbnail = async (file: File) => {
    try {
      setStatus("썸네일 업로드 중…");
      setThumbnail(await uploadImage(file));
      markDirty();
      setStatus("");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "업로드 실패");
    }
  };

  const save = { chars, status, error, savedAt: saved?.savedAt, pending };

  return (
    <form ref={formRef} action={action} onChange={markDirty} className="pt-2 pb-32 lg:pb-16">
      <input type="hidden" name="originalSlug" value={currentSlug} />
      <input ref={intentRef} type="hidden" name="intent" defaultValue="publish" />
      <input type="hidden" name="content" value={html} />

      {/* 상단 줄: 목록으로 · 화면 이름 · 상태 */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/admin" className="pressable -ml-2 inline-flex h-9 items-center gap-1 rounded-lg px-2 text-muted hover:bg-surface hover:text-foreground">
          <Icon.arrowLeft /> 글 관리
        </Link>
        <span className="text-line" aria-hidden>/</span>
        <span className="font-semibold">{isEdit ? "글 수정" : "새 글"}</span>
        <StateBadge state={state} />
      </div>

      {/* 긴 제목이 좁은 화면에서 잘리지 않도록 줄을 바꿔 보여 주는 textarea (내용만큼 늘어난다). 줄바꿈 입력은 막는다 */}
      <textarea
        name="title"
        defaultValue={initial.title}
        required
        rows={1}
        placeholder="제목을 입력하세요"
        aria-label="제목"
        onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
        className="text-display mt-4 mb-5 block w-full resize-none bg-transparent outline-none [field-sizing:content] placeholder:text-meta"
      />

      {/* 툴바는 그리드 위 전체 폭 — 글쓰기 열만으로는 아이콘 묶음이 한 줄에 들어가지 않는다 */}
      {editor && <EditorToolbar editor={editor} onPickImage={() => fileRef.current?.click()} />}
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

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-10">
        <div className="min-w-0">
          {legacyMarkdown && (
            <p className="mt-4 rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning">
              티스토리에서 가져온 마크다운 글입니다. 저장하면 에디터(HTML) 형식으로 변환됩니다.
            </p>
          )}
          <EditorContent editor={editor} />
        </div>

        {/* 설정: lg 는 툴바 아래(헤더 72 + 툴바 약 52 + 16)에서 따라오고, 넘치면 자체 스크롤 */}
        <aside aria-label="글 설정" className="mt-8 lg:sticky lg:top-[140px] lg:mt-6 lg:max-h-[calc(100vh-156px)] lg:overflow-y-auto lg:pb-1 lg:[scrollbar-width:thin]">
          <EditorSidebar
            state={state}
            save={save}
            canDraft={canDraft}
            onPreview={openPreview}
            onDraft={saveDraft}
            markDirty={markDirty}
            categories={categories}
            initial={initial}
            thumbnail={thumbnail}
            setThumbnail={(v) => {
              setThumbnail(v);
              markDirty();
            }}
            uploadThumbnail={uploadThumbnail}
            tags={tags}
            setTags={setTags}
            description={description}
            setDescription={setDescription}
          />
        </aside>
      </div>

      {/* 좁은 화면: 하단 고정 바 (넓은 화면은 사이드바의 발행 카드가 대신한다) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-background lg:hidden">
        <div className="container-page flex items-center gap-2 py-2.5 text-sm sm:gap-3">
          {/* 좁은 화면에서는 상태 문구가 줄어들고 버튼은 항상 보인다 */}
          <div className="flex min-w-0 flex-1 items-center gap-3 truncate">
            <span className="hidden text-meta sm:inline">글자수 {chars.toLocaleString()}</span>
            <SaveStatus {...save} />
          </div>
          <button type="button" onClick={openPreview} className="btn btn-sm btn-ghost">
            미리보기
          </button>
          {canDraft && (
            <button type="button" disabled={pending} onClick={saveDraft} className="btn btn-sm btn-secondary">
              임시저장
            </button>
          )}
          <Link href="/admin" className="btn btn-sm btn-ghost hidden sm:inline-flex">
            취소
          </Link>
          <button disabled={pending} className="btn btn-sm btn-primary px-5!">
            {pending ? "저장 중…" : "완료"}
          </button>
        </div>
      </div>
      {preview && (
        // 사이트 헤더(z-50)에 닫기 버튼이 가려지지 않도록 헤더보다 위에 둔다
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-background">
          <div className="sticky top-0 z-10 flex items-center border-b border-line bg-background/95 px-5 py-3 text-sm backdrop-blur">
            <span className="font-semibold">미리보기</span>
            <span className="ml-3 truncate text-muted">저장되지 않은 현재 내용입니다.</span>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="btn btn-sm btn-secondary ml-auto"
            >
              닫기
            </button>
          </div>
          <article className="container-page pt-8 pb-24 sm:pt-14">
            <PostArticleBody {...preview} />
          </article>
        </div>
      )}
    </form>
  );
}
