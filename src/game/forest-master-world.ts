import * as T from 'three';
import type {AdventureLayout} from './adventure-layout';
import type {AdventureState} from './adventure-state';
import {FLOATING_DECK_HEIGHT,pilotGround,PILOT_WATER_LEVEL as WATER,PILOT_UNDERGROUND_WATER_LEVEL as UG_WATER} from './forest-pilot';
import {FOREST_ARENAS,FOREST_LAYERS,layerOfPoint} from './forest-world-design';
import {groundTexture,forestTree} from './world-art';
import {forestWaterfallValley} from './forest-waterfall-valley';
import {FOREST_HORIZON,forestGroveSky,forestGrovePlanting,shadeForestFloor} from './forest-grove-art';
import {forestNpcOffset,type ForestWorldSite} from './forest-rpg';

const mat=(c:number)=>new T.MeshLambertMaterial({color:c,flatShading:true});
const add=(parent:T.Object3D,g:T.BufferGeometry,m:T.Material,x:number,y:number,z:number)=>{const q=new T.Mesh(g,m);q.position.set(x,y,z);parent.add(q);return q;};
export function forestMasterWorld(scene:T.Scene,world:T.Group,l:AdventureLayout,state?:()=>AdventureState|undefined){
 const root=new T.Group(),dynamic=new T.Group();root.name='forest-grove-extreme-master';root.userData.cameraOccluder=true;world.add(root,dynamic);
 const caveBackground=new T.Color(0x34352b),skyBackground=new T.Color(FOREST_HORIZON);
 const surfaceFog=FOREST_HORIZON;
 const sky=forestGroveSky(scene);
 const base=world.getObjectByName('adventure-world-base');
 scene.background=skyBackground;
 scene.fog=new T.Fog(surfaceFog,38,124);
 const grid=l.maze.grid;
 const ring=l.ring!;
 const wf=ring.zones.find(z=>z.id==='waterfall')!.point;
 const valley=forestWaterfallValley(root,grid,wf,ring.difficulty==='extreme');
 const leafTex=groundTexture('leaf'),pathTex=groundTexture('path'),stoneTex=groundTexture('stone');
 leafTex.repeat.set(32,32);pathTex.repeat.set(24,24);stoneTex.repeat.set(12,12);
 const grass=new T.MeshLambertMaterial({color:0x78ad4f,map:leafTex}),soil=new T.MeshLambertMaterial({color:0xa56b3f,map:pathTex}),forestSoil=new T.MeshLambertMaterial({color:0xe8c592,map:pathTex,vertexColors:true}),rock=new T.MeshLambertMaterial({color:0x6d7166,map:stoneTex,flatShading:true}),moss=new T.MeshLambertMaterial({color:0x6da447,map:leafTex}),wood=mat(0x765038),ruin=new T.MeshLambertMaterial({color:0x8f8a78,map:stoneTex,flatShading:true}),purple=mat(0x8b69c9),gold=mat(0xe7c469),waterMat=new T.MeshPhongMaterial({color:0x35b8c3,emissive:0x103c3b,transparent:true,opacity:.85,depthWrite:false,shininess:115,side:T.DoubleSide}),earthCliff=new T.MeshLambertMaterial({color:0xa06f45,map:stoneTex,flatShading:true,vertexColors:true});
 // Terrain visual and physics now share pilotGround(). No square walkable-tile floor exists in Extreme.
 const heightField=(ox:number,oz:number,size:number,segments:number,material:T.Material,name:string)=>{
  const geo=new T.PlaneGeometry(size,size,segments,segments);geo.rotateX(-Math.PI/2);geo.translate(ox+size/2,0,oz+size/2);
  const pos=geo.attributes.position as T.BufferAttribute;
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i);pos.setY(i,pilotGround(x,z)-.035);}
  pos.needsUpdate=true;geo.computeVertexNormals();const mesh=new T.Mesh(geo,material);mesh.name=name;mesh.receiveShadow=true;root.add(mesh);return mesh;
 };

 const surface=heightField(0,0,181,120,forestSoil,'surface-organic-heightfield');
 shadeForestFloor(surface.geometry,l);

 const underground=FOREST_LAYERS.underground;
 if(ring.zones.some(zone=>zone.layer==='underground')){
  heightField(underground.origin.x,underground.origin.y,underground.size,72,
   new T.MeshLambertMaterial({color:0x5b5747,map:stoneTex}),'underground-cave-floor');
 }
 // Natural collision boundary: continuous tall cliff faces matching blocked navigation cells.
 // Every blocked edge adjacent to a playable cell receives visible rock; no invisible wall gaps.
 const cliffGeo=new T.BoxGeometry(1,1,1,1,5,1);
 const cliffPositions=cliffGeo.attributes.position;
 const cliffColors=new Float32Array(cliffPositions.count*3);
 const mineralBands=[0x9c7b65,0xc8ae8b,0xac9177,0xe0c3a0,0xccb597,0xe5cda6];
 for(let i=0;i<cliffPositions.count;i++){
  const band=Math.round((cliffPositions.getY(i)+.5)*5);
  new T.Color(mineralBands[band]).toArray(cliffColors,i*3);
 }
 cliffGeo.setAttribute('color',new T.BufferAttribute(cliffColors,3));
 const cliffCapGeo=new T.BoxGeometry(1.055,.21,1.055),cliffMatrices:T.Matrix4[]=[],capMatrices:T.Matrix4[]=[],cliffTreeSeeds:{x:number;y:number;z:number;seed:number}[]=[],dummy=new T.Object3D();
 for(let z=2;z<179;z++)for(let x=2;x<179;x++){
  if(grid[z]?.[x]!==1)continue;const edge=grid[z-1]?.[x]===0||grid[z+1]?.[x]===0||grid[z]?.[x-1]===0||grid[z]?.[x+1]===0;if(!edge)continue;
  const base=pilotGround(x+.5,z+.5),h=3.6+((x*17+z*23)%5)*.34;
  if((x*7+z*11)%19===0)cliffTreeSeeds.push({x:x+.5,y:base+h+.04,z:z+.5,seed:x*997+z});
  if(valley.addCliff(x+.5,z+.5,base,h))continue;
  dummy.position.set(x+.5,base+h/2,z+.5);dummy.scale.set(1.02,h,1.02);dummy.rotation.y=0;dummy.updateMatrix();cliffMatrices.push(dummy.matrix.clone());
  dummy.position.set(x+.5,base+h+.02,z+.5);dummy.scale.set(1,1,1);dummy.updateMatrix();capMatrices.push(dummy.matrix.clone());
 }
 valley.finishCliffs();
 forestGrovePlanting(root,l,pilotGround,(x,z)=>pilotGround(x,z)+3.6+((Math.floor(x)*17+Math.floor(z)*23)%5)*.34,
  (x,z)=>Math.hypot(x-wf.x,z-wf.y)<27);
 const cliffs=new T.InstancedMesh(cliffGeo,earthCliff,cliffMatrices.length);cliffMatrices.forEach((m,i)=>cliffs.setMatrixAt(i,m));cliffs.name='authoritative-earth-cliff-boundary';root.add(cliffs);
  const caps=new T.InstancedMesh(cliffCapGeo,moss,capMatrices.length);capMatrices.forEach((m,i)=>caps.setMatrixAt(i,m));caps.name='grass-cliff-caps';root.add(caps);
 for(const t of cliffTreeSeeds.slice(0,90)){const tree=forestTree(t.seed);tree.position.set(t.x,t.y,t.z);tree.scale.setScalar(1.9+(t.seed%5)*.12);tree.name='cliff-top-canopy-tree';root.add(tree);}
 // Forest floor is soil-first, like a natural trail system. Grass is layered as soft shoulders/arena patches,
 // so the whole map never reads as one flat green carpet.
 for(const z of ring.zones.filter(z=>z.layer==='surface')){const y=pilotGround(z.point.x+.5,z.point.y+.5)+.008;for(let i=0;i<5;i++){const a=i*1.257+(z.point.x%5)*.2,r=Math.max(3.8,z.radius*(.32+.08*(i%3))),patch=add(root,new T.CircleGeometry(r,24),grass,z.point.x+.5+Math.sin(a)*r*.55,y+.002,z.point.y+.5+Math.cos(a)*r*.55);patch.rotation.x=-Math.PI/2;patch.scale.set(1.35,.72,1);patch.name='natural-grass-floor-patch';}}
 // Soil paths are rendered from the same authored passage graph; they are visual guidance, never collision walls.
 const ribbon=(pts:{x:number;y:number}[],width=2.4)=>{if(pts.length<2)return;const v:number[]=[],idx:number[]=[];for(let i=0;i<pts.length;i++){const p=pts[i],a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b.x-a.x,dz=b.y-a.y,len=Math.hypot(dx,dz)||1,nx=-dz/len,nz=dx/len,y=pilotGround(p.x+.5,p.y+.5)+.018;v.push(p.x+.5+nx*width/2,y,p.y+.5+nz*width/2,p.x+.5-nx*width/2,y,p.y+.5-nz*width/2);if(i){const k=i*2;idx.push(k-2,k-1,k,k-1,k+1,k);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(idx);g.computeVertexNormals();const m=new T.Mesh(g,soil);m.name='forest-natural-soil-path';root.add(m);};
 ring.passages.filter(p=>p.path.length>2&&ring.zones.find(z=>z.id===p.from)?.layer==='surface').forEach(p=>ribbon(p.path,p.kind==='trail'?4.4:3.2));

 // Broad dirt clearings at arena hearts keep the world from reading as one endless green carpet.
 for(const z of ring.zones.filter(z=>z.layer==='surface')){const y=pilotGround(z.point.x+.5,z.point.y+.5)+.012,disc=add(root,new T.CircleGeometry(Math.max(5,z.radius*.30),28),soil,z.point.x+.5,y,z.point.y+.5);disc.rotation.x=-Math.PI/2;disc.name='arena-soil-clearing';}
 // Submerged ancient ruins visible below the deep lake.
 for(const [dx,dz,rot] of [[-7,4,.15],[1,7,-.22],[7,4,.08]] as const){const slab=add(root,new T.BoxGeometry(4.2,.45,2.3),ruin,wf.x+dx,-1.35,wf.y+dz);slab.rotation.y=rot;slab.name='submerged-ruin-slab';for(const sx of[-1,1])add(root,new T.CylinderGeometry(.28,.36,2.4,8),ruin,wf.x+dx+sx*1.4,-.1,wf.y+dz);}
 const relief=add(root,new T.BoxGeometry(5.5,4.2,.45),ruin,wf.x-11,1.6,wf.y-2);relief.name='lake-temple-relief';for(let i=0;i<3;i++){const rune=add(root,new T.CircleGeometry(.42,12),gold,wf.x-11+i*1.35-1.35,1.8,wf.y-1.74);rune.rotation.y=Math.PI/2;}
 // Green Cliffs: proper stone stairs, lookout decks, vines and alternate climb choices.
 const green=ring.zones.find(z=>z.id==='green')!.point;for(let i=0;i<11;i++){const x=green.x-8+i*1.35,z=green.y+8-i*.8,top=pilotGround(x,z)+i*.31;add(root,new T.BoxGeometry(1.45,.32,1.55),ruin,x,top,z).name='green-stone-stair';}const lookout=add(root,new T.BoxGeometry(8,.34,5),grass,green.x+7,pilotGround(green.x+7,green.y-5)+3.1,green.y-5);lookout.name='green-lookout';for(const side of[-1,1]){const vine=add(root,new T.CylinderGeometry(.055,.075,5.2,6),moss,green.x+4+side*2.2,pilotGround(green.x,green.y)+2.5,green.y-2);vine.name='green-climb-vine';}
 // Ancient Ruins: candi-like temple court, relief wall, staircase, columns and an open gateway.
 const ruins=ring.zones.find(z=>z.id==='ruins')!.point,ry=pilotGround(ruins.x,ruins.y);for(const sx of[-1,1])for(const sz of[-1,1])add(root,new T.CylinderGeometry(.45,.55,3.4,8),ruin,ruins.x+sx*6,ry+1.7,ruins.y+sz*5);add(root,new T.BoxGeometry(14,.35,10),ruin,ruins.x,ry+.15,ruins.y).name='ruins-courtyard';
 for(let i=0;i<7;i++)add(root,new T.BoxGeometry(5.2-i*.38,.28,1.15),ruin,ruins.x+7.5,ry+.18+i*.27,ruins.y-7+i*.72).name='ruins-temple-stair';
 const gateY=ry+2.2;for(const side of[-1,1])add(root,new T.BoxGeometry(1,4.4,1.1),ruin,ruins.x+side*2.2,gateY,ruins.y-8);add(root,new T.BoxGeometry(5.5,1.05,1.2),ruin,ruins.x,ry+4.25,ruins.y-8).name='ruins-candi-gate';
 const reliefWall=add(root,new T.BoxGeometry(7,4,.55),ruin,ruins.x-8,ry+2,ruins.y-1);reliefWall.name='ruins-relief-wall';for(let i=0;i<5;i++){const r=add(root,new T.CircleGeometry(.34+(i%2)*.08,10),gold,ruins.x-8+i*.05,ry+1.2+(i%3)*.7,ruins.y-2.28+i*.72);r.rotation.y=Math.PI/2;}
 // Chasm: deep visual void plus two traversable bridges.
 const chasm=ring.zones.find(z=>z.id==='chasm')?.point;
 if(chasm){
  const planks=new T.InstancedMesh(new T.BoxGeometry(.48,.055,1.79),wood,44);
  const rails=new T.InstancedMesh(new T.BoxGeometry(.16,.12,1),wood,4);
  const posts=new T.InstancedMesh(new T.BoxGeometry(.14,.91,.14),wood,28);
  const timber=[new T.Color(0xffe0bb),new T.Color(0xe9bc91),new T.Color(0xd1ad85)];
  for(const [bridge,z] of [chasm.y-5,chasm.y+5].entries()){
   const y=pilotGround(chasm.x,z)+.55;
   add(root,new T.BoxGeometry(11,.25,1.8),wood,chasm.x,y,z).name='solid-chasm-bridge';
   for(let i=0;i<22;i++){
    dummy.position.set(chasm.x-5.25+i*.5,y+.135,z);
    dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();
    planks.setMatrixAt(bridge*22+i,dummy.matrix);
    planks.setColorAt(bridge*22+i,timber[i%timber.length]);
   }
   for(const [side,dz] of [-.84,.84].entries()){
    dummy.position.set(chasm.x,y+.95,z+dz);
    dummy.rotation.y=Math.PI/2;dummy.scale.set(1,1,11);dummy.updateMatrix();
    rails.setMatrixAt(bridge*2+side,dummy.matrix);
    for(let i=0;i<7;i++){
     dummy.position.set(chasm.x-5.35+i*1.78,y+.56,z+dz);
     dummy.rotation.y=0;dummy.scale.set(1,1,1);dummy.updateMatrix();
     posts.setMatrixAt(bridge*14+side*7+i,dummy.matrix);
    }
   }
  }
  planks.name='chasm-bridge-planks';rails.name='chasm-bridge-rails';posts.name='chasm-bridge-posts';
  root.add(planks,rails,posts);
 }
 // Giant Tree: persistent boss landmark, roughly twenty character-heights tall and readable from distant arenas.
 const giant=ring.zones.find(z=>z.id==='giant')?.point;if(giant){const gy=pilotGround(giant.x,giant.y);const trunk=add(root,new T.CylinderGeometry(4.2,6.3,28,14),wood,giant.x,gy+14,giant.y);trunk.name='giant-tree-boss-landmark';for(let i=0;i<7;i++){const a=i*Math.PI*2/7;const rootArm=add(root,new T.CylinderGeometry(.6,1.35,9,8),wood,giant.x+Math.sin(a)*4,gy+1.3,giant.y+Math.cos(a)*4);rootArm.rotation.z=Math.PI/2-.18;rootArm.rotation.y=a;rootArm.name='giant-tree-root';}for(let level=0;level<4;level++){const y=gy+9+level*5.2;for(let i=0;i<5;i++){const a=i*Math.PI*2/5+level*.45;const canopy=add(root,new T.IcosahedronGeometry(4.8-level*.35,1),moss,giant.x+Math.sin(a)*(4.5+level*.5),y,giant.y+Math.cos(a)*(4.5+level*.5));canopy.scale.set(1.4,.62,1.15);canopy.name='giant-tree-canopy';}}const core=add(root,new T.OctahedronGeometry(1.05,1),new T.MeshPhongMaterial({color:0x55e7ff,emissive:0x126b75,emissiveIntensity:1.25}),giant.x,gy+12,giant.y+3.8);core.name='giant-tree-mfeer-core';for(const ledge of l.ledges.filter(q=>q.kind==='tree'&&(q.width||0)>8)){
  const x=ledge.point.x+.5,z=ledge.point.y+.5,top=pilotGround(x,z)+ledge.height;
  add(root,new T.BoxGeometry(ledge.width!, .34,ledge.depth!),wood,x,top-.17,z).name='giant-tree-playable-platform';
 }}
 // Boss Core echoes the same colossal tree so the destination remains visually coherent.
 const bossTree=ring.zones.find(z=>z.id==='boss')?.point;if(bossTree){const by=pilotGround(bossTree.x,bossTree.y);const t=add(root,new T.CylinderGeometry(3.6,5.4,24,13),wood,bossTree.x,by+12,bossTree.y);t.name='boss-tree-awakening-trunk';for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const c=add(root,new T.IcosahedronGeometry(4.4,1),moss,bossTree.x+Math.sin(a)*3.8,by+20+Math.sin(i)*1.2,bossTree.y+Math.cos(a)*3.8);c.scale.set(1.35,.58,1.1);}}
 // Underground chambers and Floating Land receive distinct silhouettes on their own coordinate layers.
 for(const zone of ring.zones.filter(z=>z.layer==='underground')){const y=pilotGround(zone.point.x,zone.point.y);for(let i=0;i<7;i++){const a=i*Math.PI*2/7;add(root,new T.OctahedronGeometry(.45,0),purple,zone.point.x+Math.sin(a)*8,y+.7,zone.point.y+Math.cos(a)*8);}}
 const flooded=ring.zones.find(z=>z.id==='ug-flooded')?.point;if(flooded){const uw=add(root,new T.CircleGeometry(13,36),waterMat,flooded.x+.5,UG_WATER,flooded.y+.5);uw.rotation.x=-Math.PI/2;uw.name='underground-flooded-cavern-water';}
 // Cave walls and sky decks are derived from the same cell bounds as movement.
 const layerTiles=(layer:'underground'|'floating')=>{
  const {origin,size}=FOREST_LAYERS[layer];
  return Array.from({length:size*size},(_,i)=>({x:origin.x+i%size,z:origin.y+Math.floor(i/size)}));
 };
 const walkable=(x:number,z:number)=>grid[z]?.[x]===0;
 const neighbours=[[0,1],[0,-1],[1,0],[-1,0]];
 const instance=(name:string,tiles:{x:number;z:number}[],geometry:T.BufferGeometry,material:T.Material,
  pose:(x:number,z:number)=>[number,number,number])=>{
  const mesh=new T.InstancedMesh(geometry,material,tiles.length);
  mesh.name=name;
  tiles.forEach(({x,z},i)=>{
   const [height,scale,turn]=pose(x,z);
   dummy.position.set(x+.5,height,z+.5);
   dummy.scale.set(1,scale,1);
   dummy.rotation.set(0,turn,0);
   dummy.updateMatrix();
   mesh.setMatrixAt(i,dummy.matrix);
  });
  root.add(mesh);
  return mesh;
 };
 if(ring.zones.some(z=>z.layer==='underground')){
  const edges=layerTiles('underground').filter(({x,z})=>!walkable(x,z)&&neighbours.some(([dx,dz])=>walkable(x+dx,z+dz)));
  instance('cave-boundary-rock',edges,new T.BoxGeometry(1.04,1,1.04),rock,(x,z)=>{
   const h=3.2+((x*11+z*7)%5)*.31;
   return [pilotGround(x+.5,z+.5)+h/2,h,0];
  });
  const caveStone=mat(0x627872);
  const ridges=edges.filter(({x,z})=>(x+5*z)%7===0);
  instance('cave-stone-ridges',ridges,new T.CylinderGeometry(.24,.65,1,6),caveStone,(x,z)=>{
   const height=2.5+((x*13+z*7)%7)*.48;
   return [pilotGround(x+.5,z+.5)+height/2,height,((x+z)%7)*.5];
  });
  const glow=new T.MeshBasicMaterial({color:0x72d7ca});
  const crystal=new T.OctahedronGeometry(.22,0);
  edges.filter(({x,z})=>(x*3+z*5)%19===0).forEach(({x,z})=>{
   const spire=add(root,crystal,glow,x+.5,pilotGround(x+.5,z+.5)+3,z+.5);
   spire.scale.y=2.5;
   spire.name='cave-wayfinding-crystal';
  });
  const crystals=new T.MeshPhongMaterial({color:0x73efe5,emissive:0x2ca599,emissiveIntensity:.62,shininess:100});
  const crystalFoot=mat(0x476662);
  for(const zone of ring.zones.filter(z=>z.layer==='underground')){
   // Local, walkable room margins get distinct crystal beds without obstructing traversal.
   for(let i=0;i<16;i++){
    const angle=i*2.399,r=5+i*.45,x=zone.point.x+.5+Math.cos(angle)*r,z=zone.point.y+.5+Math.sin(angle)*r;
    if(!walkable(Math.floor(x),Math.floor(z)))continue;
    if(ring.content.some(site=>Math.hypot(site.point.x-x,site.point.y-z)<2.6))continue;
    const y=pilotGround(x,z);
    const base=add(root,new T.IcosahedronGeometry(.39,0),crystalFoot,x,y+.10,z);
    base.scale.set(1,.45,.8);
    for(let j=0;j<3;j++){
     const stem=add(root,crystal,crystals,x+(j-1)*.21,y+.28+j*.06,z+(j%2)*.15);
     stem.scale.set(.9,1.7+j*.65,.8);
     stem.rotation.z=(j-1)*.29;
    }
   }
  }
 }
 const skyZones=ring.zones.filter(z=>z.layer==='floating');
 if(skyZones.length){
  const skyCells=layerTiles('floating').filter(({x,z})=>walkable(x,z));
  const isIsland=({x,z}:{x:number;z:number})=>skyZones.some(zone=>Math.hypot(x+.5-zone.point.x,z+.5-zone.point.y)<zone.radius*.92);
  const island=skyCells.filter(isIsland),bridge=skyCells.filter(tile=>!isIsland(tile));
  instance('floating-island-solid-base',island,new T.BoxGeometry(1.01,1,1.01),rock,
   (x,z)=>{
    const depth=1-Math.min(...skyZones.map(zone=>Math.hypot(x+.5-zone.point.x,z+.5-zone.point.y)/zone.radius));
    const h=2.1+depth*9+((x*7+z*17)%6)*.26;
    return [FLOATING_DECK_HEIGHT-h/2-.11,h,0];
   });
  const skyGrass=new T.MeshLambertMaterial({color:0xb8c985,map:leafTex});
  const skyTrail=new T.MeshLambertMaterial({color:0xbba581,map:stoneTex});
  const trailKeys=new Set<string>();
  for(const passage of ring.passages.filter(p=>p.kind==='sky')){
   for(const p of passage.path)for(const [dx,dz] of [[0,0],...neighbours])trailKeys.add(`${p.x+dx},${p.y+dz}`);
  }
  const deckTile=new T.BoxGeometry(1.01,.12,1.01);
  const meadow=island.filter(({x,z})=>!trailKeys.has(`${x},${z}`));
  const trail=island.filter(({x,z})=>trailKeys.has(`${x},${z}`));
  const grassTiles=instance('floating-island-grass',meadow,deckTile,skyGrass,()=>[FLOATING_DECK_HEIGHT-.07,1,0]);
  const trailTiles=instance('floating-island-trail',trail,deckTile,skyTrail,()=>[FLOATING_DECK_HEIGHT-.07,1,0]);
  const tint=new T.Color();
  meadow.forEach(({x,z},i)=>grassTiles.setColorAt(i,tint.set(0xffffff).multiplyScalar(.8+.14*Math.sin(x*.27+z*.31))));
  trail.forEach(({x,z},i)=>trailTiles.setColorAt(i,tint.set(0xffffff).multiplyScalar(.82+((x*7+z*13)%9)*.022)));
  const trailStones=trail.filter(({x,z})=>(x*5+z*7)%13===0);
  instance('floating-trail-flagstones',trailStones,new T.CylinderGeometry(.34,.39,.028,7),ruin,
   (x,z)=>[FLOATING_DECK_HEIGHT+.008,1,(x+z)%4]);
  instance('floating-bridge-deck',bridge,new T.BoxGeometry(1.01,.22,1.01),wood,()=>[FLOATING_DECK_HEIGHT-.12,1,0]);
  const rim=skyCells.filter(({x,z})=>neighbours.some(([dx,dz])=>!walkable(x+dx,z+dz)));
  const edges=rim.flatMap(({x,z})=>neighbours
   .filter(([dx,dz])=>!walkable(x+dx,z+dz))
   .map(([dx,dz])=>({x:x+dx*.48,z:z+dz*.48})));
  instance('floating-lantern-rail',edges,new T.BoxGeometry(1,.12,.12),wood,
   (x,z)=>[FLOATING_DECK_HEIGHT+.45,1,Number.isInteger(x)?0:Math.PI/2]);
  instance('floating-rail-post',edges,new T.BoxGeometry(.16,.62,.16),wood,
   ()=>[FLOATING_DECK_HEIGHT+.28,1,0]);

  const lanternSites=edges.filter(({x,z},i)=>i%9===0&&Math.floor(x+z)%2===0);
  const lanternGlass=new T.MeshBasicMaterial({color:0xffd486});
  instance('floating-rail-lanterns',lanternSites,new T.OctahedronGeometry(.13,0),lanternGlass,
   (_,z)=>[FLOATING_DECK_HEIGHT+.76,1.35,z]);
  instance('floating-rail-lantern-caps',lanternSites,new T.ConeGeometry(.18,.13,4),wood,
   ()=>[FLOATING_DECK_HEIGHT+.99,1,Math.PI/4]);

  const shade=mat(0x5c7147),leafBud=mat(0xe2c57a),spireRock=mat(0x8e8d70);
  const smallStone=new T.IcosahedronGeometry(.3,0),flowerBud=new T.IcosahedronGeometry(.09,0);
  for(const zone of skyZones){
   for(let i=0;i<27;i++){
    const angle=2.399*i,r=zone.radius*(.44+(i%4)*.12);
    const x=zone.point.x+.5+Math.cos(angle)*r,z=zone.point.y+.5+Math.sin(angle)*r;
    const cx=Math.floor(x),cz=Math.floor(z);
    if(!walkable(cx,cz)||ring.content.some(site=>Math.hypot(site.point.x-x,site.point.y-z)<2.3)||
      ring.portals.some(portal=>Math.hypot(portal.point.x-x,portal.point.y-z)<2.1))continue;
    const y=FLOATING_DECK_HEIGHT;
    add(root,smallStone,i%3===0?spireRock:shade,x,y+.12,z).scale.set(1.15,.43,.88);
    for(let bud=0;bud<3;bud++){
     const dx=(bud-1)*.17;
     add(root,flowerBud,leafBud,x+dx,y+.24+.055*(bud%2),z-.06).scale.y=.74;
    }
   }
  }
  // A grove around each of the inhabited islands breaks up the horizon and
  // gives the bridge landings a silhouette with visible depth.
  const rimRock=new T.IcosahedronGeometry(1,0);
  const cloudMaterial=new T.MeshLambertMaterial({color:0xe1f1ee,flatShading:true});
  const landmarkCanopy=new T.IcosahedronGeometry(1,1);
  for(const [index,zone] of skyZones.entries()){
   const y=FLOATING_DECK_HEIGHT;
   for(let i=0;i<7;i++){
    const a=i*2.399+index*.9;
    const distance=zone.radius+3+(i%3);
    const x=zone.point.x+.5+Math.cos(a)*distance,z=zone.point.y+.5+Math.sin(a)*distance;
    if(walkable(Math.floor(x),Math.floor(z)))continue;
    const pinnacle=add(root,rimRock,spireRock,x,y-2,z);
    pinnacle.scale.set(1.8+(i%3)*.48,3.4+(i%2)*.9,1.5+(i%4)*.28);
    pinnacle.rotation.y=a;
    const crown=add(root,landmarkCanopy,i%2?moss:grass,x,y+1.1,z);
    crown.scale.set(1.45,.58,1.3);
    crown.name='floating-canopy-landmark';
    if(i%2===0){
     const tree=forestTree(index*37+i);
     tree.position.set(x,y+1.1,z);
     tree.scale.setScalar(1.35+(i%3)*.18);
     root.add(tree);
    }
   }
   for(let i=0;i<5;i++){
    const a=1.45+i*1.27+index*.7, distance=zone.radius+10+i*2;
    const x=zone.point.x+.5+Math.cos(a)*distance,z=zone.point.y+.5+Math.sin(a)*distance;
    for(let puff=0;puff<4;puff++){
     const cloud=add(root,landmarkCanopy,cloudMaterial,x+puff*2.1,y-5+i*.5,z+Math.sin(puff)*1.2);
     cloud.scale.set(3.35,1.05+.24*(puff%2),2.4);
    }
   }
  }
 }
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
  if(s.reward&&!s.npc){const itemMat=s.reward.includes('crystal')||s.reward.includes('shard')?new T.MeshPhongMaterial({color:0x55d8ff,emissive:0x126b75,emissiveIntensity:.9}):s.reward.includes('coin')?gold:s.reward.includes('fiber')||s.reward.includes('herb')?leaf:purple;const pickup=add(g,new T.OctahedronGeometry(.26,0),itemMat,0,.65,0);pickup.name='site-pickup-'+s.id;pickup.userData.siteId=s.id;}
  if(s.npc){const npc=new T.Group();npc.name='npc-'+s.npc.role+'-'+s.id;const no=forestNpcOffset(s);npc.position.set(no.x,0,no.y);g.add(npc);
   // Readable woodland NPC: one coherent low-poly animal character, never capsule/sphere placeholders.
   const role=s.npc.role,fur=mat(role==='merchant'?0x9b6a43:role==='clue'?0x6d5a46:role==='quest'?0x705b7d:0x6a6658),cream=mat(0xe8d6b5),outfit=mat(role==='merchant'?0x3d7f74:role==='clue'?0x4f6f8d:role==='quest'?0x765a9a:0x7f6b4f),darkNpc=mat(0x29343a),pink=mat(0xd98f88);
   const torso=add(npc,new T.SphereGeometry(1,10,7),fur,0,.62,0);torso.scale.set(.34,.48,.28);torso.name='npc-torso';
   const belly=add(npc,new T.SphereGeometry(1,10,7),cream,0,.59,.245);belly.scale.set(.22,.30,.045);belly.name='npc-belly';
   const head=add(npc,new T.SphereGeometry(1,12,8),fur,0,1.15,.015);head.scale.set(.31,.29,.28);head.name='npc-head';
   const muzzle=add(npc,new T.SphereGeometry(1,10,7),cream,0,1.08,.255);muzzle.scale.set(.17,.11,.09);muzzle.name='npc-muzzle';
   add(npc,new T.SphereGeometry(.055,8,6),darkNpc,0,1.10,.345).name='npc-nose';
   for(const side of[-1,1]){const ear=add(npc,new T.ConeGeometry(.11,.25,7),fur,side*.20,1.39,0);ear.rotation.z=-side*.16;const inner=add(npc,new T.ConeGeometry(.055,.13,6),pink,side*.20,1.405,.015);inner.rotation.z=-side*.16;add(npc,new T.SphereGeometry(.045,8,6),darkNpc,side*.105,1.20,.278).name='npc-eye';
    const arm=add(npc,new T.CapsuleGeometry(.055,.25,3,6),outfit,side*.31,.70,.02);arm.rotation.z=-side*.30;const paw=add(npc,new T.SphereGeometry(1,8,6),fur,side*.39,.55,.05);paw.scale.set(.09,.07,.09);paw.name='npc-paw';
    const leg=add(npc,new T.CapsuleGeometry(.065,.20,3,6),fur,side*.14,.22,0);const foot=add(npc,new T.SphereGeometry(1,8,6),darkNpc,side*.14,.07,.08);foot.scale.set(.11,.06,.16);}
   const vest=add(npc,new T.BoxGeometry(.48,.42,.12),outfit,0,.70,.24);vest.name='npc-role-outfit';
   const tail=add(npc,new T.TorusGeometry(.34,.06,7,20,Math.PI*1.35),fur,-.20,.48,-.18);tail.rotation.x=Math.PI/2;tail.name='npc-tail';
   if(role==='merchant'){const hat=add(npc,new T.CylinderGeometry(.28,.34,.10,10),stallRoof,0,1.44,0);add(npc,new T.ConeGeometry(.25,.22,9),stallRoof,0,1.56,0);add(npc,new T.BoxGeometry(.23,.28,.08),gold,.30,.65,.15).name='merchant-satchel';}
   if(role==='clue'){const scroll=add(npc,new T.BoxGeometry(.34,.24,.04),cloth,.28,.66,.20);scroll.rotation.z=-.20;scroll.name='clue-scroll';add(npc,new T.OctahedronGeometry(.10,0),new T.MeshBasicMaterial({color:0x8fe8d0}),0,1.62,0).name='clue-marker';}
   if(role==='quest')add(npc,new T.OctahedronGeometry(.13,0),purple,0,1.62,0).name='quest-marker';
   if(role==='rest')add(npc,new T.SphereGeometry(.10,8,6),new T.MeshBasicMaterial({color:0xffd96c}),0,1.62,0).name='rest-marker';
   npc.userData.collisionRadius=.44;npc.userData.role=role;
  }
 };
 ring.content.forEach(renderSite);
 // Forest ecology pass: dense canopy on solid boundary cells plus soft understory on safe open shoulders.
 for(const z of ring.zones.filter(z=>z.layer==='surface'&&!['entrance','inner','boss'].includes(z.id))){
  for(let i=0;i<92;i++){
   const a=i*2.399+(z.point.x%7)*.13,r=z.radius*(.58+(i%5)*.085),x=z.point.x+Math.sin(a)*r,zz=z.point.y+Math.cos(a)*r,ix=Math.round(x),iz=Math.round(zz),y=pilotGround(x,zz);
   if(ring.content.some(c=>Math.hypot(c.point.x-x,c.point.y-zz)<3.3))continue;
   if(grid[iz]?.[ix]===1&&i%2===0){const tree=forestTree(i+z.point.x);tree.position.set(x,y,zz);tree.scale.setScalar(1.75+(i%5)*.18);tree.name='solid-forest-canopy-tree';root.add(tree);}
   else if(grid[iz]?.[ix]===0&&i%3===0){const b=add(root,new T.IcosahedronGeometry(.26+(i%3)*.07,0),leaf,x,y+.17,zz);b.scale.set(1.3,.42,1.05);b.name='soft-forest-undergrowth';}
  }
 }
 // High canopy fills the solid ridges with varied silhouettes while keeping trails clear.
 const ridgeTrees:{x:number;z:number;seed:number}[]=[];
 for(let z=3;z<178;z+=2)for(let x=3;x<178;x+=2){
  const seed=(x*47+z*53+x*z*17)%127;
  const shoreDistance=Math.hypot(x-wf.x,z-wf.y);
  if(shoreDistance<20||seed>=(shoreDistance<34?52:17))continue;
  if(![-2,-1,0,1,2].every(d=>grid[z+d]?.[x]===1&&grid[z]?.[x+d]===1))continue;
  ridgeTrees.push({x:x+.5,z:z+.5,seed});
 }
 const canopy=new T.InstancedMesh(new T.IcosahedronGeometry(1,1),mat(0xffffff),ridgeTrees.length*3);
 const trunks=new T.InstancedMesh(new T.CylinderGeometry(.095,.22,1,7),wood,ridgeTrees.length);
 const canopyColors=[0x416844,0x587944,0x759447,0x336650,0x486e3b].map(color=>new T.Color(color));
 for(const [i,{x,z,seed}] of ridgeTrees.entries()){
  const h=3.3+(seed%8)*.43;
  const y=pilotGround(x,z);
  dummy.rotation.set(0,seed,0);
  dummy.position.set(x,y+h*.36,z);dummy.scale.set(1,h*.72,1);dummy.updateMatrix();
  trunks.setMatrixAt(i,dummy.matrix);
  for(let layer=0;layer<3;layer++){
   const radius=1.05-layer*.23+(seed%4)*.12;
   dummy.position.set(x+Math.sin(seed+layer)*.25,y+h*(.65+layer*.12),z+Math.cos(seed+layer)*.25);
   dummy.scale.set(radius,radius*.93,radius);dummy.updateMatrix();
   canopy.setMatrixAt(i*3+layer,dummy.matrix);
   canopy.setColorAt(i*3+layer,canopyColors[(seed+layer)%canopyColors.length]);
  }
 }
 canopy.name='forest-high-canopy';trunks.name='forest-ridge-trunks';
 root.add(trunks,canopy);
 // Portal silhouette communicates the destination layer before travel.
 const portalColor={surface:0x86bf8a,underground:0x68d4c8,floating:0xb6a2ff};
 const portalPost=new T.CylinderGeometry(.15,.25,1.7,7);
 const portalArch=new T.TorusGeometry(.86,.15,8,24,Math.PI);
 const portalFloor=new T.CylinderGeometry(.83,1,.14,11);
 const portalField=new T.CircleGeometry(.68,20);
 for(const portal of ring.portals){
  const {x,y:z}=portal.point,ground=pilotGround(x+.5,z+.5),group=new T.Group();
  group.position.set(x+.5,ground,z+.5);
  group.name='portal-'+portal.id;
  const arena=FOREST_ARENAS[portal.arena];
  const current=ring.zones.find(zone=>zone.id===arena.id)?.point;
  if(current)group.rotation.y=Math.atan2(current.x-x,current.y-z);
  root.add(group);
  const color=portal.kind==='return'?0xe4c26e:portalColor[FOREST_ARENAS[portal.destination].layer];
  const trim=mat(color);
  add(group,portalArch,trim,0,1.67,0);
  for(const side of[-1,1])add(group,portalPost,wood,side*.86,.85,0);
  add(group,portalFloor,trim,0,.05,0);
  const field=new T.MeshBasicMaterial({color,transparent:true,opacity:portal.kind==='hidden'?.27:.54,side:T.DoubleSide,depthWrite:false});
  add(group,portalField,field,0,1.04,.02);
 }
 for(const piece of ring.rewardPieces){const y=pilotGround(piece.point.x+.5,piece.point.y+.5);const q=add(root,new T.OctahedronGeometry(.36,0),purple,piece.point.x+.5,y+.7,piece.point.y+.5);q.name='relic-piece-'+piece.id;}
 // Boss core visual: menacing silhouette and eyes, no forced mouth gimmick.
 const boss=ring.center,altar=add(root,new T.CylinderGeometry(7,7,.45,24),mat(0x51415f),boss.x+.5,pilotGround(boss.x,boss.y)+.2,boss.y+.5);altar.name='boss-core-platform';for(const side of[-1,1]){const eye=add(root,new T.SphereGeometry(.22,10,6),new T.MeshBasicMaterial({color:0xff5c5c}),boss.x+.5+side*.55,pilotGround(boss.x,boss.y)+3.1,boss.y+.8);eye.name='boss-core-eye';}
 const collectibles:T.Object3D[]=[];
 root.traverse(o=>{if(o.name.startsWith('relic-piece-')||o.name.startsWith('site-pickup-'))collectibles.push(o);});
 return{update(time:number,camera:T.Camera,player?:{x:number;y:number;depth?:number}){valley.update(time);const under=!!player&&(player.depth||0)>.15;const cave=!!player&&layerOfPoint(player)==='underground';if(scene.fog instanceof T.Fog){scene.fog.color.set(under?0x347b8a:cave?0x34352b:surfaceFog);scene.fog.near=under?2:cave?12:38;scene.fog.far=under?22:cave?35:124;}scene.background=cave?caveBackground:skyBackground;sky.update(camera,!under&&!cave);
 if(base)base.visible=!player||layerOfPoint(player)!=='floating';
 const s=state?.();for(const o of collectibles){
  if(o.name.startsWith('relic-piece-'))o.visible=!s?.relics.has(o.name.slice(12));
  else o.visible=!s?.worldClaims.has(o.name.slice(12));
 }},dispose(){sky.dispose();const gs=new Set<T.BufferGeometry>(),ms=new Set<T.Material>();root.traverse(o=>{if(o instanceof T.Mesh){gs.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])ms.add(m);if(o instanceof T.InstancedMesh)o.dispose();}});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());leafTex.dispose();pathTex.dispose();stoneTex.dispose();world.remove(root,dynamic);}};
}
