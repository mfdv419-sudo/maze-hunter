import {zones} from './adventure-zones';
import type {AdventureState} from './adventure-state';
export const zoneDetails=[
 {description:['Buah, bekal dan awal petualangan.','Gather supplies and find your first trail.'],danger:0},
 {description:['Reruntuhan menyimpan jalur dan rahasia.','Ancient ruins hide paths and secrets.'],danger:1},
 {description:['Penjaga melindungi persimpangan penting.','Forest Guards protect the main crossings.'],danger:3},
 {description:['Hadiah bernilai menarik para penjelajah.','Valuable rewards draw other adventurers.'],danger:2},
 {description:['Ikuti landmark di balik rimba rapat.','Look for landmarks in the deep forest.'],danger:3},
 {description:['Raja Rimbun menjaga jalan kebebasan.','The Forest King guards the way to freedom.'],danger:4},
 {description:['Pilih jalur dan capai gerbang tepat waktu.','Choose your route and reach the gate in time.'],danger:2},
] as const;
export function primaryObjective(s:AdventureState,lang:'id'|'en'){
 if(s.stage==='escape')return lang==='id'?'Lolos melalui gerbang':'Escape through the gate';
 if(s.seals.size<3)return lang==='id'?`◆ Cari kristal toska · Segel ${s.seals.size}/3`:`◆ Find turquoise crystals · Seals ${s.seals.size}/3`;
 if(s.stage==='boss')return lang==='id'?`Kalahkan Raja · Fase ${s.bossPhase}`:`Defeat the King · Phase ${s.bossPhase}`;
 return lang==='id'?'Capai Benteng Raja':'Reach the King Fortress';
}
export function areaInformation(s:AdventureState,lang:'id'|'en'){
 const i=s.zone,d=zoneDetails[i],levels=lang==='id'?['Aman','Rendah','Sedang','Tinggi','Ekstrem']:['Safe','Low','Medium','High','Extreme'];
 return{name:zones[i][lang==='id'?'idName':'enName'],description:d.description[lang==='id'?0:1],danger:levels[d.danger],level:d.danger};
}
export function nearbyInformation(s:AdventureState,lang:'id'|'en'){
 const near=(p:{x:number;y:number},r=1.7)=>Math.hypot(p.x+.5-s.position.x,p.y+.5-s.position.y)<r;
 if(near(s.layout.maze.finish,2.4))return s.gateOpen?(lang==='id'?'Gerbang terbuka — masuk untuk lolos.':'Gate open — cross to escape.'):(lang==='id'?`Gerbang terkunci: segel ${s.seals.size}/3 · Raja ${s.bossCleared?'dikalahkan':'belum dikalahkan'}.`:`Gate locked: seals ${s.seals.size}/3 · King ${s.bossCleared?'defeated':'still guarding'}.`);
 if(s.layout.secret&&near(s.layout.secret)&&!s.broken.has(`${s.layout.secret.x},${s.layout.secret.y}`))return lang==='id'?`Jalur rahasia · perlu 1 kunci (${s.keys} tersedia).`:`Hidden route · needs 1 key (${s.keys} available).`;
 if(s.climber.state.phase==='hanging')return lang==='id'?'Berpegangan · A / arah menuju tepian untuk naik; menjauh untuk turun.':'Hanging · A / move toward the ledge to climb; away to release.';
 if(s.bossRefilling)return lang==='id'?`Bekal arena: +1 kue / 2 detik (maks. 8). ${s.ammo===0?'Hindari serangan sambil menunggu isi ulang.':'Tetap di arena agar kue terisi.'}`:`Arena supplies: +1 cake / 2 seconds (max. 8). ${s.ammo===0?'Dodge while waiting for a refill.':'Stay in the arena to refill.'}`;
 const ledge=s.layout.ledges.find(l=>near(l.point,1.5));if(ledge)return lang==='id'?(s.climbed.has(ledge.id)?'Tepian sudah dijelajahi.':'Tepian berlumut · A untuk lompat dan pegang, A lagi untuk naik.'):(s.climbed.has(ledge.id)?'Ledge already explored.':'Mossy ledge · A to jump and grab, A again to pull up.');
 const seal=s.layout.seals.findIndex((p,i)=>!s.seals.has(i)&&near(p,1.5));if(seal>=0)return lang==='id'?`Segel Rimba · dekati untuk mengumpulkan (${s.seals.size}/3).`:`Forest Seal · approach to collect (${s.seals.size}/3).`;
 const area=s.layout.areas.find(a=>near(a.point,2.2));if(area?.zone===3){const guards=s.guards.filter(g=>!g.dead&&Math.hypot(g.position.x-s.position.x,g.position.y-s.position.y)<6).length;return lang==='id'?`Simpang Perebutan · ${guards} penjaga di sekitar · cari peti dan jalan pintas.`:`Conflict Zone · ${guards} nearby guards · look for treasure and shortcuts.`;}if(area)return areaInformation({...s,zone:area.zone} as AdventureState,lang).description;
 return s.seals.size<3?(lang==='id'?'◆ Segel Rimba = kristal toska melayang. Dekati untuk mengambil. Cari simbol ◆ di area minimap yang sudah ditemukan.':'◆ Forest Seals are floating turquoise crystals. Walk into them to collect. Look for ◆ in discovered minimap areas.'):'';
}
