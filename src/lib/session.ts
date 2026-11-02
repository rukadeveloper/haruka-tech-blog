import crypto from "node:crypto";
import { cookies, headers } from "next/headers";
import { nowMs } from "./clock";

/** 방문자(깃허브 로그인) 세션. 관리자 세션(auth.ts)과는 별개의 쿠키를 쓴다. */
const COOKIE = "gh_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30일

export type SessionUser = {
  id: number;
  login: string;
  name: string;
  avatar: string;
};

const secret = () => process.env.SESSION_SECRET || process.env.ADMIN_SECRET || "";
const sign = (payload: string) =>
  crypto.createHmac("sha256", secret()).update(payload).digest("base64url");

const safeEqual = (a: string, b: string) => {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
};

type GithubApp = { id: string; secret: string };

/**
 * OAuth App 은 콜백 URL 을 하나만 등록할 수 있어 도메인마다 앱이 따로 필요하다.
 * GITHUB_OAUTH_APPS='{"www.haruka.life":{"id":"...","secret":"..."}}' 에 호스트별 키를 두고,
 * 없는 호스트는 GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET 을 쓴다.
 */
export function githubApp(host: string): GithubApp | null {
  try {
    const apps = JSON.parse(process.env.GITHUB_OAUTH_APPS || "{}");
    const app = apps[host];
    if (app?.id && app?.secret) return { id: app.id, secret: app.secret };
  } catch {
    /* 잘못된 JSON 은 기본 키로 대체 */
  }
  const { GITHUB_CLIENT_ID: id, GITHUB_CLIENT_SECRET: secret } = process.env;
  return id && secret ? { id, secret } : null;
}

/** host 를 생략하면 현재 요청의 호스트 기준. */
export async function isGithubConfigured(host?: string) {
  host ??= (await headers()).get("host") ?? "";
  return Boolean(githubApp(host) && secret());
}

export async function setUserSession(user: SessionUser) {
  const payload = Buffer.from(JSON.stringify({ ...user, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearUserSession() {
  (await cookies()).delete(COOKIE);
}

export async function getUser(): Promise<SessionUser | null> {
  if (!secret()) return null;
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return null;
  const [payload, sig] = value.split(".");
  if (!payload || !sig || !safeEqual(sig, sign(payload))) return null;
  try {
    const { exp, id, login, name, avatar } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof exp !== "number" || exp < nowMs()) return null;
    return { id, login, name, avatar };
  } catch {
    return null;
  }
}
