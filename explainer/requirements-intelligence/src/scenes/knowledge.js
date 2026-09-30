// 02 · Knowledge — the selected project becomes the centre of a knowledge
// graph; enterprise sources stream into the Enterprise Knowledge Layer and
// are chunked, embedded and indexed into Azure AI Search.

import {
  C,
  text,
  pill,
  glass,
  iconTile,
  icon,
  link,
  flow,
  hcurve,
  rgba,
  rr,
  dot,
  softGlow,
  measure,
} from '../render/draw.js';
import { drawNode } from '../components/Node.js';
import {
  drawProjectCard,
  PROJECTS,
  CARD_W,
  CARD_H,
} from '../components/ProjectCard.js';
import { SELECTED, SELECTED_SCALE } from './project.js';
import {
  seg,
  E,
  lerp,
  clamp,
  spring,
  stagger,
  fract,
  hash,
} from '../animation/easing.js';
import { morphRect, centerRect, withMask } from '../animation/transitions.js';

const SRC = [
  {
    label: 'GitHub / Source Code',
    sub: '14 repos · 38k files',
    icon: 'git',
    color: C.cyan,
  },
  {
    label: 'Azure DevOps',
    sub: '2,410 work items',
    icon: 'board',
    color: C.blue,
  },
  { label: 'Wiki', sub: '612 pages', icon: 'book', color: C.violet },
  {
    label: 'API Specifications',
    sub: '96 endpoints',
    icon: 'api',
    color: C.cyan,
  },
  {
    label: 'Architecture Docs',
    sub: '41 ADRs & diagrams',
    icon: 'layers',
    color: C.indigo,
  },
  {
    label: 'Historical Requirements',
    sub: '1,180 requirements',
    icon: 'history',
    color: C.green,
  },
  {
    label: 'Production Insights',
    sub: 'telemetry · incidents',
    icon: 'pulse',
    color: C.amber,
  },
];
const CENTER = { x: 960, y: 520 };
function srcPos(i) {
  const ang = -Math.PI / 2 + (i / SRC.length) * Math.PI * 2;
  return {
    x: CENTER.x + Math.cos(ang) * 600,
    y: CENTER.y + Math.sin(ang) * 300,
  };
}

// Phase B layout
const GRAPH_TO = { x: 340, y: 520, s: 0.42 };
export const LAYER = { x: 690, y: 250, w: 380, h: 520, r: 22 };
export const SEARCH = { x: 1450, y: 250, w: 400, h: 520, r: 22 };
const DOCS = [
  'SizingService.cs',
  'copy-api.openapi.yaml',
  'ADR-017-sizing-model.md',
  'US-982 · Sizing export',
  'wiki/RBAC-model.md',
  'release-notes-4.2.md',
];
const STAGE_X = { doc: 1130, chunk: 1240, vec: 1350 };

export default {
  id: 'knowledge',
  pre: 0,
  post: 0.8,
  captions: [
    {
      t0: 4.5,
      t1: 7.6,
      text: 'Understand the project before asking questions.',
      accent: ['Understand', 'project'],
    },
  ],
  draw(ctx, lt, t) {
    const exit = E.inOutCubic(seg(lt, 7.0, 7.8));
    const gm = E.inOutCubic(seg(lt, 2.9, 4.1)); // graph → left
    const gx = lerp(0, GRAPH_TO.x - CENTER.x, gm),
      gy = lerp(0, GRAPH_TO.y - CENTER.y, gm),
      gs = lerp(1, GRAPH_TO.s, gm);
    const allA = 1 - exit;
    ctx.translate(960, 540);
    ctx.scale(1 + 0.1 * exit, 1 + 0.1 * exit);
    ctx.translate(-960, -540);

    // ---------------------------------------------------------------- graph
    ctx.save();
    ctx.globalAlpha *= allA;
    ctx.translate(CENTER.x + gx, CENTER.y + gy);
    ctx.scale(gs, gs);
    ctx.translate(-CENTER.x, -CENTER.y);
    // links + particles
    for (let i = 0; i < SRC.length; i++) {
      const p = srcPos(i);
      const lp = E.outCubic(stagger(lt, i, 0.55, 0.07, 0.6));
      const pts = [p, { x: CENTER.x, y: CENTER.y }];
      link(ctx, pts, {
        p: lp,
        color: SRC[i].color,
        width: 1.6 / gs,
        base: 0.12,
      });
      if (lt > 1.1)
        flow(ctx, pts, t, {
          count: 4,
          speed: 0.55,
          color: SRC[i].color,
          size: 2.6,
          seed: i * 3 + 1,
          alpha: seg(lt, 1.1, 1.6),
        });
    }
    for (let i = 0; i < SRC.length; i++) {
      const p = srcPos(i);
      const sp = spring(lt - (0.7 + i * 0.07), 2.2, 0.55);
      drawNode(ctx, p.x, p.y, 44, {
        scale: sp,
        color: SRC[i].color,
        iconName: SRC[i].icon,
        label: SRC[i].label,
        sub: SRC[i].sub,
        active: 0.3,
        labelSize: 20,
      });
    }
    // centre: card → node morph
    const m = E.inOutQuart(seg(lt, 0, 0.9));
    const cardR = centerRect(
      SELECTED.cx,
      SELECTED.cy,
      CARD_W * SELECTED_SCALE,
      CARD_H * SELECTED_SCALE,
      20 * SELECTED_SCALE,
    );
    const nodeR = centerRect(CENTER.x, CENTER.y, 150, 150, 75);
    if (m < 1) {
      const R = morphRect(cardR, nodeR, m);
      ctx.save();
      ctx.globalAlpha *= 1 - seg(m, 0, 0.5);
      const s = R.w / CARD_W;
      ctx.translate(R.x + R.w / 2, R.y + R.h / 2);
      ctx.scale(s, R.h / CARD_H);
      drawProjectCard(ctx, PROJECTS[3], -CARD_W / 2, -CARD_H / 2, {
        alpha: 1,
        selected: 0.9,
        loading: 1,
        loaded: 1,
      });
      ctx.restore();
      glass(ctx, R, {
        alpha: seg(m, 0.2, 0.8),
        tint: C.violet,
        tintA: 0.3,
        glow: 0.8,
        glowColor: C.violet,
      });
    }
    if (m > 0.6) {
      const a = seg(m, 0.6, 1);
      softGlow(ctx, CENTER.x, CENTER.y, 220, C.violet, 0.25 * a);
      glass(ctx, nodeR, {
        alpha: a,
        tint: C.violet,
        tintA: 0.35,
        glow: 0.9 + 0.1 * Math.sin(t * 3),
        glowColor: C.violet,
      });
      iconTile(ctx, 'level', CENTER.x, CENTER.y - 16, 56, C.violet, a);
      text(ctx, 'Level Product', CENTER.x, CENTER.y + 30, {
        size: 17,
        weight: 650,
        align: 'center',
        alpha: a,
      });
      text(ctx, 'Advisor', CENTER.x, CENTER.y + 50, {
        size: 17,
        weight: 650,
        align: 'center',
        alpha: a,
      });
    }
    ctx.restore();

    // ---------------------------------------------------------------- phase B
    const bA = allA;
    // Enterprise Knowledge Layer
    const lIn = E.outCubic(seg(lt, 3.3, 4.0));
    if (lIn > 0) {
      const from = { x: GRAPH_TO.x + 275, y: CENTER.y + 40 },
        to = { x: LAYER.x, y: CENTER.y };
      link(ctx, hcurve(from, to), {
        p: lIn,
        color: C.violet,
        alpha: bA,
        width: 2,
      });
      flow(ctx, hcurve(from, to), t, {
        count: 7,
        speed: 0.8,
        color: C.violet,
        size: 3,
        alpha: bA * lIn,
        seed: 91,
      });
      withMask(ctx, LAYER, lIn, 'left', () => {
        glass(ctx, LAYER, { alpha: bA, tint: C.violet, tintA: 0.14 });
        ctx.save();
        ctx.globalAlpha *= bA;
        iconTile(ctx, 'layers', LAYER.x + 42, LAYER.y + 44, 44, C.violet);
        text(ctx, 'Enterprise', LAYER.x + 78, LAYER.y + 34, {
          size: 21,
          weight: 700,
        });
        text(ctx, 'Knowledge Layer', LAYER.x + 78, LAYER.y + 58, {
          size: 21,
          weight: 700,
        });
        text(
          ctx,
          'normalized · permission-aware',
          LAYER.x + 26,
          LAYER.y + 102,
          { size: 13, mono: true, color: C.text3 },
        );
        DOCS.forEach((d, i) => {
          const ra = E.outCubic(stagger(lt, i, 3.8, 0.12, 0.4));
          const y = LAYER.y + 150 + i * 56;
          ctx.save();
          ctx.globalAlpha *= ra;
          ctx.translate((1 - ra) * -16, 0);
          rr(ctx, LAYER.x + 20, y - 22, LAYER.w - 40, 44, 10);
          ctx.fillStyle = 'rgba(255,255,255,0.035)';
          ctx.fill();
          icon(ctx, 'doc', LAYER.x + 42, y, 18, C.text2);
          text(ctx, d, LAYER.x + 62, y, {
            size: 14,
            mono: true,
            color: C.text2,
          });
          const active = fract(t * 0.9 + i * 0.37) < 0.2;
          ctx.beginPath();
          ctx.arc(LAYER.x + LAYER.w - 38, y, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = active ? C.cyan : rgba(C.green, 0.7);
          ctx.fill();
          ctx.restore();
        });
        ctx.restore();
      });
    }

    // Stage labels
    const stA = seg(lt, 4.1, 4.6) * bA;
    if (stA > 0) {
      [
        ['DOCUMENTS', STAGE_X.doc],
        ['CHUNKS', STAGE_X.chunk],
        ['EMBEDDINGS', STAGE_X.vec],
      ].forEach(([l, x], i) => {
        text(ctx, l, x, LAYER.y + 40, {
          size: 14,
          mono: true,
          weight: 600,
          color: C.text2,
          align: 'center',
          ls: 1.5,
          alpha: stA * seg(lt, 4.1 + i * 0.12, 4.5 + i * 0.12),
        });
      });
      // arrows between
      text(ctx, '→', (STAGE_X.doc + STAGE_X.chunk) / 2 + 2, LAYER.y + 40, {
        size: 14,
        color: C.text3,
        align: 'center',
        alpha: stA,
      });
      text(ctx, '→', (STAGE_X.chunk + STAGE_X.vec) / 2 + 6, LAYER.y + 40, {
        size: 14,
        color: C.text3,
        align: 'center',
        alpha: stA,
      });
    }

    // Documents → chunks → embeddings conveyor
    if (lt > 4.1) {
      const pipeA = seg(lt, 4.1, 4.5) * bA;
      const period = 0.55;
      for (let k = 0; k < 9; k++) {
        const born = 4.1 + k * period;
        for (let rep = 0; rep < 2; rep++) {
          const b0 = born + rep * period * 9;
          const u = (lt - b0) / 2.2; // life 0..1
          if (u <= 0 || u >= 1) continue;
          const lane = LAYER.y + 120 + ((k * 3 + rep) % 7) * 52;
          drawConveyor(ctx, u, lane, k + rep * 11, pipeA);
        }
      }
    }

    // Azure AI Search
    const sIn = E.outCubic(seg(lt, 3.7, 4.4));
    if (sIn > 0) {
      withMask(ctx, SEARCH, sIn, 'down', () => {
        glass(ctx, SEARCH, {
          alpha: bA,
          tint: C.cyan,
          tintA: 0.16,
          glow: 0.35,
          glowColor: C.cyan,
        });
        ctx.save();
        ctx.globalAlpha *= bA;
        iconTile(ctx, 'search', SEARCH.x + 42, SEARCH.y + 44, 44, C.cyan);
        text(ctx, 'Azure AI Search', SEARCH.x + 78, SEARCH.y + 36, {
          size: 22,
          weight: 700,
        });
        text(ctx, 'vector + keyword index', SEARCH.x + 78, SEARCH.y + 60, {
          size: 13,
          mono: true,
          color: C.text3,
        });
        drawIndexLattice(ctx, SEARCH.x + SEARCH.w / 2, SEARCH.y + 270, t, lt);
        const n = Math.floor(48312 * E.outCubic(seg(lt, 4.3, 7.0)));
        text(ctx, 'INDEXED CHUNKS', SEARCH.x + 28, SEARCH.y + 440, {
          size: 12,
          mono: true,
          color: C.text3,
          ls: 2,
        });
        text(ctx, n.toLocaleString('en-US'), SEARCH.x + 28, SEARCH.y + 474, {
          size: 30,
          weight: 700,
          mono: true,
          color: C.cyan,
        });
        text(
          ctx,
          'Searchable project',
          SEARCH.x + SEARCH.w - 28,
          SEARCH.y + 446,
          { size: 15, color: C.text2, align: 'right' },
        );
        text(ctx, 'knowledge', SEARCH.x + SEARCH.w - 28, SEARCH.y + 468, {
          size: 15,
          color: C.text2,
          align: 'right',
        });
        ctx.restore();
      });
    }

    // Awareness chips
    const chips = [
      'Project-aware',
      'Context-aware',
      'Role-aware',
      'History-aware',
    ];
    const cw = chips.map((c) => measure(ctx, c, 17, 600) + 48);
    const total = cw.reduce((a, b) => a + b, 0) + 14 * 3;
    let x = 960 - total / 2;
    chips.forEach((c, i) => {
      const a = E.outBack(stagger(lt, i, 5.2, 0.14, 0.5)) * bA;
      if (a > 0) {
        ctx.save();
        ctx.translate(x + cw[i] / 2, 880);
        ctx.scale(clamp(a), clamp(a));
        pill(ctx, 0, 0, c, {
          size: 17,
          align: 'center',
          bg: C.cyan,
          alpha: clamp(a),
          icon: (cc, ix, iy, s) => icon(cc, 'check', ix, iy, s, C.green),
          h: 38,
        });
        ctx.restore();
      }
      x += cw[i] + 14;
    });
  },
};

function drawConveyor(ctx, u, laneY, seed, alpha) {
  // 0.00–0.30 document travels from layer edge to DOC column
  // 0.30–0.55 splits into 3 chunks moving to CHUNK column
  // 0.55–0.80 chunks become embedding vectors moving to VEC column
  // 0.80–1.00 vectors fly into Azure AI Search
  const startX = LAYER.x + LAYER.w - 10;
  const y = laneY;
  if (u < 0.3) {
    const p = E.inOutCubic(u / 0.3);
    const x = lerp(startX, STAGE_X.doc, p);
    ctx.save();
    ctx.globalAlpha *= alpha * clamp(u * 12);
    rr(ctx, x - 13, y - 17, 26, 34, 4);
    ctx.fillStyle = 'rgba(210,220,255,0.12)';
    ctx.fill();
    ctx.strokeStyle = rgba(C.violet, 0.8);
    ctx.lineWidth = 1.2;
    ctx.stroke();
    for (let l = 0; l < 4; l++) {
      ctx.fillStyle = 'rgba(220,228,255,0.5)';
      ctx.fillRect(x - 8, y - 10 + l * 6, l === 3 ? 9 : 16, 1.6);
    }
    ctx.restore();
  } else if (u < 0.55) {
    const p = E.inOutCubic((u - 0.3) / 0.25);
    for (let c = 0; c < 3; c++) {
      const x = lerp(STAGE_X.doc, STAGE_X.chunk, p);
      const yy = y + (c - 1) * lerp(6, 14, p);
      ctx.save();
      ctx.globalAlpha *= alpha;
      rr(ctx, x - 16, yy - 4, 32, 8, 3);
      ctx.fillStyle = rgba(C.indigo, 0.75);
      ctx.fill();
      ctx.restore();
    }
  } else if (u < 0.8) {
    const p = E.inOutCubic((u - 0.55) / 0.25);
    for (let c = 0; c < 3; c++) {
      const x = lerp(STAGE_X.chunk, STAGE_X.vec, p);
      const yy = y + (c - 1) * 14;
      ctx.save();
      ctx.globalAlpha *= alpha;
      for (let d = 0; d < 8; d++) {
        const v = hash(seed * 31 + c * 7 + d);
        const w = lerp(4, 5, p);
        const cx = x - 20 + d * w * lerp(1, 1.1, p);
        ctx.fillStyle = rgba(
          v > 0.5 ? C.cyan : C.indigo,
          lerp(0.7, 0.3 + v * 0.7, p),
        );
        ctx.fillRect(cx, yy - 3, w - 1, 6);
      }
      ctx.restore();
    }
  } else {
    const p = E.inCubic((u - 0.8) / 0.2);
    for (let c = 0; c < 3; c++) {
      const a = { x: STAGE_X.vec, y: y + (c - 1) * 14 };
      const b = {
        x: SEARCH.x + SEARCH.w / 2 + (c - 1) * 30,
        y: SEARCH.y + 270,
      };
      const x = lerp(a.x, b.x, p),
        yy = lerp(a.y, b.y, p);
      dot(ctx, x, yy, 2.4, C.cyan, alpha * (1 - p * 0.3));
    }
  }
}

// Rotating 3D point lattice: the vector index.
const LAT = [];
for (let i = 0; i < 140; i++) {
  const a = hash(i * 1.7) * Math.PI * 2,
    b = Math.acos(2 * hash(i * 3.1) - 1),
    r = 0.55 + 0.45 * hash(i * 5.3);
  LAT.push({
    x: Math.sin(b) * Math.cos(a) * r,
    y: Math.cos(b) * r,
    z: Math.sin(b) * Math.sin(a) * r,
    c: hash(i * 9.1),
  });
}
function drawIndexLattice(ctx, cx, cy, t, lt) {
  const R = 130;
  const ry = t * 0.35,
    rx = 0.35;
  const fill = clamp((lt - 4.2) / 3);
  const pts = LAT.map((p, i) => {
    let x = p.x * Math.cos(ry) - p.z * Math.sin(ry);
    let z = p.x * Math.sin(ry) + p.z * Math.cos(ry);
    let y = p.y * Math.cos(rx) - z * Math.sin(rx);
    z = p.y * Math.sin(rx) + z * Math.cos(rx);
    const s = 1 / (1.8 - z * 0.6);
    return {
      x: cx + x * R * s * 1.5,
      y: cy + y * R * s * 1.5,
      z,
      i,
      on: p.c < fill,
    };
  });
  ctx.save();
  ctx.lineWidth = 0.7;
  for (let i = 0; i < pts.length; i += 1) {
    const a = pts[i],
      b = pts[(i * 7 + 3) % pts.length];
    if (!a.on || !b.on) continue;
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d > 70) continue;
    ctx.strokeStyle = rgba(C.cyan, 0.12 + (0.1 * (a.z + 1)) / 2);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  for (const p of pts) {
    const depth = (p.z + 1) / 2;
    ctx.fillStyle = p.on
      ? rgba(p.i % 5 === 0 ? C.violet : C.cyan, 0.35 + 0.6 * depth)
      : `rgba(255,255,255,${0.07 + 0.08 * depth})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.2 + depth * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
