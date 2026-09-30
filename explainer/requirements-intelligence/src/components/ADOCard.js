// Azure DevOps work item card. Type colours follow ADO conventions.

import { C, glass, text, rr } from '../render/draw.js';
import { scramble } from '../render/draw.js';

export const ADO_TYPES = {
  EPIC: { color: C.orange, label: 'EPIC' },
  FEATURE: { color: C.violet, label: 'FEATURE' },
  STORY: { color: C.blue, label: 'USER STORY' },
  TASK: { color: C.yellow, label: 'TASK' },
};

export function drawADOCard(ctx, R, item, o = {}) {
  const { alpha = 1, reveal = 1, glow = 0, titleSize = 19 } = o;
  if (alpha <= 0.002) return;
  const ty = ADO_TYPES[item.type];
  glass(ctx, R, {
    alpha,
    tint: ty.color,
    tintA: 0.1,
    glow,
    glowColor: ty.color,
    border: 0.14,
  });
  ctx.save();
  ctx.globalAlpha *= alpha;
  // colour rail (ADO style)
  rr(ctx, R.x, R.y, 5, R.h, 2.5);
  ctx.save();
  ctx.clip();
  ctx.restore();
  ctx.fillStyle = ty.color;
  ctx.beginPath();
  ctx.roundRect(R.x + 1, R.y + 8, 4, R.h - 16, 2);
  ctx.fill();
  const top = R.y + R.h / 2 - 12;
  text(ctx, ty.label, R.x + 20, top, {
    size: 12,
    weight: 700,
    mono: true,
    color: ty.color,
    ls: 1.5,
  });
  const lw = ty.label.length * 8.9 + 10;
  text(
    ctx,
    scramble(item.id, reveal, item.id.length * 7),
    R.x + 20 + lw + 8,
    top,
    { size: 13, mono: true, color: C.text2, weight: 600 },
  );
  text(ctx, item.title, R.x + 20, R.y + R.h / 2 + 13, {
    size: titleSize,
    weight: 600,
  });
  ctx.restore();
}
