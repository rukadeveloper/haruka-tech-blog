"use client";

import { useActionState, useState } from "react";
import { addEntry } from "@/app/guestbook/actions";
import { GUESTBOOK_MAX_LEN } from "@/lib/guestbook-config";

/** 글자 수를 세는 입력창. 등록에 성공하면 key 가 바뀌어 새로 만들어지므로 내용과 글자 수가 함께 비워진다 */
function Body() {
  const [length, setLength] = useState(0);
  return (
    <>
      <textarea
        name="body"
        required
        maxLength={GUESTBOOK_MAX_LEN}
        rows={4}
        onChange={(e) => setLength(e.target.value.length)}
        placeholder="블로그를 보고 느낀 점이나 응원의 한마디를 남겨 주세요."
        className="w-full resize-y rounded-2xl border border-line bg-surface/50 px-4 py-3 text-[15px] leading-relaxed outline-none transition-colors placeholder:text-meta focus:border-strong"
      />
      <span className="text-xs text-meta">
        {length} / {GUESTBOOK_MAX_LEN}
      </span>
    </>
  );
}

export default function GuestbookForm() {
  const [state, action, pending] = useActionState(addEntry, null);

  return (
    <form action={action} className="space-y-3">
      <div className="space-y-2 [&>span]:block [&>span]:text-right">
        <Body key={state?.ok ?? 0} />
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-red-500">{state?.error}</span>
        <button
          disabled={pending}
          className="rounded-xl bg-strong px-5 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "등록 중…" : "남기기"}
        </button>
      </div>
    </form>
  );
}
