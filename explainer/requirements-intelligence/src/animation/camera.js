// Global camera. A gentle, deterministic drift keeps the frame alive, and a
// soft "push-through" pulse at each scene boundary makes cuts feel like
// continuous camera moves instead of slide changes.

import { CHAPTERS, WIDTH, HEIGHT } from './timeline.js';
import { bump } from './easing.js';

export function camera(t) {
  let z = 1 + 0.008 * Math.sin(t * 0.35);
  let x = WIDTH / 2 + 6 * Math.sin(t * 0.21);
  let y = HEIGHT / 2 + 4 * Math.cos(t * 0.17);
  for (let i = 1; i < CHAPTERS.length; i++) {
    const b = CHAPTERS[i].start;
    if (t > b - 0.8 && t < b + 0.8) z += 0.022 * bump(t, b - 0.8, b + 0.8);
  }
  // Intro: slow settle from a slight push-in.
  if (t < 4) z += 0.05 * (1 - t / 4) ** 2;
  return { x, y, z };
}

export function applyCamera(ctx, cam) {
  ctx.translate(WIDTH / 2, HEIGHT / 2);
  ctx.scale(cam.z, cam.z);
  ctx.translate(-cam.x, -cam.y);
}
