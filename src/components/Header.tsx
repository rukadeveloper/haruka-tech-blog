import Link from "next/link";
import { Suspense } from "react";
import AdminLink from "./AdminLink";
import HeaderNav from "./HeaderNav";

export default function Header() {
  return (
    // 화면 위에 띄운 둥근 유리 바 (globals.css .site-header)
    <header className="site-header">
      <div className="site-header-bar sm:justify-between">
        <div className="site-header-bg" aria-hidden />
        <Link href="/" className="text-lg font-extrabold tracking-tight sm:mr-auto">
          eunhaa<span className="text-strong"> tech</span>
        </Link>
        <HeaderNav
          adminLink={
            <Suspense fallback={null}>
              <AdminLink className="nav-link" />
            </Suspense>
          }
          adminLinkMobile={
            <Suspense fallback={null}>
              <AdminLink className="nav-link flex h-12 items-center rounded-xl px-3 text-base hover:bg-surface" />
            </Suspense>
          }
        />
      </div>
    </header>
  );
}
