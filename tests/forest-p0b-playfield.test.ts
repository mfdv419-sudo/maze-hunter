import {it,expect} from 'vitest';
import {AdventureState} from '../src/game/adventure-state';
import {aquaticSwimming} from '../src/game/aquatic';
import {FOREST_PILOT_BUILD,forestPilotLayout,pilotGround,PILOT_SWIM_BOTTOM} from '../src/game/forest-pilot';
import {route} from '../src/game/maze';

it('P0B has playable raised land and floor-level forest, not only cliff walls with trees on top',()=>{
 const l=forestPilotLayout(),grid=l.maze.grid;
 const land:number[]=[];
 for(let y=1;y<grid.length-1;y++)for(let x=1;x<grid.length-1;x++)if(grid[y][x]===0){const h=pilotGround(x+.5,y+.5);if(h>=-.58)land.push(h);}
 expect(land.filter(h=>h>1.5).length/land.length).toBeGreaterThan(.35);
 expect(l.forest!.trunks.length).toBeGreaterThan(30);
 for(const p of l.forest!.trunks)expect(grid[p.y][p.x]).toBe(0);
 expect(FOREST_PILOT_BUILD).toBe('FG-P0B-20261104');
 // Ancient Ruins has actual solid masonry and visible approach openings.
 expect(grid[27][50]).toBe(1);expect(grid[27][54]).toBe(0);
 expect(grid[34][50]).toBe(1);expect(grid[34][53]).toBe(0);
});

it('all three Diamonds and Sigils are reachable through the connected maze; locked sanctuary remains locked',()=>{
 const l=forestPilotLayout(),grid=l.maze.grid;
 expect(route(grid,l.maze.start,l.fortress)).toHaveLength(0);
 const unlocked=grid.map(row=>[...row]);
 for(const p of [...l.pilot!.gates,...l.pilot!.bridge,...l.pilot!.shortcut,...l.pilot!.exit])unlocked[p.y][p.x]=0;
 for(const p of [...l.areas.map(a=>a.point),...l.diamonds!,...l.seals])expect(route(unlocked,l.maze.start,p).length).toBeGreaterThan(0);
 expect(route(unlocked,l.maze.start,l.fortress).length).toBeGreaterThan(0);
});

it('swimming only activates with body clearance, and diving cannot sink below the river floor',()=>{
 const s=new AdventureState('medium',0,1,false,undefined,'forest',false,true),l=s.layout;
 s.guards.forEach(g=>g.dead=true);
 const pool={x:55.5,y:53.5};
 expect(pilotGround(pool.x,pool.y)).toBeLessThan(PILOT_SWIM_BOTTOM);
 expect(aquaticSwimming('forest',pool,l)).toBe(true);
 s.position=pool;s.diving=true;
 for(let i=0;i<40;i++)s.step(.1,.1,0,0,0);
 const footLevel=-1.08-s.depth-.6;
 expect(footLevel).toBeGreaterThanOrEqual(pilotGround(pool.x,pool.y)+.1);
 expect(s.depth).toBeGreaterThan(.4);
 // A shallow bank is not an underwater swimming volume.
 const bank=Array.from({length:370},(_,i)=>({x:35+i*.1,y:53.5}))
  .find(p=>{const floor=pilotGround(p.x,p.y);return floor<-1.05&&floor>PILOT_SWIM_BOTTOM;});
 expect(bank).toBeDefined();
 expect(aquaticSwimming('forest',bank!,l)).toBe(false);
});
