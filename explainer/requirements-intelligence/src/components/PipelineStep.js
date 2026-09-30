// A step in the engineering execution pipeline.

import { C, text, rgba, icon, softGlow, checkCircle } from '../render/draw.js';
import { E, clamp } from '../animation/easing.js';

/** state progress: 0 idle, 0..1 active, 1 done. */
export function drawPipelineStep(ctx, x, y, o = {}) {
  const {
    alpha = 1,
    appear = 1,
    active = 0,
    done = 0,
    iconName = 'agent',
    label = '',
    sub = '',
    color = C.cyan,
    r = 38,
  } = o;
  if (alpha <= 0.002 || appear <= 0) return;
  const s = E.outBack(clamp(appear));
  ctx.save();
  ctx.globalAlpha *= alpha * clamp(appear * 2);
  softGlow(ctx, x, y, r * 2.6, color, 0.08 + 0.3 * active);
  ctx.beginPath();
  ctx.arc(x, y, r * s, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.5, 0, x, y, r * s);
  g.addColorStop(0, rgba(color, 0.2 + 0.2 * active));
  g.addColorStop(1, 'rgba(12,17,33,0.95)');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = rgba(
    done > 0.5 ? C.green : color,
    0.4 + 0.6 * Math.max(active, done),
  );
  ctx.lineWidth = 1.8;
  ctx.stroke();
  icon(ctx, iconName, x, y, r * 0.85 * s, done > 0.5 ? mixDone(color) : color);
  if (done > 0) checkCircle(ctx, x + r * 0.72, y - r * 0.72, 10, done, C.green);
  text(ctx, label, x, y + r + 26, { size: 19, weight: 650, align: 'center' });
  if (sub)
    text(ctx, sub, x, y + r + 50, {
      size: 14,
      mono: true,
      color: C.text3,
      align: 'center',
    });
  ctx.restore();
}
const mixDone = (c) => c;
