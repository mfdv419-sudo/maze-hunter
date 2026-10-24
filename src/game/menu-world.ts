import * as T from "three";
import {goldGate} from "./adventure-props";
import { createBinturong } from "./character";
import { carve, route } from "./maze";
export type MenuMode = "retro" | "modern";
export interface MenuWorld { dispose: () => void; setMode: (mode: MenuMode) => void }
/** A small, real maze diorama, built from the game's generator and route solver. */
export function menuWorld(host: HTMLElement, outfit = "classic", language: "id" | "en" = "id", initialMode: MenuMode = "modern", color?:number): MenuWorld {
  const renderer = new T.WebGLRenderer({antialias: true, powerPreference:"low-power"});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.35));
  renderer.setClearColor(0x123d48);
  renderer.outputColorSpace = T.SRGBColorSpace;
  host.append(renderer.domElement);
  const scene = new T.Scene();
  const camera = new T.OrthographicCamera(-9,9,8,-8,.1,100);
  camera.position.set(11,16,19);
  camera.lookAt(0,.2,0);
  scene.add(new T.HemisphereLight(0xe9ffe1,0x305064,2.1));
  const sun = new T.DirectionalLight(0xffdf9b,2.3);
  sun.position.set(-7,12,7);scene.add(sun);
  const geometries: T.BufferGeometry[] = [], materials: T.Material[] = [];
  function material(color:number) {
    const m = new T.MeshLambertMaterial({color,flatShading:true});materials.push(m);return m;
  }
  function geometry<G extends T.BufferGeometry>(g:G) {geometries.push(g);return g;}
  const green=material(0x68b46b), lime=material(0xabe07a), stone=material(0x31595c), earth=material(0x30535d),
    floor=material(0xbee1a0), wall=material(0x428967), wallTop=material(0x87cd78), bark=material(0x826843), gold=material(0xffcc64);
  const box=geometry(new T.BoxGeometry(1,1,1));
  function mesh(g:T.BufferGeometry,m:T.Material,x:number,y:number,z:number,sx=1,sy=1,sz=1,parent:T.Object3D=scene) {
    const a=new T.Mesh(g,m);a.position.set(x,y,z);a.scale.set(sx,sy,sz);parent.add(a);return a;
  }
  const island=new T.Group();scene.add(island);
  mesh(box,earth,0,-.95,0,10.8,1.5,9.2,island);
  mesh(box,stone,0,-.25,0,11.1,.45,9.5,island);
  mesh(box,green,0,0,0,11.2,.24,9.6,island);
  // Small faceted rocks make the maze read as a floating adventure island.
  const rock=geometry(new T.IcosahedronGeometry(1,0));
  for (const [x,z,s] of [[-4,3,1.3],[4,3,1],[-3,-3,1],[3,-3,1.2]]) mesh(rock,earth,x,-1.3,z,s,1.2,s,island);
  const grid=carve(11,9,42), start={x:1,y:7},finish={x:9,y:1};
  const solution=route(grid,start,finish);
  const cells:{x:number;y:number}[]=[],walls:{x:number;y:number}[]=[];
  for(let y=0;y<grid.length;y++)for(let x=0;x<grid[y].length;x++)(grid[y][x]?walls:cells).push({x,y});
  const matrix=new T.Matrix4(),pos=new T.Vector3(),q=new T.Quaternion();
  function instances(points:{x:number;y:number}[], m:T.Material, height:number, elevation:number, inset:number) {
    const batch=new T.InstancedMesh(box,m,points.length);
    points.forEach((p,i)=>{
      matrix.compose(new T.Vector3(p.x-5,elevation,p.y-4),q,new T.Vector3(inset,height,inset));batch.setMatrixAt(i,matrix);
    });island.add(batch);return batch;
  }
  const floors=instances(cells,floor,.08,.16,.94);
  const wallSides=instances(walls,wall,.63,.43,.96);
  const wallCaps=instances(walls,wallTop,.12,.8,.99);
  const routeMaterial=new T.MeshBasicMaterial({color:0xffd56f,transparent:true,opacity:.9});materials.push(routeMaterial);
  const dots=instances(solution,routeMaterial,.035,.225,.3);
  const gate=goldGate();gate.position.set(finish.x-5,.2,finish.y-4);island.add(gate);
  const ring=gate.getObjectByName('portal-glow')!;
  const orbMat=new T.MeshBasicMaterial({color:0xfff3b4});materials.push(orbMat);
  const traveler=mesh(geometry(new T.SphereGeometry(.12,8,6)),orbMat,0,.35,0,1,1,1,island);
  // A second hint of the world beyond; this is scenery, not unlocked player progress.
  function tree(x:number,z:number,s:number) {
    mesh(box,bark,x,.5*s,z,.14*s,1.1*s,.14*s,island);
    mesh(rock,green,x,1.12*s,z,.65*s,.83*s,.65*s,island);
    mesh(rock,lime,x-.12*s,1.6*s,z,.48*s,.6*s,.48*s,island);
  }
  tree(-5.3,-4.3,.95);tree(4.9,-4.2,1.25);tree(-5.1,3.8,.8);
  const crystals=geometry(new T.OctahedronGeometry(.22,0));
  const crystalMat=material(0x8be0d2);
  for(const [x,z] of [[-4.8,-2],[5,2.4],[4.5,4.2]])mesh(crystals,crystalMat,x,.35,z,1,1.7,1,island);
  // Background islands use shared low-poly geometry and no textures or shadow maps.
  for(const [x,z,s] of [[-9,-8,2.2],[7,-11,2.6],[10,1,1.1]]) {
    mesh(rock,earth,x,-1.5,z,s,.65*s,s);mesh(rock,green,x,-.35,z,s,.3*s,s);
  }
  const motes: T.Mesh[]=[];
  const moteGeo=geometry(new T.OctahedronGeometry(.045,0));
  for(let i=0;i<12;i++)motes.push(mesh(moteGeo,gold,-5+(i*7%11),1+(i%4)*.4,-4+(i*3%9)));
  const hero=createBinturong(outfit,color);
  const plinth=geometry(new T.CylinderGeometry(1.0,1.12,.55,8));
  mesh(plinth,stone,4.6,.48,4.5,1,1,1,island);
  mesh(geometry(new T.CylinderGeometry(1.03,1.0,.12,8)),lime,4.6,.81,4.5,1,1,1,island);
  hero.root.position.set(4.6,.88,4.5);hero.root.scale.setScalar(2.7);hero.root.rotation.y=.35;island.add(hero.root);
  const touch=document.createElement("button");touch.id="mascot-touch";touch.className="mascot-touch";
  touch.setAttribute("aria-label",language==="id"?"Sapa binturong":"Greet the binturong");host.append(touch);
  let reactionAt=-Infinity, mode=initialMode;
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  const greet=()=>{reactionAt=performance.now()/1000;touch.dataset.reactions=String(Number(touch.dataset.reactions||0)+1);};
  touch.addEventListener("click",greet);
  const bounds=new T.Box3(),projected=new T.Vector3();
  function positionTouch() {
    hero.root.updateWorldMatrix(true,true);camera.updateMatrixWorld(true);bounds.setFromObject(hero.root);
    let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
    for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]) {
      projected.set(x,y,z).project(camera);const px=(projected.x+1)*host.clientWidth/2,py=(1-projected.y)*host.clientHeight/2;
      left=Math.min(left,px);right=Math.max(right,px);top=Math.min(top,py);bottom=Math.max(bottom,py);
    }
    Object.assign(touch.style,{left:`${left}px`,top:`${top}px`,width:`${right-left}px`,height:`${bottom-top}px`});
  }
  function resize() {
    const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
    renderer.setSize(w,h);const aspect=w/h, width=aspect<1.1?16.8:18.2;
    camera.left=-width/2;camera.right=width/2;camera.top=width/aspect/2;camera.bottom=-width/aspect/2;
    camera.updateProjectionMatrix();positionTouch();
  }
  const ro=new ResizeObserver(resize);ro.observe(host);resize();
  function setMode(value:MenuMode) {
    mode=value;host.dataset.mode=mode;
    // Retro shows tracing clearly; Modern keeps the route subtle and the walls taller.
    dots.visible=mode==="retro";wallSides.scale.y=mode==="retro"?.72:1;wallCaps.position.y=mode==="retro"?-.18:0;
    // The Modern preview shows only a small lit neighborhood; unexplored tiles dim.
    const tint=new T.Color();
    for(const [batch,points] of [[floors,cells],[wallSides,walls],[wallCaps,walls]] as const) {
      points.forEach((p,i)=>{
        const near=Math.hypot(p.x-start.x,p.y-start.y)<4;
        tint.set(mode==="retro"||near?0xffffff:0x3e626d);
        batch.setColorAt(i,tint);
      });
      if(batch.instanceColor)batch.instanceColor.needsUpdate=true;
    }
  }
  setMode(initialMode);
  renderer.setAnimationLoop(ms=>{
    if(document.hidden)return;
    const t=ms/1000, age=t-reactionAt,reacting=age>=0&&age<1.25;
    touch.dataset.reacting=String(reacting);
    hero.root.rotation.y=.35+(reduced.matches?0:Math.sin(t*.5)*.12);
    hero.animate(reduced.matches?0:t,0,false,{hit:0,lookUp:true,...(reacting?{greet:age/1.25}:{})});
    const distance=(reduced.matches?0:t*.9)%(solution.length-1),i=Math.floor(distance),f=distance-i,a=solution[i],b=solution[i+1];
    pos.set(a.x+(b.x-a.x)*f-5,.35,a.y+(b.y-a.y)*f-4);traveler.position.copy(pos);
    traveler.visible=mode==="retro";ring.rotation.z=reduced.matches?0:t*.2;
    motes.forEach((m,i)=>{m.position.y=1.3+(i%4)*.4+(reduced.matches?0:Math.sin(t*.7+i)*.16);});
    renderer.render(scene,camera);
  });
  return {setMode,dispose() {
    ro.disconnect();renderer.setAnimationLoop(null);scene.traverse(o=>{if(o instanceof T.InstancedMesh)o.dispose();});touch.removeEventListener("click",greet);touch.remove();
    hero.dispose();gate.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});for(const g of geometries)g.dispose();for(const m of materials)m.dispose();renderer.dispose();renderer.domElement.remove();
  }};
}
