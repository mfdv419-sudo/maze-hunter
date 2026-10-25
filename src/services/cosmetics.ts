import type {Profile} from './local';
export const slots=['head','face','body','back','tail','palette'] as const;
export type Slot=typeof slots[number];
export type Appearance=Record<Slot,string>;
export type Rarity='common'|'rare'|'epic'|'legendary'|'mythic';
export interface Cosmetic {id:string;slot:Slot;name:[string,string];rarity:Rarity;stars:number;zones?:number;wins?:number}
export const cosmetics:Cosmetic[]=[
 {id:'bare',slot:'head',name:['Jambul Rimba','Forest Tuft'],rarity:'common',stars:0},
 {id:'leaf',slot:'head',name:['Topi Daun','Leaf Hat'],rarity:'rare',stars:5},
 {id:'explorer',slot:'head',name:['Topi Penjelajah','Explorer Hat'],rarity:'epic',stars:10},
 {id:'crown',slot:'head',name:['Mahkota Rimba','Forest Crown'],rarity:'legendary',stars:50},
 {id:'moon',slot:'head',name:['Mahkota Bulan','Moon Crown'],rarity:'mythic',stars:100,wins:1},
 {id:'bare',slot:'face',name:['Wajah Ceria','Bright Eyes'],rarity:'common',stars:0},
 {id:'goggles',slot:'face',name:['Kacamata Jelajah','Trail Goggles'],rarity:'rare',stars:5},
 {id:'mask',slot:'face',name:['Topeng Daun','Leaf Mask'],rarity:'epic',stars:20},
 {id:'star',slot:'face',name:['Kacamata Bintang','Star Glasses'],rarity:'legendary',stars:50},
 {id:'classic',slot:'body',name:['Sahabat Rimba','Forest Friend'],rarity:'common',stars:0},
 {id:'explorer',slot:'body',name:['Rompi Jelajah','Explorer Vest'],rarity:'rare',stars:10},
 {id:'raincoat',slot:'body',name:['Hujan Ceria','Happy Rain'],rarity:'epic',stars:20},
 {id:'space',slot:'body',name:['Penjelajah Bintang','Star Explorer'],rarity:'legendary',stars:50},
 {id:'aurora',slot:'body',name:['Aurora Rimba','Forest Aurora'],rarity:'mythic',stars:100,wins:1},
 {id:'bare',slot:'back',name:['Tanpa Aksesori','No Accessory'],rarity:'common',stars:0},
 {id:'pack',slot:'back',name:['Tas Penjelajah','Explorer Pack'],rarity:'rare',stars:10},
 {id:'cape',slot:'back',name:['Jubah Daun','Leaf Cape'],rarity:'epic',stars:20},
 {id:'wings',slot:'back',name:['Sayap Bulan','Moon Wings'],rarity:'mythic',stars:100,wins:1},
 {id:'bare',slot:'tail',name:['Ekor Asli','Natural Tail'],rarity:'common',stars:0},
 {id:'bow',slot:'tail',name:['Pita Ekor','Tail Bow'],rarity:'rare',stars:5},
 {id:'leaf',slot:'tail',name:['Gelang Daun','Leaf Ring'],rarity:'epic',stars:20},
 {id:'star',slot:'tail',name:['Liontin Bintang','Star Charm'],rarity:'legendary',stars:50},
 ...(['charcoal','brown','silver','mint','gold'] as const).map((id,i)=>({id,slot:'palette' as Slot,name:([['Abu Arang','Charcoal'],['Cokelat','Warm Brown'],['Perak','Silver'],['Daun Mint','Mint Leaf'],['Senja Emas','Golden Dusk']][i]) as [string,string],rarity:(['common','common','common','epic','legendary'][i])as Rarity,stars:[0,0,0,20,50][i]})),
];
export const paletteColors:Record<string,number>={charcoal:0x343c45,brown:0x735947,silver:0x8a969b,mint:0x4a8275,gold:0x98723f};
export const defaults:Appearance={head:'bare',face:'bare',body:'classic',back:'bare',tail:'bare',palette:'charcoal'};
export function stats(p:Profile){const runs=Object.values(p.adventures||{});return{stars:Object.values(p.retro||{}).reduce((n,r)=>n+(Number.isFinite(r.stars)?r.stars:0),0),coins:runs.reduce((n,r)=>n+r.coins,0),wins:p.modernWins||0,zones:new Set(runs.flatMap(r=>r.zones)).size,chests:runs.reduce((n,r)=>n+r.chests,0)};}
export function available(p:Profile,item:Cosmetic){const s=stats(p);return s.stars>=item.stars&&s.wins>=(item.wins||0)&&s.zones>=(item.zones||0);}
export function appearanceOf(p:Pick<Profile,'outfit'|'appearance'>,fallbackPalette='charcoal'):Appearance {
 const legacy=p.outfit||'classic';const a={...defaults,palette:fallbackPalette,body:legacy,...(legacy==='explorer'?{head:'explorer',back:'pack'}:legacy==='space'?{back:'pack'}:{}),...p.appearance};
 for(const slot of slots)if(!cosmetics.some(c=>c.slot===slot&&c.id===a[slot]))a[slot]=defaults[slot];return a;
}
export function permittedAppearance(p:Profile){const a=appearanceOf(p);for(const slot of slots){const item=cosmetics.find(c=>c.slot===slot&&c.id===a[slot]);if(!item||!available(p,item))a[slot]=defaults[slot];}return a;}
export function cosmeticQuests(p:Profile){const s=stats(p);return[{id:'first-stars',name:['Petualang Pertama','First Steps'],value:Math.min(3,s.stars),target:3},{id:'forest-discovery',name:['Kenali Rimbamu','Know Your Forest'],value:Math.min(3,s.zones),target:3},{id:'first-escape',name:['Lolos dari Rimba','Forest Escape'],value:Math.min(1,s.wins),target:1}];}
