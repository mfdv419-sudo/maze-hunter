import {gloveModel,bootModel,expeditionWearables} from './gear-model';
import {paletteColors,type Appearance} from '../services/cosmetics';
import * as T from 'three';
import {roundBox,satin,addMesh,joint,disposeModel} from './model-parts';
export type CharacterAppearance=Appearance & {hands?:string;feet?:string};
export interface CharacterAction {hit:number;greet?:number;lookUp?:boolean;climb?:'hanging'|'climbing'|'top'|'ground';climbProgress?:number;showBack?:boolean;jump?:number;pole?:boolean;swim?:boolean}
export interface Character {root:T.Group;animate:(time:number,speed:number,celebrate?:boolean,action?:CharacterAction)=>void;dispose:()=>void}
/** Original forest explorer: tufted ears, tapered muzzle, dark face mask and a continuous prehensile tail. */
export function createBinturong(outfit='classic',color=0x343c45,appearance?:CharacterAppearance):Character{
 if(appearance){outfit=appearance.body;color=paletteColors[appearance.palette]??color;}
 const root=new T.Group();root.name='binturong';root.userData.modelVersion='expedition-gear';const body=joint(root,0,0,0,'body');
 const fur=satin(color),grey=satin(0x858e88),muzzle=satin(0x69746e),ink=satin(0x172f31),cream=satin(0xffedca),teal=satin(0x35bda3),gold=satin(0xefbd62),leaf=satin(0x7fa957),pink=satin(0xee9caa),moon=satin(0xa0d9dc);
 const box=(p:T.Object3D,w:number,h:number,d:number,m:T.Material,x:number,y:number,z:number,r=.06)=>addMesh(p,roundBox(w,h,d,r),m,x,y,z);
 const ell=(p:T.Object3D,m:T.Material,x:number,y:number,z:number,sx:number,sy:number,sz:number)=>{const q=addMesh(p,new T.SphereGeometry(1,12,8),m,x,y,z);q.scale.set(sx,sy,sz);return q;};
 const chest=box(body,.46,.49,.35,fur,0,.59,0,.12);
 const head=joint(body,0,1.0,.015,'head');const skull=box(head,.64,.49,.45,fur,0,0,0,.14);skull.scale.y=.96;
 const snout=addMesh(head,new T.CylinderGeometry(.075,.16,.3,10),muzzle,0,-.1,.3);snout.rotation.x=Math.PI/2;
 ell(head,ink,0,-.095,.465,.078,.052,.049);
 const smile=addMesh(head,new T.TorusGeometry(.065,.009,4,12,Math.PI),ink,0,-.16,.4);smile.rotation.z=Math.PI;
 const eyes:T.Group[]=[],brows:T.Mesh[]=[];
 for(const side of [-1,1]){
  const ear=addMesh(head,new T.ConeGeometry(.085,.17,5),fur,side*.265,.27,-.025);ear.scale.z=.65;ear.rotation.z=-side*.23;
  const inner=addMesh(head,new T.ConeGeometry(.044,.09,5),muzzle,side*.27,.27,.024);inner.scale.z=.4;
  for(let i=0;i<2;i++){const tuft=addMesh(head,new T.ConeGeometry(.023,.105-i*.02,5),i?grey:fur,side*(.28+i*.03),.36-i*.015,-.03);tuft.rotation.z=-side*(.2+i*.3);}
  ell(head,muzzle,side*.17,.015,.209,.12,.12,.035);
  const eye=joint(head,side*.168,.022,.244,'eye');eyes.push(eye);ell(eye,cream,0,0,0,.068,.08,.022);ell(eye,ink,0,-.002,.018,.047,.057,.015);ell(eye,cream,-side*.013,.025,.031,.016,.019,.007);
  const brow=box(head,.13,.025,.024,grey,side*.17,.135,.23,.01);brow.rotation.z=side*.13;brows.push(brow);
  for(let i=0;i<3;i++){const curve=new T.QuadraticBezierCurve3(new T.Vector3(side*.115,-.095-i*.025,.32),new T.Vector3(side*.29,-.08-i*.05,.33),new T.Vector3(side*.43,-.055-i*.07,.31));addMesh(head,new T.TubeGeometry(curve,5,.005,4,false),cream);}
  const cheek=addMesh(head,new T.ConeGeometry(.06,.12,6),fur,side*.28,-.18,.04);cheek.rotation.z=side*2.1;
 }
 // Two-joint limbs retain volume at elbows and knees.
 const arms:T.Group[]=[],elbows:T.Group[]=[],legs:T.Group[]=[],knees:T.Group[]=[];
 for(const side of [-1,1]){
  const arm=joint(body,side*.29,.78,0,'shoulder');arms.push(arm);addMesh(arm,new T.CapsuleGeometry(.077,.14,3,8),fur,0,-.095,0);
  const elbow=joint(arm,0,-.22,0,'elbow');elbows.push(elbow);addMesh(elbow,new T.CapsuleGeometry(.073,.1,3,8),fur,0,-.055,0);ell(elbow,fur,0,-.15,.025,.09,.075,.09);
  const leg=joint(body,side*.14,.35,0,'hip');legs.push(leg);addMesh(leg,new T.CapsuleGeometry(.082,.09,3,8),fur,0,-.055,0);const knee=joint(leg,0,-.14,0,'knee');knees.push(knee);addMesh(knee,new T.CapsuleGeometry(.075,.06,3,8),fur,0,-.035,0);box(knee,.18,.1,.25,fur,0,-.11,.05,.045);
  for(let i=0;i<3;i++)ell(knee,muzzle,(i-1)*.043,-.105,.16,.013,.012,.015);
 }
 // Brand signature, visible on every body outfit.
 box(body,.36,.07,.37,teal,0,.82,.015,.025);const scarf=addMesh(body,new T.ConeGeometry(.095,.19,3),teal,.105,.7,.23);scarf.rotation.z=-.2;
 const a=appearance||{head:outfit==='explorer'?'explorer':'bare',face:'bare',body:outfit,back:outfit==='explorer'||outfit==='space'?'pack':'bare',tail:'bare',palette:'charcoal'};
 const gear=a as typeof a & {hands?:string;feet?:string};
 if(a.body!=='classic'){
  const coat=satin(a.body==='raincoat'?0xefc559:a.body==='space'?0xdde9df:a.body==='aurora'?0x7fbfc0:a.body==='climber'?0xc76c4b:a.body==='desert'?0xd5bd8d:a.body==='diver'?0x2d4d5c:0xc9a35f);box(body,.49,.36,.37,coat,0,.56,0,.08);
  for(const side of [-1,1]){box(body,.13,.11,.045,gold,side*.14,.52,.2,.02);box(body,.025,.32,.025,ink,side*.19,.63,.2,.01);}
  if(a.body==='raincoat'){box(body,.52,.09,.4,coat,0,.37,0,.035);box(body,.18,.05,.035,teal,0,.72,.22,.02);}
  if(a.body==='space'||a.body==='aurora'){box(body,.19,.12,.035,teal,0,.65,.215,.02);for(const side of [-1,1])box(legs[side===-1?0:1],.19,.06,.2,moon,0,-.12,0,.02);}
 }
 box(body,.075,.095,.025,gold,-.085,.6,.218,.015);box(body,.034,.045,.012,teal,-.08,.605,.235,.004);
 if(a.head==='explorer'){box(head,.74,.045,.54,gold,0,.27,0,.02);box(head,.4,.15,.34,gold,0,.35,0,.055);box(head,.42,.045,.35,teal,0,.3,0,.014);}
 if(a.head==='leaf'){const band=addMesh(head,new T.TorusGeometry(.265,.026,5,18),teal,0,.25,0);band.rotation.x=Math.PI/2;for(let i=0;i<5;i++){const q=ell(head,leaf,(i-2)*.09,.3+Math.sin(i)*.025,.13,.045,.1,.025);q.rotation.z=(i-2)*-.3;}}
 if(a.head==='crown'||a.head==='moon'){const m=a.head==='moon'?moon:gold;box(head,.55,.07,.37,m,0,.27,0,.02);for(let i=0;i<5;i++)addMesh(head,new T.ConeGeometry(.05,.15+i%2*.025,5),m,(i-2)*.105,.37,.12);}
 if(a.face==='mask'){
  const mask=ell(head,leaf,0,-.12,.425,.19,.095,.06);mask.name='leaf-mask';for(const side of [-1,1])box(head,.018,.035,.27,teal,side*.29,-.06,.12,.008);box(head,.12,.015,.02,gold,0,-.1,.48,.005);
 }else if(a.face!=='bare'&&a.face!=='desert'&&a.face!=='diver'){
  const m=a.face==='star'?gold:moon;
  for(const side of [-1,1]){const frame=addMesh(head,new T.TorusGeometry(.099,.02,6,16),m,side*.168,.025,.287);frame.name='glasses-frame';const lens=new T.MeshPhongMaterial({color:0xb7e1dd,transparent:true,opacity:.16,shininess:85,depthWrite:false});addMesh(head,new T.CircleGeometry(.082,16),lens,side*.168,.025,.289);box(head,.018,.025,.24,m,side*.29,.035,.13,.005);if(a.face==='star')for(let i=0;i<5;i++){const q=addMesh(head,new T.ConeGeometry(.025,.045,4),m,side*.168+Math.sin(i*1.256)*.107,.025+Math.cos(i*1.256)*.107,.29);q.rotation.z=-i*1.256;}}
  box(head,.14,.022,.025,m,0,.035,.29,.006);
 }
 if(a.back==='pack'){
  const pack=joint(body,0,.6,-.265,'explorer-pack');box(pack,.33,.37,.19,teal,0,0,0,.055);box(pack,.35,.105,.21,gold,0,.14,-.015,.035);box(pack,.21,.13,.06,gold,0,-.065,-.12,.025);box(pack,.045,.1,.025,ink,0,.08,-.13,.007);for(const side of [-1,1])box(body,.04,.32,.035,gold,side*.2,.67,.19,.01);const roll=addMesh(pack,new T.CylinderGeometry(.065,.065,.37,10),cream,0,-.22,0);roll.rotation.z=Math.PI/2;
 }
 let cape:T.Mesh|undefined,capeRest:Float32Array|undefined;
 if(a.back==='cape'){
  const geo=new T.PlaneGeometry(.62,.58,7,7);const pos=geo.attributes.position;for(let i=0;i<pos.count;i++){const v=(pos.getY(i)+.29)/.58;pos.setX(i,pos.getX(i)*(.65+.35*(1-v)));pos.setY(i,pos.getY(i)+.46);pos.setZ(i,-.29-.08*(1-v));}geo.computeVertexNormals();capeRest=new Float32Array(pos.array);cape=addMesh(body,geo,new T.MeshLambertMaterial({color:0x649950,side:T.DoubleSide}));cape.name='leaf-cape';
 }
 if(a.back==='wings')for(const side of [-1,1]){const wing=ell(body,moon,side*.34,.65,-.23,.3,.14,.045);wing.rotation.z=side*.4;for(let i=0;i<3;i++)ell(body,cream,side*(.23+i*.09),.65-i*.04,-.27,.11,.04,.022);}
 expeditionWearables(body,head,arms,legs,a);
 // One continuous tapered tube; no detached cylinder segments while the tail bends.
 const tail=joint(body,0,0,0,'prehensile-tail');const rest=new T.CatmullRomCurve3([new T.Vector3(0,.43,-.19),new T.Vector3(-.13,.3,-.44),new T.Vector3(-.4,.29,-.74),new T.Vector3(-.6,.44,-.88),new T.Vector3(-.58,.65,-.84),new T.Vector3(-.4,.75,-.72)]).getPoints(28);
 const centers=rest.map(v=>v.clone()),geo=new T.BufferGeometry(),positions=new Float32Array(29*9*3),normals=new Float32Array(positions.length),indices:number[]=[];
 for(let i=0;i<28;i++)for(let j=0;j<8;j++){const k=i*9+j;indices.push(k,k+9,k+1,k+1,k+9,k+10);}geo.setIndex(indices);geo.setAttribute('position',new T.BufferAttribute(positions,3));geo.setAttribute('normal',new T.BufferAttribute(normals,3));geo.boundingSphere=new T.Sphere(new T.Vector3(-.3,.5,-.5),1.1);addMesh(tail,geo,fur);
 const charm=joint(tail,0,0,0,'tail-charm');if(a.tail==='bow')for(const side of [-1,1]){const q=addMesh(charm,new T.ConeGeometry(.075,.12,5),pink,side*.06,0,0);q.rotation.z=side*Math.PI/2;}if(a.tail==='leaf')addMesh(charm,new T.TorusGeometry(.065,.018,5,12),leaf).rotation.x=Math.PI/2;if(a.tail==='star')addMesh(charm,new T.OctahedronGeometry(.075),gold,0,-.055,0);
 const shadow=addMesh(root,new T.CircleGeometry(.29,16),new T.MeshBasicMaterial({color:0x183e39,transparent:true,opacity:.17,depthWrite:false}),0,.005,0);shadow.rotation.x=-Math.PI/2;shadow.name='ground-shadow';
 const pole=joint(elbows[0],0,-.13,.04,'trekking-pole');addMesh(pole,new T.CylinderGeometry(.011,.014,.66,7),satin(0xc2d3cf),0,-.26,0);box(pole,.045,.11,.045,ink,0,.02,0,.012);addMesh(pole,new T.CylinderGeometry(.03,.04,.035,7),ink,0,-.55,0);pole.visible=false;
 // Explicit hands/feet choices are independent; missing slots preserve legacy outfit gear.
 const legacyGear=a.body==='classic'?'bare':a.body==='climber'?'climber':a.body==='desert'?'desert':a.body==='diver'?'diver':'trail';
 for(let i=0;i<2;i++){gloveModel(elbows[i],gear.hands??legacyGear,i?-1:1);bootModel(knees[i],gear.feet??legacyGear,i?1:-1);}
 const tangent=new T.Vector3(),normal=new T.Vector3(),binormal=new T.Vector3(),up=new T.Vector3(0,1,0);let motion=0,previous=0,lastYaw=0,lag=0;
 function animate(time:number,speed:number,celebrate=false,action?:CharacterAction){
  const dt=Math.min(.05,Math.max(0,time-previous));previous=time;motion+=(speed-motion)*(1-Math.exp(-dt*18));const walk=Math.min(1.2,motion),stride=Math.sin(time*11)*walk*.5;
  body.position.y=celebrate?Math.abs(Math.sin(time*5))*.1:Math.sin(time*(walk>.05?22:2))*(walk>.05?.014:.006);body.rotation.x=-walk*.085;chest.scale.y=1+Math.sin(time*2)*.012;
  for(let i=0;i<2;i++){const swing=i?-stride:stride;arms[i].rotation.set(swing,0,(i?.14:-.14));elbows[i].rotation.x=-.18-Math.max(0,swing)*.35-Math.sin(time*1.7+i)*.045*(1-walk);legs[i].rotation.x=-swing;knees[i].rotation.x=Math.max(0,swing)*.65;}
  head.rotation.set(action?.lookUp?-.24:Math.sin(time*1.5)*.012,Math.sin(time*.8)*.025,Math.sin(time*2)*.016);
  const blink=time%4.6>4.43?.12:1;eyes.forEach(e=>e.scale.y=blink);brows.forEach((b,i)=>b.rotation.z=(i?1:-1)*(.13+Math.sin(time)*.025));
  const hit=action?.hit||0;arms[1].rotation.x-=Math.sin(hit*Math.PI)*1.9;
  if(action?.greet!==undefined){const p=Math.sin(action.greet*Math.PI);arms.forEach((a,i)=>{a.rotation.x=-p*2.65;a.rotation.z=(i?1:-1)*(.12+p*.32);});elbows.forEach(e=>e.rotation.x=-.12);head.rotation.x=-p*.12;}
  if((action?.jump||0)>.05){const p=Math.min(1,action!.jump!);arms.forEach((a,i)=>{a.rotation.x=-.8-p*.5;a.rotation.z=(i?1:-1)*.35;});knees.forEach(k=>k.rotation.x=.5);}
  pole.visible=!!action?.pole&&!(hit>0&&hit<1)&&action?.climb==='ground'&&!(action?.jump);if(pole.visible){arms[0].rotation.x=-.4+stride*.5;elbows[0].rotation.x=-.65;pole.rotation.x=.4;}
  if(walk<.04&&time%12>9&&action?.greet===undefined&&!action?.pole){arms[0].rotation.x=-.55;arms[0].rotation.z=-.28;elbows[0].rotation.x=-.8;head.rotation.y=Math.sin(time*2)*.12;}

  if(celebrate)arms.forEach((arm,i)=>arm.rotation.z=(i?1:-1)*1.8);
  if(action?.climb==='hanging'||action?.climb==='climbing'){body.position.y-=.1;arms.forEach(arm=>{arm.rotation.x=-2.35;arm.rotation.z=0;});elbows.forEach(e=>e.rotation.x=-.15);legs.forEach(l=>l.rotation.x=-.6);knees.forEach(k=>k.rotation.x=.6);}
  if(action?.swim){body.rotation.x=1.18;body.position.y=.18;arms.forEach((a,i)=>{a.rotation.x=-.4+Math.sin(time*4+i*Math.PI)*.5;a.rotation.z=(i?1:-1)*.5;});legs.forEach((l,i)=>l.rotation.x=Math.sin(time*6+i*Math.PI)*.3);}
  const turn=Math.atan2(Math.sin(root.rotation.y-lastYaw),Math.cos(root.rotation.y-lastYaw));lastYaw=root.rotation.y;lag+=(-Math.max(-.18,Math.min(.18,turn*3))-lag)*(1-Math.exp(-dt*7));
  centers.forEach((p,i)=>{const u=i/28,b=rest[i];p.set(b.x+Math.sin(time*2.1-u*3)*.045*u+lag*u*u-(action?.showBack?.35:0)*u,b.y+Math.sin(time*2-u*3)*.025*u-(action?.swim?u*1.1:0),b.z+Math.sin(time*2.3-u*4)*.045*u+(action?.swim?u*.2:0));});
  for(let i=0;i<29;i++){tangent.copy(centers[Math.min(28,i+1)]).sub(centers[Math.max(0,i-1)]).normalize();normal.crossVectors(tangent,up).normalize();if(normal.lengthSq()<.1)normal.set(1,0,0);binormal.crossVectors(tangent,normal).normalize();const radius=.075*(1-i/28*.65);
   for(let j=0;j<9;j++){const a=j/8*Math.PI*2,c=Math.cos(a),s=Math.sin(a),k=(i*9+j)*3;for(let axis=0;axis<3;axis++){const v=normal.getComponent(axis)*c+binormal.getComponent(axis)*s;positions[k+axis]=centers[i].getComponent(axis)+v*radius;normals[k+axis]=v;}}}
  geo.attributes.position.needsUpdate=geo.attributes.normal.needsUpdate=true;charm.position.copy(centers[24]);
  if(cape&&capeRest){const p=cape.geometry.attributes.position;for(let i=0;i<p.count;i++){const fall=(.75-capeRest[i*3+1])/.58;p.setZ(i,capeRest[i*3+2]-Math.sin(time*3+fall*3)*.035*fall-walk*.06*fall);}p.needsUpdate=true;cape.geometry.computeVertexNormals();}
 }
 animate(0,0);return{root,animate,dispose:()=>disposeModel(root)};
}
