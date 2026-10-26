import * as T from 'three';
import type {AdventureLayout} from './adventure-layout';
import type {AdventureArea} from './areas';
import {shipSites,cascadeSites} from './expedition-landmarks';
import {biomeElevation} from './biome-layout';
import {biomeWallTop} from './biome-walls';
export function expeditionEffects(world:T.Group,l:AdventureLayout,area:AdventureArea){
 const root=new T.Group();root.name=`${area}-living-landmarks`;world.add(root);const flows:{mesh:T.Mesh;base:number;top:number;point:{x:number;y:number};lava:boolean}[]=[],sparks:T.Mesh[]=[];
 const add=(geo:T.BufferGeometry,mat:T.Material,x:number,y:number,z:number)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);root.add(m);return m;};
 if(area==='sea')for(const p of shipSites(l)){
  const wood=new T.MeshLambertMaterial({color:0x946a46}),trim=new T.MeshLambertMaterial({color:0xd8bc79}),hull=new T.MeshLambertMaterial({color:0x455761});
  const body=add(new T.CylinderGeometry(2.5,1.7,1.1,8),hull,p.x,.23,p.y);body.scale.set(.93,1,1.27);body.name='diamond-ship-hull';
  const deck=add(new T.BoxGeometry(4.6,.16,6),wood,p.x,.77,p.y);deck.name='walkable-diamond-ship-deck';
  for(let i=0;i<15;i++)add(new T.BoxGeometry(4.55,.018,.025),trim,p.x,.858,p.y-2.8+i*.4);
  for(const side of [-1,1]){for(let i=0;i<7;i++)add(new T.BoxGeometry(.07,.6,.07),trim,p.x+side*2.25,1.15,p.y-2.8+i*.93);add(new T.BoxGeometry(.08,.07,5.8),trim,p.x+side*2.25,1.45,p.y);
   const ramp=new T.PlaneGeometry(1.6,2,1,8);ramp.rotateX(-Math.PI/2);const a=ramp.attributes.position;for(let i=0;i<a.count;i++){const dz=a.getZ(i)+4;a.setXYZ(i,a.getX(i)+p.x,.85-(dz-3)*1.2+.015,p.y+side*dz);}ramp.computeVertexNormals();const gangway=new T.Mesh(ramp,new T.MeshLambertMaterial({color:0xbaa077,side:T.DoubleSide}));gangway.name='walkable-ship-gangway';root.add(gangway);
  }
  add(new T.CylinderGeometry(.07,.12,4.5,8),wood,p.x+1.45,3.1,p.y+.4);const sail=add(new T.PlaneGeometry(2.1,2.4),new T.MeshLambertMaterial({color:0xe7dfbd,side:T.DoubleSide}),p.x+1.45,3.2,p.y+.4);sail.rotation.y=Math.PI/2;
  const cabin=add(new T.BoxGeometry(1.0,.95,1.3),hull,p.x-1.3,1.32,p.y+1.5);cabin.name='ship-cabin';
 }
 if(area==='gorge'||area==='volcano')for(const p of cascadeSites(l)){
  const base=biomeElevation(area,p.x,p.y,l),top=biomeWallTop(area,p.x,p.y,l)+.15,lava=area==='volcano',mat=new T.MeshBasicMaterial({color:lava?0xff7428:0x80d8de,transparent:true,opacity:lava?.95:.68,side:T.DoubleSide});
  const fall=add(new T.PlaneGeometry(lava?1.1:1.7,top-base),mat,p.x,(base+top)/2,p.y);fall.rotation.y=Math.atan2(p.dx,p.dz);fall.name=lava?'lava-waterfall':'canyon-waterfall';flows.push({mesh:fall,base,top,point:p,lava});
  const pool=add(new T.CircleGeometry(lava?1.3:1.7,28),mat.clone(),p.x+p.dx*.6,base+.025,p.y+p.dz*.6);pool.rotation.x=-Math.PI/2;pool.name=lava?'hazard-lava-pool':'waterfall-basin';
  if(lava){const light=new T.PointLight(0xff6b25,3,10,2);light.position.set(p.x,base+1.2,p.y);root.add(light);}
  for(let i=0;i<18;i++){const particle=add(new T.IcosahedronGeometry(lava?.06:.13,0),new T.MeshBasicMaterial({color:lava?0xffca54:0xe0f8ef,transparent:true,opacity:lava?.8:.25}),p.x,base,p.y);particle.userData.flow=flows.length-1;particle.userData.seed=i;sparks.push(particle);}
 }
 if(area==='volcano')for(let i=8;i<l.solution.length;i+=23){const p=l.solution[i],h=biomeElevation(area,p.x+.5,p.y+.5,l),crack=add(new T.BoxGeometry(.05,.018,1.4),new T.MeshBasicMaterial({color:0xff8f30}),p.x+.5,h+.03,p.y+.5);crack.rotation.y=i;crack.name='glowing-lava-fissure';}
 return{flows,update(t:number){flows.forEach((f,i)=>{(f.mesh.material as T.MeshBasicMaterial).opacity=(f.lava?.88:.58)+Math.sin(t*3+i)*.08;});sparks.forEach(m=>{const f=flows[m.userData.flow],k=m.userData.seed,p=(t*(f.lava?.16:.45)+k/18)%1;m.position.set(f.point.x+Math.sin(k*2.4+t)*.65,f.lava?f.base+p*2:f.base+(1-p)*(f.top-f.base),f.point.y+Math.cos(k*3+t*.4)*.4);m.scale.setScalar(f.lava?1:1+(1-p)*1.3);});}};
}
