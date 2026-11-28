/**
 * 블로그 로고(src/app/icon.svg)의 점 H 를 단색(currentColor)으로 그린 마크. 인트로 내비와 블로그 헤더가 함께 쓴다.
 * 16×16 칸 격자(한 칸 4)의 칸 [열, 행, 반지름]. 좌표 규칙은 docs/design "로고" — icon.svg 의 점 배치를 바꾸면 여기도 함께 고친다.
 */
const BRAND_DOTS: [number, number, number][] = [
  // 기둥: 열 3 · 4 · 9 · 10, 행 4–11
  ...[3, 4, 9, 10].flatMap((c) => [4, 5, 6, 7, 8, 9, 10, 11].map((r): [number, number, number] => [c, r, 1.7])),
  // 가로획(열 5–8) + 지평선(열 11–13, 오른쪽으로 갈수록 작아진다), 행 7 · 8
  ...[7, 8].flatMap((r) =>
    [
      [5, 1.7],
      [6, 1.7],
      [7, 1.7],
      [8, 1.7],
      [11, 1.4],
      [12, 1.05],
      [13, 0.7],
    ].map(([c, rad]): [number, number, number] => [c, r, rad]),
  ),
];

export default function BrandMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="10 14 46 36" fill="currentColor" aria-hidden>
      {BRAND_DOTS.map(([c, r, rad]) => (
        <circle key={`${c}-${r}`} cx={c * 4 + 2} cy={r * 4 + 2} r={rad} />
      ))}
    </svg>
  );
}
