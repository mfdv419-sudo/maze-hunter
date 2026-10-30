import {areaName,areaThemes} from './areas';
import {expeditionQuests} from './expedition-quests';
import {forestQuests} from './forest-quests';
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
 if(s.expedition&&s.seals.size<s.sealGoal){const q=expeditionQuests(s,lang).find(q=>!q.done);return q?`◆ ${q.title} · ${q.direction}`:lang==='id'?`◆ Segel tim ${s.seals.size}/${s.sealGoal} · jelajahi lorong`:`◆ Team seals ${s.seals.size}/${s.sealGoal} · explore the corridors`;}
 if(s.seals.size<s.sealGoal)return lang==='id'?`◆ Cari kristal toska · Segel ${s.seals.size}/${s.sealGoal}`:`◆ Find turquoise crystals · Seals ${s.seals.size}/${s.sealGoal}`;
 if(s.stage==='boss')return lang==='id'?`Kalahkan Raja · Fase ${s.bossPhase}`:`Defeat the King · Phase ${s.bossPhase}`;
 return lang==='id'?'Capai Benteng Raja':'Reach the King Fortress';
}
export function areaInformation(s:AdventureState,lang:'id'|'en'){
 if(s.expedition&&!s.sample){const q=expeditionQuests(s,lang),zone=s.zone,name=zone===0?areaName(s.area,lang):zone>=5?(zone===5?areaThemes[s.area].boss[lang==='id'?0:1]:lang==='id'?'Gerbang Pelarian':'Escape Gate'):q[Math.min(2,Math.max(0,zone-1))].title;return{name,description:zone===5?(lang==='id'?'Hindari serangan. Balas saat pelindung padam.':'Dodge, then counter while the shield is down.'):areaThemes[s.area].hint[lang==='id'?0:1],danger:zone===5?(lang==='id'?'Ekstrem':'Extreme'):(lang==='id'?'Sedang':'Medium'),level:zone===5?4:2};}
 if(s.sample){const names=lang==='id'?['Perkemahan Rimba','Ngarai Toska','Rumah Penjaga Lama','Dataran Lumut','Hutan Kanopi','Arena Raja Rimbun','Gerbang Fajar']:['Forest Camp','Turquoise Gorge','Old Keeper Lodge','Moss Highlands','Canopy Forest','Forest King Arena','Dawn Gate'];return{name:names[s.zone],description:(lang==='id'?['Bekal tersedia di checkpoint. Buka jurnal untuk petunjuk.','Gua berair dangkal tersembunyi di balik tebing tinggi.','Masuk melalui pintu selatan untuk mencari harta.','Naiki tangga dan cari penjaga segel.','Pepohonan tinggi menyembunyikan jalur ke arena.','Hindari serangan, balas ketika pelindung padam.','Capai gerbang sebelum akar menutup jalan.']:['Checkpoint supplies. Open your journal for clues.','A shallow flooded cave lies between towering cliffs.','Enter through the south doorway to find treasure.','Ascend the steps and find the seal guardian.','Tall trees conceal the trail to the arena.','Dodge attacks; counter while the shield is down.','Reach the gate before the roots close in.'])[s.zone],danger:(lang==='id'?['Aman','Sedang','Sedang','Sedang','Tinggi','Ekstrem','Tinggi']:['Safe','Medium','Medium','Medium','High','Extreme','High'])[s.zone],level:s.zone===5?4:s.zone===0?0:2};}
 const i=s.zone,d=zoneDetails[i],levels=lang==='id'?['Aman','Rendah','Sedang','Tinggi','Ekstrem']:['Safe','Low','Medium','High','Extreme'];
 return{name:zones[i][lang==='id'?'idName':'enName'],description:d.description[lang==='id'?0:1],danger:levels[d.danger],level:d.danger};
}
export function nearbyInformation(s:AdventureState,lang:'id'|'en'){
 const near=(p:{x:number;y:number},r=1.7)=>Math.hypot(p.x+.5-s.position.x,p.y+.5-s.position.y)<r;
 if(near(s.layout.maze.finish,2.4))return s.gateOpen?(lang==='id'?'Gerbang terbuka — masuk untuk lolos.':'Gate open — cross to escape.'):(lang==='id'?`Gerbang terkunci: segel ${s.seals.size}/${s.sealGoal} · Raja ${s.bossCleared?'dikalahkan':'belum dikalahkan'}.`:`Gate locked: seals ${s.seals.size}/${s.sealGoal} · King ${s.bossCleared?'defeated':'still guarding'}.`);
 if(s.layout.secret&&near(s.layout.secret)&&!s.broken.has(`${s.layout.secret.x},${s.layout.secret.y}`))return lang==='id'?`Jalur rahasia · perlu 1 kunci (${s.keys} tersedia).`:`Hidden route · needs 1 key (${s.keys} available).`;
 if(s.climber.state.phase==='hanging')return lang==='id'?'Berpegangan · A / arah menuju tepian untuk naik; menjauh untuk turun.':'Hanging · A / move toward the ledge to climb; away to release.';
 if(s.expedition&&s.stage==='boss')return s.bossVulnerable?(lang==='id'?'PELIN­DUNG PADAM — sekarang lempar kue!':'SHIELD DOWN — throw your cakes now!'):(lang==='id'?'Pelindung aktif — hindari buah dan lingkaran serangan.':'Shield active — dodge the fruit and warning circles.');
 if(s.bossRefilling)return lang==='id'?`Bekal arena: +1 kue / 2 detik (maks. 8). ${s.ammo===0?'Hindari serangan sambil menunggu isi ulang.':'Tetap di arena agar kue terisi.'}`:`Arena supplies: +1 cake / 2 seconds (max. 8). ${s.ammo===0?'Dodge while waiting for a refill.':'Stay in the arena to refill.'}`;
 const ledge=s.layout.ledges.find(l=>near(l.point,1.5));if(ledge&&ledge.height>=1.85&&ledge.kind!=='palm'&&!s.climbed.has(ledge.id))return lang==='id'?'Teras tinggi · lompat dua kali untuk meraih tepian, lalu A untuk naik. Bintang ada di atas.':'High terrace · double jump to grab, then A to pull up. A star waits above.';if(ledge)return lang==='id'?(s.climbed.has(ledge.id)?'Tepian sudah dijelajahi.':'Tepian berlumut · A untuk lompat dan pegang, A lagi untuk naik.'):(s.climbed.has(ledge.id)?'Ledge already explored.':'Mossy ledge · A to jump and grab, A again to pull up.');
 const seal=s.layout.seals.findIndex((p,i)=>!s.seals.has(i)&&near(p,1.5));if(seal>=0&&s.expedition&&!s.sealUnlocked(seal))return lang==='id'?`Segel terkunci — ${s.questRemaining(seal).length}/5 penjaga tersisa (3 besar, 2 kecil).`:`Seal locked — ${s.questRemaining(seal).length}/5 keepers remain (3 large, 2 small).`;if(seal>=0)return lang==='id'?`Segel Rimba · dekati untuk mengumpulkan (${s.seals.size}/${s.sealGoal}).`:`Forest Seal · approach to collect (${s.seals.size}/${s.sealGoal}).`;
 const area=s.layout.areas.find(a=>near(a.point,2.2));if(area?.zone===3){const guards=s.guards.filter(g=>!g.dead&&Math.hypot(g.position.x-s.position.x,g.position.y-s.position.y)<6).length;return lang==='id'?`Simpang Perebutan · ${guards} penjaga di sekitar · cari peti dan jalan pintas.`:`Conflict Zone · ${guards} nearby guards · look for treasure and shortcuts.`;}if(area)return areaInformation({...s,zone:area.zone} as AdventureState,lang).description;
 return s.seals.size<s.sealGoal?(lang==='id'?'◆ Segel Rimba = kristal toska melayang. Dekati untuk mengambil. Cari simbol ◆ di area minimap yang sudah ditemukan.':'◆ Forest Seals are floating turquoise crystals. Walk into them to collect. Look for ◆ in discovered minimap areas.'):'';
}
