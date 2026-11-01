import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Comments from "@/components/Comments";
import PostArticleBody from "@/components/PostArticleBody";
import { getAllPosts, getPost } from "@/lib/posts";

export async function generateStaticParams() {
  return (await getAllPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/posts/[slug]">) {
  const { slug } = await params;
  try {
    const { meta } = await getPost(slug);
    return { title: meta.title, description: meta.description };
  } catch {
    return {};
  }
}

async function Article({ params }: { params: PageProps<"/posts/[slug]">["params"] }) {
  const { slug } = await params;
  let post;
  try {
    post = await getPost(slug);
  } catch {
    notFound();
  }
  const all = await getAllPosts();
  const i = all.findIndex((p) => p.slug === slug);
  const prev = i >= 0 ? all[i + 1] : undefined; // 더 오래된 글
  const next = i > 0 ? all[i - 1] : undefined; // 더 최근 글
  return (
    <article className="pt-12 pb-24 sm:pt-20">
      <PostArticleBody
        category={post.meta.category}
        title={post.meta.title}
        date={post.meta.date}
        html={post.html}
      />

      <div className="mx-auto mt-16 max-w-[768px]">
        <div className="text-center">
          <Link
            href="/"
            className="inline-block rounded-md bg-surface px-5 py-2 text-sm font-medium hover:text-strong"
          >
            ← Back to Blog
          </Link>
        </div>
        <div className="mt-10 flex justify-between gap-4 rounded-[5px] border border-[#a3a3a3] bg-surface p-2.5">
          {prev ? (
            <Link href={`/posts/${prev.slug}`} className="flex-1 text-left">
              <span className="text-xs text-meta">이전 글</span>
              <div className="line-clamp-2 text-sm font-medium">{prev.title}</div>
            </Link>
          ) : <span className="flex-1" />}
          {next ? (
            <Link href={`/posts/${next.slug}`} className="flex-1 border-l border-[#a3a3a3] pl-5 text-right">
              <span className="text-xs text-meta">다음 글</span>
              <div className="line-clamp-2 text-sm font-medium">{next.title}</div>
            </Link>
          ) : <span className="flex-1" />}
        </div>
      </div>

      <Suspense fallback={null}>
        <Comments slug={slug} />
      </Suspense>
    </article>
  );
}

export default function PostPage(props: PageProps<"/posts/[slug]">) {
  return (
    <Suspense fallback={null}>
      <Article params={props.params} />
    </Suspense>
  );
}
