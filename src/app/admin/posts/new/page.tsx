import { requireAdmin } from "@/lib/auth";
import { flattenCategories, loadCategories } from "@/lib/categories";
import PostEditor from "../../editor/PostEditor";

export default async function NewPost() {
  await requireAdmin();
  return (
    <PostEditor
      isEdit={false}
      legacyMarkdown={false}
      categories={flattenCategories(await loadCategories())}
      initial={{
        slug: "",
        title: "",
        date: new Date().toISOString().slice(0, 10),
        category: "",
        description: "",
        tags: "",
        thumbnail: "",
        draft: false,
        html: "",
      }}
    />
  );
}
