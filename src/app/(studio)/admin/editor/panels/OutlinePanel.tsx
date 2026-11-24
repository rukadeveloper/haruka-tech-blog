"use client";

import type { Editor } from "@tiptap/react";

type Heading = { level: 2 | 3 | 4; text: string; pos: number };

/** 본문의 H2 · H3 · H4 를 문서 순서대로 모은다 */
function headings(editor: Editor): Heading[] {
  const out: Heading[] = [];
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "heading") {
      const level = node.attrs.level as number;
      if (level >= 2 && level <= 4) out.push({ level: level as 2 | 3 | 4, text: node.textContent.trim(), pos });
      return false;
    }
    return true;
  });
  return out;
}

const INDENT = { 2: "pl-2", 3: "pl-6", 4: "pl-10" } as const;

/**
 * 목차 패널: 본문 제목 트리. 누르면 그 제목으로 커서를 옮기고 쓰기 영역을 스크롤한다.
 * 에디터가 트랜잭션마다 다시 그려지므로 따로 구독하지 않는다.
 */
export default function OutlinePanel({ editor, onPick }: { editor: Editor; onPick?: () => void }) {
  const list = headings(editor);
  const { from } = editor.state.selection;
  // 커서가 들어 있는 구획(커서보다 앞에 있는 마지막 제목)을 강조한다
  const current = list.filter((h) => h.pos <= from).at(-1)?.pos;

  const go = (h: Heading) => {
    editor.chain().setTextSelection(h.pos + 1).focus(undefined, { scrollIntoView: false }).run();
    const dom = editor.view.nodeDOM(h.pos);
    if (dom instanceof HTMLElement) dom.scrollIntoView({ block: "start", behavior: "smooth" });
    onPick?.();
  };

  if (list.length === 0)
    return (
      <p className="px-2 py-6 text-center text-sm leading-relaxed text-meta">
        H2 · H3 로 구획을 나누면
        <br />
        여기에 목차가 생깁니다.
      </p>
    );

  return (
    <ul className="space-y-0.5">
      {list.map((h, i) => (
        <li key={`${h.pos}-${i}`}>
          <button
            type="button"
            onClick={() => go(h)}
            aria-current={current === h.pos ? "location" : undefined}
            className={`pressable flex w-full items-center gap-2 rounded-lg py-1.5 pr-2 text-left text-sm hover:bg-surface aria-[current=location]:bg-strong-soft aria-[current=location]:text-strong ${INDENT[h.level]}`}
          >
            <span className="w-6 shrink-0 rounded bg-surface text-center text-[10px] leading-5 font-bold text-meta">H{h.level}</span>
            <span className={`min-w-0 truncate ${h.level === 2 ? "font-semibold" : "text-muted"}`}>{h.text || "(빈 제목)"}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
