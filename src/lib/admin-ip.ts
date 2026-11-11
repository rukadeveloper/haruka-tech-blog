import { BlockList, isIP } from "node:net";

/**
 * 관리자 화면을 볼 수 있는 IP 허용 목록.
 *
 * ADMIN_ALLOWED_IPS="203.0.113.7, 198.51.100.0/24, 2001:db8::/32" 처럼 쉼표로 구분한다 (IPv4/IPv6, CIDR 가능).
 * - 개발 모드(next dev)에서는 localhost 를 항상 허용한다.
 * - 프로덕션에서 비어 있으면 아무도 들어올 수 없다 (실수로 열리는 것보다 잠기는 쪽이 안전).
 * 내 IP 는 `npm run admin:ip` 로 확인하거나, 차단됐을 때 서버 로그에 찍히는 값을 쓰면 된다.
 *
 * proxy.ts(화면 숨김)와 auth.ts(서버 액션 권한)가 함께 쓴다.
 */

const isDev = process.env.NODE_ENV === "development";
const LOOPBACK = new Set(["127.0.0.1", "::1"]);

/** "::ffff:1.2.3.4" (IPv4-mapped IPv6) -> "1.2.3.4", 대괄호·공백 제거 */
const normalize = (ip: string) =>
  ip
    .trim()
    .replace(/^\[|\]$/g, "")
    .replace(/^::ffff:(?=\d+\.\d+\.\d+\.\d+$)/i, "");

const family = (ip: string) => (isIP(ip) === 6 ? "ipv6" : "ipv4");

let cached: { raw: string; list: BlockList; empty: boolean } | undefined;

/** 환경 변수를 한 번만 해석한다. BlockList 는 이름과 달리 "주소 집합" 이라 허용 목록으로 쓴다 */
function allowList() {
  const raw = process.env.ADMIN_ALLOWED_IPS ?? "";
  if (cached?.raw === raw) return cached;

  const list = new BlockList();
  let count = 0;
  for (const entry of raw.split(",").map((s) => s.trim()).filter(Boolean)) {
    const [addr, prefix] = entry.split("/");
    const ip = normalize(addr);
    const bits = prefix === undefined ? null : Number(prefix);
    const maxBits = isIP(ip) === 6 ? 128 : 32;
    if (!isIP(ip) || (bits !== null && !(Number.isInteger(bits) && bits >= 0 && bits <= maxBits))) {
      console.warn(`[admin-ip] ADMIN_ALLOWED_IPS 의 "${entry}" 는 올바른 IP/CIDR 이 아니라 무시합니다.`);
      continue;
    }
    if (bits === null) list.addAddress(ip, family(ip));
    else list.addSubnet(ip, bits, family(ip));
    count++;
  }
  if (count === 0 && !isDev) {
    console.warn("[admin-ip] ADMIN_ALLOWED_IPS 가 비어 있어 관리자 화면이 모두 차단됩니다. 허용할 IP 를 등록하세요.");
  }
  return (cached = { raw, list, empty: count === 0 });
}

/**
 * 요청 헤더에서 접속 IP 를 꺼낸다. 없으면 "".
 * Vercel 은 x-forwarded-for 를 실제 접속 IP 로 덮어쓰므로 위조할 수 없다.
 * 다른 곳에 직접 올릴 때는 앞단 프록시가 이 헤더를 덮어쓰는지 확인해야 한다.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0] ?? headers.get("x-real-ip") ?? "";
  const ip = normalize(forwarded);
  return isIP(ip) ? ip : "";
}

const reported = new Set<string>();

/** 관리자 화면 접근이 허용된 요청인지. 차단된 IP 는 한 번씩만 로그에 남긴다 */
export function isAdminIpAllowed(headers: Headers): boolean {
  const ip = clientIp(headers);
  if (isDev && (ip === "" || LOOPBACK.has(ip))) return true;

  const { list } = allowList();
  if (ip && list.check(ip, family(ip))) return true;

  const key = ip || "(알 수 없음)";
  if (!reported.has(key)) {
    reported.add(key);
    console.warn(`[admin-ip] 차단된 IP ${key} — 허용하려면 ADMIN_ALLOWED_IPS 에 추가하세요.`);
  }
  return false;
}
