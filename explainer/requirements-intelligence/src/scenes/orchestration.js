// 04 · Orchestration — the requirement enters a layer of coordinated,
// inspectable services (not a magic brain). Context Retrieval pulls the
// relevant project knowledge; the Impact Analyzer spots existing capability.

import {
  C,
  text,
  glass,
  link,
  flow,
  hcurve,
  pill,
  icon,
  wrap,
  softGlow,
  dot,
} from '../render/draw.js';
import { drawAgentNode } from '../components/AgentNode.js';
import { drawKnowledgeCard } from '../components/KnowledgeCard.js';
import { drawBadge } from '../components/RequirementBadge.js';
import { drawWorkspace, WORKSPACE } from './requirement.js';
import { statusAt } from '../components/HUD.js';
import { seg, E, clamp, spring, stagger } from '../animation/easing.js';
import { morphRect, centerRect, withMask } from '../animation/transitions.js';

export const BADGE_R = centerRect(215, 540, 250, 96, 20);
export const ORCH = centerRect(582, 540, 384, 104, 22);
const TILE_W = 330,
  TILE_H = 70,
  TILE_X = 830;
export const SERVICES = [
  {
    id: 'ctx',
    label: 'Context Retrieval',
    sub: 'hybrid search · top-k',
    icon: 'search',
    color: C.cyan,
    on: 1.5,
  },
  {
    id: 'ana',
    label: 'Requirement Analyzer',
    sub: 'intent · entities',
    icon: 'analyze',
    color: C.blue,
    on: 1.8,
  },
  {
    id: 'cla',
    label: 'Clarification Agent',
    sub: 'gap detection',
    icon: 'chat',
    color: C.violet,
    on: 4.9,
  },
  {
    id: 'imp',
    label: 'Impact Analyzer',
    sub: 'code · API · data',
    icon: 'impact',
    color: C.amber,
    on: 3.6,
  },
  {
    id: 'arc',
    label: 'Architecture Intelligence',
    sub: 'ADRs · patterns',
    icon: 'arch',
    color: C.indigo,
    on: 3.3,
  },
  {
    id: 'pol',
    label: 'Policy / Guardrails',
    sub: 'RBAC · PII · compliance',
    icon: 'shield',
    color: C.green,
    on: 2.1,
  },
];
export const tileRect = (i) => ({
  x: TILE_X,
  y: 540 - (SERVICES.length * 84 - 14) / 2 + i * 84,
  w: TILE_W,
  h: TILE_H,
  r: 16,
});

const KNODE = { x: 1560, y: 200 };
const ITEMS = [
  {
    title: 'Existing Copy API',
    source: 'POST /sizings/{id}/copy',
    score: 0.94,
    icon: 'api',
    color: C.cyan,
  },
  {
    title: 'Sizing Service',
    source: 'src/Sizing/SizingService.cs',
    score: 0.91,
    icon: 'code',
    color: C.cyan,
  },
  {
    title: 'Validation Rules',
    source: 'SizingValidator.cs',
    score: 0.88,
    icon: 'check',
    color: C.blue,
  },
  {
    title: 'Authorization Model',
    source: 'ADO Wiki · RBAC-model',
    score: 0.86,
    icon: 'lock',
    color: C.green,
  },
  {
    title: 'Related ADO Stories',
    source: 'US-982 · US-1017',
    score: 0.83,
    icon: 'board',
    color: C.indigo,
  },
  {
    title: 'Existing UI Components',
    source: 'SizingEditor.tsx',
    score: 0.8,
    icon: 'layers',
    color: C.violet,
  },
];
const itemRect = (i) => ({ x: 1340, y: 262 + i * 66, w: 440, h: 56, r: 14 });
export const INSIGHT = { x: 1260, y: 690, w: 600, h: 200, r: 20 };

export default {
  id: 'orchestration',
  pre: 0,
  post: 0.7,
  captions: [
    {
      t0: 2.5,
      t1: 4.2,
      text: 'Relevant project context retrieved',
      accent: ['context'],
    },
    {
      t0: 4.5,
      t1: 6.5,
      text: 'Existing code, APIs and decisions are considered first.',
      accent: ['Existing', 'code,', 'APIs', 'decisions'],
    },
  ],
  draw(ctx, lt, t) {
    const exit = E.inOutCubic(seg(lt, 6.5, 7.2));
    const keep = 1 - exit; // everything except the Clarification tile fades
    const st = statusAt(t);

    // Workspace → badge
    const m = E.inOutQuart(seg(lt, 0, 0.8));
    if (m < 1) {
      const R = morphRect(WORKSPACE, BADGE_R, m);
      drawWorkspace(ctx, R, 1 - seg(m, 0, 0.4), t);
      drawBadge(ctx, R, { alpha: seg(m, 0.35, 0.8), idSize: 30, glow: 0.6 });
    } else {
      drawBadge(ctx, BADGE_R, {
        alpha: keep,
        idSize: 30,
        glow: 0.5 + 0.2 * Math.sin(t * 3),
        ...st,
      });
    }

    // Orchestrator
    const oIn = spring(lt - 0.65, 2.0, 0.6);
    const bo = hcurve(
      { x: BADGE_R.x + BADGE_R.w, y: 540 },
      { x: ORCH.x, y: 540 },
    );
    link(ctx, bo, {
      p: E.outCubic(seg(lt, 0.6, 1.0)),
      color: C.cyan,
      alpha: keep,
      width: 2,
    });
    if (lt > 1.0)
      flow(ctx, bo, t, {
        count: 4,
        speed: 0.9,
        color: C.cyan,
        size: 3,
        alpha: keep,
        seed: 3,
      });
    if (oIn > 0) {
      ctx.save();
      ctx.translate(ORCH.x + ORCH.w / 2, 540);
      ctx.scale(0.9 + 0.1 * oIn, 0.9 + 0.1 * oIn);
      ctx.translate(-(ORCH.x + ORCH.w / 2), -540);
      softGlow(ctx, ORCH.x + ORCH.w / 2, 540, 260, C.cyan, 0.12 * keep);
      drawAgentNode(ctx, ORCH, {
        alpha: clamp(oIn * 1.5) * keep,
        label: 'Requirement Orchestrator',
        sub: 'plans · routes · verifies',
        iconName: 'orchestrator',
        color: C.cyan,
        active: 0.7,
        state: lt > 1.2 && lt < 5.8 ? 'running' : 'idle',
        t,
        big: true,
      });
      ctx.restore();
      text(ctx, 'AI ORCHESTRATION LAYER', ORCH.x + ORCH.w / 2, ORCH.y - 36, {
        size: 13,
        mono: true,
        color: C.text3,
        align: 'center',
        ls: 3,
        alpha: seg(lt, 0.8, 1.3) * keep,
      });
    }

    // Services
    SERVICES.forEach((s, i) => {
      const R = tileRect(i);
      const lp = E.outCubic(stagger(lt, i, 0.9, 0.07, 0.5));
      const pts = hcurve(
        { x: ORCH.x + ORCH.w, y: 540 },
        { x: R.x, y: R.y + R.h / 2 },
      );
      const isCla = s.id === 'cla';
      const a = isCla && lt < 6.5 ? 1 : keep;
      const active = seg(lt, s.on, s.on + 0.3);
      link(ctx, pts, {
        p: lp,
        color: s.color,
        alpha: a * (0.6 + 0.4 * active),
        width: 1.5,
      });
      if (active > 0)
        flow(ctx, pts, t, {
          count: 3,
          speed: 0.9,
          color: s.color,
          size: 2.6,
          alpha: active * a,
          seed: 20 + i,
        });
      const sp = spring(lt - (1.0 + i * 0.07), 2.2, 0.62);
      if (sp <= 0 || (isCla && lt >= 6.5)) return;
      ctx.save();
      ctx.translate((1 - sp) * -60, 0);
      const done = lt > s.on + 1.4 && !isCla;
      drawAgentNode(ctx, R, {
        alpha: clamp(sp * 2) * a,
        label: s.label,
        sub: s.sub,
        iconName: s.icon,
        color: s.color,
        active: active * (done ? 0.35 : 1),
        state: done ? 'done' : active > 0 ? 'running' : 'idle',
        t,
      });
      ctx.restore();
    });

    // Project knowledge node + retrieval
    const ctxTile = tileRect(0);
    const kIn = E.outCubic(seg(lt, 1.7, 2.1));
    const kl = hcurve(
      { x: ctxTile.x + ctxTile.w, y: ctxTile.y + ctxTile.h / 2 },
      { x: KNODE.x - 150, y: KNODE.y },
    );
    link(ctx, kl, {
      p: kIn,
      color: C.cyan,
      alpha: keep,
      width: 1.8,
      dash: [6, 6],
      t,
    });
    if (kIn > 0) {
      withMask(
        ctx,
        { x: KNODE.x - 150, y: KNODE.y - 30, w: 300, h: 60 },
        kIn,
        'left',
        () => {
          pill(ctx, KNODE.x, KNODE.y, 'Project Knowledge · Azure AI Search', {
            size: 16,
            align: 'center',
            bg: C.cyan,
            alpha: keep,
            h: 42,
            icon: (c, x, y, s) => icon(c, 'search', x, y, s, C.cyan),
          });
        },
      );
    }
    ITEMS.forEach((it, i) => {
      const p = seg(lt, 2.15 + i * 0.13, 2.75 + i * 0.13);
      if (p <= 0) return;
      const R = itemRect(i);
      const e = E.outQuart(p);
      const from = centerRect(KNODE.x, KNODE.y, 120, 20, 10);
      const RR = morphRect(from, R, e);
      const hl =
        it.title === 'Existing Copy API' || it.title === 'Sizing Service'
          ? seg(lt, 3.6, 3.9)
          : 0;
      if (p < 0.5)
        dot(
          ctx,
          RR.x + RR.w / 2,
          RR.y + RR.h / 2,
          3,
          it.color,
          keep * (1 - p * 2),
        );
      drawKnowledgeCard(ctx, RR, it, {
        alpha:
          seg(p, 0.3, 0.75) *
          keep *
          (1 - 0.5 * seg(lt, 3.7, 4.1) * (hl ? 0 : 1)),
        highlight: hl,
      });
    });

    // Impact insight
    const imp = tileRect(3);
    const iIn = E.outCubic(seg(lt, 3.9, 4.5));
    const il = hcurve(
      { x: imp.x + imp.w, y: imp.y + imp.h / 2 },
      { x: INSIGHT.x, y: INSIGHT.y + 60 },
    );
    link(ctx, il, { p: iIn, color: C.amber, alpha: keep, width: 1.8 });
    if (iIn > 0) {
      withMask(ctx, INSIGHT, iIn, 'left', () => {
        glass(ctx, INSIGHT, {
          alpha: keep,
          tint: C.amber,
          tintA: 0.16,
          glow: 0.5,
          glowColor: C.amber,
        });
        ctx.save();
        ctx.globalAlpha *= keep;
        icon(ctx, 'bulb', INSIGHT.x + 34, INSIGHT.y + 38, 22, C.amber);
        text(
          ctx,
          'Existing capability detected',
          INSIGHT.x + 58,
          INSIGHT.y + 38,
          { size: 21, weight: 700, color: C.amber },
        );
        const lines = wrap(
          ctx,
          'Copy functionality already exists in Sizing Service, but UI workflow and validation need enhancement.',
          INSIGHT.w - 56,
          19,
          500,
        );
        lines.forEach((l, k) =>
          text(ctx, l, INSIGHT.x + 28, INSIGHT.y + 82 + k * 28, {
            size: 19,
            color: C.text,
          }),
        );
        let x = INSIGHT.x + 28;
        [
          ['Reuse · Sizing Service', C.green],
          ['Gap · UI workflow', C.amber],
          ['Gap · Validation', C.amber],
        ].forEach(([l, c], k) => {
          const a = seg(lt, 4.6 + k * 0.12, 4.9 + k * 0.12);
          x +=
            pill(ctx, x, INSIGHT.y + 164, l, {
              size: 14,
              bg: c,
              color: c,
              mono: true,
              alpha: a,
              weight: 600,
              h: 30,
            }) + 8;
        });
        ctx.restore();
      });
    }
  },
};
