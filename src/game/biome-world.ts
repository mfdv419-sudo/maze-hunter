import {biomeScenery,biomeSky} from './biome-scenery';
import {gorgeWorld} from './gorge-world';
import * as T from 'three';
import {areaThemes,type AdventureArea} from './areas';
import type {AdventureLayout} from './adventure-layout';
import {biomeElevation} from './biome-layout';
import {forestTree,groundTexture} from './world-art';
import {batchStatic} from './static-model';
export function biomeWorld(scene:T.Scene,world:T.Group,layout:AdventureLayout,area:AdventureArea){
 if(area==='gorge')return gorgeWorld(scene,world,layout);
 const theme=areaThemes[area],n=layout.maze.grid.length,props=new T.Group(),stone=new T.MeshLambertMaterial({color:theme.wall,map:groundTexture('stone')}),wood=new T.MeshLambertMaterial({color:0x987652}),leaf=new T.MeshLambertMaterial({color:area==='coast'?0x70ab70:0x507d62});
 const skyTexture=biomeSky(area),sky=new T.Mesh(new T.SphereGeometry(120,24,12),new T.MeshBasicMaterial({map:skyTexture,side:T.BackSide,depthWrite:false,fog:false}));scene.add(sky);const scenery=biomeScenery(scene,world,layout,area);
 const terrain=new T.PlaneGeometry(n,n,n,n);terrain.rotateX(-Math.PI/2);const pos=terrain.attributes.position,uv=terrain.attributes.uv;for(let i=0;i<pos.count;i++){const x=pos.getX(i)+n/2,z=pos.getZ(i)+n/2;pos.setXYZ(i,x,biomeElevation(area,x,z,layout)-.035,z);uv.setXY(i,x,z);}terrain.computeVertexNormals();world.add(new T.Mesh(terrain,new T.MeshLambertMaterial({color:theme.floor,map:groundTexture(area==='forest'?'path':'stone')})));
 const add=(geo:T.BufferGeometry,mat:T.Material,x:number,y:number,z:number,parent:T.Group=props)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;};
 const reefs:T.Mesh[]=[];
 for(let i=0;i<65;i++){const x=3+(i*37%(n-6)),z=3+(i*61%(n-6));if(layout.maze.grid[z]?.[x]!==1)continue;const base=biomeElevation(area,x+.5,z+.5,layout)+(area==='mountain'?2.8:2.05);
  if(area==='forest'){const tree=forestTree(i);tree.position.set(x+.5,base,z+.5);tree.scale.set(2.5,3.3,2.5);props.add(tree);}
  else if(area==='desert'){add(new T.CapsuleGeometry(.14,1.35,3,7),leaf,x+.5,base+1.1,z+.5);for(const side of[-1,1]){const arm=add(new T.CylinderGeometry(.095,.1,.55,6),leaf,x+.5+side*.22,base+1.05,z+.5);arm.rotation.z=side*.8;}add(new T.DodecahedronGeometry(.45),stone,x+.8,base+.2,z+.7);}
  else if(area==='coast'){add(new T.CylinderGeometry(.06,.13,3,7),wood,x+.5,base+1.5,z+.5);for(let j=0;j<6;j++){const a=j*Math.PI/3,frond=add(new T.ConeGeometry(.3,1.65,4),leaf,x+.5+Math.sin(a)*.6,base+3,z+.5+Math.cos(a)*.6);frond.rotation.set(Math.cos(a)*1.2,0,Math.sin(a)*1.2);}}
  else if(area==='sea'){const coral=new T.MeshLambertMaterial({color:[0xde9daf,0xe2c384,0x8ed3cf][i%3]});for(let j=0;j<3;j++){const m=add(new T.CapsuleGeometry(.1,.6+j*.2,3,6),coral,x+.3+j*.16,base+.7,z+.5);m.rotation.z=(j-1)*.45;}}
  else {const rock=add(new T.DodecahedronGeometry(.8,0),stone,x+.5,base+1.1,z+.5);rock.scale.set(1.1,1.8,1);if(area==='mountain')add(new T.ConeGeometry(.8,.45,5),new T.MeshLambertMaterial({color:0xe9f4e9}),x+.5,base+2.3,z+.5);}
 }
 // Trail-side silhouettes are visible at ground level and share the state's round colliders.
 for(const p of layout.forest!.trunks){const x=p.x+.5,z=p.y+.5,h=biomeElevation(area,x,z,layout);
  if(area==='forest'){const tree=forestTree(p.x);tree.position.set(x,h,z);tree.scale.set(2,2.5,2);props.add(tree);}
  else if(area==='desert'){add(new T.CapsuleGeometry(.13,1.45,3,8),new T.MeshLambertMaterial({color:0x6e9969}),x,h+.9,z);for(const side of[-1,1]){const b=add(new T.CylinderGeometry(.08,.09,.42,6),leaf,x+side*.2,h+1,z);b.rotation.z=side*.8;}}
  else if(area==='coast'){add(new T.CylinderGeometry(.08,.15,2.6,8),wood,x,h+1.3,z);for(let i=0;i<5;i++){const a=i*1.256,frond=add(new T.ConeGeometry(.23,1.3,4),leaf,x+Math.sin(a)*.4,h+2.65,z+Math.cos(a)*.4);frond.rotation.set(Math.cos(a)*1.1,0,Math.sin(a)*1.1);}}
  else if(area==='sea'){for(let j=0;j<3;j++){const q=add(new T.CapsuleGeometry(.07,.45+j*.13,3,6),new T.MeshLambertMaterial({color:j%2?0xe1a7b7:0xe3c684}),x+(j-1)*.12,h+.4,z);q.rotation.z=(j-1)*.4;}}
  else if(area==='mountain'){add(new T.CylinderGeometry(.05,.09,1.3,6),wood,x,h+.65,z);add(new T.ConeGeometry(.35,1.2,7),leaf,x,h+1.1,z);add(new T.ConeGeometry(.27,.65,7),new T.MeshLambertMaterial({color:0xe6efdf}),x,h+1.5,z);}
  else add(new T.DodecahedronGeometry(.32),stone,x,h+.35,z).scale.y=1.8;
 }
 for(const p of layout.forest!.pillars){add(new T.CylinderGeometry(.18,.27,1.5,7),stone,p.x+.5,biomeElevation(area,p.x,p.y,layout)+.75,p.y+.5);add(new T.OctahedronGeometry(.13),new T.MeshBasicMaterial({color:0xffdc91}),p.x+.5,biomeElevation(area,p.x,p.y,layout)+1.65,p.y+.5);}
 const arena=add(new T.CircleGeometry(7.6,40),new T.MeshLambertMaterial({color:theme.floor,map:groundTexture('stone')}),layout.fortress.x+.5,biomeElevation(area,layout.fortress.x+.5,layout.fortress.y+.5,layout)+.03,layout.fortress.y+.5);arena.rotation.x=-Math.PI/2;
 const roofs:T.Group[]=[];
 if(area==='forest'||area==='coast'){
  const c=layout.forest!.cabin,roof=new T.Group(),base=biomeElevation(area,c.x,c.y,layout);for(const side of[-1,1])add(new T.BoxGeometry(.2,1.8,4.2),wood,c.x+.5+side*2.1,base+.9,c.y+.5);add(new T.BoxGeometry(4.2,1.8,.2),wood,c.x+.5,base+.9,c.y-1.6);for(const side of[-1,1]){const q=add(new T.BoxGeometry(2.6,.16,5),leaf,c.x+.5+side*1.1,base+2.2,c.y+.5,roof);q.rotation.z=-side*.4;}world.add(roof);roofs.push(roof);
 }
 // Distinct landmarks give the three seal quests recognizable silhouettes.
 for(const a of layout.areas.filter(a=>a.zone>0&&a.zone<4)){
  const q=a.point,h=biomeElevation(area,q.x,q.y,layout);
  if(area==='desert'||area==='sea'){for(const side of[-1,1]){add(new T.CylinderGeometry(.17,.23,1.8,7),stone,q.x+.5+side*2,h+.9,q.y+.5);add(new T.BoxGeometry(.6,.16,.6),stone,q.x+.5+side*2,h+1.8,q.y+.5);}add(new T.BoxGeometry(4.5,.25,.5),stone,q.x+.5,h+2,q.y+.5);}
  if(area==='mountain'&&a.zone===1){const tent=add(new T.ConeGeometry(1.1,1.6,4),new T.MeshLambertMaterial({color:0xd9aa75}),q.x+2,h+.8,q.y+1);tent.rotation.y=Math.PI/4;}
  if(area==='mountain'||area==='forest')for(let i=0;i<5;i++){const x=q.x-2+i*.6,z=q.y+2;add(new T.BoxGeometry(.5,.1,1),stone,x,biomeElevation(area,x,z,layout)+.05,z);}
  if(area==='coast'&&a.zone===3){add(new T.CylinderGeometry(.12,.19,3,8),wood,q.x+2,h+1.5,q.y+2);add(new T.ConeGeometry(.55,.4,6),leaf,q.x+2,h+3.3,q.y+2);}
 }
 const waterMat=new T.MeshBasicMaterial({color:area==='coast'?0x469fb2:0x4cabbc,transparent:true,opacity:area==='sea'?.3:.48,side:T.DoubleSide});let water:T.Mesh|undefined;
 if(area==='sea'){water=add(new T.PlaneGeometry(n,n),waterMat,n/2,-.025,n/2);water.rotation.x=-Math.PI/2;}
 else if(area==='coast'||area==='desert'){const c=layout.forest!.cave;water=add(new T.CircleGeometry(area==='coast'?4.2:3,24),waterMat,c.x+.5,-.025,c.y+.5);water.rotation.x=-Math.PI/2;}
 if(area==='sea'){const sand=new T.MeshLambertMaterial({color:0xe4cea1,map:groundTexture('path')});for(const c of [layout.maze.start,layout.forest!.cabin,layout.fortress]){const beach=add(new T.CircleGeometry(2.45,32),sand,c.x+.5,.23,c.y+.5);beach.rotation.x=-Math.PI/2;}}
 const bubbles:T.Mesh[]=[];
 if(area==='sea'||area==='coast'){const glass=new T.MeshBasicMaterial({color:0xc6f4ed,transparent:true,opacity:.45,wireframe:true});for(let i=0;i<12;i++){const b=new T.Mesh(new T.SphereGeometry(.025+i%3*.012,6,4),glass);b.visible=false;world.add(b);bubbles.push(b);}}
 if(area==='sea'){for(const q of layout.areas.slice(1,5).map(a=>a.point)){for(let j=0;j<5;j++){const x=q.x+2+Math.sin(j)*.3,z=q.y+2+Math.cos(j)*.3,h=biomeElevation(area,x,z,layout);if(layout.maze.grid[Math.floor(z)]?.[Math.floor(x)]!==0)continue;const coral=new T.MeshLambertMaterial({color:[0xda8f9e,0xe4c691,0x84c9c3][j%3]});for(let k=0;k<3;k++){const sprig=add(new T.CapsuleGeometry(.045,.35+k*.16,3,6),coral,x+(k-1)*.1,h+.3,z);sprig.rotation.z=(k-1)*.3;}}}}
 const foam=new T.MeshBasicMaterial({color:0xd7f2e1,transparent:true,opacity:.4});const ripples:T.Mesh[]=[];if(water)for(let i=0;i<9;i++){const c=area==='sea'?layout.areas[i%6].point:layout.forest!.cave,m=add(new T.TorusGeometry(.35+i%3*.12,.012,4,20),foam.clone(),c.x+.5+(i%3-1),.0,c.y+.5+Math.floor(i/3)-1);m.rotation.x=-Math.PI/2;ripples.push(m);}
 ripples.forEach(m=>{props.remove(m);world.add(m);});batchStatic(props);world.add(props);
 return {update(t:number,camera:T.Camera,player?:{x:number;y:number;depth?:number}){sky.position.copy(camera.position);scenery.update(camera);if(scene.fog instanceof T.Fog&&area!=='sea'&&area!=='coast'){scene.fog.near=area==='mountain'?40:area==='desert'?34:24;scene.fog.far=area==='mountain'?100:area==='desert'?82:62;}bubbles.forEach((b,i)=>{b.visible=!!player&&(player.depth||0)>.2;if(player)b.position.set(player.x+Math.sin(t*1.4+i)*.18,-.4-(player.depth||0)+(t*.55+i*.17)%1.5,player.y+Math.cos(t+i)*.15);});if(area==='sea'||area==='coast'){const underwater=camera.position.y<-.06;if(scene.fog instanceof T.Fog){scene.fog.color.set(underwater?0x297a8c:theme.sky);scene.fog.near=underwater?2:22;scene.fog.far=underwater?18:42;}sky.visible=!underwater;scene.background=underwater?new T.Color(0x297a8c):null;}ripples.forEach((r,i)=>{const p=(t*.3+i*.13)%1;r.scale.setScalar(.6+p);(r.material as T.MeshBasicMaterial).opacity=.4*(1-p);});roofs.forEach(r=>{const c=area==='forest'||area==='coast'?layout.forest!.cabin:layout.forest!.cave;r.visible=!player||Math.hypot(player.x-c.x,player.y-c.y)>5;});},dispose(){scenery.dispose();skyTexture.dispose();}};
}
