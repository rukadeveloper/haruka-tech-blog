import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { siJavascript, siNextdotjs, siNodedotjs, siPython, siReact, siTypescript } from "simple-icons";
import DotHands from "./DotHands";
import StageLock from "./StageLock";
import BrandMark from "@/components/ui/common/BrandMark";
import "./intro.css";

// 이 화면의 수치 · 글꼴 · 문구는 docs/intro 에 고정해 둔 값이다. 바꿀 때는 그 파일도 함께 고친다

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

export const metadata: Metadata = {
  // 루트 레이아웃의 "%s | Eunhaa Tech Developer Blog" 틀을 쓰지 않고 이 제목 그대로 보인다
  title: { absolute: "은하 테크 블로그 | Intro" },
  description: "배운 것을 내 말로 정리하고, 다시 꺼내 쓸 수 있게 남겨 두는 개발 기록장 eunhaa tech 를 소개합니다",
};

export const viewport: Viewport = { themeColor: "#f7f7f5" };

const LINKS = [
  { href: "/", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/guestbook", label: "방명록" },
];

const GITHUB_URL = "https://github.com/rukadeveloper";

/** 블로그가 다루는 기술 (simple-icons 의 24×24 path) */
const STACK = [
  { name: "JavaScript", path: siJavascript.path },
  { name: "TypeScript", path: siTypescript.path },
  { name: "React", path: siReact.path },
  { name: "Next.js", path: siNextdotjs.path },
  { name: "Node.js", path: siNodedotjs.path },
  { name: "Python", path: siPython.path },
];

// 브랜드 마크(점 H, 단색)는 블로그 헤더와 같은 components/ui/common/BrandMark — 이 화면은 무지개 밑빛 말고 색을 쓰지 않으므로 currentColor(검정)로 그려진다

export default function Intro() {
  return (
    <div className={`intro-root ${inter.variable}`}>
      <StageLock />

      <section className="intro-hero">
        <DotHands />

        <nav className="intro-nav" aria-label="주 메뉴">
          {/* 홈으로 가는 링크는 next/link — 문서를 새로 받으면 프록시가 다시 인트로로 보낸다 */}
          <Link href="/" className="intro-brand">
            <BrandMark />
            eunhaa tech
          </Link>
          {LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="intro-link">
              {label}
            </Link>
          ))}
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="intro-pill">
            GitHub
          </a>
        </nav>

        <div className="intro-copy">
          <h1>
            <span>Learning by</span>
            Writing Code.
          </h1>
          <p>배운 것을 내 말로 정리하고, 다시 꺼내 쓸 수 있게 남겨 두는 개발 기록장입니다.</p>
          <div className="intro-cta">
            <Link href="/">블로그 보러 가기</Link>
          </div>
        </div>

        <ul className="intro-logos" aria-label="다루는 기술">
          {STACK.map(({ name, path }) => (
            <li key={name}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d={path} />
              </svg>
              {name}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
