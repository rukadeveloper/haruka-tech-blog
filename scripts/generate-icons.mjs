// 로고 원본(src/app/icon.svg)에서 파비콘과 애플 아이콘을 만든다. 모양 규칙은 DESIGN.md "로고".
//   src/app/favicon.ico     16 · 32 · 48px PNG 를 묶은 ICO (모서리는 SVG 그대로 투명)
//   src/app/apple-icon.png  180px, 모서리까지 바탕색으로 채운다 (iOS 가 직접 둥글린다. 투명하면 검게 나온다)
// 사용: npm run icons
import fs from "node:fs";
import sharp from "sharp";

const SOURCE = "src/app/icon.svg";
const VIEW_BOX = 64;
const ICO_SIZES = [16, 32, 48];
const APPLE_SIZE = 180;

const svg = fs.readFileSync(SOURCE);

// 바탕색은 SVG 의 첫 사각형에서 읽는다 (색을 두 곳에 적지 않기 위해)
const background = svg.toString().match(/<rect[^>]*\sfill="(#[0-9a-fA-F]{3,8})"/)?.[1];
if (!background) throw new Error(`${SOURCE} 에서 바탕 사각형의 fill 을 찾지 못했습니다.`);

/** SVG 를 처음부터 그 크기로 그린다 (크게 그려 줄이면 16px 에서 획이 번진다) */
const render = (size) => sharp(svg, { density: (72 * size) / VIEW_BOX }).resize(size, size);

/** PNG 여러 장을 ICO 하나로 묶는다. 헤더 6바이트 + 장마다 목록 16바이트, 그 뒤에 PNG 를 그대로 붙인다 */
function toIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2); // 종류: 아이콘
  header.writeUInt16LE(images.length, 4);

  let offset = header.length + images.length * 16;
  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size % 256, 0); // 너비 (256 은 0 으로 적는다)
    entry.writeUInt8(size % 256, 1); // 높이
    entry.writeUInt16LE(1, 4); // 색 평면
    entry.writeUInt16LE(32, 6); // 픽셀당 비트
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.png)]);
}

const icoImages = await Promise.all(ICO_SIZES.map(async (size) => ({ size, png: await render(size).png().toBuffer() })));
fs.writeFileSync("src/app/favicon.ico", toIco(icoImages));

await render(APPLE_SIZE).flatten({ background }).png().toFile("src/app/apple-icon.png");

console.log(`favicon.ico (${ICO_SIZES.join(" · ")}px), apple-icon.png (${APPLE_SIZE}px) 를 ${SOURCE} 에서 만들었습니다.`);
