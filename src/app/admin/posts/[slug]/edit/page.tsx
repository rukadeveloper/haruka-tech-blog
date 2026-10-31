import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { flattenCategories, readCategories } from "@/lib/categories";
import { markdownToEditorHtml, readPostSource } from "@/lib/posts";
import PostEditor from "../../../editor/PostEditor";

export default async function EditPost({ params }: PageProps<"/admin/posts/[slug]/edit">) {
  await requireAdmin();
  const { slug } = await params;
  let post;
  try {
    post = readPostSource(slug);
  } catch {
    notFound();
  }
  const { meta, content, format } = post;
  const html = format === "html" ? content : await markdownToEditorHtml(content);
  return (
    <PostEditor
      isEdit
      legacyMarkdown={format !== "html"}
      categories={flattenCategories(readCategories())}
      initial={{ ...meta, tags: meta.tags.join(", "), html }}
    />
  );
}
