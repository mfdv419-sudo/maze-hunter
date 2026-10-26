import {gorgeElevation} from './gorge-terrain';
import {aquaticGround} from './aquatic';
import type {AdventureLayout} from './adventure-layout';
import {areaSize,type AdventureArea} from './areas';
import {carve,distances,route,random,type Difficulty,type Point} from './maze';
const cache=new Map<string,AdventureLayout>();
/** Three-cell-wide labyrinth routes with distant quest regions and an eight-cell boss clearing. */
export function biomeLayout(area:AdventureArea,difficulty:Difficulty,index:number,variation:number,attempt=0):AdventureLayout{
 if(attempt>160)throw Error('Cannot satisfy expedition distance');
 const key=`${area}:${difficulty}:${index}:${variation}`;if(cache.has(key))return structuredClone(cache.get(key)!);
 const n=areaSize(area,difficulty),coarse=(n/3)|1,seed=190051+index*7919+attempt*65537+['classic','forest','desert','gorge','mountain','coast','sea','volcano'].indexOf(area)*104729,rng=random(seed+variation),small=carve(coarse,coarse,seed),grid=Array.from({length:n},()=>Array(n).fill(1));
 for(let y=0;y<coarse;y++)for(let x=0;x<coarse;x++)if(small[y][x]===0)for(let b=0;b<3;b++)for(let a=0;a<3;a++)grid[y*3+b][x*3+a]=0;
 const p=(x:number,y:number)=>({x,y}),start=p(4,4);let fortress=start,max=0;for(const[k,d]of distances(grid,start))if(d>max){const[x,y]=k.split(',').map(Number);fortress=p(x,y);max=d;}
 const initial=route(grid,start,fortress),areas=[.01,.2,.37,.54,.7,.99].map((r,zone)=>({point:initial[Math.floor((initial.length-1)*r)],zone}));areas[0].point=start;areas[5].point=fortress;
 if(area==='sea'&&areas.slice(1,4).some((a,i,all)=>all.some((b,j)=>j>i&&Math.hypot(a.point.x-b.point.x,a.point.y-b.point.y)<12)))return biomeLayout(area,difficulty,index,variation,attempt+1);
 const clear=(q:Point,r:number)=>{for(let y=q.y-r;y<=q.y+r;y++)for(let x=q.x-r;x<=q.x+r;x++)if(x>0&&y>0&&x<n-1&&y<n-1)grid[y][x]=0;};
 for(const a of areas)clear(a.point,a.zone===5?8:a.zone===0?3:3);
 // Place the gate in a reachable corner of the boss arena; collection and victory conditions still gate it.
 const finish=p(Math.max(2,Math.min(n-3,fortress.x+5)),Math.max(2,Math.min(n-3,fortress.y+5)));clear(finish,1);areas.push({point:finish,zone:6});
 if(area==='forest'||area==='coast'||area==='desert'){const c=areas[2].point;for(let y=c.y-2;y<=c.y+2;y++)for(let x=c.x-2;x<=c.x+2;x++)if(x===c.x-2||x===c.x+2||y===c.y-2||y===c.y+2)grid[y][x]=1;grid[c.y+2][c.x]=0;}
 const testedPath=route(grid,start,fortress);if(testedPath.length<({easy:90,medium:140,hard:220,extreme:300}[difficulty])||Math.hypot(fortress.x-start.x,fortress.y-start.y)<n*.5)return biomeLayout(area,difficulty,index,variation,attempt+1);
 const seals=[areas[1].point,areas[2].point,areas[3].point].map(q=>({...q})),chests=[areas[1],areas[2],areas[4]].map((a,i)=>p(a.point.x+(area==='sea'&&i===0?3:1),a.point.y+(area==='sea'&&i===0?2:1))),used=new Set([...seals,...chests,start,finish,fortress].map(q=>`${q.x},${q.y}`));
 const open:Point[]=[];for(let y=1;y<n-1;y++)for(let x=1;x<n-1;x++)if(!grid[y][x]&&!used.has(`${x},${y}`))open.push(p(x,y));
 const choose=(count:number,spacing=4)=>{const out:Point[]=[];for(const q of [...open].sort((a,b)=>((a.x*71+a.y*193+variation)%997)-((b.x*71+b.y*193+variation)%997))){if(used.has(`${q.x},${q.y}`)||out.some(t=>Math.hypot(q.x-t.x,q.y-t.y)<spacing))continue;out.push(q);used.add(`${q.x},${q.y}`);if(out.length===count)break;}return out;};
 const stars=choose(9,8),vegetation=choose(30,4).map((q,i)=>({...q,kind:(i%7===0?'rare':i%5===0?'danger':i%3?'tall':'normal')as'rare'|'danger'|'tall'|'normal'}));
 const ledges=[areas[0],areas[3],areas[4]].map((a,id)=>({id,point:p(Math.max(2,Math.min(n-3,a.point.x-1)),Math.max(2,Math.min(n-3,a.point.y-1))),height:(area==='coast'||area==='sea')&&id===0?2.65:id===1?1.5:1.15,kind:((area==='coast'||area==='sea')&&id===0?'palm':'rock') as import('./climbing').Ledge['kind']}));
 ledges[1].height=1.9;ledges.forEach((ledge,i)=>{stars[i]={...ledge.point};});
 // Reachable objects are physical climbable ledges, independent of impassable maze walls.
 for(const [j,a]of areas.slice(1,5).entries()){const candidates=open.filter(q=>Math.hypot(q.x-a.point.x,q.y-a.point.y)<4&&!seals.some(p=>Math.hypot(q.x-p.x,q.y-p.y)<1.5)&&!ledges.some(l=>Math.hypot(q.x-l.point.x,q.y-l.point.y)<2)&&[[1,0],[-1,0],[0,1],[0,-1]].every(([dx,dy])=>grid[q.y+dy]?.[q.x+dx]===0));const q=candidates.find(q=>{const nav=grid.map(row=>[...row]);for(const l of ledges)nav[l.point.y][l.point.x]=1;nav[q.y][q.x]=1;const reachable=distances(nav,start);return [...seals,fortress,finish].every(p=>reachable.has(`${p.x},${p.y}`));});if(!q)continue;const kinds=area==='sea'?['wreck','rock','wreck','rock']:area==='desert'?['cart','log','plane','rock']:area==='gorge'?['tree','log','cart','rock']:area==='mountain'?['tree','rock','plane','log']:area==='volcano'?['rock','cart','rock','plane']:['tree','log','cart','tree'];ledges.push({id:ledges.length,point:q,height:kinds[j]==='tree'?2.8:kinds[j]==='plane'?1.7:kinds[j]==='log'?.7:1.2,kind:kinds[j] as typeof ledges[number]['kind']});}
 const corners=testedPath.filter((q,i)=>i>12&&i<testedPath.length-12&&testedPath[i-1].x!==testedPath[i+1].x&&testedPath[i-1].y!==testedPath[i+1].y&&!seals.some(s=>Math.hypot(q.x-s.x,q.y-s.y)<9));
 const roamers=corners.filter((_,i)=>i%Math.max(1,Math.floor(corners.length/5))===0).slice(0,5);
 const guardStarts=[...seals.map(q=>p(q.x+1,q.y)),...roamers,...choose({easy:5,medium:7,hard:13,extreme:21}[difficulty],8)];
 const patrols=guardStarts.map(q=>{const near=distances(grid,q);let end=q;for(const[k,d]of near)if(d===4){const[x,y]=k.split(',').map(Number);end=p(x,y);break;}return route(grid,q,end);});
 const fd=distances(grid,fortress),target=fd.get(`${start.x},${start.y}`)!,starts=[start],candidates=open.filter(q=>!ledges.some(l=>Math.hypot(l.point.x-q.x,l.point.y-q.y)<1.4)&&(fd.get(`${q.x},${q.y}`)??0)>target*.65);while(starts.length<({easy:4,medium:4,hard:8,extreme:10}[difficulty])){let best:Point|undefined,spread=-1;for(const q of candidates){const d=Math.min(...starts.map(t=>Math.hypot(q.x-t.x,q.y-t.y)));if(d>spread){spread=d;best=q;}}if(!best||spread<2)throw Error('Insufficient expedition starts');starts.push(best);}
 const zoneCells=grid.map((row,y)=>row.map((_,x)=>{let z=0,best=Infinity;for(const a of areas){const d=Math.hypot(x-a.point.x,y-a.point.y);if(d<best){best=d;z=a.zone;}}return z;}));
 const pillars=Array.from({length:8},(_,i)=>i/8*Math.PI*2).map(a=>p(fortress.x+Math.sin(a)*6,fortress.y+Math.cos(a)*6)).filter(q=>q.x>1&&q.y>1&&q.x<n-2&&q.y<n-2);
 const layout:AdventureLayout={forest:{trunks:[p(start.x+2,start.y+1),p(start.x-2,start.y+2)],pillars,boulders:[],arenaRadius:8,cave:areas[1].point,cabin:areas[2].point,highland:areas[3].point},maze:{grid,start,finish,entrances:starts,seed},index,seals,chests,stars,rivers:[],grass:[],patrols,bosses:[fortress],solution:route(grid,start,fortress),areas,zoneCells,vegetation,starts,fortress,escapeRoutes:[route(grid,fortress,finish)],escapeConnector:[],fastRiver:finish,ledges};
 for(const q of layout.forest!.trunks)if(!grid[q.y]?.[q.x]&&!ledges.some(l=>l.point.x===q.x&&l.point.y===q.y))ledges.push({id:ledges.length,point:q,height:2.8,kind:area==='sea'?'rock':'tree'});
 if(cache.size>35)cache.clear();cache.set(key,structuredClone(layout));return layout;
}
export function biomeElevation(area:AdventureArea,x:number,y:number,layout:AdventureLayout){
 const h=layout.forest!.highland,c=layout.forest!.cave,d=Math.hypot(x-h.x-.5,y-h.y-.5);
 if(area==='sea'||area==='coast')return aquaticGround(area,x,y,layout);if(area==='gorge')return gorgeElevation(x,y,layout);
 if(area==='volcano')return Math.max(0,5-d*.09)+Math.sin(x*.1)*Math.cos(y*.12)*.4;
 if(area==='mountain')return Math.max(0,8-d*.12)+Math.sin(x*.08)*.25;
 if(area==='desert')return Math.sin(x*.11)*Math.cos(y*.09)*1.1-Math.max(0,1-Math.hypot(x-c.x-.5,y-c.y-.5)/3.8)*.8;

 return Math.max(0,1.8-d*.14)+Math.sin(x*.1)*Math.sin(y*.08)*.16;
}
