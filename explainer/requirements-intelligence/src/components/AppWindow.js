// The Requirements Intelligence application shell.

import {
  C,
  glass,
  text,
  pill,
  avatar,
  rr,
  rgba,
  icon,
} from '../render/draw.js';
import { drawLogo } from './Logo.js';

export const APP = { x: 250, y: 110, w: 1420, h: 860, r: 26 };
export const HEADER_H = 68;
/** Where the brand lives inside the header (target of the intro morph). */
export const BRAND = {
  logoX: APP.x + 40,
  logoY: APP.y + HEADER_H / 2,
  logoS: 28,
  titleX: APP.x + 66,
  titleY: APP.y + HEADER_H / 2,
  titleSize: 19,
};

/**
 * o.header: { brand: bool, project: string|null, projectA, right: [{label,color}], avatar: 'PO' }
 * o.content: 0..1 alpha for header chrome.
 */
export function drawAppWindow(ctx, R, t, o = {}) {
  const {
    alpha = 1,
    chrome = 1,
    brand = true,
    project = null,
    projectA = 1,
    rightChips = [],
    showAvatar = true,
    title = null,
  } = o;
  if (alpha <= 0.002) return;
  glass(ctx, R, {
    alpha,
    base: 0.8,
    fill: 0.045,
    border: 0.14,
    tint: C.indigo,
    tintA: 0.1,
  });
  if (chrome <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= alpha * chrome;
  // Header divider
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  ctx.fillRect(R.x + 1, R.y + HEADER_H, R.w - 2, 1);
  // Window controls
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(R.x + R.w - 36 - i * 20, R.y + 22, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    ctx.fill();
  }
  const my = R.y + HEADER_H / 2;
  if (brand) {
    drawLogo(ctx, R.x + 40, my, 28, 1, 1, t);
    text(ctx, 'Requirements Intelligence', R.x + 66, my, {
      size: 19,
      weight: 650,
    });
  }
  if (title)
    text(ctx, title, R.x + 296, my, { size: 17, weight: 500, color: C.text3 });
  if (project) {
    const px = R.x + R.w / 2;
    pill(ctx, px, my, project, {
      size: 16,
      align: 'center',
      bg: C.violet,
      alpha: projectA,
      dot: C.violet,
      h: 34,
    });
  }
  let rx = R.x + R.w - (showAvatar ? 150 : 100);
  for (const c of rightChips) {
    const w = pill(ctx, rx, my, c.label, {
      size: 14,
      align: 'right',
      bg: c.color ?? C.green,
      color: c.textColor ?? C.text,
      alpha: c.alpha ?? 1,
      dot: c.color ?? C.green,
      h: 30,
      weight: 600,
    });
    rx -= w + 10;
  }
  if (showAvatar) avatar(ctx, R.x + R.w - 118, my, 17, 'PO', C.cyan);
  ctx.restore();
}

/** Chat composer field. */
export function drawComposer(ctx, R, o = {}) {
  const {
    alpha = 1,
    focus = 0,
    placeholder = 'Describe a new requirement…',
    value = '',
    caret = false,
  } = o;
  if (alpha <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  rr(ctx, R.x, R.y, R.w, R.h, R.h / 2);
  ctx.fillStyle = 'rgba(8,12,26,0.85)';
  ctx.fill();
  ctx.strokeStyle = rgba(C.cyan, 0.18 + 0.5 * focus);
  ctx.lineWidth = 1.3;
  ctx.stroke();
  if (focus > 0) {
    ctx.shadowColor = rgba(C.cyan, 0.5 * focus);
    ctx.shadowBlur = 24;
    ctx.stroke();
    ctx.shadowColor = 'transparent';
  }
  icon(ctx, 'spark', R.x + 34, R.y + R.h / 2, 20, C.cyan);
  const tx = R.x + 62;
  if (value) {
    const w = text(ctx, value, tx, R.y + R.h / 2, { size: 22, weight: 500 });
    if (caret) {
      ctx.fillStyle = C.cyan;
      ctx.fillRect(tx + w + 3, R.y + R.h / 2 - 13, 2, 26);
    }
  } else {
    text(ctx, placeholder, tx, R.y + R.h / 2, { size: 21, color: C.text3 });
    if (caret) {
      ctx.fillStyle = C.cyan;
      ctx.fillRect(tx - 2, R.y + R.h / 2 - 13, 2, 26);
    }
  }
  // send button
  const bx = R.x + R.w - R.h / 2 - 4,
    by = R.y + R.h / 2;
  ctx.beginPath();
  ctx.arc(bx, by, R.h / 2 - 10, 0, Math.PI * 2);
  ctx.fillStyle = value ? C.cyan : 'rgba(255,255,255,0.08)';
  ctx.fill();
  ctx.strokeStyle = value ? '#0b1020' : C.text3;
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(bx, by + 8);
  ctx.lineTo(bx, by - 8);
  ctx.moveTo(bx - 6, by - 2);
  ctx.lineTo(bx, by - 8);
  ctx.lineTo(bx + 6, by - 2);
  ctx.stroke();
  ctx.restore();
}
