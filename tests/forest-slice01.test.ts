import {expect,it} from 'vitest';
import {forestPilotLayout,pilotGround,pilotVoid,FOREST_SLICE_BUILD,FOREST_PILOT_BUILD} from '../src/game/forest-pilot';
import {AdventureState} from '../src/game/adventure-state';
import {route} from '../src/game/maze';

it('creates a playable lookout, multi-step Green Cliffs challenge and submerged valley',()=>{
 const layout=forestPilotLayout(),entrance=pilotGround(12.5,63.5),lookout=pilotGround(20.5,19.5);
 expect(lookout-entrance).toBeGreaterThan(3);
 expect(pilotGround(55.5,53.5)).toBeLessThan(-3.4);
 expect(layout.ledges.filter(l=>l.id>=820&&l.id<=827)).toHaveLength(8);
 expect(layout.stars).toHaveLength(9);
 expect(layout.stars.some(s=>s.x===20&&s.y===19)).toBe(true);
 expect(pilotVoid(23.5,20.2)).toBe(true);
 expect(FOREST_PILOT_BUILD).toBe('FG-P0B-20261104'); // Preserve P0B regression contract.
 expect(FOREST_SLICE_BUILD).toMatch(/^FG-(SLICE01|HUB-REBUILD01)/);
});

it('preserves routes to all objectives while the locked boss arena is inaccessible',()=>{
 const l=forestPilotLayout(),grid=l.maze.grid;
 expect(route(grid,l.maze.start,l.fortress)).toHaveLength(0);
 const open=grid.map(row=>[...row]);
 for(const cell of [...l.pilot!.gates,...l.pilot!.bridge,...l.pilot!.shortcut,...l.pilot!.exit])open[cell.y][cell.x]=0;
 for(const p of [...l.diamonds!,...l.seals,...l.areas.map(a=>a.point)])expect(route(open,l.maze.start,p).length).toBeGreaterThan(0);
});

it('Wind Sigil can be unlocked on the actual raised platform, Stone by runes, Water by diving',()=>{
 const a=new AdventureState('medium',0,1,false,undefined,'forest',false,true);
 a.position={x:12.5,y:24.5};a.climber.state.ledge=800;a.climber.state.elevation=1.1;
 expect(a.sealUnlocked(0)).toBe(true);
 expect(a.sealUnlocked(1)).toBe(false);
 a.pilotSwitches=[0,1];expect(a.sealUnlocked(1)).toBe(true);
 expect(a.sealUnlocked(2)).toBe(false);
 a.diving=true;a.depth=1.2;expect(a.sealUnlocked(2)).toBe(true);
});

it('third Diamond requires reaching the deep pool while diving, not floating at the surface',()=>{
 const a=new AdventureState('medium',0,1,false,undefined,'forest',false,true);
 a.guards.forEach(g=>g.dead=true);
 a.position={x:52.5,y:59.5};
 a.diving=false;a.depth=0;a.step(.05,.05,0,0,0);
 expect(a.diamonds.has(2)).toBe(false);
 a.diving=true;a.depth=1.4;a.step(.05,.05,0,0,0);
 expect(a.diamonds.has(2)).toBe(true);
});
