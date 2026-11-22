import * as T from 'three';
import type {AdventureLayout} from './adventure-layout';
import {forestCascade} from './forest-waterfall-valley';

export const FOREST_HORIZON = 0xc2d8bc;
export const FOREST_STONE = [0x97745a,0xb18d6c,0xad8868,0xc39b75,0xb29474,0xb79b77];
const LEAVES = [0x315c43,0x507c49,0x72964f,0x376f58,0x8a9f4f];
const directions = [[1,0],[-1,0],[0,1],[0,-1]] as const;
const hash = (x:number,z:number) => ((Math.imul(x,374761393)^Math.imul(z,668265263))>>>0)%997;
type Height = (x:number,z:number)=>number;

export function forestGroveSky(scene:T.Scene) {
 const canvas=document.createElement('canvas');
 canvas.width=1024;canvas.height=512;
 const paint=canvas.getContext('2d')!;
 const skyGradient=paint.createLinearGradient(0,0,0,512);
 skyGradient.addColorStop(0,'#467994');
 skyGradient.addColorStop(.38,'#9dc1c3');
 skyGradient.addColorStop(.55,'#ecdab1');
 skyGradient.addColorStop(.70,'#c2d7c4');
 skyGradient.addColorStop(1,'#b7cdbe');
 paint.fillStyle=skyGradient;
 paint.fillRect(0,0,1024,512);
 for(let i=0;i<30;i++){
  const x=i*113%1024,y=171+i*29%76;
  paint.fillStyle=i%3?'#fff0d347':'#eff0dd60';
  for(const offset of [-1024,0,1024]){
   paint.beginPath();
   paint.ellipse(x+offset,y,21+i%5*12,2+i%3*2,0,0,Math.PI*2);
   paint.fill();
  }
 }
 const texture=new T.CanvasTexture(canvas);
 texture.colorSpace=T.SRGBColorSpace;
 const root=new T.Group();
 root.name='forest-grove-sky';
 const sky=new T.Mesh(new T.SphereGeometry(138,32,16),
  new T.MeshBasicMaterial({map:texture,side:T.BackSide,depthWrite:false,fog:false}));
 sky.renderOrder=-1;
 root.add(sky);
 const ridge=new T.IcosahedronGeometry(1,0);
 [0xc2c6a3,0xa6b79a,0x859f88].forEach((color,layer)=>{
  const material=new T.MeshBasicMaterial({color,fog:false});
  for(let i=0;i<11;i++){
   const angle=i*Math.PI*2/11+layer*.26;
   const silhouette=new T.Mesh(ridge,material);
   silhouette.position.set(Math.sin(angle)*(122-layer*10),-22+layer*2,Math.cos(angle)*(122-layer*10));
   silhouette.rotation.y=angle;
   silhouette.scale.set(29+i%3*11,31+i%4*5-layer*6,14);
   root.add(silhouette);
  }
 });
 scene.add(root);
 return {
  update(camera:T.Camera, visible=true){
   root.visible=visible;
   root.position.set(camera.position.x,0,camera.position.z);
   sky.position.y=camera.position.y;
  },
  dispose(){
   const materials=new Set<T.Material>();
   root.traverse(object=>{if(object instanceof T.Mesh)materials.add(object.material as T.Material);});
   materials.forEach(material=>material.dispose());
   texture.dispose();
   sky.geometry.dispose();
   ridge.dispose();
   root.removeFromParent();
  },
 };
}

export function shadeForestFloor(terrain:T.BufferGeometry, layout:AdventureLayout){
 const position=terrain.attributes.position;
 const tints=new Float32Array(position.count*3);
 const grid=layout.maze.grid,soil=new T.Color(0xc5a477),groundCover=new T.Color(0x759258);
 const tint=new T.Color();
 for(let i=0;i<position.count;i++){
  const x=position.getX(i),z=position.getZ(i);
  let rockSides=0;
  for(const ox of [-.55,.55])for(const oz of [-.55,.55])
   if(grid[Math.floor(z+oz)]?.[Math.floor(x+ox)]===1)rockSides++;
  const patches=(Math.sin(x*.52-z*.22)+Math.sin(z*.59+x*.18)+2)*.135;
  tint.copy(soil).lerp(groundCover,Math.min(.96,rockSides*.18+patches+.08));
  tint.multiplyScalar(.91+hash(Math.floor(x),Math.floor(z))*.00015).toArray(tints,i*3);
 }
 terrain.setAttribute('color',new T.BufferAttribute(tints,3));
}

type Plant = {x:number;y:number;z:number;sx:number;sy:number;sz:number;angle:number;color:number};

export function forestGrovePlanting(parent:T.Group,layout:AdventureLayout,ground:Height,cap:Height,
 excluded:(x:number,z:number)=>boolean=()=>false){
 const root=new T.Group();
 root.name='forest-grove-planting';
 parent.add(root);
 const grid=layout.maze.grid,limit=layout.ring?179:grid.length-1;
 const crowns:Plant[]=[],trunks:Plant[]=[],ferns:Plant[]=[],moss:Plant[]=[];
 const lodge=layout.ring?undefined:layout.forest?.cabin;
 const plant=(list:Plant[],x:number,y:number,z:number,sx:number,sy:number,sz:number,angle:number,color:number)=>
  list.push({x,y,z,sx,sy,sz,angle,color});
 for(let z=1;z<limit;z++)for(let x=1;x<limit;x++){
  if(grid[z]?.[x]!==1||excluded(x+.5,z+.5)||lodge&&Math.max(Math.abs(x-lodge.x),Math.abs(z-lodge.y))<=2)continue;
  const exposed=directions.filter(([dx,dz])=>grid[z+dz]?.[x+dx]===0);
  if(!exposed.length)continue;
  const seed=hash(x,z),xx=x+.5,zz=z+.5;
  if(seed%21===0){
   const feet=cap(xx,zz),height=1.6+(seed%8)*.37;
   plant(trunks,xx,feet+height*.47,zz,.25+(seed%3)*.025,height,.24,seed,0x73543b);
   for(let branch=0;branch<4;branch++){
    const angle=seed*.48+branch*2.399;
    const breadth=.74+height*.23+(branch%2)*.24;
    plant(crowns,xx+Math.cos(angle)*.46,feet+height+branch*.27,zz+Math.sin(angle)*.46,
     breadth,breadth*(.56+branch*.043),breadth*.88,angle,LEAVES[(seed+branch)%LEAVES.length]);
   }
  }
  if(seed%6===0)plant(moss,xx,cap(xx,zz)+.02,zz,.53+(seed%4)*.06,.14,.48,seed,LEAVES[seed%LEAVES.length]);
  if(seed%7>2)continue;
  const [dx,dz]=exposed[seed%exposed.length];
  const px=xx+dx*.56,pz=zz+dz*.56,py=ground(px,pz);
  if(layout.ring&&py<-.4)continue;
  for(let blade=0;blade<5;blade++){
   const size=.23+(seed%4)*.054;
   plant(ferns,px,py,pz,size,size*1.4,size,blade*1.27+seed,LEAVES[(seed+blade)%LEAVES.length]);
  }
 }
 const crownGeo=new T.IcosahedronGeometry(1,0);
 const barkGeo=new T.CylinderGeometry(.54,1,1,7);
 const frond=new T.BufferGeometry();
 frond.setAttribute('position',new T.Float32BufferAttribute([0,0,0,.38,.31,-.14,.53,.42,0,.41,.27,.16,1,.21,0],3));
 frond.setIndex([0,2,1,0,3,2,1,2,4,2,3,4]);
 frond.computeVertexNormals();
 const finish=(name:string,geometry:T.BufferGeometry,items:Plant[],foliage=false)=>{
  const material=new T.MeshLambertMaterial({flatShading:true,side:foliage?T.DoubleSide:T.FrontSide});
  const batch=new T.InstancedMesh(geometry,material,items.length);
  const pose=new T.Object3D(),tint=new T.Color();
  items.forEach(({x,y,z,sx,sy,sz,angle,color},i)=>{
   pose.position.set(x,y,z);pose.scale.set(sx,sy,sz);pose.rotation.y=angle;pose.updateMatrix();
   batch.setMatrixAt(i,pose.matrix);
   batch.setColorAt(i,tint.setHex(color));
  });
  batch.name=name;
  // Canopy and ground cover are soft scenery attached to the existing solid boundary.
  batch.raycast=()=>{};
  root.add(batch);
 };
 finish('forest-grove-timber-trunks',barkGeo,trunks);
 finish('forest-grove-layered-canopy',crownGeo,crowns);
 finish('forest-grove-cliff-moss',crownGeo,moss);
 finish('forest-grove-trail-ferns',frond,ferns,true);
}

export function forestGroveSpring(parent:T.Group,layout:AdventureLayout,ground:Height,cap:Height){
 const grid=layout.maze.grid;
 const cave=layout.forest!.cave;
 const cabin=layout.forest!.cabin;
 const protectedSites=[...layout.seals,...layout.stars,...layout.chests];
 let site:{x:number;z:number;dx:number;dz:number;score:number}|undefined;
 for(let z=Math.max(1,cave.y-11);z<Math.min(grid.length-1,cave.y+12);z++){
  for(let x=Math.max(1,cave.x-11);x<Math.min(grid.length-1,cave.x+12);x++){
   if(grid[z]?.[x]!==1||Math.hypot(x-cabin.x,z-cabin.y)<5)continue;
   for(const [dx,dz] of directions){
    if(grid[z+dz]?.[x+dx]!==0||grid[z+dz*2]?.[x+dx*2]!==0)continue;
    if(![-1,1].every(i=>grid[z+dx*i]?.[x-dz*i]===1&&grid[z+dz+dx*i]?.[x+dx-dz*i]===0))continue;
    if(protectedSites.some(p=>Math.hypot(x+dx-p.x,z+dz-p.y)<2))continue;
    const score=Math.hypot(x-cave.x,z-cave.y);
    if(!site||score<site.score)site={x,z,dx,dz,score};
   }
  }
 }
 if(!site)return;
 const {x,z,dx,dz}=site;
 const px=x+.5+dx*.525,pz=z+.5+dz*.525;
 const base=ground(px,pz),height=cap(px,pz)-base;
 const root=new T.Group();
 root.name='forest-grove-spring';
 root.position.set(px,base,pz);
 root.rotation.y=Math.atan2(dx,dz);
 parent.add(root);
 const time={value:0};
 const flow=forestCascade([
  [0,height+.09,-.34,1.72],[0,height+.08,.01,1.72],[.06,height*.89,.09,1.55],
  [.07,height*.51,.10,1.52],[.15,height*.48,.23,1.83],[.13,height*.08,.24,1.8],
  [.08,.035,.53,2.1],
 ],time);
 root.add(flow);
 const rockGeo=new T.IcosahedronGeometry(1,0);
 const stone=new T.MeshLambertMaterial({color:0xa68662,flatShading:true});
 const moss=new T.MeshLambertMaterial({color:0x6c884f,flatShading:true});
 for(const side of [-1,1]){
  const shoulder=new T.Mesh(rockGeo,stone);
  shoulder.position.set(side*.93,height*.48,-.06);
  shoulder.scale.set(.37,.28,.32);
  root.add(shoulder);
  const foothold=new T.Mesh(rockGeo,moss);
  foothold.position.set(side*.88,.022,.25);
  foothold.scale.set(.29,.07,.25);
  root.add(foothold);
 }
 const basin=new T.Mesh(new T.CircleGeometry(1,32),
  new T.MeshBasicMaterial({color:0x45877b,opacity:.72,transparent:true,depthWrite:false}));
 basin.rotation.x=-Math.PI/2;
 basin.position.set(.05,.025,.25);
 basin.scale.set(1.15,.39,1);
 basin.raycast=()=>{};
 root.add(basin);
 const ripple=new T.Mesh(new T.RingGeometry(.88,1,30),
  new T.MeshBasicMaterial({color:0xc8e9d3,opacity:.42,transparent:true,depthWrite:false}));
 ripple.rotation.x=-Math.PI/2;
 ripple.position.set(.04,.032,.31);
 ripple.raycast=()=>{};
 root.add(ripple);
 return {update(seconds:number){
  time.value=seconds;
  const wave=(seconds*.55)%1;
  ripple.scale.set(.62+wave*.48,.18+wave*.21,1);
  ripple.material.opacity=(1-wave)*.45;
 }};
}
