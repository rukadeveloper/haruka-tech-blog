// 날짜 표시 형식. 서버 전용 모듈을 쓰지 않아 클라이언트에서도 가져올 수 있다.

const dateTime = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** ISO 시각 -> "2026.11.05 14:30" (한국 시간) */
export const formatDateTime = (iso: string) =>
  dateTime.format(new Date(iso)).replace(/\.\s*/g, ".").replace(/\.(\d{2}:)/, " $1");
