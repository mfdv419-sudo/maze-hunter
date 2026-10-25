import * as T from 'three';
import {roundBox,satin,addMesh,joint} from './model-parts';
export function forestGuardian(boss=false){
 const root=new T.Group();root.name=boss?'raja-rimbun':'seed-guardian';root.userData.modelVersion='forest-12';const rig=joint(root,0,0,0,'guardian-rig');rig.scale.setScalar(boss?1.65:1);
 const bark=satin(boss?0x815a3e:0xa58256),light=satin(0xbb9565),leaf=satin(boss?0x396c49:0x75a456),gold=satin(0xe8bd67),ink=satin(0x233c35),cream=new T.MeshBasicMaterial({color:0xf9eed2}),glow=new T.MeshBasicMaterial({color:0xa8e4be}),fruit=satin(0xb46bba);
 const torso=joint(rig,0,.58,0,'trunk');addMesh(torso,new T.CylinderGeometry(.25,.31,.58,12),bark);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;const seam=addMesh(torso,new T.CylinderGeometry(.012,.016,.43,4),light,Math.sin(a)*.265,-.025,Math.cos(a)*.265);seam.rotation.z=Math.sin(a)*.04;}
 const head=joint(rig,0,1.0,.015,'guardian-head');addMesh(head,roundBox(.54,.43,.46,.12),bark);const eyes:T.Group[]=[];
 for(const side of [-1,1]){const e=joint(head,side*.13,.035,.238);eyes.push(e);addMesh(e,new T.SphereGeometry(.072,10,6),boss?glow:cream).scale.set(1,1.1,.35);addMesh(e,new T.SphereGeometry(.037,8,6),ink,0,0,.025).scale.z=.4;addMesh(e,new T.SphereGeometry(.013,6,4),cream,-side*.012,.022,.04);const brow=addMesh(head,roundBox(.16,.045,.035,.012),leaf,side*.13,.135,.24);brow.rotation.z=side*.2;}
 const mouth=addMesh(head,new T.TorusGeometry(.065,.014,5,12,Math.PI),ink,0,-.1,.24);mouth.rotation.z=boss?0:Math.PI;
 const arms:T.Group[]=[],elbows:T.Group[]=[],legs:T.Group[]=[];
 for(const side of [-1,1]){const shoulder=joint(rig,side*.3,.8,0,'guardian-shoulder');arms.push(shoulder);addMesh(shoulder,new T.CapsuleGeometry(.085,.14,3,8),bark,0,-.08,0);const elbow=joint(shoulder,0,-.2,0,'guardian-elbow');elbows.push(elbow);addMesh(elbow,new T.CapsuleGeometry(.073,.11,3,8),bark,0,-.04,0);for(let i=0;i<3;i++){const finger=addMesh(elbow,new T.CapsuleGeometry(.024,.09,2,5),light,(i-1)*.046,-.16,.015);finger.rotation.z=(i-1)*-.13;}
  const leg=joint(rig,side*.16,.35,0,'guardian-hip');legs.push(leg);addMesh(leg,new T.CapsuleGeometry(.09,.15,3,8),bark,0,-.1,0);addMesh(leg,roundBox(.2,.1,.25,.04),bark,0,-.28,.045);const pauldron=addMesh(rig,new T.IcosahedronGeometry(.18,1),leaf,side*.3,.84,-.025);pauldron.scale.set(1.2,.55,1);}
 const held=addMesh(elbows[1],new T.SphereGeometry(.085,9,6),fruit,0,-.12,.13);held.name='held-poison-fruit';addMesh(held,new T.ConeGeometry(.035,.07,4),leaf,0,.095,0);
 if(boss){addMesh(head,new T.CylinderGeometry(.3,.31,.08,12),gold,0,.28,0);for(let i=0;i<6;i++){const a=i*Math.PI/3;addMesh(head,new T.ConeGeometry(.06,.23,6),gold,Math.sin(a)*.25,.4,Math.cos(a)*.25);}addMesh(head,new T.OctahedronGeometry(.09),glow,0,.31,.31);for(let i=0;i<5;i++){const panel=addMesh(rig,roundBox(.15,.55,.035,.015),leaf,(i-2)*.11,.57,-.3);panel.rotation.z=(i-2)*-.06;}}
 else {const hat=addMesh(head,new T.ConeGeometry(.36,.27,10),leaf,0,.33,0);hat.rotation.z=.1;addMesh(rig,roundBox(.12,.14,.025,.015),gold,0,.65,.29);}
 const armor=new T.Group();armor.name='king-armor';if(boss)for(let i=0;i<3;i++){const ring=addMesh(armor,new T.TorusGeometry(.46,.018,5,24),new T.MeshBasicMaterial({color:0x92e2ba,transparent:true,opacity:.6}),0,.72,0);ring.rotation.x=i*Math.PI/3;ring.rotation.z=i*.8;}rig.add(armor);
 const stars=new T.Group();rig.add(stars);for(let i=0;i<3;i++)addMesh(stars,new T.OctahedronGeometry(.035),gold,Math.sin(i*2.09)*.23,1.65,Math.cos(i*2.09)*.23);
 root.userData.animate=(time:number,speed:number,windup:number,stunned:boolean,reaction:number,phase:number)=>{
  const stride=Math.sin(time*(boss?6:9))*Math.min(1,speed)*.48;rig.position.y=Math.sin(time*2)*.008+Math.abs(stride)*.025;torso.rotation.x=-Math.min(1,speed)*.07;head.rotation.z=Math.sin(time*1.4)*.025;head.rotation.y=Math.sin(time*.8)*.06;
  legs.forEach((l,i)=>l.rotation.x=i?-stride:stride);arms.forEach((a,i)=>{a.rotation.x=i?stride:-stride;a.rotation.z=(i?1:-1)*.14;});elbows.forEach(e=>e.rotation.x=-.2);
  if(windup>0){arms[1].rotation.x=-Math.sin(windup*Math.PI/2)*2.2;elbows[1].rotation.x=-.65;torso.rotation.y=-windup*.25;head.rotation.z=-windup*.08;}else torso.rotation.y=0;
  if(reaction>0&&reaction<.35){const p=Math.sin(reaction/.35*Math.PI);torso.rotation.x+=p*.22;head.rotation.x=-p*.15;}else head.rotation.x=0;
  const blink=time%5>4.83?.12:1;eyes.forEach(e=>e.scale.y=stunned?.45:blink*(boss?.85:1));stars.visible=stunned;stars.rotation.y=time*3;if(stunned)head.rotation.z=Math.sin(time*12)*.1;held.visible=windup>0;
  armor.rotation.y=time*.8;if(boss&&windup>.1){arms[0].rotation.x=-windup*2.3;torso.rotation.x=-windup*.22;legs.forEach((l,i)=>l.rotation.z=(i?1:-1)*windup*.1); }else legs.forEach(l=>l.rotation.z=0);
  if(boss)glow.color.set(phase===3?0xffd47b:phase===2?0xb5d8ed:0xa8e4be);
 };
 return root;
}
