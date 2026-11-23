/** 장면 계산에 쓰는 작은 수학 함수들 (명세의 이름 그대로) */

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function smoothstep(e0: number, e1: number, x: number) {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
}

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** easeOutBack. overshoot 1.15 는 명세 값 */
export function easeOutBack(t: number, s = 1.15) {
  const c3 = s + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
}

/** 프레임 길이와 상관없이 같은 비율로 따라가는 지수 감쇠 (exp(−rate·dt)) */
export const damp = (current: number, target: number, rate: number, dt: number) =>
  lerp(target, current, Math.exp(-rate * dt));

/**
 * 임계 감쇠 스프링 한 프레임. 240Hz 로 잘게 나눠 적분하므로 프레임이 튀어도 넘치지 않는다.
 * k 는 강성(ω²), 감쇠는 2√k.
 */
export function springStep(state: { x: number; v: number }, target: number, k: number, dt: number) {
  const steps = Math.max(1, Math.ceil(dt * 240));
  const h = dt / steps;
  const c = 2 * Math.sqrt(k);
  for (let i = 0; i < steps; i++) {
    const a = k * (target - state.x) - c * state.v;
    state.v += a * h;
    state.x += state.v * h;
  }
}
