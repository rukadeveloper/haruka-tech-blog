import { connection } from "next/server";
import { isAdmin } from "@/lib/auth";
import { readComments, type Comment } from "@/lib/comments";
import { formatDateTime } from "@/lib/format";
import { getUser, isGithubConfigured, type SessionUser } from "@/lib/session";
import { deleteComment, githubLogout } from "@/app/posts/[slug]/comment-actions";
import CommentForm from "@/components/ui/comment/CommentForm";
import ReplyToggle from "@/components/ui/comment/ReplyToggle";
import GithubLoginLink from "@/components/ui/common/GithubLoginLink";
import UserBar from "@/components/ui/common/UserBar";

function Item({
  c,
  slug,
  user,
  admin,
  reply = false,
}: {
  c: Comment;
  slug: string;
  user: SessionUser | null;
  admin: boolean;
  reply?: boolean;
}) {
  const canDelete = admin || user?.id === c.authorId;
  const size = reply ? 32 : 40;
  return (
    <div className="flex gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={c.avatar} alt="" width={size} height={size} className="h-fit shrink-0 rounded-full bg-surface" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <a href={`https://github.com/${c.login}`} target="_blank" rel="noopener noreferrer" className="font-bold hover:underline">
            {c.name}
          </a>
          <time className="text-caption" dateTime={c.createdAt}>
            {formatDateTime(c.createdAt)}
          </time>
        </div>
        <p className="text-body-sm mt-1 break-words whitespace-pre-wrap text-detail-desc">{c.body}</p>
        <div className="mt-1.5 flex gap-3">
          {user && <ReplyToggle slug={slug} parentId={c.id} />}
          {canDelete && (
            <form action={deleteComment}>
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="id" value={c.id} />
              <button className="text-sm font-medium text-meta hover:text-danger">삭제</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function Comments({ slug }: { slug: string }) {
  // 로그인 상태에 따라 달라지는 화면이라 요청 시점에만 렌더링한다
  await connection();
  const [user, admin, all, configured] = await Promise.all([getUser(), isAdmin(), readComments(slug), isGithubConfigured()]);
  const roots = all.filter((c) => !c.parentId);
  const repliesOf = (id: string) => all.filter((c) => c.parentId === id);

  return (
    <section className="container-prose mt-14 border-t border-line pt-10 sm:mt-20" aria-label="댓글">
      <h2 className="text-heading">
        댓글 <span className="text-strong">{all.length}</span>
      </h2>

      <div className="mt-4">
        {user ? (
          <div className="space-y-3">
            <UserBar user={user} logout={githubLogout}>
              <input type="hidden" name="slug" value={slug} />
            </UserBar>
            <CommentForm slug={slug} />
          </div>
        ) : configured ? (
          <GithubLoginLink returnTo={`/posts/${slug}`}>GitHub로 로그인하고 댓글 달기</GithubLoginLink>
        ) : (
          <p className="rounded-xl bg-surface px-4 py-3 text-sm text-muted">
            GitHub 로그인이 아직 설정되지 않았습니다. <code>.env.local</code>에 GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET을 추가하세요.
          </p>
        )}
      </div>

      {roots.length === 0 ? (
        <p className="py-12 text-center text-meta">첫 댓글을 남겨 보세요.</p>
      ) : (
        <ul className="mt-8 space-y-7">
          {roots.map((c) => (
            <li key={c.id}>
              <Item c={c} slug={slug} user={user} admin={admin} />
              {repliesOf(c.id).length > 0 && (
                <ul className="mt-5 ml-5 space-y-5 border-l-2 border-line pl-4 sm:ml-[52px]">
                  {repliesOf(c.id).map((r) => (
                    <li key={r.id}>
                      <Item c={r} slug={slug} user={user} admin={admin} reply />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
