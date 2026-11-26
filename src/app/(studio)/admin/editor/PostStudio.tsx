"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import Spinner from "@/components/ui/common/Spinner";
import { savePost } from "@/app/(site)/admin/actions";
import { ResizableImage } from "./ResizableImage";
import { FileTree } from "./FileTree";
import { Callout } from "./extensions/Callout";
import BentoTopBar from "./BentoTopBar";
import BentoSide from "./BentoSide";
import StudioWriter from "./StudioWriter";
import PublishConfirm from "./PublishConfirm";
import PreviewOverlay from "./PreviewOverlay";
import { prepublishChecks, type CheckId } from "./checklist";
import type { PostState } from "./status";

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

/** 최상위 블록 수(빈 문단 제외)와 구성 */
function blockStats(editor: Editor | null) {
  let blocks = 0;
  const mix = { paragraphs: 0, code: 0, images: 0 };
  editor?.state.doc.forEach((node) => {
    if (node.type.name === "paragraph" && node.content.size === 0) return;
    blocks++;
    if (node.type.name === "paragraph") mix.paragraphs++;
    else if (node.type.name === "codeBlock") mix.code++;
    else if (node.type.name === "image") mix.images++;
  });
  return { blocks, mix };
}

/**
 * 벤토 블록 에디터 (.claude/rules/editor-bento.md): 폼 하나가 화면 전체다.
 * 상단 바 카드 → [메인 열 | 사이드 360 벤토]. 폼 필드 이름은 savePost 가 읽는 이름과 같아야 한다.
 * 발행 버튼은 제출 버튼이 아니라 발행 전 체크를 거쳐 requestSubmit 한다 (입력칸 Enter 로 발행되지 않음).
 */
export default function PostStudio({
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
  // 임시저장하면 서버가 슬러그를 정해 주므로, 새 글도 이후 저장은 같은 글을 갱신한다
  const currentSlug = saved?.slug ?? (isEdit ? initial.slug : "");
  // 발행된 글을 임시저장으로 되돌려 비공개로 만들지는 않는다
  const canDraft = !isEdit || initial.draft;
  const state: PostState = !currentSlug ? "new" : isEdit && !initial.draft ? "published" : "draft";

  const formRef = useRef<HTMLFormElement>(null);
  const intentRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const dirtyRef = useRef(false);
  const markDirty = () => (dirtyRef.current = true);

  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [thumbnail, setThumbnail] = useState(initial.thumbnail);
  const [category, setCategory] = useState(initial.category);
  const [tags, setTags] = useState(initial.tags);
  const [date, setDate] = useState(initial.date);
  const [html, setHtml] = useState(initial.html);
  const [chars, setChars] = useState(0);
  const [status, setStatus] = useState("");
  // 본문을 한 번이라도 눌렀는지 — 블록 추가 위치(커서 뒤 / 글 끝)를 정한다
  const [touched, setTouched] = useState(false);
  const [lastIntent, setLastIntent] = useState<"publish" | "draft">("publish");
  const [confirming, setConfirming] = useState(false);
  const [previewing, setPreviewing] = useState(false);

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

  const uploadThumbnail = async (file: File) => {
    try {
      setStatus("커버 업로드 중…");
      setThumbnail(await uploadImage(file));
      markDirty();
      setStatus("");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "업로드 실패");
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
      Callout,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: "본문을 입력하세요. 아래 블록 추가 메뉴로 코드 · 콜아웃 · 파일 트리를 넣을 수 있습니다." }),
    ],
    editorProps: {
      attributes: { class: "post-body editor-body bento-doc outline-none" },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []).filter((f) => f.type.startsWith("image/"));
        if (!files.length) return false;
        const ed = editorRef.current;
        if (ed) void insertFiles(ed, files);
        return true;
      },
      handleDrop: (_view, event) => {
        const files = Array.from(event.dataTransfer?.files ?? []).filter((f) => f.type.startsWith("image/"));
        if (!files.length) return false;
        event.preventDefault();
        const ed = editorRef.current;
        if (ed) void insertFiles(ed, files);
        return true;
      },
    },
    onFocus: () => setTouched(true),
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

  const submit = (intent: "publish" | "draft") => {
    const form = formRef.current;
    if (!form || !intentRef.current) return;
    if (intent === "draft") dirtyRef.current = false;
    intentRef.current.value = intent;
    form.requestSubmit();
    intentRef.current.value = "publish";
  };
  const saveDraft = () => canDraft && submit("draft");

  const checks = prepublishChecks({ title, tags, thumbnail, doc: editor?.state.doc });
  const requestPublish = () => {
    if (checks.some((c) => c.status === "fail")) setConfirming(true);
    else submit("publish");
  };

  // 체크 항목을 누르면 그 입력으로 이동한다
  const goToCheck = (id: CheckId) => {
    const focus = (sel: string) => {
      const el = document.querySelector<HTMLElement>(sel);
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
      el?.focus({ preventScroll: true });
    };
    if (id === "title") focus('textarea[name="title"]');
    else if (id === "tags") focus("#tag-input");
    else if (id === "thumbnail") focus("#cover-drop");
    else if (id === "code" && editor) {
      let target = -1;
      editor.state.doc.descendants((node, pos) => {
        if (target >= 0) return false;
        if (node.type.name === "codeBlock") {
          const lang = String(node.attrs.language ?? "").trim();
          if (!lang || lang === "plaintext") target = pos;
          return false;
        }
        return true;
      });
      if (target < 0) return;
      editor.chain().setTextSelection(target + 1).focus(undefined, { scrollIntoView: false }).run();
      const dom = editor.view.nodeDOM(target);
      if (dom instanceof HTMLElement) dom.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  };

  // 새 글을 처음 임시저장하면 주소를 수정 화면으로 바꿔 새로고침해도 이어서 쓸 수 있게 한다
  useEffect(() => {
    if (!isEdit && saved?.slug) window.history.replaceState(null, "", `/admin/posts/${saved.slug}/edit`);
  }, [isEdit, saved?.slug, saved?.savedAt]);

  // 3분마다 변경이 있으면 자동 임시저장 (제목이 있을 때만)
  useEffect(() => {
    if (!canDraft) return;
    const t = setInterval(() => {
      if (dirtyRef.current && !pending && title.trim()) saveDraft();
    }, 180000);
    return () => clearInterval(t);
  });

  // Ctrl/⌘ + S: 임시저장 (발행된 글은 브라우저 저장 창만 막는다)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!pending && title.trim()) saveDraft();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const closeConfirm = useCallback(() => setConfirming(false), []);
  const closePreview = useCallback(() => setPreviewing(false), []);

  const { blocks, mix } = blockStats(editor);
  const save = { chars, status, error: saved?.error, savedAt: saved?.savedAt, pending };

  return (
    <form
      ref={formRef}
      action={action}
      onChange={markDirty}
      onSubmit={() => setLastIntent(intentRef.current?.value === "draft" ? "draft" : "publish")}
      // 입력칸에서 Enter 를 눌러도 제출하지 않는다 (제출 버튼이 없어도 브라우저가 암묵 제출을 시도할 수 있다)
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target instanceof HTMLInputElement && e.target.type !== "checkbox") e.preventDefault();
      }}
      className="mx-auto max-w-[1440px] p-3 lg:p-5"
    >
      <input type="hidden" name="originalSlug" value={currentSlug} />
      <input ref={intentRef} type="hidden" name="intent" defaultValue="publish" />
      <input type="hidden" name="content" value={html} />
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

      <BentoTopBar
        isEdit={isEdit}
        state={state}
        blocks={blocks}
        save={save}
        canDraft={canDraft}
        onDraft={saveDraft}
        onPreview={() => setPreviewing(true)}
        onPublish={requestPublish}
      />

      <div className="mt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-4">
        <StudioWriter
          editor={editor}
          legacyMarkdown={legacyMarkdown}
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          tags={tags}
          setTags={(v) => {
            setTags(v);
            markDirty();
          }}
          thumbnail={thumbnail}
          setThumbnail={(v) => {
            setThumbnail(v);
            markDirty();
          }}
          uploadThumbnail={uploadThumbnail}
          touched={touched}
          onPickImage={() => fileRef.current?.click()}
        />

        <aside aria-label="발행 정보" className="mt-4 lg:sticky lg:top-[100px] lg:mt-0 lg:max-h-[calc(100dvh-120px)] lg:overflow-y-auto lg:pb-1 lg:[scrollbar-width:thin]">
          <BentoSide
            editor={editor}
            checks={checks}
            onCheck={goToCheck}
            chars={chars}
            mix={mix}
            savedAt={saved?.savedAt}
            categories={categories}
            category={category}
            setCategory={(v) => {
              setCategory(v);
              markDirty();
            }}
            date={date}
            setDate={setDate}
            initial={initial}
          />
        </aside>
      </div>

      {confirming && (
        <PublishConfirm
          checks={checks}
          updating={state === "published"}
          onCancel={closeConfirm}
          onConfirm={() => {
            setConfirming(false);
            submit("publish");
          }}
        />
      )}

      {previewing && <PreviewOverlay html={html} title={title} category={category} date={date} thumbnail={thumbnail} onClose={closePreview} />}

      {/* 저장 중 모달: 발행 · 업데이트 요청이 진행 중일 때만 (서버 액션은 중간에 취소할 수 없어 취소 버튼이 없다) */}
      {pending && lastIntent === "publish" && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-foreground/30 p-6" role="alertdialog" aria-live="assertive" aria-label="글을 저장하는 중">
          <div className="w-full max-w-xs rounded-[20px] bg-elevated px-6 py-8 text-center shadow-pop">
            <span className="mx-auto grid size-14 place-items-center rounded-xl bg-strong text-(--on-strong)">
              <Spinner className="h-6 w-6 border-2" />
            </span>
            <p className="mt-4 font-bold">잠시만 기다려 주세요</p>
            <p className="mt-1 text-sm text-meta">글을 저장하는 중입니다…</p>
          </div>
        </div>
      )}
    </form>
  );
}
