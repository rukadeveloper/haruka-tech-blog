import Link from "next/link";

/** 카테고리 선택 칩. 선택된 칩은 aria-current 로 표시한다 (DESIGN.md .chip) */
export default function Chip({
  href,
  active = false,
  count,
  children,
}: {
  href: string;
  active?: boolean;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="chip" aria-current={active ? "page" : undefined}>
      {children}
      {count !== undefined && <span className="chip-count">{count}</span>}
    </Link>
  );
}
