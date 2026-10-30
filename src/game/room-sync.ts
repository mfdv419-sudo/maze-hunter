import type {Match} from './room-state';
/** Metadata and the requesting simulation arrive over separate RTDB subscriptions. */
export function coherentRoom(room:Match,self:string){const s=room.adventure?.states?.[self];return room.state==='lobby'||!room.adventure||!!s&&(!room.simulationVersion||s.worldVersion===room.revision)&&(s.syncSeq===undefined||s.syncSeq===(room.players[self]?.seq||0));}
export function stampRoom(room:Match|null|undefined){if(room?.adventure){room.simulationVersion=1;for(const s of Object.values(room.adventure.states||{}))s.worldVersion=room.revision;}return room;}
