import {expeditionEffects} from './expedition-effects';
import {biomeScenery,biomeSky} from './biome-scenery';
import * as T from 'three';
import type {AdventureLayout} from './adventure-layout';
import {gorgeBank,gorgeElevation,gorgeCliffTop,gorgeLandmarks} from './gorge-terrain';
import {batchStatic} from './static-model';
/** Continuous cliff faces replace the repeated hedge blocks. All terrain heights are shared with gameplay. */
export function gorgeWorld(scene:T.Scene,world:T.Group,layout:AdventureLayout){
 const n=layout.maze.grid.length,props=new T.Group();props.name='gorge-landmarks';
 const sand=new T.MeshLambertMaterial({color:0xbdb795}),stone=new T.MeshLambertMaterial({color:0x9f9781,flatShading:true}),dark=new T.MeshLambertMaterial({color:0x6f7765}),wood=new T.MeshLambertMaterial({color:0x9a7d5b}),waterMat=new T.MeshLambertMaterial({color:0x70b5b5,transparent:true,opacity:.66,side:T.DoubleSide});
 const add=(geo:T.BufferGeometry,mat:T.Material,x:number,y:number,z:number,parent:T.Group=props)=>{const mesh=new T.Mesh(geo,mat);mesh.position.set(x,y,z);parent.add(mesh);return mesh;};
 const moss=new T.MeshLambertMaterial({color:0x769961}),rootMat=new T.MeshLambertMaterial({color:0x7c7559});
 const color=new T.Color(),terrain=new T.PlaneGeometry(n,n,n*2,n*2);terrain.rotateX(-Math.PI/2);const attr=terrain.attributes.position,colors:number[]=[];
 for(let i=0;i<attr.count;i++){const x=attr.getX(i)+n/2,z=attr.getZ(i)+n/2;attr.setXYZ(i,x,gorgeElevation(x,z,layout)-.025,z);color.set(layout.maze.grid[Math.floor(z)]?.[Math.floor(x)]===1||Math.sin(x*.67)*Math.cos(z*.73)>.27?0x72945e:0xb4ad83).multiplyScalar(.94+Math.sin(x*1.7+z*.3)*.025+Math.cos(z*2.1)*.025);colors.push(color.r,color.g,color.b);}
 terrain.setAttribute('color',new T.Float32BufferAttribute(colors,3));terrain.computeVertexNormals();const grain=document.createElement('canvas');grain.width=grain.height=128;const gc=grain.getContext('2d')!;gc.fillStyle='#dce0c8';gc.fillRect(0,0,128,128);for(let i=0;i<260;i++){gc.fillStyle=i%3?'#b8a28740':'#f9efd54a';gc.fillRect(i*37%128,i*53%128,1+i%4,.7);}const groundMap=new T.CanvasTexture(grain);groundMap.colorSpace=T.SRGBColorSpace;groundMap.wrapS=groundMap.wrapT=T.RepeatWrapping;groundMap.repeat.set(n/2,n/2);
 const floor=new T.Mesh(terrain,new T.MeshLambertMaterial({vertexColors:true,map:groundMap}));floor.name='canyon-contoured-ground';world.add(floor);
 let positions:number[]=[],tints:number[]=[];const sectors=new Map<string,{positions:number[];tints:number[];x:number;z:number}>();
 const triangle=(a:number[],b:number[],c:number[],hex:number,shade=1)=>{positions.push(...a,...b,...c);color.set(hex).multiplyScalar(shade);for(let i=0;i<3;i++)tints.push(color.r,color.g,color.b);};
 const palette=[0x858674,0x96927c,0xa29b82,0x8b8a76,0xa69e87,0x9b967e,0xaaa58b,0x969b7b,0xada98f,0xa29b82,0x9ca180,0x8d9873];
 const sculpt=(x:number,z:number,f:number)=>[x+Math.sin(z*.61+x*.19)*.34*f*f,z+Math.cos(x*.52-z*.23)*.34*f*f];
 for(let z=0;z<n;z++)for(let x=0;x<n;x++)if(layout.maze.grid[z][x]===1){
  const key=`${Math.floor(x/12)},${Math.floor(z/12)}`;let sector=sectors.get(key);if(!sector){sector={positions:[],tints:[],x:Math.floor(x/12)*12+6,z:Math.floor(z/12)*12+6};sectors.set(key,sector);}positions=sector.positions;tints=sector.tints;
  for(const [dx,dz,ax,az,bx,bz]of [[0,-1,0,0,1,0],[1,0,1,0,1,1],[0,1,1,1,0,1],[-1,0,0,1,0,0]]){
   if(layout.maze.grid[z+dz]?.[x+dx]===1)continue;
   for(let band=0;band<12;band++)for(let segment=0;segment<3;segment++){
    const at=(t:number,f:number)=>{const px=x+ax+(bx-ax)*t,pz=z+az+(bz-az)*t,base=gorgeElevation(px,pz,layout),v=sculpt(px,pz,f),rib=Math.sin(f*Math.PI*12)*.03*Math.sin(t*Math.PI),wave=Math.sin(px*.7+pz*.4)*.05*Math.sin(f*Math.PI);return[v[0]+dx*rib,base+(gorgeCliffTop(px,pz,layout)-base)*f+wave,v[1]+dz*rib];};
    const a=at(segment/3,band/12),b=at((segment+1)/3,band/12),c=at((segment+1)/3,(band+1)/12),d=at(segment/3,(band+1)/12),shade=.94+Math.sin((x+z)*.34)*.04;
    triangle(a,b,c,palette[band],shade);triangle(a,c,d,palette[band],shade);
   }
  }
  // Grassy intermediate shelves sit above head height and attach to solid cliffs.
  if((x*13+z*7)%7===0)for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]])if(layout.maze.grid[z+dz]?.[x+dx]===0){const px=x+.5+dx*.49,pz=z+.5+dz*.49,base=gorgeElevation(px,pz,layout),height=gorgeCliffTop(px,pz,layout)-base,sy=base+height*(.38+(x+z)%2*.2);const shelf=add(new T.BoxGeometry(dx?.27:1.05,.13,dx?1.05:.27),moss,px+dx*.06,sy,pz+dz*.06);shelf.rotation.y=Math.sin(x+z)*.04;for(let k=0;k<2;k++){const vine=add(new T.CylinderGeometry(.018,.028,.5+k*.25,5),rootMat,px+dx*.18+(dz?(k-.5)*.45:0),sy-.28-k*.1,pz+dz*.18+(dx?(k-.5)*.45:0));vine.rotation.z=Math.sin(x+z+k)*.14;}}
  const cap=(x:number,z:number)=>{const v=sculpt(x,z,1);return[v[0],gorgeCliffTop(x,z,layout),v[1]];};const a=cap(x,z),b=cap(x+1,z),c=cap(x+1,z+1),d=cap(x,z+1);triangle(a,c,b,0x6d9059);triangle(a,d,c,0x73985f);
 }
 const cliffs=new T.Group();cliffs.name='stratified-canyon-cliffs';cliffs.userData.cameraOccluder=true;const cliffMaterial=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide}),chunks:{mesh:T.Mesh;x:number;z:number}[]=[];
 for(const sector of sectors.values()){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(sector.positions,3));geo.setAttribute('color',new T.Float32BufferAttribute(sector.tints,3));geo.computeVertexNormals();geo.computeBoundingSphere();const mesh=new T.Mesh(geo,cliffMaterial);cliffs.add(mesh);chunks.push({mesh,x:sector.x,z:sector.z});}world.add(cliffs);
 const scenery=biomeScenery(scene,world,layout,'gorge'),effects=expeditionEffects(world,layout,'gorge');
 const {river:r,bridge:b,arch}=gorgeLandmarks(layout),base=gorgeBank(r.x,r.y,layout);
 const riverGeo=new T.PlaneGeometry(1.62,5.6,8,28);riverGeo.rotateX(-Math.PI/2);const rp=riverGeo.attributes.position;for(let i=0;i<rp.count;i++){const z=rp.getZ(i)+r.y,x=rp.getX(i)+r.x+Math.sin((z-r.y)*.9)*.18;rp.setXYZ(i,x,gorgeBank(x,z,layout)-.31,z);}riverGeo.computeVertexNormals();const river=new T.Mesh(riverGeo,waterMat);river.name='gorge-shallow-river';world.add(river);
 const deckGeo=new T.PlaneGeometry(3.5,.82,20,2);deckGeo.rotateX(-Math.PI/2);const dp=deckGeo.attributes.position;for(let i=0;i<dp.count;i++){const x=dp.getX(i)+b.x,z=dp.getZ(i)+b.y;dp.setXYZ(i,x,gorgeElevation(x,z,layout)+.015,z);}deckGeo.computeVertexNormals();const deck=new T.Mesh(deckGeo,stone);deck.name='gorge-walkable-bridge';world.add(deck);
 // Bank stairs follow the same smooth surface used by the player, rather than floating blocks.
 for(const side of [-1,1])for(let i=0;i<5;i++){const x=b.x+side*(1.9+i*.24),z=b.y,h=gorgeElevation(x,z,layout);add(new T.BoxGeometry(.22,.04,.84),sand,x,h+.025,z);}
 for(const side of [-1,1])for(let i=0;i<6;i++){const x=b.x-1.6+i*.64,z=b.y+side*.57,h=gorgeBank(x,z,layout);add(new T.CylinderGeometry(.035,.045,.55,6),wood,x,h+.27,z);if(i<5)add(new T.BoxGeometry(.69,.04,.045),wood,x+.32,h+.51,z);}
 // A rock tunnel with open ends. Its roof is also part of camera collision.
 const caveRoof=new T.Group();caveRoof.name='gorge-cave-roof';caveRoof.userData.cameraOccluder=true;
 for(const side of [-1,1]){const flank=add(new T.DodecahedronGeometry(1),stone,r.x+side*2.65,base+1.7,r.y-1);flank.scale.set(.45,2.0,1.4);}
 for(let i=0;i<9;i++){const a=i*Math.PI/8,roof=add(new T.DodecahedronGeometry(.65),i%3?stone:sand,r.x+Math.cos(a)*2.3,base+2.3+Math.sin(a)*1.25,r.y-1,caveRoof);roof.scale.set(1,.65,2);roof.rotation.z=a*.12;}world.add(caveRoof);
 for(let i=0;i<6;i++){const crystal=add(new T.OctahedronGeometry(.11),new T.MeshLambertMaterial({color:0xb7dbd5,emissive:0x294443}),r.x+(i%2?1.9:-1.9),base+.15,r.y-2+i*.4);crystal.scale.y=1.8;}
 const a={x:arch.x+.5,z:arch.y+.5},ah=gorgeBank(a.x,a.z,layout);
 for(const side of [-1,1]){const column=add(new T.CylinderGeometry(.4,.65,3.1,7),stone,a.x+side*2.7,ah+1.55,a.z);column.rotation.z=-side*.12;}
 const curve=new T.CatmullRomCurve3([new T.Vector3(-2.65,2.8,0),new T.Vector3(-1.5,3.65,0),new T.Vector3(0,3.95,0),new T.Vector3(1.5,3.65,0),new T.Vector3(2.65,2.8,0)]);add(new T.TubeGeometry(curve,16,.4,6,false),sand,a.x,ah,a.z);
 for(const q of [...layout.forest!.trunks,...layout.forest!.pillars]){const h=gorgeElevation(q.x+.5,q.y+.5,layout);const p=add(new T.CylinderGeometry(.25,.36,1.5,7),stone,q.x+.5,h+.75,q.y+.5);p.rotation.y=q.x*.4;add(new T.CylinderGeometry(.28,.3,.11,7),sand,q.x+.5,h+1.3,q.y+.5);}
 for(let i=0;i<90;i++){const x=2+i*31%(n-4),z=2+i*47%(n-4);if(layout.maze.grid[z]?.[x]!==1||layout.maze.grid[z+1]?.[x]!==1)continue;const top=gorgeCliffTop(x+.5,z+.5,layout),spire=add(new T.ConeGeometry(.42,1.7+i%3*.3,5),i%2?stone:sand,x+.5,top+.25,z+.5);spire.rotation.z=Math.sin(i)*.13;}
 // Small scree hugs solid boundaries; it never introduces invisible path colliders.
 for(let i=0;i<240;i++){const x=1+(i*37%(n-2)),z=1+(i*61%(n-2));if(layout.maze.grid[z]?.[x]!==0||![[-1,0],[1,0],[0,-1],[0,1]].some(([dx,dz])=>layout.maze.grid[z+dz]?.[x+dx]===1))continue;const px=x+.18,pz=z+.2;const pebble=add(new T.DodecahedronGeometry(.06+(i%3)*.018),i%2?dark:sand,px,gorgeElevation(px,pz,layout)+.04,pz);pebble.scale.y=.5;}
 const f=layout.fortress,arenaBase=gorgeElevation(f.x+.5,f.y+.5,layout);
 for(let i=0;i<8;i++){const angle=i*Math.PI/4,px=f.x+.5+Math.sin(angle)*7.1,pz=f.y+.5+Math.cos(angle)*7.1;if(layout.maze.grid[Math.floor(pz)]?.[Math.floor(px)]!==0)continue;const h=gorgeElevation(px,pz,layout);const shard=add(new T.OctahedronGeometry(.35),stone,px,h+.3,pz);shard.scale.set(1,.9,1);}
 const emblem=add(new T.RingGeometry(2.1,2.16,40),sand,f.x+.5,arenaBase+.018,f.y+.5);emblem.rotation.x=-Math.PI/2;
 const skyTexture=biomeSky('gorge'),sky=new T.Mesh(new T.SphereGeometry(120,24,12),new T.MeshBasicMaterial({map:skyTexture,side:T.BackSide,depthWrite:false,fog:false}));sky.name='canyon-wispy-sky';scene.add(sky);
 const ripples:T.Mesh[]=[];for(let i=0;i<6;i++){const ripple=add(new T.PlaneGeometry(.45,.025),new T.MeshBasicMaterial({color:0xc9e7df,transparent:true,opacity:.45}),r.x+(i%2-.5)*.5,base-.29,r.y-2+i*.7);ripple.rotation.x=-Math.PI/2;ripples.push(ripple);}
 ripples.forEach(m=>{props.remove(m);world.add(m);});batchStatic(props);world.add(props);
 return {update(t:number,camera:T.Camera,_player?:{x:number;y:number;depth?:number}){effects.update(t);sky.position.copy(camera.position);scenery.update(camera);const center=world.worldToLocal(camera.position.clone());chunks.forEach(c=>c.mesh.visible=Math.hypot(c.x-center.x,c.z-center.z)<50);if(scene.fog instanceof T.Fog){scene.fog.color.set(0xc8dbc3);scene.fog.near=36;scene.fog.far=88;}ripples.forEach((m,i)=>{m.position.z=r.y-2.5+(t*.45+i*.8)%5;const h=gorgeBank(m.position.x,m.position.z,layout);m.position.y=h-.29;});},dispose(){scenery.dispose();skyTexture.dispose();}};
}
