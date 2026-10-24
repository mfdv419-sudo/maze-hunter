import {retroBoard, boardSegment} from "./retro-board";
import { center, retroConfig, stars, type Point } from "./maze";
export class RetroState {
  readonly config;
  readonly board;
  resets = 0;
  position: Point;
  path: Point[];
  lives = 3;
  errors = 0;
  elapsed = 0;
  phase: "ready" | "playing" | "paused" | "won" | "lost" = "ready";
  reason: "time" | "lives" | null = null;
  constructor(readonly level: number) {
    this.config = retroConfig(level);
    this.board = retroBoard(level);
    this.position = center(this.board.start);
    this.path = [{ ...this.position }];
  }
  start() {
    if (this.phase === "ready") this.phase = "playing";
  }
  tick(dt: number) {
    if (this.phase !== "playing") return;
    this.elapsed += Math.max(0, dt);
    if (this.elapsed >= this.config.seconds) {
      this.elapsed = this.config.seconds;
      this.phase = "lost";
      this.reason = "time";
    }
  }
  trace(p: Point) {
    if (this.phase !== "playing") return false;
    if (!boardSegment(this.board, this.position, p)) {
      return false;
    }
    const steps=Math.max(1,Math.ceil(Math.hypot(p.x-this.position.x,p.y-this.position.y)/.08));
    for(let i=1;i<=steps;i++) {
      const x=Math.floor(this.position.x+(p.x-this.position.x)*i/steps), y=Math.floor(this.position.y+(p.y-this.position.y)*i/steps);
      if(this.board.deadEnds.some(d=>d.x===x&&d.y===y)) {this.mistake();return false;}
    }
    this.position = p;
    this.path.push({ ...p });
    const f = center(this.board.finish);
    if (Math.hypot(p.x - f.x, p.y - f.y) < 0.3) this.phase = "won";
    return true;
  }
  mistake() {
    if (this.phase !== "playing") return;
    this.errors++;
    this.resets++;
    this.position=center(this.board.start);
    this.path=[{...this.position}];
    this.lives = Math.max(0, this.lives - 1);
    if (!this.lives) {
      this.phase = "lost";
      this.reason = "lives";
    }
  }
  get rating() {
    return this.phase === "won"
      ? stars(this.elapsed, this.config.seconds, this.errors)
      : 0;
  }
}
