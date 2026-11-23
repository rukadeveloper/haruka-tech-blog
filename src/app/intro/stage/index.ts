import * as THREE from "three";
import { CAROUSEL_K, INTRO_SECONDS, discRise, heroLayout, heroPose, slotDistance, type HeroLayout } from "./carousel";
import { LANGUAGES, SLOTS, TILTS, languageOf } from "./languages";
import { buildLogoGeometry, createLogoMaterial } from "./logo-mesh";
import { clamp, damp, lerp, smoothstep, springStep } from "./math";
import { VH, addLights, createBackground, createCamera, createEnvironment, createRenderer, radialGlowTexture } from "./scene";

/**
 * 인트로의 WebGL 장면 전체. IntroStage 가 이 모듈을 동적으로 import 해 만든다 (three 가 다른 화면 번들에 섞이지 않도록).
 * 캔버스는 여기서 만들어 붙이고 dispose 에서 떼어 낸다 — 컨텍스트를 잃은 캔버스는 다시 쓸 수 없기 때문이다.
 */

type Options = {
  container: HTMLElement;
  /** --sc · --sg 를 쓸 요소 */
  root: HTMLElement;
  reduced: boolean;
  /** 가운데 언어가 바뀔 때. dir 은 1(다음) / −1(이전) */
  onLanguage: (index: number, dir: 1 | -1) => void;
  /** 입장 70% 에 헤더, 75% 에 제목 · 화살표 */
  onPhase: (phase: "ui" | "hero") => void;
};

/** 발광 세기 배율. 로고는 병 속 액체와 달리 몸체가 바로 보여, 명세 값 그대로면 색이 하얗게 뜬다 */
const EMISSIVE_SCALE = 0.2;

export function createStage({ container, root, reduced, onLanguage, onPhase }: Options) {
  const canvas = document.createElement("canvas");
  canvas.className = "intro-gl";
  canvas.setAttribute("aria-hidden", "true");
  container.appendChild(canvas);

  const renderer = createRenderer(canvas);
  const camera = createCamera();
  const scene = new THREE.Scene();
  const envTarget = createEnvironment(renderer);
  scene.environment = envTarget.texture;
  addLights(scene);
  const background = createBackground();
  scene.add(background);

  // 로고: 지오메트리는 언어마다 하나, 재질은 칸마다 하나(칸마다 밝기가 달라서)
  const shapes = LANGUAGES.map((l) => buildLogoGeometry(l.path));
  const items = Array.from({ length: SLOTS }, (_, i) => {
    const li = i % LANGUAGES.length;
    const { material, uLight } = createLogoMaterial(LANGUAGES[li].body);
    const mesh = new THREE.Mesh(shapes[li].geometry, material);
    mesh.userData.slot = i;
    scene.add(mesh);
    return { mesh, material, uLight, base: new THREE.Color(LANGUAGES[li].body), h: shapes[li].size.h, hover: 0 };
  });
  const meshes = items.map((it) => it.mesh);

  // 원판: 투명 원기둥 + 가산 고리 + 납작한 빛 번짐
  const disc = new THREE.Group();
  const discBody = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 0.05, 96),
    new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      roughness: 0.08,
      clearcoat: 1,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      envMapIntensity: 2.1,
    }),
  );
  const ringMaterial = new THREE.MeshBasicMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.007, 8, 160), ringMaterial);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.026;
  const glowTexture = radialGlowTexture();
  const glowMaterial = new THREE.MeshBasicMaterial({
    map: glowTexture,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.1), glowMaterial);
  glow.rotation.x = -1.2;
  glow.position.y = 0.03;
  disc.add(discBody, ring, glow);
  scene.add(disc);

  // 강조색: 가운데 언어의 색을 exp(−4dt) 로 따라간다
  const accent = new THREE.Color(LANGUAGES[0].accent);
  const accentTarget = accent.clone();
  const white = new THREE.Color(1, 1, 1);
  let accentCss = "";

  // ── 상태 ──
  const car = { x: 0, v: 0 };
  let target = 0;
  let centre = 0;
  let intro = reduced ? 1 : 0;
  let started = false;
  let phaseUi = false;
  let phaseHero = false;
  let hovered = -1;
  let layout: HeroLayout = heroLayout(1);
  let t = 0;

  type Drag = { id: number; startX: number; startCar: number; lastX: number; lastT: number; moved: number };
  let drag: Drag | null = null;
  let velocity = 0;
  let wheelTimer = 0;

  // ── 크기 · 화질 ──
  const maxRatio = Math.min(window.devicePixelRatio || 1, 1.5);
  let ratio = maxRatio;
  let avgMs = 16.7;
  let holdUntil = 0;
  let lastRaise = 0;
  let lastDrop = 0;

  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setPixelRatio(ratio);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    layout = heroLayout(camera.aspect);
    background.material.uniforms.uAspect.value = camera.aspect;
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  /** 프레임이 무거우면 해상도를 낮추고, 가벼워지면 천천히 되돌린다 */
  const adapt = (ms: number, now: number) => {
    avgMs = lerp(avgMs, ms, 0.05);
    if (avgMs > 19.5 && ratio > 0.7 && now - lastDrop > 1000) {
      ratio = Math.max(0.7, ratio - 0.15);
      holdUntil = now + 8000;
      lastDrop = now;
      resize();
    } else if (avgMs < 17.3 && ratio < maxRatio && now > holdUntil && now - lastRaise > 1200) {
      ratio = Math.min(maxRatio, ratio + 0.05);
      lastRaise = now;
      resize();
    }
  };

  // ── 입력 ──
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const pick = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(meshes, false)[0];
    return hit ? (hit.object.userData.slot as number) : -1;
  };
  /** 드래그 한 칸에 해당하는 픽셀 */
  const stepPx = () => layout.s1 * window.innerWidth;

  const updateCursor = () => {
    const side = hovered >= 0 && Math.abs(slotDistance(hovered, car.x)) > 0.5;
    canvas.style.cursor = drag ? "grabbing" : side ? "pointer" : "grab";
  };

  const onDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    drag = { id: e.pointerId, startX: e.clientX, startCar: car.x, lastX: e.clientX, lastT: performance.now(), moved: 0 };
    velocity = 0;
    car.v = 0;
    canvas.setPointerCapture(e.pointerId);
    updateCursor();
  };

  const onMove = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) {
      if (e.pointerType === "mouse") {
        hovered = pick(e);
        updateCursor();
      }
      return;
    }
    const now = performance.now();
    const dt = Math.max(1, now - drag.lastT) / 1000;
    const step = stepPx();
    const inst = -(e.clientX - drag.lastX) / step / dt;
    velocity = clamp(lerp(velocity, inst, 0.35), -14, 14);
    drag.moved = Math.max(drag.moved, Math.abs(e.clientX - drag.startX));
    drag.lastX = e.clientX;
    drag.lastT = now;
    car.x = drag.startCar - (e.clientX - drag.startX) / step;
    target = car.x;
  };

  const onUp = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    drag = null;
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    if (d.moved < 6) {
      // 클릭: 옆 오브젝트를 눌렀으면 그 칸을 가운데로
      const slot = pick(e);
      target = slot >= 0 ? Math.round(car.x + slotDistance(slot, car.x)) : Math.round(car.x);
    } else {
      if (performance.now() - d.lastT > 90) velocity = 0;
      car.v = velocity;
      target = Math.round(car.x + velocity * 0.22);
    }
    updateCursor();
  };

  const onCancel = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return;
    drag = null;
    target = Math.round(car.x);
    updateCursor();
  };

  const onLeave = () => {
    hovered = -1;
    updateCursor();
  };

  const onWheel = (e: WheelEvent) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    target += e.deltaX / 220;
    window.clearTimeout(wheelTimer);
    wheelTimer = window.setTimeout(() => (target = Math.round(target)), 130);
  };

  const step = (dir: 1 | -1) => {
    target = Math.round(target) + dir;
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const el = e.target;
    if (el instanceof Element && el.closest("input, textarea, select, [contenteditable]")) return;
    if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
  };

  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onCancel);
  canvas.addEventListener("pointerleave", onLeave);
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", onKey);
  updateCursor();

  // ── 프레임 ──
  let raf = 0;
  let last = 0;
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    adapt(last ? now - last : 16.7, now);
    last = now;
    t += dt;

    if (started && intro < 1) intro = Math.min(1, intro + dt / INTRO_SECONDS);
    if (started && !phaseUi && intro >= 0.7) {
      phaseUi = true;
      onPhase("ui");
    }
    if (started && !phaseHero && intro >= 0.75) {
      phaseHero = true;
      onPhase("hero");
    }

    if (!drag) springStep(car, target, CAROUSEL_K, dt);

    const c = Math.round(car.x);
    if (c !== centre) {
      const dir = c > centre ? 1 : -1;
      centre = c;
      const li = languageOf(c);
      accentTarget.set(LANGUAGES[li].accent);
      onLanguage(li, dir);
    }

    const L = layout;
    for (let i = 0; i < SLOTS; i++) {
      const it = items[i];
      const d = slotDistance(i, car.x);
      const pose = heroPose(L, i, d, it.h, TILTS[i], intro, t, !reduced);
      it.hover = damp(it.hover, hovered === i && Math.abs(d) > 0.5 && !drag ? 1 : 0, 12, dt);
      it.mesh.position.set(pose.x, pose.y + it.hover * 0.09, pose.z);
      it.mesh.rotation.set(0, pose.rotY, pose.rotZ);
      it.mesh.scale.setScalar(pose.scale);

      const light = clamp(1 - smoothstep(0, 1, Math.abs(d)) + it.hover * 0.35);
      it.material.color.copy(it.base).multiplyScalar(0.42 + 0.58 * light);
      it.material.emissive.copy(it.base).multiplyScalar((0.08 + 0.34 * light) * EMISSIVE_SCALE);
      it.uLight.value = light;
    }

    // 원판: 가운데 오브젝트 바닥에 놓이고, 입장 때 아래에서 솟는다
    const hc = L.hc;
    disc.scale.set(hc * 1.25, hc * 1.2, hc * 1.25);
    disc.position.set(0, L.bottom - 0.026 * hc * 1.2 - (1 - discRise(intro)) * 0.6 * VH, 0);

    accent.lerp(accentTarget, 1 - Math.exp(-4 * dt));
    ringMaterial.color.copy(accent).lerp(white, 0.25).multiplyScalar(1.5);
    glowMaterial.color.copy(accent);
    const css = accent.getHexString(THREE.SRGBColorSpace);
    if (css !== accentCss) {
      accentCss = css;
      root.style.setProperty("--sc", `#${css}`);
      root.style.setProperty("--sg", `#${css}a6`);
    }

    background.material.uniforms.uTime.value = t;
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(frame);

  return {
    /** 셰이더를 미리 컴파일한다. 끝나면 캔버스를 보여 줘도 첫 프레임이 끊기지 않는다 */
    ready: renderer.compileAsync(scene, camera).catch(() => undefined),
    /** 입장 시작 */
    start() {
      started = true;
      if (reduced) {
        phaseUi = phaseHero = true;
        onPhase("ui");
        onPhase("hero");
      }
    },
    step,
    dispose() {
      cancelAnimationFrame(raf);
      window.clearTimeout(wheelTimer);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onCancel);
      canvas.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);

      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          geometries.add(o.geometry);
          materials.add(o.material as THREE.Material);
        }
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      glowTexture.dispose();
      envTarget.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}

export type Stage = ReturnType<typeof createStage>;
