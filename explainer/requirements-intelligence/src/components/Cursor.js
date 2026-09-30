// Pointer with press state and click ripple.

import { C, rgba } from '../render/draw.js';
import { clamp, seg, E } from '../animation/easing.js';

/** clickAt: global time of the click (for ripple / press). */
export function drawCursor(ctx, x, y, t, o = {}) {
  const { alpha = 1, clickAt = -99, color = C.cyan } = o;
  if (alpha <= 0.002) return;
  const rp = seg(t, clickAt, clickAt + 0.6);
  if (rp > 0 && rp < 1) {
    ctx.save();
    ctx.globalAlpha *= alpha * (1 - rp);
    ctx.strokeStyle = rgba(color, 0.9);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 8 + E.outCubic(rp) * 38, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = rgba(color, 0.12);
    ctx.fill();
    ctx.restore();
  }
  const press = 1 - 0.12 * Math.sin(clamp((t - clickAt) / 0.18) * Math.PI);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.scale(press * 1.15, press * 1.15);
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  const p = new Path2D(
    'M0 0 L0 22 L5.5 16.8 L9.4 25.6 L13 24 L9.2 15.4 L16.6 15.4 Z',
  );
  ctx.fillStyle = '#ffffff';
  ctx.fill(p);
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = '#0b1020';
  ctx.lineWidth = 1.4;
  ctx.stroke(p);
  ctx.restore();
}

/** Cursor path helper: eased travel between waypoints [{t, x, y}]. */
export function cursorPos(t, keys) {
  if (t <= keys[0].t) return { x: keys[0].x, y: keys[0].y };
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1],
      b = keys[i];
    if (t <= b.t) {
      const p = E.inOutCubic((t - a.t) / (b.t - a.t));
      // slight arc for natural hand motion
      const arc = Math.sin(p * Math.PI) * 30;
      return { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p - arc };
    }
  }
  const l = keys[keys.length - 1];
  return { x: l.x, y: l.y };
}
