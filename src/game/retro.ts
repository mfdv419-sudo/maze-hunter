import {retroViewport,retroToScreen,retroFromScreen,type RetroViewport} from "./retro-board";
import {drawBinturong,drawFigs,drawMapGate} from "./retro-art";
import Phaser from "phaser";
import { RetroState } from "./retro-state";
export interface RetroOptions {
  level: number;
  language?:'id'|'en';
  onTick: (state: RetroState) => void;
  onFinish: (state: RetroState) => void;
}
export class RetroGame {
  readonly state: RetroState;
  private game: Phaser.Game;
  private scene?: Phaser.Scene;
  private zoomLevel = 1;
  private observer: ResizeObserver;
  private layout?:RetroViewport;
  constructor(host: HTMLElement, options: RetroOptions) {
    const owner = this;
    const state = (this.state = new RetroState(options.level));
    let reported = false,
      dragging = false,

      panning = false,
      transitioning=false,
      renderedRevision=state.mapRevision,
      lastPan = { x: 0, y: 0 };
    let scale = 1;
    let view=retroViewport(host.clientWidth,host.clientHeight,state.board.width,state.board.height);
    const paint = { current: () => {} };
    class TraceScene extends Phaser.Scene {
      private gfx!: Phaser.GameObjects.Graphics;
      private lastTick = performance.now();
      constructor() {
        super("RetroTrace");
      }
      create() {
        owner.scene = this;
        state.start();
        this.lastTick=performance.now();
        this.gfx = this.add.graphics();
        this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
          if (transitioning)return;
          if (
            state.phase === "won" ||
            state.phase === "lost" ||
            state.phase === "paused"
          )
            return;
          const world = this.cameras.main.getWorldPoint(p.x, p.y);
          const q = retroFromScreen(world,view);
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
          if(transitioning)return;
          if (panning && p.isDown) {
            this.cameras.main.scrollX -= (p.x - lastPan.x) / owner.zoomLevel;
            this.cameras.main.scrollY -= (p.y - lastPan.y) / owner.zoomLevel;
            lastPan = { x: p.x, y: p.y };
            return;
          }
          if (!dragging || !p.isDown || state.phase !== "playing") return;
          const world = this.cameras.main.getWorldPoint(p.x, p.y);
          const q = retroFromScreen(world,view);
          const previousResets=state.resets,previousMap=state.mapRevision;
          state.trace(q);
          if(state.resets!==previousResets) {
            dragging=false;
            this.cameras.main.flash(140,255,180,90);
          }
          if(state.mapRevision!==previousMap){this.changeMap();return;}
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
      changeMap(){
        dragging=false;panning=false;transitioning=true;
        const banner=document.createElement('div');banner.className='retro-page-banner';banner.textContent=`${options.language==='en'?'MAP':'PETA'} ${state.pageIndex+1}/${state.boards.length}`;host.append(banner);
        const reveal=()=>{owner.zoomLevel=1;this.cameras.main.setZoom(1).setScroll(0,0);paint.current();};
        if(matchMedia('(prefers-reduced-motion: reduce)').matches){reveal();transitioning=false;banner.remove();return;}
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,()=>{reveal();this.cameras.main.fadeIn(240,36,77,71);this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE,()=>{transitioning=false;banner.remove();});});this.cameras.main.fadeOut(170,36,77,71);
      }
      draw() {
        const w=this.scale.width,h=this.scale.height,board=state.board;
        view=retroViewport(w,h,board.width,board.height);scale=view.scale;owner.layout=view;renderedRevision=state.mapRevision;
        if(owner.zoomLevel>1)this.cameras.main.setBounds(0,0,w,h);
        const g=this.gfx;g.clear();
        const left=view.ox,top=view.oy,mw=view.cols*view.sx,mh=view.rows*view.sy,wallColor=0x315653;
        g.fillStyle(0x122f35,.32).fillRoundedRect(left-9,top-5,mw+18,mh+18,12);
        g.fillStyle(0x94b6a1).fillRoundedRect(left-7,top-7,mw+14,mh+14,10);
        g.fillStyle(0xfff0cb).fillRect(left,top,mw,mh);
        const screen=(x:number,y:number)=>retroToScreen({x,y},view);
        for(let y=0;y<board.height;y++)for(let x=0;x<board.width;x++){
          const walls=board.walls[y][x];
          if(walls===15){const a=screen(x,y),b=screen(x+1,y+1);g.fillStyle(wallColor).fillRect(Math.min(a.x,b.x),Math.min(a.y,b.y),Math.abs(b.x-a.x),Math.abs(b.y-a.y));continue;}
          const edge=(ax:number,ay:number,bx:number,by:number)=>{const a=screen(ax,ay),b=screen(bx,by);g.lineStyle(Math.max(1.6,Math.min(3.5,scale*.11)),wallColor,1).lineBetween(a.x,a.y,b.x,b.y);};
          if(walls&1)edge(x,y,x+1,y);if(walls&8)edge(x,y,x,y+1);
          if((walls&2)&&x===board.width-1)edge(x+1,y,x+1,y+1);
          if((walls&4)&&y===board.height-1)edge(x,y+1,x+1,y+1);
        }
        if(state.path.length>1){g.lineStyle(Math.max(3,scale*.18),0x63bba3,.85);g.beginPath();state.path.forEach((p,i)=>{const a=retroToScreen(p,view);i?g.lineTo(a.x,a.y):g.moveTo(a.x,a.y);});g.strokePath();}
        const canvas=this.game.canvas;Object.assign(canvas.dataset,{page:String(state.pageIndex+1),pages:String(state.boards.length),target:state.finalPage?'figs':'gate',goalRevealed:'true',explored:String(state.explored.size),columns:String(board.width),rows:String(board.height),cellWidth:String(view.sx),cellHeight:String(view.sy),arenaWidth:String(mw),arenaHeight:String(mh),rotated:String(view.rotated)});
        const f=screen(board.finish.x+.5,board.finish.y+.5),start=screen(board.start.x+.5,board.start.y+.5),hero=retroToScreen(state.position,view),icon=Math.min(30,Math.max(12,scale*.82));
        g.fillStyle(0x5bbba2,.22).fillCircle(start.x,start.y,Math.min(scale*.44,24));
        if(state.finalPage)drawFigs(g,f.x,f.y,Math.max(14,icon));else drawMapGate(g,f.x,f.y,Math.max(15,icon));
        drawBinturong(g,start.x,start.y,icon,.15);drawBinturong(g,hero.x,hero.y,icon);
      }

      update() {
        if(!transitioning&&renderedRevision!==state.mapRevision)this.changeMap();
        const now = performance.now();
        state.tick((now - this.lastTick) / 1000);
        this.lastTick = now;
        this.game.canvas.dataset.remaining=String(state.config.seconds-state.elapsed);this.game.canvas.dataset.phase=state.phase;
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
    const view=this.layout;if(!view)return;
    const focus=retroToScreen(this.state.position,view);
    cam.setBounds(0, 0, this.scene!.scale.width, this.scene!.scale.height);
    cam.centerOn(
      focus.x,focus.y,
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
