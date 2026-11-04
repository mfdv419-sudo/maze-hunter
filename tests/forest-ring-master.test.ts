import {describe,it,expect} from 'vitest';
import {forestRing,ringProgression,FOREST_RING_BUILD} from '../src/game/forest-ring';
import {forestPilotLayout} from '../src/game/forest-pilot';
import {AdventureState} from '../src/game/adventure-state';
import {route} from '../src/game/maze';

const difficulties=['easy','medium','hard','extreme'] as const;
describe('Forest Grove Extreme-first Ring Maze (SOLO Map 01)',()=>{
 it('generates 7 zones for Extreme and strictly increasing playable footprints',()=>{
  const all=ringProgression();
  expect(all.map(q=>q.active)).toEqual([3,5,6,7]);
  expect(all.map(q=>q.walkable)).toEqual([...all.map(q=>q.walkable)].sort((a,b)=>a-b));
  expect(all.map(q=>q.links)).toEqual([...all.map(q=>q.links)].sort((a,b)=>a-b));
  expect(all[3].walkable).toBeGreaterThan(all[0].walkable*1.4);
  expect(FOREST_RING_BUILD).toMatch(/^FG-RING-MASTER/);
 });
 it.each(difficulties)('makes %s boss inaccessible before two objectives + three Diamonds, but escapable after boss win',(difficulty)=>{
  const r=forestRing(difficulty),l=forestPilotLayout(difficulty);
  expect(l.ring?.version).toBe(FOREST_RING_BUILD);
  expect(l.maze.start).toEqual(r.entry);
  expect(l.fortress).toEqual(r.center);
  expect(route(l.maze.grid,l.maze.start,l.fortress)).toHaveLength(0);
  for(const point of [...l.diamonds!,...l.seals])expect(route(l.maze.grid,l.maze.start,point).length).toBeGreaterThan(0);
  const after=l.maze.grid.map(row=>[...row]);
  for(const cell of Object.values(r.gates).flat())after[cell.y][cell.x]=0;
  expect(route(after,l.maze.start,l.fortress).length).toBeGreaterThan(0);
  expect(route(after,l.fortress,l.maze.finish).length).toBeGreaterThan(0);
  expect(l.stars).toHaveLength(9);
 });
 it('boss gate unlock requires BOTH three Diamond and two Sigil on active Ring Maze',()=>{
  const a=new AdventureState('extreme',0,1,false,undefined,'forest',false,true,true);
  expect(a.layout.ring).toBeDefined();
  a.seals=new Set([0,1]);a.step(0,0,0,0,0);
  expect(a.grid[a.layout.pilot!.gates[0].y][a.layout.pilot!.gates[0].x]).toBe(1);
  a.diamonds=new Set([0,1,2]);a.step(0,0,0,0,0);
  expect(a.grid[a.layout.pilot!.gates[0].y][a.layout.pilot!.gates[0].x]).toBe(0);
  expect(a.bossAwake).toBe(false);
 });
 it('keeps optional zone content progressively rather than leaving dead empty corridors',()=>{
  const r=forestRing('extreme');
  expect(r.passages.some(p=>p.kind==='tunnel'&&p.reward==='xp')).toBe(true);
  expect(r.passages.some(p=>p.kind==='sky')).toBe(true);
  expect(r.passages.some(p=>p.kind==='bridge')).toBe(true);
  expect(r.deadEnds.length).toBeGreaterThan(4);
  for(const zone of r.zones.filter(z=>z.id!=='boss'))expect(route(r.grid,r.entry,zone.point).length).toBeGreaterThan(0);
 });
});
