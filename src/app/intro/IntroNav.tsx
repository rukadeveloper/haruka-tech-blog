"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/intro", label: "Home", current: true },
  { href: "/", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/guestbook", label: "방명록" },
];

const GITHUB_URL = "https://github.com/rukadeveloper";

/** 인트로 헤더: 가운데 워드마크, 오른쪽 MENU · BLOG 알약. MENU 는 cream 시트 메뉴를 연다 */
export default function IntroNav() {
  const [open, setOpen] = useState(false);

  // 열려 있는 동안 Esc 로 닫는다
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className="intro-nav">
        {/* 홈으로 가는 링크는 next/link — 문서를 새로 받으면 프록시가 다시 인트로로 보낸다 */}
        <Link href="/" className="intro-logo" aria-label="eunhaa tech 블로그 홈">
          EUNHAA<sup>TECH</sup>
        </Link>

        <div className="intro-nav-right">
          <button
            type="button"
            className="intro-menu-btn"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={open}
            aria-controls="intro-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="intro-menu-dots" aria-hidden>
              <i />
              <i />
              <i />
              <i />
            </span>
            <span className="intro-menu-word">MENU</span>
          </button>
          <Link href="/" className="intro-pill">
            BLOG
          </Link>
        </div>
      </header>

      {/* 딤(시트 바깥)을 누르면 닫힌다 */}
      <div className="intro-overlay" hidden={!open} onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
        <nav id="intro-menu" className="intro-sheet" aria-label="주 메뉴">
          {LINKS.map(({ href, label, current }) => (
            <Link key={href} href={href} aria-current={current ? "page" : undefined} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            GitHub
          </a>
        </nav>
      </div>
    </>
  );
}
