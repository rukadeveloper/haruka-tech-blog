"use client";

import { useActionState, useEffect, useRef } from "react";
import { addComment } from "@/app/posts/[slug]/comment-actions";

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
        className="w-full resize-y rounded-md border border-line bg-transparent px-3 py-2 text-[15px] leading-relaxed outline-none focus:border-strong"
      />
      <div className="flex items-center justify-between">
        <span className="text-sm text-red-500">{state?.error}</span>
        <button
          disabled={pending}
          className="rounded-md bg-foreground px-4 py-1.5 text-sm font-medium text-background disabled:opacity-50"
        >
          {pending ? "등록 중…" : "등록"}
        </button>
      </div>
    </form>
  );
}
