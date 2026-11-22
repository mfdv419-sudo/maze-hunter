const artworkSize = {width: 768, height: 432};

function waterfall(mask: string, x: number, y: number, width: number, height: number, drift: number,
  seed: number, impact: [number, number]) {
  const clip = new Path2D(mask);
  const threads = Array.from({length: 48}, (_, index) => ({
    x: x + ((index * 31 + seed) % 59) / 59 * width,
    offset: ((index * 19 + seed) % 61) / 61,
    speed: .58 + (index % 7) * .13,
    width: .5 + (index % 5) * .42,
    length: .11 + (index % 6) * .05,
    dark: index % 4 === 0,
  }));
  return {clip, threads, y, height, drift, impact};
}

/** Paint a lightweight overlay in the Forest Grove panorama's image coordinates. */
export function animateLoadingWaterfall(artwork: HTMLImageElement): () => void {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return () => {};
  canvas.setAttribute('aria-hidden', 'true');
  artwork.after(canvas);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const falls = artwork.src.includes('forest-loading.webp') ? [
    waterfall('M 452 170 L 480 170 486 195 480 226 456 246 440 237 442 198 Z',445,171,40,70,-3,3,[462,237]),
    waterfall('M 666 247 L 692 242 698 264 695 310 675 345 658 329 658 274 Z',662,245,37,91,-4,9,[675,341]),
    waterfall('M 286 70 L 300 70 302 96 301 152 292 168 283 157 Z',284,71,16,94,-2,17,[290,164]),
  ] : [
    waterfall('M 657 172 L 710 168 707 185 701 208 688 216 684 231 670 237 646 226 647 213 650 194 652 184 Z',
      654, 171, 55, 62, -16, 3, [667, 228]),
    waterfall('M 620 242 L 665 239 664 258 661 284 659 302 651 314 650 330 637 335 609 333 599 324 599 304 601 279 608 252 Z',
      613, 242, 53, 88, -18, 17, [627, 331]),
  ];

  const mist = document.createElement('canvas');
  mist.width = mist.height = 48;
  const mistPaint = mist.getContext('2d');
  if (mistPaint) {
    const fade = mistPaint.createRadialGradient(24, 24, 2, 24, 24, 24);
    fade.addColorStop(0, '#e8fff1bb');
    fade.addColorStop(.52, '#d7f8eb70');
    fade.addColorStop(1, '#d7f8eb00');
    mistPaint.fillStyle = fade;
    mistPaint.fillRect(0, 0, 48, 48);
  }

  let zoom = 1, left = 0, top = 0;
  function resize() {
    const {width, height} = canvas.getBoundingClientRect();
    const density = Math.min(devicePixelRatio || 1, 1.5);
    const scale = Math.max(width / artworkSize.width, height / artworkSize.height);
    const [x, y] = getComputedStyle(artwork).objectPosition.split(' ').map(value => parseFloat(value) / 100);
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);
    zoom = scale * density;
    left = (width - artworkSize.width * scale) * x * density;
    top = (height - artworkSize.height * scale) * y * density;
  }

  function paint(ctx: CanvasRenderingContext2D, time: number) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(zoom, 0, 0, zoom, left, top);
    ctx.lineCap = 'round';
    for (const fall of falls) {
      ctx.save();
      ctx.clip(fall.clip);
      for (const thread of fall.threads) {
        const phase = (time * thread.speed + thread.offset) % 1.45 - .23;
        const end = phase + thread.length;
        const x = thread.x + fall.drift * phase, y = fall.y + fall.height * phase;
        const endX = thread.x + fall.drift * end, endY = fall.y + fall.height * end;
        const color = thread.dark ? '5, 95, 99' : '232, 255, 244';
        const shine = ctx.createLinearGradient(x, y, endX, endY);
        shine.addColorStop(0, `rgba(${color}, 0)`);
        shine.addColorStop(.42, `rgba(${color}, ${thread.dark ? .20 : .49})`);
        shine.addColorStop(1, `rgba(${color}, 0)`);
        ctx.strokeStyle = shine;
        ctx.lineWidth = thread.width;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo((x + endX) / 2 + .8, (y + endY) / 2, endX, endY);
        ctx.stroke();
      }
      ctx.restore();

      const [x, y] = fall.impact;
      for (let index = 0; index < 13; index++) {
        const life = (time * .82 + index * .127) % 1;
        const spread = ((index * 13) % 23 - 11) * (1 + life * .35);
        const size = 6 + life * 13 + index % 3;
        ctx.globalAlpha = .38 * Math.sin(Math.PI * life);
        ctx.drawImage(mist, x + spread - size / 2, y - life * 13 - size / 2, size * 1.35, size);
      }
      ctx.globalAlpha = 1;
    }
  }

  let frame = 0, lastFrame = -Infinity;
  function animate(now: number) {
    if (now - lastFrame >= 32) {
      lastFrame = now;
      if (context) paint(context, now / 1000);
    }
    frame = requestAnimationFrame(animate);
  }
  function syncMotion() {
    cancelAnimationFrame(frame);
    canvas.hidden = motion.matches;
    if (motion.matches) return;
    resize();
    frame = requestAnimationFrame(animate);
  }

  const observer = new ResizeObserver(() => { if (!motion.matches) resize(); });
  observer.observe(artwork);
  motion.addEventListener('change', syncMotion);
  syncMotion();
  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    motion.removeEventListener('change', syncMotion);
    canvas.remove();
  };
}
