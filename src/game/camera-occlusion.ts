import * as T from 'three';
/** Capsule mask is limited to the camera-to-hero segment, never beyond the hero. */
export function occlusionMask(point:T.Vector3,camera:T.Vector3,target:T.Vector3,radius=1){const axis=target.clone().sub(camera),len=axis.lengthSq(),t=point.clone().sub(camera).dot(axis)/Math.max(.0001,len);if(t<0||t>1)return 0;const distance=point.distanceTo(camera.clone().addScaledVector(axis,t));return 1-T.MathUtils.smoothstep(distance,radius*.65,radius);}
export class CameraOcclusion {
 private ray=new T.Raycaster();private instanceVersions=new WeakMap<T.InstancedMesh,number>();private meshes:T.Mesh[]=[];
 private cameraUniform={value:new T.Vector3()};private targetUniform={value:new T.Vector3()};
 private faded=new Map<T.Mesh,{original:T.Material[];amount:{value:number}}>();
 register(root:T.Object3D){root.traverse(o=>{if(o instanceof T.Mesh&&!this.meshes.includes(o))this.meshes.push(o);});}
 update(camera:T.Camera,target:T.Vector3,dt:number){
  camera.updateMatrixWorld();this.cameraUniform.value.copy(camera.position);this.targetUniform.value.copy(target);const dir=target.clone().sub(camera.position),distance=dir.length(),hits=new Set<T.Mesh>();this.ray.set(camera.position,dir.normalize());this.ray.near=0;this.ray.far=Math.max(0,distance-.22);
  for(const mesh of this.meshes)if(mesh instanceof T.InstancedMesh&&this.instanceVersions.get(mesh)!==mesh.instanceMatrix.version){mesh.boundingSphere=null;this.instanceVersions.set(mesh,mesh.instanceMatrix.version);}
  for(const hit of this.ray.intersectObjects(this.meshes,false))if(hit.object instanceof T.Mesh)hits.add(hit.object);
  for(const mesh of hits)if(!this.faded.has(mesh)){
   const original=Array.isArray(mesh.material)?mesh.material:[mesh.material],amount={value:0};
   const clones=original.map(m=>{const c=m.clone(),previous=c.onBeforeCompile,key=c.customProgramCacheKey();c.alphaHash=true;
    c.onBeforeCompile=(shader,renderer)=>{previous.call(c,shader,renderer);Object.assign(shader.uniforms,{mhCamera:this.cameraUniform,mhTarget:this.targetUniform,mhFade:amount});shader.vertexShader='varying vec3 mhWorldPosition;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
vec4 mhLocal=vec4(transformed,1.0);
#ifdef USE_INSTANCING
mhLocal=instanceMatrix*mhLocal;
#endif
mhWorldPosition=(modelMatrix*mhLocal).xyz;`);
     shader.fragmentShader='varying vec3 mhWorldPosition; uniform vec3 mhCamera; uniform vec3 mhTarget; uniform float mhFade;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <alphahash_fragment>',`vec3 mhAxis=mhTarget-mhCamera;
float mhT=dot(mhWorldPosition-mhCamera,mhAxis)/max(dot(mhAxis,mhAxis),0.0001);
float mhDistance=length(mhWorldPosition-(mhCamera+mhAxis*clamp(mhT,0.0,1.0)));
float mhMask=step(0.0,mhT)*step(mhT,1.0)*(1.0-smoothstep(0.28,0.42,mhDistance));
diffuseColor.a*=1.0-mhMask*mhFade;
#include <alphahash_fragment>`);};c.customProgramCacheKey=()=>key+'|camera-segment-mask-v2';return c;});
   mesh.material=Array.isArray(mesh.material)?clones:clones[0];this.faded.set(mesh,{original,amount});
  }
  for(const[mesh,data]of this.faded){data.amount.value+=((hits.has(mesh)?.35:0)-data.amount.value)*(1-Math.exp(-dt*18));if(!hits.has(mesh)&&data.amount.value<.005){(Array.isArray(mesh.material)?mesh.material:[mesh.material]).forEach(m=>m.dispose());mesh.material=data.original.length===1?data.original[0]:data.original;this.faded.delete(mesh);}}
 }
 dispose(){for(const[mesh,{original}]of this.faded){(Array.isArray(mesh.material)?mesh.material:[mesh.material]).forEach(m=>m.dispose());mesh.material=original.length===1?original[0]:original;}this.faded.clear();this.meshes=[];}
}
