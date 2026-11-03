// 코드 블록 언어 목록. 에디터(클라이언트)와 하이라이터(서버)가 함께 쓰므로 shiki 등은 가져오지 않는다.
// 언어 라벨·색은 globals.css 의 "코드 블록 언어 라벨" 규칙과 짝이다 — 언어를 추가하면 거기도 추가할 것.

export type CodeLanguage = { value: string; label: string };

/** 에디터 선택 목록. value 는 <code class="language-값"> 으로 저장된다 */
export const CODE_LANGUAGES: CodeLanguage[] = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "react", label: "React" },
  { value: "nextjs", label: "Next.js" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Bash" },
  { value: "python", label: "Python" },
  { value: "sql", label: "SQL" },
  { value: "plaintext", label: "일반 텍스트" },
];

/**
 * shiki 가 모르는 이름 → 실제 문법. React·Next.js 는 JSX/TSX 문법으로 칠한다.
 * data-language 는 원래 이름(react, nextjs)이 그대로 남아 라벨에 쓰인다.
 */
export const LANG_ALIAS: Record<string, string> = {
  react: "tsx",
  nextjs: "tsx",
};
