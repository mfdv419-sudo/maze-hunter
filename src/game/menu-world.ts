import * as T from 'three';
import {createBinturong} from './character';
import {goldGate} from './adventure-props';
import {forestTree,groundTexture,riverTile} from './world-art';
export type MenuMode='retro'|'modern';
export interface MenuWorld {dispose:()=>void;setMode:(mode:MenuMode)=>void}
/** Frontal outfit showcase in a small forest world, with a real 3D character. */
export function menuWorld(host:HTMLElement,outfit='classic',language:'id'|'en'='id',initialMode:MenuMode='retro',color?:number):MenuWorld {
 const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.4));renderer.setClearColor(0xb8d8c1);host.append(renderer.domElement);
 const scene=new T.Scene();scene.fog=new T.Fog(0xb8d8c1,8,20);
 const camera=new T.PerspectiveCamera(34,1,.1,50);camera.position.set(0,1.5,5.2);camera.lookAt(0,.95,0);
 scene.add(new T.HemisphereLight(0xfff3d9,0x6e9975,2.1));const sun=new T.DirectionalLight(0xffe3ae,2.2);sun.position.set(-3,7,5);scene.add(sun);
 const grass=new T.MeshLambertMaterial({color:0x87aa66,map:groundTexture('leaf')}),pathMat=new T.MeshLambertMaterial({color:0xf0dbaf,map:groundTexture('path')});grass.map!.repeat.set(8,8);pathMat.map!.repeat.set(3,4);
 const ground=new T.Mesh(new T.PlaneGeometry(25,25),grass);ground.rotation.x=-Math.PI/2;ground.position.y=-.08;scene.add(ground);
 const path=new T.Mesh(new T.CircleGeometry(1.7,40),pathMat);path.rotation.x=-Math.PI/2;path.position.y=-.065;scene.add(path);
 for(const [x,z,s]of [[-2.5,-1.8,1.8],[2.6,-2.8,2],[-4,-5,2],[4,-6,2],[-1.7,-7,2.4]]){const tree=forestTree(Math.round(x*5));tree.position.set(x,-.05,z);tree.scale.setScalar(s);scene.add(tree);}
 const water=riverTile(false);water.position.set(-3,-.06,-1);water.scale.set(2.8,1,8);scene.add(water);
 const gate=goldGate();gate.position.set(2.3,0,-4.2);gate.scale.setScalar(1.6);scene.add(gate);
 const hedgeMat=new T.MeshLambertMaterial({color:0x6c9950,map:groundTexture('leaf')});
 for(const [x,z,w]of [[-1,-4.2,2.3],[4,-4.2,2],[3,-7,4]]){const h=new T.Mesh(new T.BoxGeometry(w,.8,.6),hedgeMat);h.position.set(x,.35,z);scene.add(h);}
 const hero=createBinturong(outfit,color);hero.root.scale.setScalar(1.5);hero.root.position.y=.02;scene.add(hero.root);
 const button=document.createElement('button');button.id='mascot-touch';button.className='mascot-touch';button.setAttribute('aria-label',language==='id'?'Sapa binturong':'Greet the binturong');host.append(button);
 let reaction=-Infinity;const greet=()=>{reaction=performance.now()/1000;button.dataset.reactions=String(Number(button.dataset.reactions||0)+1);};button.addEventListener('click',greet);
 const bounds=new T.Box3(),v=new T.Vector3();
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.fov=w<h?37:34;camera.position.set(w<h?0:-.95,1.5,w<h?8:5.2);camera.lookAt(w<h?0:-.95,.95,0);camera.updateProjectionMatrix();camera.updateMatrixWorld();hero.root.updateWorldMatrix(true,true);bounds.setFromObject(hero.root);
 let l=Infinity,t=Infinity,r=-Infinity,b=-Infinity;for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){v.set(x,y,z).project(camera);const px=(v.x+1)*w/2,py=(1-v.y)*h/2;l=Math.min(l,px);r=Math.max(r,px);t=Math.min(t,py);b=Math.max(b,py);}Object.assign(button.style,{left:`${l}px`,top:`${t}px`,width:`${r-l}px`,height:`${b-t}px`});}
 const ro=new ResizeObserver(resize);ro.observe(host);resize();const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function setMode(mode:MenuMode){host.dataset.mode=mode;hedgeMat.color.set(mode==='modern'?0x709758:0x86a65d);}
 setMode(initialMode);
 renderer.setAnimationLoop(ms=>{if(document.hidden)return;const t=ms/1000,age=t-reaction,reacting=age>=0&&age<1.25;button.dataset.reacting=String(reacting);hero.root.rotation.y=reduced.matches?0:Math.sin(t*.45)*.055;hero.animate(reduced.matches?0:t,0,false,reacting?{hit:0,greet:age/1.25}:undefined);water.children.forEach((o,i)=>{if(o.name==='water-ripple')o.position.x=Math.sin(t*.7+i)*.08+(i-2)*.15;});renderer.render(scene,camera);});
 return{setMode,dispose(){ro.disconnect();renderer.setAnimationLoop(null);button.removeEventListener('click',greet);button.remove();const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();scene.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});for(const g of geometries)g.dispose();for(const m of materials){(m as T.MeshLambertMaterial).map?.dispose();m.dispose();}renderer.dispose();renderer.domElement.remove();}};
}
