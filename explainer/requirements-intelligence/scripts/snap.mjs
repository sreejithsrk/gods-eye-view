// Render individual moments to PNG for design review.
//   node scripts/snap.mjs 1.5 12 30.25 [--out dir]
//   node scripts/snap.mjs --every 2          (contact sheet frames every 2s)

import fs from 'node:fs';
import path from 'node:path';
import { serve, launch, openStage, grab, ROOT } from './lib/env.mjs';

const args = process.argv.slice(2);
let out = path.join(ROOT, 'output', 'snaps');
const times = [];
let every = 0;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--out') out = path.resolve(args[++i]);
  else if (args[i] === '--every') every = Number(args[++i]);
  else times.push(Number(args[i]));
}
fs.mkdirSync(out, { recursive: true });
const { server, url } = await serve();
const browser = await launch();
const page = await openStage(browser, url);
if (every) {
  const total = await page.evaluate(() => window.__meta.total);
  for (let t = 0; t <= total; t += every) times.push(Number(t.toFixed(3)));
}
for (const t of times) {
  await page.evaluate((t) => window.__renderTime(t), t);
  const buf = await grab(page, 'png');
  const f = path.join(out, `t${t.toFixed(2).padStart(6, '0')}.png`);
  fs.writeFileSync(f, buf);
  console.log(f);
}
await browser.close();
server.close();
