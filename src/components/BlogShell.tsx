import Link from "next/link";
import { categoryHref } from "@/lib/categories";
import { getAllPosts, getCategories, inCategory } from "@/lib/posts";
import PostList from "./PostList";
import Pagination from "./Pagination";

const PAGE_SIZE = 9;

const chip = (active: boolean) =>
  `rounded-full px-4 py-1.5 text-[15px] transition-colors ${
    active
      ? "bg-foreground text-background"
      : "bg-surface text-muted hover:text-foreground"
  }`;

/** 홈 / 카테고리 목록 공통 화면: 큰 타이틀 + 카테고리 칩 + 카드 그리드 + 페이지네이션 */
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
  const title = category ? category.split("/").join(" & ") : "Blog";
  const count = (c: string) => all.filter((p) => inCategory(p, c)).length;

  return (
    <div className="pb-24">
      <section className="pt-12 pb-10 text-center sm:pt-20">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">{title}</h1>
        <p className="mt-5 text-lg text-muted sm:text-xl">
          {category
            ? `${posts.length}개의 글`
            : "공부하는 개발자의 테크 블로그 — 개발과 AI, 그리고 배움의 기록"}
        </p>
      </section>

      <div className="mb-14 space-y-3">
        <ul className="flex flex-wrap justify-center gap-2">
          <li>
            <Link href="/" className={chip(category === "")}>
              전체 {all.length}
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.name}>
              <Link href={categoryHref(c.name)} className={chip(top === c.name)}>
                {c.name} {count(c.name)}
              </Link>
            </li>
          ))}
        </ul>
        {subs.length > 0 && (
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-[15px]">
            {subs.map((s) => {
              const full = `${top}/${s}`;
              return (
                <li key={s}>
                  <Link
                    href={categoryHref(full)}
                    className={category === full ? "font-bold text-strong" : "text-muted hover:text-foreground"}
                  >
                    {s} <span className="text-meta">{count(full)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <PostList posts={visible} />
      <Pagination base={category ? categoryHref(category) : "/"} page={current} total={total} />
    </div>
  );
}
