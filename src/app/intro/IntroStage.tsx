"use client";

import { useEffect, useRef, useState } from "react";
import { LANGUAGES } from "./stage/languages";
import type { Stage } from "./stage";

type Title = { index: number; prev: number | null; dir: 1 | -1; n: number };

/**
 * 히어로: WebGL 캔버스 + 언어 이름 제목(세로로 굴림) + ‹ › 버튼 + 바닥 빛줄.
 * 장면은 이펙트 안에서 만들고 정리 함수에서 모두 해제한다 — cacheComponents 가 화면을 숨길 때도 정리된다.
 */
export default function IntroStage() {
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Stage | null>(null);
  const [title, setTitle] = useState<Title>({ index: 0, prev: null, dir: 1, n: 0 });

  useEffect(() => {
    const host = hostRef.current;
    const root = host?.closest<HTMLElement>(".intro-root");
    if (!host || !root) return;

    let disposed = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    /** 3D 를 못 그리는 환경에서도 제목 · 버튼 · 헤더는 보여 준다 */
    const showUi = () => root.classList.add("is-ready", "is-ui", "is-hero");

    (async () => {
      try {
        const { createStage } = await import("./stage");
        if (disposed) return;
        const stage = createStage({
          container: host,
          root,
          reduced,
          onLanguage: (index, dir) =>
            setTitle((s) => (s.index === index ? s : { index, prev: s.index, dir, n: s.n + 1 })),
          onPhase: (phase) => root.classList.add(phase === "ui" ? "is-ui" : "is-hero"),
        });
        stageRef.current = stage;
        await Promise.all([stage.ready, document.fonts.ready]);
        if (disposed) return;
        root.classList.add("is-ready");
        stage.start();
      } catch (err) {
        console.error("[intro] 3D 장면을 만들지 못했습니다", err);
        showUi();
      }
    })();

    return () => {
      disposed = true;
      stageRef.current?.dispose();
      stageRef.current = null;
      root.classList.remove("is-ready", "is-ui", "is-hero");
      root.style.removeProperty("--sc");
      root.style.removeProperty("--sg");
    };
  }, []);

  const roll = title.dir === 1 ? "up" : "down";

  return (
    <>
      <div ref={hostRef} className="intro-gl-host" />

      <section className="intro-hero" aria-label="다루는 언어">
        {/* 새 이름은 아래에서(뒤로 가면 위에서) 들어오고, 이전 이름은 반대로 빠진다 */}
        <h1 className="intro-title" aria-live="polite">
          {title.prev !== null && (
            <span key={`out-${title.n}`} className={`intro-title-line is-out-${roll}`} aria-hidden>
              {LANGUAGES[title.prev].name}
            </span>
          )}
          <span key={`in-${title.n}`} className={`intro-title-line${title.n ? ` is-in-${roll}` : ""}`}>
            {LANGUAGES[title.index].name}
          </span>
        </h1>

        <div className="intro-arrows">
          <button type="button" className="intro-arrow" aria-label="이전 언어" onClick={() => stageRef.current?.step(-1)}>
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button type="button" className="intro-arrow" aria-label="다음 언어" onClick={() => stageRef.current?.step(1)}>
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="intro-strip" aria-hidden />
      </section>
    </>
  );
}
