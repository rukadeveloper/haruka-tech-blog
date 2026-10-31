import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import Header from "@/components/Header";
import "./globals.css";

// tech.kakao.com 과 동일한 Kakao Big Sans
const kakaoBig = localFont({
  variable: "--font-kakao",
  display: "swap",
  src: [
    { path: "./fonts/KakaoBig-Regular.woff2", weight: "400" },
    { path: "./fonts/KakaoBig-Bold.woff2", weight: "700" },
    { path: "./fonts/KakaoBig-ExtraBold.woff2", weight: "800" },
  ],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Eunhaa Tech Developer Blog", template: "%s | Eunhaa Tech Developer Blog" },
  description: "공부하는 개발자의 테크 블로그",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${kakaoBig.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-5">{children}</main>
        <footer className="mt-auto bg-footer">
          <div className="mx-auto max-w-6xl px-5 py-12">
            <strong className="text-lg">eunhaa tech</strong>
            <p className="mt-2 text-sm text-muted">공부하는 개발자의 테크 블로그</p>
            <p className="mt-6 text-xs text-meta">© Eunhaa. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
