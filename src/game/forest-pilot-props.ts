import * as T from 'three';
import type {Ledge} from './climbing';
/** Art uses the same dimensions as the climb/lift surfaces; no second giant tree canopy. */
export function forestPilotProp(l:Ledge){
 const g=new T.Group(),wood=new T.MeshLambertMaterial({color:0x8b6645,flatShading:true}),moss=new T.MeshLambertMaterial({color:0x6d9c4d,flatShading:true});
 const add=(geometry:T.BufferGeometry,material:T.Material,x:number,y:number,z:number)=>{const m=new T.Mesh(geometry,material);m.position.set(x,y,z);g.add(m);return m;};
 if(l.kind==='tree'){
  add(new T.CylinderGeometry(.17,.28,l.height,9),wood,0,l.height/2,0);
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5,branch=add(new T.CylinderGeometry(.055,.1,1.5,6),wood,Math.sin(a)*.55,l.height,Math.cos(a)*.55);branch.rotation.set(Math.cos(a)*.95,0,-Math.sin(a)*.95);}
  add(new T.CylinderGeometry(.48,.5,.12,10),wood,0,l.height-.06,0);
  for(let i=0;i<5;i++){const a=i*2.4,m=add(new T.IcosahedronGeometry(.65,1),moss,Math.sin(a)*1.3,l.height+.85+i%2*.25,Math.cos(a)*1.3);m.scale.y=.7;}
 }else if(l.kind==='log'){
  const trunk=add(new T.CylinderGeometry(l.height*.48,l.height*.5,2.8,12),wood,0,l.height/2,0);trunk.rotation.z=Math.PI/2;
  for(const side of[-1,1]){const cut=add(new T.CircleGeometry(l.height*.43,12),new T.MeshLambertMaterial({color:0xc6a978,side:T.DoubleSide}),side*1.405,l.height/2,0);cut.rotation.y=Math.PI/2;}
 }else {
  const w=l.width||1,d=l.depth||1,geo=new T.BoxGeometry(w,l.height,d,2,3,2),p=geo.attributes.position;
  for(let i=0;i<p.count;i++){const y=p.getY(i),f=(y+l.height/2)/l.height,shrink=.91+.09*Math.cos(f*Math.PI*2);p.setXYZ(i,p.getX(i)*shrink,y,p.getZ(i)*shrink);}geo.computeVertexNormals();
  add(geo,new T.MeshLambertMaterial({color:0x899381,flatShading:true}),0,l.height/2,0);add(new T.BoxGeometry(w*.9,.04,d*.9),moss,0,l.height-.02,0);
 }
 return g;
}
