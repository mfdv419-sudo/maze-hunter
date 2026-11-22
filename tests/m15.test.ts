import {it,expect} from 'vitest';
import {AdventureState} from '../src/game/adventure-state';
import {biomeLayout,biomeElevation} from '../src/game/biome-layout';
import {adventureAreas,areaSize,areaTime} from '../src/game/areas';
import {adventureLayout} from '../src/game/adventure-layout';
import {forestLayout} from '../src/game/forest-layout';
import {route as walkRoute,distances,retroMaze,retroDecisions,retroPageCount} from '../src/game/maze';
import legacy from '../src/game/retro-catalog-v11.json';
import {createMatch,addPlayer,startMatch,type Player} from '../src/game/room-state';
import {loadAdventure,roomCapacity} from '../src/game/adventure-room';
import {retroBoard,boardRoute} from '../src/game/retro-board';
import {teamSealSites} from '../src/game/quest-seals';
import {recordRun,readRuns} from '../src/services/records';
it('restores every accepted level 5–40 layout exactly while keeping the latest time/count progression',()=>{
 for(let level=5;level<=40;level++)for(let page=0;page<retroPageCount(level);page++){const old=legacy[level-5].pages[page],current=retroMaze(level,page);expect(current.grid).toEqual(old.grid);expect(current.start).toEqual(old.start);expect(current.finish).toEqual(old.finish);expect(retroDecisions(level,page)).toEqual(old.decisions);}
});
it('preserves original SOLO and the protected Forest sample, with separate additional expedition areas',()=>{
 for(const d of ['medium','hard','extreme']as const){expect(new AdventureState(d,2,52).layout).toEqual(adventureLayout(d,2,52));expect(new AdventureState(d,0,52,true).layout).toEqual(forestLayout());}expect(adventureAreas).toHaveLength(7);
});
it('each new area scales with difficulty, has distant reachable quests, multiple starts and deterministic inventories',()=>{
 for(const area of adventureAreas.filter(a=>a!=='classic'))for(const d of ['medium','hard','extreme']as const)for(const map of [0,9]){
  const a=biomeLayout(area,d,map,52),ds=distances(a.maze.grid,a.maze.start),key=(p:{x:number;y:number})=>`${p.x},${p.y}`;expect(a.maze.grid).toHaveLength(areaSize(area,d));for(const p of [...a.seals,...a.chests,...a.stars,...a.starts,a.maze.finish,a.fortress])expect(ds.has(key(p))).toBe(true);expect(a.starts).toHaveLength(roomCapacity[d]);expect(new Set(a.starts.map(key)).size).toBe(roomCapacity[d]);expect(a.solution.length).toBeGreaterThan(90);expect(a.patrols.every(p=>p.length>0)).toBe(true);expect(biomeLayout(area,d,map,52).maze.grid).toEqual(a.maze.grid);expect(areaTime(area,d)).toBeGreaterThanOrEqual(1800);
 }
},60000);
it('new expedition seal locks, terrain and thirty-player-objective sites remain connected',()=>{
 for(const area of ['forest','desert','gorge','mountain','coast','sea']as const){const s=new AdventureState('medium',0,52,false,undefined,area);expect(s.expedition).toBe(true);expect(s.sealUnlocked(0)).toBe(false);s.guards[0].dead=true;expect(s.sealUnlocked(0)).toBe(true);const p=s.layout.forest!.highland;expect(Number.isFinite(biomeElevation(area,p.x,p.y,s.layout))).toBe(true);const sites=teamSealSites(s.layout,{slots:Array.from({length:10},(_,i)=>i),slot:0,shared:true});expect(sites).toHaveLength(30);expect(new Set(sites.map(p=>`${p.x},${p.y}`)).size).toBe(30);}
});
it('online rooms reconstruct the selected area identically on the authoritative server for all capacity bands',()=>{
 const player=(id:string):Player=>({uid:id,profileId:id,name:id,outfit:'classic',ready:true,online:true,x:1.5,y:1.5,angle:0,lastMove:0,seq:0,finishedAt:null,slot:0});
 for(const d of ['medium','hard','extreme']as const){const r=createMatch('ABC234','a',player('a'),'coop',d,1000,52);r.area='desert';r.adventure={version:2,map:0,states:{},tickAt:0,escapeAt:-1,escapeDuration:90,bossHP:0};for(let i=1;i<roomCapacity[d];i++)addPlayer(r,'p'+i,player('p'+i),1000);startMatch(r,'a',1000);const server=loadAdventure(r,'a'),client=new AdventureState(d,0,52,false,{slots:r.adventure.questSlots!,slot:0,shared:true},'desert');expect(server.area).toBe('desert');expect(server.sealGoal).toBe(roomCapacity[d]*3);expect(server.grid).toEqual(client.grid);expect(server.layout.seals).toEqual(client.layout.seals);expect(r.expiresAt-r.startsAt).toBeGreaterThan(areaTime('desert',d)*1000);}
},30000);
it('every new Medium area can be physically traversed through its three quests and final escape',()=>{
 for(const area of ['forest','desert','gorge','mountain','coast','sea']as const){const s=new AdventureState('medium',0,15025,false,undefined,area);s.guards.filter(g=>!g.boss).forEach(g=>g.dead=true);s.invulnerableUntil=10000;const nav=s.grid.map((row,y)=>row.map((v,x)=>v||s.layout.forest!.trunks.some(p=>Math.hypot(x-p.x,y-p.y)<.5)||s.layout.ledges.some(l=>Math.hypot(x-l.point.x,y-l.point.y)<.9)||s.layout.forest!.pillars.some(p=>Math.hypot(x-p.x,y-p.y)<.6)?1:0));
  const walk=(target:{x:number;y:number})=>{const ps=walkRoute(nav,{x:Math.floor(s.position.x),y:Math.floor(s.position.y)},target);expect(ps.length,area).toBeGreaterThan(0);for(const p of ps){const end={x:p.x+.5,y:p.y+.5};for(let n=0;n<110&&s.phase==='playing'&&Math.hypot(end.x-s.position.x,end.y-s.position.y)>.04;n++){const dx=end.x-s.position.x,dy=end.y-s.position.y,d=Math.hypot(dx,dy),v=Math.min(2.3,d/.04);s.step(.04,.04,dx/d*v,dy/d*v,0);}if(s.phase==='playing')expect(Math.hypot(end.x-s.position.x,end.y-s.position.y),area).toBeLessThan(.05);}};
  for(const p of s.layout.seals)walk(p);expect(s.seals.size,area).toBe(3);walk(s.layout.fortress);const k=s.guards.find(g=>g.boss)!;k.vulnerableAt=0;k.vulnerableUntil=10000;while(!k.dead){s.elapsed+=.6;s.hitGuard(k);}walk(s.layout.maze.finish);expect(s.phase,area).toBe('won');
 }
},60000);

it('added high-level routes use multiple first directions and winding links rather than a fixed central connector',()=>{
 const headings=new Set<string>();for(let level=41;level<=100;level++)for(let page=0;page<retroPageCount(level);page++){const b=retroBoard(level,page),ds=retroDecisions(level,page);for(const [i,d]of ds.entries()){const p=boardRoute(b,d.point,d.next);headings.add(`${p[1].x-p[0].x},${p[1].y-p[0].y}`);if(i+1<ds.length){const tail=p.slice(-18);let turns=0;for(let n=2;n<tail.length;n++)if(tail[n].x-tail[n-1].x!==tail[n-1].x-tail[n-2].x||tail[n].y-tail[n-1].y!==tail[n-1].y-tail[n-2].y)turns++;expect(turns).toBeGreaterThanOrEqual(4);}}}expect(headings.size).toBeGreaterThanOrEqual(3);
});
