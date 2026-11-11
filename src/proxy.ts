import { NextResponse, type NextRequest } from "next/server";
import { isAdminIpAllowed } from "@/lib/admin-ip";

/**
 * 관리자 화면은 등록한 IP 에서만 보인다. 그 밖의 IP 에는 없는 주소로 넘겨 404 를 보여 준다
 * (로그인 화면조차 드러내지 않는다). 설정법은 lib/admin-ip.ts.
 *
 * 서버 액션은 화면과 같은 경로로 POST 되므로 여기서 함께 걸러지지만,
 * 권한의 기준은 각 액션의 requireAdmin() 이다 (그쪽도 IP 를 다시 확인한다).
 */
export function proxy(request: NextRequest) {
  if (isAdminIpAllowed(request.headers)) return NextResponse.next();
  return NextResponse.rewrite(new URL("/_blocked", request.url), { status: 404 });
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
