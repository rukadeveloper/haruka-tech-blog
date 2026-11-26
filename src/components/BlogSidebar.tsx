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
 * lg 이상: 화면 오른쪽에 고정(fixed)된 밑줄형 검색 + 카테고리 묶음(대분류 제목 + 소분류 #이름).
 * lg 미만: 목록 위에 검색창 + 헤더 아래에 붙는(sticky) 대분류 칩 줄 (현재 대분류의 소분류 칩 줄).
 */
export default function BlogSidebar({ categories, category = "", q = "" }: Props) {
  const [top] = category.split("/");
  const subs = categories.find((c) => c.name === top)?.children ?? [];
  const isAll = !category && !q;

  return (
    <>
      {/* 좁은 화면: 검색창 → 카테고리 칩 줄. 칩 줄은 BlogList 의 바깥 틀(목록 전체 높이)에 바로 놓여야
          스크롤해도 헤더 바로 아래(64 / 68px — 헤더 위 여백 8 / 12 + 높이 56)에 붙어 있는다 — 짧은 감싸개 안에 넣으면 sticky 가 그 안에서 끝난다 */}
      <div className="lg:hidden">
        <Search q={q} />
      </div>
      <div className="sticky top-16 z-30 -mx-5 mt-3 bg-background px-5 py-2 sm:top-[68px] sm:-mx-6 sm:px-6 lg:hidden">
        <nav aria-label="카테고리">
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
      {/* 화면에 고정 (fixed) — 목록 끝 · 페이지 끝에서도 밀려 올라가지 않는다.
          BlogList 그리드의 오른쪽 260px 칸은 비워 두고, 그 칸과 같은 자리(.container-page 오른쪽 안쪽 여백 24px)에 붙인다:
          right = max(24px, 50% − (1120/2 − 24)). 화면보다 길면 사이드바 안에서 스크롤하고, 페이지 끝에서는 푸터가 위로 덮는다 */}
      <aside className="hidden lg:fixed lg:top-24 lg:right-[max(24px,calc(50%-536px))] lg:z-10 lg:block lg:max-h-[calc(100dvh-120px)] lg:w-[260px] lg:overflow-y-auto lg:pb-2 lg:[scrollbar-width:thin]">
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
