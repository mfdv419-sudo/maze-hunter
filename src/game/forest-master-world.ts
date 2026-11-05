import * as T from 'three';
import type {AdventureLayout} from './adventure-layout';
import type {AdventureState} from './adventure-state';
import {pilotGround,PILOT_WATER_LEVEL as WATER} from './forest-pilot';
import {FOREST_ARENAS,FOREST_LAYERS} from './forest-world-design';
import {biomeSky} from './biome-scenery';

const mat=(c:number)=>new T.MeshLambertMaterial({color:c,flatShading:true});
const add=(parent:T.Object3D,g:T.BufferGeometry,m:T.Material,x:number,y:number,z:number)=>{const q=new T.Mesh(g,m);q.position.set(x,y,z);parent.add(q);return q;};
export function forestMasterWorld(scene:T.Scene,world:T.Group,l:AdventureLayout,state?:()=>AdventureState|undefined){
 const root=new T.Group(),dynamic=new T.Group();root.name='forest-grove-extreme-master';root.userData.cameraOccluder=true;world.add(root,dynamic);
 const skyTex=biomeSky('forest'),sky=new T.Mesh(new T.SphereGeometry(440,24,12),new T.MeshBasicMaterial({map:skyTex,side:T.BackSide,depthWrite:false,fog:false}));scene.add(sky);scene.background=new T.Color(0xc8e9ed);scene.fog=new T.Fog(0xc8e9ed,28,92);
 const grid=l.maze.grid,n=grid.length,grass=mat(0x78b956),rock=mat(0x9c8a70),wood=mat(0x8a6042),ruin=mat(0xb7ad92),purple=mat(0x8b69c9),gold=mat(0xe7c469),waterMat=new T.MeshPhongMaterial({color:0x3db6cf,transparent:true,opacity:.58,depthWrite:false,shininess:90,side:T.DoubleSide});
 // Walkable tiles and boundary walls come from the authoritative navigation grid.
 const floorGeo=new T.BoxGeometry(.96,.08,.96),wallGeo=new T.BoxGeometry(1,3,1);const floors:T.Matrix4[]=[],walls:T.Matrix4[]=[],dummy=new T.Object3D();
 for(let y=1;y<n-1;y++)for(let x=1;x<n-1;x++){if(grid[y][x]===0){dummy.position.set(x+.5,pilotGround(x+.5,y+.5)-.04,y+.5);dummy.scale.set(1,1,1);dummy.updateMatrix();floors.push(dummy.matrix.clone());}else if(grid[y-1]?.[x]===0||grid[y+1]?.[x]===0||grid[y]?.[x-1]===0||grid[y]?.[x+1]===0){dummy.position.set(x+.5,pilotGround(x+.5,y+.5)+1.45,y+.5);dummy.updateMatrix();walls.push(dummy.matrix.clone());}}
 const fm=new T.InstancedMesh(floorGeo,new T.MeshLambertMaterial({color:0x92bf66}),floors.length);floors.forEach((m,i)=>fm.setMatrixAt(i,m));fm.name='authoritative-walkable-floor';root.add(fm);
 const wm=new T.InstancedMesh(wallGeo,rock,walls.length);walls.forEach((m,i)=>wm.setMatrixAt(i,m));wm.name='authoritative-boundary-walls';root.add(wm);
 const ring=l.ring!;
 // Waterfall Valley basin and two-stage waterfall.
 const wf=ring.zones.find(z=>z.id==='waterfall')!.point;const basin=add(root,new T.CircleGeometry(16,40),waterMat,wf.x+.5,WATER,wf.y+.5);basin.rotation.x=-Math.PI/2;
 for(const [dx,dz,w,h]of [[-10,-8,4,4],[8,-10,3.5,6]] as const){const fall=add(root,new T.BoxGeometry(w,h,.18),waterMat,wf.x+dx,WATER+h/2,wf.y+dz);fall.name='waterfall-volume';}
 // Green Cliffs: visible stepped climb and lookout decks.
 const green=ring.zones.find(z=>z.id==='green')!.point;for(let i=0;i<8;i++){const x=green.x-7+i*2,z=green.y+7-i,top=pilotGround(x,z)+i*.38;add(root,new T.BoxGeometry(2.1,.3,2),rock,x,top,z).name='green-cliff-step';}add(root,new T.BoxGeometry(8,.28,5),grass,green.x+7,pilotGround(green.x+7,green.y-5)+3.1,green.y-5).name='green-lookout';
 // Ancient Ruins: courtyard, columns and a real open gateway.
 const ruins=ring.zones.find(z=>z.id==='ruins')!.point;for(const sx of[-1,1])for(const sz of[-1,1])add(root,new T.CylinderGeometry(.45,.55,3.4,8),ruin,ruins.x+sx*6,pilotGround(ruins.x,ruins.y)+1.7,ruins.y+sz*5);add(root,new T.BoxGeometry(14,.35,10),ruin,ruins.x,pilotGround(ruins.x,ruins.y)+.15,ruins.y).name='ruins-courtyard';
 // Chasm: deep visual void plus two traversable bridges.
 const chasm=ring.zones.find(z=>z.id==='chasm')?.point;if(chasm){for(const z of[chasm.y-5,chasm.y+5]){const b=add(root,new T.BoxGeometry(11,.25,1.8),wood,chasm.x,pilotGround(chasm.x,z)+.55,z);b.name='solid-chasm-bridge';}}
 // Giant Tree: one real landmark with playable platforms.
 const giant=ring.zones.find(z=>z.id==='giant')?.point;if(giant){add(root,new T.CylinderGeometry(2.6,3.8,13,12),wood,giant.x,pilotGround(giant.x,giant.y)+6.5,giant.y);for(let i=0;i<3;i++){const a=i*2.094;add(root,new T.CylinderGeometry(4.8,4.8,.35,16),grass,giant.x+Math.sin(a)*4.5,pilotGround(giant.x,giant.y)+4+i*2.7,giant.y+Math.cos(a)*4.5).name='giant-tree-playable-platform';}}
 // Underground chambers and Floating Land receive distinct silhouettes on their own coordinate layers.
 for(const zone of ring.zones.filter(z=>z.layer==='underground')){const y=pilotGround(zone.point.x,zone.point.y);for(let i=0;i<7;i++){const a=i*Math.PI*2/7;add(root,new T.OctahedronGeometry(.45,0),purple,zone.point.x+Math.sin(a)*8,y+.7,zone.point.y+Math.cos(a)*8);}}
 for(const zone of ring.zones.filter(z=>z.layer==='floating')){const y=pilotGround(zone.point.x,zone.point.y);const island=add(root,new T.CylinderGeometry(zone.radius*.7,zone.radius*.45,1.4,12),rock,zone.point.x,y-.7,zone.point.y);island.name='floating-island-solid-base';add(root,new T.CylinderGeometry(zone.radius*.68,zone.radius*.68,.24,12),grass,zone.point.x,y-.08,zone.point.y);}
 // Two gates + return gate per arena, exactly matching portal collision points.
 for(const p of ring.portals){const y=pilotGround(p.point.x+.5,p.point.y+.5),g=new T.Group();g.position.set(p.point.x+.5,y,p.point.y+.5);g.name='portal-'+p.id;root.add(g);const c=p.kind==='hidden'?0x58a96f:p.kind==='mystic'?0xa96cff:0xe4c26e,m=mat(c);const arch=add(g,new T.TorusGeometry(.85,.14,8,28,Math.PI),m,0,.9,0);arch.rotation.z=Math.PI;for(const side of[-1,1])add(g,new T.CylinderGeometry(.12,.16,1.6,7),wood,side*.85,.75,0);const core=add(g,new T.CircleGeometry(.68,20),new T.MeshBasicMaterial({color:c,transparent:true,opacity:p.kind==='hidden'?.18:.5,side:T.DoubleSide,depthWrite:false}),0,.85,.02);core.rotation.y=Math.PI/2;}
 for(const piece of ring.rewardPieces){const y=pilotGround(piece.point.x+.5,piece.point.y+.5);const q=add(root,new T.OctahedronGeometry(.36,0),purple,piece.point.x+.5,y+.7,piece.point.y+.5);q.name='relic-piece-'+piece.id;}
 // Boss core visual: menacing silhouette and eyes, no forced mouth gimmick.
 const boss=ring.center,altar=add(root,new T.CylinderGeometry(7,7,.45,24),mat(0x51415f),boss.x+.5,pilotGround(boss.x,boss.y)+.2,boss.y+.5);altar.name='boss-core-platform';for(const side of[-1,1]){const eye=add(root,new T.SphereGeometry(.22,10,6),new T.MeshBasicMaterial({color:0xff5c5c}),boss.x+.5+side*.55,pilotGround(boss.x,boss.y)+3.1,boss.y+.8);eye.name='boss-core-eye';}
 return{update(_t:number,camera:T.Camera,player?:{x:number;y:number;depth?:number}){sky.position.copy(camera.position);const under=!!player&&pilotGround(player.x,player.y)<WATER-1&&camera.position.y<WATER;if(scene.fog instanceof T.Fog){scene.fog.color.set(under?0x347b8a:0xc8e9ed);scene.fog.near=under?2:28;scene.fog.far=under?22:92;}sky.visible=!under;const s=state?.();for(const o of root.children)if(o.name.startsWith('relic-piece-'))o.visible=!s?.relics.has(o.name.slice(12));},dispose(){skyTex.dispose();scene.remove(sky);const gs=new Set<T.BufferGeometry>(),ms=new Set<T.Material>();root.traverse(o=>{if(o instanceof T.Mesh){gs.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])ms.add(m);}});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());world.remove(root,dynamic);}};
}
