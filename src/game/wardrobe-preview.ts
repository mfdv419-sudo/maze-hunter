/** Shop-only inspection scene. Never writes a player's appearance or wallet. */
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {createBinturong,type Character} from './character';
import {paletteColors,type Appearance,type Slot} from '../services/cosmetics';

export type ShopView = 'front'|'left'|'right'|'back'|'top'|'bottom';
export interface ShopPreview {
  show(appearance:Appearance,slot:Slot):void;
  view(side:ShopView):void;
  zoom(direction:'in'|'out'):void;
  reset():void;
  dispose():void;
}
const bound=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
const centerFor=(slot:Slot):number=>({head:1.16,face:1.04,body:.69,back:.68,tail:.53,palette:.75,hands:.63,feet:.22})[slot];
const distanceFor=(slot:Slot)=>({head:2.45,face:2.25,body:2.7,back:2.85,tail:3.0,palette:3.75,hands:2.9,feet:2.6})[slot];

/** Stable OrbitControls scene: mouse drag, one-finger drag, wheel and two-finger pinch. */
export function mountWardrobePreview(host:HTMLElement,appearance:Appearance,initialSlot:Slot):ShopPreview {
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.setClearColor(0x000000,0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.domElement.className='mh-shop-canvas';
  renderer.domElement.setAttribute('aria-label','3D character preview. Drag to rotate, scroll or pinch to zoom');
  renderer.domElement.style.touchAction='none';
  host.replaceChildren(renderer.domElement);
  const scene=new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xfff6e7,0x516d72,2.8));
  const key=new THREE.DirectionalLight(0xfff1cf,3.1);key.position.set(2.5,4.8,5);scene.add(key);
  const rim=new THREE.DirectionalLight(0x9bd9e9,1.7);rim.position.set(-3,2.3,-4);scene.add(rim);
  const camera=new THREE.PerspectiveCamera(37,1,.08,50);
  const orbit=new OrbitControls(camera,renderer.domElement);
  orbit.enableDamping=true;orbit.dampingFactor=.11;orbit.enablePan=false;
  orbit.minDistance=1.2;orbit.maxDistance=7.5;
  orbit.minPolarAngle=.08;orbit.maxPolarAngle=Math.PI-.18;
  orbit.rotateSpeed=.8;orbit.zoomSpeed=.9;
  orbit.target.set(0,.7,0);
  let hero:Character|undefined,slot=initialSlot;
  let viewSide:ShopView=slot==='back'||slot==='tail'?'back':'front';
  let isDisposed=false;

  function setCamera(side:ShopView,changeZoom=false) {
    const radius=changeZoom?distanceFor(slot):bound(camera.position.distanceTo(orbit.target),orbit.minDistance,orbit.maxDistance);
    const yaw=side==='back'?Math.PI:side==='left'?-Math.PI/2:side==='right'?Math.PI/2:0;
    const elevation=side==='top'?1.36:side==='bottom'?-1.06:.10;
    const horizontal=radius*Math.cos(elevation);
    camera.position.set(Math.sin(yaw)*horizontal,orbit.target.y+Math.sin(elevation)*radius,Math.cos(yaw)*horizontal);
    camera.lookAt(orbit.target);orbit.update();viewSide=side;
  }
  function resize(){
    if(isDisposed)return;
    const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
    renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  }
  function show(next:Appearance,nextSlot:Slot){
    if(isDisposed)return;
    if(hero){scene.remove(hero.root);hero.dispose();}
    hero=createBinturong(next.body,paletteColors[next.palette],{...next});
    scene.add(hero.root);
    const oldSlot=slot;slot=nextSlot;
    if(oldSlot!==slot){orbit.target.set(0,centerFor(slot),0);setCamera(slot==='back'||slot==='tail'?'back':'front',true);}
  }
  const observer=new ResizeObserver(resize);observer.observe(host);
  orbit.target.set(0,centerFor(slot),0);
  camera.position.set(0,.7,distanceFor(slot));
  setCamera(viewSide,true);resize();show(appearance,slot);
  renderer.setAnimationLoop((t)=>{
    if(isDisposed)return;
    orbit.update();hero?.animate(t/1000,0,false,{hit:0,showBack:slot==='back'});
    renderer.render(scene,camera);
  });
  return {
    show,
    view(side){setCamera(side);},
    zoom(direction){const offset=camera.position.clone().sub(orbit.target);const length=offset.length();offset.setLength(bound(length*(direction==='in'?.8:1.25),orbit.minDistance,orbit.maxDistance));camera.position.copy(orbit.target).add(offset);orbit.update();},
    reset(){orbit.target.set(0,centerFor(slot),0);setCamera(slot==='back'||slot==='tail'?'back':'front',true);},
    dispose(){
      if(isDisposed)return;isDisposed=true;renderer.setAnimationLoop(null);observer.disconnect();orbit.dispose();
      if(hero){scene.remove(hero.root);hero.dispose();hero=undefined;}
      renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
    },
  };
}
