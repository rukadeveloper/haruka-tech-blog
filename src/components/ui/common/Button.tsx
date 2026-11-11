import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "danger-solid" | "github";

type Style = { variant?: ButtonVariant; size?: "md" | "sm"; block?: boolean; className?: string };

/** DESIGN.md 의 .btn 클래스 조합. Link 나 a 태그처럼 button 이 아닌 곳에서도 같은 모양을 쓰도록 따로 내보낸다 */
export const buttonClass = ({ variant = "secondary", size = "md", block = false, className = "" }: Style = {}) =>
  ["btn", `btn-${variant}`, size === "sm" && "btn-sm", block && "btn-block", className].filter(Boolean).join(" ");

export default function Button({
  variant,
  size,
  block,
  className,
  ...props
}: Style & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={buttonClass({ variant, size, block, className })} />;
}
