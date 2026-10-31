"use client";

import { useCallback, useState } from "react";
import CommentForm from "./CommentForm";

export default function ReplyToggle({ slug, parentId }: { slug: string; parentId: string }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  return (
    <div>
      <button type="button" onClick={() => setOpen((v) => !v)} className="text-sm text-meta hover:text-foreground">
        {open ? "취소" : "답글"}
      </button>
      {open && (
        <div className="mt-2">
          <CommentForm slug={slug} parentId={parentId} placeholder="답글을 입력하세요" onDone={close} />
        </div>
      )}
    </div>
  );
}
