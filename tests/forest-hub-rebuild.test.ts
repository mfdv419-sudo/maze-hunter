import {expect,it} from 'vitest';
import {forestPilotLayout,pilotGround,pilotVoid,FOREST_PILOT_BUILD,FOREST_SLICE_BUILD} from '../src/game/forest-pilot';
import {WATERFALL_HUB_TERRACES,WATERFALL_HUB_RAMPS,WATERFALL_HUB_BRIDGES,onWaterfallHubBridge,onWaterfallHubRamp,steepHubSidewall} from '../src/game/forest-hub';
import {route} from '../src/game/maze';

it('creates multiple distinct reachable elevations, stairs and a real bridge over deep water',()=>{
 const l=forestPilotLayout();
 expect(WATERFALL_HUB_TERRACES.length).toBeGreaterThanOrEqual(5);
 expect(WATERFALL_HUB_RAMPS.length).toBeGreaterThanOrEqual(5);
 const low=pilotGround(44.5,58),high=pilotGround(51,45.5);
 expect(high-low).toBeGreaterThan(2.8);
 expect(pilotGround(55.5,53.5)).toBeLessThan(-3);
 expect(WATERFALL_HUB_BRIDGES).toHaveLength(3);
 for(const [i,b]of WATERFALL_HUB_BRIDGES.entries()){
  const ledge=l.ledges.find(q=>q.id===940+i);
  expect(ledge).toBeDefined();
  expect(pilotGround(b.x,b.z)+ledge!.height).toBeCloseTo(b.top,5);
  expect(onWaterfallHubBridge(b.x,b.z)).toBe(true);
 }
 expect(l.stars.some(s=>s.x===51&&s.y===45)).toBe(true);
 expect(l.stars).toHaveLength(9);
});

it('keeps both hub approaches connected without unlocking the boss prematurely',()=>{
 const l=forestPilotLayout(),closed=l.maze.grid;
 const open=closed.map(row=>[...row]);
 for(const p of [...l.pilot!.gates,...l.pilot!.bridge,...l.pilot!.shortcut,...l.pilot!.exit])open[p.y][p.x]=0;
 for(const t of WATERFALL_HUB_TERRACES){
  const target={x:Math.round(t.x),y:Math.round(t.z)};
  expect(open[target.y]?.[target.x]).toBe(0);
  expect(route(open,l.maze.start,target).length).toBeGreaterThan(0);
 }
 expect(route(closed,l.maze.start,l.fortress)).toHaveLength(0);
 for(const site of [...l.diamonds!,...l.seals])expect(route(open,l.maze.start,site).length).toBeGreaterThan(0);
});

it('protects the original P0B exports and gives the spike gap a physical landing deck',()=>{
 const l=forestPilotLayout(),deck=l.ledges.find(q=>q.id===828);
 expect(pilotVoid(23.5,20.2)).toBe(true);
 expect(deck).toBeDefined();
 expect(pilotGround(deck!.point.x+.5,deck!.point.y+.5)+deck!.height).toBeGreaterThan(0);
 expect(FOREST_PILOT_BUILD).toMatch(/^FG-P0B/);
 expect(FOREST_SLICE_BUILD).toBe('FG-HUB-REBUILD01-20261104');
});

it('only steep visible hub sides block normal walking, not the marked stair routes',()=>{
 expect(onWaterfallHubRamp(47,52)).toBe(true);
 expect(steepHubSidewall(47,52,.05,.24,0)).toBe(false);
 expect(steepHubSidewall(52,48.5,.05,.24,0)).toBe(true);
 expect(steepHubSidewall(52,48.5,.05,.24,.3)).toBe(false);
});
