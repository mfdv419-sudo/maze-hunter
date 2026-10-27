import type {Point} from './maze';
export const foodKinds=['chili','watermelon','spinach']as const;
export type FoodKind=typeof foodKinds[number];
export const foodNames={chili:['Cabe','Chili'],watermelon:['Semangka','Watermelon'],spinach:['Bayam','Spinach'],grenade:['Cake granat api','Fire cake grenade']}as const;
export interface Supplies {chili:number;watermelon:number;spinach:number;grenade:number}
export interface PropMove extends Point {holder?:string}
export interface FireZone {id:number;point:Point;at:number;end:number;lastTick:number;shooter?:string}
export function emptySupplies():Supplies{return{chili:0,watermelon:0,spinach:0,grenade:0};}
export function inCone(origin:Point,target:Point,angle:number,range:number,halfAngle=.45){const dx=target.x-origin.x,dy=target.y-origin.y,d=Math.hypot(dx,dy);return d<=range&&d>.01&&(dx*Math.sin(angle)+dy*Math.cos(angle))/d>=Math.cos(halfAngle);}
