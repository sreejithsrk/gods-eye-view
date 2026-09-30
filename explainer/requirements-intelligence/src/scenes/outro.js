// 13 · Outro — the architecture collapses into the mark; the promise, then
// the four differentiators; fade to dark.

import { C, text, measure, kinetic, softGlow, rgba } from '../render/draw.js';
import { drawLogo } from '../components/Logo.js';
import { seg, E } from '../animation/easing.js';

const TITLE = 'REQUIREMENTS INTELLIGENCE';

export default {
  id: 'outro',
  pre: 0,
  post: 0,
  captions: [],
  draw(ctx, lt, t) {
    // Burst as the system collapses into the mark
    const b = seg(lt, 0.7, 1.6);
    if (b > 0 && b < 1) {
      ctx.save();
      ctx.strokeStyle = rgba(C.cyan, 0.6 * (1 - b));
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(960, 420, 40 + E.outCubic(b) * 520, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    softGlow(ctx, 960, 420, 420, C.indigo, 0.22 * seg(lt, 0.6, 1.4));
    drawLogo(ctx, 960, 400, 104, seg(lt, 0.6, 1.5), 1, t);

    // Title: wide-tracked letters settling in
    const size = 52,
      ls = 12;
    const w = measure(ctx, TITLE, size, 700, false, ls);
    let x = 960 - w / 2 + ls / 2;
    for (let i = 0; i < TITLE.length; i++) {
      const ch = TITLE[i];
      const cw = measure(ctx, ch, size, 700, false, ls);
      const p = E.outQuart(seg(lt, 1.0 + i * 0.018, 1.6 + i * 0.018));
      text(ctx, ch, x + (1 - p) * (i - TITLE.length / 2) * 4, 520, {
        size,
        weight: 700,
        ls,
        alpha: p,
      });
      x += cw;
    }

    // From Conversation → to Requirement → to Code → to Production.
    const parts = [
      ['From', 'Conversation'],
      ['to', 'Requirement'],
      ['to', 'Code'],
      ['to', 'Production.'],
    ];
    const sz = 32;
    const arrowW = measure(ctx, '  →  ', sz, 400);
    const widths = parts.map(([a, bb]) => measure(ctx, `${a} ${bb}`, sz, 500));
    const total = widths.reduce((s, v) => s + v, 0) + arrowW * 3;
    let px = 960 - total / 2;
    parts.forEach(([a, bb], i) => {
      const tIn = lt - (1.7 + i * 0.28);
      const aw = measure(ctx, a + ' ', sz, 500);
      if (tIn > 0) {
        kinetic(ctx, a, px, 610, tIn, {
          size: sz,
          weight: 500,
          color: C.text2,
          align: 'left',
        });
        kinetic(ctx, bb, px + aw, 610, tIn - 0.05, {
          size: sz,
          weight: 650,
          color: C.text,
          align: 'left',
        });
      }
      px += widths[i];
      if (i < 3) {
        const ap = seg(lt, 1.85 + i * 0.28, 2.1 + i * 0.28);
        text(ctx, '→', px + arrowW / 2, 610, {
          size: sz,
          weight: 400,
          color: C.cyan,
          align: 'center',
          alpha: ap,
        });
        px += arrowW;
      }
    });

    // Differentiators
    const words = [
      ['Context-aware.', C.cyan],
      ['Traceable.', C.violet],
      ['Human-governed.', C.green],
      ['AI-accelerated.', C.blue],
    ];
    const dsz = 25,
      gap = 44;
    const dw = words.map(([wd]) => measure(ctx, wd, dsz, 600));
    const dt = dw.reduce((s, v) => s + v, 0) + gap * 3;
    let dx = 960 - dt / 2;
    words.forEach(([wd, col], i) => {
      const p = E.outCubic(seg(lt, 2.9 + i * 0.16, 3.4 + i * 0.16));
      text(ctx, wd, dx, 700 + (1 - p) * 14, {
        size: dsz,
        weight: 600,
        color: C.text,
        alpha: p,
      });
      ctx.save();
      ctx.globalAlpha *= p;
      ctx.fillStyle = col;
      ctx.fillRect(dx, 724, dw[i] * p, 2);
      ctx.restore();
      dx += dw[i] + gap;
    });
  },
};
