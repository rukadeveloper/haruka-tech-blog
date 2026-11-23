import { clamp, easeOutBack, easeOutCubic, lerp, smoothstep } from "./math";
import { SLOTS } from "./languages";
import { VH } from "./scene";

// 히어로 배치 함수. 값은 .claude/rules/intro-page.md 의 "히어로 캐러셀" 절과 같다

/** 입장 길이(초) */
export const INTRO_SECONDS = 1.9;
/** 캐러셀 스프링 강성 */
export const CAROUSEL_K = 46;

export type HeroLayout = ReturnType<typeof heroLayout>;

/** 화면비에 따른 히어로 기준값. k 는 0(세로) ~ 1(가로) */
export function heroLayout(aspect: number) {
  const k = smoothstep(0.72, 1.25, aspect);
  const W = VH * aspect;
  // 로고는 병보다 넓어서, 긴 변을 병 높이의 lerp(.75,.6,k) 배 · 너비 상한의 lerp(1.05,.75,k) 배로 맞춘다
  const size = Math.min(lerp(0.38, 0.5, k) * VH * lerp(0.75, 0.6, k), lerp(0.36, 0.2, k) * W * lerp(1.05, 0.75, k));
  return {
    k,
    W,
    size,
    /** 원판 · 명세 수치의 배율 (병 기준 hc 자리) */
    hc: size / 1.2,
    bottom: lerp(-0.3, -0.35, k) * VH,
    s1: lerp(0.36, 0.15, k),
    s2: lerp(0.25, 0.104, k),
  };
}

/** 칸 i 와 캐러셀 위치 car 사이의 부호 있는 거리. 16칸 고리라 −8 ~ 8 로 감는다 */
export function slotDistance(i: number, car: number) {
  const d = i - car;
  return d - SLOTS * Math.round(d / SLOTS);
}

export type Pose = { x: number; y: number; z: number; scale: number; rotZ: number; rotY: number };

/**
 * 히어로에서 칸 하나의 자세.
 * h: 로고의 높이(긴 변 1 기준), intro: 입장 진행(0~1), t: 시간(초), idle: 유휴 흔들림 여부
 */
export function heroPose(L: HeroLayout, i: number, d: number, h: number, tilt: number, intro: number, t: number, idle: boolean): Pose {
  const a = Math.abs(d);
  const near = Math.min(a, 1);
  const far = Math.max(0, a - 1);
  const scale = L.size * (1 - 0.3 * near - 0.035 * far);

  let x = Math.sign(d) * (near * L.s1 + far * L.s2) * L.W;
  let y = L.bottom + (h * scale) / 2 + 0.05 * VH * near;
  let rotZ = tilt * smoothstep(0, 1, a);
  const rotY = -d * 0.2 + (idle ? Math.sin(0.5 * t + i) * 0.06 : 0);

  if (idle) {
    y += Math.sin(1.1 * t + 1.7 * i) * 0.035;
    rotZ += Math.sin(0.8 * t + 2.3 * i) * 0.025;
  }

  // 입장: 가운데가 먼저 솟고, 옆은 바깥에서 날아오며 기울기가 풀린다
  const p = clamp((intro - 0.06 * a) / 0.62);
  if (p < 1) {
    if (a < 0.5) {
      y -= (1 - easeOutCubic(p)) * 0.75 * VH;
    } else {
      const e = easeOutBack(p);
      const from = Math.sign(d) * 0.85 * L.W;
      x = lerp(from, x, e);
      rotZ += Math.sign(d) * 0.5 * (1 - e);
    }
  }

  return { x, y, z: -Math.min(a, 6) * 0.32, scale, rotZ, rotY };
}

/** 원판이 솟는 정도 (0 = 아래, 1 = 제자리) */
export const discRise = (intro: number) => easeOutCubic(clamp(intro / 0.7));
