import type {AdventureLayout} from './adventure-layout';
import {route,type Point,type Difficulty} from './maze';
import {forestRing,FOREST_RING_BUILD} from './forest-ring';
import {waterfallHubHeight,WATERFALL_HUB_BRIDGES,WATERFALL_HUB_RAMPS,WATERFALL_HUB_TERRACES} from './forest-hub';
export const pilotNames=['Forest Entrance','Deep Forest Hub','Green Cliffs','Ancient Ruins','Giant Tree','Guardian Sanctuary','Waterfall Valley'];
export const PILOT_WATER_LEVEL=-.58;
/** Build fingerprint for distinguishing the installed revision from cached deploys. */
export const FOREST_PILOT_BUILD='FG-P0B-20261104';
export const FOREST_SLICE_BUILD='FG-HUB-REBUILD01-20261104';
/** Swimming needs enough clearance below the hips and feet, not just wet terrain. */
export const PILOT_SWIM_BOTTOM=-1.85;
/** The original bridge gap plus a short, visible challenge gap on the upper cliff path. */
export function pilotVoid(x:number,z:number){return (Math.abs(x-31.5)<2.8&&Math.abs(z-32.5)<1.25)||Math.hypot(x-23.5,z-20.2)<1.08;}
const treeSitesCache=new WeakMap<AdventureLayout,{x:number;z:number;scale:number}[]>();
export function pilotTreeSites(l:AdventureLayout){
 const cached=treeSitesCache.get(l);if(cached)return cached;
 const grid=l.maze.grid,n=grid.length,blocked=new Set([...l.pilot!.gates,...l.pilot!.bridge,...l.pilot!.shortcut,...l.pilot!.exit].map(q=>`${q.x},${q.y}`));
 const out:{x:number;z:number;scale:number}[]=[];
 for(let z=2;z<n-2;z++)for(let x=2;x<n-2;x++){
  if(grid[z][x]!==1||blocked.has(`${x},${z}`))continue;
  const edge=grid[z+1][x]===0||grid[z-1][x]===0||grid[z][x+1]===0||grid[z][x-1]===0;
  const hash=(x*37+z*53+x*z*7)%101;
  // Prioritize the visible rock/forest boundary instead of hiding the tree
  // budget deep inside solid maze cells. All trunks remain on solid terrain.
  const plant=edge?hash%5<3:x%2===0&&z%2===0&&hash%11<2;
  if(plant)out.push({x:x+.5,z:z+.5,scale:(edge?1.35:1.55)+(hash%8)*.14});
 }
 treeSitesCache.set(l,out);return out;
}
export function pilotWallHeight(x:number,z:number){return Math.max(0,pilotGround(x,z))+3.2+Math.sin(x*.17+z*.11)*.55+Math.cos(z*.21)*.25;}
/** Continuous ground shared by renderer, physics, and aquatic checks.
 * Broad overlapping elevations form the three route heights; the entrance/hub
 * remain gentle, while the river bed is carved from the *same* height field.
 */
export function pilotGround(x:number,y:number){
 if(pilotVoid(x,y))return -7;
 const pool=Math.hypot(x-55.5,y-53.5);
 const t=Math.max(0,Math.min(1,((x-61.5)*-6+(y-37.5)*16)/292));
 const channel=Math.hypot(x-(61.5-6*t),y-(37.5+16*t));
 const u=Math.max(0,Math.min(1,((x-65.5)*-5+(y-40.5)*2)/29));
 const tributary=Math.hypot(x-(65.5-5*u),y-(40.5+2*u));
 const wet=Math.max(0,Math.min(1,(1.65-tributary)/.8),Math.min(1,(11-pool)/4.4),Math.min(1,(2.7-channel)/1.4));
 const hill=(cx:number,cy:number,rx:number,ry:number,height:number)=>height*Math.exp(-(((x-cx)/rx)**2+((y-cy)/ry)**2));
 // Lower, middle and upper traversal bands instead of two isolated hills.
 const relief=
   hill(12.5,23.5,11.5,14.5,2.3)+ // Green Cliffs
   hill(34.5,25.5,13,12,2.2)+     // Giant Tree upper routes
   hill(34.5,9.5,9,9,1.85)+      // Guardian Sanctuary plateau
   hill(54.5,30,11,12,1.05)+    // Ancient Ruins approach
   hill(20,20,11,8,1.25)+        // Traversable upper cliff terrace
   hill(20,18.8,5.5,5.3,3.5)+      // Lookout mountain: true upper playable ground
   hill(16.5,23,5.5,6,1.2)+      // Approach shelf, visibly higher than forest floor
   hill(27,28,10,10,.95)+       // Cross-zone ridge connection
   hill(43,34,11,10,1.3)+       // Elevated ruins route: not a border hill
   hill(23.5,39,12,15,1.1)+     // Connecting foothills
   hill(41,44,12,11,1.05)+      // Woodland high route
   hill(37,58,13,11,.55)+       // Gentle lower woodland
   hill(10,52,9,13,.6)+          // Entrance approach
   .23*Math.sin(x*.18)*Math.cos(y*.16)+.12*Math.sin(x*.43+y*.19);
 // Never build a floating bank over a swimming corridor.
 const poolBank=Math.max(0,Math.min(1,(pool-6.7)/3));
 const channelBank=Math.max(0,Math.min(1,(channel-2.5)/2));
 const tributaryBank=Math.max(0,Math.min(1,(tributary-1.55)/1.6));
 const dryHeight=Math.max(0,relief)*Math.min(poolBank,channelBank,tributaryBank);
 // Broad, deep swim basin; a gentle shoal at the edge allows walk → swim → dive.
 const basin=wet>0?-(1.0*wet+3.25*Math.pow(wet,1.8)):dryHeight;
 return waterfallHubHeight(x,y,basin);
}
export function forestPilotLayout(difficulty?:Difficulty):AdventureLayout{
 if(difficulty)return forestRingPilotLayout(difficulty);
 const n=73,grid=Array.from({length:n},()=>Array(n).fill(1));
 const nodes=[{x:12,y:63},{x:32,y:49},{x:12,y:24},{x:54,y:30},{x:34,y:25},{x:34,y:9},{x:55,y:53}],start=nodes[0],finish={x:57,y:9};
 const clear=(p:Point,r:number)=>{for(let y=Math.max(1,p.y-r);y<Math.min(n-1,p.y+r+1);y++)for(let x=Math.max(1,p.x-r);x<Math.min(n-1,p.x+r+1);x++)if(Math.hypot(x-p.x,y-p.y)<=r+.4)grid[y][x]=0;};
 const line=(points:Point[],r=2)=>{for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],steps=Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)*2);for(let t=0;t<=steps;t++)clear({x:Math.round(a.x+(b.x-a.x)*t/steps),y:Math.round(a.y+(b.y-a.y)*t/steps)},r);}};
 nodes.forEach((p,i)=>clear(p,i===5?7:i===1?7:i===6?11:i===2||i===4?8:5));clear(finish,3);
 // Handcrafted Waterfall Hub corridors follow real stairs and connect both shores.
 // They are opened before old routes and are also used by the world mesh.
 for(const t of WATERFALL_HUB_TERRACES)clear({x:Math.round(t.x),y:Math.round(t.z)},Math.ceil(Math.min(t.w,t.d)/2));
 for(const r of WATERFALL_HUB_RAMPS)line([{x:Math.round(r.from[0]),y:Math.round(r.from[1])},{x:Math.round(r.to[0]),y:Math.round(r.to[1])}],2);
 line([{x:51,y:46},{x:55,y:46},{x:60,y:46},{x:65,y:46}],1);
 line([{x:66,y:57},{x:63,y:53},{x:62,y:48}],2);
 // A continuous high-altitude trail with two viable approaches to a view over the basin.
 line([nodes[2],{x:15,y:23},{x:18,y:21},{x:20,y:19},{x:26,y:17},{x:30,y:21},nodes[4]],2);
 line([{x:18,y:21},{x:17,y:17},{x:20,y:15},{x:26,y:17}],1);
 // Walkable ridge terraces, branching lookouts and alternative routes. These
 // clearings sit INSIDE the playable forest, not outside its boundary walls.
 for(const [x,y,r] of [[19,19,5],[26,22,5],[28,31,4],[43,34,5],[41,44,5]] as const)clear({x,y},r);
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
 // Ancient Ruins is a real building boundary in the same navigation grid that
 // the player AND guards use. Three visible doorways preserve alternate routes.
 // Without these solid cells, guards could walk through decorative stonework.
 for(let x=50;x<=58;x++){
  if(x<53||x>55)grid[27][x]=1;
  if(x<52||x>55)grid[34][x]=1;
 }
 for(let y=28;y<=33;y++){
  if(y!==30&&y!==31)grid[y][50]=1;
  if(y!==30&&y!==31)grid[y][58]=1;
 }
 // Vertical Slice 01: every raised platform has a rendered prop AND a traversable collider.
 // The low steps lead toward a lookout, and the side route borders a short spike pit.
 const ledges:AdventureLayout['ledges']=[
  {id:800,point:{x:12,y:24},height:1.1,width:2.2,depth:2.2,kind:'rock'},
  {id:801,point:{x:10,y:27},height:.65,width:1.7,depth:1.7,kind:'rock'},
  {id:802,point:{x:34,y:25},height:2.8,kind:'tree'},
  ...[0,1,2].map(i=>({id:803+i,point:{x:16+i*4,y:16},height:1.05+i*.18,width:2.4,depth:1.6,kind:'rock' as const})),
  ...[0,1,2].map(i=>({id:806+i,point:{x:9+i,y:25},height:.30+i*.32,width:1.15,depth:1.15,kind:'rock' as const})),
  {id:820,point:{x:14,y:23},height:.52,width:1.8,depth:1.8,kind:'rock'},
  {id:821,point:{x:16,y:22},height:.81,width:1.9,depth:1.8,kind:'rock'},
  {id:822,point:{x:18,y:21},height:1.05,width:2.15,depth:1.9,kind:'rock'},
  {id:823,point:{x:20,y:19},height:1.08,width:2.4,depth:2.35,kind:'rock'},
  {id:824,point:{x:22,y:18},height:.75,width:1.65,depth:1.45,kind:'rock'},
  {id:825,point:{x:25,y:18},height:1.1,width:2,depth:1.5,kind:'log'},
  {id:826,point:{x:17,y:18},height:1.75,width:1.15,depth:1.15,kind:'tree'},
  {id:827,point:{x:26,y:21},height:1.42,width:1.4,depth:1.4,kind:'rock'},
  // The spike-gap bridge is supported by an actual physical Ledge. Landing
  // here must NOT trigger a void death. Its visible deck is rendered below.
  {id:828,point:{x:23,y:20},height:pilotGround(22.25,20.5)+.08-pilotGround(23.5,20.5),width:3.4,depth:1.65,kind:'rock'},
  ...WATERFALL_HUB_BRIDGES.map((b,i)=>({id:940+i,point:{x:b.x-.5,y:b.z-.5},height:b.top-pilotGround(b.x,b.z),width:b.w,depth:b.d,kind:'rock' as const})),
  {id:10,point:{x:28,y:48},height:1,kind:'rock'},
  {id:11,point:{x:38,y:52},height:1,kind:'log'},
 ];
 // Reuse the existing nine-star budget. The new lookout star is clearly above ground.
 const stars=[{x:12,y:24},{x:34,y:25},{x:20,y:19},{x:5,y:35},{x:66,y:29},{x:50,y:66},{x:24,y:55},{x:51,y:45},{x:59,y:56}];
 const zoneCells=grid.map((row,y)=>row.map((_,x)=>nodes.reduce((best,p,i)=>Math.hypot(x-p.x,y-p.y)<Math.hypot(x-nodes[best].x,y-nodes[best].y)?i:best,0)));
 // Floor-level trees make the accessible forest feel alive. Previous foliage
 // existed almost entirely ABOVE the player's head on the wall tops. Each
 // trunk shares its center with the authoritative player/guard collider.
 const trunks:Point[]=[],occupied=new Set<string>();
 const protectedPoints:Point[]=[...nodes,start,finish,...stars,...WATERFALL_HUB_TERRACES.map(t=>({x:t.x,y:t.z})),...WATERFALL_HUB_RAMPS.flatMap(r=>[{x:r.from[0],y:r.from[1]},{x:r.to[0],y:r.to[1]}]),...WATERFALL_HUB_BRIDGES.map(b=>({x:b.x,y:b.z})),{x:21,y:16},{x:15,y:22},{x:54,y:31},{x:52,y:59},...gates];
 for(const [cx,cy,count,rad] of [[32,49,9,5],[12,24,11,6],[34,25,10,6],[54,30,8,4.7],[55,53,10,6],[26,22,7,4.4],[41,44,7,4.5]] as const){
  for(let i=0;i<count;i++){const a=(i+.27)*Math.PI*2/count, x=Math.round(cx+rad*Math.cos(a)),y=Math.round(cy+rad*Math.sin(a)),key=`${x},${y}`;
   if(grid[y]?.[x]!==0||occupied.has(key)||protectedPoints.some(p=>Math.hypot(p.x-x,p.y-y)<2.15)||trunks.some(p=>Math.hypot(p.x-x,p.y-y)<1.8)||pilotGround(x+.5,y+.5)<PILOT_WATER_LEVEL+.1)continue;
   trunks.push({x,y});occupied.add(key);
  }
 }
 return{diamonds:[{x:15,y:22},{x:54,y:31},{x:52,y:59}],pilot:{gates,bridge,shortcut,exit,switches:[{x:52,y:29},{x:56,y:29}],pool:nodes[6]},index:0,maze:{grid,start,finish,entrances:[start],seed:20261103},forest:{trunks,pillars:[...[[50,27],[50,34],[58,27],[58,34]].map(([x,y])=>({x:x-.5,y:y-.5})),{x:52,y:29},{x:56,y:29}],boulders:[],arenaRadius:7,cave:nodes[6],cabin:nodes[3],highland:nodes[2]},areas:nodes.map((point,zone)=>({point,zone})),zoneCells,ledges,stars,seals:[nodes[2],{x:54,y:33},nodes[6]],chests:[{x:21,y:16},{x:66,y:29},{x:50,y:66}],rivers:[],grass:[],vegetation:[{x:23,y:51,kind:'tall'},{x:39,y:48,kind:'rare'}],starts:[start],fortress:nodes[5],escapeRoutes:[Array.from({length:24},(_,i)=>({x:34+i,y:9}))],escapeConnector:exit,fastRiver:finish,patrols:[[{x:16,y:38},{x:20,y:42}],[{x:10,y:22},{x:14,y:22}],[{x:11,y:26},{x:14,y:25}],[{x:50,y:30},{x:53,y:31}],[{x:56,y:31},{x:57,y:33}],[{x:49,y:58},{x:51,y:60}],[{x:61,y:55},{x:62,y:52}]],bosses:[nodes[5]],solution:route(grid,start,nodes[4])};
}

/** Live SOLO Map 01: physical ring maze compiled from the Extreme master.
 * Legacy no-argument layout is retained for regression comparison and tests.
 * The three primary objectives and Waterfall Hub props keep their established
 * locations; all connectors/doors now come from the shared ring graph.
 */
function forestRingPilotLayout(difficulty:Difficulty):AdventureLayout{
 const base=forestPilotLayout(),ring=forestRing(difficulty),grid=ring.grid.map(row=>[...row]);
 const open=(x:number,y:number,r=0)=>{for(let z=Math.max(1,y-r);z<=Math.min(grid.length-2,y+r);z++)for(let xx=Math.max(1,x-r);xx<=Math.min(grid.length-2,x+r);xx++)grid[z][xx]=0;};
 const paint=(a:Point,b:Point,r=1)=>{const steps=Math.max(1,Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)*3));for(let k=0;k<=steps;k++)open(Math.round(a.x+(b.x-a.x)*k/steps),Math.round(a.y+(b.y-a.y)*k/steps),r);};
 // The previously approved Waterfall Hub stays physically walkable. Its
 // terraces, ramps and bridge colliders use the same height coordinates.
 for(const t of WATERFALL_HUB_TERRACES)open(Math.round(t.x),Math.round(t.z),Math.max(1,Math.floor(Math.min(t.w,t.d)/2)));
 for(const r of WATERFALL_HUB_RAMPS)paint({x:r.from[0],y:r.from[1]},{x:r.to[0],y:r.to[1]},1);
 for(const b of WATERFALL_HUB_BRIDGES)open(Math.round(b.x),Math.round(b.z),1);
 paint({x:55,y:53},{x:51,y:46});paint({x:55,y:53},{x:63,y:54});
 // Keep the short Green Cliffs ravine challenge usable: the deck is a
 // physical ledge, not a visual bridge above an unrelated death zone.
 paint({x:21,y:20},{x:25,y:20},1);
 // Preserve the rune puzzle entrances; walls and controls must share a grid.
 for(const x of [52,56])open(x,29,1);
 // Ring core remains sealed on both sides until their phase triggers.
 for(const p of Object.values(ring.gates).flat())grid[p.y][p.x]=1;
 const objective=[{x:15,y:22},{x:54,y:31},{x:52,y:59}],seals=[{x:12,y:24},{x:54,y:33},{x:55,y:53}];
 for(const p of [...objective,...seals])open(p.x,p.y,1);
 // A legacy ravine overlaps the new Center Core's outer wall. Turn that
 // portion into a visibly solid rock boundary instead of a hidden death tile.
 for(let y=30;y<=35;y++)for(let x=28;x<=34;x++)if(pilotVoid(x+.5,y+.5))grid[y][x]=1;
 // Any hub corrections above must never open the two boss barriers.
 for(const p of [...ring.gates.boss,...ring.gates.escape])grid[p.y][p.x]=1;
 const nearestOpen=(p:Point):Point=>{
  if(grid[p.y]?.[p.x]===0)return p;
  for(let radius=1;radius<=8;radius++)for(let y=Math.max(1,p.y-radius);y<=Math.min(71,p.y+radius);y++)for(let x=Math.max(1,p.x-radius);x<=Math.min(71,p.x+radius);x++)if(grid[y][x]===0)return{x,y};
  return ring.entry;
 };
 const stars=[{x:12,y:24},{x:34,y:25},{x:20,y:19},...ring.deadEnds].slice(0,9);
 const rewardCandidates=[...stars,...ring.trails.filter((_,i)=>i%3===0).map(q=>q[Math.floor(q.length*.66)])];
 const used=new Set<string>();const uniqueRewards:Point[]=[];
 for(const p of rewardCandidates){const q=nearestOpen(p),k=q.x+','+q.y;if(!used.has(k)){used.add(k);uniqueRewards.push(q);}if(uniqueRewards.length===9)break;}
 const areas=[
  {point:ring.entry,zone:0},{point:{x:32,y:49},zone:1},{point:{x:12,y:24},zone:2},
  {point:{x:54,y:30},zone:3},{point:{x:34,y:25},zone:4},
  {point:ring.center,zone:5},{point:{x:55,y:53},zone:6},
  ...ring.zones.filter(z=>['chasm','underground','floating'].includes(z.id)).map((z,i)=>({point:z.point,zone:7+i}))
 ];
 const zoneCells=grid.map((row,y)=>row.map((_,x)=>areas.reduce((best,a,i)=>
  Math.hypot(a.point.x-x,a.point.y-y)<Math.hypot(areas[best].point.x-x,areas[best].point.y-y)?i:best,0)));
 const patrols=ring.zones.filter(z=>z.id!=='boss'&&z.id!=='entrance').map(z=>{
  const path=route(grid,nearestOpen(z.point),ring.entry);
  return path.length>6?path.slice(0,Math.min(7,path.length)): [nearestOpen(z.point)];
 });
 const exit={...ring.exit};
 const opened=grid.map(row=>[...row]);for(const p of [...ring.gates.boss,...ring.gates.escape,...ring.gates.bridge,...ring.gates.shortcut])opened[p.y][p.x]=0;
 const pathToBoss=route(opened,ring.entry,ring.center),escapeRoute=route(opened,ring.center,exit);
 if(!pathToBoss.length||!escapeRoute.length||route(grid,ring.entry,ring.center).length)throw Error('Ring maze gate topology invalid');
 if([...objective,...seals].some(p=>!route(grid,ring.entry,p).length))throw Error('Ring maze objective disconnected');
 const ledges=base.ledges.filter(l=>grid[l.point.y]?.[l.point.x]===0||l.id>=940&&l.id<=942);
 // Extreme-only Floating Land: visible air platforms share exact collider
 // elevations with the rendered islands. The island route is optional.
 if(ring.activeZones.includes('floating')){
  for(const [id,x,y,top] of [[980,11,33,1.2],[981,11,35,1.85],[982,10,37,2.5],[983,10,39,3.15],[984,12,37,3.15],[985,14,35,3.15]] as const){
   open(x,y,1);ledges.push({id,point:{x,y},height:Math.max(.22,top-pilotGround(x+.5,y+.5)),width:1.8,depth:1.8,kind:'rock'});
  }
  uniqueRewards[8]={x:10,y:39};
 }
 const forest={...base.forest!,trunks:base.forest!.trunks.filter(p=>grid[p.y]?.[p.x]===0),arenaRadius:6.2};
 // Use one graph instance for renderer, minimap, nav and gameplay, rather than
 // shipping a second hand-carved path list that can diverge from collision.
 return{...base,ring:{...ring,grid,trails:[...ring.trails]},
  index:0,maze:{grid,start:ring.entry,finish:exit,entrances:[ring.entry],seed:20261104},
  pilot:{gates:ring.gates.boss,bridge:ring.gates.bridge,shortcut:ring.gates.shortcut,exit:ring.gates.escape,switches:[{x:52,y:29},{x:56,y:29}],pool:{x:55,y:53}},
  diamonds:objective,seals,stars:uniqueRewards,chests:ring.deadEnds.slice(0,3).map(nearestOpen),
  areas,zoneCells,ledges,forest,fortress:ring.center,bosses:[ring.center],patrols,
  escapeRoutes:[escapeRoute],escapeConnector:ring.gates.escape,fastRiver:exit,starts:[ring.entry],solution:pathToBoss};
}
export {FOREST_RING_BUILD};
