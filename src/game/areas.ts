import type {Difficulty} from './maze';
export const adventureAreas=['classic','forest','desert','gorge','mountain','coast','sea'] as const;
export type AdventureArea=typeof adventureAreas[number];
export function validArea(value:unknown):value is AdventureArea{return adventureAreas.includes(value as AdventureArea);}
export const areaThemes={
 classic:{id:'Labirin Asli',en:'Original Maze',hint:['Rute SOLO yang sudah kamu kenal.','The original SOLO routes you know.'],floor:0xc6ce99,wall:0x678c52,sky:0xb6d9c8,texture:'leaf',size:[43,53,63],boss:['Raja Rimbun','Forest King']},
 forest:{id:'Hutan Rimbun',en:'Forest Grove',hint:['Kanopi tinggi, rumah penjaga dan segel rimba.','Tall canopy, keeper lodges and forest seals.'],floor:0xa7bd85,wall:0x5d8b58,sky:0xa5d5ce,texture:'leaf',size:[81,105,129],boss:['Raja Rimbun','Forest King']},
 desert:{id:'Gurun Surya',en:'Sunlit Desert',hint:['Reruntuhan, oasis dan lorong batu pasir.','Ruins, oases and sandstone corridors.'],floor:0xe4c18b,wall:0xbb8e62,sky:0xf2d8ad,texture:'stone',size:[81,105,129],boss:['Raja Surya','Sun King']},
 gorge:{id:'Ngarai Toska',en:'Turquoise Gorge',hint:['Tebing tinggi, gua kristal dan air dangkal.','Towering cliffs, crystal caves and shallow water.'],floor:0x839c98,wall:0x6f8589,sky:0xa8ccd7,texture:'stone',size:[81,105,129],boss:['Raja Ngarai','Gorge King']},
 mountain:{id:'Gunung Awan',en:'Cloud Mountain',hint:['Jalur mendaki, batu pijakan dan puncak bersalju.','Ascending trails, ledges and snowy peaks.'],floor:0xbbccd0,wall:0x8c9eaa,sky:0xc2e0ed,texture:'stone',size:[81,105,129],boss:['Raja Puncak','Summit King']},
 coast:{id:'Pantai Senja',en:'Sunset Coast',hint:['Pohon kelapa, teluk dan benteng pesisir.','Palms, coves and a coastal fortress.'],floor:0xe1d6ac,wall:0xa9af97,sky:0xf0c6b5,texture:'stone',size:[81,105,129],boss:['Raja Pasang','Tide King']},
 sea:{id:'Laut Karang',en:'Coral Sea',hint:['Berenang di antara karang dan penjaga sirip.','Swim among coral walls and finned guardians.'],floor:0x65aebc,wall:0x7e9ca6,sky:0xb2dae4,texture:'stone',size:[81,105,129],boss:['Raja Sirip','Fin King']},
} as const;
export function areaName(area:AdventureArea,language:'id'|'en'){return areaThemes[area][language];}
export const areaIndex=(d:Difficulty)=>({medium:0,hard:1,extreme:2})[d];
export function areaSize(area:AdventureArea,d:Difficulty){return areaThemes[area].size[areaIndex(d)];}
export function areaTime(area:AdventureArea,d:Difficulty){return area==='classic'?{medium:720,hard:1080,extreme:1500}[d]:{medium:1800,hard:2400,extreme:3300}[d];}
