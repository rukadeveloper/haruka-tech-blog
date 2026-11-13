"use client";

import { Node, mergeAttributes, NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { FILE_TREE_SAMPLE, renderFileTreeHtml } from "@/lib/file-tree";

// 에디터 안의 파일 트리 블록: 왼쪽에 들여쓰기 텍스트를 쓰면 오른쪽(좁은 화면은 아래)에 바로 트리로 그려진다.
// 저장 형태는 <div data-file-tree="텍스트"></div> 이고, 공개 글·미리보기에서는 서버가 트리 HTML 로 바꿔 그린다 (lib/posts.ts).

function FileTreeView({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
  const tree = (node.attrs.tree as string) ?? "";
  const html = renderFileTreeHtml(tree);
  // 입력 중의 키·붙여넣기가 에디터 본문으로 새지 않게
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <NodeViewWrapper className={`my-5 rounded-2xl border border-line p-3 ${selected ? "bg-surface" : "bg-subtle"}`} contentEditable={false}>
      <div className="mb-2 flex items-start gap-2 text-xs text-muted">
        <span className="shrink-0 font-semibold">파일 트리</span>
        <span className="text-meta">들여쓰기 2칸 = 한 단계 · 폴더는 이름 뒤에 / · ` # 설명` 으로 설명 추가 · tree 명령 출력도 붙여넣기 가능</span>
        <button
          type="button"
          onClick={() => deleteNode()}
          className="ml-auto shrink-0 rounded-lg px-2 py-1 text-muted transition-colors hover:bg-danger-soft hover:text-danger"
        >
          삭제
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <textarea
          value={tree}
          onChange={(e) => updateAttributes({ tree: e.target.value })}
          onKeyDown={stop}
          onKeyUp={stop}
          onPaste={stop}
          onDrop={stop}
          spellCheck={false}
          rows={Math.min(16, Math.max(6, tree.split("\n").length + 1))}
          placeholder={FILE_TREE_SAMPLE}
          aria-label="파일 트리 내용"
          className="w-full resize-y rounded-xl border border-line bg-background p-3 font-mono text-[13px] leading-6 outline-none placeholder:text-meta"
        />
        <div className="min-w-0 overflow-x-auto">
          {html ? (
            <div className="post-body !m-0 !max-w-none [&_.file-tree]:!m-0" dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <p className="p-3 text-sm text-meta">왼쪽에 파일·폴더를 입력하면 여기에 트리가 나타납니다.</p>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
}

export const FileTree = Node.create({
  name: "fileTree",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      tree: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-file-tree") ?? "",
        renderHTML: (attrs) => ({ "data-file-tree": attrs.tree as string }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-file-tree]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileTreeView);
  },
});
