"use client";

import { useEffect, useRef, useState } from "react";

const DAY_MS = 86_400_000;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

type Props = {
  /** 도착할 값. since 가 있으면 쓰지 않는다 */
  target?: number;
  /** 이 날짜(YYYY-MM-DD)부터 오늘까지의 날 수를 도착 값으로 쓴다. 화면이 캐시돼 있어도 오늘 기준이 되도록 브라우저에서 센다 */
  since?: string;
  suffix?: string;
  decimals?: number;
  /** 몇 번째 통계인지 — 뒤로 갈수록 조금 늦게 시작해 조금 더 오래 센다 */
  index: number;
  className?: string;
};

/** 화면에 들어오면 0 에서 도착 값까지 한 번만 세어 올린다 */
export default function CountUp({ target = 0, since, suffix = "", decimals = 0, index, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let timer = 0;
    let frame = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const end = since ? Math.max(0, Math.floor((Date.now() - Date.parse(since)) / DAY_MS)) : target;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setValue(end);
          return;
        }

        const duration = 1500 + index * 80;
        timer = window.setTimeout(() => {
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min(1, (now - start) / duration);
            setValue(end * easeOutCubic(progress));
            if (progress < 1) frame = requestAnimationFrame(tick);
          };
          frame = requestAnimationFrame(tick);
        }, 480 + index * 90);
      },
      { threshold: 0.25 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [target, since, index]);

  return (
    <span ref={ref} className={className}>
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}
