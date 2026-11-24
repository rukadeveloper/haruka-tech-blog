"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Select from "@/components/ui/common/Select";
import Spinner from "@/components/ui/common/Spinner";
import ThumbImage from "@/components/ui/common/ThumbImage";
import { Icon } from "./icons";

export type PostState = "new" | "draft" | "published";

const STATE_BADGE: Record<PostState, { label: string; className: string }> = {
  new: { label: "새 글", className: "badge badge-primary" },
  draft: { label: "임시저장", className: "badge badge-warning" },
  published: { label: "발행됨", className: "badge badge-success" },
};

export function StateBadge({ state }: { state: PostState }) {
  const b = STATE_BADGE[state];
  return <span className={b.className}>{b.label}</span>;
}

export type SaveInfo = {
  chars: number;
  /** 업로드 · 미리보기 생성 같은 진행 문구 ("…중…" 이면 스피너) */
  status: string;
  error?: string;
  savedAt?: string;
  pending: boolean;
};

/** 저장 상태 한 줄: 진행 문구 → 오류 → 마지막 임시저장 시각. 발행 카드와 모바일 하단 바가 함께 쓴다 */
export function SaveStatus({ status, error, savedAt, pending }: SaveInfo) {
  if (status)
    return (
      <span className="inline-flex min-w-0 items-center gap-2 text-muted">
        {status.endsWith("중…") && <Spinner className="h-4 w-4 border-2" />}
        <span className="truncate">{status}</span>
      </span>
    );
  if (error) return <span className="min-w-0 truncate text-danger">{error}</span>;
  if (pending) return <span className="text-muted">저장 중…</span>;
  if (savedAt)
    return (
      <span className="text-muted">
        임시저장됨 {new Date(savedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
      </span>
    );
  return null;
}

function Section({ title, aside, children, className = "" }: { title: string; aside?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`card card-pad ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

type Props = {
  state: PostState;
  save: SaveInfo;
  canDraft: boolean;
  onPreview: () => void;
  onDraft: () => void;
  /** 숨은 input · 업로드처럼 form change 가 일어나지 않는 변경을 알린다 */
  markDirty: () => void;
  categories: string[];
  initial: { slug: string; date: string; category: string; featured: boolean };
  thumbnail: string;
  setThumbnail: (v: string) => void;
  uploadThumbnail: (file: File) => Promise<void>;
  tags: string;
  setTags: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
};

const SUMMARY_HINT = 160;

/**
 * 글 편집 화면의 설정 사이드바 (DESIGN.md "글 편집 화면"):
 * 발행(lg 만) → 썸네일 → 분류 → 요약 → 고급. 입력 이름은 savePost 가 읽는 이름과 같다.
 */
export default function EditorSidebar(p: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const tagList = p.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const onFiles = (files: FileList | null | undefined) => {
    const file = Array.from(files ?? []).find((f) => f.type.startsWith("image/"));
    if (file) void p.uploadThumbnail(file);
  };

  return (
    <div className="space-y-4">
      {/* 발행: 넓은 화면에서만. 좁은 화면은 하단 고정 바가 같은 일을 한다 */}
      <Section title="발행" aside={<StateBadge state={p.state} />} className="hidden lg:block">
        <p className="flex min-h-5 items-center justify-between gap-3 text-[13px]">
          <SaveStatus {...p.save} />
          <span className="ml-auto shrink-0 text-meta tabular-nums">{p.save.chars.toLocaleString()}자</span>
        </p>
        <div className="mt-3 flex gap-2">
          {p.canDraft && (
            <button type="button" disabled={p.save.pending} onClick={p.onDraft} className="btn btn-secondary flex-1">
              임시저장
            </button>
          )}
          <button disabled={p.save.pending} className="btn btn-primary flex-1">
            {p.save.pending ? "저장 중…" : "완료"}
          </button>
        </div>
        <div className="mt-2 flex">
          <button type="button" onClick={p.onPreview} className="btn btn-sm btn-ghost flex-1">
            미리보기
          </button>
          <Link href="/admin" className="btn btn-sm btn-ghost flex-1">
            취소
          </Link>
        </div>
      </Section>

      <Section title="썸네일">
        {p.thumbnail ? (
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-line bg-thumb">
            {/* 주소가 바뀌면 불러오는 표시부터 다시 시작한다 */}
            <ThumbImage key={p.thumbnail} src={p.thumbnail} className="h-full w-full object-cover" />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              onFiles(e.dataTransfer.files);
            }}
            className={`flex aspect-[16/9] w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed text-sm transition-colors duration-(--dur) ${
              dragging ? "border-strong bg-strong-soft text-strong" : "border-line text-meta hover:border-strong hover:text-strong"
            }`}
          >
            <Icon.upload />
            썸네일 업로드
            <span className="text-xs">누르거나 이미지를 끌어 놓으세요</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => {
          onFiles(e.target.files);
          e.target.value = "";
        }} />
        {p.thumbnail && (
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-sm btn-secondary flex-1">
              <Icon.upload /> 바꾸기
            </button>
            <button
              type="button"
              onClick={() => {
                p.setThumbnail("");
                p.markDirty();
              }}
              className="btn btn-sm btn-ghost"
            >
              <Icon.x /> 제거
            </button>
          </div>
        )}
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer select-none text-meta hover:text-foreground">URL 직접 입력</summary>
          <input
            name="thumbnail"
            value={p.thumbnail}
            onChange={(e) => p.setThumbnail(e.target.value)}
            placeholder="https:// 또는 /images/…"
            aria-label="썸네일 URL"
            className="field mt-2 text-sm!"
          />
        </details>
      </Section>

      <Section title="분류">
        <label className="block">
          <span className="field-label">카테고리</span>
          <Select
            name="category"
            aria-label="카테고리"
            defaultValue={p.initial.category}
            // 숨은 input 은 form 의 change 이벤트를 일으키지 않으므로 직접 표시한다
            onChange={p.markDirty}
            options={[{ value: "", label: "카테고리 없음" }, ...p.categories.map((c) => ({ value: c, label: c.split("/").join(" › ") }))]}
            className="field"
          />
        </label>
        <label className="mt-3 block">
          <span className="field-label">태그 (쉼표로 구분)</span>
          <input name="tags" value={p.tags} onChange={(e) => p.setTags(e.target.value)} placeholder="react, next.js" className="field" />
        </label>
        {tagList.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1" aria-label="태그 미리보기">
            {tagList.map((t, i) => (
              <li key={`${t}-${i}`} className="badge badge-primary">
                #{t}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        title="요약"
        aside={
          <span className={`text-xs tabular-nums ${p.description.length > SUMMARY_HINT ? "text-warning" : "text-meta"}`}>
            {p.description.length}/{SUMMARY_HINT}
          </span>
        }
      >
        <textarea
          name="description"
          value={p.description}
          onChange={(e) => p.setDescription(e.target.value)}
          rows={3}
          placeholder="목록과 검색에 보일 한두 문장"
          aria-label="요약"
          className="field resize-y leading-relaxed"
        />
      </Section>

      <details className="card card-pad group" open={!p.initial.slug}>
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold select-none [&::-webkit-details-marker]:hidden">
          고급
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-meta transition-transform duration-(--dur) group-open:rotate-180" aria-hidden>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </summary>
        <div className="mt-3 space-y-3">
          <label className="block">
            <span className="field-label">슬러그 (URL)</span>
            <input name="slug" defaultValue={p.initial.slug} placeholder="비우면 자동 생성" className="field" />
          </label>
          <label className="block">
            <span className="field-label">날짜</span>
            <input type="date" name="date" defaultValue={p.initial.date} required className="field" />
          </label>
          <label className="flex items-center gap-2.5">
            <input type="checkbox" name="featured" defaultChecked={p.initial.featured} className="h-5 w-5 accent-(--strong)" />
            <span className="text-sm font-semibold">추천 글로 표시</span>
            <span className="text-caption">관리자 목록 배지</span>
          </label>
        </div>
      </details>
    </div>
  );
}
