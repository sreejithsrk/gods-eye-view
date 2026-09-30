// 09 · Development — an approved user story is executed by a scoped
// development agent: repository context → code → tests → security scan →
// pull request, linked back to REQ-1042 automatically.

import {
  C,
  text,
  glass,
  pill,
  icon,
  link,
  flow,
  rr,
  rgba,
  checkCircle,
  spinner,
  dot,
  strokeSub,
  cubic,
  softGlow,
  pointAt,
} from '../render/draw.js';
import { drawPipelineStep } from '../components/PipelineStep.js';
import { drawADOCard } from '../components/ADOCard.js';
import { storyRect, STORIES } from './ado.js';
import { seg, E, lerp } from '../animation/easing.js';
import { morphRect, centerRect, withMask } from '../animation/transitions.js';

export const PY = 250;
export const STEPS = [
  { label: 'User Story', sub: 'US-1201', icon: 'board', color: C.blue },
  {
    label: 'Development Agent',
    sub: 'scoped · governed',
    icon: 'agent',
    color: C.violet,
  },
  {
    label: 'Repository Context',
    sub: 'SizingService.cs',
    icon: 'search',
    color: C.cyan,
  },
  { label: 'Code Changes', sub: '+184 −12', icon: 'code', color: C.cyan },
  { label: 'Tests', sub: '38 passed', icon: 'flask', color: C.amber },
  { label: 'Security Scan', sub: '0 critical', icon: 'shield', color: C.green },
  { label: 'Pull Request', sub: '#842', icon: 'pr', color: C.violet },
];
export const stepX = (i) => 190 + i * 256;
const P0 = 0.9,
  PSTEP = 0.42; // packet timing
const reach = (i) => P0 + i * PSTEP;
export const GH = { x: 120, y: 420, w: 1680, h: 470, r: 22 };
export const PR_R = { x: GH.x + 960, y: GH.y + 350, w: 680, h: 92, r: 16 };

const DIFF = [
  ['', 'public async Task<Sizing> CopyAsync(Guid sizingId, UserContext user)'],
  ['+', '{'],
  ['+', '    _authz.Demand(user, Permission.CopySizing);'],
  ['+', '    var copy = source.CloneWithNewId(owner: user.Id);'],
  ['+', '    await _attachments.CopyAsync(source.Id, copy.Id);'],
  ['+', '    _audit.Emit(AuditEvent.SizingCopied(source.Id, copy.Id));'],
];
const CHECKS = [
  ['Build', '1m 12s'],
  ['Unit Tests', '38 passed'],
  ['Integration Tests', '12 passed'],
  ['Security Checks', '0 critical'],
  ['Architecture Rules', 'ADR-017 ✓'],
];
const checkAt = (i) => 3.0 + i * 0.26;

// Orthogonal route with rounded corners: PR chip → right margin → above the
// pipeline → down into the persistent REQ-1042 chip.
function rounded(points, r = 26) {
  const out = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i - 1],
      b = points[i],
      c = points[i + 1];
    const d1 = Math.hypot(b.x - a.x, b.y - a.y),
      d2 = Math.hypot(c.x - b.x, c.y - b.y);
    const p1 = {
      x: b.x - ((b.x - a.x) / d1) * r,
      y: b.y - ((b.y - a.y) / d1) * r,
    };
    const p2 = {
      x: b.x + ((c.x - b.x) / d2) * r,
      y: b.y + ((c.y - b.y) / d2) * r,
    };
    for (let k = 0; k <= 8; k++) {
      const u = k / 8,
        q = 1 - u;
      out.push({
        x: q * q * p1.x + 2 * q * u * b.x + u * u * p2.x,
        y: q * q * p1.y + 2 * q * u * b.y + u * u * p2.y,
      });
    }
  }
  out.push(points[points.length - 1]);
  return out;
}
const LINK_PATH = rounded([
  { x: 1738, y: 802 },
  { x: 1862, y: 802 },
  { x: 1862, y: 150 },
  { x: 445, y: 150 },
  { x: 445, y: 80 },
]);

export default {
  id: 'development',
  pre: 0,
  post: 0.8,
  captions: [
    {
      t0: 0.9,
      t1: 3.2,
      text: 'Development agents execute approved work.',
      accent: ['approved'],
    },
    {
      t0: 4.8,
      t1: 6.5,
      text: 'Linked automatically to REQ-1042',
      accent: ['REQ-1042'],
    },
  ],
  draw(ctx, lt, t) {
    const exit = E.inOutCubic(seg(lt, 6.4, 6.95));
    const keep = 1 - exit;
    // Story card → first pipeline node
    const m = E.inOutQuart(seg(lt, 0, 0.7));
    if (m < 1) {
      const R = morphRect(
        storyRect(0),
        centerRect(stepX(0), PY, 76, 76, 38),
        m,
      );
      drawADOCard(ctx, R, STORIES[0], {
        alpha: 1 - seg(m, 0.3, 0.8),
        glow: 0.8,
        titleSize: 18,
      });
    }
    // Pipeline line
    const line = [
      { x: stepX(0), y: PY },
      { x: stepX(6), y: PY },
    ];
    link(ctx, line, {
      p: E.outCubic(seg(lt, 0.3, 1.0)),
      color: C.indigo,
      alpha: 0.7 * keep,
      width: 1.5,
      glow: 0.1,
    });
    // Packet
    const pk = seg(lt, P0, reach(6));
    if (pk > 0 && pk < 1) {
      const x = lerp(stepX(0), stepX(6), pk);
      ctx.save();
      ctx.strokeStyle = rgba(C.cyan, 0.9);
      ctx.lineWidth = 3;
      strokeSub(ctx, line, Math.max(0, pk - 0.08), pk);
      ctx.restore();
      dot(ctx, x, PY, 5, C.cyan, 1);
    }
    STEPS.forEach((s, i) => {
      const a0 = i === 0 ? 0.5 : 0.5 + i * 0.07;
      const ap = seg(lt, a0, a0 + 0.4);
      const active = Math.max(0, 1 - Math.abs(lt - reach(i)) / 0.35);
      const done = seg(lt, reach(i) + 0.2, reach(i) + 0.45);
      drawPipelineStep(ctx, stepX(i), PY, {
        appear: ap,
        alpha: keep,
        active,
        done: i === 0 ? 0 : done,
        iconName: s.icon,
        label: s.label,
        sub: s.sub,
        color: s.color,
      });
      if (i < 6) {
        const ax = (stepX(i) + stepX(i + 1)) / 2;
        text(ctx, '›', ax, PY - 2, {
          size: 26,
          color: C.text3,
          align: 'center',
          alpha: ap * keep,
        });
      }
    });

    // GitHub panel
    const gIn = E.outCubic(seg(lt, 1.1, 1.7));
    if (gIn <= 0) return;
    withMask(ctx, GH, gIn, 'down', () => {
      ctx.save();
      ctx.globalAlpha *= keep;
      glass(ctx, GH, { tint: C.violet, tintA: 0.08 });
      icon(ctx, 'git', GH.x + 44, GH.y + 44, 26, C.text);
      text(ctx, 'GitHub', GH.x + 72, GH.y + 44, { size: 21, weight: 700 });
      text(ctx, '/  level-product-advisor', GH.x + 148, GH.y + 44, {
        size: 19,
        weight: 500,
        color: C.text2,
      });
      pill(
        ctx,
        GH.x + GH.w - 32,
        GH.y + 44,
        'Development Agent · scoped to US-1201',
        {
          size: 14,
          align: 'right',
          bg: C.violet,
          color: C.text2,
          icon: (c, x, y, s) => icon(c, 'agent', x, y, s, C.violet),
          h: 32,
          weight: 500,
        },
      );
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      ctx.fillRect(GH.x + 1, GH.y + 84, GH.w - 2, 1);
      ctx.fillRect(GH.x + 930, GH.y + 100, 1, GH.h - 130);

      // Branch graph
      const y0 = GH.y + 134,
        y1 = GH.y + 184;
      const L = GH.x + 40,
        Rr = GH.x + 880;
      text(ctx, 'main', L, y0 - 22, { size: 13, mono: true, color: C.text3 });
      ctx.strokeStyle = 'rgba(200,210,240,0.35)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(L, y0);
      ctx.lineTo(Rr, y0);
      ctx.stroke();
      for (const cx of [L + 30, L + 150, L + 780]) {
        ctx.beginPath();
        ctx.arc(cx, y0, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#1a2240';
        ctx.fill();
        ctx.strokeStyle = 'rgba(200,210,240,0.6)';
        ctx.stroke();
      }
      const bp = E.outCubic(seg(lt, 1.5, 2.6));
      const branch = cubic(
        { x: L + 200, y: y0 },
        { x: L + 250, y: y0 },
        { x: L + 230, y: y1 },
        { x: L + 300, y: y1 },
      ).concat([{ x: L + 700, y: y1 }]);
      ctx.strokeStyle = C.cyan;
      ctx.lineWidth = 2.5;
      strokeSub(ctx, branch, 0, bp);
      [1.75, 2.05, 2.35].forEach((ct, k) => {
        const a = E.outBack(seg(lt, ct, ct + 0.3));
        if (a <= 0) return;
        const cx = L + 360 + k * 130;
        ctx.beginPath();
        ctx.arc(cx, y1, 7 * a, 0, Math.PI * 2);
        ctx.fillStyle = C.cyan;
        ctx.fill();
        softGlow(ctx, cx, y1, 26, C.cyan, 0.3 * a);
      });
      // Pending merge
      const mp = seg(lt, 4.3, 4.9);
      if (mp > 0) {
        const mg = cubic(
          { x: L + 700, y: y1 },
          { x: L + 760, y: y1 },
          { x: L + 740, y: y0 },
          { x: L + 800, y: y0 },
        );
        ctx.setLineDash([5, 6]);
        ctx.strokeStyle = rgba(C.violet, 0.9);
        strokeSub(ctx, mg, 0, mp);
        ctx.setLineDash([]);
      }
      pill(ctx, L, y1 + 46, 'feature/REQ-1042-copy-sizing', {
        size: 17,
        mono: true,
        bg: C.cyan,
        color: C.cyan,
        alpha: seg(lt, 1.7, 2.0),
        icon: (c, x, y, s) => icon(c, 'branch', x, y, s, C.cyan),
        h: 36,
        weight: 600,
      });

      // Diff
      const D = { x: L, y: GH.y + 278, w: 840, h: 170 };
      rr(ctx, D.x, D.y, D.w, D.h, 12);
      ctx.fillStyle = 'rgba(3,6,14,0.7)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.stroke();
      text(ctx, 'SizingService.cs', D.x + 16, D.y + 18, {
        size: 12,
        mono: true,
        color: C.text3,
      });
      text(ctx, '+184 −12', D.x + D.w - 16, D.y + 18, {
        size: 12,
        mono: true,
        color: C.green,
        align: 'right',
      });
      DIFF.forEach(([sgn, code], k) => {
        const lp = seg(lt, 1.8 + k * 0.18, 2.1 + k * 0.18);
        if (lp <= 0) return;
        const y = D.y + 44 + k * 22;
        if (sgn === '+') {
          ctx.fillStyle = rgba(C.green, 0.07 * lp);
          ctx.fillRect(D.x + 1, y - 10, D.w - 2, 21);
        }
        text(ctx, String(212 + k), D.x + 16, y, {
          size: 13,
          mono: true,
          color: C.text3,
          alpha: lp,
        });
        text(ctx, sgn, D.x + 56, y, {
          size: 14,
          mono: true,
          color: C.green,
          alpha: lp,
        });
        const n = Math.floor(code.length * E.outQuad(lp));
        text(ctx, code.slice(0, n), D.x + 74, y, {
          size: 14,
          mono: true,
          color: sgn ? '#d7f5e8' : C.text2,
          alpha: lp,
        });
      });

      // Checks
      const X = GH.x + 970;
      text(ctx, 'CHECKS', X, GH.y + 120, {
        size: 13,
        mono: true,
        color: C.text3,
        ls: 3,
      });
      CHECKS.forEach(([l, v], i) => {
        const y = GH.y + 160 + i * 40;
        const s0 = checkAt(i) - 0.3;
        const a = seg(lt, s0 - 0.2, s0);
        if (a <= 0) return;
        const ok = seg(lt, checkAt(i), checkAt(i) + 0.3);
        if (ok > 0) checkCircle(ctx, X + 12, y, 11, ok, C.green, a);
        else spinner(ctx, X + 12, y, 10, t, C.cyan, a);
        text(ctx, l, X + 38, y, { size: 19, weight: 600, alpha: a });
        text(ctx, ok > 0 ? v : 'running…', X + 660, y, {
          size: 14,
          mono: true,
          color: ok > 0 ? C.green : C.text3,
          align: 'right',
          alpha: a,
        });
      });

      // Pull request card
      const pp = E.outCubic(seg(lt, 4.3, 4.7));
      if (pp > 0 && lt < 6.5) {
        ctx.save();
        ctx.globalAlpha *= pp;
        ctx.translate(0, (1 - pp) * 16);
        glass(ctx, PR_R, {
          tint: C.violet,
          tintA: 0.2,
          glow: 0.6,
          glowColor: C.violet,
        });
        icon(ctx, 'pr', PR_R.x + 38, PR_R.y + PR_R.h / 2, 28, C.violet);
        text(ctx, 'Pull Request #842 created', PR_R.x + 70, PR_R.y + 32, {
          size: 23,
          weight: 700,
        });
        text(
          ctx,
          'Copy existing sizing configuration · 5 checks passed',
          PR_R.x + 70,
          PR_R.y + 62,
          { size: 15, color: C.text2 },
        );
        const la = E.outBack(seg(lt, 4.9, 5.3));
        if (la > 0) {
          ctx.save();
          ctx.translate(PR_R.x + PR_R.w - 24, PR_R.y + 32);
          ctx.scale(la, la);
          pill(ctx, 0, 0, 'REQ-1042', {
            size: 15,
            align: 'right',
            mono: true,
            bg: C.cyan,
            color: C.cyan,
            glow: 1,
            icon: (c, x, y, s) => icon(c, 'link', x, y, s, C.cyan),
            h: 32,
            weight: 700,
          });
          ctx.restore();
        }
        ctx.restore();
      }
      ctx.restore();
    });
    // Link line: PR ↔ requirement chip in the HUD, routed around content
    const lp = E.inOutCubic(seg(lt, 4.85, 5.7));
    if (lp > 0) {
      const pts = LINK_PATH;
      link(ctx, pts, {
        p: lp,
        color: C.cyan,
        alpha: keep,
        width: 2,
        glow: 0.6,
      });
      const head = pointAt(pts, lp);
      if (lp < 1) dot(ctx, head.x, head.y, 5, C.cyan, keep);
      else
        flow(ctx, pts, t, {
          count: 6,
          speed: 0.5,
          color: C.cyan,
          size: 3,
          alpha: keep,
          seed: 77,
        });
    }
  },
};
