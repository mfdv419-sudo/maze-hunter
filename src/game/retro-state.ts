import { center, clearSegment, retroConfig, stars, type Point } from "./maze";
export class RetroState {
  readonly config;
  position: Point;
  path: Point[];
  lives = 3;
  errors = 0;
  elapsed = 0;
  phase: "ready" | "playing" | "paused" | "won" | "lost" = "ready";
  reason: "time" | "lives" | null = null;
  constructor(readonly level: number) {
    this.config = retroConfig(level);
    this.position = center(this.config.maze.start);
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
    if (!clearSegment(this.config.maze.grid, this.position, p)) {
      return false;
    }
    this.position = p;
    this.path.push({ ...p });
    const f = center(this.config.maze.finish);
    if (Math.hypot(p.x - f.x, p.y - f.y) < 0.3) this.phase = "won";
    return true;
  }
  mistake() {
    if (this.phase !== "playing") return;
    this.errors++;
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
