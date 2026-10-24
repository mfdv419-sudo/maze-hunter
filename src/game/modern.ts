import {AdventureState} from "./adventure-state";
import {goldGate,seedGuardian,collectible} from "./adventure-props";
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
  color?: number;
  onTick: (seconds: number, explored: number) => void;
  onFinish: (won: boolean) => void;
  online?: boolean;
  adventureMap?: number;
  onAdventure?: (state:AdventureState)=>void;
  onAction?: (kind: ActionKind) => Promise<boolean>;
  onFeedback?: (count: number) => void;
  onActionChange?: (kind: ActionKind, active: boolean) => void;
}
export class ModernGame {
  readonly maze;
  readonly adventure?:AdventureState;
  private minimap?:HTMLCanvasElement;
  private mapPanel?:HTMLDivElement;
  private items:{kind:'seal'|'star'|'chest';index:number;point:Point;group:T.Group}[]=[];
  private guardModels:T.Group[]=[];
  private warningModels:T.Mesh[]=[];
  private riverModels:{point:Point;mesh:T.Mesh}[]=[];
  private grassModels:{point:Point;mesh:T.Mesh}[]=[];
  private cakes?:T.InstancedMesh;
  private cakeTops?:T.InstancedMesh;
  private fogRevision=0;
  private velocity={x:0,y:0};
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
    } else if(kind === "hit" && this.adventure) {
      this.adventure.throwCake(this.angle);
      this.visionAcc=1;
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
    if(options.adventureMap!==undefined&&!options.online)this.adventure=new AdventureState(options.difficulty,options.adventureMap,options.seed);
    this.maze = this.adventure ? {...this.adventure.layout.maze,grid:this.adventure.grid} : modernMaze(options.difficulty, options.seed);
    this.position = this.adventure ? {...this.adventure.position} : center(this.maze.entrances[options.entrance % 4]);
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

    this.hero = createBinturong(options.outfit,options.color);
    this.hero.root.scale.setScalar(0.66);
    this.scene.add(this.hero.root);
    this.marker = goldGate();
    this.marker.position.set(this.maze.finish.x+.5,0,this.maze.finish.y+.5);
    this.scene.add(this.marker);
    if(this.adventure) {
      const a=this.adventure;
      for(const kind of ['seal','star','chest'] as const) {
        const points=kind==='seal'?a.layout.seals:kind==='star'?a.layout.stars:a.layout.chests;
        points.forEach((p,index)=>{const group=collectible(kind);group.position.set(p.x+.5,0,p.y+.5);this.scene.add(group);this.items.push({kind,index,point:p,group});});
      }
      this.guardModels=a.guards.map(g=>{const model=seedGuardian(g.boss);this.scene.add(model);const warning=new T.Mesh(new T.RingGeometry(.22,.3,16),new T.MeshBasicMaterial({color:g.boss?0xffa068:0xffd57b,side:T.DoubleSide,transparent:true,opacity:.85}));warning.rotation.x=-Math.PI/2;warning.visible=false;this.scene.add(warning);this.warningModels.push(warning);return model;});
      for(const p of a.layout.rivers) {
        const mesh=new T.Mesh(new T.BoxGeometry(.99,.04,.99),new T.MeshLambertMaterial({color:0x3fadd4,emissive:0x16435b}));
        mesh.position.set(p.x+.5,.015,p.y+.5);this.scene.add(mesh);this.riverModels.push({point:p,mesh});
      }
      for(const p of a.layout.grass) {
        const mesh=new T.Mesh(new T.BoxGeometry(.92,.78,.92),new T.MeshLambertMaterial({color:0x4cbb6a,flatShading:true}));
        mesh.position.set(p.x+.5,.4,p.y+.5);this.scene.add(mesh);this.grassModels.push({point:p,mesh});
      }
      this.cakes=new T.InstancedMesh(new T.CylinderGeometry(.12,.12,.13,8),new T.MeshLambertMaterial({color:0xd79b72}),80);this.cakes.count=0;this.cakes.frustumCulled=false;this.scene.add(this.cakes);this.cakeTops=new T.InstancedMesh(new T.CylinderGeometry(.14,.14,.045,8),new T.MeshLambertMaterial({color:0xffd3df}),80);this.cakeTops.count=0;this.cakeTops.frustumCulled=false;this.scene.add(this.cakeTops);
      this.mapPanel=document.createElement('div');this.mapPanel.className='minimap-panel';
      this.mapPanel.innerHTML='<canvas width="180" height="180" aria-label="Minimap"></canvas>';
      this.minimap=this.mapPanel.querySelector('canvas')!;host.parentElement!.append(this.mapPanel);
    }
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
    const half = w < h ? 6 : 4.5;
    this.camera.left = (-half * w) / h;
    this.camera.right = (half * w) / h;
    this.camera.top = half;
    this.camera.bottom = -half;
    this.camera.updateProjectionMatrix();
  }
  clearInput() {
    this.keys.clear();
    this.joystick = { x: 0, y: 0 };
    this.velocity={x:0,y:0};
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
          c.set(lit ? (this.adventure?.layout.rivers.some(p=>p.x===x&&p.y===y)?0x398caf:0xa8c58b) : seen ? 0x647c65 : 0x223b3b),
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
    this.riverModels.forEach(({point:p,mesh})=>{mesh.visible=this.explored.has(`${p.x},${p.y}`);});
    this.grassModels.forEach(({point:p,mesh})=>{mesh.visible=this.explored.has(`${p.x},${p.y}`)&&!this.adventure?.broken.has(`${p.x},${p.y}`);});
    this.items.forEach(item=>{const set=item.kind==='seal'?this.adventure!.seals:item.kind==='star'?this.adventure!.stars:this.adventure!.chests;item.group.visible=this.explored.has(`${item.point.x},${item.point.y}`)&&!set.has(item.index);});
    this.paintMinimap();
    this.marker.visible = this.explored.has(
      `${this.maze.finish.x},${this.maze.finish.y}`,
    );
  }
  private paintMinimap() {
    if(!this.minimap)return;const ctx=this.minimap.getContext('2d')!;const n=this.maze.grid.length,unit=180/n;
    ctx.fillStyle='#102f3b';ctx.fillRect(0,0,180,180);
    for(const k of this.explored){const [x,y]=k.split(',').map(Number);ctx.fillStyle=this.maze.grid[y]?.[x]?'#536c69':this.current.has(k)?'#d4e1b3':'#709588';ctx.fillRect(x*unit,y*unit,Math.ceil(unit),Math.ceil(unit));}
    for(const item of this.items)if(item.group.visible){ctx.fillStyle=item.kind==='seal'?'#67e4df':item.kind==='star'?'#ffdb7b':'#e8a669';ctx.fillRect((item.point.x+.2)*unit,(item.point.y+.2)*unit,Math.max(3,unit*.6),Math.max(3,unit*.6));}
    for(const g of this.adventure?.guards||[])if(!g.dead&&this.current.has(`${Math.floor(g.position.x)},${Math.floor(g.position.y)}`)){ctx.fillStyle=g.boss?'#ffc363':'#e78b83';ctx.fillRect(g.position.x*unit-2,g.position.y*unit-2,4,4);}
    if(this.explored.has(`${this.maze.finish.x},${this.maze.finish.y}`)){ctx.fillStyle='#ffcb67';ctx.fillRect(this.maze.finish.x*unit,this.maze.finish.y*unit,unit,unit);}
    ctx.save();ctx.translate(this.position.x*unit,this.position.y*unit);ctx.rotate(Math.PI-this.angle);ctx.fillStyle='#fff8e1';ctx.beginPath();ctx.moveTo(0,-5);ctx.lineTo(3.5,4);ctx.lineTo(-3.5,4);ctx.closePath();ctx.fill();ctx.restore();
    if(this.mapPanel)this.mapPanel.dataset.explored=String(this.explored.size);
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
      const ease=1-Math.exp(-dt*(length>.02?13:18));
      this.velocity.x+=(worldX*2.7-this.velocity.x)*ease;
      this.velocity.y+=(worldY*2.7-this.velocity.y)*ease;
      if(this.adventure) {
        this.adventure.step(dt,raw,this.velocity.x,this.velocity.y,jumpHeight((this.elapsed-this.jumpStarted)/JUMP_SECONDS));
        this.elapsed=this.adventure.elapsed;this.position={...this.adventure.position};
        if(this.fogRevision!==this.adventure.resetFogRevision){this.fogRevision=this.adventure.resetFogRevision;this.explored.clear();}
      }else this.position=moveSliding(this.maze.grid,this.position,this.velocity.x*dt,this.velocity.y*dt);
      actual = dt
        ? Math.hypot(this.position.x - before.x, this.position.y - before.y) /
          dt
        : 0;
      if (actual > 0.05)
        this.angle = Math.atan2(
          this.position.x - before.x,
          this.position.y - before.y,
        );
      if(this.adventure&&this.adventure.phase!=='playing') {
        this.ended=true;this.outcome=this.adventure.phase==='won'?'won':'lost';this.options.onFinish(this.outcome==='won');
      } else if (!this.options.online&&!this.adventure) {
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
    if(this.adventure) {
      const a=this.adventure;
      this.guardModels.forEach((m,i)=>{const g=a.guards[i];m.visible=!g.dead&&this.current.has(`${Math.floor(g.position.x)},${Math.floor(g.position.y)}`);m.position.set(g.position.x,Math.sin(this.time*5+i)*.025,g.position.y);m.rotation.y=Math.atan2(this.position.x-g.position.x,this.position.y-g.position.y);m.rotation.z=g.telegraphUntil?Math.sin(this.time*15)*.08:0;const warning=this.warningModels[i];warning.visible=!!g.telegraphUntil&&m.visible;warning.position.set(g.aim.x,.04,g.aim.y);});
      this.items.forEach(item=>{if(item.kind!=='chest')item.group.rotation.y=this.time*.7;});
      if(this.cakes){this.cakes.count=Math.min(80,a.projectiles.length);a.projectiles.slice(0,80).forEach((cake,i)=>{this.matrix.position.set(cake.position.x,.42,cake.position.y);this.matrix.scale.setScalar(this.current.has(`${Math.floor(cake.position.x)},${Math.floor(cake.position.y)}`)?(cake.owner==='boss'?1.4:1):0);this.matrix.updateMatrix();this.cakes!.setMatrixAt(i,this.matrix.matrix);this.matrix.position.y=.5;this.matrix.updateMatrix();this.cakeTops!.setMatrixAt(i,this.matrix.matrix);});this.cakes.instanceMatrix.needsUpdate=true;this.cakeTops!.count=this.cakes.count;this.cakeTops!.instanceMatrix.needsUpdate=true;}
      const glow=this.marker.getObjectByName('portal-glow') as T.Mesh;
      (glow.material as T.MeshBasicMaterial).opacity=a.gateOpen?.8:.12;
      this.hero.root.visible=a.elapsed<a.invulnerableUntil?Math.floor(this.time*9)%2===0:true;
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
      if(this.adventure)this.options.onAdventure?.(this.adventure);
    }
    this.renderer.render(this.scene, this.camera);
  }
  dispose() {
    this.renderer.setAnimationLoop(null);
    this.observer.disconnect();
    this.abort.abort();
    this.mapPanel?.remove();
    const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();
    this.scene.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);if(o instanceof T.InstancedMesh)o.dispose();}});
    for(const g of geometries)g.dispose();for(const m of materials)m.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
export function characterPreview(host: HTMLElement, outfit: string,color?:number) {
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
  const hero = createBinturong(outfit,color);
  scene.add(hero.root);
  const ro = new ResizeObserver(() => {
    renderer.setSize(host.clientWidth, host.clientHeight);
    camera.aspect = host.clientWidth / host.clientHeight;
    camera.updateProjectionMatrix();
  });
  ro.observe(host);
  renderer.setAnimationLoop((t) => {
    hero.root.rotation.y = Math.sin(t * 0.0003) * 0.25;
    hero.root.rotation.y=.5+Math.sin(t*.0003)*.12;
    hero.animate(t / 1000, 0,false,{hit:0,lookUp:true});
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
