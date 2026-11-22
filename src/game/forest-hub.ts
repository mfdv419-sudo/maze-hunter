/** Hand-authored Waterfall Hub, shared by the height field, renderer and collision.
 * Coordinates are in forest grid/world units. No random generation in this slice.
 */
export interface HubTerrace {name:string;x:number;z:number;w:number;d:number;top:number}
export interface HubRamp {name:string;from:[number,number];to:[number,number];start:number;end:number;width:number}
export interface HubBridge {name:string;x:number;z:number;w:number;d:number;top:number}
export const WATERFALL_HUB_TERRACES:readonly HubTerrace[]=[
 {name:'Riverside Commons',x:44.5,z:58,w:8,d:8,top:1.05},
 {name:'Moss Stair Gardens',x:47,z:51.5,w:6.5,d:6,top:2.5},
 {name:'High Canopy Lookout',x:51,z:45.5,w:8,d:6.2,top:4.45},
 {name:'Falls Overlook',x:65.5,z:46.5,w:7,d:6,top:4.25},
 {name:'Fishermans Landing',x:66,z:57.5,w:7.5,d:7,top:1.1},
 {name:'Sunlit Riverbank',x:66,z:52.5,w:6,d:4.5,top:2.1},
];
export const WATERFALL_HUB_RAMPS:readonly HubRamp[]=[
 {name:'entrance pathway',from:[41.5,60],to:[44.5,57.5],start:.25,end:1.05,width:2.6},
 {name:'moss steps',from:[44.6,56],to:[47,51.5],start:1.05,end:2.5,width:2.5},
 {name:'cliff staircase',from:[47.1,51],to:[51,45.5],start:2.5,end:4.45,width:2.25},
 {name:'east shore stair',from:[64,60],to:[66,57.5],start:.2,end:1.1,width:2.5},
 {name:'east upper stair',from:[66,56],to:[66,52.5],start:1.1,end:2.1,width:2.4},
 {name:'east lookout stair',from:[66,52],to:[65.5,46.5],start:2.1,end:4.25,width:2.4},
];
/** Three overlapping sections form a safe walkable span over water. */
export const WATERFALL_HUB_BRIDGES:readonly HubBridge[]=[
 {name:'canopy bridge west',x:55.0,z:46.5,w:6,d:1.8,top:4.38},
 {name:'canopy bridge center',x:59.5,z:46.5,w:6,d:1.8,top:4.38},
 {name:'canopy bridge east',x:63.5,z:46.5,w:5,d:1.8,top:4.38},
];
export const WATERFALL_HUB_HUTS:readonly {x:number;z:number;yaw:number}[]=[
 {x:43.2,z:58.2,yaw:.35},{x:48.8,z:53,yaw:-.3},{x:67.1,z:58,yaw:.2},
];
/** Small round boxes with a broad flat top; their cliff-like edges are intentional.
 * Only the actual top surface is walkable; ramps provide accessible connections.
 */
const smooth=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t)};
function terraceWeight(x:number,z:number,t:HubTerrace){const dx=t.w/2-Math.abs(x-t.x),dz=t.d/2-Math.abs(z-t.z);return smooth(Math.min(dx,dz)+.12);}
export function waterfallHubHeight(x:number,z:number,base:number){let height=base;
 for(const t of WATERFALL_HUB_TERRACES){const blend=terraceWeight(x,z,t);if(blend>0)height=Math.max(height,base+(t.top-base)*blend);}
 for(const r of WATERFALL_HUB_RAMPS){const ax=r.from[0],az=r.from[1],dx=r.to[0]-ax,dz=r.to[1]-az,len=dx*dx+dz*dz;
  const v=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/len)),qx=ax+dx*v,qz=az+dz*v,dist=Math.hypot(x-qx,z-qz),blend=smooth((r.width/2+.3-dist)/.55);
  if(blend>0){const y=r.start+(r.end-r.start)*v;height=Math.max(height,base+(y-base)*blend);}
 }
 return height;
}
export function onWaterfallHubBridge(x:number,z:number){return WATERFALL_HUB_BRIDGES.some(b=>Math.abs(x-b.x)<b.w/2&&Math.abs(z-b.z)<b.d/2);}

/** Prevent walking straight up the solid terrace sidewalls. Only the visibly
 * marked stair/ramp approaches permit a normal ascent; jumps/climbing remain
 * governed by the existing character movement mechanics.
 */
export function onWaterfallHubRamp(x:number,z:number){return WATERFALL_HUB_RAMPS.some(r=>{
 const dx=r.to[0]-r.from[0],dz=r.to[1]-r.from[1],len=dx*dx+dz*dz;
 const t=Math.max(0,Math.min(1,((x-r.from[0])*dx+(z-r.from[1])*dz)/len));
 return Math.hypot(x-r.from[0]-dx*t,z-r.from[1]-dz*t)<r.width*.58;
});}
export function steepHubSidewall(x:number,z:number,step:number,rise:number,jump:number){
 return x>40&&x<70&&z>40&&z<65&&rise>.13&&rise>step*1.65&&!onWaterfallHubRamp(x,z)&&jump<.08;
}
