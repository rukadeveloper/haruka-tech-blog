import { requireAdmin } from "@/lib/auth";
import { loadCategories } from "@/lib/categories";
import { loadPostMetas, inCategory } from "@/lib/posts";
import { addCategory, deleteCategory, renameCategory } from "../actions";
import ConfirmDeleteButton from "../ConfirmDeleteButton";

const input = "rounded border border-black/20 bg-transparent px-2 py-1 text-sm dark:border-white/20";

function Row({ path, label, count, sub }: { path: string; label: string; count: number; sub?: boolean }) {
  return (
    <li className={`flex flex-wrap items-center gap-2 py-1.5 ${sub ? "ml-6" : "font-medium"}`}>
      <span className="min-w-32">{label}</span>
      <span className="text-sm opacity-50">{count}개</span>
      <form action={renameCategory} className="ml-auto flex gap-1">
        <input type="hidden" name="category" value={path} />
        <input name="newName" placeholder="새 이름" required className={input} />
        <button className="text-sm hover:underline">이름 변경</button>
      </form>
      <form action={deleteCategory}>
        <input type="hidden" name="category" value={path} />
        <ConfirmDeleteButton target={label} className="text-sm text-red-500 hover:underline" />
      </form>
    </li>
  );
}

export default async function CategoriesPage() {
  await requireAdmin();
  const categories = await loadCategories();
  const posts = await loadPostMetas();
  const count = (c: string) => posts.filter((p) => inCategory(p, c)).length;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">카테고리 관리</h1>
      <ul className="divide-y divide-black/5 dark:divide-white/5">
        {categories.flatMap((c) => [
          <Row key={c.name} path={c.name} label={c.name} count={count(c.name)} />,
          ...c.children.map((s) => (
            <Row key={`${c.name}/${s}`} path={`${c.name}/${s}`} label={s} count={count(`${c.name}/${s}`)} sub />
          )),
        ])}
      </ul>
      <form action={addCategory} className="flex flex-wrap items-end gap-2">
        <label className="space-y-1 text-sm">
          <span className="block font-medium">상위 카테고리</span>
          <select name="parent" className={input}>
            <option value="">(대분류로 추가)</option>
            {categories.map((c) => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="block font-medium">이름</span>
          <input name="name" required className={input} />
        </label>
        <button className="rounded bg-foreground px-3 py-1.5 text-sm text-background">추가</button>
      </form>
    </div>
  );
}
