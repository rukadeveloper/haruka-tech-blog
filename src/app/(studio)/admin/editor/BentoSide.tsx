"use client";

import type { Editor } from "@tiptap/react";
import Select from "@/components/ui/common/Select";
import OutlinePanel from "./panels/OutlinePanel";
import type { Check, CheckId, CheckStatus } from "./checklist";

const STATUS: Record<CheckStatus, { text: string; mark: string; className: string }> = {
  pass: { text: "통과", mark: "✓", className: "bg-success-soft text-success" },
  warn: { text: "주의", mark: "!", className: "bg-warning-soft text-foreground" },
  fail: { text: "필요", mark: "✕", className: "bg-danger-soft text-danger" },
};

/** 상태 알약 — 색만으로 구분하지 않도록 기호와 글자를 함께 쓴다 */
export function StatusPill({ status }: { status: CheckStatus }) {
  const s = STATUS[status];
  return (
    <span className={`inline-flex h-6 shrink-0 items-center gap-1 rounded-full px-2.5 text-xs font-bold ${s.className}`}>
      <span aria-hidden>{s.mark}</span>
      {s.text}
    </span>
  );
}

function Card({ title, aside, span2, children, className = "" }: { title: string; aside?: React.ReactNode; span2?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-[20px] bg-elevated p-5 ${span2 ? "col-span-2" : ""} ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[15px] font-bold">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Stat({ title, value, unit }: { title: string; value: string; unit: string }) {
  return (
    <section className="rounded-[20px] bg-elevated p-5">
      <h2 className="text-[13px] font-semibold text-meta">{title}</h2>
      <p className="mt-2 flex items-baseline gap-1">
        <span className="font-grotesk text-[40px] leading-none font-bold tracking-tight tabular-nums">{value}</span>
        <span className="text-sm text-meta">{unit}</span>
      </p>
    </section>
  );
}

type Props = {
  editor: Editor | null;
  checks: Check[];
  onCheck: (id: CheckId) => void;
  chars: number;
  mix: { paragraphs: number; code: number; images: number };
  savedAt?: string;
  categories: string[];
  category: string;
  setCategory: (v: string) => void;
  date: string;
  setDate: (v: string) => void;
  initial: { slug: string; featured: boolean };
};

/**
 * 사이드 열 (360px, 2열 벤토 그리드): 발행 전 체크 · 글자 수 · 읽는 시간 · 카테고리 · 목차 · 블록 구성 · 마지막 저장 · URL.
 * 입력(카테고리 · 슬러그 · 날짜 · 추천)은 폼에 실리도록 항상 그려 둔다.
 */
export default function BentoSide(p: Props) {
  const passed = p.checks.filter((c) => c.status === "pass").length;
  const minutes = p.chars === 0 ? 0 : Math.max(1, Math.ceil(p.chars / 500));

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card
        span2
        title="발행 전 체크"
        aside={
          <span className="font-grotesk text-sm font-bold tabular-nums" aria-label={`4개 중 ${passed}개 통과`}>
            {passed}
            <span className="text-meta">/{p.checks.length}</span>
          </span>
        }
      >
        {/* 항목마다 한 칸 — 통과한 만큼 포인트색으로 찬다 */}
        <div className="mb-3 grid grid-cols-4 gap-1" aria-hidden>
          {p.checks.map((c) => (
            <span key={c.id} className={`h-1.5 rounded-full ${c.status === "pass" ? "bg-strong" : c.status === "warn" ? "bg-warning-soft" : "bg-surface"}`} />
          ))}
        </div>
        <ul className="-mx-2 space-y-0.5">
          {p.checks.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => p.onCheck(c.id)}
                className="pressable flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-surface"
                title={c.status === "pass" ? c.label : `${c.label} — 눌러서 고치기`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{c.label}</span>
                  <span className="block truncate text-[13px] text-meta">{c.detail}</span>
                </span>
                <StatusPill status={c.status} />
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Stat title="글자 수" value={p.chars.toLocaleString()} unit="자" />
      <Stat title="읽는 시간" value={String(minutes)} unit="분" />

      <Card span2 title="카테고리">
        <Select
          name="category"
          aria-label="카테고리"
          value={p.category}
          onChange={p.setCategory}
          options={[{ value: "", label: "카테고리 없음" }, ...p.categories.map((c) => ({ value: c, label: c.split("/").join(" › ") }))]}
          className="field"
        />
      </Card>

      <Card span2 title="목차">
        <div className="-mx-2 max-h-64 overflow-y-auto [scrollbar-width:thin]">{p.editor && <OutlinePanel editor={p.editor} />}</div>
      </Card>

      <section className="rounded-[20px] bg-elevated p-5">
        <h2 className="text-[13px] font-semibold text-meta">블록 구성</h2>
        <dl className="mt-2 space-y-1 text-sm">
          {[
            ["문단", p.mix.paragraphs],
            ["코드", p.mix.code],
            ["이미지", p.mix.images],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <dt className="text-muted">{k}</dt>
              <dd className="font-grotesk font-bold tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="rounded-[20px] bg-elevated p-5">
        <h2 className="text-[13px] font-semibold text-meta">마지막 저장</h2>
        <p className="font-grotesk mt-2 text-[28px] leading-none font-bold tabular-nums">
          {p.savedAt ? new Date(p.savedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false }) : "—"}
        </p>
        <p className="mt-1.5 text-xs text-meta">{p.savedAt ? "이번 편집에서 임시저장" : "아직 저장 안 함"}</p>
      </section>

      <Card span2 title="URL · 날짜">
        <div className="space-y-3">
          <label className="block">
            <span className="field-label">슬러그</span>
            <input name="slug" defaultValue={p.initial.slug} placeholder="비우면 자동 생성" className="field" />
          </label>
          <label className="block">
            <span className="field-label">날짜</span>
            <input type="date" name="date" value={p.date} onChange={(e) => p.setDate(e.target.value)} required className="field" />
          </label>
          <label className="flex items-center gap-2.5">
            <input type="checkbox" name="featured" defaultChecked={p.initial.featured} className="h-5 w-5 shrink-0 accent-(--strong)" />
            <span className="text-sm font-semibold">추천 글로 표시</span>
          </label>
        </div>
      </Card>
    </div>
  );
}
