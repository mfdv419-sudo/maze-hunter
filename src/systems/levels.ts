export type Cell = 0 | 1;
export type Sector = 'The Overgrown' | 'Dark Ruins' | 'Fungal Depths' | 'Iron Maze' | 'Last Garden';
export interface LevelConfig {
  id: number; sector: Sector; name: string; cols: number; rows: number; seed: number;
  enemyCount: number; hazardCount: number; timeLimit: number; requiredShards: number; difficulty: number;
}
export interface MazeData { grid: Cell[][]; start: { x: number; y: number }; exit: { x: number; y: number }; shards: { x: number; y: number }[]; enemies: { x: number; y: number }[]; hazards: { x: number; y: number }[]; }
export const SECTORS: { name: Sector; from: number; to: number; subtitle: string; color: number }[] = [
  { name: 'The Overgrown', from: 1, to: 10, subtitle: 'Where the roots remember', color: 0x668d52 },
  { name: 'Dark Ruins', from: 11, to: 30, subtitle: 'A kingdom swallowed by stone', color: 0x8d805f },
  { name: 'Fungal Depths', from: 31, to: 60, subtitle: 'Follow the pale spores', color: 0x9b70a5 },
  { name: 'Iron Maze', from: 61, to: 90, subtitle: 'Steel has no mercy', color: 0xb07c48 },
  { name: 'Last Garden', from: 91, to: 100, subtitle: 'One last light', color: 0x8fae69 }
];
export function getSector(id: number) { return SECTORS.find(s => id >= s.from && id <= s.to)!; }
export function getLevelConfig(id: number): LevelConfig {
  const sector = getSector(id).name;
  const tier = id <= 10 ? 0 : id <= 30 ? 1 : id <= 60 ? 2 : id <= 90 ? 3 : 4;
  return { id, sector, name: `${getSector(id).name} · ${String(id).padStart(2, '0')}`, cols: 17 + Math.min(8, Math.floor((id - 1) / 14) * 2), rows: 13 + Math.min(6, Math.floor((id - 1) / 17) * 2), seed: 9173 + id * 7919, enemyCount: Math.min(2 + Math.floor(id / 9), 11), hazardCount: Math.min(Math.floor(id / 5), 9), timeLimit: Math.max(90, 210 - id), requiredShards: id < 5 ? 1 : id < 25 ? 2 : id < 65 ? 3 : 4, difficulty: tier + Math.floor((id % 10) / 4) };
}
function rng(seed: number) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
export function generateMaze(config: LevelConfig): MazeData {
  const cols = config.cols | 1, rows = config.rows | 1, random = rng(config.seed);
  const grid: Cell[][] = Array.from({ length: rows }, () => Array(cols).fill(1) as Cell[]);
  const stack: { x: number; y: number }[] = [{ x: 1, y: 1 }]; grid[1][1] = 0;
  while (stack.length) {
    const current = stack[stack.length - 1];
    const options = [[0,-2],[2,0],[0,2],[-2,0]].map(([dx,dy]) => ({ x: current.x + dx, y: current.y + dy, dx, dy })).filter(p => p.x > 0 && p.y > 0 && p.x < cols - 1 && p.y < rows - 1 && grid[p.y][p.x] === 1);
    if (!options.length) { stack.pop(); continue; }
    const next = options[Math.floor(random() * options.length)]; grid[current.y + next.dy / 2][current.x + next.dx / 2] = 0; grid[next.y][next.x] = 0; stack.push({ x: next.x, y: next.y });
  }
  // Open a handful of loops later in the campaign so routes feel less predictable.
  const loopCount = Math.floor(config.id / 8);
  for (let i = 0; i < loopCount; i++) { const x = 1 + Math.floor(random() * (cols - 2)); const y = 1 + Math.floor(random() * (rows - 2)); if (grid[y][x] === 1 && ((grid[y][x-1] === 0 && grid[y][x+1] === 0) || (grid[y-1][x] === 0 && grid[y+1][x] === 0))) grid[y][x] = 0; }
  const start = { x: 1, y: 1 }, exit = { x: cols - 2, y: rows - 2 }; grid[exit.y][exit.x] = 0;
  // The DFS tree guarantees a route; connect the far corner if it was not reached by odd-cell carving.
  let x = exit.x, y = exit.y;
  while (x > 1) { grid[y][x] = 0; grid[y][x-1] = 0; x--; }
  while (y > 1) { grid[y][x] = 0; grid[y-1][x] = 0; y--; }
  const reachable = flood(grid, start);
  const candidates: {x:number;y:number}[] = [];
  for (let yy = 1; yy < rows - 1; yy++) for (let xx = 1; xx < cols - 1; xx++) if (grid[yy][xx] === 0 && !(xx === 1 && yy === 1) && !(xx === exit.x && yy === exit.y) && reachable.has(`${xx},${yy}`)) candidates.push({x:xx,y:yy});
  // Spread objectives across the walkable world; deterministic and always reachable.
  const shuffled = candidates.map(p => ({...p, k: random()})).sort((a,b)=>a.k-b.k);
  const shards = shuffled.slice(0, Math.min(config.requiredShards, shuffled.length)).map(({x,y})=>({x,y}));
  const occupied = new Set([`${start.x},${start.y}`,`${exit.x},${exit.y}`,...shards.map(p=>`${p.x},${p.y}`)]);
  const rest = shuffled.filter(p=>!occupied.has(`${p.x},${p.y}`));
  const enemies = rest.slice(0, config.enemyCount).map(({x,y})=>({x,y})); enemies.forEach(p=>occupied.add(`${p.x},${p.y}`));
  const hazards = rest.slice(config.enemyCount, config.enemyCount + config.hazardCount).map(({x,y})=>({x,y}));
  return { grid, start, exit, shards, enemies, hazards };
}
export function flood(grid: Cell[][], start: {x:number;y:number}) {
  const seen = new Set<string>([`${start.x},${start.y}`]), queue = [start];
  while (queue.length) { const p = queue.shift()!; for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const x=p.x+dx,y=p.y+dy,k=`${x},${y}`; if (y>=0&&x>=0&&y<grid.length&&x<grid[0].length&&grid[y][x]===0&&!seen.has(k)) {seen.add(k);queue.push({x,y});} } }
  return seen;
}
