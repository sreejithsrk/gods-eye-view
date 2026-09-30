// Circular graph node with icon, label and optional mono sub-label.

import { C, text, rgba, icon, softGlow } from '../render/draw.js';

export function drawNode(ctx, x, y, r, o = {}) {
  const {
    alpha = 1,
    scale = 1,
    color = C.cyan,
    iconName = null,
    label = '',
    sub = '',
    active = 0,
    labelSize = 19,
    labelBelow = true,
  } = o;
  if (alpha <= 0.002 || scale <= 0.01) return;
  const rr_ = r * scale;
  ctx.save();
  ctx.globalAlpha *= alpha;
  softGlow(ctx, x, y, rr_ * 2.4, color, 0.18 + 0.25 * active);
  const g = ctx.createRadialGradient(
    x - rr_ * 0.4,
    y - rr_ * 0.5,
    0,
    x,
    y,
    rr_,
  );
  g.addColorStop(0, rgba(color, 0.32));
  g.addColorStop(1, 'rgba(12,17,33,0.92)');
  ctx.beginPath();
  ctx.arc(x, y, rr_, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = rgba(color, 0.55 + 0.4 * active);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  if (iconName) icon(ctx, iconName, x, y, rr_ * 0.9, color);
  if (label && labelBelow) {
    text(ctx, label, x, y + rr_ + 24, {
      size: labelSize,
      weight: 600,
      align: 'center',
      alpha: Math.min(1, scale),
    });
    if (sub)
      text(ctx, sub, x, y + rr_ + 50, {
        size: 14,
        mono: true,
        color: C.text3,
        align: 'center',
        alpha: Math.min(1, scale),
      });
  }
  ctx.restore();
}
