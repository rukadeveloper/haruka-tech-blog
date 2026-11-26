"use client";

import type { Editor, JSONContent } from "@tiptap/react";
import { FILE_TREE_SAMPLE } from "@/lib/file-tree";
import { Icon } from "./icons";

const cell = (type: "tableHeader" | "tableCell"): JSONContent => ({ type, content: [{ type: "paragraph" }] });
const row = (type: "tableHeader" | "tableCell"): JSONContent => ({ type: "tableRow", content: [cell(type), cell(type), cell(type)] });

type Tile = { name: string; icon: React.ReactNode; content?: JSONContent; run?: () => void };

const label = (s: string) => <span className="font-grotesk text-[13px] font-bold">{s}</span>;

/**
 * 블록 추가 메뉴 (메인 열 맨 아래 카드): 누르면 커서가 있는 블록 바로 뒤에 넣고 그 블록으로 커서를 옮긴다.
 * 본문을 한 번도 누르지 않았다면 문서 끝에 넣는다.
 */
export default function BlockAddMenu({ editor, touched, onPickImage }: { editor: Editor; touched: boolean; onPickImage: () => void }) {
  const tiles: Tile[] = [
    { name: "문단", icon: <Icon.paragraph />, content: { type: "paragraph" } },
    { name: "제목 2", icon: label("H2"), content: { type: "heading", attrs: { level: 2 } } },
    { name: "제목 3", icon: label("H3"), content: { type: "heading", attrs: { level: 3 } } },
    { name: "코드", icon: <Icon.code />, content: { type: "codeBlock", attrs: { language: "typescript" } } },
    { name: "콜아웃", icon: label("!"), content: { type: "callout", content: [{ type: "paragraph" }] } },
    { name: "파일 트리", icon: <Icon.fileTree />, content: { type: "fileTree", attrs: { tree: FILE_TREE_SAMPLE } } },
    { name: "표", icon: <Icon.table />, content: { type: "table", content: [row("tableHeader"), row("tableCell"), row("tableCell")] } },
    { name: "사진", icon: <Icon.image />, run: onPickImage },
    { name: "인용", icon: <Icon.quote />, content: { type: "blockquote", content: [{ type: "paragraph" }] } },
    { name: "구분선", icon: <Icon.hr />, content: { type: "horizontalRule" } },
  ];

  const insert = (content: JSONContent) => {
    const { state } = editor;
    const { $from } = state.selection;
    // 커서가 든 최상위 블록 바로 뒤 (본문을 건드리지 않았으면 문서 끝)
    const at = touched && $from.depth > 0 ? $from.after(1) : state.doc.content.size;
    editor.chain().insertContentAt(at, content).run();
    // 새 블록 안으로 커서를 옮기고 화면에 보이게 한다 (구분선처럼 글자를 못 넣는 블록은 그 다음 자리)
    const pos = Math.min(at + 1, editor.state.doc.content.size);
    editor.chain().focus().setTextSelection(pos).scrollIntoView().run();
    const dom = editor.view.nodeDOM(at);
    if (dom instanceof HTMLElement) dom.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  return (
    <section aria-label="블록 추가" className="mt-3 rounded-[20px] bg-elevated p-5 sm:p-6">
      <h2 className="text-[15px] font-bold">블록 추가</h2>
      <p className="mt-0.5 text-[13px] text-meta">{touched ? "커서가 있는 블록 바로 뒤에 넣습니다." : "글 끝에 넣습니다. 본문을 누르면 그 자리 뒤에 넣습니다."}</p>
      <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
        {tiles.map((t) => (
          <li key={t.name}>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => (t.run ? t.run() : t.content && insert(t.content))}
              className="pressable flex h-[72px] w-full flex-col items-center justify-center gap-1.5 rounded-xl bg-surface text-[13px] font-medium text-muted hover:bg-strong-soft hover:text-foreground"
            >
              <span className="grid h-5 place-items-center">{t.icon}</span>
              {t.name}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
