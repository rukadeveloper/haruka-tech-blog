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
    "inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-2 text-[15px] font-medium text-muted transition-colors hover:bg-surface hover:text-foreground";
  return (
    <nav aria-label="페이지" className="mt-14 flex flex-wrap justify-center gap-1 sm:mt-20 sm:gap-2">
      {page > 1 && (
        <Link href={href(page - 1)} className={box} aria-label="이전 페이지">
          ‹
        </Link>
      )}
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={href(n)}
          aria-current={n === page ? "page" : undefined}
          className={n === page ? `${box} pointer-events-none !bg-foreground !text-background` : box}
        >
          {n}
        </Link>
      ))}
      {page < total && (
        <Link href={href(page + 1)} className={box} aria-label="다음 페이지">
          ›
        </Link>
      )}
    </nav>
  );
}
