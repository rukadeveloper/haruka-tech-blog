import crypto from "node:crypto";
import { cookies } from "next/headers";
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

export const isGithubConfigured = () =>
  Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && secret());

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
