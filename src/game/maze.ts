export interface Point {
  x: number;
  y: number;
}
export type Grid = number[][];
export interface Maze {
  grid: Grid;
  start: Point;
  finish: Point;
  entrances: Point[];
  seed: number;
}
export type Difficulty = "medium" | "hard" | "extreme";
export const modernSettings = {
  medium: { size: 17, vision: 4.2, seconds: 300 },
  hard: { size: 23, vision: 3.4, seconds: 360 },
  extreme: { size: 29, vision: 2.8, seconds: 420 },
} as const;
export function random(seed: number) {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}
export function carve(cols: number, rows: number, seed: number): Grid {
  const grid: Grid = Array.from({ length: rows | 1 }, () =>
    Array(cols | 1).fill(1),
  );
  const rng = random(seed),
    stack = [{ x: 1, y: 1 }];
  grid[1][1] = 0;
  while (stack.length) {
    const a = stack[stack.length - 1];
    const options = [
      [2, 0],
      [-2, 0],
      [0, 2],
      [0, -2],
    ]
      .map(([x, y]) => ({ x: a.x + x, y: a.y + y }))
      .filter(
        (p) =>
          p.x > 0 &&
          p.y > 0 &&
          p.y < grid.length - 1 &&
          p.x < grid[0].length - 1 &&
          grid[p.y][p.x],
      );
    if (!options.length) {
      stack.pop();
      continue;
    }
    const b = options[Math.floor(rng() * options.length)];
    grid[(a.y + b.y) / 2][(a.x + b.x) / 2] = grid[b.y][b.x] = 0;
    stack.push(b);
  }
  return grid;
}
export function distances(grid: Grid, start: Point): Map<string, number> {
  const out = new Map([[`${start.x},${start.y}`, 0]]),
    q = [start];
  for (let i = 0; i < q.length; i++) {
    const p = q[i],
      d = out.get(`${p.x},${p.y}`)!;
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const x = p.x + dx,
        y = p.y + dy,
        k = `${x},${y}`;
      if (grid[y]?.[x] === 0 && !out.has(k)) {
        out.set(k, d + 1);
        q.push({ x, y });
      }
    }
  }
  return out;
}
export function route(grid: Grid, start: Point, end: Point): Point[] {
  const d = distances(grid, start);
  if (!d.has(`${end.x},${end.y}`)) return [];
  const out = [end];
  let p = end;
  while (p.x !== start.x || p.y !== start.y) {
    const target = d.get(`${p.x},${p.y}`)! - 1;
    const n = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]
      .map(([x, y]) => ({ x: p.x + x, y: p.y + y }))
      .find((n) => d.get(`${n.x},${n.y}`) === target)!;
    out.unshift(n);
    p = n;
  }
  return out;
}
const regionCache = new Map<number, Maze[]>();
export function retroMaze(level: number): Maze {
  if (!Number.isInteger(level) || level < 1 || level > 100)
    throw new Error("Invalid level");
  const region = Math.floor((level - 1) / 10);
  if (!regionCache.has(region)) {
    const seen = new Set<string>(),
      candidates: { maze: Maze; length: number }[] = [];
    for (let attempt = 0; candidates.length < 10; attempt++) {
      const seed = 9173 + (region * 100 + attempt + 1) * 7919,
        grid = carve(11 + region * 2, 11 + region * 2, seed),
        signature = JSON.stringify(grid);
      if (seen.has(signature)) continue;
      seen.add(signature);
      let junctions=0,deadEnds=0;
      for(let y=1;y<grid.length-1;y+=2)for(let x=1;x<grid.length-1;x+=2){const degree=[[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>!grid[y+dy][x+dx]).length;if(degree>=3)junctions++;if(degree===1)deadEnds++;}
      if(junctions<3||deadEnds<4)continue;
      const start = { x: 1, y: 1 },
        d = distances(grid, start);
      let finish = start,
        best = 0;
      for (const [key, n] of d)
        if (n > best) {
          const [x, y] = key.split(",").map(Number);
          finish = { x, y };
          best = n;
        }
      candidates.push({
        maze: { grid, start, finish, entrances: [start], seed },
        length: best,
      });
    }
    candidates.sort((a, b) => a.length - b.length);
    regionCache.set(
      region,
      candidates.map((c) => c.maze),
    );
  }
  return structuredClone(regionCache.get(region)![(level - 1) % 10]);
}
export function retroConfig(level: number) {
  const maze = retroMaze(level),
    length = route(maze.grid, maze.start, maze.finish).length;
  return {
    level,
    region: Math.floor((level - 1) / 10),
    lives: 3,
    seconds: Math.ceil(35 + length * (level < 21 ? 1.7 : 1.25)),
    maze,
    length,
  };
}
export function modernMaze(difficulty: Difficulty, seed: number): Maze {
  // Four mirrored quadrants give different entrances exactly equal route lengths.
  const half = Math.floor(modernSettings[difficulty].size / 2) | 1,
    quadrant = carve(half, half, seed);
  const size = half * 2 + 1,
    mid = half,
    grid: Grid = Array.from({ length: size }, () => Array(size).fill(1));
  for (let y = 0; y < half; y++)
    for (let x = 0; x < half; x++) {
      const v = quadrant[y][x];
      grid[y][x] =
        grid[y][size - 1 - x] =
        grid[size - 1 - y][x] =
        grid[size - 1 - y][size - 1 - x] =
          v;
    }
  // Join every quadrant to the center using a narrow, symmetric central cross.
  for (let n = 1; n < size - 1; n++) grid[mid][n] = grid[n][mid] = 0;
  for (const x of [mid - 2, mid + 2])
    for (const y of [mid - 2, mid + 2]) {
      grid[y][x] = 0;
      grid[y][mid - 1] = grid[y][mid + 1] = 0;
    }
  const entrances = [
    { x: 1, y: 1 },
    { x: size - 2, y: 1 },
    { x: size - 2, y: size - 2 },
    { x: 1, y: size - 2 },
  ];
  return {
    grid,
    start: entrances[0],
    finish: { x: mid, y: mid },
    entrances,
    seed,
  };
}
export function center(p: Point): Point {
  return { x: p.x + 0.5, y: p.y + 0.5 };
}
export function fits(grid: Grid, p: Point, radius = 0.2): boolean {
  if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) return false;
  for (let y = Math.floor(p.y - radius); y <= Math.floor(p.y + radius); y++)
    for (let x = Math.floor(p.x - radius); x <= Math.floor(p.x + radius); x++) {
      if (grid[y]?.[x] !== 0) {
        const nx = Math.max(x, Math.min(p.x, x + 1)),
          ny = Math.max(y, Math.min(p.y, y + 1));
        if ((p.x - nx) ** 2 + (p.y - ny) ** 2 < radius ** 2 - 1e-9)
          return false;
      }
    }
  return true;
}
export function moveSliding(
  grid: Grid,
  p: Point,
  dx: number,
  dy: number,
  radius = 0.2,
): Point {
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 0.08));
  let out = { ...p };
  for (let i = 0; i < steps; i++) {
    const x = { x: out.x + dx / steps, y: out.y };
    if (fits(grid, x, radius)) out = x;
    const y = { x: out.x, y: out.y + dy / steps };
    if (fits(grid, y, radius)) out = y;
  }
  return out;
}
export function clearSegment(grid: Grid, a: Point, b: Point, radius = 0.06) {
  const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 0.05));
  for (let i = 1; i <= n; i++)
    if (
      !fits(
        grid,
        { x: a.x + ((b.x - a.x) * i) / n, y: a.y + ((b.y - a.y) * i) / n },
        radius,
      )
    )
      return false;
  return true;
}
export function visibleCells(
  grid: Grid,
  p: Point,
  radius: number,
): Set<string> {
  const out = new Set<string>();
  for (let y = Math.floor(p.y - radius); y <= Math.ceil(p.y + radius); y++)
    for (let x = Math.floor(p.x - radius); x <= Math.ceil(p.x + radius); x++) {
      if (
        !grid[y] ||
        x < 0 ||
        x >= grid[0].length ||
        Math.hypot(x + 0.5 - p.x, y + 0.5 - p.y) > radius
      )
        continue;
      // Include the first wall encountered, while hiding everything behind it.
      const target = { x: x + 0.5, y: y + 0.5 },
        steps = Math.ceil(Math.hypot(target.x - p.x, target.y - p.y) * 12);
      let ok = true;
      for (let i = 1; i < steps; i++) {
        const xx = Math.floor(p.x + ((target.x - p.x) * i) / steps),
          yy = Math.floor(p.y + ((target.y - p.y) * i) / steps);
        if (grid[yy]?.[xx] !== 0 && (xx !== x || yy !== y)) {
          ok = false;
          break;
        }
      }
      if (ok) out.add(`${x},${y}`);
    }
  return out;
}
export function stars(seconds: number, limit: number, errors: number) {
  return errors === 0 && seconds <= limit * 0.6
    ? 3
    : errors <= 1 && seconds <= limit * 0.85
      ? 2
      : 1;
}
