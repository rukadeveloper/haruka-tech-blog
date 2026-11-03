import { createHighlighter } from "shiki";
import type { Options } from "rehype-pretty-code";
import { LANG_ALIAS } from "./code-languages";

/** rehype-pretty-code 공통 옵션: 배경은 CSS(.post-body figure)가 그리고, 토큰 색만 테마를 쓴다 */
export const prettyCodeOptions: Options = {
  theme: "one-dark-pro",
  keepBackground: false,
  // 언어 없는 코드 블록도 같은 창 디자인으로 감싼다
  defaultLang: { block: "plaintext" },
  getHighlighter: (opts) => createHighlighter({ ...opts, langAlias: LANG_ALIAS }),
};
