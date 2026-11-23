import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Manrope } from "next/font/google";
import IntroNav from "./IntroNav";
import IntroStage from "./IntroStage";
import StageLock from "./StageLock";
import "./intro.css";

// 이 화면의 수치 · 글꼴 · 3D 값은 .claude/rules/intro-page.md 에 고정해 둔 값이다. 바꿀 때는 그 파일도 함께 고친다

const barlow = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["800", "900"],
  style: ["italic"],
  display: "block",
});

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "eunhaa tech — 공부한 언어들",
  description: "JavaScript, TypeScript, React, Next.js, Node.js, Python, Java, HTML · CSS 를 공부하며 정리하는 테크 블로그, eunhaa tech 를 소개합니다",
};

export const viewport: Viewport = { themeColor: "#F5B39A", viewportFit: "cover" };

export default function Intro() {
  return (
    <div className={`intro-root ${barlow.variable} ${manrope.variable}`}>
      <StageLock />
      <IntroNav />
      <IntroStage />
    </div>
  );
}
