// Shared helpers for the capture scripts: a zero-dependency static server,
// Playwright resolution and FFmpeg resolution.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.png': 'image/png',
};

export function serve(root = ROOT) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      const file = path.join(root, url === '/' ? 'index.html' : url);
      if (
        !file.startsWith(root) ||
        !fs.existsSync(file) ||
        fs.statSync(file).isDirectory()
      ) {
        res.writeHead(404).end();
        return;
      }
      res.writeHead(200, {
        'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream',
        'cache-control': 'no-store',
      });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () =>
      resolve({ server, url: `http://127.0.0.1:${server.address().port}/` }),
    );
  });
}

export async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    // Fall back to a globally installed copy.
    const globalRoot = execSync('npm root -g').toString().trim();
    const req = createRequire(path.join(globalRoot, 'noop.js'));
    return req('playwright');
  }
}

export async function launch() {
  const { chromium } = await loadPlaywright();
  const opts = {
    args: [
      '--disable-gpu-vsync',
      '--force-color-profile=srgb',
      '--font-render-hinting=none',
      '--disable-lcd-text',
    ],
  };
  const exe =
    process.env.CHROMIUM_PATH ??
    (fs.existsSync('/opt/pw-browsers/chromium') ? undefined : undefined);
  if (exe) opts.executablePath = exe;
  return chromium.launch(opts);
}

export async function openStage(browser, url) {
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  page.on('pageerror', (e) => console.error('[page]', e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') console.error('[console]', m.text());
  });
  await page.goto(`${url}?mode=render`);
  await page.waitForFunction(() => window.__ready === true, null, {
    timeout: 60000,
  });
  return page;
}

/** Capture the canvas as an encoded image buffer. */
export async function grab(page, type = 'jpeg', quality = 0.95) {
  const b64 = await page.evaluate(
    ([type, quality]) => {
      const c = document.getElementById('stage');
      return c.toDataURL(`image/${type}`, quality).split(',')[1];
    },
    [type, quality],
  );
  return Buffer.from(b64, 'base64');
}

export function findFfmpeg() {
  const cands = [process.env.FFMPEG, 'ffmpeg'];
  for (const c of cands) {
    if (!c) continue;
    try {
      execSync(`"${c}" -hide_banner -version`, { stdio: 'ignore' });
      return c;
    } catch {}
  }
  try {
    const p = execSync(
      'python3 -c "import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())"',
      { stdio: ['ignore', 'pipe', 'ignore'] },
    )
      .toString()
      .trim();
    if (p) return p;
  } catch {}
  throw new Error(
    'FFmpeg not found. Install ffmpeg, set FFMPEG=/path/to/ffmpeg, or `pip install imageio-ffmpeg`.',
  );
}
