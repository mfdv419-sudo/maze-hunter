import * as T from 'three';
import {biomeSky} from './biome-scenery';
import type {AdventureLayout} from './adventure-layout';
import type {AdventureState} from './adventure-state';
import {pilotGround,pilotWallHeight,PILOT_WATER_LEVEL as WATER} from './forest-pilot';
import {forestTree} from './world-art';
/** Shared grid is the solid boundary. Rock faces meet at exactly the same vertices. */
export function forestPilotWorld(scene:T.Scene,world:T.Group,l:AdventureLayout,state?:()=>AdventureState|undefined){
 const root=new T.Group(),dynamic=new T.Group();root.name='forest-grove-pilot';root.userData.cameraOccluder=true;world.add(root,dynamic);
 const skyTexture=biomeSky('forest'),sky=new T.Mesh(new T.SphereGeometry(120,24,12),new T.MeshBasicMaterial({map:skyTexture,side:T.BackSide,fog:false,depthWrite:false}));scene.add(sky);scene.background=new T.Color(0xc8e9ed);scene.fog=new T.Fog(0xc8e9ed,32,88);
 const mat=(color:number)=>new T.MeshLambertMaterial({color,flatShading:true});
 const stone=mat(0x817864),wood=mat(0x997044),leaf=mat(0x4f8e46),flower=[mat(0xffd683),mat(0xffeee3),mat(0xe7a5c1)],foam=new T.MeshBasicMaterial({color:0xe6ffff,transparent:true,opacity:.65,side:T.DoubleSide});
 const add=(g:T.BufferGeometry,m:T.Material,x:number,y:number,z:number,parent=root)=>{const mesh=new T.Mesh(g,m);mesh.position.set(x,y,z);parent.add(mesh);return mesh;};
 const n=l.maze.grid.length,grid=l.maze.grid,dynamicCells=new Set([...l.pilot!.gates,...l.pilot!.bridge,...l.pilot!.shortcut,...l.pilot!.exit].map(p=>`${p.x},${p.y}`));
 const solid=(x:number,z:number)=>grid[z]?.[x]===1&&!dynamicCells.has(`${x},${z}`);
 const terrain=new T.PlaneGeometry(n,n,n*2,n*2);terrain.rotateX(-Math.PI/2);const pos=terrain.attributes.position,colors:number[]=[];
 for(let i=0;i<pos.count;i++){const x=pos.getX(i)+n/2,z=pos.getZ(i)+n/2,h=pilotGround(x,z);pos.setXYZ(i,x,h-.025,z);const boundary=Array.from({length:9},(_,j)=>solid(Math.floor(x)+(j%3)-1,Math.floor(z)+Math.floor(j/3)-1)).some(Boolean),c=new T.Color(h<WATER?0xa5a17b:boundary?0x80ad54:0x9dbf65);c.multiplyScalar(.95+.05*Math.sin(x*2+z));colors.push(c.r,c.g,c.b);}
 terrain.setAttribute('color',new T.Float32BufferAttribute(colors,3));terrain.computeVertexNormals();add(terrain,new T.MeshLambertMaterial({vertexColors:true}),0,0,0);
 // Contour-following dirt ribbons. Skip water and blocked cells rather than drawing through them.
 const trails=[[[12,63],[18,58],[32,49]],[[32,49],[22,43],[15,35],[12,24]],[[32,49],[44,43],[54,30]],[[32,49],[42,58],[55,53]],[[12,24],[12,15],[23,15],[27,21],[34,25]],[[55,53],[63,46],[63,24],[34,25]],[[12,24],[16,33],[24,32],[44,32],[54,30]],[[54,30],[61,37],[61,47],[55,53]],[[34,25],[32,38],[32,49]],[[34,25],[34,9],[57,9]]];
 const trailPoints:number[]=[];for(const points of trails){const curve=new T.CatmullRomCurve3(points.map(([x,z])=>new T.Vector3(x+.5,0,z+.5)),false,'centripetal'),steps=Math.ceil(curve.getLength()*5);for(let i=0;i<steps;i++){const a=curve.getPoint(i/steps),b=curve.getPoint((i+1)/steps),side=new T.Vector3(b.z-a.z,0,a.x-b.x).normalize().multiplyScalar(.5),quad=[a.clone().add(side),b.clone().add(side),b.clone().sub(side),a.clone().sub(side)];if(quad.some(p=>grid[Math.floor(p.z)]?.[Math.floor(p.x)]!==0||pilotGround(p.x,p.z)<WATER+.12))continue;for(const k of[0,2,1,0,3,2]){const q=quad[k];trailPoints.push(q.x,pilotGround(q.x,q.z)+.012,q.z);}}}
 const path=new T.BufferGeometry();path.setAttribute('position',new T.Float32BufferAttribute(trailPoints,3));path.computeVertexNormals();add(path,mat(0xc4ae79),0,0,0).name='contour-following-trails';
 // Chunked continuous cliffs: no isolated columns, no seams or decorative overhang into lanes.
 for(let cz=0;cz<n;cz+=12)for(let cx=0;cx<n;cx+=12){const vertices:number[]=[],color:number[]=[];
  const tri=(a:number[],b:number[],c:number[],hex:number)=>{vertices.push(...a,...b,...c);const v=new T.Color(hex);for(let i=0;i<3;i++)color.push(v.r,v.g,v.b);};
  for(let z=cz;z<Math.min(n,cz+12);z++)for(let x=cx;x<Math.min(n,cx+12);x++)if(solid(x,z)){
   for(const [dx,dz,ax,az,bx,bz]of [[0,-1,0,0,1,0],[1,0,1,0,1,1],[0,1,1,1,0,1],[-1,0,0,1,0,0]])if(!solid(x+dx,z+dz)){
    for(let band=0;band<4;band++){const point=(t:number,f:number)=>{const px=x+ax+(bx-ax)*t,pz=z+az+(bz-az)*t,base=pilotGround(px,pz)-.15,top=pilotWallHeight(px,pz),inset=Math.sin(f*Math.PI)*Math.sin(t*Math.PI)*.13;return[px-dx*inset,base+(top-base)*f,pz-dz*inset];};const a=point(0,band/4),b=point(1,band/4),c=point(1,(band+1)/4),d=point(0,(band+1)/4),hex=[0x82745e,0x978169,0xa28b6b,0x899465][band];tri(a,c,b,hex);tri(a,d,c,hex);}
   }
   const a=[x,pilotWallHeight(x,z),z],b=[x+1,pilotWallHeight(x+1,z),z],c=[x+1,pilotWallHeight(x+1,z+1),z+1],d=[x,pilotWallHeight(x,z+1),z+1];tri(a,c,b,0x699d49);tri(a,d,c,0x699d49);
  }
  if(vertices.length){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('color',new T.Float32BufferAttribute(color,3));g.computeVertexNormals();const m=add(g,new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide}),0,0,0);m.name='continuous-cliff-chunk';}
 }
 // Reusable low-poly tree forms; all large trunks sit on the solid side, never in a walking lane.
 const prototypes=[forestTree(0),forestTree(1),forestTree(2)];
 for(let z=2;z<n-2;z+=2)for(let x=2;x<n-2;x+=2)if(solid(x,z)&&(x*7+z*13)%9<3){const tree=prototypes[(x+z)%3].clone(true),scale=1.7+(x*13+z*7)%7*.16;tree.position.set(x+.5,pilotWallHeight(x+.5,z+.5),z+.5);tree.scale.set(scale,scale*1.25,scale);root.add(tree);}
 // Collapse repeated trees into instance batches, retaining original geometry/material ownership.
 root.updateWorldMatrix(true,true);const inverse=root.matrixWorld.clone().invert(),treeBatches=new Map<T.BufferGeometry,{material:T.Material;matrices:T.Matrix4[]}>();
 for(const tree of [...root.children].filter(o=>o.type==='Group')){tree.traverse(o=>{if(o instanceof T.Mesh&&!Array.isArray(o.material)){let b=treeBatches.get(o.geometry);if(!b){b={material:o.material,matrices:[]};treeBatches.set(o.geometry,b);}b.matrices.push(inverse.clone().multiply(o.matrixWorld));}});root.remove(tree);}
 for(const [geometry,b]of treeBatches){const mesh=new T.InstancedMesh(geometry,b.material,b.matrices.length);b.matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.computeBoundingSphere();mesh.name='instanced-forest-trees';root.add(mesh);}
 // Instance small vegetation in bounded chunks rather than adding thousands of individual draw calls.
 const sprigs:T.Matrix4[]=[],blossoms:T.Matrix4[][]=[[],[],[]],dummy=new T.Object3D();
 for(let i=0;i<1600;i++){const x=1+(i*17.137)%(n-2),z=1+(i*31.733)%(n-2),ix=Math.floor(x),iz=Math.floor(z);if(grid[iz]?.[ix]!==0||pilotGround(x,z)<WATER+.2)continue;const edge=[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>solid(ix+a,iz+b));if(!edge&&i%5)continue;dummy.position.set(x,pilotGround(x,z)+.12,z);dummy.rotation.set(0,i*.7,.15*Math.sin(i));dummy.scale.set(.7+i%3*.2,1,.7+i%3*.2);dummy.updateMatrix();sprigs.push(dummy.matrix.clone());if(i%3===0){dummy.position.y+=.16;dummy.scale.setScalar(.8);dummy.updateMatrix();blossoms[i%3].push(dummy.matrix.clone());}}
 const instances=(g:T.BufferGeometry,m:T.Material,list:T.Matrix4[])=>{const mesh=new T.InstancedMesh(g,m,list.length);list.forEach((v,i)=>mesh.setMatrixAt(i,v));mesh.computeBoundingSphere();root.add(mesh);};instances(new T.ConeGeometry(.11,.3,4),leaf,sprigs);blossoms.forEach((list,i)=>instances(new T.IcosahedronGeometry(.08,0),flower[i],list));
 // Decks follow the terrain and the direction of each existing connection. Rails are visual edge cues.
 for(const [cx,cz,w,d]of[[31.5,32.5,7,2],[32.5,38.5,5,2]]){for(let i=0;i<Math.ceil(w*3);i++){const x=cx-w/2+i/3;add(new T.BoxGeometry(.29,.1,d),wood,x,pilotGround(x,cz)+.04,cz);}for(const side of[-1,1]){for(let i=0;i<4;i++){const x=cx-w/2+i*w/3;add(new T.BoxGeometry(.09,.8,.09),wood,x,pilotGround(x,cz)+.4,cz+side*d/2);}const rail=add(new T.BoxGeometry(w,.07,.07),wood,cx,pilotGround(cx,cz)+.76,cz+side*d/2);rail.rotation.z=(pilotGround(cx+w/2,cz)-pilotGround(cx-w/2,cz))/w;}}
 // Rune ruins are aligned with the state's round colliders, including their terrain elevation.
 for(const x of[50,58])for(const z of[27,34]){const h=pilotGround(x,z);add(new T.CylinderGeometry(.3,.38,2.1,7),stone,x,h+1.05,z);add(new T.BoxGeometry(.8,.22,.8),stone,x,h+2.15,z);}add(new T.BoxGeometry(8.6,.28,.7),stone,54,pilotGround(54,27)+2.4,27);
 const switches=l.pilot!.switches.map(p=>{const h=pilotGround(p.x+.5,p.y+.5),m=add(new T.CylinderGeometry(.32,.38,.7,6),new T.MeshLambertMaterial({color:0x9271b7,emissive:0x171024}),p.x+.5,h+.35,p.y+.5,dynamic);add(new T.OctahedronGeometry(.15),new T.MeshBasicMaterial({color:0xe8d0ff}),p.x+.5,h+.9,p.y+.5,dynamic);return m;});
 const gates=[l.pilot!.gates,l.pilot!.bridge,l.pilot!.shortcut,l.pilot!.exit].map((cells,i)=>{const g=new T.Group();g.name=['sigil-sanctuary-gate','cliff-bridge-gate','tree-shortcut','boss-exit-gate'][i];for(const p of cells)add(new T.BoxGeometry(1,1.8,1),mat(i===0?0x8461ac:0x8b7555),p.x+.5,pilotGround(p.x+.5,p.y+.5)+.9,p.y+.5,g);dynamic.add(g);return g;});
 // The water surface is clipped by exactly the same depth field used for swimming.
 const waterVertices:number[]=[];for(let z=33;z<62;z+=.25)for(let x=47;x<65;x+=.25){for(const tri of [[[x,z],[x+.25,z],[x,z+.25]],[[x+.25,z],[x+.25,z+.25],[x,z+.25]]]){if(tri.every(([a,b])=>pilotGround(a,b)<WATER-.015))for(const [a,b]of tri)waterVertices.push(a,WATER,b);}}
 const waterGeo=new T.BufferGeometry();waterGeo.setAttribute('position',new T.Float32BufferAttribute(waterVertices,3));waterGeo.computeVertexNormals();add(waterGeo,new T.MeshPhongMaterial({color:0x26a9c2,transparent:true,opacity:.9,shininess:85,side:T.DoubleSide}),0,0,0,dynamic).name='depth-matched-water';
 // Dive tunnel stays below a clearly visible stone lintel, not a bridge over dry grass.
 add(new T.BoxGeometry(3.6,.45,1),stone,61.5,.15,37.5);for(const side of[-1,1])add(new T.BoxGeometry(.45,2.5,1),stone,61.5+side*1.8,-1,37.5);
 // Waterfall has volume and double-sided material: visible from front, side and rear.
 const fall=add(new T.BoxGeometry(.4,3.5,2.2,1,8,1),new T.MeshPhongMaterial({color:0x56d1e3,transparent:true,opacity:.85,side:T.DoubleSide}),62.25,1.13,40.5,dynamic);fall.name='waterfall-volume';
 const streaks=Array.from({length:8},(_,i)=>add(new T.BoxGeometry(.025,.45,.06),foam,62.02,1,39.6+i*.25,dynamic));
 const ripples=Array.from({length:10},()=>{const m=add(new T.TorusGeometry(.3,.018,4,24),foam.clone(),62.1,WATER+.025,40.5,dynamic);m.rotation.x=-Math.PI/2;return m;});
 // Keep Sanctuary natural and unobstructed: a small engraved ring replaces the giant pink disc.
 const ring=add(new T.RingGeometry(3.7,3.82,40),mat(0xb3a888),34.5,pilotGround(34.5,9.5)+.015,9.5);ring.rotation.x=-Math.PI/2;
 const textures=new Set<T.Texture>();return {update(t:number,camera:T.Camera,player?:{x:number;y:number;depth?:number}){const s=state?.();sky.position.copy(camera.position);sky.visible=camera.position.y>WATER;streaks.forEach((m,i)=>m.position.y=2.8-(t*2+i*.43)%3.45);gates.forEach((g,i)=>g.visible=i===0?!s?.sigilReady:i===1?!s?.pilotSwitches.includes(0):i===2?!s?.climbed.has(802):!s?.bossCleared);switches.forEach((m,i)=>(m.material as T.MeshLambertMaterial).emissive.set(s?.pilotSwitches.includes(i)?0x4aab6e:0x171024));ripples.forEach((m,i)=>{const age=(t*.6+i*.1)%1;m.scale.setScalar(.4+age*2);(m.material as T.MeshBasicMaterial).opacity=(1-age)*.5;if(i<5&&s?.swimming&&player){m.position.set(player.x+Math.sin(i)*.1,WATER+.025,player.y+Math.cos(i)*.1);m.visible=pilotGround(player.x,player.y)<WATER;}else {m.visible=true;m.position.set(62.1,WATER+.025,40.5);}});fall.scale.z=1+Math.sin(t*4)*.015;if(scene.fog instanceof T.Fog){const under=camera.position.y<WATER;scene.fog.color.set(under?0x418d99:0xc8e9ed);scene.fog.near=under?2:32;scene.fog.far=under?22:88;}},dispose(){skyTexture.dispose();sky.geometry.dispose();sky.material.dispose();scene.remove(sky);const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();for(const group of[root,dynamic])group.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>{for(const v of Object.values(m))if(v instanceof T.Texture)textures.add(v);m.dispose();});textures.forEach(t=>t.dispose());world.remove(root,dynamic);}};
}
