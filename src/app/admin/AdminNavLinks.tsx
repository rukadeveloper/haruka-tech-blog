"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  {
    href: "/admin",
    label: "글 관리",
    // 글 목록, 글 수정·미리보기 (새 글은 따로)
    active: (p: string) => p === "/admin" || (p.startsWith("/admin/posts/") && !p.startsWith("/admin/posts/new")),
  },
  { href: "/admin/posts/new", label: "새 글", active: (p: string) => p.startsWith("/admin/posts/new") },
  { href: "/admin/categories", label: "카테고리", active: (p: string) => p.startsWith("/admin/categories") },
];

/** 현재 위치에 맞는 메뉴를 강조하는 관리자 메뉴 */
export default function AdminNavLinks() {
  const pathname = usePathname();
  return (
    <>
      {LINKS.map(({ href, label, active }) => {
        const on = active(pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-current={on ? "page" : undefined}
            className={on ? "font-semibold text-strong" : "opacity-70 hover:opacity-100"}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}
