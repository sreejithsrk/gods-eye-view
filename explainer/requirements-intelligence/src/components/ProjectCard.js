// Project selection card.

import { C, glass, text, iconTile, rgba, rr } from '../render/draw.js';

export const PROJECTS = [
  {
    name: 'DPFlow',
    desc: 'Process flow analytics',
    icon: 'flow',
    color: C.cyan,
    meta: '12 repos · 4 teams',
  },
  {
    name: 'Temperature',
    desc: 'Thermal measurement suite',
    icon: 'thermo',
    color: C.amber,
    meta: '9 repos · 3 teams',
  },
  {
    name: 'Lookout',
    desc: 'Monitoring & alerting',
    icon: 'eye',
    color: C.green,
    meta: '7 repos · 2 teams',
  },
  {
    name: 'Level Product Advisor',
    desc: 'Level instrument sizing',
    icon: 'level',
    color: C.violet,
    meta: '14 repos · 5 teams',
  },
];
export const CARD_W = 300,
  CARD_H = 196;

/** Drawn in local card space at (x, y) top-left, base size CARD_W×CARD_H. */
export function drawProjectCard(ctx, p, x, y, o = {}) {
  const { alpha = 1, hover = 0, selected = 0, loading = 0, loaded = 0 } = o;
  if (alpha <= 0.002) return;
  const R = { x, y, w: CARD_W, h: CARD_H, r: 20 };
  glass(ctx, R, {
    alpha,
    tint: p.color,
    tintA: 0.12 + 0.12 * hover,
    glow: Math.max(hover * 0.6, selected),
    glowColor: p.color,
    border: 0.16 + 0.1 * hover,
  });
  ctx.save();
  ctx.globalAlpha *= alpha;
  iconTile(ctx, p.icon, x + 44, y + 46, 48, p.color);
  text(ctx, p.name, x + 24, y + 100, {
    size: p.name.length > 14 ? 21 : 23,
    weight: 650,
  });
  text(ctx, p.desc, x + 24, y + 130, { size: 16, color: C.text2 });
  if (loading <= 0) {
    text(ctx, p.meta, x + 24, y + 164, {
      size: 13,
      mono: true,
      color: C.text3,
    });
    ctx.beginPath();
    ctx.arc(x + CARD_W - 28, y + 46, 4, 0, Math.PI * 2);
    ctx.fillStyle = rgba(C.green, 0.8);
    ctx.fill();
  } else {
    // Context loading bar
    ctx.globalAlpha *= loading;
    const n = Math.round(loaded * 8);
    text(
      ctx,
      n < 8
        ? `Loading context · ${n}/8 sources`
        : 'Context ready · 8/8 sources',
      x + 24,
      y + 160,
      { size: 13, mono: true, color: n < 8 ? C.cyan : C.green },
    );
    rr(ctx, x + 24, y + 176, CARD_W - 48, 4, 2);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fill();
    rr(ctx, x + 24, y + 176, (CARD_W - 48) * loaded, 4, 2);
    ctx.fillStyle = n < 8 ? C.cyan : C.green;
    ctx.fill();
  }
  ctx.restore();
}
