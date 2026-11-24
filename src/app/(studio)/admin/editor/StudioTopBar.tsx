"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Editor } from "@tiptap/react";
import { Icon } from "./icons";
import { SaveStatus, StateBadge, type PostState, type SaveInfo } from "./status";

type Props = {
  editor: Editor | null;
  isEdit: boolean;
  state: PostState;
  save: SaveInfo;
  category: string;
  slug: string;
  canDraft: boolean;
  onDraft: () => void;
  /** 좁은 화면: 패널 드로어 열기 */
  onMenu: () => void;
  settingsOpen: boolean;
  onSettings: () => void;
  previewOn: boolean;
  onPreview: () => void;
};

function IconButton({ label, pressed, onClick, children, className = "" }: { label: string; pressed?: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={`icon-btn size-9! aria-pressed:bg-surface aria-pressed:text-foreground ${className}`}
    >
      {children}
    </button>
  );
}

/** 발행 ▾ 분할 버튼: 주 버튼은 제출(발행 · 업데이트), ▾ 는 임시저장 · 저장된 글 미리보기 · 나가기 */
function PublishButton({ state, pending, canDraft, onDraft, slug }: { state: PostState; pending: boolean; canDraft: boolean; onDraft: () => void; slug: string }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: MouseEvent) => !wrapRef.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  const item = "flex h-9 w-full items-center rounded-lg px-3 text-left text-sm hover:bg-surface disabled:opacity-40";

  return (
    <div ref={wrapRef} className="relative flex">
      <button disabled={pending} className="btn btn-sm btn-primary rounded-r-none! pr-3 pl-4">
        {pending ? "저장 중…" : state === "published" ? "업데이트" : "발행"}
      </button>
      <button
        type="button"
        aria-label="저장 메뉴"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="btn btn-sm btn-primary rounded-l-none! border-l border-(--on-strong)/25 px-2!"
      >
        <Icon.chevronDown />
      </button>

      {/* 버튼 쪽(오른쪽 위) 모서리에서 열리고 같은 곳으로 닫힌다 */}
      <div
        role="menu"
        data-open={open ? "true" : undefined}
        inert={!open}
        className="glass-thick absolute top-full right-0 z-50 mt-2 w-52 origin-top-right rounded-xl p-1.5 opacity-0 transition-[opacity,transform] duration-(--dur) ease-(--ease-out) [transform:var(--pop-from)] data-open:opacity-100 data-open:[transform:none]"
      >
        <button
          type="button"
          role="menuitem"
          disabled={!canDraft || pending}
          title={canDraft ? undefined : "발행된 글은 임시저장으로 되돌리지 않습니다"}
          onClick={() => {
            setOpen(false);
            onDraft();
          }}
          className={item}
        >
          임시저장 <span className="ml-auto text-xs text-meta">Ctrl S</span>
        </button>
        {slug && (
          <Link role="menuitem" href={`/admin/posts/${slug}/preview`} target="_blank" rel="noopener" onClick={() => setOpen(false)} className={item}>
            저장된 글 미리보기 <span className="ml-auto text-xs text-meta">새 탭</span>
          </Link>
        )}
        <hr className="my-1 border-line" />
        <Link role="menuitem" href="/admin" className={`${item} text-muted`}>
          나가기 (글 관리)
        </Link>
      </div>
    </div>
  );
}

/**
 * 스튜디오 상단 바 (DESIGN.md "글 편집 화면"):
 * ← · 문서 타일 · 화면 이름 + 상태 / 저장 상태 · 글자수 | 글 관리 / 카테고리 | ↶↷ · ⚙ · 👁 · 발행 ▾
 */
export default function StudioTopBar(p: Props) {
  const c = () => p.editor?.chain().focus();
  return (
    <header className="flex h-14 items-center gap-2 border-b border-line bg-background px-2 sm:gap-3 sm:px-3">
      <button type="button" onClick={p.onMenu} aria-label="패널 열기" title="목차 · 블록 · 설정" className="icon-btn size-9! lg:hidden">
        <Icon.menu />
      </button>
      <Link href="/admin" aria-label="글 관리로 돌아가기" title="글 관리로" className="icon-btn hidden size-9! rounded-full! border border-line lg:inline-flex">
        <Icon.arrowLeft />
      </Link>

      <div className="flex min-w-0 items-center gap-2.5">
        <span className="hidden size-9 shrink-0 place-items-center rounded-lg bg-strong-soft text-strong sm:grid" aria-hidden>
          <Icon.doc />
        </span>
        <div className="min-w-0 leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-bold">{p.isEdit ? "글 수정" : "새 글 작성"}</span>
            <StateBadge state={p.state} />
          </div>
          <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-meta">
            <SaveStatus {...p.save} />
            <span aria-hidden>·</span>
            <span className="shrink-0 tabular-nums">{p.save.chars.toLocaleString()}자</span>
          </div>
        </div>
      </div>

      <nav aria-label="위치" className="mx-auto hidden min-w-0 items-center gap-1.5 truncate text-sm md:flex">
        <Link href="/admin" className="text-muted hover:text-foreground">
          글 관리
        </Link>
        <span className="text-meta" aria-hidden>/</span>
        <span className="truncate font-semibold">{p.category ? p.category.split("/").join(" › ") : "카테고리 없음"}</span>
      </nav>

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5 md:ml-0">
        <div className="hidden items-center rounded-full border border-line p-0.5 sm:flex">
          <button
            type="button"
            title="실행 취소"
            aria-label="실행 취소"
            disabled={!p.editor?.can().undo()}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => c()?.undo().run()}
            className="icon-btn size-8! rounded-full! disabled:opacity-30"
          >
            <Icon.undo />
          </button>
          <button
            type="button"
            title="다시 실행"
            aria-label="다시 실행"
            disabled={!p.editor?.can().redo()}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => c()?.redo().run()}
            className="icon-btn size-8! rounded-full! disabled:opacity-30"
          >
            <Icon.redo />
          </button>
        </div>
        <IconButton label="글 설정" pressed={p.settingsOpen} onClick={p.onSettings} className="hidden lg:inline-flex">
          <Icon.settings />
        </IconButton>
        <IconButton label={p.previewOn ? "미리보기 닫기" : "미리보기"} pressed={p.previewOn} onClick={p.onPreview}>
          <Icon.eye />
        </IconButton>
        <PublishButton state={p.state} pending={p.save.pending} canDraft={p.canDraft} onDraft={p.onDraft} slug={p.slug} />
      </div>
    </header>
  );
}
