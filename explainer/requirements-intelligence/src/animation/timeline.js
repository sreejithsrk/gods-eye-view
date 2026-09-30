// The single global, deterministic timeline. Scene order and durations live
// here; everything else derives its timing from these numbers.

export const FPS = 60;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// [id, duration(s), chapter label]
const PLAN = [
  ['intro', 4.0, 'Introduction'],
  ['project', 6.5, 'Select project'],
  ['knowledge', 7.5, 'Load knowledge'],
  ['requirement', 6.0, 'Capture requirement'],
  ['orchestration', 6.5, 'Reason with context'],
  ['clarification', 6.5, 'Clarify gaps'],
  ['generation', 5.5, 'Specify'],
  ['approval', 4.5, 'Human approval'],
  ['ado', 5.5, 'Plan backlog'],
  ['development', 6.5, 'Build'],
  ['traceability', 5.0, 'Trace'],
  ['dashboard', 5.0, 'Track'],
  ['architecture', 5.5, 'Architecture'],
  ['outro', 6.0, 'Summary'],
];

export const SCENE = {};
export const CHAPTERS = [];
let acc = 0;
PLAN.forEach(([id, dur, label], i) => {
  SCENE[id] = { id, start: acc, dur, end: acc + dur, index: i, label };
  CHAPTERS.push(SCENE[id]);
  acc += dur;
});

export const TOTAL = acc;
export const TOTAL_FRAMES = Math.round(TOTAL * FPS);

/** Global time of a moment expressed relative to a scene start. */
export const at = (id, local = 0) => SCENE[id].start + local;

export function sceneAt(t) {
  for (const s of CHAPTERS) if (t < s.end) return s;
  return CHAPTERS[CHAPTERS.length - 1];
}
