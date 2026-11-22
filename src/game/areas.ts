import type {Difficulty} from './maze';
export const adventureAreas=['classic','forest','desert','gorge','mountain','coast','sea','volcano'] as const;
export type AdventureArea=typeof adventureAreas[number];
export function validArea(value:unknown):value is AdventureArea{return adventureAreas.includes(value as AdventureArea);}
export const areaThemes={
 volcano:{id:'Gunung Bara',en:'Ember Volcano',hint:['Basalt tinggi, sungai lava dan batu pijar.','Tall basalt, lava channels and falling embers.'],floor:0x65514b,wall:0x443f42,sky:0xb5a5a0,texture:'stone',size:[81,105,129],boss:['Raja Magma','Magma Monarch']},
 classic:{id:'Labirin Asli',en:'Original Maze',hint:['Rute SOLO yang sudah kamu kenal.','The original SOLO routes you know.'],floor:0xc6ce99,wall:0x678c52,sky:0xb6d9c8,texture:'leaf',size:[43,53,63],boss:['Raja Rimbun','Forest King']},
 forest:{id:'Hutan Rimbun',en:'Forest Grove',hint:['Kanopi tinggi, rumah penjaga dan segel rimba.','Tall canopy, keeper lodges and forest seals.'],floor:0xa7bd85,wall:0x5d8b58,sky:0xa5d5ce,texture:'leaf',size:[81,105,129],boss:['Raja Akar','Root King']},
 desert:{id:'Gurun Surya',en:'Sunlit Desert',hint:['Reruntuhan, oasis dan lorong batu pasir.','Ruins, oases and sandstone corridors.'],floor:0xe4c18b,wall:0xbb8e62,sky:0xf2d8ad,texture:'stone',size:[81,105,129],boss:['Sphinx Surya','Sun Sphinx']},
 gorge:{id:'Ngarai Rimba',en:'Verdant Gorge',hint:['Tebing berlapis, jembatan sungai dan Raja Batu Retak.','Layered cliffs, river bridges and the Fractured Stone King.'],floor:0x8d9b70,wall:0x8b8d74,sky:0xd7c8b6,texture:'stone',size:[81,105,129],boss:['Raja Batu Retak','Fractured Stone King']},
 mountain:{id:'Gunung Awan',en:'Cloud Mountain',hint:['Jalur mendaki, batu pijakan dan puncak bersalju.','Ascending trails, ledges and snowy peaks.'],floor:0xbbccd0,wall:0x8c9eaa,sky:0xc2e0ed,texture:'stone',size:[81,105,129],boss:['Raja Tanduk Badai','Stormhorn King']},
 coast:{id:'Pantai Senja',en:'Sunset Coast',hint:['Pohon kelapa, teluk dan benteng pesisir.','Palms, coves and a coastal fortress.'],floor:0xe1d6ac,wall:0xa9af97,sky:0xf0c6b5,texture:'stone',size:[81,105,129],boss:['Raja Karapas','Carapace King']},
 sea:{id:'Laut Karang',en:'Coral Sea',hint:['Berenang di antara karang dan penjaga sirip.','Swim among coral walls and finned guardians.'],floor:0x65aebc,wall:0x7e9ca6,sky:0xb2dae4,texture:'stone',size:[81,105,129],boss:['Raja Pari Karang','Reef Ray King']},
} as const;
export function areaName(area:AdventureArea,language:'id'|'en'){return areaThemes[area][language];}
export const areaIndex=(d:Difficulty)=>({easy:0,medium:0,hard:1,extreme:2})[d];
export function areaSize(area:AdventureArea,d:Difficulty){return d==='easy'?(area==='classic'?35:63):areaThemes[area].size[areaIndex(d)];}
export function areaTime(area:AdventureArea,d:Difficulty){return area==='classic'?{easy:1080,medium:720,hard:1080,extreme:1500}[d]:{easy:2400,medium:1800,hard:2400,extreme:3300}[d];}
