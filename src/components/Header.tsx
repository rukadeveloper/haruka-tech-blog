import Link from "next/link";
import { Suspense } from "react";
import AdminLink from "./AdminLink";
import HeaderNav from "./HeaderNav";

export default function Header() {
  return (
    <header className="sticky top-0 z-50">
      {/* 반투명 바탕과 스크롤 구분선 (globals.css .site-header-bg) */}
      <div className="site-header-bg" aria-hidden />
      <div className="container-page relative flex h-14 items-center sm:justify-between">
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
