// The Requirements Intelligence mark: a rotated rounded square (the
// governed boundary) enclosing a small graph (connected knowledge).

import { C, rgba, strokeSub, dot } from '../render/draw.js';
import { clamp, E } from '../animation/easing.js';

function diamond(s) {
  const h = s / 2,
    pts = [];
  // Rounded diamond sampled as polyline so it can be traced.
  const corners = [
    [0, -h],
    [h, 0],
    [0, h],
    [-h, 0],
  ];
  const rad = s * 0.16;
  for (let i = 0; i < 4; i++) {
    const a = corners[i],
      b = corners[(i + 1) % 4],
      c = corners[(i + 2) % 4];
    const ab = [b[0] - a[0], b[1] - a[1]],
      bc = [c[0] - b[0], c[1] - b[1]];
    const la = Math.hypot(...ab),
      lb = Math.hypot(...bc);
    const p1 = [b[0] - (ab[0] / la) * rad, b[1] - (ab[1] / la) * rad];
    const p2 = [b[0] + (bc[0] / lb) * rad, b[1] + (bc[1] / lb) * rad];
    if (i === 0)
      pts.push({ x: a[0] + (ab[0] / la) * rad, y: a[1] + (ab[1] / la) * rad });
    pts.push({ x: p1[0], y: p1[1] });
    for (let k = 1; k < 8; k++) {
      const u = k / 8,
        q = 1 - u;
      pts.push({
        x: q * q * p1[0] + 2 * q * u * b[0] + u * u * p2[0],
        y: q * q * p1[1] + 2 * q * u * b[1] + u * u * p2[1],
      });
    }
    pts.push({ x: p2[0], y: p2[1] });
  }
  pts.push({ ...pts[0] });
  return pts;
}
const cache = new Map();

/** p: 0..1 build progress. */
export function drawLogo(ctx, x, y, s, p = 1, alpha = 1, t = 0) {
  if (alpha <= 0.002 || p <= 0) return;
  let pts = cache.get(s);
  if (!pts) cache.set(s, (pts = diamond(s)));
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  const g = ctx.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2);
  g.addColorStop(0, C.cyan);
  g.addColorStop(1, C.violet);
  ctx.strokeStyle = g;
  ctx.lineWidth = Math.max(1.5, s * 0.055);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  strokeSub(ctx, pts, 0, E.inOutCubic(clamp(p / 0.6)));
  // inner graph
  const q = clamp((p - 0.4) / 0.6);
  if (q > 0) {
    const n = [
      { x: 0, y: -s * 0.2 },
      { x: -s * 0.19, y: s * 0.14 },
      { x: s * 0.19, y: s * 0.14 },
    ];
    ctx.lineWidth = Math.max(1, s * 0.035);
    ctx.strokeStyle = rgba('#d8e2ff', 0.85 * q);
    for (const a of n) {
      ctx.beginPath();
      ctx.moveTo(0, s * 0.02);
      ctx.lineTo(a.x * E.outBack(q), a.y * E.outBack(q) + s * 0.02 * (1 - q));
      ctx.stroke();
    }
    for (const a of n) {
      ctx.fillStyle = rgba('#ffffff', q);
      ctx.beginPath();
      ctx.arc(
        a.x * E.outBack(q),
        a.y * E.outBack(q),
        s * 0.055,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    if (s > 40)
      dot(
        ctx,
        0,
        s * 0.02,
        s * 0.05,
        C.cyan,
        q * (0.8 + 0.2 * Math.sin(t * 3)),
      );
    else {
      ctx.fillStyle = C.cyan;
      ctx.beginPath();
      ctx.arc(0, s * 0.02, s * 0.07, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
