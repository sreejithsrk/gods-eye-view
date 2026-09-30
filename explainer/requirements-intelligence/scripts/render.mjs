// Deterministic frame capture + encode.
//
//   node scripts/render.mjs                      # full film, 60 fps, MP4 + WebM
//   node scripts/render.mjs --fps 30 --workers 6
//   node scripts/render.mjs --from 1200 --to 1500 --no-encode
//   node scripts/render.mjs --formats mp4        # skip WebM
//
// Every frame n is rendered at t = n / fps by a pure function of time, so
// any frame can be re-rendered in isolation and runs are reproducible.

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import {
  serve,
  launch,
  openStage,
  grab,
  findFfmpeg,
  ROOT,
} from './lib/env.mjs';

const argv = process.argv.slice(2);
const opt = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : def;
};
const flag = (name) => argv.includes(`--${name}`);

const fps = Number(opt('fps', 60));
const workers = Number(opt('workers', 4));
const outDir = path.resolve(opt('out', path.join(ROOT, 'output')));
const framesDir = path.join(outDir, 'frames');
const format = opt('frame-format', 'png'); // png (lossless) | jpeg
const formats = opt('formats', 'mp4,webm').split(',');
const name = opt('name', 'requirements-intelligence-explainer');

fs.mkdirSync(framesDir, { recursive: true });
const { server, url } = await serve();
const browser = await launch();

const probe = await openStage(browser, url);
const meta = await probe.evaluate(() => window.__meta);
await probe.close();
const total = Math.round(meta.total * fps);
const from = Number(opt('from', 0));
const to = Math.min(Number(opt('to', total)), total);
const ext = format === 'png' ? 'png' : 'jpg';
console.log(
  `Rendering frames ${from}–${to - 1} of ${total} (${meta.total}s @ ${fps} fps) with ${workers} workers → ${framesDir}`,
);

let done = 0;
const t0 = Date.now();
const frameFile = (n) =>
  path.join(framesDir, `f${String(n).padStart(6, '0')}.${ext}`);

async function worker(k) {
  const page = await openStage(browser, url);
  for (let n = from + k; n < to; n += workers) {
    if (flag('resume') && fs.existsSync(frameFile(n))) {
      done++;
      continue;
    }
    await page.evaluate(([n, fps]) => window.__renderFrame(n, fps), [n, fps]);
    const buf = await grab(page, format === 'png' ? 'png' : 'jpeg', 0.95);
    fs.writeFileSync(frameFile(n), buf);
    done++;
    if (done % 120 === 0) {
      const el = (Date.now() - t0) / 1000;
      const rate = done / el;
      console.log(
        `  ${done}/${to - from} frames · ${rate.toFixed(1)} fps · eta ${Math.round((to - from - done) / rate)}s`,
      );
    }
  }
  await page.close();
}
await Promise.all(Array.from({ length: workers }, (_, k) => worker(k)));
await browser.close();
server.close();
console.log(`Frames done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

if (flag('no-encode')) process.exit(0);

const ffmpeg = findFfmpeg();
const run = (args) =>
  new Promise((resolve, reject) => {
    console.log(`$ ffmpeg ${args.join(' ')}`);
    const p = spawn(ffmpeg, args, { stdio: ['ignore', 'inherit', 'inherit'] });
    p.on('exit', (c) =>
      c === 0 ? resolve() : reject(new Error(`ffmpeg exited ${c}`)),
    );
  });
const input = [
  '-y',
  '-hide_banner',
  '-loglevel',
  'warning',
  '-stats',
  '-framerate',
  String(fps),
  '-start_number',
  String(from),
  '-i',
  path.join(framesDir, `f%06d.${ext}`),
];
if (formats.includes('mp4')) {
  await run([
    ...input,
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    '16',
    '-tune',
    'animation',
    '-pix_fmt',
    'yuv420p',
    '-colorspace',
    'bt709',
    '-color_primaries',
    'bt709',
    '-color_trc',
    'bt709',
    '-movflags',
    '+faststart',
    path.join(outDir, `${name}.mp4`),
  ]);
}
if (formats.includes('webm')) {
  await run([
    ...input,
    '-c:v',
    'libvpx-vp9',
    '-b:v',
    '0',
    '-crf',
    '28',
    '-row-mt',
    '1',
    '-deadline',
    'good',
    '-cpu-used',
    '3',
    '-pix_fmt',
    'yuv420p',
    path.join(outDir, `${name}.webm`),
  ]);
}
if (!flag('keep-frames'))
  fs.rmSync(framesDir, { recursive: true, force: true });
console.log(`Done → ${outDir}`);
