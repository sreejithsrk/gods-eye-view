// A retrieved knowledge item (chunk) with its source and relevance score.

import { C, glass, text, iconTile, rgba, rr } from '../render/draw.js';

export function drawKnowledgeCard(ctx, R, item, o = {}) {
  const { alpha = 1, highlight = 0 } = o;
  if (alpha <= 0.002) return;
  glass(ctx, R, {
    alpha,
    tint: item.color ?? C.cyan,
    tintA: 0.1 + 0.1 * highlight,
    glow: highlight * 0.6,
    glowColor: item.color ?? C.cyan,
    border: 0.13,
  });
  ctx.save();
  ctx.globalAlpha *= alpha;
  iconTile(ctx, item.icon, R.x + 30, R.y + R.h / 2, 34, item.color ?? C.cyan);
  text(ctx, item.title, R.x + 58, R.y + R.h / 2 - 10, {
    size: 18,
    weight: 650,
  });
  text(ctx, item.source, R.x + 58, R.y + R.h / 2 + 13, {
    size: 13,
    mono: true,
    color: C.text3,
  });
  if (item.score) {
    const sx = R.x + R.w - 20;
    text(ctx, item.score.toFixed(2), sx, R.y + R.h / 2 - 7, {
      size: 14,
      mono: true,
      color: C.green,
      align: 'right',
      weight: 600,
    });
    rr(ctx, sx - 48, R.y + R.h / 2 + 9, 48, 3, 1.5);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fill();
    rr(ctx, sx - 48, R.y + R.h / 2 + 9, 48 * item.score, 3, 1.5);
    ctx.fillStyle = rgba(C.green, 0.85);
    ctx.fill();
  }
  ctx.restore();
}
