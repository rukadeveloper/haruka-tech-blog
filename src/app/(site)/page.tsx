import { Suspense } from "react";
import BlogList from "@/components/BlogList";
import BlogSkeleton from "@/components/BlogSkeleton";

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

async function Content({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const { q, page } = await searchParams;
  return <BlogList q={first(q) ?? ""} page={Number(first(page)) || 1} />;
}

export default function Home(props: PageProps<"/">) {
  return (
    <Suspense fallback={<BlogSkeleton />}>
      <Content searchParams={props.searchParams} />
    </Suspense>
  );
}
