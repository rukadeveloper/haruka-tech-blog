// 글마다 제목·카테고리가 들어간 썸네일(1280×800)을 만들어 public/images/thumbs/<slug>.webp 로 저장하고,
// DB 의 thumbnail 을 그 경로로 바꾼다. 브라우저(Chrome/Edge)를 헤드리스로 띄워 HTML 을 캡처한다.
// 사용: node --env-file=.env scripts/generate-thumbnails.mjs [--dry] [--only=slug,slug]
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const W = 1280;
const H = 800;
const args = process.argv.slice(2);
const dry = args.includes("--dry");
const only = args.find((a) => a.startsWith("--only="))?.slice(7).split(",");

const BROWSERS = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
];
const browser = BROWSERS.find((p) => fs.existsSync(p));
if (!browser) throw new Error("Chrome 또는 Edge 를 찾을 수 없습니다.");

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

/** 대분류별 색 [배경 시작, 배경 끝, 강조] */
const PALETTE = {
  FE: ["#1e1b4b", "#4338ca", "#a5b4fc"],
  AI: ["#2e1065", "#7c3aed", "#f0abfc"],
  BE: ["#022c22", "#047857", "#6ee7b7"],
  리뷰: ["#451a03", "#b45309", "#fcd34d"],
  default: ["#0f172a", "#334155", "#94a3b8"],
};

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const hash = (s) => crypto.createHash("md5").update(s).digest().readUInt32BE(0);

const fontUrl = (f) => pathToFileURL(path.resolve("src/app/fonts", f)).href;

function html(post) {
  const [top, sub] = (post.category || "").split("/");
  const [c1, c2, accent] = PALETTE[top] ?? PALETTE.default;
  const h = hash(post.slug);
  // 글마다 장식 원의 위치·크기를 조금씩 다르게
  const r = (n, min, max) => min + (((h >>> n) & 255) / 255) * (max - min);
  const title = post.title || post.slug;
  const size = title.length > 40 ? 62 : title.length > 26 ? 72 : 84;
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>
@font-face{font-family:K;font-weight:400;src:url("${fontUrl("KakaoBig-Regular.woff2")}")}
@font-face{font-family:K;font-weight:700;src:url("${fontUrl("KakaoBig-Bold.woff2")}")}
@font-face{font-family:K;font-weight:800;src:url("${fontUrl("KakaoBig-ExtraBold.woff2")}")}
*{box-sizing:border-box;margin:0}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{font-family:K,sans-serif;color:#fff;position:relative;background:linear-gradient(135deg,${c1} 0%,${c2} 100%)}
.o{position:absolute;border-radius:50%}
.o1{width:${r(0, 560, 760)}px;height:${r(0, 560, 760)}px;right:${-r(8, 120, 260)}px;top:${-r(16, 160, 300)}px;background:${accent};opacity:.22}
.o2{width:${r(24, 320, 460)}px;height:${r(24, 320, 460)}px;right:${r(32, 80, 360)}px;bottom:${-r(40, 140, 220)}px;border:36px solid ${accent};opacity:.28}
.o3{width:${r(4, 120, 200)}px;height:${r(4, 120, 200)}px;left:${r(12, 520, 760)}px;top:${r(20, 70, 150)}px;background:#fff;opacity:.10}
.bg{position:absolute;left:84px;bottom:${-30}px;font-weight:800;font-size:300px;line-height:1;letter-spacing:-.04em;opacity:.07;white-space:nowrap}
.wrap{position:relative;height:100%;padding:84px 96px;display:flex;flex-direction:column}
.chip{align-self:flex-start;padding:12px 26px;border-radius:999px;background:rgba(255,255,255,.16);border:2px solid rgba(255,255,255,.28);font-weight:700;font-size:30px;letter-spacing:.01em}
.chip b{color:${accent};font-weight:700}
h1{margin-top:auto;font-weight:800;font-size:${size}px;line-height:1.22;letter-spacing:-.025em;max-width:980px;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;text-shadow:0 4px 24px rgba(0,0,0,.25)}
.foot{margin-top:44px;display:flex;align-items:center;gap:16px;font-weight:700;font-size:28px;opacity:.9}
.dot{width:14px;height:14px;border-radius:50%;background:${accent}}
</style></head><body>
<div class="o o1"></div><div class="o o2"></div><div class="o o3"></div>
<div class="bg">${esc(sub ?? top ?? "Blog")}</div>
<div class="wrap">
  <div class="chip">${top ? `<b>${esc(top)}</b>${sub ? ` &nbsp;/&nbsp; ${esc(sub)}` : ""}` : "Blog"}</div>
  <h1>${esc(title)}</h1>
  <div class="foot"><span class="dot"></span>eunhaa tech</div>
</div></body></html>`;
}

const outDir = path.resolve("public/images/thumbs");
fs.mkdirSync(outDir, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "thumbs-"));

const { data: posts, error } = await db.from("posts").select("slug,title,category").order("slug");
if (error) throw new Error(error.message);
const targets = posts.filter((p) => !only || only.includes(p.slug));

let done = 0;
for (const post of targets) {
  const src = path.join(tmp, `${post.slug}.html`);
  const shot = path.join(tmp, `${post.slug}.png`);
  const out = path.join(outDir, `${post.slug}.webp`);
  fs.writeFileSync(src, html(post));
  execFileSync(
    browser,
    [
      "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
      `--window-size=${W},${H}`, "--virtual-time-budget=3000", `--screenshot=${shot}`, pathToFileURL(src).href,
    ],
    { stdio: "ignore", timeout: 60000 },
  );
  await sharp(shot).webp({ quality: 82 }).toFile(out); // 캡처(PNG)는 크기가 커서 WebP 로 줄인다
  if (!dry) {
    const { error: e } = await db.from("posts").update({ thumbnail: `/images/thumbs/${post.slug}.webp` }).eq("slug", post.slug);
    if (e) throw new Error(`${post.slug}: ${e.message}`);
  }
  done++;
  if (done % 10 === 0) console.log(`${done}/${targets.length}`);
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`썸네일 ${done}개 생성${dry ? " (DB 는 바꾸지 않음)" : " + DB thumbnail 교체"}`);

// 공개 화면 캐시 무효화 (REVALIDATE_URL=https://내도메인 , REVALIDATE_SECRET 이 있을 때만)
if (!dry && process.env.REVALIDATE_URL && process.env.REVALIDATE_SECRET) {
  const res = await fetch(new URL("/api/revalidate", process.env.REVALIDATE_URL), {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.REVALIDATE_SECRET}` },
  });
  console.log(`캐시 무효화: ${res.status}`);
}
