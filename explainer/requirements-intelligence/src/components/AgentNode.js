// A coordinated technical service in the AI orchestration layer.

import {
  C,
  glass,
  text,
  iconTile,
  rgba,
  rr,
  spinner,
  checkCircle,
} from '../render/draw.js';

/** state: 'idle' | 'running' | 'done'. R = rect. */
export function drawAgentNode(ctx, R, o = {}) {
  const {
    alpha = 1,
    label = '',
    sub = '',
    iconName = 'agent',
    color = C.cyan,
    active = 0,
    state = 'idle',
    progress = 0,
    t = 0,
    big = false,
  } = o;
  if (alpha <= 0.002) return;
  glass(ctx, R, {
    alpha,
    tint: color,
    tintA: 0.08 + 0.14 * active,
    glow: active * 0.8,
    glowColor: color,
    border: 0.14 + active * 0.1,
  });
  ctx.save();
  ctx.globalAlpha *= alpha;
  const tile = big ? 52 : 40;
  iconTile(
    ctx,
    iconName,
    R.x + 18 + tile / 2,
    R.y + R.h / 2,
    tile,
    color,
    1,
    0.14 + 0.1 * active,
  );
  const lx = R.x + 30 + tile;
  if (sub) {
    text(ctx, label, lx, R.y + R.h / 2 - 11, {
      size: big ? 19.5 : 18,
      weight: 650,
    });
    text(ctx, sub, lx, R.y + R.h / 2 + 14, {
      size: 13,
      mono: true,
      color: C.text3,
    });
  } else
    text(ctx, label, lx, R.y + R.h / 2, { size: big ? 22 : 18, weight: 650 });
  const sx = R.x + R.w - 26,
    sy = R.y + R.h / 2;
  if (state === 'running') spinner(ctx, sx, sy, 9, t, color);
  else if (state === 'done') checkCircle(ctx, sx, sy, 10, 1, C.green);
  else {
    ctx.beginPath();
    ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fill();
  }
  if (progress > 0 && progress < 1) {
    rr(ctx, R.x + 14, R.y + R.h - 6, (R.w - 28) * progress, 2.5, 1.2);
    ctx.fillStyle = rgba(color, 0.9);
    ctx.fill();
  }
  ctx.restore();
}
