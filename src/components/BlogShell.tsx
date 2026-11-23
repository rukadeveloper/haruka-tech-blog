import { categoryHref } from "@/lib/categories";
import { getAllPosts, getCategories, inCategory } from "@/lib/posts";
import Pagination from "@/components/ui/common/Pagination";
import BlogLayout, { BlogSection } from "./BlogLayout";
import BlogSidebar from "./BlogSidebar";
import PostList from "./PostList";

const PAGE_SIZE = 9;

/** 카테고리 목록 화면: 사이드바 + 제목 · 글 수 + 3열 그리드 + 페이지네이션 */
export default async function BlogShell({ category, page = 1 }: { category: string; page?: number }) {
  const [categories, all] = await Promise.all([getCategories(), getAllPosts()]);
  const posts = all.filter((p) => inCategory(p, category));
  const total = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, page), total);
  const visible = posts.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <BlogLayout sidebar={<BlogSidebar categories={categories} category={category} />}>
      <BlogSection
        title={
          <>
            {category.split("/").join(" · ")} <span className="text-meta">{posts.length}</span>
          </>
        }
      >
        <PostList posts={visible} />
        <Pagination base={categoryHref(category)} page={current} total={total} />
      </BlogSection>
    </BlogLayout>
  );
}
