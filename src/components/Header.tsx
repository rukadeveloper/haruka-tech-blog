import Link from "next/link";
import { Suspense } from "react";
import BrandMark from "@/components/ui/common/BrandMark";
import AdminLink from "./AdminLink";
import HeaderNav from "./HeaderNav";

export default function Header() {
  return (
    // 화면 위에 띄운 둥근 유리 바 (globals.css .site-header)
    <header className="site-header">
      <div className="site-header-bar sm:justify-between">
        <div className="site-header-bg" aria-hidden />
        {/* 인트로 내비와 같은 로고: 점 H 단색 마크(22px) + eunhaa tech (600 · 15px · 자간 -0.01em · 간격 8px). 색은 글자색을 따라 다크 모드에서도 보인다 */}
        <Link href="/" aria-label="eunhaa tech 홈" className="pressable inline-flex shrink-0 items-center gap-2 text-[15px] font-semibold tracking-[-0.01em] text-foreground sm:mr-auto">
          <BrandMark />
          eunhaa tech
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
