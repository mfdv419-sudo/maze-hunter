import * as T from 'three';
import {addMesh,joint,roundBox,satin} from './model-parts';
import {batchStatic} from './static-model';
const box=(p:T.Object3D,w:number,h:number,d:number,m:T.Material,x:number,y:number,z:number,r=.025)=>addMesh(p,roundBox(w,h,d,r),m,x,y,z);
const ell=(p:T.Object3D,m:T.Material,x:number,y:number,z:number,sx:number,sy:number,sz:number)=>{const q=addMesh(p,new T.SphereGeometry(1,12,8),m,x,y,z);q.scale.set(sx,sy,sz);return q;};
/** Separate gear follows the animated wrist/knee. Explicit bare remains an empty named group. */
export function gloveModel(parent:T.Group,kind:string,side:number){
 const root=joint(parent,0,-.135,.025,'gloves');root.userData.gear=kind;if(kind==='bare')return root;
 const colors:Record<string,number>={trail:0x607d60,climber:0xcf714c,desert:0xc4a377,diver:0x345967};
 const cloth=satin(colors[kind]??colors.trail),dark=satin(kind==='desert'?0x8e7859:0x253c43),trim=satin(kind==='diver'?0x83d6cc:kind==='climber'?0xffd386:0xe6d5ad);
 box(root,.178,.118,.174,cloth,0,-.025,0,.04);const cuff=addMesh(root,new T.CylinderGeometry(.087,.09,.055,10),dark,0,.052,0);cuff.scale.z=.94;box(root,.13,.024,.185,trim,0,.049,0,.01);
 const thumb=addMesh(root,new T.CapsuleGeometry(.035,.055,3,7),cloth,side*.09,-.035,.04);thumb.rotation.z=side*.42;thumb.rotation.x=.45;
 for(let i=0;i<3;i++){const finger=addMesh(root,new T.CapsuleGeometry(.023,.035,2,6),kind==='trail'?trim:cloth,(i-1)*.044,-.056,.076);finger.rotation.x=Math.PI/2;box(root,.032,.012,.035,dark,(i-1)*.044,.025,.035,.005);}
 if(kind==='climber'){const ring=addMesh(root,new T.TorusGeometry(.027,.008,4,10),trim,side*.087,.055,-.02);ring.rotation.y=Math.PI/2;}
 if(kind==='desert')for(let i=0;i<2;i++)box(root,.185,.012,.175,trim,0,-.01-i*.035,0,.005);
 if(kind==='diver')box(root,.045,.035,.035,trim,0,.032,.095,.01);return batchStatic(root);
}
export function bootModel(parent:T.Group,kind:string,side:number){
 const root=joint(parent,0,-.095,.055,'boots');root.userData.gear=kind;if(kind==='bare')return root;
 const colors:Record<string,number>={trail:0x926f4c,climber:0xba6244,desert:0xc8ae7d,diver:0x315b68};
 const leather=satin(colors[kind]??colors.trail),sole=satin(kind==='desert'?0x755e43:0x243841),trim=satin(kind==='diver'?0x7ed5cf:0xf0dbad);
 box(root,.208,.135,.292,leather,0,0,.015,.045);box(root,.215,.041,.31,sole,0,-.073,.022,.014);box(root,.184,kind==='climber'?.16:.105,.188,leather,0,.075,-.035,.035);box(root,.193,.028,.195,trim,0,kind==='climber'?.15:.118,-.035,.012);box(root,.19,.052,.135,sole,0,-.002,.105,.02);
 if(kind!=='diver')for(let i=0;i<3;i++){box(root,.104,.012,.02,trim,0,.07-i*.027,.125,.004);for(const s of [-1,1])box(root,.025,.02,.026,sole,s*.069,.07-i*.027,.107,.004);}
 for(let i=0;i<3;i++)box(root,.22,.014,.025,trim,0,-.09,-.065+i*.09,.004);
 if(kind==='climber'){const hook=addMesh(root,new T.TorusGeometry(.018,.006,4,8),trim,side*.105,.11,.01);hook.rotation.y=Math.PI/2;}
 if(kind==='diver'){const fin=box(root,.25,.035,.38,leather,0,-.057,.275,.035);fin.rotation.x=-.06;for(const s of [-1,1])box(root,.018,.018,.3,trim,s*.09,-.033,.28,.006);box(root,.2,.045,.045,trim,0,.035,.13,.008);}return batchStatic(root);
}
export function expeditionWearables(body:T.Group,head:T.Group,arms:T.Group[],legs:T.Group[],a:{body:string;head:string;face:string;back:string}){
 const ink=satin(0x253c43),cream=satin(0xf4e4c4),gold=satin(0xe8bd6e),teal=satin(0x46b6ad),moon=satin(0xa9d9d7),sand=satin(0xd5bd8d),orange=satin(0xd18054);
 if(a.body==='explorer'){
  for(const side of [-1,1]){box(body,.13,.115,.05,satin(0x718b5f),side*.14,.56,.215,.018);box(body,.14,.035,.07,cream,side*.14,.625,.22,.012);}box(body,.5,.05,.39,ink,0,.4,0,.018);box(body,.09,.065,.026,gold,0,.4,.21,.01);
 }
 if(a.body==='climber'){
  box(body,.515,.065,.4,ink,0,.425,0,.02);box(body,.075,.08,.035,gold,0,.425,.223,.012);
  for(const side of [-1,1]){const strap=box(body,.045,.31,.036,ink,side*.14,.61,.215,.012);strap.rotation.z=-side*.27;const loop=addMesh(legs[side<0?0:1],new T.TorusGeometry(.095,.015,5,12),ink,0,-.07,0);loop.rotation.x=Math.PI/2;}
  const clip=addMesh(body,new T.TorusGeometry(.043,.012,5,12),gold,.22,.41,.14);clip.rotation.z=.25;
 }
 if(a.body==='desert'){
  box(body,.51,.06,.4,satin(0x8d7253),0,.46,0,.02);for(const side of [-1,1]){const flap=box(body,.22,.18,.04,sand,side*.12,.35,.17,.025);flap.rotation.z=-side*.07;const wrap=ell(body,cream,side*.22,.76,0,.12,.065,.21);wrap.rotation.z=-side*.16;}
 }
 if(a.body==='diver'){
  for(const side of [-1,1]){box(body,.07,.3,.038,teal,side*.17,.59,.205,.018);box(arms[side<0?0:1],.14,.085,.15,moon,0,-.04,0,.025);}box(body,.515,.065,.39,ink,0,.425,0,.02);for(let i=0;i<3;i++)box(body,.065,.07,.04,gold,(i-1)*.13,.42,.213,.012);
 }
 if(a.head==='climber'){
  const helmet=ell(head,orange,0,.28,0,.35,.18,.26);helmet.name='climbing-helmet';box(head,.64,.035,.47,ink,0,.25,0,.015);box(head,.13,.08,.075,ink,0,.31,.26,.02);ell(head,cream,0,.31,.307,.045,.03,.012);for(const side of [-1,1])box(head,.025,.16,.025,ink,side*.3,.19,.02,.006);
 }
 if(a.head==='desert'){
  const wrap=ell(head,cream,0,.25,-.01,.35,.16,.26);wrap.name='desert-head-wrap';for(let i=0;i<3;i++){const band=addMesh(head,new T.TorusGeometry(.272+i*.008,.026,5,18),i%2?sand:cream,0,.22+i*.045,.015);band.rotation.x=Math.PI/2;band.scale.y=.82;}const flap=box(head,.14,.36,.045,cream,-.28,.08,-.17,.025);flap.rotation.z=-.14;
 }
 if(a.head==='diver'){
  const cap=ell(head,teal,0,.23,-.045,.33,.135,.23);cap.name='diving-cap';for(const side of [-1,1])box(head,.05,.17,.12,ink,side*.28,.15,-.02,.02);
 }
 if(a.face==='desert'){
  const lens=new T.MeshPhongMaterial({color:0xe8cda4,transparent:true,opacity:.18,shininess:65,depthWrite:false});
  for(const side of [-1,1]){const frame=addMesh(head,new T.TorusGeometry(.105,.028,6,16),sand,side*.168,.025,.287);frame.name='glasses-frame';addMesh(head,new T.CircleGeometry(.084,16),lens,side*.168,.025,.289);box(head,.018,.025,.24,sand,side*.29,.035,.13,.005);}box(head,.14,.022,.025,ink,0,.035,.29,.006);
 }
 if(a.face==='diver'){
  const mask=joint(head,0,.025,.278,'diving-mask');for(const side of [-1,1]){box(mask,.47,.029,.05,ink,0,side*.09,0,.014);box(mask,.032,.16,.05,ink,side*.22,0,0,.014);box(mask,.43,.012,.026,moon,0,side*.09,.033,.005);}const lens=new T.MeshPhongMaterial({color:0x93ddd8,transparent:true,opacity:.2,shininess:85,depthWrite:false});addMesh(mask,new T.PlaneGeometry(.37,.13),lens,0,0,.053);box(mask,.035,.18,.04,teal,0,0,.06,.01);for(const side of [-1,1])box(head,.024,.065,.28,ink,side*.30,.03,.10,.01);ell(head,ink,0,-.15,.47,.065,.055,.035);ell(head,gold,0,-.15,.503,.032,.03,.012);const tube=new T.CatmullRomCurve3([new T.Vector3(.05,-.15,.45),new T.Vector3(.29,-.22,.31),new T.Vector3(.35,-.15,.01),new T.Vector3(.23,-.32,-.24)]);addMesh(head,new T.TubeGeometry(tube,12,.018,6,false),ink);
 }
 if(a.back==='climber'){
  const pack=joint(body,0,.6,-.265,'climbing-pack');box(pack,.33,.37,.19,orange,0,0,0,.055);box(pack,.35,.105,.21,gold,0,.14,-.015,.035);for(const side of [-1,1])box(body,.04,.32,.035,gold,side*.2,.67,.19,.01);for(let i=0;i<4;i++){const rope=addMesh(pack,new T.TorusGeometry(.12,.015,5,16),cream,0,-.02,-.15-i*.012);rope.scale.y=1.3;}const hook=addMesh(pack,new T.TorusGeometry(.047,.01,5,12),moon,.18,-.06,-.04);hook.rotation.y=.2;
 }
 if(a.back==='diver'){
  const tank=joint(body,0,.58,-.28,'diving-tank');for(const side of [-1,1]){addMesh(tank,new T.CapsuleGeometry(.09,.26,3,10),moon,side*.095,0,-.025);box(tank,.17,.045,.19,ink,side*.095,.11,-.025,.012);box(tank,.17,.045,.19,ink,side*.095,-.1,-.025,.012);addMesh(tank,new T.CylinderGeometry(.025,.025,.07,7),gold,side*.095,.23,-.025);}for(const side of [-1,1])box(body,.04,.34,.035,ink,side*.2,.66,.2,.012);
 }
}
