import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { readPostSource, renderHtml, renderMarkdown } from "@/lib/posts";
import PostArticleBody from "@/components/PostArticleBody";

/** 저장된 글(초안 포함)을 공개 화면과 같은 모양으로 미리보기 — 관리자 전용 */
export default async function PreviewPost({ params }: PageProps<"/admin/posts/[slug]/preview">) {
  await requireAdmin();
  const { slug } = await params;
  let post;
  try {
    post = readPostSource(slug);
  } catch {
    notFound();
  }
  const { meta, content, format } = post;
  const html = format === "html" ? await renderHtml(content) : await renderMarkdown(content);
  return (
    <article className="pb-24">
      <div className="mb-8 flex items-center gap-3 rounded bg-surface px-4 py-2 text-sm">
        <span className="font-semibold">미리보기</span>
        <span className="text-muted">{meta.draft ? "임시저장(비공개) 글입니다." : "공개된 글입니다."}</span>
        <Link href={`/admin/posts/${slug}/edit`} className="ml-auto hover:underline">수정</Link>
        <Link href="/admin" className="hover:underline">목록</Link>
      </div>
      <PostArticleBody category={meta.category} title={meta.title} date={meta.date} html={html} />
    </article>
  );
}
