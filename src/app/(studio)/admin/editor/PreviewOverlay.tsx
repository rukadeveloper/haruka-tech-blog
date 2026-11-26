"use client";

import { useEffect } from "react";
import StudioPreview from "./StudioPreview";
import { Icon } from "./icons";

type Props = { html: string; title: string; category: string; date: string; thumbnail: string; onClose: () => void };

/** 미리보기 오버레이: 저장 전 내용을 공개 글과 같은 모양으로 화면 가득 보여 준다. Esc · 닫기로 닫는다 */
export default function PreviewOverlay({ onClose, ...preview }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    // 오버레이 스크롤과 페이지 스크롤이 겹치지 않게 잠근다
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label="미리보기" className="fixed inset-0 z-[60] flex flex-col bg-background p-3 lg:p-5">
      <div className="flex items-center gap-3 rounded-[20px] bg-elevated px-5 py-3">
        <span className="text-sm font-bold">미리보기</span>
        <span className="truncate text-xs text-meta">저장하지 않은 지금 내용입니다 · Esc 로 닫기</span>
        <button type="button" onClick={onClose} className="btn btn-sm btn-secondary ml-auto rounded-xl!">
          <Icon.x /> 닫기
        </button>
      </div>
      <div className="relative mt-3 min-h-0 flex-1 overflow-hidden rounded-[20px]">
        <StudioPreview {...preview} />
      </div>
    </div>
  );
}
