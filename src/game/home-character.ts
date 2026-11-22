import * as T from 'three';
import {createBinturong} from './character';
import type {Appearance} from '../services/cosmetics';

/** The real, equipped game character is rendered on Home. No illustration or duplicate avatar. */
export function mountHomeCharacter(
  host:HTMLElement,
  outfit:string,
  color:number | undefined,
  appearance:Appearance | undefined,
):()=>void {
  const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
  renderer.setClearColor(0,0);
  renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.35;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
  renderer.domElement.setAttribute('aria-hidden','true');
  host.appendChild(renderer.domElement);
  const scene=new T.Scene();
  const camera=new T.PerspectiveCamera(31,1,.1,40);
  camera.position.set(0,1.25,3.5);
  camera.lookAt(0,.75,0);
  scene.add(new T.HemisphereLight(0xf4fdff,0x648769,3.05));
  const key=new T.DirectionalLight(0xffe9bb,3.6);
  key.position.set(-3,6,5);
  scene.add(key);
  const fill=new T.DirectionalLight(0xa2faff,1.25);
  fill.position.set(3,2,-4);
  scene.add(fill);

  // One shared model/wardrobe implementation for Home, Shop and gameplay.
  const character=createBinturong(outfit,color,appearance);
  character.root.scale.setScalar(1.10);
  scene.add(character.root);
  const stone=new T.Mesh(
    new T.CylinderGeometry(.96,1.03,.14,28),
    new T.MeshStandardMaterial({color:0x93a998,roughness:.94}),
  );
  stone.position.y=-.11;
  scene.add(stone);
  const grass=new T.Mesh(
    new T.CylinderGeometry(.95,.96,.028,36),
    new T.MeshStandardMaterial({color:0xa3c976,roughness:1}),
  );
  grass.position.y=-.025;
  scene.add(grass);

  let targetYaw=-.10;
  let yaw=-.10;
  let greetStart=-100;
  let pointer:{id:number,x:number,lastX:number,y:number,moved:boolean}|undefined;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const resize=()=>{
    const width=Math.max(1,host.clientWidth),height=Math.max(1,host.clientHeight);
    renderer.setSize(width,height,false);
    camera.aspect=width/height;
    camera.fov=width<height*.7?37:31;
    const distance=width<height*.7?4.0:3.5;
    camera.position.set(0,1.25,distance);
    camera.lookAt(0,.74,0);
    camera.updateProjectionMatrix();
  };
  const observer=new ResizeObserver(resize);
  observer.observe(host);
  resize();

  const onDown=(e:PointerEvent)=>{
    host.setPointerCapture(e.pointerId);
    pointer={id:e.pointerId,x:e.clientX,lastX:e.clientX,y:e.clientY,moved:false};
  };
  const onMove=(e:PointerEvent)=>{
    if(!pointer || pointer.id!==e.pointerId)return;
    if(Math.abs(e.clientX-pointer.x)>6 || Math.abs(e.clientY-pointer.y)>6)pointer.moved=true;
    if(pointer.moved)targetYaw+=(e.clientX-pointer.lastX)*.010;
    pointer.lastX=e.clientX;
  };
  const onUp=(e:PointerEvent)=>{
    if(!pointer || pointer.id!==e.pointerId)return;
    if(!pointer.moved)greetStart=performance.now()/1000;
    pointer=undefined;
  };
  const onCancel=()=>{pointer=undefined;};
  const onKey=(e:KeyboardEvent)=>{
    if(e.key==='ArrowLeft'){targetYaw-=.27;e.preventDefault();}
    else if(e.key==='ArrowRight'){targetYaw+=.27;e.preventDefault();}
    else if(e.key===' '||e.key==='Enter'){greetStart=performance.now()/1000;e.preventDefault();}
  };
  host.addEventListener('pointerdown',onDown);
  host.addEventListener('pointermove',onMove);
  host.addEventListener('pointerup',onUp);
  host.addEventListener('pointercancel',onCancel);
  host.addEventListener('keydown',onKey);
  renderer.setAnimationLoop(ms=>{
    if(document.hidden)return;
    const t=ms/1000;
    yaw+=(targetYaw-yaw)*Math.min(1,.13);
    character.root.rotation.y=yaw;
    const age=t-greetStart;
    const reacting=age>=0 && age<1;
    character.animate(t,0,false,{
      hit:0,allowIdle:!reduced.matches,
      cameraLook:0,cameraElevation:.12,
      ...(reacting?{greet:age}:{}),
    });
    renderer.render(scene,camera);
    host.dataset.ready='true';
  });
  return ()=>{
    observer.disconnect();
    host.removeEventListener('pointerdown',onDown);
    host.removeEventListener('pointermove',onMove);
    host.removeEventListener('pointerup',onUp);
    host.removeEventListener('pointercancel',onCancel);
    host.removeEventListener('keydown',onKey);
    renderer.setAnimationLoop(null);
    character.dispose();
    stone.geometry.dispose();
    (stone.material as T.Material).dispose();
    grass.geometry.dispose();
    (grass.material as T.Material).dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
}
