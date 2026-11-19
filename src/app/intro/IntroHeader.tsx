"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import logo from "@/app/icon.svg";

const LINKS = [
  { href: "/intro", label: "Home", current: true },
  { href: "/", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/guestbook", label: "방명록" },
];

const GITHUB_URL = "https://github.com/rukadeveloper";

/** 인트로 헤더: 로고 · 내비 필 · GitHub 필. 720px 이하에서는 버거 버튼과 흰 시트 메뉴로 바뀐다 */
export default function IntroHeader() {
  const [open, setOpen] = useState(false);

  // 열려 있는 동안: Esc 로 닫고, 창이 데스크톱 폭으로 넓어지면 닫는다
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const wide = window.matchMedia("(min-width: 721px)");
    const onWide = () => wide.matches && close();
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  const links = LINKS.map(({ href, label, current }) => (
    <Link key={href} href={href} aria-current={current ? "page" : undefined} onClick={() => setOpen(false)}>
      {label}
    </Link>
  ));

  return (
    <>
      <header className="intro-header">
        <Link href="/" className="intro-logo" aria-label="eunhaa tech 블로그 홈">
          <Image src={logo} alt="" width={52} height={52} priority />
        </Link>

        <nav className="intro-nav" aria-label="주 메뉴">
          {links}
        </nav>

        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="intro-sign-in">
          GitHub
        </a>

        <button
          type="button"
          className="intro-burger"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          aria-controls="intro-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {/* 헤더 밖에 둔다 — 헤더는 입장 애니메이션 때문에 fixed 자식을 자기 안에 가둔다. 딤(시트 바깥)을 누르면 닫힌다 */}
      <div className="intro-overlay" hidden={!open} onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
        <nav id="intro-menu" className="intro-sheet" aria-label="주 메뉴">
          {links}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="intro-sheet-sign-in"
            onClick={() => setOpen(false)}
          >
            GitHub
          </a>
        </nav>
      </div>
    </>
  );
}
