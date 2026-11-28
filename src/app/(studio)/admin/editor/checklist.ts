import type { Node as PMNode } from "@tiptap/pm/model";

export type CheckStatus = "pass" | "warn" | "fail";
export type CheckId = "title" | "tags" | "thumbnail" | "code";
export type Check = { id: CheckId; label: string; status: CheckStatus; detail: string };

/** 쉼표로 이은 태그 문자열을 목록으로 */
export const splitTags = (tags: string) =>
  tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

/** 언어가 없거나 plain text 인 코드 블록 수 / 전체 코드 블록 수 */
export function codeLanguageGaps(doc: PMNode | null | undefined) {
  let total = 0;
  let missing = 0;
  doc?.descendants((node) => {
    if (node.type.name === "codeBlock") {
      total++;
      const lang = String(node.attrs.language ?? "").trim();
      if (!lang || lang === "plaintext") missing++;
      return false;
    }
    return true;
  });
  return { total, missing };
}

/**
 * 발행 전 체크 (docs/editor "발행 전 체크"):
 * 제목 길이 · 태그 3개 이상 · 썸네일 · 코드 블록 언어. 상태는 통과 / 주의 / 필요.
 */
export function prepublishChecks({
  title,
  tags,
  thumbnail,
  doc,
}: {
  title: string;
  tags: string;
  thumbnail: string;
  doc: PMNode | null | undefined;
}): Check[] {
  const len = [...title.trim()].length;
  const titleStatus: CheckStatus = len >= 10 && len <= 60 ? "pass" : len === 0 || len > 80 ? "fail" : "warn";
  const titleDetail =
    len === 0 ? "제목이 비어 있어요" : len < 10 ? `${len}자 — 10자 이상 권장` : len > 60 ? `${len}자 — 60자 이하 권장` : `${len}자`;

  const tagCount = splitTags(tags).length;
  const tagStatus: CheckStatus = tagCount >= 3 ? "pass" : tagCount === 0 ? "fail" : "warn";
  const tagDetail = tagCount >= 3 ? `${tagCount}개` : tagCount === 0 ? "태그가 없어요" : `${tagCount}개 — ${3 - tagCount}개 더`;

  const hasThumb = thumbnail.trim() !== "";

  const { total, missing } = codeLanguageGaps(doc);
  const codeStatus: CheckStatus = missing === 0 ? "pass" : "warn";
  const codeDetail = total === 0 ? "코드 블록 없음" : missing === 0 ? `${total}개 모두 지정` : `언어 없는 코드 ${missing}개`;

  return [
    { id: "title", label: "제목 길이", status: titleStatus, detail: titleDetail },
    { id: "tags", label: "태그 3개 이상", status: tagStatus, detail: tagDetail },
    { id: "thumbnail", label: "썸네일", status: hasThumb ? "pass" : "fail", detail: hasThumb ? "커버 이미지 있음" : "커버 이미지가 없어요" },
    { id: "code", label: "코드 블록 언어", status: codeStatus, detail: codeDetail },
  ];
}
