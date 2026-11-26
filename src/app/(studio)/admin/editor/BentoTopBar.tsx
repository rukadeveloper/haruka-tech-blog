"use client";

import Link from "next/link";
import { Icon } from "./icons";
import { SaveStatus, type PostState, type SaveInfo } from "./status";

type Props = {
  isEdit: boolean;
  state: PostState;
  blocks: number;
  save: SaveInfo;
  canDraft: boolean;
  onDraft: () => void;
  onPreview: () => void;
  onPublish: () => void;
};

/**
 * 상단 바 (흰 카드): haruka-admin-log · 새 글 / 글 수정 · 블록 N개 · 저장 상태 | [임시저장] [미리보기] [발행 →]
 * 발행은 제출 버튼이 아니다 — 발행 전 체크를 거친 뒤 PostStudio 가 제출한다.
 */
export default function BentoTopBar(p: Props) {
  return (
    <header className="sticky top-3 z-40 flex items-center gap-2 rounded-[20px] bg-elevated px-3 py-3 sm:gap-3 shadow-card sm:px-5 lg:top-5">
      <Link href="/admin" title="글 관리로" className="font-grotesk shrink-0 text-[15px] font-bold tracking-tight sm:text-lg">
        haruka-admin<span className="text-strong">-</span>log
      </Link>
      <span className="hidden h-5 w-px shrink-0 bg-line sm:block" aria-hidden />
      {/* 좁은 화면에서는 버튼 자리를 위해 숨긴다 (블록 수 · 저장 상태는 사이드 카드에도 있다) */}
      <div className="hidden min-w-0 leading-tight sm:block">
        <p className="truncate text-sm font-semibold">
          {p.isEdit ? "글 수정" : "새 글"} · 블록 <span className="font-grotesk tabular-nums">{p.blocks}</span>개
          {p.state === "published" && <span className="badge badge-success ml-2 align-middle">발행됨</span>}
          {p.state === "draft" && <span className="badge badge-warning ml-2 align-middle">임시저장</span>}
        </p>
        <p className="mt-0.5 truncate text-xs text-meta">
          <SaveStatus {...p.save} />
        </p>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={p.onDraft}
          disabled={!p.canDraft || p.save.pending}
          title={p.canDraft ? "임시저장 (Ctrl S)" : "발행된 글은 임시저장으로 되돌리지 않습니다"}
          className="btn btn-sm btn-secondary rounded-xl!"
        >
          <span className="sm:hidden">저장</span>
          <span className="hidden sm:inline">임시저장</span>
        </button>
        {/* 좁은 화면에서는 로고가 길어 미리보기를 아이콘으로 줄인다 */}
        <button type="button" onClick={p.onPreview} aria-label="미리보기" className="btn btn-sm btn-secondary rounded-xl! px-2.5! sm:px-3!">
          <span className="sm:hidden">
            <Icon.eye />
          </span>
          <span className="hidden sm:inline">미리보기</span>
        </button>
        <button type="button" onClick={p.onPublish} disabled={p.save.pending} className="btn btn-sm btn-primary rounded-xl! px-3! font-bold sm:px-4!">
          {p.save.pending ? "저장 중…" : p.state === "published" ? "업데이트" : "발행"}
          {!p.save.pending && <span className="hidden sm:inline"> →</span>}
        </button>
      </div>
    </header>
  );
}
