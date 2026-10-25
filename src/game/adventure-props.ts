import {forestGuardian} from './forest-guardian';
import * as T from 'three';
export function goldGate():T.Group {
 const g=new T.Group();const gold=new T.MeshLambertMaterial({color:0xe8b747,flatShading:true}),ivory=new T.MeshLambertMaterial({color:0xfff0b6}),dark=new T.MeshLambertMaterial({color:0x345758});
 const add=(geo:T.BufferGeometry,mat:T.Material,x:number,y:number,z:number)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);g.add(m);return m;};
 for(const s of [-1,1]) {
  add(new T.BoxGeometry(.18,1.05,.22),gold,s*.41,.53,0);
  add(new T.BoxGeometry(.3,.14,.32),dark,s*.41,.07,0);
  add(new T.OctahedronGeometry(.14,0),ivory,s*.41,1.17,0);
  add(new T.BoxGeometry(.08,.6,.25),ivory,s*.41,.56,.01);
 }
 const arch=add(new T.TorusGeometry(.42,.09,6,16,Math.PI),gold,0,1.02,0);
 add(new T.OctahedronGeometry(.16,0),gold,0,1.52,0).scale.set(.8,1.2,.5);
 const glow=new T.MeshBasicMaterial({color:0xffe898,transparent:true,opacity:.35,side:T.DoubleSide});
 const portal=add(new T.PlaneGeometry(.65,1.05),glow,0,.65,0);portal.name='portal-glow';
 add(new T.BoxGeometry(.95,.09,.4),gold,0,.08,0);
 g.name='gold-gate';return g;
}
export const seedGuardian=forestGuardian;
export function collectible(kind:'seal'|'star'|'chest'):T.Group {
 const g=new T.Group();const gold=new T.MeshLambertMaterial({color:0xffd16c,flatShading:true});
 if(kind==='seal'){const m=new T.Mesh(new T.OctahedronGeometry(.2),new T.MeshLambertMaterial({color:0x6ee1d1,emissive:0x124941}));m.position.y=.5;g.add(m);}
 if(kind==='star') {const shape=new T.Shape();for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,r=i%2?.105:.23;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?shape.lineTo(x,y):shape.moveTo(x,y);}shape.closePath();const m=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.06,bevelEnabled:false}),gold);m.position.y=.45;g.add(m);}
 if(kind==='chest'){const m=new T.Mesh(new T.BoxGeometry(.45,.28,.3),new T.MeshLambertMaterial({color:0x97734d}));m.position.y=.2;g.add(m);const band=new T.Mesh(new T.BoxGeometry(.1,.32,.33),gold);band.position.y=.2;g.add(band);}
 return g;
}
