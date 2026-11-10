import * as T from 'three';
/** Deterministic weathered rock; all vertices remain inside its gameplay radius. */
export function rockGeometry(seed=0,radius=.4){const g=new T.IcosahedronGeometry(radius,1),p=g.attributes.position,c:number[]=[];for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),noise=Math.sin(x*31+y*17+z*23+seed*1.7),scale=.83+.17*(noise*.5+.5);p.setXYZ(i,x*scale,y*scale,z*scale);const shade=.58+.22*(y/radius*.5+.5)+noise*.035;c.push(shade*.94,shade,shade*.91);}g.setAttribute('color',new T.Float32BufferAttribute(c,3));g.computeVertexNormals();return g;}
