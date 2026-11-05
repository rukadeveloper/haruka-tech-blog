import { Suspense } from "react";
import { isAdmin } from "@/lib/auth";
import { logout } from "./actions";
import AdminNavLinks from "./AdminNavLinks";

// 관리자 화면은 로그인 확인 때문에 요청마다 렌더링한다. 즉시 이동(instant) 검증 대상에서 제외
export const instant = false;

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

async function AdminNav() {
  if (!(await isAdmin())) return null;
  return (
    <nav className="mb-8 flex items-center gap-5 border-b border-line pb-3 text-sm">
      <AdminNavLinks />
      <form action={logout} className="ml-auto">
        <button className="opacity-70 hover:underline">로그아웃</button>
      </form>
    </nav>
  );
}

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="py-10">
      <Suspense fallback={null}>
        <AdminNav />
      </Suspense>
      <Suspense fallback={<p className="opacity-60">불러오는 중…</p>}>{children}</Suspense>
    </div>
  );
}
