// 지금 접속 중인 공인 IP 를 알려 준다 — 관리자 허용 목록(ADMIN_ALLOWED_IPS)에 넣을 값.
// 사용: npm run admin:ip
const lookup = async (url) => {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    return res.ok ? (await res.text()).trim() : null;
  } catch {
    return null;
  }
};

const [v4, any] = await Promise.all([lookup("https://api.ipify.org"), lookup("https://api64.ipify.org")]);
const ips = [...new Set([v4, any].filter(Boolean))];

if (ips.length === 0) {
  console.error("공인 IP 를 확인하지 못했습니다. 네트워크 연결을 확인하세요.");
  process.exit(1);
}

console.log(`현재 공인 IP: ${ips.join(", ")}\n`);
console.log(".env.local (로컬에서 next start 로 확인할 때) 와 Vercel 환경 변수에 아래 값을 넣으세요.");
console.log("이미 등록한 IP 가 있으면 쉼표로 이어 붙입니다. 대역은 203.0.113.0/24 처럼 CIDR 로 쓸 수 있습니다.\n");
console.log(`ADMIN_ALLOWED_IPS=${ips.join(",")}`);
console.log("\n개발 서버(npm run dev)에서는 localhost 가 자동으로 허용되므로 설정하지 않아도 됩니다.");
