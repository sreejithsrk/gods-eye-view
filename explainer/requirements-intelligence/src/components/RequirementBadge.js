// Requirement identity: the REQ badge, status pill and lifecycle track.

import { C, glass, text, pill, rgba, rr, checkCircle } from '../render/draw.js';
import { clamp, E } from '../animation/easing.js';

export const STAGES = [
  'Discovery',
  'Analysis',
  'Review',
  'Approved',
  'Engineering',
  'Released',
];
export const STATUS_COLOR = {
  Discovery: C.amber,
  Analysis: C.cyan,
  Review: C.violet,
  Approved: C.green,
  Engineering: C.blue,
  Released: C.green,
};

/** Status pill with a vertical roll when the status changes. */
export function statusPill(ctx, x, y, from, to, p, o = {}) {
  const { size = 15, align = 'left', alpha = 1, prefix = '' } = o;
  const e = E.inOutCubic(clamp(p));
  const label = e < 0.5 ? from : to;
  const color = e < 0.5 ? STATUS_COLOR[from] : STATUS_COLOR[to];
  const roll = e < 0.5 ? -e * 2 : (1 - e) * 2;
  ctx.save();
  ctx.translate(0, roll * 8);
  const w = pill(ctx, x, y, prefix + label, {
    size,
    align,
    bg: color,
    color,
    alpha: alpha * (1 - Math.abs(roll) * 0.8),
    dot: color,
    weight: 650,
  });
  ctx.restore();
  return w;
}

/** Compact REQ badge (hero object). R = rect. */
export function drawBadge(ctx, R, o = {}) {
  const {
    alpha = 1,
    id = 'REQ-1042',
    status = 'Discovery',
    statusTo = null,
    statusP = 0,
    glow = 0.6,
    idSize = 40,
    showStatus = true,
  } = o;
  if (alpha <= 0.002) return;
  glass(ctx, R, {
    alpha,
    tint: C.cyan,
    tintA: 0.18,
    glow,
    glowColor: C.cyan,
    border: 0.22,
  });
  ctx.save();
  ctx.globalAlpha *= alpha;
  const cxm = R.x + R.w / 2;
  if (showStatus) {
    text(ctx, id, cxm, R.y + R.h * 0.4, {
      size: idSize,
      weight: 700,
      mono: true,
      align: 'center',
      ls: 1,
    });
    statusPill(
      ctx,
      cxm,
      R.y + R.h * 0.76,
      status,
      statusTo ?? status,
      statusP,
      {
        align: 'center',
        size: Math.max(12, idSize * 0.36),
        prefix: 'Status: ',
      },
    );
  } else {
    text(ctx, id, cxm, R.y + R.h / 2, {
      size: idSize,
      weight: 700,
      mono: true,
      align: 'center',
      ls: 1,
    });
  }
  ctx.restore();
}

/**
 * Lifecycle track. `progress` = fractional index of the current stage
 * (e.g. 0 = Discovery, 3 = Approved). `appear` 0..1 staggered build.
 */
export function drawLifecycle(ctx, x, y, w, o = {}) {
  const {
    progress = 0,
    appear = 1,
    alpha = 1,
    t = 0,
    highlight = null,
    size = 17,
    stages = STAGES,
  } = o;
  if (alpha <= 0.002) return;
  const n = stages.length;
  const step = w / (n - 1);
  ctx.save();
  ctx.globalAlpha *= alpha;
  // track
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(x, y - 1, w * clamp(appear * 1.2), 2);
  const fillW = step * clamp(progress, 0, n - 1);
  const g = ctx.createLinearGradient(x, 0, x + fillW + 1, 0);
  g.addColorStop(0, rgba(C.amber, 0.9));
  g.addColorStop(
    1,
    rgba(
      STATUS_COLOR[stages[Math.min(n - 1, Math.round(progress))]] ?? C.cyan,
      1,
    ),
  );
  ctx.fillStyle = g;
  ctx.fillRect(x, y - 1.5, fillW * clamp(appear * 1.2), 3);
  for (let i = 0; i < n; i++) {
    const a = clamp(appear * n * 1.2 - i);
    if (a <= 0) continue;
    const px = x + i * step;
    const done =
      progress > i + 0.001 || (progress >= i && i === 0 && progress > 0);
    const current = Math.abs(progress - i) < 0.5;
    const color = STATUS_COLOR[stages[i]];
    const s = E.outBack(a);
    ctx.save();
    ctx.globalAlpha *= a;
    if (current) {
      const pulse = (t * 1.2) % 1;
      ctx.beginPath();
      ctx.arc(px, y, 12 + pulse * 16, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(color, 0.6 * (1 - pulse));
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    if (done && !current) checkCircle(ctx, px, y, 11 * s, 1, color);
    else {
      ctx.beginPath();
      ctx.arc(px, y, (current ? 11 : 8) * s, 0, Math.PI * 2);
      ctx.fillStyle = current ? color : '#141b33';
      ctx.fill();
      ctx.strokeStyle = current ? rgba(color, 1) : 'rgba(255,255,255,0.28)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    const hl = highlight === stages[i];
    text(ctx, hl ? stages[i].toUpperCase() : stages[i], px, y + 34, {
      size: hl ? size + 1 : size,
      weight: current || hl ? 700 : 500,
      align: 'center',
      color: current || hl ? color : done ? C.text2 : C.text3,
      ls: hl ? 1.5 : 0,
    });
    ctx.restore();
  }
  ctx.restore();
}

/** Small inline chip used in HUD and elsewhere. */
export function reqChip(ctx, x, y, o = {}) {
  const {
    alpha = 1,
    status = 'Discovery',
    statusTo = null,
    statusP = 0,
    glow = 0,
  } = o;
  if (alpha <= 0.002) return 0;
  ctx.save();
  ctx.globalAlpha *= alpha;
  const w = 290,
    h = 40;
  rr(ctx, x, y - h / 2, w, h, h / 2);
  ctx.fillStyle = 'rgba(10,15,30,0.85)';
  ctx.fill();
  ctx.strokeStyle = rgba(C.cyan, 0.35 + glow * 0.5);
  ctx.lineWidth = 1.2;
  if (glow > 0) {
    ctx.shadowColor = rgba(C.cyan, glow);
    ctx.shadowBlur = 20;
  }
  ctx.stroke();
  ctx.shadowColor = 'transparent';
  text(ctx, 'REQ-1042', x + 18, y + 1, { size: 16, weight: 700, mono: true });
  statusPill(ctx, x + 124, y, status, statusTo ?? status, statusP, {
    size: 13,
  });
  ctx.restore();
  return w;
}
