import {
  siHtml5,
  siJavascript,
  siNextdotjs,
  siNodedotjs,
  siOpenjdk,
  siPython,
  siReact,
  siTypescript,
} from "simple-icons";

// 값은 .claude/rules/intro-page.md 의 "언어" 표와 같다. 바꾸면 그 표도 함께 고친다

export type Language = {
  /** 히어로 제목 (대문자) */
  name: string;
  /** simple-icons 의 24×24 SVG path */
  path: string;
  /** 로고 몸체 색 */
  body: string;
  /** 원판 고리 · 빛 번짐 · 바닥 빛줄 색 */
  accent: string;
};

export const LANGUAGES: Language[] = [
  { name: "JAVASCRIPT", path: siJavascript.path, body: "#F7DF1E", accent: "#E8C400" },
  { name: "TYPESCRIPT", path: siTypescript.path, body: "#3178C6", accent: "#2A6BB0" },
  { name: "REACT", path: siReact.path, body: "#61DAFB", accent: "#3FB8D9" },
  { name: "NEXT.JS", path: siNextdotjs.path, body: "#1A1A1A", accent: "#4A1E17" },
  { name: "NODE.JS", path: siNodedotjs.path, body: "#5FA04E", accent: "#4C8A3D" },
  { name: "PYTHON", path: siPython.path, body: "#3776AB", accent: "#FFD43B" },
  { name: "JAVA", path: siOpenjdk.path, body: "#E76F00", accent: "#5382A1" },
  { name: "HTML · CSS", path: siHtml5.path, body: "#E34F26", accent: "#D2421C" },
];

/** 캐러셀 칸 수. 칸 i 는 언어 i % 8 이라 언어마다 두 번씩 나온다 */
export const SLOTS = 16;

/** 칸별 히어로 기울기 (rad) */
export const TILTS = [0.1, -0.15, 0.07, -0.09, 0.14, -0.06, 0.12, -0.13, 0.08, -0.11, 0.15, -0.07, 0.09, -0.14, 0.06, -0.1];

/** 칸 번호(음수 · 16 이상 포함)를 언어 번호로 */
export const languageOf = (slot: number) => (((Math.round(slot) % SLOTS) + SLOTS) % SLOTS) % LANGUAGES.length;
