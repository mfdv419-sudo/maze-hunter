import * as T from 'three';
import {addMesh,joint,roundBox,satin} from './model-parts';
import {plushMaterial,detailMaterial,organicOrb,curvedBand,ovalRing} from './organic-avatar';
const box=(p:T.Object3D,w:number,h:number,d:number,m:T.Material,x:number,y:number,z:number,r=.025)=>addMesh(p,roundBox(w,h,d,r),m,x,y,z);
const ell=(p:T.Object3D,m:T.Material,x:number,y:number,z:number,sx:number,sy:number,sz:number)=>organicOrb(p,m,'rounded-detail',x,y,z,sx,sy,sz);
/** Single stylized binturong paw shared by home preview and in-game avatar.
 * Paw-first silhouette: no explicit human-like finger geometry and no duplicate hand mass.
 */
export function gloveModel(parent:T.Group,kind:string,side:number,furColor=0x343b40){
 const root=joint(parent,0,-.122,.009,'paw-hand');root.userData.gear=kind;
 root.userData.handModel='binturong-paw-palms-inward-organic-v2';
 // Pads face the trouser seams, rather than appearing like open human palms.
 root.rotation.y=side*Math.PI/2;
 const bare=kind==='bare';
 const colors:Record<string,number>={trail:0x638b71,climber:0xc77951,desert:0xc7ac7b,diver:0x457481};
 const paw=plushMaterial(bare?furColor:colors[kind]??colors.trail),pad=plushMaterial(0x604b50),trim=detailMaterial(kind==='diver'?0x81d2c6:kind==='climber'?0xf2c878:0xe9d6af);
 // Wrist and palm are intersecting smooth volumes with a single animal-paw silhouette.
 organicOrb(root,paw,'paw-continuous-base',0,-.005,0,.072,.109,.077);
 organicOrb(root,paw,'paw-palm-integrated',0,-.086,.012,.101,.111,.087,'paw');
 for(let i=0;i<4;i++){
  const dx=(i-1.5)*.041;
  const toe=organicOrb(root,paw,`paw-finger-${i+1}`,dx,-.168,.048,.032,.043,.045,'paw');
  // Match names from the earlier three-digit render for compatibility without a second mesh.
  if(i<3){const alias=joint(toe,0,0,0,`paw-digit-${i+1}`);alias.userData.aliasOnly=true;}
  organicOrb(root,pad,'finger-pad',dx,-.18,.084,.017,.012,.010);
 }
 organicOrb(root,paw,'paw-thumb',side*.081,-.106,-.008,.035,.067,.048);
 organicOrb(root,pad,'paw-center-pad',0,-.096,.095,.060,.035,.012);
 if(!bare){
  const band=ovalRing(root,trim,'glove-cuff',0,.017,0,.080,.071,.010);band.rotation.x=Math.PI/2;
  const cuff=organicOrb(root,paw,'rounded-glove-cuff',0,.027,0,.082,.029,.077);
 }
 return root;
}
export function bootModel(parent:T.Group,kind:string,side:number){
 const root=joint(parent,0,-.091,.050,'boots');root.userData.gear=kind;
 const bare=kind==='bare';const colors:Record<string,number>={trail:0x927653,climber:0xb76d4f,desert:0xcbb189,diver:0x326779};
 const surface=plushMaterial(bare?0x343b40:colors[kind]??colors.trail),pad=plushMaterial(0x5a4b51),trim=detailMaterial(kind==='diver'?0x80d7cc:0xe5d6b4);
 const foot=organicOrb(root,surface,'continuous-foot-paw',0,-.011,.063,.121,.086,.179,'paw');
 for(let i=0;i<4;i++){
  const dx=(i-1.5)*.050;
  organicOrb(root,surface,`foot-paw-digit-${i+1}`,dx,-.016,.196,.033,.046,.066,'paw');
  organicOrb(root,pad,'foot-toe-pad',dx,-.073,.220,.024,.009,.025);
 }
 organicOrb(root,pad,'foot-center-pad',0,-.087,.067,.078,.010,.052);
 if(!bare){
  organicOrb(root,surface,'soft-boot-upper',0,.062,-.024,.104,.092,.101);
  const band=ovalRing(root,trim,'boot-cuff',0,.125,-.024,.102,.102,.013);band.rotation.x=Math.PI/2;
  if(kind==='diver'){
   const fin=organicOrb(root,surface,'soft-swim-fin',0,-.063,.284,.134,.027,.210,'paw');fin.rotation.x=-.04;
   for(const s of [-1,1])curvedBand(root,trim,'fin-rib',[[s*.070,-.048,.149],[s*.091,-.046,.290],[s*.099,-.049,.430]],.007);
  }else if(kind==='climber'){
   const tab=organicOrb(root,trim,'climbing-hook-base',side*.105,.07,.026,.024,.022,.025);
  }
 }
 return root;
}
export function expeditionWearables(body:T.Group,head:T.Group,arms:T.Group[],legs:T.Group[],a:{body:string;head:string;face:string;back:string}){
 const ink=detailMaterial(0x253c43),cream=plushMaterial(0xf4e4c4),gold=detailMaterial(0xe8bd6e,.35),teal=detailMaterial(0x46b6ad),moon=detailMaterial(0xa9d9d7),sand=plushMaterial(0xd5bd8d),orange=detailMaterial(0xd18054);
 if(a.body==='explorer'){
  for(const side of [-1,1]){
   organicOrb(body,plushMaterial(0x748d64),'forest-vest-pocket',side*.135,.548,.253,.072,.067,.035);
   curvedBand(body,cream,'forest-vest-seam',[[side*.11,.618,.257],[side*.145,.622,.257],[side*.18,.61,.233]],.009);
  }
  const belt=ovalRing(body,ink,'waist-belt',0,.412,0,.246,.218,.027);belt.rotation.x=Math.PI/2;
  organicOrb(body,gold,'belt-buckle',0,.408,.217,.047,.036,.018);
 }
 if(a.body==='climber'){
  const belt=ovalRing(body,ink,'climbing-harness',0,.422,0,.263,.225,.029);belt.rotation.x=Math.PI/2;
  organicOrb(body,gold,'climber-buckle',0,.425,.245,.044,.041,.023);
  for(const side of [-1,1]){
   curvedBand(body,ink,'harness-strap',[[side*.18,.795,.10],[side*.18,.66,.234],[side*.15,.43,.24]],.025);
   const loop=ovalRing(legs[side<0?0:1],ink,'thigh-loop',0,-.071,0,.112,.092,.020);loop.rotation.x=Math.PI/2;
  }
  const clip=ovalRing(body,gold,'climbing-ring',.220,.418,.143,.044,.044,.013);clip.rotation.z=.25;
 }
 if(a.body==='desert'){
  const belt=ovalRing(body,plushMaterial(0x8d7253),'desert-belt',0,.457,0,.248,.210,.029);belt.rotation.x=Math.PI/2;
  for(const side of [-1,1]){
   const flap=organicOrb(body,sand,'desert-vest-flap',side*.12,.39,.196,.125,.11,.040);flap.rotation.z=-side*.08;
   const wrap=organicOrb(body,cream,'desert-shoulder-wrap',side*.225,.757,0,.123,.074,.18);wrap.rotation.z=-side*.15;
  }
 }
 if(a.body==='diver'){
  for(const side of [-1,1]){
   curvedBand(body,teal,'diver-vest-zip',[[side*.175,.78,.14],[side*.182,.60,.240],[side*.170,.44,.20]],.026);
   organicOrb(arms[side<0?0:1],moon,'diver-shoulder',0,-.06,0,.090,.068,.094);
  }
  const belt=ovalRing(body,ink,'diving-belt',0,.422,0,.252,.208,.029);belt.rotation.x=Math.PI/2;
  for(let i=0;i<3;i++)organicOrb(body,gold,'diving-buckle',(i-1)*.11,.416,.219,.027,.029,.015);
 }
 if(a.head==='climber'){
  organicOrb(head,orange,'climbing-helmet',0,.268,-.028,.355,.154,.279);
  const rim=ovalRing(head,ink,'helmet-rim',0,.242,.0,.345,.277,.020);rim.rotation.x=Math.PI/2;
  organicOrb(head,ink,'headlamp-base',0,.331,.277,.070,.050,.030);
  organicOrb(head,cream,'headlamp-light',0,.334,.310,.044,.030,.012);
  for(const side of [-1,1])curvedBand(head,ink,'helmet-strap',[[side*.314,.20,.022],[side*.30,.04,.130],[side*.21,-.13,.19]],.013);
 }
 if(a.head==='desert'){
  organicOrb(head,cream,'desert-head-wrap',0,.271,-.014,.356,.144,.282);
  for(let i=0;i<3;i++){
   const band=ovalRing(head,i%2?sand:cream,'turban-fold',0,.205+i*.044,.005,.290+i*.005,.271+i*.004,.022);
   band.rotation.x=Math.PI/2;
  }
  organicOrb(head,cream,'desert-side-drape',-.282,.05,-.141,.077,.194,.053);
 }
 if(a.head==='diver'){
  organicOrb(head,teal,'diving-cap',0,.243,-.055,.347,.142,.255);
  for(const side of [-1,1])organicOrb(head,ink,'diving-strap',side*.29,.143,-.013,.026,.104,.082);
 }
 if(a.face==='desert'){
  const lens=new T.MeshPhongMaterial({color:0xe8cda4,transparent:true,opacity:.19,shininess:65,depthWrite:false});
  for(const side of [-1,1]){
   ovalRing(head,sand,'glasses-frame',side*.168,.031,.35,.119,.112,.027);
   organicOrb(head,lens,'tinted-lens',side*.168,.031,.35,.096,.092,.008);
   curvedBand(head,sand,'desert-goggle-arm',[[side*.27,.045,.33],[side*.35,.055,.16]],.014);
  }
  curvedBand(head,sand,'desert-bridge',[[-.05,.05,.35],[0,.06,.36],[.05,.05,.35]],.013);
 }
 if(a.face==='diver'){
  const lens=new T.MeshPhongMaterial({color:0x93ddd8,transparent:true,opacity:.22,shininess:85,depthWrite:false});
  const mask=joint(head,0,.023,.352,'diving-mask');
  const shield=organicOrb(mask,lens,'diving-mask-lens',0,0,.016,.253,.123,.032);
  const rim=ovalRing(mask,ink,'diving-mask-seal',0,0,.026,.254,.124,.028);
  for(const side of [-1,1])curvedBand(head,ink,'mask-strap',[[side*.25,.03,.350],[side*.351,.037,.14],[side*.34,.05,-.08]],.021);
  organicOrb(head,ink,'diver-mouthpiece',0,-.145,.445,.065,.052,.04);
  const tube=curvedBand(head,ink,'snorkel-tube',[[.055,-.14,.43],[.30,-.18,.28],[.355,-.105,.02],[.28,.18,-.08]],.020);
 }
 if(a.back==='climber'){
  const pack=joint(body,0,.59,-.267,'climbing-pack');
  organicOrb(pack,orange,'climbing-backpack',0,.005,-.056,.216,.24,.151,'torso');
  organicOrb(pack,gold,'climbing-pack-flap',0,.146,-.165,.21,.068,.058);
  for(const side of [-1,1])curvedBand(body,gold,'climbing-backpack-straps',[[side*.18,.80,-.14],[side*.23,.65,.02],[side*.19,.47,.04]],.019);
  for(let i=0;i<3;i++){
   const rope=ovalRing(pack,cream,'coiled-climbing-rope',0,-.025,-.187-i*.013,.107,.135,.014);
  }
  const hook=ovalRing(pack,moon,'pack-hook',.175,-.044,-.05,.045,.047,.014);
 }
 if(a.back==='diver'){
  const tank=joint(body,0,.58,-.281,'diving-tank');
  for(const side of [-1,1]){
   const cylinder=addMesh(tank,new T.CapsuleGeometry(.082,.295,7,20),moon,side*.095,.008,-.035);
   cylinder.name='oxygen-cylinder';
   const buckle=ovalRing(tank,ink,'cylinder-band',side*.095,.105,-.035,.090,.089,.017);buckle.rotation.x=Math.PI/2;
   const buckle2=ovalRing(tank,ink,'cylinder-band',side*.095,-.104,-.035,.090,.089,.017);buckle2.rotation.x=Math.PI/2;
   addMesh(tank,new T.CylinderGeometry(.028,.028,.07,12),gold,side*.095,.248,-.035).name='tank-valve';
  }
  for(const side of [-1,1])curvedBand(body,ink,'diving-harness',[[side*.20,.84,-.17],[side*.23,.62,.02],[side*.20,.46,.04]],.021);
 }
}

/** Lightweight props for the earned expedition weapon displayed on the outfit. */
export function expeditionWeaponModel(area:import('./expedition-equipment').EquipmentArea) {
 const g=new T.Group();
 g.name=area+'-expedition-weapon';
 const metal=satin(0x455966);
 const color={forest:0xa7844e,desert:0xd2a961,gorge:0xa39d81,mountain:0x89cede,coast:0xddba74,sea:0x49b2ac,volcano:0xd96947}[area];
 const surface=satin(color);
 const light=satin(area==='sea'?0xb2ece2:0xf6dc9a);
 const line=(points:T.Vector3[],radius:number,material:T.Material)=>addMesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points),12,radius,5,false),material);
 if(area==='forest'){
  line([new T.Vector3(.02,-.35,0),new T.Vector3(-.11,-.18,0),new T.Vector3(-.17,0,0),new T.Vector3(-.11,.18,0),new T.Vector3(.02,.35,0)],.027,surface);
  addMesh(g,new T.CylinderGeometry(.005,.005,.7,5),light,.02,0,0);
 }else if(area==='sea'){
  box(g,.2,.31,.13,metal,0,-.12,0,.035);
  addMesh(g,new T.CylinderGeometry(.12,.095,.28,7),surface,0,.075,0);
  for(const side of [-1,1]){
   line([new T.Vector3(side*.07,.10,0),new T.Vector3(side*.16,.21,0),new T.Vector3(side*.13,.32,0),new T.Vector3(side*.025,.38,0)],.043,surface);
   addMesh(g,new T.CylinderGeometry(.023,.027,.18,6),light,side*.042,.19,.018);
  }
 }else{
  const rod=area==='coast'||area==='mountain';
  addMesh(g,new T.CylinderGeometry(rod?.028:.075,rod?.031:.09,rod?.62:.44,7),metal,0,0,0);
  if(rod){
   addMesh(g,new T.OctahedronGeometry(area==='mountain'?.12:.075,0),surface,0,.35,0).scale.y=1.5;
   addMesh(g,new T.CylinderGeometry(.045,.045,.065,6),light,0,.23,0);
  }else{
   box(g,.19,.24,.15,surface,0,.01,0,.032);
   for(const side of [-1,1])box(g,.04,.18,.115,light,side*.085,.01,.015,.009);
   addMesh(g,new T.CylinderGeometry(.085,.071,.072,8),surface,0,.24,0);
  }
 }
 return g;
}


/** Visuals are attached to the SAME avatar rig used by Home, Wardrobe and gameplay.
 * These are display details for equipped items, not extra inventory grants.
 */
export function equippedExpeditionDetails(
 body:T.Group,head:T.Group,arms:T.Group[],legs:T.Group[],
 items:ReadonlyArray<{area:string;rank:number;slot:string;style:string}>
){
 const accents:Record<string,number>={forest:0x79b16b,desert:0xefc976,gorge:0xb5a48a,mountain:0xc7e6f4,coast:0x67d8c3,sea:0x52d6da,volcano:0xf59a50};
 for(const item of items){
  const hue=accents[item.area]??0xbad6b5,cloth=satin(hue),dark=satin(0x263c43),brass=satin(0xe5c77f);
  const root=joint(item.slot==='face'?head:body,0,0,0,`equipment-${item.area}-${item.rank}`);
  root.userData.equipmentArea=item.area;root.userData.equipmentRank=item.rank;
  if(item.slot==='feet'){
   // Visible shoe accent follows each animated knee/foot, not the stationary torso.
   root.visible=false;
   legs.forEach((leg,i)=>{const tag=joint(leg,0,-.145,.17,`equipment-shoe-${item.area}-${i}`);organicOrb(tag,cloth,'soft-shoe-highlight',0,0,0,.11,.021,.060);});
  }else if(item.slot==='face'){
   if(!['sea','coast','desert','mountain'].includes(item.area))for(const side of [-1,1]){
    const rim=ovalRing(root,cloth,'equipment-goggles',side*.168,.031,.352,.116,.109,.019);
    rim.name='equipment-goggles';
   }
  }else if(item.slot==='hands'){
   root.visible=false;
   arms.forEach((arm,i)=>{const band=joint(arm,0,-.2,0,`equipment-glove-${i}`);organicOrb(band,cloth,'soft-glove-highlight',0,-.020,0,.096,.034,.082);});
  }else if(item.slot==='back'){
   // Level 2/3 ropes, level 4 survival/air gear, and level 5 weapons each remain distinct.
   if(item.rank===5||['climber','diver','pack'].includes(item.style)){root.visible=false;continue;}
   const pack=joint(root,0,.58,-.31,'expedition-back-gear');
   const isTank=item.area==='sea'&&item.rank===4;
   if(isTank){
    // The original diver back slot draws its own oxygen cylinders and straps.
    root.visible=false;
   }else{
    organicOrb(pack,dark,'rounded-expedition-pack',0,0,0,.195,.218,.126,'torso');
    organicOrb(pack,cloth,'rounded-pack-flap',0,.095,-.102,.173,.070,.048);
    organicOrb(pack,brass,'rounded-pack-buckle',0,-.085,-.130,.064,.050,.022);
    if(item.rank<=3){
     for(let i=0;i<3;i++){
      const rope=addMesh(pack,new T.TorusGeometry(.09,.014,5,18),brass,.0,-.02,-.12-i*.013);
      rope.scale.y=1.35;rope.name='coiled-climbing-rope';
     }
    }
   }
   for(const side of [-1,1])curvedBand(body,brass,'pack-straps',[[side*.22,.78,.15],[side*.23,.66,.208],[side*.21,.51,.181]],.017);
  }else if(item.slot==='body'){
   if(item.rank===6){
    organicOrb(root,cloth,'premium-suit-belt',0,.465,.185,.232,.078,.083);
    organicOrb(root,brass,'premium-chest-emblem',0,.65,.252,.078,.066,.035);
    for(const side of [-1,1]){
     const shoulder=joint(arms[side===-1?0:1],0,.005,0,`premium-shoulder-${item.area}`);
     const plate=ell(shoulder,cloth,0,-.03,0,.106,.07,.12);
     plate.name='premium-shoulder-armor';
    }
   }else{
    organicOrb(root,cloth,'expedition-suit-belt',0,.418,.176,.220,.050,.076);
    organicOrb(root,brass,'expedition-suit-emblem',0,.605,.255,.058,.055,.026);
    if(item.area==='sea')for(const side of [-1,1])curvedBand(root,cloth,'diver-suit-rib',[[side*.18,.72,.197],[side*.21,.61,.207],[side*.19,.50,.205]],.017);
   }
  }
 }
}
