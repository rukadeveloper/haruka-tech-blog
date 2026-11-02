import { isAdmin } from "@/lib/auth";
import { readComments, type Comment } from "@/lib/comments";
import { getUser, isGithubConfigured, type SessionUser } from "@/lib/session";
import { deleteComment, githubLogout } from "@/app/posts/[slug]/comment-actions";
import CommentForm from "./CommentForm";
import ReplyToggle from "./ReplyToggle";

const fmt = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

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
  return (
    <div className="flex gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={c.avatar} alt="" width={reply ? 32 : 40} height={reply ? 32 : 40} className="h-fit rounded-full" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <a href={`https://github.com/${c.login}`} target="_blank" rel="noopener noreferrer" className="font-bold hover:underline">
            {c.name}
          </a>
          <span className="text-sm text-meta">@{c.login}</span>
          <time className="text-sm text-meta" dateTime={c.createdAt}>
            {fmt.format(new Date(c.createdAt)).replace(/\.\s*/g, ".").replace(/\.(\d{2}:)/, " $1")}
          </time>
        </div>
        <p className="mt-1 text-[15px] leading-relaxed break-words whitespace-pre-wrap text-detail-desc">{c.body}</p>
        <div className="mt-1 flex gap-3">
          {user && <ReplyToggle slug={slug} parentId={c.id} />}
          {canDelete && (
            <form action={deleteComment}>
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="id" value={c.id} />
              <button className="text-sm text-meta hover:text-red-500">삭제</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function Comments({ slug }: { slug: string }) {
  const [user, admin] = await Promise.all([getUser(), isAdmin()]);
  const all = readComments(slug);
  const roots = all.filter((c) => !c.parentId);
  const repliesOf = (id: string) => all.filter((c) => c.parentId === id);
  const configured = await isGithubConfigured();

  return (
    <section className="mx-auto mt-20 max-w-[768px]" aria-label="댓글">
      <h2 className="text-xl font-bold">
        댓글 <span className="text-strong">{all.length}</span>
      </h2>

      <div className="mt-5">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user.avatar} alt="" width={24} height={24} className="rounded-full" />
              <span>
                <b className="text-foreground">{user.name}</b> (@{user.login})
              </span>
              <form action={githubLogout} className="ml-auto">
                <input type="hidden" name="slug" value={slug} />
                <button className="hover:text-foreground hover:underline">로그아웃</button>
              </form>
            </div>
            <CommentForm slug={slug} />
          </div>
        ) : configured ? (
          <a
            href={`/api/auth/github/login?returnTo=${encodeURIComponent(`/posts/${slug}`)}`}
            className="flex items-center justify-center gap-2 rounded-md bg-[#24292f] px-4 py-3 text-[15px] font-medium text-white hover:bg-black"
          >
            <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            GitHub로 로그인하고 댓글 달기
          </a>
        ) : (
          <p className="rounded-md bg-surface px-4 py-3 text-sm text-muted">
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
                <ul className="mt-5 ml-5 space-y-5 border-l border-line pl-5 sm:ml-12">
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
