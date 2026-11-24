"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ui/common/ThemeToggle";
import { Icon } from "./icons";

export type PanelId = "outline" | "blocks" | "settings";

export const PANELS: { id: PanelId; label: string; icon: React.ReactNode }[] = [
  { id: "outline", label: "목차", icon: <Icon.outline /> },
  { id: "blocks", label: "블록", icon: <Icon.blocks /> },
  { id: "settings", label: "설정", icon: <Icon.settings /> },
];

/**
 * 왼쪽 아이콘 레일 (lg 이상): 목차 · 블록 · 설정. 고른 항목은 진한 정사각형이고, 다시 누르면 패널을 접는다.
 * 아래에는 테마 토글과 글 관리로 나가는 링크.
 */
export default function StudioRail({ active, onSelect }: { active: PanelId | null; onSelect: (id: PanelId) => void }) {
  return (
    <nav aria-label="패널" className="hidden w-14 shrink-0 flex-col items-center gap-1 border-r border-line bg-background py-3 lg:flex">
      {PANELS.map((p) => (
        <button
          key={p.id}
          type="button"
          title={p.label}
          aria-label={p.label}
          aria-pressed={active === p.id}
          onClick={() => onSelect(p.id)}
          className="pressable grid size-10 place-items-center rounded-lg text-muted hover:bg-surface hover:text-foreground aria-pressed:bg-foreground aria-pressed:text-background"
        >
          {p.icon}
        </button>
      ))}
      <div className="mt-auto flex flex-col items-center gap-2">
        <div className="origin-center scale-[0.85]">
          <ThemeToggle />
        </div>
        <Link href="/admin" title="글 관리로" aria-label="글 관리로" className="pressable grid size-10 place-items-center rounded-lg text-muted hover:bg-surface hover:text-foreground">
          <Icon.logout />
        </Link>
      </div>
    </nav>
  );
}
