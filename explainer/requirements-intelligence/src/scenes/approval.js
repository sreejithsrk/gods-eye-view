// 07 · Approval — a Product Owner / Architect reviews the specification.
// AI prepared it; a human decides. The lifecycle advances to APPROVED.

import {
  C,
  text,
  glass,
  avatar,
  pill,
  rr,
  rgba,
  checkCircle,
  icon,
} from '../render/draw.js';
import { drawSpecDoc, SPEC_W, SPEC_H } from '../components/SpecDoc.js';
import { drawLifecycle } from '../components/RequirementBadge.js';
import { drawCursor, cursorPos } from '../components/Cursor.js';
import { SPEC_R, stackRect, ARTIFACTS } from './generation.js';
import { seg, E, clamp, lerp, stagger } from '../animation/easing.js';
import { morphRect } from '../animation/transitions.js';

export const SPEC_A = {
  x: 110,
  y: 200,
  w: 1000,
  h: (1000 * SPEC_H) / SPEC_W,
  r: 22,
};
const PANEL = { x: 1170, y: 200, w: 640, h: 516, r: 22 };
const APPROVE = {
  x: PANEL.x + PANEL.w - 36 - 220,
  y: PANEL.y + PANEL.h - 92,
  w: 220,
  h: 58,
  r: 29,
};
const REQCH = {
  x: PANEL.x + 36,
  y: PANEL.y + PANEL.h - 92,
  w: 250,
  h: 58,
  r: 29,
};
export const CLICK = 1.5;

export default {
  id: 'approval',
  pre: 0,
  post: 0.1,
  captions: [
    {
      t0: 2.0,
      t1: 4.5,
      text: 'Human approval remains the control point.',
      accent: ['Human', 'approval'],
      accentColor: C.green,
    },
  ],
  draw(ctx, lt, t) {
    const m = E.inOutQuart(seg(lt, 0, 0.7));
    // artifact stack slides out
    ARTIFACTS.forEach((a, i) => {
      if (i === 2) return;
      const p = E.inCubic(stagger(lt, i, 0, 0.025, 0.4));
      if (p >= 1) return;
      const R = stackRect(i);
      glass(
        ctx,
        { ...R, x: R.x - p * 200 },
        { alpha: 1 - p, tint: a[3], tintA: 0.12, shadow: false },
      );
      text(ctx, a[0], R.x - p * 200 + 44, R.y + R.h / 2 + 1, {
        size: 15,
        weight: 600,
        color: C.text2,
        alpha: 1 - p,
      });
    });
    const stamp = seg(lt, CLICK + 0.2, CLICK + 0.55);
    drawSpecDoc(ctx, morphRect(SPEC_R, SPEC_A, m), {
      checks: () => 1,
      stamp,
      glow: 0.3 + 0.5 * stamp,
    });

    // Review panel
    const pIn = E.outCubic(seg(lt, 0.3, 0.9));
    if (pIn > 0) {
      ctx.save();
      ctx.globalAlpha *= pIn;
      ctx.translate((1 - pIn) * 80, 0);
      glass(ctx, PANEL, {
        tint: C.green,
        tintA: 0.08 + 0.1 * stamp,
        glow: 0.15 + 0.4 * stamp,
        glowColor: C.green,
      });
      text(ctx, 'HUMAN REVIEW', PANEL.x + 36, PANEL.y + 44, {
        size: 13,
        mono: true,
        color: C.text3,
        ls: 3,
      });
      text(ctx, 'Review & approve REQ-1042', PANEL.x + 36, PANEL.y + 82, {
        size: 26,
        weight: 700,
        ls: -0.3,
      });
      // reviewers
      const rows = [
        { ini: 'AR', role: 'Architect', col: C.indigo, done: 0.95 },
        { ini: 'PO', role: 'Product Owner', col: C.cyan, done: CLICK + 0.1 },
      ];
      rows.forEach((r, i) => {
        const y = PANEL.y + 146 + i * 64;
        avatar(ctx, PANEL.x + 58, y, 21, r.ini, r.col);
        text(ctx, r.role, PANEL.x + 94, y, { size: 19, weight: 600 });
        const ok = lt > r.done;
        if (ok)
          pill(ctx, PANEL.x + PANEL.w - 36, y, 'Approved', {
            size: 14,
            align: 'right',
            bg: C.green,
            color: C.green,
            alpha: seg(lt, r.done, r.done + 0.2),
            icon: (c, x, yy, s) => icon(c, 'check', x, yy, s, C.green),
            h: 32,
          });
        else
          pill(ctx, PANEL.x + PANEL.w - 36, y, 'Reviewing…', {
            size: 14,
            align: 'right',
            bg: C.amber,
            color: C.amber,
            h: 32,
            dot: C.amber,
          });
      });
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      ctx.fillRect(PANEL.x + 36, PANEL.y + 250, PANEL.w - 72, 1);
      [
        ['Context verified', '6 sources cited'],
        ['Impact reviewed', 'API · UI · data'],
        ['Policy / guardrails', 'passed'],
      ].forEach(([l, v], i) => {
        const y = PANEL.y + 288 + i * 38;
        const a = seg(lt, 0.6 + i * 0.12, 0.9 + i * 0.12);
        checkCircle(ctx, PANEL.x + 48, y, 10, a, C.green);
        text(ctx, l, PANEL.x + 70, y, { size: 17, weight: 550, alpha: a });
        text(ctx, v, PANEL.x + PANEL.w - 36, y, {
          size: 14,
          mono: true,
          color: C.text3,
          align: 'right',
          alpha: a,
        });
      });
      // buttons
      rr(ctx, REQCH.x, REQCH.y, REQCH.w, REQCH.h, REQCH.r);
      ctx.strokeStyle = 'rgba(255,255,255,0.28)';
      ctx.lineWidth = 1.3;
      ctx.stroke();
      text(
        ctx,
        'Request Changes',
        REQCH.x + REQCH.w / 2,
        REQCH.y + REQCH.h / 2 + 1,
        { size: 19, weight: 600, align: 'center', color: C.text2 },
      );
      const hover = seg(lt, CLICK - 0.3, CLICK - 0.1);
      const clicked = lt > CLICK;
      const press = 1 - 0.05 * Math.sin(clamp((lt - CLICK) / 0.2) * Math.PI);
      ctx.save();
      ctx.translate(APPROVE.x + APPROVE.w / 2, APPROVE.y + APPROVE.h / 2);
      ctx.scale(press, press);
      rr(ctx, -APPROVE.w / 2, -APPROVE.h / 2, APPROVE.w, APPROVE.h, APPROVE.r);
      ctx.fillStyle = clicked ? C.green : rgba(C.green, 0.8 + 0.2 * hover);
      ctx.shadowColor = rgba(C.green, 0.3 + (0.5 * (hover + stamp)) / 2);
      ctx.shadowBlur = 24;
      ctx.fill();
      ctx.shadowColor = 'transparent';
      if (clicked) {
        icon(ctx, 'check', -62, 0, 20, '#06140e');
        text(ctx, 'Approved', 12, 1, {
          size: 20,
          weight: 700,
          align: 'center',
          color: '#06140e',
        });
      } else
        text(ctx, 'Approve', 0, 1, {
          size: 20,
          weight: 700,
          align: 'center',
          color: '#06140e',
        });
      ctx.restore();
      ctx.restore();
    }
    // Cursor
    const pos = cursorPos(lt, [
      { t: 0.7, x: 1560, y: 1000 },
      {
        t: CLICK - 0.05,
        x: APPROVE.x + APPROVE.w / 2 + 10,
        y: APPROVE.y + APPROVE.h / 2 + 8,
      },
    ]);
    drawCursor(ctx, pos.x, pos.y, lt, {
      alpha: seg(lt, 0.7, 0.95) * (1 - seg(lt, 2.2, 2.5)),
      clickAt: CLICK,
      color: C.green,
    });

    // Lifecycle
    const lA = seg(lt, 0.4, 0.8);
    const prog = lerp(2, 3, E.inOutCubic(seg(lt, CLICK + 0.25, CLICK + 0.85)));
    text(ctx, 'LIFECYCLE', 960, 790, {
      size: 13,
      mono: true,
      color: C.text3,
      align: 'center',
      ls: 3,
      alpha: lA,
    });
    drawLifecycle(ctx, 560, 840, 800, {
      progress: prog,
      appear: 1,
      alpha: lA,
      t,
      size: 18,
      highlight: lt > CLICK + 0.8 ? 'Approved' : null,
    });
  },
};
