import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Comments from "@/components/Comments";
import PostAdminActions from "@/components/PostAdminActions";
import { buttonClass } from "@/components/ui/common/Button";
import PostArticleBody from "@/components/ui/post/PostArticleBody";
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
    <article className="pt-8 pb-20 sm:pt-14 sm:pb-24">
      <Suspense fallback={null}>
        <PostAdminActions slug={slug} title={post.meta.title} />
      </Suspense>
      <PostArticleBody
        category={post.meta.category}
        title={post.meta.title}
        date={post.meta.date}
        html={post.html}
      />

      {/* 이전·다음 글: 모바일은 위아래, sm 부터 좌우 */}
      <nav aria-label="이전·다음 글" className="container-prose mt-14 grid gap-3 sm:mt-20 sm:grid-cols-2">
        {prev ? (
          <Link href={`/posts/${prev.slug}`} className="card pressable pressable-lg group p-4 hover:border-strong">
            <span className="text-caption">← 이전 글</span>
            <div className="text-body-sm mt-1 line-clamp-2 font-semibold group-hover:text-strong">{prev.title}</div>
          </Link>
        ) : (
          <span className="hidden sm:block" />
        )}
        {next && (
          <Link href={`/posts/${next.slug}`} className="card pressable pressable-lg group p-4 hover:border-strong sm:text-right">
            <span className="text-caption">다음 글 →</span>
            <div className="text-body-sm mt-1 line-clamp-2 font-semibold group-hover:text-strong">{next.title}</div>
          </Link>
        )}
      </nav>
      <div className="container-prose mt-6 text-center">
        <Link href="/" className={buttonClass({ variant: "secondary" })}>
          목록으로
        </Link>
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
