import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import ThumbImage from "./ThumbImage";

export default function PostList({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) {
    return <p className="py-24 text-center text-lg text-muted">등록된 글이 없습니다.</p>;
  }
  return (
    <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-16">
      {posts.map((p) => (
        <li key={p.slug}>
          <Link href={`/posts/${p.slug}`} className="group flex h-full flex-col">
            <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-thumb">
              {p.thumbnail ? (
                <ThumbImage
                  src={p.thumbnail}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-4xl font-black text-meta/40">
                  {p.category.split("/").pop() || "Blog"}
                </div>
              )}
            </div>
            {p.category && (
              <p className="mt-5 text-sm text-sub">{p.category.split("/").join(" & ")}</p>
            )}
            <h2 className="mt-2 line-clamp-2 text-[1.4rem] leading-snug font-bold">{p.title}</h2>
            <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-muted">{p.description}</p>
            <time className="mt-3 text-sm text-meta">{p.date.replaceAll("-", ".")}</time>
          </Link>
        </li>
      ))}
    </ul>
  );
}
