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
export function seedGuardian(boss=false):T.Group {
 const g=new T.Group();g.name=boss?'raja-rimbun':'seed-guardian';
 const bark=new T.MeshLambertMaterial({color:boss?0x78533d:0xa68050,flatShading:true}),leaf=new T.MeshLambertMaterial({color:boss?0x2c7450:0x78aa4f,flatShading:true}),gold=new T.MeshLambertMaterial({color:0xf2c766}),cream=new T.MeshBasicMaterial({color:0xfff1d0}),ink=new T.MeshBasicMaterial({color:0x173b3b}),pink=new T.MeshLambertMaterial({color:0xf4a8b7});
 const k=boss?1.65:1;
 function add(geo:T.BufferGeometry,mat:T.Material,x:number,y:number,z:number){const m=new T.Mesh(geo,mat);m.position.set(x*k,y*k,z*k);m.scale.setScalar(k);g.add(m);return m;}
 add(new T.CylinderGeometry(.25,.32,.64,7),bark,0,.55,0);
 add(new T.IcosahedronGeometry(.32,1),bark,0,.98,0).scale.y=k*.83;
 for(const side of [-1,1]) {
  add(new T.ConeGeometry(.09,.35,5),bark,side*.19,.16,.04).rotation.z=-side*.5;
  const arm=add(new T.CylinderGeometry(.075,.1,.46,5),bark,side*.37,.66,0);arm.rotation.z=-side*.65;
  const eye=add(new T.SphereGeometry(.09,8,5),boss?new T.MeshBasicMaterial({color:0xb7f5be}):cream,side*.12,1.02,.27);if(boss)eye.name='king-eye';
  add(new T.SphereGeometry(.043,7,5),ink,side*.12,1.01,.34);
  const brow=add(new T.BoxGeometry(.19,.055,.07),leaf,side*.12,1.15,.27);brow.rotation.z=side*.17;
  add(new T.IcosahedronGeometry(.21,0),leaf,side*.24,.83,-.07);
 }
 add(new T.TorusGeometry(.09,.02,4,10,Math.PI),ink,0,.89,.3).rotation.z=Math.PI;
 const sling=add(new T.TorusGeometry(.17,.035,5,10,Math.PI),gold,.43,.8,.13);sling.rotation.z=Math.PI;
 add(new T.CylinderGeometry(.11,.11,.07,8),pink,.43,.72,.14);
 if(boss) {
  add(new T.CylinderGeometry(.34,.37,.11,9),gold,0,1.25,0);
  for(let i=0;i<7;i++){const a=i/7*Math.PI*2;add(new T.ConeGeometry(.075,.27,4),gold,Math.cos(a)*.29,1.41,Math.sin(a)*.29);}
  add(new T.OctahedronGeometry(.11),new T.MeshLambertMaterial({color:0x7ee1ce}),0,1.35,.36);
  for(let i=0;i<5;i++){const a=(i/4-.5)*1.5;const m=add(new T.ConeGeometry(.17,.7,5),leaf,Math.sin(a)*.33,.55,-.3);m.rotation.z=-a*.5;}
 }else {
  add(new T.ConeGeometry(.35,.3,6),leaf,0,1.28,0);
  add(new T.BoxGeometry(.14,.18,.02),gold,0,.66,.29);
 }
 return g;
}
export function collectible(kind:'seal'|'star'|'chest'):T.Group {
 const g=new T.Group();const gold=new T.MeshLambertMaterial({color:0xffd16c,flatShading:true});
 if(kind==='seal'){const m=new T.Mesh(new T.OctahedronGeometry(.2),new T.MeshLambertMaterial({color:0x6ee1d1,emissive:0x124941}));m.position.y=.5;g.add(m);}
 if(kind==='star') {const shape=new T.Shape();for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,r=i%2?.105:.23;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?shape.lineTo(x,y):shape.moveTo(x,y);}shape.closePath();const m=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.06,bevelEnabled:false}),gold);m.position.y=.45;g.add(m);}
 if(kind==='chest'){const m=new T.Mesh(new T.BoxGeometry(.45,.28,.3),new T.MeshLambertMaterial({color:0x97734d}));m.position.y=.2;g.add(m);const band=new T.Mesh(new T.BoxGeometry(.1,.32,.33),gold);band.position.y=.2;g.add(band);}
 return g;
}
