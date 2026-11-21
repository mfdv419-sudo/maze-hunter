import {expeditionAppearance,expeditionItem} from './expedition-equipment';
import {throwPose,releaseTime,actionDuration,type AvatarActionKind} from './avatar-actions';
import {foodArt} from './food-art';
import {walkingLeg} from './avatar-presentation';
import {airPose,smooth01,armGrip} from './motion-quality';
import {gloveModel,bootModel,expeditionWearables,equippedExpeditionDetails,expeditionWeaponModel} from './gear-model';
import {paletteColors,type Appearance} from '../services/cosmetics';
import * as T from 'three';
import {satin,addMesh,joint,disposeModel} from './model-parts';
import {plushMaterial,detailMaterial,organicOrb,loftBody,sculptedLimb,curvedBand,ovalRing} from './organic-avatar';
export type CharacterAppearance=Appearance & {hands?:string;feet?:string};
export interface CharacterAction {gearShot?:boolean;cameraLook?:number;cameraElevation?:number;actionKind?:AvatarActionKind;actionAge?:number;cakeColor?:number;hurtAge?:number;defeated?:boolean;pickup?:number;allowIdle?:boolean;jumpAge?:number;jumpCount?:number;jumpBase?:number;treeClimb?:boolean;eat?:number;carrying?:boolean;hit:number;greet?:number;lookUp?:boolean;climb?:'hanging'|'climbing'|'top'|'ground';climbProgress?:number;showBack?:boolean;jump?:number;pole?:boolean;swim?:boolean}
export interface Character {root:T.Group;animate:(time:number,speed:number,celebrate?:boolean,action?:CharacterAction)=>void;dispose:()=>void}
/** Shared organic Binturong avatar for gameplay, Home, wardrobe previews and online players.
 * All animated joints and cosmetics contracts remain compatible with the existing game. */
export function createBinturong(outfit='classic',color=0x343c45,appearance?:CharacterAppearance):Character{
 const loadout=appearance;
 if(appearance){appearance=expeditionAppearance(appearance);outfit=appearance.body;color=paletteColors[appearance.palette]??color;}
 const root=new T.Group();root.name='binturong';root.userData.modelVersion='organic-avatar-v1-rebuild';const body=joint(root,0,0,0,'body');
 const fur=plushMaterial(color),grey=plushMaterial(0x697777),muzzle=plushMaterial(0x5a6561),ink=plushMaterial(0x17252a),cream=plushMaterial(0xf9edcf),teal=detailMaterial(0x3aaf95),gold=detailMaterial(0xe8b956,.43),leaf=plushMaterial(0x7ca74c),pink=detailMaterial(0xe7979f),moon=detailMaterial(0xa0d9dc);
 const ell=(p:T.Object3D,m:T.Material,x:number,y:number,z:number,sx:number,sy:number,sz:number)=>organicOrb(p,m,'organic-detail',x,y,z,sx,sy,sz);
 // Entire trunk and neck: one continuous smooth surface, not separate square chest/hip parts.
 const chest=loftBody(body,fur,'continuous-torso',[
  {y:.17,rx:.015,rz:.015},{y:.20,rx:.17,rz:.135},{y:.27,rx:.245,rz:.185},
  {y:.39,rx:.270,rz:.210},{y:.54,rx:.264,rz:.214},{y:.70,rx:.235,rz:.204},
  {y:.80,rx:.197,rz:.169},{y:.88,rx:.108,rz:.10},{y:.905,rx:.008,rz:.008}
 ]);
 const head=joint(body,0,1.025,.012,'head');
 const skull=organicOrb(head,fur,'continuous-cheek-cranium',0,.01,0,.347,.298,.270,'head');
 // Binturong muzzle: overlapping soft lobes share fur colours, blend at the cheek rather than sticking out as a cylinder.
 for(const side of [-1,1]){
  organicOrb(head,muzzle,'muzzle-cheek',side*.103,-.122,.221,.145,.105,.139);
  organicOrb(head,fur,'jawline',side*.205,-.12,.094,.11,.098,.124);
 }
 organicOrb(head,muzzle,'rounded-snout',0,-.143,.295,.156,.092,.138);
 organicOrb(head,ink,'soft-nose',0,-.103,.416,.082,.056,.057);
 const smile=curvedBand(head,ink,'smile',[[ -.088,-.201,.376],[0,-.214,.399],[.088,-.201,.376]],.007);
 const eyes:T.Group[]=[],brows:T.Mesh[]=[];
 for(const side of [-1,1]){
  // Rounded organic ear, with inset and short tufts, no conical ears.
  const ear=organicOrb(head,fur,'soft-ear',side*.284,.242,-.055,.105,.147,.075);
  ear.rotation.z=-side*.22;
  organicOrb(head,muzzle,'ear-inset',side*.287,.259,.004,.061,.094,.020).rotation.z=-side*.2;
  for(let i=0;i<2;i++){
   const q=organicOrb(head,i?grey:fur,'ear-tuft',side*(.24+i*.046),.344-i*.014,-.024,.033,.089,.036);q.rotation.z=-side*(.28+i*.24);
  }
  // Deep eye sockets and larger expressive eyes, rounded gold rim on selected eyewear.
  organicOrb(head,muzzle,'eye-mask',side*.166,.035,.232,.138,.132,.056);
  const eye=joint(head,side*.167,.031,.289,'eye');eyes.push(eye);
  organicOrb(eye,cream,'eyeball',0,0,0,.081,.089,.032);
  organicOrb(eye,ink,'pupil',0,-.003,.029,.052,.062,.021);
  organicOrb(eye,cream,'catchlight',-side*.014,.026,.046,.018,.021,.008);
  const brow=ell(head,grey,side*.169,.168,.245,.105,.021,.027);brow.rotation.z=side*.12;brows.push(brow);
  for(let i=0;i<3;i++){
   curvedBand(head,cream,'whisker',[[side*.125,-.115-i*.027,.334],[side*.278,-.101-i*.044,.342],[side*.39,-.084-i*.06,.298]],.0046);
  }
 }
 const arms:T.Group[]=[],elbows:T.Group[]=[],legs:T.Group[]=[],knees:T.Group[]=[];
 for(const side of [-1,1]){
  const arm=joint(body,side*.350,.746,0,'shoulder');arms.push(arm);
  organicOrb(arm,fur,'shoulder-blend',0,-.040,0,.084,.116,.084);
  sculptedLimb(arm,fur,'upper-arm',.210,.083,.071,1.05);
  const elbow=joint(arm,0,-.196,0,'elbow');elbows.push(elbow);
  organicOrb(elbow,fur,'elbow-volume',0,-.008,0,.065,.083,.068);
  sculptedLimb(elbow,fur,'forearm',.181,.071,.058,1.06);
  const leg=joint(body,side*.145,.346,-.008,'hip');legs.push(leg);
  organicOrb(leg,fur,'hip-blend',0,-.027,0,.128,.130,.135);
  sculptedLimb(leg,fur,'thigh',.153,.113,.104,1.06);
  const knee=joint(leg,0,-.147,0,'knee');knees.push(knee);
  organicOrb(knee,fur,'knee-volume',0,-.014,0,.102,.098,.115);
  sculptedLimb(knee,fur,'calf',.126,.101,.079,1.09);
 }
 // Sculpted soft vest and scarf, shaped with the body. Wardrobe overlays attach to original joints.
 const a=appearance||{head:outfit==='explorer'?'explorer':'leaf',face:'goggles',body:outfit,back:outfit==='explorer'||outfit==='space'?'pack':'bare',tail:'bare',palette:'charcoal'};
 const gear=a as typeof a & {hands?:string;feet?:string};
 const coatTone=a.body==='raincoat'?0xe7bf62:a.body==='space'?0xd8e9e0:a.body==='aurora'?0x79bbc1:a.body==='climber'?0xbe774e:a.body==='desert'?0xd6b98d:a.body==='diver'?0x355c66:0xf3e8d0;
 const vest=plushMaterial(coatTone);
 // Tailored cloth shell follows the torso contour; the old oval belly patch is removed.
 loftBody(body,vest,'tailored-expedition-vest',[
  {y:.337,rx:.218,rz:.172,z:.009},{y:.368,rx:.250,rz:.198,z:.020},
  {y:.470,rx:.269,rz:.221,z:.030},{y:.595,rx:.267,rz:.217,z:.015},
  {y:.700,rx:.241,rz:.194,z:.008},{y:.773,rx:.194,rz:.154,z:0},
  {y:.797,rx:.162,rz:.115,z:0}
 ]);
 // Seams, placket and compact pockets turn the silhouette into a readable garment.
 for(const side of [-1,1]){
  curvedBand(body,detailMaterial(0xd9c79c),'vest-side-seam',[[side*.228,.737,.080],[side*.264,.593,.085],[side*.255,.45,.088],[side*.213,.363,.095]],.009);
  curvedBand(body,detailMaterial(0xe0c798),'vest-lapel',[[side*.112,.784,.170],[side*.125,.678,.202],[side*.09,.595,.236]],.011);
  organicOrb(body,cream,'vest-pocket-flap',side*.144,.470,.246,.079,.041,.025);
 }
 curvedBand(body,detailMaterial(0xbe9f65),'vest-zipper',[[0,.75,.169],[0,.625,.236],[0,.483,.249],[0,.373,.224]],.011);
 const collar=addMesh(body,new T.TorusGeometry(.122,.037,10,32),teal,0,.834,.005);collar.rotation.x=Math.PI/2;collar.name='organic-scarf-collar';
 const scarf=organicOrb(body,teal,'scarf-tip',.106,.735,.215,.068,.088,.036);scarf.rotation.z=-.38;
 for(const side of [-1,1]){
  curvedBand(body,detailMaterial(0xa88953),'suspender',[[side*.17,.785,.178],[side*.173,.652,.235],[side*.149,.476,.237]],.016);
  const pouch=organicOrb(body,gold,'rounded-gear-pouch',side*.151,.452,.253,.068,.050,.031);
  organicOrb(body,teal,'pouch-rivet',side*.151,.470,.283,.012,.011,.008);
 }
 if(a.head==='explorer'){
  const brim=organicOrb(head,gold,'soft-explorer-hat-brim',0,.288,0,.425,.031,.307);
  organicOrb(head,gold,'soft-hat-crown',0,.365,-.010,.238,.127,.212);
  const band=ovalRing(head,teal,'hat-band',0,.324,.017,.244,.198,.024);band.rotation.x=-Math.PI/2;
 }
 if(a.head==='leaf'){
  const band=addMesh(head,new T.TorusGeometry(.270,.028,9,32),teal,0,.246,.012);band.rotation.x=Math.PI/2;
  for(let i=0;i<7;i++){
   const q=organicOrb(head,leaf,'leaf-crown',-.24+i*.08,.321+Math.cos((i-3)*.42)*.028,.117,.042,.109,.025);
   q.rotation.z=(3-i)*.20;
  }
 }
 if(a.head==='crown'||a.head==='moon'){
  const m=a.head==='moon'?moon:gold;
  const band=addMesh(head,new T.TorusGeometry(.274,.042,9,32),m,0,.254,.005);band.rotation.x=Math.PI/2;
  for(let i=0;i<5;i++)organicOrb(head,m,'crown-point',-.18+i*.09,.356+i%2*.025,.135,.041,.105,.028);
 }
 if(a.face==='mask'){
  organicOrb(head,leaf,'leaf-mask',0,-.12,.388,.217,.092,.051);
 }else if(a.face!=='bare'&&a.face!=='desert'&&a.face!=='diver'){
  const m=a.face==='star'?gold:detailMaterial(0xe8c177,.45);
  for(const side of [-1,1]){
   ovalRing(head,m,'glasses-frame',side*.167,.031,.350,.115,.114,.023);
   curvedBand(head,m,'goggle-temple',[[side*.27,.063,.327],[side*.34,.063,.172],[side*.324,.055,.015]],.011);
  }
  curvedBand(head,m,'goggle-bridge',[[-.05,.05,.351],[0,.063,.368],[.05,.05,.351]],.016);
 }
 if(a.back==='pack'){
  const pack=joint(body,0,.585,-.263,'explorer-pack');
  organicOrb(pack,cream,'rounded-adventure-backpack',0,.015,-.060,.215,.250,.153,'torso');
  organicOrb(pack,teal,'backpack-flap',0,.170,-.182,.200,.074,.058);
  for(const side of [-1,1]){
   curvedBand(body,gold,'backpack-straps',[[side*.158,.825,-.103],[side*.227,.678,.002],[side*.199,.461,.037]],.024);
   organicOrb(pack,gold,'pack-buckle',side*.131,.058,-.198,.040,.049,.018);
  }
  const roll=addMesh(pack,new T.CylinderGeometry(.074,.074,.38,20),teal,0,.275,-.10);
  roll.rotation.z=Math.PI/2;roll.name='bedroll';
 }
 let cape:T.Mesh|undefined,capeRest:Float32Array|undefined;
 if(a.back==='cape'){
  const geo=new T.PlaneGeometry(.62,.58,7,7);const pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++){const v=(pos.getY(i)+.29)/.58;pos.setX(i,pos.getX(i)*(.65+.35*(1-v)));pos.setY(i,pos.getY(i)+.46);pos.setZ(i,-.29-.08*(1-v));}
  geo.computeVertexNormals();capeRest=new Float32Array(pos.array);
  cape=addMesh(body,geo,new T.MeshLambertMaterial({color:0x649950,side:T.DoubleSide}));cape.name='leaf-cape';
 }
 if(a.back==='wings')for(const side of [-1,1]){
  const wing=organicOrb(body,moon,'wing',side*.34,.65,-.23,.29,.16,.049);wing.rotation.z=side*.4;
  for(let i=0;i<3;i++)organicOrb(body,cream,'feather',side*(.23+i*.09),.65-i*.04,-.27,.11,.045,.023);
 }
 expeditionWearables(body,head,arms,legs,a);
 if(loadout){
  const equipped=(['face','body','back','hands','feet'] as const)
   .map(slot=>expeditionItem(loadout[slot]))
   .filter((item):item is NonNullable<typeof item>=>!!item);
  equippedExpeditionDetails(body,head,arms,legs,equipped);
 }
 const weapon=expeditionItem(loadout?.back);
 if(weapon?.effect==='weapon'){
  const prop=expeditionWeaponModel(weapon.area);
  prop.position.set(-.16,.61,-.30);prop.rotation.z=-.38;body.add(prop);
 }
 const armor=expeditionItem(loadout?.body);
 if(armor?.effect==='armor'){
  const edge=armor.area==='sea'?0x93e8e2:armor.area==='volcano'?0xf69561:0xedc578;
  const plating=detailMaterial(edge);
  for(const side of [-1,1]){
   const plate=organicOrb(body,plating,'soft-armor-shoulder',side*.21,.74,.055,.109,.083,.158);plate.rotation.z=side*.18;
  }
  addMesh(body,new T.OctahedronGeometry(.071,0),plating,0,.6,.280);
 }
 // The root of the tail is embedded in the pelvis and transitions continuously into the curve.
 // Starting behind the torso surface creates a visible seam/disconnected appendage in profile.
 const tail=joint(body,0,0,0,'prehensile-tail');
 ell(tail,fur,0,.37,-.16,.128,.125,.17).name='tail-root-blend';
 const rest=new T.CatmullRomCurve3([
  new T.Vector3(0,.37,-.10),new T.Vector3(0,.34,-.28),
  new T.Vector3(-.09,.32,-.46),new T.Vector3(-.33,.29,-.70),
  new T.Vector3(-.52,.41,-.86),new T.Vector3(-.53,.59,-.86),
  new T.Vector3(-.38,.72,-.75)
 ]).getPoints(28);
 const centers=rest.map(v=>v.clone()),geo=new T.BufferGeometry(),positions=new Float32Array(29*9*3),normals=new Float32Array(positions.length),indices:number[]=[];
 for(let i=0;i<28;i++)for(let j=0;j<8;j++){const k=i*9+j;indices.push(k,k+1,k+9,k+1,k+10,k+9);}geo.setIndex(indices);geo.setAttribute('position',new T.BufferAttribute(positions,3));geo.setAttribute('normal',new T.BufferAttribute(normals,3));geo.boundingSphere=new T.Sphere(new T.Vector3(-.3,.5,-.5),1.1);const tailMesh=addMesh(tail,geo,fur);tailMesh.name='continuous-tail-surface';
 const charm=joint(tail,0,0,0,'tail-charm');if(a.tail==='bow')for(const side of [-1,1]){const q=addMesh(charm,new T.ConeGeometry(.075,.12,5),pink,side*.06,0,0);q.rotation.z=side*Math.PI/2;}if(a.tail==='leaf')addMesh(charm,new T.TorusGeometry(.065,.018,5,12),leaf).rotation.x=Math.PI/2;if(a.tail==='star')addMesh(charm,new T.OctahedronGeometry(.075),gold,0,-.055,0);
 const shadow=addMesh(root,new T.CircleGeometry(.29,16),new T.MeshBasicMaterial({color:0x183e39,transparent:true,opacity:.17,depthWrite:false}),0,.005,0);shadow.rotation.x=-Math.PI/2;shadow.name='ground-shadow';
 const pole=joint(elbows[0],0,-.15,.025,'no-trekking-pole');pole.visible=false;
 // Explicit hands/feet choices are independent; missing slots preserve legacy outfit gear.
 const legacyGear=a.body==='classic'?'bare':a.body==='climber'?'climber':a.body==='desert'?'desert':a.body==='diver'?'diver':'trail';
 for(let i=0;i<2;i++){gloveModel(elbows[i],gear.hands??legacyGear,i?-1:1,color);bootModel(knees[i],gear.feet??legacyGear,i?1:-1);}
 const rightGrip=joint(elbows[1],0,-.15,.025,'right-hand-grip');const heldCake=joint(rightGrip,0,0,0,'held-cake');addMesh(heldCake,new T.CylinderGeometry(.11,.12,.07,10),cream,0,.02,0);const heldIcing=addMesh(heldCake,new T.CylinderGeometry(.115,.115,.025,10),pink,0,.067,0);const heldFoods=(['chili','watermelon','spinach']as const).map(kind=>{const m=foodArt(kind);m.name='hand-'+kind;m.scale.setScalar(.55);rightGrip.add(m);return m;});
 const pivot=joint(root,0,.65,0,'motion-pivot');pivot.add(body);body.position.y=-.65;
 const costumeFX=joint(body,0,0,0,'costume-motion-effects'),sparkMaterial=new T.MeshBasicMaterial({color:a.body==='aurora'?0x95efde:a.body==='space'?0x99d9ff:a.body==='raincoat'?0x7ecfef:0xffd17d,transparent:true,opacity:.7,depthWrite:false});
 const hasFX=a.body!=='classic'||a.back==='wings'||a.tail==='star'||a.head==='moon';
 const sparks:T.Mesh[]=[];if(hasFX)for(let i=0;i<6;i++){const q=addMesh(costumeFX,new T.OctahedronGeometry(.018+i%2*.008),sparkMaterial);q.name='costume-spark';sparks.push(q);}
 const wings=body.children.filter(o=>o.name==='wing'&&o instanceof T.Mesh) as T.Mesh[];
 const poseJoints=[body,head,...arms,...elbows,...legs,...knees],previousPose=poseJoints.map(()=>new T.Euler());let posed=false;
 const pack=body.getObjectByName('explorer-pack')||body.getObjectByName('climbing-pack')||body.getObjectByName('expedition-back-gear');
 let gait=0,landing=0,lastJump=0;
 const tangent=new T.Vector3(),normal=new T.Vector3(),binormal=new T.Vector3(),up=new T.Vector3(0,1,0);let motion=0,previous=0,lastYaw=0,lag=0;
 function animate(time:number,speed:number,celebrate=false,action?:CharacterAction){
  head.position.y=1;
  poseJoints.forEach((q,i)=>previousPose[i].copy(q.rotation));
  const dt=Math.min(.05,Math.max(0,time-previous));previous=time;motion+=(speed-motion)*(1-Math.exp(-dt*18));const walk=Math.min(1.2,motion);gait+=dt*(4.4+2.8*walk)*walk;const stride=Math.sin(gait)*walk*.7;const jump=action?.jump||0;if(lastJump>.025&&jump<=.015)landing=1;landing*=Math.exp(-dt*14);lastJump=jump;pivot.rotation.set(0,0,0);pivot.position.y=.65-landing*.075;
  const walkStep=Math.floor(gait/Math.PI);root.userData.footfall=walk>.08&&walkStep!==root.userData.walkStep;root.userData.walkStep=walkStep;
  body.position.y=-.65+(celebrate?Math.abs(Math.sin(time*5))*.1:(walk>.05?Math.cos(gait*2)*.014*walk:Math.sin(time*2)*.012));body.rotation.set(-walk*.065,Math.sin(gait)*walk*.04,Math.sin(gait)*walk*.035+(1-Math.min(1,walk))*Math.sin(time*1.15)*.032);
  chest.scale.y=1+Math.sin(time*2)*.021;
  for(let i=0;i<2;i++){const swing=i?stride:-stride;
   const gentle=1-Math.min(1,walk),side=i?1:-1;
   arms[i].rotation.set(swing*.85+gentle*Math.sin(time*.92+i)*.035,side*Math.min(.065,walk*.055),side*(.135+Math.abs(swing)*.08));
   elbows[i].rotation.x=-.16-Math.max(0,swing)*.28-gentle*Math.sin(time*1.7+i)*.045;const step=walkingLeg(gait,walk,i);legs[i].rotation.x=step.hip;legs[i].position.y=.35+step.lift;knees[i].rotation.x=step.knee;}
  head.scale.x=1;head.rotation.set(action?.lookUp?-.24:Math.sin(time*1.5)*.012,Math.sin(time*.8)*.025,Math.sin(time*2)*.016);
  if(action?.cameraLook!==undefined&&walk<.04){const angle=Math.atan2(Math.sin(action.cameraLook),Math.cos(action.cameraLook));if(Math.abs(angle)<1.15){head.rotation.y=angle*.65;head.rotation.x-=Math.min(.35,Math.max(0,action.cameraElevation??0))*(1-Math.abs(angle)/1.15);}}
  const blink=1-.88*Math.max(0,Math.sin(Math.PI*Math.max(0,(time%4.6-4.37)/.23)));eyes.forEach(e=>e.scale.y=blink);brows.forEach((b,i)=>b.rotation.z=(i?1:-1)*(.13+Math.sin(time)*.025));
  const hit=action?.hit||0;arms[1].rotation.x-=Math.sin(hit*Math.PI)*1.9;
  if(action?.greet!==undefined){const age=action.greet,p=Math.sin(age*Math.PI);arms[1].rotation.x=-p*2.2;arms[1].rotation.z=.14+p*(.36+Math.sin(age*22)*.19);elbows[1].rotation.x=-.18-p*.7;arms[0].rotation.x=-p*.28;head.rotation.x=-p*.14;head.rotation.z=p*.1;}
  if((action?.jump||0)>.05){const p=Math.min(1,action!.jump!);arms.forEach((a,i)=>{a.rotation.x=-.8-p*.5;a.rotation.z=(i?1:-1)*.35;});knees.forEach(k=>k.rotation.x=.5);}
  pole.visible=false;
  if(action?.allowIdle&&walk<.04&&time%16>14&&action?.greet===undefined&&!(action?.actionKind&&(action.actionAge??100)<actionDuration(action.actionKind))){const curious=Math.sin((time%16-14)*Math.PI/2);arms[0].rotation.x=-.55*curious;arms[0].rotation.z=-.14-.14*curious;elbows[0].rotation.x=-.18-.62*curious;head.rotation.y=Math.sin(time*2)*.23*curious;head.rotation.z=-.10*curious;}

  if((action?.eat??100)<.75){arms[1].rotation.x=-1.8;elbows[1].rotation.x=-1.1;head.rotation.x=.12;head.scale.y=1+Math.sin(time*24)*.02;}else head.scale.y=1;if(action?.carrying){arms.forEach(a=>a.rotation.x=-2.2);elbows.forEach(e=>e.rotation.x=-.4);}
  if(celebrate)arms.forEach((arm,i)=>arm.rotation.z=(i?1:-1)*1.8);
  if(action?.climb==='hanging'||action?.climb==='climbing'){
   const pulling=action.climb==='climbing',p=smooth01(action.climbProgress||0),cycle=(action.climbProgress||0)*Math.PI*(action.treeClimb?6:2);
   const gripPhase=((action.climbProgress||0)*3)%1;body.position.y-=.08+(action.treeClimb?Math.sin(gripPhase*Math.PI)*.025:0);body.rotation.x=.16-(pulling?p*.3:0);head.rotation.x=-.2;
   arms.forEach((arm,i)=>{const reach=pulling?Math.sin(cycle+i*Math.PI):0;const grip=armGrip(.23+reach*.08-(pulling&&!action.treeClimb?p*.28:0),.23);arm.rotation.set(grip.shoulder,0,(i?1:-1)*.1);elbows[i].rotation.x=grip.elbow;legs[i].rotation.x=-.45-reach*.3;knees[i].rotation.x=.85+reach*.25;if(pulling&&!action.treeClimb&&i===0){const step=smooth01((p-.4)/.25)*(1-smooth01((p-.85)/.15));legs[i].rotation.x-=step*.65;knees[i].rotation.x+=step*.5;}});
  }else if(jump>.015&&!action?.swim){const pose=airPose(action?.jumpCount||1,action?.jumpAge||0,action?.jumpBase||0);pivot.rotation.x=pose.flip;legs.forEach(l=>l.rotation.x=-pose.tuck*.9);knees.forEach(k=>k.rotation.x=.45+pose.tuck*1.1);arms.forEach((arm,i)=>{arm.rotation.x=-.65-pose.tuck*.8;arm.rotation.z=(i?1:-1)*(.22+pose.tuck*.12);});}
  if(jump<=.015&&landing>.01){knees.forEach(k=>k.rotation.x+=landing*.55);body.rotation.x+=landing*.09;arms.forEach((a,i)=>{a.rotation.x+=landing*.24;a.rotation.z+=(i?1:-1)*landing*.12;});}

  const kind=action?.actionKind,age=action?.actionAge??100,active=!!kind&&age>=0&&age<actionDuration(kind),ground=action?.climb!=='climbing'&&action?.climb!=='hanging';
  heldCake.visible=!action?.gearShot&&ground&&active&&(kind==='cake'||kind==='grenade')&&age<releaseTime(kind!);heldIcing.material instanceof T.MeshLambertMaterial&&heldIcing.material.color.setHex(action?.cakeColor??0xe67d83);
  heldFoods.forEach((m,i)=>m.visible=ground&&active&&kind===['chili','watermelon','spinach'][i]&&age<.6);
  if(active&&ground){pole.visible=false;if(kind==='cake'||kind==='grenade'||kind==='throw-object'||kind==='cut'){const pose=throwPose(kind==='cut'?'cake':kind,age);body.rotation.y=pose.twist;body.position.y-=pose.weight;arms[1].rotation.x=pose.shoulder;elbows[1].rotation.x=pose.elbow;arms[0].rotation.x=-.3-pose.twist*2;if(kind==='throw-object'){arms[0].rotation.x=pose.shoulder;elbows[0].rotation.x=pose.elbow;}}
   else if(kind==='chili'||kind==='watermelon'||kind==='spinach'){const grip=armGrip(.21,.28);arms[1].rotation.x=grip.shoulder;elbows[1].rotation.x=grip.elbow;head.rotation.x=age<.24?.05:-.08;body.rotation.x+=age>.24&&kind!=='spinach'?.12:0;head.scale.x=1+(age>.22&&age<.8?.018:0);if(kind==='spinach'&&age>.45)arms.forEach((a,i)=>a.rotation.z=(i?1:-1)*.35);}
   else if(kind==='lift'||kind==='place'){const squat=Math.sin(Math.min(1,age/.6)*Math.PI)*.1;body.position.y-=squat;knees.forEach(k=>k.rotation.x+=squat*4);body.rotation.x+=squat;}}
  if(!active)head.scale.x=1;
  if((action?.hurtAge??100)<.35){const recoil=Math.sin(Math.max(0,action!.hurtAge!)/.35*Math.PI);body.rotation.x-=recoil*.16;arms.forEach((a,i)=>a.rotation.z+=(i?1:-1)*recoil*.2);}
  if(action?.defeated){const fall=smooth01((action.hurtAge??1)/.6);pivot.rotation.z=-fall*1.05;pivot.position.y=.65+fall*.16;}
  if((action?.pickup??100)<.4&&ground&&!active){arms[0].rotation.z=-.35;head.rotation.x=-.06;}
  if(action?.swim){body.rotation.x=1.02;body.position.y=-.5;head.position.y=1.08;head.rotation.x=-.86;arms.forEach((a,i)=>{a.rotation.x=-.28+Math.sin(time*4.6+i*Math.PI)*.62;a.rotation.z=(i?1:-1)*.38;elbows[i].rotation.x=-.22+Math.sin(time*4.6+i*Math.PI)*.22;});legs.forEach((l,i)=>{l.rotation.x=Math.sin(time*6.4+i*Math.PI)*.38;knees[i].rotation.x=.22+Math.sin(time*6.4+i*Math.PI+.8)*.14;});}
  const turn=Math.atan2(Math.sin(root.rotation.y-lastYaw),Math.cos(root.rotation.y-lastYaw));lastYaw=root.rotation.y;
  lag+=(-Math.max(-.18,Math.min(.18,turn*3))-lag)*(1-Math.exp(-dt*7));
  // Weight shifts subtly into a turn without altering the authoritative player heading.
  if(!action?.swim&&action?.climb!=='climbing'&&action?.climb!=='hanging'){
   body.rotation.z+=lag*.22;
   head.rotation.y-=lag*.27;
  }
  const rootPoint=rest[0];
  centers.forEach((p,i)=>{const u=i/28,b=rest[i],angle=action?.swim?-.98:0,
   ry=b.y-rootPoint.y,rz=b.z-rootPoint.z,
   y=rootPoint.y+ry*Math.cos(angle)-rz*Math.sin(angle),
   z=rootPoint.z+ry*Math.sin(angle)+rz*Math.cos(angle);
   p.set(b.x+Math.sin(time*2.1-u*3)*.035*u+lag*u*u-(action?.showBack?.35:0)*u,
    y+Math.sin(time*2-u*3)*.025*u,z+Math.sin(time*2.3-u*4)*.038*u);
  });
  for(let i=0;i<29;i++){tangent.copy(centers[Math.min(28,i+1)]).sub(centers[Math.max(0,i-1)]).normalize();if(i===0)normal.set(1,0,0);normal.addScaledVector(tangent,-normal.dot(tangent)).normalize();if(normal.lengthSq()<.1)normal.crossVectors(tangent,up).normalize();binormal.crossVectors(tangent,normal).normalize();const radius=.092*(1-i/28*.70);
   for(let j=0;j<9;j++){const a=j/8*Math.PI*2,c=Math.cos(a),s=Math.sin(a),k=(i*9+j)*3;for(let axis=0;axis<3;axis++){const v=normal.getComponent(axis)*c+binormal.getComponent(axis)*s;positions[k+axis]=centers[i].getComponent(axis)+v*radius;normals[k+axis]=v;}}}
  geo.attributes.position.needsUpdate=geo.attributes.normal.needsUpdate=true;charm.position.copy(centers[24]);
  if(posed){const blend=1-Math.exp(-dt*(active?60:action?.climb==='climbing'||action?.climb==='hanging'?12:18));poseJoints.forEach((q,i)=>{q.rotation.x=previousPose[i].x+(q.rotation.x-previousPose[i].x)*blend;q.rotation.y=previousPose[i].y+(q.rotation.y-previousPose[i].y)*blend;q.rotation.z=previousPose[i].z+(q.rotation.z-previousPose[i].z)*blend;});}posed=true;
  scarf.rotation.x=-walk*.25+Math.sin(time*4)*.08+landing*.25;
  if(pack){pack.rotation.x=walk*.06+Math.sin(gait)*walk*.025;pack.rotation.z=lag*.25;}
  wings.forEach(wing=>wing.rotation.z=Math.sign(wing.position.x)*(.4+Math.sin(time*(jump>.02?7:2))*(jump>.02?.22:.04)));
  costumeFX.visible=hasFX&&(walk>.05||jump>.02||landing>.02);sparks.forEach((q,i)=>{const u=(time*.7+i/6)%1,angle=i*2.399+time*.5;q.position.set(Math.sin(angle)*(.26+u*.16),.12+u*.8,Math.cos(angle)*.28-.1);q.scale.setScalar(Math.sin(u*Math.PI)*(jump>.02?1.2:.7));});
  if(cape&&capeRest){const p=cape.geometry.attributes.position;for(let i=0;i<p.count;i++){const fall=(.75-capeRest[i*3+1])/.58;p.setZ(i,capeRest[i*3+2]-Math.sin(time*3+fall*3)*.035*fall-walk*.09*fall+lag*fall*.3);}p.needsUpdate=true;cape.geometry.computeVertexNormals();}
 }
 animate(0,0);return{root,animate,dispose:()=>disposeModel(root)};
}
