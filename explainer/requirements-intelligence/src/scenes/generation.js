// 06 · Generation — the conversation is transformed into a structured
// requirement package; the package condenses into an engineering-ready spec.

import { C, text, glass, iconTile, rr, rgba } from '../render/draw.js';
import { drawSpecDoc } from '../components/SpecDoc.js';
import { CHAT } from './clarification.js';
import { seg, E, clamp, spring, hash } from '../animation/easing.js';
import { morphRect } from '../animation/transitions.js';

export const ARTIFACTS = [
  ['Business Requirement', '1 outcome · 2 KPIs', 'bulb', C.amber],
  ['Functional Requirement', '6 statements', 'doc', C.cyan],
  ['Acceptance Criteria', '5 criteria', 'check', C.green],
  ['Non-Functional Requirements', 'p95 < 800 ms · 99.9%', 'gauge', C.blue],
  ['Security Requirements', 'RBAC · audit trail', 'shield', C.green],
  ['API Impact', '1 endpoint extended', 'api', C.cyan],
  ['UI Impact', '2 components', 'layers', C.violet],
  ['Data Impact', 'attachments copy', 'doc', C.blue],
  ['Dependencies', 'Blob Storage · Audit svc', 'link', C.indigo],
  ['Risks', '2 identified · mitigated', 'impact', C.rose],
  ['Test Scenarios', '14 scenarios', 'flask', C.amber],
  ['Architecture Impact', 'no new service · ADR-017', 'arch', C.indigo],
];
const CW = 360,
  CH = 112,
  GX = 24,
  GY = 22;
const GX0 = 960 - (CW * 4 + GX * 3) / 2,
  GY0 = 240;
const gridRect = (i) => ({
  x: GX0 + (i % 4) * (CW + GX),
  y: GY0 + Math.floor(i / 4) * (CH + GY),
  w: CW,
  h: CH,
  r: 16,
});
export const stackRect = (i) => ({
  x: 96,
  y: 170 + i * 50,
  w: 330,
  h: 42,
  r: 12,
});
export const SPEC_R = { x: 500, y: 170, w: 1300, h: 671, r: 24 };
const AC = 2;

export const checkAt = (i) => 3.25 + i * 0.2;

export default {
  id: 'generation',
  pre: 0,
  post: 0.1,
  captions: [
    {
      t0: 3.4,
      t1: 5.5,
      text: 'Requirement transformed into engineering-ready specification.',
      accent: ['engineering-ready'],
    },
  ],
  draw(ctx, lt) {
    const condAll = E.inOutQuart(seg(lt, 2.2, 3.0)); // grid → stack + spec
    // Title
    const tA = seg(lt, 0.3, 0.7) * (1 - seg(lt, 2.0, 2.4));
    text(ctx, 'Requirement package', 960, 168, {
      size: 30,
      weight: 700,
      align: 'center',
      alpha: tA,
      ls: -0.4,
    });
    const n = ARTIFACTS.filter((_, i) => lt > 0.1 + i * 0.07 + 0.7).length;
    text(ctx, `REQ-1042 · ${n} of 12 artifacts generated`, 960, 206, {
      size: 15,
      mono: true,
      color: C.cyan,
      align: 'center',
      alpha: tA,
    });

    const order = [...ARTIFACTS.keys()].filter((i) => i !== AC).concat([AC]);
    order.forEach((i) => {
      const [title, sub, ic, col] = ARTIFACTS[i];
      const t0 = 0.1 + i * 0.07;
      const cond =
        i === AC
          ? condAll
          : E.inOutQuart(seg(lt, 2.2 + i * 0.035, 2.85 + i * 0.035));
      const fp = E.outQuart(seg(lt, t0, t0 + 0.75));
      if (fp <= 0) return;
      const src = {
        x: CHAT.x + 60 + hash(i * 3.3) * (CHAT.w - 300),
        y: CHAT.y + 120 + hash(i * 7.7) * (CHAT.h - 200),
        w: 180,
        h: 36,
        r: 12,
      };
      let R = morphRect(src, gridRect(i), fp);
      const isAC = i === AC;
      if (cond > 0) R = morphRect(R, isAC ? SPEC_R : stackRect(i), cond);
      const sp = spring(lt - t0, 2.0, 0.7);
      if (isAC && cond > 0.35) {
        // AC card becomes the specification document
        const a = seg(cond, 0.35, 0.9);
        drawSpecDoc(ctx, R, {
          alpha: a,
          checks: (k) => seg(lt, checkAt(k), checkAt(k) + 0.35),
          glow: 0.3,
        });
        if (a >= 1) return;
      }
      const small = cond;
      glass(ctx, R, {
        alpha: clamp(fp * 2) * (isAC ? 1 - seg(cond, 0.4, 0.8) : 1),
        tint: col,
        tintA: 0.12,
        glow: isAC ? 0.4 * (1 - cond) : 0,
        glowColor: col,
      });
      ctx.save();
      ctx.globalAlpha *= clamp(fp * 2) * (isAC ? 1 - seg(cond, 0.2, 0.5) : 1);
      if (small < 0.6) {
        ctx.globalAlpha *= 1 - E.inCubic(small / 0.6);
        const s = 0.9 + 0.1 * sp;
        iconTile(ctx, ic, R.x + 38, R.y + 38, 42 * s, col);
        text(ctx, title, R.x + 72, R.y + 30, {
          size: title.length > 24 ? 17 : 19,
          weight: 650,
        });
        text(ctx, sub, R.x + 72, R.y + 55, {
          size: 13,
          mono: true,
          color: C.text3,
        });
        // writing skeleton lines
        const w = seg(lt, t0 + 0.5, t0 + 1.2);
        for (let k = 0; k < 2; k++) {
          rr(
            ctx,
            R.x + 22,
            R.y + 80 + k * 12,
            (R.w - 44) * w * (k ? 0.62 : 0.88),
            4,
            2,
          );
          ctx.fillStyle = rgba(col, 0.28);
          ctx.fill();
        }
      }
      if (small > 0.4) {
        ctx.save();
        ctx.globalAlpha *= (small - 0.4) / 0.6;
        iconTile(ctx, ic, R.x + 22, R.y + R.h / 2, 26, col);
        text(ctx, title, R.x + 44, R.y + R.h / 2 + 1, {
          size: 15,
          weight: 600,
          color: C.text2,
        });
        ctx.restore();
      }
      ctx.restore();
    });
  },
};
