"use client";

import Spinner from "@/components/ui/common/Spinner";

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

/** 저장 상태 한 줄: 진행 문구 → 오류 → 저장 중 → 마지막 임시저장 시각 → "편집 중" */
export function SaveStatus({ status, error, savedAt, pending }: SaveInfo) {
  if (status)
    return (
      <span className="inline-flex min-w-0 items-center gap-1.5 text-muted">
        {status.endsWith("중…") && <Spinner className="h-3.5 w-3.5 border-2" />}
        <span className="truncate">{status}</span>
      </span>
    );
  if (error) return <span className="min-w-0 truncate text-danger">{error}</span>;
  if (pending) return <span className="text-muted">저장 중…</span>;
  if (savedAt)
    return (
      <span className="truncate">
        임시저장됨 {new Date(savedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
      </span>
    );
  return <span className="truncate">편집 중</span>;
}
