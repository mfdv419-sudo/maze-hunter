import * as T from "three";
import { createBinturong, type Character } from "./character";
import {
  jumpHeight,
  JUMP_SECONDS,
  HIT_SECONDS,
  actionCooldown,
  shrubs,
  shrubKey,
  hitTargets,
  type ActionKind,
} from "./actions";
import {
  center,
  modernMaze,
  modernSettings,
  moveSliding,
  visibleCells,
  type Difficulty,
  type Point,
} from "./maze";
export interface ModernOptions {
  difficulty: Difficulty;
  seed: number;
  entrance: number;
  outfit: string;
  onTick: (seconds: number, explored: number) => void;
  onFinish: (won: boolean) => void;
  online?: boolean;
  onAction?: (kind: ActionKind) => Promise<boolean>;
  onFeedback?: (count: number) => void;
  onActionChange?: (kind: ActionKind, active: boolean) => void;
}
export class ModernGame {
  readonly maze;
  position: Point;
  angle = 0;
  paused = false;
  elapsed = 0;
  ended = false;
  outcome: "won" | "lost" | null = null;
  joystick = { x: 0, y: 0 };
  private renderer: T.WebGLRenderer;
  private scene = new T.Scene();
  private camera: T.OrthographicCamera;
  private hero: Character;
  private keys = new Set<string>();
  private last = 0;
  private time = 0;
  private acc = 0;
  private visionAcc = 1;
  private current = new Set<string>();
  readonly explored = new Set<string>();
  private walls: T.InstancedMesh;
  private floor: T.InstancedMesh;
  private marker: T.Group;
  private matrix = new T.Object3D();
  private peers = new Map<
    string,
    {
      character: Character;
      target: T.Vector3;
      angle: number;
      jumpAt: number;
      hitAt: number;
    }
  >();
  private observer: ResizeObserver;
  private abort = new AbortController();
  private drawnAngle = 0;
  private jumpStarted = -1000;
  private hitStarted = -1000;
  private broken: Record<string, boolean> = {};
  private shrubPoints: Point[] = [];
  private shrubMesh: T.InstancedMesh;
  private serverOffset = 0;
  private confirmedJump = 0;
  private confirmedHit = 0;
  get actionState() {
    return {
      jumping: this.elapsed - this.jumpStarted < JUMP_SECONDS,
      hitting: this.elapsed - this.hitStarted < HIT_SECONDS,
    };
  }
  useAction(kind: ActionKind) {
    if (this.paused || this.ended) return false;
    const field = kind === "jump" ? "jumpStarted" : "hitStarted";
    if ((this.elapsed - this[field]) * 1000 < actionCooldown[kind])
      return false;
    const previous = this[field];
    this[field] = this.elapsed;
    this.options.onActionChange?.(kind, true);
    if (this.options.online) {
      void this.options.onAction?.(kind).then((ok) => {
        if (!ok) this[field] = previous;
      });
    } else if (kind === "hit") {
      const targets = hitTargets(this.maze, this.position, this.broken);
      for (const q of targets) this.broken[shrubKey(q)] = true;
      this.options.onFeedback?.(targets.length);
      this.visionAcc = 1;
    }
    return true;
  }
  syncActions(
    players: Record<string, { jumpAt?: number; hitAt?: number }>,
    self: string,
    broken: Record<string, boolean>,
    now: number,
  ) {
    this.serverOffset = now - Date.now();
    const own = players[self];
    if (own?.jumpAt && own.jumpAt > this.confirmedJump) {
      this.confirmedJump = own.jumpAt;
      this.jumpStarted = this.elapsed - (now - own.jumpAt) / 1000;
    }
    if (own?.hitAt && own.hitAt > this.confirmedHit) {
      this.confirmedHit = own.hitAt;
      this.hitStarted = this.elapsed - (now - own.hitAt) / 1000;
    }
    this.broken = broken;
    for (const [key, p] of this.peers) {
      p.jumpAt = players[key]?.jumpAt || 0;
      p.hitAt = players[key]?.hitAt || 0;
    }
    this.visionAcc = 1;
  }

  constructor(
    private host: HTMLElement,
    private options: ModernOptions,
  ) {
    this.maze = modernMaze(options.difficulty, options.seed);
    this.position = center(this.maze.entrances[options.entrance % 4]);
    this.renderer = new T.WebGLRenderer({
      antialias: true,
      powerPreference: "low-power",
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.setClearColor(0x223b3b);
    host.append(this.renderer.domElement);
    this.camera = new T.OrthographicCamera(-6, 6, 6, -6, 0.1, 100);
    this.scene.add(new T.HemisphereLight(0xf9ffe4, 0x6c8b80, 2.4));
    const light = new T.DirectionalLight(0xffe7bd, 2.2);
    light.position.set(-4, 10, 7);
    this.scene.add(light);
    const n = this.maze.grid.length;
    const floorMat = new T.MeshLambertMaterial({ color: 0xffffff });
    this.floor = new T.InstancedMesh(
      new T.BoxGeometry(1, 0.06, 1),
      floorMat,
      n * n,
    );
    this.walls = new T.InstancedMesh(
      new T.BoxGeometry(0.99, 0.82, 0.99),
      new T.MeshLambertMaterial({ color: 0xffffff }),
      n * n,
    );
    this.walls.frustumCulled = false;
    this.floor.frustumCulled = false;
    this.scene.add(this.floor, this.walls);
    this.shrubPoints = shrubs(this.maze);
    this.shrubMesh = new T.InstancedMesh(
      new T.IcosahedronGeometry(0.19, 0),
      new T.MeshLambertMaterial({ color: 0x65ad5b, flatShading: true }),
      Math.max(1, this.shrubPoints.length * 3),
    );
    this.shrubMesh.frustumCulled = false;
    this.scene.add(this.shrubMesh);

    this.hero = createBinturong(options.outfit);
    this.hero.root.scale.setScalar(0.66);
    this.scene.add(this.hero.root);
    this.marker = new T.Group();
    const ring = new T.Mesh(
      new T.TorusGeometry(0.28, 0.07, 6, 16),
      new T.MeshBasicMaterial({ color: 0xf7c35b }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.12;
    this.marker.add(ring);
    this.marker.position.set(
      this.maze.finish.x + 0.5,
      0,
      this.maze.finish.y + 0.5,
    );
    this.scene.add(this.marker);
    // Entrance marks appear only after their cells have been discovered.
    window.addEventListener(
      "keydown",
      (e) => {
        if ([" ", "j", "J", "b", "B"].includes(e.key)) {
          e.preventDefault();
          if (!e.repeat) this.useAction(e.key === " " ? "jump" : "hit");
          return;
        }
        if (
          [
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "w",
            "a",
            "s",
            "d",
            "W",
            "A",
            "S",
            "D",
          ].includes(e.key)
        ) {
          e.preventDefault();
          this.keys.add(e.key.toLowerCase());
        }
      },
      { signal: this.abort.signal },
    );
    window.addEventListener(
      "keyup",
      (e) => this.keys.delete(e.key.toLowerCase()),
      { signal: this.abort.signal },
    );
    window.addEventListener("blur", () => this.clearInput(), {
      signal: this.abort.signal,
    });
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(host);
    this.resize();
    this.updateVision();
    this.renderer.setAnimationLoop((t) => this.frame(t));
  }
  private resize() {
    const w = this.host.clientWidth,
      h = this.host.clientHeight;
    this.renderer.setSize(w, h);
    const half = w < h ? 3.25 : 3.5;
    this.camera.left = (-half * w) / h;
    this.camera.right = (half * w) / h;
    this.camera.top = half;
    this.camera.bottom = -half;
    this.camera.updateProjectionMatrix();
  }
  clearInput() {
    this.keys.clear();
    this.joystick = { x: 0, y: 0 };
  }
  setPaused(v: boolean) {
    this.paused = v;
    this.clearInput();
  }
  setPeers(
    players: Record<
      string,
      {
        x: number;
        y: number;
        angle: number;
        outfit: string;
        slot: number;
        finishedAt: number | null;
      }
    >,
    self: string,
    coop: boolean,
  ) {
    for (const [key, p] of Object.entries(players)) {
      if (key === self) continue;
      let peer = this.peers.get(key);
      if (!peer) {
        const character = createBinturong(
          p.outfit,
          [0x434952, 0x826854, 0x586b82, 0x726181][p.slot % 4],
        );
        character.root.scale.setScalar(0.66);
        this.scene.add(character.root);
        peer = {
          character,
          target: new T.Vector3(p.x, 0, p.y),
          angle: p.angle,
          jumpAt: 0,
          hitAt: 0,
        };
        peer.character.root.position.copy(peer.target);
        this.peers.set(key, peer);
      }
      peer.target.set(p.x, 0, p.y);
      peer.angle = p.angle;
      const known = this.current.has(`${Math.floor(p.x)},${Math.floor(p.y)}`);
      peer.character.root.visible = coop || known;
    }
    for (const [key, p] of this.peers)
      if (!players[key]) {
        this.scene.remove(p.character.root);
        p.character.dispose();
        this.peers.delete(key);
      }
  }
  reveal(keys: string[]) {
    for (const k of keys) this.explored.add(k);
    this.visionAcc = 1;
  }
  reconcile(p: Point) {
    if (Math.hypot(this.position.x - p.x, this.position.y - p.y) > 0.6)
      this.position = { ...p };
  }
  private updateVision() {
    this.current = visibleCells(
      this.maze.grid,
      this.position,
      modernSettings[this.options.difficulty].vision,
    );
    for (const key of this.current) this.explored.add(key);
    const n = this.maze.grid.length,
      c = new T.Color();
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        const i = y * n + x,
          key = `${x},${y}`,
          seen = this.explored.has(key),
          lit = this.current.has(key);
        this.matrix.position.set(x + 0.5, -0.04, y + 0.5);
        this.matrix.scale.set(1, 1, 1);
        this.matrix.updateMatrix();
        this.floor.setMatrixAt(i, this.matrix.matrix);
        this.floor.setColorAt(
          i,
          c.set(lit ? 0xa8c58b : seen ? 0x647c65 : 0x223b3b),
        );
        const low =
          lit &&
          (x + 0.5 - this.position.x) * 0.57 +
            (y + 0.5 - this.position.y) * 0.82 >
            0.2 &&
          Math.hypot(x + 0.5 - this.position.x, y + 0.5 - this.position.y) <
            1.8;
        this.matrix.position.set(x + 0.5, low ? 0.12 : 0.41, y + 0.5);
        this.matrix.scale.setScalar(seen && this.maze.grid[y][x] === 1 ? 1 : 0);
        if (low) this.matrix.scale.y = 0.3;
        this.matrix.updateMatrix();
        this.walls.setMatrixAt(i, this.matrix.matrix);
        this.walls.setColorAt(i, c.set(lit ? 0xd9d6bd : 0x73827a));
      }
    this.shrubPoints.forEach((p, index) => {
      const visible =
        this.explored.has(`${Math.floor(p.x)},${Math.floor(p.y)}`) &&
        !this.broken[shrubKey(p)];
      for (let n = 0; n < 3; n++) {
        this.matrix.position.set(
          p.x + (n - 1) * 0.12,
          0.16 + (n === 1 ? 0.07 : 0),
          p.y,
        );
        this.matrix.scale.setScalar(visible ? 1 : 0);
        this.matrix.updateMatrix();
        this.shrubMesh.setMatrixAt(index * 3 + n, this.matrix.matrix);
      }
    });
    this.shrubMesh.instanceMatrix.needsUpdate = true;
    this.floor.instanceMatrix.needsUpdate = true;
    this.walls.instanceMatrix.needsUpdate = true;
    if (this.floor.instanceColor) this.floor.instanceColor.needsUpdate = true;
    if (this.walls.instanceColor) this.walls.instanceColor.needsUpdate = true;
    this.marker.visible = this.explored.has(
      `${this.maze.finish.x},${this.maze.finish.y}`,
    );
  }
  private frame(t: number) {
    const raw = this.last ? Math.max(0, (t - this.last) / 1000) : 0,
      dt = Math.min(raw, 0.05);
    this.last = t;
    this.time += dt;
    let actual = 0;
    const action = this.actionState;
    this.options.onActionChange?.("jump", action.jumping);
    this.options.onActionChange?.("hit", action.hitting);
    if (!this.paused && !this.ended) {
      this.elapsed += raw;
      let dx =
        (this.keys.has("d") || this.keys.has("arrowright") ? 1 : 0) -
        (this.keys.has("a") || this.keys.has("arrowleft") ? 1 : 0) +
        this.joystick.x;
      let dy =
        (this.keys.has("s") || this.keys.has("arrowdown") ? 1 : 0) -
        (this.keys.has("w") || this.keys.has("arrowup") ? 1 : 0) +
        this.joystick.y;
      const length = Math.hypot(dx, dy);
      if (length > 1) {
        dx /= length;
        dy /= length;
      }
      const before = this.position,
        azimuth = Math.atan2(4.5, 6.5),
        worldX = dx * Math.cos(azimuth) + dy * Math.sin(azimuth),
        worldY = -dx * Math.sin(azimuth) + dy * Math.cos(azimuth);
      this.position = moveSliding(
        this.maze.grid,
        this.position,
        worldX * 2.7 * dt,
        worldY * 2.7 * dt,
      );
      actual = dt
        ? Math.hypot(this.position.x - before.x, this.position.y - before.y) /
          dt
        : 0;
      if (actual > 0.05)
        this.angle = Math.atan2(
          this.position.x - before.x,
          this.position.y - before.y,
        );
      if (!this.options.online) {
        const f = center(this.maze.finish);
        if (Math.hypot(this.position.x - f.x, this.position.y - f.y) < 0.3) {
          this.ended = true;
          this.outcome = "won";
          this.options.onFinish(true);
        } else if (
          this.elapsed >= modernSettings[this.options.difficulty].seconds
        ) {
          this.ended = true;
          this.outcome = "lost";
          this.options.onFinish(false);
        }
      }
    }
    let diff = this.angle - this.drawnAngle;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    this.drawnAngle += diff * Math.min(1, dt * 15);
    this.hero.root.rotation.y = this.drawnAngle;
    this.hero.root.position.set(
      this.position.x,
      jumpHeight((this.elapsed - this.jumpStarted) / JUMP_SECONDS),
      this.position.y,
    );
    const shadow = this.hero.root.getObjectByName("ground-shadow");
    if (shadow) {
      shadow.position.y = 0.005 - this.hero.root.position.y;
      shadow.scale.setScalar(1 - this.hero.root.position.y * 0.25);
    }
    this.hero.animate(this.time, actual / 2.7, this.outcome === "won", {
      hit: Math.max(
        0,
        Math.min(1, (this.elapsed - this.hitStarted) / HIT_SECONDS),
      ),
    });
    for (const p of this.peers.values()) {
      const dist = p.character.root.position.distanceTo(p.target);
      p.character.root.position.lerp(p.target, Math.min(1, dt * 12));
      p.character.root.rotation.y = p.angle;
      const now = Date.now() + this.serverOffset;
      p.character.root.position.y = jumpHeight(
        (now - p.jumpAt) / 1000 / JUMP_SECONDS,
      );
      p.character.animate(this.time, Math.min(1, dist * 5), false, {
        hit: Math.max(0, Math.min(1, (now - p.hitAt) / 1000 / HIT_SECONDS)),
      });
    }
    const target = new T.Vector3(this.position.x, 0, this.position.y),
      desired = target.clone().add(new T.Vector3(4.5, 7, 6.5));
    if (!this.acc) this.camera.position.copy(desired);
    else this.camera.position.lerp(desired, 1 - Math.exp(-dt * 10));
    this.camera.lookAt(
      this.camera.position.x - 4.5,
      0,
      this.camera.position.z - 6.5,
    );
    this.acc += dt;
    this.visionAcc += dt;
    if (this.visionAcc > 0.12) {
      this.visionAcc = 0;
      this.updateVision();
      this.options.onTick(this.elapsed, this.explored.size);
    }
    this.renderer.render(this.scene, this.camera);
  }
  dispose() {
    this.renderer.setAnimationLoop(null);
    this.observer.disconnect();
    this.abort.abort();
    this.hero.dispose();
    for (const p of this.peers.values()) p.character.dispose();
    this.scene.traverse((o) => {
      if (o instanceof T.Mesh && !o.parent?.userData.character) {
        o.geometry.dispose();
        for (const m of Array.isArray(o.material) ? o.material : [o.material])
          m.dispose();
      }
    });
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
export function characterPreview(host: HTMLElement, outfit: string) {
  const renderer = new T.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  host.append(renderer.domElement);
  const scene = new T.Scene(),
    camera = new T.PerspectiveCamera(34, 1, 0.1, 30);
  camera.position.set(2.3, 1.6, 3.8);
  camera.lookAt(0, 0.75, 0);
  scene.add(new T.HemisphereLight(0xffffff, 0x7f9783, 3));
  const sun = new T.DirectionalLight(0xffe3ae, 2.5);
  sun.position.set(3, 5, 5);
  scene.add(sun);
  const hero = createBinturong(outfit);
  scene.add(hero.root);
  const ro = new ResizeObserver(() => {
    renderer.setSize(host.clientWidth, host.clientHeight);
    camera.aspect = host.clientWidth / host.clientHeight;
    camera.updateProjectionMatrix();
  });
  ro.observe(host);
  renderer.setAnimationLoop((t) => {
    hero.root.rotation.y = Math.sin(t * 0.0003) * 0.25;
    hero.animate(t / 1000, 0.18);
    renderer.render(scene, camera);
  });
  return () => {
    ro.disconnect();
    renderer.setAnimationLoop(null);
    hero.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
