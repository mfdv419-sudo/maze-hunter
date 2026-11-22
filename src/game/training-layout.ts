import type {AdventureLayout} from './adventure-layout';
import {route} from './maze';
/** Isolated practice garden: no account rewards, combat, timer pressure or network room. */
export function trainingLayout():AdventureLayout{
 const n=35,grid=Array.from({length:n},(_,y)=>Array.from({length:n},(_,x)=>x<2||y<2||x>n-3||y>n-3?1:0)),start={x:9,y:24},finish={x:26,y:9},fortress={x:27,y:27};
 const areas=[start,{x:8,y:10},{x:27,y:17},{x:24,y:9},{x:18,y:17},fortress,finish].map((point,zone)=>({point,zone}));
 const ledges:AdventureLayout['ledges']=[{id:0,point:{x:8,y:15},height:2.8,kind:'tree'},{id:1,point:{x:19,y:17},height:2.35,width:1.5,depth:1.5,kind:'rock'},...[.7,1,1.35].map((height,i)=>({id:i+2,point:{x:24,y:23-i*2},height,width:1,depth:1,kind:'rock' as const}))];
 return{training:true,maze:{grid,start,finish,entrances:[start],seed:701126},forest:{trunks:[],pillars:[],boulders:[],arenaRadius:6,cave:areas[1].point,cabin:areas[2].point,highland:areas[3].point},index:0,ledges,areas,zoneCells:grid.map(row=>row.map(()=>0)),vegetation:[],starts:[start],fortress,escapeRoutes:[],escapeConnector:[],fastRiver:finish,seals:[],stars:[],chests:[],rivers:[],grass:[],patrols:[],bosses:[],solution:route(grid,start,finish)};
}
