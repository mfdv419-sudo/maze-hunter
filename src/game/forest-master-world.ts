import * as T from 'three';
import type {AdventureLayout} from './adventure-layout';
import type {AdventureState} from './adventure-state';
import {pilotGround,PILOT_WATER_LEVEL as WATER,PILOT_UNDERGROUND_WATER_LEVEL as UG_WATER} from './forest-pilot';
import {FOREST_ARENAS,FOREST_LAYERS} from './forest-world-design';
import {biomeSky} from './biome-scenery';
import {groundTexture,forestTree} from './world-art';
import type {ForestWorldSite} from './forest-rpg';

const mat=(c:number)=>new T.MeshLambertMaterial({color:c,flatShading:true});
const add=(parent:T.Object3D,g:T.BufferGeometry,m:T.Material,x:number,y:number,z:number)=>{const q=new T.Mesh(g,m);q.position.set(x,y,z);parent.add(q);return q;};
export function forestMasterWorld(scene:T.Scene,world:T.Group,l:AdventureLayout,state?:()=>AdventureState|undefined){
 const root=new T.Group(),dynamic=new T.Group();root.name='forest-grove-extreme-master';root.userData.cameraOccluder=true;world.add(root,dynamic);
 const skyTex=biomeSky('forest'),sky=new T.Mesh(new T.SphereGeometry(440,24,12),new T.MeshBasicMaterial({map:skyTex,side:T.BackSide,depthWrite:false,fog:false}));scene.add(sky);scene.background=new T.Color(0xc8e9ed);scene.fog=new T.Fog(0xc8e9ed,28,92);
 const grid=l.maze.grid,n=grid.length;
 const leafTex=groundTexture('leaf'),pathTex=groundTexture('path'),stoneTex=groundTexture('stone');
 leafTex.repeat.set(32,32);pathTex.repeat.set(24,24);stoneTex.repeat.set(12,12);
 const grass=new T.MeshLambertMaterial({color:0x72a94e,map:leafTex}),soil=new T.MeshLambertMaterial({color:0xb69158,map:pathTex}),rock=new T.MeshLambertMaterial({color:0x747d68,map:stoneTex,flatShading:true}),moss=new T.MeshLambertMaterial({color:0x638c47,map:leafTex}),wood=mat(0x7b5539),ruin=mat(0xa79d7e),purple=mat(0x8b69c9),gold=mat(0xe7c469),waterMat=new T.MeshPhongMaterial({color:0x31aeca,transparent:true,opacity:.72,depthWrite:false,shininess:110,side:T.DoubleSide});
 // Terrain visual and physics now share pilotGround(). No square walkable-tile floor exists in Extreme.
 const heightField=(ox:number,oz:number,size:number,segments:number,material:T.Material,name:string)=>{
  const geo=new T.PlaneGeometry(size,size,segments,segments);geo.rotateX(-Math.PI/2);geo.translate(ox+size/2,0,oz+size/2);
  const pos=geo.attributes.position as T.BufferAttribute;
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);pos.setY(i,pilotGround(x,z)-.035);}
  pos.needsUpdate=true;geo.computeVertexNormals();const mesh=new T.Mesh(geo,material);mesh.name=name;mesh.receiveShadow=true;root.add(mesh);return mesh;
 };
 heightField(0,0,181,120,grass,'surface-organic-heightfield');
 heightField(190,10,121,72,new T.MeshLambertMaterial({color:0x5b5747,map:stoneTex}),'underground-cave-floor');
 // Natural collision boundary: continuous tall cliff faces matching blocked navigation cells.
 // Every blocked edge adjacent to a playable cell receives visible rock; no invisible wall gaps.
 const cliffGeo=new T.CylinderGeometry(.78,1.0,1,7),cliffCapGeo=new T.CylinderGeometry(.74,.82,.18,7),cliffMatrices:T.Matrix4[]=[],capMatrices:T.Matrix4[]=[],dummy=new T.Object3D();
 for(let z=2;z<179;z++)for(let x=2;x<179;x++){
  if(grid[z]?.[x]!==1)continue;const edge=grid[z-1]?.[x]===0||grid[z+1]?.[x]===0||grid[z]?.[x-1]===0||grid[z]?.[x+1]===0;if(!edge)continue;
  const base=pilotGround(x+.5,z+.5),h=5.1+((x*17+z*23)%9)*.28;
  dummy.position.set(x+.5,base+h/2,z+.5);dummy.scale.set(1+((x+z)%3)*.08,h,1+((x*3+z)%4)*.055);dummy.rotation.y=((x*13+z*7)%11)*.07;dummy.updateMatrix();cliffMatrices.push(dummy.matrix.clone());
  dummy.position.set(x+.5,base+h+.02,z+.5);dummy.scale.set(1.03,1,1.03);dummy.updateMatrix();capMatrices.push(dummy.matrix.clone());
 }
 const cliffs=new T.InstancedMesh(cliffGeo,rock,cliffMatrices.length);cliffMatrices.forEach((m,i)=>cliffs.setMatrixAt(i,m));cliffs.name='authoritative-natural-cliff-boundary';root.add(cliffs);
 const caps=new T.InstancedMesh(cliffCapGeo,moss,capMatrices.length);capMatrices.forEach((m,i)=>caps.setMatrixAt(i,m));caps.name='moss-cliff-caps';root.add(caps);
 // Water mesh is sampled from the explicit water volume. It follows the carved terrain instead of a generic circle/rectangle.
 const waterVerts:number[]=[],waterIdx:number[]=[];let wi=0;const waterLevel=(x:number,z:number)=>{const d=Math.hypot(x-33,z-110);return d<21?-.58:null;};
 for(let z=88;z<132;z++)for(let x=11;x<56;x++){const level=waterLevel(x+.5,z+.5);if(level===null||pilotGround(x+.5,z+.5)>=level-.04)continue;waterVerts.push(x,level,z,x+1,level,z,x+1,level,z+1,x,level,z+1);waterIdx.push(wi,wi+1,wi+2,wi,wi+2,wi+3);wi+=4;}
 if(waterVerts.length){const wg=new T.BufferGeometry();wg.setAttribute('position',new T.Float32BufferAttribute(waterVerts,3));wg.setIndex(waterIdx);wg.computeVertexNormals();const w=new T.Mesh(wg,waterMat);w.name='waterfall-valley-deep-water-volume';root.add(w);}
 const ring=l.ring!;
 // Soil paths are rendered from the same authored passage graph; they are visual guidance, never collision walls.
 const ribbon=(pts:{x:number;y:number}[],width=2.4)=>{if(pts.length<2)return;const v:number[]=[],idx:number[]=[];for(let i=0;i<pts.length;i++){const p=pts[i],a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b.x-a.x,dz=b.y-a.y,len=Math.hypot(dx,dz)||1,nx=-dz/len,nz=dx/len,y=pilotGround(p.x+.5,p.y+.5)+.018;v.push(p.x+.5+nx*width/2,y,p.y+.5+nz*width/2,p.x+.5-nx*width/2,y,p.y+.5-nz*width/2);if(i){const k=i*2;idx.push(k-2,k-1,k,k-1,k+1,k);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(idx);g.computeVertexNormals();const m=new T.Mesh(g,soil);m.name='forest-natural-soil-path';root.add(m);};
 ring.passages.filter(p=>p.path.length>2&&ring.zones.find(z=>z.id===p.from)?.layer==='surface').forEach(p=>ribbon(p.path,p.kind==='trail'?2.6:1.8));

 // Waterfall Valley: upstream stream -> multi-stage falls -> deep basin -> downstream channel.
 const wf=ring.zones.find(z=>z.id==='waterfall')!.point;
 const stream=add(root,new T.BoxGeometry(7,.08,17),waterMat,wf.x+1,pilotGround(wf.x+1,wf.y-14)+.16,wf.y-14);stream.name='waterfall-upstream-stream';
 for(const [dx,dz,w,h] of [[-2,-7,5.6,3.1],[2,-3,4.4,2.3],[5,1,3.4,1.5]] as const){const top=pilotGround(wf.x+dx,wf.y+dz)+h*.42;const fall=add(root,new T.PlaneGeometry(w,h,5,4),waterMat,wf.x+dx,top,wf.y+dz);fall.name='waterfall-cascade';fall.rotation.y=.12*dx;}
 const downstream=add(root,new T.BoxGeometry(5,.07,18),waterMat,wf.x+6,-.53,wf.y+15);downstream.name='waterfall-downstream-river';downstream.rotation.y=-.12;
 // Green Cliffs: visible stepped climb and lookout decks.
 const green=ring.zones.find(z=>z.id==='green')!.point;for(let i=0;i<8;i++){const x=green.x-7+i*2,z=green.y+7-i,top=pilotGround(x,z)+i*.38;add(root,new T.BoxGeometry(2.1,.3,2),rock,x,top,z).name='green-cliff-step';}add(root,new T.BoxGeometry(8,.28,5),grass,green.x+7,pilotGround(green.x+7,green.y-5)+3.1,green.y-5).name='green-lookout';
 // Ancient Ruins: courtyard, columns and a real open gateway.
 const ruins=ring.zones.find(z=>z.id==='ruins')!.point;for(const sx of[-1,1])for(const sz of[-1,1])add(root,new T.CylinderGeometry(.45,.55,3.4,8),ruin,ruins.x+sx*6,pilotGround(ruins.x,ruins.y)+1.7,ruins.y+sz*5);add(root,new T.BoxGeometry(14,.35,10),ruin,ruins.x,pilotGround(ruins.x,ruins.y)+.15,ruins.y).name='ruins-courtyard';
 // Chasm: deep visual void plus two traversable bridges.
 const chasm=ring.zones.find(z=>z.id==='chasm')?.point;if(chasm){for(const z of[chasm.y-5,chasm.y+5]){const b=add(root,new T.BoxGeometry(11,.25,1.8),wood,chasm.x,pilotGround(chasm.x,z)+.55,z);b.name='solid-chasm-bridge';}}
 // Giant Tree: one real landmark with playable platforms.
 const giant=ring.zones.find(z=>z.id==='giant')?.point;if(giant){add(root,new T.CylinderGeometry(2.6,3.8,13,12),wood,giant.x,pilotGround(giant.x,giant.y)+6.5,giant.y);for(let i=0;i<3;i++){const a=i*2.094;add(root,new T.CylinderGeometry(4.8,4.8,.35,16),grass,giant.x+Math.sin(a)*4.5,pilotGround(giant.x,giant.y)+4+i*2.7,giant.y+Math.cos(a)*4.5).name='giant-tree-playable-platform';}}
 // Underground chambers and Floating Land receive distinct silhouettes on their own coordinate layers.
 for(const zone of ring.zones.filter(z=>z.layer==='underground')){const y=pilotGround(zone.point.x,zone.point.y);for(let i=0;i<7;i++){const a=i*Math.PI*2/7;add(root,new T.OctahedronGeometry(.45,0),purple,zone.point.x+Math.sin(a)*8,y+.7,zone.point.y+Math.cos(a)*8);}}
 const flooded=ring.zones.find(z=>z.id==='ug-flooded')?.point;if(flooded){const uw=add(root,new T.CircleGeometry(13,36),waterMat,flooded.x+.5,UG_WATER,flooded.y+.5);uw.rotation.x=-Math.PI/2;uw.name='underground-flooded-cavern-water';}
 for(const zone of ring.zones.filter(z=>z.layer==='floating')){const y=pilotGround(zone.point.x,zone.point.y);const island=add(root,new T.CylinderGeometry(zone.radius*.7,zone.radius*.45,1.4,12),rock,zone.point.x,y-.7,zone.point.y);island.name='floating-island-solid-base';add(root,new T.CylinderGeometry(zone.radius*.68,zone.radius*.68,.24,12),grass,zone.point.x,y-.08,zone.point.y);}
 // RPG world-content pass. These structures are driven by ring.content, the same data used
 // to alter navigation collision, so visible solid props cannot be walked through.
 const stallRoof=mat(0xb65f46),leaf=mat(0x4f8f54),cloth=mat(0xe2c174),dark=mat(0x4b423c);
 const renderSite=(s:ForestWorldSite)=>{const y=pilotGround(s.point.x+.5,s.point.y+.5),g=new T.Group();g.position.set(s.point.x+.5,y,s.point.y+.5);g.name='forest-site-'+s.id;g.userData.siteId=s.id;root.add(g);
  if(s.kind==='market'){for(const side of[-1,1])add(g,new T.BoxGeometry(.18,1.6,.18),wood,side*1.05,.8,-.45);add(g,new T.BoxGeometry(2.5,.16,1.55),stallRoof,0,1.65,-.1);add(g,new T.BoxGeometry(2.1,.7,.65),wood,0,.35,.25);for(let i=-1;i<=1;i++)add(g,new T.SphereGeometry(.16,7,5),i%2?gold:purple,i*.45,.82,.05);}
  else if(s.kind==='camp'){add(g,new T.CylinderGeometry(.55,.7,.14,8),dark,0,.08,0);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const log=add(g,new T.CylinderGeometry(.08,.08,1.05,6),wood,Math.sin(a)*.55,.15,Math.cos(a)*.55);log.rotation.z=Math.PI/2;log.rotation.y=a;}add(g,new T.ConeGeometry(.35,.8,8),new T.MeshBasicMaterial({color:0xffa34d,transparent:true,opacity:.8}),0,.55,0);}
  else if(s.kind==='hut'||s.kind==='treehouse'||s.kind==='tower'){const w=s.solid?.w||3,d=s.solid?.d||3,h=s.kind==='tower'?4.6:2.4;add(g,new T.BoxGeometry(w*.82,h,d*.82),s.kind==='treehouse'?wood:ruin,0,h/2,0);const roof=add(g,new T.ConeGeometry(Math.max(w,d)*.62,1,4),s.kind==='treehouse'?leaf:stallRoof,0,h+.48,0);roof.rotation.y=Math.PI/4;if(s.kind==='treehouse')for(const side of[-1,1])add(g,new T.CylinderGeometry(.18,.25,2.2,7),wood,side*w*.3,-1.1,0);}
  else if(s.kind==='shrine'){add(g,new T.CylinderGeometry(1.2,1.4,.3,8),ruin,0,.15,0);for(const side of[-1,1])add(g,new T.CylinderGeometry(.15,.2,2.1,8),ruin,side*.8,1.05,0);add(g,new T.OctahedronGeometry(.42,0),purple,0,1.55,0);}
  else if(s.kind==='cave'){for(const side of[-1,1]){const q=add(g,new T.DodecahedronGeometry(1.25,0),rock,side*1.25,.85,0);q.scale.y=1.4;}add(g,new T.BoxGeometry(1.5,.2,1.8),dark,0,.05,0);}
  else {const marker=add(g,new T.CylinderGeometry(.52,.7,.18,10),s.kind==='gather'?leaf:gold,0,.1,0);marker.name='interactive-'+s.kind;add(g,new T.OctahedronGeometry(.24,0),s.kind==='gather'?leaf:purple,0,.65,0);}
  if(s.npc){const npc=new T.Group();npc.name='npc-'+s.npc.role+'-'+s.id;npc.position.set((s.solid?.w||2)*.6,0,.3);g.add(npc);const bodyColor=s.npc.role==='merchant'?0xd7a553:s.npc.role==='clue'?0x69a98d:s.npc.role==='quest'?0x8b69c9:0x6c8db1;add(npc,new T.CylinderGeometry(.28,.34,.8,8),mat(bodyColor),0,.55,0);add(npc,new T.SphereGeometry(.27,10,7),mat(0x74533f),0,1.12,0);for(const side of[-1,1]){const arm=add(npc,new T.CylinderGeometry(.07,.09,.55,6),mat(bodyColor),side*.34,.62,0);arm.rotation.z=side*.35;}const badge=add(npc,new T.CircleGeometry(.12,10),new T.MeshBasicMaterial({color:s.npc.role==='merchant'?0xffd96c:s.npc.role==='clue'?0x8fe8d0:0xd8c5ff,side:T.DoubleSide}),0,1.47,.08);badge.name='npc-role-badge';if(s.npc.role==='merchant'){const hat=add(npc,new T.ConeGeometry(.32,.28,8),stallRoof,0,1.42,0);hat.name='merchant-hat';add(npc,new T.BoxGeometry(.34,.26,.08),gold,.34,.65,.05).name='merchant-satchel';}else if(s.npc.role==='clue'){const scroll=add(npc,new T.BoxGeometry(.42,.28,.045),cloth,.34,.72,.08);scroll.rotation.z=-.18;scroll.name='clue-scroll';}else if(s.npc.role==='quest'){add(npc,new T.OctahedronGeometry(.13,0),purple,0,1.72,0).name='quest-marker';}}
 };
 ring.content.forEach(renderSite);
 // Forest ecology pass: dense canopy on solid boundary cells plus soft understory on safe open shoulders.
 for(const z of ring.zones.filter(z=>z.layer==='surface'&&!['entrance','inner','boss'].includes(z.id))){
  for(let i=0;i<54;i++){
   const a=i*2.399+(z.point.x%7)*.13,r=z.radius*(.58+(i%5)*.085),x=z.point.x+Math.sin(a)*r,zz=z.point.y+Math.cos(a)*r,ix=Math.round(x),iz=Math.round(zz),y=pilotGround(x,zz);
   if(ring.content.some(c=>Math.hypot(c.point.x-x,c.point.y-zz)<3.3))continue;
   if(grid[iz]?.[ix]===1&&i%2===0){const tree=forestTree(i+z.point.x);tree.position.set(x,y,zz);tree.scale.setScalar(1.55+(i%4)*.18);tree.name='solid-forest-canopy-tree';root.add(tree);}
   else if(grid[iz]?.[ix]===0&&i%3===0){const b=add(root,new T.IcosahedronGeometry(.26+(i%3)*.07,0),leaf,x,y+.17,zz);b.scale.set(1.3,.42,1.05);b.name='soft-forest-undergrowth';}
  }
 }
 // Two gates + return gate per arena, exactly matching portal collision points.
 for(const p of ring.portals){const y=pilotGround(p.point.x+.5,p.point.y+.5),g=new T.Group();g.position.set(p.point.x+.5,y,p.point.y+.5);g.name='portal-'+p.id;root.add(g);const c=p.kind==='hidden'?0x58a96f:p.kind==='mystic'?0xa96cff:0xe4c26e,m=mat(c);const arch=add(g,new T.TorusGeometry(.85,.14,8,28,Math.PI),m,0,.9,0);arch.rotation.z=Math.PI;for(const side of[-1,1])add(g,new T.CylinderGeometry(.12,.16,1.6,7),wood,side*.85,.75,0);const core=add(g,new T.CircleGeometry(.68,20),new T.MeshBasicMaterial({color:c,transparent:true,opacity:p.kind==='hidden'?.18:.5,side:T.DoubleSide,depthWrite:false}),0,.85,.02);core.rotation.y=Math.PI/2;}
 for(const piece of ring.rewardPieces){const y=pilotGround(piece.point.x+.5,piece.point.y+.5);const q=add(root,new T.OctahedronGeometry(.36,0),purple,piece.point.x+.5,y+.7,piece.point.y+.5);q.name='relic-piece-'+piece.id;}
 // Boss core visual: menacing silhouette and eyes, no forced mouth gimmick.
 const boss=ring.center,altar=add(root,new T.CylinderGeometry(7,7,.45,24),mat(0x51415f),boss.x+.5,pilotGround(boss.x,boss.y)+.2,boss.y+.5);altar.name='boss-core-platform';for(const side of[-1,1]){const eye=add(root,new T.SphereGeometry(.22,10,6),new T.MeshBasicMaterial({color:0xff5c5c}),boss.x+.5+side*.55,pilotGround(boss.x,boss.y)+3.1,boss.y+.8);eye.name='boss-core-eye';}
 return{update(_t:number,camera:T.Camera,player?:{x:number;y:number;depth?:number}){sky.position.copy(camera.position);const under=!!player&&(player.depth||0)>.15;if(scene.fog instanceof T.Fog){scene.fog.color.set(under?0x347b8a:0xc8e9ed);scene.fog.near=under?2:28;scene.fog.far=under?22:92;}sky.visible=!under;const s=state?.();for(const o of root.children)if(o.name.startsWith('relic-piece-'))o.visible=!s?.relics.has(o.name.slice(12));},dispose(){skyTex.dispose();scene.remove(sky);const gs=new Set<T.BufferGeometry>(),ms=new Set<T.Material>();root.traverse(o=>{if(o instanceof T.Mesh){gs.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])ms.add(m);}});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());world.remove(root,dynamic);}};
}
