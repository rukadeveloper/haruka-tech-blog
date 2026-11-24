import Form from "next/form";
import Link from "next/link";
import { categoryHref, type Category } from "@/lib/categories";

type Props = {
  categories: Category[];
  /** 현재 카테고리 경로 ("" = 전체) */
  category?: string;
  /** 현재 검색어 */
  q?: string;
};

const tab =
  "pressable flex h-12 shrink-0 items-center px-4 text-base font-medium whitespace-nowrap text-meta hover:text-foreground aria-[current=page]:font-bold aria-[current=page]:text-foreground sm:px-5";

/**
 * 홈 · 카테고리 화면 위의 카테고리 탭 줄: "전체" + 대분류, 오른쪽(모바일은 아래)에 검색창.
 * 현재 대분류에 소분류가 있으면 탭 아래에 칩 줄이 붙는다 (DESIGN.md "글 목록").
 */
export default function BlogTabs({ categories, category = "", q = "" }: Props) {
  const [top] = category.split("/");
  const subs = categories.find((c) => c.name === top)?.children ?? [];

  return (
    <div>
      <div className="sm:flex sm:items-center sm:gap-4">
        <nav aria-label="카테고리" className="min-w-0 sm:flex-1">
          {/* sm 이상은 오른쪽에 검색창이 붙으므로 오른쪽 음수 여백을 없앤다. 탭이 넘치면 가운데 정렬 대신 가로 스크롤 */}
          <ul className="scroll-row !gap-0 sm:mr-0 sm:pr-0 lg:mx-0 lg:justify-center-safe lg:px-0">
            <li>
              <Link href="/" aria-current={!category && !q ? "page" : undefined} className={tab}>
                전체
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.name}>
                <Link
                  href={categoryHref(c.name)}
                  aria-current={top === c.name ? "page" : undefined}
                  className={tab}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 검색은 홈에서 ?q= 로 거른다 (서버에서 캐시된 글 목록을 필터).
            next/form 은 사이트 안 이동으로 보낸다 — 기본 <form> 은 문서를 새로 받아 프록시가 인트로로 돌려보낸다 */}
        <Form action="/" role="search" className="relative mt-3 sm:mt-0 sm:w-56 sm:shrink-0">
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
      </div>

      {subs.length > 0 && (
        <nav aria-label={`${top} 소분류`} className="mt-4">
          <ul className="scroll-row lg:mx-0 lg:flex-wrap lg:justify-center lg:overflow-visible lg:px-0">
            <li>
              <Link href={categoryHref(top)} aria-current={category === top ? "page" : undefined} className="chip">
                전체
              </Link>
            </li>
            {subs.map((s) => {
              const full = `${top}/${s}`;
              return (
                <li key={s}>
                  <Link href={categoryHref(full)} aria-current={category === full ? "page" : undefined} className="chip">
                    {s}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
