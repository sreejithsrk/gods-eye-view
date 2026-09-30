// 03 · Requirement — the user types a need; the sentence compresses into a
// unique requirement ID, which expands into a persistent workspace with its
// own lifecycle.

import {
  C,
  text,
  glass,
  measure,
  pill,
  icon,
  rgba,
  scramble,
  dot,
} from '../render/draw.js';
import { drawAppWindow, drawComposer, APP } from '../components/AppWindow.js';
import { drawLifecycle, statusPill } from '../components/RequirementBadge.js';
import { seg, E, lerp, clamp, hash, fract } from '../animation/easing.js';
import { morphRect, centerRect } from '../animation/transitions.js';
import { SCENE } from '../animation/timeline.js';

export const SENTENCE =
  'We need to support copying an existing product sizing configuration.';
export const WORKSPACE = { x: 480, y: 250, w: 960, h: 390, r: 24 };
const COMPOSER = {
  x: APP.x + 170,
  y: APP.y + APP.h - 150,
  w: APP.w - 340,
  h: 68,
  r: 34,
};
const BADGE = centerRect(960, 450, 400, 130, 22);

export function drawWorkspace(
  ctx,
  R,
  a,
  t,
  statusFrom = 'Discovery',
  statusTo = null,
  statusP = 0,
) {
  if (a <= 0.002) return;
  glass(ctx, R, {
    alpha: a,
    tint: C.cyan,
    tintA: 0.12,
    glow: 0.35,
    glowColor: C.cyan,
    border: 0.2,
  });
  const k = R.w / WORKSPACE.w;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.translate(R.x, R.y);
  ctx.scale(k, R.h / WORKSPACE.h);
  text(ctx, 'REQ-1042', 44, 56, { size: 30, weight: 700, mono: true, ls: 1 });
  statusPill(ctx, 232, 56, statusFrom, statusTo ?? statusFrom, statusP, {
    size: 15,
  });
  pill(ctx, WORKSPACE.w - 40, 56, 'Persistent workspace · versioned', {
    size: 14,
    align: 'right',
    bg: C.indigo,
    color: C.text2,
    icon: (c, x, y, s) => icon(c, 'lock', x, y, s, C.indigo),
    weight: 500,
  });
  text(ctx, 'Copy existing product sizing configuration', 44, 128, {
    size: 32,
    weight: 650,
    ls: -0.4,
  });
  text(ctx, `“${SENTENCE}”`, 44, 174, { size: 17, color: C.text3 });
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  ctx.fillRect(44, 214, WORKSPACE.w - 88, 1);
  const cols = [
    ['PROJECT', 'Level Product Advisor'],
    ['REQUESTED BY', 'Product Owner'],
    ['CONTEXT', '8 sources linked'],
    ['HISTORY', 'Every change audited'],
  ];
  cols.forEach(([l, v], i) => {
    const x = 44 + i * 222;
    text(ctx, l, x, 256, { size: 12, mono: true, color: C.text3, ls: 2 });
    text(ctx, v, x, 288, { size: 18, weight: 600, color: C.text });
  });
  // subtle activity line
  text(
    ctx,
    'workspace://level-product-advisor/requirements/REQ-1042',
    44,
    344,
    { size: 13, mono: true, color: rgba(C.cyan, 0.7) },
  );
  ctx.restore();
}

export default {
  id: 'requirement',
  pre: 0.7,
  post: 0.7,
  captions: [
    {
      t0: 4.5,
      t1: 6.3,
      text: 'Every requirement gets a unique lifecycle.',
      accent: ['unique', 'lifecycle.'],
    },
  ],
  draw(ctx, lt, t) {
    const S = SCENE.requirement;
    const enter = E.outCubic(seg(lt, -0.4, 0.35));
    const exit = E.inOutCubic(seg(lt, S.dur - 0.1, S.dur + 0.6));
    const ws = lerp(0.94, 1, enter) * (1 + 0.06 * exit);
    // App window
    ctx.save();
    ctx.translate(960, 540);
    ctx.scale(ws, ws);
    ctx.translate(-960, -540);
    const winA = enter * (1 - exit);
    drawAppWindow(ctx, APP, t, {
      alpha: winA,
      project: 'Level Product Advisor',
      rightChips: [{ label: 'Knowledge indexed', color: C.green }],
    });
    ctx.save();
    ctx.globalAlpha *= winA;
    // Greeting (project-aware)
    const gA = seg(lt, 0, 0.5) * (1 - seg(lt, 2.5, 3.0));
    text(
      ctx,
      'What would you like to build in Level Product Advisor?',
      960,
      350,
      { size: 32, weight: 600, align: 'center', alpha: gA, ls: -0.4 },
    );
    text(
      ctx,
      'Grounded in 8 connected sources · 48,312 indexed chunks',
      960,
      400,
      { size: 15, mono: true, color: C.text3, align: 'center', alpha: gA },
    );
    // Composer + typing
    const typed = Math.floor(SENTENCE.length * seg(lt, 0.55, 2.35));
    const sent = lt > 2.55;
    const caret = !sent && fract(t * 1.6) < 0.6;
    const cA = 1 - seg(lt, 3.1, 3.5);
    drawComposer(ctx, COMPOSER, {
      alpha: cA,
      focus: seg(lt, 0.2, 0.5),
      value: sent ? '' : SENTENCE.slice(0, typed),
      caret,
    });
    ctx.restore();
    ctx.restore();

    // Message flight: composer → bubble → REQ badge → workspace
    const tw = measure(ctx, SENTENCE, 22, 500);
    const bubbleFrom = {
      x: COMPOSER.x + 50,
      y: COMPOSER.y + 4,
      w: tw + 30,
      h: COMPOSER.h - 8,
      r: 30,
    };
    const bubbleTo = centerRect(960, 450, tw + 60, 72, 24);
    const fly = E.inOutQuart(seg(lt, 2.55, 3.15));
    const toBadge = E.inOutQuart(seg(lt, 3.2, 4.0));
    const toWs = E.inOutQuart(seg(lt, 4.1, 4.9));
    if (lt > 2.55 && lt < S.dur) {
      let R = morphRect(bubbleFrom, bubbleTo, fly);
      if (toBadge > 0) R = morphRect(R, BADGE, toBadge);
      if (toWs > 0) R = morphRect(R, WORKSPACE, toWs);
      const bubbleA = 1 - seg(toBadge, 0.3, 0.7);
      // shell
      glass(ctx, R, {
        alpha: 1 - toWs,
        tint: C.cyan,
        tintA: 0.14 + 0.1 * toBadge,
        glow: toBadge * 0.8,
        glowColor: C.cyan,
        border: 0.2,
      });
      // sentence: characters converge into the centre as the ID resolves
      if (bubbleA > 0) {
        let x = R.x + R.w / 2 - tw / 2;
        const cyy = R.y + R.h / 2;
        for (let i = 0; i < SENTENCE.length; i++) {
          const ch = SENTENCE[i];
          const w = measure(ctx, ch, 22, 500);
          const d = clamp(toBadge * 1.6 - hash(i) * 0.6);
          const px = lerp(x, R.x + R.w / 2, E.inCubic(d));
          const py = cyy + Math.sin(i * 1.3) * 26 * Math.sin(d * Math.PI);
          text(ctx, ch, px, py, {
            size: 22,
            weight: 500,
            alpha: (1 - d) * bubbleA,
          });
          if (d > 0.2 && d < 0.95 && i % 3 === 0)
            dot(ctx, px, py, 1.6, C.cyan, 0.8 * (1 - d));
          x += w;
        }
      }
      // badge content
      const idP = seg(lt, 3.35, 4.0);
      const badgeA = seg(toBadge, 0.45, 0.8) * (1 - seg(toWs, 0, 0.35));
      if (badgeA > 0) {
        text(
          ctx,
          scramble('REQ-1042', idP, 5),
          R.x + R.w / 2,
          R.y + R.h * 0.4,
          {
            size: 46,
            weight: 700,
            mono: true,
            align: 'center',
            ls: 2,
            alpha: badgeA,
          },
        );
        pill(ctx, R.x + R.w / 2, R.y + R.h * 0.76, 'Status: Discovery', {
          size: 16,
          align: 'center',
          bg: C.amber,
          color: C.amber,
          dot: C.amber,
          alpha: badgeA * seg(lt, 3.75, 4.0),
          weight: 650,
        });
      }
      if (toWs > 0) drawWorkspace(ctx, R, seg(toWs, 0.45, 1), t);
    }
    // Lifecycle
    const lcA = seg(lt, 4.55, 4.9) * (1 - exit);
    if (lcA > 0) {
      text(ctx, 'LIFECYCLE', 960, 700, {
        size: 13,
        mono: true,
        color: C.text3,
        align: 'center',
        ls: 3,
        alpha: lcA,
      });
      drawLifecycle(ctx, 560, 750, 800, {
        progress: 0,
        appear: E.outCubic(seg(lt, 4.6, 5.4)),
        alpha: lcA,
        t,
        size: 18,
      });
    }
  },
};
