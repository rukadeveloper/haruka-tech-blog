"use client";

import { useEffect, useRef } from "react";
import { StatusPill } from "./BentoSide";
import type { Check } from "./checklist";

/**
 * 발행 확인 창: 발행 전 체크에 '필요' 항목이 있을 때 한 번 더 묻는다. 주의 항목도 함께 보여 준다.
 * 처음 포커스는 "돌아가기", Esc 로 닫는다.
 */
export default function PublishConfirm({
  checks,
  updating,
  onCancel,
  onConfirm,
}: {
  checks: Check[];
  updating: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const open = checks.filter((c) => c.status !== "pass");

  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-foreground/30 p-4" onClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="publish-confirm-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-[20px] bg-elevated p-6 shadow-pop"
      >
        <h2 id="publish-confirm-title" className="text-lg font-bold">
          아직 채우지 않은 항목이 있어요
        </h2>
        <p className="mt-1 text-sm text-meta">그래도 {updating ? "업데이트" : "발행"}할까요?</p>
        <ul className="mt-4 space-y-2">
          {open.map((c) => (
            <li key={c.id} className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2.5">
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{c.label}</span>
                <span className="block truncate text-[13px] text-meta">{c.detail}</span>
              </span>
              <StatusPill status={c.status} />
            </li>
          ))}
        </ul>
        <div className="mt-6 flex gap-2">
          <button ref={cancelRef} type="button" onClick={onCancel} className="btn btn-secondary flex-1 rounded-xl!">
            돌아가기
          </button>
          <button type="button" onClick={onConfirm} className="btn btn-primary flex-1 rounded-xl! font-bold">
            그래도 {updating ? "업데이트" : "발행"} →
          </button>
        </div>
      </div>
    </div>
  );
}
