import * as THREE from "three";

// 값은 .claude/rules/intro-page.md 의 "3D 장면" 절과 같다

/** z = 0 평면에서 보이는 높이 (fov 30, 거리 10) */
export const VH = 20 * Math.tan((15 * Math.PI) / 180);

export function createRenderer(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  return renderer;
}

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);
  return camera;
}

/** 발광 판으로 만든 작은 장면을 PMREM 으로 구워 환경맵으로 쓴다 — 유리 같은 긴 세로 반사 줄이 여기서 나온다 */
export function createEnvironment(renderer: THREE.WebGLRenderer) {
  const env = new THREE.Scene();
  env.background = new THREE.Color("#2c1b17");

  const panels: [number, number, string, number, [number, number, number]][] = [
    [1.0, 16, "#ffffff", 7, [-5.5, 0, 4.2]],
    [0.55, 16, "#ffffff", 5, [4.8, 0.5, 3.6]],
    [0.35, 16, "#fff4ea", 3.5, [1.4, 0, 6.5]],
    [12, 2.5, "#fff1e6", 2.4, [0, 7.5, 1.5]],
    [10, 9, "#ff9466", 1.3, [0, -1, -8]],
    [7, 8, "#ffc6a8", 1.1, [-8, -1, -3]],
    [7, 8, "#ffb08c", 0.9, [8, -1, -2]],
  ];
  for (const [w, h, color, power, pos] of panels) {
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(power), side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    mesh.position.set(...pos);
    mesh.lookAt(0, 0, 0);
    env.add(mesh);
  }

  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromScene(env, 0.035);
  pmrem.dispose();
  env.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose();
      (o.material as THREE.Material).dispose();
    }
  });
  return target;
}

export function addLights(scene: THREE.Scene) {
  const sun = new THREE.DirectionalLight(0xffffff, 1.1);
  sun.position.set(-3, 5, 6);
  scene.add(sun, new THREE.AmbientLight("#ffe8dc", 0.35));
}

/** sRGB 16진 색을 셰이더에 그대로 넣을 값으로 (배경 셰이더는 톤 매핑 · 색 공간 변환을 거치지 않는다) */
const raw = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

/** hero 팔레트 */
export const HERO_PALETTE = {
  top: "#EE9F84",
  bottom: "#F7BBA2",
  glow: "#FFD8C4",
  glowPos: [0.5, 0.2] as const,
  amount: 0.42,
  radius: 2.4,
};

/** 가장 먼저 그리는 전체 화면 배경 (그러데이션 + 빛 번짐 + 필름 그레인) */
export function createBackground() {
  const p = HERO_PALETTE;
  const material = new THREE.ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uTop: { value: raw(p.top) },
      uBottom: { value: raw(p.bottom) },
      uGlow: { value: raw(p.glow) },
      uGlowPos: { value: new THREE.Vector2(...p.glowPos) },
      uAmount: { value: p.amount },
      uRadius: { value: p.radius },
      uAspect: { value: 1 },
      uTime: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uTop, uBottom, uGlow;
      uniform vec2 uGlowPos;
      uniform float uAmount, uRadius, uAspect, uTime;
      varying vec2 vUv;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main() {
        vec3 c = mix(uBottom, uTop, vUv.y);
        vec2 d = (vUv - uGlowPos) * vec2(uAspect, 1.0);
        c += uGlow * uAmount * exp(-dot(d, d) * uRadius);
        // 필름 그레인 ±.0225
        c += (hash(gl_FragCoord.xy + fract(uTime * 7.13) * 91.7) - 0.5) * 0.045;
        gl_FragColor = vec4(c, 1.0);
      }
    `,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -1;
  return mesh;
}

/** 가운데가 밝고 가장자리로 사라지는 둥근 빛 텍스처 (원판 빛 번짐용) */
export function radialGlowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,.45)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
