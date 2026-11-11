import type { SessionUser } from "@/lib/session";

/** 로그인한 GitHub 계정 표시 + 로그아웃. children 은 로그아웃 폼에 함께 보낼 hidden 입력 */
export default function UserBar({
  user,
  logout,
  children,
}: {
  user: SessionUser;
  logout: (formData: FormData) => void | Promise<void>;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={user.avatar} alt="" width={24} height={24} className="rounded-full" />
      <span className="min-w-0 truncate">
        <b className="text-foreground">{user.name}</b> @{user.login}
      </span>
      <form action={logout} className="ml-auto shrink-0">
        {children}
        <button className="font-medium hover:text-foreground">로그아웃</button>
      </form>
    </div>
  );
}
