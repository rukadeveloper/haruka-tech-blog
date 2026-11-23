import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

/**
 * simple-icons 의 24×24 path 를 두께 있는 입체로 만든다.
 * 결과는 원점 가운데 정렬, 긴 변이 1 이다. size 로 실제 너비 · 높이(긴 변 1 기준)를 함께 돌려준다.
 */
export function buildLogoGeometry(path: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${path}"/></svg>`;
  const shapes = new SVGLoader().parse(svg).paths.flatMap((p) => SVGLoader.createShapes(p));

  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: 24 * 0.16,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.35,
    bevelSize: 0.22,
    bevelSegments: 3,
  });
  // SVG 는 y 가 아래로 자란다. 거울상이 되지 않도록 뒤집기(scale −1) 대신 X 축으로 반 바퀴 돌린다
  geometry.rotateX(Math.PI);
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const center = box.getCenter(new THREE.Vector3());
  geometry.translate(-center.x, -center.y, -center.z);
  const raw = box.getSize(new THREE.Vector3());
  const unit = 1 / Math.max(raw.x, raw.y);
  geometry.scale(unit, unit, unit);
  geometry.computeVertexNormals();

  return { geometry, size: { w: raw.x * unit, h: raw.y * unit } };
}

/**
 * 로고 재질. 광택 있는 몸체 색에, 비스듬한 면(Fresnel)과 밝은 반사를 더 밝혀 유리처럼 테두리가 빛나게 한다.
 * uniforms.uLight 는 가운데에서 멀어질수록 낮아지는 밝기(0~1)다.
 */
export function createLogoMaterial(color: string) {
  const material = new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.22,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    // 명세의 2.1 은 투명한 유리 기준이다. 넓고 평평한 불투명 면에서는 반사가 색을 덮어 1.3 으로 낮춘다
    envMapIntensity: 1.3,
    emissive: color,
  });
  const uLight = { value: 1 };
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uLight = uLight;
    shader.fragmentShader = shader.fragmentShader
      .replace("void main() {", "uniform float uLight;\nvoid main() {")
      .replace(
        "#include <opaque_fragment>",
        /* glsl */ `
        float fres = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 2.2);
        float spec = smoothstep(0.22, 1.1, max(max(outgoingLight.r, outgoingLight.g), outgoingLight.b));
        outgoingLight += vec3(fres * 0.3 + spec * 0.05) * (0.4 + 0.6 * uLight);
        #include <opaque_fragment>
        `,
      );
  };
  return { material, uLight };
}
