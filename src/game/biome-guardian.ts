import {batchStatic} from './static-model';
import {smooth01} from './motion-quality';
import * as T from 'three';
import type {AdventureArea} from './areas';
import {joint,addMesh as add,roundBox,satin} from './model-parts';
import {forestGuardian} from './forest-guardian';
import {gorgeGuardian} from './gorge-guardian';
import {aquaticGuardian} from './aquatic-guardian';
type Pose=(time:number,speed:number,windup:number,stunned:boolean,reaction:number,phase:number)=>void;
const box=(p:T.Object3D,w:number,h:number,d:number,m:T.Material,x=0,y=0,z=0)=>add(p,roundBox(w,h,d,Math.min(w,h,d)*.22),m,x,y,z);
const ell=(p:T.Object3D,m:T.Material,x:number,y:number,z:number,sx:number,sy:number,sz:number)=>{const q=add(p,new T.SphereGeometry(1,12,8),m,x,y,z);q.scale.set(sx,sy,sz);return q;};
function eyes(p:T.Object3D,x:number,y:number,z:number,color=0xffefcc){const out:T.Group[]=[],white=new T.MeshBasicMaterial({color}),ink=satin(0x1c3540);for(const side of[-1,1]){const e=joint(p,side*x,y,z,'guardian-eye');ell(e,white,0,0,0,.07,.08,.03);ell(e,ink,side*.01,0,.027,.034,.045,.016);ell(e,white,-side*.012,.025,.041,.012,.014,.006);out.push(e);}return out;}
const blink=(e:T.Group[],t:number,stunned:boolean)=>e.forEach(q=>q.scale.y=stunned?.35:t%5>4.85?.12:1);
function shield(p:T.Object3D,r:number,y:number,color:number){const g=joint(p,0,y,0,'king-armor'),m=new T.MeshBasicMaterial({color,transparent:true,opacity:.6});for(let i=0;i<3;i++){const q=add(g,new T.TorusGeometry(r,.018,5,24),m);q.rotation.set(Math.PI/2+i*.4,0,i*.7);}return g;}
function fruit(p:T.Object3D,x:number,y:number,z:number){const f=add(p,new T.SphereGeometry(.09,8,6),satin(0xaa70ad),x,y,z);f.name='held-poison-fruit';add(f,new T.ConeGeometry(.035,.08,5),satin(0x859e59),0,.1,0);return f;}
function pangolin(){
 const root=new T.Group();root.name='trenggiling-duri';const rig=joint(root,0,0,0,'pangolin-rig'),fur=satin(0x987858),plate=satin(0xc4a67c),cream=satin(0xe8cfa2),ink=satin(0x243933);
 const body=joint(rig,0,.57,-.02,'scaled-body');ell(body,fur,0,0,0,.31,.37,.31);
 for(let row=0;row<5;row++)for(let col=0;col<5;col++){const a=(col-2)*.45,q=add(body,new T.ConeGeometry(.1,.17,4),plate,Math.sin(a)*.29,.28-row*.12,-Math.cos(a)*(.24+Math.sin(row*.65)*.06));q.rotation.set(-.8-row*.08,0,-a*.4);}
 const head=joint(rig,0,.96,.1,'pangolin-head');ell(head,fur,0,0,0,.23,.22,.21);const nose=add(head,new T.ConeGeometry(.13,.3,8),cream,0,-.06,.25);nose.rotation.x=Math.PI/2;ell(head,ink,0,-.065,.4,.05,.04,.032);const ee=eyes(head,.13,.04,.17);for(const s of[-1,1])ell(head,fur,s*.2,.14,-.02,.05,.07,.035);
 const arms:T.Group[]=[],legs:T.Group[]=[];for(const s of[-1,1]){const a=joint(rig,s*.3,.71,.02,'pangolin-arm');arms.push(a);add(a,new T.CapsuleGeometry(.065,.22,3,7),fur,0,-.12,0);for(let i=0;i<3;i++)add(a,new T.ConeGeometry(.014,.065,5),cream,(i-1)*.035,-.29,.025).rotation.x=Math.PI;const l=joint(rig,s*.16,.31,0,'pangolin-leg');legs.push(l);add(l,new T.CapsuleGeometry(.08,.13,3,7),fur,0,-.08,0);box(l,.16,.08,.22,cream,0,-.25,.04);}
 const curl=joint(root,0,.48,0,'pangolin-curled-shell');curl.visible=false;const ball=ell(curl,plate,0,0,0,.37,.37,.37);for(let i=0;i<18;i++){const a=i*2.399,y=(i/17-.5)*.6,r=Math.sqrt(Math.max(0,.35*.35-y*y));const q=add(curl,new T.ConeGeometry(.075,.12,4),i%2?plate:fur,Math.sin(a)*r,y,Math.cos(a)*r);q.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),q.position.clone().normalize());}
 batchStatic(curl);
 let rolling=0,rollTime=0;
 const tail=joint(rig,0,.38,-.24,'scaled-tail');for(let i=0;i<7;i++){const q=add(tail,new T.ConeGeometry(.105-i*.011,.22,5),i%2?plate:fur,-i*.045,-i*.025,-i*.12);q.rotation.x=-Math.PI/2;q.rotation.z=-.22;}const f=fruit(arms[1],0,-.26,.08);
 root.userData.animate=((t,speed,w,stun,hit)=>{const desired=root.userData.motion?.rolling?1:0;const rollDt=Math.min(.1,Math.max(0,t-rollTime));rollTime=t;rolling+=(desired-rolling)*(1-Math.exp(-rollDt*18));curl.visible=rolling>.01;rig.visible=rolling<.99;rig.scale.setScalar(Math.max(.01,1-rolling));curl.scale.setScalar(Math.max(.01,rolling));curl.rotation.x=root.userData.motion?.rolling?(root.userData.motion.rollAge||0)*8:curl.rotation.x;const stride=Math.sin(t*9)*Math.min(1,speed)*.45;rig.position.y=Math.abs(stride)*.035;body.rotation.x=-w*.12;head.rotation.set(w*.22,Math.sin(t*.9)*.08,stun?Math.sin(t*12)*.08:0);arms.forEach((a,i)=>a.rotation.x=(i?1:-1)*stride-w*1.6);legs.forEach((a,i)=>a.rotation.x=(i?-1:1)*stride);tail.rotation.y=Math.sin(t*2)*.09+stride*.2;body.scale.setScalar(1+(hit>0&&hit<.3?Math.sin(hit/.3*Math.PI)*.07:0));blink(ee,t,stun);f.visible=false;})as Pose;return root;
}
function skink(){
 const root=new T.Group();root.name='kadal-pasir';const rig=joint(root,0,0,0,'skink-rig'),hide=satin(0xc7aa70),dark=satin(0x967346),cream=satin(0xf0d9aa),ink=satin(0x413b30);
 const body=joint(rig,0,.39,0,'skink-body');ell(body,hide,0,0,0,.24,.18,.45);ell(body,cream,0,-.1,.01,.21,.08,.35);const head=joint(rig,0,.54,.41,'skink-head');ell(head,hide,0,0,0,.23,.16,.28);box(head,.27,.035,.2,cream,0,-.1,.12);const ee=eyes(head,.145,.08,.18);for(const s of[-1,1])ell(head,ink,s*.09,.01,.27,.018,.012,.012);
 const legs:T.Group[]=[];for(const s of[-1,1])for(const front of[-1,1]){const l=joint(rig,s*.21,.34,front*.26,'skink-leg');legs.push(l);const a=add(l,new T.CapsuleGeometry(.045,.2,3,7),hide,s*.1,-.07,0);a.rotation.z=s*.8;box(l,.15,.055,.17,dark,s*.19,-.22,.02);for(let i=0;i<3;i++)add(l,new T.CapsuleGeometry(.012,.08,2,5),cream,s*.19+(i-1)*.035,-.24,.105).rotation.x=Math.PI/2;}
 const tail=joint(rig,0,.36,-.38,'skink-tail');for(let i=0;i<7;i++){const q=add(tail,new T.ConeGeometry(.105-i*.012,.22,7),i%2?dark:hide,Math.sin(i*.4)*.025,0,-i*.13-.03);q.rotation.x=-Math.PI/2;}for(let i=0;i<6;i++)add(body,new T.ConeGeometry(.045,.1,4),dark,0,.18,-.3+i*.12);const f=fruit(head,0,-.04,.32);
 root.userData.animate=((t,speed,w,stun,hit)=>{const m=Math.min(1,speed);legs.forEach((l,i)=>{l.rotation.x=Math.sin(t*11+i*Math.PI*.5)*m*.4;l.rotation.z=Math.cos(t*11+i*Math.PI*.5)*m*.08;});rig.position.y=Math.sin(t*2)*.006+Math.abs(Math.sin(t*11))*m*.015;head.rotation.set(-w*.38+(hit>0&&hit<.35?Math.sin(hit/.35*Math.PI)*.2:0),Math.sin(t*1.4)*.06,0);tail.rotation.y=Math.sin(t*(3+m*3))*(.12+m*.12);body.rotation.z=stun?Math.sin(t*12)*.08:0;blink(ee,t,stun);f.visible=false;})as Pose;return root;
}
function sphinx(){
 const root=new T.Group();root.name='sphinx-surya';const rig=joint(root,0,0,0,'sphinx-rig');rig.scale.setScalar(1.6);const stone=satin(0xc69d69),light=satin(0xe2c38d),ochre=satin(0x9c7248),blue=satin(0x487c89),gold=satin(0xe8c777),glow=new T.MeshBasicMaterial({color:0xffe5a4});
 const body=joint(rig,0,.63,-.07,'sphinx-body');ell(body,stone,0,0,0,.42,.38,.62);box(body,.44,.19,.45,light,0,-.17,.38);const legs:T.Group[]=[];
 for(const s of[-1,1])for(const front of[-1,1]){const l=joint(rig,s*.3,.56,front*.4,'sphinx-leg');legs.push(l);add(l,new T.CapsuleGeometry(.115,.21,3,8),stone,0,-.17,0);box(l,.25,.13,.36,light,0,-.43,.095);for(let i=0;i<3;i++)box(l,.015,.035,.07,ochre,(i-1)*.055,-.43,.265);}
 const neck=joint(rig,0,.92,.37,'sphinx-neck');add(neck,new T.CylinderGeometry(.24,.29,.42,9),stone);const head=joint(neck,0,.31,.035,'sphinx-head');box(head,.48,.42,.38,light);box(head,.22,.1,.18,stone,0,-.1,.22);const ee=eyes(head,.13,.035,.2,0xffe09d);box(head,.16,.025,.03,ochre,0,-.18,.265);
 for(const s of[-1,1]){const q=add(head,new T.ConeGeometry(.18,.64,4),blue,s*.3,-.02,-.03);q.rotation.z=-s*.22;for(let i=0;i<4;i++)box(head,.14,.025,.24,gold,s*.29,.16-i*.1,-.025);}
 box(head,.59,.075,.4,blue,0,.24,-.01);for(let i=0;i<3;i++)box(head,.6,.018,.42,gold,0,.215+i*.04,-.01);add(head,new T.CircleGeometry(.13,12),gold,0,.4,.08);const sun=add(head,new T.OctahedronGeometry(.07),glow,0,.4,.1);sun.name='sun-core';const beard=add(head,new T.ConeGeometry(.07,.23,5),blue,0,-.3,.17);beard.rotation.z=Math.PI;
 const tail=joint(rig,0,.7,-.61,'sphinx-tail'),curve=new T.CatmullRomCurve3([new T.Vector3(),new T.Vector3(.17,.1,-.23),new T.Vector3(.35,.28,-.28),new T.Vector3(.39,.4,-.12)]);add(tail,new T.TubeGeometry(curve,10,.04,6,false),stone);ell(tail,ochre,.39,.4,-.12,.09,.11,.07);const armor=shield(rig,.75,.7,0xf2d28e),f=fruit(head,0,-.1,.33);
 root.userData.animate=((t,speed,w,stun,hit,phase)=>{const stride=Math.sin(t*6)*Math.min(1,speed)*.24;legs.forEach((l,i)=>l.rotation.x=(i===0||i===3?1:-1)*stride);rig.position.y=Math.abs(stride)*.05;body.rotation.x=-w*.12;head.rotation.set(-w*.3,Math.sin(t*.8)*.035,hit>0&&hit<.4?Math.sin(hit/.4*Math.PI)*.12:stun?Math.sin(t*12)*.06:0);neck.position.y=.92+Math.sin(t*1.8)*.01;tail.rotation.y=Math.sin(t*1.4)*.11;armor.rotation.y=t*.45;f.visible=false;glow.color.set(phase===3?0xffaf6b:0xffe5a4);blink(ee,t,stun);})as Pose;return root;
}
function goat(boss=false){
 const root=new T.Group();root.name=boss?'raja-tanduk-badai':'kambing-batu';const rig=joint(root,0,0,0,'goat-rig');rig.scale.setScalar(boss?1.65:1);const fur=satin(boss?0x7b8a9b:0xb8bbb3),cream=satin(0xe8e5d8),hoof=satin(0x354451),horn=satin(boss?0xc8d8e2:0x8b8d87),gold=satin(0xd7bc79),glow=new T.MeshBasicMaterial({color:0xb8e6fa});
 const body=joint(rig,0,.64,0,'goat-body');ell(body,fur,0,0,0,.28,.29,.43);ell(body,cream,0,-.07,.25,.23,.2,.21);const legs:T.Group[]=[];for(const s of[-1,1])for(const front of[-1,1]){const l=joint(rig,s*.19,.48,front*.27,'goat-leg');legs.push(l);add(l,new T.CapsuleGeometry(.055,.23,3,7),fur,0,-.14,0);box(l,.12,.1,.17,hoof,0,-.38,.025);box(l,.013,.08,.04,cream,0,-.38,.105);}
 const neck=joint(rig,0,.85,.3,'goat-neck');ell(neck,fur,0,0,0,.2,.25,.21);const head=joint(neck,0,.2,.12,'goat-head');ell(head,fur,0,0,0,.22,.24,.23);ell(head,cream,0,-.1,.18,.15,.12,.14);box(head,.13,.035,.07,hoof,0,-.08,.295);const ee=eyes(head,.145,.04,.185);
 for(const s of[-1,1]){const h=joint(head,s*.15,.2,-.02,'curled-horn'),path=new T.CatmullRomCurve3([new T.Vector3(),new T.Vector3(s*.07,.26,-.12),new T.Vector3(s*.11,.37,-.34),new T.Vector3(s*.12,.23,-.5),new T.Vector3(s*.1,.07,-.4)]);add(h,new T.TubeGeometry(path,14,boss?.065:.043,7,false),horn);if(boss)for(let i=0;i<3;i++)ell(h,glow,s*.1,.12+i*.07,-.39,.028,.028,.028);const e=ell(head,fur,s*.24,.08,-.02,.13,.055,.055);e.rotation.z=-s*.3;}
 const beard=add(head,new T.ConeGeometry(.055,.2,6),cream,0,-.31,.07);beard.rotation.x=.3;const tail=add(rig,new T.ConeGeometry(.06,.2,6),cream,0,.76,-.44);tail.rotation.x=-.8;if(boss){for(const s of[-1,1])add(body,new T.DodecahedronGeometry(.19),horn,s*.29,.19,.13).scale.set(.65,1,1.25);box(body,.15,.21,.045,gold,0,.08,.41);const gem=add(body,new T.OctahedronGeometry(.095),glow,0,.1,.45);gem.name='storm-core';}
 const armor=boss?shield(rig,.66,.75,0xb9d9f1):undefined,f=fruit(head,0,-.08,.36);
 root.userData.animate=((t,speed,w,stun,hit,phase)=>{const stride=Math.sin(t*8)*Math.min(1,speed)*.34;legs.forEach((l,i)=>l.rotation.x=(i===0||i===3?1:-1)*stride);rig.position.y=Math.abs(stride)*.06;neck.rotation.x=w*.68-(hit>0&&hit<.35?Math.sin(hit/.35*Math.PI)*.25:0);body.rotation.x=-w*.12;head.rotation.z=stun?Math.sin(t*11)*.08:Math.sin(t*.8)*.02;tail.rotation.z=Math.sin(t*3)*.15;blink(ee,t,stun);f.visible=false;if(armor)armor.rotation.y=t*.5;glow.color.set(phase===3?0xe7c7fa:0xb8e6fa);})as Pose;return root;
}
function coconutCrab(boss=false){
 const root=new T.Group();root.name=boss?'raja-karapas':'kepiting-kelapa';const rig=joint(root,0,0,0,'coconut-crab-rig');rig.scale.setScalar(boss?1.9:1);const husk=satin(0x98714d),rim=satin(0xc29c69),pincer=satin(boss?0xd68e65:0xcb9c6a),dark=satin(0x4d443a),leaf=satin(0x76965d),cream=satin(0xffe6bb);
 const shell=joint(rig,0,.42,-.04,'coconut-carapace');ell(shell,husk,0,0,0,.43,.28,.36);for(let i=0;i<7;i++){const a=i*Math.PI*2/7,q=add(shell,new T.TorusGeometry(.29,.009,4,16,Math.PI),rim,Math.sin(a)*.015,0,Math.cos(a)*.015);q.rotation.set(Math.PI/2,0,a);q.scale.set(1.4,1,1);}for(let i=0;i<3;i++)ell(shell,dark,(i-1)*.075,.23,.07,.025,.014,.025);
 const legs:T.Group[]=[],arms:T.Group[]=[],jaws:T.Group[]=[],ee:T.Group[]=[];
 for(const s of[-1,1]){for(let i=0;i<3;i++){const l=joint(rig,s*.32,.36,(i-1)*.22,'coconut-leg');legs.push(l);const upper=add(l,new T.CapsuleGeometry(.04,.25,3,6),husk,s*.13,-.04,0);upper.rotation.z=s*.95;const lower=add(l,new T.ConeGeometry(.055,.3,6),rim,s*.27,-.22,.015);lower.rotation.z=-s*.36;}
  const stalk=joint(rig,s*.17,.66,.26,'crab-eyestalk');add(stalk,new T.CylinderGeometry(.025,.04,.18,6),dark,0,.05,0);const e=joint(stalk,0,.17,.02,'guardian-eye');ell(e,new T.MeshBasicMaterial({color:0xffe6bb}),0,0,0,.075,.085,.032);ell(e,dark,0,0,.028,.035,.047,.018);ee.push(e);
  const arm=joint(rig,s*.4,.42,.24,'coconut-claw-arm');arms.push(arm);const upper=add(arm,new T.CapsuleGeometry(.07,.2,3,7),pincer,s*.11,0,.07);upper.rotation.z=s*.9;const hand=joint(arm,s*.25,0,.2,'coconut-pincer');ell(hand,pincer,0,0,0,.18,.15,.2);const jaw=joint(hand,s*.11,.04,.13,'pincer-jaw');jaws.push(jaw);add(jaw,new T.ConeGeometry(.075,.22,6),rim,0,0,.09).rotation.x=Math.PI/2;add(hand,new T.ConeGeometry(.07,.24,6),pincer,-s*.08,-.03,.2).rotation.x=Math.PI/2;
 }
 if(boss){for(let i=0;i<5;i++){const a=(i-2)*.4,q=ell(shell,leaf,Math.sin(a)*.23,.35,Math.cos(a)*.13,.07,.04,.35);q.rotation.set(-.3,a,0);}add(shell,new T.TorusGeometry(.25,.025,5,24),cream,0,.27,0).rotation.x=Math.PI/2;}
 const armor=boss?shield(rig,.7,.5,0xf1d19a):undefined,f=fruit(arms[1],.22,.07,.22);
 root.userData.animate=((t,speed,w,stun,hit)=>{const m=Math.min(1,speed);legs.forEach((l,i)=>{l.rotation.x=Math.sin(t*10+i*1.8)*m*.3;l.rotation.z=Math.cos(t*10+i*1.8)*m*.1;});rig.position.y=Math.sin(t*2)*.008+Math.abs(Math.sin(t*10))*m*.025;shell.rotation.z=stun?Math.sin(t*13)*.07:Math.sin(t*.8)*.02;shell.rotation.x=hit>0&&hit<.3?Math.sin(hit/.3*Math.PI)*.18:0;arms.forEach((a,i)=>{a.rotation.x=-w*1.2+(i?1:-1)*Math.sin(t*2)*.04;a.rotation.y=(i?1:-1)*w*.28;});jaws.forEach((j,i)=>j.rotation.y=(i?1:-1)*(.1+w*.45+Math.sin(t*2)*.05));blink(ee,t,stun);f.visible=false;if(armor)armor.rotation.y=t*.45;})as Pose;return root;
}
function coralRay(){
 const root=new T.Group();root.name='raja-pari-karang';const rig=joint(root,0,.62,0,'ray-rig');rig.scale.setScalar(1.65);const top=satin(0x4c8496),under=satin(0xc7dad0),gold=satin(0xe3be7e),ink=satin(0x263d47),glow=new T.MeshBasicMaterial({color:0xaceade});
 const body=ell(rig,top,0,0,0,.4,.19,.58);body.name='ray-body';ell(rig,under,0,-.1,.05,.35,.1,.51);const wings:T.Group[]=[];
 for(const s of[-1,1]){const wing=joint(rig,s*.22,0,0,'ray-wing');wings.push(wing);const shape=new T.Shape();shape.moveTo(0,.42);shape.quadraticCurveTo(s*.4,.58,s*1.16,-.2);shape.quadraticCurveTo(s*.9,-.52,0,-.4);shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth:.065,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.025,bevelThickness:.025,curveSegments:8});geo.rotateX(Math.PI/2);add(wing,geo,top,0,.02,0).name='ray-wing-membrane';for(let i=0;i<3;i++){const q=ell(wing,gold,s*(.32+i*.18),.075,-.1-i*.025,.04,.015,.24-i*.035);q.rotation.y=-s*.25;}add(rig,new T.ConeGeometry(.07,.26,6),top,s*.25,.02,.58).rotation.x=Math.PI/2;}
 const ee=eyes(rig,.23,.16,.32,0xd9faeb);box(rig,.19,.025,.035,ink,0,-.07,.57);const tail=joint(rig,0,0,-.5,'ray-tail'),curve=new T.CatmullRomCurve3([new T.Vector3(),new T.Vector3(.03,-.025,-.4),new T.Vector3(.15,.02,-.85),new T.Vector3(.25,.11,-1.15)]);add(tail,new T.TubeGeometry(curve,16,.027,6,false),top);add(tail,new T.OctahedronGeometry(.085),gold,.25,.11,-1.15);for(let i=0;i<3;i++)add(rig,new T.ConeGeometry(.045,.16,5),gold,(i-1)*.1,.24,-.06);add(rig,new T.OctahedronGeometry(.1),glow,0,.24,.1).name='coral-core';const armor=shield(rig,.8,0,0xaceade);
 root.userData.animate=((t,speed,w,stun,hit,phase)=>{const swim=3+Math.min(1,speed)*2;wings.forEach((q,i)=>{q.rotation.z=(i?1:-1)*(Math.sin(t*swim)*.26+w*.25);q.rotation.x=Math.sin(t*swim+.7)*.035;});tail.rotation.set(Math.sin(t*swim)*.07,Math.sin(t*swim-.8)*.25,0);rig.position.y=.62+Math.sin(t*1.8)*.06;body.scale.y=.19*(1+w*.2);blink(ee,t,stun);armor.rotation.y=t*.45;glow.color.set(phase===3?0xe0c4f6:0xaceade);rig.rotation.z=stun?Math.sin(t*10)*.06:hit>0&&hit<.35?Math.sin(hit/.35*Math.PI)*.08:0;})as Pose;return root;
}
/** Original rigs use the existing game’s +Z facing and shared animation contract. */
function buildGuardian(area:AdventureArea,boss=false):T.Group{
 if(area==='classic')return forestGuardian(boss);
 if(area==='forest'){const m=boss?forestGuardian(true):pangolin();if(boss)m.name='raja-akar';return m;}
 if(area==='gorge')return gorgeGuardian(boss);
 if(area==='volcano'){const m=boss?gorgeGuardian(true):skink();m.name=boss?'raja-magma':'kadal-bara';m.traverse(o=>{if(o instanceof T.Mesh&&o.material instanceof T.MeshLambertMaterial){o.material=o.material.clone();o.material.color.lerp(new T.Color(0x55454b),.65);o.material.emissive.set(0x461a0b);}});const glow=new T.Mesh(new T.OctahedronGeometry(boss?.2:.1),new T.MeshBasicMaterial({color:0xffae66}));glow.position.set(0,boss?1.5:.7,.4);m.add(glow);return m;}
 if(area==='desert')return boss?sphinx():skink();
 if(area==='mountain')return goat(boss);
 if(area==='coast')return coconutCrab(boss);
 if(boss)return coralRay();const root=new T.Group(),water=aquaticGuardian(false),land=skink();root.name='amphibious-reef-keeper';root.add(water,land);root.userData.habitat=0;root.userData.animate=((...args:Parameters<Pose>)=>{const onLand=Number(root.userData.habitat||0);water.visible=onLand<.55;land.visible=onLand>.05;water.scale.setScalar(Math.max(.01,1-onLand));land.scale.setScalar(Math.max(.01,onLand));water.userData.animate?.(...args);land.userData.animate?.(...args);})as Pose;return root;
}

/** Blend gait amplitude and wake pose without altering root position or authoritative facing. */
export function biomeGuardian(area:AdventureArea,boss=false):T.Group{
 const root=buildGuardian(area,boss),animate=root.userData.animate;let speed=0,last=0,wakeLean=0,wakeOffset=0;const rig=root.children.find(o=>o.name.endsWith('-rig')||o.name==='rig');
 root.userData.animate=(time:number,wanted:number,windup:number,stunned:boolean,reaction:number,phase:number)=>{
  const dt=Math.min(.1,Math.max(0,time-last));last=time;speed+=(Math.min(1.5,wanted)-speed)*(1-Math.exp(-dt*12));
  if(rig){rig.rotation.x-=wakeLean;rig.position.y-=wakeOffset;}
  animate?.(time,speed,Math.max(0,Math.min(1,windup)),stunned,reaction,phase);
  const wake=root.userData.motion?.wake??1;wakeLean=boss?-(1-smooth01(wake))*.55:0;wakeOffset=boss?-(1-smooth01(wake))*.15:0;if(rig){rig.rotation.x+=wakeLean;rig.position.y+=wakeOffset;}if(boss&&wake<1)root.traverse(o=>{if(o.name==='guardian-eye')o.scale.y*=.15+.85*smooth01(wake);});
 };
 return root;
}
