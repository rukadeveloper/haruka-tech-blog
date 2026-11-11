import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import Header from "@/components/Header";
import "./globals.css";

// Pretendard 가변 글꼴 (45–920) — 굵기를 하나의 파일로 모두 쓴다
const pretendard = localFont({
  variable: "--font-pretendard",
  display: "swap",
  src: "./fonts/PretendardVariable.woff2",
  weight: "45 920",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Eunhaa Tech Developer Blog", template: "%s | Eunhaa Tech Developer Blog" },
  description: "공부하는 개발자의 테크 블로그",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#17171c" },
  ],
};

/**
 * 첫 페인트 전에 테마를 정한다 (저장된 선택 → 없으면 시스템 설정).
 * 하이드레이션을 기다리면 다크 모드 사용자에게 흰 화면이 번쩍이므로 head 에서 바로 실행한다.
 * 저장 키는 ThemeToggle 의 THEME_KEY 와 같다.
 */
const themeScript = `(function(){var t;try{t=localStorage.getItem("theme")}catch(e){}if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme 은 위 스크립트가 붙이므로 서버 HTML 과 다를 수 있다
    <html lang="ko" suppressHydrationWarning className={`${pretendard.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="container-page flex-1">{children}</main>
        <footer className="mt-auto border-t border-line bg-footer">
          <div className="container-page flex flex-col gap-4 py-8 sm:flex-row sm:items-end sm:justify-between sm:py-10">
            <div>
              <strong className="text-base font-extrabold tracking-tight">
                eunhaa<span className="text-strong"> tech</span>
              </strong>
              <p className="mt-1 text-sm text-muted">공부하는 개발자의 테크 블로그</p>
            </div>
            <p className="text-caption">© Eunhaa. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
