// Shape-level transitions used to morph one conceptual object into the next.

import { lerp, clamp } from './easing.js';

export const rect = (x, y, w, h, r = 16) => ({ x, y, w, h, r });
export const centerRect = (cx, cy, w, h, r = 16) => ({
  x: cx - w / 2,
  y: cy - h / 2,
  w,
  h,
  r,
});
export const cx = (R) => R.x + R.w / 2;
export const cy = (R) => R.y + R.h / 2;

/** Interpolate position, size and corner radius between two rects. */
export function morphRect(a, b, p) {
  return {
    x: lerp(a.x, b.x, p),
    y: lerp(a.y, b.y, p),
    w: lerp(a.w, b.w, p),
    h: lerp(a.h, b.h, p),
    r: lerp(a.r ?? 16, b.r ?? 16, p),
  };
}

export const lerpPt = (a, b, p) => ({
  x: lerp(a.x, b.x, p),
  y: lerp(a.y, b.y, p),
});

/** Point on a quadratic arc from a to b, bowed by `bend` px perpendicular. */
export function arcPt(a, b, p, bend = 120) {
  const mx = (a.x + b.x) / 2,
    my = (a.y + b.y) / 2;
  const dx = b.x - a.x,
    dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const c = { x: mx - (dy / len) * bend, y: my + (dx / len) * bend };
  const q = 1 - p;
  return {
    x: q * q * a.x + 2 * q * p * c.x + p * p * b.x,
    y: q * q * a.y + 2 * q * p * c.y + p * p * b.y,
  };
}

/**
 * Masked reveal: clip drawing to a rect whose visible extent grows with p.
 * dir: 'left' | 'right' | 'up' | 'down' | 'center'.
 */
export function withMask(ctx, R, p, dir, draw) {
  p = clamp(p);
  if (p <= 0) return;
  ctx.save();
  ctx.beginPath();
  const pad = 40;
  if (dir === 'left')
    ctx.rect(R.x - pad, R.y - pad, (R.w + pad * 2) * p, R.h + pad * 2);
  else if (dir === 'right')
    ctx.rect(
      R.x + R.w + pad - (R.w + pad * 2) * p,
      R.y - pad,
      (R.w + pad * 2) * p,
      R.h + pad * 2,
    );
  else if (dir === 'down')
    ctx.rect(R.x - pad, R.y - pad, R.w + pad * 2, (R.h + pad * 2) * p);
  else if (dir === 'up')
    ctx.rect(
      R.x - pad,
      R.y + R.h + pad - (R.h + pad * 2) * p,
      R.w + pad * 2,
      (R.h + pad * 2) * p,
    );
  else {
    const w = (R.w + pad * 2) * p,
      h = (R.h + pad * 2) * p;
    ctx.rect(R.x + R.w / 2 - w / 2, R.y + R.h / 2 - h / 2, w, h);
  }
  ctx.clip();
  draw();
  ctx.restore();
}

/** Scale a drawing around (ox, oy). */
export function withScale(ctx, ox, oy, s, draw) {
  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(s, s);
  ctx.translate(-ox, -oy);
  draw();
  ctx.restore();
}

export function withAlpha(ctx, a, draw) {
  if (a <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= clamp(a);
  draw();
  ctx.restore();
}
