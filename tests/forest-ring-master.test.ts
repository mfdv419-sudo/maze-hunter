import {describe,it,expect} from 'vitest';
import {forestRing,ringProgression,FOREST_RING_BUILD} from '../src/game/forest-ring';
import {forestPilotLayout} from '../src/game/forest-pilot';
import {AdventureState} from '../src/game/adventure-state';
import {FOREST_LAYERS} from '../src/game/forest-world-design';
import {route} from '../src/game/maze';

const difficulties=['easy','medium','hard','extreme'] as const;
describe('Forest Grove Extreme master world',()=>{
 it('uses separate Surface, Underground and Floating coordinate layers',()=>{
  const r=forestRing('extreme');
  expect(r.size).toBe(320);
  expect(r.layers.surface.size).toBe(181);
  expect(r.layers.underground.size).toBe(121);
  expect(r.layers.floating.size).toBe(101);
  expect(r.zones.some(z=>z.layer==='underground')).toBe(true);
  expect(r.zones.some(z=>z.layer==='floating')).toBe(true);
  expect(FOREST_RING_BUILD).toMatch(/^FG-EXTREME-MASTER/);
 });
 it('does not expose one complete physical ring connecting all arenas',()=>{
  const r=forestRing('extreme');
  const start=r.entry;
  // Only the two authored opening arenas are physically reachable from Entry.
  expect(route(r.grid,start,r.zones.find(z=>z.id==='waterfall')!.point).length).toBeGreaterThan(0);
  expect(route(r.grid,start,r.zones.find(z=>z.id==='green')!.point).length).toBeGreaterThan(0);
  for(const id of ['ruins','chasm','giant','ug-xp','sky-1'] as const)expect(route(r.grid,start,r.zones.find(z=>z.id===id)!.point)).toHaveLength(0);
 });
 it('gives each playable arena A/B choices and a return portal',()=>{
  const r=forestRing('extreme');
  for(const id of ['waterfall','green','ruins','chasm','giant','ug-flooded','ug-relic','ug-xp','ug-cross','sky-1','sky-2','sky-3'] as const){
   if(!r.activeZones.includes(id))continue;
   const slots=new Set(r.portals.filter(p=>p.arena===id).map(p=>p.slot));
   expect(slots.has('A')).toBe(true);expect(slots.has('B')).toBe(true);expect(slots.has('RETURN')).toBe(true);
  }
 });
 it('keeps all Extreme playgrounds reachable through controlled random gates',()=>{
  for(let mapIndex=0;mapIndex<20;mapIndex++){const r=forestRing('extreme',mapIndex,1),adj=new Map<string,string[]>();for(const p of r.portals.filter(p=>p.slot!=='RETURN')){const row=adj.get(p.arena)||[];row.push(p.destination);adj.set(p.arena,row);}const seen=new Set<string>(['waterfall','green']),queue=[...seen];while(queue.length){const a=queue.shift()!;for(const b of adj.get(a)||[])if(!seen.has(b)){seen.add(b);queue.push(b);}}for(const id of ['ruins','chasm','giant','ug-flooded','ug-relic','ug-xp','ug-cross','sky-1','sky-2','sky-3'])expect(seen.has(id)).toBe(true);}
 });
 it('keeps gate randomization deterministic for a map but variable across seeds',()=>{
  const a=forestRing('extreme',0,1).portals.filter(p=>p.slot!=='RETURN').map(p=>p.destination).join(',');
  const b=forestRing('extreme',0,1).portals.filter(p=>p.slot!=='RETURN').map(p=>p.destination).join(',');
  const c=forestRing('extreme',1,1).portals.filter(p=>p.slot!=='RETURN').map(p=>p.destination).join(',');
  expect(a).toBe(b);expect(c).not.toBe(a);
 });
 it('requires Diamonds, Sigils and enough relic parts before boss access',()=>{
  const a=new AdventureState('extreme',0,1,false,undefined,'forest',false,true,true);
  a.seals=new Set([0,1]);a.diamonds=new Set([0,1,2]);a.step(0,0,0,0,0);
  expect(a.bossReady).toBe(false);
  const ids=a.layout.ring!.rewardPieces.slice(0,4).map(p=>p.id);a.relics=new Set(ids);a.step(0,0,0,0,0);
  expect(a.bossReady).toBe(false);expect(a.assembleRelicWeapon('blade')).toBe(true);a.step(0,0,0,0,0);
  expect(a.bossReady).toBe(true);
  expect(a.grid[a.layout.pilot!.gates[0].y][a.layout.pilot!.gates[0].x]).toBe(0);
 });
 it('scales active world content by difficulty while Extreme remains master',()=>{
  const all=ringProgression();
  expect(all.map(x=>x.active)).toEqual([...all.map(x=>x.active)].sort((a,b)=>a-b));
  expect(all.at(-1)!.active).toBeGreaterThan(all[0].active);
  expect(forestRing('easy').activeZones.some(z=>z.startsWith('ug-'))).toBe(false);
  expect(forestRing('hard').activeZones.some(z=>z.startsWith('ug-'))).toBe(true);
  expect(forestRing('extreme').activeZones.some(z=>z.startsWith('sky-'))).toBe(true);
 });
 it.each(difficulties)('%s layout uses authoritative grid and layer metadata',(difficulty)=>{
  const l=forestPilotLayout(difficulty,0,1);expect(l.ring).toBeDefined();expect(l.maze.grid.length).toBe(320);expect(l.ring!.layers).toBe(FOREST_LAYERS);
 });
});
