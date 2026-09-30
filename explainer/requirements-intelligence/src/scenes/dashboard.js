// 11 · Dashboard — the project's shared view of every requirement's state.
// REQ-1042 is visible end-to-end, and the whole team sees the same truth.

import {
  C,
  text,
  glass,
  pill,
  avatar,
  rr,
  rgba,
  checkCircle,
  icon,
  iconTile,
} from '../render/draw.js';
import { drawAppWindow, APP } from '../components/AppWindow.js';
import { drawCursor } from '../components/Cursor.js';
import { seg, E, lerp, stagger } from '../animation/easing.js';
import { morphRect, centerRect } from '../animation/transitions.js';

const STATS = [
  [12, 'Discovery', C.amber],
  [8, 'Analysis', C.cyan],
  [4, 'Awaiting Approval', C.violet],
  [16, 'Engineering', C.blue],
  [22, 'Released', C.green],
];
const statRect = (i) => ({ x: 290 + i * 272, y: 250, w: 256, h: 124, r: 18 });
export const REQ_R = { x: 290, y: 394, w: 770, h: 548, r: 20 };
const TEAM_R = { x: 1084, y: 394, w: 546, h: 548, r: 20 };
const ROWS = [
  ['Requirements', 'done'],
  ['Architecture', 'done'],
  ['ADO', 'done'],
  ['Development', 72],
  ['Testing', 'Pending'],
  ['Release', 'Pending'],
];
const TEAM = [
  ['PO', 'Product Owner', C.cyan],
  ['AR', 'Architect', C.indigo],
  ['EL', 'Engineering Lead', C.blue],
  ['QA', 'QA Engineer', C.amber],
  ['DM', 'Delivery Manager', C.green],
];
export const UI_NODE = centerRect(600, 250, 300, 78, 18); // architecture node (world space)
// On screen at the first architecture frame the camera is zoomed 1.9× on it:
const UI_ZOOMED = centerRect(960, 540, 300 * 1.9, 78 * 1.9, 34);

export default {
  id: 'dashboard',
  pre: 0,
  post: 0,
  captions: [
    {
      t0: 2.0,
      t1: 4.4,
      text: 'Everyone sees the same source of truth.',
      accent: ['same', 'source', 'of', 'truth.'],
    },
  ],
  draw(ctx, lt, t) {
    const enter = E.outCubic(seg(lt, 0.1, 0.7));
    const exit = E.inOutQuart(seg(lt, 4.35, 5.0));
    const R =
      exit > 0
        ? morphRect(APP, UI_ZOOMED, exit)
        : morphRect(
            centerRect(960, 540, APP.w * 0.94, APP.h * 0.94, 26),
            APP,
            enter,
          );
    const contentA = enter * (1 - seg(exit, 0, 0.35));
    drawAppWindow(ctx, R, t, {
      alpha: enter,
      glowUI: exit,
      chrome: 1 - seg(exit, 0, 0.3),
      project: 'Level Product Advisor',
      title: '/  Dashboard',
      rightChips: [{ label: '5 viewing', color: C.cyan }],
    });
    if (exit > 0.3) {
      const a = seg(exit, 0.5, 1);
      iconTile2(ctx, R, a);
    }
    if (contentA <= 0) return;
    ctx.save();
    ctx.globalAlpha *= contentA;
    text(ctx, 'Requirement Intelligence Dashboard', 290, 214, {
      size: 24,
      weight: 700,
      alpha: seg(lt, 0.2, 0.6),
      ls: -0.3,
    });
    text(ctx, 'PROJECT · LEVEL PRODUCT ADVISOR · 62 REQUIREMENTS', 1630, 214, {
      size: 13,
      mono: true,
      color: C.text3,
      align: 'right',
      ls: 1.5,
      alpha: seg(lt, 0.3, 0.7),
    });
    STATS.forEach(([n, l, col], i) => {
      const p = E.outCubic(stagger(lt, i, 0.3, 0.07, 0.5));
      const S = statRect(i);
      ctx.save();
      ctx.globalAlpha *= p;
      ctx.translate(0, (1 - p) * 20);
      glass(ctx, S, { tint: col, tintA: 0.14 });
      rr(ctx, S.x + 20, S.y, 40, 3, 1.5);
      ctx.fillStyle = col;
      ctx.fill();
      const v = Math.round(
        n * E.outCubic(seg(lt, 0.4 + i * 0.07, 1.3 + i * 0.07)),
      );
      text(ctx, String(v), S.x + 22, S.y + 56, {
        size: 48,
        weight: 700,
        color: C.text,
      });
      text(ctx, l, S.x + 22, S.y + 100, { size: 17, weight: 600, color: col });
      ctx.restore();
    });

    // REQ-1042 detail
    const rp = E.outCubic(seg(lt, 0.6, 1.1));
    ctx.save();
    ctx.globalAlpha *= rp;
    glass(ctx, REQ_R, {
      tint: C.cyan,
      tintA: 0.1,
      glow: 0.35,
      glowColor: C.cyan,
    });
    text(ctx, 'REQ-1042', REQ_R.x + 36, REQ_R.y + 46, {
      size: 20,
      weight: 700,
      mono: true,
      color: C.cyan,
    });
    text(ctx, 'Copy Existing Sizing', REQ_R.x + 36, REQ_R.y + 86, {
      size: 30,
      weight: 700,
      ls: -0.4,
    });
    text(ctx, 'CURRENT STATUS', REQ_R.x + REQ_R.w - 36, REQ_R.y + 40, {
      size: 12,
      mono: true,
      color: C.text3,
      align: 'right',
      ls: 2,
    });
    pill(ctx, REQ_R.x + REQ_R.w - 36, REQ_R.y + 74, 'Engineering', {
      size: 16,
      align: 'right',
      bg: C.blue,
      color: C.blue,
      dot: C.blue,
      h: 34,
      weight: 650,
    });
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.fillRect(REQ_R.x + 36, REQ_R.y + 124, REQ_R.w - 72, 1);
    ROWS.forEach(([l, st], i) => {
      const y = REQ_R.y + 166 + i * 64;
      const a = seg(lt, 0.9 + i * 0.1, 1.2 + i * 0.1);
      text(ctx, l, REQ_R.x + 76, y, {
        size: 21,
        weight: 600,
        alpha: a,
        color: st === 'Pending' ? C.text3 : C.text,
      });
      if (st === 'done') {
        checkCircle(
          ctx,
          REQ_R.x + 48,
          y,
          12,
          seg(lt, 1.0 + i * 0.1, 1.4 + i * 0.1),
          C.green,
          a,
        );
        text(ctx, 'Complete', REQ_R.x + REQ_R.w - 36, y, {
          size: 15,
          mono: true,
          color: C.green,
          align: 'right',
          alpha: a,
        });
      } else if (typeof st === 'number') {
        ctx.save();
        ctx.globalAlpha *= a;
        ctx.beginPath();
        ctx.arc(REQ_R.x + 48, y, 12, 0, Math.PI * 2);
        ctx.strokeStyle = C.blue;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(REQ_R.x + 48, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = C.blue;
        ctx.fill();
        const bx = REQ_R.x + 280,
          bw = REQ_R.w - 280 - 110;
        rr(ctx, bx, y - 5, bw, 10, 5);
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fill();
        const v = (st / 100) * E.inOutCubic(seg(lt, 1.4, 2.4));
        rr(ctx, bx, y - 5, bw * v, 10, 5);
        const g = ctx.createLinearGradient(bx, 0, bx + bw, 0);
        g.addColorStop(0, C.cyan);
        g.addColorStop(1, C.blue);
        ctx.fillStyle = g;
        ctx.fill();
        text(ctx, `${Math.round(v * 100)}%`, REQ_R.x + REQ_R.w - 36, y, {
          size: 18,
          weight: 700,
          mono: true,
          color: C.blue,
          align: 'right',
        });
        ctx.restore();
      } else {
        ctx.save();
        ctx.globalAlpha *= a;
        ctx.beginPath();
        ctx.arc(REQ_R.x + 48, y, 12, 0, Math.PI * 2);
        ctx.setLineDash([3, 4]);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
        text(ctx, 'Pending', REQ_R.x + REQ_R.w - 36, y, {
          size: 15,
          mono: true,
          color: C.text3,
          align: 'right',
          alpha: a,
        });
      }
    });
    text(
      ctx,
      'Linked: FEATURE-448 · 5 stories · 6 tasks · PR #842',
      REQ_R.x + 36,
      REQ_R.y + REQ_R.h - 34,
      { size: 14, mono: true, color: rgba(C.cyan, 0.8) },
    );
    ctx.restore();

    // Team
    const tp = E.outCubic(seg(lt, 0.8, 1.3));
    ctx.save();
    ctx.globalAlpha *= tp;
    ctx.translate((1 - tp) * 30, 0);
    glass(ctx, TEAM_R, { tint: C.indigo, tintA: 0.1 });
    text(ctx, 'VIEWING NOW', TEAM_R.x + 32, TEAM_R.y + 44, {
      size: 13,
      mono: true,
      color: C.text3,
      ls: 2.5,
    });
    text(
      ctx,
      'same project · same REQ-1042',
      TEAM_R.x + TEAM_R.w - 32,
      TEAM_R.y + 44,
      { size: 13, mono: true, color: C.cyan, align: 'right' },
    );
    TEAM.forEach(([ini, role, col], i) => {
      const a = E.outCubic(stagger(lt, i, 1.1, 0.16, 0.4));
      const y = TEAM_R.y + 106 + i * 88;
      ctx.save();
      ctx.globalAlpha *= a;
      ctx.translate((1 - a) * 20, 0);
      avatar(ctx, TEAM_R.x + 60, y, 24, ini, col);
      ctx.beginPath();
      ctx.arc(TEAM_R.x + 78, y + 17, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = C.green;
      ctx.fill();
      ctx.strokeStyle = '#0c1121';
      ctx.lineWidth = 2;
      ctx.stroke();
      text(ctx, role, TEAM_R.x + 100, y - 10, { size: 19, weight: 650 });
      text(
        ctx,
        [
          'editing acceptance',
          'reviewing architecture',
          'tracking development',
          'preparing test plan',
          'planning release',
        ][i],
        TEAM_R.x + 100,
        y + 15,
        { size: 13, mono: true, color: C.text3 },
      );
      icon(ctx, 'eye', TEAM_R.x + TEAM_R.w - 44, y, 20, rgba(col, 0.9));
      ctx.restore();
    });
    ctx.restore();

    // Live cursors of teammates on the same record
    const c1 = seg(lt, 1.8, 3.2),
      c2 = seg(lt, 2.3, 3.8);
    const ca = seg(lt, 1.8, 2.1) * (1 - seg(lt, 4.6, 4.9));
    if (ca > 0) {
      const p1 = {
        x: lerp(900, 760, E.inOutCubic(c1)),
        y: lerp(430, REQ_R.y + 166 + 3 * 64 + 10, E.inOutCubic(c1)),
      };
      const p2 = {
        x: lerp(1000, 520, E.inOutCubic(c2)),
        y: lerp(880, REQ_R.y + 166 + 4 * 64 + 10, E.inOutCubic(c2)),
      };
      namedCursor(ctx, p1, 'Architect', C.indigo, ca, lt);
      namedCursor(ctx, p2, 'QA Engineer', C.amber, ca, lt);
    }
    ctx.restore();
  },
};

function namedCursor(ctx, p, name, col, a, lt) {
  drawCursor(ctx, p.x, p.y, lt, { alpha: a });
  pill(ctx, p.x + 18, p.y + 34, name, {
    size: 13,
    bg: col,
    bgA: 0.9,
    border: 0,
    color: '#0b1020',
    alpha: a,
    h: 26,
    weight: 700,
  });
}

// During the exit the shrinking window shows the UI node's face.
function iconTile2(ctx, R, a) {
  ctx.save();
  ctx.globalAlpha *= a;
  const s = 1.9;
  ctx.translate(R.x + R.w / 2, R.y + R.h / 2);
  ctx.scale(s, s);
  iconTile(ctx, 'dashboard', -114, 0, 42, C.cyan);
  text(ctx, 'Requirements Intelligence UI', -82, 1, { size: 15, weight: 700 });
  ctx.restore();
}
