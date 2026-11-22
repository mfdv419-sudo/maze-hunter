import type {Difficulty} from './maze';

export type ForestWorldDifficulty = 'hard' | 'extreme';

export const forestStages = [
 'easy', 'medium', 'hard', 'extreme', 'world-hard', 'world-extreme',
] as const;
export type ForestStage = typeof forestStages[number];

export const forestStageLabel: Record<ForestStage, string> = {
 easy:'Easy',
 medium:'Medium',
 hard:'Hard',
 extreme:'Extreme',
 'world-hard':'Expanded World · Hard',
 'world-extreme':'Expanded World · Extreme',
};

export function forestStage(difficulty: Difficulty, expanded: boolean): ForestStage {
 return expanded && (difficulty === 'hard' || difficulty === 'extreme') ? `world-${difficulty}` : difficulty;
}

export function canEnterForestWorld(rank: number, difficulty: ForestWorldDifficulty) {
 return rank >= (difficulty === 'hard' ? 4 : 5);
}

export function forestRankAfterWin(rank: number, stage: ForestStage) {
 return forestStages[rank] === stage ? rank + 1 : rank;
}

export const forestEarnedEquipment = [
 {id:'boots', shopKey:'feet:trail', name:'Trail Boots', benefit:['Langkah 8% lebih cepat di darat.', 'Move 8% faster on land.']},
 {id:'gloves', shopKey:'hands:climber', name:'Climbing Gloves', benefit:['Panjat 20% lebih cepat.', 'Pull up 20% faster when climbing.']},
 {id:'rope', shopKey:'back:climber', name:'Rope Kit', benefit:['Jangkauan meraih tepian lebih jauh.', 'Reach ledges from farther away.']},
 {id:'pack', shopKey:'back:pack', name:'Forest Explorer Pack', benefit:['Cadangan oksigen 36 detik di Expanded World.', '36 seconds of oxygen in Expanded World.']},
] as const;

export type ForestEquipment = typeof forestEarnedEquipment[number]['id'];

export function forestEquipment(rank: number, ownedShopKeys: readonly string[]) {
 return forestEarnedEquipment.filter((gear,index)=>rank>index||ownedShopKeys.includes(gear.shopKey));
}
