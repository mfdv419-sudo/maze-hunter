import {adventureAreas,type AdventureArea} from './areas';
import type {Profile} from '../services/local';
import {canEnterAdventureArea} from './adventure-access';
/** Profile-owned home backgrounds. Availability is derived from earned progress,
 * never from just selecting a locked arena in the menu. */
export function homeBackdropAreas(profile:Profile|undefined, reviewer=false):AdventureArea[]{
 if(reviewer)return [...adventureAreas];
 if(!profile)return ['classic','forest'];
 const earned=new Set<AdventureArea>(['classic','forest',...(profile.homeBackdrops?.unlocked||[])]);
 for(const area of adventureAreas)if(canEnterAdventureArea(profile,area))earned.add(area);
 return adventureAreas.filter(a=>earned.has(a));
}
export function selectedHomeBackdrop(profile:Profile|undefined,reviewer=false):AdventureArea{
 const earned=homeBackdropAreas(profile,reviewer);
 return earned.includes(profile?.homeBackdrops?.equipped as AdventureArea)?profile!.homeBackdrops!.equipped!:'forest';
}
export function equipHomeBackdrop(profile:Profile,area:AdventureArea,reviewer=false):boolean{
 if(!homeBackdropAreas(profile,reviewer).includes(area))return false;
 profile.homeBackdrops??={unlocked:['classic','forest'],equipped:'forest'};
 profile.homeBackdrops.equipped=area;
 profile.updatedAt=Date.now();return true;
}
