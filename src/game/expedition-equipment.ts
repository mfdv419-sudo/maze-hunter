import type {AdventureArea} from './areas';
import {forestStages} from './forest-progression';
import type {Appearance, Slot} from '../services/cosmetics';

export type EquipmentArea=Exclude<AdventureArea,'classic'>;

type EquipmentEffect='land'|'climb'|'reach'|'reserve'|'swim'|'snorkel'|'suit'|'tank'|'find'|'weapon'|'armor';
type Item=[name:string, english:string, slot:Slot, style:string, effect:EquipmentEffect];

const matrix:Record<EquipmentArea,readonly Item[]>={
 forest:[
  ['Sepatu Rimba','Trail Boots','feet','trail','land'],
  ['Sarung Tangan Panjat','Climbing Gloves','hands','climber','climb'],
  ['Set Tali','Rope Kit','back','climber','reach'],
  ['Set Penjelajah Rimba','Forest Explorer Gear','back','pack','reserve'],
  ['Busur Alam','Nature Bow','back','climber','weapon'],
  ['Zirah Penjaga','Guardian Armor','body','climber','armor'],
 ],
 desert:[
  ['Sepatu Pasir','Sand Boots','feet','desert','land'],
  ['Kacamata Gurun','Desert Goggles','face','desert','find'],
  ['Rompi Pendingin','Cooling Vest','body','desert','suit'],
  ['Tas Bertahan Hidup','Survival Pack','back','desert','reserve'],
  ['Pelontar Scarab','Scarab Blaster','back','desert','weapon'],
  ['Zirah Sphinx','Sphinx Armor','body','desert','armor'],
 ],
 gorge:[
  ['Sepatu Cengkeram','Grip Shoes','feet','climber','land'],
  ['Tali Panjat','Climbing Rope','back','climber','reach'],
  ['Perlengkapan Panjat','Climbing Gear','hands','climber','climb'],
  ['Kait Panjat Lanjutan','Advanced Grapple','back','climber','reach'],
  ['Pelontar Batu','Rock Launcher','back','pack','weapon'],
  ['Set Penjelajah Ngarai','Canyon Explorer Suit','body','climber','armor'],
 ],
 mountain:[
  ['Sepatu Mendaki','Hiking Boots','feet','climber','land'],
  ['Kacamata Salju','Snow Goggles','face','goggles','find'],
  ['Perlengkapan Termal','Thermal Gear','body','raincoat','suit'],
  ['Tas Pendakian Tinggi','Altitude Pack','back','climber','reserve'],
  ['Tongkat Badai','Storm Staff','back','climber','weapon'],
  ['Set Penakluk Puncak','Summit Suit','body','aurora','armor'],
 ],
 coast:[
  ['Sepatu Air','Aqua Shoes','feet','diver','swim'],
  ['Perlengkapan Renang','Swim Gear','face','diver','snorkel'],
  ['Alat Harta Karun','Treasure Tools','back','pack','find'],
  ['Perlengkapan Laut','Marine Gear','body','diver','suit'],
  ['Harpon','Harpoon','back','diver','weapon'],
  ['Set Penjelajah Korsar','Corsair Explorer Set','body','explorer','armor'],
 ],
 sea:[
  ['Sepatu Katak','Fins','feet','diver','swim'],
  ['Masker dan Snorkel','Mask + Snorkel','face','diver','snorkel'],
  ['Sarung Tangan dan Baju Selam','Diving Gloves + Diving Suit','body','diver','suit'],
  ['Tabung Oksigen','Oxygen Tank','back','diver','tank'],
  ['Capit Gelembung','Bubble Claw','back','diver','weapon'],
  ['Set Premium Abyssal','Abyssal Premium Suit','body','diver','armor'],
 ],
 volcano:[
  ['Sepatu Tahan Panas','Heat Boots','feet','desert','land'],
  ['Visor Tahan Panas','Heat Visor','face','desert','find'],
  ['Sarung Tangan dan Baju Termal','Thermal Gloves + Suit','body','desert','suit'],
  ['Tas Tahan Panas','Heat Survival Pack','back','desert','reserve'],
  ['Senjata Magma','Magma Weapon','back','desert','weapon'],
  ['Set Inferno','Inferno Suit','body','space','armor'],
 ],
};

export const equipmentAreas=Object.keys(matrix) as EquipmentArea[];
const prices=[50,75,125,250,500,500] as const;
const rarities=['common','uncommon','rare','epic','legendary','mythic'] as const;
export const expeditionEquipment=equipmentAreas.flatMap(area=>matrix[area].map(([idName,enName,slot,style,effect],index)=>({
 id:`expedition-${area}-${index+1}`,area,stage:forestStages[index],rank:index+1,slot,style,effect,
 stars:prices[index],rarity:rarities[index],name:[idName,enName] as [string,string],
})));
export type ExpeditionGear=typeof expeditionEquipment[number];

const byId=new Map(expeditionEquipment.map(item=>[item.id,item]));
export const expeditionItem=(id?:string)=>id?byId.get(id):undefined;
export function expeditionAppearance(appearance:Appearance):Appearance{
 const rendered={...appearance};
 for(const slot of Object.keys(appearance) as Slot[]){
  const item=byId.get(appearance[slot]??'');
  if(!item||item.slot!==slot)continue;
  rendered[slot]=item.effect==='weapon'?'bare':item.style;
  if(slot==='body'&&item.effect==='suit'&&(item.area==='sea'||item.area==='volcano')&&(!appearance.hands||appearance.hands==='bare'))rendered.hands=item.area==='sea'?'diver':'desert';
 }
 return rendered;
}

export const equipmentBenefits:Record<EquipmentEffect,[string,string]>={
 land:['Gerak darat +8%.','Land speed +8%.'],
 climb:['Panjat 20% lebih cepat.','Climb 20% faster.'],
 reach:['Jangkauan meraih tepian bertambah.','Increased ledge reach.'],
 reserve:['Oksigen cadangan di hutan. Di arena lain, kue awal penuh.','Reserve oxygen in Forest Grove. Full starting cakes elsewhere.'],
 swim:['Kecepatan berenang +12%.','Swim speed +12%.'],
 snorkel:['Gerak permukaan dan pemulihan oksigen lebih cepat.','Faster surface swimming and oxygen recovery.'],
 suit:['Mengurangi dampak bahaya lingkungan.','Reduces damage from environmental hazards.'],
 tank:['Selam lebih dalam dengan 48 detik oksigen.','Dive deeper with 48 seconds of oxygen.'],
 find:['Jangkauan mengambil bekal dan harta bertambah.','Increased pickup reach for supplies and treasure.'],
 weapon:['Serangan khas arena. Gunakan tombol Ability atau 5.','Area weapon. Use the Ability tray or key 5.'],
 armor:['Kerusakan serangan berkurang 20%.','Take 20% less attack damage.'],
};
