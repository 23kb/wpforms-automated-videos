# Codex prompt — Phase E: in-repo render + live-reload preview + author scrubber

Self-contained prompt for Codex. Paste verbatim. Codex must read REFACTOR-BRIEF.md and REFACTOR-PROGRESS.md first.

**Phase E edits NO core.** All work lives under `tools/` (NEW + extend `serve.js`) and may extend `package.json` for scripts. The hard rule: zero edits to `engine/*`, `runtime/*`, `scenes/*`, `vendor/*`, `videos/*` (except authoring-time docs). Phase E is the workflow layer — it observes the existing playable video; it does not change how videos play.

---

## Context

You are working on a WPForms tutorial-video repo at `C:\Users\PC\Desktop\Video Project - HTML only`. Phases A → B → C → D have merged into `main`. Phase D merge commit on `main`. **You are starting Phase E on a fresh branch `phase-e-render-and-preview` from `main`.**

Read these files in this order before writing any code:

1. `REFACTOR-BRIEF.md` — full mandate, §3 locked decisions, §4 protected core (Phase E may NOT edit any of it), §5 baselines.
2. `REFACTOR-PROGRESS.md` — current state, Phase D completion entry, §2.2 architectural debt (note: Phase E surfaces the camera-on-driver and camera-pose deferrals; see §5 below).
3. `repo-audit-findings.md` — focus on §13.3 (CLI dev loop), §14 Phase E bullet, §10 (Hyperframes seek-render — explicitly NOT adopted as default; see §5 below for the bounded `--seek` mode).
4. `CLAUDE.md` (project root) — operator manual.
5. `serve.js` — current static server. Phase E extends it for live reload.
6. `tools/check-video-playback.js` — existing Puppeteer / Chromium harness. Phase E's `tools/render.js` borrows the launch + start-gate-click pattern.
7. `runtime/frame-driver.js`, `runtime/frame-adapter.js` — Phase B opt-in registered timelines. Phase E's `--seek` mode targets these.
8. `vendor/gsap/3.15.0/GSDevTools.min.js` — Phase A vendored. Use for scrubber where appropriate, OR build a custom timeline-bar listing registered `__hfTimelines`.
9. `package.json` — current scripts. Phase E extends.

The mandate is dual: tutorial videos AND ad-style release videos. Phase E's render output handles both — tutorials honor wall-clock + audio (the dominant pipeline); editorial-only beats with registered paused timelines may opt into seek-render via a `--seek` flag for deterministic frame export.

## Goal of Phase E

Three deliverables, each independently shippable:

1. **`tools/render.js`** — Puppeteer + FFmpeg → MP4. Captures the live HTML preview. Default mode is **wall-clock screencast** (record what plays, frame-rate matches viewer experience). Optional **`--seek` mode** for editorial-mode videos (`surface: 'editorial'`) or registered-timeline beats — deterministic frame-by-frame seek, suitable for short ad-style cuts and re-renders without recording artifacts.

2. **`tools/preview.js`** — live-reload preview server. Today `serve.js` is static. `preview.js` watches `videos/<slug>/`, `runtime/`, `engine/`, `scenes/`, `videos/_shared/` and reloads the player tab on change. Author scrubber is part of the preview UI.

3. **Author scrubber** — wired into the preview server. Two options, Codex picks based on integration cost:
   a. `GSDevTools` (Phase A vendored) attached to a master timeline that drives the player. Pros: feature-rich, GSAP-native. Cons: only works for registered timelines, not wall-clock playback.
   b. Custom timeline-bar listing all registered `__hfTimelines` plus a wall-clock cursor. Pros: shows the actual hybrid timing model. Cons: more code.
   Recommended: ship (b) as the chapter-level scrubber and (a) as a per-beat opt-in for authors who want frame-precision on a registered timeline. Codex's call — document the choice.

## Why this matters

From REFACTOR-BRIEF.md and Phase 0 audit:

- Visual QC is currently a manual roundtrip — boot the player, watch in real time, take notes, fix. No scrub-back, no re-render of a single beat without re-watching the whole chapter, no in-repo MP4 export. (`repo-audit-findings.md` §12 pain points 7, 8.)
- MP4 capture is external today. Authors record-screen the playable HTML. That's fragile (window focus, OS notifications, cursor). In-repo Puppeteer + FFmpeg removes the fragility.
- Phase B made registered timelines seekable. Phase E gives authors a UI for the seek.
- Phase C's editorial surface mode (`surface: 'editorial'`) is the cleanest target for `--seek` mode — no iframe, no audio narration, all paused timelines.

## Branch

Create branch `phase-e-render-and-preview` from `main` at the Phase D merge commit.

## Files you may edit

**Phase E may NOT edit any protected core** (REFACTOR-BRIEF.md §4):

- `tools/render.js` (NEW) — Puppeteer + FFmpeg → MP4.
- `tools/preview.js` (NEW) — live-reload preview server.
- `tools/scrubber/` (NEW directory, optional) — scrubber UI assets if separated from `preview.js`.
- `serve.js` — extend with file watch + WebSocket broadcast for live reload. Keep static-serve behavior intact for `node serve.js` direct use.
- `package.json` — add `dev`, `preview`, `render` scripts. Add Puppeteer / chokidar / ws dependencies if not already present.
- `docs/render.md` (NEW) — usage guide for `tools/render.js`.
- `docs/preview.md` (NEW) — usage guide for `tools/preview.js` + scrubber.
- `tools/skill-context.js` — flag the new docs and tools.
- `REFACTOR-PROGRESS.md` — log decisions encountered mid-phase under "Open questions stack."

## Files you MUST NOT touch

- `engine/*` — entire directory.
- `runtime/*` — entire directory, including `runtime/frame-driver.js` (Phase B locked).
- `scenes/*`.
- `vendor/*` (except adding new vendored libraries if absolutely required — log first).
- `videos/*` (no video package edits, no test rendering by editing manifests).
- `videos/_shared/*` — Phases A/B/C/D locked.
- `tools/check-video-playback.js` exit codes — you may share helper modules with `render.js` but do not change existing exit semantics.
- `tools/validate-video.js`.
- Any snapshot under `snapshots/`.

## Deliverable details

### 1. `tools/render.js`

```bash
node tools/render.js <slug>                    # wall-clock screencast → videos/<slug>/render/<slug>.mp4
node tools/render.js <slug> --seek             # deterministic frame seek (editorial mode only)
node tools/render.js <slug> --chapter <id>     # render single chapter
node tools/render.js <slug> --fps 30           # default 30
node tools/render.js <slug> --resolution 1920x1080
node tools/render.js <slug> --out <path>       # default videos/<slug>/render/<slug>.mp4
```

**Wall-clock mode (default):**

1. Launch Chromium headless (or headed via `--headed` flag for debugging).
2. Set viewport to 1920×1080 (or `--resolution`).
3. Navigate to `http://localhost:4321/scenes/player.html?video=<slug>`.
4. Auto-click start gate (same pattern as `tools/check-video-playback.js`).
5. Wait for `body.dataset.sceneBooted === 'true'`.
6. Start CDP screencast (`Page.startScreencast`) at the requested FPS.
7. Pipe frames to FFmpeg via stdin, encoding to MP4 (H.264 baseline, AAC audio).
8. Stop on `body.dataset.sceneDone === 'true'` OR timeout (default 30 minutes; `--timeout` flag).
9. Audio: capture via `chromium --use-fake-ui-for-media-stream` + virtual sink, OR render audio separately by replaying narration MP3s + BGM at known offsets and muxing post-hoc. Codex picks based on portability — document the choice.

**Seek mode (`--seek`):**

1. Same launch + navigate.
2. Wait for `sceneBooted`.
3. For each chapter / beat with a registered paused timeline (via `frameDriver.registry`), step the timeline at FPS-cadence: `tl.seek(frame / fps)`. Wait for next animation frame (or a configurable settle delay) per step. Capture a screenshot per frame.
4. Concat screenshots → MP4 via FFmpeg.
5. Skip wall-clock-only beats (typed text, narration, audio-cued waitAt). Document the limitation in `docs/render.md`.

**Hard requirement:** seek mode MUST refuse to render videos with `surface: 'iframe'` and a non-trivial chapter list (i.e., real tutorials). Surface that as a clear error: "seek mode is only valid for surface: 'editorial' videos or single-chapter editorial beats." This protects authors from rendering a broken tutorial output.

### 2. `tools/preview.js`

```bash
node tools/preview.js                  # default port 4321; opens player
node tools/preview.js --port 5173
node tools/preview.js --no-open
```

Behavior:

1. Start static server (compose with `serve.js` or share the request handler — do not duplicate static-serving logic).
2. Spawn `chokidar` watch on `videos/`, `runtime/`, `engine/`, `scenes/`, `videos/_shared/`, `vendor/gsap/`. Debounce 150ms.
3. WebSocket broadcast a `reload` event on any change; player page listens and `location.reload()`.
4. Inject the WS client only when served by `preview.js`, not by direct `serve.js` access (use a query param or response header so production-mode `serve.js` stays clean).
5. Print a clear startup banner: URL, watched directories, scrubber URL.
6. On Ctrl-C, close server cleanly + stop watcher.

The reload trigger lives outside `scenes/player.html`. Do NOT modify `scenes/player.html`. Inject the script via `serve.js` response transformation when running in preview mode.

### 3. Author scrubber

The scrubber is served by `preview.js` at a separate URL (e.g., `/scrubber?video=<slug>` or `/scrubber/<slug>`). Two layouts:

a. **Wall-clock scrubber bar** (default, shipped):
   - Horizontal bar showing chapter boundaries, registered-timeline ranges (per `__hfTimelines.registry`), narration durations.
   - Click-to-seek for registered timelines.
   - Read-only display for wall-clock segments (no seek; show time offsets only).
   - Live update on registered-timeline progress.

b. **`GSDevTools` per-beat opt-in** (deferred until an author asks):
   - When a beat exports a `gsap.timeline({ paused: true })` and registers it, the scrubber shows a "Open in GSDevTools" link that mounts GSDevTools on that timeline.
   - Document but don't ship; flag as a 1-PR follow-up if Codex runs out of time. (See "Time pressure" below.)

The scrubber communicates with the player tab via `BroadcastChannel` or `postMessage` (the player iframe / window already exists; do not change `runtime/player.js` — read `window.__hfTimelines` from the player tab instead).

### 4. `package.json` scripts

```jsonc
{
  "scripts": {
    "dev": "node tools/preview.js",
    "preview": "node tools/preview.js",
    "render": "node tools/render.js",
    "validate": "node tools/validate-video.js",
    "smoke": "node tools/check-video-playback.js"
  }
}
```

Existing `serve.js` direct invocation (`node serve.js`) stays the production-mode static server — `npm run dev` is the preview-mode entry. Document the difference in `docs/preview.md`.

### 5. Architectural debt this phase surfaces (from REFACTOR-PROGRESS.md §2.2)

Phase E exposes two of the Phase C deferrals. Codex must navigate them, not fix them:

- **Camera-on-driver deferral.** The iframe transform is CSS-transition-driven, not GSAP-timeline-owned. `--seek` mode CANNOT deterministically position the camera on tutorials — only registered editorial timelines. Phase E's `--seek` mode therefore refuses to render `surface: 'iframe'` videos beyond a single chapter (see §1 above). Document this in `docs/render.md` as a known scope: "Tutorial-mode rendering is wall-clock screencast only. Seek-render is reserved for editorial-mode videos."
- **Camera-pose timeline integration deferral.** `registerCameraPose` resolves a name to a spec; the spec flows through `zoomTo` (CSS transition). Pose-to-pose interpolation is NOT a registered timeline. Phase E's wall-clock scrubber displays poses as discrete points, not interpolatable timeline segments. Document.

If `--seek` mode for tutorials becomes a real ask, that's a Phase F (or post-F) follow-up that requires routing engine.js camera through the frame driver — explicitly out of Phase E scope.

## Acceptance criteria — DO NOT mark phase done until all pass

```bash
# 1. All four regression baselines + editorial pilot validate (zero new errors).
for slug in a-complete-guide-to-the-checkboxes-field wpforms-rest-api-overview creating-first-form build-forms-faster-with-wpforms-ai _phase-c-editorial-pilot; do
  node tools/validate-video.js "$slug" || exit 1
done

# 2. All five smoke clean.
for slug in a-complete-guide-to-the-checkboxes-field wpforms-rest-api-overview creating-first-form build-forms-faster-with-wpforms-ai _phase-c-editorial-pilot; do
  node tools/check-video-playback.js "$slug" --seconds 30 --allow-resource-404 2>&1 | grep -E '"(sceneBooted|bootError|pageErrors|consoleErrors)"'
done

# 3. tools/render.js wall-clock smoke: render the editorial pilot end-to-end,
#    assert MP4 file is created, > 0 bytes, > the expected duration in seconds.
node tools/render.js _phase-c-editorial-pilot --fps 30 --timeout 60
ls -la videos/_phase-c-editorial-pilot/render/_phase-c-editorial-pilot.mp4
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 \
  videos/_phase-c-editorial-pilot/render/_phase-c-editorial-pilot.mp4
# duration must be >= 10 seconds (editorial pilot is 11s)

# 4. tools/render.js --seek smoke: render the editorial pilot in seek mode,
#    assert MP4 created, deterministic re-render produces byte-identical output
#    (or within ffmpeg encoding noise — frame-by-frame deterministic).
node tools/render.js _phase-c-editorial-pilot --seek --fps 30
# Re-run; assert MP4 hash matches OR frame samples match within ε.

# 5. tools/render.js refusal smoke: confirm seek mode refuses tutorials.
node tools/render.js a-complete-guide-to-the-checkboxes-field --seek 2>&1 | grep "seek mode is only valid for surface: 'editorial'"

# 6. tools/preview.js smoke: start preview, touch a watched file, assert the
#    player reloads (look for the WS reload event in console).
node tools/preview.js --port 5174 &
sleep 2
# touch a file under videos/_shared/ and verify reload event reaches a connected client
# (programmatic WS client, no headless browser required for this assertion)
```

**Render output smoke (visual):** Codex provides a playable URL and an MP4 file path for the editorial pilot in wall-clock mode AND seek mode. Umair's QC owns the visual comparison.

**Preview reload smoke:** verify chokidar watcher fires on at least one watched directory (`videos/`, `runtime/`, `engine/`, `scenes/`, `videos/_shared/`).

## What you do NOT do in Phase E

- Do not edit any protected core.
- Do not migrate any video package.
- Do not adopt seek-render as the default for tutorials (REFACTOR-BRIEF.md §3 locked).
- Do not implement camera-on-driver routing (Phase F or beyond — REFACTOR-PROGRESS.md §2.2).
- Do not introduce a deterministic-logic linter (Phase F).
- Do not skill-package the docs (Phase F).
- Do not change `serve.js` direct-invocation behavior — preview is additive.

## Reporting back

When done:

1. Commit on `phase-e-render-and-preview`. One commit per logical step (render wall-clock, render seek mode, preview server, scrubber, package.json scripts, docs).
2. Reply to Umair with: branch tip SHA, files changed, validator + smoke output for the 5 regression targets, render smoke output (file path, duration, optional ffprobe summary), preview reload smoke output, scrubber URL.
3. Do NOT push to remote. Do NOT update `REFACTOR-BRIEF.md` or `CLAUDE.md` — Claude (CTO) does that during phase merge.

## If you get stuck

- **Audio capture in render.js is fragile:** ship the visual+silent MP4 first, document the audio limitation, and propose a follow-up. Audio mux can be Phase E.5 if it blocks.
- **GSDevTools doesn't compose with the wall-clock player:** ship the custom timeline-bar (option b), skip GSDevTools per-beat opt-in.
- **Live reload causes infinite reload loop on save:** debounce + ignore reloads triggered by the watcher's own writes.
- **Puppeteer screencast frame rate can't hit requested FPS:** lower the default to 24, document the cap, and don't pretend the file is 60fps.
- **Time pressure:** ship `tools/render.js` wall-clock + `tools/preview.js` live reload + the wall-clock scrubber. Defer `--seek` mode to Phase E.5 if it cannot land cleanly. The render command is the highest-value piece.
