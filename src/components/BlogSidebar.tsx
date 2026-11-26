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

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

/**
 * 검색창. 홈에서 ?q= 로 거른다 (서버에서 캐시된 글 목록을 필터).
 * next/form 은 사이트 안 이동으로 보낸다 — 기본 <form> 은 문서를 새로 받아 프록시가 인트로로 돌려보낸다.
 * underline: 사이드바의 밑줄형 / 아니면 좁은 화면의 .field
 */
function Search({ q, underline }: { q: string; underline?: boolean }) {
  return (
    <Form action="/" role="search" className="relative">
      <SearchIcon className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-meta ${underline ? "left-0" : "left-3.5"}`} />
      {/* key: 사이트 안 이동에서도 검색어가 바뀌면(홈으로 가면 비면) 입력값을 다시 맞춘다 */}
      <input
        key={q}
        type="search"
        name="q"
        defaultValue={q}
        placeholder="검색어를 입력하세요"
        aria-label="글 검색"
        className={
          underline
            ? "h-11 w-full border-b border-line bg-transparent pr-8 pl-7 text-base outline-none placeholder:text-meta focus:border-foreground [&::-webkit-search-cancel-button]:hidden"
            : "field w-full pl-10"
        }
      />
      {underline && q && (
        <Link href="/" aria-label="검색어 지우기" className="absolute top-1/2 right-0 grid size-7 -translate-y-1/2 place-items-center rounded-md text-meta hover:text-foreground">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </Link>
      )}
    </Form>
  );
}

const sideLink =
  "block leading-9 transition-colors hover:text-foreground aria-[current=page]:font-semibold aria-[current=page]:text-foreground";

/**
 * 홈 · 카테고리 화면의 사이드바 (DESIGN.md "글 목록" — LINE Engineering 배치).
 * lg 이상: 오른쪽에 붙는 밑줄형 검색 + 카테고리 묶음(대분류 제목 + 소분류 #이름).
 * lg 미만: 목록 위에 검색창 + 대분류 칩 줄 (현재 대분류의 소분류 칩 줄).
 */
export default function BlogSidebar({ categories, category = "", q = "" }: Props) {
  const [top] = category.split("/");
  const subs = categories.find((c) => c.name === top)?.children ?? [];
  const isAll = !category && !q;

  return (
    <>
      {/* 좁은 화면 */}
      <div className="lg:hidden">
        <Search q={q} />
        <nav aria-label="카테고리" className="mt-3">
          <ul className="scroll-row">
            <li>
              <Link href="/" aria-current={isAll ? "page" : undefined} className="chip">
                전체
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.name}>
                <Link href={categoryHref(c.name)} aria-current={top === c.name ? "page" : undefined} className="chip">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {subs.length > 0 && (
          <nav aria-label={`${top} 소분류`} className="mt-2">
            <ul className="scroll-row">
              {subs.map((s) => {
                const full = `${top}/${s}`;
                return (
                  <li key={s}>
                    <Link href={categoryHref(full)} aria-current={category === full ? "page" : undefined} className="chip h-8! px-3! text-sm!">
                      #{s}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>

      {/* 넓은 화면 */}
      {/* BlogList 그리드의 오른쪽 칸 (좁은 화면 블록이 앞에 있어도 자리를 고정한다) */}
      <aside className="hidden lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1 lg:block lg:max-h-[calc(100dvh-120px)] lg:self-start lg:overflow-y-auto lg:pb-2 lg:[scrollbar-width:thin]">
        <Search q={q} underline />
        <nav aria-label="카테고리" className="mt-10">
          <h2 className="text-lg font-bold">카테고리</h2>
          <ul className="mt-3 text-[15px] text-muted">
            <li>
              <Link href="/" aria-current={isAll ? "page" : undefined} className={sideLink}>
                전체 글
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.name} className="mt-2">
                <Link
                  href={categoryHref(c.name)}
                  aria-current={category === c.name ? "page" : undefined}
                  className={`block leading-9 font-bold transition-colors hover:text-strong ${top === c.name ? "text-strong" : "text-foreground"}`}
                >
                  {c.name}
                </Link>
                {c.children.length > 0 && (
                  <ul className="pl-4 text-sm text-meta">
                    {c.children.map((s) => {
                      const full = `${c.name}/${s}`;
                      return (
                        <li key={s}>
                          <Link href={categoryHref(full)} aria-current={category === full ? "page" : undefined} className={sideLink}>
                            #{s}
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
      </aside>
    </>
  );
}
