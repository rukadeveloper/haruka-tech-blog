// node --env-file=.env.local scripts/generate-post-covers.mjs
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const directory = new URL("../public/images/post-covers/", import.meta.url);
const manifest = new URL("../src/lib/post-covers.json", import.meta.url);
const catalog = {
  4: ["Variables", "x = 42", "code"],
  5: ["Collections", "[ 1, 2, 3 ]", "code"],
  6: ["Deep Dive", "", "stage"],
  8: ["Control Flow", "if / else", "tree"],
  9: ["Functions", "def f(x):", "code"],
  10: ["Files & Regex", "^ .* $", "code"],
  11: ["Classes", "class", "code"],
  12: ["Exceptions", "try / except", "code"],
  54: ["Functions", "f(x) => y", "code"],
  55: ["this", "obj.method()", "code"],
  56: ["Closures", "scope()", "code"],
  57: ["Event Loop", "", "loop"],
  58: ["Variables", "let / const", "code"],
  59: ["React Basics", "", "orbit"],
  60: ["Effects", "useEffect", "code"],
  61: ["Pure UI", "same in / out", "code"],
  62: ["Form State", "onChange", "code"],
  63: ["Async Data", "await", "code"],
  64: ["Reducers", "dispatch", "code"],
  65: ["Context API", "", "tree"],
  66: ["Rendering", "SSR / CSR", "code"],
  67: ["Static Routes", "/about", "code"],
  68: ["Dynamic Routes", "/[slug]", "code"],
  69: ["Route Groups", "(group)", "tree"],
  70: ["Route Fallbacks", "", "stack"],
  71: ["Data Fetching", "fetch()", "code"],
  74: ["Route Handlers", "GET / POST", "code"],
  75: ["Server Actions", "use server", "code"],
  76: ["NumPy", "", "matrix"],
  77: ["Pandas", "", "table"],
  78: ["Matplotlib", "", "line"],
  79: ["Pension Data", "", "bars"],
  80: ["ML Basics", "", "network"],
  81: ["Classification", "", "classifier"],
  82: ["Regression", "", "line"],
  83: ["Logistic Model", "", "sigmoid"],
  84: ["Gradient Descent", "", "descent"],
  85: ["Decision Tree", "", "tree"],
  86: ["Grid Search", "", "matrix"],
  87: ["Tree Ensembles", "", "forest"],
  88: ["League Data", "", "bars"],
  89: ["Clustering", "", "clusters"],
  90: ["PCA", "", "axes"],
  91: ["Deep Learning", "", "network"],
  92: ["Neural Networks", "", "deep"],
  93: ["Model Training", "", "descent"],
  94: ["Convolutions", "", "matrix"],
  95: ["Caching", "cacheLife", "code"],
  96: ["Micro Frontends", "", "table"],
  97: ["TanStack Query", "useQuery", "code"],
  98: ["TanStack Query", "useMutation", "code"],
  1793674113730: ["Claude Code", "기초 가이드", "typography"],
  1793752250022: ["Backend Basics", "", "stack"],
  1793859401861: ["Nest.js Setup", "nest new", "code"],
  "draft-80": ["Refs", "useRef", "code"],
  "draft-114": ["PyTorch", "", "deep"],
};

const series = {
  Python: ["PYTHON", "#ffd178"],
  Javascript: ["JAVASCRIPT", "#f7df76"],
  React: ["REACT", "#76ddff"],
  "Next.js": ["NEXT.JS", "#b9b0ff"],
  "Nest.js": ["NEST.JS", "#ff9cae"],
  "데이터 분석": ["DATA ANALYSIS", "#78edcb"],
  머신러닝: ["MACHINE LEARNING", "#8abaff"],
  딥러닝: ["DEEP LEARNING", "#d6adff"],
  LLM: ["LLM", "#ffb891"],
  리뷰: ["EVENT REVIEW", "#ffab8c"],
};

const circle = (x, y, r = 5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="currentColor" stroke="none"/>`;
const path = (d) => `<path d="${d}" fill="none"/>`;
const box = (x, y, w, h, r = 6) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none"/>`;
const points = (coordinates) => coordinates.map(([x, y]) => circle(x, y)).join("");
const tree = path("M60 16v18M26 58V34h68v24") + points([[60, 14], [26, 62], [94, 62]]);
const network = path("M20 18 60 12 100 39 60 65 20 58 60 12 M20 18 60 65 100 39") +
  points([[20, 18], [20, 58], [60, 12], [60, 65], [100, 39]]);
const axes = path("M18 12v54h91");
const grid = box(24, 10, 72, 60) + path("M48 10v60m24-60v60M24 30h72M24 50h72");
const diagrams = {
  tree,
  forest: `<g transform="translate(0 13) scale(.53)">${tree}</g><g transform="translate(49 0) scale(.66)">${tree}</g><g transform="translate(81 31) scale(.34)">${tree}</g>`,
  network,
  deep: network + path("M20 38 60 12 M20 38 60 65 M60 38 100 39") + points([[20, 38], [60, 38]]),
  stack: box(26, 10, 68, 14) + box(26, 32, 68, 14) + box(26, 54, 68, 14) + points([[36, 17], [36, 39], [36, 61]]),
  loop: path("M99 34a41 28 0 0 0-74-14l-6 8m0-17v17h17M21 45a41 28 0 0 0 74 14l6-8m0 17V51H84") + circle(60, 39, 8),
  orbit: [0, 60, 120].map((angle) => `<ellipse cx="60" cy="39" rx="44" ry="16" transform="rotate(${angle} 60 39)" fill="none"/>`).join("") + circle(60, 39),
  stage: path("M24 65h72M32 55h56M38 55V26l22-13 22 13v29M60 24v22") + circle(60, 31, 7),
  matrix: grid + path("M48 30h24v20H48z"),
  table: box(16, 12, 88, 54) + path("M16 28h88M16 46h88M46 12v54M74 12v54"),
  line: axes + path("m29 53 19-18 20 7 31-25") + points([[29, 53], [48, 35], [68, 42], [99, 17]]),
  bars: axes + path("M32 58V39h14v19m13 0V24h14v34m13 0V14h14v44"),
  clusters: points([[29, 20], [42, 15], [38, 30], [24, 35], [72, 50], [81, 63], [89, 45], [99, 56], [83, 36]]),
  classifier: path("m42 69 36-58") + points([[29, 24], [43, 17], [46, 34]]) +
    box(75, 41, 9, 9, 1) + box(92, 31, 9, 9, 1) + box(91, 56, 9, 9, 1),
  sigmoid: axes + path("M25 55c46 0 24-34 75-34"),
  descent: axes + path("M27 17c22 36 41 39 74 39") + points([[27, 17], [39, 34], [52, 46], [70, 53], [94, 56]]),
  axes: axes + path("m24 57 75-39m-13-2 13 2-6 12") + points([[35, 44], [49, 47], [57, 29], [74, 34], [83, 21]]),
};

const escape = (text) => text.replace(/[&<>]/g, (part) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[part]);

function artwork(label, caption, accent, title, diagram) {
  if (diagram === "typography") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640">
      <defs>
        <linearGradient id="background" x2="1" y2="1">
          <stop stop-color="#342019"/>
          <stop offset="1" stop-color="#160f10"/>
        </linearGradient>
        <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M32 0H0V32" fill="none" stroke="${accent}" stroke-opacity=".12"/>
        </pattern>
      </defs>
      <rect width="640" height="640" fill="url(#background)"/>
      <rect width="640" height="640" fill="url(#grid)"/>
      <path d="M48 181H592M48 459H592" stroke="${accent}" stroke-opacity=".42"/>
      <text x="51" y="236" fill="${accent}" font-family="Consolas, monospace" font-size="27">${escape("$ claude")}</text>
      <text x="48" y="340" fill="#fff3e7" font-family="Arial, sans-serif" font-size="82" font-weight="bold" letter-spacing="-4">${escape(title)}</text>
      <text x="51" y="413" fill="${accent}" font-family="Malgun Gothic, Noto Sans CJK KR, sans-serif" font-size="45" font-weight="bold">${escape(caption)}</text>
      <rect x="559" y="397" width="32" height="6" fill="${accent}"/>
    </svg>`;
  }

  const motif = diagram === "code"
    ? `<g transform="translate(94 210)" color="${accent}">
        <rect width="452" height="112" rx="25" fill="currentColor" fill-opacity=".09" stroke="currentColor" stroke-opacity=".6" stroke-width="3"/>
        <text x="226" y="73" fill="currentColor" font-family="Consolas, monospace" font-size="48" font-weight="bold">${escape(caption)}</text>
      </g>`
    : `<g transform="translate(200 188) scale(2)" color="${accent}" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">${diagrams[diagram]}</g>`;
  const titleSize = Math.min(68, Math.floor(800 / title.length));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640" text-anchor="middle">
    <defs><radialGradient id="glow"><stop stop-color="${accent}" stop-opacity=".18"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient></defs>
    <circle cx="320" cy="280" r="298" fill="url(#glow)"/>
    ${motif}
    <text x="320" y="392" fill="#f7f8ff" font-family="Arial, sans-serif" font-size="${titleSize}" font-weight="bold">${escape(title)}</text>
    <text x="320" y="450" fill="${accent}" font-family="Arial, sans-serif" font-size="26" letter-spacing="4" font-weight="bold">${escape(label)}</text>
  </svg>`;
}

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data: posts, error } = await db.from("posts").select("slug,category,thumbnail").order("slug");
if (error) throw new Error(error.message);
const previous = JSON.parse(await readFile(manifest, "utf8").catch((error) => {
  if (error.code !== "ENOENT") throw error;
  return "{}";
}));
const targets = posts.filter(({ slug }) => Object.hasOwn(catalog, slug));
const texture = await sharp(await readFile(new URL("./post-cover-texture.webp", import.meta.url)))
  .resize(640, 640)
  .toBuffer();
const originals = {};
await mkdir(directory, { recursive: true });
for (const { slug, category, thumbnail } of targets) {
  const [title, caption, diagram] = catalog[slug];
  const [label, accent] = series[category?.split("/").at(-1)] ?? (slug === "draft-80" ? series.React : ["TECH", "#b8c6df"]);
  const image = artwork(label, caption, accent, title, diagram);
  const buffer = await sharp(texture).composite([{ input: Buffer.from(image) }]).webp({ quality: 84 }).toBuffer();
  await writeFile(new URL(`${slug}.webp`, directory), buffer);
  // Keep the original match when regenerating so later edits to a cover stay in effect.
  originals[slug] = Object.hasOwn(previous, slug) ? previous[slug] : thumbnail;
}
await writeFile(manifest, JSON.stringify(originals, null, 2) + "\n");
console.log(`Generated ${targets.length} post covers.`);
