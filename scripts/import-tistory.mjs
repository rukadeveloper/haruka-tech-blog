// Tistory 블로그 전체 글을 content/posts/*.md 로 가져오는 스크립트.
// 사용: node scripts/import-tistory.mjs [blogUrl]
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

const BASE = (process.argv[2] ?? "https://eun-haa.tistory.com").replace(/\/$/, "");
const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "content", "posts");
const IMG_DIR = path.join(ROOT, "public", "images", "posts");
const UA = { "User-Agent": "Mozilla/5.0" };

const get = async (url, binary = false) => {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, { headers: UA });
      if (!res.ok) throw new Error(res.status);
      return binary ? Buffer.from(await res.arrayBuffer()) : await res.text();
    } catch (e) {
      if (i === 2) throw new Error(`${url}: ${e.message}`);
    }
  }
};

fs.mkdirSync(POSTS_DIR, { recursive: true });
fs.mkdirSync(IMG_DIR, { recursive: true });

// 카테고리 트리
const catHtml = cheerio.load(await get(`${BASE}/category`));
const categories = [];
catHtml(".category_list > li").each((_, li) => {
  const $li = catHtml(li);
  const top = $li.children("a.link_item");
  const name = top.clone().children().remove().end().text().trim();
  if (!name) return;
  const children = $li.find("a.link_sub_item").map((_, a) =>
    catHtml(a).clone().children().remove().end().text().trim()
  ).get();
  categories.push({ name, children });
});
fs.writeFileSync(
  path.join(ROOT, "content", "categories.json"),
  JSON.stringify(categories, null, 2) + "\n"
);
console.log("categories:", categories.length);

// 글 ID 목록
const sitemap = await get(`${BASE}/sitemap.xml`);
const ids = [...new Set([...sitemap.matchAll(/tistory\.com\/(\d+)</g)].map((m) => m[1]))].sort((a, b) => a - b);
console.log("posts:", ids.length);

const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced", bulletListMarker: "-" });
td.use(gfm);
td.addRule("tistoryCode", {
  filter: (n) => n.nodeName === "PRE",
  replacement: (_, n) => {
    const lang = n.getAttribute("data-ke-language") ?? n.className ?? "";
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

const imgCache = new Map();
async function localizeImage(url, id, n) {
  if (imgCache.has(url)) return imgCache.get(url);
  try {
    const buf = await get(url.startsWith("//") ? "https:" + url : url, true);
    const ext = (buf.subarray(0, 4).toString("hex") === "89504e47" ? "png"
      : buf.subarray(0, 3).toString("hex") === "474946" ? "gif"
      : buf.subarray(8, 12).toString() === "WEBP" ? "webp" : "jpg");
    const dir = path.join(IMG_DIR, String(id));
    fs.mkdirSync(dir, { recursive: true });
    const name = `${n}.${ext}`;
    fs.writeFileSync(path.join(dir, name), buf);
    const local = `/images/posts/${id}/${name}`;
    imgCache.set(url, local);
    return local;
  } catch (e) {
    console.warn("  image failed:", url, e.message);
    return url;
  }
}

const q = (s) => JSON.stringify(s);
for (const id of ids) {
  const $ = cheerio.load(await get(`${BASE}/${id}`));
  const title = $('meta[property="og:title"]').attr("content") ?? $("title").text();
  const date = ($('meta[property="article:published_time"]').attr("content") ?? "").slice(0, 10);
  const category = $(".category").first().text().trim();
  const body = $(".contents_style").first();
  body.find("script, style, .revenue_unit_wrap, .adsbygoogle").remove();
  body.find("p").each((_, p) => {
    const $p = $(p);
    if (!$p.text().replace(/\u00a0/g, "").trim() && !$p.find("img,figure").length) $p.remove();
  });

  // 이미지 로컬 저장
  let n = 0;
  const imgs = body.find("img").toArray();
  for (const el of imgs) {
    const src = $(el).attr("src");
    if (src) $(el).attr("src", await localizeImage(src, id, ++n));
    $(el).removeAttr("srcset");
  }
  let thumb = imgs.length ? $(imgs[0]).attr("src") : "";

  let md = td.turndown(body.html() ?? "").replace(/\n{3,}/g, "\n\n").trim();
  const plain = md.replace(/```[\s\S]*?```/g, "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/[#>*`\-\[\]|]/g, "").replace(/\s+/g, " ").trim();
  const description = plain.slice(0, 120);
  const tags = $(".tag_label a, .area_tag a").map((_, a) => $(a).text().replace(/^#/, "").trim()).get();

  const fm = [
    "---",
    `title: ${q(title)}`,
    `date: ${q(date)}`,
    `category: ${q(category)}`,
    `description: ${q(description)}`,
    `tags: ${JSON.stringify([...new Set(tags)])}`,
    `thumbnail: ${q(thumb ?? "")}`,
    `tistoryId: ${id}`,
    "---",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(POSTS_DIR, `${id}.md`), fm + md + "\n");
  console.log(`✓ ${id} [${category}] ${title}`);
}
