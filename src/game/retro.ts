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
      penalized = false,
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
            penalized = false;
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
          if (!state.trace(q)) {
            if (!penalized) {
              state.mistake();
              penalized = true;
            }
            dragging = false;
            this.cameras.main.flash(90, 255, 145, 110);
          }
          paint.current();
        });
        const release = () => {
          dragging = false;
          panning = false;
          penalized = false;
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
          n = state.config.maze.grid.length;
        scale = Math.min((w - 28) / n, (h - 28) / n);
        ox = (w - n * scale) / 2;
        oy = (h - n * scale) / 2;
        owner.layout = { scale, ox, oy };
        if (owner.zoomLevel > 1) this.cameras.main.setBounds(0, 0, w, h);
        const g = this.gfx;
        g.clear();
        g.fillStyle(0x173f3e).fillRoundedRect(
          ox - 5,
          oy - 5,
          n * scale + 10,
          n * scale + 10,
          12,
        );
        for (let y = 0; y < n; y++)
          for (let x = 0; x < n; x++) {
            g.fillStyle(state.config.maze.grid[y][x] ? 0x173f3e : 0xe9edce);
            g.fillRect(
              ox + x * scale,
              oy + y * scale,
              scale + 0.5,
              scale + 0.5,
            );
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
        const f = state.config.maze.finish,
          s = state.config.maze.start;
        g.fillStyle(0x76bc93).fillCircle(
          ox + (s.x + 0.5) * scale,
          oy + (s.y + 0.5) * scale,
          scale * 0.29,
        );
        g.fillStyle(0xf2bb55).fillRoundedRect(
          ox + (f.x + 0.14) * scale,
          oy + (f.y + 0.14) * scale,
          scale * 0.72,
          scale * 0.72,
          3,
        );
        g.fillStyle(0xffffff).fillCircle(
          ox + state.position.x * scale,
          oy + state.position.y * scale,
          Math.max(3, scale * 0.19),
        );
        g.lineStyle(2, 0x255d56).strokeCircle(
          ox + state.position.x * scale,
          oy + state.position.y * scale,
          Math.max(3, scale * 0.19),
        );
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
      backgroundColor: "#f4f2e7",
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
    this.observer=new ResizeObserver(()=>{if(this.game.isBooted)this.game.scale.resize(host.clientWidth,host.clientHeight);});
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
