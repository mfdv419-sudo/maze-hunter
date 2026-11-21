import {adventureAreas, areaName, areaSize, type AdventureArea} from '../game/areas';
import type {Difficulty} from '../game/maze';
import {roomCapacity} from '../game/adventure-room';
import {canEnterForestWorld, forestStageLabel, forestStages, type forestEquipment, type ForestWorldDifficulty} from '../game/forest-progression';
import {forestIcon} from './forest-icons';

export const expeditionDifficulties = ['easy', 'medium', 'hard', 'extreme'] as const;
export const expandedDifficulties = ['hard', 'extreme'] as const;
const difficultyIcons = {easy: 'sprout', medium: 'signpost', hard: 'mountain', extreme: 'flame'};
const thumbnail = (area: AdventureArea) => `/adventure/${area}.webp`;

export function adventureBackdrop(area: AdventureArea, expanded?: ForestWorldDifficulty) {
  return expanded&&area==='forest' ? `/adventure/forest-expanded-${expanded}.webp`
    : area === 'forest' ? '/adventure/forest-panorama.webp' : thumbnail(area);
}

export function expeditionPicker(
  area: AdventureArea, difficulty: Difficulty, lang: 'id' | 'en',
  expanded: ForestWorldDifficulty | undefined, rank: number, gear: ReturnType<typeof forestEquipment>,
 reviewer=false,areaUnlocked=true,canEnterArea:(area:AdventureArea)=>boolean=()=>true,
) {
  const text = (id: string, en: string) => lang === 'id' ? id : en;
  const label = areaName(area, lang);
  const size = areaSize(area, difficulty);
  const preview = adventureBackdrop(area, expanded);
  const ready = areaUnlocked && (!expanded || reviewer || canEnterForestWorld(rank, expanded));
  const next = forestStages[rank];
  const expandedHint = reviewer ? text('Akses review · semua tingkat terbuka tanpa mengubah hadiah progres.', 'Review access · all stages available without modifying progress rewards.') : expanded === 'hard'
    ? (ready ? (area==='forest'?text('Jembatan hutan, air terjun, dan jalur gua.', 'Forest bridges, waterfalls, and cavern trails.'):'147 × 147')
      : text('Selesaikan Easy, Medium, Hard, dan Extreme di Solo untuk membuka Expanded Hard.', 'Clear Easy, Medium, Hard, and Extreme in Solo to unlock Expanded Hard.'))
    : (ready ? (area==='forest'?text('Jalur kanopi dan pulau terapung.', 'Canopy trails and floating islands.'):'165 × 165')
      : text('Selesaikan Expanded Hard untuk membuka Expanded Extreme.', 'Clear Expanded Hard to unlock Expanded Extreme.'));
  const action = (id: string, name: string, icon: string, disabled = false) =>
    `<button type="button" class="expedition-action" id="${id}" ${disabled ? 'disabled' : ''}>${forestIcon(icon)}<span>${name}</span></button>`;

  return `<main class="adventure-select" aria-labelledby="expedition-title">
    <section class="adventure-poster" data-area="${area}" ${expanded ? `data-expanded="${expanded}"` : ''} aria-labelledby="expedition-title">
      <img id="adventure-preview" src="${preview}" alt="" fetchpriority="high">
      <div class="poster-copy">
        <div class="expedition-kicker">${expanded ? 'Adventure / Expanded World' : 'Adventure'}</div>
        <h1 id="expedition-title">${label}</h1>
        <ul class="picker-objectives" aria-label="${text('Tujuan Adventure', 'Adventure objectives')}">
          <li>${forestIcon('gem')}${text('Cari segel', 'Find seals')}</li>
          <li>${forestIcon('crown')}${text('Hadapi Raja', 'Face the King')}</li>
          <li>${forestIcon('door')}${text('Temukan gerbang', 'Find the gate')}</li>
        </ul>
      </div>
      <button type="button" id="setup-guide" class="expedition-guide" aria-label="${text('Panduan Adventure', 'Adventure guide')}" title="${text('Panduan Adventure', 'Adventure guide')}">${forestIcon('help')}</button>
    </section>
    <section class="expedition-picker" aria-label="${text('Pilihan ekspedisi', 'Expedition selection')}">
      <div>
        <h2 id="expedition-area-title">${text('Pilih arena', 'Choose a world')}</h2>
        <div class="area-options" role="group" aria-labelledby="expedition-area-title">
          ${adventureAreas.map(option => `<button type="button" id="area-${option}" class="area-option" aria-pressed="${area === option}" data-unlocked="${canEnterArea(option)}">
            <img src="${thumbnail(option)}" alt="" decoding="async">
            <span class="area-mark" aria-hidden="true">${forestIcon(canEnterArea(option)?'check':'lock')}</span><b>${areaName(option, lang)}</b>
          </button>`).join('')}
        </div>
      </div>
      <div class="difficulty-block">
        <div class="difficulty-heading">
          <h2 id="expedition-difficulty-title">${text('Tingkat', 'Difficulty')}</h2>
          ${expanded ? '' : `<span class="poster-chip">${size} × ${size}<span class="expedition-capacity"> · ${roomCapacity[difficulty]} ${text('pemain online maks.', 'players online max.')}</span></span>`}
        </div>
        <div class="expedition-difficulty" role="group" aria-labelledby="expedition-difficulty-title">
          ${expeditionDifficulties.map(option => `<button type="button" id="difficulty-${option}" aria-pressed="${!expanded && difficulty === option}">
            ${forestIcon(difficultyIcons[option])}<span>${option}</span>
          </button>`).join('')}
          ${area !== 'classic' ? `<button type="button" id="forest-world-open" aria-expanded="${!!expanded}" aria-controls="forest-world-options">
            ${forestIcon('map')}<span>Expanded World</span>${forestIcon('chevron-down')}
          </button>` : ''}
        </div>
        ${area !== 'classic' ? `<section id="forest-world-options" class="forest-world-options" aria-label="${label} · Expanded World" ${expanded ? '' : 'hidden'}>
          <div class="forest-world-modes" role="group" aria-label="${text('Tingkat Expanded World', 'Expanded World difficulty')}">
            ${expandedDifficulties.map(mode => `<button type="button" id="forest-world-${mode}" aria-pressed="${mode === expanded}">
              ${forestIcon(reviewer||canEnterForestWorld(rank, mode) ? difficultyIcons[mode] : 'lock')}
              <span>${mode}</span>
              ${reviewer||canEnterForestWorld(rank, mode) ? '' : `<span class="expedition-sr-only"> · ${text('Terkunci', 'Locked')}</span>`}
            </button>`).join('')}
            <span class="forest-world-progress" title="${next ? forestStageLabel[next] : ''}">${text('Progres', 'Progress')} ${rank}/${forestStages.length} · Solo</span>
          </div>
          <p id="expanded-status" aria-live="polite">${expandedHint}</p>
          ${gear.length ? `<details class="forest-earned-gear"><summary>${text('Perlengkapan', 'Equipment')}</summary>
            <ul>${gear.map(item => `<li><b>${item.name}</b> · ${item.benefit[lang === 'id' ? 0 : 1]}</li>`).join('')}</ul>
          </details>` : ''}
        </section>` : ''}
      </div>
      ${!areaUnlocked ? `<p class="expedition-area-locked" role="status">${text('Arena terkunci · selesaikan empat tahap Solo di arena sebelumnya untuk membuka.', 'World locked · clear the four Solo stages in the previous world to unlock.')}</p>`:''}
      <div class="expedition-actions">
        ${action('explore-area', text('Main Solo', 'Play Solo'), 'play', !ready)}
        ${action('online-menu', 'Online', 'users', !!expanded || !areaUnlocked)}
        ${action('practice-area', text('Latihan Kontrol', 'Practice Controls'), 'gamepad')}
      </div>
    </section>
  </main>`;
}
