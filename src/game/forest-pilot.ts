import type {AdventureLayout} from './adventure-layout';
import {route,type Point} from './maze';
export const pilotNames=['Forest Entrance','Deep Forest Hub','Green Cliffs','Ancient Ruins','Giant Tree','Guardian Sanctuary','Waterfall Valley'];
export const PILOT_WATER_LEVEL=-.58;
export function pilotVoid(x:number,z:number){return Math.abs(x-31.5)<2.8&&Math.abs(z-32.5)<1.25;}
const treeSitesCache=new WeakMap<AdventureLayout,{x:number;z:number;scale:number}[]>();
export function pilotTreeSites(l:AdventureLayout){const cached=treeSitesCache.get(l);if(cached)return cached;const blocked=new Set([...l.pilot!.gates,...l.pilot!.bridge,...l.pilot!.shortcut,...l.pilot!.exit].map(q=>`${q.x},${q.y}`));const out:{x:number;z:number;scale:number}[]=[];for(let z=2;z<l.maze.grid.length-2;z+=2)for(let x=2;x<l.maze.grid.length-2;x+=2)if(l.maze.grid[z][x]===1&&!blocked.has(`${x},${z}`)&&(x*7+z*13)%9<3)out.push({x:x+.5,z:z+.5,scale:1.7+(x*13+z*7)%7*.16});treeSitesCache.set(l,out);return out;}
export function pilotWallHeight(x:number,z:number){return Math.max(0,pilotGround(x,z))+3.2+Math.sin(x*.17+z*.11)*.55+Math.cos(z*.21)*.25;}
export function pilotGround(x:number,y:number){
 if(pilotVoid(x,y))return -7;
 const pool=Math.hypot(x-55.5,y-53.5),t=Math.max(0,Math.min(1,((x-61.5)*-6+(y-37.5)*16)/292)),channel=Math.hypot(x-(61.5-6*t),y-(37.5+16*t));
 const u=Math.max(0,Math.min(1,((x-65.5)*-5+(y-40.5)*2)/29)),tributary=Math.hypot(x-(65.5-5*u),y-(40.5+2*u));
 const wet=Math.max(0,Math.min(1,(1.65-tributary)/.8),Math.min(1,(7-pool)/3),Math.min(1,(2.7-channel)/1.4));
 const highland=2.9*Math.exp(-((x-12.5)**2+(y-23.5)**2)/120);
 const crown=1.95*Math.exp(-((x-34.5)**2+(y-25.5)**2)/82);
 const ridge=1.25*Math.exp(-((x-22.5)**2)/36)*Math.exp(-((y-18.5)**2)/110);
 const terrace=1.15*Math.max(0,1-Math.abs(x-20.5)/10)*Math.max(0,1-Math.abs(y-28.5)/12);
 const undulation=.34*Math.sin(x*.19)*Math.sin(y*.14)+.18*Math.cos((x+y)*.11);
 const landBase=Math.max(0,highland+crown+ridge+terrace+undulation);
 const stepped=landBase>.55?Math.round(landBase*2.6)/2.2:landBase;
 return wet>0?-3.05*wet:stepped*Math.min(1,Math.max(0,(pool-7)/2),Math.max(0,(channel-2.7)/1.4));
}
export function forestPilotLayout():AdventureLayout{
 const n=73,grid=Array.from({length:n},()=>Array(n).fill(1));
 const nodes=[{x:12,y:63},{x:32,y:49},{x:12,y:24},{x:54,y:30},{x:34,y:25},{x:34,y:9},{x:55,y:53}],start=nodes[0],finish={x:57,y:9};
 const clear=(p:Point,r:number)=>{for(let y=Math.max(1,p.y-r);y<Math.min(n-1,p.y+r+1);y++)for(let x=Math.max(1,p.x-r);x<Math.min(n-1,p.x+r+1);x++)if(Math.hypot(x-p.x,y-p.y)<=r+.4)grid[y][x]=0;};
 const line=(points:Point[],r=2)=>{for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],steps=Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)*2);for(let t=0;t<=steps;t++)clear({x:Math.round(a.x+(b.x-a.x)*t/steps),y:Math.round(a.y+(b.y-a.y)*t/steps)},r);}};
 nodes.forEach((p,i)=>clear(p,i===5?7:i===1?7:i===6?8:5));clear(finish,3);
 line([start,{x:18,y:58},nodes[1]],3);
 line([nodes[1],{x:22,y:43},{x:15,y:35},nodes[2]],2);
 line([nodes[1],{x:44,y:43},nodes[3]],2);
 line([nodes[1],{x:42,y:58},nodes[6]],2);
 line([nodes[2],{x:12,y:15},{x:23,y:15},{x:27,y:21},nodes[4]],2);
 line([nodes[6],{x:63,y:46},{x:63,y:24},nodes[4]],2);
 line([nodes[2],{x:16,y:33},{x:24,y:32},{x:44,y:32},nodes[3]],2);
 line([nodes[3],{x:61,y:37},{x:61,y:47},nodes[6]],2);
 line([nodes[4],{x:32,y:38},nodes[1]],1);
 line([nodes[4],nodes[5]],2);line([nodes[5],finish],2);
 // Optional dead ends, with readable natural endings rather than a single linear route.
 for(const [a,b]of[[nodes[2],{x:5,y:35}],[nodes[3],{x:66,y:29}],[nodes[6],{x:50,y:66}],[nodes[1],{x:24,y:55}]]as [Point,Point][])line([a,b],1);
 const gates=Array.from({length:9},(_,i)=>({x:30+i,y:18})),bridge=Array.from({length:7},(_,i)=>({x:31,y:29+i})),shortcut=Array.from({length:5},(_,i)=>({x:30+i,y:38})),exit=Array.from({length:7},(_,i)=>({x:45,y:6+i}));
 for(const p of [...gates,...bridge,...shortcut,...exit])grid[p.y][p.x]=1;
 const ledges:AdventureLayout['ledges']=[{id:800,point:{x:12,y:24},height:1.45,width:2.2,depth:2.2,kind:'rock'},{id:801,point:{x:10,y:27},height:.72,width:1.8,depth:1.6,kind:'rock'},{id:802,point:{x:34,y:25},height:3.15,kind:'tree'},...[0,1,2].map(i=>({id:803+i,point:{x:16+i*4,y:16},height:1.15+i*.15,width:2.7,depth:1.8,kind:'rock' as const})),...[0,1,2].map(i=>({id:806+i,point:{x:9+i,y:25},height:.35+i*.35,width:1.1,depth:1.1,kind:'rock' as const})),...[{id:812,point:{x:13,y:21},height:1.95,width:2,depth:2,kind:'rock' as const},{id:813,point:{x:15,y:18},height:2.45,width:1.8,depth:1.8,kind:'rock' as const},{id:814,point:{x:18,y:15},height:2.9,width:1.9,depth:1.9,kind:'rock' as const},{id:815,point:{x:23,y:18},height:1.75,width:2.2,depth:1.6,kind:'log' as const},{id:816,point:{x:26,y:21},height:1.3,width:1.8,depth:1.8,kind:'rock' as const}],{id:10,point:{x:28,y:48},height:1.15,kind:'rock'},{id:11,point:{x:38,y:52},height:1.15,kind:'log'}];
 const stars=[{x:12,y:24},{x:34,y:25},{x:20,y:16},{x:5,y:35},{x:66,y:29},{x:50,y:66},{x:24,y:55},{x:39,y:47},{x:59,y:56}];
 const zoneCells=grid.map((row,y)=>row.map((_,x)=>nodes.reduce((best,p,i)=>Math.hypot(x-p.x,y-p.y)<Math.hypot(x-nodes[best].x,y-nodes[best].y)?i:best,0)));
 return{diamonds:[{x:15,y:22},{x:54,y:31},{x:52,y:59}],pilot:{gates,bridge,shortcut,exit,switches:[{x:52,y:29},{x:56,y:29}],pool:nodes[6]},index:0,maze:{grid,start,finish,entrances:[start],seed:20261103},forest:{trunks:[],pillars:[...[[50,27],[50,34],[58,27],[58,34]].map(([x,y])=>({x:x-.5,y:y-.5})),{x:52,y:29},{x:56,y:29}],boulders:[],arenaRadius:7,cave:nodes[6],cabin:nodes[3],highland:nodes[2]},areas:nodes.map((point,zone)=>({point,zone})),zoneCells,ledges,stars,seals:[nodes[2],{x:54,y:33},nodes[6]],chests:[{x:24,y:55},{x:66,y:29},{x:50,y:66}],rivers:[],grass:[],vegetation:[{x:23,y:51,kind:'tall'},{x:39,y:48,kind:'rare'}],starts:[start],fortress:nodes[5],escapeRoutes:[Array.from({length:24},(_,i)=>({x:34+i,y:9}))],escapeConnector:exit,fastRiver:finish,patrols:[[{x:16,y:38},{x:20,y:42}],[{x:10,y:22},{x:14,y:22}],[{x:11,y:26},{x:14,y:25}],[{x:50,y:30},{x:53,y:31}],[{x:56,y:31},{x:57,y:33}],[{x:49,y:58},{x:51,y:60}],[{x:61,y:55},{x:62,y:52}]],bosses:[nodes[5]],solution:route(grid,start,nodes[4])};
}
