import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import { AUTHOR } from "@/lib/site";
import BrandMark from "@/components/ui/common/BrandMark";

// lib/categories 는 서버 전용(DB) 모듈과 같은 파일이라, 주소 규칙만 여기에 둔다 (categoryHref 와 같은 규칙)
const categoryHref = (c: string) => "/category/" + c.split("/").map(encodeURIComponent).join("/");

const chip = "inline-flex h-7 items-center rounded-md bg-surface px-2 text-xs text-muted";

/** 작성자 줄의 로고 타일 — 파비콘과 같은 그림 (진한 바탕 고정, 다크에서도 같다) */
function AuthorAvatar() {
  return (
    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#191f28] text-white" aria-hidden>
      <BrandMark size={26} />
    </span>
  );
}

/**
 * 글 목록의 한 줄 (docs/design "글 목록" — LINE Engineering 배치): 제목 → 작성자 줄 → 요약 3줄 → 분류 칩.
 * 썸네일은 없다. 칩 링크와 겹치지 않도록 행 전체가 아니라 제목 · 요약만 글로 링크한다.
 */
export default function PostRow({ post }: { post: PostMeta }) {
  const href = `/posts/${post.slug}`;
  const tags = post.tags.slice(0, 4);

  return (
    <article className="border-b border-line py-8 sm:py-10">
      <h2 className="line-clamp-2 text-[22px] leading-snug font-bold tracking-[-0.02em] sm:text-[26px]">
        <Link href={href} className="transition-colors hover:text-strong">
          {post.title}
        </Link>
      </h2>

      <div className="mt-3 flex items-center gap-3">
        <AuthorAvatar />
        <div className="min-w-0 leading-snug">
          <p className="text-[15px]">
            <span className="font-semibold">{AUTHOR.name}</span>
            <time dateTime={post.date} className="ml-2 text-meta">
              {post.date.replaceAll("-", ".")}
            </time>
          </p>
          <p className="mt-0.5 truncate text-[13px] text-meta">{AUTHOR.bio}</p>
        </div>
      </div>

      {post.description && (
        // 요약도 글로 가지만 같은 링크가 두 번 읽히지 않게 탭 순서와 보조 기술에서 뺀다
        <Link href={href} tabIndex={-1} aria-hidden className="mt-5 block">
          <p className="line-clamp-3 text-base leading-relaxed text-muted">{post.description}</p>
        </Link>
      )}

      {(post.category || tags.length > 0) && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {post.category && (
            <Link href={categoryHref(post.category)} className={`${chip} pressable hover:text-foreground`}>
              {post.category.split("/").join(" › ")}
            </Link>
          )}
          {tags.map((t) => (
            <span key={t} className={chip}>
              #{t}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
