import {describe,it,expect} from 'vitest';
import {adventureLayout,adventureRules} from '../src/game/adventure-layout';
import {AdventureState} from '../src/game/adventure-state';
import {center,distances,route} from '../src/game/maze';
import {retroBoard,boardRoute,neighbors} from '../src/game/retro-board';
import {RetroState} from '../src/game/retro-state';
describe('Real Retro decisions',()=>{
 it('all 100 boards have wrong branches, thin-wall connectivity and a valid winning route',()=>{
  for(let i=1;i<=100;i++){const b=retroBoard(i);expect(b.deadEnds.length).toBeGreaterThanOrEqual(2);expect(boardRoute(b).length).toBeGreaterThan(6);const s=new RetroState(i);s.start();for(const p of boardRoute(b))s.trace(center(p));expect(s.phase).toBe('won');}
 });
 it('wall contact costs nothing, a dead end resets to Start once, and time continues',()=>{
  const s=new RetroState(1);s.start();s.tick(3);expect(s.trace({x:-1,y:0})).toBe(false);expect(s.lives).toBe(3);
  for(const p of boardRoute(s.board,s.board.start,s.board.deadEnds[0]))s.trace(center(p));
  expect(s.lives).toBe(2);expect(s.position).toEqual(center(s.board.start));expect(s.path.length).toBe(1);expect(s.elapsed).toBe(3);
 });
});
describe('Adventure catalog',()=>{
 it('has ten distinct, long and fully reachable maps per difficulty',()=>{
  for(const d of ['medium','hard','extreme'] as const){const unique=new Set<string>();for(let i=0;i<10;i++){
   const a=adventureLayout(d,i,123);unique.add(JSON.stringify(a.maze.grid));expect(a.solution.length).toBeGreaterThan(adventureRules[d].minPath);
   const reachable=distances(a.maze.grid,a.maze.start);
   for(const p of [...a.seals,...a.stars,...a.chests,...a.rivers,...a.bosses])expect(reachable.has(`${p.x},${p.y}`)).toBe(true);
   expect(a.seals.length).toBe(3);expect(a.bosses.length).toBe(1);expect(a.patrols.length).toBe(adventureRules[d].guards+adventureRules[d].bosses-1);
   expect(adventureLayout(d,i,456).maze.grid).toEqual(a.maze.grid);
  }expect(unique.size).toBe(10);}
 },30000);
});
describe('Adventure encounters',()=>{
 it('requires three seals AND a defeated King before the gate opens',()=>{
  const s=new AdventureState('medium',0,2);s.position=center(s.layout.maze.finish);s.step(.01,.01,0,0,.5);expect(s.phase).toBe('playing');
  s.seals=new Set([0,1,2]);expect(s.gateOpen).toBe(false);
  const boss=s.guards.find(g=>g.boss)!;for(let i=0;i<s.bossMaxHP;i++)s.hitGuard(boss);s.step(.01,.01,0,0,.5);expect(s.phase).toBe('won');
 });
 it('ordinary cakes slow, stun, then respawn; King resets fog only on Hard/Extreme',()=>{
  const s=new AdventureState('hard',1);s.seals.add(0);s.damage('guard');expect(s.lives).toBe(3);expect(s.speedFactor).toBe(.55);
  s.elapsed+=1.5;s.damage('guard');expect(s.speedFactor).toBe(0);s.elapsed+=1.5;s.damage('guard');expect(s.lives).toBe(2);expect(s.resetFogRevision).toBe(0);
  s.elapsed+=2;s.damage('boss');expect(s.resetFogRevision).toBe(1);expect(s.position).toEqual(center(s.layout.maze.start));expect(s.seals.size).toBe(1);
 });
 it('invulnerability prevents repeated damage and the same map survives respawn',()=>{
  const s=new AdventureState('medium',2);const before=JSON.stringify(s.grid);s.damage('boss');s.damage('boss');expect(s.lives).toBe(2);expect(s.resetFogRevision).toBe(0);expect(JSON.stringify(s.grid)).toBe(before);
 });
 it('rivers penalize walking, but jumping across them is safe',()=>{
  const s=new AdventureState('medium',3);expect(s.layout.rivers.length).toBeGreaterThan(0);s.position=center(s.layout.rivers[0]);s.step(.01,.01,0,0,.4);expect(s.lives).toBe(3);s.step(.01,.01,0,0,0);expect(s.lives).toBe(2);
 });
 it('B cuts actual grass walls to create a new traversable route',()=>{
  const s=new AdventureState('medium',4);const grass=s.layout.grass[0];expect(grass).toBeDefined();const adjacent=[[1,0],[-1,0],[0,1],[0,-1]].map(([x,y])=>({x:grass.x+x,y:grass.y+y})).find(p=>!s.grid[p.y][p.x])!;
  s.position=center(adjacent);expect(s.throwCake(0)).toBe(true);expect(s.grid[grass.y][grass.x]).toBe(0);expect(s.ammo).toBe(6);
 });
 it('projectiles collide with walls and can defeat guardians without infinite ammo',()=>{
  const s=new AdventureState('medium',0);s.layout.grass=[];const g=s.guards.find(g=>!g.boss)!;
  const p=g.patrol[0];const neighbor=[[1,0],[-1,0],[0,1],[0,-1]].map(([x,y])=>({x:p.x+x,y:p.y+y})).find(q=>!s.grid[q.y][q.x])!;
  s.position=center(neighbor);g.position=center(p);g.patrol=[p];
  for(let hit=0;hit<3;hit++){s.elapsed+=1;s.throwCake(Math.atan2(g.position.x-s.position.x,g.position.y-s.position.y));for(let i=0;i<12;i++)s.step(.02,.02,0,0,.4);}
  expect(g.dead).toBe(true);expect(s.projectiles.every(p=>p.ttl>0)).toBe(true);
 });
});
describe('Adventure end-to-end state progression',()=>{
 it('walks connected routes to all seals, then completes the unlocked gate',()=>{
  const s=new AdventureState('medium',0,123);
  // Combat has separate projectile tests. This route checks pickup, movement,
  // checkpoint and gate lifecycle without injecting a winning phase.
  for(const g of s.guards)g.dead=true;
  for(const target of [...s.layout.seals,s.layout.maze.finish]) {
   const cells=route(s.grid,{x:Math.floor(s.position.x),y:Math.floor(s.position.y)},target);
   for(const cell of cells){const p=center(cell);for(let i=0;i<100&&Math.hypot(p.x-s.position.x,p.y-s.position.y)>.04;i++){
    const dx=p.x-s.position.x,dy=p.y-s.position.y,d=Math.hypot(dx,dy),speed=Math.min(2.7,d/.04);
    s.step(.04,.04,dx/d*speed,dy/d*speed,.4);
   }}
  }
  expect(s.seals.size).toBe(3);expect(s.phase).toBe('won');expect(s.elapsed).toBeGreaterThan(30);expect(s.elapsed).toBeLessThan(s.limit);
 });
 it('cakes fired at a solid wall disappear instead of crossing it',()=>{
  const s=new AdventureState('medium',0);s.layout.grass=[];s.throwCake(-Math.PI/2);
  for(let i=0;i<20;i++)s.step(.03,.03,0,0,.4);
  expect(s.projectiles.filter(p=>p.owner==='player')).toHaveLength(0);
 });
});
describe('M6 difficulty curve',()=>{
 it('becomes denser at level 6 and has a substantially larger level 21',()=>{
  expect(retroBoard(5).size).toBe(5);expect(retroBoard(6).size).toBe(9);expect(retroBoard(21).size).toBe(15);
  expect(retroBoard(6).deadEnds.length).toBeGreaterThanOrEqual(4);
 });
});
describe('Dodge space in Adventure corridors',()=>{
 it('allows a sideways sidestep to avoid a center-line cake in a one-cell corridor',()=>{
  const s=new AdventureState('medium',0);s.guards.forEach(g=>g.dead=true);s.layout.rivers=[];s.layout.seals=[];s.layout.stars=[];s.layout.chests=[];
  s.grid.splice(0,s.grid.length,[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]);s.position={x:1.5,y:3.5};s.checkpoint={...s.position};
  for(let i=0;i<8;i++)s.step(.025,.025,2,0,0);
  expect(s.position.x).toBeGreaterThan(1.8);expect(s.position.x).toBeLessThan(1.88);
  s.projectiles.push({position:{x:1.5,y:1.5},velocity:{x:0,y:3.5},owner:'guard',ttl:2});
  for(let i=0;i<30;i++)s.step(.025,.025,0,0,0);
  expect(s.hits).toBe(0);expect(s.lives).toBe(3);
 });
});
