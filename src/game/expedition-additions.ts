import {abandonedRoad} from './abandoned-road';
import {batchStatic} from './static-model';
import * as T from 'three';import type {AdventureLayout} from './adventure-layout';import type {AdventureArea} from './areas';import {biomeElevation} from './biome-layout';import {platformCourse} from './platform-course';
export interface Sponsor {id:string;name:string;image:string;url:string;active:boolean;slot?:'boss'|'diamond-1'|'diamond-2'|'diamond-3'}
export function validSponsors(value:unknown):Sponsor[]{if(!Array.isArray(value))return[];return value.filter((s:any)=>s&&s.active===true&&typeof s.id==='string'&&/^[a-z0-9-]{1,40}$/.test(s.id)&&typeof s.name==='string'&&s.name.length<70&&(!s.slot||['boss','diamond-1','diamond-2','diamond-3'].includes(s.slot))&&[s.image,s.url].every(u=>typeof u==='string'&&/^https:\/\//.test(u))).slice(0,4);}
export function expeditionAdditions(world:T.Group,l:AdventureLayout,area:AdventureArea,easy=false){const root=new T.Group();root.name='expedition-roads-course-sponsors';world.add(root);const boards:T.Mesh[]=[],textures:T.Texture[]=[];
 const add=(geo:T.BufferGeometry,mat:T.Material,x:number,y:number,z:number)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);root.add(m);return m;},asphalt=new T.MeshLambertMaterial({color:0x414842}),paint=new T.MeshLambertMaterial({color:0xaaa079});
 // Narrow abandoned asphalt follows the middle of each three-cell corridor.
 const patches=new T.MeshLambertMaterial({color:0x736f5d}),cracks=new T.MeshLambertMaterial({color:0x282d28}),weeds=new T.MeshLambertMaterial({color:area==='desert'?0x9c955e:0x64734a}),aggregate=new T.MeshLambertMaterial({color:0x67695e});
 const surface=(geo:T.BufferGeometry,x:number,z:number,rotation=0)=>{geo.rotateX(-Math.PI/2);geo.rotateY(rotation);const positions=geo.getAttribute('position');for(let i=0;i<positions.count;i++){const px=positions.getX(i)+x,pz=positions.getZ(i)+z;positions.setXYZ(i,px,biomeElevation(area,px,pz,l)+.018,pz);}geo.computeVertexNormals();const mesh=new T.Mesh(geo,asphalt);root.add(mesh);return mesh;};
 for(const strip of abandonedRoad(l,area)){
  const dx=(strip.to.x-strip.from.x)/3,dz=(strip.to.y-strip.from.y)/3;
  for(let j=0;j<4;j++){
   const t=(j+.5)*.75,x=strip.from.x+dx*t,z=strip.from.y+dz*t,y=biomeElevation(area,x,z,l),seed=strip.index*13+j,noise=(n:number)=>(Math.sin(seed*17.17+n*78.23)*43758.5453)%1;
   const width=1.82+Math.abs(noise(1))*.08,slab=surface(new T.PlaneGeometry(width,.79,2,2),x,z,dx?Math.PI/2:0);
   // Dust patches, exposed aggregate, broken paint and hairline cracks are original geometry.
   if(j%2===0){const patch=add(new T.CircleGeometry(.13+Math.abs(noise(2))*.1,7),patches,x-dz*.47,y+.023,z+dx*.47);patch.rotation.x=-Math.PI/2;}
   const crack=add(new T.BoxGeometry(.025,.005,.32),cracks,x+dz*.28,y+.025,z-dx*.28);crack.rotation.y=seed*.91;
   const grain=add(new T.BoxGeometry(.05,.012,.07),aggregate,x-dz*.69,y+.027,z+dx*.69);grain.rotation.y=seed;
   if((strip.index+j)%3!==0){const dash=add(new T.BoxGeometry(.045,.004,.19),paint,x,y+.025,z);dash.rotation.y=dx?Math.PI/2:0;}
   if(j===1){const side=strip.index%2?1:-1,grass=add(new T.ConeGeometry(.075,.16,3),weeds,x+dz*side*.87,y+.075,z-dx*side*.87);grass.rotation.z=.28;}
  }
  // Fill corners with the same surface; no isolated slabs or perpendicular overshoot.
  surface(new T.CircleGeometry(.92,12),strip.to.x,strip.to.y);
 }

 for(const a of l.areas.filter(a=>a.zone===5||a.zone>=1&&a.zone<=3)){const x=a.point.x+(area==='sea'&&a.zone!==5?1.7:2.55),z=a.point.y+(area==='sea'&&a.zone!==5?2.1:2.55),y=biomeElevation(area,x,z,l);const wood=new T.MeshLambertMaterial({color:0x78614b});for(const side of[-1,1])add(new T.CylinderGeometry(.04,.07,1.9,6),wood,x+side*.7,y+.95,z);const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#213d47';ctx.fillRect(0,0,512,256);ctx.fillStyle='#ead8a5';ctx.font='bold 34px sans-serif';ctx.textAlign='center';ctx.fillText(a.zone===5?'KING ARENA':'EXPEDITION POST',256,110);ctx.font='22px sans-serif';ctx.fillText('MAZE HUNTER',256,158);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;textures.push(texture);const board=add(new T.BoxGeometry(1.9,.95,.08),new T.MeshLambertMaterial({map:texture}),x,y+1.75,z);board.name='curated-sponsor-space';board.userData.cameraOccluder=true;boards.push(board);}
 const c=platformCourse(l,area);if(c){const base=biomeElevation(area,c.x,c.y,l),hazard=new T.MeshBasicMaterial({color:c.kind==='lava'?0xf26932:0x243544});add(new T.BoxGeometry(5.8,.04,2.7),hazard,c.x,base+(c.kind==='lava'?.02:-5.9),c.y).name=c.kind==='lava'?'lethal-lava-floor':'deep-canyon-abyss';const stone=new T.MeshLambertMaterial({color:c.kind==='lava'?0x615553:0x9d9b7e,flatShading:true});for(const p of c.stones){const platform=add(new T.CylinderGeometry(easy?.68:.49,.3,.65,7),stone,p.x,biomeElevation(area,p.x,p.y,l)-.3,p.y);platform.name='jump-course-stone';}for(let i=0;i<10&&c.kind==='lava';i++){const ember=add(new T.OctahedronGeometry(.04),new T.MeshBasicMaterial({color:0xffdf70}),c.x+Math.sin(i)*2.6,base+.12,c.y+Math.cos(i)*1.1);ember.name='lava-course-ember';}}
 batchStatic(root);let disposed=false;void fetch('/sponsors.json',{cache:'no-cache'}).then(r=>r.ok?r.json():[]).then(value=>{if(disposed)return;validSponsors(value).forEach((s,i)=>{const slot=s.slot==='boss'?3:s.slot?.startsWith('diamond-')?Number(s.slot.slice(-1))-1:i;const board=boards[slot];if(!board)return;const img=new Image();img.crossOrigin='anonymous';img.onload=()=>{if(disposed)return;const tex=new T.Texture(img);tex.colorSpace=T.SRGBColorSpace;tex.needsUpdate=true;textures.push(tex);(board.material as T.MeshLambertMaterial).map=tex;(board.material as T.MeshLambertMaterial).needsUpdate=true;};img.src=s.image;board.userData.sponsor=s;});}).catch(()=>{});
 return{dispose(){disposed=true;textures.forEach(t=>t.dispose());}};
}
