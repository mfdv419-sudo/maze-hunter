import {biomeSky} from './biome-scenery';
import * as T from 'three';
import type {AdventureLayout} from './adventure-layout';
import type {AdventureState} from './adventure-state';
import {pilotGround} from './forest-pilot';
import {forestTree,groundTexture} from './world-art';
import {batchStatic} from './static-model';
export function forestPilotWorld(scene:T.Scene,world:T.Group,l:AdventureLayout,state?:()=>AdventureState|undefined){
 const skyTexture=biomeSky('forest'),sky=new T.Mesh(new T.SphereGeometry(120,24,12),new T.MeshBasicMaterial({map:skyTexture,side:T.BackSide,fog:false,depthWrite:false}));scene.add(sky);
 const root=new T.Group();root.name='forest-grove-pilot';root.userData.cameraOccluder=true;world.add(root);scene.background=new T.Color(0xc8e9ed);scene.fog=new T.Fog(0xc8e9ed,32,88);
 const mats=[0x927d65,0xa78e70,0x738e55,0x719b49].map(color=>new T.MeshLambertMaterial({color,flatShading:true})),wood=new T.MeshLambertMaterial({color:0x9e7650}),water=new T.MeshPhongMaterial({color:0x40b8cf,transparent:true,opacity:.72,shininess:80}),foam=new T.MeshBasicMaterial({color:0xe5ffff,transparent:true,opacity:.6});
 const add=(g:T.BufferGeometry,m:T.Material,x:number,y:number,z:number,parent=root)=>{const mesh=new T.Mesh(g,m);mesh.position.set(x,y,z);parent.add(mesh);return mesh;};
 const flowers=[0xf3d587,0xf6eee0,0xd8a9c7].map(color=>new T.MeshLambertMaterial({color}));
 const prototypes=[forestTree(0),forestTree(1),forestTree(2)];
 const n=l.maze.grid.length,terrain=new T.PlaneGeometry(n,n,n*2,n*2);terrain.rotateX(-Math.PI/2);const pos=terrain.attributes.position,uv=terrain.attributes.uv;for(let i=0;i<pos.count;i++){const x=pos.getX(i)+n/2,z=pos.getZ(i)+n/2;pos.setXYZ(i,x,pilotGround(x,z)-.035,z);uv.setXY(i,x/3,z/3);}terrain.computeVertexNormals();add(terrain,new T.MeshLambertMaterial({color:0x87ae5c,map:groundTexture('path')}),0,0,0);
 const dynamic=new T.Group();world.add(dynamic);
 // Only boundary rocks carry collision; trees/flowers decorate the solid side of that boundary.
 for(let z=1;z<n-1;z++)for(let x=1;x<n-1;x++)if(l.maze.grid[z][x]&&[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dz])=>!l.maze.grid[z+dz]?.[x+dx])){
  if([...l.pilot!.gates,...l.pilot!.bridge,...l.pilot!.shortcut,...l.pilot!.exit].some(p=>p.x===x&&p.y===z))continue;
  const h=2.8+Math.sin((x+z)*.3)*.25;const rock=add(new T.CylinderGeometry(.74,.8,h,7),mats[(x+z)%2],x+.5,h/2,z+.5);rock.rotation.y=(x*13+z)*.17;add(new T.CylinderGeometry(.76,.77,.18,7),mats[2+(x%2)],x+.5,h+.04,z+.5);
  if((x*7+z*11)%13===0){const tree=prototypes[(x+z)%3].clone(true);tree.position.set(x+.5,h,z+.5);tree.scale.set(1.7,2,1.7);root.add(tree);}
 }
 for(let i=0;i<160;i++){const x=3+i*37%(n-6),z=3+i*29%(n-6);if(l.maze.grid[z]?.[x]!==0||pilotGround(x,z)<-.4||l.solution.some(p=>Math.hypot(p.x-x,p.y-z)<1))continue;const f=add(new T.ConeGeometry(.08,.26,4),mats[3],x,.12,z);for(let j=0;j<3;j++)add(new T.SphereGeometry(.045,5,4),flowers[i%3],x+Math.cos(j*2)*.07,.23,z+Math.sin(j*2)*.07);f.rotation.z=.2;}
 // Bridges and roots have actual matching traversable grid paths, no solution arrows.
 for(const [cx,cz,w,d]of[[31.5,32.5,3,6],[32.5,38.5,5,2],[61.5,37.5,4,2]]){for(let i=0;i<Math.ceil(d*4);i++)add(new T.BoxGeometry(w,.12,.2),wood,cx,.08,cz-d/2+i*.25);for(const side of[-1,1]){add(new T.BoxGeometry(.08,.7,d),wood,cx+side*w/2,.5,cz);}}
 // Ruins: open arches and rune posts; traversable gaps remain wider than the body.
 for(const x of[50,58])for(const z of[27,34]){add(new T.CylinderGeometry(.3,.4,2.4,7),mats[0],x,1.2,z);add(new T.BoxGeometry(.9,.3,.9),mats[1],x,2.4,z);}add(new T.BoxGeometry(8.7,.35,.8),mats[0],54,2.7,27);
 const switches=l.pilot!.switches.map((p,i)=>{const m=add(new T.CylinderGeometry(.32,.45,.7,6),new T.MeshLambertMaterial({color:0x9271b7,emissive:0x171024}),p.x+.5,.35,p.y+.5,dynamic);add(new T.OctahedronGeometry(.15),new T.MeshBasicMaterial({color:0xe8d0ff}),p.x+.5,.9,p.y+.5,dynamic);return m;});
 const gates=[l.pilot!.gates,l.pilot!.bridge,l.pilot!.shortcut,l.pilot!.exit].map((cells,i)=>{const g=new T.Group();g.name=['sigil-sanctuary-gate','cliff-bridge-gate','tree-shortcut','boss-exit-gate'][i];for(const p of cells)add(new T.BoxGeometry(.85,1.8,.85),new T.MeshLambertMaterial({color:i===0?0x8461ac:0x8b7555}),p.x+.5,.9,p.y+.5,g);dynamic.add(g);return g;});
 add(new T.BoxGeometry(3.6,.45,1),mats[0],61.5,.15,37.5);for(const side of[-1,1])add(new T.BoxGeometry(.45,2.5,1),mats[0],61.5+side*1.8,-1,37.5);
 const pool=add(new T.CircleGeometry(6.5,40),water,55.5,-.58,53.5,dynamic);pool.rotation.x=-Math.PI/2;
 const stream=add(new T.PlaneGeometry(3.5,18),water,58.5,-.58,45.5,dynamic);stream.rotation.set(-Math.PI/2,0,.35);
 const fall=add(new T.PlaneGeometry(2.8,3.4,1,12),water,63.6,1.05,37.5,dynamic);fall.rotation.y=-Math.PI/2;const streaks=Array.from({length:6},(_,i)=>{const m=add(new T.PlaneGeometry(.06,.6),foam,63.58,1,36.4+i*.4,dynamic);m.rotation.y=-Math.PI/2;return m;});
 const ripples=Array.from({length:10},(_,i)=>{const m=add(new T.TorusGeometry(.3,.025,4,20),foam.clone(),55.5,-.55,53.5,dynamic);m.rotation.x=-Math.PI/2;return m;});
 const canopy=prototypes[1].clone(true);canopy.position.set(34.5,2.6,25.5);canopy.scale.set(3,3,3);root.add(canopy);
 // Sanctuary ring is intentionally clear of decorative collision and traversal props.
 const arena=add(new T.CircleGeometry(6.7,36),new T.MeshLambertMaterial({color:0x9c91ad}),34.5,.02,9.5);arena.rotation.x=-Math.PI/2;for(let i=0;i<10;i++){const a=i*Math.PI/5;add(new T.CylinderGeometry(.24,.4,1.6,6),mats[0],34.5+Math.sin(a)*6.5,.8,9.5+Math.cos(a)*6.5);}
 batchStatic(root);
 return{update(t:number,camera:T.Camera,player?:{x:number;y:number;depth?:number}){const s=state?.();sky.position.copy(camera.position);sky.visible=camera.position.y>-.6;streaks.forEach((m,i)=>m.position.y=2.7-(t*1.7+i*.43)%3.4);gates.forEach((g,i)=>g.visible=i===0?!s?.sigilReady:i===1?!s?.pilotSwitches.includes(0):i===2?!s?.climbed.has(802):!s?.bossCleared);switches.forEach((m,i)=>(m.material as T.MeshLambertMaterial).emissive.set(s?.pilotSwitches.includes(i)?0x4aab6e:0x171024));ripples.forEach((m,i)=>{const age=(t*.6+i*.1)%1;m.scale.setScalar(.3+age*2);(m.material as T.MeshBasicMaterial).opacity=(1-age)*.55;if(s?.swimming&&player)m.position.set(player.x+Math.sin(i)*.2,-.55,player.y+Math.cos(i)*.2);});fall.scale.x=1+Math.sin(t*4)*.02;const under=camera.position.y<-.6;if(scene.fog instanceof T.Fog){scene.fog.color.set(under?0x418d99:0xc8e9ed);scene.fog.near=under?2:32;scene.fog.far=under?22:88;}},dispose(){skyTexture.dispose();sky.geometry.dispose();sky.material.dispose();scene.remove(sky);const materials=new Set<T.Material>();for(const group of[root,dynamic])group.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});materials.forEach(m=>m.dispose());world.remove(root,dynamic);}};
}
