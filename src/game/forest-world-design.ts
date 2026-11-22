import type {Difficulty,Point} from './maze';
export type ForestLayerId='surface'|'underground'|'floating';
export type ForestArenaId='entrance'|'waterfall'|'green'|'ruins'|'chasm'|'giant'|'inner'|'boss'|'ug-flooded'|'ug-relic'|'ug-xp'|'ug-cross'|'sky-1'|'sky-2'|'sky-3';
export interface ForestLayerSpec {id:ForestLayerId;origin:Point;size:number;label:string}
export interface ForestArenaSpec {id:ForestArenaId;layer:ForestLayerId;local:Point;radius:number;label:string;reward?:string}
export const FOREST_MASTER_SIZE=320;
export const FOREST_LAYERS:Record<ForestLayerId,ForestLayerSpec>={
 surface:{id:'surface',origin:{x:0,y:0},size:181,label:'Surface World'},
 underground:{id:'underground',origin:{x:190,y:10},size:121,label:'Underground Layer'},
 floating:{id:'floating',origin:{x:205,y:185},size:101,label:'Floating Land Layer'}
};
const global=(layer:ForestLayerId,p:Point):Point=>({x:FOREST_LAYERS[layer].origin.x+p.x,y:FOREST_LAYERS[layer].origin.y+p.y});
export const FOREST_ARENAS:Record<ForestArenaId,ForestArenaSpec>={
 entrance:{id:'entrance',layer:'surface',local:{x:90,y:166},radius:12,label:'Entry / Start Hub'},
 waterfall:{id:'waterfall',layer:'surface',local:{x:33,y:110},radius:20,label:'Waterfall Valley',reward:'water-core'},
 green:{id:'green',layer:'surface',local:{x:58,y:45},radius:19,label:'Green Cliffs',reward:'wind-blade'},
 ruins:{id:'ruins',layer:'surface',local:{x:39,y:151},radius:18,label:'Ancient Ruins',reward:'ancient-handle'},
 chasm:{id:'chasm',layer:'surface',local:{x:145,y:116},radius:19,label:'Chasm',reward:'power-crystal'},
 giant:{id:'giant',layer:'surface',local:{x:132,y:44},radius:21,label:'Giant Tree',reward:'nature-fiber'},
 inner:{id:'inner',layer:'surface',local:{x:90,y:116},radius:10,label:'Inner Gate Path'},
 boss:{id:'boss',layer:'surface',local:{x:90,y:88},radius:12,label:'Boss Core'},
 'ug-flooded':{id:'ug-flooded',layer:'underground',local:{x:27,y:28},radius:16,label:'Flooded Cavern'},
 'ug-relic':{id:'ug-relic',layer:'underground',local:{x:84,y:28},radius:15,label:'Relic Chamber',reward:'hidden-catalyst'},
 'ug-xp':{id:'ug-xp',layer:'underground',local:{x:88,y:88},radius:18,label:'XP Arena'},
 'ug-cross':{id:'ug-cross',layer:'underground',local:{x:34,y:88},radius:14,label:'Cross Tunnel'},
 'sky-1':{id:'sky-1',layer:'floating',local:{x:22,y:72},radius:13,label:'Sky Island 1'},
 'sky-2':{id:'sky-2',layer:'floating',local:{x:34,y:26},radius:14,label:'Sky Island 2'},
 'sky-3':{id:'sky-3',layer:'floating',local:{x:78,y:48},radius:15,label:'Sky Island 3',reward:'sky-rune'}
};
export const arenaPoint=(id:ForestArenaId)=>global(FOREST_ARENAS[id].layer,FOREST_ARENAS[id].local);
export const layerOfPoint=(p:Point):ForestLayerId=>{
 for(const id of ['underground','floating'] as const){const l=FOREST_LAYERS[id];if(p.x>=l.origin.x&&p.x<l.origin.x+l.size&&p.y>=l.origin.y&&p.y<l.origin.y+l.size)return id;}
 return 'surface';
};
export const activeSurfaceArenas:Record<Difficulty,ForestArenaId[]>={
 easy:['waterfall','green','ruins'],
 medium:['waterfall','green','ruins','chasm','giant'],
 hard:['waterfall','green','ruins','chasm','giant'],
 extreme:['waterfall','green','ruins','chasm','giant']
};
export const gatePools:Partial<Record<ForestArenaId,{A:ForestArenaId[];B:ForestArenaId[]}>>={
 waterfall:{A:['ug-flooded','ruins'],B:['chasm','ug-cross']},
 green:{A:['chasm','giant'],B:['sky-1','ruins']},
 ruins:{A:['ug-relic','inner'],B:['giant','waterfall']},
 chasm:{A:['ug-xp','ug-cross'],B:['giant','inner']},
 giant:{A:['inner','ruins'],B:['sky-2','sky-1']},
 'ug-flooded':{A:['ug-cross','ug-relic'],B:['waterfall','ruins']},
 'ug-relic':{A:['ug-xp','ug-cross'],B:['ruins','waterfall']},
 'ug-xp':{A:['ug-cross','ug-relic'],B:['chasm','giant']},
 'ug-cross':{A:['ug-flooded','ug-xp'],B:['waterfall','chasm']},
 'sky-1':{A:['sky-2','sky-3'],B:['green','giant']},
 'sky-2':{A:['sky-3','sky-1'],B:['giant','green']},
 'sky-3':{A:['sky-1','sky-2'],B:['inner','giant']}
};
