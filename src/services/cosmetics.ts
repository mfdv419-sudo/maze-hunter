import type {Profile} from './local';
export const slots=['head','face','body','back','tail','palette','hands','feet'] as const;
export type Slot=typeof slots[number];
export type Appearance=Record<Exclude<Slot,'hands'|'feet'>,string>&Partial<Record<'hands'|'feet',string>>;
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
 ...(['hands','feet'] as const).flatMap(slot=>(['bare','trail','climber','desert','diver'] as const).map((id,i)=>({id,slot,name:([['Tanpa perlengkapan','Bare'],['Jelajah Rimba','Forest Trail'],['Pendaki Tebing','Cliff Climber'],['Penjelajah Gurun','Desert Explorer'],['Penyelam Karang','Reef Diver']][i].map((n,j)=>n+(i?(j===0?(slot==='hands'?' · Sarung tangan':' · Sepatu'):(slot==='hands'?' · Gloves':' · Boots')):''))) as [string,string],rarity:(i>2?'epic':i?'rare':'common') as Rarity,stars:i===0?0:slot==='hands'?i*2+1:i*2+3}))),
 ...(['climber','desert','diver'] as const).flatMap((id,i)=>(['head','body','back',...(id==='climber'?[]:['face'])] as Slot[]).map(slot=>({id,slot,name:([['Pendaki Tebing','Cliff Climber'],['Penjelajah Gurun','Desert Explorer'],['Penyelam Karang','Reef Diver']][i]) as [string,string],rarity:'epic' as Rarity,stars:slot==='body'?12+i*3:6+i*2}))),
];
export const paletteColors:Record<string,number>={charcoal:0x343c45,brown:0x735947,silver:0x8a969b,mint:0x4a8275,gold:0x98723f};
export const defaults:Appearance={head:'bare',face:'bare',body:'classic',back:'bare',tail:'bare',palette:'charcoal',hands:'bare',feet:'bare'};
export function stats(p:Profile){const runs=Object.values(p.adventures||{});return{stars:Object.values(p.retro||{}).reduce((n,r)=>n+(Number.isFinite(r.stars)?Math.max(0,Math.min(3,r.stars)):0),0),coins:runs.reduce((n,r)=>n+r.coins,0),wins:p.modernWins||0,zones:new Set(runs.flatMap(r=>r.zones)).size,chests:runs.reduce((n,r)=>n+r.chests,0)};}
export interface WardrobeWallet {version:1;legacy:string[];purchases:string[];pending:string[];paid:Record<string,number>}
export const cosmeticKey=(c:Pick<Cosmetic,'slot'|'id'>)=>`${c.slot}:${c.id}`;
const newItems=new Set(cosmetics.filter(c=>['hands','feet'].includes(c.slot)||['climber','desert','diver'].includes(c.id)).map(cosmeticKey));
export function ensureWallet(p:Profile){if(!p.wardrobe){const st=stats(p);p.wardrobe={version:1,legacy:p.wardrobeSchema===1?[]:cosmetics.filter(c=>!newItems.has(cosmeticKey(c))&&st.stars>=c.stars&&st.wins>=(c.wins||0)).map(cosmeticKey).concat(p.outfit==='explorer'?['hands:trail','feet:trail']:[]),purchases:[],pending:[],paid:{}};p.wardrobeSchema=1;}return p.wardrobe;}
export function owns(p:Profile,c:Cosmetic){const w=ensureWallet(p),k=cosmeticKey(c);return c.stars===0||w.legacy.includes(k)||w.purchases.includes(k)||w.pending.includes(k);}
export function starBalance(p:Profile){const w=ensureWallet(p);return Math.max(0,stats(p).stars-[...new Set([...w.purchases,...w.pending])].filter(k=>!w.legacy.includes(k)).reduce((n,k)=>n+(w.paid[k]??cosmetics.find(c=>cosmeticKey(c)===k)?.stars??0),0));}
export function available(p:Profile,item:Cosmetic){return owns(p,item);}
export function redeem(p:Profile,item:Cosmetic){if(owns(p,item))return true;if(starBalance(p)<item.stars||stats(p).wins<(item.wins||0))return false;const w=ensureWallet(p),key=cosmeticKey(item);w.pending.push(key);w.paid[key]=item.stars;p.updatedAt=Date.now();return true;}
/** Server settles fixed-catalogue item IDs; receipts retain price paid across future price changes. */
export function settleWardrobe(p:Profile,stored:WardrobeWallet|undefined,pending:string[]){const base={...p,wardrobe:stored?structuredClone(stored):undefined};const wallet=ensureWallet(base),rejected:string[]=[];wallet.pending=[];for(const key of [...new Set(pending)].slice(0,80)){const item=cosmetics.find(c=>cosmeticKey(c)===key);if(!item){rejected.push(key);continue;}if(owns(base,item))continue;if(starBalance(base)<item.stars||stats(base).wins<(item.wins||0)){rejected.push(key);continue;}wallet.purchases.push(key);wallet.paid[key]=item.stars;}return{wallet,rejected};}
export function appearanceOf(p:Pick<Profile,'outfit'|'appearance'>,fallbackPalette='charcoal'):Appearance {
 const legacy=p.outfit||'classic';const a={...defaults,palette:fallbackPalette,body:legacy,...(legacy==='explorer'?{head:'explorer',back:'pack'}:legacy==='space'?{back:'pack'}:{}),...(legacy==='explorer'?{hands:'trail',feet:'trail'}:{}),...p.appearance};
 for(const slot of slots)if(!cosmetics.some(c=>c.slot===slot&&c.id===a[slot]))a[slot]=defaults[slot]!;return a;
}
export function permittedAppearance(p:Profile){const a=appearanceOf(p);for(const slot of slots){const item=cosmetics.find(c=>c.slot===slot&&c.id===a[slot]);if(!item||!available(p,item))a[slot]=defaults[slot]!;}return a;}
export function cosmeticQuests(p:Profile){const s=stats(p);return[{id:'first-stars',name:['Petualang Pertama','First Steps'],value:Math.min(3,s.stars),target:3},{id:'forest-discovery',name:['Kenali Rimbamu','Know Your Forest'],value:Math.min(3,s.zones),target:3},{id:'first-escape',name:['Lolos dari Rimba','Forest Escape'],value:Math.min(1,s.wins),target:1}];}
