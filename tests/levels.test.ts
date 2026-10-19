import { describe, it, expect } from 'vitest';
import { flood, generateMaze, getLevelConfig, SECTORS } from '../src/systems/levels';

describe('Maze Hunter campaign integrity', () => {
  it('defines exactly 100 unique levels across five named sectors', () => {
    const levels = Array.from({length:100},(_,i)=>getLevelConfig(i+1));
    expect(levels.map(l=>l.id)).toEqual(Array.from({length:100},(_,i)=>i+1));
    expect(new Set(levels.map(l=>l.seed)).size).toBe(100);
    expect(SECTORS.map(s=>s.name)).toEqual(['The Overgrown','Dark Ruins','Fungal Depths','Iron Maze','Last Garden']);
    expect(SECTORS.reduce((n,s)=>n+s.to-s.from+1,0)).toBe(100);
  });
  it('generates valid connected routes, objectives, and unique spawn locations for all 100 levels', () => {
    for(let id=1;id<=100;id++){
      const config=getLevelConfig(id), maze=generateMaze(config), rows=maze.grid.length, cols=maze.grid[0].length;
      expect(maze.grid.length).toBeGreaterThan(0); expect(maze.grid.every(r=>r.length===cols)).toBe(true);
      expect(maze.grid[maze.start.y][maze.start.x]).toBe(0); expect(maze.grid[maze.exit.y][maze.exit.x]).toBe(0);
      const reached=flood(maze.grid,maze.start); expect(reached.has(`${maze.exit.x},${maze.exit.y}`)).toBe(true);
      expect(maze.shards.length).toBeGreaterThanOrEqual(1); expect(maze.shards.length).toBeLessThanOrEqual(config.requiredShards);
      for(const p of [...maze.shards,...maze.enemies,...maze.hazards]){expect(p.x).toBeGreaterThan(0);expect(p.x).toBeLessThan(cols-1);expect(p.y).toBeGreaterThan(0);expect(p.y).toBeLessThan(rows-1);expect(maze.grid[p.y][p.x]).toBe(0);expect(reached.has(`${p.x},${p.y}`)).toBe(true);}
      const unique=new Set([...maze.shards,...maze.enemies,...maze.hazards].map(p=>`${p.x},${p.y}`));expect(unique.size).toBe(maze.shards.length+maze.enemies.length+maze.hazards.length);
    }
  });
  it('creates distinct deterministic layouts and increasing difficulty bands',()=>{
    const a=generateMaze(getLevelConfig(4)),b=generateMaze(getLevelConfig(4)),c=generateMaze(getLevelConfig(76));
    expect(a.grid).toEqual(b.grid);expect(c.grid).not.toEqual(a.grid);expect(getLevelConfig(92).difficulty).toBeGreaterThanOrEqual(getLevelConfig(2).difficulty);
  });
});
