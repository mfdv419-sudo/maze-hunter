import * as T from 'three';
import type {GrassKind} from './adventure-zones';
const material=(color:number)=>new T.MeshLambertMaterial({color,flatShading:true});
export function vegetation(kind:GrassKind|'shortcut'){
 const group=new T.Group(),leaf=material(kind==='rare'?0xb1df73:kind==='danger'?0x80668e:kind==='shortcut'?0x98c84f:0x4c9b65),stem=material(0x607b40);
 const blade=new T.ConeGeometry(.09,kind==='normal'?.22:.65,3),stick=new T.CylinderGeometry(.015,.025,.45,4);
 for(let i=0;i<(kind==='normal'?5:9);i++){const a=i*2.4,r=.1+(i%3)*.075,m=new T.Mesh(blade,leaf);m.position.set(Math.cos(a)*r,kind==='normal'?.1:.35,Math.sin(a)*r);m.rotation.z=Math.sin(a)*.3;group.add(m);if(kind==='shortcut'){const s=new T.Mesh(stick,stem);s.position.copy(m.position);s.position.y=.2;group.add(s);}}
 if(kind==='rare'||kind==='danger'){const flower=material(kind==='rare'?0xffe394:0xf3a196);for(let i=0;i<3;i++){const m=new T.Mesh(kind==='rare'?new T.OctahedronGeometry(.055):new T.ConeGeometry(.055,.16,4),flower);m.position.set(Math.sin(i*2)*.2,.65,Math.cos(i*2)*.2);group.add(m);}}
 if(kind==='rare'){const g=new T.Mesh(new T.TorusGeometry(.28,.012,3,16),new T.MeshBasicMaterial({color:0xffe5a4}));g.rotation.x=Math.PI/2;g.position.y=.08;g.name='rare-glow';group.add(g);}
 const ring=new T.Mesh(new T.RingGeometry(.3,.34,18),new T.MeshBasicMaterial({color:0xffe6a1,transparent:true,opacity:.8,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.025;ring.name='interaction-ring';ring.visible=false;group.add(ring);
 return group;
}
export function landmark(zone:number){
 const g=new T.Group(),wood=material(0x8e7052),stone=material(zone===5?0x82949e:0x9dafa0),gold=material(0xf3ce7b),leaf=material(0x659a6c);
 const add=(geo:T.BufferGeometry,mat:T.Material,x:number,y:number,z:number)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);g.add(m);return m;};
 if(zone===5){
  add(new T.CylinderGeometry(2.8,2.95,.12,12),stone,0,.015,0);
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2,m=add(new T.ConeGeometry(.24,1.2,5),wood,Math.cos(a)*2.8,.5,Math.sin(a)*2.8);m.rotation.z=Math.cos(a)*.5;}
  for(const side of [-1,1]){add(new T.BoxGeometry(.3,1.7,.3),stone,side*2, .85,1.8);add(new T.OctahedronGeometry(.2),gold,side*2,1.85,1.8);}
 }else if(zone===2){
  for(const side of [-1,1]){add(new T.BoxGeometry(.08,1.7,.08),wood,side*.5,.85,0);add(new T.BoxGeometry(.5,.04,.5),wood,side*.5,1.3,0);add(new T.ConeGeometry(.48,.32,4),leaf,side*.5,1.8,0);}add(new T.BoxGeometry(.4,.55,.03),gold,0,1.1,0);
 }else if(zone===1||zone===4){
  for(let i=0;i<3;i++)add(new T.DodecahedronGeometry(.2+i*.05),stone,(i-1)*.3,.2,0);
  add(new T.BoxGeometry(.18,.85,.18),stone,0,.65,0);add(new T.OctahedronGeometry(.19),zone===4?leaf:gold,0,1.17,0);
 }else if(zone===3){
  add(new T.CylinderGeometry(.5,.6,.18,9),stone,0,.1,0);add(new T.TorusGeometry(.33,.07,5,15),gold,0,.45,0).rotation.x=Math.PI/2;
 }else {
  for(let i=0;i<7;i++){const a=i*2.4;add(new T.CylinderGeometry(.025,.04,.25,4),leaf,Math.cos(a)*.4,.14,Math.sin(a)*.4);add(new T.IcosahedronGeometry(.1,0),i%2?gold:material(0xe4a2a9),Math.cos(a)*.4,.3,Math.sin(a)*.4);}
 }
 g.name='landmark-'+zone;return g;
}
