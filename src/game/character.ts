import * as T from 'three';
import type { Appearance } from '../services/cosmetics';
import { paletteColors } from '../services/cosmetics';
import { expeditionAppearance } from './expedition-equipment';
import type { AvatarActionKind } from './avatar-actions';
import { createRiggedBinturong } from './rigged-binturong';

/** Gameplay/preview-facing Character API is stable. The old procedural mesh is removed. */
export type CharacterAppearance = Appearance & {hands?: string; feet?: string};
export interface CharacterAction {
  gearShot?: boolean; cameraLook?: number; actionKind?: AvatarActionKind;
  actionAge?: number; cakeColor?: number; hurtAge?: number; defeated?: boolean;
  pickup?: number; allowIdle?: boolean; jumpAge?: number; jumpCount?: number;
  jumpBase?: number; treeClimb?: boolean; eat?: number; carrying?: boolean;
  hit: number; greet?: number; lookUp?: boolean;
  climb?: 'hanging'|'climbing'|'top'|'ground'; climbProgress?: number;
  showBack?: boolean; jump?: number; pole?: boolean; swim?: boolean;
}
export interface Character {
  root: T.Group;
  animate: (time:number,speed:number,celebrate?:boolean,action?:CharacterAction)=>void;
  dispose: ()=>void;
}

/** One authoritative 3D Binturong: skinned GLB for Home, gameplay, portraits and multiplayer. */
export function createBinturong(outfit='classic', color=0x343c45, appearance?:CharacterAppearance): Character {
  const adapted = appearance ? expeditionAppearance(appearance) : undefined;
  const body = adapted?.body ?? outfit;
  const fur = adapted ? (paletteColors[adapted.palette] ?? color) : color;
  return createRiggedBinturong(body,fur,adapted);
}
