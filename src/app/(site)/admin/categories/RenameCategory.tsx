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
        className="btn btn-sm btn-ghost"
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
        className="field min-h-9! w-32 py-1.5! text-sm!"
      />
      <button className="btn btn-sm btn-primary">저장</button>
      <button type="button" onClick={() => setEditing(false)} className="btn btn-sm btn-ghost">
        취소
      </button>
    </form>
  );
}
