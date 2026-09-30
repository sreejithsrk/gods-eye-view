// 08 · Azure DevOps — the approved requirement flows through the Azure
// DevOps MCP server, which generates the full work-item hierarchy.

import {
  C,
  text,
  glass,
  pill,
  icon,
  link,
  flow,
  vcurve,
  hcurve,
  rgba,
  dot,
} from '../render/draw.js';
import { drawADOCard } from '../components/ADOCard.js';
import { drawSpecDoc } from '../components/SpecDoc.js';
import { SPEC_A } from './approval.js';
import { seg, E, clamp, spring } from '../animation/easing.js';
import { morphRect, centerRect, withMask } from '../animation/transitions.js';

const CHIP = centerRect(470, 150, 300, 62, 31);
export const MCP = centerRect(960, 150, 380, 72, 36);
export const EPIC = {
  type: 'EPIC',
  id: 'EPIC-102',
  title: 'Requirements Intelligence / Product Capability',
};
export const FEATURE = {
  type: 'FEATURE',
  id: 'FEATURE-448',
  title: 'Copy Existing Sizing',
};
export const STORIES = [
  ['US-1201', 'Backend Copy API'],
  ['US-1202', 'Frontend Copy Workflow'],
  ['US-1203', 'Authorization & Audit'],
  ['US-1204', 'Validation'],
  ['US-1205', 'Automated Testing'],
].map(([id, title]) => ({ type: 'STORY', id, title }));
export const TASKS = [
  ['TASK-4501', 'API implementation'],
  ['TASK-4502', 'UI component'],
  ['TASK-4503', 'RBAC updates'],
  ['TASK-4504', 'Unit tests'],
  ['TASK-4505', 'Integration tests'],
  ['TASK-4506', 'Documentation'],
].map(([id, title]) => ({ type: 'TASK', id, title }));

export const EPIC_R = centerRect(960, 290, 600, 78, 16);
export const FEAT_R = centerRect(960, 420, 440, 78, 16);
export const storyRect = (i) => ({
  x: 960 - (5 * 300 + 4 * 20) / 2 + i * 320,
  y: 530,
  w: 300,
  h: 82,
  r: 16,
});
export const taskRect = (i) => ({
  x: 960 - (6 * 240 + 5 * 16) / 2 + i * 256,
  y: 716,
  w: 240,
  h: 76,
  r: 14,
});

const T_EPIC = 1.0,
  T_FEAT = 1.45,
  T_STORY = 1.9,
  T_TASK = 2.6;

export default {
  id: 'ado',
  pre: 0,
  post: 0.5,
  captions: [
    {
      t0: 3.4,
      t1: 5.5,
      text: 'Engineering backlog automatically generated.',
      accent: ['automatically'],
    },
  ],
  draw(ctx, lt, t) {
    const S_EXIT = 5.5;
    const exit = E.inOutCubic(seg(lt, S_EXIT, S_EXIT + 0.5));
    const keep = 1 - exit;
    // Approved spec shrinks into a requirement chip
    const m = E.inOutQuart(seg(lt, 0, 0.7));
    if (m < 1) {
      const R = morphRect(SPEC_A, CHIP, m);
      drawSpecDoc(ctx, R, {
        alpha: 1 - seg(m, 0, 0.45),
        checks: () => 1,
        stamp: 1,
        glow: 0.6,
      });
      glass(ctx, R, {
        alpha: seg(m, 0.3, 0.8),
        tint: C.green,
        tintA: 0.2,
        glow: 0.6,
        glowColor: C.green,
      });
    }
    const chipA = seg(m, 0.6, 1) * keep;
    if (chipA > 0) {
      glass(ctx, CHIP, {
        alpha: chipA,
        tint: C.green,
        tintA: 0.2,
        glow: 0.5,
        glowColor: C.green,
      });
      icon(ctx, 'check', CHIP.x + 34, 150, 20, C.green);
      text(ctx, 'REQ-1042', CHIP.x + 56, 150, {
        size: 20,
        weight: 700,
        mono: true,
        alpha: chipA,
      });
      text(ctx, 'Approved', CHIP.x + 176, 150, {
        size: 17,
        weight: 650,
        color: C.green,
        alpha: chipA,
      });
    }
    // Chip → MCP
    const cm = hcurve({ x: CHIP.x + CHIP.w, y: 150 }, { x: MCP.x, y: 150 });
    link(ctx, cm, {
      p: E.outCubic(seg(lt, 0.55, 0.85)),
      color: C.green,
      alpha: keep,
      width: 2,
    });
    if (lt > 0.85)
      flow(ctx, cm, t, {
        count: 3,
        speed: 1.1,
        color: C.green,
        size: 3,
        alpha: keep,
        seed: 5,
      });
    const mIn = spring(lt - 0.6, 2.2, 0.6);
    if (mIn > 0) {
      ctx.save();
      ctx.translate(960, 150);
      ctx.scale(0.85 + 0.15 * mIn, 0.85 + 0.15 * mIn);
      ctx.translate(-960, -150);
      glass(ctx, MCP, {
        alpha: clamp(mIn * 2) * keep,
        tint: C.blue,
        tintA: 0.25,
        glow: 0.7,
        glowColor: C.blue,
      });
      ctx.save();
      ctx.globalAlpha *= clamp(mIn * 2) * keep;
      icon(ctx, 'plug', MCP.x + 40, 150, 24, C.blue);
      text(ctx, 'Azure DevOps MCP', MCP.x + 70, 140, { size: 22, weight: 700 });
      text(ctx, 'Model Context Protocol · work items API', MCP.x + 70, 164, {
        size: 12,
        mono: true,
        color: C.text3,
      });
      ctx.restore();
      ctx.restore();
    }

    // Tree connectors
    const lk = (a, b, t0, col) => {
      const pts = vcurve(a, b);
      link(ctx, pts, {
        p: E.outCubic(seg(lt, t0, t0 + 0.35)),
        color: col,
        alpha: keep * 0.9,
        width: 1.5,
        glow: 0.2,
      });
      if (lt > t0 + 0.35)
        flow(ctx, pts, t, {
          count: 1,
          speed: 0.8,
          color: col,
          size: 2.2,
          alpha: keep * 0.8,
          seed: a.x + b.x,
        });
    };
    lk(
      { x: 960, y: MCP.y + MCP.h },
      { x: 960, y: EPIC_R.y },
      T_EPIC - 0.3,
      C.orange,
    );
    lk(
      { x: 960, y: EPIC_R.y + EPIC_R.h },
      { x: 960, y: FEAT_R.y },
      T_FEAT - 0.3,
      C.violet,
    );
    STORIES.forEach((_, i) => {
      const R = storyRect(i);
      lk(
        { x: 960, y: FEAT_R.y + FEAT_R.h },
        { x: R.x + R.w / 2, y: R.y },
        T_STORY - 0.3 + i * 0.06,
        C.blue,
      );
    });
    // stories → tasks via a shared bus (tasks belong to the stories above them)
    const busY = 670;
    const busP = E.outCubic(seg(lt, T_TASK - 0.4, T_TASK));
    if (busP > 0) {
      ctx.save();
      ctx.globalAlpha *= keep;
      ctx.strokeStyle = rgba(C.yellow, 0.4);
      ctx.lineWidth = 1.4;
      const x0 = storyRect(0).x + 150,
        x1 = storyRect(4).x + 150;
      ctx.beginPath();
      ctx.moveTo(960 - (960 - x0) * busP, busY);
      ctx.lineTo(960 + (x1 - 960) * busP, busY);
      ctx.stroke();
      STORIES.forEach((_, i) => {
        const R = storyRect(i);
        ctx.beginPath();
        ctx.moveTo(R.x + R.w / 2, R.y + R.h);
        ctx.lineTo(R.x + R.w / 2, R.y + R.h + (busY - R.y - R.h) * busP);
        ctx.stroke();
      });
      TASKS.forEach((_, i) => {
        const R = taskRect(i);
        const p = E.outCubic(
          seg(lt, T_TASK - 0.15 + i * 0.07, T_TASK + 0.15 + i * 0.07),
        );
        ctx.beginPath();
        ctx.moveTo(R.x + R.w / 2, busY);
        ctx.lineTo(R.x + R.w / 2, busY + (R.y - busY) * p);
        ctx.stroke();
      });
      ctx.restore();
    }

    // Cards
    const card = (item, R, t0, titleSize = 19) => {
      const p = seg(lt, t0, t0 + 0.45);
      if (p <= 0 || (item === STORIES[0] && lt >= S_EXIT)) return;
      const sp = spring(lt - t0, 2.3, 0.62);
      ctx.save();
      ctx.translate(R.x + R.w / 2, R.y + R.h / 2);
      ctx.scale(0.9 + 0.1 * sp, 0.9 + 0.1 * sp);
      ctx.translate(-(R.x + R.w / 2), -(R.y + R.h / 2));
      withMask(ctx, R, E.outCubic(p), 'down', () => {
        drawADOCard(ctx, R, item, {
          alpha: keep,
          reveal: seg(lt, t0 + 0.1, t0 + 0.6),
          glow: 0.5 * (1 - seg(lt, t0 + 0.4, t0 + 1.2)),
          titleSize,
        });
      });
      ctx.restore();
      dot(ctx, R.x + R.w / 2, R.y, 3, C.cyan, (1 - p) * keep);
    };
    card(EPIC, EPIC_R, T_EPIC, 20);
    card(FEATURE, FEAT_R, T_FEAT, 21);
    STORIES.forEach((s, i) => card(s, storyRect(i), T_STORY + i * 0.08, 18));
    TASKS.forEach((s, i) => card(s, taskRect(i), T_TASK + i * 0.07, 17));

    // Sync status
    const sA = seg(lt, 3.1, 3.5) * keep;
    pill(
      ctx,
      960,
      862,
      'Synced to Azure DevOps · 13 work items · linked to REQ-1042',
      {
        size: 15,
        align: 'center',
        bg: C.blue,
        color: C.text2,
        alpha: sA,
        icon: (c, x, y, s) => icon(c, 'link', x, y, s, C.cyan),
        h: 36,
        weight: 500,
      },
    );
  },
};
