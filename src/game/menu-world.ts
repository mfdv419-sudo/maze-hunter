import * as T from "three";
import { createBinturong } from "./character";
/** A real, lightweight title-screen scene; no marketing hero image or fake screenshot. */
export function menuWorld(host: HTMLElement, outfit = "classic", language: "id" | "en" = "id") {
  const renderer = new T.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x9fdfdd);
  host.append(renderer.domElement);
  const scene = new T.Scene();
  scene.fog = new T.Fog(0x9fdfdd, 16, 34);
  const camera = new T.PerspectiveCamera(37, 1, 0.1, 70);
  scene.add(new T.HemisphereLight(0xfff9da, 0x637a40, 2.8));
  const light = new T.DirectionalLight(0xffdf9d, 2.5);
  light.position.set(-5, 9, 5);
  scene.add(light);
  const geometries: T.BufferGeometry[] = [],
    materials: T.Material[] = [];
  const mat = (c: number) => {
    const m = new T.MeshLambertMaterial({ color: c, flatShading: true });
    materials.push(m);
    return m;
  };
  const grass = mat(0x83b85b),
    lightGrass = mat(0xa6d66d),
    stone = mat(0x8bb787),
    wood = mat(0x88683d),
    leaf = mat(0x3d9360),
    leafTop = mat(0x68b66c),
    yellow = mat(0xf9d26d),
    path = mat(0xdde0a2);
  const mesh = (
    g: T.BufferGeometry,
    m: T.Material,
    x: number,
    y: number,
    z: number,
    parent: T.Object3D = scene,
  ) => {
    geometries.push(g);
    const a = new T.Mesh(g, m);
    a.position.set(x, y, z);
    parent.add(a);
    return a;
  };
  mesh(new T.BoxGeometry(28, 0.25, 26), grass, 0, -0.2, -4);
  mesh(new T.CylinderGeometry(2.15, 2.35, 0.32, 10), lightGrass, 1, -0.05, 0);
  mesh(new T.CylinderGeometry(1.55, 1.8, 0.16, 10), path, 1, 0.12, 0);
  // Ruined garden walls form a recognisable maze beyond the mascot.
  for (let z = -10; z <= -3; z += 2)
    for (let x = -9; x <= 8; x += 2) {
      if ((x + z + 20) % 5 < 2) continue;
      const wall = mesh(new T.BoxGeometry(1.9, 0.65, 0.7), stone, x, 0.21, z);
      if ((x + z) % 3 === 0) wall.rotation.y = Math.PI / 2;
    }
  function tree(x: number, z: number, size: number) {
    mesh(
      new T.CylinderGeometry(0.14 * size, 0.22 * size, 1.5 * size, 5),
      wood,
      x,
      0.55 * size,
      z,
    );
    mesh(new T.IcosahedronGeometry(1 * size, 0), leaf, x, 1.8 * size, z);
    mesh(
      new T.IcosahedronGeometry(0.78 * size, 0),
      leafTop,
      x - 0.25 * size,
      2.3 * size,
      z,
    );
  }
  for (const [x, z, s] of [
    [-5, -3, 1.3],
    [5, -4, 1.5],
    [-8, -8, 1.8],
    [8, -9, 1.7],
    [-4, 2, 0.9],
    [5, 2, 1],
    [-10, -2, 2],
    [9, -2, 1.8],
  ])
    tree(x, z, s);
  const gate = new T.Group();
  gate.position.set(2, 0, -5);
  mesh(new T.BoxGeometry(0.35, 2.3, 0.35), stone, -0.95, 1.0, 0, gate);
  mesh(new T.BoxGeometry(0.35, 2.3, 0.35), stone, 0.95, 1.0, 0, gate);
  mesh(new T.BoxGeometry(2.25, 0.35, 0.45), stone, 0, 2.15, 0, gate);
  const portal = mesh(
    new T.TorusGeometry(0.66, 0.075, 5, 20),
    yellow,
    0,
    1.13,
    0,
    gate,
  );
  scene.add(gate);
  const cloudMat = new T.MeshBasicMaterial({ color: 0xf6f8dc });
  materials.push(cloudMat);
  for (let i = 0; i < 5; i++) {
    mesh(
      new T.IcosahedronGeometry(1.3, 1),
      cloudMat,
      -8 + i * 4,
      5 + (i % 2),
      -14,
    );
  }
  const hero = createBinturong(outfit);
  hero.root.scale.setScalar(1.35);
  hero.root.position.set(1, 0.22, 0);
  scene.add(hero.root);
  const touch = document.createElement("button");
  touch.id = "mascot-touch";
  touch.className = "mascot-touch";
  touch.setAttribute("aria-label", language === "id" ? "Sapa binturong" : "Greet the binturong");
  host.append(touch);
  let reactionAt = -Infinity;
  const greet = () => {
    reactionAt = performance.now() / 1000;
    touch.dataset.reactions = String(Number(touch.dataset.reactions || 0) + 1);
  };
  touch.addEventListener("click", greet);
  const bounds = new T.Box3();
  const projected = new T.Vector3();
  function positionTouch() {
    hero.root.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);
    bounds.setFromObject(hero.root);
    let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
    for (const x of [bounds.min.x, bounds.max.x])
      for (const y of [bounds.min.y, bounds.max.y])
        for (const z of [bounds.min.z, bounds.max.z]) {
          projected.set(x, y, z).project(camera);
          const px = (projected.x + 1) * host.clientWidth / 2;
          const py = (1 - projected.y) * host.clientHeight / 2;
          left = Math.min(left, px); right = Math.max(right, px);
          top = Math.min(top, py); bottom = Math.max(bottom, py);
        }
    Object.assign(touch.style, {left: `${left}px`, top: `${top}px`, width: `${right-left}px`, height: `${bottom-top}px`});
  }
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  let portrait = false;
  function resize() {
    const w = host.clientWidth,
      h = host.clientHeight;
    if (!w || !h) return;
    portrait = w / h < 0.85;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    hero.root.scale.setScalar(portrait ? 1.12 : 1.35);
    camera.position.set(
      portrait ? 3.0 : 4.4,
      portrait ? 3.3 : 3.4,
      portrait ? 7.1 : 7.7,
    );
    camera.lookAt(portrait ? 1 : 0.1, portrait ? 1.3 : 0.85, 0);
    camera.updateProjectionMatrix();
    positionTouch();
  }
  resize();
  renderer.setAnimationLoop((ms) => {
    const t = ms / 1000;
    hero.root.rotation.y = 0.2 + Math.sin(t * 0.55) * 0.18;
    const age = t - reactionAt;
    const reacting = age >= 0 && age < 1.25;
    touch.dataset.reacting = String(reacting);
    hero.animate(t, 0, false, reacting ? {hit: 0, greet: age / 1.25} : undefined);
    portal.rotation.z = t * 0.15;
    renderer.render(scene, camera);
  });
  return () => {
    ro.disconnect();
    renderer.setAnimationLoop(null);
    hero.dispose();
    for (const g of geometries) g.dispose();
    for (const m of materials) m.dispose();
    renderer.dispose();
    renderer.domElement.remove();
    touch.removeEventListener("click", greet);
    touch.remove();
  };
}
