import type {Match} from './room-state';
/** Browser needs the local authoritative simulation and peer transforms, never all peer simulations. */
export function clientRoom(room:Match|null,key:string):Match|null{
 if(!room)return null;const out=structuredClone(room);if(out.adventure){const a=out.adventure;const own=a.states[key];a.states=own?{[key]:own}:{};delete a.sharedWorld;delete a.sharedSeals;}
 return out;
}
