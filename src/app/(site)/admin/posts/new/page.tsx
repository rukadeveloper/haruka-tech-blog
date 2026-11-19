import { requireAdmin } from "@/lib/auth";
import { flattenCategories, loadCategories } from "@/lib/categories";
import PostEditor from "../../editor/PostEditor";

// 로그인 확인과 DB 조회로 요청마다 렌더링하는 화면이라 즉시 이동(instant) 검증에서 제외
export const instant = false;

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
