// 12 · Architecture — the camera pulls back from the UI to reveal the whole
// platform as one living system, with information flowing continuously.

import {
  C,
  text,
  glass,
  iconTile,
  link,
  flow,
  pill,
  softGlow,
} from '../render/draw.js';
import { UI_NODE } from './dashboard.js';
import { seg, E, clamp, lerp, hash } from '../animation/easing.js';
import { centerRect } from '../animation/transitions.js';

const NW = 300,
  NH = 78;
const R1 = 250,
  R2 = 540,
  R3 = 820;
export const NODES = {
  user: {
    x: 230,
    y: R1,
    label: 'User / Product Owner',
    icon: 'user',
    color: C.cyan,
  },
  ui: {
    x: 600,
    y: R1,
    label: 'Requirements Intelligence UI',
    icon: 'dashboard',
    color: C.cyan,
  },
  orch: {
    x: 970,
    y: R1,
    label: 'AI Orchestration',
    icon: 'orchestrator',
    color: C.violet,
  },
  know: {
    x: 1450,
    y: R1,
    label: 'Project Knowledge',
    icon: 'layers',
    color: C.indigo,
    group: true,
  },
  search: {
    x: 1450,
    y: R2,
    label: 'Azure AI Search',
    icon: 'search',
    color: C.cyan,
  },
  engine: {
    x: 970,
    y: R2,
    label: 'Requirement Intelligence Engine',
    icon: 'agent',
    color: C.violet,
  },
  approval: {
    x: 600,
    y: R2,
    label: 'Human Approval',
    icon: 'users',
    color: C.green,
    sub: 'control point',
  },
  mcp: {
    x: 230,
    y: R2,
    label: 'Azure DevOps MCP',
    icon: 'plug',
    color: C.blue,
  },
  agents: {
    x: 230,
    y: R3,
    label: 'Engineering Agents',
    icon: 'agent',
    color: C.violet,
  },
  github: { x: 580, y: R3, label: 'GitHub', icon: 'git', color: C.text },
  cicd: { x: 930, y: R3, label: 'CI/CD', icon: 'gear', color: C.amber },
  aks: {
    x: 1280,
    y: R3,
    label: 'AKS / App Service',
    icon: 'cube',
    color: C.blue,
  },
  prod: { x: 1630, y: R3, label: 'Production', icon: 'rocket', color: C.green },
};
const ORDER = [
  'user',
  'ui',
  'orch',
  'know',
  'search',
  'engine',
  'approval',
  'mcp',
  'agents',
  'github',
  'cicd',
  'aks',
  'prod',
];
const KNOW_R = { x: 1450 - 220, y: R1 - 88, w: 440, h: 176, r: 20 };
const KSRC = [
  'GitHub',
  'Azure DevOps',
  'Wiki',
  'API Docs',
  'Architecture',
  'Historical Reqs',
];

function nodeEdge(id, side) {
  const n = NODES[id];
  const hw = n.group ? KNOW_R.w / 2 : NW / 2,
    hh = n.group ? KNOW_R.h / 2 : NH / 2;
  if (side === 'r') return { x: n.x + hw, y: n.y };
  if (side === 'l') return { x: n.x - hw, y: n.y };
  if (side === 't') return { x: n.x, y: n.y - hh };
  return { x: n.x, y: n.y + hh };
}
// Main serpentine flow path, segment by segment
const SEGS = [
  ['user', 'r', 'ui', 'l'],
  ['ui', 'r', 'orch', 'l'],
  ['orch', 'r', 'know', 'l'],
  ['know', 'b', 'search', 't'],
  ['search', 'l', 'engine', 'r'],
  ['engine', 'l', 'approval', 'r'],
  ['approval', 'l', 'mcp', 'r'],
  ['mcp', 'b', 'agents', 't'],
  ['agents', 'r', 'github', 'l'],
  ['github', 'r', 'cicd', 'l'],
  ['cicd', 'r', 'aks', 'l'],
  ['aks', 'r', 'prod', 'l'],
].map(([a, sa, b, sb]) => [nodeEdge(a, sa), nodeEdge(b, sb)]);
const MAIN = [];
SEGS.forEach(([a, b]) => {
  MAIN.push(a, b);
});
const RETRIEVAL = [
  nodeEdge('orch', 'b'),
  { x: 970, y: 380 },
  { x: 1300, y: 380 },
  nodeEdge('search', 'l'),
].slice(0);
const FEEDBACK = [
  nodeEdge('prod', 'r'),
  { x: 1850, y: R3 },
  { x: 1850, y: R1 },
  nodeEdge('know', 'r'),
];

// Node appear time follows the order of the flow
const appearAt = (id) => 0.35 + ORDER.indexOf(id) * 0.14;
export const FOCUS = {
  x: UI_NODE.x + UI_NODE.w / 2,
  y: UI_NODE.y + UI_NODE.h / 2,
};

export default {
  id: 'architecture',
  pre: 0,
  post: 1.2,
  captions: [
    {
      t0: 2.4,
      t1: 5.3,
      text: 'One governed platform — from conversation to production.',
      accent: ['governed', 'platform'],
    },
  ],
  draw(ctx, lt, t) {
    // Camera pull-back from the UI node
    const pull = E.inOutCubic(seg(lt, 0.15, 1.9));
    const z = lerp(1.9, 1, pull);
    const fx = lerp(FOCUS.x, 960, pull),
      fy = lerp(FOCUS.y, 540, pull);
    const collapse = E.inOutQuart(seg(lt, 5.5, 6.6));
    ctx.save();
    ctx.translate(960, 540);
    ctx.scale(z, z);
    ctx.translate(-fx, -fy);
    const keep = 1 - seg(collapse, 0.55, 1);
    const pos = (id) => {
      const n = NODES[id];
      if (collapse <= 0) return { x: n.x, y: n.y, s: 1 };
      const tgt = { x: 960, y: 420 };
      const d = clamp(collapse * 1.3 - hash(ORDER.indexOf(id)) * 0.3);
      return {
        x: lerp(n.x, tgt.x, E.inOutCubic(d)),
        y: lerp(n.y, tgt.y, E.inOutCubic(d)),
        s: 1 - d * 0.8,
      };
    };

    // Row labels
    [
      ['CAPTURE & UNDERSTAND', R1],
      ['REASON & GOVERN', R2],
      ['EXECUTE & DELIVER', R3],
    ].forEach(([l, y], i) => {
      text(ctx, l, 90, y - 76, {
        size: 13,
        mono: true,
        color: C.text3,
        ls: 3,
        alpha: seg(lt, 1.2 + i * 0.3, 1.6 + i * 0.3) * (1 - collapse),
      });
    });

    // Links
    const lkA = 1 - seg(collapse, 0, 0.3);
    SEGS.forEach(([a, b], k) => {
      const t0 = 0.35 + k * 0.14;
      const pts = [a, b];
      link(ctx, pts, {
        p: E.outCubic(seg(lt, t0, t0 + 0.3)),
        color: C.indigo,
        alpha: lkA * 0.8,
        width: 1.6,
        glow: 0.2,
      });
    });
    link(ctx, RETRIEVAL, {
      p: seg(lt, 1.6, 2.2),
      color: C.cyan,
      alpha: lkA * 0.7,
      width: 1.4,
      dash: [5, 6],
      t,
      glow: 0,
    });
    link(ctx, FEEDBACK, {
      p: seg(lt, 2.2, 2.9),
      color: C.green,
      alpha: lkA * 0.6,
      width: 1.4,
      dash: [5, 6],
      t,
      glow: 0,
    });
    const lblA = seg(lt, 2.4, 2.8) * lkA;
    text(ctx, 'retrieval (RAG)', 1135, 366, {
      size: 13,
      mono: true,
      color: C.cyan,
      align: 'center',
      alpha: lblA,
    });
    ctx.save();
    ctx.translate(1872, 540);
    ctx.rotate(-Math.PI / 2);
    text(ctx, 'release history · production insights', 0, 0, {
      size: 13,
      mono: true,
      color: C.green,
      align: 'center',
      alpha: lblA,
    });
    ctx.restore();
    // Continuous flow
    const fA = seg(lt, 1.2, 2.0) * lkA;
    if (fA > 0) {
      SEGS.forEach(([a, b], k) =>
        flow(ctx, [a, b], t, {
          count: 3,
          speed: 0.9,
          color: [C.cyan, C.violet, C.blue][k % 3],
          size: 2.6,
          alpha: fA,
          seed: k * 11,
        }),
      );
      flow(ctx, RETRIEVAL, t, {
        count: 4,
        speed: 0.5,
        color: C.cyan,
        size: 2.2,
        alpha: fA * 0.8,
        seed: 301,
      });
      flow(ctx, FEEDBACK, t, {
        count: 5,
        speed: 0.3,
        color: C.green,
        size: 2.2,
        alpha: fA * 0.8,
        seed: 401,
      });
    }

    // Nodes
    ORDER.forEach((id) => {
      const n = NODES[id];
      const a0 = id === 'ui' ? -1 : appearAt(id);
      const ap = id === 'ui' ? 1 : E.outBack(seg(lt, a0, a0 + 0.4));
      if (ap <= 0) return;
      const p = pos(id);
      const s = clamp(ap) * p.s;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(s, s);
      if (n.group) {
        const R = { ...KNOW_R, x: -KNOW_R.w / 2, y: -KNOW_R.h / 2 };
        glass(ctx, R, { alpha: keep, tint: n.color, tintA: 0.14 });
        ctx.globalAlpha *= keep;
        text(ctx, 'PROJECT KNOWLEDGE', R.x + 24, R.y + 30, {
          size: 13,
          mono: true,
          color: C.text3,
          ls: 2.5,
        });
        KSRC.forEach((k, i) => {
          const cx = R.x + 24 + (i % 3) * 136,
            cy = R.y + 80 + Math.floor(i / 3) * 50;
          pill(ctx, cx, cy, k, {
            size: 14,
            bg: C.indigo,
            color: C.text2,
            alpha: seg(lt, a0 + 0.2 + i * 0.05, a0 + 0.4 + i * 0.05),
            h: 34,
            padX: 12,
          });
        });
      } else {
        const R = centerRect(0, 0, NW, NH, 18);
        const hot =
          id === 'approval'
            ? 0.7 + 0.3 * Math.sin(t * 3)
            : id === 'ui'
              ? 0.6 * (1 - pull) + 0.3
              : 0.2;
        if (id === 'approval') softGlow(ctx, 0, 0, 200, C.green, 0.16 * keep);
        glass(ctx, R, {
          alpha: keep,
          tint: n.color,
          tintA: 0.14,
          glow: hot,
          glowColor: n.color,
        });
        ctx.globalAlpha *= keep;
        iconTile(
          ctx,
          n.icon,
          R.x + 36,
          0,
          42,
          n.color === C.text ? C.cyan : n.color,
        );
        if (n.sub) {
          text(ctx, n.label, R.x + 68, -10, { size: 17, weight: 700 });
          text(ctx, n.sub, R.x + 68, 14, {
            size: 13,
            mono: true,
            color: C.green,
          });
        } else
          text(ctx, n.label, R.x + 68, 1, {
            size: n.label.length > 22 ? 15 : 17,
            weight: 700,
          });
      }
      ctx.restore();
    });
    ctx.restore();
  },
};
