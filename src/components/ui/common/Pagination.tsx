import Link from "next/link";

/** 보일 쪽 번호: 1 · 마지막 · 현재 ±2. 건너뛴 자리는 "…" */
function pages(page: number, total: number): (number | "…")[] {
  const out: (number | "…")[] = [];
  for (let n = 1; n <= total; n++) {
    if (n === 1 || n === total || Math.abs(n - page) <= 2) out.push(n);
    else if (out.at(-1) !== "…") out.push("…");
  }
  return out;
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d={dir === "left" ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
    </svg>
  );
}

/**
 * 쪽 번호 줄 (DESIGN.md "글 목록"): ‹ 1 … 4 5 [6] 7 8 … 13 ›
 * query 는 쪽을 넘겨도 유지할 검색 조건 (예: { q: "next" }).
 */
export default function Pagination({
  base,
  page,
  total,
  query,
}: {
  base: string;
  page: number;
  total: number;
  query?: Record<string, string>;
}) {
  if (total <= 1) return null;

  const href = (n: number) => {
    const params = new URLSearchParams(query);
    if (n > 1) params.set("page", String(n));
    const s = params.toString();
    return s ? `${base}?${s}` : base;
  };

  const num =
    "pressable inline-flex h-8 min-w-8 items-center justify-center rounded-md px-1.5 text-sm font-medium text-meta hover:text-foreground";
  const arrow =
    "pressable inline-flex size-8 items-center justify-center rounded-md text-muted hover:text-foreground aria-disabled:pointer-events-none aria-disabled:opacity-30";

  const step = (n: number, dir: "left" | "right", label: string) => {
    const disabled = n < 1 || n > total;
    return disabled ? (
      <span className={arrow} aria-disabled="true" aria-label={label}>
        <Chevron dir={dir} />
      </span>
    ) : (
      <Link href={href(n)} className={arrow} aria-label={label}>
        <Chevron dir={dir} />
      </Link>
    );
  };

  return (
    <nav aria-label="페이지" className="mt-12 flex items-center justify-center gap-1 sm:mt-14">
      <span className="mr-2 sm:mr-3">{step(page - 1, "left", "이전 페이지")}</span>
      {pages(page, total).map((n, i) =>
        n === "…" ? (
          <span key={`gap-${i}`} className="inline-flex h-8 min-w-6 items-center justify-center text-[15px] text-meta" aria-hidden>
            …
          </span>
        ) : (
          <Link
            key={n}
            href={href(n)}
            aria-current={n === page ? "page" : undefined}
            className={n === page ? `${num} pointer-events-none !bg-foreground font-semibold !text-background` : num}
          >
            {n}
          </Link>
        ),
      )}
      <span className="ml-2 sm:ml-3">{step(page + 1, "right", "다음 페이지")}</span>
    </nav>
  );
}
