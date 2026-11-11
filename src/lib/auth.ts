import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminIpAllowed } from "./admin-ip";
import { getUser } from "./session";

/** 관리자로 허용할 GitHub 계정. 대소문자는 구분하지 않는다. */
const ADMIN_LOGIN = (process.env.ADMIN_GITHUB_LOGIN || "rukadeveloper").toLowerCase();

/** 현재 요청이 관리자 허용 IP 에서 왔는지 (ADMIN_ALLOWED_IPS) */
export async function isAdminIp() {
  return isAdminIpAllowed(await headers());
}

/** 허용 IP 에서 접속했고, GitHub 로그인 계정이 관리자 계정일 때만 true */
export async function isAdmin() {
  if (!(await isAdminIp())) return false;
  const user = await getUser();
  return Boolean(user) && user!.login.toLowerCase() === ADMIN_LOGIN;
}

/** 서버 컴포넌트 / 서버 액션에서 호출: 관리자가 아니면 로그인 화면으로 이동 */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
