"use client";

import { useEffect, useRef } from "react";

// 수치는 모두 .claude/rules/intro-page.md 의 "점 매트릭스 손" 절과 같다. 바꾸면 그 파일도 함께 고친다

const SHEET_URL =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261030_025250_100df7b8-31fd-4614-aa4a-c1b7d5b6b273.png&w=1600&q=85";

/** 시트 안의 손 네 개 ([x, y, w, h], 시트 크기의 비율) */
const SRC = {
  LA: [0, 0.06, 0.47, 0.4],
  RA: [0.53, 0.06, 0.47, 0.4],
  LB: [0, 0.55, 0.47, 0.4],
  RB: [0.53, 0.55, 0.47, 0.4],
} as const;
type HandKey = keyof typeof SRC;

const LOOP = 20;
const LEVELS = [0, 0.26, 0.52, 0.78, 1];
const DOT = "#0d0d0d";
/** 시트 손 한 칸의 세로/가로 비율 */
const TILE_ASPECT = (0.4 * 1520) / (0.47 * 2688);

const fract = (x: number) => x - Math.floor(x);
const hash = (a: number, b: number) => fract(Math.sin(a * 127.1 + b * 311.7) * 43758.5453);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
function smooth(a: number, b: number, x: number) {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}
const mixAt = (t: number, on: number, off: number, dur: number) => smooth(on, on + dur, t) * (1 - smooth(off, off + dur, t));

declare global {
  interface Window {
    /** 녹화 도구가 시간을 직접 넘겨 그리게 하는 훅 (명세 §4.7) */
    __render?: (t: number) => void;
  }
}

/**
 * 서로를 향해 뻗는 두 손을 검은 점 매트릭스(LED 하프톤)로 매 프레임 그린다.
 * 루프와 리스너는 이펙트 정리 함수에서 멈춘다 — cacheComponents 가 화면을 숨길 때도 정리된다.
 */
export default function DotHands() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fA = document.createElement("canvas");
    const fB = document.createElement("canvas");
    const cA = fA.getContext("2d", { willReadFrequently: true })!;
    const cB = fB.getContext("2d", { willReadFrequently: true })!;

    let tiles: Record<HandKey, HTMLCanvasElement> | null = null;
    let W = 0;
    let H = 0;
    let DPR = 1;
    let step = 5;
    let rowStep = 10;
    let cols = 0;
    let rows = 0;
    let R = 2;
    let seeds = new Float32Array(0);
    let raf = 0;
    let disposed = false;

    const resize = () => {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      DPR = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      step = Math.max(5, W / 205);
      rowStep = step * 2.05;
      cols = Math.ceil(W / step);
      rows = Math.ceil(H / rowStep);
      R = step * 0.46;
      fA.width = fB.width = cols;
      fA.height = fB.height = rows;
      // 칸별 seed: 대부분 무작위, 줄마다 치우침이 있어 디졸브가 가로로 번진다
      seeds = new Float32Array(cols * rows);
      for (let j = 0; j < rows; j++)
        for (let i = 0; i < cols; i++) seeds[j * cols + i] = 0.55 * hash(i, j) + 0.45 * hash(j * 3.1, 7.7);
    };

    /** 손 하나를 필드에 그린다. 축(왼손은 왼쪽 끝, 오른손은 오른쪽 끝)을 기준으로 돌리고 키운다 */
    const drawHand = (c: CanvasRenderingContext2D, tile: HTMLCanvasElement, left: boolean, a: number) => {
      const portrait = H > W;
      const ph = left ? 0 : Math.PI;
      const hw = W * (portrait ? 0.66 : 0.53);
      const hh = hw * TILE_ASPECT;
      const cy = H * (portrait ? 0.66 : 0.54);
      const reach = (0.035 * Math.sin(a + ph) + 0.012 * Math.sin(2 * a + 1.3 + ph)) * W;
      const scale = 1 + 0.07 * Math.sin(a + 0.9 + ph);
      const rot = (left ? 1 : -1) * 0.045 * Math.sin(a + 2.1 + ph);
      const x = left ? reach - W * 0.045 : W - hw + W * 0.045 - reach;
      const px = left ? 0 : W;

      c.setTransform(cols / W, 0, 0, rows / H, 0, 0);
      c.translate(px, cy);
      c.rotate(rot);
      c.scale(scale, scale);
      c.translate(-px, -cy);
      c.drawImage(tile, x, cy - hh / 2, hw, hh);
    };

    const fillField = (c: CanvasRenderingContext2D, left: HandKey, right: HandKey, a: number) => {
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.fillStyle = "#fff";
      c.fillRect(0, 0, cols, rows);
      drawHand(c, tiles![left], true, a);
      drawHand(c, tiles![right], false, a);
      return c.getImageData(0, 0, cols, rows).data;
    };

    const render = (time: number) => {
      if (!tiles || !cols || !rows) return;
      const t = ((time % LOOP) + LOOP) % LOOP;
      const a = (2 * Math.PI * t) / LOOP;
      const dA = fillField(cA, "LA", "RA", a);
      const dB = fillField(cB, "LB", "RB", a);

      const portrait = H > W;
      const qx = portrait ? 0.44 : 0.2;
      const qy = portrait ? 0.33 : 0.385;
      const mL = mixAt(t, 6.2, 14.6, 1.6);
      const mR = mixAt(t, 2.4, 10.4, 1.6);
      const tick = Math.floor(t * 7);
      const half = cols / 2;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.fillStyle = DOT;
      ctx.beginPath();

      for (let j = 0; j < rows; j++) {
        // 줄 글리치: 몇몇 줄이 한 박자 동안 옆으로 밀린다
        const shift = hash(j, tick) > 0.965 ? Math.round((hash(tick, j) - 0.5) * 8) : 0;
        const cyDot = (j + 0.5) * rowStep;
        const ey = (cyDot / H - qy) / 0.085;

        for (let i = 0; i < cols; i++) {
          const seed = seeds[j * cols + i];
          const m = i < half ? mL : mR;
          const useB = seed < m;
          const si = Math.min(cols - 1, Math.max(0, i - shift));
          const lum = (useB ? dB : dA)[(j * cols + si) * 4] / 255;

          let v = clamp01((1 - lum - 0.16) / 0.42);
          if (v <= 0) continue;

          // 바뀌는 중인 앞선: 가늘어지고 깜빡인다
          if (m > 0.001 && m < 0.999) {
            const gap = Math.abs(seed - m);
            if (gap < 0.12) {
              v *= gap / 0.12;
              if (hash(i + tick, j) <= 0.4) v *= 0.3;
            }
          }

          v *= 0.86 + 0.14 * Math.sin(t * 3.2 + seed * 40);
          const cx = Math.abs((i + 0.5) / cols - 0.5);
          v *= smooth(0.035, 0.11, cx); // 손가락 끝이 닿기 전에 사라진다
          v *= smooth(0.85, 1.25, Math.hypot(cx / qx, ey)); // 문구 뒤는 비운다

          let level = 0;
          for (let k = LEVELS.length - 1; k > 0; k--) {
            if (v >= LEVELS[k] - 0.13) {
              level = k;
              break;
            }
          }
          if (!level) continue;

          const r = R * (level === 1 ? 0.38 : LEVELS[level]);
          const x = (i + 0.5) * step;
          ctx.moveTo(x + r, cyDot);
          ctx.arc(x, cyDot, r, 0, Math.PI * 2);
        }
      }
      ctx.fill();
    };
    window.__render = render;

    const onResize = () => {
      resize();
      if (reduced) render(0);
    };
    resize();
    window.addEventListener("resize", onResize);

    // 시트를 받아 손마다 너비 420px 타일로 미리 줄여 둔다
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => {
      if (disposed) return;
      const made = {} as Record<HandKey, HTMLCanvasElement>;
      for (const key of Object.keys(SRC) as HandKey[]) {
        const [sx, sy, sw, sh] = SRC[key];
        const w = 420;
        const h = Math.round((w * (sh * img.naturalHeight)) / (sw * img.naturalWidth));
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const g = c.getContext("2d")!;
        g.imageSmoothingQuality = "high";
        g.drawImage(img, sx * img.naturalWidth, sy * img.naturalHeight, sw * img.naturalWidth, sh * img.naturalHeight, 0, 0, w, h);
        made[key] = c;
      }
      tiles = made;

      if (reduced) {
        render(0);
        return;
      }
      const t0 = performance.now();
      const loop = (now: number) => {
        render((now - t0) / 1000);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    };
    img.onerror = () => console.error("[intro] 손 시트 이미지를 불러오지 못했습니다");
    img.src = SHEET_URL;

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      img.onload = img.onerror = null;
      if (window.__render === render) delete window.__render;
    };
  }, []);

  return <canvas ref={canvasRef} className="intro-dots" aria-hidden />;
}
