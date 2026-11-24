"use client";

import Select from "@/components/ui/common/Select";

type Props = {
  categories: string[];
  category: string;
  setCategory: (v: string) => void;
  tags: string;
  setTags: (v: string) => void;
  date: string;
  setDate: (v: string) => void;
  initial: { slug: string; featured: boolean };
};

/**
 * 설정 패널: 카테고리 · 태그 · 슬러그 · 날짜 · 추천 표시.
 * 패널이 닫혀도 입력이 폼에 남아 제출되도록 PostStudio 가 항상 그려 두고 숨기기만 한다.
 */
export default function SettingsPanel(p: Props) {
  const tagList = p.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div className="space-y-5">
      <label className="block">
        <span className="field-label">카테고리</span>
        <Select
          name="category"
          aria-label="카테고리"
          value={p.category}
          onChange={p.setCategory}
          options={[{ value: "", label: "카테고리 없음" }, ...p.categories.map((c) => ({ value: c, label: c.split("/").join(" › ") }))]}
          className="field"
        />
      </label>

      <div>
        <label className="block">
          <span className="field-label">태그 (쉼표로 구분)</span>
          <input name="tags" value={p.tags} onChange={(e) => p.setTags(e.target.value)} placeholder="react, next.js" className="field" />
        </label>
        {tagList.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1" aria-label="태그 미리보기">
            {tagList.map((t, i) => (
              <li key={`${t}-${i}`} className="badge badge-primary">
                #{t}
              </li>
            ))}
          </ul>
        )}
      </div>

      <hr className="border-line" />

      <label className="block">
        <span className="field-label">슬러그 (URL)</span>
        <input name="slug" defaultValue={p.initial.slug} placeholder="비우면 자동 생성" className="field" />
        <span className="mt-1 block text-xs text-meta">영문 · 숫자 · - · _ 만 쓸 수 있습니다.</span>
      </label>

      <label className="block">
        <span className="field-label">날짜</span>
        <input type="date" name="date" value={p.date} onChange={(e) => p.setDate(e.target.value)} required className="field" />
      </label>

      <label className="flex items-start gap-2.5">
        <input type="checkbox" name="featured" defaultChecked={p.initial.featured} className="mt-0.5 h-5 w-5 shrink-0 accent-(--strong)" />
        <span>
          <span className="block text-sm font-semibold">추천 글로 표시</span>
          <span className="block text-xs text-meta">관리자 목록에 추천 배지가 붙습니다.</span>
        </span>
      </label>
    </div>
  );
}
