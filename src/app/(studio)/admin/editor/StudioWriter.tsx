"use client";

import { useRef, useState } from "react";
import { EditorContent, type Editor } from "@tiptap/react";
import ThumbImage from "@/components/ui/common/ThumbImage";
import FormatPill from "./FormatPill";
import { Icon } from "./icons";

const SUMMARY_HINT = 160;

/** 커버(= 썸네일) 카드: 비면 점선 칸에서 누르거나 끌어 놓아 업로드, 있으면 바꾸기 · 제거 · URL */
function CoverCard({
  thumbnail,
  setThumbnail,
  upload,
}: {
  thumbnail: string;
  setThumbnail: (v: string) => void;
  upload: (file: File) => Promise<void>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [urlOpen, setUrlOpen] = useState(false);

  const onFiles = (files: FileList | null | undefined) => {
    const file = Array.from(files ?? []).find((f) => f.type.startsWith("image/"));
    if (file) void upload(file);
  };
  const dropProps = {
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
      {/* 폼에 실리는 값 — 아래 URL 입력과 업로드가 이 값을 바꾼다 */}
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
        <div {...dropProps} className="group relative aspect-[16/9] overflow-hidden rounded-2xl border border-line bg-thumb">
          <ThumbImage key={thumbnail} src={thumbnail} className="h-full w-full object-cover" />
          <div className="absolute right-3 bottom-3 flex gap-1.5">
            <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-sm btn-secondary shadow-card">
              <Icon.upload /> 바꾸기
            </button>
            <button type="button" onClick={() => setUrlOpen((v) => !v)} className="btn btn-sm btn-secondary shadow-card" aria-expanded={urlOpen}>
              URL
            </button>
            <button type="button" onClick={() => setThumbnail("")} className="btn btn-sm btn-secondary shadow-card" aria-label="커버 제거">
              <Icon.x />
            </button>
          </div>
          {dragging && <div className="absolute inset-0 grid place-items-center bg-strong-soft text-sm font-semibold text-strong">놓아서 바꾸기</div>}
        </div>
      ) : (
        <button
          type="button"
          {...dropProps}
          onClick={() => fileRef.current?.click()}
          className={`flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed transition-colors duration-(--dur) ${
            dragging ? "border-strong bg-strong-soft text-strong" : "border-line bg-subtle text-meta hover:border-strong hover:text-strong"
          }`}
        >
          <span className="grid size-11 place-items-center rounded-xl bg-elevated shadow-card">
            <Icon.image />
          </span>
          <span className="text-sm font-semibold">커버 이미지 업로드</span>
          <span className="text-xs">누르거나 이미지를 끌어 놓으세요 · 목록 썸네일로도 쓰입니다</span>
        </button>
      )}

      <div className="mt-2 flex justify-end">
        {!thumbnail && (
          <button type="button" onClick={() => setUrlOpen((v) => !v)} className="text-xs text-meta hover:text-foreground" aria-expanded={urlOpen}>
            URL 로 넣기
          </button>
        )}
      </div>
      {urlOpen && (
        <input
          value={thumbnail}
          onChange={(e) => setThumbnail(e.target.value)}
          placeholder="https:// 또는 /images/…"
          aria-label="커버 이미지 URL"
          className="field mt-1 text-sm!"
        />
      )}
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
  thumbnail: string;
  setThumbnail: (v: string) => void;
  uploadThumbnail: (file: File) => Promise<void>;
};

/** textarea 는 줄바꿈 대신 다음 칸으로 넘어가지 않고 그냥 막는다 (제목 · 요약은 한 문단) */
const noEnter = (e: React.KeyboardEvent) => e.key === "Enter" && !e.nativeEvent.isComposing && e.preventDefault();

/**
 * 쓰기 영역: 커버 → 제목 → 요약 → 본문, 아래 가운데에 떠 있는 서식 알약 (DESIGN.md "글 편집 화면").
 * 바깥(relative)이 알약 자리를, 안쪽이 스크롤을 맡는다.
 */
export default function StudioWriter(p: Props) {
  return (
    <div className="relative h-full">
      <div className="absolute inset-0 overflow-y-auto" data-writer-scroll>
        <div className="mx-auto max-w-[720px] px-5 pt-6 pb-36 sm:px-8 sm:pt-10">
          <CoverCard thumbnail={p.thumbnail} setThumbnail={p.setThumbnail} upload={p.uploadThumbnail} />

          {/* 긴 제목도 잘리지 않게 내용만큼 늘어나는 textarea */}
          <textarea
            name="title"
            value={p.title}
            onChange={(e) => p.setTitle(e.target.value)}
            required
            rows={1}
            placeholder="제목을 입력하세요"
            aria-label="제목"
            onKeyDown={noEnter}
            className="text-display mt-8 block w-full resize-none bg-transparent outline-none [field-sizing:content] supports-[field-sizing:content]:overflow-hidden placeholder:text-meta"
          />

          <div className="relative mt-3">
            <textarea
              name="description"
              value={p.description}
              onChange={(e) => p.setDescription(e.target.value)}
              rows={1}
              placeholder="한두 문장 요약 — 목록과 검색에 보입니다"
              aria-label="요약"
              onKeyDown={noEnter}
              className="block w-full resize-none bg-transparent pr-14 text-[17px] leading-relaxed text-muted outline-none [field-sizing:content] supports-[field-sizing:content]:overflow-hidden placeholder:text-meta"
            />
            <span
              className={`absolute top-1 right-0 text-xs tabular-nums ${p.description.length > SUMMARY_HINT ? "text-warning" : "text-meta"}`}
              aria-label={`요약 ${p.description.length}자, 권장 ${SUMMARY_HINT}자`}
            >
              {p.description.length}/{SUMMARY_HINT}
            </span>
          </div>

          <hr className="mt-6 border-line" />

          {p.legacyMarkdown && (
            <p className="mt-6 rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning">
              티스토리에서 가져온 마크다운 글입니다. 저장하면 에디터(HTML) 형식으로 변환됩니다.
            </p>
          )}
          <EditorContent editor={p.editor} />
        </div>
      </div>

      {p.editor && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-3">
          <div className="pointer-events-auto max-w-full">
            <FormatPill editor={p.editor} />
          </div>
        </div>
      )}
    </div>
  );
}
