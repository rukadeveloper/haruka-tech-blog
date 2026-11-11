"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  /** 모달 본문에 보여줄 삭제 대상 이름 */
  target: string;
  /** 모달에 추가로 보여줄 안내 문구 */
  description?: string;
  className?: string;
};

/** form 안에서 쓰는 삭제 버튼. 클릭하면 커스텀 모달로 한 번 더 확인한 뒤 form을 제출한다. */
export default function ConfirmDeleteButton({ target, description, className }: Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const confirm = () => {
    setOpen(false);
    triggerRef.current?.form?.requestSubmit();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className={className ?? "btn btn-sm btn-danger"}
      >
        삭제
      </button>
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
            onClick={() => setOpen(false)}
          >
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-delete-title"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl border border-line bg-elevated p-6 text-foreground shadow-pop"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
              </div>
              <h2 id="confirm-delete-title" className="text-center text-lg font-bold">
                정말 삭제할까요?
              </h2>
              <p className="mt-2 text-center text-sm text-muted">
                <span className="font-semibold break-words">“{target}”</span>
                <br />
                {description ?? "삭제하면 되돌릴 수 없습니다."}
              </p>
              <div className="mt-6 flex gap-2">
                <button
                  ref={cancelRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn btn-secondary flex-1"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={confirm}
                  className="btn btn-danger-solid flex-1"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
