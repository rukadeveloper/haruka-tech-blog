/** 로딩 스피너 (이미지 로딩·업로드 표시용) */
export default function Spinner({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="불러오는 중"
      className={`inline-block animate-spin rounded-full border-[3px] border-line border-t-strong ${className}`}
    />
  );
}
