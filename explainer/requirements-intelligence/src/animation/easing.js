// Pure, deterministic easing + timing helpers. Every animated value in the
// film is a function of the global time `t` (seconds) and nothing else.

export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, p) => a + (b - a) * p;
export const invLerp = (a, b, v) => (b === a ? 0 : (v - a) / (b - a));
export const fract = (v) => v - Math.floor(v);

/** Normalised progress of `t` through [a, b], clamped to 0..1. */
export const seg = (t, a, b) => clamp(invLerp(a, b, t));

/** 0 → 1 → 0 envelope: rises over [a, a+fi], holds, falls over [b-fo, b]. */
export const win = (t, a, b, fi = 0.35, fo = 0.35) =>
  Math.min(seg(t, a, a + fi), 1 - seg(t, b - fo, b));

export const E = {
  linear: (p) => p,
  inQuad: (p) => p * p,
  outQuad: (p) => 1 - (1 - p) * (1 - p),
  inOutQuad: (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
  inCubic: (p) => p * p * p,
  outCubic: (p) => 1 - Math.pow(1 - p, 3),
  inOutCubic: (p) =>
    p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2,
  outQuart: (p) => 1 - Math.pow(1 - p, 4),
  inOutQuart: (p) => (p < 0.5 ? 8 * p ** 4 : 1 - Math.pow(-2 * p + 2, 4) / 2),
  outQuint: (p) => 1 - Math.pow(1 - p, 5),
  inOutQuint: (p) => (p < 0.5 ? 16 * p ** 5 : 1 - Math.pow(-2 * p + 2, 5) / 2),
  outExpo: (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
  inOutExpo: (p) =>
    p <= 0
      ? 0
      : p >= 1
        ? 1
        : p < 0.5
          ? Math.pow(2, 20 * p - 10) / 2
          : (2 - Math.pow(2, -20 * p + 10)) / 2,
  outBack: (p, s = 1.55) =>
    1 + (s + 1) * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2),
  inBack: (p, s = 1.4) => (s + 1) * p * p * p - s * p * p,
};

/**
 * Analytic damped spring, 0 → 1. `dt` is seconds since release, so the
 * result is frame-rate independent and deterministic.
 */
export function spring(dt, freq = 2.4, damping = 0.55) {
  if (dt <= 0) return 0;
  const w = 2 * Math.PI * freq;
  const z = Math.min(damping, 0.999);
  const wd = w * Math.sqrt(1 - z * z);
  return (
    1 -
    Math.exp(-z * w * dt) *
      (Math.cos(wd * dt) + ((z * w) / wd) * Math.sin(wd * dt))
  );
}

/** Staggered progress for item `i`: starts at a + i*step, lasts `dur`. */
export const stagger = (t, i, a, step, dur) =>
  seg(t, a + i * step, a + i * step + dur);

/** Smooth 0 → 1 → 0 bump over [a, b]. */
export const bump = (t, a, b) => {
  const p = seg(t, a, b);
  return Math.sin(p * Math.PI) ** 2;
};

// Deterministic hash-based randomness (no Math.random anywhere in the film).
export function hash(n) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
}
export function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
