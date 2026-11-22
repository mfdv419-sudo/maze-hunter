import type {AdventureLayout} from './adventure-layout';
import {route,type Point} from './maze';
/** An authored expedition: separate cave, abandoned lodge and elevated grove quests before the King. */
export function forestLayout():AdventureLayout{
 const n=81,grid=Array.from({length:n},()=>Array(n).fill(1));
 const p=(x:number,y:number)=>({x,y});
 const clear=(x:number,y:number,r:number)=>{for(let b=y-r;b<=y+r;b++)for(let a=x-r;a<=x+r;a++)if(a>0&&b>0&&a<n-1&&b<n-1)grid[b][a]=0;};
 const line=(a:Point,b:Point,r=2)=>{let q={...a};clear(q.x,q.y,r);while(q.x!==b.x||q.y!==b.y){if(q.x!==b.x)q.x+=Math.sign(b.x-q.x);else q.y+=Math.sign(b.y-q.y);clear(q.x,q.y,r);}};
 const start=p(9,69),fortress=p(67,13),finish=p(75,5),cave=p(63,62),cabin=p(13,25),highland=p(47,23);
 const links=[[start,p(9,57)],[p(9,57),p(25,57)],[p(25,57),p(25,43)],[p(25,43),p(13,43)],[p(13,43),p(13,29)],[p(25,57),p(45,57)],[p(45,57),p(45,67)],[p(45,67),p(57,67)],[p(57,67),cave],[p(45,57),p(45,45)],[p(25,43),p(33,43)],[p(33,43),p(33,31)],[p(33,31),p(47,31)],[p(47,31),highland],[p(47,31),p(57,31)],[p(57,31),p(57,13)],[p(57,13),fortress],[p(33,43),p(45,43)],[p(9,57),p(5,49)],[p(25,57),p(29,73)],[p(45,45),p(61,45)],[p(61,45),p(61,39)],[p(33,31),p(25,19)]];
 links.forEach(([a,b])=>line(a,b));clear(start.x,start.y,4);clear(cave.x,cave.y,6);clear(highland.x,highland.y,4);clear(fortress.x,fortress.y,8);
 // The lodge has solid walls and a south-facing doorway, not a painted facade.
 clear(cabin.x,cabin.y,4);for(let y=21;y<=29;y++)for(let x=9;x<=17;x++)if(x===9||x===17||y===21||y===29)grid[y][x]=1;grid[29][13]=grid[29][14]=0;
 line(p(74,13),p(75,13));line(p(75,13),finish);const secret=p(75,9);grid[secret.y][secret.x]=1;line(p(73,13),p(73,5));line(p(73,5),finish);
 const seals=[p(64,63),p(13,23),p(47,21)],chests=[p(65,60),p(15,23),p(49,24)],stars=[p(5,48),p(29,72),p(25,21),p(61,40),p(9,62),p(39,31),p(45,64),p(57,23),p(70,18)];
 const ledges=[{id:0,point:p(10,65),height:1.15},{id:1,point:p(29,44),height:1.4},{id:2,point:p(49,25),height:1.15}];
 const pillars=Array.from({length:12},(_,i)=>i/12*Math.PI*2).filter(a=>Math.cos(a)>=-.6).map(a=>p(fortress.x+Math.sin(a)*7,fortress.y+Math.cos(a)*7));
 const boulders=Array.from({length:18},(_,i)=>i/18*Math.PI*2).filter(a=>!(Math.sin(a)<-.45&&Math.cos(a)>0)).map(a=>p(cave.x+Math.sin(a)*6.6,cave.y+Math.cos(a)*6.8));
 const trunks=[p(8,63),p(21,56),p(24,48),p(36,32),p(44,51),p(56,25)];
 const patrols=[[p(62,62),p(65,65)],[p(12,24),p(15,26)],[p(46,22),p(49,24)],[p(25,48),p(25,53)],[p(42,58),p(39,58)],[p(57,21),p(57,26)]].map(([a,b])=>route(grid,a,b));
 const areas=[{point:start,zone:0},{point:cave,zone:1},{point:cabin,zone:2},{point:highland,zone:3},{point:p(57,31),zone:4},{point:fortress,zone:5},{point:finish,zone:6}];
 const zoneCells=grid.map((row,y)=>row.map((_,x)=>{let best=Infinity,z=0;for(const a of areas){const d=Math.hypot(x-a.point.x,y-a.point.y);if(d<best){best=d;z=a.zone;}}return z;}));
 const vegetation:AdventureLayout['vegetation']=[];for(const a of areas.filter(a=>a.zone<5))for(let i=0;i<5;i++){const q=p(a.point.x+(i%2?3:-3),a.point.y+(i-2));if(grid[q.y]?.[q.x]===0&&!seals.some(s=>s.x===q.x&&s.y===q.y))vegetation.push({...q,kind:i===0?'rare':i===4?'tall':'normal'});}
 const maze={grid,start,finish,entrances:[start],seed:13025},fastRiver=p(75,11),fast=route(grid,fortress,finish),safeGrid=grid.map(r=>[...r]);safeGrid[fastRiver.y][fastRiver.x]=1;
 return {forest:{trunks,pillars,boulders,arenaRadius:8,cave,cabin,highland},maze,index:0,seals,stars,chests,rivers:[p(25,50),fastRiver],grass:[secret],patrols,bosses:[fortress],solution:[...route(grid,start,fortress),...fast.slice(1)],areas,zoneCells,vegetation,starts:[start],fortress,escapeRoutes:[route(safeGrid,fortress,finish),fast],secret,escapeConnector:[],fastRiver,ledges};
}
/** Continuous heightfield: walkable hills, a ramped ascent and a shallow cave pool. Logical collision remains in the same grid. */
export function forestElevation(x:number,y:number){
 const hill=Math.max(0,1-Math.hypot((x-47.5)/10,(y-23.5)/15));
 const cave=Math.max(0,Math.min(1,(x-54)/7))*Math.max(0,1-Math.abs(y-62.5)/8);
 const slope=Math.max(0,1-Math.hypot((x-20)/13,(y-52)/17));
 return hill*2.4-cave*.48+slope*.38;
}
export function inCave(x:number,y:number){return x>=57&&x<=69&&y>=56&&y<=69;}
