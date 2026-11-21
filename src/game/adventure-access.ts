import {adventureAreas, type AdventureArea} from './areas';
import {expeditionRank} from '../services/local';
import type {Profile} from '../services/local';

/** World progression uses the saved SOLO records, never a mutable display name. */
export function canEnterAdventureArea(profile:Profile, area:AdventureArea, reviewer=false):boolean {
 if(reviewer || area==='classic' || area==='forest')return true;
 const index=adventureAreas.indexOf(area);
 if(index<2)return false;
 const previous=adventureAreas[index-1];
 return previous!=='classic' && expeditionRank(profile,previous)>=4;
}

/** This allows gameplay preview only for explicitly listed, verified Firebase UIDs.
 * Display name (including "mf") is not an authorization credential. */
export function isAdventureReviewer(uid:string, configuredUids:string|undefined):boolean {
 return Boolean(uid && configuredUids?.split(',').map(value=>value.trim()).filter(Boolean).includes(uid));
}
