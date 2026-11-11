import Link from "next/link";
import PostToc from "./PostToc";
import { markImagesPending } from "@/lib/images";
import { buildToc } from "@/lib/toc";

// lib/categories 는 서버 전용(DB)이라 클라이언트(에디터 미리보기)에서 못 가져온다 — categoryHref 와 같은 규칙
const categoryHref = (c: string) => "/category/" + c.split("/").map(encodeURIComponent).join("/");

/** 글 상단(카테고리·제목·날짜) + 목차 + 본문. 공개 글 페이지와 관리자 미리보기가 함께 쓴다. */
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
      <header className="container-prose border-b border-line pb-6 sm:pb-8">
        {category && (
          <Link href={categoryHref(category)} className="badge badge-primary">
            {category.split("/").join(" · ")}
          </Link>
        )}
        <h1 className="text-display mt-3">{title || "(제목 없음)"}</h1>
        <time className="text-caption mt-3 block sm:text-sm">{date.replaceAll("-", ".")}</time>
      </header>

      {items.length > 0 && (
        <div className="container-prose mt-8">
          <PostToc items={items} />
        </div>
      )}

      <div className={`post-body ${items.length > 0 ? "" : "mt-8"}`} dangerouslySetInnerHTML={{ __html: markImagesPending(body) }} />
    </>
  );
}
