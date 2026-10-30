import {forestGuardian} from './forest-guardian';
import * as T from 'three';
import {roundBox} from './model-parts';
export function goldGate():T.Group {
 const g=new T.Group(),gold=new T.MeshLambertMaterial({color:0xeac16b}),stone=new T.MeshLambertMaterial({color:0x55756b,map:null}),glow=new T.MeshBasicMaterial({color:0x8aeddc,transparent:true,opacity:.4,side:T.DoubleSide});
 const add=(geo:T.BufferGeometry,mat:T.Material,x:number,y:number,z:number)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);g.add(m);return m;};
 for(const side of [-1,1]){add(roundBox(.26,1.35,.32,.05),stone,side*.52,.7,0);add(roundBox(.37,.12,.42,.035),gold,side*.52,.12,0);add(roundBox(.35,.1,.4,.025),gold,side*.52,1.3,0);add(new T.OctahedronGeometry(.15),gold,side*.52,1.55,0);for(let i=0;i<3;i++)add(roundBox(.05,.16,.03,.012),gold,side*.52,.48+i*.22,.18);}
 add(new T.TorusGeometry(.52,.14,8,24,Math.PI),stone,0,1.3,0);add(new T.TorusGeometry(.52,.035,6,24,Math.PI),gold,0,1.3,.145);add(new T.OctahedronGeometry(.18),gold,0,1.88,0);
 const portal=add(new T.PlaneGeometry(.78,1.35),glow,0,.85,0);portal.name='portal-glow';add(roundBox(1.35,.13,.7,.04),stone,0,.04,0);add(roundBox(1.15,.06,.55,.02),gold,0,.12,0);g.name='gold-gate';return g;
}
export const seedGuardian=forestGuardian;
export function collectible(kind:'seal'|'star'|'chest'):T.Group {
 const g=new T.Group();const gold=new T.MeshLambertMaterial({color:0xffd16c,flatShading:true});
 if(kind==='seal'){
  const m=new T.Mesh(new T.OctahedronGeometry(.32),new T.MeshLambertMaterial({color:0x63e8d1,emissive:0x176c61}));m.scale.y=1.5;m.position.y=1.05;m.name='seal-crystal';g.add(m);
  for(const y of [.72,1.38]){const ring=new T.Mesh(new T.TorusGeometry(.38,.022,6,24),gold);ring.rotation.x=Math.PI/2;ring.position.y=y;g.add(ring);}
  const base=new T.Mesh(new T.CylinderGeometry(.36,.44,.16,8),new T.MeshLambertMaterial({color:0x5f8377}));base.position.y=.08;g.add(base);
 }
 if(kind==='star') {const shape=new T.Shape();for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,r=i%2?.105:.23;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?shape.lineTo(x,y):shape.moveTo(x,y);}shape.closePath();const m=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.06,bevelEnabled:false}),gold);m.position.y=.45;g.add(m);}
 if(kind==='chest'){
  const wood=new T.MeshLambertMaterial({color:0x965c38}),dark=new T.MeshLambertMaterial({color:0x513e30});
  const base=new T.Mesh(roundBox(.72,.36,.48,.045),wood);base.position.y=.23;g.add(base);
  const lid=new T.Mesh(new T.CylinderGeometry(.26,.26,.72,12,1,false,0,Math.PI),wood);lid.rotation.z=Math.PI/2;lid.position.y=.42;g.add(lid);
  for(const x of [-.25,.25]){const band=new T.Mesh(roundBox(.065,.4,.5,.015),gold);band.position.set(x,.24,0);g.add(band);const arc=new T.Mesh(new T.TorusGeometry(.265,.026,5,16,Math.PI),gold);arc.rotation.y=Math.PI/2;arc.position.set(x,.42,0);g.add(arc);}
  for(const y of [.17,.28]){const seam=new T.Mesh(new T.BoxGeometry(.69,.012,.01),dark);seam.position.set(0,y,.246);g.add(seam);}
  const lock=new T.Mesh(roundBox(.12,.16,.045,.015),gold);lock.position.set(0,.35,.26);g.add(lock);const hole=new T.Mesh(new T.CircleGeometry(.025,8),dark);hole.position.set(0,.36,.285);g.add(hole);
 }
 return g;
}
