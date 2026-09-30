// Frame renderer: a pure function of time. render(ctx, t) draws exactly the
// same pixels for the same t, which is what makes frame capture reproducible.

import {
  SCENE,
  TOTAL,
  WIDTH as W,
  HEIGHT as H,
} from '../animation/timeline.js';
import { camera, applyCamera } from '../animation/camera.js';
import { seg, clamp } from '../animation/easing.js';
import {
  drawBackdrop,
  drawNetwork,
  drawFloor,
  drawVignette,
} from '../components/Background.js';
import { drawCaptions } from '../components/Caption.js';
import { drawHUD } from '../components/HUD.js';
import { SCENES } from '../scenes/index.js';

// Collect all captions onto the global timeline once.
export const CAPTIONS = SCENES.flatMap((s) =>
  (s.captions ?? []).map((c) => ({
    ...c,
    t0: SCENE[s.id].start + c.t0,
    t1: SCENE[s.id].start + c.t1,
  })),
);

function networkIntensity(t) {
  // Full in the intro, recedes behind dense UI, returns for architecture.
  const intro = clamp(t / 1.4);
  const dense = 1 - 0.55 * seg(t, 3.5, 5);
  const arch =
    0.45 *
    seg(t, SCENE.architecture.start - 0.5, SCENE.architecture.start + 1) *
    (1 - seg(t, TOTAL - 3.5, TOTAL - 2));
  return intro * dense + arch;
}
function floorIntensity(t) {
  const k1 =
    seg(t, SCENE.knowledge.start + 2.5, SCENE.knowledge.start + 3.5) *
    (1 - seg(t, SCENE.requirement.start - 0.6, SCENE.requirement.start));
  const k2 =
    seg(t, SCENE.traceability.start - 0.5, SCENE.traceability.start + 0.5) *
    (1 - seg(t, SCENE.dashboard.start - 0.4, SCENE.dashboard.start + 0.2));
  const k3 =
    seg(t, SCENE.architecture.start, SCENE.architecture.start + 1) *
    (1 - seg(t, SCENE.outro.start, SCENE.outro.start + 1));
  return Math.max(k1, k2, k3);
}

export function render(ctx, t) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  const scale = ctx.canvas.width / W;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  drawBackdrop(ctx, t);
  const cam = camera(t);
  drawNetwork(ctx, t, networkIntensity(t), cam);
  drawFloor(ctx, t, floorIntensity(t));

  ctx.save();
  applyCamera(ctx, cam);
  for (const s of SCENES) {
    const d = SCENE[s.id];
    if (t < d.start - (s.pre ?? 0) || t >= d.end + (s.post ?? 0)) continue;
    ctx.save();
    s.draw(ctx, t - d.start, t);
    ctx.restore();
  }
  ctx.restore();

  drawHUD(ctx, t);
  drawCaptions(ctx, t, CAPTIONS);
  drawVignette(ctx);

  // Fade from / to black.
  const fade = Math.max(1 - seg(t, 0, 0.6), seg(t, TOTAL - 1.1, TOTAL - 0.1));
  if (fade > 0) {
    ctx.fillStyle = `rgba(0,0,0,${fade})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}
