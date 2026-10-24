import * as T from "three";
export interface CharacterAction {
  hit: number;
  greet?: number;
  lookUp?: boolean;
}
export interface Character {
  root: T.Group;
  animate: (
    time: number,
    speed: number,
    celebrate?: boolean,
    action?: CharacterAction,
  ) => void;
  dispose: () => void;
}
/** An original, deliberately simple binturong: tapering muzzle, tufted ears,
 * three long whiskers each side, stocky body and an unmistakable prehensile tail. */
export function createBinturong(
  outfit = "classic",
  color = 0x343c45,
): Character {
  const root = new T.Group(),
    body = new T.Group();
  root.add(body);
  const materials: T.Material[] = [],
    geometries: T.BufferGeometry[] = [];
  const material = (c: number) => {
    const m = new T.MeshLambertMaterial({ color: c, flatShading: true });
    materials.push(m);
    return m;
  };
  const fur = material(color),
    grey = material(0x85918b),
    muzzle = material(0x626d6b),
    black = material(0x152b30),
    cream = material(0xf5edcd),
    teal = material(0x39c7ac),
    gold = material(0xf8bd4d);
  function mesh(
    g: T.BufferGeometry,
    m: T.Material,
    parent: T.Object3D,
    x: number,
    y: number,
    z: number,
  ) {
    geometries.push(g);
    const a = new T.Mesh(g, m);
    a.position.set(x, y, z);
    parent.add(a);
    return a;
  }
  const box = (
    w: number,
    h: number,
    d: number,
    m: T.Material,
    x: number,
    y: number,
    z: number,
    parent: T.Object3D = body,
  ) => mesh(new T.BoxGeometry(w, h, d), m, parent, x, y, z);
  const cone = (
    r: number,
    h: number,
    m: T.Material,
    x: number,
    y: number,
    z: number,
    parent: T.Object3D = body,
  ) => mesh(new T.ConeGeometry(r, h, 4), m, parent, x, y, z);
  // Low face count chamfers, not detailed fur or a smooth teddy bear sculpture.
  function chamfer(
    w: number,
    h: number,
    d: number,
    m: T.Material,
    x: number,
    y: number,
    z: number,
    parent: T.Object3D = body,
  ) {
    const r = 0.045,
      s = new T.Shape();
    s.moveTo(-w / 2 + r, -h / 2);
    s.lineTo(w / 2 - r, -h / 2);
    s.lineTo(w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r);
    s.lineTo(w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2);
    s.lineTo(-w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r);
    s.closePath();
    const g = new T.ExtrudeGeometry(s, {
      depth: d - 0.05,
      bevelEnabled: true,
      bevelSize: 0.025,
      bevelThickness: 0.025,
      bevelSegments: 1,
      steps: 1,
    });
    g.translate(0, 0, -(d - 0.05) / 2);
    return mesh(g, m, parent, x, y, z);
  }
  const shg = new T.CircleGeometry(0.28, 12);
  geometries.push(shg);
  const shm = new T.MeshBasicMaterial({
    color: 0x163c36,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
  });
  materials.push(shm);
  const shadow = new T.Mesh(shg, shm);
  shadow.name = "ground-shadow";
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.005;
  root.add(shadow);
  chamfer(0.46, 0.48, 0.34, fur, 0, 0.58, 0);
  box(0.2, 0.24, 0.02, muzzle, 0, 0.58, 0.19);
  const head = new T.Group();
  head.position.set(0, 0.99, 0.01);
  body.add(head);
  chamfer(0.62, 0.43, 0.43, fur, 0, 0, 0, head);
  // A narrow projecting snout, rather than a broad cream square bear muzzle.
  const noseBridge = mesh(
    new T.CylinderGeometry(0.1, 0.2, 0.26, 5),
    muzzle,
    head,
    0,
    -0.095,
    0.3,
  );
  noseBridge.rotation.x = Math.PI / 2;
  const nose = mesh(
    new T.SphereGeometry(0.065, 6, 4),
    black,
    head,
    0,
    -0.075,
    0.45,
  );
  nose.scale.set(1, 0.65, 0.6);
  const mouth = box(0.1, 0.012, 0.016, black, 0, -0.16, 0.4, head);
  mouth.rotation.z = -0.05;
  const eyes: T.Mesh[] = [];
  for (const side of [-1, 1]) {
    const e = mesh(
      new T.CylinderGeometry(0.077, 0.065, 0.09, 6),
      fur,
      head,
      side * 0.245,
      0.265,
      -0.015,
    );
    e.rotation.z = -side * 0.28;
    cone(0.055, 0.13, fur, side * 0.27, 0.36, -0.015, head);
    cone(0.045, 0.085, grey, side * 0.285, 0.305, 0.025, head);
    const brow = box(0.12, 0.033, 0.035, grey, side * 0.168, 0.1, 0.23, head);
    brow.rotation.z = side * 0.15;
    const eye = mesh(
      new T.SphereGeometry(0.055, 8, 5),
      cream,
      head,
      side * 0.16,
      0.025,
      0.235,
    );
    eye.scale.set(1, 1.15, 0.25);
    eyes.push(eye);
    const iris = mesh(
      new T.SphereGeometry(0.043, 8, 5),
      black,
      head,
      side * 0.16,
      0.02,
      0.252,
    );
    iris.scale.z = 0.3;
    eyes.push(iris);
    box(0.014, 0.019, 0.01, cream, side * 0.15, 0.038, 0.265, head);
    // Whiskers remain separate straight geometry: no dense strand rendering.
    for (let i = 0; i < 3; i++) {
      const whisker = box(
        0.2,
        0.012,
        0.014,
        cream,
        side * 0.27,
        -0.09 - i * 0.045,
        0.29,
        head,
      );
      whisker.rotation.z = side * (0.16 - i * 0.17);
    }
    cone(0.07, 0.12, fur, side * 0.285, -0.18, 0.06, head);
  }
  cone(0.055, 0.1, fur, -0.05, 0.265, 0.05, head);
  cone(0.04, 0.08, grey, 0.02, 0.245, 0.035, head);
  // Short teal neckerchief + tiny labyrinth badge form the original game identity.
  box(0.34, 0.07, 0.36, teal, 0, 0.81, 0.01);
  const scarf = cone(0.09, 0.17, teal, 0.1, 0.69, 0.23);
  scarf.rotation.z = -0.2;
  box(0.1, 0.11, 0.023, gold, -0.095, 0.59, 0.2);
  box(0.045, 0.055, 0.014, fur, -0.09, 0.6, 0.22);
  const arms: T.Group[] = [],
    legs: T.Group[] = [];
  for (const side of [-1, 1]) {
    const a = new T.Group();
    a.position.set(side * 0.3, 0.76, 0);
    body.add(a);
    chamfer(0.15, 0.29, 0.17, fur, 0, -0.12, 0, a);
    box(0.16, 0.11, 0.19, fur, 0, -0.27, 0.025, a);
    arms.push(a);
    const l = new T.Group();
    l.position.set(side * 0.14, 0.35, 0);
    body.add(l);
    box(0.16, 0.21, 0.18, fur, 0, -0.1, 0, l);
    chamfer(0.19, 0.1, 0.26, fur, 0, -0.24, 0.055, l);
    legs.push(l);
  }
  // The tail curls beside the silhouette and is visible from the menu camera.
  const tail = new T.Group();
  body.add(tail);
  const points = [
    new T.Vector3(0,.43,-.18),new T.Vector3(-.08,.33,-.44),
    new T.Vector3(-.25,.27,-.7),new T.Vector3(-.48,.3,-.91),
    new T.Vector3(-.63,.43,-1.07),new T.Vector3(-.64,.65,-1.2),
    new T.Vector3(-.48,.78,-1.28),new T.Vector3(-.31,.76,-1.25),
  ];
  const tailCurve=new T.CatmullRomCurve3(points);
  const tailRest=tailCurve.getPoints(16),tailLive=tailRest.map(p=>p.clone());
  const tailGeo=new T.CylinderGeometry(1,1,1,6);geometries.push(tailGeo);
  const tailPieces:T.Mesh[]=[],tailDirection=new T.Vector3(),tailMid=new T.Vector3(),tailAxis=new T.Vector3(0,1,0);
  for(let i=0;i<tailRest.length-1;i++) {const m=new T.Mesh(tailGeo,i>13?grey:fur);tail.add(m);tailPieces.push(m);}
  let tailLag=0,previousTurn=root.rotation.y;
  if (outfit === "explorer") {
    box(0.72, 0.05, 0.51, gold, 0, 0.27, 0, head);
    chamfer(0.4, 0.17, 0.33, gold, 0, 0.35, 0, head);
    chamfer(0.29, 0.27, 0.13, gold, 0, 0.59, -0.24);
  }
  if (outfit === "raincoat") {
    const yellow = material(0xf4c94d);
    chamfer(0.49, 0.37, 0.36, yellow, 0, 0.55, 0);
    for (const a of arms) box(0.18, 0.21, 0.21, yellow, 0, -0.08, 0, a);
    box(0.13, 0.03, 0.025, teal, 0, 0.71, 0.21);
  }
  if (outfit === "space") {
    const suit = material(0xe8eff0);
    chamfer(0.49, 0.37, 0.36, suit, 0, 0.55, 0);
    box(0.17, 0.12, 0.025, teal, 0, 0.62, 0.21);
    box(0.28, 0.28, 0.15, suit, 0, 0.59, -0.25);
  }
  let motion = 0,
    previous = 0;
  return {
    root,
    animate(time, speed, celebrate = false, action) {
      const dt = Math.max(0, Math.min(0.05, time - previous));
      previous = time;
      motion += (speed - motion) * (1 - Math.exp(-dt * 20));
      const stride = Math.sin(time * 12) * Math.min(1, motion) * 0.62;
      arms[0].rotation.x = stride;
      arms[1].rotation.x = -stride;
      legs[0].rotation.x = -stride;
      legs[1].rotation.x = stride;
      body.position.y = celebrate
        ? Math.abs(Math.sin(time * 5)) * 0.13
        : Math.sin(time * (motion > 0.05 ? 24 : 2)) *
          (motion > 0.05 ? 0.02 : 0.008);
      head.rotation.z = Math.sin(time * 2) * 0.025;
      head.rotation.x=action?.lookUp?-.28:0;
      const turn=Math.atan2(Math.sin(root.rotation.y-previousTurn),Math.cos(root.rotation.y-previousTurn));
      previousTurn=root.rotation.y;
      tailLag+=(Math.max(-.5,Math.min(.5,-turn*7))-tailLag)*(1-Math.exp(-dt*7));
      tailLive.forEach((p,i)=>{
        const u=i/(tailLive.length-1),base=tailRest[i];
        p.set(base.x+Math.sin(time*2.4-u*3.8)*.055*u+tailLag*u*u,base.y+Math.sin(time*2-u*3)*.035*u,base.z+Math.sin(time*2.1-u*4)*.085*u);
      });
      tailPieces.forEach((part,i)=>{
        const a=tailLive[i],b=tailLive[i+1],r=.085-i*.003;
        tailDirection.copy(b).sub(a);tailMid.copy(a).add(b).multiplyScalar(.5);
        part.position.copy(tailMid);part.scale.set(r,tailDirection.length()+.025,r);
        part.quaternion.setFromUnitVectors(tailAxis,tailDirection.normalize());
      });
      tail.rotation.y = Math.sin(time * 2.6) * 0.06;
      tail.rotation.z = Math.sin(time * 2) * 0.035;
      const blink = time % 4.4 > 4.24 ? 0.1 : 1;
      for (const eye of eyes) eye.scale.y = blink;
      const hit = action?.hit || 0;
      if (hit > 0) {
        arms[1].rotation.x = -Math.sin(hit * Math.PI) * 2.2;
        body.rotation.y = Math.sin(hit * Math.PI) * 0.18;
      } else body.rotation.y = 0;
      arms[0].rotation.z = celebrate ? -2.2 : 0.08;
      arms[1].rotation.z = celebrate ? 2.2 : -0.08;
      const greet = action?.greet;
      if (greet !== undefined) {
        const pulse = Math.sin(greet * Math.PI);
        arms[1].rotation.z = -0.08 + pulse * (2.1 + Math.sin(greet * Math.PI * 8) * 0.35);
        head.rotation.y = Math.sin(greet * Math.PI * 2) * 0.25;
        tail.rotation.z += Math.sin(greet * Math.PI * 6) * pulse * 0.25;
        body.position.y += Math.max(0, Math.sin(greet * Math.PI * 2)) * 0.15;
      } else head.rotation.y = 0;
    },
    dispose() {
      for (const g of geometries) g.dispose();
      for (const m of materials) m.dispose();
    },
  };
}
