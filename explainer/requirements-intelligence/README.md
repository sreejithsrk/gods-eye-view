# Requirements Intelligence — motion explainer

An 80-second, narration-free motion graphic that walks a technical audience through
the **Requirements Intelligence** platform end to end: project selection → knowledge
grounding → requirement capture → AI orchestration → clarification → specification →
human approval → Azure DevOps backlog → agent-driven development → traceability →
dashboard → architecture.

It is built as code: one deterministic global timeline, rendered with Canvas 2D at
1920×1080 / 60 fps, and captured frame-by-frame with Playwright + FFmpeg into
`requirements-intelligence-explainer.mp4` and `.webm`.

## Run it

No build step and no runtime dependencies. You need Node 18+.

```bash
cd explainer/requirements-intelligence
node scripts/serve.mjs          # prints a local URL, open it in a browser
```

Player controls: <kbd>Space</kbd> play/pause · <kbd>←</kbd>/<kbd>→</kbd> ±1 s ·
<kbd>Shift</kbd>+<kbd>←</kbd>/<kbd>→</kbd> ±1 frame · <kbd>H</kbd> hide UI · click the
scrubber or a chapter tick to jump.

URL parameters:

| Parameter      | Effect                                                                                          |
| -------------- | ----------------------------------------------------------------------------------------------- |
| `?mode=render` | Bare 1920×1080 canvas, no UI, exposes `window.__renderFrame(n, fps)` / `window.__renderTime(t)` |
| `?frame=<n>`   | Show frame _n_ (at 60 fps) paused                                                               |
| `?t=<seconds>` | Start playback at a time                                                                        |

## Render the video

```bash
npm install                      # only installs Playwright (or use a global install)
node scripts/render.mjs          # → output/requirements-intelligence-explainer.{mp4,webm}
```

Options: `--fps 60` · `--workers 4` · `--from <frame> --to <frame>` · `--formats mp4,webm` ·
`--frame-format png|jpeg` · `--keep-frames` · `--resume` · `--no-encode` · `--out <dir>`.

FFmpeg is resolved from `$FFMPEG`, then `ffmpeg` on `PATH`, then the `imageio-ffmpeg`
Python package (`pip install imageio-ffmpeg`). Chromium comes from Playwright (set
`CHROMIUM_PATH` to use another binary).

For design review, `node scripts/snap.mjs 12.5 30 44.2` writes PNGs of individual
moments to `output/snaps/`; `--every 2` samples the whole film.

### Why it is reproducible

- Every pixel is a pure function of the global time `t`: `render(ctx, t)`. There is no
  `Math.random`, no `Date`, and no accumulated state — randomness comes from seeded hash
  functions (`src/animation/easing.js`), springs are analytic.
- Frame _n_ is drawn at exactly `t = n / fps`, so frames can be rendered in any order,
  in parallel workers, or re-rendered individually (`--from/--to`, `--resume`).
- Fonts (Inter, JetBrains Mono — OFL, in `assets/fonts/`) are vendored and awaited before
  the first frame, so text metrics are identical on every machine.

## Structure

```
index.html                 player shell (scrubber, keyboard)
src/main.js                modes: play / render / frame
src/animation/
  timeline.js              the single global timeline: scene order + durations
  easing.js                easing, analytic spring, stagger, seeded hash/rng
  camera.js                global camera drift + push-through at scene boundaries
  transitions.js           morphRect, masked reveals, arcs — the morphing toolkit
src/render/
  renderer.js              composes background → camera → scenes → HUD → captions
  draw.js                  typography, glass surfaces, traced paths, glow sprites, icons
src/components/            Background, Caption, HUD, Logo, AppWindow, Cursor,
                           ProjectCard, Node, DataFlow, RequirementBadge, AgentNode,
                           KnowledgeCard, SpecDoc, ADOCard, PipelineStep
src/scenes/                one module per scene (see timeline below)
scripts/                   serve.mjs · snap.mjs · render.mjs · lib/env.mjs
```

Each scene exports `{ id, pre, post, captions, draw(ctx, localTime, globalTime) }`.
`pre`/`post` let a scene draw before its start / after its end so that neighbouring
scenes overlap and **hand objects to each other** rather than cutting. Captions are
declared per scene in local time and collected onto the global timeline.

## Timeline

| #   | Scene           | Time        | Chapter             | What the viewer learns                                                                                                 |
| --- | --------------- | ----------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 00  | `intro`         | 0.0–4.0 s   | Introduction        | A network wakes; mark + title resolve and **morph into the app header**                                                |
| 01  | `project`       | 4.0–10.5 s  | Select project      | App asks _which project_; Level Product Advisor is chosen; 8 knowledge sources stream into it                          |
| 02  | `knowledge`     | 10.5–18.0 s | Load knowledge      | Card morphs into a graph hub; sources → Enterprise Knowledge Layer → documents → chunks → embeddings → Azure AI Search |
| 03  | `requirement`   | 18.0–24.0 s | Capture requirement | Typed sentence **compresses into REQ-1042**, which expands into a persistent workspace + lifecycle                     |
| 04  | `orchestration` | 24.0–30.5 s | Reason with context | Workspace shrinks to a badge feeding coordinated services; retrieval of 6 ranked items; existing capability detected   |
| 05  | `clarification` | 30.5–37.0 s | Clarify gaps        | Clarification Agent tile **expands into the chat**; 3 targeted questions, 4 avoided; completeness 62 → 84 → 97 %       |
| 06  | `generation`    | 37.0–42.5 s | Specify             | Chat **bursts into 12 artifact cards**; Acceptance Criteria card **becomes the spec**                                  |
| 07  | `approval`      | 42.5–47.0 s | Human approval      | Architect + Product Owner review; Approve click; lifecycle → APPROVED                                                  |
| 08  | `ado`           | 47.0–52.5 s | Plan backlog        | Spec **shrinks into an approved chip** → Azure DevOps MCP → Epic / Feature / 5 Stories / 6 Tasks with IDs              |
| 09  | `development`   | 52.5–59.0 s | Build               | US-1201 **morphs into the pipeline** → agent → repo context → code → tests → scan → PR #842, linked to REQ-1042        |
| 10  | `traceability`  | 59.0–64.0 s | Trace               | PR card **becomes a node** in the 11-step chain; one glowing trace from idea to release                                |
| 11  | `dashboard`     | 64.0–69.0 s | Track               | Shared dashboard: stage counts, REQ-1042 progress, the whole team on the same record                                   |
| 12  | `architecture`  | 69.0–74.5 s | Architecture        | Dashboard **shrinks into the UI node** as the camera pulls back to the full living architecture                        |
| 13  | `outro`         | 74.5–80.5 s | Summary             | Architecture **collapses into the mark**; promise + four differentiators; fade to dark                                 |

A persistent HUD keeps the **project** and **REQ-1042 with its live status**
(Discovery → Analysis → Review → Approved → Engineering) on screen from the moment they
exist, and a chapter indicator shows where the viewer is.

### Differentiators → where they are shown

| Differentiator                                                                      | Scene(s)                                                              |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Knows which project the user belongs to                                             | project, HUD, requirement greeting                                    |
| Uses enterprise knowledge before asking                                             | knowledge, orchestration, clarification ("already known — not asked") |
| Every requirement gets a unique ID; persistent + trackable                          | requirement, HUD status, dashboard                                    |
| AI assists but never bypasses human approval                                        | approval, architecture ("Human Approval · control point")             |
| Source, APIs, requirements, architecture considered; impact + dependencies detected | orchestration, generation                                             |
| Structured engineering artifacts                                                    | generation                                                            |
| Azure DevOps hierarchy generated                                                    | ado                                                                   |
| Development agents execute approved work; PR linked to requirement                  | development                                                           |
| Progress visible on a project dashboard                                             | dashboard                                                             |
| Traceability from business request to release                                       | traceability                                                          |

## Performance

Live playback is Canvas 2D with static layers pre-baked (backdrop, vignette, grain),
glow sprites cached, and particles drawn as sprites rather than DOM nodes. If the device
cannot hold ~50 fps, the player drops soft drop-shadows automatically; render mode always
uses full quality. Rendering is not real-time bound — frames are captured as fast as the
machine allows (≈15–20 fps with 4 workers on a 4-core CPU-only container).
