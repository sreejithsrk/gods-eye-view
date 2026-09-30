// Serve the player locally: node scripts/serve.mjs  → open the printed URL.
import { serve } from './lib/env.mjs';
const { url } = await serve();
console.log(`Requirements Intelligence explainer: ${url}`);
console.log(
  `  render mode:  ${url}?mode=render   · single frame: ${url}?frame=1800`,
);
