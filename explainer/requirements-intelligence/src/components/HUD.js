// Persistent heads-up display: project context, the persistent requirement
// identity, and a chapter indicator. Lives in screen space.

import { C, text, pill, rgba } from '../render/draw.js';
import { reqChip } from './RequirementBadge.js';
import { CHAPTERS, at } from '../animation/timeline.js';
import { seg, E, clamp, bump } from '../animation/easing.js';

// Status changes of REQ-1042 over the film (global times).
export const STATUS_KEYS = [
  { t: at('orchestration', 1.1), from: 'Discovery', to: 'Analysis' },
  { t: at('generation', 4.6), from: 'Analysis', to: 'Review' },
  { t: at('approval', 1.75), from: 'Review', to: 'Approved' },
  { t: at('development', 0.7), from: 'Approved', to: 'Engineering' },
];
export function statusAt(t) {
  let cur = { status: 'Discovery', statusTo: null, statusP: 0 };
  for (const k of STATUS_KEYS) {
    if (t >= k.t + 0.5) cur = { status: k.to, statusTo: null, statusP: 0 };
    else if (t >= k.t)
      cur = { status: k.from, statusTo: k.to, statusP: (t - k.t) / 0.5 };
  }
  return cur;
}
export const REQ_CHIP = { x: 64, y: 52 };

export function drawHUD(ctx, t, o = {}) {
  const reqGlow =
    o.reqGlow ?? bump(t, at('development', 4.6), at('development', 6.6));
  const hudOut = 1 - seg(t, at('architecture', 0.2), at('architecture', 0.9));
  // Project context
  const pa = seg(t, at('knowledge', 0.2), at('knowledge', 0.8)) * hudOut;
  if (pa > 0) {
    text(ctx, 'PROJECT', 64, 30 + (1 - pa) * 6, {
      size: 11,
      mono: true,
      color: C.text3,
      ls: 2.5,
      alpha: pa,
      baseline: 'middle',
    });
  }
  const ra =
    E.outCubic(seg(t, at('requirement', 5.1), at('requirement', 5.7))) * hudOut;
  // Project pill sits before the REQ chip
  if (pa > 0)
    pill(ctx, 64, 58, 'Level Product Advisor', {
      size: 15,
      bg: C.violet,
      dot: C.violet,
      h: 36,
      alpha: pa,
    });
  if (ra > 0) {
    const s = statusAt(t);
    text(ctx, 'REQUIREMENT', 300, 30, {
      size: 11,
      mono: true,
      color: C.text3,
      ls: 2.5,
      alpha: ra,
    });
    ctx.save();
    ctx.translate((1 - ra) * -20, 0);
    reqChip(ctx, 300, 58, { alpha: ra, ...s, glow: reqGlow });
    ctx.restore();
  }
  // Chapter indicator (top right)
  const ca = seg(t, at('project', 0.6), at('project', 1.4)) * hudOut;
  if (ca > 0) {
    const cur = CHAPTERS.findLast((c) => t >= c.start) ?? CHAPTERS[0];
    const idx = cur.index;
    const n = CHAPTERS.length - 2; // exclude intro & outro
    const num = String(clamp(idx, 1, n)).padStart(2, '0');
    const x = 1856;
    const sw = seg(t, cur.start, cur.start + 0.5);
    text(ctx, `${num} / ${String(n).padStart(2, '0')}`, x, 34, {
      size: 13,
      mono: true,
      color: C.text3,
      align: 'right',
      alpha: ca,
      ls: 1,
    });
    text(ctx, cur.label.toUpperCase(), x, 60 + (1 - E.outCubic(sw)) * 10, {
      size: 15,
      weight: 700,
      color: C.text,
      align: 'right',
      ls: 2.5,
      alpha: ca * (0.3 + 0.7 * sw),
    });
    // progress ticks
    for (let i = 1; i <= n; i++) {
      const tx = x - (n - i) * 16 - 6;
      ctx.fillStyle =
        i <= idx ? rgba(C.cyan, 0.9 * ca) : `rgba(255,255,255,${0.14 * ca})`;
      ctx.fillRect(tx - 10, 84, 12, 2);
    }
  }
}
