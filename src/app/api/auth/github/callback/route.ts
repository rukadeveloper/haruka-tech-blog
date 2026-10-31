import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isGithubConfigured, setUserSession } from "@/lib/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const jar = await cookies();
  const saved = jar.get("gh_oauth")?.value;
  jar.delete("gh_oauth");

  let returnTo = "/";
  let state = "";
  try {
    const parsed = JSON.parse(saved ?? "");
    state = parsed.state;
    if (typeof parsed.returnTo === "string" && parsed.returnTo.startsWith("/") && !parsed.returnTo.startsWith("//")) {
      returnTo = parsed.returnTo;
    }
  } catch {
    /* 쿠키 없음 */
  }
  const back = (flag?: string) => {
    const dest = new URL(returnTo, url.origin);
    if (flag) dest.searchParams.set("login", flag);
    return NextResponse.redirect(dest);
  };

  const code = url.searchParams.get("code");
  if (!isGithubConfigured() || !code || !state || url.searchParams.get("state") !== state) {
    return back("error");
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${url.origin}/api/auth/github/callback`,
      }),
    });
    const { access_token } = await tokenRes.json();
    if (!access_token) return back("error");

    const userRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${access_token}`, Accept: "application/vnd.github+json", "User-Agent": "eunhaa-tech-blog" },
    });
    if (!userRes.ok) return back("error");
    const u = await userRes.json();

    await setUserSession({
      id: u.id,
      login: u.login,
      name: u.name || u.login,
      avatar: u.avatar_url,
    });
    return back();
  } catch {
    return back("error");
  }
}
