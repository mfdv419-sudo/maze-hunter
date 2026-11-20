import {forestIcon} from './forest-icons';
import {animateLoadingWaterfall} from './loading-waterfall';

interface ArenaLoadingOptions {
  title: string;
  mode: string;
  artwork: string;
  english: boolean;
  waterfall?: boolean;
}

let dismissActive: (() => void) | undefined;

export function dismissArenaLoading() {
  dismissActive?.();
}

/** Wait for a paint when visible. A background tab may suspend animation frames. */
function afterPaint(): Promise<void> {
  if (document.hidden) return Promise.resolve();
  return new Promise(resolve => {
    const finish = () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', onVisibility);
      resolve();
    };
    const onVisibility = () => { if (document.hidden) finish(); };
    let frame = requestAnimationFrame(() => { frame = requestAnimationFrame(finish); });
    document.addEventListener('visibilitychange', onVisibility);
  });
}

export function startArenaLoading(root: HTMLElement, options: ArenaLoadingOptions) {
  dismissArenaLoading();
  const {english} = options;
  const overlay = document.createElement('section');
  overlay.className = 'arena-loading';
  overlay.id = 'arena-loading';
  overlay.hidden = true;
  overlay.toggleAttribute('data-waterfall', !!options.waterfall);
  overlay.setAttribute('aria-labelledby', 'arena-loading-title');
  overlay.innerHTML = `
    <img alt="">
    <div class="arena-loading__shade" aria-hidden="true"></div>
    <div class="arena-loading__layout">
      <div class="arena-loading__brand">${forestIcon('maze')} MAZE HUNTER</div>
      <div class="arena-loading__content">
        <p class="arena-loading__mode"></p>
        <h1 id="arena-loading-title"></h1>
        <div class="arena-loading__reading">
          <span role="status"></span><span class="arena-loading__percent" aria-hidden="true"></span>
        </div>
        <progress max="100"></progress>
      </div>
    </div>`;

  const artwork = overlay.querySelector('img')!;
  artwork.src = options.artwork;
  overlay.querySelector('h1')!.textContent = options.title;
  overlay.querySelector('.arena-loading__mode')!.textContent = options.mode;
  const status = overlay.querySelector('[role="status"]')!;
  const percent = overlay.querySelector('.arena-loading__percent')!;
  const progress = overlay.querySelector('progress')!;
  progress.setAttribute('aria-label', english ? 'Arena loading progress' : 'Progres memuat arena');

  const previousInert = root.inert;
  const previousBusy = root.getAttribute('aria-busy');
  root.inert = true;
  root.setAttribute('aria-busy', 'true');
  document.body.append(overlay);
  let stopMotion: (() => void) | undefined;
  let closed = false;

  function show() {
    if (closed || !overlay.hidden) return;
    overlay.hidden = false;
    if (options.waterfall) stopMotion = animateLoadingWaterfall(artwork);
  }

  const reveal = window.setTimeout(show, 160);
  function dismiss() {
    if (closed) return;
    closed = true;
    window.clearTimeout(reveal);
    stopMotion?.();
    overlay.remove();
    root.inert = previousInert;
    if (previousBusy === null) root.removeAttribute('aria-busy');
    else root.setAttribute('aria-busy', previousBusy);
    if (dismissActive === dismiss) dismissActive = undefined;
  }
  dismissActive = dismiss;

  function update(value: number, label: string) {
    if (closed) return;
    progress.value = value;
    percent.textContent = value + '%';
    status.textContent = label;
  }

  update(0, english ? 'Loading game assets…' : 'Memuat aset game…');
  return {
    async prepare(renderWorld: boolean) {
      if (closed) return;
      update(35, english ? 'Preparing the arena…' : 'Menyiapkan arena…');
      // Three.js builds terrain synchronously. Paint the screen before that work
      // even if the engine module has already been cached.
      if (renderWorld) show();
      if (!overlay.hidden) await afterPaint();
    },
    rendering() {
      update(75, english ? 'Rendering the arena…' : 'Menampilkan arena…');
    },
    finish() {
      if (closed) return;
      update(100, english ? 'Arena ready' : 'Arena siap');
      if (overlay.hidden) dismiss();
      else void afterPaint().then(dismiss);
    },
    dismiss,
  };
}
