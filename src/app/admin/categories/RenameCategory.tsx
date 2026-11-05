"use client";

import { useEffect, useRef, useState } from "react";
import { renameCategory } from "../actions";

/** "이름 변경"을 누르면 그 자리에서 입력창으로 바뀌는 이름 변경 폼 */
export default function RenameCategory({ path, current }: { path: string; current: string }) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
      >
        이름 변경
      </button>
    );
  }

  return (
    <form action={renameCategory} className="flex items-center gap-1.5">
      <input type="hidden" name="category" value={path} />
      <input
        ref={inputRef}
        name="newName"
        defaultValue={current}
        required
        maxLength={40}
        aria-label={`${current} 새 이름`}
        onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
        className="w-32 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-strong"
      />
      <button className="rounded-lg bg-strong px-2.5 py-1.5 text-xs font-semibold text-white hover:opacity-90">저장</button>
      <button type="button" onClick={() => setEditing(false)} className="rounded-lg px-2 py-1.5 text-xs text-muted hover:bg-surface">
        취소
      </button>
    </form>
  );
}
