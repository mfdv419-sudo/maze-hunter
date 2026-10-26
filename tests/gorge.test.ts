import {it,expect} from 'vitest';
import * as T from 'three';
import {AdventureState} from '../src/game/adventure-state';
import {biomeElevation} from '../src/game/biome-layout';
import {gorgeLandmarks,gorgeBank,gorgeElevation,gorgeCliffTop,gorgeRiver} from '../src/game/gorge-terrain';
import {gorgeGuardian} from '../src/game/gorge-guardian';
import {createMatch,type Player} from '../src/game/room-state';
import {loadAdventure} from '../src/game/adventure-room';
it('canyon has real elevation, a shallow river and a dry bridge on the shared terrain surface',()=>{
 const s=new AdventureState('medium',0,15025,false,undefined,'gorge'),l=s.layout,{river:r,bridge:b,terrace:t}=gorgeLandmarks(l);
 expect(gorgeElevation(t.x+.5,t.y+.5,l)-gorgeElevation(r.x,r.y,l)).toBeGreaterThan(2);
 expect(gorgeBank(r.x,r.y,l)-gorgeElevation(r.x,r.y,l)).toBeCloseTo(.74);
 expect(gorgeRiver(b.x,b.y,l).wet).toBe(0);expect(gorgeElevation(b.x,b.y,l)).toBe(gorgeBank(b.x,b.y,l));
 for(const p of l.solution){expect(biomeElevation('gorge',p.x+.5,p.y+.5,l)).toBe(gorgeElevation(p.x+.5,p.y+.5,l));expect(gorgeCliffTop(p.x,p.y,l)-gorgeBank(p.x,p.y,l)).toBeGreaterThan(5.9);}
 s.position={...r};const wet=s.speedFactor;s.position={x:b.x,y:b.y};expect(wet).toBeLessThan(s.speedFactor);
 // Joining a bridge or wading never consumes a life; this is shallow water, not an old lethal river tile.
 s.guards.forEach(g=>g.dead=true);s.position={...r};s.step(.04,.04,0,0,0);expect(s.lives).toBe(3);
});
it('stone monarch moves and uses its own warned attacks with recovery windows and ammunition refill',()=>{
 const s=new AdventureState('hard',0,52,false,undefined,'gorge');s.guards.filter(g=>!g.boss).forEach(g=>g.dead=true);s.layout.seals.forEach((_,i)=>s.seals.add(i));const king=s.guards.find(g=>g.boss)!;
 s.position={x:king.position.x+3,y:king.position.y};s.invulnerableUntil=10000;s.ammo=0;const origin={...king.position};const kinds=new Set<string>();
 for(let i=0;i<900;i++){s.step(.04,.04,0,0,0);s.hazards.forEach(h=>{kinds.add(h.kind);expect(h.end).toBeGreaterThan(h.at);});}
 expect(Math.hypot(king.position.x-origin.x,king.position.y-origin.y)).toBeGreaterThan(.3);
 expect([...kinds].sort()).toEqual(['charge','rockfall','slam']);expect(s.ammo).toBeGreaterThan(0);expect(king.vulnerableUntil).toBeGreaterThan(king.vulnerableAt!);
});
it('canyon attacks and terrain reconstruct identically on server and survive a saved run',()=>{
 const p:Player={uid:'a',profileId:'a',name:'A',outfit:'classic',ready:true,online:true,x:1.5,y:1.5,angle:0,lastMove:0,seq:0,finishedAt:null,slot:0},r=createMatch('ABC234','a',p,'race','medium',1000,52);r.area='gorge';r.adventure={version:2,map:0,states:{},tickAt:0,escapeAt:-1,escapeDuration:90,bossHP:0};
 const server=loadAdventure(r,'a'),client=new AdventureState('medium',0,52,false,undefined,'gorge');expect(server.grid).toEqual(client.grid);
 const f=client.layout.fortress;expect(gorgeElevation(f.x+.5,f.y+.5,server.layout)).toBe(gorgeElevation(f.x+.5,f.y+.5,client.layout));
 client.hazards.push({id:1,kind:'rockfall',point:{...client.position},from:{...client.position},at:3,end:4,radius:.8,resolved:false});server.restore(client.save());expect(server.hazards[0].kind).toBe('rockfall');
});
it('crab and stone king have different silhouettes and articulated idle, walk, anticipation and hit poses',()=>{
 const crab=gorgeGuardian(),king=gorgeGuardian(true);expect(crab.name).toBe('ketam-tebing');expect(king.name).toBe('raja-batu-retak');expect(crab.getObjectByName('rock-carapace')).toBeDefined();expect(king.getObjectByName('amber-core')).toBeDefined();
 for(const model of [crab,king]){const rig=model.getObjectByName('gorge-rig')!;model.userData.animate(1,0,0,false,3,1);const idle=rig.getObjectByName(model===crab?'crab-arm':'stone-shoulder')!.rotation.x;model.userData.animate(1,1,.9,false,.15,2);expect(rig.getObjectByName(model===crab?'crab-arm':'stone-shoulder')!.rotation.x).not.toBe(idle);model.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(model);expect(bounds.isEmpty()).toBe(false);expect(Number.isFinite(bounds.max.y)).toBe(true);}
});

it('canyon charges advance over several simulation frames and resume correctly from a saved dash',()=>{
 const s=new AdventureState('medium',0,52,false,undefined,'gorge');s.guards.filter(g=>!g.boss).forEach(g=>g.dead=true);s.layout.seals.forEach((_,i)=>s.seals.add(i));const king=s.guards.find(g=>g.boss)!;s.position={x:king.position.x+4,y:king.position.y};s.stage='boss';s.bossAwakeAt=0;s.elapsed=8;s.invulnerableUntil=10000;s.nextBossSkill=10000;s.hazards=[{id:1,kind:'charge',point:{...s.position},from:{...king.position},at:0,end:2,radius:.85,resolved:false}];const origin={...king.position};s.step(.02,.02,0,0,0);expect(king.dash).toBeDefined();expect(king.position).toEqual(origin);
 s.step(.02,.02,0,0,0);const first=Math.hypot(king.position.x-origin.x,king.position.y-origin.y);expect(first).toBeGreaterThan(0);expect(first).toBeLessThan(.2);
 const resumed=new AdventureState('medium',0,52,false,undefined,'gorge');resumed.restore(s.save());for(let i=0;i<20;i++){const prev={...king.position};s.step(.02,.02,0,0,0);resumed.step(.02,.02,0,0,0);expect(Math.hypot(king.position.x-prev.x,king.position.y-prev.y)).toBeLessThan(.3);}expect(king.dash).toBeUndefined();expect(resumed.guards.find(g=>g.boss)!.position).toEqual(king.position);
});
