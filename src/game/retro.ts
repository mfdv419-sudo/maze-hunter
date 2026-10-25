import {retroViewport} from "./retro-board";
import {drawBinturong,drawFigs} from "./retro-art";
import Phaser from "phaser";
import { RetroState } from "./retro-state";
export interface RetroOptions {
  level: number;
  onTick: (state: RetroState) => void;
  onFinish: (state: RetroState) => void;
}
export class RetroGame {
  readonly state: RetroState;
  private game: Phaser.Game;
  private scene?: Phaser.Scene;
  private zoomLevel = 1;
  private observer: ResizeObserver;
  private layout = { scale: 1, ox: 0, oy: 0 };
  constructor(host: HTMLElement, options: RetroOptions) {
    const owner = this;
    const state = (this.state = new RetroState(options.level));
    let reported = false,
      dragging = false,

      panning = false,
      lastPan = { x: 0, y: 0 };
    let scale = 1,
      ox = 0,
      oy = 0;
    const paint = { current: () => {} };
    class TraceScene extends Phaser.Scene {
      private gfx!: Phaser.GameObjects.Graphics;
      private lastTick = performance.now();
      constructor() {
        super("RetroTrace");
      }
      create() {
        owner.scene = this;
        this.gfx = this.add.graphics();
        this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
          if (
            state.phase === "won" ||
            state.phase === "lost" ||
            state.phase === "paused"
          )
            return;
          const world = this.cameras.main.getWorldPoint(p.x, p.y);
          const q = { x: (world.x - ox) / scale, y: (world.y - oy) / scale };
          if (
            Math.hypot(q.x - state.position.x, q.y - state.position.y) < 0.6
          ) {
            state.start();
            dragging = true;

          } else if (owner.zoomLevel > 1) {
            panning = true;
            lastPan = { x: p.x, y: p.y };
          }
        });
        this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
          if (panning && p.isDown) {
            this.cameras.main.scrollX -= (p.x - lastPan.x) / owner.zoomLevel;
            this.cameras.main.scrollY -= (p.y - lastPan.y) / owner.zoomLevel;
            lastPan = { x: p.x, y: p.y };
            return;
          }
          if (!dragging || !p.isDown || state.phase !== "playing") return;
          const world = this.cameras.main.getWorldPoint(p.x, p.y);
          const q = { x: (world.x - ox) / scale, y: (world.y - oy) / scale };
          const previousResets=state.resets;
          state.trace(q);
          if(state.resets!==previousResets) {
            dragging=false;
            this.cameras.main.flash(140,255,180,90);
          }
          paint.current();
        });
        const release = () => {
          dragging = false;
          panning = false;

        };
        this.input.on("pointerup", release);
        this.input.on("gameout", release);
        this.game.canvas.addEventListener("pointercancel", release);
        this.events.once("shutdown", () =>
          this.game.canvas.removeEventListener("pointercancel", release),
        );
        this.scale.on("resize", () => paint.current());
        paint.current = () => this.draw();
        paint.current();
      }
      draw() {
        const w = this.scale.width,
          h = this.scale.height,
          n = state.board.size;
        const fit=retroViewport(w,h,n);scale=fit.scale;ox=fit.ox;oy=fit.oy;
        owner.layout = { scale, ox, oy };
        if (owner.zoomLevel > 1) this.cameras.main.setBounds(0, 0, w, h);
        const g = this.gfx;
        g.clear();
        const theme=Math.floor((state.level-1)/10)%3,wallColor=[0x556b68,0x5a8460,0x927052][theme];
        g.fillStyle(0x234c46).fillRoundedRect(ox-9,oy-9,n*scale+18,n*scale+18,16);
        for(let y=0;y<n;y++)for(let x=0;x<n;x++){
          const px=ox+x*scale,py=oy+y*scale,walls=state.board.walls[y][x];

          if(walls===15){g.fillStyle(0x46664c).fillRect(px,py,scale,scale);g.fillStyle(0x71915a,.7).fillCircle(px+scale*.5,py+scale*.5,scale*.35);continue;}
          g.fillStyle(0xe5d8b1).fillRect(px,py,scale,scale);g.fillStyle(0xb3a887,.35).fillCircle(px+scale*.3,py+scale*.65,Math.max(.7,scale*.025));
          const edge=(ax:number,ay:number,bx:number,by:number)=>{g.lineStyle(Math.max(3,scale*.09),wallColor,1).lineBetween(ax,ay,bx,by);g.lineStyle(Math.max(1,scale*.025),theme===0?0xa9bbb0:theme===1?0x9ebc7d:0xc9a774,.8).lineBetween(ax+.8,ay+.8,bx+.8,by+.8);};
          if(walls&1)edge(px,py,px+scale,py);if(walls&8)edge(px,py,px,py+scale);
          if((walls&2)&&x===n-1)edge(px+scale,py,px+scale,py+scale);
          if((walls&4)&&y===n-1)edge(px,py+scale,px+scale,py+scale);
        }
        if (state.path.length > 1) {
          g.lineStyle(Math.max(3, scale * 0.2), 0x4caa94, 1);
          g.beginPath();
          state.path.forEach((p, i) =>
            i
              ? g.lineTo(ox + p.x * scale, oy + p.y * scale)
              : g.moveTo(ox + p.x * scale, oy + p.y * scale),
          );
          g.strokePath();
        }
        this.game.canvas.dataset.goalRevealed='true';this.game.canvas.dataset.explored=String(state.explored.size);
        const f=state.board.finish,s=state.board.start;
        drawFigs(g,ox+(f.x+.5)*scale,oy+(f.y+.5)*scale,scale*.75);
        drawBinturong(g,ox+(s.x+.5)*scale,oy+(s.y+.5)*scale,scale*.65,.2);
        drawBinturong(g,ox+state.position.x*scale,oy+state.position.y*scale,scale*.65);

      }
      update() {
        const now = performance.now();
        state.tick((now - this.lastTick) / 1000);
        this.lastTick = now;
        options.onTick(state);
        if (!reported && (state.phase === "won" || state.phase === "lost")) {
          reported = true;
          dragging = false;
          options.onFinish(state);
        }
      }
    }
    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host,
      backgroundColor: "#244d47",
      antialias: true,
      roundPixels: false,
      scale: {
        mode: Phaser.Scale.RESIZE,
        width: host.clientWidth,
        height: host.clientHeight,
      },
      scene: TraceScene,
      render: { powerPreference: "low-power" },
    });
    this.scene = this.game.scene.getScene("RetroTrace");
    this.observer = new ResizeObserver(() => {
      if (this.game.isBooted)
        this.game.scale.resize(host.clientWidth, host.clientHeight);
    });
    this.observer.observe(host);
  }
  zoom(delta: number) {
    this.zoomLevel = Math.max(1, Math.min(3, this.zoomLevel + delta));
    const cam = this.scene?.cameras.main;
    if (!cam) return;
    cam.setZoom(this.zoomLevel);
    const { scale, ox, oy } = this.layout;
    cam.setBounds(0, 0, this.scene!.scale.width, this.scene!.scale.height);
    cam.centerOn(
      ox + this.state.position.x * scale,
      oy + this.state.position.y * scale,
    );
  }
  setPaused(v: boolean) {
    if (v && this.state.phase === "playing") this.state.phase = "paused";
    else if (!v && this.state.phase === "paused") this.state.phase = "playing";
    this.scene?.input?.resetPointers();
  }
  dispose() {
    this.observer.disconnect();
    this.game.destroy(true);
  }
}
