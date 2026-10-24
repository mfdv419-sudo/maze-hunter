import * as T from "three";
export interface Character {
  root: T.Group;
  animate: (time: number, speed: number, celebrate?: boolean) => void;
  dispose: () => void;
}
export function createBinturong(
  outfit = "classic",
  color = 0x434952,
): Character {
  const root = new T.Group(),
    body = new T.Group();
  root.add(body);
  const materials: T.Material[] = [],
    geometries: T.BufferGeometry[] = [];
  const mat = (c: number) => {
    const m = new T.MeshLambertMaterial({ color: c, flatShading: true });
    materials.push(m);
    return m;
  };
  const shadowGeo = new T.CircleGeometry(0.23, 12);
  geometries.push(shadowGeo);
  const shadowMat = new T.MeshBasicMaterial({
    color: 0x183b33,
    transparent: true,
    opacity: 0.17,
    depthWrite: false,
  });
  materials.push(shadowMat);
  const shadow = new T.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.005;
  root.add(shadow);
  const fur = mat(color),
    cream = mat(0xf1dfb7),
    black = mat(0x172c30),
    teal = mat(0x49b6a2),
    white = mat(0xffffff),
    gold = mat(0xf6b84c);
  const box = (
    w: number,
    h: number,
    d: number,
    m: T.Material,
    x: number,
    y: number,
    z: number,
    parent: T.Object3D = body,
  ) => {
    const g = new T.BoxGeometry(w, h, d);
    geometries.push(g);
    const mesh = new T.Mesh(g, m);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };
  box(0.4, 0.43, 0.29, fur, 0, 0.62, 0);
  const head = new T.Group();
  head.position.set(0, 1, 0);
  body.add(head);
  box(0.64, 0.53, 0.48, fur, 0, 0, 0, head);
  box(0.36, 0.19, 0.13, cream, 0, -0.13, 0.28, head);
  box(0.1, 0.07, 0.05, black, 0, -0.08, 0.36, head);
  for (const side of [-1, 1]) {
    const ear = box(0.17, 0.19, 0.15, fur, side * 0.24, 0.31, 0, head);
    ear.rotation.z = side * -0.15;
    box(0.09, 0.1, 0.02, cream, side * 0.24, 0.32, 0.09, head);
    box(0.07, 0.105, 0.025, black, side * 0.16, 0.045, 0.25, head);
    box(0.024, 0.025, 0.015, white, side * 0.16 - 0.012, 0.07, 0.269, head);
    box(0.095, 0.025, 0.025, cream, side * 0.21, 0.14, 0.25, head);
    for (let i = 0; i < 2; i++)
      box(
        0.11,
        0.012,
        0.02,
        cream,
        side * 0.27,
        -0.08 - i * 0.055,
        0.255,
        head,
      );
  }
  // A small angular maze badge remains readable from the gameplay camera.
  box(0.14, 0.16, 0.025, teal, 0, 0.66, 0.16);
  box(0.065, 0.07, 0.012, fur, 0.015, 0.67, 0.18);
  const arms: T.Group[] = [],
    legs: T.Group[] = [];
  for (const side of [-1, 1]) {
    const a = new T.Group();
    a.position.set(side * 0.29, 0.79, 0);
    body.add(a);
    box(0.14, 0.34, 0.17, fur, 0, -0.15, 0, a);
    arms.push(a);
    const l = new T.Group();
    l.position.set(side * 0.13, 0.39, 0);
    body.add(l);
    box(0.15, 0.25, 0.17, fur, 0, -0.12, 0, l);
    box(0.18, 0.1, 0.24, fur, 0, -0.25, 0.045, l);
    legs.push(l);
  }
  const tail = new T.Group();
  tail.position.set(0, 0.43, -0.14);
  body.add(tail);
  let segment: T.Object3D = tail;
  const joints: T.Group[] = [];
  for (let i = 0; i < 7; i++) {
    const joint = new T.Group();
    joint.position.z = i === 0 ? 0 : -0.19;
    joint.rotation.x = i < 3 ? 0.3 : 0.55;
    segment.add(joint);
    box(
      0.17 - i * 0.012,
      0.16 - i * 0.01,
      0.24,
      i === 6 ? cream : fur,
      0,
      0,
      -0.09,
      joint,
    );
    segment = joint;
    joints.push(joint);
  }
  if (outfit === "explorer") {
    box(0.73, 0.055, 0.54, gold, 0, 0.29, 0, head);
    box(0.42, 0.18, 0.36, gold, 0, 0.4, 0, head);
    box(0.29, 0.29, 0.13, gold, 0, 0.66, -0.22);
  }
  if (outfit === "raincoat") {
    const yellow = mat(0xf4c94d);
    box(0.44, 0.37, 0.33, yellow, 0, 0.6, 0);
    box(0.15, 0.03, 0.025, teal, 0, 0.72, 0.18);
    for (const a of arms) box(0.17, 0.21, 0.2, yellow, 0, -0.08, 0, a);
  }
  if (outfit === "space") {
    const suit = mat(0xe8eff0);
    box(0.46, 0.39, 0.34, suit, 0, 0.61, 0);
    box(0.2, 0.15, 0.025, teal, 0, 0.64, 0.19);
    box(0.3, 0.3, 0.15, suit, 0, 0.65, -0.23);
  }
  let motion = 0,
    previous = 0;
  return {
    root,
    animate(time, speed, celebrate = false) {
      const dt = Math.max(0, Math.min(0.05, time - previous));
      previous = time;
      motion += (speed - motion) * (1 - Math.exp(-dt * 20));
      speed = motion;
      const stride = Math.sin(time * 12) * Math.min(1, speed) * 0.65;
      arms[0].rotation.x = stride;
      arms[1].rotation.x = -stride;
      legs[0].rotation.x = -stride;
      legs[1].rotation.x = stride;
      body.position.y = celebrate
        ? Math.abs(Math.sin(time * 5)) * 0.16
        : Math.sin(time * (speed > 0.05 ? 24 : 2)) *
          (speed > 0.05 ? 0.022 : 0.008);
      head.rotation.z = Math.sin(time * 2) * 0.025;
      tail.rotation.y = Math.sin(time * 3) * 0.12;
      for (let i = 0; i < joints.length; i++)
        joints[i].rotation.y = Math.sin(time * 2 - i * 0.5) * 0.035;
      if (celebrate) {
        arms[0].rotation.z = -2.2;
        arms[1].rotation.z = 2.2;
      } else {
        arms[0].rotation.z = 0.08;
        arms[1].rotation.z = -0.08;
      }
    },
    dispose() {
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
    },
  };
}
