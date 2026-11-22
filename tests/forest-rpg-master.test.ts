import {describe,expect,it} from 'vitest';
import {forestRing} from '../src/game/forest-ring';
import {route} from '../src/game/maze';
import {forestItemInfo,forestMarketOffers} from '../src/game/forest-rpg';

describe('Forest Grove RPG master world',()=>{
 it('keeps all arena gates reachable after solid RPG content is applied',()=>{
  for(const difficulty of ['easy','medium','hard','extreme'] as const)for(let seed=0;seed<20;seed++){
   const ring=forestRing(difficulty,seed,1);
   for(const zone of ring.zones.filter(z=>!['entrance','inner','boss'].includes(z.id)))for(const portal of ring.portals.filter(p=>p.arena===zone.id))
    expect(route(ring.grid,zone.point,portal.point).length,`${difficulty}/${seed}/${zone.id}/${portal.slot}`).toBeGreaterThan(0);
  }
 });
 it('fills Extreme with markets, rest/activity sites and rewarding dead ends',()=>{
  const ring=forestRing('extreme',0,1);
  expect(ring.content.length).toBeGreaterThanOrEqual(35);
  expect(ring.content.filter(s=>s.kind==='market').length).toBeGreaterThanOrEqual(7);
  expect(ring.content.some(s=>s.id==='inner-rest')).toBe(true);
  expect(ring.content.some(s=>s.id==='inner-forge')).toBe(true);
  expect(ring.content.filter(s=>s.id.startsWith('trail-pocket-')).length).toBeGreaterThanOrEqual(8);
 });
 it('market consumables have explicit recovery/value data',()=>{
  for(const id of forestMarketOffers){const item=forestItemInfo[id];expect(item.price).toBeGreaterThan(0);expect(item.hp||item.stamina||id==='dragon-treat').toBeTruthy();}
 });
});
