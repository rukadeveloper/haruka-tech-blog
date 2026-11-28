import { Node, mergeAttributes } from "@tiptap/react";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      /** 현재 블록을 콜아웃으로 감싼다 (이미 콜아웃 안이면 풀어낸다) */
      toggleCallout: () => ReturnType;
    };
  }
}

/**
 * 콜아웃(주의) 블록. 저장 형태는 <div data-callout="warning">…블록…</div> 이고,
 * 공개 글에서는 globals.css 의 .post-body div[data-callout] 가 그린다 (docs/editor "콜아웃 블록").
 */
export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      kind: {
        default: "warning",
        parseHTML: (el) => el.getAttribute("data-callout") || "warning",
        renderHTML: (attrs) => ({ "data-callout": attrs.kind }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-callout]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      toggleCallout:
        () =>
        ({ commands, editor }) =>
          editor.isActive(this.name) ? commands.lift(this.name) : commands.wrapIn(this.name),
    };
  },
});
