import Link from "next/link";
import { isAdminIp } from "@/lib/auth";

/** 허용 IP 에서 접속했을 때만 그려지는 관리자 링크. 요청 헤더를 읽으므로 Suspense 안에서 쓴다 */
export default async function AdminLink({ className }: { className?: string }) {
  if (!(await isAdminIp())) return null;
  return (
    <Link href="/admin" className={className}>
      Admin
    </Link>
  );
}
