import * as T from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import type { Character, CharacterAction, CharacterAppearance } from './character';
import {doubleJumpSomersault} from './double-jump-motion';

/** Native skinned GLB. There is no second, legacy character mesh implementation. */
const MASTER_URL='/models/binturong_master_rigged.glb';
type RigAsset = {scene: T.Group; animations: T.AnimationClip[]};
let cached: RigAsset|undefined;
let request: Promise<RigAsset>|undefined;
function master():Promise<RigAsset> {
  request ??= new GLTFLoader().loadAsync(MASTER_URL).then(g=>{
    cached={scene:g.scene,animations:g.animations};return cached;
  });
  return request;
}

const VEST:Record<string,number>={
  classic:0xf4deb9,explorer:0xf4deb9,climber:0xe0bb84,desert:0xeacda2,
  diver:0x75a8bb,raincoat:0xf3ce64,space:0xb4cddd,aurora:0x86d0b9,
};
const BOOT:Record<string,number>={
  classic:0x5b3d28, explorer:0x5b3d28, diver:0x376771,climber:0x514b45,
};

function outfitOn(scene:T.Object3D,outfit:string,fur:number,appearance?:CharacterAppearance) {
  scene.traverse(o=>{
    if (!(o instanceof T.Mesh)) return;
    // Unique skin geometry/materials per avatar: other viewports can dispose safely.
    o.geometry=o.geometry.clone();
    o.material=(o.material as T.MeshStandardMaterial).clone();
    const m=o.material as T.MeshStandardMaterial;
    const n=o.name.toLowerCase();
    const [,slot,mat] = n.split('::');
    if ((slot==='base'||slot==='tail')&&mat==='fur')m.color.setHex(fur);
    if(slot==='outfit'&&mat==='ivory')m.color.setHex(VEST[outfit]??VEST.classic);
    if(slot==='shoes'&&mat==='boot')m.color.setHex(BOOT[outfit]??BOOT.classic);
    if(slot==='headwear_hat')o.visible=appearance?.head!=='bare'&&appearance?.head!=='leaf';
    if(slot==='headwear_leaf')o.visible=appearance?.head!=='bare';
    if(slot==='eyewear')o.visible=appearance?.face!=='bare'&&appearance?.face!=='mask';
    if(slot==='backpack')o.visible=appearance?.back!=='bare';
    o.castShadow=true;o.receiveShadow=true;
  });
}

function state(speed:number,celebrate:boolean,a?:CharacterAction){
  if(a?.greet!==undefined||celebrate)return'Wave';
  if(a?.climb==='hanging'||a?.climb==='climbing')return'Climb';
  if(a?.swim)return'Swim';
  if(a?.actionKind&&(a?.actionAge??100)<.65)return'Attack';
  if((a?.jump??0)>.015)return'Jump';
  if(speed>.69)return'Run';
  if(speed>.06)return'Walk';
  return'Idle';
}

/**
 * Shared synchronous API, asynchronous skin loading. Scene starts without a temporary
 * pseudo-model; loading is handled by the existing arena/website loader. For portraits,
 * the first Home/gameplay load warms the cache and subsequent clones attach synchronously.
 */
export function createRiggedBinturong(outfit:string,fur:number,appearance?:CharacterAppearance):Character{
  const root=new T.Group();root.name='binturong';root.userData.modelVersion='rigged-binturong-glb-v1';
  root.userData.assetStatus='loading';
  let disposed=false,rig:T.Object3D|undefined,mixer:T.AnimationMixer|undefined,playing:T.AnimationAction|undefined;
  let animationPivot:T.Group|undefined,lastJumpCount=0;
  let active='',last=-1;
  const clips=new Map<string,T.AnimationAction>();
  const attach=(asset:RigAsset)=>{
    if(disposed)return;
    const model=cloneSkinned(asset.scene);
    model.name='Binturong Master Rig';model.scale.setScalar(.75);
    outfitOn(model,outfit,fur,appearance);
    // Rotate around the character's center, not the feet, for the second jump.
    animationPivot=new T.Group();animationPivot.position.y=.72;model.position.y=-.72;
    animationPivot.add(model);root.add(animationPivot);rig=model;
    mixer=new T.AnimationMixer(model);
    for(const clip of asset.animations)clips.set(clip.name,mixer.clipAction(clip));
    root.userData.assetStatus='ready';
  };
  if(cached)attach(cached);
  else master().then(attach).catch(e=>{
    if(disposed)return;
    root.userData.assetStatus='failed';
    console.error('[Maze Hunter] Missing/invalid rigged Binturong asset',e);
  });
  return{
    root,
    animate(time,speed,celebrate=false,a){
      if(!mixer)return;
      const secondJump=!!a&&a.jumpCount===2&&(a.jump??0)>.015;
      const nextName=state(speed,celebrate,a);
      if(secondJump&&lastJumpCount!==2&&active==='Jump')playing?.reset().play();
      lastJumpCount=a?.jumpCount??0;
      const next=clips.get(nextName)??clips.get('Idle');
      if(next&&nextName!==active){
        next.reset().setEffectiveWeight(1).setEffectiveTimeScale(1).play();
        if(playing)playing.crossFadeTo(next,.18,true);
        playing=next;active=nextName;
      }
      // Climbing must follow physical ledge progress; a looping generic clip
      // makes the character cycle its limbs while stationary or pulling up.
      // A hanging character holds its grasp frame, while ascent samples the
      // authored clip from bottom to top once, without altering collision.
      if(next){
        if(nextName==='Climb'){
          next.paused=true;
          next.time=(a?.climb === 'hanging' ? 0.22 : Math.max(0,Math.min(1,a?.climbProgress??0)))*next.getClip().duration;
        }else next.paused=false;
      }
      const dt=last<0?0:Math.max(0,Math.min(.05,time-last));last=time;
      mixer.update(dt);
      if(animationPivot)animationPivot.rotation.x=doubleJumpSomersault(a?.jumpCount??0,a?.jumpAge??0,a?.jump??0);
      // Manual free look is prioritized without moving the root/camera.
      if(a?.cameraLook!==undefined && speed<.04 && rig){
        const head=rig.getObjectByName('Head') as T.Bone|undefined;
        if(head)head.rotation.y+=Math.max(-.75,Math.min(.75,a.cameraLook))*.15;
      }
    },
    dispose(){
      disposed=true;
      if(mixer&&rig){mixer.stopAllAction();mixer.uncacheRoot(rig);}
      if(rig){rig.traverse(o=>{
        if(!(o instanceof T.Mesh))return;
        o.geometry.dispose();
        for(const m of(Array.isArray(o.material)?o.material:[o.material]))m.dispose();
        if(o instanceof T.SkinnedMesh)o.skeleton.dispose();
      });rig.removeFromParent();}
    }
  };
}
