import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { deletePost } from "@/app/admin/actions";
import { buttonClass } from "@/components/ui/common/Button";
import ConfirmDeleteButton from "@/components/ui/common/ConfirmDeleteButton";

/** 글 작성자(관리자)에게만 보이는 수정·삭제 버튼. 서버 액션도 requireAdmin 으로 한 번 더 막는다. */
export default async function PostAdminActions({ slug, title }: { slug: string; title: string }) {
  if (!(await isAdmin())) return null;
  return (
    <div className="container-prose mb-4 flex justify-end gap-1">
      <Link href={`/admin/posts/${slug}/edit`} className={buttonClass({ variant: "secondary", size: "sm" })}>
        수정
      </Link>
      <form action={deletePost}>
        <input type="hidden" name="slug" value={slug} />
        <ConfirmDeleteButton target={title} />
      </form>
    </div>
  );
}
