"use client";

import { useRef, useState } from "react";
import { EditorContent, type Editor } from "@tiptap/react";
import ThumbImage from "@/components/ui/common/ThumbImage";
import BlockAddMenu from "./BlockAddMenu";
import FormatPill from "./FormatPill";
import { splitTags } from "./checklist";
import { Icon } from "./icons";

const SUMMARY_HINT = 160;

/** 커버(= 목록 썸네일) 드롭존: 점선 칸을 누르거나 끌어 놓아 업로드. 있으면 바꾸기 · URL · 제거 */
function CoverDrop({ thumbnail, setThumbnail, upload }: { thumbnail: string; setThumbnail: (v: string) => void; upload: (file: File) => Promise<void> }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [urlOpen, setUrlOpen] = useState(false);

  const onFiles = (files: FileList | null | undefined) => {
    const file = Array.from(files ?? []).find((f) => f.type.startsWith("image/"));
    if (file) void upload(file);
  };
  const drop = {
    onDragOver: (e: React.DragEvent) => {
      if (!e.dataTransfer.types.includes("Files")) return;
      e.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (e: React.DragEvent) => {
      if (!e.dataTransfer.types.includes("Files")) return;
      e.preventDefault();
      setDragging(false);
      onFiles(e.dataTransfer.files);
    },
  };

  return (
    <div>
      <input type="hidden" name="thumbnail" value={thumbnail} />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          onFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {thumbnail ? (
        <div {...drop} className="relative aspect-[1200/630] overflow-hidden rounded-[20px] bg-thumb">
          <ThumbImage key={thumbnail} src={thumbnail} className="h-full w-full object-cover" />
          <div className="absolute right-3 bottom-3 flex gap-1.5">
            <button id="cover-drop" type="button" onClick={() => fileRef.current?.click()} className="btn btn-sm rounded-xl! bg-elevated shadow-card">
              <Icon.upload /> 바꾸기
            </button>
            <button type="button" onClick={() => setUrlOpen((v) => !v)} aria-expanded={urlOpen} className="btn btn-sm rounded-xl! bg-elevated shadow-card">
              URL
            </button>
            <button type="button" onClick={() => setThumbnail("")} aria-label="커버 제거" className="btn btn-sm rounded-xl! bg-elevated shadow-card">
              <Icon.x />
            </button>
          </div>
          {dragging && <div className="absolute inset-0 grid place-items-center bg-strong-soft text-sm font-bold">놓아서 바꾸기</div>}
        </div>
      ) : (
        <button
          id="cover-drop"
          type="button"
          {...drop}
          onClick={() => fileRef.current?.click()}
          className={`flex aspect-[1200/630] max-h-[340px] w-full flex-col items-center justify-center gap-2 rounded-[20px] border-2 border-dashed transition-colors duration-(--dur) ${
            dragging ? "border-strong bg-strong-soft" : "border-[#c9c9c1] text-meta hover:border-strong hover:text-foreground dark:border-line"
          }`}
        >
          <span className="grid size-12 place-items-center rounded-xl bg-elevated text-foreground">
            <Icon.image />
          </span>
          <span className="text-[15px] font-bold text-foreground">커버 이미지를 끌어 놓거나 눌러서 업로드</span>
          <span className="text-[13px]">
            <span className="font-grotesk font-bold">1200×630</span> 권장 · 목록 썸네일로도 쓰입니다
          </span>
        </button>
      )}
      <div className="mt-1.5 flex justify-end">
        {!thumbnail && (
          <button type="button" onClick={() => setUrlOpen((v) => !v)} aria-expanded={urlOpen} className="text-xs text-meta hover:text-foreground">
            URL 로 넣기
          </button>
        )}
      </div>
      {urlOpen && (
        <input value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} placeholder="https:// 또는 /images/…" aria-label="커버 이미지 URL" className="field mt-1 text-sm!" />
      )}
    </div>
  );
}

/** 태그 칩 입력: Enter · 쉼표로 추가, Backspace 로 마지막 칩 삭제. 폼에는 쉼표로 이어 싣는다 */
function TagChips({ tags, setTags }: { tags: string; setTags: (v: string) => void }) {
  const [draft, setDraft] = useState("");
  const list = splitTags(tags);
  const commit = (raw: string) => {
    const t = raw.replace(/^#/, "").trim();
    if (!t || list.includes(t)) return setDraft("");
    setTags([...list, t].join(", "));
    setDraft("");
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <input type="hidden" name="tags" value={list.join(", ")} />
      {list.map((t) => (
        <span key={t} className="inline-flex h-7 items-center gap-1 rounded-full bg-surface pr-1 pl-3 text-[13px] font-medium">
          #{t}
          <button
            type="button"
            onClick={() => setTags(list.filter((x) => x !== t).join(", "))}
            aria-label={`${t} 태그 삭제`}
            className="grid size-5 place-items-center rounded-full text-meta hover:bg-elevated hover:text-foreground"
          >
            <Icon.x />
          </button>
        </span>
      ))}
      <input
        id="tag-input"
        value={draft}
        onChange={(e) => (e.target.value.endsWith(",") ? commit(e.target.value.slice(0, -1)) : setDraft(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.nativeEvent.isComposing) {
            e.preventDefault();
            commit(draft);
          } else if (e.key === "Backspace" && !draft && list.length) {
            setTags(list.slice(0, -1).join(", "));
          }
        }}
        onBlur={() => draft && commit(draft)}
        placeholder={list.length ? "+ 태그" : "+ 태그 (Enter 로 추가)"}
        aria-label="태그 추가"
        className="h-7 min-w-24 flex-1 rounded-full bg-transparent px-2 text-[13px] outline-none placeholder:text-meta"
      />
    </div>
  );
}

type Props = {
  editor: Editor | null;
  legacyMarkdown: boolean;
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  tags: string;
  setTags: (v: string) => void;
  thumbnail: string;
  setThumbnail: (v: string) => void;
  uploadThumbnail: (file: File) => Promise<void>;
  touched: boolean;
  onPickImage: () => void;
};

/** 제목 · 요약은 한 문단 — Enter 로 줄을 바꾸지 않는다 */
const noEnter = (e: React.KeyboardEvent) => e.key === "Enter" && !e.nativeEvent.isComposing && e.preventDefault();
const autoGrow = "[field-sizing:content] supports-[field-sizing:content]:overflow-hidden";

/**
 * 메인 열: 커버 드롭존 → 제목 카드(태그 칩 · 제목 · 리드) → 본문 블록 카드(.bento-doc) → 블록 추가 메뉴.
 * 아래 가운데에 진한 서식 알약이 떠 있다 (docs/editor "레이아웃").
 */
export default function StudioWriter(p: Props) {
  return (
    <div className="min-w-0 pb-28">
      <CoverDrop thumbnail={p.thumbnail} setThumbnail={p.setThumbnail} upload={p.uploadThumbnail} />

      <section aria-label="제목" className="mt-3 rounded-[20px] bg-elevated p-5 sm:p-8">
        <TagChips tags={p.tags} setTags={p.setTags} />
        <textarea
          name="title"
          value={p.title}
          onChange={(e) => p.setTitle(e.target.value)}
          required
          rows={1}
          placeholder="제목을 입력하세요"
          aria-label="제목"
          onKeyDown={noEnter}
          className={`mt-4 block w-full resize-none bg-transparent text-[28px] leading-tight font-bold tracking-[-0.02em] text-foreground outline-none placeholder:text-meta sm:text-[34px] ${autoGrow}`}
        />
        <div className="relative mt-3">
          <textarea
            name="description"
            value={p.description}
            onChange={(e) => p.setDescription(e.target.value)}
            rows={1}
            placeholder="리드 문단 — 글을 한두 문장으로 소개하세요. 목록과 검색에 보입니다."
            aria-label="요약"
            onKeyDown={noEnter}
            className={`block w-full resize-none bg-transparent pr-14 text-[16px] leading-[1.8] text-muted outline-none placeholder:text-meta ${autoGrow}`}
          />
          <span
            className={`font-grotesk absolute top-1 right-0 text-xs tabular-nums ${p.description.length > SUMMARY_HINT ? "font-bold text-danger" : "text-meta"}`}
            aria-label={`요약 ${p.description.length}자, 권장 ${SUMMARY_HINT}자`}
          >
            {p.description.length}/{SUMMARY_HINT}
          </span>
        </div>
      </section>

      {p.legacyMarkdown && (
        <p className="mt-3 rounded-[20px] bg-warning-soft px-5 py-4 text-sm">티스토리에서 가져온 마크다운 글입니다. 저장하면 에디터(HTML) 형식으로 변환됩니다.</p>
      )}

      {/* 첫 블록 카드의 위 여백(12px)이 제목 카드와의 간격이 된다 */}
      <EditorContent editor={p.editor} />

      {p.editor && <BlockAddMenu editor={p.editor} touched={p.touched} onPickImage={p.onPickImage} />}

      {p.editor && (
        <div className="pointer-events-none sticky bottom-4 z-30 mt-4 flex justify-center">
          <div className="pointer-events-auto max-w-full">
            <FormatPill editor={p.editor} />
          </div>
        </div>
      )}
    </div>
  );
}
