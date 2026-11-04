import {forestTexture} from './forest-materials';
import * as T from 'three';
import {biomeSky} from './biome-scenery';
import type {AdventureLayout} from './adventure-layout';
import type {AdventureState} from './adventure-state';
import {pilotGround,pilotWallHeight,pilotTreeSites,PILOT_WATER_LEVEL as WATER} from './forest-pilot';
import {forestTree} from './world-art';
import {WATERFALL_HUB_TERRACES,WATERFALL_HUB_RAMPS,WATERFALL_HUB_BRIDGES,WATERFALL_HUB_HUTS} from './forest-hub';
/** Shared grid is the solid boundary. Rock faces meet at exactly the same vertices. */
export function forestPilotWorld(scene:T.Scene,world:T.Group,l:AdventureLayout,state?:()=>AdventureState|undefined){
 const root=new T.Group(),dynamic=new T.Group();root.name='forest-grove-pilot';root.userData.cameraOccluder=true;world.add(root,dynamic);
 const skyTexture=biomeSky('forest'),sky=new T.Mesh(new T.SphereGeometry(120,24,12),new T.MeshBasicMaterial({map:skyTexture,side:T.BackSide,fog:false,depthWrite:false}));scene.add(sky);scene.background=new T.Color(0xc8e9ed);scene.fog=new T.Fog(0xc8e9ed,32,88);
 const mat=(color:number)=>new T.MeshLambertMaterial({color,flatShading:true});
 const stone=mat(0x817864),wood=mat(0x997044),leaf=mat(0x4f8e46),flower=[mat(0xffd683),mat(0xffeee3),mat(0xe7a5c1)],foam=new T.MeshBasicMaterial({color:0xe6ffff,transparent:true,opacity:.65,side:T.DoubleSide});
 const add=(g:T.BufferGeometry,m:T.Material,x:number,y:number,z:number,parent=root)=>{const mesh=new T.Mesh(g,m);mesh.position.set(x,y,z);parent.add(mesh);return mesh;};
 const n=l.maze.grid.length,grid=l.maze.grid,dynamicCells=new Set([...l.pilot!.gates,...l.pilot!.bridge,...l.pilot!.shortcut,...l.pilot!.exit].map(p=>`${p.x},${p.y}`));
 const solid=(x:number,z:number)=>grid[z]?.[x]===1&&!dynamicCells.has(`${x},${z}`);
 const terrain=new T.PlaneGeometry(n,n,n*2,n*2);terrain.rotateX(-Math.PI/2);const pos=terrain.attributes.position,uv=terrain.attributes.uv,colors:number[]=[];
 for(let i=0;i<pos.count;i++){const x=pos.getX(i)+n/2,z=pos.getZ(i)+n/2,h=pilotGround(x,z);pos.setXYZ(i,x,h-.025,z);uv.setXY(i,x/1.8,z/1.8);const boundary=Array.from({length:9},(_,j)=>solid(Math.floor(x)+(j%3)-1,Math.floor(z)+Math.floor(j/3)-1)).some(Boolean),c=new T.Color(h<WATER?0xa5a17b:boundary?0x80ad54:0x9dbf65);c.multiplyScalar(.95+.05*Math.sin(x*2+z));colors.push(c.r,c.g,c.b);}
 terrain.setAttribute('color',new T.Float32BufferAttribute(colors,3));terrain.computeVertexNormals();add(terrain,new T.MeshLambertMaterial({vertexColors:true,map:forestTexture('grass')}),0,0,0);
 // Contour-following dirt ribbons. Skip water and blocked cells rather than drawing through them.
 const legacyTrails=[[[12,63],[18,58],[32,49]],[[32,49],[22,43],[15,35],[12,24]],[[32,49],[44,43],[54,30]],[[32,49],[42,58],[55,53]],[[12,24],[12,15],[23,15],[27,21],[34,25]],[[55,53],[63,46],[63,24],[34,25]],[[12,24],[16,33],[24,32],[44,32],[54,30]],[[54,30],[61,37],[61,47],[55,53]],[[34,25],[32,38],[32,49]],[[34,25],[34,9],[57,9]]];
 const trails=l.ring?l.ring.trails.map(path=>path.map(p=>[p.x,p.y])):legacyTrails;
 const trailPoints:number[]=[],trailColors:number[]=[];for(const points of trails){const curve=new T.CatmullRomCurve3(points.map(([x,z])=>new T.Vector3(x+.5,0,z+.5)),false,'centripetal'),steps=Math.ceil(curve.getLength()*5);for(let i=0;i<steps;i++){const a=curve.getPoint(i/steps),b=curve.getPoint((i+1)/steps),ta=curve.getTangent(i/steps),tb=curve.getTangent((i+1)/steps),sa=new T.Vector3(ta.z,0,-ta.x).multiplyScalar(.5),sb=new T.Vector3(tb.z,0,-tb.x).multiplyScalar(.5),quad=[a.clone().add(sa),b.clone().add(sb),b.clone().sub(sb),a.clone().sub(sa)];if(quad.some(p=>grid[Math.floor(p.z)]?.[Math.floor(p.x)]!==0||pilotGround(p.x,p.z)<WATER+.12))continue;for(const [left,right]of [[1,.7],[.7,-.7],[-.7,-1]]){const corners=[a.clone().addScaledVector(sa,left),b.clone().addScaledVector(sb,left),b.clone().addScaledVector(sb,right),a.clone().addScaledVector(sa,right)];for(const k of[0,2,1,0,3,2]){const q=corners[k],edge=k<2?left:right;trailPoints.push(q.x,pilotGround(q.x,q.z)+.055,q.z);trailColors.push(1,1,1,Math.abs(edge)>.9?0:1);}}}}
 const path=new T.BufferGeometry();path.setAttribute('position',new T.Float32BufferAttribute(trailPoints,3));path.setAttribute('color',new T.Float32BufferAttribute(trailColors,4));path.setAttribute('uv',new T.Float32BufferAttribute(trailPoints.flatMap((_,i)=>i%3===0?[trailPoints[i]/2,trailPoints[i+2]/2]:[]),2));path.computeVertexNormals();add(path,new T.MeshLambertMaterial({color:0xfff0ce,map:forestTexture('soil'),vertexColors:true,transparent:true,depthWrite:false}),0,0,0).name='contour-following-trails';
 // Chunked continuous cliffs: no isolated columns, no seams or decorative overhang into lanes.
 const cliffMap=forestTexture('cliff');
 for(let cz=0;cz<n;cz+=12)for(let cx=0;cx<n;cx+=12){const vertices:number[]=[],color:number[]=[];
  const tri=(a:number[],b:number[],c:number[],hex:number)=>{vertices.push(...a,...b,...c);const v=new T.Color(hex);for(let i=0;i<3;i++)color.push(v.r,v.g,v.b);};
  for(let z=cz;z<Math.min(n,cz+12);z++)for(let x=cx;x<Math.min(n,cx+12);x++)if(solid(x,z)){
   for(const [dx,dz,ax,az,bx,bz]of [[0,-1,0,0,1,0],[1,0,1,0,1,1],[0,1,1,1,0,1],[-1,0,0,1,0,0]])if(!solid(x+dx,z+dz)){
    for(let band=0;band<4;band++){const point=(t:number,f:number)=>{const px=x+ax+(bx-ax)*t,pz=z+az+(bz-az)*t,base=pilotGround(px,pz)-.15,top=pilotWallHeight(px,pz),inset=Math.sin(f*Math.PI)*Math.sin(t*Math.PI)*.13;return[px-dx*inset,base+(top-base)*f,pz-dz*inset];};for(let segment=0;segment<2;segment++){const a=point(segment/2,band/4),b=point((segment+1)/2,band/4),c=point((segment+1)/2,(band+1)/4),d=point(segment/2,(band+1)/4),hex=x>=50&&x<=58&&z>=27&&z<=34?(band===3?0x858e80:0xa4a69b):band===3?0x999c73:((x*11+z*7)%3===0?0xb5a48b:0xc6b598);tri(a,c,b,hex);tri(a,d,c,hex);}}
   }
   const a=[x,pilotWallHeight(x,z),z],b=[x+1,pilotWallHeight(x+1,z),z],c=[x+1,pilotWallHeight(x+1,z+1),z+1],d=[x,pilotWallHeight(x,z+1),z+1];tri(a,c,b,0x699d49);tri(a,d,c,0x699d49);
  }
  if(vertices.length){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('color',new T.Float32BufferAttribute(color,3));g.setAttribute('uv',new T.Float32BufferAttribute(vertices.flatMap((_,i)=>i%3===0?[(vertices[i]+vertices[i+2])*.65,vertices[i+1]*.65]:[]),2));g.computeVertexNormals();const m=add(g,new T.MeshLambertMaterial({vertexColors:true,map:cliffMap,side:T.DoubleSide}),0,0,0);m.name='continuous-cliff-chunk';}
 }
 // Reusable low-poly tree forms; all large trunks sit on the solid side, never in a walking lane.
 const prototypes=[forestTree(0),forestTree(1),forestTree(2)];
 for(const q of pilotTreeSites(l)){const tree=prototypes[(Math.floor(q.x)+Math.floor(q.z))%3].clone(true);tree.position.set(q.x,pilotWallHeight(q.x,q.z),q.z);tree.scale.set(q.scale,q.scale*1.25,q.scale);root.add(tree);}
 // The actual playfields need trees at GROUND level; wall-top tree instances
 // alone hide the forest canopy above the player's view.
 for(const [i,p] of l.forest!.trunks.entries()){const x=p.x+.5,z=p.y+.5,tree=prototypes[i%3].clone(true),scale=.95+(i%5)*.12;tree.position.set(x,pilotGround(x,z),z);tree.scale.set(scale,scale*1.15,scale);root.add(tree);}
 // Collapse repeated trees into instance batches, retaining original geometry/material ownership.
 root.updateWorldMatrix(true,true);const inverse=root.matrixWorld.clone().invert(),treeBatches=new Map<T.BufferGeometry,{material:T.Material;matrices:T.Matrix4[]}>();
 for(const tree of [...root.children].filter(o=>o.type==='Group')){tree.traverse(o=>{if(o instanceof T.Mesh&&!Array.isArray(o.material)){let b=treeBatches.get(o.geometry);if(!b){b={material:o.material,matrices:[]};treeBatches.set(o.geometry,b);}b.matrices.push(inverse.clone().multiply(o.matrixWorld));}});root.remove(tree);}
 for(const [geometry,b]of treeBatches){const mesh=new T.InstancedMesh(geometry,b.material,b.matrices.length);b.matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.computeBoundingSphere();mesh.name='instanced-forest-trees';root.add(mesh);}
 // Ring-maze wayfinding is authored from the same zone/connector graph as
 // physics. Beacons are small enough not to pretend to be solid platforms.
 if(l.ring){
  const posts=new T.Group();posts.name='ring-maze-zone-landmarks';root.add(posts);
  const dark=mat(0x594a35),gold=mat(0xe8ce81);
  const hues:Record<string,number>={entrance:0x7ed6a4,green:0x8bcf65,ruins:0xcbb18d,waterfall:0x75d2dc,chasm:0xdfab78,giant:0xa4d46f,underground:0xa48ec6,floating:0xf4e2a1,boss:0xf4a08f};
  for(const zone of l.ring.zones){
   const x=zone.point.x+.5,z=zone.point.y+.5,y=pilotGround(x,z);
   // Actual accessible zone endpoints are not obstructed by art-only signage.
   const column=new T.Group();column.position.set(x+.85,y,z+.85);column.name='zone-sign-'+zone.id;posts.add(column);
   add(new T.CylinderGeometry(.065,.09,1.1,8),dark,0,.55,0,column);
   const flag=add(new T.BoxGeometry(.55,.36,.07),mat(hues[zone.id]),.29,.93,.015,column);
   flag.name='ring-zone-color-flag';
   add(new T.BoxGeometry(.32,.06,.12),gold,.23,1.12,0,column);
   if(zone.id==='boss'){
    const halo=add(new T.TorusGeometry(4.75,.12,8,40),mat(0xe7a46a),-.85,.055,-.85,column);
    halo.rotation.x=-Math.PI/2;halo.name='center-guardian-boss-ring';
   }
  }
  if(l.ring.activeZones.includes('floating')){
   const islands=new T.Group();islands.name='floating-land-playable-islands';posts.add(islands);
   const rock=mat(0x8a8478),grass=mat(0x75b558),rail=mat(0x8b6444);
   const platforms=l.ledges.filter(o=>o.id>=980&&o.id<=985);
   for(const platform of platforms){const x=platform.point.x+.5,z=platform.point.y+.5,top=pilotGround(x,z)+platform.height;
    const under=add(new T.DodecahedronGeometry(.85,0),rock,x,top-.37,z,islands);under.scale.set(1,.54,1);
    add(new T.CylinderGeometry(.91,.78,.16,9),grass,x,top-.06,z,islands).name='floating-island-walkable-cap-'+platform.id;
    for(let i=0;i<3;i++){const q=add(new T.IcosahedronGeometry(.1,0),gold,x+Math.sin(i*2.1)*.53,top+.08,z+Math.cos(i*2.1)*.53,islands);q.name='floating-magic-spark';}
   }
   // Visible rope connects consecutive walkable stepping islands; unlike
   // the old fake bridge, each landing has a real ledge collider.
   for(let i=1;i<platforms.length;i++){
    const a=platforms[i-1],b=platforms[i],x=a.point.x+.5,z=a.point.y+.5,xx=b.point.x+.5,zz=b.point.y+.5;
    const y=pilotGround(x,z)+a.height,yy=pilotGround(xx,zz)+b.height;
    const rope=new T.CatmullRomCurve3([new T.Vector3(x,y+.12,z),new T.Vector3((x+xx)/2,(y+yy)/2-.15,(z+zz)/2),new T.Vector3(xx,yy+.12,zz)]);
    add(new T.TubeGeometry(rope,12,.037,6,false),rail,0,0,0,islands).name='floating-island-rope-route';
   }
  }
  for(const [i,tip]of l.ring.deadEnds.entries()){
   const x=tip.x+.5,z=tip.y+.5,y=pilotGround(x,z);
   const reward=add(new T.OctahedronGeometry(.23,0),mat(0xeed380),x,y+.55,z,posts);
   reward.name='rewarded-dead-end-'+i;
  }
 }
 // Instance small vegetation in bounded chunks rather than adding thousands of individual draw calls.
 const sprigs:T.Matrix4[]=[],blossoms:T.Matrix4[][]=[[],[],[]],dummy=new T.Object3D();
 for(let i=0;i<1600;i++){const x=1+(i*17.137)%(n-2),z=1+(i*31.733)%(n-2),ix=Math.floor(x),iz=Math.floor(z);if(grid[iz]?.[ix]!==0||pilotGround(x,z)<WATER+.2)continue;const edge=[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>solid(ix+a,iz+b));if(!edge&&i%5)continue;dummy.position.set(x,pilotGround(x,z)+.12,z);dummy.rotation.set(0,i*.7,.15*Math.sin(i));dummy.scale.set(.7+i%3*.2,1,.7+i%3*.2);dummy.updateMatrix();sprigs.push(dummy.matrix.clone());if(i%3===0){dummy.position.y+=.16;dummy.scale.setScalar(.8);dummy.updateMatrix();blossoms[i%3].push(dummy.matrix.clone());}}
 const instances=(g:T.BufferGeometry,m:T.Material,list:T.Matrix4[])=>{const mesh=new T.InstancedMesh(g,m,list.length);list.forEach((v,i)=>mesh.setMatrixAt(i,v));mesh.computeBoundingSphere();root.add(mesh);};const bladeVertices:number[]=[];for(let i=0;i<7;i++){const a=i*2.4,dx=Math.cos(a)*.14,dz=Math.sin(a)*.14,h=.22+i%3*.055;bladeVertices.push(-dz*.28,-.12,dx*.28,dz*.28,-.12,-dx*.28,dx,h,dz);}const blades=new T.BufferGeometry();blades.setAttribute('position',new T.Float32BufferAttribute(bladeVertices,3));blades.computeVertexNormals();leaf.side=T.DoubleSide;instances(blades,leaf,sprigs);blossoms.forEach((list,i)=>instances(new T.IcosahedronGeometry(.08,0),flower[i],list));
 // Decks follow the terrain and the direction of each existing connection. Rails are visual edge cues.
 for(const [cx,cz,w,d]of[[31.5,32.5,7,2],[32.5,38.5,5,2]]){for(let i=0;i<Math.ceil(w*3);i++){const x=cx-w/2+i/3;add(new T.BoxGeometry(.29,.1,d),wood,x,(cx===31.5?.1:pilotGround(x,cz)+.04),cz);}for(const side of[-1,1]){for(let i=0;i<4;i++){const x=cx-w/2+i*w/3;add(new T.BoxGeometry(.09,.8,.09),wood,x,(cx===31.5?.46:pilotGround(x,cz)+.4),cz+side*d/2);}const rail=add(new T.BoxGeometry(w,.07,.07),wood,cx,(cx===31.5?.82:pilotGround(cx,cz)+.76),cz+side*d/2);rail.rotation.z=cx===31.5?0:(pilotGround(cx+w/2,cz)-pilotGround(cx-w/2,cz))/w;}}
 // Waterfall Hub rebuild: handcrafted, readable three-tier playfield.
 // These structures occupy the same world coordinates as the authoritative
 // pilotGround() stair heights and the walkable bridge Ledges in forestPilotLayout.
 const hubGrass=mat(0x6bb748),hubEarth=mat(0xb79a70),hubStone=mat(0xa79c81),hubRail=mat(0x8a5838),hubRoof=mat(0x965b42),hubRoofTrim=mat(0xecc67c),hubGold=mat(0xffdc73),hubVine=mat(0x4b9563);
 const platformDecor=new T.Group();platformDecor.name='waterfall-hub-handcrafted-playground';root.add(platformDecor);
 // Batch repeated stair treads and bridge boards for smartphone GPU budgets.
 const treadGroups:[T.Matrix4[],T.Matrix4[],T.Matrix4[]]=[[],[],[]],treadDummy=new T.Object3D();
 const tread=(group:number,x:number,y:number,z:number,w:number,h:number,d:number,angle=0)=>{
  treadDummy.position.set(x,y,z);treadDummy.rotation.set(0,angle,0);treadDummy.scale.set(w,h,d);treadDummy.updateMatrix();treadGroups[group].push(treadDummy.matrix.clone());
 };
 for(const terrace of WATERFALL_HUB_TERRACES){
  const {x,z,w,d,top,name}=terrace;
  // An earthy podium with a green, clearly navigable top; not an invisible hill.
  const base=top>3?-.9:top>2?-1.25:-.7;
  for(const side of[-1,1]){
   const long=add(new T.BoxGeometry(w,.0+top-base,.24),hubEarth,x,(top+base)/2,z+side*(d/2-.15),platformDecor);
   long.name='terrace-visible-cliff';
   const short=add(new T.BoxGeometry(.24,.0+top-base,d),hubEarth,x+side*(w/2-.15),(top+base)/2,z,platformDecor);
   short.name='terrace-visible-cliff';
  }
  add(new T.BoxGeometry(w-.55,.12,d-.55),hubGrass,x,top-.06,z,platformDecor).name='playable-moss-terrace-'+name.replace(/\s+/g,'-');
  for(const side of[-1,1]){
   // Edge posts are scenery only; walkable ground uses terrain/ledge collision.
   for(let j=0;j<3;j++){
    const px=x+side*(w/2-.52),pz=z+(j-1)*(d/3);
    add(new T.CylinderGeometry(.07,.09,.72,7),hubRail,px,top+.36,pz,platformDecor);
   }
   add(new T.BoxGeometry(.085,.075,d*.72),hubRail,x+side*(w/2-.52),top+.69,z,platformDecor);
  }
 }
 // Distinct staircases, rather than a slightly sloping hillside. The steps are
 // decals on the actual continuous collision surface: no phantom step collider.
 for(const ramp of WATERFALL_HUB_RAMPS){
  const [ax,az]=ramp.from,[bx,bz]=ramp.to,dx=bx-ax,dz=bz-az,span=Math.hypot(dx,dz),steps=Math.max(5,Math.round(span*2.5));
  for(let i=0;i<steps;i++){
   const t=(i+.5)/steps,x=ax+dx*t,z=az+dz*t,y=pilotGround(x,z);
   tread(i%4===0?0:1,x,y+.01,z,ramp.width*.82,.09,span/steps*.82,Math.atan2(dx,dz));
  }
  // Rope rail and climbing vines make the connection recognizable from afar.
  for(const side of[-1,1]){
   const nx=-dz/span,nz=dx/span,points:T.Vector3[]=[];
   for(let i=0;i<=10;i++){
    const t=i/10,x=ax+dx*t+nx*side*ramp.width*.43,z=az+dz*t+nz*side*ramp.width*.43;
    points.push(new T.Vector3(x,pilotGround(x,z)+.85,z));
    if(i%5===0)add(new T.CylinderGeometry(.075,.085,.83,7),hubRail,x,pilotGround(x,z)+.4,z,platformDecor);
   }
   add(new T.TubeGeometry(new T.CatmullRomCurve3(points),24,.045,5,false),iColor(side),0,0,0,platformDecor).name='handrail-following-stair';
  }
 }
 function iColor(side:number){return side===-1?hubRail:hubVine;}
 // The bridge deck and its physics share top heights with the Ledge records.
 for(const bridge of WATERFALL_HUB_BRIDGES){
  add(new T.BoxGeometry(bridge.w,.2,bridge.d),hubRail,bridge.x,bridge.top-.11,bridge.z,platformDecor).name='walkable-canopy-bridge-'+bridge.name;
  const count=Math.ceil(bridge.w*3);
  for(let i=0;i<count;i++){const px=bridge.x-bridge.w/2+(i+.5)*bridge.w/count;
   tread(i%3?2:1,px,bridge.top+.008,bridge.z,bridge.w/count-.04,.025,bridge.d-.13);
  }
  for(const side of[-1,1]){
   const zz=bridge.z+side*(bridge.d/2-.08);
   for(let i=0;i<=3;i++){
    const px=bridge.x-bridge.w/2+i*bridge.w/3;
    add(new T.CylinderGeometry(.065,.08,.73,6),wood,px,bridge.top+.32,zz,platformDecor);
   }
   add(new T.BoxGeometry(bridge.w,.065,.075),hubRail,bridge.x,bridge.top+.66,zz,platformDecor);
  }
 }
 for(const [i,material]of [hubStone,hubRoofTrim,wood].entries()){
  const matrices=treadGroups[i];if(!matrices.length)continue;
  const mesh=new T.InstancedMesh(new T.BoxGeometry(1,1,1),material,matrices.length);
  matrices.forEach((matrix,j)=>mesh.setMatrixAt(j,matrix));mesh.computeBoundingSphere();
  mesh.name='batched-walkable-stairs-and-bridge-boards';platformDecor.add(mesh);
 }
 // Little open-sided lodges: visually distinct landmarks, without solid fake
 // door collisions or blocker volumes across the gameplay lanes.
 for(const h of WATERFALL_HUB_HUTS){
  const floor=pilotGround(h.x,h.z),house=new T.Group();house.position.set(h.x,floor,h.z);house.rotation.y=h.yaw;house.name='river-village-open-shelter';platformDecor.add(house);
  add(new T.CylinderGeometry(1.35,1.5,.16,8),hubStone,0,.1,0,house);
  for(const sx of[-1,1])for(const sz of[-1,1])add(new T.CylinderGeometry(.09,.11,1.45,7),hubRail,sx*.91,.86,sz*.91,house);
  const roof=add(new T.ConeGeometry(1.83,.98,8),hubRoof,0,1.85,0,house);roof.rotation.y=Math.PI/8;
  add(new T.CylinderGeometry(1.55,1.55,.12,8),hubRoofTrim,0,1.44,0,house);
  const lamp=add(new T.OctahedronGeometry(.16,0),hubGold,0,1.37,0,house);lamp.name='shelter-lantern';
 }
 // Two-stage spillway in the PLAYABLE HUB, distinct from the distant main falls.
 // Source aligns with the east lookout and terminates in the shared water basin.
 const stagedCascade=new T.Group();stagedCascade.name='waterfall-hub-two-stage-cascade';platformDecor.add(stagedCascade);
 const cascadeWater=new T.MeshPhongMaterial({color:0x5acada,transparent:true,opacity:.79,side:T.DoubleSide,depthWrite:false,shininess:85});
 const cascadeMist=new T.MeshBasicMaterial({color:0xf0ffff,transparent:true,opacity:.78,side:T.DoubleSide,depthWrite:false});
 const stagedFall=(from:[number,number,number],to:[number,number,number],width:number,name:string)=>{
  const vertices:number[]=[],uvs:number[]=[],segments=18;
  for(let i=0;i<segments;i++)for(const rear of[false,true]){
   const p=(t:number,side:number)=>new T.Vector3(from[0]+(to[0]-from[0])*t+(side-.5)*width,from[1]+(to[1]-from[1])*t+.06*Math.sin(t*16+side*5),from[2]+(to[2]-from[2])*t+(rear?.22:0)+.1*Math.sin(t*6));
   const t=i/segments,u=(i+1)/segments,quad=[p(t,0),p(t,1),p(u,1),p(u,0)];
   for(const j of[0,1,2,0,2,3]){const q=quad[j];vertices.push(q.x,q.y,q.z);uvs.push(j===0||j===3?0:1,j>=2?u:t);}
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.computeVertexNormals();
  add(g,cascadeWater,0,0,0,stagedCascade).name=name;
  for(const edge of[-1,1]){
   const points=Array.from({length:16},(_,i)=>{const t=i/15;return new T.Vector3(from[0]+(to[0]-from[0])*t+edge*width*.48,from[1]+(to[1]-from[1])*t,from[2]+(to[2]-from[2])*t+.09);});
   add(new T.TubeGeometry(new T.CatmullRomCurve3(points),28,.025,5,false),cascadeMist,0,0,0,stagedCascade).name='spillway-foam';
  }
 };
 stagedFall([64.3,4.25,47.8],[63.5,2.15,50.0],1.8,'upper-waterfall-tier');
 stagedFall([63.5,2.15,50.0],[62.5,WATER,52.1],2.15,'lower-waterfall-tier');
 for(const [x,z,y]of [[64.3,47.8,4.25],[63.5,50,2.15],[62.5,52.1,WATER]] as const){
  const ring=add(new T.TorusGeometry(.43,.042,6,24),cascadeMist,x,y+.035,z,stagedCascade);ring.rotation.x=-Math.PI/2;
  for(let i=0;i<5;i++){
   const angle=i*Math.PI*2/5;
   add(new T.IcosahedronGeometry(.12,0),cascadeMist,x+Math.sin(angle)*.38,y+.06,z+Math.cos(angle)*.32,stagedCascade);
  }
 }
 // Viewpoint reward and an easy-to-see, useful path toward the river.
 for(const [x,z]of [[44.5,58],[47,51.5],[51,45.5],[65.5,46.5],[66,57.5]] as const){
  const y=pilotGround(x,z),base=add(new T.CylinderGeometry(.42,.52,.24,8),hubStone,x,y+.1,z,platformDecor);
  base.name='route-wayfinder';add(new T.OctahedronGeometry(.22,0),hubGold,x,y+.51,z,platformDecor).name='route-wayfinder-glow';
 }
 // Rune ruins are aligned with the state's round colliders, including their terrain elevation.
 for(const x of[50,58])for(const z of[27,34]){const h=pilotGround(x,z);add(new T.CylinderGeometry(.3,.38,2.1,7),stone,x,h+1.05,z);add(new T.BoxGeometry(.8,.22,.8),stone,x,h+2.15,z);}add(new T.BoxGeometry(8.6,.28,.7),stone,54,pilotGround(54,27)+2.4,27);
 const switches=l.pilot!.switches.map(p=>{const h=pilotGround(p.x+.5,p.y+.5),m=add(new T.CylinderGeometry(.32,.38,.7,6),new T.MeshLambertMaterial({color:0x9271b7,emissive:0x171024}),p.x+.5,h+.35,p.y+.5,dynamic);add(new T.OctahedronGeometry(.15),new T.MeshBasicMaterial({color:0xe8d0ff}),p.x+.5,h+.9,p.y+.5,dynamic);return m;});
 const gates=[l.pilot!.gates,l.pilot!.bridge,l.pilot!.shortcut,l.pilot!.exit].map((cells,i)=>{const g=new T.Group();g.name=['sigil-sanctuary-gate','cliff-bridge-gate','tree-shortcut','boss-exit-gate'][i];for(const p of cells)add(new T.BoxGeometry(1,1.8,1),mat(i===0?0x8461ac:0x8b7555),p.x+.5,Math.max(0,pilotGround(p.x+.5,p.y+.5))+.9,p.y+.5,g);dynamic.add(g);return g;});
 // The water surface is clipped by exactly the same depth field used for swimming.
 const waterVertices:number[]=[],waterCell=.32;for(let z=31;z<68;z+=waterCell)for(let x=43;x<70;x+=waterCell){for(const tri of [[[x,z],[x+waterCell,z],[x,z+waterCell]],[[x+waterCell,z],[x+waterCell,z+waterCell],[x,z+waterCell]]]){if(tri.every(([a,b])=>pilotGround(a,b)<WATER-.015))for(const [a,b]of tri)waterVertices.push(a,WATER,b);}}
 const waterGeo=new T.BufferGeometry();waterGeo.setAttribute('position',new T.Float32BufferAttribute(waterVertices,3));waterGeo.computeVertexNormals();add(waterGeo,new T.MeshPhongMaterial({color:0x2ba6c1,transparent:true,opacity:.59,depthWrite:false,shininess:80,side:T.DoubleSide}),0,0,0,dynamic).name='depth-matched-water';
 // Underwater playground: kelp, sheltering stones and moving fish silhouettes.
 // Every placement checks the shared physical floor so no model floats above the seabed.
 const underwater=new T.Group();underwater.name='waterfall-valley-underwater';root.add(underwater);
 const kelpMat=mat(0x2d8274),kelpLight=mat(0x6aaf7c),shellMat=mat(0xbba67e),fishMat=[mat(0xffc97b),mat(0x9de4d6),mat(0xf19b7c)];
 const fishGroups:T.Group[]=[];
 for(let i=0;i<23;i++){
  const a=i*2.39996,r=2.2+(i*11%8)*.71,x=55.5+Math.cos(a)*r,z=53.5+Math.sin(a)*r,ground=pilotGround(x,z);
  if(ground>WATER-2.0)continue;
  const h=.85+(i%5)*.17;
  const stem=new T.CatmullRomCurve3([new T.Vector3(x,ground+.02,z),new T.Vector3(x+.1,ground+h*.5,z-.08),new T.Vector3(x+Math.sin(i)*.25,ground+h,z+.15)]);
  add(new T.TubeGeometry(stem,8,.046,5,false),i%3?kelpMat:kelpLight,0,0,0,underwater).name='underwater-kelp';
  if(i%4===0){const rock=add(new T.DodecahedronGeometry(.37,0),stone,x+.4,ground+.2,z-.35,underwater);rock.scale.set(1.45,.5,1.2);}
  if(i%5===0){const fish=new T.Group();fish.name='forest-pool-fish';const body=new T.Mesh(new T.SphereGeometry(.21,9,6),fishMat[i%3]);body.scale.set(1,.5,.5);fish.add(body);const tail=new T.Mesh(new T.ConeGeometry(.12,.2,5),fishMat[i%3]);tail.rotation.z=Math.PI/2;tail.position.x=-.23;fish.add(tail);fish.position.set(x,ground+h*.95,z);fish.userData.swimY=fish.position.y;underwater.add(fish);fishGroups.push(fish);}
 }
 // Two navigable stone arches lead players toward submerged collectibles, without extra invisible colliders.
 for(const [ax,az] of [[53.5,55.5],[55.5,58.5]] as const){const floor=pilotGround(ax,az);if(floor>WATER-2.1)continue;
  for(const side of[-1,1]){const pillar=add(new T.CylinderGeometry(.28,.38,1.4,7),stone,ax+side*1.2,floor+.7,az,underwater);pillar.rotation.z=side*.11;}
  const lintel=add(new T.BoxGeometry(3.1,.35,.7),shellMat,ax,floor+1.55,az,underwater);lintel.rotation.z=.04;
 }
 // A clearly readable climb-and-lookout route: risers, rope-and-vine grips, and a reward beacon.
 for(const ledge of l.ledges.filter(q=>q.id>=820&&q.id<=827)){
  const x=ledge.point.x+.5,z=ledge.point.y+.5,floor=pilotGround(x,z),h=ledge.height;
  for(const side of[-1,1]){
   const vine=new T.CatmullRomCurve3([new T.Vector3(x+side*(ledge.width||1)*.48,floor+.05,z+.5),new T.Vector3(x+side*(ledge.width||1)*.48-.06,floor+h*.57,z+.52),new T.Vector3(x+side*(ledge.width||1)*.48+.09,floor+h+.05,z+.48)]);
   add(new T.TubeGeometry(vine,10,.036,5,false),kelpLight,0,0,0,root).name='visible-climbing-vines';
  }
  if(ledge.id===823){
   const marker=add(new T.OctahedronGeometry(.3,0),new T.MeshLambertMaterial({color:0xffd27e,emissive:0x7f4a13}),x,floor+h+.9,z);
   marker.name='lookout-reward-beacon';
   for(const side of[-1,1]){add(new T.CylinderGeometry(.075,.09,.85,7),wood,x+side*.92,floor+h+.42,z+.92);add(new T.BoxGeometry(1.9,.09,.12),wood,x,floor+h+.83,z+.92);}
  }
 }
 // The Green Cliffs spike gap has a genuine landing deck, rather than a
 // visual bridge over a separate invisible death region.
 const gapDeck=l.ledges.find(q=>q.id===828);
 if(gapDeck){const x=gapDeck.point.x+.5,z=gapDeck.point.y+.5,top=pilotGround(x,z)+gapDeck.height;
  add(new T.BoxGeometry(gapDeck.width||3.4,.16,gapDeck.depth||1.65),wood,x,top-.08,z,root).name='spike-gap-solid-bridge';
  for(const side of[-1,1])add(new T.BoxGeometry(gapDeck.width||3.4,.07,.065),hubRail,x,top+.52,z+side*.74,root);
  for(let i=0;i<6;i++)add(new T.BoxGeometry(.48,.025,(gapDeck.depth||1.65)-.1),hubRoofTrim,x-1.35+i*.54,top+.01,z,root);
 }
 // A clearly signposted, traversable-looking hazard near the upper trail.
 for(let i=0;i<10;i++){const a=i*Math.PI*2/10,x=23.5+Math.cos(a)*1.43,z=20.2+Math.sin(a)*1.43;
  const warning=add(new T.ConeGeometry(.11,.36,5),i%2?stone:shellMat,x,pilotGround(x,z)+.18,z,root);warning.name='cliff-gap-warning';
 }
 // Dive tunnel stays below a clearly visible stone lintel, not a bridge over dry grass.
 add(new T.BoxGeometry(3.6,.45,1),stone,61.5,.15,37.5);for(const side of[-1,1])add(new T.BoxGeometry(.45,2.5,1),stone,61.5+side*1.8,-1,37.5);
 // Waterfall has volume and double-sided material: visible from front, side and rear.
 const sourceTop=pilotWallHeight(66.5,40.5)+.04,fallBottom=WATER,fallHeight=sourceTop-fallBottom,fallMaterial=new T.MeshPhongMaterial({color:0x56c4dc,transparent:true,opacity:.82,side:T.DoubleSide,shininess:70});
 const fall=new T.Group();fall.name='waterfall-volume';dynamic.add(fall);
 // A continuous *volumetric* cascade with front, back and both side surfaces.
 // Unlike overlapping billboard planes this stays readable from every walkable angle.
 const cascade=new T.BufferGeometry(),fallVertices:number[]=[],fallUV:number[]=[];
 const face=(a:T.Vector3,b:T.Vector3,c:T.Vector3,ta:[number,number],tb:[number,number],tc:[number,number])=>{
  fallVertices.push(a.x,a.y,a.z,b.x,b.y,b.z,c.x,c.y,c.z);
  fallUV.push(...ta,...tb,...tc);
 };
 const section=(t:number,w:number,back:boolean)=>{
  const front=65.40+t*1.0+.11*Math.sin(t*Math.PI*1.7);
  const depth=(.3+.1*Math.sin(t*Math.PI))*(back?1:0);
  return new T.Vector3(front+depth,fallBottom+t*fallHeight,40.5+(w-.5)*2.65+.04*Math.sin(t*13+w*7));
 };
 const steps=24,across=12;
 for(let i=0;i<steps;i++)for(let j=0;j<across;j++){
  const t0=i/steps,t1=(i+1)/steps,w0=j/across,w1=(j+1)/across;
  for(const rear of[false,true]){
   const a=section(t0,w0,rear),b=section(t0,w1,rear),c=section(t1,w1,rear),d=section(t1,w0,rear);
   face(a,b,c,[w0,t0],[w1,t0],[w1,t1]);face(a,c,d,[w0,t0],[w1,t1],[w0,t1]);
  }
 }
 for(const w of[0,1])for(let i=0;i<steps;i++){
  const t0=i/steps,t1=(i+1)/steps;
  const a=section(t0,w,false),b=section(t0,w,true),c=section(t1,w,true),d=section(t1,w,false);
  face(a,b,c,[0,t0],[1,t0],[1,t1]);face(a,c,d,[0,t0],[1,t1],[0,t1]);
 }
 cascade.setAttribute('position',new T.Float32BufferAttribute(fallVertices,3));
 cascade.setAttribute('uv',new T.Float32BufferAttribute(fallUV,2));cascade.computeVertexNormals();
 add(cascade,fallMaterial,0,0,0,fall).name='waterfall-continuous-volume';
 // Thin, three-dimensional foam strands preserve the downward-flow reading from the side.
 for(const w of[.08,.25,.5,.75,.92]){
  const points=Array.from({length:17},(_,i)=>{
   const q=section(i/16,w,false);q.x-=.025;return q;
  });
  const foamLine=new T.TubeGeometry(new T.CatmullRomCurve3(points),32,.014,4,false);
  add(foamLine,foam,0,0,0,fall);
 }
 const upperGeo=new T.PlaneGeometry(2,2,8,8);upperGeo.rotateX(-Math.PI/2);const up=upperGeo.attributes.position;for(let i=0;i<up.count;i++){const x=up.getX(i)+67.4,z=up.getZ(i)+40.5;up.setXYZ(i,x,pilotWallHeight(x,z)+.045,z);}upperGeo.computeVertexNormals();add(upperGeo,fallMaterial,0,0,0,dynamic).name='waterfall-upper-stream';
 for(const side of[-1,1]){const lip=add(new T.DodecahedronGeometry(.55),stone,66.4,sourceTop-.16,40.5+side*1.2);lip.scale.set(1.2,.6,1);}
 const streaks=Array.from({length:8},(_,i)=>add(new T.CapsuleGeometry(.025,.3,2,4),foam,65.4,1,39.65+i*.24,dynamic));
 const ripples=Array.from({length:10},()=>{const m=add(new T.TorusGeometry(.3,.018,4,24),foam.clone(),65.45,WATER+.025,40.5,dynamic);m.rotation.x=-Math.PI/2;return m;});
 const spray=new T.InstancedMesh(new T.SphereGeometry(.035,5,4),foam,9);spray.name='waterfall-spray';dynamic.add(spray);const sprayPose=new T.Object3D();
 // Keep Sanctuary natural and unobstructed: a small engraved ring replaces the giant pink disc.
 const ring=add(new T.RingGeometry(3.7,3.82,40),mat(0xb3a888),l.fortress.x+.5,pilotGround(l.fortress.x+.5,l.fortress.y+.5)+.015,l.fortress.y+.5);ring.rotation.x=-Math.PI/2;
 const textures=new Set<T.Texture>();return {update(t:number,camera:T.Camera,player?:{x:number;y:number;depth?:number}){const s=state?.();for(let i=0;i<9;i++){const age=(t*.9+i*.11)%1;const a=i*2.4;sprayPose.position.set(65.4+Math.cos(a)*age*.5,WATER+.03+Math.sin(age*Math.PI)*.45,40.5+Math.sin(a)*age*.7);sprayPose.scale.setScalar(1-age*.7);sprayPose.updateMatrix();spray.setMatrixAt(i,sprayPose.matrix);}spray.instanceMatrix.needsUpdate=true;sky.position.copy(camera.position);sky.visible=camera.position.y>WATER;
 fishGroups.forEach((fish,i)=>{fish.rotation.y=t*.55+i*2.1;fish.position.y=Number(fish.userData.swimY)+Math.sin(t*1.3+i)*.12;});streaks.forEach((m,i)=>{const age=(t*.7+i*.13)%1;m.position.y=sourceTop-age*fallHeight;m.position.x=66.4-age*.95;});gates.forEach((g,i)=>g.visible=i===0?!(s?.layout.ring?s?.bossReady:s?.sigilReady):i===1?!s?.pilotSwitches.includes(0):i===2?!s?.climbed.has(802):!s?.bossCleared);switches.forEach((m,i)=>(m.material as T.MeshLambertMaterial).emissive.set(s?.pilotSwitches.includes(i)?0x4aab6e:0x171024));ripples.forEach((m,i)=>{const age=(t*.6+i*.1)%1;m.scale.setScalar(.4+age*2);(m.material as T.MeshBasicMaterial).opacity=(1-age)*.5;if(i<5&&s?.swimming&&player){m.position.set(player.x+Math.sin(i)*.1,WATER+.025,player.y+Math.cos(i)*.1);m.visible=pilotGround(player.x,player.y)<WATER;}else {m.visible=true;m.position.set(65.45,WATER+.025,40.5);}});if(scene.fog instanceof T.Fog){const under=camera.position.y<WATER;scene.fog.color.set(under?0x418d99:0xc8e9ed);scene.fog.near=under?2:32;scene.fog.far=under?22:88;}},dispose(){skyTexture.dispose();sky.geometry.dispose();sky.material.dispose();scene.remove(sky);const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();for(const group of[root,dynamic])group.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>{for(const v of Object.values(m))if(v instanceof T.Texture)textures.add(v);m.dispose();});textures.forEach(t=>t.dispose());world.remove(root,dynamic);}};
}
