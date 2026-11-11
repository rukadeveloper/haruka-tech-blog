import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getUser, isGithubConfigured } from "@/lib/session";
import Button from "@/components/ui/common/Button";
import Card from "@/components/ui/common/Card";
import GithubLoginLink from "@/components/ui/common/GithubLoginLink";
import { logout } from "../actions";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  const user = await getUser();

  return (
    <Card className="mx-auto mt-6 max-w-sm space-y-4 text-center sm:mt-10">
      <h1 className="text-title">관리자 로그인</h1>

      {user ? (
        <>
          <p className="text-body-sm text-muted">
            <b className="text-foreground">@{user.login}</b> 계정은 관리자 권한이 없습니다.
          </p>
          <form action={logout}>
            <Button block>로그아웃하고 다른 계정으로 로그인</Button>
          </form>
        </>
      ) : (await isGithubConfigured()) ? (
        <>
          <p className="text-body-sm text-muted">관리자 GitHub 계정으로 로그인하세요.</p>
          <GithubLoginLink returnTo="/admin">GitHub로 로그인</GithubLoginLink>
        </>
      ) : (
        <p className="rounded-xl bg-surface px-4 py-3 text-left text-sm text-muted">
          GitHub 로그인이 설정되지 않았습니다. <code>.env.local</code>에 GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET /
          SESSION_SECRET을 추가하세요.
        </p>
      )}
    </Card>
  );
}
