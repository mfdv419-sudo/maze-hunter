import * as T from 'three';
/** Seamless, original ground materials inspired by the supplied soil/forest reference, not a lit material-preview sphere pasted as albedo. */
export function forestTexture(kind:'grass'|'soil'|'cliff'){
 const n=128,data=new Uint8Array(n*n*4),base=kind==='grass'?[155,186,105]:kind==='soil'?[190,158,108]:[164,140,110],tau=Math.PI*2;
 const noise=(x:number,y:number)=>{let h=Math.imul(x+17,374761393)^Math.imul(y+53,668265263);h=Math.imul(h^(h>>>13),1274126177);return (h>>>0)/4294967295;};
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const broad=Math.sin(x/n*tau*3+Math.sin(y/n*tau*2))*.045+Math.cos(y/n*tau*4)*.035,fine=(noise(x,y)-.5)*.17,cellX=Math.floor(x/8),cellY=Math.floor(y/8),px=cellX*8+noise(cellX,cellY)*6+1,py=cellY*8+noise(cellY,cellX)*6+1,d=Math.hypot(x-px,y-py),grain=d<1.1?(kind==='grass'?.02:-.17):d<1.8?.09:0,root=kind==='cliff'&&Math.abs(Math.sin(x/n*tau*7+Math.sin(y/n*tau*2)*.8))<.035?-.13:0,k=.96+broad+fine+grain+root,index=(y*n+x)*4;for(let c=0;c<3;c++)data[index+c]=Math.max(0,Math.min(255,base[c]*k));data[index+3]=255;}
 const t=new T.DataTexture(data,n,n);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t;
}
