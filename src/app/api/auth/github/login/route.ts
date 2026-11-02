import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { githubApp, isGithubConfigured } from "@/lib/session";

/** 열린 리다이렉트 방지: 사이트 내부 경로만 허용 */
const safePath = (p: string | null) => (p && p.startsWith("/") && !p.startsWith("//") ? p : "/");

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = safePath(url.searchParams.get("returnTo"));
  const app = githubApp(url.host);
  if (!app || !(await isGithubConfigured(url.host))) return NextResponse.redirect(new URL(returnTo, url.origin));

  const state = crypto.randomBytes(16).toString("hex");
  (await cookies()).set("gh_oauth", JSON.stringify({ state, returnTo }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });

  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", app.id);
  authorize.searchParams.set("redirect_uri", `${url.origin}/api/auth/github/callback`);
  authorize.searchParams.set("scope", "read:user");
  authorize.searchParams.set("state", state);
  return NextResponse.redirect(authorize);
}
