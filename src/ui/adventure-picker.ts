import {adventureAreas,areaName,areaSize,areaThemes,type AdventureArea} from '../game/areas';
import type {Difficulty} from '../game/maze';
import {roomCapacity} from '../game/adventure-room';
import {screenArt} from '../game/screen-art';
import {forestIcon} from './forest-icons';

export const expeditionDifficulties = ['easy','medium','hard','extreme'] as const;

export function expeditionPicker(area:AdventureArea, difficulty:Difficulty, lang:'id'|'en') {
 const text = (id:string,en:string) => lang === 'id' ? id : en;
 const theme = areaThemes[area];
 const size = areaSize(area,difficulty);
 const label = areaName(area,lang);
 const action = (id:string,name:string,icon:string) => `<button type="button" class="expedition-action" id="${id}">${forestIcon(icon)}<span>${name}</span></button>`;

 return `<main class="adventure-select" aria-labelledby="expedition-title">
  <section class="adventure-poster" aria-labelledby="expedition-area">
   <div id="adventure-preview" aria-hidden="true" style="background-image:url('${screenArt(area)}')"></div>
   <div class="poster-copy">
    <span class="poster-chip">${forestIcon('compass')}${label} · ${size} × ${size}</span>
    <h2 id="expedition-area">${label}</h2>
    <p>${theme.hint[lang === 'id' ? 0 : 1]}</p>
   </div>
  </section>
  <section class="expedition-picker">
   <div class="picker-heading">
    <div><span class="expedition-kicker">ADVENTURE</span><h1 id="expedition-title">${text('Pilih dunia','Choose a world')}</h1></div>
    <button type="button" id="setup-guide" class="expedition-guide" aria-label="${text('Panduan Adventure','Adventure guide')}" title="${text('Panduan Adventure','Adventure guide')}">${forestIcon('help')}</button>
   </div>
   <div class="area-options" role="group" aria-label="${text('Pilihan dunia','World selection')}">
    ${adventureAreas.map((option,index) => `<button type="button" id="area-${option}" class="area-option" aria-pressed="${area === option}" style="--area-art:url('${screenArt(option,index)}')">
     <span class="area-mark" aria-hidden="true">${forestIcon('check')}</span><b>${areaName(option,lang)}</b>
    </button>`).join('')}
   </div>
   <div class="difficulty-block">
    <div class="difficulty-heading">
     <h2 id="expedition-difficulty-title">${text('Kesulitan','Difficulty')}</h2>
     <span>${forestIcon('users')}${roomCapacity[difficulty]} ${text('pemain online maks.','players online max.')}</span>
    </div>
    <div class="expedition-difficulty" role="group" aria-labelledby="expedition-difficulty-title">
     ${expeditionDifficulties.map(option => `<button type="button" id="difficulty-${option}" aria-pressed="${difficulty === option}">${option}</button>`).join('')}
    </div>
   </div>
   <div class="expedition-actions">
    ${action('explore-area',text('Main Solo','Play Solo'),'play')}
    <div class="expedition-secondary-actions">
     ${action('online-menu','Online','users')}
     ${action('practice-area',text('Latihan','Practice'),'gamepad')}
     ${area === 'forest' ? action('forest-world-open','Expanded World','compass') : ''}
    </div>
   </div>
  </section>
 </main>`;
}
