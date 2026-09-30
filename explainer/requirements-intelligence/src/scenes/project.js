// 01 · Project selection — the app opens, asks which project the user is
// working on, and the chosen project pulls its knowledge in automatically.

import { C, kinetic } from '../render/draw.js';
import { drawAppWindow, APP } from '../components/AppWindow.js';
import {
  drawProjectCard,
  PROJECTS,
  CARD_W,
  CARD_H,
} from '../components/ProjectCard.js';
import { drawCursor, cursorPos } from '../components/Cursor.js';
import { flyingLabel } from '../components/DataFlow.js';
import { MORPH } from './intro.js';
import { seg, E, lerp, clamp, spring, stagger } from '../animation/easing.js';
import { morphRect, centerRect } from '../animation/transitions.js';
import { SCENE } from '../animation/timeline.js';

export const SOURCES = [
  { label: 'Source Code', icon: 'code', color: C.cyan },
  { label: 'API Documentation', icon: 'api', color: C.blue },
  { label: 'Azure DevOps', icon: 'board', color: C.indigo },
  { label: 'ADO Wiki', icon: 'book', color: C.violet },
  { label: 'Architecture Documents', icon: 'layers', color: C.cyan },
  { label: 'Existing Requirements', icon: 'doc', color: C.green },
  { label: 'Previous Decisions', icon: 'bulb', color: C.amber },
  { label: 'Release History', icon: 'history', color: C.blue },
];

const GAP = 28;
const X0 = 960 - (CARD_W * 4 + GAP * 3) / 2;
const CY = 548;
export const SELECTED_SCALE = 1.35;
export const SELECTED = { cx: 960, cy: 540 }; // hand-off to knowledge scene
const CLICK = 3.05; // local

export function selectedCardState(lt) {
  const mv = E.inOutQuart(seg(lt, 3.35, 4.35));
  const x = X0 + 3 * (CARD_W + GAP) + CARD_W / 2;
  return {
    cx: lerp(x, SELECTED.cx, mv),
    cy: lerp(CY, SELECTED.cy, mv),
    s: lerp(1, SELECTED_SCALE, mv),
    mv,
  };
}

export default {
  id: 'project',
  pre: 0.7,
  post: 0.9,
  captions: [
    {
      t0: 5.35,
      t1: 7.4,
      text: 'Project context automatically loaded',
      accent: ['context'],
    },
  ],
  draw(ctx, lt, t) {
    const S = SCENE.project;
    // Window grows out of the title as the title becomes the header brand.
    const g = E.inOutQuint(seg(t, MORPH[0] + 0.1, MORPH[1]));
    const from = centerRect(960, 530, 1060, 400, 36);
    const exit = E.inCubic(seg(lt, S.dur, S.dur + 0.8));
    let R = morphRect(from, APP, g);
    if (exit > 0)
      R = morphRect(
        R,
        centerRect(960, 540, APP.w * 1.12, APP.h * 1.12, 30),
        exit,
      );
    const winA = seg(t, MORPH[0], MORPH[0] + 0.4) * (1 - exit);
    drawAppWindow(ctx, R, t, {
      alpha: winA,
      chrome: t >= MORPH[1] ? 1 : 0,
      brand: t >= MORPH[1],
      showAvatar: true,
    });

    const contentA = (1 - exit) * (1 - seg(lt, 3.4, 4.0));
    // Welcome copy
    const wIn = lt - 0.55;
    if (contentA > 0) {
      const up = E.inOutCubic(seg(lt, 3.3, 4.1)) * 40;
      ctx.save();
      ctx.globalAlpha *= contentA;
      ctx.translate(0, -up);
      kinetic(ctx, 'Welcome to Requirements Intelligence', 960, 300, wIn, {
        size: 46,
        weight: 650,
        accent: ['Requirements', 'Intelligence'],
        ls: -0.5,
      });
      kinetic(ctx, 'Which project are you working on?', 960, 372, lt - 1.15, {
        size: 27,
        weight: 400,
        color: C.text2,
      });
      ctx.restore();
    }

    // Knowledge sources: appear in a ring, then stream into the project.
    for (let k = 0; k < SOURCES.length; k++) {
      const src = SOURCES[k];
      const ang = -Math.PI / 2 + (k + 0.5) * ((Math.PI * 2) / SOURCES.length);
      const ring = {
        x: 960 + Math.cos(ang) * 600,
        y: 540 + Math.sin(ang) * 300,
      };
      const popP = E.outBack(stagger(lt, k, 4.0, 0.07, 0.45));
      const flyStart = 5.0 + k * 0.08;
      if (lt < flyStart) {
        if (popP <= 0) continue;
        ctx.save();
        ctx.translate(ring.x, ring.y);
        ctx.scale(popP, popP);
        flyingLabel(
          ctx,
          src.label,
          src.icon,
          { x: 0, y: 0 },
          { x: 0, y: 0 },
          0.5,
          { color: src.color, shrink: false, size: 18, alpha: clamp(popP) },
        );
        ctx.restore();
      } else {
        const p = seg(lt, flyStart, arriveAt(k));
        flyingLabel(ctx, src.label, src.icon, ring, { x: 960, y: 540 }, p, {
          color: src.color,
          bend: 60,
          size: 18,
        });
      }
    }
    // Cards
    const hoverP = E.outCubic(seg(lt, 2.55, 2.85));
    for (let i = 0; i < 4; i++) {
      const sp = spring(lt - (1.5 + i * 0.1), 1.9, 0.62);
      if (sp <= 0) continue;
      const p = PROJECTS[i];
      let cx = X0 + i * (CARD_W + GAP) + CARD_W / 2;
      let cy = CY + (1 - sp) * 70;
      let s = 0.94 + 0.06 * sp;
      let a = clamp((lt - 1.5 - i * 0.1) / 0.35);
      if (i === 3) {
        const st = selectedCardState(lt);
        if (lt > 3.35) ({ cx, cy, s } = st);
        const press =
          lt > CLICK && lt < CLICK + 0.2
            ? 1 - 0.035 * Math.sin(((lt - CLICK) / 0.2) * Math.PI)
            : 1;
        s *= press * (1 + 0.025 * hoverP * (1 - st.mv));
        cy -= 6 * hoverP * (1 - st.mv);
        if (lt >= S.dur) continue;
        const loadA = seg(lt, 4.2, 4.5);
        const loaded = SOURCES.filter((_, k) => lt > arriveAt(k)).length / 8;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(s, s);
        drawProjectCard(ctx, p, -CARD_W / 2, -CARD_H / 2, {
          alpha: a,
          hover: hoverP,
          selected: clamp((lt - CLICK) * 3) * 0.9,
          loading: loadA,
          loaded,
        });
        ctx.restore();
      } else {
        const fall = E.inCubic(stagger(lt, i, 3.3, 0.06, 0.55));
        cy += fall * 60;
        s *= 1 - fall * 0.08;
        a *= 1 - fall;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(s, s);
        drawProjectCard(ctx, p, -CARD_W / 2, -CARD_H / 2, {
          alpha: a,
          hover: 0,
        });
        ctx.restore();
      }
    }

    // Cursor
    drawCursorOnly();
    function drawCursorOnly() {
      const ca = seg(lt, 1.9, 2.2) * (1 - seg(lt, 3.6, 3.9));
      if (ca <= 0) return;
      const target = {
        x: X0 + 3 * (CARD_W + GAP) + CARD_W / 2 + 40,
        y: CY + 30,
      };
      const pos = cursorPos(lt, [
        { t: 1.9, x: 1420, y: 900 },
        { t: 2.85, x: target.x, y: target.y },
      ]);
      drawCursor(ctx, pos.x, pos.y, lt, {
        alpha: ca,
        clickAt: CLICK,
        color: C.violet,
      });
    }
  },
};

export const arriveAt = (k) => 5.0 + k * 0.08 + 0.62;
