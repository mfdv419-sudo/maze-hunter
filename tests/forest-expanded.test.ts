import {describe, expect, it} from 'vitest';
import {AdventureState} from '../src/game/adventure-state';
import {forestStages, canEnterForestWorld, forestEquipment} from '../src/game/forest-progression';
import {pilotGround, pilotVoid, pilotWaterDepth} from '../src/game/forest-pilot';
import {center, route} from '../src/game/maze';
import {forestRank, mergeProfile, newProfile, recordExpedition, recordForestWin} from '../src/services/local';

describe('Forest Grove expanded progression', () => {
 it('unlocks the two worlds in sequence and merges progress with older profile records', () => {
  const profile = newProfile('Explorer', 'en');
  const existing = structuredClone(profile);
  expect(recordForestWin(profile, 'hard')).toBe(false);
  expect(canEnterForestWorld(forestRank(profile), 'hard')).toBe(false);
  for (const stage of forestStages.slice(0, 4)) {
   expect(recordForestWin(profile, stage)).toBe(true);
   expect(recordForestWin(profile, stage)).toBe(false);
  }
  expect(canEnterForestWorld(forestRank(profile), 'hard')).toBe(true);
  expect(canEnterForestWorld(forestRank(profile), 'extreme')).toBe(false);
  recordExpedition(existing, 'forest-extreme-0', {coins:15, stars:3, chests:2, zones:[1,3]});
  const merged = mergeProfile(existing, profile);
  expect(forestRank(merged)).toBe(4);
  expect(merged.adventures?.['forest-extreme-0']).toMatchObject({coins:15,stars:3,chests:2,zones:[1,3]});
  expect(recordForestWin(merged, 'world-hard')).toBe(true);
  expect(canEnterForestWorld(forestRank(merged), 'extreme')).toBe(true);
  expect(recordForestWin(merged, 'world-extreme')).toBe(true);
  expect(forestRank(merged)).toBe(6);
 });

 it('applies earned movement equipment to a Forest expedition', () => {
  const normal = new AdventureState('easy',0,1,false,undefined,'forest');
  const boots = new AdventureState('easy',0,1,false,undefined,'forest',false,false,false,['boots']);
  expect(forestEquipment(0,['hands:climber']).map(item=>item.id)).toEqual(['gloves']);
  expect(forestEquipment(2,['feet:trail']).map(item=>item.id)).toEqual(['boots','gloves']);
  expect(boots.speedFactor).toBeCloseTo(normal.speedFactor * 1.08);
 });

 it('makes the Waterfall portal and submerged objectives reachable in Hard and Extreme', () => {
  for(const difficulty of ['hard','extreme'] as const) {
   const run=new AdventureState(difficulty,0,27,false,undefined,'forest',false,true,true);
   const world=run.layout.ring!;
   const waterfall=world.zones.find(zone=>zone.id==='waterfall')!;
   const portal=world.portals.find(p=>p.arena==='waterfall'&&p.slot==='A')!;
   expect(route(run.grid,waterfall.point,portal.point).length).toBeGreaterThan(0);
   expect(route(run.grid,run.layout.maze.start,waterfall.point).length).toBeGreaterThan(0);
   const diamond=run.layout.diamonds![2],sigil=run.layout.seals[2];
   for(const target of [diamond,sigil]) {
    const {x,y}=center(target);
    expect(pilotWaterDepth(x,y)).toBeGreaterThan(2.4);
    expect(route(run.grid,waterfall.point,target).length).toBeGreaterThan(0);
   }
   run.position=center(diamond);
   expect(run.toggleDive()).toBe(true);
   for(let frame=0;frame<32;frame++)run.step(.05,.05,0,0,0);
   expect(run.diamonds.has(2)).toBe(true);
   run.position=center(portal.point);
   run.step(.03,.03,0,0,0);
   expect(run.position).toEqual(center(portal.destinationPoint));
   expect(run.checkpoint).toEqual(run.position);
   expect(run.depth).toBe(0);
   expect(run.diving).toBe(false);
  }
 },30000);

 it('uses a solid sky bridge between islands and opens the end route after the boss', () => {
  const run=new AdventureState('extreme',0,27,false,undefined,'forest',false,true,true);
  const ring=run.layout.ring!;
  const link=ring.passages.find(p=>p.id==='ext-sky-1-2')!;
  const span=link.path.filter(p=>ring.zones.filter(z=>z.layer==='floating')
   .every(z=>Math.hypot(z.point.x-p.x,z.point.y-p.y)>z.radius+2));
  expect(span.length).toBeGreaterThan(5);
  for(const p of span){
   const {x,y}=center(p);
   expect(pilotVoid(x,y,run.grid)).toBe(false);
   expect(pilotGround(x,y)).toBeGreaterThan(10);
  }
  const sequence=route(run.grid,link.path[0],link.path.at(-1)!);
  expect(sequence.length).toBeGreaterThan(20);
  const {x,y}=center(span[Math.floor(span.length/2)]);
  run.position={x,y};
  run.gateCooldown=10;
  run.step(.04,.04,0,0,0);
  expect(run.respawns).toBe(0);
  const portal=ring.portals.find(p=>p.arena==='giant'&&p.destination==='sky-1')!;
  run.position=center(portal.point);
  run.gateCooldown=-10;
  run.step(.04,.04,0,0,0);
  expect(run.position).toEqual(center(portal.destinationPoint));

  expect(route(run.grid,ring.center,ring.exit)).toHaveLength(0);
  for (const i of [0,1]) run.seals.add(i);
  for (const i of [0,1,2]) run.diamonds.add(i);
  for (const piece of ring.rewardPieces.slice(0,4)) run.relics.add(piece.id);
  expect(run.assembleRelicWeapon('blade')).toBe(true);
  run.position=center(ring.zones.find(zone=>zone.id==='inner')!.point);
  run.step(.04,.04,0,0,0);
  for(const p of ring.gates.boss)expect(run.grid[p.y][p.x]).toBe(0);
  run.guards.find(guard=>guard.boss)!.dead=true;
  run.startEscape();
  expect(route(run.grid,ring.center,ring.exit).length).toBeGreaterThan(0);
  run.position=center(ring.exit);
  run.step(.04,.04,0,0,0);
  expect(run.phase).toBe('won');
 },30000);
});
