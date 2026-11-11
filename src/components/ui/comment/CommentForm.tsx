"use client";

import { useActionState, useEffect, useRef } from "react";
import { addComment } from "@/app/posts/[slug]/comment-actions";
import Button from "@/components/ui/common/Button";

export default function CommentForm({
  slug,
  parentId,
  placeholder = "댓글을 입력하세요",
  onDone,
}: {
  slug: string;
  parentId?: string;
  placeholder?: string;
  onDone?: () => void;
}) {
  const [state, action, pending] = useActionState(addComment, null);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state?.ok) {
      if (ref.current) ref.current.value = "";
      onDone?.();
    }
  }, [state, onDone]);

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="slug" value={slug} />
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
      <textarea
        ref={ref}
        name="body"
        required
        maxLength={2000}
        rows={parentId ? 2 : 3}
        placeholder={placeholder}
        className="field resize-y"
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-danger" role="status">
          {state?.error}
        </span>
        <Button variant="primary" size="sm" disabled={pending}>
          {pending ? "등록 중…" : "등록"}
        </Button>
      </div>
    </form>
  );
}
