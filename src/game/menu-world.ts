import type {Appearance} from '../services/cosmetics';
import * as T from 'three';
import {createBinturong} from './character';
import {forestGroveSky} from './forest-grove-art';
import {forestCascade} from './forest-waterfall-valley';
import {goldGate} from './adventure-props';
import {forestTree,groundTexture,riverTile} from './world-art';
import type {AdventureArea} from './areas';
export type MenuMode='retro'|'modern';
export interface MenuWorld {dispose:()=>void;setMode:(mode:MenuMode)=>void;setArea:(area:AdventureArea)=>void}
/** Frontal outfit showcase in a small forest world, with a real 3D character. */
export function menuWorld(host:HTMLElement,outfit='classic',language:'id'|'en'='id',initialMode:MenuMode='retro',color?:number,appearance?:Appearance):MenuWorld {
 host.dataset.appearance=JSON.stringify(appearance||{body:outfit});
 const renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.setClearColor(0x000000,0);host.append(renderer.domElement);
 const scene=new T.Scene();scene.fog=new T.Fog(0xb9e3cf,12,38);
 const sky=forestGroveSky(scene);
 const camera=new T.PerspectiveCamera(34,1,.1,150);camera.position.set(0,1.5,5.2);camera.lookAt(0,.95,0);
 scene.add(new T.HemisphereLight(0xffffff,0x7eaa77,2.65));const sun=new T.DirectionalLight(0xffe9ae,2.9);sun.position.set(-3,7,5);scene.add(sun);
 const grass=new T.MeshLambertMaterial({color:0x89c76b,map:groundTexture('leaf')}),pathMat=new T.MeshLambertMaterial({color:0xf0dbaf,map:groundTexture('path')});grass.map!.repeat.set(8,8);pathMat.map!.repeat.set(3,4);
 const ground=new T.Mesh(new T.PlaneGeometry(25,25),grass);ground.rotation.x=-Math.PI/2;ground.position.y=-.08;scene.add(ground);
 const path=new T.Mesh(new T.CircleGeometry(1.7,40),pathMat);path.rotation.x=-Math.PI/2;path.position.y=-.065;scene.add(path);
 const trees:T.Group[]=[];const cliffs:T.Mesh[]=[];const hedges:T.Mesh[]=[];
 for(const [x,z,s]of [[-2.5,-1.8,1.8],[2.6,-2.8,2],[-4,-5,2],[4,-6,2],[-1.7,-7,2.4],[6,-9,3],[-7,-10,3.2],[.8,-12,3.1]]){
  const tree=forestTree(Math.round(x*5));tree.position.set(x,-.05,z);tree.scale.setScalar(s);scene.add(tree);trees.push(tree);
 }
 const bank=new T.MeshLambertMaterial({color:0xa88766,flatShading:true});
 const cap=new T.MeshLambertMaterial({color:0x719356,flatShading:true});
 const rock=new T.IcosahedronGeometry(1,0);
 for(let i=0;i<9;i++){
  const cliff=new T.Mesh(rock,bank);
  cliff.position.set(3.2+i*.68,.5+(i%3)*.1,-7.1+Math.sin(i)*.2);cliff.scale.set(1.2,2,1.05);scene.add(cliff);cliffs.push(cliff);
  const summit=new T.Mesh(rock,cap);summit.position.copy(cliff.position).add(new T.Vector3(0,1.67,0));summit.scale.set(1.02,.38,.84);scene.add(summit);cliffs.push(summit);
 }
 const fallsTime={value:0},falls=forestCascade([[0,2.17,-.17,1.23],[0,2.08,.03,1.3],[.05,.9,.19,1.42],[.1,.04,.64,1.63]],fallsTime);
 falls.position.set(4.45,0,-6.12);scene.add(falls);
 const water=riverTile(false);water.position.set(-3,-.06,-1);water.scale.set(2.8,1,8);scene.add(water);
 const gate=goldGate();gate.position.set(2.3,0,-4.2);gate.scale.setScalar(1.6);scene.add(gate);
 const hedgeMat=new T.MeshLambertMaterial({color:0x6c9950,map:groundTexture('leaf')});
 for(const [x,z,w]of [[-1,-4.2,2.3],[4,-4.2,2],[3,-7,4]]){const h=new T.Mesh(new T.BoxGeometry(w,.8,.6),hedgeMat);h.position.set(x,.35,z);scene.add(h);hedges.push(h);}
 const hero=createBinturong(outfit,color,appearance);hero.root.scale.setScalar(.90);hero.root.position.y=.05;scene.add(hero.root);
 const pedestal=new T.Mesh(new T.CylinderGeometry(.93,1.04,.16,12),new T.MeshLambertMaterial({color:0x8aaba0,flatShading:true}));pedestal.position.y=.015;scene.add(pedestal);const rim=new T.Mesh(new T.TorusGeometry(.92,.025,4,32),new T.MeshLambertMaterial({color:0xe6ce83}));rim.rotation.x=-Math.PI/2;rim.position.y=.105;scene.add(rim);
 const butterflies:T.Mesh[]=[];for(let i=0;i<6;i++){const b=new T.Mesh(new T.PlaneGeometry(.09,.06),new T.MeshBasicMaterial({color:i%2?0xffd888:0xa7eee1,side:T.DoubleSide}));scene.add(b);butterflies.push(b);}
 const button=document.createElement('button');button.id='mascot-touch';button.className='mascot-touch';button.setAttribute('aria-label',language==='id'?'Sapa binturong':'Greet the binturong');host.append(button);
 let reaction=-Infinity,yaw=0,targetYaw=0,down:{id:number;x:number;at:number;last:number;moved:boolean}|undefined;
 const greet=()=>{reaction=performance.now()/1000;button.dataset.reactions=String(Number(button.dataset.reactions||0)+1);};
 const pointerDown=(e:PointerEvent)=>{button.setPointerCapture(e.pointerId);down={id:e.pointerId,x:e.clientX,last:e.clientX,at:performance.now(),moved:false};};
 const pointerMove=(e:PointerEvent)=>{if(!down||down.id!==e.pointerId)return;if(Math.abs(e.clientX-down.x)>7||performance.now()-down.at>250){down.moved=true;targetYaw+=(e.clientX-down.last)*.012;}down.last=e.clientX;};
 const pointerUp=(e:PointerEvent)=>{if(!down||down.id!==e.pointerId)return;if(!down.moved)greet();down=undefined;};
 button.addEventListener('pointerdown',pointerDown);button.addEventListener('pointermove',pointerMove);button.addEventListener('pointerup',pointerUp);button.addEventListener('pointercancel',()=>{down=undefined;});button.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();greet();}if(e.key==='ArrowRight')targetYaw+=.3;if(e.key==='ArrowLeft')targetYaw-=.3;});
 const bounds=new T.Box3(),v=new T.Vector3();
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.fov=w<h?37:34;camera.position.set(0,1.45,w<h?8.2:5.8);camera.lookAt(0,.90,0);camera.updateProjectionMatrix();camera.updateMatrixWorld();hero.root.updateWorldMatrix(true,true);bounds.setFromObject(hero.root);
 if(bounds.isEmpty()){button.style.display='none';return;}
 button.style.display='';
 let l=Infinity,t=Infinity,r=-Infinity,b=-Infinity;for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){v.set(x,y,z).project(camera);const px=(v.x+1)*w/2,py=(1-v.y)*h/2;l=Math.min(l,px);r=Math.max(r,px);t=Math.min(t,py);b=Math.max(b,py);}Object.assign(button.style,{left:`${l}px`,top:`${t}px`,width:`${r-l}px`,height:`${b-t}px`});}
 const ro=new ResizeObserver(resize);ro.observe(host);resize();const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let activeArea:AdventureArea=initialMode==='retro'?'classic':'forest';
 function setMode(mode:MenuMode){host.dataset.mode=mode;hedgeMat.color.set(mode==='modern'?0x709758:0x86a65d);}
 function setArea(area:AdventureArea){
  activeArea=area;host.dataset.area=area;
  const forest=['forest','classic','gorge'].includes(area);
  const river=['forest','gorge','sea','coast'].includes(area);
  trees.forEach(tree=>tree.visible=forest||area==='coast');
  cliffs.forEach(cliff=>cliff.visible=area==='forest'||area==='gorge'||area==='mountain');
  hedges.forEach(hedge=>hedge.visible=forest);
  falls.visible=area==='forest'||area==='gorge';water.visible=river;
  gate.visible=area==='forest'||area==='classic';
  const groundColors:Record<AdventureArea,number>={classic:0x84ad6e,forest:0x89c76b,desert:0xc7aa75,gorge:0x8a9d74,mountain:0xb3c2bd,coast:0xe1c992,sea:0x75b4bc,volcano:0x7c6b64};
  grass.color.setHex(groundColors[area]);
  scene.fog!.color.setHex(groundColors[area]);
 }
 setMode(initialMode);setArea(activeArea);
 renderer.setAnimationLoop(ms=>{
  if(document.hidden)return;
  if(hero.root.userData.assetStatus==='ready' && button.dataset.avatarReady!=='1'){button.dataset.avatarReady='1';resize();}
 const clock=ms/1000,age=clock-reaction,reacting=age>=0&&age<.95,t=reduced.matches?0:clock;
  const lean=reduced.matches?0:Math.sin(t*.68)*.10;
  button.dataset.reacting=String(reacting);yaw+=(targetYaw-yaw)*.15;
  hero.root.rotation.y=yaw+lean;host.dataset.yaw=String(yaw);
  hero.root.position.y=.09+(reacting&&!reduced.matches?Math.sin(age/.95*Math.PI)**2*.16:0);
  fallsTime.value=t;
  trees.forEach((tree,i)=>{tree.rotation.z=Math.sin(t*.93+i)*.035;tree.rotation.x=Math.sin(t*.62+i*1.5)*.022;});
  butterflies.forEach((b,i)=>{b.position.set(Math.sin(t*.3+i)*3.4,1+Math.sin(t*.8+i)*.5,-1.2-Math.cos(t*.3+i)*1.75);b.rotation.y=Math.sin(t*11+i)*1.1;});
  hero.animate(clock,0,false,{hit:0,lookUp:false,allowIdle:!reduced.matches,...(reacting?{greet:age/.95}:{})});
  water.children.forEach((o,i)=>{if(o.name==='water-ripple')o.position.x=Math.sin(t*.7+i)*.08+(i-2)*.15;});
  sun.intensity=2.8+Math.sin(t*.72)*.14;sky.update(camera,true);renderer.render(scene,camera);
  if(!host.classList.contains('world3d-ready'))host.classList.add('world3d-ready');
 });
 return{setMode,setArea,dispose(){ro.disconnect();renderer.setAnimationLoop(null);sky.dispose();button.remove();const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();scene.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});for(const g of geometries)g.dispose();for(const m of materials){(m as T.MeshLambertMaterial).map?.dispose();m.dispose();}renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}};
}
