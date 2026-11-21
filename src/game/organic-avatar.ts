import * as T from 'three';
import {addMesh} from './model-parts';

/** Shared organic surface helpers: curves and lofts rather than cuboid avatar parts. */
export function plushMaterial(color:number){
 return new T.MeshStandardMaterial({color,roughness:.89,metalness:0});
}
export function detailMaterial(color:number,metalness=.14){
 return new T.MeshStandardMaterial({color,roughness:metalness>.3?.38:.69,metalness});
}
export function organicOrb(parent:T.Object3D, material:T.Material, name:string,
 x:number,y:number,z:number,sx:number,sy:number,sz:number,
 kind:'plain'|'head'|'torso'|'paw'='plain'){
 const major=Math.max(sx,sy,sz);
 const g=new T.SphereGeometry(1,major>.24?28:major>.12?22:16,major>.24?20:major>.12?16:12);
 const p=g.getAttribute('position') as T.BufferAttribute;
 for(let i=0;i<p.count;i++){
  const x0=p.getX(i),y0=p.getY(i),z0=p.getZ(i);
  let ax=1,az=1,yn=y0;
  if(kind==='head'){
   // Fuller cheeks/jaw; slightly tapered cranium and a soft, not rectangular, silhouette.
   ax=1+.12*Math.max(0,-y0)-.045*Math.max(0,y0);
   az=1+.10*Math.max(0,-y0);
   yn=y0-.045*Math.max(0,-y0);
  }else if(kind==='torso'){
   ax=1+.10*Math.max(0,-y0)-.12*Math.max(0,y0);
   az=1+.07*Math.max(0,-y0)+.06*Math.max(0,z0);
  }else if(kind==='paw'){
   ax=1+.10*Math.max(0,-y0);
   az=1+.18*Math.max(0,z0);
  }
  p.setXYZ(i,x0*sx*ax,yn*sy,z0*sz*az);
 }
 g.computeVertexNormals();
 const mesh=addMesh(parent,g,material,x,y,z);mesh.name=name;
 mesh.castShadow=true;mesh.receiveShadow=true;
 return mesh;
}

/** Smooth closed elliptic loft. Heights/radii describe the actual silhouette, not stacked boxes. */
export function loftBody(parent:T.Object3D,material:T.Material,name:string,
 rings:ReadonlyArray<{y:number;rx:number;rz:number;z?:number}>,segments=32){
 const pts:number[]=[],faces:number[]=[];
 rings.forEach((r,i)=>{
  for(let j=0;j<=segments;j++){
   const a=j/segments*Math.PI*2;
   pts.push(Math.cos(a)*r.rx,r.y,Math.sin(a)*r.rz+(r.z||0));
   if(i>0&&j<segments){const k=i*(segments+1)+j,b=k-(segments+1);
    faces.push(b,k,b+1,b+1,k,k+1);}
  }
 });
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pts,3));g.setIndex(faces);
 g.computeVertexNormals();
 const mesh=addMesh(parent,g,material);mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;
 return mesh;
}
export function sculptedLimb(parent:T.Object3D,material:T.Material,name:string,
 height:number,topRadius:number,bottomRadius:number,depthRatio=1){
 const rings: {y:number;rx:number;rz:number}[]=[];
 // Rounded caps and a gentle muscular taper for elbows, thighs, and calves.
 for(let i=0;i<=14;i++){
  const t=i/14, y=-height*t;
  const caps=Math.pow(Math.min(1,(t+.025)*12,(1.025-t)*12),.35);
  const radius=(topRadius+(bottomRadius-topRadius)*t)*caps;
  rings.push({y,rx:Math.max(.001,radius),rz:Math.max(.001,radius*depthRatio)});
 }
 return loftBody(parent,material,name,rings,20);
}
export function curvedBand(parent:T.Object3D,material:T.Material,name:string,
 points:ReadonlyArray<[number,number,number]>,r=.018){
 const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
 const mesh=addMesh(parent,new T.TubeGeometry(curve,Math.max(12,points.length*5),r,7,false),material);
 mesh.name=name;mesh.castShadow=true;return mesh;
}
export function ovalRing(parent:T.Object3D,material:T.Material,name:string,
 x:number,y:number,z:number,rx:number,ry:number,thickness=.014){
 const v=Math.min(rx,ry);
 const mesh=addMesh(parent,new T.TorusGeometry(1,thickness/v,9,40),material,x,y,z);
 mesh.scale.set(rx,ry,v);mesh.name=name;mesh.castShadow=true;return mesh;
}
