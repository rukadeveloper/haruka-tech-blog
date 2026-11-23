import Form from "next/form";
import Link from "next/link";
import { categoryHref, type Category } from "@/lib/categories";

type Props = {
  categories: Category[];
  /** 현재 카테고리 경로 ("" = 홈) */
  category?: string;
  /** 현재 검색어 */
  q?: string;
};

const item =
  "pressable flex h-9 shrink-0 items-center rounded-lg px-3 text-[15px] whitespace-nowrap text-muted hover:bg-surface hover:text-foreground aria-[current=page]:bg-strong-soft aria-[current=page]:font-semibold aria-[current=page]:text-strong";

/**
 * 홈 · 카테고리 화면의 사이드바: 제목 → 홈 + 대분류(현재 대분류의 소분류는 들여서) → 검색창.
 * lg 이상에서는 왼쪽에 고정되고, 그보다 좁으면 본문 위에서 가로 스크롤 줄이 된다 (DESIGN.md "글 목록").
 */
export default function BlogSidebar({ categories, category = "", q = "" }: Props) {
  const [top] = category.split("/");
  const subs = categories.find((c) => c.name === top)?.children ?? [];
  const isHome = !category && !q;

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <p className="text-title hidden lg:mb-5 lg:block">기술 블로그</p>

      <nav aria-label="카테고리">
        <ul className="scroll-row lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0">
          <li>
            <Link href="/" aria-current={isHome ? "page" : undefined} className={item}>
              홈
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.name} className="contents lg:block">
              <Link
                href={categoryHref(c.name)}
                aria-current={category === c.name ? "page" : undefined}
                className={`${item} ${top === c.name && category !== c.name ? "font-semibold text-foreground" : ""}`}
              >
                {c.name}
              </Link>
              {/* 현재 대분류의 소분류: lg 에서는 아래로 들여 쓰고, 좁은 화면에서는 같은 줄에 이어 붙인다 */}
              {top === c.name && subs.length > 0 && (
                <ul className="contents lg:mt-0.5 lg:block lg:space-y-0.5">
                  {subs.map((s) => {
                    const full = `${c.name}/${s}`;
                    return (
                      <li key={s} className="contents lg:block">
                        <Link
                          href={categoryHref(full)}
                          aria-current={category === full ? "page" : undefined}
                          className={`${item} text-[14px] lg:pl-6`}
                        >
                          {s}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <hr className="my-5 hidden border-line lg:block" />

      {/* 검색은 홈에서 ?q= 로 거른다 (서버에서 캐시된 글 목록을 필터).
          next/form 은 사이트 안 이동으로 보낸다 — 기본 <form> 은 문서를 새로 받아 프록시가 인트로로 돌려보낸다 */}
      <Form action="/" role="search" className="relative mt-3 lg:mt-0">
        <svg
          className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-meta"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        {/* key: 사이트 안 이동에서도 검색어가 바뀌면(홈으로 가면 비면) 입력값을 다시 맞춘다 */}
        <input
          key={q}
          type="search"
          name="q"
          defaultValue={q}
          placeholder="검색"
          aria-label="글 검색"
          className="field w-full pl-10"
        />
      </Form>
    </aside>
  );
}
