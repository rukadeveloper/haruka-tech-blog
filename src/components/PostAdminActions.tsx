import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { deletePost } from "@/app/admin/actions";
import ConfirmDeleteButton from "@/app/admin/ConfirmDeleteButton";

/** 글 작성자(관리자)에게만 보이는 수정·삭제 버튼. 서버 액션도 requireAdmin 으로 한 번 더 막는다. */
export default async function PostAdminActions({ slug, title }: { slug: string; title: string }) {
  if (!(await isAdmin())) return null;
  return (
    <div className="mx-auto mb-6 flex max-w-[768px] justify-end gap-3 text-sm">
      <Link href={`/admin/posts/${slug}/edit`} className="rounded-md bg-surface px-3 py-1.5 font-medium hover:text-strong">
        수정
      </Link>
      <form action={deletePost}>
        <input type="hidden" name="slug" value={slug} />
        <ConfirmDeleteButton target={title} className="rounded-md bg-surface px-3 py-1.5 font-medium text-red-500 hover:bg-red-500/10" />
      </form>
    </div>
  );
}
