import * as T from 'three';
import {pilotGround, PILOT_WATER_LEVEL as WATER} from './forest-pilot';
import type {Grid, Point} from './maze';

const slate = [0x88654f, 0xa67a56, 0xc59a6b, 0xd4ac7d, 0xaa805b];
const timber = [0xa7784a, 0xb38451, 0x93653e, 0xbd905d, 0xa47348];
const canopy = [0x436b43, 0x537c42, 0x6c914b, 0x335d3c];

function mesh<M extends T.Material>(parent: T.Object3D, geometry: T.BufferGeometry, material: M, x: number, y: number, z: number) {
 const object = new T.Mesh(geometry, material);
 object.position.set(x, y, z);
 parent.add(object);
 return object;
}

function waterMaterial(time: {value: number}, size: number, falling: boolean) {
 return new T.ShaderMaterial({
  uniforms: {...T.UniformsUtils.clone(T.UniformsLib.fog), time, size: {value: size}},
  transparent: true,
  depthWrite: false,
  side: T.DoubleSide,
  fog: true,
  defines: falling ? {FALLING: 1} : {},
  vertexShader: `
   #include <fog_pars_vertex>
   varying vec2 waterUv;
   void main() {
    waterUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
   }
  `,
  fragmentShader: `
   #include <fog_pars_fragment>
   uniform float time;
   uniform float size;
   varying vec2 waterUv;
   void main() {
    vec2 uv = waterUv;
    vec3 color;
    float alpha;
    #ifdef FALLING
     float strand = sin(uv.x * size * 20.0 + sin(uv.y * 10.0 - time * 2.0));
     float current = sin(uv.y * 25.0 - time * 10.0 + strand * 2.8);
     float threads = smoothstep(0.18, 0.95, strand * 0.64 + current * 0.36);
     float foam = smoothstep(0.67, 1.0, uv.y);
     float edge = smoothstep(0.0, 0.1, min(uv.x, 1.0 - uv.x));
     color = mix(vec3(0.16, 0.56, 0.54), vec3(0.89, 0.98, 0.89), 0.31 + threads * 0.58 + foam * 0.10);
     alpha = edge * (0.73 + threads * 0.25 + foam * 0.02);
    #else
     vec2 q = (uv - 0.5) * 40.0;
     float bank = smoothstep(13.8, 20.0, length(q));
     float wave = sin(q.y * 1.7 + sin(q.x * 0.79 + time * 0.45) * 2.0 - time * 1.2);
     float crossing = sin(q.x * 1.72 - q.y * 1.3 + time * 0.86);
     float sheen = smoothstep(1.27, 1.93, wave + crossing) * 0.26;
     color = mix(vec3(0.035, 0.23, 0.22), vec3(0.16, 0.47, 0.38), bank);
     color = mix(color, vec3(0.59, 0.82, 0.71), sheen);
     alpha = (0.83 - bank * 0.41 + sheen * 0.25) * (1.0 - smoothstep(19.7, 20.0, length(q)));
    #endif
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
   }
  `,
 });
}

type Placement = [x: number, y: number, z: number, width: number, height: number, depth: number, rotation: number, color: number];
type FallRow = [x: number, y: number, z: number, width: number];

function fallingSheet(rows: FallRow[]) {
 const columns = 14;
 const position: number[] = [], uv: number[] = [], index: number[] = [];
 const length = [0];
 for (let row = 1; row < rows.length; row++) {
  length.push(length[row - 1] + Math.hypot(rows[row][1] - rows[row - 1][1], rows[row][2] - rows[row - 1][2]));
 }
 rows.forEach(([x, y, z, width], row) => {
  for (let column = 0; column <= columns; column++) {
   const u = column / columns;
   const fold = Math.sin(column * 2.7) * 0.11 + Math.sin(column * 0.61) * 0.19;
   position.push(x + (u - 0.5) * width, y + fold * 0.16, z + fold);
   uv.push(u, length[row] / length[length.length - 1]);
   if (row === 0 || column === 0) continue;
   const i = row * (columns + 1) + column;
   index.push(i - columns - 2, i - columns - 1, i - 1, i - 1, i - columns - 1, i);
  }
 });
 const geometry = new T.BufferGeometry();
 geometry.setAttribute('position', new T.Float32BufferAttribute(position, 3));
 geometry.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
 geometry.setIndex(index);
 return geometry;
}

export function forestCascade(rows:FallRow[],time:{value:number}) {
 const waterfall=new T.Mesh(fallingSheet(rows),waterMaterial(time,rows[0][3],true));
 waterfall.name='waterfall-sheet';
 waterfall.renderOrder=2;
 waterfall.raycast=()=>{};
 return waterfall;
}

export function forestWaterfallValley(parent: T.Group, grid: Grid, basin: Point, extreme=true) {
 const root = new T.Group();
 root.name = extreme ? 'extreme-waterfall-valley' : 'hard-waterfall-valley';
 parent.add(root);

 const time = {value: 0};
 const lake = mesh(root, new T.CircleGeometry(20, 96), waterMaterial(time, 20, false), basin.x, WATER, basin.y);
 lake.rotation.x = -Math.PI / 2;
 lake.renderOrder = 1;
 // Water and spray are visual effects and should never enter camera occlusion raycasts.
 lake.raycast = () => {};
 lake.name = 'waterfall-valley-deep-water-volume';

 const stone = new T.MeshLambertMaterial({flatShading: true});
 const leaf = new T.MeshLambertMaterial({flatShading: true});
 const boundary: Placement[] = [], moss: Placement[] = [];
 const rockGeometry = new T.CylinderGeometry(0.82, 1, 1, 7, 2);
 const crownGeometry = new T.IcosahedronGeometry(1, 0);
 const wood = new T.MeshLambertMaterial({flatShading: true});
 const unitBox = new T.BoxGeometry(1, 1, 1);
 const dummy = new T.Object3D();
 const color = new T.Color();
 function place(name: string, geometry: T.BufferGeometry, material: T.Material, placements: Placement[], group = root) {
  const batch = new T.InstancedMesh(geometry, material, placements.length);
  batch.name = name;
  placements.forEach(([x, y, z, width, height, depth, rotation, tint], i) => {
   dummy.position.set(x, y, z);
   dummy.scale.set(width, height, depth);
   dummy.rotation.y = rotation;
   dummy.updateMatrix();
   batch.setMatrixAt(i, dummy.matrix);
   batch.setColorAt(i, color.setHex(tint));
  });
  group.add(batch);
 }

 // The high ridge sits back from the playable lip. Its footprint stays inside solid cells.
 const solid = (x: number, z: number, rx: number, rz: number) => {
  for (let row = Math.floor(z - rz); row <= Math.floor(z + rz); row++) {
   for (let col = Math.floor(x - rx); col <= Math.floor(x + rx); col++) {
    if (grid[row]?.[col] !== 1) return false;
   }
  }
  return true;
 };
 const rocks: Placement[] = [], crowns: Placement[] = [], trunks: Placement[] = [];
 for (let i = 0; i < 14; i++) {
  const x = basin.x - 16 + i * 2.5;
  const z = basin.y - 23.1 + 1.1 * Math.sin(i * 1.17);
  const floor = pilotGround(x, z);
  const height = 5.2 + (i % 5) * 0.72 + 1.9 * Math.exp(-((i - 9) ** 2) / 6);
  if (!solid(x, z, 2.1, 2.1)) continue;
  rocks.push([x, floor + height / 2 - 0.6, z, 2.1, height, 2.1, i * 0.33, slate[i % slate.length]]);
  rocks.push([x - 0.6, floor + height * 0.26, z + 0.7, 1.45, height * 0.56, 1.4, i * 0.63, slate[(i + 2) % slate.length]]);
  if (i !== 8 && i !== 9 && i % 4 !== 3) {
   const top = floor + height - 0.63;
   const treeSize = 1.15 + (i % 3) * 0.3;
   trunks.push([x, top + treeSize * 0.66, z, 0.24, treeSize * 1.6, 0.22, 0, 0x674d38]);
   for (let crown = 0; crown < 4; crown++) {
    const angle = crown * 2.4 + i;
    crowns.push([
     x + Math.sin(angle) * treeSize * 0.58, top + treeSize * (1.6 + crown * 0.27),
     z + Math.cos(angle) * treeSize * 0.48, treeSize * 1.3, treeSize * 0.85,
     treeSize * 1.1, angle, canopy[(i + crown) % canopy.length],
    ]);
   }
  }
 }
 // Low buttresses follow the shoulders without reaching into the pool or its entrances.
 for (let i = 0; i < 22; i++) {
  const angle = (i / 21) * Math.PI * 1.39 - 2.03;
  const x = basin.x + Math.sin(angle) * (21.8 + (i % 3) * 0.4);
  const z = basin.y - Math.cos(angle) * (21.8 + (i % 3) * 0.4);
  const width = 1.1 + (i % 4) * 0.26;
  if (z < basin.y - 21 || !solid(x, z, width, width)) continue;
  const height = 2.6 + (i % 3) * 0.38;
  rocks.push([x, pilotGround(x, z) + height / 2 - 0.3, z, width, height, width, i, slate[i % slate.length]]);
 }
 place('waterfall-sandstone-ridge', rockGeometry, stone, rocks);
 place('waterfall-canopy-trunks', unitBox, wood, trunks);
 place('waterfall-canopy', crownGeometry, leaf, crowns);

 // Split first at the rim, then spread the water across the lower rock shelves.
 const streams: FallRow[][] = [
  [[38.1, 6.9, 88.2, 3.2], [38.65, 6.86, 89.7, 3.4], [39.25, 6.3, 90.65, 3.13],
   [39.42, 4.3, 91.2, 2.78], [39.45, 2.32, 91.8, 2.6], [39.25, 1.7, 92.68, 3.1],
   [38.95, 1.51, 94.2, 3.5], [38.5, 0.95, 95.4, 3.84], [38.5, WATER + 0.05, 96.5, 4.4]],
  [[32.0, 4.7, 89.3, 1.56], [33.0, 4.63, 90.6, 1.71], [34.1, 4.04, 91.55, 1.48],
   [34.65, 1.03, 93.0, 1.28], [35.4, 0.2, 94.1, 1.4], [36.0, WATER + 0.08, 95.1, 1.9]],
 ];
 streams.forEach(rows => {
  root.add(forestCascade(rows,time));
 });

 const sprayGeometry = new T.IcosahedronGeometry(1, 1);
 const spray: {particle: T.Mesh<T.BufferGeometry, T.MeshBasicMaterial>; x: number; z: number; phase: number; drift: number}[] = [];
 for (let i = 0; i < 18; i++) {
  const material = new T.MeshBasicMaterial({color: 0xe0f3d8, transparent: true, depthWrite: false});
  const particle = mesh(root, sprayGeometry, material, 0, 0, 0);
  particle.renderOrder = 3;
  particle.raycast = () => {};
  const x = i % 4 === 0 ? 36.0 : 38.5;
  spray.push({particle, x, z: x === 36.0 ? 95.1 : 96.5, phase: (i * 0.3819) % 1, drift: Math.sin(i * 2.4)});
 }

 const crossing = new T.Group();
 crossing.name = 'waterfall-valley-crossing';
 const planks: Placement[] = [], supports: Placement[] = [], ferns: Placement[] = [];
 const bridgeZ = basin.y + 12.5;
 const start = basin.x + 16.8;
 // Follow the existing dry approach. Leave the last stretch of shore open to swimming.
 const isDryPath = [0, -0.72, 0.72].every(offset =>
  Array.from({length: 7}, (_, i) => start + i * 0.95).every(x =>
   grid[Math.floor(bridgeZ + offset)]?.[Math.floor(x)] === 0 &&
   pilotGround(x, bridgeZ + offset) > WATER + 0.1));
 if (isDryPath) {
  root.add(crossing);
  for (let i = 0; i < 22; i++) {
   const x = start + i * 0.26;
   planks.push([x, pilotGround(x, bridgeZ) + 0.013, bridgeZ, 0.244, 0.094,
    1.57 + (i % 4) * 0.025, Math.sin(i * 2.4) * 0.029, timber[(i * 7) % timber.length]]);
  }
  for (const offset of [-0.68, 0.68]) {
   for (let i = 0; i < 6; i++) {
    const x = start + i * 1.08 + 0.05;
    const y = pilotGround(x, bridgeZ + offset);
    supports.push([x, y + 0.14, bridgeZ + offset, 0.15, 0.38, 0.15, 0, 0x745038]);
    if (i < 5) supports.push([x + 0.54, y + 0.16, bridgeZ + offset, 1.12, 0.105, 0.105, 0, 0x8e623d]);
   }
  }
  place('waterfall-boardwalk-planks', unitBox, wood, planks, crossing);
  place('waterfall-boardwalk-edging', unitBox, wood, supports, crossing);

  const frondPositions = [0, 0, 0, 0.38, 0.28, -0.14, 0.55, 0.35, 0, 0.38, 0.28, 0.14, 0.96, 0.21, 0];
  const frond = new T.BufferGeometry();
  frond.setAttribute('position', new T.Float32BufferAttribute(frondPositions, 3));
  frond.setIndex([0, 2, 1, 0, 3, 2, 1, 2, 4, 2, 3, 4]);
  frond.computeVertexNormals();
  for (const offset of [-1.23, 1.35]) {
   for (let i = 0; i < 7; i++) {
    const x = start + 0.22 + i * 0.85;
    const z = bridgeZ + offset + 0.16 * Math.sin(i * 2.8);
    const y = pilotGround(x, z);
    if (y < WATER + 0.1 || grid[Math.floor(z)]?.[Math.floor(x)] !== 0) continue;
    const scale = 0.43 + (i % 3) * 0.095;
    for (let blade = 0; blade < 6; blade++) {
     ferns.push([x, y, z, scale, scale * 1.54, scale, blade * 1.06 + i, canopy[(i + blade) % canopy.length]]);
    }
   }
  }
  place('waterfall-boardwalk-ferns', frond,
   new T.MeshLambertMaterial({side: T.DoubleSide, flatShading: true}), ferns, crossing);
 }

 return {
  addCliff(x: number, z: number, base: number, height: number) {
   if (Math.hypot(x - basin.x, z - basin.y) > 26) return false;
   const seed = Math.floor(x) * 17 + Math.floor(z) * 23;
   const tint = [0xc99b72, 0xd9ac80, 0xbc9068, 0xd0a07a][seed % 4];
   boundary.push([x, base + height / 2, z, 1, height, 1, 0, tint]);
   if (seed % 3 !== 0) {
    const scale = 0.34 + (seed % 4) * 0.055;
    moss.push([x + Math.sin(seed) * 0.05, base + height, z,
     scale, 0.14 + (seed % 5) * 0.043, scale, seed, canopy[seed % canopy.length]]);
   }
   return true;
  },
  finishCliffs() {
   const faces = new T.BoxGeometry(1.02, 1, 1.02, 2, 6, 2);
   const position = faces.attributes.position;
   const colors: number[] = [];
   const bands = [0x9e8777, 0xbda994, 0xd3bfa6, 0xa9957f, 0xe8d3b8, 0xcdbba0, 0xbcc4a0];
   for (let i = 0; i < position.count; i++) {
    const x = position.getX(i), y = position.getY(i), z = position.getZ(i);
    const band = Math.round((y + 0.5) * 6);
    const change = [1, 1, 0.96, 0.97, 0.91, 0.89, 0.76][band];
    const ridge = Math.sin((x + z) * 6 + band * 2) * 0.06 * Math.sin(Math.PI * band / 6);
    position.setXYZ(i, x * (change + ridge), y + Math.sin((x - z) * 7 + band) * 0.023, z * (change - ridge));
    colors.push(...color.setHex(bands[band]).multiplyScalar(0.92 + Math.cos((x + z) * 9 + band) * 0.08).toArray());
   }
   faces.setAttribute('color', new T.Float32BufferAttribute(colors, 3));
   faces.computeVertexNormals();
   place('waterfall-valley-exposed-sandstone', faces,
    new T.MeshLambertMaterial({vertexColors: true, flatShading: true}), boundary);
   place('waterfall-valley-moss-patches', crownGeometry, leaf, moss);
  },
  update(seconds: number) {
   time.value = seconds;
   for (const {particle, x, z, phase, drift} of spray) {
    const age = (seconds * 0.52 + phase) % 1;
    particle.material.opacity = Math.sin(age * Math.PI) * 0.19;
    particle.position.set(x + drift * (0.6 + age * 2.1), WATER + 0.07 + Math.sin(age * Math.PI) * 0.62, z + age * 2.0);
    particle.scale.set(0.24 + age * 0.71, 0.08 + age * 0.24, 0.19 + age * 0.55);
   }
  },
 };
}
