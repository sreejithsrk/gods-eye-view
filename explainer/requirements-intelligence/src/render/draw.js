// Canvas drawing primitives: typography, glass surfaces, traced paths,
// glow sprites and a small, consistent line-icon set.

import { clamp, fract, hash } from '../animation/easing.js';

/** Quality switches. Render mode always uses full quality; the live player
 *  may drop expensive effects if the device can't hold 60 fps. */
export const Q = { shadows: true };

export const C = {
  bg0: '#03050b',
  bg1: '#081022',
  text: '#eef2ff',
  text2: '#b9c3de',
  text3: '#7d89a8',
  cyan: '#5cc8ff',
  blue: '#4f8dff',
  indigo: '#7b88ff',
  violet: '#a98bff',
  green: '#45e0a6',
  amber: '#ffbf5e',
  rose: '#ff6f8e',
  orange: '#ff9a52',
  yellow: '#f2cb4a',
  white: '#ffffff',
};

const rgbCache = new Map();
export function rgba(hex, a = 1) {
  let c = rgbCache.get(hex);
  if (!c) {
    const n = parseInt(hex.slice(1), 16);
    c = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    rgbCache.set(hex, c);
  }
  return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
}
export function mixHex(a, b, p) {
  const ca = parseInt(a.slice(1), 16),
    cb = parseInt(b.slice(1), 16);
  const ch = (s) =>
    Math.round(((ca >> s) & 255) * (1 - p) + ((cb >> s) & 255) * p);
  return (
    '#' +
    ((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)
  );
}

// ---------------------------------------------------------------- typography

export function setFont(ctx, size, weight = 500, mono = false) {
  ctx.font = `${weight} ${size}px ${mono ? '"JetBrains Mono"' : 'Inter'}`;
}

export function text(ctx, s, x, y, o = {}) {
  const {
    size = 20,
    weight = 500,
    color = C.text,
    align = 'left',
    baseline = 'middle',
    mono = false,
    alpha = 1,
    ls = 0,
  } = o;
  if (alpha <= 0.002) return 0;
  ctx.save();
  ctx.globalAlpha *= clamp(alpha);
  setFont(ctx, size, weight, mono);
  ctx.letterSpacing = `${ls}px`;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillStyle = color;
  ctx.fillText(s, x, y);
  const w = ctx.measureText(s).width;
  ctx.restore();
  return w;
}

export function measure(ctx, s, size, weight = 500, mono = false, ls = 0) {
  ctx.save();
  setFont(ctx, size, weight, mono);
  ctx.letterSpacing = `${ls}px`;
  const w = ctx.measureText(s).width;
  ctx.restore();
  return w;
}

export function wrap(ctx, s, maxW, size, weight = 500, mono = false) {
  const words = s.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? cur + ' ' + w : w;
    if (measure(ctx, next, size, weight, mono) > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

/**
 * Kinetic line: words rise into place through a mask, staggered.
 * p01 is the reveal progress in seconds since start (use `tIn`).
 */
export function kinetic(ctx, s, x, y, tIn, o = {}) {
  const {
    size = 36,
    weight = 600,
    color = C.text,
    align = 'center',
    step = 0.055,
    dur = 0.55,
    rise = 0.62,
    accent = [],
    accentColor = C.cyan,
    alpha = 1,
    ls = 0,
    mono = false,
  } = o;
  if (tIn <= 0 || alpha <= 0.002) return;
  const words = s.split(' ');
  const space = measure(ctx, ' ', size, weight, mono, ls);
  const widths = words.map((w) => measure(ctx, w, size, weight, mono, ls));
  const total = widths.reduce((a, b) => a + b, 0) + space * (words.length - 1);
  let cx =
    align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  ctx.save();
  ctx.beginPath();
  ctx.rect(cx - 40, y - size * 0.95, total + 80, size * 1.9);
  ctx.clip();
  words.forEach((w, i) => {
    const p = clamp((tIn - i * step) / dur);
    const e = 1 - Math.pow(1 - p, 4);
    const isAccent = accent.includes(w.replace(/[.,]/g, ''));
    text(ctx, w, cx, y + (1 - e) * size * rise, {
      size,
      weight,
      color: isAccent ? accentColor : color,
      alpha: alpha * clamp(p * 1.6),
      ls,
      mono,
    });
    cx += widths[i] + space;
  });
  ctx.restore();
}

// ---------------------------------------------------------------- surfaces

export function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(
    x,
    y,
    Math.max(0, w),
    Math.max(0, h),
    Math.max(0, Math.min(r, w / 2, h / 2)),
  );
}

/**
 * Frosted-glass card. R = {x,y,w,h,r}.
 */
export function glass(ctx, R, o = {}) {
  const {
    alpha = 1,
    tint = null,
    tintA = 0.14,
    glow = 0,
    glowColor = C.cyan,
    border = 0.16,
    fill = 0.06,
    shadow = true,
    base = 0.72,
    borderColor = null,
  } = o;
  if (alpha <= 0.002 || R.w <= 1 || R.h <= 1) return;
  const { x, y, w, h } = R;
  const r = R.r ?? 16;
  ctx.save();
  ctx.globalAlpha *= clamp(alpha);
  if (shadow && Q.shadows) {
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 36;
    ctx.shadowOffsetY = 16;
  }
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = `rgba(12,17,33,${base})`;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  const g = ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, `rgba(255,255,255,${fill})`);
  g.addColorStop(1, 'rgba(255,255,255,0.008)');
  ctx.fillStyle = g;
  ctx.fill();
  if (tint) {
    const tg = ctx.createRadialGradient(x, y, 0, x, y, Math.max(w, h) * 0.9);
    tg.addColorStop(0, rgba(tint, tintA));
    tg.addColorStop(1, rgba(tint, 0));
    ctx.fillStyle = tg;
    ctx.fill();
  }
  if (glow > 0) {
    ctx.shadowColor = rgba(glowColor, 0.85 * glow);
    ctx.shadowBlur = 28 * glow;
    ctx.strokeStyle = rgba(glowColor, 0.75 * glow);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.shadowColor = 'transparent';
  }
  const bg = ctx.createLinearGradient(x, y, x + w * 0.4, y + h);
  const bc = borderColor ?? '#ffffff';
  bg.addColorStop(0, rgba(bc, border * 1.6));
  bg.addColorStop(1, rgba(bc, border * 0.25));
  ctx.strokeStyle = bg;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();
}

export function pill(ctx, x, y, label, o = {}) {
  const {
    size = 16,
    color = C.text,
    bg = C.indigo,
    bgA = 0.16,
    border = 0.4,
    weight = 600,
    mono = false,
    alpha = 1,
    padX = 14,
    h = size * 2,
    align = 'left',
    icon = null,
    dot = null,
    ls = 0,
  } = o;
  const iw = icon ? size + 8 : dot ? 16 : 0;
  const w = measure(ctx, label, size, weight, mono, ls) + padX * 2 + iw;
  const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  if (alpha <= 0.002) return w;
  ctx.save();
  ctx.globalAlpha *= clamp(alpha);
  rr(ctx, x0, y - h / 2, w, h, h / 2);
  ctx.fillStyle = rgba(bg, bgA);
  ctx.fill();
  ctx.strokeStyle = rgba(bg, border);
  ctx.lineWidth = 1;
  ctx.stroke();
  if (icon) icon(ctx, x0 + padX + size / 2, y, size);
  if (dot) {
    ctx.beginPath();
    ctx.arc(x0 + padX + 4, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = dot;
    ctx.fill();
  }
  text(ctx, label, x0 + padX + iw, y + 0.5, { size, color, weight, mono, ls });
  ctx.restore();
  return w;
}

export function avatar(ctx, x, y, r, initials, color, alpha = 1) {
  if (alpha <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
  g.addColorStop(0, rgba(color, 0.95));
  g.addColorStop(1, rgba(mixHex(color, '#1b2140', 0.55), 1));
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  text(ctx, initials, x, y + 1, {
    size: r * 0.72,
    weight: 700,
    align: 'center',
    color: '#0b1020',
  });
  ctx.restore();
}

// ---------------------------------------------------------------- paths

export function cubic(a, c1, c2, b, n = 40) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n,
      q = 1 - t;
    pts.push({
      x:
        q * q * q * a.x +
        3 * q * q * t * c1.x +
        3 * q * t * t * c2.x +
        t * t * t * b.x,
      y:
        q * q * q * a.y +
        3 * q * q * t * c1.y +
        3 * q * t * t * c2.y +
        t * t * t * b.y,
    });
  }
  return pts;
}
/** Horizontal S-curve between two points. */
export const hcurve = (a, b, k = 0.5) =>
  cubic(
    a,
    { x: a.x + (b.x - a.x) * k, y: a.y },
    { x: b.x - (b.x - a.x) * k, y: b.y },
    b,
  );
/** Vertical S-curve between two points. */
export const vcurve = (a, b, k = 0.5) =>
  cubic(
    a,
    { x: a.x, y: a.y + (b.y - a.y) * k },
    { x: b.x, y: b.y - (b.y - a.y) * k },
    b,
  );

const lenCache = new WeakMap();
function cum(pts) {
  let c = lenCache.get(pts);
  if (c) return c;
  c = [0];
  for (let i = 1; i < pts.length; i++)
    c.push(
      c[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y),
    );
  lenCache.set(pts, c);
  return c;
}
export const pathLength = (pts) => {
  const c = cum(pts);
  return c[c.length - 1];
};

export function pointAt(pts, p) {
  const c = cum(pts);
  const L = c[c.length - 1] * clamp(p);
  let i = 1;
  while (i < c.length - 1 && c[i] < L) i++;
  const seg = c[i] - c[i - 1] || 1;
  const k = (L - c[i - 1]) / seg;
  const a = pts[i - 1],
    b = pts[i];
  return {
    x: a.x + (b.x - a.x) * k,
    y: a.y + (b.y - a.y) * k,
    angle: Math.atan2(b.y - a.y, b.x - a.x),
  };
}

/** Stroke the sub-path between fractions p0..p1 of the polyline. */
export function strokeSub(ctx, pts, p0, p1) {
  p0 = clamp(p0);
  p1 = clamp(p1);
  if (p1 <= p0) return;
  const c = cum(pts),
    L = c[c.length - 1];
  const a = p0 * L,
    b = p1 * L;
  ctx.beginPath();
  const s = pointAt(pts, p0);
  ctx.moveTo(s.x, s.y);
  for (let i = 1; i < pts.length; i++)
    if (c[i] > a && c[i] < b) ctx.lineTo(pts[i].x, pts[i].y);
  const e = pointAt(pts, p1);
  ctx.lineTo(e.x, e.y);
  ctx.stroke();
}

/** A connection line: faint base + bright traced portion. */
export function link(ctx, pts, o = {}) {
  const {
    p = 1,
    color = C.cyan,
    alpha = 1,
    width = 1.6,
    base = 0.18,
    dash = null,
    glow = 0.35,
    t = 0,
    dashSpeed = 40,
  } = o;
  if (alpha <= 0.002 || p <= 0) return;
  ctx.save();
  ctx.globalAlpha *= clamp(alpha);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (dash) {
    ctx.setLineDash(dash);
    ctx.lineDashOffset = -t * dashSpeed;
  }
  ctx.strokeStyle = rgba(color, base + 0.35);
  ctx.lineWidth = width;
  strokeSub(ctx, pts, 0, p);
  if (glow > 0) {
    ctx.strokeStyle = rgba(color, glow * 0.25);
    ctx.lineWidth = width * 5;
    strokeSub(ctx, pts, 0, p);
  }
  ctx.restore();
}

// ---------------------------------------------------------------- glow sprites

const sprites = new Map();
export function glowSprite(color, size = 64) {
  const k = color + size;
  let s = sprites.get(k);
  if (s) return s;
  s = document.createElement('canvas');
  s.width = s.height = size;
  const g = s.getContext('2d');
  const gr = g.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gr.addColorStop(0, rgba('#ffffff', 1));
  gr.addColorStop(0.12, rgba(color, 0.95));
  gr.addColorStop(0.4, rgba(color, 0.28));
  gr.addColorStop(1, rgba(color, 0));
  g.fillStyle = gr;
  g.fillRect(0, 0, size, size);
  sprites.set(k, s);
  return s;
}
export function dot(ctx, x, y, r, color, alpha = 1) {
  if (alpha <= 0.002) return;
  const s = glowSprite(color);
  ctx.save();
  ctx.globalAlpha *= clamp(alpha);
  ctx.globalCompositeOperation = 'lighter';
  ctx.drawImage(s, x - r * 4, y - r * 4, r * 8, r * 8);
  ctx.restore();
}
export function softGlow(ctx, x, y, r, color, a) {
  if (a <= 0.002) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(color, a));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

/** Particles streaming along a polyline. */
export function flow(ctx, pts, t, o = {}) {
  const {
    count = 6,
    speed = 0.45,
    color = C.cyan,
    size = 2.6,
    alpha = 1,
    seed = 1,
    p0 = 0,
    p1 = 1,
  } = o;
  if (alpha <= 0.002) return;
  for (let i = 0; i < count; i++) {
    const u = fract(
      t * speed * (0.85 + 0.3 * hash(seed + i)) +
        i / count +
        hash(seed * 7 + i),
    );
    const q = p0 + (p1 - p0) * u;
    const pt = pointAt(pts, q);
    const fade = Math.min(1, u * 6, (1 - u) * 6);
    dot(ctx, pt.x, pt.y, size, color, alpha * fade);
  }
}

// ---------------------------------------------------------------- icons

/** Line icons, drawn centred at (x, y) within a box of size s. */
export function icon(ctx, name, x, y, s, color = C.text, lw = 1.9) {
  const k = s / 24;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.translate(-12, -12);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = (lw / k) * (k < 1 ? 1 : 0.9);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const circ = (cx, cy, r, fill) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    fill ? ctx.fill() : ctx.stroke();
  };
  const path = (d) => ctx.stroke(new Path2D(d));
  switch (name) {
    case 'code':
      path('M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4.5l-3 15');
      break;
    case 'api':
      path(
        'M8 4c-2 0-3 1-3 3v2c0 1.5-1 2.5-2 3 1 .5 2 1.5 2 3v2c0 2 1 3 3 3M16 4c2 0 3 1 3 3v2c0 1.5 1 2.5 2 3-1 .5-2 1.5-2 3v2c0 2-1 3-3 3',
      );
      circ(12, 12, 1.4, true);
      break;
    case 'doc':
      path('M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 15.5h6M9 19h4');
      break;
    case 'board':
      path('M4 4h16v16H4zM9.3 4v16M14.7 4v16');
      ctx.fillRect(5.6, 6, 2.2, 3);
      ctx.fillRect(11, 6, 2.2, 5);
      ctx.fillRect(16.3, 6, 2.2, 2.5);
      break;
    case 'book':
      path(
        'M4 5c3-1.5 5.5-1.5 8 0v15c-2.5-1.5-5-1.5-8 0zM12 5c2.5-1.5 5-1.5 8 0v15c-3-1.5-5.5-1.5-8 0z',
      );
      break;
    case 'layers':
      path('M12 3l9 5-9 5-9-5zM3 12.5l9 5 9-5M3 16.5l9 5 9-5');
      break;
    case 'history':
      path('M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4M12 8v4.5l3 2');
      break;
    case 'pulse':
      path('M3 12h4l2.5-6 4 12 2.5-6H21');
      break;
    case 'git':
      circ(7, 5.5, 2.2);
      circ(7, 18.5, 2.2);
      circ(17, 8, 2.2);
      path('M7 7.7v8.6M17 10.2c0 4-6 3-9 6.5');
      break;
    case 'branch':
      circ(6, 5, 2);
      circ(6, 19, 2);
      circ(18, 7, 2);
      path('M6 7v10M18 9c0 5-10 3-12 8');
      break;
    case 'search':
      circ(10.5, 10.5, 6.5);
      path('M15.5 15.5L21 21');
      break;
    case 'shield':
      path('M12 3l7.5 3v5.5c0 4.7-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.8-7.5-9.5V6z');
      path('M8.8 12.2l2.2 2.2 4.4-4.6');
      break;
    case 'lock':
      path('M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3');
      break;
    case 'user':
      circ(12, 8, 3.8);
      path('M4.5 20.5c1.2-4 4-5.8 7.5-5.8s6.3 1.8 7.5 5.8');
      break;
    case 'users':
      circ(9, 8.5, 3.2);
      circ(16.5, 9.5, 2.6);
      path('M3 19.5c.9-3.4 3.2-5 6-5s5.1 1.6 6 5M15 14.7c2.6-.4 4.8.9 6 4');
      break;
    case 'gear':
      circ(12, 12, 3);
      path(
        'M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M5.5 18.5l2.1-2.1M16.4 7.6l2.1-2.1',
      );
      break;
    case 'agent':
      path('M12 2.8l8 4.6v9.2l-8 4.6-8-4.6V7.4z');
      circ(12, 12, 2.4, true);
      path(
        'M12 7v2.5M12 14.5V17M7.7 9.5l2.2 1.3M14.1 13.2l2.2 1.3M7.7 14.5l2.2-1.3M14.1 10.8l2.2-1.3',
      );
      break;
    case 'orchestrator':
      circ(12, 12, 3.2);
      circ(4.5, 5.5, 1.8);
      circ(19.5, 5.5, 1.8);
      circ(4.5, 18.5, 1.8);
      circ(19.5, 18.5, 1.8);
      path('M6 6.8l3.6 3M18 6.8l-3.6 3M6 17.2l3.6-3M18 17.2l-3.6-3');
      break;
    case 'analyze':
      path('M4 20V10M9.3 20V4M14.6 20v-7M20 20v-4');
      break;
    case 'chat':
      path('M4 5h16v11H10l-4 3.5V16H4z');
      path('M8 9.5h8M8 12.5h5');
      break;
    case 'impact':
      circ(12, 12, 2.2, true);
      circ(12, 12, 5.5);
      ctx.globalAlpha *= 0.55;
      circ(12, 12, 9);
      break;
    case 'arch':
      path('M3 20h18M5 20V10M9.7 20V10M14.3 20V10M19 20V10M2.5 10L12 4l9.5 6z');
      break;
    case 'check':
      path('M5 12.5l4.5 4.5L19 7.5');
      break;
    case 'x':
      path('M6 6l12 12M18 6L6 18');
      break;
    case 'link':
      path(
        'M10 14a4 4 0 0 0 5.7 0l3.5-3.5a4 4 0 0 0-5.7-5.7L12 6.3M14 10a4 4 0 0 0-5.7 0l-3.5 3.5a4 4 0 0 0 5.7 5.7l1.5-1.5',
      );
      break;
    case 'flask':
      path(
        'M9 3h6M10 3v6l-5.5 9.5c-.6 1.1.2 2.5 1.5 2.5h12c1.3 0 2.1-1.4 1.5-2.5L14 9V3M7.5 15h9',
      );
      break;
    case 'radar':
      circ(12, 12, 9);
      circ(12, 12, 5);
      path('M12 12l6-6');
      circ(12, 12, 1.4, true);
      break;
    case 'pr':
      circ(6, 5.5, 2.2);
      circ(6, 18.5, 2.2);
      circ(18, 18.5, 2.2);
      path('M6 7.7v8.6M18 16.3V9.5c0-2-1-3-3-3h-4M13 4l-2.5 2.5L13 9');
      break;
    case 'plug':
      path('M9 3v5M15 3v5M6.5 8h11v3.5a5.5 5.5 0 0 1-11 0zM12 17v4');
      break;
    case 'cube':
      path('M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9');
      break;
    case 'rocket':
      path(
        'M12 3c3 2 5 5.5 5 9.5l-2 3.5H9l-2-3.5C7 8.5 9 5 12 3zM9 16l-2.5 4M15 16l2.5 4',
      );
      circ(12, 10, 1.8);
      break;
    case 'flag':
      path('M5 21V4M5 4.5h12l-2.5 4 2.5 4H5');
      break;
    case 'cloud':
      path('M7 18h10.5a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 18z');
      break;
    case 'spark':
      path(
        'M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3',
      );
      break;
    case 'bulb':
      path(
        'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.3 1 2.1h5c0-.8.4-1.6 1-2.1A6 6 0 0 0 12 3z',
      );
      break;
    case 'gauge':
      path('M4 17a8 8 0 1 1 16 0');
      path('M12 17l4-6');
      circ(12, 17, 1.4, true);
      break;
    case 'level':
      path('M7 3h10v18H7z');
      ctx.globalAlpha *= 0.9;
      ctx.fillRect(8.6, 12, 6.8, 7.4);
      path('M4 12h2M18 12h2');
      break;
    case 'thermo':
      path('M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z');
      circ(12, 17.6, 1.6, true);
      break;
    case 'flow':
      circ(5, 7, 2);
      circ(19, 7, 2);
      circ(12, 17, 2);
      path('M7 7h10M6 8.8l4.8 6.6M18 8.8l-4.8 6.6');
      break;
    case 'eye':
      path(
        'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z',
      );
      circ(12, 12, 3);
      break;
    case 'dashboard':
      path('M4 4h7v9H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 15h7v5H4z');
      break;
    case 'bolt':
      path('M13 2L5 13.5h6L10 22l9-12h-6z');
      break;
    default:
      circ(12, 12, 6);
  }
  ctx.restore();
}

/** Icon inside a rounded tinted tile. */
export function iconTile(ctx, name, x, y, s, color, alpha = 1, fillA = 0.16) {
  if (alpha <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  rr(ctx, x - s / 2, y - s / 2, s, s, s * 0.28);
  const g = ctx.createLinearGradient(
    x - s / 2,
    y - s / 2,
    x + s / 2,
    y + s / 2,
  );
  g.addColorStop(0, rgba(color, fillA * 1.6));
  g.addColorStop(1, rgba(color, fillA * 0.5));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = rgba(color, 0.45);
  ctx.lineWidth = 1;
  ctx.stroke();
  icon(ctx, name, x, y, s * 0.56, color);
  ctx.restore();
}

/** Animated check mark (p: 0..1 draw progress) in a circle. */
export function checkCircle(ctx, x, y, r, p, color = C.green, alpha = 1) {
  if (alpha <= 0.002 || p <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  const e = clamp(p * 1.5);
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * e);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = rgba(color, 0.16 * e);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  const cp = clamp((p - 0.35) / 0.65);
  if (cp > 0) {
    const pts = [
      { x: x - r * 0.42, y: y + r * 0.02 },
      { x: x - r * 0.1, y: y + r * 0.34 },
      { x: x + r * 0.46, y: y - r * 0.32 },
    ];
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    strokeSub(ctx, pts, 0, cp);
  }
  ctx.restore();
}

/** Small spinner arc. */
export function spinner(ctx, x, y, r, t, color = C.cyan, alpha = 1) {
  if (alpha <= 0.002) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = rgba(color, 0.2);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const a = t * 7;
  ctx.arc(x, y, r, a, a + 1.8);
  ctx.stroke();
  ctx.restore();
}

/** Deterministic character scramble that resolves to `target`. */
export function scramble(target, p, seed = 1) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < target.length; i++) {
    const lock = (i + 1) / target.length;
    if (p >= lock || target[i] === '-' || target[i] === ' ') out += target[i];
    else
      out +=
        chars[
          Math.floor(hash(seed + i * 13 + Math.floor(p * 30)) * chars.length)
        ];
  }
  return out;
}
