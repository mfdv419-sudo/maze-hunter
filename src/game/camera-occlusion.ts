import * as T from 'three';
/** Fade foreground scenery; the camera arm and player-selected pitch remain untouched. */
export class CameraOcclusion {
 private ray=new T.Raycaster();private instanceVersions=new WeakMap<T.InstancedMesh,number>();private faded=new Map<T.Mesh,T.Material[]>();private meshes:T.Mesh[]=[];
 register(root:T.Object3D){root.traverse(o=>{if(o instanceof T.Mesh&&!this.meshes.includes(o))this.meshes.push(o);});}
 update(camera:T.Camera,target:T.Vector3,dt:number){
  camera.updateMatrixWorld();const origin=camera.position,dir=target.clone().sub(origin),distance=dir.length(),hits=new Set<T.Mesh>();
  this.ray.set(origin,dir.normalize());this.ray.near=0;this.ray.far=Math.max(0,distance-.22);
  for(const mesh of this.meshes)if(mesh instanceof T.InstancedMesh&&this.instanceVersions.get(mesh)!==mesh.instanceMatrix.version){mesh.boundingSphere=null;this.instanceVersions.set(mesh,mesh.instanceMatrix.version);}
  for(const hit of this.ray.intersectObjects(this.meshes,false))if(hit.object instanceof T.Mesh)hits.add(hit.object);
  for(const mesh of hits)if(!this.faded.has(mesh)){const original=Array.isArray(mesh.material)?mesh.material:[mesh.material];const clones=original.map(m=>{const c=m.clone();c.transparent=true;c.depthWrite=false;return c;});mesh.material=Array.isArray(mesh.material)?clones:clones[0];this.faded.set(mesh,original);}
  for(const[mesh,original]of this.faded){const mats=Array.isArray(mesh.material)?mesh.material:[mesh.material];let restored=true;mats.forEach((m,i)=>{const goal=hits.has(mesh)?.08:original[i].opacity;m.opacity+=(goal-m.opacity)*(1-Math.exp(-dt*18));if(Math.abs(m.opacity-original[i].opacity)>.005)restored=false;});if(!hits.has(mesh)&&restored){mats.forEach(m=>m.dispose());mesh.material=original.length===1?original[0]:original;this.faded.delete(mesh);}}
 }
 dispose(){for(const[mesh,original]of this.faded){(Array.isArray(mesh.material)?mesh.material:[mesh.material]).forEach(m=>m.dispose());mesh.material=original.length===1?original[0]:original;}this.faded.clear();this.meshes=[];}
}
