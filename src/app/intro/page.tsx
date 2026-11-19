import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import Link from "next/link";
import { Suspense, type CSSProperties } from "react";
import { flattenCategories } from "@/lib/categories";
import { getAllPosts, getCategories } from "@/lib/posts";
import BgVideo from "./BgVideo";
import CountUp from "./CountUp";
import IntroHeader from "./IntroHeader";
import StageLock from "./StageLock";
import "./intro.css";

// 이 화면의 수치 · 글꼴 · 주소는 .claude/rules/intro-page.md 에 고정해 둔 값이다. 바꿀 때는 그 파일도 함께 고친다

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

// 헤드라인 글꼴(CDN)이 실패했을 때만 쓰는 대체 글꼴이라 미리 받지 않는다
const geistPixel = localFont({
  variable: "--font-geist-pixel",
  src: "../fonts/GeistPixel-Circle.woff2",
  weight: "400",
  display: "swap",
  preload: false,
});

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4";
const DISPLAY_FONT_CSS = "https://db.onlinewebfonts.com/c/8cb707a9b8a73f8a7403336b861c3074?family=BubbledotICG-FinePos";
const FONT_AWESOME_CSS = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css";
const FONT_AWESOME_SRI =
  "sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A==";

export const metadata: Metadata = {
  title: "Intelligence Designed To Evolve",
  description: "개발과 AI를 공부하며 이해한 것을 정리해 두는 테크 블로그, Eunhaa Tech 를 소개합니다",
};

export const viewport: Viewport = { themeColor: "#000000" };

/** 입장 애니메이션의 지연 시간 (.anim 이 --d 를 읽는다) */
const delay = (d: string) => ({ "--d": d }) as CSSProperties;

type Stat = { icon: string; label: string; suffix: string; target?: number; since?: string };

/** 값을 읽는 동안 보여 줄 자리. 기호와 라벨은 같고 숫자만 0 이다 */
const EMPTY_STATS: Stat[] = [
  { icon: "<", label: "다루는 주제", suffix: "개" },
  { icon: "%", label: "직접 만든 블로그", suffix: "%" },
  { icon: "*", label: "기록을 이어 온 날", suffix: "일" },
  { icon: "#", label: "작성한 글", suffix: "편" },
];

const STAT_DELAYS = ["0.5s", "0.58s", "0.66s", "0.74s"];

function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <footer className="intro-stats">
      {stats.map(({ icon, label, ...count }, i) => (
        <div key={icon} className="intro-stat intro-anim" style={delay(STAT_DELAYS[i])}>
          <span className="intro-stat-icon" aria-hidden>
            {icon}
          </span>
          <CountUp {...count} index={i} className="intro-stat-value" />
          <span className="intro-stat-label">{label}</span>
        </div>
      ))}
    </footer>
  );
}

/** 통계 값은 실제 글과 카테고리에서 센다 (캐시된 읽기 함수라 글이 바뀌면 함께 갱신된다) */
async function Stats() {
  const [posts, categories] = await Promise.all([getAllPosts(), getCategories()]);
  const firstDate = posts.map((p) => p.date).filter(Boolean).sort()[0];
  const [topics, handmade, days, written] = EMPTY_STATS;

  return (
    <StatGrid
      stats={[
        { ...topics, target: flattenCategories(categories).length },
        { ...handmade, target: 100 },
        { ...days, since: firstDate },
        { ...written, target: posts.length },
      ]}
    />
  );
}

export default function Intro() {
  return (
    <div className={`intro-root ${inter.variable} ${geistPixel.variable}`}>
      {/* 헤드라인 글꼴과 아이콘은 명세대로 CDN 에서 받는다. precedence 가 있으면 React 가 head 로 올린다 */}
      <link rel="stylesheet" href={DISPLAY_FONT_CSS} precedence="default" />
      <link
        rel="stylesheet"
        href={FONT_AWESOME_CSS}
        integrity={FONT_AWESOME_SRI}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        precedence="default"
      />

      <StageLock />

      <div className="intro-bg" aria-hidden>
        <BgVideo src={VIDEO_URL} className="intro-bg-video" />
      </div>

      <div className="intro-page">
        <IntroHeader />

        <main className="intro-hero">
          <div className="intro-trust intro-anim" style={delay("0.05s")}>
            {["fa-js", "fa-react", "fa-python"].map((icon) => (
              <span key={icon} className="intro-avatar">
                <span className="intro-avatar-inner">
                  <i className={`fa-brands ${icon}`} aria-hidden />
                </span>
              </span>
            ))}
            <span className="intro-trust-pill">FE · BE · AI 공부 기록</span>
          </div>

          <h1 className="intro-headline">
            <span>Intelligence</span>
            <span>Designed To Evolve</span>
          </h1>

          <p className="intro-subhead intro-anim" style={delay("0.28s")}>
            개발과 AI를 공부하며 이해한 것을 내 말로 정리하고, 다시 꺼내 쓸 수 있게 남깁니다.
          </p>

          {/* 입장 애니메이션은 감싼 요소에 건다 — 링크에 직접 걸면 끝난 값이 hover 의 transform 을 덮는다 */}
          <div className="intro-cta-wrap intro-anim intro-anim-pulse" style={delay("0.4s")}>
            <Link href="/" className="intro-cta">
              블로그 보러 가기
            </Link>
          </div>
        </main>

        <Suspense fallback={<StatGrid stats={EMPTY_STATS} />}>
          <Stats />
        </Suspense>
      </div>
    </div>
  );
}
