import { Suspense } from "react";
import { isAdmin } from "@/lib/auth";
import { logout } from "./actions";
import Link from "next/link";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

async function AdminNav() {
  if (!(await isAdmin())) return null;
  return (
    <nav className="mb-8 flex items-center gap-4 border-b border-black/10 pb-3 text-sm dark:border-white/10">
      <Link href="/admin" className="font-semibold">글 관리</Link>
      <Link href="/admin/posts/new">새 글</Link>
      <Link href="/admin/categories">카테고리</Link>
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
