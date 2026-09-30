// 10 · Traceability — zoom out to one connected chain from business idea to
// production release; a single glowing trace passes through every link.

import {
  C,
  text,
  glass,
  iconTile,
  link,
  rgba,
  dot,
  pointAt,
  strokeSub,
  softGlow,
} from '../render/draw.js';
import { PR_R } from './development.js';
import { seg, E, clamp, lerp } from '../animation/easing.js';
import { morphRect, centerRect } from '../animation/transitions.js';

export const CHAIN = [
  ['Business Idea', '“copy a sizing”', 'bulb', C.amber],
  ['REQ-1042', 'unique · persistent', 'doc', C.cyan],
  ['Approved Requirement', 'v1.0 · PO + Architect', 'check', C.green],
  ['Feature', 'FEATURE-448', 'board', C.violet],
  ['User Stories', 'US-1201 … 1205', 'board', C.blue],
  ['Tasks', 'TASK-4501 … 4506', 'board', C.yellow],
  ['Source Code', '6 files · +184 −12', 'code', C.cyan],
  ['Pull Request', '#842 · linked', 'pr', C.violet],
  ['Build', '#2291 · passed', 'gear', C.green],
  ['Deployment', 'AKS · staging → prod', 'cube', C.blue],
  ['Release', 'v4.3.0', 'flag', C.green],
];
const Y1 = 400,
  Y2 = 690;
export const chainPos = (i) =>
  i < 6 ? { x: 250 + i * 284, y: Y1 } : { x: 1528 - (i - 6) * 284, y: Y2 };
const NW = 236,
  NH = 80;

function buildPath() {
  const pts = [];
  for (let i = 0; i < 6; i++) pts.push(chainPos(i));
  // U-turn on the right
  const cx = 1800,
    r = (Y2 - Y1) / 2;
  for (let k = 1; k < 24; k++) {
    const ang = -Math.PI / 2 + (k / 24) * Math.PI;
    pts.push({
      x: cx - 40 + Math.cos(ang) * 60,
      y: Y1 + r + Math.sin(ang) * r,
    });
  }
  for (let i = 6; i < 11; i++) pts.push(chainPos(i));
  return pts;
}
export const PATH = buildPath();
// Fraction along the path at which each node sits.
const NODE_U = (() => {
  const L = [0];
  for (let i = 1; i < PATH.length; i++)
    L.push(
      L[i - 1] +
        Math.hypot(PATH[i].x - PATH[i - 1].x, PATH[i].y - PATH[i - 1].y),
    );
  const tot = L[L.length - 1];
  return CHAIN.map((_, i) => {
    const p = chainPos(i);
    let best = 0,
      bd = 1e9;
    PATH.forEach((q, k) => {
      const d = Math.hypot(q.x - p.x, q.y - p.y);
      if (d < bd) {
        bd = d;
        best = k;
      }
    });
    return L[best] / tot;
  });
})();

export function drawChainNode(ctx, i, x, y, o = {}) {
  const { alpha = 1, lit = 0, scale = 1 } = o;
  const [label, sub, ic, col] = CHAIN[i];
  if (alpha <= 0.002) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const R = centerRect(0, 0, NW, NH, 18);
  if (lit > 0) softGlow(ctx, 0, 0, 170, col, 0.18 * lit);
  glass(ctx, R, {
    alpha,
    tint: col,
    tintA: 0.1 + 0.16 * lit,
    glow: 0.7 * lit,
    glowColor: col,
    border: 0.14,
  });
  ctx.globalAlpha *= alpha;
  iconTile(ctx, ic, R.x + 34, 0, 38, col);
  text(ctx, label, R.x + 64, -11, {
    size: label.length > 16 ? 16 : 18,
    weight: 700,
  });
  text(ctx, sub, R.x + 64, 14, {
    size: 13,
    mono: true,
    color: lit > 0.5 ? C.text2 : C.text3,
  });
  ctx.restore();
}

export default {
  id: 'traceability',
  pre: 0,
  post: 0.4,
  captions: [
    {
      t0: 0.9,
      t1: 2.7,
      text: 'End-to-end traceability',
      accent: ['traceability'],
      size: 42,
    },
    {
      t0: 2.9,
      t1: 4.8,
      text: 'Know WHY every code change exists.',
      accent: ['WHY'],
      size: 42,
    },
  ],
  draw(ctx, lt, t) {
    const zoom = lerp(1.1, 1, E.outCubic(seg(lt, 0, 1.4)));
    const exit = E.inOutCubic(seg(lt, 4.7, 5.4));
    ctx.save();
    ctx.translate(960, 545);
    ctx.scale(zoom, zoom);
    ctx.translate(-960, -545);
    const keep = 1 - exit;
    text(ctx, 'TRACEABILITY GRAPH · REQ-1042', 960, 262, {
      size: 14,
      mono: true,
      color: C.text3,
      align: 'center',
      ls: 3,
      alpha: seg(lt, 0.4, 0.9) * keep,
    });
    // base path
    link(ctx, PATH, {
      p: E.inOutCubic(seg(lt, 0.5, 1.2)),
      color: C.indigo,
      alpha: 0.5 * keep * keep,
      width: 1.4,
      glow: 0,
      dash: [4, 7],
      t,
      dashSpeed: 20,
    });
    // glowing trace
    const head = E.inOutCubic(seg(lt, 1.1, 3.6));
    if (head > 0) {
      ctx.save();
      ctx.globalAlpha *= keep * keep;
      ctx.lineCap = 'round';
      ctx.strokeStyle = rgba(C.cyan, 0.25);
      ctx.lineWidth = 12;
      strokeSub(ctx, PATH, 0, head);
      ctx.strokeStyle = rgba(C.cyan, 0.95);
      ctx.lineWidth = 2.6;
      strokeSub(ctx, PATH, 0, head);
      ctx.restore();
      if (head < 1) {
        const hp = pointAt(PATH, head);
        dot(ctx, hp.x, hp.y, 7, C.cyan, keep);
      }
    }
    CHAIN.forEach((_, i) => {
      let p = chainPos(i);
      const ap = E.outBack(seg(lt, 0.45 + i * 0.05, 0.85 + i * 0.05));
      const lit = seg(head, NODE_U[i] - 0.01, NODE_U[i] + 0.03);
      let scale = clamp(ap);
      let alpha = clamp(ap) * keep;
      // exit: converge into the dashboard's requirement card
      if (exit > 0) {
        p = { x: lerp(p.x, 660, exit), y: lerp(p.y, 640, exit) };
        scale *= 1 - 0.6 * exit;
      }
      if (i === 7) {
        // Pull Request node materialises out of the PR card from the previous scene
        const m = E.inOutQuart(seg(lt, 0, 0.8));
        if (m < 1) {
          const R = morphRect(PR_R, centerRect(p.x, p.y, NW, NH, 18), m);
          glass(ctx, R, {
            alpha: 1 - m * 0.5,
            tint: C.violet,
            tintA: 0.2,
            glow: 0.6,
            glowColor: C.violet,
          });
          ctx.save();
          ctx.globalAlpha *= 1 - seg(m, 0.4, 0.9);
          iconTile(ctx, 'pr', R.x + 34, R.y + R.h / 2, 38, C.violet);
          text(ctx, 'Pull Request #842', R.x + 64, R.y + R.h / 2 - 10, {
            size: 18,
            weight: 700,
          });
          text(ctx, 'linked · REQ-1042', R.x + 64, R.y + R.h / 2 + 14, {
            size: 13,
            mono: true,
            color: C.cyan,
          });
          ctx.restore();
          alpha *= seg(m, 0.5, 1);
          scale = 1;
        }
      }
      drawChainNode(ctx, i, p.x, p.y, { alpha, lit, scale });
    });
    ctx.restore();
  },
};
