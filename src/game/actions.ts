import { clearSegment, type Maze, type Point } from "./maze";
export type ActionKind = "jump" | "hit" | "dive";
export const JUMP_SECONDS = 0.68,
  HIT_SECONDS = 0.36;
export const actionCooldown = { jump: 850, hit: 500, dive:450 } as const;
export function jumpHeight(progress: number) {
  return progress < 0 || progress > 1 ? 0 : Math.sin(Math.PI * progress) * 0.55;
}
export function shrubs(maze: Maze): Point[] {
  const points: Point[] = [];
  for (let y = 1; y < maze.grid.length - 1; y++)
    for (let x = 1; x < maze.grid[0].length - 1; x++) {
      if (
        maze.grid[y][x] ||
        maze.entrances.some((p) => p.x === x && p.y === y) ||
        (maze.finish.x === x && maze.finish.y === y)
      )
        continue;
      const degree = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].filter(([dx, dy]) => maze.grid[y + dy][x + dx] === 0).length;
      if (degree === 1) points.push({ x: x + 0.5, y: y + 0.5 });
    }
  return points;
}
export function shrubKey(p: Point) {
  return `${Math.floor(p.x)}_${Math.floor(p.y)}`;
}
export function hitTargets(
  maze: Maze,
  p: Point,
  broken: Record<string, boolean>,
) {
  return shrubs(maze).filter(
    (q) =>
      !broken[shrubKey(q)] &&
      Math.hypot(q.x - p.x, q.y - p.y) <= 1.05 &&
      clearSegment(maze.grid, p, q, 0.05),
  );
}
/** Shared client/server airborne boost; a third press cannot grant a third impulse. Times are seconds. */
export interface JumpStamp {at:number;base:number;count:number}
export function airborneHeight(j:JumpStamp,now:number){const age=now-j.at;if(age<0)return 0;return j.count===2?Math.max(0,j.base+4.1*age-5.8*age*age):jumpHeight(age/JUMP_SECONDS);}
export function nextJump(j:JumpStamp,now:number):JumpStamp|null{
 const height=airborneHeight(j,now),age=now-j.at;
 if(age<.12)return null;
 if(height>.015){return j.count===1?{at:now,base:height,count:2}:null;}
 return {at:now,base:0,count:1};
}
