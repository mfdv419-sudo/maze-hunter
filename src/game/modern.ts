import {steer} from './movement';
import {vegetation,landmark} from './adventure-art';
import {zones} from './adventure-zones';
import type {AdventureSave} from './adventure-state';
import {WORLD_UNIT as U,groundTexture,forestTree,riverTile,icing} from "./world-art";
import {sfx,setAudioScene} from "../systems/audio";
import {readPreferences} from "../services/preferences";
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
  private grassModels:{point:Point;mesh:T.Group}[]=[];
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
  private world=new T.Group();
  private cameraYaw=0;
  private vegetationModels:T.Group[]=[];
  private hazardModels=new Map<number,T.Group>();
  private landmarkModels:{point:Point;group:T.Group}[]=[];
  private movementHeading=0;
  private daylight:T.HemisphereLight;
  private particleColor=new T.Color();
  private cameraMode=readPreferences().camera;
  private lookAt=new T.Vector3();
  private lastLook=0;
  private lookPointer:number|null=null;
  private lookX=0;
  private heroIcing=icing();
  private guardIcing:T.Group[]=[];
  private leaves?:T.InstancedMesh;
  private treeTrunks?:T.InstancedMesh;
  private treeCrowns?:T.InstancedMesh;
  private treePoints:Point[]=[];
  private dust?:T.InstancedMesh;
  private splats:{point:Point;at:number;color:number}[]=[];
  private effectCursor=0;
  private previousRespawns=0;
  private previousHits=0;
  private previousGuardHits:number[]=[];
  private stepDistance=0;
  private camera: T.PerspectiveCamera;
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
    if(kind==='hit'&&this.adventure&&!this.adventure.throwCake(this.angle))return false;
    const previous = this[field];
    this[field] = this.elapsed;
    this.options.onActionChange?.(kind, true);
    sfx(kind==='jump'?'jump':'throw');
    if (this.options.online) {
      void this.options.onAction?.(kind).then((ok) => {
        if (!ok) this[field] = previous;
      });
    } else if(kind === "hit" && this.adventure) {
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
    if(options.adventureMap!==undefined)this.adventure=new AdventureState(options.difficulty,options.adventureMap,options.seed);
    this.maze = this.adventure ? {...this.adventure.layout.maze,grid:this.adventure.grid} : modernMaze(options.difficulty, options.seed);
    this.position = this.adventure ? {...this.adventure.position} : center(this.maze.entrances[options.entrance % 4]);
    this.renderer = new T.WebGLRenderer({
      antialias: true,
      powerPreference: "low-power",
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.setClearColor(0xb4d6c3);
    this.scene.fog=new T.Fog(0xb4d6c3,10,24);
    this.world.scale.set(U,1,U);this.scene.add(this.world);
    host.append(this.renderer.domElement);
    this.camera = new T.PerspectiveCamera(52,1,.08,160);
    const startX=Math.floor(this.position.x),startY=Math.floor(this.position.y);
    this.cameraYaw=this.maze.grid[startY+1]?.[startX]===0?0:Math.PI/2;
    this.angle=this.drawnAngle=this.movementHeading=this.cameraYaw;
    this.daylight=new T.HemisphereLight(0xf9ffe4,0x6c8b80,2.4);this.scene.add(this.daylight);
    const light = new T.DirectionalLight(0xffe7bd, 2.2);
    light.position.set(-4, 10, 7);
    this.scene.add(light);
    const n = this.maze.grid.length;
    const floorMat = new T.MeshLambertMaterial({ color: 0xffffff,map:groundTexture('path') });
    this.floor = new T.InstancedMesh(
      new T.BoxGeometry(1, 0.06, 1),
      floorMat,
      n * n,
    );
    this.walls = new T.InstancedMesh(
      new T.BoxGeometry(0.99, 0.58, 0.99),
      new T.MeshLambertMaterial({ color: 0xffffff,map:groundTexture('leaf') }),
      n * n,
    );
    this.walls.frustumCulled = false;
    this.floor.frustumCulled = false;
    this.world.add(this.floor, this.walls);
    const earth=new T.Mesh(new T.PlaneGeometry(n+10,n+10),new T.MeshLambertMaterial({color:0x426b49,map:groundTexture('leaf')}));earth.rotation.x=-Math.PI/2;earth.position.set(n/2,-.095,n/2);this.world.add(earth);
    this.leaves=new T.InstancedMesh(new T.DodecahedronGeometry(.64,0),new T.MeshLambertMaterial({color:0x8db65d,flatShading:true}),n*n);this.leaves.frustumCulled=false;this.world.add(this.leaves);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(this.maze.grid[y][x]===1&&((x*7+y*11)%13===0||(x===0&&y%5===0)))this.treePoints.push({x,y});
    this.treeTrunks=new T.InstancedMesh(new T.CylinderGeometry(.045,.07,1.7,5),new T.MeshLambertMaterial({color:0x8f7351}),this.treePoints.length);this.treeCrowns=new T.InstancedMesh(new T.IcosahedronGeometry(.43,1),new T.MeshLambertMaterial({color:0x609347,flatShading:true}),this.treePoints.length);this.world.add(this.treeTrunks,this.treeCrowns);
    this.dust=new T.InstancedMesh(new T.SphereGeometry(.065,6,4),new T.MeshBasicMaterial({color:0xffe5d4,transparent:true,opacity:.75}),160);this.dust.frustumCulled=false;this.dust.count=0;this.world.add(this.dust);
    this.shrubPoints = this.adventure?[]:shrubs(this.maze);
    this.shrubMesh = new T.InstancedMesh(
      new T.IcosahedronGeometry(0.19, 0),
      new T.MeshLambertMaterial({ color: 0x65ad5b, flatShading: true }),
      Math.max(1, this.shrubPoints.length * 3),
    );
    this.shrubMesh.frustumCulled = false;
    this.world.add(this.shrubMesh);

    this.hero = createBinturong(options.outfit,options.color);
    this.hero.root.scale.set(.95/U,.95,.95/U);
    this.hero.root.add(this.heroIcing);
    this.world.add(this.hero.root);
    this.marker = goldGate();this.marker.scale.y=1.4;
    this.marker.position.set(this.maze.finish.x+.5,0,this.maze.finish.y+.5);
    this.world.add(this.marker);
    if(this.adventure) {
      const a=this.adventure;
      for(const kind of ['seal','star','chest'] as const) {
        const points=kind==='seal'?a.layout.seals:kind==='star'?a.layout.stars:a.layout.chests;
        points.forEach((p,index)=>{const group=collectible(kind);group.position.set(p.x+.5,0,p.y+.5);this.world.add(group);this.items.push({kind,index,point:p,group});});
      }
      this.ensureGuardModels();
      a.layout.areas.forEach(({point,zone})=>{const group=landmark(zone);group.position.set(point.x+.5,0,point.y+.5);if(zone!==5)group.position.x+=.65;this.world.add(group);this.landmarkModels.push({point,group});});
      a.layout.vegetation.forEach(p=>{const group=vegetation(p.kind);group.position.set(p.x+.5,0,p.y+.5);this.world.add(group);this.vegetationModels.push(group);});
      for(const p of a.layout.rivers) {
        const group=riverTile(!this.maze.grid[p.y][p.x-1]&&!this.maze.grid[p.y][p.x+1]);
        group.position.set(p.x+.5,0,p.y+.5);this.world.add(group);this.riverModels.push({point:p,mesh:group as unknown as T.Mesh});
      }
      for(const p of a.layout.grass) {
        const mesh=vegetation('shortcut');if(a.layout.secret?.x===p.x&&a.layout.secret?.y===p.y){const lock=new T.Mesh(new T.TorusGeometry(.09,.025,5,10),new T.MeshBasicMaterial({color:0xffd77e}));lock.position.y=.65;mesh.add(lock);}mesh.position.set(p.x+.5,0,p.y+.5);this.world.add(mesh);this.grassModels.push({point:p,mesh});
      }
      this.cakes=new T.InstancedMesh(new T.CylinderGeometry(.12,.12,.13,8),new T.MeshLambertMaterial({color:0xd79b72}),80);this.cakes.count=0;this.cakes.frustumCulled=false;this.world.add(this.cakes);this.cakeTops=new T.InstancedMesh(new T.CylinderGeometry(.14,.14,.045,8),new T.MeshLambertMaterial({color:0xffd3df}),80);this.cakeTops.count=0;this.cakeTops.frustumCulled=false;this.world.add(this.cakeTops);
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
          ["q","e","Q","E",
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
      (e) => {this.keys.delete(e.key.toLowerCase());},
      { signal: this.abort.signal },
    );
    window.addEventListener("blur", () => this.clearInput(), {
      signal: this.abort.signal,
    });
    host.addEventListener('contextmenu',e=>e.preventDefault(),{signal:this.abort.signal});
    host.addEventListener('pointerdown',e=>{const r=host.getBoundingClientRect();if(e.clientX<r.left+r.width*.5||e.clientY<r.top+130||this.paused)return;this.lookPointer=e.pointerId;this.lookX=e.clientX;host.setPointerCapture(e.pointerId);},{signal:this.abort.signal});
    host.addEventListener('pointermove',e=>{if(this.lookPointer===e.pointerId){this.cameraYaw-=(e.clientX-this.lookX)*.006;this.lookX=e.clientX;this.lastLook=this.time;}},{signal:this.abort.signal});
    for(const event of ['pointerup','pointercancel','lostpointercapture'])host.addEventListener(event,e=>{if((e as PointerEvent).pointerId===this.lookPointer)this.lookPointer=null;},{signal:this.abort.signal});
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
    this.camera.aspect=w/h;
    this.camera.fov=w<h?57:50;
    this.camera.updateProjectionMatrix();
  }
  beginMovement(){}
  endMovement(){}
  syncAdventure(save:AdventureSave){if(!this.adventure)return;const before=this.adventure.resetFogRevision;this.adventure.restore(save);this.elapsed=save.elapsed;this.position={...save.position};if(before!==save.resetFogRevision)this.explored.clear();this.visionAcc=1;}
  private ensureGuardModels(){if(!this.adventure)return;while(this.guardModels.length<this.adventure.guards.length){const g=this.adventure.guards[this.guardModels.length],model=seedGuardian(g.boss);const k=g.boss?1.35:g.sapling?.65:g.elite?1.15:1;model.scale.set(k/U,k,k/U);const cream=icing();model.add(cream);this.guardIcing.push(cream);this.world.add(model);this.guardModels.push(model);const warning=new T.Mesh(new T.RingGeometry(.2,.3,16),new T.MeshBasicMaterial({color:0xffbc7c,side:T.DoubleSide,transparent:true,opacity:.8}));warning.rotation.x=-Math.PI/2;this.world.add(warning);this.warningModels.push(warning);}}

  clearInput() {

    this.keys.clear();
    this.joystick = { x: 0, y: 0 };
    this.velocity={x:0,y:0};
  }
  setPaused(v: boolean) {
    this.paused = v;
    this.clearInput();
    this.options.onTick(this.elapsed,this.explored.size);
    if(this.adventure)this.options.onAdventure?.(this.adventure);
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
        character.root.scale.set(.95/U,.95,.95/U);
        this.world.add(character.root);
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
        this.world.remove(p.character.root);
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
    let floorCount=0,wallCount=0;
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        if(Math.hypot(x+.5-this.position.x,y+.5-this.position.y)>12)continue;
        const i = floorCount++,
          key = `${x},${y}`,
          seen = this.explored.has(key),
          lit = this.current.has(key);
        this.matrix.position.set(x + 0.5, -0.04, y + 0.5);
        this.matrix.scale.set(1, 1, 1);
        this.matrix.updateMatrix();
        this.floor.setMatrixAt(i, this.matrix.matrix);
        this.floor.setColorAt(
          i,
          c.set(lit ? (this.adventure?.layout.rivers.some(p=>p.x===x&&p.y===y)?0x6db2b2:zones[this.adventure?.layout.zoneCells[y]?.[x]??0].ground) : seen ? 0xa6b698 : 0x557b59),
        );
        if(this.maze.grid[y][x]!==1||this.adventure?.layout.grass.some(p=>p.x===x&&p.y===y))continue;
        const wi=wallCount++;
        this.matrix.position.set(x+.5,.29,y+.5);
        this.matrix.scale.setScalar(this.maze.grid[y][x]===1&&!this.adventure?.layout.grass.some(p=>p.x===x&&p.y===y)?1:0);
        this.matrix.updateMatrix();this.walls.setMatrixAt(wi,this.matrix.matrix);
        this.walls.setColorAt(wi,c.set(lit?(zones[this.adventure?.layout.zoneCells[y]?.[x]??0].hedge):seen?0x60865c:0x365c48));
        if(this.leaves){this.matrix.position.set(x+.5+Math.sin(x*7+y)*.05,.65,y+.5+Math.cos(x+y*5)*.04);this.matrix.rotation.y=(x*17+y*7)%7;this.matrix.scale.set(.8+(x%3)*.07,.65+(y%3)*.05,.8+(y%2)*.1);this.matrix.updateMatrix();this.leaves.setMatrixAt(wi,this.matrix.matrix);this.leaves.setColorAt(wi,c.set(lit?(zones[this.adventure?.layout.zoneCells[y]?.[x]??0].hedge):seen?0x819d7e:0x4f7257));this.matrix.rotation.set(0,0,0);}


      }
    this.floor.count=floorCount;this.walls.count=wallCount;if(this.leaves)this.leaves.count=wallCount;
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
    if(this.leaves){this.leaves.instanceMatrix.needsUpdate=true;if(this.leaves.instanceColor)this.leaves.instanceColor.needsUpdate=true;}
    this.treePoints.forEach((p,i)=>{const seen=this.explored.has(`${p.x},${p.y}`);this.matrix.position.set(p.x+.5,.85,p.y+.5);this.matrix.scale.setScalar(seen?1:0);this.matrix.updateMatrix();this.treeTrunks!.setMatrixAt(i,this.matrix.matrix);this.matrix.position.y=1.8;this.matrix.scale.y=seen?1.4:0;this.matrix.updateMatrix();this.treeCrowns!.setMatrixAt(i,this.matrix.matrix);});
    if(this.treeTrunks){this.treeTrunks.instanceMatrix.needsUpdate=true;this.treeCrowns!.instanceMatrix.needsUpdate=true;}
    this.shrubMesh.instanceMatrix.needsUpdate = true;
    this.floor.instanceMatrix.needsUpdate = true;
    this.walls.instanceMatrix.needsUpdate = true;
    if (this.floor.instanceColor) this.floor.instanceColor.needsUpdate = true;
    if (this.walls.instanceColor) this.walls.instanceColor.needsUpdate = true;
    this.riverModels.forEach(({point:p,mesh})=>{mesh.visible=this.explored.has(`${p.x},${p.y}`);});
    this.grassModels.forEach(({point:p,mesh})=>{mesh.visible=this.explored.has(`${p.x},${p.y}`)&&!this.adventure?.broken.has(`${p.x},${p.y}`);});
    this.items.forEach(item=>{const set=item.kind==='seal'?this.adventure!.seals:item.kind==='star'?this.adventure!.stars:this.adventure!.chests;item.group.visible=this.explored.has(`${item.point.x},${item.point.y}`)&&!set.has(item.index);});
    this.landmarkModels.forEach(({point,group})=>group.visible=this.current.has(`${point.x},${point.y}`));
    this.vegetationModels.forEach((group,i)=>{const p=this.adventure!.layout.vegetation[i];group.visible=this.current.has(`${p.x},${p.y}`)&&!this.adventure!.harvested.has(i);});
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
      const before = {...this.position},movement=steer(this.movementHeading,dx,dy,dt);
      this.movementHeading=movement.angle;this.angle=this.movementHeading;
      const worldX=movement.x,worldY=movement.y;
      const ease=1-Math.exp(-dt*(length>.02?13:18));
      this.velocity.x+=(worldX-this.velocity.x)*ease;
      this.velocity.y+=(worldY-this.velocity.y)*ease;
      if(this.adventure) {
        this.adventure.step(dt,raw,this.velocity.x,this.velocity.y,jumpHeight((this.elapsed-this.jumpStarted)/JUMP_SECONDS));
        this.elapsed=this.adventure.elapsed;this.position={...this.adventure.position};
        if(this.previousRespawns!==this.adventure.respawns){this.previousRespawns=this.adventure.respawns;this.acc=0;this.velocity={x:0,y:0};}
        if(this.fogRevision!==this.adventure.resetFogRevision){this.fogRevision=this.adventure.resetFogRevision;this.explored.clear();}
      }else this.position=moveSliding(this.maze.grid,this.position,this.velocity.x*dt,this.velocity.y*dt);
      actual = dt
        ? Math.hypot(this.position.x - before.x, this.position.y - before.y) /
          dt
        : 0;
      if(this.adventure&&this.adventure.phase!=='playing'&&!this.options.online) {
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
    this.stepDistance+=actual*dt;
    if(actual>.2&&this.stepDistance>.65&&!this.paused){this.stepDistance=0;sfx('step');this.splats.push({point:{...this.position},at:this.time,color:0xe6d2a5});}
    this.hero.animate(this.time, actual / 2.3, this.outcome === "won", {
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
      const a=this.adventure;this.ensureGuardModels();
      const dusk=a.stage==='boss'?(a.bossPhase===3?.7:.9):1;this.daylight.intensity+=(2.4*dusk-this.daylight.intensity)*Math.min(1,dt*2);const fog=this.scene.fog as T.Fog;fog.color.lerp(this.particleColor.set(a.stage==='boss'?0x8faaa8:a.stage==='escape'?0xd3c2a1:0xb4d6c3),Math.min(1,dt*2));this.renderer.setClearColor(fog.color);
      setAudioScene(a.stage==='escape'?'escape':a.stage==='boss'?'boss':a.zone>=4?'deep':'modern');
      this.heroIcing.visible=a.hits>0&&a.elapsed-a.lastHit<7;this.heroIcing.children.forEach((m,i)=>m.visible=i<(a.hits>=2?9:4));
      for(const event of a.effectEvents)if(event.id>this.effectCursor){this.splats.push({point:event.point,at:this.time,color:event.source==='river'?0x9de7e2:0xffe6dc});sfx(event.source==='river'?'water':'splat');this.effectCursor=event.id;}this.previousHits=a.hits;
      this.guardModels.forEach((m,i)=>{const g=a.guards[i];if(!g){m.visible=false;this.warningModels[i].visible=false;return;}this.guardIcing[i].visible=g.hits>0&&a.elapsed-g.lastHit<7;this.guardIcing[i].children.forEach((m,j)=>m.visible=j<(g.hits%3===1?4:9));this.previousGuardHits[i]=g.hits;m.visible=!g.dead&&this.current.has(`${Math.floor(g.position.x)},${Math.floor(g.position.y)}`);m.position.set(g.position.x,Math.sin(this.time*5+i)*.025,g.position.y);m.rotation.y=Math.atan2(this.position.x-g.position.x,this.position.y-g.position.y);m.rotation.z=g.telegraphUntil?Math.sin(this.time*15)*.08:0;if(g.boss){m.rotation.y+=a.hazards.some(h=>h.kind==='spin'&&!h.resolved)?Math.sin(this.time*12)*.4:0;m.traverse(o=>{if(o.name==='king-eye'&&o instanceof T.Mesh)(o.material as T.MeshBasicMaterial).color.set(a.bossPhase===3?0xffd67f:0xb7f5be);});}const warning=this.warningModels[i];warning.visible=!!g.telegraphUntil&&m.visible;warning.position.set(g.aim.x,.04,g.aim.y);});
      for(const {mesh} of this.grassModels){const ring=mesh.getObjectByName('interaction-ring');if(ring)ring.visible=mesh.position.distanceTo(this.hero.root.position)<1.4;mesh.rotation.z=Math.sin(this.time*2+mesh.position.x)*.025;}
      this.vegetationModels.forEach((m,i)=>{m.rotation.z=Math.sin(this.time*2+i)*.035;const ring=m.getObjectByName('interaction-ring');if(ring)ring.visible=a.layout.vegetation[i].kind!=='normal'&&m.position.distanceTo(this.hero.root.position)<1.1;const glow=m.getObjectByName('rare-glow');if(glow)glow.position.y=.12+Math.sin(this.time*2)*.06;});
      const alive=new Set(a.hazards.map(h=>h.id));for(const [id,g]of this.hazardModels)if(!alive.has(id)){this.world.remove(g);g.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();(o.material as T.Material).dispose();}});this.hazardModels.delete(id);}
      for(const h of a.hazards){let g=this.hazardModels.get(h.id);if(!g){g=new T.Group();const mat=new T.MeshBasicMaterial({color:h.kind==='roots'?0x91d599:0xffa77a,transparent:true,opacity:.65,side:T.DoubleSide});const m=new T.Mesh(new T.RingGeometry(h.radius*.83,h.radius,28),mat);m.rotation.x=-Math.PI/2;g.add(m);if(h.kind==='charge'||h.kind==='vine'){const length=Math.hypot(h.point.x-h.from.x,h.point.y-h.from.y),line=new T.Mesh(new T.BoxGeometry(h.radius*2,.015,length),mat.clone());line.position.set((h.from.x-h.point.x)/2,.01,(h.from.y-h.point.y)/2);line.rotation.y=Math.atan2(h.point.x-h.from.x,h.point.y-h.from.y);g.add(line);}const impact=new T.Mesh(new T.ConeGeometry(.12,1,5),new T.MeshLambertMaterial({color:0x89674d}));impact.name='impact';g.add(impact);this.world.add(g);this.hazardModels.set(h.id,g);}g.position.set(h.point.x,.04,h.point.y);g.visible=this.current.has(`${Math.floor(h.point.x)},${Math.floor(h.point.y)}`);const impact=g.getObjectByName('impact')!;impact.visible=h.resolved;impact.position.y=h.resolved?.3:3;g.children[0].scale.setScalar(1+Math.sin(this.time*10)*.04);}
      this.items.forEach(item=>{if(item.kind!=='chest')item.group.rotation.y=this.time*.7;});
      this.riverModels.forEach(({mesh})=>mesh.children.forEach((r,i)=>{if(r.name==='water-ripple'){r.position.x=(i-3)*.15+Math.sin(this.time*1.3+i)*.07;}}));
      if(this.cakes){this.cakes.count=Math.min(80,a.projectiles.length);a.projectiles.slice(0,80).forEach((cake,i)=>{this.matrix.position.set(cake.position.x,.42,cake.position.y);this.matrix.scale.setScalar(this.current.has(`${Math.floor(cake.position.x)},${Math.floor(cake.position.y)}`)?(cake.owner==='boss'?1.4:1):0);this.matrix.updateMatrix();this.cakes!.setMatrixAt(i,this.matrix.matrix);this.matrix.position.y=.5;this.matrix.updateMatrix();this.cakeTops!.setMatrixAt(i,this.matrix.matrix);});this.cakes.instanceMatrix.needsUpdate=true;this.cakeTops!.count=this.cakes.count;this.cakeTops!.instanceMatrix.needsUpdate=true;}
      const glow=this.marker.getObjectByName('portal-glow') as T.Mesh;
      (glow.material as T.MeshBasicMaterial).opacity=a.gateOpen?.65+Math.sin(this.time*3)*.18:.12;this.marker.scale.set(a.gateOpen?1.45:1,a.gateOpen?1.8:1.4,a.gateOpen?1.45:1);
      this.hero.root.visible=a.elapsed<a.invulnerableUntil?Math.floor(this.time*9)%2===0:true;
    }
    if(!this.paused){if(this.keys.has('q')){this.cameraYaw+=dt*1.7;this.lastLook=this.time;}if(this.keys.has('e')){this.cameraYaw-=dt*1.7;this.lastLook=this.time;}}
    if(actual>.15&&this.lookPointer===null&&this.time-this.lastLook>2&&!this.keys.has('q')&&!this.keys.has('e')){const turn=Math.atan2(Math.sin(this.angle-this.cameraYaw),Math.cos(this.angle-this.cameraYaw));this.cameraYaw+=turn*(1-Math.exp(-dt*2.2));}
    const mode=this.cameraMode;
    const target=new T.Vector3(this.position.x*U,1,this.position.y*U);
    const distance=mode==='overview'?4.3:(this.host.clientWidth<this.host.clientHeight?5.2:5.8),height=mode==='overview'?5.1:(distance+1)*Math.tan(35*Math.PI/180);
    const desired=target.clone().add(new T.Vector3(-Math.sin(this.cameraYaw)*distance,height,-Math.cos(this.cameraYaw)*distance));
    // Shorten the camera arm before it enters a hedge; never clip through terrain.
    const arm=desired.clone().sub(target),steps=Math.ceil(arm.length()/.15);
    for(let i=1;i<=steps;i++){const p=target.clone().addScaledVector(arm,i/steps),x=Math.floor(p.x/U),y=Math.floor(p.z/U);if(p.y<1.2&&this.maze.grid[y]?.[x]===1){desired.copy(target).addScaledVector(arm,Math.max(.22,(i-1)/steps));desired.y=Math.max(desired.y,1.55);break;}}
    if(!this.acc){this.camera.position.copy(desired);this.lookAt.copy(target);}else{this.camera.position.lerp(desired,1-Math.exp(-dt*9));this.lookAt.lerp(target,1-Math.exp(-dt*12));}
    this.camera.lookAt(this.lookAt.x+Math.sin(this.cameraYaw)*1.0,this.lookAt.y,this.lookAt.z+Math.cos(this.cameraYaw)*1.0);
    if(this.dust){const effects=this.splats.filter(e=>this.time-e.at<.75);this.splats=effects;let count=0;for(const effect of effects)for(let j=0;j<6&&count<160;j++){
      const age=this.time-effect.at,a=j/6*Math.PI*2;this.matrix.position.set(effect.point.x+Math.cos(a)*age*.35,.15+Math.sin(age*4)*.25,effect.point.y+Math.sin(a)*age*.35);this.matrix.scale.setScalar((1-age/.75)*(.6+j%2*.3));this.matrix.updateMatrix();this.dust.setMatrixAt(count,this.matrix.matrix);this.dust.setColorAt(count,this.particleColor.set(effect.color));count++;
    }this.dust.count=count;this.dust.instanceMatrix.needsUpdate=true;if(this.dust.instanceColor)this.dust.instanceColor.needsUpdate=true;}
    this.acc += dt;
    this.visionAcc += dt;
    if (this.visionAcc > 0.12) {
      this.visionAcc = 0;
      this.updateVision();
      this.options.onTick(this.elapsed, this.explored.size);
      if(this.adventure)this.options.onAdventure?.(this.adventure);
    }
    this.host.dataset.heading=String(this.angle);this.host.dataset.x=String(this.position.x);this.host.dataset.y=String(this.position.y);this.host.dataset.cameraYaw=String(this.cameraYaw);
    this.renderer.render(this.scene, this.camera);
  }
  dispose() {
    this.renderer.setAnimationLoop(null);
    this.observer.disconnect();
    this.abort.abort();
    this.mapPanel?.remove();
    const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();
    this.scene.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);if(o instanceof T.InstancedMesh)o.dispose();}});
    for(const g of geometries)g.dispose();for(const m of materials){if((m as T.MeshLambertMaterial).map)(m as T.MeshLambertMaterial).map!.dispose();m.dispose();}
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
export function characterPreview(host: HTMLElement, outfit: string,color?:number) {
  const renderer = new T.WebGLRenderer({
    alpha: false,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  host.append(renderer.domElement);
  const scene = new T.Scene(),
    camera = new T.PerspectiveCamera(34, 1, 0.1, 30);
  camera.position.set(0,1.0,3.6);camera.lookAt(0,.7,0);
  renderer.setClearColor(0x83b29a);
  const ground=new T.Mesh(new T.CircleGeometry(3,32),new T.MeshLambertMaterial({color:0x9cb67b,map:groundTexture('leaf')}));ground.rotation.x=-Math.PI/2;ground.position.y=-.04;scene.add(ground);
  for(const side of [-1,1]){const tree=forestTree(side);tree.position.set(side*1.6,0,-2);tree.scale.setScalar(1.4);scene.add(tree);}
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
    hero.root.rotation.y=Math.sin(t*.0003)*.06;
    hero.animate(t/1000,0);
    renderer.render(scene, camera);
  });
  return () => {
    ro.disconnect();
    renderer.setAnimationLoop(null);
    const geos=new Set<T.BufferGeometry>(),mats=new Set<T.Material>();scene.traverse(o=>{if(o instanceof T.Mesh){geos.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])mats.add(m);}});for(const g of geos)g.dispose();for(const m of mats){(m as T.MeshLambertMaterial).map?.dispose();m.dispose();}
    renderer.dispose();
    renderer.domElement.remove();
  };
}
