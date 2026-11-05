import * as T from 'three';
import type {AdventureLayout} from './adventure-layout';
import type {AdventureState} from './adventure-state';
import {pilotGround,pilotTreeSites,pilotWallHeight,PILOT_WATER_LEVEL as WATER,PILOT_UNDERGROUND_WATER_LEVEL as UG_WATER} from './forest-pilot';
import {FOREST_LAYERS} from './forest-world-design';
import {biomeSky} from './biome-scenery';
import type {ForestWorldSite} from './forest-rpg';

const mat=(c:number)=>new T.MeshLambertMaterial({color:c,flatShading:true});
const add=(parent:T.Object3D,g:T.BufferGeometry,m:T.Material,x:number,y:number,z:number)=>{const q=new T.Mesh(g,m);q.position.set(x,y,z);parent.add(q);return q;};
const disposeTree=(root:T.Object3D)=>{const gs=new Set<T.BufferGeometry>(),ms=new Set<T.Material>();root.traverse(o=>{if(o instanceof T.Mesh){gs.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])ms.add(m);}});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());};

function terrainPatch(size:number,ox:number,oz:number,segments:number,material:T.Material){
 const g=new T.PlaneGeometry(size,size,segments,segments);g.rotateX(-Math.PI/2);const p=g.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i)+ox+size/2,z=p.getZ(i)+oz+size/2;p.setXYZ(i,x,pilotGround(x,z)-.035,z);}g.computeVertexNormals();
 const m=new T.Mesh(g,material);m.name='forest-organic-terrain';return m;
}
function tree(parent:T.Object3D,x:number,y:number,z:number,scale:number,wood:T.Material,leaf:T.Material){
 const g=new T.Group();g.position.set(x,y,z);g.scale.setScalar(scale);g.name='forest-canopy-tree';parent.add(g);
 const trunk=add(g,new T.CylinderGeometry(.22,.34,2.9,8),wood,0,1.45,0);trunk.rotation.z=Math.sin(x*.17+z*.11)*.035;
 for(const [dx,dy,dz,s] of [[0,3.15,0,1.18],[-.62,2.9,.18,.78],[.58,2.82,-.25,.72],[.08,3.48,.2,.68]] as const){const c=add(g,new T.IcosahedronGeometry(1,1),leaf,dx,dy,dz);c.scale.set(s,s*.72,s);}
 return g;
}
function bush(parent:T.Object3D,x:number,y:number,z:number,leaf:T.Material,flower?:T.Material){const g=new T.Group();g.position.set(x,y,z);parent.add(g);for(let i=0;i<3;i++){const a=i*2.094,c=add(g,new T.IcosahedronGeometry(.38,0),leaf,Math.sin(a)*.3,.22,Math.cos(a)*.3);c.scale.y=.65;}if(flower)for(let i=0;i<4;i++){const a=i*1.57;add(g,new T.SphereGeometry(.06,6,4),flower,Math.sin(a)*.38,.48,Math.cos(a)*.38);}return g;}

export function forestMasterWorld(scene:T.Scene,world:T.Group,l:AdventureLayout,state?:()=>AdventureState|undefined){
 const root=new T.Group();root.name='forest-grove-extreme-master';root.userData.cameraOccluder=true;root.userData.worldBuild=l.ring?.version;world.add(root);
 const skyTex=biomeSky('forest'),sky=new T.Mesh(new T.SphereGeometry(440,24,12),new T.MeshBasicMaterial({map:skyTex,side:T.BackSide,depthWrite:false,fog:false}));scene.add(sky);scene.background=new T.Color(0xbfe5e7);scene.fog=new T.Fog(0xbfe5e7,24,78);
 const grid=l.maze.grid,ring=l.ring!;
 // Forest Grove palette: canopy #3f7f45, moss #74a84c, bark #6e4932,
 // warm soil #a77b4e, river #35acc2, stone #718077, sunlight #f3cd78.
 const moss=mat(0x78a94f),deepMoss=mat(0x4f8144),soil=mat(0xa77b4e),rock=mat(0x718077),rockDark=mat(0x596861),wood=mat(0x6e4932),leaf=mat(0x3f7f45),leafLight=mat(0x67a84f),ruin=mat(0xa69d82),purple=mat(0x8b69c9),gold=mat(0xe7c469),flower=mat(0xe89aa6);
 const waterMat=new T.MeshPhongMaterial({color:0x35acc2,transparent:true,opacity:.62,depthWrite:false,shininess:95,specular:0xd8ffff,side:T.DoubleSide});
 // ONE surface terrain, ONE underground terrain. Floating has no hidden floor.
 const surface=FOREST_LAYERS.surface;root.add(terrainPatch(surface.size,surface.origin.x,surface.origin.y,90,moss));
 const underground=FOREST_LAYERS.underground;const ugTerrain=terrainPatch(underground.size,underground.origin.x,underground.origin.y,56,rockDark);ugTerrain.name='underground-organic-terrain';root.add(ugTerrain);
 // Navigation blockers are visually represented by natural cliff/boulder masses.
 // No brown 1x1 wall boxes and no visually-open invisible barrier along main paths.
 const boundary:{x:number;z:number}[]=[];for(let z=2;z<surface.size-2;z++)for(let x=2;x<surface.size-2;x++)if(grid[z]?.[x]===1&&(grid[z-1]?.[x]===0||grid[z+1]?.[x]===0||grid[z]?.[x-1]===0||grid[z]?.[x+1]===0))boundary.push({x:x+.5,z:z+.5});
 const cliffGeo=new T.DodecahedronGeometry(.72,0),cliffs=new T.InstancedMesh(cliffGeo,rock,boundary.length);const d=new T.Object3D();boundary.forEach((p,i)=>{const h=Math.max(2.2,pilotWallHeight(p.x,p.z)-pilotGround(p.x,p.z)),s=.9+((i*17)%7)*.065;d.position.set(p.x,pilotGround(p.x,p.z)+h*.34,p.z);d.scale.set(s,h*.5,1.05+((i*11)%5)*.08);d.rotation.y=(i*.73)%Math.PI;d.updateMatrix();cliffs.setMatrixAt(i,d.matrix);});cliffs.name='natural-solid-cliff-boundary';root.add(cliffs);
 // Dense trees are placed on authoritative blocked cells. Trunks visually explain collision.
 const treeSites=pilotTreeSites(l).filter(p=>p.x<surface.size&&p.z<surface.size);for(const [i,p] of treeSites.entries()){if(i%2===0||i<160)tree(root,p.x,pilotGround(p.x,p.z),p.z,.78+Math.min(.55,p.scale*.18),wood,i%5===0?leafLight:leaf);}
 // Ground-level understory only on open/walkable ground and away from portals/content.
 const noPlant=[...ring.portals.map(p=>p.point),...ring.content.map(s=>s.point),...ring.zones.map(z=>z.point)];for(let z=4;z<surface.size-4;z+=4)for(let x=4;x<surface.size-4;x+=4){if(grid[z]?.[x]!==0||noPlant.some(p=>Math.hypot(p.x-x,p.y-z)<3.4))continue;const h=(x*37+z*71)%13;if(h<7)bush(root,x+.5,pilotGround(x+.5,z+.5),z+.5,h%3===0?leafLight:deepMoss,h===1?flower:undefined);}
 // Physical traversal surfaces are rendered from the exact same ledge data used by physics.
 // This prevents visible stairs/bridges with missing collision and avoids duplicate legacy meshes.
 for(const ledge of l.ledges){const x=ledge.point.x+.5,z=ledge.point.y+.5,base=pilotGround(x,z),w=ledge.width||1,d=ledge.depth||1,h=Math.max(.12,ledge.height);
  if(ledge.kind==='tree'){const trunk=add(root,new T.CylinderGeometry(Math.max(.45,w*.22),Math.max(.55,w*.28),h,10),wood,x,base+h/2,z);trunk.name='solid-ledger-tree';const deck=add(root,new T.CylinderGeometry(w*.48,w*.52,.28,12),moss,x,base+h+.02,z);deck.name='solid-ledger-deck';}
  else if(ledge.kind==='log'){const q=add(root,new T.BoxGeometry(w,h,d),wood,x,base+h/2,z);q.name='solid-ledger-log';}
  else {const core=add(root,new T.BoxGeometry(w,h,d),rock,x,base+h/2,z);core.name='solid-ledger-rock';for(let i=0;i<Math.max(1,Math.floor(w*d/3));i++){const sx=x-w*.35+((i*1.73)%1)*w*.7,sz=z-d*.35+((i*2.31)%1)*d*.7,r=add(root,new T.DodecahedronGeometry(.28+(i%3)*.08,0),rockDark,sx,base+h+.08,sz);r.scale.y=.5;}}
 }
 // Waterfall Valley: deep basin, upstream shelf, multi-stage falls and downstream river.
 const wf=ring.zones.find(z=>z.id==='waterfall')!.point;const basin=add(root,new T.CircleGeometry(19.5,56),waterMat,wf.x+.5,WATER,wf.y+.5);basin.rotation.x=-Math.PI/2;basin.name='deep-waterfall-basin';
 const upstream=add(root,new T.PlaneGeometry(10,15),waterMat,wf.x-1,WATER+3.5,wf.y-12);upstream.rotation.x=-Math.PI/2;upstream.name='waterfall-upper-stream';
 for(const [dx,dz,w,h,top] of [[-5,-8,5.5,3.5,WATER+3.5],[3,-6,4.2,4.6,WATER+4.6]] as const){const fall=add(root,new T.PlaneGeometry(w,h,8,12),waterMat,wf.x+dx,top-h/2,wf.y+dz);fall.name='waterfall-cascade';}
 const river=add(root,new T.PlaneGeometry(8,28,3,12),waterMat,wf.x+10,WATER+.02,wf.y+14);river.rotation.x=-Math.PI/2;river.rotation.z=-.32;river.name='waterfall-downstream-river';
 // Water-side stones and fallen logs create readable traversal, not empty water.
 for(let i=0;i<14;i++){const a=i*.86,r=6+(i%5)*2.2,x=wf.x+Math.sin(a)*r,z=wf.y+Math.cos(a)*r,y=pilotGround(x,z);const q=add(root,new T.DodecahedronGeometry(.45+(i%3)*.15,0),rock,x,y+.25,z);q.scale.y=.55;}
 // Green Cliffs: natural terraces, stairs, vines, lookout and bridge.
 const green=ring.zones.find(z=>z.id==='green')!.point;const lookout=add(root,new T.CylinderGeometry(4.6,5.1,.35,10),deepMoss,green.x+7,pilotGround(green.x+7,green.y-5)+3.18,green.y-5);lookout.name='green-lookout-moss-cap';for(let i=0;i<6;i++){const vine=add(root,new T.CylinderGeometry(.035,.05,2.7,5),deepMoss,green.x+3+i*.18,pilotGround(green.x+3,green.y-3)+1.5,green.y-3);vine.rotation.z=.08*Math.sin(i);}
 // Ancient Ruins: courtyard, open buildings and tower; paths stay visibly open where collision is open.
 const ruinsP=ring.zones.find(z=>z.id==='ruins')!.point;const courtyard=add(root,new T.CylinderGeometry(8.2,8.8,.35,12),soil,ruinsP.x,pilotGround(ruinsP.x,ruinsP.y)+.12,ruinsP.y);courtyard.name='ruins-courtyard';for(const [dx,dz] of [[-6,-5],[6,-5],[-6,5],[6,5]] as const){add(root,new T.CylinderGeometry(.42,.58,3.5,8),ruin,ruinsP.x+dx,pilotGround(ruinsP.x+dx,ruinsP.y+dz)+1.75,ruinsP.y+dz);}for(const side of[-1,1]){add(root,new T.BoxGeometry(.6,2.5,5.6),ruin,ruinsP.x+side*8,pilotGround(ruinsP.x+side*8,ruinsP.y)+1.25,ruinsP.y);}
 // Chasm: deep visible ravine with traversable bridges aligned to colliders.
 const chasm=ring.zones.find(z=>z.id==='chasm')!.point;for(const dz of[-5,5])for(let i=-5;i<=5;i+=2)add(root,new T.CylinderGeometry(.06,.08,.9,6),wood,chasm.x+i,pilotGround(chasm.x,chasm.y+dz)+1.05,chasm.y+dz-.8);
 // Giant Tree: massive rooted landmark, hollow entrance and playable canopy decks.
 const giant=ring.zones.find(z=>z.id==='giant')!.point;const gy=pilotGround(giant.x,giant.y);add(root,new T.CylinderGeometry(2.9,4.6,15,14),wood,giant.x,gy+7.5,giant.y);for(let i=0;i<8;i++){const a=i*Math.PI/4,rootLog=add(root,new T.CylinderGeometry(.4,.7,5.5,7),wood,giant.x+Math.sin(a)*2.9,gy+.45,giant.y+Math.cos(a)*2.9);rootLog.rotation.z=Math.PI/2-.18;rootLog.rotation.y=a;}for(let i=0;i<4;i++){const a=i*1.57+.3;tree(root,giant.x+Math.sin(a)*3,gy+4.3+i*2.35,giant.y+Math.cos(a)*3,.5,wood,leaf);}
 // Underground: chamber crystals and explicit flooded cavern only. No hidden surface plane beneath it.
 for(const zone of ring.zones.filter(z=>z.layer==='underground')){const y=pilotGround(zone.point.x,zone.point.y);for(let i=0;i<9;i++){const a=i*Math.PI*2/9,r=7+(i%3),q=add(root,new T.OctahedronGeometry(.45+(i%2)*.18,0),i%3?purple:gold,zone.point.x+Math.sin(a)*r,y+.8,zone.point.y+Math.cos(a)*r);q.rotation.y=a;}}
 const flooded=ring.zones.find(z=>z.id==='ug-flooded')?.point;if(flooded){const uw=add(root,new T.CircleGeometry(13,36),waterMat,flooded.x+.5,UG_WATER,flooded.y+.5);uw.rotation.x=-Math.PI/2;uw.name='underground-flooded-cavern-water';}
 // Floating Land: ONLY actual islands. Empty space stays visually empty and is the true void.
 for(const zone of ring.zones.filter(z=>z.layer==='floating')){const y=pilotGround(zone.point.x,zone.point.y),r=zone.radius*.68;const base=add(root,new T.CylinderGeometry(r*.72,r,2.6,12),rock,zone.point.x,y-1.3,zone.point.y);base.name='floating-island-solid-base';const top=add(root,new T.CylinderGeometry(r*.96,r,.34,12),moss,zone.point.x,y-.12,zone.point.y);top.name='floating-island-grass';for(let i=0;i<7;i++){const a=i*Math.PI*2/7,rr=r*.55;tree(root,zone.point.x+Math.sin(a)*rr,y,zone.point.y+Math.cos(a)*rr,.55,wood,leaf);}}
 // RPG sites: visible merchant/clue/quest/rest NPCs and recognizable structures.
 const stallRoof=mat(0xc86f4d),cloth=mat(0xf0cf7a),dark=mat(0x493e35);
 const renderSite=(s:ForestWorldSite)=>{const y=pilotGround(s.point.x+.5,s.point.y+.5),g=new T.Group();g.position.set(s.point.x+.5,y,s.point.y+.5);g.name='forest-site-'+s.id;g.userData.siteId=s.id;root.add(g);
  if(s.kind==='market'){for(const side of[-1,1])add(g,new T.CylinderGeometry(.09,.12,1.8,6),wood,side*1.1,.9,-.45);const roof=add(g,new T.BoxGeometry(2.7,.16,1.7),stallRoof,0,1.75,-.1);roof.rotation.z=.03;add(g,new T.BoxGeometry(2.2,.72,.72),wood,0,.36,.28);for(let i=-1;i<=1;i++)add(g,new T.SphereGeometry(.16,7,5),i%2?gold:purple,i*.45,.84,.06);}
  else if(s.kind==='camp'){add(g,new T.CylinderGeometry(.55,.7,.14,8),dark,0,.08,0);for(let i=0;i<5;i++){const a=i*Math.PI*2/5,q=add(g,new T.CylinderGeometry(.08,.08,1.05,6),wood,Math.sin(a)*.55,.15,Math.cos(a)*.55);q.rotation.z=Math.PI/2;q.rotation.y=a;}add(g,new T.ConeGeometry(.35,.8,8),new T.MeshBasicMaterial({color:0xffa34d,transparent:true,opacity:.8}),0,.55,0);}
  else if(s.kind==='hut'||s.kind==='treehouse'||s.kind==='tower'){const w=s.solid?.w||3,dd=s.solid?.d||3,h=s.kind==='tower'?4.8:2.5;add(g,new T.BoxGeometry(w*.8,h,dd*.8),s.kind==='treehouse'?wood:ruin,0,h/2,0);const roof=add(g,new T.ConeGeometry(Math.max(w,dd)*.62,1.05,5),s.kind==='treehouse'?leaf:stallRoof,0,h+.5,0);roof.rotation.y=Math.PI/5;}
  else if(s.kind==='shrine'){add(g,new T.CylinderGeometry(1.2,1.4,.3,8),ruin,0,.15,0);for(const side of[-1,1])add(g,new T.CylinderGeometry(.15,.2,2.1,8),ruin,side*.8,1.05,0);add(g,new T.OctahedronGeometry(.42,0),purple,0,1.55,0);}
  else if(s.kind==='cave'){for(const side of[-1,1]){const q=add(g,new T.DodecahedronGeometry(1.25,0),rock,side*1.25,.85,0);q.scale.y=1.4;}add(g,new T.BoxGeometry(1.5,.2,1.8),dark,0,.05,0);}
  else {const marker=add(g,new T.CylinderGeometry(.52,.7,.18,10),s.kind==='gather'?leafLight:gold,0,.1,0);marker.name='interactive-'+s.kind;add(g,new T.OctahedronGeometry(.24,0),s.kind==='gather'?leafLight:purple,0,.65,0);}
  if(s.npc){const npc=new T.Group();npc.name='npc-'+s.npc.role+'-'+s.id;npc.userData.role=s.npc.role;npc.position.set((s.solid?.w||2)*.6,0,.3);g.add(npc);const bodyColor=s.npc.role==='merchant'?0xd7a553:s.npc.role==='clue'?0x4f9f82:s.npc.role==='quest'?0x8b69c9:0x6c8db1;add(npc,new T.CapsuleGeometry(.27,.38,3,8),mat(bodyColor),0,.58,0);add(npc,new T.SphereGeometry(.27,10,7),mat(0x74533f),0,1.15,0);for(const side of[-1,1]){const arm=add(npc,new T.CapsuleGeometry(.06,.22,3,6),mat(bodyColor),side*.33,.65,0);arm.rotation.z=side*.32;}const badge=add(npc,new T.CircleGeometry(.12,10),new T.MeshBasicMaterial({color:s.npc.role==='merchant'?0xffd96c:s.npc.role==='clue'?0x8fe8d0:0xd8c5ff,side:T.DoubleSide}),0,1.48,.08);badge.name='npc-role-badge';}
 };
 ring.content.forEach(renderSite);
 // Portals are landmarks, not substitutes for exploration paths.
 for(const p of ring.portals){const y=pilotGround(p.point.x+.5,p.point.y+.5),g=new T.Group();g.position.set(p.point.x+.5,y,p.point.y+.5);g.name='portal-'+p.id;root.add(g);const c=p.kind==='hidden'?0x4f9f67:p.kind==='mystic'?0x9d69db:0xe4c26e,m=mat(c);const arch=add(g,new T.TorusGeometry(.9,.15,8,28,Math.PI),m,0,.92,0);arch.rotation.z=Math.PI;for(const side of[-1,1])add(g,new T.CylinderGeometry(.13,.17,1.7,7),wood,side*.9,.78,0);const core=add(g,new T.CircleGeometry(.69,20),new T.MeshBasicMaterial({color:c,transparent:true,opacity:p.kind==='hidden'?.13:.48,side:T.DoubleSide,depthWrite:false}),0,.88,.02);core.rotation.y=Math.PI/2;}
 for(const piece of ring.rewardPieces){const y=pilotGround(piece.point.x+.5,piece.point.y+.5),q=add(root,new T.OctahedronGeometry(.36,0),purple,piece.point.x+.5,y+.7,piece.point.y+.5);q.name='relic-piece-'+piece.id;}
 // Boss core staging remains isolated from the exploration arenas.
 const boss=ring.center,by=pilotGround(boss.x,boss.y);const altar=add(root,new T.CylinderGeometry(7,7.6,.48,24),mat(0x51415f),boss.x+.5,by+.2,boss.y+.5);altar.name='boss-core-platform';for(const side of[-1,1]){const eye=add(root,new T.SphereGeometry(.22,10,6),new T.MeshBasicMaterial({color:0xff5c5c}),boss.x+.5+side*.55,by+3.1,boss.y+.8);eye.name='boss-core-eye';}
 return{update(_t:number,camera:T.Camera,player?:{x:number;y:number;depth?:number}){sky.position.copy(camera.position);const under=!!player&&(player.depth||0)>.15;if(scene.fog instanceof T.Fog){scene.fog.color.set(under?0x347b8a:0xbfe5e7);scene.fog.near=under?2:24;scene.fog.far=under?22:78;}sky.visible=!under;const s=state?.();for(const o of root.children)if(o.name.startsWith('relic-piece-'))o.visible=!s?.relics.has(o.name.slice(12));},dispose(){skyTex.dispose();scene.remove(sky);disposeTree(root);world.remove(root);}};
}
