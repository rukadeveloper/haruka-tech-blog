import { Suspense } from "react";
import BlogShell from "@/components/BlogShell";
import BlogSkeleton from "@/components/BlogSkeleton";

async function Content({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const { page } = await searchParams;
  return <BlogShell page={Number(Array.isArray(page) ? page[0] : page) || 1} />;
}

export default function Home(props: PageProps<"/">) {
  return (
    <Suspense fallback={<BlogSkeleton />}>
      <Content searchParams={props.searchParams} />
    </Suspense>
  );
}
