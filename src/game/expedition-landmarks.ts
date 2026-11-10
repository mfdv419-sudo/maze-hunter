import type {AdventureLayout} from './adventure-layout';
/** These surfaces are shared by authoritative movement, swimming, pickups and render meshes. */
export function shipSites(l:AdventureLayout){return l.areas.filter(a=>a.zone>=1&&a.zone<=3).map(a=>a.point).map(p=>({x:p.x+.5,y:p.y+.5}));}
export function shipSurface(x:number,z:number,l:AdventureLayout):number|null{
 for(const p of shipSites(l)){const dx=Math.abs(x-p.x),dz=Math.abs(z-p.y);if(dx<=2.3&&dz<=3)return .85;if(dx<=.8&&dz>3&&dz<5)return .85-(dz-3)*1.2;}
 return null;
}
export function cascadeSites(l:AdventureLayout){return l.areas.filter(a=>a.zone===1||a.zone===3).map(a=>{const q=a.point;for(const [dx,dz]of [[0,-1],[1,0],[0,1],[-1,0]])for(let r=1;r<7;r++){const x=q.x+dx*r,z=q.y+dz*r;if(l.maze.grid[z]?.[x]===1&&l.maze.grid[z-dz]?.[x-dx]===0)return{x:x+.5-dx*.53,y:z+.5-dz*.53,dx:-dx,dz:-dz};}return{x:q.x+3.3,y:q.y+.5,dx:-1,dz:0};});}
