import { Suspense } from "react";
import BlogSkeleton from "@/components/BlogSkeleton";
import HomeSections from "@/components/HomeSections";

async function Content({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const { q } = await searchParams;
  return <HomeSections q={(Array.isArray(q) ? q[0] : q) ?? ""} />;
}

export default function Home(props: PageProps<"/">) {
  return (
    <Suspense fallback={<BlogSkeleton />}>
      <Content searchParams={props.searchParams} />
    </Suspense>
  );
}
