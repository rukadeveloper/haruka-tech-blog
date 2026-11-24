"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import Spinner from "@/components/ui/common/Spinner";
import { savePost } from "@/app/(site)/admin/actions";
import { ResizableImage } from "./ResizableImage";
import { FileTree } from "./FileTree";
import StudioTopBar from "./StudioTopBar";
import StudioRail, { PANELS, type PanelId } from "./StudioRail";
import StudioWriter from "./StudioWriter";
import StudioPreview from "./StudioPreview";
import OutlinePanel from "./panels/OutlinePanel";
import BlocksPanel from "./panels/BlocksPanel";
import SettingsPanel from "./panels/SettingsPanel";
import { Icon } from "./icons";
import { useMedia, type PostState } from "./status";

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

/**
 * 글 에디터 스튜디오 (DESIGN.md "글 편집 화면"): 폼 하나가 화면 전체다.
 * 상단 바 / [레일 | 패널 | 쓰기 | 실시간 미리보기]. 각 영역이 자체 스크롤을 가진다.
 * 폼 필드 이름은 savePost 가 읽는 이름과 같아야 한다 (CLAUDE.md "글 형식").
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

  // 미리보기 · 상단 바가 바로 따라가도록 글 정보는 제어 상태로 둔다 (슬러그 · 추천은 제출 때만 필요해 비제어)
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [thumbnail, setThumbnail] = useState(initial.thumbnail);
  const [category, setCategory] = useState(initial.category);
  const [tags, setTags] = useState(initial.tags);
  const [date, setDate] = useState(initial.date);
  const [html, setHtml] = useState(initial.html);
  const [chars, setChars] = useState(0);
  const [status, setStatus] = useState("");
  // 진행 중인 제출이 발행인지 (발행일 때만 저장 중 모달을 띄운다)
  const [lastIntent, setLastIntent] = useState<"publish" | "draft">("publish");

  // 배치: xl 이상은 패널이 붙고(docked), 그보다 좁으면 겹쳐 연다(drawer). lg 미만은 쓰기 ↔ 미리보기 중 하나만
  const isXl = useMedia("(min-width: 1280px)");
  const isLg = useMedia("(min-width: 1024px)");
  const [panel, setPanel] = useState<PanelId>("outline");
  const [docked, setDocked] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const panelOpen = isXl ? docked : drawer;
  const [previewOn, setPreviewOn] = useState(true);
  const [mobileView, setMobileView] = useState<"write" | "preview">("write");

  const selectPanel = (id: PanelId) => {
    if (isXl) {
      // 고른 패널을 다시 누르면 접는다
      if (docked && panel === id) setDocked(false);
      else setDocked(true);
    } else {
      setDrawer(!(drawer && panel === id));
    }
    setPanel(id);
  };
  const closeDrawer = () => setDrawer(false);

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
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: "본문을 입력하세요. 블록은 왼쪽 패널에서 넣거나 끌어다 놓을 수 있습니다." }),
    ],
    editorProps: {
      attributes: { class: "post-body editor-body min-h-[50vh] py-8 outline-none" },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []).filter((f) => f.type.startsWith("image/"));
        if (!files.length) return false;
        const ed = editorRef.current;
        if (ed) void insertFiles(ed, files);
        return true;
      },
      // 이미지 파일만 가로챈다 — 블록 패널에서 끌어온 text/html 은 ProseMirror 기본 드롭이 넣는다
      handleDrop: (_view, event) => {
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
    if (!form || !intentRef.current || !canDraft) return;
    dirtyRef.current = false;
    intentRef.current.value = "draft";
    form.requestSubmit();
    intentRef.current.value = "publish";
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

  // Ctrl/⌘ + S: 임시저장 (발행된 글은 아무것도 하지 않고 브라우저 저장 창만 막는다)
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

  // 드로어가 열려 있으면 Esc 로 닫는다
  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer]);

  const save = { chars, status, error: saved?.error, savedAt: saved?.savedAt, pending };
  const showWriter = isLg || mobileView === "write";
  const showPreview = isLg ? previewOn : mobileView === "preview";
  const panelTitle = PANELS.find((p) => p.id === panel)?.label;

  return (
    <form
      ref={formRef}
      action={action}
      onChange={markDirty}
      onSubmit={() => setLastIntent(intentRef.current?.value === "draft" ? "draft" : "publish")}
      // 입력칸에서 Enter 를 눌러도 제출(발행)하지 않는다 — 발행은 버튼으로만
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target instanceof HTMLInputElement && e.target.type !== "checkbox") e.preventDefault();
      }}
      className="grid h-full grid-rows-[56px_minmax(0,1fr)]"
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

      <StudioTopBar
        editor={editor}
        isEdit={isEdit}
        state={state}
        save={save}
        category={category}
        slug={currentSlug}
        canDraft={canDraft}
        onDraft={saveDraft}
        onMenu={() => setDrawer((v) => !v)}
        settingsOpen={panelOpen && panel === "settings"}
        onSettings={() => selectPanel("settings")}
        previewOn={showPreview}
        onPreview={() => (isLg ? setPreviewOn((v) => !v) : setMobileView((v) => (v === "write" ? "preview" : "write")))}
      />

      <div className="relative flex min-h-0">
        <StudioRail active={panelOpen ? panel : null} onSelect={selectPanel} />

        {/* 드로어 바깥 (xl 미만에서 겹쳐 열렸을 때) */}
        {!isXl && drawer && <div className="fixed inset-0 top-14 z-30 bg-foreground/20" onClick={closeDrawer} aria-hidden />}

        {/* 패널: 닫혀도 설정 입력이 폼에 남도록 항상 그려 두고 숨기기만 한다 */}
        <aside
          aria-label={`${panelTitle} 패널`}
          inert={!panelOpen}
          data-open={panelOpen ? "true" : undefined}
          className={
            isXl
              ? `w-[280px] shrink-0 flex-col border-r border-line bg-background ${panelOpen ? "flex" : "hidden"}`
              : "fixed top-14 bottom-0 left-0 z-40 flex w-[300px] max-w-[85vw] -translate-x-full flex-col border-r border-line bg-background shadow-pop transition-transform duration-(--dur-slow) ease-(--ease-out) data-open:translate-x-0 lg:left-14"
          }
        >
          <div className="flex h-12 shrink-0 items-center gap-1 border-b border-line px-3">
            {/* 레일이 없는 좁은 화면에서는 패널 위에 탭을 둔다 */}
            <div className="flex gap-1 lg:hidden" role="tablist" aria-label="패널">
              {PANELS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={panel === p.id}
                  onClick={() => setPanel(p.id)}
                  className="h-8 rounded-lg px-2.5 text-sm text-muted aria-selected:bg-foreground aria-selected:font-semibold aria-selected:text-background"
                >
                  {p.label}
                </button>
              ))}
            </div>
            <h2 className="hidden text-sm font-bold lg:block">{panelTitle}</h2>
            {!isXl && (
              <button type="button" onClick={closeDrawer} aria-label="패널 닫기" className="icon-btn ml-auto size-8!">
                <Icon.x />
              </button>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3 [scrollbar-width:thin]">
            <div hidden={panel !== "outline"}>{editor && <OutlinePanel editor={editor} onPick={isXl ? undefined : closeDrawer} />}</div>
            <div hidden={panel !== "blocks"}>
              {editor && <BlocksPanel editor={editor} onPickImage={() => fileRef.current?.click()} onPick={isXl ? undefined : closeDrawer} />}
            </div>
            <div hidden={panel !== "settings"}>
              <SettingsPanel
                categories={categories}
                category={category}
                setCategory={(v) => {
                  setCategory(v);
                  markDirty();
                }}
                tags={tags}
                setTags={setTags}
                date={date}
                setDate={setDate}
                initial={initial}
              />
            </div>
          </div>
        </aside>

        <section aria-label="쓰기" className={`min-w-0 flex-1 ${showWriter ? "" : "hidden"}`}>
          <StudioWriter
            editor={editor}
            legacyMarkdown={legacyMarkdown}
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            thumbnail={thumbnail}
            setThumbnail={(v) => {
              setThumbnail(v);
              markDirty();
            }}
            uploadThumbnail={uploadThumbnail}
          />
        </section>

        {showPreview && (
          <section aria-label="실시간 미리보기" className="min-w-0 flex-1 border-l border-line">
            <StudioPreview html={html} title={title} category={category} date={date} thumbnail={thumbnail} />
          </section>
        )}
      </div>

      {/* 저장 중 모달: 발행 · 업데이트 요청이 진행 중일 때만 (서버 액션은 중간에 취소할 수 없어 취소 버튼이 없다) */}
      {pending && lastIntent === "publish" && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-foreground/25 p-6" role="alertdialog" aria-live="assertive" aria-label="글을 저장하는 중">
          <div className="glass-thick w-full max-w-xs rounded-2xl px-6 py-8 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-strong-soft text-strong">
              <Spinner className="h-6 w-6 border-2" />
            </span>
            <p className="mt-4 font-bold">잠시만 기다려 주세요</p>
            <p className="mt-1 text-sm text-muted">글을 저장하는 중입니다…</p>
          </div>
        </div>
      )}
    </form>
  );
}
