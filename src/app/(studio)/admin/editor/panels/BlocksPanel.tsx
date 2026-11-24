"use client";

import type { Editor } from "@tiptap/react";
import { FILE_TREE_SAMPLE } from "@/lib/file-tree";
import { Icon } from "../icons";

type Block = {
  name: string;
  desc: string;
  icon: React.ReactNode;
  run: (editor: Editor) => void;
  /** 끌어다 놓을 때 넣을 HTML. 없으면 누르기만 된다 */
  html?: string;
};

type Group = { title: string; blocks: Block[] };

const text = (s: string) => <span className="text-[12px] font-bold">{s}</span>;

function groups(onPickImage: () => void): Group[] {
  return [
    {
      title: "구조",
      blocks: [
        { name: "제목 2", desc: "큰 구획 — 목차의 1단계", icon: text("H2"), run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(), html: "<h2>제목</h2>" },
        { name: "제목 3", desc: "작은 구획 — 목차의 2단계", icon: text("H3"), run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(), html: "<h3>제목</h3>" },
        { name: "인용구", desc: "다른 글 · 말을 따올 때", icon: <Icon.quote />, run: (e) => e.chain().focus().toggleBlockquote().run(), html: "<blockquote><p>인용</p></blockquote>" },
        { name: "구분선", desc: "흐름을 한 번 끊는다", icon: <Icon.hr />, run: (e) => e.chain().focus().setHorizontalRule().run(), html: "<hr>" },
        {
          name: "표",
          desc: "3 × 3, 첫 줄은 머리글",
          icon: <Icon.table />,
          run: (e) => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
          html: "<table><tbody><tr><th><p></p></th><th><p></p></th><th><p></p></th></tr><tr><td><p></p></td><td><p></p></td><td><p></p></td></tr><tr><td><p></p></td><td><p></p></td><td><p></p></td></tr></tbody></table>",
        },
      ],
    },
    {
      title: "개발",
      blocks: [
        {
          name: "코드 블록",
          desc: "언어는 서식 알약에서 바꾼다",
          icon: <Icon.code />,
          run: (e) => e.chain().focus().toggleCodeBlock({ language: "typescript" }).run(),
          html: '<pre><code class="language-typescript">// 코드</code></pre>',
        },
        {
          name: "파일 트리",
          desc: "들여쓰기로 폴더 구조를 그린다",
          icon: <Icon.fileTree />,
          run: (e) => e.chain().focus().insertContent({ type: "fileTree", attrs: { tree: FILE_TREE_SAMPLE } }).run(),
        },
        { name: "인라인 코드", desc: "문장 속 짧은 코드", icon: <Icon.inlineCode />, run: (e) => e.chain().focus().toggleCode().run() },
      ],
    },
    {
      title: "미디어",
      blocks: [{ name: "사진", desc: "업로드 — 붙여넣기 · 끌어놓기도 된다", icon: <Icon.image />, run: () => onPickImage() }],
    },
  ];
}

/**
 * 블록 패널: 묶음별 블록 목록. 누르면 커서 위치에 넣고,
 * html 이 있는 블록은 본문으로 끌어다 놓을 수도 있다 (ProseMirror 의 기본 드롭이 text/html 을 읽는다).
 */
export default function BlocksPanel({ editor, onPickImage, onPick }: { editor: Editor; onPickImage: () => void; onPick?: () => void }) {
  return (
    <div className="space-y-5">
      {groups(onPickImage).map((g) => (
        <section key={g.title}>
          <h3 className="mb-1.5 px-2 text-[11px] font-bold tracking-wider text-meta uppercase">{g.title}</h3>
          <ul className="space-y-0.5">
            {g.blocks.map((b) => (
              <li key={b.name}>
                <button
                  type="button"
                  draggable={!!b.html}
                  onDragStart={(e) => {
                    if (!b.html) return;
                    e.dataTransfer.setData("text/html", b.html);
                    e.dataTransfer.setData("text/plain", b.name);
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  onClick={() => {
                    b.run(editor);
                    onPick?.();
                  }}
                  title={b.html ? `${b.name} — 누르거나 본문으로 끌어다 놓기` : `${b.name} — 누르면 커서 위치에 넣기`}
                  className="pressable group flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left hover:bg-surface"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface text-muted group-hover:bg-elevated group-hover:text-foreground">
                    {b.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{b.name}</span>
                    <span className="block truncate text-xs text-meta">{b.desc}</span>
                  </span>
                  {b.html && (
                    <span className="shrink-0 text-meta/60 group-hover:text-meta" aria-hidden>
                      <Icon.grip />
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
