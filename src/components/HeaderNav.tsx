"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import ThemeToggle from "@/components/ui/common/ThemeToggle";

const LINKS = [
  { href: "/", label: "Blog", active: (p: string) => p === "/" || p.startsWith("/posts") || p.startsWith("/category") },
  { href: "/about", label: "About", active: (p: string) => p.startsWith("/about") },
  { href: "/guestbook", label: "방명록", active: (p: string) => p.startsWith("/guestbook") },
];

type Props = {
  /** 허용 IP 에서만 내용이 그려지는 관리자 링크 (components/AdminLink) — 가로 메뉴용 / 모바일 메뉴용 */
  adminLink: React.ReactNode;
  adminLinkMobile: React.ReactNode;
  pathname: string;
};

function Nav({ adminLink, adminLinkMobile, pathname }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const links = (className: string) =>
    LINKS.map(({ href, label, active }) => (
      <Link
        key={href}
        href={href}
        aria-current={active(pathname) ? "page" : undefined}
        onClick={() => setOpen(false)}
        className={className}
      >
        {label}
      </Link>
    ));

  return (
    <>
      {/* sm 이상: 가로 메뉴 */}
      <nav aria-label="주 메뉴" className="hidden items-center gap-6 text-[15px] sm:flex">
        {links("nav-link")}
        {adminLink}
      </nav>
      <div className="ml-auto flex items-center sm:ml-3">
        <ThemeToggle />
        <button
          type="button"
          className="icon-btn sm:hidden"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            {/* 두 아이콘을 겹쳐 두고 교차 페이드한다 */}
            <path d="M4 7h16M4 12h16M4 17h16" className={`transition-opacity duration-(--dur) ${open ? "opacity-0" : ""}`} />
            <path d="M6 6l12 12M18 6L6 18" className={`transition-opacity duration-(--dur) ${open ? "" : "opacity-0"}`} />
          </svg>
        </button>
      </div>

      {/* 모바일: 헤더 아래로 펼쳐지는 메뉴. 닫힐 때도 같은 길로 올라가도록 항상 그려 두고 data-open 으로 여닫는다 */}
      <div className="menu-scrim sm:hidden" data-open={open ? "true" : undefined} onClick={() => setOpen(false)} aria-hidden />
      <nav
        id="mobile-menu"
        aria-label="주 메뉴"
        data-open={open ? "true" : undefined}
        inert={!open}
        onClick={() => setOpen(false)}
        className="mobile-menu glass-thick sm:hidden"
      >
        {links("nav-link flex h-12 items-center rounded-xl px-3 text-base hover:bg-surface")}
        {adminLinkMobile}
      </nav>
    </>
  );
}

function NavWithPathname(props: Omit<Props, "pathname">) {
  return <Nav {...props} pathname={usePathname()} />;
}

/** 헤더 메뉴. 현재 경로는 요청 시점에 정해지므로 Suspense 로 감싸고, 그 전에는 강조 없이 그린다 */
export default function HeaderNav(props: Omit<Props, "pathname">) {
  return (
    <Suspense fallback={<Nav {...props} pathname="" />}>
      <NavWithPathname {...props} />
    </Suspense>
  );
}
