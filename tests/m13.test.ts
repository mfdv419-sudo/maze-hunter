import {it,expect} from 'vitest';
import {AdventureState} from '../src/game/adventure-state';
import {forestElevation,forestLayout,inCave} from '../src/game/forest-layout';
import {forestQuests} from '../src/game/forest-quests';
import {center,distances,route} from '../src/game/maze';
import {airborneHeight,nextJump} from '../src/game/actions';
import {teamSealSites} from '../src/game/quest-seals';
import {adventureLayout} from '../src/game/adventure-layout';
import {createMatch,addPlayer,startMatch,performAction} from '../src/game/room-state';
import {loadAdventure,tickAdventureRoom} from '../src/game/adventure-room';
it('opens each forest seal only after its own guardian, and chest rewards report actual capped gains',()=>{
 const s=new AdventureState('medium',0,13025,true);const clues=forestQuests(s,'id');expect(clues[0].clue).toContain('gua');expect(clues[1].clue).toContain('rumah');expect(clues[2].clue).toContain('tangga');
 for(let i=0;i<3;i++){s.position=center(s.layout.seals[i]);s.step(.01,.01,0,0,.5,true);expect(s.seals.has(i)).toBe(false);s.guards[i].dead=true;s.step(.01,.01,0,0,.5,true);expect(s.seals.has(i)).toBe(true);}
 s.ammo=7;s.lives=3;s.position=center(s.layout.chests[0]);s.step(.01,.01,0,0,.5,true);expect(s.lastLoot).toEqual({id:0,coins:5,keys:1,cakes:1,hearts:0});expect(s.ammo).toBe(8);expect(s.lives).toBe(3);const copy=new AdventureState('medium',0,13025,true);copy.restore(s.save());expect(copy.lastLoot).toEqual(s.lastLoot);expect(copy.chests.size).toBe(1);
});
it('the larger expedition has separated destinations, a walk-in lodge, highland slopes and shallow cave water',()=>{
 const a=forestLayout(),d=distances(a.maze.grid,a.maze.start);expect(a.maze.grid).toHaveLength(81);expect(d.get(`${a.fortress.x},${a.fortress.y}`)).toBeGreaterThan(90);for(const p of a.seals)expect(d.get(`${p.x},${p.y}`)).toBeGreaterThan(60);expect(route(a.maze.grid,a.seals[0],a.seals[1]).length).toBeGreaterThan(90);expect(a.maze.grid[29][13]).toBe(0);expect(a.maze.grid[29][10]).toBe(1);expect(forestElevation(47.5,23.5)).toBeGreaterThan(2);expect(forestElevation(64.5,63.5)).toBeLessThan(-.3);expect(inCave(64.5,63.5)).toBe(true);for(let y=2;y<79;y++)for(let x=2;x<79;x++)expect(Math.abs(forestElevation(x+.01,y)-forestElevation(x,y))).toBeLessThan(.01);
});
it('a real second impulse gains height without teleporting, cannot chain a third jump, and resets on landing',()=>{
 const first=nextJump({at:-1000,base:0,count:0},0)!;const t=.24,height=airborneHeight(first,t),second=nextJump(first,t)!;expect(airborneHeight(second,t)).toBeCloseTo(height);expect(airborneHeight(second,t+.3)).toBeGreaterThan(.9);expect(nextJump(second,t+.2)).toBeNull();expect(nextJump(first,.06)).toBeNull();expect(airborneHeight(second,2)).toBe(0);expect(nextJump(second,2)!.count).toBe(1);
});
it('the forest King pursues players, rejects armored spam, exposes a bounded counter window and produces varied attacks',()=>{
 const s=new AdventureState('medium',0,13025,true),k=s.guards.find(g=>g.boss)!;s.seals=new Set([0,1,2]);s.guards.filter(g=>!g.boss).forEach(g=>g.dead=true);s.position={x:s.layout.fortress.x+4.5,y:s.layout.fortress.y+.5};const hp=k.hp,before={...k.position};s.stage='boss';s.nextBossSkill=1000;k.nextShot=1000;for(let i=0;i<20;i++)s.step(.025,.025,0,0,.5);expect(k.position.x).toBeGreaterThan(before.x+.2);s.hitGuard(k);expect(k.hp).toBe(hp);k.vulnerableAt=s.elapsed;k.vulnerableUntil=s.elapsed+1;s.hitGuard(k);expect(k.hp).toBe(hp-1);s.hitGuard(k);expect(k.hp).toBe(hp-1);s.elapsed+=1.1;s.hitGuard(k);expect(k.hp).toBe(hp-1);
 const kinds=new Set<string>();for(let n=0;n<15;n++){s.nextBossSkill=0;s.elapsed+=2;s.step(.01,.01,0,0,.8);for(const h of s.hazards)kinds.add(h.kind);s.hazards=[];}expect(kinds.has('roots')).toBe(true);expect(kinds.has('charge')).toBe(true);expect(kinds.has('lightning')).toBe(true);
});
it('ten participants have thirty unique reachable sites and Race gives each slot a disjoint set of three',()=>{
 const a=adventureLayout('extreme',0,53),slots=Array.from({length:10},(_,i)=>i),all=teamSealSites(a,{slots,slot:0,shared:true}),d=distances(a.maze.grid,a.maze.start);expect(all).toHaveLength(30);expect(new Set(all.map(p=>`${p.x},${p.y}`)).size).toBe(30);for(const p of all)expect(d.has(`${p.x},${p.y}`)).toBe(true);const privateSites=slots.flatMap(slot=>teamSealSites(a,{slots,slot,shared:false}));expect(new Set(privateSites.map(p=>`${p.x},${p.y}`)).size).toBe(30);
});
it('server validates the second jump, blocks a third and shares the expanded Co-op goal',()=>{
 const player=(id:string)=>({uid:id,profileId:id,name:id,outfit:'classic',ready:true,online:true,x:1.5,y:1.5,angle:0,lastMove:0,seq:0,finishedAt:null,slot:0});const r=createMatch('ABC234','a',player('a'),'coop','medium',1000,52);r.adventure={version:2,map:0,states:{},tickAt:0,escapeAt:-1,escapeDuration:90,bossHP:0};addPlayer(r,'b',player('b'),1000);startMatch(r,'a',1000);expect(loadAdventure(r,'a').sealGoal).toBe(6);performAction(r,'a','jump',4500);performAction(r,'a','jump',4750);expect(r.players.a.jumpCount).toBe(2);expect(r.players.a.jumpBase).toBeGreaterThan(0);expect(()=>performAction(r,'a','jump',4950)).toThrow('cooling');r.adventure.states.a.seals=[0,1,2];r.adventure.states.b.seals=[3,4,5];tickAdventureRoom(r,5100);expect(loadAdventure(r,'a').seals.size).toBe(6);expect(loadAdventure(r,'b').seals.size).toBe(6);
});
it('can physically traverse all three forest quests and escape, including the gorge entrance and lodge doorway',()=>{
 const s=new AdventureState('medium',0,13025,true);s.guards.filter(g=>!g.boss).forEach(g=>g.dead=true);s.invulnerableUntil=10000;
 const f=s.layout.forest!,blocked=[...f.trunks.map(p=>({...p,r:.5})),...f.pillars.map(p=>({...p,r:.55})),...f.boulders.map(p=>({...p,r:1.5})),...s.layout.ledges.map(l=>({...l.point,r:.9}))],nav=s.grid.map((row,y)=>row.map((v,x)=>v||blocked.some(p=>Math.hypot(x-p.x,y-p.y)<p.r)?1:0));
 const walk=(target:{x:number;y:number})=>{const path=route(nav,{x:Math.floor(s.position.x),y:Math.floor(s.position.y)},target);expect(path.length).toBeGreaterThan(0);for(const q of path){const end=center(q);for(let n=0;n<100&&Math.hypot(end.x-s.position.x,end.y-s.position.y)>.04;n++){const dx=end.x-s.position.x,dy=end.y-s.position.y,d=Math.hypot(dx,dy),v=Math.min(2.3,d/.04);s.step(.04,.04,dx/d*v,dy/d*v,.5);}expect(Math.hypot(end.x-s.position.x,end.y-s.position.y)).toBeLessThan(.05);expect(s.phase).toBe('playing');}};
 for(const p of s.layout.seals)walk(p);expect(s.seals.size).toBe(3);walk(s.layout.fortress);const king=s.guards.find(g=>g.boss)!;king.vulnerableAt=0;king.vulnerableUntil=10000;while(!king.dead){s.elapsed+=.6;s.hitGuard(king);}expect(s.stage).toBe('escape');const path=route(nav,{x:Math.floor(s.position.x),y:Math.floor(s.position.y)},s.layout.maze.finish);for(const q of path){const end=center(q);for(let n=0;n<100&&s.phase==='playing'&&Math.hypot(end.x-s.position.x,end.y-s.position.y)>.04;n++){const dx=end.x-s.position.x,dy=end.y-s.position.y,d=Math.hypot(dx,dy),v=Math.min(2.3,d/.04);s.step(.04,.04,dx/d*v,dy/d*v,.5);}}expect(s.phase).toBe('won');expect(s.remaining).toBeGreaterThan(0);
});
