import Link from "next/link";
import ConfirmDeleteButton from "@/components/ui/common/ConfirmDeleteButton";
import { deletePost } from "./actions";

const ghost = "btn btn-sm btn-ghost";

/** 글 하나의 작업 버튼: 미리보기 · 수정 · 삭제. 그리드 카드와 리스트 행이 함께 쓴다 */
export default function PostActions({ slug, title, className = "" }: { slug: string; title: string; className?: string }) {
  return (
    <div className={`flex shrink-0 items-center gap-0.5 ${className}`}>
      <Link href={`/admin/posts/${slug}/preview`} className={ghost}>
        미리보기
      </Link>
      <Link href={`/admin/posts/${slug}/edit`} className={ghost}>
        수정
      </Link>
      <form action={deletePost}>
        <input type="hidden" name="slug" value={slug} />
        <ConfirmDeleteButton target={title} />
      </form>
    </div>
  );
}
