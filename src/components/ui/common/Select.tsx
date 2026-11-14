"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type SelectOption = { value: string; label: string; tone?: "danger" };

type Props = {
  options: SelectOption[];
  /** 넘기면 제어 컴포넌트로 동작한다. 목록에 없는 값이면 placeholder 를 보여준다 */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** form 과 함께 제출할 때의 필드 이름 */
  name?: string;
  placeholder?: string;
  title?: string;
  "aria-label"?: string;
  /** 여는 버튼의 클래스 (기본은 .field) */
  className?: string;
  /** 누를 때 포커스를 가져오지 않는다 — 에디터 툴바처럼 본문 선택을 유지해야 하는 곳 */
  keepFocus?: boolean;
};

type Pos = { left: number; top?: number; bottom?: number; minWidth: number; maxWidth: number; maxHeight: number };

const GAP = 6; // 버튼과 목록 사이
const EDGE = 8; // 화면 가장자리 여백
const MAX_HEIGHT = 320;

// 목록은 body 로 내보내 fixed 로 띄운다 — 가로 스크롤 줄(.scroll-row)이나 overflow-hidden 카드 안에서도 잘리지 않도록
function measure(el: HTMLElement): Pos {
  const r = el.getBoundingClientRect();
  const below = window.innerHeight - r.bottom - GAP - EDGE;
  const above = r.top - GAP - EDGE;
  const up = below < 180 && above > below;
  const minWidth = Math.min(Math.max(r.width, 160), window.innerWidth - EDGE * 2);
  const left = Math.max(EDGE, Math.min(r.left, window.innerWidth - EDGE - minWidth));
  return {
    left,
    minWidth,
    maxWidth: window.innerWidth - left - EDGE,
    maxHeight: Math.max(120, Math.min(MAX_HEIGHT, up ? above : below)),
    ...(up ? { bottom: window.innerHeight - r.top + GAP } : { top: r.bottom + GAP }),
  };
}

/** 기본 select 대신 쓰는 드롭다운. name 을 주면 숨은 input 으로 form 에 값이 실린다. */
export default function Select({
  options,
  value,
  defaultValue = "",
  onChange,
  name,
  placeholder = "선택",
  title,
  "aria-label": ariaLabel,
  className = "field",
  keepFocus,
}: Props) {
  const [inner, setInner] = useState(defaultValue);
  const current = value ?? inner;
  const selected = options.find((o) => o.value === current);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<Pos | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !listRef.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    // 페이지가 스크롤되거나 크기가 바뀌면 버튼을 따라간다
    const replace = () => {
      if (triggerRef.current) setPos(measure(triggerRef.current));
    };
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", replace, true);
    window.addEventListener("resize", replace);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", replace, true);
      window.removeEventListener("resize", replace);
    };
  }, [open]);

  // 키보드로 옮긴 항목이 목록 안에서 보이도록
  useEffect(() => {
    if (open) document.getElementById(`${id}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, id]);

  const toggle = () => {
    if (open) return setOpen(false);
    if (!triggerRef.current) return;
    setPos(measure(triggerRef.current));
    setActive(Math.max(0, options.findIndex((o) => o.value === current)));
    setOpen(true);
  };

  const pick = (o: SelectOption) => {
    if (value === undefined) setInner(o.value);
    onChange?.(o.value);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const n = options.length;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        toggle();
      }
      return;
    }
    if (e.key === "Tab") return setOpen(false);
    if (!["ArrowDown", "ArrowUp", "Home", "End", "Enter", " "].includes(e.key)) return;
    e.preventDefault();
    if (e.key === "ArrowDown") setActive((i) => (i + 1) % n);
    else if (e.key === "ArrowUp") setActive((i) => (i - 1 + n) % n);
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(n - 1);
    else if (options[active]) pick(options[active]);
  };

  return (
    <>
      {name && <input type="hidden" name={name} value={current} />}
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        aria-label={ariaLabel}
        title={title}
        onMouseDown={keepFocus ? (e) => e.preventDefault() : undefined}
        onClick={toggle}
        onKeyDown={onKeyDown}
        className={`inline-flex cursor-pointer items-center justify-between gap-1.5 text-left whitespace-nowrap ${className}`}
      >
        <span className={`truncate ${selected ? "" : "text-meta"}`}>{selected?.label ?? placeholder}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={`shrink-0 opacity-60 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={listRef}
            id={`${id}-list`}
            role="listbox"
            aria-label={ariaLabel}
            style={pos}
            // 위로 열렸으면 아래쪽(버튼 쪽) 모서리에서 펼쳐진다
            data-up={pos.bottom !== undefined ? "true" : undefined}
            // 항목을 눌러도 버튼(또는 에디터)의 포커스가 유지되도록
            onMouseDown={(e) => e.preventDefault()}
            className="select-pop glass-thick fixed z-[70] overflow-y-auto rounded-xl p-1 text-foreground"
          >
            {options.map((o, i) => {
              const isSelected = o.value === current;
              return (
                <div
                  key={o.value}
                  id={`${id}-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(o)}
                  className={`flex min-h-9 cursor-pointer items-center gap-3 rounded-lg px-3 py-1.5 text-sm ${i === active ? "bg-surface" : ""} ${
                    o.tone === "danger" ? "text-danger" : isSelected ? "font-semibold text-strong" : ""
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">{o.label}</span>
                  {isSelected && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
                      <path d="M5 12l5 5 9-10" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}
