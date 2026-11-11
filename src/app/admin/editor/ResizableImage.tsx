"use client";

import { useCallback, useRef, useState } from "react";
import Image from "@tiptap/extension-image";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import Spinner from "@/components/ui/common/Spinner";

type Align = "left" | "center" | "right";

const MARGIN: Record<Align, string> = {
  left: "0 auto 0 0",
  center: "0 auto",
  right: "0 0 0 auto",
};

const MIN_WIDTH = 40;

function ImageView({ node, updateAttributes, selected, deleteNode }: NodeViewProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  // 이미 받아진(캐시) 이미지는 onLoad 가 오지 않을 수 있어 연결 시점에 확인한다
  const bindImg = useCallback((img: HTMLImageElement | null) => {
    imgRef.current = img;
    if (img?.complete) setLoaded(true);
  }, []);
  const align = (node.attrs.align as Align) ?? "center";
  const width = node.attrs.width as number | null;

  const containerWidth = () =>
    imgRef.current?.closest(".ProseMirror")?.clientWidth ?? imgRef.current?.parentElement?.clientWidth ?? 768;

  const startResize = (e: React.PointerEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    const startX = e.clientX;
    const startW = imgRef.current?.offsetWidth ?? width ?? 300;
    // 오른쪽 정렬은 왼쪽으로 끌어야 커진다
    const dir = align === "right" ? -1 : align === "center" ? 2 : 1;
    const max = containerWidth();

    const move = (ev: PointerEvent) => {
      const w = Math.round(Math.min(max, Math.max(MIN_WIDTH, startW + (ev.clientX - startX) * dir)));
      updateAttributes({ width: w });
    };
    const up = () => {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", up);
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", up);
  };

  const setPercent = (p: number) => updateAttributes({ width: Math.round((containerWidth() * p) / 100) });

  const btn = (active: boolean) =>
    `rounded px-2 py-1 text-xs ${active ? "bg-white text-black" : "text-white hover:bg-white/20"}`;
  // 버튼을 눌러도 이미지 선택이 풀리지 않도록
  const keep = (e: React.MouseEvent) => e.preventDefault();

  return (
    <NodeViewWrapper className="my-4 flex" style={{ justifyContent: { left: "flex-start", center: "center", right: "flex-end" }[align] }}>
      <div className="relative inline-block max-w-full" contentEditable={false}>
        {selected && (
          <div
            onMouseDown={keep}
            className="absolute -top-10 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-md bg-neutral-800 p-1 shadow-lg"
          >
            {(["left", "center", "right"] as Align[]).map((a) => (
              <button key={a} type="button" className={btn(align === a)} onClick={() => updateAttributes({ align: a })}>
                {{ left: "왼쪽", center: "가운데", right: "오른쪽" }[a]}
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-white/30" />
            {[25, 50, 75, 100].map((p) => (
              <button key={p} type="button" className={btn(false)} onClick={() => setPercent(p)}>
                {p}%
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-white/30" />
            <button type="button" className="rounded px-2 py-1 text-xs text-red-300 hover:bg-white/20" onClick={deleteNode}>
              삭제
            </button>
          </div>
        )}
        {!loaded && (
          <span className="absolute inset-0 grid min-h-[140px] min-w-[200px] place-items-center rounded bg-thumb">
            <Spinner />
          </span>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={bindImg}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          src={node.attrs.src}
          alt={node.attrs.alt ?? ""}
          draggable={false}
          style={{ width: width ? `${width}px` : undefined, maxWidth: "100%", height: "auto", display: "block", minHeight: loaded ? undefined : 140 }}
          className={selected ? "outline-2 outline-offset-2 outline-blue-500" : ""}
        />
        {selected && (
          <>
            {width ? (
              <span className="absolute -bottom-6 left-0 text-xs text-neutral-500">{width}px</span>
            ) : null}
            <span
              onPointerDown={startResize}
              className="absolute -right-1.5 -bottom-1.5 h-3.5 w-3.5 cursor-nwse-resize rounded-sm border-2 border-white bg-blue-500"
              title="드래그해서 크기 조절"
            />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}

/** 크기(width)와 정렬(align)을 가진 이미지. HTML 로 저장해도 인라인 스타일이 남아 공개 페이지에서 그대로 보인다. */
export const ResizableImage = Image.extend({
  draggable: true,

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el: HTMLElement) => {
          const w = parseInt(el.getAttribute("width") ?? "", 10);
          return Number.isFinite(w) ? w : null;
        },
        renderHTML: (attrs: Record<string, unknown>) => (attrs.width ? { width: attrs.width } : {}),
      },
      align: {
        default: "center",
        parseHTML: (el: HTMLElement) => {
          const a = el.getAttribute("data-align");
          return a === "left" || a === "right" || a === "center" ? a : "center";
        },
        renderHTML: (attrs: Record<string, unknown>) => {
          const a = ((attrs.align as Align) ?? "center") in MARGIN ? (attrs.align as Align) : "center";
          return {
            "data-align": a,
            style: `display:block;height:auto;max-width:100%;margin:${MARGIN[a]}`,
          };
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageView);
  },
});
