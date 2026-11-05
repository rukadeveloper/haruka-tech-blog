import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { flattenCategories, loadCategories } from "@/lib/categories";
import { loadPostSource, markdownToEditorHtml } from "@/lib/posts";
import PostEditor from "../../../editor/PostEditor";

// 로그인 확인과 DB 조회로 요청마다 렌더링하는 화면이라 즉시 이동(instant) 검증에서 제외
export const instant = false;

export default async function EditPost({ params }: PageProps<"/admin/posts/[slug]/edit">) {
  await requireAdmin();
  const { slug } = await params;
  let post;
  try {
    post = await loadPostSource(slug);
  } catch {
    notFound();
  }
  const { meta, content, format } = post;
  const html = format === "html" ? content : await markdownToEditorHtml(content);
  return (
    <PostEditor
      isEdit
      legacyMarkdown={format !== "html"}
      categories={flattenCategories(await loadCategories())}
      initial={{ ...meta, tags: meta.tags.join(", "), html }}
    />
  );
}
