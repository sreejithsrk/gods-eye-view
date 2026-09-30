// 05 · Clarification — the Clarification Agent asks only what the project
// knowledge cannot answer. Avoided questions are shown resolved from
// context, and requirement completeness climbs 62% → 84% → 97%.

import {
  C,
  text,
  glass,
  pill,
  iconTile,
  rr,
  rgba,
  measure,
  checkCircle,
} from '../render/draw.js';
import { drawCursor, cursorPos } from '../components/Cursor.js';
import { tileRect } from './orchestration.js';
import { seg, E, clamp } from '../animation/easing.js';
import { morphRect } from '../animation/transitions.js';

export const CHAT = { x: 170, y: 150, w: 1000, h: 790, r: 24 };
const COMP = { x: 1230, y: 150, w: 520, h: 300, r: 22 };
const KNOWN = { x: 1230, y: 480, w: 520, h: 460, r: 22 };

const QS = [
  {
    q: 'Should copied sizing retain the original owner?',
    opts: ['Yes', 'No'],
    pick: ['No'],
    answer: 'No',
    y: 250,
    at: 0.45,
    clicks: [1.25],
  },
  {
    q: 'Should attachments also be copied?',
    opts: ['Yes', 'No'],
    pick: ['Yes'],
    answer: 'Yes',
    y: 470,
    at: 1.85,
    clicks: [2.6],
  },
  {
    q: 'Who can perform this action?',
    opts: ['Viewer', 'Engineer', 'Administrator'],
    pick: ['Engineer', 'Administrator'],
    answer: 'Engineer and Administrator',
    y: 690,
    at: 3.2,
    clicks: [3.85, 4.15],
  },
];
const KNOWN_ROWS = [
  {
    q: 'Which service handles sizing?',
    a: 'Sizing Service',
    src: 'source code',
  },
  {
    q: 'Is there an existing copy API?',
    a: 'POST /sizings/{id}/copy',
    src: 'API spec',
  },
  { q: 'What roles exist today?', a: 'RBAC model', src: 'ADO Wiki' },
  {
    q: 'What fields define a sizing?',
    a: 'SizingConfiguration',
    src: 'repository',
  },
];
const answeredAt = (i) => QS[i].clicks[QS[i].clicks.length - 1] + 0.2;

function chipLayout(ctx, q) {
  let x = CHAT.x + 72;
  return q.opts.map((o) => {
    const w = measure(ctx, o, 17, 600) + 40;
    const r = { x, y: q.y + 84, w, h: 42, label: o };
    x += w + 12;
    return r;
  });
}

export function completenessAt(lt) {
  const a = E.inOutCubic(seg(lt, answeredAt(1), answeredAt(1) + 0.6));
  const b = E.inOutCubic(seg(lt, answeredAt(2), answeredAt(2) + 0.6));
  return 62 + 22 * a + 13 * b;
}

export default {
  id: 'clarification',
  pre: 0.7,
  post: 0.6,
  captions: [
    {
      t0: 2.7,
      t1: 6.2,
      text: 'Ask only what is missing.',
      accent: ['only', 'missing.'],
      size: 42,
    },
  ],
  draw(ctx, lt, t) {
    const exit = E.inOutCubic(seg(lt, 6.5, 7.1));
    // Clarification Agent tile expands into the conversation panel.
    const m = E.inOutQuart(seg(lt, -0.7, 0.15));
    const R = morphRect(tileRect(2), CHAT, m);
    const keep = 1 - exit;
    glass(ctx, R, {
      alpha: keep,
      tint: C.violet,
      tintA: 0.1,
      glow: 0.25,
      glowColor: C.violet,
    });
    if (m < 0.5) {
      // tile contents shrink away while it grows
      ctx.save();
      ctx.globalAlpha *= 1 - m * 2;
      iconTile(ctx, 'chat', R.x + 38, R.y + R.h / 2, 40, C.violet);
      text(ctx, 'Clarification Agent', R.x + 70, R.y + R.h / 2, {
        size: 18,
        weight: 650,
      });
      ctx.restore();
    }
    const cA = seg(lt, 0, 0.35) * keep;
    if (cA <= 0) return;
    ctx.save();
    ctx.globalAlpha *= cA;
    // Header
    iconTile(ctx, 'chat', CHAT.x + 48, CHAT.y + 40, 44, C.violet);
    text(ctx, 'Clarification Agent', CHAT.x + 84, CHAT.y + 30, {
      size: 21,
      weight: 700,
    });
    text(
      ctx,
      'REQ-1042 · asking only for missing information',
      CHAT.x + 84,
      CHAT.y + 54,
      { size: 13, mono: true, color: C.text3 },
    );
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.fillRect(CHAT.x + 1, CHAT.y + 82, CHAT.w - 2, 1);

    const chips = QS.map((q) => chipLayout(ctx, q));
    QS.forEach((q, i) => {
      // typing indicator
      const dots = lt > q.at - 0.28 && lt < q.at;
      if (dots) {
        rr(ctx, CHAT.x + 40, q.y, 84, 44, 16);
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fill();
        for (let d = 0; d < 3; d++) {
          ctx.beginPath();
          ctx.arc(CHAT.x + 64 + d * 18, q.y + 22, 4, 0, Math.PI * 2);
          ctx.fillStyle = rgba(
            C.violet,
            0.4 + 0.6 * Math.abs(Math.sin(t * 8 + d)),
          );
          ctx.fill();
        }
      }
      const bA = E.outCubic(seg(lt, q.at, q.at + 0.3));
      if (bA <= 0) return;
      // assistant bubble
      const w = measure(ctx, q.q, 22, 550) + 48;
      ctx.save();
      ctx.globalAlpha *= bA;
      ctx.translate(0, (1 - bA) * 14);
      iconTile(ctx, 'agent', CHAT.x + 58, q.y + 29, 30, C.violet, 1, 0.2);
      rr(ctx, CHAT.x + 84 - 12, q.y, w, 58, 18);
      ctx.fillStyle = 'rgba(169,139,255,0.1)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(169,139,255,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
      text(ctx, q.q, CHAT.x + 84 + 12, q.y + 29, { size: 22, weight: 550 });
      ctx.restore();
      // option chips
      chips[i].forEach((c, k) => {
        const ca = E.outBack(
          seg(lt, q.at + 0.15 + k * 0.06, q.at + 0.45 + k * 0.06),
        );
        if (ca <= 0) return;
        const clickIdx = q.pick.indexOf(c.label);
        const picked = clickIdx >= 0 && lt > q.clicks[clickIdx];
        const done = lt > answeredAt(i);
        const dim = done && !picked ? 0.4 : 1;
        ctx.save();
        ctx.globalAlpha *= clamp(ca) * dim;
        ctx.translate(c.x + c.w / 2, c.y + c.h / 2);
        const press =
          clickIdx >= 0
            ? 1 -
              0.06 * Math.sin(clamp((lt - q.clicks[clickIdx]) / 0.18) * Math.PI)
            : 1;
        ctx.scale(ca * press, ca * press);
        rr(ctx, -c.w / 2, -c.h / 2, c.w, c.h, c.h / 2);
        ctx.fillStyle = picked ? rgba(C.cyan, 0.9) : 'rgba(255,255,255,0.05)';
        ctx.fill();
        ctx.strokeStyle = picked ? rgba(C.cyan, 1) : 'rgba(255,255,255,0.22)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        text(ctx, c.label, 0, 1, {
          size: 17,
          weight: 650,
          align: 'center',
          color: picked ? '#07101f' : C.text,
        });
        ctx.restore();
      });
      // user answer
      const uA = E.outCubic(seg(lt, answeredAt(i), answeredAt(i) + 0.3));
      if (uA > 0) {
        const uw = measure(ctx, q.answer, 20, 600) + 40;
        const ux = CHAT.x + CHAT.w - 40 - uw;
        const uy = q.y + 142;
        ctx.save();
        ctx.globalAlpha *= uA;
        ctx.translate((1 - uA) * 20, 0);
        rr(ctx, ux, uy, uw, 48, 18);
        ctx.fillStyle = rgba(C.cyan, 0.18);
        ctx.fill();
        ctx.strokeStyle = rgba(C.cyan, 0.45);
        ctx.stroke();
        text(ctx, q.answer, ux + 20, uy + 24, { size: 20, weight: 600 });
        ctx.restore();
      }
    });

    // Cursor visits each chosen option
    const keys = [{ t: 0.6, x: 900, y: 860 }];
    QS.forEach((q, i) =>
      q.pick.forEach((p, k) => {
        const c = chips[i].find((cc) => cc.label === p);
        keys.push({
          t: q.clicks[k] - 0.02,
          x: c.x + c.w / 2 + 6,
          y: c.y + c.h / 2 + 6,
        });
        keys.push({
          t: q.clicks[k] + 0.15,
          x: c.x + c.w / 2 + 6,
          y: c.y + c.h / 2 + 6,
        });
      }),
    );
    const pos = cursorPos(lt, keys);
    const lastClick =
      [...QS.flatMap((q) => q.clicks)].filter((c) => c <= lt + 0.001).pop() ??
      -9;
    drawCursor(ctx, pos.x, pos.y, lt, {
      alpha: seg(lt, 0.6, 0.9) * (1 - seg(lt, 4.5, 4.9)),
      clickAt: lastClick,
    });
    ctx.restore();

    // Completeness ring
    const rIn = E.outCubic(seg(lt, 0.1, 0.6)) * keep;
    if (rIn > 0) {
      withSlide(ctx, rIn, () => {
        glass(ctx, COMP, { tint: C.cyan, tintA: 0.1 });
        text(ctx, 'REQUIREMENT COMPLETENESS', COMP.x + 30, COMP.y + 38, {
          size: 13,
          mono: true,
          color: C.text3,
          ls: 2,
        });
        const v = completenessAt(lt);
        const col = v < 80 ? C.amber : v < 95 ? C.cyan : C.green;
        const cx = COMP.x + 130,
          cy = COMP.y + 172,
          r = 78;
        ctx.lineCap = 'round';
        ctx.lineWidth = 12;
        ctx.strokeStyle = 'rgba(255,255,255,0.07)';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = col;
        ctx.shadowColor = rgba(col, 0.6);
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(
          cx,
          cy,
          r,
          -Math.PI / 2,
          -Math.PI / 2 + Math.PI * 2 * (v / 100) * rIn,
        );
        ctx.stroke();
        ctx.shadowColor = 'transparent';
        text(ctx, `${Math.round(v)}%`, cx, cy + 2, {
          size: 44,
          weight: 700,
          align: 'center',
          color: C.text,
        });
        // steps
        const steps = [
          ['62%', 'from project context', 0],
          ['84%', 'after 2 answers', answeredAt(1)],
          ['97%', 'after 3 answers', answeredAt(2)],
        ];
        steps.forEach(([val, l, when], k) => {
          const y = COMP.y + 116 + k * 50;
          const on = lt > when + 0.3 || k === 0;
          text(ctx, val, COMP.x + 262, y, {
            size: 22,
            weight: 700,
            mono: true,
            color: on ? [C.amber, C.cyan, C.green][k] : C.text3,
            alpha: on ? 1 : 0.5,
          });
          text(ctx, l, COMP.x + 336, y, {
            size: 15,
            color: on ? C.text2 : C.text3,
            alpha: on ? 1 : 0.5,
          });
        });
        const ready = seg(lt, answeredAt(2) + 0.6, answeredAt(2) + 0.9);
        pill(ctx, COMP.x + COMP.w - 28, COMP.y + 38, 'Ready to specify', {
          size: 13,
          align: 'right',
          bg: C.green,
          color: C.green,
          alpha: ready,
          dot: C.green,
          h: 28,
        });
      });
    }
    // Known — not asked
    const kIn = E.outCubic(seg(lt, 0.25, 0.75)) * keep;
    if (kIn > 0) {
      withSlide(ctx, kIn, () => {
        glass(ctx, KNOWN, { tint: C.green, tintA: 0.08 });
        text(ctx, 'ALREADY KNOWN — NOT ASKED', KNOWN.x + 30, KNOWN.y + 38, {
          size: 13,
          mono: true,
          color: C.text3,
          ls: 2,
        });
        const n = KNOWN_ROWS.filter((_, i) => lt > 0.9 + i * 0.5 + 0.35).length;
        text(ctx, `${n} avoided`, KNOWN.x + KNOWN.w - 30, KNOWN.y + 38, {
          size: 14,
          mono: true,
          color: C.green,
          align: 'right',
          weight: 600,
        });
        KNOWN_ROWS.forEach((r, i) => {
          const t0 = 0.9 + i * 0.5;
          const a = E.outCubic(seg(lt, t0, t0 + 0.3));
          if (a <= 0) return;
          const y = KNOWN.y + 96 + i * 88;
          ctx.save();
          ctx.globalAlpha *= a;
          const qw = text(ctx, r.q, KNOWN.x + 30, y, {
            size: 18,
            color: C.text2,
          });
          const sp = E.inOutCubic(seg(lt, t0 + 0.3, t0 + 0.6));
          ctx.fillStyle = rgba(C.rose, 0.85);
          ctx.fillRect(KNOWN.x + 28, y, (qw + 4) * sp, 2);
          const aa = seg(lt, t0 + 0.45, t0 + 0.75);
          checkCircle(ctx, KNOWN.x + 40, y + 34, 9, aa, C.green);
          text(ctx, r.a, KNOWN.x + 60, y + 34, {
            size: 16,
            mono: true,
            color: C.green,
            alpha: aa,
            weight: 600,
          });
          const aw = measure(ctx, r.a, 16, 600, true);
          text(ctx, `· from ${r.src}`, KNOWN.x + 68 + aw, y + 34, {
            size: 15,
            color: C.text3,
            alpha: aa,
          });
          ctx.restore();
        });
      });
    }
  },
};

function withSlide(ctx, p, draw) {
  ctx.save();
  ctx.globalAlpha *= p;
  ctx.translate((1 - p) * 60, 0);
  draw();
  ctx.restore();
}
