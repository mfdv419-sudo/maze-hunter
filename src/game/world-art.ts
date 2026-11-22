import {batchStatic} from './static-model';
import * as T from 'three';
export const WORLD_UNIT=2.2;
export function groundTexture(kind:'path'|'leaf'|'stone'='path') {
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const c=canvas.getContext('2d')!;
 c.fillStyle=kind==='path'?'#dbbe84':kind==='leaf'?'#629b47':'#a8a998';c.fillRect(0,0,128,128);
 let state=9173;const rand=()=>((state=Math.imul(state,1664525)+1013904223>>>0)/4294967296);
 for(let i=0;i<650;i++){const x=rand()*128,y=rand()*128;c.fillStyle=kind==='leaf'?(i%2?'#86b75477':'#3b753b66'):kind==='path'?(i%2?'#e4ce9b88':'#a88e5a44'):'#6c786f33';c.beginPath();c.ellipse(x,y,1+rand()*3,.4+rand()*2,rand()*3,0,Math.PI*2);c.fill();}
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;return texture;
}
export function forestTree(seed=0):T.Group {
 const g=new T.Group(),wood=new T.MeshLambertMaterial({color:0x93734a,flatShading:true}),leaf=new T.MeshLambertMaterial({color:seed%2?0x589c4d:0x76ae51,flatShading:true});
 const trunk=new T.Mesh(new T.CylinderGeometry(.065,.11,1.2,6),wood);trunk.position.y=.6;g.add(trunk);
 const geo=new T.IcosahedronGeometry(1,1);
 for(const [x,y,z,s] of [[0,1.4,0,.43],[-.23,1.2,.1,.34],[.2,1.17,-.1,.32],[.03,1.72,.02,.3]]){const m=new T.Mesh(geo,leaf);m.position.set(x,y,z);m.scale.set(s,.7*s,s);g.add(m);}
 return batchStatic(g);
}
export function riverTile(horizontalCrossing:boolean) {
 const g=new T.Group();const shape=new T.Shape();
 shape.moveTo(-.5,-.36);shape.bezierCurveTo(-.12,-.28,.18,-.43,.5,-.33);shape.lineTo(.5,.35);shape.bezierCurveTo(.15,.27,-.15,.4,-.5,.34);shape.closePath();
 const water=new T.Mesh(new T.ShapeGeometry(shape,12),new T.MeshPhongMaterial({color:0x3baec0,shininess:65,transparent:true,opacity:.9}));water.rotation.x=-Math.PI/2;water.position.y=.02;g.add(water);
 const foamMat=new T.MeshBasicMaterial({color:0xd3f7de,transparent:true,opacity:.55});
 for(let i=0;i<5;i++){const m=new T.Mesh(new T.PlaneGeometry(.08+i*.013,.014),foamMat);m.rotation.x=-Math.PI/2;m.position.set(-.36+i*.18,.035,(i%2?.17:-.14));m.name='water-ripple';g.add(m);}
 const rockMat=new T.MeshLambertMaterial({color:0x9ba490,flatShading:true});
 for(const side of [-1,1])for(let i=0;i<3;i++){const m=new T.Mesh(new T.DodecahedronGeometry(.065,0),rockMat);m.position.set(-.4+i*.4,.03,side*.39);m.scale.y=.6;g.add(m);}
 if(horizontalCrossing)g.rotation.y=Math.PI/2;return g;
}
export function icing():T.Group {
 const g=new T.Group(),geo=new T.SphereGeometry(1,7,5),mat=new T.MeshLambertMaterial({color:0xffe7db});
 for(let i=0;i<9;i++){const a=i/9*Math.PI*2,m=new T.Mesh(geo,mat);m.position.set(Math.sin(a)*.24,.53+(i%3)*.15,Math.cos(a)*.22);m.scale.set(.09+(i%2)*.025,.05+(i%3)*.025,.035);m.rotation.y=a;g.add(m);}
 g.name='cake-icing';g.visible=false;return g;
}

/** Shared 256px leaf atlas: fine foliage rather than ground noise on hedge faces. */
export function hedgeTexture(){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d')!;
 c.fillStyle='#9ba98b';c.fillRect(0,0,256,256);let seed=7817;const rand=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
 // Draw across tile boundaries to keep the repeat from making a visible border.
 for(let i=0;i<560;i++){const x=rand()*256,y=rand()*256,a=rand()*Math.PI*2,len=4+rand()*7,w=2+rand()*3,shade=rand();for(const dx of [-256,0,256])for(const dy of [-256,0,256]){c.save();c.translate(x+dx,y+dy);c.rotate(a);c.fillStyle=shade<.28?'#718268':shade<.65?'#b7c5a0':'#d4dfb8';c.beginPath();c.ellipse(0,0,len,w,0,0,Math.PI*2);c.fill();c.strokeStyle='#e1e9cf88';c.lineWidth=.7;c.beginPath();c.moveTo(-len*.7,0);c.lineTo(len*.7,0);c.stroke();c.restore();}}
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.anisotropy=4;return texture;
}
export function hedgeCrownGeometry(){
 const s=new T.Shape(),h=.505,r=.045;s.moveTo(-h+r,-h);s.lineTo(h-r,-h);s.quadraticCurveTo(h,-h,h,-h+r);s.lineTo(h,h-r);s.quadraticCurveTo(h,h,h-r,h);s.lineTo(-h+r,h);s.quadraticCurveTo(-h,h,-h,h-r);s.lineTo(-h,-h+r);s.quadraticCurveTo(-h,-h,-h+r,-h);
 const g=new T.ExtrudeGeometry(s,{depth:.13,bevelEnabled:true,bevelSize:.035,bevelThickness:.035,bevelSegments:2,steps:1,curveSegments:2});g.rotateX(-Math.PI/2);return g;
}
