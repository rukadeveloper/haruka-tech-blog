#!/usr/bin/env node
/**
 * 디자인 규칙 위반 "후보"를 뽑는다. 판단은 사람(검토자)이 한다.
 *
 * 사용법
 *   node .claude/skills/blog-design-check/scripts/scan-design.mjs            # main 대비 바뀐 파일 + 작업 트리
 *   node .claude/skills/blog-design-check/scripts/scan-design.mjs --all      # src 전체
 *   node .claude/skills/blog-design-check/scripts/scan-design.mjs a.tsx b.css
 *
 * 영역(zone)
 *   site   : 공개 · 관리자 화면 — DESIGN.md 토큰만 써야 한다
 *   intro  : src/app/intro/ — 자체 값 허용 (.claude/rules/intro-page.md)
 *   studio : src/app/(studio)/ — 자체 값 허용 (.claude/rules/editor-bento.md)
 *   tokens : src/app/globals.css — 토큰을 정의하는 곳이라 색 값 검사 제외
 */
import { execSync } from "node:child_process";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const EXTS = new Set([".tsx", ".ts", ".css"]);
const args = process.argv.slice(2);

function sh(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return "";
  }
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p.replaceAll("\\", "/"));
  }
  return out;
}

let files;
if (args.includes("--all")) files = walk("src");
else if (args.length) files = args;
else {
  const base = sh("git merge-base HEAD main").trim() || "HEAD";
  files = [
    ...sh(`git diff --name-only ${base}`).split("\n"),
    ...sh("git ls-files --others --exclude-standard").split("\n"),
  ];
}
files = [...new Set(files.map((f) => f.trim()).filter(Boolean))]
  .filter((f) => f.startsWith("src/") && EXTS.has(extname(f)) && existsSync(f));

const zoneOf = (f) =>
  f.startsWith("src/app/intro/") ? "intro"
  : f.startsWith("src/app/(studio)/") ? "studio"
  : f === "src/app/globals.css" ? "tokens"
  : "site";

/** [id, 정규식, 설명, 검사할 영역] */
const RULES = [
  ["color-literal", /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(/, "색을 값으로 직접 씀 → 색 토큰 (로고 고정색 #191f28 · #fff 는 예외)", ["site"]],
  ["tw-arbitrary-color", /\b(?:bg|text|border|fill|stroke|ring|from|to|via)-\[#/, "Tailwind 임의 색 → bg-surface · text-muted 같은 토큰 이름", ["site"]],
  ["tw-palette", /\b(?:bg|text|border)-(?:white|black|gray|slate|zinc|neutral|red|blue|green|yellow|orange)(?:-\d{2,3})?\b/, "Tailwind 기본 팔레트 → 색 토큰 (라이트/다크가 따라오지 않음)", ["site"]],
  ["duration-literal", /\b\d{2,4}ms\b|duration-\d+|\bcubic-bezier\(/, "움직임 값을 직접 씀 → --dur* · --ease-out (움직임 줄이기 설정이 무시됨)", ["site", "studio"]],
  ["scale-literal", /active:scale-|scale\(0\.\d+\)/, "눌림 크기를 직접 씀 → .pressable 또는 var(--press*)", ["site", "studio"]],
  // 금지는 html · body 상태를 화면 안 표식으로 바꾸는 경우만. .post-body pre:has(> code) 같은 국소 선택자는 괜찮다.
  ["has-selector", /(?:^|[\s,])(?:html|body|:root)(?:\[[^\]]*\])*:has\(/, "html/body:has() 로 화면 표식 찾기 금지 (cacheComponents 가 떠난 화면 DOM 을 남김) → 마운트 동안 data 속성", ["site", "intro", "studio", "tokens"]],
  ["shadow", /\bshadow-(?:sm|md|lg|xl|2xl)\b|box-shadow:/, "그림자는 떠 있는 요소(--shadow-pop)에만", ["site"]],
  ["anchor-home", /href=["']\/["']/, "<a href=\"/\"> 는 인트로로 튕김 → next/link 인지 확인", ["site", "intro", "studio"]],
];

let count = 0;
for (const f of files) {
  const zone = zoneOf(f);
  const lines = readFileSync(f, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return; // 주석 줄은 건너뜀
    for (const [id, re, msg, zones] of RULES) {
      if (!zones.includes(zone) || !re.test(line)) continue;
      if (id === "anchor-home" && /<Link\b/.test(line)) continue;
      count++;
      console.log(`${f}:${i + 1} [${zone}] ${id} — ${msg}\n    ${line.trim().slice(0, 160)}`);
    }
  });
}
console.log(`\n검사한 파일 ${files.length}개, 후보 ${count}건. 후보는 예외 규칙과 대조해 직접 판단하세요.`);
