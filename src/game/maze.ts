import retroCatalog from "./retro-catalog.json" with {type:"json"};
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
export type Difficulty = "easy" | "medium" | "hard" | "extreme";
export const modernSettings = {
  easy: {size:13,vision:5,seconds:480},
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
export function retroDifficulty(grid:Grid,start:Point,finish:Point) {
 const path=route(grid,start,finish),pathSet=new Set(path.map(p=>`${p.x},${p.y}`));
 let choices=0,misleading=0,deadEnds=0;
 for(let y=1;y<grid.length-1;y+=2)for(let x=1;x<grid.length-1;x+=2){const degree=[[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>grid[y+dy][x+dx]===0).length;if(degree===1)deadEnds++;}
 for(const p of path) {
  if(p.x%2!==1||p.y%2!==1)continue;
  const neighbors=[[1,0],[-1,0],[0,1],[0,-1]].map(([x,y])=>({x:p.x+x,y:p.y+y})).filter(q=>grid[q.y]?.[q.x]===0);
  if(neighbors.length>=3)choices++;
  for(const q of neighbors)if(!pathSet.has(`${q.x},${q.y}`)){
   const queue=[{...q,d:1}],seen=new Set([`${q.x},${q.y}`]);let depth=0;
   for(let i=0;i<queue.length;i++){const c=queue[i];depth=Math.max(depth,c.d);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const x=c.x+dx,y=c.y+dy,k=`${x},${y}`;if(grid[y]?.[x]===0&&!pathSet.has(k)&&!seen.has(k)){seen.add(k);queue.push({x,y,d:c.d+1});}}}
   if(depth>=6)misleading++;
  }
 }
 return{length:(path.length-1)/2,choices,misleading,deadEnds};
}
const regionCache=new Map<string,Maze[]>();
export function retroPageCount(level:number){if(!Number.isInteger(level)||level<1||level>100)throw Error('Invalid level');return level<5?1:retroCatalog[level-5].pages.length;}
export interface RetroDecision {point:Point;next:Point;length:number;hall?:boolean;hallCells?:Point[];choices:{end:Point;length:number;correct:boolean}[]}
export function retroDecisions(level:number,page=0):RetroDecision[]{return level<5?[]:structuredClone(retroCatalog[level-5].pages[page].decisions);}
export function retroMaze(level:number,page=0):Maze {
 if(!Number.isInteger(level)||level<1||level>100)throw Error('Invalid level');
 if(level>=5){const entry=retroCatalog[level-5].pages[page];if(!entry)throw Error('Invalid Retro map');const {grid,start,finish,seed}=entry;return structuredClone({grid,start,finish,seed,entrances:[start]});}if(page!==0)throw Error('Invalid Retro map');
 const region=Math.floor((level-1)/10),intro=level<=5,band=intro?'intro':`region-${region}`;
 const rooms=intro?5:9+region*2+(region>=2?2:0),count=intro||region===0?5:10;
 if(!regionCache.has(band)) {
  const candidates:{maze:Maze;score:number}[]=[];
  for(let attempt=0;candidates.length<count&&attempt<1800;attempt++) {
   const seed=43013+region*100003+attempt*7919+(intro?0:9173),grid=carve(rooms*2+1,rooms*2+1,seed),start={x:1,y:1};
   let finish=start,best=0;for(const [k,d]of distances(grid,start))if(d>best){const [x,y]=k.split(',').map(Number);finish={x,y};best=d;}
   const m=retroDifficulty(grid,start,finish);
   if(m.choices<(intro?2:Math.floor(rooms*.65))||m.misleading<(intro?1:Math.floor(rooms/3))||m.length<(intro?10:rooms*rooms*.28)||m.deadEnds<(intro?4:rooms))continue;
   candidates.push({maze:{grid,start,finish,entrances:[start],seed},score:m.length+m.choices*5+m.misleading*12});
  }
  if(candidates.length<count)throw Error('Retro difficulty criteria could not be met');
  candidates.sort((a,b)=>a.score-b.score);regionCache.set(band,candidates.map(c=>c.maze));
 }
 const index=intro?level-1:region===0?level-6:(level-1)%10;
 return structuredClone(regionCache.get(band)![index]);
}
export function retroConfig(level: number) {
  const pageCount=retroPageCount(level),maps=Array.from({length:pageCount},(_,page)=>retroMaze(level,page)),maze=maps[0],
    length = maps.reduce((n,m)=>n+route(m.grid,m.start,m.finish).length,0);
  return {
    level,
    region: Math.floor((level - 1) / 10),
    lives: 3,
    seconds: level<=20?60:level<=40?90:level<=80?120:150,
    maps,pageCount,
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
