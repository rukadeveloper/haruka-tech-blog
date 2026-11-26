"use client";

import { useEffect, useRef, useState } from "react";
import PostArticleBody from "@/components/ui/post/PostArticleBody";
import Spinner from "@/components/ui/common/Spinner";
import { previewHtml } from "@/app/(site)/admin/actions";
import { Icon } from "./icons";

/** 미리보기 시트 폭 — 공개 글의 읽는 폭(.container-prose)과 같다 */
const SHEET = 768;
const SHEET_PAD = 48;
const ZOOMS = [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.25, 1.5];

type Props = { html: string; title: string; category: string; date: string; thumbnail: string };

/** 본문이 비었는지 (Tiptap 의 빈 문서는 <p></p>) */
const isEmpty = (html: string) => !html.replace(/<p><\/p>|<p><br><\/p>|\s/g, "");

/**
 * 실시간 미리보기: 본문이 바뀌면 800ms 뒤 previewHtml(서버, 코드 하이라이팅 포함)로 그린다.
 * 768px 시트를 영역 폭에 맞춰 줄여(zoom) 보여 주고, 맞춤 · + · − 로 크기를 바꾼다.
 */
export default function StudioPreview({ html, title, category, date, thumbnail }: Props) {
  const [rendered, setRendered] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState<number | null>(null); // null = 맞춤
  const [fit, setFit] = useState(1);
  const boxRef = useRef<HTMLDivElement>(null);
  const seq = useRef(0);

  // 마지막 요청의 결과만 반영한다 (느린 앞 요청이 새 결과를 덮지 않도록)
  useEffect(() => {
    if (isEmpty(html)) return;
    const id = ++seq.current;
    const t = setTimeout(async () => {
      setBusy(true);
      try {
        const out = await previewHtml(html);
        if (id === seq.current) {
          setRendered(out);
          setFailed(false);
        }
      } catch {
        if (id === seq.current) setFailed(true);
      } finally {
        if (id === seq.current) setBusy(false);
      }
    }, 800);
    return () => clearTimeout(t);
  }, [html]);

  // 영역 폭이 바뀌면 맞춤 배율을 다시 잰다
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setFit(Math.min(1, (entry.contentRect.width - SHEET_PAD) / SHEET)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = Math.max(0.3, zoom ?? fit);
  const step = (dir: 1 | -1) => {
    const now = zoom ?? fit;
    const next = dir > 0 ? ZOOMS.find((z) => z > now + 0.001) : [...ZOOMS].reverse().find((z) => z < now - 0.001);
    if (next) setZoom(next);
  };
  const empty = isEmpty(html);

  return (
    <div className="relative h-full bg-subtle">
      <div ref={boxRef} className="absolute inset-0 overflow-auto px-6 pt-6 pb-24">
        {/* zoom 은 배치까지 함께 줄여 아래 빈 공간이 생기지 않는다. 미리보기 안의 링크 · 목차는 누르지 못하게 inert */}
        <div
          inert
          style={{ zoom: scale, width: SHEET }}
          className="mx-auto overflow-hidden rounded-[20px] border border-line bg-elevated shadow-card"
        >
          {thumbnail && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbnail} alt="" className="aspect-[16/9] w-full border-b border-line object-cover" />
          )}
          <div className="px-8 pt-10 pb-14">
            {empty || rendered === null ? (
              <>
                <header className="border-b border-line pb-6">
                  {category && <span className="badge badge-primary">{category.split("/").join(" · ")}</span>}
                  <h1 className="text-display mt-3">{title || <span className="text-meta">(제목 없음)</span>}</h1>
                  <span className="text-caption mt-3 block">{date.replaceAll("-", ".")}</span>
                </header>
                <div className="mt-8 space-y-3" aria-hidden>
                  {[100, 92, 96, 60, 0, 88, 94, 70].map((w, i) =>
                    w ? <div key={i} className="skeleton h-4" style={{ width: `${w}%` }} /> : <div key={i} className="h-3" />,
                  )}
                </div>
                {!empty && <p className="mt-6 text-center text-xs text-meta">미리보기를 만드는 중…</p>}
              </>
            ) : (
              <PostArticleBody title={title} category={category} date={date} html={rendered} />
            )}
          </div>
        </div>
      </div>

      {(busy || failed) && (
        <span className="absolute top-3 right-4 inline-flex items-center gap-1.5 rounded-full bg-elevated px-2.5 py-1 text-xs text-muted shadow-card">
          {busy ? <Spinner className="h-3.5 w-3.5 border-2" /> : null}
          {busy ? "갱신 중" : <span className="text-danger">미리보기 실패</span>}
        </span>
      )}

      <div className="absolute bottom-4 left-4 flex items-center gap-0.5 rounded-xl border border-line bg-elevated p-1 shadow-card">
        <button type="button" onClick={() => setZoom(null)} aria-pressed={zoom === null} title="화면에 맞춤" aria-label="화면에 맞춤" className="icon-btn size-8! aria-pressed:bg-surface aria-pressed:text-foreground">
          <Icon.fit />
        </button>
        <button type="button" onClick={() => step(1)} title="크게" aria-label="크게" className="icon-btn size-8!">
          <Icon.plus />
        </button>
        <button type="button" onClick={() => step(-1)} title="작게" aria-label="작게" className="icon-btn size-8!">
          <Icon.minus />
        </button>
        <span className="w-11 text-center text-xs text-meta tabular-nums" aria-live="polite">
          {Math.round(scale * 100)}%
        </span>
      </div>
    </div>
  );
}
