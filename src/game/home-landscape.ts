import * as T from 'three';
import type {AdventureArea} from './areas';

/** Home's real 3D scenery, not a stretched 440px screenshot. Never used as
 * gameplay collision geometry. Stable geology: faceted rock with grass caps. */
export function homeLandscape(scene:T.Scene){
 const root=new T.Group();root.name='home-sculpted-landscape';scene.add(root);
 const cliffs=new T.Group();root.add(cliffs);
 const faces:number[]=[],colors:number[]=[], tint=new T.Color();
 const cliffPalette=[0x97774c,0xa98a63,0x876d50,0xbaa078,0x94765a,0xc0a27d];
 const add=(a:number[],b:number[],c:number[],hex:number)=>{
  faces.push(...a,...b,...c);tint.setHex(hex);for(let i=0;i<3;i++)colors.push(tint.r,tint.g,tint.b);
 };
 // Each cliff layer has exposed rock faces and a grassy top. Neighboring bands
 // share vertices, so the canyon reads as one geological landform.
 const n=19,front:number[][][]=[],back:number[][]=[];
 for(let i=0;i<=n;i++){
  const x=-3.35+i*.68, h=1.22+.19*Math.sin(i*.7)+.22*Math.sin(i*.31);
  const z=-6.15+.17*Math.sin(i*.83);
  front.push([[x,-.08,z+.13*Math.sin(i*.8)],
    [x,h*.31,z+.13*Math.sin(i*.8)+.09],
    [x,h*.66,z+.13*Math.sin(i*.8)-.12],
    [x,h,z+.06*Math.cos(i*.9)]]);
  back.push([x,h,z-1.2]);
 }
 for(let i=0;i<n;i++)for(let j=0;j<3;j++){
  const a=front[i][j],b=front[i+1][j],c=front[i+1][j+1],d=front[i][j+1];
  add(a,b,c,cliffPalette[(i+j)%cliffPalette.length]);add(a,c,d,cliffPalette[(i+j+1)%cliffPalette.length]);
 }
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(faces,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();
 const rock=new T.Mesh(geometry,new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide}));rock.name='solid-faceted-rock-cliff';cliffs.add(rock);
 const turf=new T.MeshLambertMaterial({color:0x75ae56,side:T.DoubleSide});
 for(let i=0;i<n;i++){
  const a=front[i][3],b=front[i+1][3],c=back[i+1],d=back[i];
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([...a,...b,...c,...a,...c,...d],3));g.computeVertexNormals();
  const mesh=new T.Mesh(g,turf);mesh.name='grass-cliff-cap';cliffs.add(mesh);
 }
 // A curving stream connects the waterfall to the foreground. Distinct banks
 // and foam edges stop it from looking like an arbitrary blue rectangular plane.
 const points=[new T.Vector3(4.3,0,-6),new T.Vector3(3.0,0,-4.8),new T.Vector3(.9,0,-3.9),new T.Vector3(-1.6,0,-2),new T.Vector3(-3.4,0,1.7)];
 const curve=new T.CatmullRomCurve3(points);const strip:number[]=[],bankLeft:number[]=[],bankRight:number[]=[];
 const segmentCount=52;
 for(let i=0;i<=segmentCount;i++){
  const t=i/segmentCount,p=curve.getPoint(t),dir=curve.getTangent(t),side=new T.Vector3(-dir.z,0,dir.x).normalize();
  const half= .60+.2*Math.sin(t*Math.PI), y=-.044;
  const l=p.clone().addScaledVector(side,half),r=p.clone().addScaledVector(side,-half);
  l.y=y;r.y=y;
  bankLeft.push(l.x,l.y+.035,l.z);bankRight.push(r.x,r.y+.035,r.z);
  if(i){const j=i*3,k=(i-1)*3,al=bankLeft.slice(k,k+3),ar=bankRight.slice(k,k+3),bl=bankLeft.slice(j,j+3),br=bankRight.slice(j,j+3);strip.push(...al,...ar,...br,...al,...br,...bl);}
 }
 const waterGeometry=new T.BufferGeometry();waterGeometry.setAttribute('position',new T.Float32BufferAttribute(strip,3));waterGeometry.computeVertexNormals();
 const water=new T.Mesh(waterGeometry,new T.MeshPhongMaterial({color:0x41bfc4,transparent:true,opacity:.88,shininess:75,side:T.DoubleSide}));water.name='winding-river';root.add(water);
 const shore=new T.MeshLambertMaterial({color:0xc6b083});
 const foamMat=new T.MeshBasicMaterial({color:0xd8faf2,transparent:true,opacity:.62,side:T.DoubleSide});
 const foams:T.Mesh[]=[];
 for(const side of [-1,1]){
  const vertices:number[]=[];
  for(let i=0;i<=segmentCount;i++){
   const t=i/segmentCount,p=curve.getPoint(t),d=curve.getTangent(t),s=new T.Vector3(-d.z,0,d.x).normalize();
   for(const offset of [0,.07]){
    const q=p.clone().addScaledVector(s,side*(.60+.2*Math.sin(t*Math.PI)+offset));q.y=-.032;vertices.push(q.x,q.y,q.z);
   }
  }
  const q:number[]=[];for(let i=0;i<segmentCount;i++){
   const a=i*6,b=(i+1)*6;q.push(...vertices.slice(a,a+3),...vertices.slice(a+3,a+6),...vertices.slice(b+3,b+6),...vertices.slice(a,a+3),...vertices.slice(b+3,b+6),...vertices.slice(b,b+3));
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(q,3));g.computeVertexNormals();const m=new T.Mesh(g,foamMat.clone());m.name='animated-river-foam';root.add(m);foams.push(m);
 }
 // Carefully placed stones mark the stream's edge (not a second invisible wall).
 const stones=new T.Group();stones.name='river-banks';root.add(stones);
 for(let i=0;i<18;i++){
  const t=(i+.5)/19,p=curve.getPoint(t),d=curve.getTangent(t),s=new T.Vector3(-d.z,0,d.x).normalize();
  p.addScaledVector(s,(i%2?1:-1)*(.9+.2*Math.sin(t*Math.PI)));p.y=.028;
  const m=new T.Mesh(new T.IcosahedronGeometry(.12+(i%3)*.042,0),shore);m.position.copy(p);m.scale.set(1.25,.58,.85);stones.add(m);
 }
 // Distant landmarks make the selected world legible, including areas without trees.
 const stages=new Map<AdventureArea,T.Group>();
 const wood=new T.MeshLambertMaterial({color:0x846040}),sandstone=new T.MeshLambertMaterial({color:0xc5a474,flatShading:true});
 const obsidian=new T.MeshLambertMaterial({color:0x4b454a,flatShading:true});
 const snowy=new T.MeshLambertMaterial({color:0xe2f3ee});
 const bubble=new T.MeshLambertMaterial({color:0x52c8d1,transparent:true,opacity:.88});
 function makeStage(area:AdventureArea,fn:(g:T.Group)=>void){const g=new T.Group();g.name=`home-landmark-${area}`;root.add(g);stages.set(area,g);fn(g);}
 const mesh=(g:T.Group,geo:T.BufferGeometry,mat:T.Material,pos:[number,number,number])=>{
  const m=new T.Mesh(geo,mat);m.position.set(...pos);g.add(m);return m;
 };
 makeStage('forest',g=>{
  // Floating rock island with grassy crown and an upper waterfall marker.
  const p=mesh(g,new T.ConeGeometry(1.6,1.8,7),new T.MeshLambertMaterial({color:0x8d785e,flatShading:true}),[-3.1,5.1,-16]);p.rotation.x=Math.PI;
  mesh(g,new T.CylinderGeometry(1.7,1.4,.25,8),turf,[-3.1,6.15,-16]);
  mesh(g,new T.PlaneGeometry(.40,3.2),bubble,[-2.6,3.58,-15.4]);
 });
 makeStage('gorge',g=>{
  // Canyon bridge and its timber posts; no phantom water rectangle.
  for(let i=0;i<6;i++)mesh(g,new T.BoxGeometry(.38,.08,.45),wood,[-2.5+i*.72,1.08,-6.6]);
  for(const side of [-1,1])for(const x of [-2.4,1.3])mesh(g,new T.CylinderGeometry(.05,.06,1.15,6),wood,[x,1.65,-6.6+side*.26]);
 });
 makeStage('mountain',g=>{
  const mountain=mesh(g,new T.ConeGeometry(3.6,6.3,6),new T.MeshLambertMaterial({color:0x839b9b,flatShading:true}),[2,2.5,-15]);mountain.rotation.y=.3;
  const top=mesh(g,new T.ConeGeometry(1.55,2.35,6),snowy,[2,5.65,-15]);top.rotation.y=.3;
 });
 makeStage('desert',g=>{
  for(const x of [-.95,.95])mesh(g,new T.CylinderGeometry(.28,.34,2.6,6),sandstone,[x,1.25,-7.9]);
  mesh(g,new T.BoxGeometry(3.0,.48,1.0),sandstone,[0,2.75,-7.9]);
  mesh(g,new T.ConeGeometry(1.5,2.2,4),sandstone,[3,1.15,-11]).rotation.y=Math.PI/4;
 });
 makeStage('coast',g=>{
  mesh(g,new T.CylinderGeometry(.35,.52,3.3,8),sandstone,[3.4,1.65,-8.7]);
  mesh(g,new T.ConeGeometry(.72,.9,7),new T.MeshLambertMaterial({color:0xa95e46}),[3.4,3.8,-8.7]);
  mesh(g,new T.CylinderGeometry(.33,.33,.3,8),snowy,[3.4,3.4,-8.7]);
 });
 makeStage('sea',g=>{
  for(let i=0;i<6;i++){
   const color=[0xf29c9d,0xe6c17e,0x6dd1c6][i%3];const coralMat=new T.MeshLambertMaterial({color});
   mesh(g,new T.CylinderGeometry(.07,.11,1.3+i%3*.28,7),coralMat,[2+i*.45,.50+i%3*.08,-7.7]);
   mesh(g,new T.IcosahedronGeometry(.32,1),coralMat,[2+i*.45,1.25+i%3*.2,-7.7]);
  }
 });
 makeStage('volcano',g=>{
  const mount=mesh(g,new T.ConeGeometry(3.9,5.9,7),obsidian,[2.6,2.8,-14]);mount.rotation.y=.4;
  const lava=new T.MeshLambertMaterial({color:0xff7e2f,emissive:0x8c1905});
  mesh(g,new T.ConeGeometry(.95,2.8,7),lava,[2.3,4.4,-11.2]);
 });
 makeStage('classic',g=>{
  for(let i=0;i<4;i++)mesh(g,new T.BoxGeometry(.45,1.0,.95),turf,[-2+i*.7,.47,-5]);
 });

 return{
  setArea(area:AdventureArea){
   const canyon=area==='forest'||area==='gorge'||area==='mountain';
   cliffs.visible=canyon;water.visible=area==='forest'||area==='gorge'||area==='coast';
   stones.visible=water.visible;foams.forEach(f=>f.visible=water.visible);
   const base=area==='gorge'?0x957f65:area==='mountain'?0x8c9fa6:0x947452;
   const mat=rock.material as T.MeshLambertMaterial;
   mat.color.setHex(base).lerp(new T.Color(0xffffff),.18);
   turf.color.setHex(area==='mountain'?0xa5bf9a:area==='gorge'?0x7faf5e:0x75ae56);
   for(const [name,stage]of stages)stage.visible=name===area;
  },
  update(t:number){foams.forEach((f,i)=>{(f.material as T.MeshBasicMaterial).opacity=.43+.16*Math.sin(t*1.4+i);});},
 };
}
