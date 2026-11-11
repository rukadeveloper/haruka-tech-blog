import type { HTMLAttributes } from "react";

/** 테두리 있는 둥근 상자 (DESIGN.md .card). pad=false 면 안쪽 여백 없이 목록 등을 꽉 채운다 */
export default function Card({
  as: Tag = "div",
  pad = true,
  className = "",
  ...props
}: { as?: "div" | "section" | "li" | "form"; pad?: boolean } & HTMLAttributes<HTMLElement>) {
  const Component = Tag as "div";
  return <Component {...props} className={`card ${pad ? "card-pad" : ""} ${className}`} />;
}
