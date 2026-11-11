"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TocItem } from "@/lib/toc";

// 헤더(sticky, 56px) 아래로 제목이 내려오는 기준선 — CSS scroll-margin-top 과 맞춘다
const ACTIVE_OFFSET = 96;

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <path d="M6.5 3.5H14M6.5 8H14M6.5 12.5H14" />
      <path d="M2 3h1.2v2.4M2 8.4h2l-2 2.2h2M2 12.2h2v1.6H2" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}

function TocList({ items, activeId, onGo }: { items: TocItem[]; activeId: string; onGo: (id: string) => void }) {
  return (
    <ol className="toc-list">
      {items.map((item) => (
        <li key={item.id} data-depth={item.depth}>
          <a
            href={`#${item.id}`}
            data-active={item.id === activeId ? "true" : undefined}
            aria-current={item.id === activeId ? "location" : undefined}
            onClick={(e) => {
              e.preventDefault();
              onGo(item.id);
            }}
          >
            <span className="toc-num">{item.number}</span>
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

/** 글 상단 목차 박스 + 스크롤하면 나타나는 우측 고정 목차 패널(현재 위치 강조) */
export default function PostToc({ items }: { items: TocItem[] }) {
  const inlineRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState("");
  const [inlineVisible, setInlineVisible] = useState(true);
  const [open, setOpen] = useState(false);

  const go = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    setActiveId(id);
    setOpen(false);
  }, []);

  // 현재 읽는 제목: 기준선을 지난 마지막 제목
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
    let raf = 0;
    const update = () => {
      raf = 0;
      let current = "";
      for (const el of els) {
        if (el.getBoundingClientRect().top <= ACTIVE_OFFSET) current = el.id;
        else break;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items]);

  // 상단 목차 박스가 화면에서 벗어나면 고정 버튼을 보여준다
  useEffect(() => {
    const el = inlineRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInlineVisible(entry.isIntersecting), { rootMargin: "-56px 0px 0px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const showFloating = !inlineVisible;

  return (
    <>
      <nav ref={inlineRef} className="toc-box" aria-label="목차">
        <h4 className="toc-title">
          <ListIcon /> 목차
        </h4>
        <TocList items={items} activeId={activeId} onGo={go} />
      </nav>

      {open && <div className="toc-backdrop" onClick={() => setOpen(false)} aria-hidden />}
      <div className="toc-float" data-show={showFloating || open ? "true" : undefined}>
        <button
          type="button"
          className="toc-float-btn"
          aria-label={open ? "목차 닫기" : "목차 열기"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <ListIcon />
        </button>
        <div className="toc-panel" data-open={open ? "true" : undefined} inert={!open}>
          <h4 className="toc-title">
            <ListIcon /> 목차
          </h4>
          <TocList items={items} activeId={activeId} onGo={go} />
        </div>
      </div>
    </>
  );
}
