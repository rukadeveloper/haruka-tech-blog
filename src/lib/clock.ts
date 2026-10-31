/**
 * 쿠키 만료 비교용 현재 시각(ms).
 * cacheComponents 에서는 Date.now() 가 prerender 중 "불안정한 값"으로 막히므로,
 * 같은 시각을 주는 performance 타이머를 쓴다.
 */
export const nowMs = () => performance.timeOrigin + performance.now();
