import Link from "next/link";
import SiteFrame from "@/components/SiteFrame";
import { buttonClass } from "@/components/ui/common/Button";

export const metadata = { title: "페이지를 찾을 수 없습니다" };

/**
 * 없는 주소와 notFound() 를 함께 받는 404 화면.
 * 루트 레이아웃 바로 아래에 그려져 (site) 레이아웃을 거치지 않으므로 헤더와 푸터를 직접 감싼다.
 */
export default function NotFound() {
  return (
    <SiteFrame>
      <section className="py-20 text-center sm:py-28">
        <p className="text-caption">404</p>
        <h1 className="text-display mt-2">페이지를 찾을 수 없습니다</h1>
        <p className="text-body mt-3 text-muted">주소가 바뀌었거나 지워진 글일 수 있습니다.</p>
        <Link href="/" className={buttonClass({ variant: "primary", className: "mt-8" })}>
          블로그 홈으로
        </Link>
      </section>
    </SiteFrame>
  );
}
