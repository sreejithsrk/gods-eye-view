// Data streams: particle flows along paths and labelled packets in flight.

import { C, pill, icon, flow, dot } from '../render/draw.js';
import { arcPt } from '../animation/transitions.js';
import { clamp, E } from '../animation/easing.js';

export { flow };

/** A labelled pill travelling along an arc from a → b with progress p. */
export function flyingLabel(ctx, label, iconName, a, b, p, o = {}) {
  const { color = C.cyan, bend = 90, shrink = true, alpha = 1, size = 17 } = o;
  if (p <= 0 || p >= 1 || alpha <= 0.002) return;
  const e = E.inOutCubic(p);
  const pt = arcPt(a, b, e, bend);
  const s = shrink ? 1 - E.inCubic(clamp((p - 0.55) / 0.45)) * 0.85 : 1;
  ctx.save();
  ctx.translate(pt.x, pt.y);
  ctx.scale(s, s);
  pill(ctx, 0, 0, label, {
    size,
    align: 'center',
    bg: color,
    bgA: 0.2,
    alpha: alpha * clamp(p * 5),
    h: size * 2.1,
    padX: 16,
    icon: iconName ? (c, x, y, sz) => icon(c, iconName, x, y, sz, color) : null,
  });
  ctx.restore();
  dot(ctx, pt.x, pt.y, 2, color, 0.5 * (1 - s));
}
