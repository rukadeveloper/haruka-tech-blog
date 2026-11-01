// Tistory 임시저장 글을 content/posts/draft-<번호>.md (draft: true) 로 가져오는 스크립트.
// 임시저장은 로그인해야 볼 수 있으므로 .env 의 TISTORY_SESSION (TSSESSION 쿠키 값) 이 필요하다.
// 사용: node --env-file=.env scripts/import-tistory-drafts.mjs [blogUrl] [--force]
//   --force: 이미 가져온 임시저장 글도 덮어쓴다 (기본은 건너뜀 — 블로그에서 고친 내용을 지키기 위해)
import fs from "node:fs";
import path from "node:path";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const BASE = (args.find((a) => a.startsWith("http")) ?? "https://eun-haa.tistory.com").replace(/\/$/, "");
const SESSION = process.env.TISTORY_SESSION;
if (!SESSION) {
  console.error("TISTORY_SESSION 이 없습니다. .env 에 TSSESSION 쿠키 값을 넣고 --env-file=.env 로 실행하세요.");
  process.exit(1);
}

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "content", "posts");
const IMG_DIR = path.join(ROOT, "public", "images", "posts");
const UA = { "User-Agent": "Mozilla/5.0" };

const retry = async (url, init, read) => {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, init);
      if (!res.ok) throw new Error(res.status);
      return await read(res);
    } catch (e) {
      if (i === 2) throw new Error(`${url}: ${e.message}`);
    }
  }
};
const getJson = (p) =>
  retry(`${BASE}${p}`, { headers: { ...UA, Cookie: `TSSESSION=${SESSION}` } }, (r) => r.json());
const getBin = (url) => retry(url, { headers: UA }, async (r) => Buffer.from(await r.arrayBuffer()));

fs.mkdirSync(POSTS_DIR, { recursive: true });

// 카테고리 id -> "AI/딥러닝"
const flat = new Map();
const walk = (list) => list.forEach((c) => { flat.set(String(c.id), c.label); walk(c.children ?? []); });
walk((await getJson("/manage/category.json")).categories ?? []);
const known = new Set(
  JSON.parse(fs.readFileSync(path.join(ROOT, "content", "categories.json"), "utf8"))
    .flatMap((c) => [c.name, ...c.children.map((s) => `${c.name}/${s}`)])
);

const list = (await getJson("/manage/drafts")).data ?? [];
console.log("drafts:", list.length);

const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced", bulletListMarker: "-" });
td.use(gfm);
td.addRule("tistoryCode", {
  filter: (n) => n.nodeName === "PRE",
  replacement: (_, n) => {
    const lang = n.getAttribute("data-ke-language") ?? n.querySelector("code")?.className.replace(/^language-/, "") ?? "";
    const code = n.textContent.replace(/\n$/, "");
    return `\n\n\`\`\`${lang === "text" ? "" : lang}\n${code}\n\`\`\`\n\n`;
  },
});
td.addRule("figure", {
  filter: "figure",
  replacement: (_, n) => {
    const img = n.querySelector("img");
    if (!img) return n.textContent.trim() ? `\n\n${n.textContent.trim()}\n\n` : "";
    const cap = n.querySelector("figcaption")?.textContent.trim() ?? "";
    return `\n\n![${cap || img.getAttribute("alt") || ""}](${img.getAttribute("src")})\n\n`;
  },
});

const q = (s) => JSON.stringify(s);

for (const item of list) {
  const seq = item.sequence;
  const slug = `draft-${seq}`;
  const file = path.join(POSTS_DIR, `${slug}.md`);
  if (fs.existsSync(file) && !FORCE) {
    console.log(`- ${slug} 건너뜀 (이미 있음) ${item.title}`);
    continue;
  }

  const { draft } = await getJson(`/manage/drafts/${seq}`);
  let html = draft.content ?? "";

  // [##_Image|kage@경로|CDM|1.3|{json}_##] -> 로컬에 저장한 <img>
  const dir = path.join(IMG_DIR, slug);
  let n = 0;
  const thumbs = [];
  const tokens = [...new Set(html.match(/\[##_Image\|[^|]*\|[\s\S]*?_##\]/g) ?? [])];
  for (const tok of tokens) {
    const ref = tok.split("|")[1];
    let local = "";
    try {
      const url = ref.startsWith("kage@") ? `https://blog.kakaocdn.net/dna/${ref.slice(5)}` : ref;
      const buf = await getBin(url);
      const hex = buf.subarray(0, 4).toString("hex");
      const ext = hex === "89504e47" ? "png" : hex.startsWith("474946") ? "gif"
        : buf.subarray(8, 12).toString() === "WEBP" ? "webp" : "jpg";
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, `${++n}.${ext}`), buf);
      local = `/images/posts/${slug}/${n}.${ext}`;
      thumbs.push(local);
    } catch (e) {
      console.warn("  image failed:", e.message);
    }
    html = html.split(tok).join(local ? `<img src="${local}" alt="">` : "");
  }
  const leftover = [...new Set(html.match(/\[##_\w+/g) ?? [])];
  if (leftover.length) console.warn(`  처리하지 못한 티스토리 토큰: ${leftover.join(", ")} (${slug})`);

  const md = td.turndown(html).replace(/\n{3,}/g, "\n\n").trim();
  const plain = md.replace(/```[\s\S]*?```/g, "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/[#>*`\-\[\]|]/g, "").replace(/\s+/g, " ").trim();
  const label = flat.get(String(draft.categoryId)) ?? "";
  const category = known.has(label) ? label : "";
  if (label && !category) console.warn(`  카테고리 "${label}" 가 categories.json 에 없어 비워 둡니다 (${slug})`);
  const tags = (draft.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean);

  const fm = [
    "---",
    `title: ${q(draft.title || "(제목 없음)")}`,
    `date: ${q((draft.createdAt ?? "").slice(0, 10))}`,
    `category: ${q(category)}`,
    `description: ${q(plain.slice(0, 120))}`,
    `tags: ${JSON.stringify(tags)}`,
    `thumbnail: ${q(thumbs[0] ?? "")}`,
    `tistoryDraftId: ${seq}`,
    "draft: true",
    "---",
    "",
  ].join("\n");
  fs.writeFileSync(file, fm + md + "\n");
  console.log(`✓ ${slug} [${category || "-"}] ${draft.title} (이미지 ${n}장)`);
}
