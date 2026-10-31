import { Suspense } from "react";
import BlogShell from "@/components/BlogShell";

async function Content({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const { page } = await searchParams;
  return <BlogShell page={Number(Array.isArray(page) ? page[0] : page) || 1} />;
}

export default function Home(props: PageProps<"/">) {
  return (
    <Suspense fallback={null}>
      <Content searchParams={props.searchParams} />
    </Suspense>
  );
}
