import {describe,expect,it} from 'vitest';
import {forestRing} from '../src/game/forest-ring';
import {forestPilotLayout,pilotWaterDepth} from '../src/game/forest-pilot';

describe('Forest Grove Extreme Rebuild 04',()=>{
 it('uses a dedicated Extreme world, never the Medium generator version',()=>{
  const extreme=forestRing('extreme',0,1),medium=forestRing('medium',0,1);
  expect(extreme.version).toContain('EXTREME-REBUILD-04');
  expect(medium.version).not.toContain('EXTREME-REBUILD-04');
  expect(extreme.activeZones).toEqual(expect.arrayContaining(['ug-flooded','ug-relic','ug-xp','ug-cross','sky-1','sky-2','sky-3']));
 });
 it('ships visible merchant and clue NPC content in the authored Extreme world',()=>{
  const r=forestRing('extreme',2,7),npcs=r.content.filter(s=>s.npc),merchants=npcs.filter(s=>s.npc?.role==='merchant'),clues=npcs.filter(s=>s.npc?.role==='clue');
  expect(merchants.length).toBeGreaterThanOrEqual(7);
  expect(clues.length).toBeGreaterThanOrEqual(6);
  expect(r.content.length).toBeGreaterThanOrEqual(45);
 });
 it('keeps three portal choices per explorable arena and final arc reachable',()=>{
  const r=forestRing('extreme',4,11);
  for(const id of r.activeZones.filter(id=>!['entrance','inner','boss'].includes(id)))expect(r.portals.filter(p=>p.arena===id).map(p=>p.slot).sort()).toEqual(['A','B','RETURN']);
  expect(r.paths.toBoss.length).toBeGreaterThan(0);expect(r.paths.escape.length).toBeGreaterThan(0);
 });

 it('keeps land guards out of water and makes the visible Green lookout physically standable',()=>{
  const l=forestPilotLayout('extreme',0,1),green=l.ring!.zones.find(z=>z.id==='green')!.point;
  for(const patrol of l.patrols)for(const p of patrol)expect(pilotWaterDepth(p.x+.5,p.y+.5)).toBeLessThan(.18);
  expect(l.ledges.some(x=>Math.abs(x.point.x-(green.x+6.5))<.01&&Math.abs(x.point.y-(green.y-5.5))<.01&&(x.width||0)>=8&&(x.depth||0)>=5)).toBe(true);
 });
});
