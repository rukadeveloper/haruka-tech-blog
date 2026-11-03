import Link from "next/link";
import PostToc from "@/components/PostToc";
import { buildToc } from "@/lib/toc";

// lib/categories 는 node:fs 를 쓰므로 클라이언트(에디터 미리보기)에서 못 가져온다 — categoryHref 와 같은 규칙
const categoryHref = (c: string) => "/category/" + c.split("/").map(encodeURIComponent).join("/");

/** 글 상단(카테고리·제목·날짜) + 본문. 공개 글 페이지와 관리자 미리보기가 함께 쓴다. */
export default function PostArticleBody({
  category,
  title,
  date,
  html,
}: {
  category: string;
  title: string;
  date: string;
  html: string;
}) {
  // h2·h3 에 id 를 붙이고 목차 항목을 만든다 (제목이 2개 미만이면 목차를 숨김)
  const { html: body, items } = buildToc(html);
  return (
    <>
      <div className="mx-auto max-w-[800px] text-center">
        <div className="text-sm text-[#94a3b8]">
          {category && (
            <Link href={categoryHref(category)} className="hover:underline">
              {category.split("/").join(" / ")}
            </Link>
          )}
        </div>
        <h1 className="pt-2 text-[2.5rem] leading-tight font-bold">{title || "(제목 없음)"}</h1>
        <div className="pt-3 text-sm text-meta">
          <time>{date.replaceAll("-", ".")}</time>
        </div>
      </div>

      {items.length > 0 && (
        <div className="mx-auto mt-12 max-w-[768px]">
          <PostToc items={items} />
        </div>
      )}

      <div className={`post-body ${items.length > 0 ? "" : "mt-12"}`} dangerouslySetInnerHTML={{ __html: body }} />
    </>
  );
}
