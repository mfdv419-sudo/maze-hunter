import type {Point} from './maze';
export type AvatarActionKind='cake'|'grenade'|'chili'|'watermelon'|'spinach'|'lift'|'place'|'throw-object'|'cut';
export interface AvatarAction {kind:AvatarActionKind;at:number;angle:number;cake?:string;prop?:string;from?:Point}
export const releaseTime=(kind:AvatarActionKind)=>kind==='cake'?.12:kind==='grenade'?.2:kind==='throw-object'?.24:kind==='chili'||kind==='watermelon'?.24:0;
export const actionDuration=(kind:AvatarActionKind)=>kind==='chili'||kind==='watermelon'?1:kind==='spinach'?.9:kind==='lift'?.6:kind==='throw-object'?.7:kind==='grenade'?.65:.48;
export function handOrigin(p:Point,angle:number){return{x:p.x+Math.sin(angle)*.18+Math.cos(angle)*.1,y:p.y+Math.cos(angle)*.18-Math.sin(angle)*.1};}
export function actionKind(kind:string):AvatarActionKind|undefined{return({hit:'cake','food-grenade':'grenade','food-chili':'chili','food-watermelon':'watermelon','food-spinach':'spinach',lift:'lift',place:'place','throw-object':'throw-object'} as Record<string,AvatarActionKind>)[kind];}
export function throwPose(kind:AvatarActionKind,age:number){const release=releaseTime(kind),duration=actionDuration(kind),active=age>=0&&age<duration;if(!active)return{active:false,shoulder:0,elbow:0,twist:0,weight:0};const smooth=(p:number)=>{const t=Math.max(0,Math.min(1,p));return t*t*(3-2*t);},wind=smooth(age/Math.max(.01,release)),follow=smooth((age-release)/Math.max(.01,duration-release)),heavy=kind==='grenade'||kind==='throw-object';return{active,shoulder:age<release?.8*wind+((heavy?-2.2:-1.8)-.8)*smooth((age-release*.5)/(release*.5)):(heavy?-2.2:-1.8)*(1-follow),elbow:age<release?-.8*wind:-.35*(1-follow),twist:(age<release?-.22*wind:.16*(1-follow))*(heavy?1.5:1),weight:Math.sin(Math.PI*Math.min(1,age/duration))*(heavy?.1:.025)};}

export function projectileOrigin(p:Point,angle:number,mouth=false){return mouth?{x:p.x+Math.sin(angle)*.25,y:p.y+Math.cos(angle)*.25}:handOrigin(p,angle);}
