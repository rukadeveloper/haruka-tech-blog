import { requireAdmin } from "@/lib/auth";
import { flattenCategories, readCategories } from "@/lib/categories";
import PostEditor from "../../editor/PostEditor";

export default async function NewPost() {
  await requireAdmin();
  return (
    <PostEditor
      isEdit={false}
      legacyMarkdown={false}
      categories={flattenCategories(readCategories())}
      initial={{
        slug: "",
        title: "",
        date: new Date().toISOString().slice(0, 10),
        category: "",
        description: "",
        tags: "",
        thumbnail: "",
        html: "",
      }}
    />
  );
}
