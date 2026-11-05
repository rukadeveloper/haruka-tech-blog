import { Suspense } from "react";
import { connection } from "next/server";
import { isAdmin } from "@/lib/auth";
import { readGuestbook, type GuestbookEntry } from "@/lib/guestbook";
import { getUser, isGithubConfigured } from "@/lib/session";
import GuestbookForm from "@/components/GuestbookForm";
import { deleteEntry, guestbookLogout } from "./actions";

export const metadata = {
  title: "방명록",
  description: "블로그를 방문해 주셔서 감사합니다. 따뜻한 한마디를 남겨 주세요.",
};

const fmt = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const formatDate = (iso: string) => fmt.format(new Date(iso)).replace(/\.\s*/g, ".").replace(/\.(\d{2}:)/, " $1");

function Entry({ e, canDelete }: { e: GuestbookEntry; canDelete: boolean }) {
  return (
    <li className="flex gap-3 rounded-2xl border border-line bg-background p-4 sm:gap-4 sm:p-5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={e.avatar} alt="" width={44} height={44} className="h-11 w-11 shrink-0 rounded-full bg-surface" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <a href={`https://github.com/${e.login}`} target="_blank" rel="noopener noreferrer" className="font-bold hover:underline">
            {e.name}
          </a>
          <span className="text-sm text-meta">@{e.login}</span>
          <time className="text-sm text-meta" dateTime={e.createdAt}>
            {formatDate(e.createdAt)}
          </time>
          {canDelete && (
            <form action={deleteEntry} className="ml-auto">
              <input type="hidden" name="id" value={e.id} />
              <button className="text-sm text-meta hover:text-red-500">삭제</button>
            </form>
          )}
        </div>
        <p className="mt-1.5 text-[15px] leading-relaxed break-words whitespace-pre-wrap text-detail-desc">{e.body}</p>
      </div>
    </li>
  );
}

async function GuestbookContent() {
  // 로그인 상태에 따라 달라지는 화면이라 요청 시점에만 렌더링한다
  await connection();
  const [user, admin, configured] = await Promise.all([getUser(), isAdmin(), isGithubConfigured()]);

  let data: Awaited<ReturnType<typeof readGuestbook>> | null = null;
  try {
    data = await readGuestbook();
  } catch (error) {
    console.error(error);
  }

  return (
    <>
      <section className="rounded-2xl border border-line bg-surface/50 p-5 sm:p-6">
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user.avatar} alt="" width={24} height={24} className="rounded-full" />
              <span>
                <b className="text-foreground">{user.name}</b> (@{user.login})
              </span>
              <form action={guestbookLogout} className="ml-auto">
                <button className="hover:text-foreground hover:underline">로그아웃</button>
              </form>
            </div>
            <GuestbookForm />
          </div>
        ) : configured ? (
          <a
            href={`/api/auth/github/login?returnTo=${encodeURIComponent("/guestbook")}`}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#24292f] px-4 py-3 text-[15px] font-medium text-white hover:bg-black"
          >
            <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            GitHub로 로그인하고 방명록 남기기
          </a>
        ) : (
          <p className="text-sm text-muted">
            GitHub 로그인이 아직 설정되지 않았습니다. <code>.env</code>에 GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET을 추가하세요.
          </p>
        )}
      </section>

      {data === null ? (
        <p className="mt-10 rounded-2xl border border-dashed border-line py-12 text-center text-sm text-meta">
          방명록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
      ) : (
        <>
          <h2 className="mt-10 mb-4 text-lg font-bold">
            남겨진 글 <span className="text-strong">{data.total}</span>
          </h2>
          {data.entries.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line py-14 text-center text-meta">첫 방명록의 주인공이 되어 보세요.</p>
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
    <div className="mx-auto max-w-[768px] pt-12 pb-24 sm:pt-20">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">방명록</h1>
        <p className="mt-4 text-lg text-muted">방문해 주셔서 감사합니다. 따뜻한 한마디를 남겨 주세요.</p>
      </header>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-surface/60" />}>
        <GuestbookContent />
      </Suspense>
    </div>
  );
}
