#!/usr/bin/env node
// 디자인 규칙 위반 "후보" 를 찾는다. 판정은 사람(design-reviewer)이 한다 — 여기서 나온 줄을 그대로 지적으로 옮기지 않는다.
//
// 사용법 (저장소 루트에서):
//   node .claude/skills/blog-design-check/scripts/scan-design.mjs          바뀐 파일만 (main 대비 + 작업 트리 + 새 파일)
//   node .claude/skills/blog-design-check/scripts/scan-design.mjs --all    src 전체
//   node .claude/skills/blog-design-check/scripts/scan-design.mjs a.tsx b.css   지정한 파일만
//
// 영역: public(공개 · 관리자 화면, docs/design) / studio(src/app/(studio), docs/editor) / intro(src/app/intro, docs/intro).
// 색 · 움직임 · 면 검사(D1–D6)는 public 에만 적용한다. 인트로와 에디터는 자체 값을 쓰는 예외 영역이다.

import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const EXT = /\.(tsx|ts|jsx|css)$/;
const args = process.argv.slice(2);

const sh = (cmd) => {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return "";
  }
};

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (EXT.test(name)) out.push(relative(ROOT, p).split(sep).join("/"));
  }
  return out;
}

function changedFiles() {
  const base = sh("git merge-base main HEAD").trim();
  const lists = [
    base ? sh(`git diff --name-only ${base}...HEAD`) : "",
    sh("git diff --name-only"),
    sh("git diff --name-only --cached"),
    sh("git ls-files --others --exclude-standard"),
  ];
  return [...new Set(lists.join("\n").split("\n").map((s) => s.trim()).filter(Boolean))];
}

const files = (args.includes("--all") ? walk(join(ROOT, "src")) : args.length ? args : changedFiles())
  .map((f) => f.replace(/\\/g, "/"))
  .filter((f) => f.startsWith("src/") && EXT.test(f) && existsSync(join(ROOT, f)));

const area = (f) =>
  f.startsWith("src/app/(studio)/") ? "studio" : f.startsWith("src/app/intro/") ? "intro" : "public";

const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose";
const UTIL = "text|bg|border|ring|fill|stroke|from|via|to|outline|divide|decoration|accent|caret|placeholder";

/** [id, 적용 영역, 정규식, 설명, 파일 종류] */
const RULES = [
  ["D1", "public", /#[0-9a-fA-F]{3,8}\b|rgba?\(\s*\d/, "색 값을 직접 씀 — globals.css 토큰(text-muted, bg-surface, var(--line) 등)을 쓴다", "any"],
  ["D2", "public", new RegExp(`\\b(${UTIL})-(${PALETTE})-\\d{2,3}\\b|\\b(${UTIL})-(white|black)\\b`), "Tailwind 기본 팔레트 색 — 다크 모드에서 안 바뀐다. 토큰 유틸리티를 쓴다", "any"],
  ["D3", "public", /\bduration-(\d+|\[(?!var\(--dur))|(?<![-(])\bease-(in|out|in-out|linear)\b|\bease-\[(?!var\(--ease)|\bdelay-\d+/, "움직임 값을 직접 씀 — var(--dur*) · var(--ease-out) 를 쓴다 (reduced-motion 이 토큰으로 처리된다)", "tsx"],
  ["D3", "public", /(transition|animation)[^;]*\b\d+(\.\d+)?m?s\b(?![^;]*var\(--dur)|cubic-bezier\(/, "움직임 값을 직접 씀 — var(--dur*) · var(--ease-out)", "css"],
  ["D4", "public", /\b(active:)?scale-(9\d|1\d\d)\b|scale\(0\.\d+\)/, "누름 크기를 직접 씀 — .pressable / .pressable-lg 또는 var(--press*)", "any"],
  ["D5", "public", /\bshadow-(sm|md|lg|xl|2xl)\b|box-shadow:\s*\d/, "그림자를 직접 씀 — shadow-card / shadow-pop 또는 .card · .glass-thick", "any"],
  ["D6", "public", /\bbackdrop-blur|backdrop-filter:\s*blur/, "흐림 효과 — 면은 평평하다. .glass* 클래스를 쓴다", "any"],
  ["D7", "all", /<a\b[^>]*\bhref=["']\/["']/, "홈으로 가는 <a> — 문서를 새로 받아 인트로로 튕긴다. next/link 를 쓴다", "tsx"],
  ["D8", "all", /(^|[\s,{}>])(html|body|:root)(?![\w-])[^{,]*:has\(/, "html · body 상태를 :has() 로 바꿈 — 떠난 화면 DOM 이 남아 다른 화면까지 바뀐다", "css"],
  ["D9", "public", /outline-none|outline:\s*none/, "포커스 표시 제거 — .admin-ui 입력 요소 외에는 :focus-visible 을 남긴다", "any"],
];

// 토큰을 정의하는 줄은 색 · 움직임 값을 써도 된다 (globals.css 의 --x: 값; 줄)
const isTokenDefinition = (line) => /^\s*--[\w-]+\s*:/.test(line);
const isComment = (line) => /^\s*(\/\/|\/\*|\*)/.test(line);

const hits = [];
for (const f of files) {
  const kind = f.endsWith(".css") ? "css" : "tsx";
  const a = area(f);
  readFileSync(join(ROOT, f), "utf8")
    .split(/\r?\n/)
    .forEach((line, i) => {
      if (isComment(line) || isTokenDefinition(line)) return;
      for (const [id, where, re, msg, only] of RULES) {
        if (where !== "all" && where !== a) continue;
        if (only !== "any" && only !== kind) continue;
        if (re.test(line)) hits.push({ f, line: i + 1, id, msg, text: line.trim().slice(0, 140) });
      }
    });
}

if (!files.length) {
  console.log("검사할 화면 파일이 없습니다 (바뀐 src/**/*.tsx|ts|css 없음).");
  process.exit(0);
}
console.log(`검사한 파일 ${files.length}개 · 후보 ${hits.length}건 (후보일 뿐이다 — 줄을 읽고 판정한다)\n`);
for (const h of hits) console.log(`${h.f}:${h.line} [${h.id}] ${h.msg}\n    ${h.text}`);
const byArea = files.reduce((m, f) => ((m[area(f)] = (m[area(f)] ?? 0) + 1), m), {});
console.log(`\n영역별 파일 수: ${JSON.stringify(byArea)} — studio · intro 파일은 docs/editor · docs/intro 규칙으로 직접 읽어 확인한다.`);
