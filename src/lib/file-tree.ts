// 파일 트리: 글쓴이가 들여쓰기 텍스트로 적으면 폴더·파일 트리 모양으로 그려 준다.
// 서버(공개 글·미리보기)와 에디터가 같은 함수로 그리므로 node 전용 모듈(fs 등)을 쓰지 않는다.
//
// 입력 형식 (아래 둘 다, 섞어 써도 된다)
//   1) 들여쓰기: 공백 2칸(또는 탭)마다 한 단계 안으로
//   2) `tree` 명령 출력: ├── └── │ 로 그려진 것을 그대로 붙여넣기
// 이름 뒤에 `/` 를 붙이거나 하위 항목이 있으면 폴더. ` # 설명` 으로 오른쪽에 설명을 달 수 있다.

export type TreeNode = { name: string; comment: string; isDir: boolean; children: TreeNode[] };

export const FILE_TREE_SAMPLE = `src/
  app/
    page.tsx  # 메인 페이지
    layout.tsx
  components/
    Header.tsx
package.json`;

// `tree` 출력 줄의 앞부분: "│   ├── ", "    └── " (한 단계가 4글자)
const BOX_PREFIX = /^[\s│|]*[├└][─-]*\s*/;
const HAS_BOX = /^[\s│|]*[├└]/;

function depthOf(raw: string, unit: number): { depth: number; text: string } {
  const line = raw.replace(/\t/g, "  ").trimEnd();
  const box = BOX_PREFIX.exec(line);
  if (box) return { depth: Math.floor(box[0].length / 4), text: line.slice(box[0].length).trim() };
  const indent = line.length - line.trimStart().length;
  return { depth: Math.floor(indent / unit), text: line.replace(/^[\s│|]+/, "").trim() };
}

export function parseFileTree(source: string): TreeNode[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n").filter((l) => l.trim() !== "");
  // 들여쓰기 한 단계의 크기: 0이 아닌 가장 작은 들여쓰기 (1~8칸)
  const indents = lines
    .filter((l) => !HAS_BOX.test(l))
    .map((l) => l.replace(/\t/g, "  ").search(/\S/))
    .filter((n) => n > 0);
  const unit = Math.min(8, Math.max(1, indents.length ? Math.min(...indents) : 2));

  const roots: TreeNode[] = [];
  const stack: { depth: number; node: TreeNode }[] = [];
  for (const raw of lines) {
    const { depth: rawDepth, text } = depthOf(raw, unit);
    if (!text) continue;
    const hash = text.search(/\s#\s|\s#$/);
    const label = (hash >= 0 ? text.slice(0, hash) : text).trim();
    const comment = hash >= 0 ? text.slice(hash).replace(/^\s#\s?/, "").trim() : "";
    const isDirMark = label.endsWith("/");
    const node: TreeNode = { name: isDirMark ? label.slice(0, -1) : label, comment, isDir: isDirMark, children: [] };
    if (!node.name) continue;

    // 바로 윗 단계보다 깊이 들여써도 한 단계만 안으로 본다
    while (stack.length && stack[stack.length - 1].depth >= rawDepth) stack.pop();
    const parent = stack[stack.length - 1]?.node;
    const depth = stack.length;
    if (parent) {
      parent.isDir = true;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
    stack.push({ depth: Math.max(rawDepth, depth > 0 ? stack[depth - 1].depth + 1 : 0), node });
  }
  return roots;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function renderNodes(nodes: TreeNode[]): string {
  return `<ul>${nodes
    .map((n) => {
      const kind = n.isDir ? "dir" : "file";
      const ext = !n.isDir && n.name.includes(".") ? n.name.split(".").pop()!.toLowerCase().replace(/[^a-z0-9]/g, "") : "";
      return (
        `<li class="ft-${kind}"${ext ? ` data-ext="${ext}"` : ""}>` +
        `<span class="ft-name">${escapeHtml(n.name)}${n.isDir ? "/" : ""}</span>` +
        (n.comment ? `<span class="ft-comment">${escapeHtml(n.comment)}</span>` : "") +
        (n.children.length ? renderNodes(n.children) : "") +
        `</li>`
      );
    })
    .join("")}</ul>`;
}

/** 트리 텍스트 → 화면에 보여줄 HTML (비어 있으면 빈 문자열) */
export function renderFileTreeHtml(source: string): string {
  const nodes = parseFileTree(source);
  return nodes.length ? `<div class="file-tree">${renderNodes(nodes)}</div>` : "";
}
