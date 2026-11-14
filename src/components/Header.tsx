import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import logo from "@/app/icon.svg";
import AdminLink from "./AdminLink";
import HeaderNav from "./HeaderNav";

export default function Header() {
  return (
    // 화면 위에 띄운 둥근 유리 바 (globals.css .site-header)
    <header className="site-header">
      <div className="site-header-bar sm:justify-between">
        <div className="site-header-bg" aria-hidden />
        {/* 글자 대신 로고(파비콘과 같은 그림)만 보이므로 이름은 alt 로 알려 준다 */}
        <Link href="/" className="shrink-0 sm:mr-auto">
          <Image src={logo} alt="eunhaa tech 홈" width={32} height={32} priority />
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
