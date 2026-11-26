"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import AdminPostCard, { postHref, StatusBadge, type AdminPost } from "./AdminPostCard";
import PostActions from "./PostActions";

export type { AdminPost };

type Filter = "all" | "published" | "draft";
type View = "grid" | "list";

/* 고른 보기(그리드 / 리스트)는 이 브라우저의 localStorage 에 둔다.
   저장소를 못 쓰는 환경(사생활 보호 창 등)에서도 이번 방문 동안은 바꾼 보기가 유지되도록 메모리 값을 먼저 본다 */
const VIEW_KEY = "admin-post-view";
const listeners = new Set<() => void>();
let memory: View | null = null;

function readView(): View {
  if (memory) return memory;
  try {
    return localStorage.getItem(VIEW_KEY) === "list" ? "list" : "grid";
  } catch {
    return "grid";
  }
}

function writeView(v: View) {
  memory = v;
  try {
    localStorage.setItem(VIEW_KEY, v);
  } catch {}
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => void listeners.delete(l);
};

function ViewButton({ view, current, label, children }: { view: View; current: View; label: string; children: React.ReactNode }) {
  const on = view === current;
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={label}
      title={label}
      onClick={() => writeView(view)}
      className={`icon-btn ${on ? "bg-surface text-foreground" : "hover:text-foreground"}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {children}
      </svg>
    </button>
  );
}

/** 글 목록: 상태 탭 + 검색 + 보기 전환, 그 아래 카드 그리드(기본) 또는 리스트 */
export default function AdminPostTable({ posts }: { posts: AdminPost[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  // 서버 렌더와 첫 하이드레이션은 그리드로 그리고, 그 뒤 저장된 보기로 맞춘다
  const view = useSyncExternalStore(subscribe, readView, () => "grid" as View);

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
    <section className="card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-line p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="flex gap-1 rounded-xl bg-surface p-1" role="tablist" aria-label="글 상태">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={filter === t.id}
              onClick={() => setFilter(t.id)}
              className={`h-9 flex-1 rounded-lg px-3 text-sm whitespace-nowrap transition-colors sm:flex-none ${
                filter === t.id ? "bg-elevated font-semibold text-foreground shadow-card" : "text-muted hover:text-foreground"
              }`}
            >
              {t.label} <span className="ml-0.5 text-xs text-meta">{counts[t.id]}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="제목·카테고리 검색"
            aria-label="글 검색"
            className="field min-w-0 flex-1 sm:w-64 sm:flex-none"
          />
          <div className="flex shrink-0 gap-0.5" role="group" aria-label="보기 방식">
            <ViewButton view="grid" current={view} label="그리드로 보기">
              <rect x="4" y="4" width="7" height="7" rx="1.5" />
              <rect x="13" y="4" width="7" height="7" rx="1.5" />
              <rect x="4" y="13" width="7" height="7" rx="1.5" />
              <rect x="13" y="13" width="7" height="7" rx="1.5" />
            </ViewButton>
            <ViewButton view="list" current={view} label="리스트로 보기">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </ViewButton>
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="py-16 text-center text-sm text-meta">{posts.length === 0 ? "아직 작성한 글이 없습니다." : "조건에 맞는 글이 없습니다."}</p>
      ) : view === "grid" ? (
        <ul className="grid gap-4 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-3">
          {visible.map((p) => (
            <li key={p.slug}>
              <AdminPostCard post={p} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="divide-y divide-line">
          {visible.map((p) => (
            <li key={p.slug} className="flex flex-col gap-1 px-4 py-3.5 transition-colors hover:bg-subtle sm:flex-row sm:items-center sm:gap-4">
              <div className="min-w-0 flex-1">
                <Link href={postHref(p)} className="line-clamp-2 font-semibold hover:text-strong sm:line-clamp-1">
                  {p.title}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-meta">
                  <StatusBadge draft={p.draft} />
                  {p.featured && <span className="badge badge-primary">추천</span>}
                  {p.category && <span className="badge">{p.category}</span>}
                  <time>{p.date}</time>
                </div>
              </div>
              <PostActions slug={p.slug} title={p.title} className="-ml-3 sm:ml-0" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
