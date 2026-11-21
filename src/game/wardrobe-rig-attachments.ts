import * as T from 'three';
import type { CharacterAppearance } from './character';
import {expeditionItem} from './expedition-equipment';

/** Distinct physical wardrobe parts, bound to the existing native GLB rig.
 * The base body/skinning belongs to the GLB; these are equipment only.
 * All parts are owned by the avatar clone and disposed alongside it.
 */
export function attachWardrobeEquipment(model:T.Object3D,appearance:CharacterAppearance,body:string,rawAppearance?:CharacterAppearance){
 const slot=(name:string)=>model.getObjectByName(name);
 const mat=(color:number,metalness=.05)=>new T.MeshStandardMaterial({color,roughness:.72,metalness,side:T.DoubleSide});
 const cream=mat(0xe9d49e),teal=mat(0x249e9b),wood=mat(0x956637),gold=mat(0xe9b951,.3),steel=mat(0x8fb3c1,.3);
 const add=(boneName:string,geometry:T.BufferGeometry,material:T.Material,name:string,position:[number,number,number],rotation?:[number,number,number])=>{
  const parent=slot(boneName);if(!parent)return;
  const mesh=new T.Mesh(geometry,material);mesh.name='wardrobe::'+name;mesh.position.set(...position);
  if(rotation)mesh.rotation.set(...rotation);
  mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);
  return mesh;
 };
 const sleeve=(bone:string,color:T.Material)=>{
  // A fitted raised glove cuff is visibly distinct from the native paw.
  add(bone,new T.CylinderGeometry(.102,.086,.185,14,1,true),color,'glove cuff',[0,-.10,.005]);
  add(bone,new T.CylinderGeometry(.099,.099,.025,14),gold,'glove trim',[0,-.035,.005]);
 };
 const glove=appearance.hands??'bare';
 if(glove!=='bare')for(const bone of ['ForeArm_L','ForeArm_R'])sleeve(bone,glove==='diver'?teal:glove==='desert'?cream:glove==='climber'?steel:wood);
 const feet=appearance.feet??'bare';
 if(feet!=='bare')for(const bone of ['Shin_L','Shin_R']){
  const shoeColor=feet==='diver'?teal:feet==='desert'?cream:feet==='climber'?steel:wood;
  add(bone,new T.CylinderGeometry(.139,.125,.13,14),shoeColor,'boot guard',[0,-.095,.014]);
  if(feet==='diver'){
   // Fins extend forward from boot toes (player faces local +Z).
   const fin=new T.Shape();fin.moveTo(-.13,0);fin.lineTo(.13,0);fin.lineTo(.20,.40);fin.lineTo(-.20,.40);fin.closePath();
   const mesh=add(bone,new T.ExtrudeGeometry(fin,{depth:.035,bevelEnabled:true,bevelThickness:.013,bevelSize:.012,bevelSegments:2}),teal,'swim fin',[0,-.23,.19],[-Math.PI/2,0,0]);
   if(mesh)mesh.scale.setScalar(.70);
  }
 }
 const torso=body||appearance.body;
 if(torso==='explorer'||torso==='climber'||torso==='desert'||torso==='aurora'){
  // Raised crossbody utility belt and shoulder flaps, not decals.
  add('Spine',new T.TorusGeometry(.30,.024,8,28),wood,'utility belt',[0,-.36,0],[Math.PI/2,0,0]);
  for(const side of [-1,1])add('Spine',new T.BoxGeometry(.105,.095,.042),torso==='aurora'?teal:cream,'vest pouch',[side*.19,-.29,.33]);
 }
 if(torso==='raincoat'||torso==='space'||torso==='diver'){
  // Structured back mantle with a gap around the hips; no rigid sphere shell.
  const capeShape=new T.Shape();capeShape.moveTo(-.29,.15);capeShape.lineTo(.29,.15);capeShape.lineTo(.34,-.52);capeShape.quadraticCurveTo(0,-.63,-.34,-.52);capeShape.closePath();
  const material=torso==='raincoat'?mat(0xe9bc4e):torso==='space'?steel:teal;
  add('Spine',new T.ExtrudeGeometry(capeShape,{depth:.023,bevelEnabled:true,bevelThickness:.01,bevelSize:.009,bevelSegments:2}),material,'jacket back panel',[0,0,-.35]);
  add('Spine',new T.BoxGeometry(.17,.13,.032),torso==='space'?gold:steel,'suit chest plate',[0,-.09,.34]);
 }
 const back=appearance.back??'bare';
 if(back==='cape'||back==='wings'){
  const capeShape=new T.Shape();capeShape.moveTo(-.24,.10);capeShape.lineTo(.24,.10);capeShape.lineTo(.34,-.52);capeShape.quadraticCurveTo(0,-.6,-.34,-.52);capeShape.closePath();
  add('Spine',new T.ExtrudeGeometry(capeShape,{depth:.03,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:2}),back==='cape'?teal:cream,back+' rear accessory',[0,.06,-.47]);
  if(back==='wings')for(const side of [-1,1]){
   const wing=new T.Shape();wing.moveTo(0,0);wing.quadraticCurveTo(side*.32,.28,side*.47,.08);wing.quadraticCurveTo(side*.25,-.22,0,-.30);wing.closePath();
   add('Spine',new T.ExtrudeGeometry(wing,{depth:.035,bevelEnabled:false}),gold,'wing',[side*.10,.01,-.5]);
  }
 }
 if(back==='diver'){
  for(const side of [-1,1]){
   add('Spine',new T.CylinderGeometry(.065,.068,.40,12),steel,'oxygen cylinder',[side*.13,-.08,-.53]);
   add('Spine',new T.CylinderGeometry(.049,.049,.035,12),gold,'oxygen cap',[side*.13,.13,-.53]);
  }
 }
 if(back==='climber'||back==='desert'){
  add('Spine',new T.TorusGeometry(.16,.027,8,24),back==='climber'?steel:wood,'stowed rope',[0,-.1,-.59]);
 }
 const face=appearance.face??'bare';
 if(face==='diver'||face==='mask'||face==='desert'){
  const visorMat=face==='diver'?new T.MeshStandardMaterial({color:0x54cfda,transparent:true,opacity:.64,metalness:.25,roughness:.2,side:T.DoubleSide}):face==='desert'?mat(0xcda95c):teal;
  add('Head',new T.BoxGeometry(.34,.105,.024),visorMat,'facial visor',[0,.08,.39]);
 }
 const head=appearance.head??'bare';
 if(head==='crown'||head==='moon'){
  add('Head',new T.TorusGeometry(.295,.029,8,40),head==='moon'?steel:gold,'head crown',[0,.36,-.005],[Math.PI/2,0,0]);
  for(let i=0;i<5;i++){
   const a=i*Math.PI*2/5;
   const crest=new T.ConeGeometry(.05,.13,5);
   add('Head',crest,head==='moon'?teal:gold,'crown crest',[Math.sin(a)*.29,.42,Math.cos(a)*.26]);
  }
 }
 // Distinguish world-earned equipment by its actual item ID rather than
 // flattening all expedition rewards into the same base costume style.
 const arenaColors:Record<string,number>={forest:0x54b978,desert:0xe4bc5c,gorge:0x7eaa93,mountain:0x9bc6dd,coast:0x69ced0,sea:0x3abdd6,volcano:0xe78a53};
 if(rawAppearance)for(const id of Object.values(rawAppearance)){
  const gear=expeditionItem(id);if(!gear)continue;
  const crestColor=mat(arenaColors[gear.area]??0x3abdd6,.25);
  const motif=new T.Shape();motif.moveTo(0,.08);motif.lineTo(.065,0);motif.lineTo(0,-.08);motif.lineTo(-.065,0);motif.closePath();
  const motifGeometry=new T.ExtrudeGeometry(motif,{depth:.014,bevelEnabled:false});
  if(gear.slot==='body'){
   add('Spine',new T.BoxGeometry(.26,.15,.05),crestColor,'arena armor chest',[0,-.09,.338]);
   add('Spine',motifGeometry,gold,'arena armor insignia',[0,-.09,.368]);
  }else if(gear.slot==='back'){
   if(gear.effect==='weapon'){
    // Weapon stowed behind the hero; gameplay wielding is handled separately.
    add('Spine',new T.CylinderGeometry(.075,.087,.45,10),crestColor,'stowed world weapon',[.23,-.01,-.51],[.26,0,.25]);
    add('Spine',new T.CylinderGeometry(.09,.065,.09,10),steel,'weapon muzzle',[.28,.19,-.58],[.26,0,.25]);
   }else if(gear.effect==='tank'){
    for(const x of [-.11,.11]){
     add('Spine',new T.CylinderGeometry(.078,.078,.45,12),crestColor,'earned oxygen cylinder',[x,-.07,-.52]);
     add('Spine',new T.CylinderGeometry(.077,.077,.03,12),steel,'cylinder valve',[x,.17,-.52]);
    }
   }else{
    add('Spine',new T.TorusGeometry(.15,.031,9,22),crestColor,'earned expedition tool',[0,-.18,-.52]);
    add('Spine',motifGeometry,gold,'pack token',[0,-.18,-.575]);
   }
  }else if(gear.slot==='feet'){
   for(const bone of ['Shin_L','Shin_R'])add(bone,new T.BoxGeometry(.14,.045,.11),crestColor,'earned boots plate',[0,-.08,.17]);
  }else if(gear.slot==='hands'){
   for(const bone of ['ForeArm_L','ForeArm_R'])add(bone,new T.BoxGeometry(.09,.13,.055),crestColor,'earned gauntlet plate',[0,-.12,.105]);
  }else if(gear.slot==='face'){
   add('Head',new T.BoxGeometry(.35,.065,.024),crestColor,'earned goggles trim',[0,.13,.42]);
  }
 }
 const tail=appearance.tail??'bare';
 if(tail==='bow'||tail==='leaf'||tail==='star'){
  add('TailBase',new T.TorusGeometry(.10,.028,8,24),tail==='star'?gold:teal,'tail accessory',[0,-.03,-.24],[0,0,.5]);
 }
}
