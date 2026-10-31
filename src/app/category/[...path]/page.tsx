import { Suspense } from "react";
import { notFound } from "next/navigation";
import BlogShell from "@/components/BlogShell";
import { flattenCategories } from "@/lib/categories";
import { getCategories } from "@/lib/posts";

const decode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

export async function generateStaticParams() {
  const all = flattenCategories(await getCategories());
  return all.map((c) => ({ path: c.split("/") }));
}

async function Content({ props }: { props: PageProps<"/category/[...path]"> }) {
  const [{ path }, { page }] = await Promise.all([props.params, props.searchParams]);
  const category = path.map(decode).join("/");
  if (!flattenCategories(await getCategories()).includes(category)) notFound();
  return (
    <BlogShell category={category} page={Number(Array.isArray(page) ? page[0] : page) || 1} />
  );
}

export default function CategoryPage(props: PageProps<"/category/[...path]">) {
  return (
    <Suspense fallback={null}>
      <Content props={props} />
    </Suspense>
  );
}
