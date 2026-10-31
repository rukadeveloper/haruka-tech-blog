import { isAdmin } from "@/lib/auth";
import { getUser, isGithubConfigured } from "@/lib/session";
import { redirect } from "next/navigation";
import { logout } from "../actions";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  const user = await getUser();

  return (
    <div className="mx-auto max-w-sm space-y-4 py-10 text-center">
      <h1 className="text-2xl font-bold">관리자 로그인</h1>

      {user ? (
        <>
          <p className="text-sm text-muted">
            <b className="text-foreground">@{user.login}</b> 계정은 관리자 권한이 없습니다.
          </p>
          <form action={logout}>
            <button className="w-full rounded-md border border-line px-4 py-3 text-[15px] font-medium hover:bg-surface">
              로그아웃하고 다른 계정으로 로그인
            </button>
          </form>
        </>
      ) : isGithubConfigured() ? (
        <a
          href={`/api/auth/github/login?returnTo=${encodeURIComponent("/admin")}`}
          className="flex items-center justify-center gap-2 rounded-md bg-[#24292f] px-4 py-3 text-[15px] font-medium text-white hover:bg-black"
        >
          <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          GitHub로 로그인
        </a>
      ) : (
        <p className="rounded-md bg-surface px-4 py-3 text-sm text-muted">
          GitHub 로그인이 설정되지 않았습니다. <code>.env.local</code>에 GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET /
          SESSION_SECRET을 추가하세요.
        </p>
      )}
    </div>
  );
}
