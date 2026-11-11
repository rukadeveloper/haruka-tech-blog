"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { deletePost } from "./actions";
import ConfirmDeleteButton from "@/components/ui/common/ConfirmDeleteButton";

export type AdminPost = { slug: string; title: string; category: string; date: string; draft: boolean };

type Filter = "all" | "published" | "draft";

const ghost =
  "rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface hover:text-foreground";

/** 글 목록: 상태 탭 + 검색 + 행 단위 작업 버튼 */
export default function AdminPostTable({ posts }: { posts: AdminPost[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(
    () => ({ all: posts.length, published: posts.filter((p) => !p.draft).length, draft: posts.filter((p) => p.draft).length }),
    [posts],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter(
      (p) =>
        (filter === "all" || (filter === "draft") === p.draft) &&
        (!q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)),
    );
  }, [posts, filter, query]);

  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: "전체" },
    { id: "published", label: "발행" },
    { id: "draft", label: "임시저장" },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-background">
      <div className="flex flex-col gap-3 border-b border-line p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="flex gap-1 rounded-xl bg-surface p-1" role="tablist" aria-label="글 상태">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={filter === t.id}
              onClick={() => setFilter(t.id)}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                filter === t.id ? "bg-background font-semibold text-foreground shadow-sm" : "text-muted hover:text-foreground"
              }`}
            >
              {t.label} <span className="ml-0.5 text-xs text-meta">{counts[t.id]}</span>
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="제목·카테고리 검색"
          aria-label="글 검색"
          className="w-full rounded-xl border border-line bg-surface px-3.5 py-2 text-sm outline-none transition-colors placeholder:text-meta focus:border-strong sm:w-64"
        />
      </div>

      {visible.length === 0 ? (
        <p className="py-16 text-center text-sm text-meta">{posts.length === 0 ? "아직 작성한 글이 없습니다." : "조건에 맞는 글이 없습니다."}</p>
      ) : (
        <ul className="divide-y divide-line">
          {visible.map((p) => (
            <li key={p.slug} className="flex flex-col gap-2 px-4 py-3.5 transition-colors hover:bg-surface/60 sm:flex-row sm:items-center sm:gap-4">
              <div className="min-w-0 flex-1">
                <Link
                  href={p.draft ? `/admin/posts/${p.slug}/edit` : `/posts/${p.slug}`}
                  className="line-clamp-1 font-medium hover:text-strong"
                >
                  {p.title}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-meta">
                  {p.draft ? (
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-medium text-amber-600 dark:text-amber-400">임시저장</span>
                  ) : (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-medium text-emerald-600 dark:text-emerald-400">발행됨</span>
                  )}
                  {p.category && <span className="rounded-full bg-surface px-2 py-0.5 text-muted">{p.category}</span>}
                  <time>{p.date}</time>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <Link href={`/admin/posts/${p.slug}/preview`} className={ghost}>미리보기</Link>
                <Link href={`/admin/posts/${p.slug}/edit`} className={ghost}>수정</Link>
                <form action={deletePost}>
                  <input type="hidden" name="slug" value={p.slug} />
                  <ConfirmDeleteButton
                    target={p.title}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10"
                  />
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
