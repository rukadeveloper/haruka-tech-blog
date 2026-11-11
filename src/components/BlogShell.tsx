import Link from "next/link";
import { categoryHref } from "@/lib/categories";
import { getAllPosts, getCategories, inCategory } from "@/lib/posts";
import Chip from "@/components/ui/common/Chip";
import Pagination from "@/components/ui/common/Pagination";
import PostList from "./PostList";

const PAGE_SIZE = 9;

/** 홈 / 카테고리 목록 공통 화면: 제목 + 카테고리 칩 + 카드 그리드 + 페이지네이션 */
export default async function BlogShell({
  category = "",
  page = 1,
}: {
  category?: string;
  page?: number;
}) {
  const [categories, all] = await Promise.all([getCategories(), getAllPosts()]);
  const posts = category ? all.filter((p) => inCategory(p, category)) : all;
  const total = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, page), total);
  const visible = posts.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const [top] = category.split("/");
  const subs = categories.find((c) => c.name === top)?.children ?? [];
  const title = category ? category.split("/").join(" · ") : "Blog";
  const count = (c: string) => all.filter((p) => inCategory(p, c)).length;

  return (
    <div className="pb-20 sm:pb-24">
      <section className="pt-10 pb-7 sm:pt-16 sm:pb-10">
        <h1 className="text-display">{title}</h1>
        <p className="text-body mt-2 text-muted sm:mt-3 sm:text-lg">
          {category ? `${posts.length}개의 글` : "공부하는 개발자의 테크 블로그 — 개발과 AI, 그리고 배움의 기록"}
        </p>
      </section>

      {/* 모바일은 한 줄 가로 스크롤, sm 부터 여러 줄 */}
      <nav aria-label="카테고리" className="mb-8 space-y-3 sm:mb-12">
        <ul className="scroll-row sm:mx-0 sm:flex-wrap sm:px-0">
          <li>
            <Chip href="/" active={category === ""} count={all.length}>
              전체
            </Chip>
          </li>
          {categories.map((c) => (
            <li key={c.name}>
              <Chip href={categoryHref(c.name)} active={top === c.name} count={count(c.name)}>
                {c.name}
              </Chip>
            </li>
          ))}
        </ul>
        {subs.length > 0 && (
          <ul className="scroll-row gap-1! sm:mx-0 sm:flex-wrap sm:px-0">
            {subs.map((s) => {
              const full = `${top}/${s}`;
              const on = category === full;
              return (
                <li key={s} className="shrink-0">
                  <Link
                    href={categoryHref(full)}
                    aria-current={on ? "page" : undefined}
                    className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[15px] whitespace-nowrap transition-colors ${
                      on ? "bg-strong-soft font-bold text-strong" : "text-muted hover:bg-surface hover:text-foreground"
                    }`}
                  >
                    {s} <span className="text-[13px] opacity-70">{count(full)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      <PostList posts={visible} />
      <Pagination base={category ? categoryHref(category) : "/"} page={current} total={total} />
    </div>
  );
}
