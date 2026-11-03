// 본문 HTML 의 h2·h3 로 목차를 만든다. node:fs 를 쓰지 않아 클라이언트(에디터 미리보기)에서도 가져올 수 있다.

export type TocItem = {
  id: string;
  text: string;
  /** 0 = 최상위, 1 = 하위 */
  depth: 0 | 1;
  /** "1." / "1.1." 형태의 번호 */
  number: string;
};

const HEADING = /<h([23])((?:\s[^>]*)?)>([\s\S]*?)<\/h\1>/g;
const ID_ATTR = /\sid=(?:"([^"]*)"|'([^']*)')/;

const decode = (s: string) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");

/**
 * 제목에 id 를 붙인 HTML 과 목차 항목을 돌려준다.
 * 제목이 2개 미만이면 목차가 의미 없으므로 items 를 비운다.
 */
export function buildToc(html: string): { html: string; items: TocItem[] } {
  const found: { level: 2 | 3; text: string }[] = [];
  const matches = [...html.matchAll(HEADING)];
  for (const m of matches) {
    const text = decode(m[3].replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();
    found.push({ level: Number(m[1]) as 2 | 3, text });
  }
  const usable = found.filter((h) => h.text);
  if (usable.length < 2) return { html, items: [] };

  // h3 만 있는 글은 h3 를 최상위로 본다
  const top = Math.min(...usable.map((h) => h.level));
  let major = 0;
  let minor = 0;
  let n = 0;
  const items: TocItem[] = [];

  const out = html.replace(HEADING, (whole, level: string, attrs: string, inner: string) => {
    const text = found[n]?.text;
    const index = n++;
    if (!text) return whole;
    const depth = Number(level) === top ? 0 : 1;
    if (depth === 0) {
      major += 1;
      minor = 0;
    } else {
      minor += 1;
    }
    const existing = ID_ATTR.exec(attrs);
    const id = existing ? (existing[1] ?? existing[2]) : `toc-${index}`;
    items.push({ id, text, depth, number: depth === 0 ? `${major}.` : `${major || 1}.${minor}.` });
    return existing ? whole : `<h${level} id="${id}"${attrs}>${inner}</h${level}>`;
  });

  return { html: out, items };
}
