// Entry point. Modes:
//   (default)          interactive player with scrubber and keyboard control
//   ?mode=render       bare 1920×1080 canvas driven by window.__renderFrame(n)
//   ?frame=<n>         show a single deterministic frame (paused)
//   ?t=<seconds>       start playback at a time

import { render } from './render/renderer.js';
import { Q } from './render/draw.js';
import {
  TOTAL,
  FPS,
  WIDTH,
  HEIGHT,
  CHAPTERS,
  TOTAL_FRAMES,
} from './animation/timeline.js';

const params = new URLSearchParams(location.search);
const MODE = params.get('mode') ?? 'play';
const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d', { alpha: false });

async function loadFonts() {
  const faces = [
    new FontFace('Inter', 'url(assets/fonts/Inter.woff2)', {
      weight: '100 900',
    }),
    new FontFace('JetBrains Mono', 'url(assets/fonts/JetBrainsMono.woff2)', {
      weight: '100 800',
    }),
  ];
  await Promise.all(
    faces.map((f) => f.load().then((ff) => document.fonts.add(ff))),
  );
  await document.fonts.ready;
}

function sizeCanvas(scale) {
  canvas.width = Math.round(WIDTH * scale);
  canvas.height = Math.round(HEIGHT * scale);
}

async function boot() {
  await loadFonts();
  if (MODE === 'render') {
    document.body.classList.add('render');
    sizeCanvas(1);
    window.__meta = {
      fps: FPS,
      total: TOTAL,
      frames: TOTAL_FRAMES,
      width: WIDTH,
      height: HEIGHT,
    };
    window.__renderFrame = (n, fps = FPS) => {
      render(ctx, n / fps);
      return true;
    };
    window.__renderTime = (t) => {
      render(ctx, t);
      return true;
    };
    render(ctx, 0);
    window.__ready = true;
    return;
  }
  sizeCanvas(1);
  startPlayer();
}

function startPlayer() {
  const scrub = document.getElementById('scrub');
  const fill = document.getElementById('fill');
  const clock = document.getElementById('clock');
  const marks = document.getElementById('marks');
  const ui = document.getElementById('ui');
  for (const c of CHAPTERS) {
    const m = document.createElement('button');
    m.className = 'mark';
    m.style.left = `${(c.start / TOTAL) * 100}%`;
    m.title = c.label;
    m.onclick = (e) => {
      e.stopPropagation();
      seek(c.start);
    };
    marks.appendChild(m);
  }
  const frameParam = params.get('frame');
  let playing = frameParam === null;
  let t =
    frameParam !== null
      ? Number(frameParam) / FPS
      : Number(params.get('t') ?? 0);
  let last = performance.now();
  const seek = (v) => {
    t = Math.max(0, Math.min(TOTAL, v));
  };

  scrub.addEventListener('pointerdown', (e) => {
    const move = (ev) => {
      const r = scrub.getBoundingClientRect();
      seek(((ev.clientX - r.left) / r.width) * TOTAL);
    };
    move(e);
    window.addEventListener('pointermove', move);
    window.addEventListener(
      'pointerup',
      () => window.removeEventListener('pointermove', move),
      { once: true },
    );
  });
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      playing = !playing;
      e.preventDefault();
    }
    if (e.code === 'ArrowRight') seek(t + (e.shiftKey ? 1 / FPS : 1));
    if (e.code === 'ArrowLeft') seek(t - (e.shiftKey ? 1 / FPS : 1));
    if (e.code === 'Home') seek(0);
    if (e.code === 'KeyH') ui.classList.toggle('hidden');
  });
  canvas.addEventListener('click', () => {
    playing = !playing;
  });
  let idle;
  window.addEventListener('pointermove', () => {
    ui.classList.add('show');
    clearTimeout(idle);
    idle = setTimeout(() => ui.classList.remove('show'), 1800);
  });

  // Adaptive quality: if the device can't sustain ~50 fps, drop soft shadows.
  let slow = 0;
  function tick(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (playing && Q.shadows) {
      slow = dt > 0.024 ? slow + 1 : Math.max(0, slow - 1);
      if (slow > 45) Q.shadows = false;
    }
    if (playing) {
      t += dt;
      if (t > TOTAL + 1) t = 0;
    }
    render(ctx, Math.min(t, TOTAL));
    fill.style.width = `${(Math.min(t, TOTAL) / TOTAL) * 100}%`;
    clock.textContent = `${t.toFixed(2).padStart(5, '0')}s · f${Math.round(t * FPS)}`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

boot();
