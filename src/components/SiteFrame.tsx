import { AUTHOR } from "@/lib/site";
import Header from "./Header";

/**
 * 블로그 화면의 틀: 헤더 + 본문 폭 + 푸터.
 * (site) 레이아웃과 404 화면이 함께 쓴다. 인트로(/intro)는 이 틀 없이 화면 전체를 쓴다.
 */
export default function SiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="container-page flex-1">{children}</main>
      <footer className="site-footer">
        <div className="container-page flex flex-col gap-4 py-8 sm:flex-row sm:items-end sm:justify-between sm:py-10">
          <div>
            <strong className="text-base font-extrabold tracking-tight">
              eunhaa<span className="text-strong"> tech</span>
            </strong>
            <p className="mt-1 text-sm text-muted">{AUTHOR.bio}</p>
          </div>
          <p className="text-caption">© Eunhaa. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
