import { requireAdmin } from "@/lib/auth";
import { loadCategories } from "@/lib/categories";
import { loadPostMetas, inCategory } from "@/lib/posts";
import { addCategory, deleteCategory } from "../actions";
import ConfirmDeleteButton from "@/components/ui/common/ConfirmDeleteButton";
import RenameCategory from "./RenameCategory";

// 로그인 확인과 DB 조회로 요청마다 렌더링하는 화면이라 즉시 이동(instant) 검증에서 제외
export const instant = false;

const field = "field bg-background!";

function Row({ path, label, count, sub }: { path: string; label: string; count: number; sub?: boolean }) {
  const deletable = count === 0;
  return (
    <li className={`flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 ${sub ? "pl-10" : ""}`}>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {sub && <span aria-hidden className="text-meta">└</span>}
        <span className={`truncate ${sub ? "text-sm" : "font-semibold"}`}>{label}</span>
        <span className="badge">{count}개</span>
      </div>
      <div className="flex items-center gap-0.5">
        <RenameCategory path={path} current={label} />
        {deletable ? (
          <form action={deleteCategory}>
            <input type="hidden" name="category" value={path} />
            <ConfirmDeleteButton
              target={label}
              description="이 카테고리를 삭제합니다."
            />
          </form>
        ) : (
          <span
            title="글이 있는 카테고리는 삭제할 수 없어요. 글을 먼저 다른 카테고리로 옮기세요."
            className="btn btn-sm cursor-not-allowed text-meta/60"
          >
            삭제
          </span>
        )}
      </div>
    </li>
  );
}

export default async function CategoriesPage() {
  await requireAdmin();
  const categories = await loadCategories();
  const posts = await loadPostMetas();
  const count = (c: string) => posts.filter((p) => inCategory(p, c)).length;
  const subTotal = categories.reduce((n, c) => n + c.children.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-title">카테고리 관리</h1>
        <p className="mt-1 text-sm text-muted">
          대분류 {categories.length}개 · 소분류 {subTotal}개. 글이 있는 카테고리는 삭제할 수 없습니다.
        </p>
      </div>

      {/* 모바일에서는 추가 양식이 먼저 온다 */}
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="order-2 space-y-4 lg:order-1">
          {categories.length === 0 ? (
            <p className="empty">
              아직 카테고리가 없습니다. 추가 양식에서 만들어 보세요.
            </p>
          ) : (
            categories.map((c) => (
              <section key={c.name} className="card overflow-hidden">
                <ul className="divide-y divide-line">
                  <Row path={c.name} label={c.name} count={count(c.name)} />
                  {c.children.map((s) => (
                    <Row key={s} path={`${c.name}/${s}`} label={s} count={count(`${c.name}/${s}`)} sub />
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>

        <form action={addCategory} className="card card-pad order-1 space-y-4 bg-subtle lg:sticky lg:top-20 lg:order-2">
          <h2 className="text-heading">카테고리 추가</h2>
          <label className="block">
            <span className="field-label">상위 카테고리</span>
            <select name="parent" className={field}>
              <option value="">(대분류로 추가)</option>
              {categories.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="field-label">이름</span>
            <input name="name" required maxLength={40} placeholder="예: Next.js" className={field} />
          </label>
          <button className="btn btn-primary btn-block">
            추가
          </button>
        </form>
      </div>
    </div>
  );
}
