import Link from "next/link";

export default function Pagination({
  base,
  page,
  total,
}: {
  base: string;
  page: number;
  total: number;
}) {
  if (total <= 1) return null;
  const href = (n: number) => (n === 1 ? base : `${base}?page=${n}`);
  const box =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-md px-2 text-base text-meta hover:text-foreground sm:h-12 sm:min-w-12";
  return (
    <nav aria-label="페이지" className="mt-20 flex flex-wrap justify-center gap-2">
      {page > 1 && (
        <Link href={href(page - 1)} className={`${box} bg-surface`} aria-label="이전">
          ‹
        </Link>
      )}
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={href(n)}
          aria-current={n === page ? "page" : undefined}
          className={`${box} ${n === page ? "pointer-events-none bg-surface text-foreground" : ""}`}
        >
          {n}
        </Link>
      ))}
      {page < total && (
        <Link href={href(page + 1)} className={`${box} bg-surface`} aria-label="다음">
          ›
        </Link>
      )}
    </nav>
  );
}
