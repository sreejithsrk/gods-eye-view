// Deep, layered background: gradient field, drifting colour light, a quiet
// intelligent network (parallax), and a perspective dot floor.

import { C, rgba, softGlow } from '../render/draw.js';
import { rng, clamp, fract } from '../animation/easing.js';
import { WIDTH as W, HEIGHT as H } from '../animation/timeline.js';

const r = rng(42);
const NODES = Array.from({ length: 84 }, () => ({
  x: -160 + r() * (W + 320),
  y: -120 + r() * (H + 240),
  ax: 10 + r() * 26,
  ay: 8 + r() * 22,
  f: 0.05 + r() * 0.12,
  ph: r() * Math.PI * 2,
  z: 0.35 + r() * 0.65,
  born: r(),
}));

let noise = null;
function grain() {
  if (noise) return noise;
  noise = document.createElement('canvas');
  noise.width = noise.height = 256;
  const g = noise.getContext('2d');
  const img = g.createImageData(256, 256);
  const rr = rng(7);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (rr() - 0.5) * 70;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return noise;
}

// Static layers are baked once. The colour light is baked into an
// oversized base that drifts by offset, so each frame costs one blit.
let base = null,
  overlay = null;
const PAD = 120;
function baseLayer() {
  if (base) return base;
  base = document.createElement('canvas');
  base.width = W + PAD * 2;
  base.height = H + PAD * 2;
  const g = base.getContext('2d');
  const lg = g.createLinearGradient(0, 0, 0, base.height);
  lg.addColorStop(0, C.bg1);
  lg.addColorStop(1, C.bg0);
  g.fillStyle = lg;
  g.fillRect(0, 0, base.width, base.height);
  g.translate(PAD, PAD);
  softGlow(g, 380, 180, 900, C.indigo, 0.12);
  softGlow(g, 1560, 900, 820, C.cyan, 0.07);
  softGlow(g, 1100, 520, 700, C.violet, 0.035);
  return base;
}

export function drawBackdrop(ctx, t) {
  const a = clamp(t / 2.5);
  ctx.fillStyle = C.bg0;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.globalAlpha = 0.35 + 0.65 * a;
  ctx.drawImage(
    baseLayer(),
    -PAD + 70 * Math.sin(t * 0.08),
    -PAD + 45 * Math.cos(t * 0.1),
  );
  ctx.restore();
}

/** The network layer. `k` is 0..1 intensity, `cam` is the global camera. */
export function drawNetwork(ctx, t, k, cam) {
  if (k <= 0.01) return;
  const pts = NODES.map((n, i) => {
    const appear = clamp((t - n.born * 1.6) / 0.8);
    const px = (cam.x - W / 2) * (1 - n.z) * 0.6;
    const py = (cam.y - H / 2) * (1 - n.z) * 0.6;
    return {
      x: n.x + Math.sin(t * n.f + n.ph) * n.ax - px,
      y: n.y + Math.cos(t * n.f * 0.8 + n.ph) * n.ay - py,
      z: n.z,
      a: appear,
      i,
    };
  });
  ctx.save();
  ctx.lineWidth = 1;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    for (let j = i + 1; j < pts.length; j++) {
      const q = pts[j];
      const dx = p.x - q.x,
        dy = p.y - q.y;
      const d2 = dx * dx + dy * dy;
      if (d2 > 220 * 220) continue;
      const d = Math.sqrt(d2);
      const al =
        (1 - d / 220) * 0.16 * k * Math.min(p.a, q.a) * (p.z + q.z) * 0.5;
      if (al < 0.004) continue;
      ctx.strokeStyle = rgba(C.indigo, al);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(q.x, q.y);
      ctx.stroke();
      // Occasional signal pulse along a connection.
      const s = fract(t * 0.18 + (i * 31 + j * 17) * 0.013);
      if ((i + j) % 9 === 0 && s < 0.5) {
        const u = s / 0.5;
        ctx.fillStyle = rgba(C.cyan, al * 3.2 * Math.sin(u * Math.PI));
        ctx.beginPath();
        ctx.arc(
          p.x + (q.x - p.x) * u,
          p.y + (q.y - p.y) * u,
          1.6,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }
  }
  for (const p of pts) {
    ctx.fillStyle = rgba(
      p.i % 7 === 0 ? C.cyan : '#a8b4ff',
      0.5 * k * p.a * p.z,
    );
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.1 + p.z * 1.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Perspective dot floor, gives depth under architecture-style views. */
export function drawFloor(ctx, t, k) {
  if (k <= 0.01) return;
  ctx.save();
  const horizon = 600,
    vx = W / 2;
  for (let row = 0; row < 16; row++) {
    const z = fract(row / 16 + t * 0.02);
    const y = horizon + Math.pow(z, 2.2) * 560;
    const spread = 0.25 + Math.pow(z, 2.2) * 3.2;
    const a = k * 0.22 * z;
    ctx.fillStyle = rgba('#8ea2ff', a);
    for (let c = -14; c <= 14; c++) {
      const x = vx + c * 70 * spread;
      if (x < -20 || x > W + 20) continue;
      ctx.beginPath();
      ctx.arc(x, y, 0.8 + z * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

let grainLayer = null;
export function drawVignette(ctx) {
  if (!overlay) {
    overlay = document.createElement('canvas');
    overlay.width = W;
    overlay.height = H;
    const g = overlay.getContext('2d');
    const rg = g.createRadialGradient(
      W / 2,
      H / 2,
      H * 0.35,
      W / 2,
      H / 2,
      H * 1.05,
    );
    rg.addColorStop(0, 'rgba(0,0,0,0)');
    rg.addColorStop(1, 'rgba(0,0,0,0.55)');
    g.fillStyle = rg;
    g.fillRect(0, 0, W, H);
    // Static grain tile (identical every frame) to break up gradient banding:
    // light and dark speckles at a few percent opacity.
    const n = grain();
    const src = n.getContext('2d').getImageData(0, 0, 256, 256);
    grainLayer = document.createElement('canvas');
    grainLayer.width = grainLayer.height = 256;
    const gg = grainLayer.getContext('2d');
    const out = gg.createImageData(256, 256);
    for (let i = 0; i < src.data.length; i += 4) {
      const v = src.data[i] - 128;
      const c = v > 0 ? 255 : 0;
      out.data[i] = out.data[i + 1] = out.data[i + 2] = c;
      out.data[i + 3] = Math.round(Math.abs(v) * 0.16);
    }
    gg.putImageData(out, 0, 0);
    const pat = g.createPattern(grainLayer, 'repeat');
    g.fillStyle = pat;
    g.fillRect(0, 0, W, H);
  }
  ctx.drawImage(overlay, 0, 0);
}
