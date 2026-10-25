import type {AdventureLayout} from './adventure-layout';
import {route,type Point} from './maze';
/** One authored forest vertical slice: broad paths, readable landmarks, three seals and a spacious arena. */
export function forestLayout():AdventureLayout{
 const n=49,grid=Array.from({length:n},()=>Array(n).fill(1));
 const clear=(x:number,y:number,r:number)=>{for(let b=y-r;b<=y+r;b++)for(let a=x-r;a<=x+r;a++)if(a>0&&b>0&&a<n-1&&b<n-1)grid[b][a]=0;};
 const line=(a:Point,b:Point,r=1)=>{let p={...a};clear(p.x,p.y,r);while(p.x!==b.x||p.y!==b.y){if(p.x!==b.x)p.x+=Math.sign(b.x-p.x);else p.y+=Math.sign(b.y-p.y);clear(p.x,p.y,r);}};
 const p=(x:number,y:number)=>({x,y}),start=p(7,37),fortress=p(36,10),finish=p(44,4);
 const areas=[p(7,35),p(7,23),p(17,25),p(23,33),p(27,19),fortress,p(44,6)].map((point,zone)=>({point,zone}));
 const links=[[start,p(7,23)],[p(7,25),p(17,25)],[p(17,25),p(17,13)],[p(17,13),p(29,13)],[p(17,25),p(17,33)],[p(17,33),p(25,33)],[p(17,25),p(27,25)],[p(27,25),p(27,19)],[p(27,19),p(29,19)],[p(29,19),p(29,10)],[p(29,10),fortress],[p(7,23),p(7,15)],[p(7,15),p(13,15)],[p(25,33),p(31,33)]];
 links.forEach(([a,b])=>line(a,b));areas.forEach(a=>clear(a.point.x,a.point.y,a.zone===5?6:2));clear(start.x,start.y,3);
 line(p(42,10),p(44,10));line(p(44,10),finish);line(p(40,16),p(44,16));line(p(44,16),p(44,10));
 const secret=p(43,7);grid[secret.y][secret.x]=1;const fastRiver=p(44,9);
 const seals=[p(7,21),p(24,33),p(27,18)],chests=[p(12,15),p(30,33),p(30,11)],stars=[p(7,30),p(7,16),p(13,15),p(17,19),p(21,13),p(21,33),p(30,33),p(27,23),p(39,15)];
 const ledges=[{id:0,point:p(9,34),height:1.15},{id:1,point:p(21,34),height:1.4},{id:2,point:p(26,20),height:1.15}];
 const pillars=Array.from({length:10},(_,i)=>i/10*Math.PI*2).filter(a=>Math.cos(a)>=-.6).map(a=>p(fortress.x+Math.sin(a)*5.5,fortress.y+Math.cos(a)*5.5));
 const trunks=[p(6,34),p(18,24),p(23,32),p(28,18)];
 const patrols=[[p(8,22),p(8,25)],[p(17,19),p(17,23)],[p(26,33),p(29,33)]].map(([a,b])=>route(grid,a,b));
 const zoneCells=grid.map((row,y)=>row.map((_,x)=>{let best=Infinity,z=0;for(const a of areas){const d=Math.hypot(x-a.point.x,y-a.point.y);if(d<best){best=d;z=a.zone;}}return z;}));zoneCells[start.y][start.x]=0;
 const vegetation:AdventureLayout['vegetation']=[];for(const a of areas.filter(a=>a.zone<5))for(let i=0;i<5;i++){const q=p(a.point.x+(i%2?2:-2),a.point.y+(i-2));if(grid[q.y]?.[q.x]===0&&!seals.some(s=>s.x===q.x&&s.y===q.y))vegetation.push({...q,kind:i===0?'rare':i===4?'tall':'normal'});}
 const maze={grid,start,finish,entrances:[start],seed:12025},fast=route(grid,fortress,finish),safeGrid=grid.map(r=>[...r]);safeGrid[fastRiver.y][fastRiver.x]=1;
 return {forest:{trunks,pillars,arenaRadius:6},maze,index:0,seals,stars,chests,rivers:[p(17,16),fastRiver],grass:[secret],patrols,bosses:[fortress],solution:[...route(grid,start,fortress),...fast.slice(1)],areas,zoneCells,vegetation,starts:[start],fortress,escapeRoutes:[route(safeGrid,fortress,finish),fast],secret,escapeConnector:[],fastRiver,ledges};
}
