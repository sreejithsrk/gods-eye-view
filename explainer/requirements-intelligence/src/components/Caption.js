// Kinetic captions: the film's only narration. Consistent position and
// scale so viewers always know where to read.

import { C, kinetic, text, rgba } from '../render/draw.js';
import { clamp, seg, E } from '../animation/easing.js';
import { WIDTH as W, HEIGHT as H } from '../animation/timeline.js';

/**
 * caption = { t0, t1, text, accent?: string[], eyebrow?: string, y? }
 */
export function drawCaptions(ctx, t, captions) {
  // Soft floor gradient for legibility whenever a caption is visible.
  let vis = 0;
  for (const c of captions)
    vis = Math.max(
      vis,
      Math.min(seg(t, c.t0 - 0.3, c.t0), 1 - seg(t, c.t1, c.t1 + 0.4)),
    );
  if (vis > 0) {
    const g = ctx.createLinearGradient(0, H - 260, 0, H);
    g.addColorStop(0, 'rgba(3,5,11,0)');
    g.addColorStop(1, `rgba(3,5,11,${0.78 * vis})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, H - 260, W, 260);
  }
  for (const c of captions) {
    if (t < c.t0 || t > c.t1 + 0.5) continue;
    const out = E.inCubic(seg(t, c.t1, c.t1 + 0.45));
    const y = (c.y ?? 990) - out * 18;
    const alpha = 1 - out;
    if (c.eyebrow) {
      const pe = E.outCubic(seg(t, c.t0, c.t0 + 0.5));
      text(ctx, c.eyebrow, W / 2, y - 50 + (1 - pe) * 10, {
        size: 15,
        weight: 600,
        mono: true,
        color: C.cyan,
        align: 'center',
        ls: 3,
        alpha: alpha * pe,
      });
    }
    kinetic(ctx, c.text, W / 2, y, t - c.t0, {
      size: c.size ?? 38,
      weight: 600,
      accent: c.accent ?? [],
      accentColor: c.accentColor ?? C.cyan,
      alpha,
      ls: -0.3,
    });
    // Hairline under the caption that draws in.
    const lp = E.outCubic(seg(t, c.t0 + 0.2, c.t0 + 0.9));
    if (lp > 0) {
      ctx.save();
      ctx.globalAlpha = alpha * 0.8;
      const lw = 120 * lp;
      const g = ctx.createLinearGradient(W / 2 - lw, 0, W / 2 + lw, 0);
      g.addColorStop(0, rgba(C.cyan, 0));
      g.addColorStop(0.5, rgba(C.cyan, 0.8));
      g.addColorStop(1, rgba(C.cyan, 0));
      ctx.fillStyle = g;
      ctx.fillRect(W / 2 - lw, y + 34, lw * 2, 1.5);
      ctx.restore();
    }
  }
}
export const captionVisible = (t, c) =>
  clamp(Math.min(seg(t, c.t0, c.t0 + 0.4), 1 - seg(t, c.t1, c.t1 + 0.4)));
