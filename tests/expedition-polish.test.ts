import {describe,expect,it} from 'vitest';
import {AdventureState} from '../src/game/adventure-state';
import {biomeLayout} from '../src/game/biome-layout';
import {areaSize} from '../src/game/areas';
import {equipmentAreas,expeditionEquipment} from '../src/game/expedition-equipment';
import {forestStages} from '../src/game/forest-progression';
import {activeExpeditionGear,cosmetics,owns,redeem,settleWardrobe,stats} from '../src/services/cosmetics';
import {expeditionRank,mergeProfile,newProfile,recordExpandedExpedition,recordExpedition,recordExpeditionWin} from '../src/services/local';

describe('Adventure equipment and combat',()=>{
 it('has one redeemable item per themed arena and progression stage',()=>{
  expect(expeditionEquipment).toHaveLength(42);
  for(const area of equipmentAreas){
   const p=newProfile('Explorer','en'),items=cosmetics.filter(c=>c.expedition?.area===area);
   expect(items.map(c=>c.expedition!.stage)).toEqual(forestStages);
   expect(new Set(items.map(c=>c.id)).size).toBe(6);
   expect(recordExpeditionWin(p,area,'world-extreme')).toBe(false);
   for(const [index,stage] of forestStages.entries()){
    expect(owns(p,items[index])).toBe(false);
    expect(recordExpeditionWin(p,area,stage)).toBe(true);
    expect(owns(p,items[index])).toBe(true);
   }
   expect(expeditionRank(p,area)).toBe(6);
   expect(activeExpeditionGear(p,area)).toHaveLength(6);
  }
 });
 it('allows an early shop purchase without advancing the arena',()=>{
  const p=newProfile('Explorer','en'),boots=cosmetics.find(c=>c.id==='expedition-sea-1')!;
  recordExpedition(p,'sea-easy-0',{coins:0,stars:0,chests:0,zones:[],guardStars:51});
  expect(redeem(p,boots)).toBe(true);
  expect(activeExpeditionGear(p,'sea')).toHaveLength(0);
  const {wallet,rejected}=settleWardrobe(p,p.wardrobe,p.wardrobe!.pending);
  expect(rejected).toEqual([]);
  p.wardrobe=wallet;
  expect(activeExpeditionGear(p,'sea').map(item=>item.id)).toEqual([boots.id]);
  expect(expeditionRank(p,'sea')).toBe(0);
 });
 it('stores best guardian stars from regular and expanded maps separately',()=>{
  const p=newProfile('Explorer','en');
  const result={coins:0,stars:3,chests:0,zones:[0],guardStars:5};
  recordExpedition(p,'forest-extreme-0',result);
  recordExpandedExpedition(p,'forest','hard',result);
  recordExpandedExpedition(p,'forest','hard',{...result,guardStars:8});
  recordExpandedExpedition(p,'forest','hard',{...result,guardStars:2});
  expect(stats(mergeProfile(p,structuredClone(p))).stars).toBe(19);
 });
 it('awards one saved star when a guardian is defeated, using base hits 2–7',()=>{
  const modes=[['easy',false],['medium',false],['hard',false],['extreme',false],['hard',true],['extreme',true]] as const;
  for(const [index,[difficulty,expanded]] of modes.entries()){
   const s=new AdventureState(difficulty,0,1,false,undefined,'classic',false,false,false,[],expanded);
   const guard=s.guards.find(g=>!g.boss)!;
   expect(guard.hp).toBe(index+2);
   for(let hit=0;hit<index+1;hit++)s.hitGuard(guard);
   expect(guard.dead).toBe(false);
   s.hitGuard(guard);s.hitGuard(guard);
   expect(s.guardStars).toBe(1);
   expect(s.effectEvents.filter(event=>event.source==='guard-star')).toHaveLength(1);
   s.restore(s.save());
   expect(s.guardStars).toBe(1);
   expect(s.guards.find(g=>!g.boss)!.dead).toBe(true);
  }
 });
 it('gives Coral Sea a usable Bubble Claw and a real oxygen reserve',()=>{
  const items=expeditionEquipment.filter(item=>item.id==='expedition-sea-4'||item.id==='expedition-sea-5');
  const state=new AdventureState('easy',0,27,false,undefined,'sea',false,false,false,[],false,items);
  expect(state.oxygenCapacity).toBe(48);
  const ammo=state.ammo;
  expect(state.useExpeditionWeapon(0)).toBe(true);
  expect(state.ammo).toBe(ammo-1);
  expect(state.projectiles.map(p=>p.style)).toEqual(Array(5).fill('bubble'));
  expect(new Set(state.projectiles.map(p=>p.delay)).size).toBe(5);
  expect(state.useExpeditionWeapon(0)).toBe(false);
 });
 it('builds larger connected maps for the other themed Expanded Worlds',()=>{
  for(const area of equipmentAreas){
   if(area==='forest')continue;
   for(const difficulty of ['hard','extreme'] as const){
    const layout=biomeLayout(area,difficulty,0,27,0,true);
    expect(layout.maze.grid.length).toBeGreaterThan(areaSize(area,difficulty));
    expect(layout.solution.length).toBeGreaterThan(210);
   }
  }
 },60_000);
});
