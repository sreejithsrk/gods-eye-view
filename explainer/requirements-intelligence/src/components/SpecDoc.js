// The engineering-ready specification document (base size 1240×640).

import {
  C,
  glass,
  text,
  pill,
  checkCircle,
  rgba,
  icon,
} from '../render/draw.js';
import { E } from '../animation/easing.js';

export const SPEC_W = 1240,
  SPEC_H = 640;
export const CRITERIA = [
  'Authorized users can copy sizing',
  'New unique sizing ID created',
  'Attachments copied',
  'Original record remains unchanged',
  'Audit event generated',
];
const IMPACT = [
  ['API IMPACT', 'POST /sizings/{id}/copy · extend', 'api', C.cyan],
  ['UI IMPACT', 'Sizing list · Copy action + dialog', 'layers', C.violet],
  ['DATA IMPACT', 'Attachments duplicated to new ID', 'doc', C.blue],
  ['SECURITY', 'Engineer, Administrator · audited', 'shield', C.green],
  ['TEST SCENARIOS', '14 generated · 5 per criterion', 'flask', C.amber],
];

/** checks(i) → 0..1 progress of each acceptance criterion tick. */
export function drawSpecDoc(ctx, R, o = {}) {
  const { alpha = 1, checks = () => 1, sideA = 1, stamp = 0, glow = 0.3 } = o;
  if (alpha <= 0.002) return;
  glass(ctx, R, {
    alpha,
    tint: C.cyan,
    tintA: 0.1,
    glow,
    glowColor: stamp > 0 ? C.green : C.cyan,
    border: 0.2,
  });
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(R.x, R.y);
  ctx.scale(R.w / SPEC_W, R.h / SPEC_H);
  text(ctx, 'FEATURE', 48, 52, {
    size: 13,
    mono: true,
    color: C.cyan,
    ls: 3,
    weight: 600,
  });
  text(ctx, 'Copy Existing Sizing', 48, 96, {
    size: 44,
    weight: 700,
    ls: -0.8,
  });
  let x = SPEC_W - 48;
  for (const [l, c] of [
    ['v1.0', C.text3],
    ['Level Product Advisor', C.violet],
    ['REQ-1042', C.cyan],
  ]) {
    x -=
      pill(ctx, x, 60, l, {
        size: 14,
        align: 'right',
        bg: c,
        color: c === C.text3 ? C.text2 : c,
        mono: l !== 'Level Product Advisor',
        h: 30,
      }) + 8;
  }
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(48, 140, SPEC_W - 96, 1);
  text(ctx, 'ACCEPTANCE CRITERIA', 48, 180, {
    size: 13,
    mono: true,
    color: C.text3,
    ls: 2.5,
  });
  CRITERIA.forEach((c, i) => {
    const p = checks(i);
    const y = 234 + i * 64;
    checkCircle(ctx, 66, y, 14, p, C.green, 0.3 + 0.7 * Math.min(1, p * 2));
    text(ctx, c, 98, y + 1, {
      size: 25,
      weight: 550,
      alpha: 0.35 + 0.65 * Math.min(1, p * 1.5),
    });
  });
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(740, 170, 1, 380);
  IMPACT.forEach(([l, v, ic, c], i) => {
    const a = sideA * 1;
    const y = 190 + i * 76;
    icon(ctx, ic, 790, y + 16, 22, c);
    text(ctx, l, 820, y, {
      size: 12,
      mono: true,
      color: C.text3,
      ls: 2,
      alpha: a,
    });
    text(ctx, v, 820, y + 26, {
      size: 18,
      weight: 600,
      color: C.text,
      alpha: a,
    });
  });
  text(
    ctx,
    'Derived from 6 context sources · 3 clarifications · 0 open assumptions',
    48,
    596,
    { size: 15, mono: true, color: rgba(C.cyan, 0.85) },
  );
  if (stamp > 0) {
    const s = E.outBack(stamp, 2.2);
    ctx.save();
    ctx.translate(1060, 108);
    ctx.rotate(-0.1);
    ctx.scale(1.6 - 0.6 * s, 1.6 - 0.6 * s);
    ctx.globalAlpha *= Math.min(1, stamp * 2);
    ctx.strokeStyle = C.green;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-110, -30, 220, 60, 10);
    ctx.stroke();
    text(ctx, 'APPROVED', 0, 2, {
      size: 28,
      weight: 800,
      align: 'center',
      color: C.green,
      ls: 4,
    });
    ctx.restore();
  }
  ctx.restore();
}
