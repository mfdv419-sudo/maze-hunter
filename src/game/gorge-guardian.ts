import * as T from 'three';
import {addMesh as add,joint,roundBox,satin} from './model-parts';
/** Original rocky crab and amber-core monarch; compatible with the shared combat timeline. */
export function gorgeGuardian(boss=false){
 const root=new T.Group();root.name=boss?'raja-batu-retak':'ketam-tebing';
 const rig=joint(root,0,0,0,'gorge-rig');rig.scale.setScalar(boss?1.65:1);
 const rock=satin(boss?0x855d51:0xb07e64),edge=satin(0xd0a17d),dark=satin(0x403b45),amber=new T.MeshBasicMaterial({color:0xffca76}),eye=new T.MeshBasicMaterial({color:0xfff5d8});
 const legs:T.Group[]=[],arms:T.Group[]=[],claws:T.Group[]=[],eyes:T.Mesh[]=[];
 let body:T.Group;
 if(!boss){
  body=joint(rig,0,.44,0,'rock-carapace');const shell=add(body,new T.DodecahedronGeometry(.43,0),rock);shell.scale.set(1.2,.65,.9);
  for(let i=0;i<3;i++){const ridge=add(body,roundBox(.12,.08,.7,.025),edge,(i-1)*.22,.17,-.02);ridge.rotation.z=(i-1)*-.17;}
  for(const side of [-1,1])for(let i=0;i<3;i++){
   const leg=joint(rig,side*.31,.36,(i-1)*.21,'crab-leg');legs.push(leg);
   const upper=add(leg,new T.CapsuleGeometry(.044,.23,2,6),rock,side*.13,-.07,0);upper.rotation.z=side*.95;
   const lower=add(leg,new T.ConeGeometry(.06,.29,5),edge,side*.26,-.23,0);lower.rotation.z=-side*.35;
  }
  for(const side of [-1,1]){
   add(body,new T.CylinderGeometry(.027,.04,.18,6),dark,side*.15,.18,.28);
   eyes.push(add(body,new T.SphereGeometry(.067,8,6),eye,side*.15,.29,.28));
   add(body,new T.SphereGeometry(.032,6,4),dark,side*.15,.29,.333);
   const arm=joint(rig,side*.37,.44,.23,'crab-arm');arms.push(arm);
   const limb=add(arm,new T.CapsuleGeometry(.064,.18,3,7),rock,side*.12,0,.1);limb.rotation.z=side*1.0;
   const claw=joint(arm,side*.22,.015,.22,'crab-claw');claws.push(claw);
   add(claw,new T.DodecahedronGeometry(.15,0),edge).scale.set(1,.8,1.35);
   for(const s of [-1,1]){const tip=add(claw,new T.ConeGeometry(.07,.2,5),rock,s*.07,.03,.17);tip.rotation.x=Math.PI/2;tip.rotation.z=s*.2;}
  }
 }else{
  body=joint(rig,0,.91,0,'stone-torso');const torso=add(body,new T.DodecahedronGeometry(.5,0),rock);torso.scale.set(1.15,1.2,.76);
  const core=add(body,new T.OctahedronGeometry(.21),amber,0,.05,.38);core.name='amber-core';
  for(const side of [-1,1]){
   for(let i=0;i<2;i++){const fissure=add(body,roundBox(.035,.19,.025,.008),amber,side*(.15+i*.1),.1-i*.12,.37);fissure.rotation.z=side*.7;}
   const leg=joint(rig,side*.25,.51,0,'stone-hip');legs.push(leg);add(leg,new T.DodecahedronGeometry(.23),rock,0,-.1,0).scale.y=1.4;add(leg,roundBox(.32,.18,.4,.045),edge,0,-.4,.06);
   const arm=joint(rig,side*.53,1.19,0,'stone-shoulder');arms.push(arm);add(arm,new T.DodecahedronGeometry(.25),edge);add(arm,new T.CapsuleGeometry(.14,.3,3,7),rock,0,-.27,0);const fist=add(arm,new T.DodecahedronGeometry(.24),rock,0,-.59,.04);fist.scale.set(1.2,1.1,1);
  }
  const head=joint(body,0,.66,.03,'stone-head');add(head,new T.DodecahedronGeometry(.32),edge).scale.set(1.1,.85,.85);
  for(const side of [-1,1]){eyes.push(add(head,roundBox(.14,.06,.045,.012),amber,side*.13,.01,.26));const crown=add(head,new T.ConeGeometry(.1,.39,5),rock,side*.23,.38,-.02);crown.rotation.z=-side*.2;}
  add(head,new T.OctahedronGeometry(.12),amber,0,.33,.05);add(head,roundBox(.2,.035,.03,.01),dark,0,-.13,.26);
 }
 const armor=new T.Group();armor.name='king-armor';rig.add(armor);
 if(boss)for(let i=0;i<3;i++){const panel=add(armor,new T.DodecahedronGeometry(.16),edge,Math.sin(i*2.1)*.58,.95,Math.cos(i*2.1)*.47);panel.name='orbiting-stone';}
 const fruit=add(arms[1],new T.SphereGeometry(.09,7,5),satin(0x986b9e),0,boss?-.58:.07,.23);fruit.name='held-poison-fruit';
 root.userData.animate=(time:number,speed:number,windup:number,stunned:boolean,reaction:number,phase:number)=>{
  const moving=Math.min(1,speed),stride=Math.sin(time*(boss?5:10))*moving;
  body.position.y=(boss?.91:.44)+Math.sin(time*2.3)*.012+Math.abs(stride)*.025;
  body.rotation.x=windup*(boss?-.16:.12);body.rotation.z=stunned?Math.sin(time*13)*.08:Math.sin(time*2)*.018;
  if(reaction>0&&reaction<.35)body.rotation.x+=Math.sin(reaction/.35*Math.PI)*.25;
  legs.forEach((leg,i)=>{leg.rotation.x=boss?(i?1:-1)*stride*.35:Math.sin(time*10+i*Math.PI*.7)*moving*.25;leg.rotation.z=boss?0:Math.cos(time*10+i*Math.PI*.7)*moving*.13;});
  arms.forEach((arm,i)=>{arm.rotation.x=-windup*(boss?2.4:1.1)+(i?1:-1)*stride*.15;arm.rotation.z=(i?1:-1)*(windup*.15+Math.sin(time*1.8)*.035);});
  claws.forEach((c,i)=>c.rotation.y=(i?1:-1)*(.1+windup*.4+Math.sin(time*2)*.03));
  eyes.forEach(e=>e.scale.y=stunned?.4:time%5>4.86?.15:1);
  armor.rotation.y=time*.65;armor.children.forEach((o,i)=>o.position.y=.95+Math.sin(time*1.8+i)*.07);
  amber.color.set(phase>=3?0xff985e:phase===2?0xffb666:0xffca76);fruit.visible=windup>.05;
 };
 return root;
}
