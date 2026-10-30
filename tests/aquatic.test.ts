import * as T from 'three';
import {createBinturong} from '../src/game/character';
import {it,expect} from 'vitest';
import {AdventureState} from '../src/game/adventure-state';
import {aquaticGround,aquaticChestDepth} from '../src/game/aquatic';
import {center} from '../src/game/maze';
import {createMatch,addPlayer,startMatch,performAction,type Player} from '../src/game/room-state';
import {loadAdventure,tickAdventureRoom} from '../src/game/adventure-room';
import {Climber} from '../src/game/climbing';
it('requires a real descent to collect an underwater chest, then surfaces without a height teleport',()=>{
 for(const area of ['sea','coast']as const){const s=new AdventureState('medium',0,15025,false,undefined,area);s.guards.forEach(g=>g.dead=true);const p=s.layout.chests[0];s.position=center(p);s.step(.04,.04,0,0,0);expect(s.swimming).toBe(true);expect(s.chests.has(0)).toBe(false);expect(s.toggleDive()).toBe(true);expect(s.toggleDive()).toBe(false);s.step(.04,.04,0,0,0);expect(s.depth).toBeGreaterThan(0);expect(s.depth).toBeLessThan(.1);for(let i=0;i<45;i++)s.step(.04,.04,0,0,0);expect(s.chests.has(0)).toBe(true);expect(Math.abs(s.depth-aquaticChestDepth(area,0,p,s.layout))).toBeLessThan(.55);expect(s.toggleDive()).toBe(true);for(let i=0;i<45;i++)s.step(.04,.04,0,0,0);expect(s.depth).toBe(0);}
});
it('has actual beach elevations, dry-land chests and climbable coconut palms',()=>{
 const s=new AdventureState('medium',0,15025,false,undefined,'sea');expect(aquaticGround('sea',s.position.x,s.position.y,s.layout)).toBeGreaterThan(0);expect(s.swimming).toBe(false);expect(s.toggleDive()).toBe(false);expect(aquaticChestDepth('sea',1,s.layout.chests[1],s.layout)).toBe(0);const palm=s.layout.ledges.find(l=>l.kind==='palm')!,c=new Climber(),q=center(palm.point),previous={x:q.x-.7,y:q.y};c.step(previous,{x:q.x-.65,y:q.y},{x:2,y:0},.5,.04,[palm]);expect(c.state.phase).toBe('hanging');expect(c.up()).toBe(true);let pos={...c.state.edge};for(let i=0;i<38;i++)pos=c.step(pos,pos,{x:0,y:0},0,.04,[palm]).position;expect(c.state.phase).toBe('top');expect(c.elevation).toBe(2.65);
});
it('serializes dive state, clears it on dry land and preserves existing nonaquatic behavior',()=>{
 const s=new AdventureState('medium',0,1,false,undefined,'sea');s.guards.forEach(g=>g.dead=true);s.position=center(s.layout.chests[0]);s.toggleDive();s.step(.4,.4,0,0,0);const saved=s.save(),copy=new AdventureState('medium',0,1,false,undefined,'sea');copy.restore(saved);expect(copy.depth).toBe(s.depth);expect(copy.diving).toBe(true);copy.position=center(copy.layout.maze.start);copy.step(.04,.04,0,0,0);expect(copy.depth).toBe(0);expect(copy.diving).toBe(false);expect(new AdventureState('medium',0).toggleDive()).toBe(false);
});
it('the authoritative room validates diving and only awards submerged loot after depth simulation',()=>{
 const p:Player={uid:'a',profileId:'a',name:'a',outfit:'classic',ready:true,online:true,x:1.5,y:1.5,angle:0,lastMove:0,seq:0,finishedAt:null,slot:0};const r=createMatch('ABC234','a',p,'coop','medium',1000,15025);r.area='sea';r.adventure={version:2,map:0,states:{},tickAt:0,escapeAt:-1,escapeDuration:90,bossHP:0};addPlayer(r,'b',{...p,uid:'b',profileId:'b'},1000);startMatch(r,'a',1000);const s=loadAdventure(r,'a');s.guards.forEach(g=>g.dead=true);s.invulnerableUntil=10000;s.position=center(s.layout.chests[0]);r.adventure.states.a=s.save();performAction(r,'a','dive',4500);expect(loadAdventure(r,'a').diving).toBe(true);expect(loadAdventure(r,'a').chests.has(0)).toBe(false);tickAdventureRoom(r,6500);const after=loadAdventure(r,'a');expect(after.depth).toBeGreaterThan(2);expect(after.chests.has(0)).toBe(true);expect(r.players.a.swimming).toBe(true);
});

it('the swimming tail trails behind the forward-facing mascot and stays finite while paddling',()=>{const c=createBinturong('classic');for(let i=0;i<25;i++)c.animate(i*.04,1,false,{swim:true,hit:0});c.root.updateMatrixWorld(true);const tip=c.root.getObjectByName('tail-charm')!.getWorldPosition(new T.Vector3());expect(tip.z).toBeLessThan(-.15);expect(Number.isFinite(tip.x+tip.y+tip.z)).toBe(true);c.dispose();});
