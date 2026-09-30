// 00 · Intro — dark screen, an intelligent network wakes up, the mark and
// title resolve, then the title morphs into the application header.

import { C, text, measure } from '../render/draw.js';
import { drawLogo } from '../components/Logo.js';
import { BRAND } from '../components/AppWindow.js';
import { seg, E, lerp } from '../animation/easing.js';

const TITLE = 'Requirements Intelligence';
export const MORPH = [3.3, 4.55]; // global seconds: title → app header

export default {
  id: 'intro',
  pre: 0,
  post: 0.6,
  captions: [],
  draw(ctx, lt, t) {
    const m = E.inOutQuint(seg(t, MORPH[0], MORPH[1]));
    if (m >= 1) return;
    // Logo
    const lp = seg(t, 0.7, 2.0);
    const lx = lerp(960, BRAND.logoX, m),
      ly = lerp(420, BRAND.logoY, m),
      ls = lerp(104, BRAND.logoS, m);
    drawLogo(ctx, lx, ly, ls, lp, 1, t);

    // Title — per-character masked rise; then scales into the header brand.
    const big = 86;
    const scale = lerp(1, BRAND.titleSize / big, m);
    const w = measure(ctx, TITLE, big, 650, false, -1.5);
    const x0 = lerp(960 - w / 2, BRAND.titleX, m);
    const y0 = lerp(548, BRAND.titleY, m);
    ctx.save();
    ctx.translate(x0, y0);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.rect(-20, -big * 0.8, w + 40, big * 1.6);
    ctx.clip();
    let cx = 0;
    for (let i = 0; i < TITLE.length; i++) {
      const ch = TITLE[i];
      const cw = measure(ctx, ch, big, 650, false, -1.5);
      const p = E.outQuart(seg(t, 1.25 + i * 0.028, 1.25 + i * 0.028 + 0.7));
      const g = ctx.createLinearGradient(0, -big / 2, 0, big / 2);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(1, '#c9d3ff');
      text(ctx, ch, cx, (1 - p) * big * 0.8, {
        size: big,
        weight: 650,
        color: g,
        alpha: p,
        ls: -1.5,
      });
      cx += cw;
    }
    ctx.restore();

    // Subtitle
    const sp = E.outCubic(seg(t, 2.1, 2.9));
    const so = seg(t, MORPH[0] - 0.1, MORPH[0] + 0.35);
    text(
      ctx,
      'From Idea to Engineering Execution',
      960,
      632 + (1 - sp) * 14 - so * 20,
      {
        size: 30,
        weight: 400,
        color: C.text2,
        align: 'center',
        alpha: sp * (1 - so),
        ls: 0.5,
      },
    );
    // Hairline accent
    const hp = E.inOutCubic(seg(t, 2.3, 3.1)) * (1 - so);
    if (hp > 0) {
      ctx.save();
      const hw = 260 * hp;
      const g = ctx.createLinearGradient(960 - hw, 0, 960 + hw, 0);
      g.addColorStop(0, 'rgba(92,200,255,0)');
      g.addColorStop(0.5, 'rgba(92,200,255,0.9)');
      g.addColorStop(1, 'rgba(169,139,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(960 - hw, 684, hw * 2, 1.5);
      ctx.restore();
    }
  },
};
