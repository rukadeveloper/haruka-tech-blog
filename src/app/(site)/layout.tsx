import SiteFrame from "@/components/SiteFrame";

/** 블로그 화면 공통 틀 (헤더 · 본문 폭 · 푸터). (site) 는 라우트 그룹이라 주소에 나타나지 않는다 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteFrame>{children}</SiteFrame>;
}
