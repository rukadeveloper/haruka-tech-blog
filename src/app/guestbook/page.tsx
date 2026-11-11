import { Suspense } from "react";
import { connection } from "next/server";
import { isAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { getGuestbook, type GuestbookEntry } from "@/lib/guestbook";
import { getUser, isGithubConfigured } from "@/lib/session";
import GuestbookForm from "@/components/GuestbookForm";
import Card from "@/components/ui/common/Card";
import GithubLoginLink from "@/components/ui/common/GithubLoginLink";
import UserBar from "@/components/ui/common/UserBar";
import { deleteEntry, guestbookLogout } from "./actions";

export const metadata = {
  title: "방명록",
  description: "블로그를 방문해 주셔서 감사합니다. 따뜻한 한마디를 남겨 주세요.",
};

function Entry({ e, canDelete }: { e: GuestbookEntry; canDelete: boolean }) {
  return (
    <Card as="li" pad={false} className="flex gap-3 p-4 sm:gap-4 sm:p-5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={e.avatar} alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-full bg-surface" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <a href={`https://github.com/${e.login}`} target="_blank" rel="noopener noreferrer" className="font-bold hover:underline">
            {e.name}
          </a>
          <time className="text-caption" dateTime={e.createdAt}>
            {formatDateTime(e.createdAt)}
          </time>
          {canDelete && (
            <form action={deleteEntry} className="ml-auto">
              <input type="hidden" name="id" value={e.id} />
              <button className="text-sm font-medium text-meta hover:text-danger">삭제</button>
            </form>
          )}
        </div>
        <p className="text-body-sm mt-1.5 break-words whitespace-pre-wrap text-detail-desc">{e.body}</p>
      </div>
    </Card>
  );
}

async function GuestbookContent() {
  // 로그인 상태에 따라 달라지는 화면이라 요청 시점에만 렌더링한다
  await connection();
  const [user, admin, configured] = await Promise.all([getUser(), isAdmin(), isGithubConfigured()]);

  let data: Awaited<ReturnType<typeof getGuestbook>> | null = null;
  try {
    data = await getGuestbook();
  } catch (error) {
    console.error(error);
  }

  return (
    <>
      <Card as="section" className="bg-subtle">
        {user ? (
          <div className="space-y-4">
            <UserBar user={user} logout={guestbookLogout} />
            <GuestbookForm />
          </div>
        ) : configured ? (
          <GithubLoginLink returnTo="/guestbook">GitHub로 로그인하고 방명록 남기기</GithubLoginLink>
        ) : (
          <p className="text-sm text-muted">
            GitHub 로그인이 아직 설정되지 않았습니다. <code>.env.local</code>에 GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET을 추가하세요.
          </p>
        )}
      </Card>

      {data === null ? (
        <p className="empty mt-8">방명록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
      ) : (
        <>
          <h2 className="text-heading mt-10 mb-4">
            남겨진 글 <span className="text-strong">{data.total}</span>
          </h2>
          {data.entries.length === 0 ? (
            <p className="empty">첫 방명록의 주인공이 되어 보세요.</p>
          ) : (
            <ul className="space-y-3">
              {data.entries.map((e) => (
                <Entry key={e.id} e={e} canDelete={admin || user?.id === e.authorId} />
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}

export default function GuestbookPage() {
  return (
    <div className="container-prose pb-20 sm:pb-24">
      <header className="pt-10 pb-7 sm:pt-16 sm:pb-10">
        <h1 className="text-display">방명록</h1>
        <p className="text-body mt-2 text-muted sm:mt-3 sm:text-lg">방문해 주셔서 감사합니다. 따뜻한 한마디를 남겨 주세요.</p>
      </header>
      <Suspense fallback={<div className="skeleton h-64 !rounded-2xl" />}>
        <GuestbookContent />
      </Suspense>
    </div>
  );
}
