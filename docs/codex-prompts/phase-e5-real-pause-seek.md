# Codex prompt — Phase E.5: real pause/resume + chapter seek + camera-on-driver + working scrubber

Self-contained prompt for Codex. Paste verbatim. Codex must read REFACTOR-BRIEF.md and REFACTOR-PROGRESS.md first.

**Phase E.5 is THE merge.** Phase E (`phase-e-render-and-preview`) was REJECTED at oversight. The render + HMR work is good and is cherry-picked as foundation; the scrubber UI it shipped was observation-only and contradicted the mandate. Phase E.5 builds the real scrubber on top of pause/seek primitives that finally honor every motion source.

This phase explicitly authorizes runtime + engine edits that were deferred from Phase C. The Phase C §2.2 deferral "Camera transform owned by frame driver / GSAP timeline" closes here.

---

## Context

You are working on a WPForms tutorial-video repo at `C:\Users\PC\Desktop\Video Project - HTML only`. Phases A → B → C → D have merged into `main`. Phase E was rejected; do NOT branch from `phase-e-render-and-preview`. **You are starting Phase E.5 on a fresh branch `phase-e5-real-pause-seek` from current `main` HEAD.**

Read these files in this order before writing any code:

1. `REFACTOR-BRIEF.md` — full mandate, §3 locked decisions, §4 protected core (Phase E.5 is explicitly authorized to edit the protected core entries listed below), §5 baselines.
2. `REFACTOR-PROGRESS.md` — current state, Phase D completion entry, **§2.2 architectural debt** (Phase E.5 closes the camera-on-driver bullet — annotate at completion).
3. `repo-audit-findings.md` — focus on §2.1 (engine.js camera math), §3.5 (transitions.js), §17 (engine.js zoom audit), §10 (Hyperframes paused-and-registered).
4. `CLAUDE.md` (project root) — operator manual.
5. `docs/codex-prompts/phase-e-render-and-preview.md` — the Phase E prompt (rejected) for context on what was scope and why the scrubber failed.
6. The Phase E branch tip `c09240b` for the cherry-pick foundation (see §"Cherry-pick foundation" below). Branch tip after cherry-pick is your starting point for new work.
7. `runtime/player.js`, `runtime/chapter-runner.js`, `engine/engine.js`, `scenes/shared.js`, `runtime/transitions.js`, `runtime/frame-driver.js`, `runtime/frame-adapter.js`, `videos/_shared/kit.js` — the surface you're editing or composing with.
8. `runtime/cinematic-rough-thought-to-draft.js` and the Three.js-using chapters in `videos/wpforms-rest-api-overview/chapters/*.js` — author-side Three.js loops that will migrate to `pausableRaf`.

The mandate is dual: tutorial videos AND ad-style release videos. Pause/resume must work on every video; chapter seek is granular at chapter boundaries (mid-chapter seek is explicitly NOT a deliverable — see §"Hard scope limits" below).

## Goal of Phase E.5

Six deliverables, in the order they must land (each is its own commit for bisect):

1. **Cherry-pick foundation** from rejected Phase E branch (see §"Cherry-pick foundation").
2. **`runtime/pause-manager.js` (NEW)** — single owner of every motion source. Exposes `pause()` / `resume()` / `isPaused()`.
3. **`engine/engine.js` `sleep()` swap** — replace the underlying impl so all ~248 call sites become pausable automatically. Single-point change, no per-call-site migration.
4. **Audio pause/resume hooks in `scenes/shared.js`** — narration `<audio>` and BGM `<audio>` get pause/resume API exposed to pause-manager.
5. **Camera-on-driver refactor (§2.2 deferral closure)** — `engine.js` zoomTo + `transitions.js` setCameraTransform routed through a paused GSAP timeline owned by Phase B's frame driver. Camera frames become deterministic on pause. ~300 lines, its own commit, per-baseline smoke before moving on.
6. **`pausableRaf(cb)` in `videos/_shared/kit.js`** + author migration of the 8 Three.js loop sites (REST API 7 chapters + AI cinematic 1 file) to use it.
7. **Chapter seek in `runtime/chapter-runner.js` + `runtime/player.js`** — abort-and-restart at chapter boundary. `pauseManager.seekToChapter(index)` re-enters at chapter index N from beat 0.
8. **Real scrubber UI** — replace the rejected Phase E scrubber. Pause button, prev/next/restart chapter buttons, current-chapter indicator, registered-timeline seek bar. State propagates via the existing BroadcastChannel (or postMessage if you replace it).
9. **Acceptance: every motion source listed in §"Win condition" is verified frame-by-frame.** If any source continues during pause, REJECT.

## Cherry-pick foundation

Rejected Phase E branch tip is `c09240b` (on `phase-e-render-and-preview`). Two commits there are good and reused:

- `a5f83b6` — `feat: add phase e render tool`. Cherry-pick whole. `tools/render.js` is the production MP4 export and stays as-is.
- `2f382bf` — `feat: add live preview scrubber`. Cherry-pick **selectively**: keep the file watcher + WebSocket reload plumbing in `tools/preview.js` and `serve.js` extension; **drop the scrubber UI inline** because the new scrubber UI in this phase replaces it. Easiest path: cherry-pick the whole commit, then immediately delete/overwrite the scrubber HTML and the scrubber-state script — those are rebuilt in step 8 below.

Also cherry-pick the docs commit `c09240b docs: update phase e tooling context` for `docs/render.md` and `docs/preview.md` baseline content. Update them in your final docs commit to reflect the real scrubber.

The two follow-up Phase E hotfix commits on the rejected branch (`6b5b6c8` scrubber route from serve.js, `91702e9` split preview client) — **DO NOT cherry-pick**. They were patches on the broken design and are obsolete.

After cherry-pick, your branch should have render + HMR working but no scrubber UI. From there, build the real work.

## Branch

Create branch `phase-e5-real-pause-seek` from `main` HEAD. **NOT from `phase-e-render-and-preview`.** Phase E branch is missing the `form-entries-guide` flipBridge migration commit `df1933d` and the `form-notifications` migration commit `0fc82ab`, both of which are on `main`. Branching from `main` inherits them; branching from `phase-e` does not.

## Files you may edit

**Phase E.5 explicitly authorizes these protected-core edits** (REFACTOR-BRIEF.md §4):

- `runtime/player.js` — pause/seek hooks at chapter loop boundaries; honor pause-manager.
- `runtime/chapter-runner.js` — same: pause/seek hooks; abort signal honored at boundary.
- `engine/engine.js` — `sleep()` impl swap; camera-on-driver routing.
- `scenes/shared.js` — audio pause/resume API for narration + BGM.
- `runtime/transitions.js` — camera-on-driver integration for chapter-break + swap.
- `runtime/pause-manager.js` (NEW) — single-owner motion controller.
- `videos/_shared/kit.js` — add `pausableRaf(cb)`. Other exports unchanged.
- `videos/wpforms-rest-api-overview/chapters/*.js` — Three.js loop migration to `pausableRaf`. **Three.js loop call sites only.** No transition changes, no chapter changes, no snapshot changes. The Phase C migration of REST API to `surface: 'mixed'` is independent and stays.
- `runtime/cinematic-rough-thought-to-draft.js` — Three.js loop migration to `pausableRaf`. **Three.js loop call sites only.** GSAP timeline registration from Phase B stays.
- `tools/scrubber-html.js` — rebuild scrubber UI for real pause/seek.
- `tools/preview-client.js` — extend client script to honor pause from scrubber.
- `tools/preview.js` — wire scrubber control messages to player tab.
- `tools/render.js` — only if pause/seek-aware rendering needs additional hooks. Should NOT need changes for default wall-clock screencast mode.
- `docs/render.md`, `docs/preview.md` — update for real scrubber semantics.
- `docs/pause-manager.md` (NEW) — architecture doc for the motion-controller.
- `REFACTOR-PROGRESS.md` — log decisions encountered mid-phase under "Open questions stack." At completion, annotate §2.2 second bullet (camera-on-driver) as `[CLOSED in Phase E.5 commit <sha>]`.

## Files you MUST NOT touch

- `vendor/gsap/*` — Phase A locked.
- `videos/_shared/effects.js` — Phase A locked.
- `videos/_shared/atmospheric.js`, `videos/_shared/text-kit.js`, `videos/_shared/lottie-kit.js`, `videos/_shared/three-kit.js` — locked.
- `runtime/frame-driver.js`, `runtime/frame-adapter.js` — Phase B locked. **Compose only.** The pause-manager calls `frameDriver.stop()` / `frameDriver.start()`; do not edit those modules.
- `runtime/shared-scene.js`, `runtime/camera-poses.js` — Phase C locked.
- All baseline video packages other than `wpforms-rest-api-overview` (which migrates Three.js loops only).
- `videos/_phase-c-editorial-pilot/*` — sandbox, no changes needed.
- `videos/form-entries-guide/*`, `videos/form-notifications/*` — already migrated to `flipBridge`; no changes.
- `videos/build-forms-faster-with-wpforms-ai/*` — out of scope. Three.js migration is for REST API + the cinematic only.
- All snapshots under `snapshots/`.
- `tools/check-video-playback.js` and `tools/validate-video.js` exit-code semantics. You may add new lints (e.g., warn-only on `requestAnimationFrame` outside of `pausableRaf` in migrated files) but exit codes stay.
- `scenes/player.html` — only if absolutely required for pause-manager bootstrap. Document and ask first.

## Deliverable details

### 2. `runtime/pause-manager.js`

```js
// Single owner of every motion source. Pause hammers all sources atomically;
// resume reverses every source from frozen position. No partial-pause states.

import * as frameDriver from './frame-driver.js';

let paused = false;
const audioElements = new Set();      // narration + BGM <audio> registered here
const cssAnimationFreezers = new Set(); // iframe document.getAnimations() handles
const wallClockWaiters = new Set();   // promise-resolvers waiting in pausableSleep

export function isPaused() { return paused; }

export async function pause() {
  if (paused) return;
  paused = true;
  // Order matters: stop drivers BEFORE freezing, freeze BEFORE pausing audio,
  // pause audio LAST so the audible cut is the final user signal.
  frameDriver.stop();
  if (window.gsap?.globalTimeline) window.gsap.globalTimeline.pause();
  freezeIframeAnimations();
  pauseAllAudio();
  // wallClockWaiters do not resolve while paused — pausableSleep parks them
}

export async function resume() {
  if (!paused) return;
  paused = false;
  // Reverse order:
  resumeAllAudio();
  thawIframeAnimations();
  if (window.gsap?.globalTimeline) window.gsap.globalTimeline.resume();
  frameDriver.start();
  releaseWallClockWaiters();
}

// pausableSleep is the workhorse. engine.js sleep() delegates here.
//
// Behavior contract (this is the spec — implementation can vary as long as
// it satisfies the contract):
//
//   pausableSleep(ms) resolves after `ms` of CUMULATIVE UNPAUSED time.
//   Time spent while window.__hfPaused === true does NOT count toward the
//   sleep. A sleep that begins, gets paused for 30 seconds, then resumes
//   must still wait the remaining unpaused milliseconds before resolving.
//
// Reference implementation:
//
//   export function pausableSleep(ms) {
//     return new Promise((resolve) => {
//       let remaining = ms;
//       let lastResume = paused ? null : performance.now();
//       const tick = () => {
//         if (paused) {
//           if (lastResume != null) {
//             remaining -= performance.now() - lastResume;
//             lastResume = null;
//           }
//           wallClockWaiters.add(tick);
//           return;
//         }
//         if (lastResume == null) lastResume = performance.now();
//         const elapsed = performance.now() - lastResume;
//         if (elapsed >= remaining) { resolve(); return; }
//         setTimeout(tick, Math.min(remaining - elapsed, 33));
//       };
//       tick();
//     });
//   }
//
// Critical: do NOT credit paused wall-clock time toward `elapsed`. A naïve
// implementation that does will resolve sleeps immediately on resume and
// break the entire pause invariant.

// Audio registration — scenes/shared.js calls registerAudio(el) when it
// creates a narration or BGM element.
export function registerAudio(el) { audioElements.add(el); }
export function unregisterAudio(el) { audioElements.delete(el); }

// Chapter seek — abort current chapter, restart at index N.
let seekTarget = null;
export function seekToChapter(index) {
  seekTarget = index;
  // Resume if paused — the seek must take effect.
  if (paused) resume();
  // Throw an abort that pausableSleep + chapter loop honor.
  for (const w of wallClockWaiters) w();
  wallClockWaiters.clear();
}
export function consumeSeekTarget() {
  const t = seekTarget;
  seekTarget = null;
  return t;
}

// Internal helpers (freezeIframeAnimations / thawIframeAnimations /
// pauseAllAudio / resumeAllAudio / releaseWallClockWaiters) — implement using
// document.getAnimations(), audio.pause()/play()+currentTime, and the waiter
// set above. See docs/pause-manager.md for the full state machine.
```

### 3. `engine/engine.js` `sleep()` swap

Current export (approx):
```js
export const sleep = (ms) => new Promise(r => setTimeout(r, ms));
```

After:
```js
import { pausableSleep } from '../runtime/pause-manager.js';
export const sleep = (ms) => pausableSleep(ms);
```

That's the entire migration. ~248 call sites in `runtime/`, `engine/`, and chapter files all import from this same module via `engine/engine.js` or via the chapter ctx — they all become pausable automatically.

**Risk: timing-semantics ripple.** Phase C's `noChange` floor change (~120ms → 0) was a precedent that small sleep-semantics changes affect hand-tuned beats. Pausable sleep MUST be functionally equivalent to `setTimeout` when not paused. Acceptance includes all 7 visual-smoke targets (4 baselines + editorial pilot + form-entries-guide + form-notifications) — see §"Acceptance criteria" below.

### 4. Audio pause/resume

`scenes/shared.js` currently:

```js
const audio = new Audio(`${narrationBase}${slug}.mp3`);
// ... played, awaited via 'ended', released on completion
```

Add at construction:
```js
import { registerAudio, unregisterAudio } from '../runtime/pause-manager.js';
registerAudio(audio);
audio.addEventListener('ended', () => unregisterAudio(audio));
```

Pause manager's `pauseAllAudio()` walks the set and calls `el.pause()`. `resumeAllAudio()` calls `el.play()` (currentTime is preserved by browser). BGM works the same way (already an `<audio>` element). Narration ducking under existing logic stays.

### 5. Camera-on-driver refactor

This closes Phase C §2.2 second bullet. Currently `engine.js` `applyCamera()` writes `state.ui.style.transform` with a CSS transition. Phase E.5 routes that through Phase B's frame driver:

- `engine.js` maintains a single paused GSAP timeline `cameraTimeline = gsap.timeline({ paused: true })`.
- `cameraTimeline` is registered with the frame driver via `frameDriver.register(gsapTimelineAdapter(cameraTimeline, { id: 'camera' }))` at `loadSnapshot` time.
- Each `zoomTo({ level, tx, ty, duration, easing })` call appends a `cameraTimeline.to(state.ui, { transform, duration, ease })` segment.
- The frame driver tick seeks `cameraTimeline` to wall-clock position. On pause, `frameDriver.stop()` halts ticking; the camera freezes at exact frame.
- `flipBridge`'s camera carry (currently reads `iframe.style.transform`) reads the timeline's current transform value instead — keeps cross-snapshot continuity.
- `transitions.js` `setCameraTransform` becomes a `cameraTimeline.add()` of an instant tween or a duration:0 `set`.
- `noChange` short-circuit (Phase C dropped to 0) stays at 0 — pause-manager governs timing now, no need for the floor.

**Risk: every existing zoomTo call site must work.** Pose-resolved beats (Phase C `registerCameraPose`) flow through resolveCameraPose → zoomTo, which now hits the timeline. No author API change.

**Acceptance for this commit:** all 7 visual-smoke targets boot identically to pre-refactor, and the pause test from §"Win condition" freezes camera mid-zoom.

### 6. `pausableRaf(cb)` + Three.js author migration

In `videos/_shared/kit.js`:

```js
import { isPaused } from '../../runtime/pause-manager.js';

export function pausableRaf(cb) {
  let id = null;
  const tick = (ts) => {
    if (!isPaused()) cb(ts);
    id = requestAnimationFrame(tick);
  };
  id = requestAnimationFrame(tick);
  return () => { if (id != null) cancelAnimationFrame(id); };
}
```

Migrate 8 sites:

- `videos/wpforms-rest-api-overview/chapters/auth-and-list-forms.js`
- `videos/wpforms-rest-api-overview/chapters/get-form-drill-in.js`
- `videos/wpforms-rest-api-overview/chapters/get-form-drill-in-v2.js`
- `videos/wpforms-rest-api-overview/chapters/intro-cold-open.js`
- `videos/wpforms-rest-api-overview/chapters/mcp-outro.js`
- `videos/wpforms-rest-api-overview/chapters/postintro-abilities-surface.js`
- `videos/wpforms-rest-api-overview/chapters/search-entries-constellation.js`
- `runtime/cinematic-rough-thought-to-draft.js` (the AI postIntro Three.js loop, NOT the GSAP timelines — those are Phase B registered already)

Each site replaces `requestAnimationFrame(loop)` with `pausableRaf(loop)`. The cleanup return is captured for chapter teardown. Same shape as before; loop function body unchanged. **No animation timing changes.**

Document the contract in `docs/pause-manager.md`: "Any author-owned RAF loop in a video chapter or cinematic MUST use `pausableRaf` from `videos/_shared/kit.js`. Vanilla `requestAnimationFrame` will not honor pause."

### 7. Chapter seek

`runtime/chapter-runner.js` `runChapters(descriptors)` and `runtime/player.js` `playVideo`'s chapter loop both run `for (let ci = 0; ci < descriptors.length; ci++)`. Add at top of each iteration:

```js
const seekTarget = pauseManager.consumeSeekTarget();
if (seekTarget != null && seekTarget !== ci) {
  // Tear down current chapter state cleanly:
  frameDriver.clear();
  // (any other per-chapter cleanup currently at end-of-loop)
  ci = seekTarget - 1; // -1 because the for-loop will ++ it
  continue;
}
```

`pauseManager.seekToChapter(N)` from the scrubber sets the target; the loop honors it at the next boundary. Mid-chapter pausableSleep waiters are released by the seek call (so an awaited sleep returns immediately, the chapter's effect() resolves, and the loop body completes its iteration before checking the new seek target).

**Hard scope limit: mid-chapter seek (jump to t=4s inside a running chapter) is NOT a deliverable.** Imperative effect() bodies cannot be replayed at arbitrary positions without full state reconstruction. Document this in `docs/pause-manager.md` and in the scrubber UI ("Chapter prev/next/restart only — mid-chapter seek not supported.").

### 8. Real scrubber UI

`tools/scrubber-html.js`. Replace the rejected-Phase-E scrubber with:

- **Pause/Resume button.** Sends `{ type: 'pause' }` / `{ type: 'resume' }` on the channel. Player tab's preview-client honors via pauseManager.
- **Chapter prev/next/restart buttons.** Send `{ type: 'seekChapter', index: N }`. Restart = current index.
- **Current-chapter indicator.** Player publishes `currentChapterIndex` in state messages; scrubber renders.
- **Registered-timeline strip.** Existing Phase B registered timelines listed; click-to-seek within that timeline's window (these ARE seekable since Phase B made them so).
- **Wall-clock strip** — read-only display of total wall-clock time, with chapter boundary markers. NO seek-on-click for wall-clock segments. Click is a no-op or a tooltip explaining the limit.
- **Honest UX:** if scrubber registers no timelines and no chapter advance for 2s while paused, show "PAUSED" big and clear. No oscillating "booting/booted" — fix the multi-tab BroadcastChannel issue by including a unique `tabId` in state messages and rendering only the most-recent.

`tools/preview-client.js` `scrubberStateScript` extends to handle:
- `{ type: 'pause' }` → calls `pauseManager.pause()`.
- `{ type: 'resume' }` → calls `pauseManager.resume()`.
- `{ type: 'seekChapter', index }` → calls `pauseManager.seekToChapter(index)`.
- `{ type: 'seekTimeline', id, time }` → existing behavior, kept.

State payload extends to include `paused`, `currentChapterIndex`, `chapterCount`, `chapterNames`.

## Win condition (must pass — REJECT if any source continues during pause)

Open `wpforms-rest-api-overview` in `/scrubber?video=wpforms-rest-api-overview` (with `serve.js` running OR `node tools/preview.js`). Click Pause. Verify frame-by-frame that ALL of the following are frozen:

1. **Wall-clock player** — chapter advance halts; current chapter's beats do not progress.
2. **Camera transform** — no further interpolation; iframe scale/translate static.
3. **Narration audio** — current clip pauses, position preserved (resume continues from same offset).
4. **BGM** — pauses, position preserved.
5. **Iframe CSS animations** — any product UI animation (admin spinners, etc.) halts.
6. **Three.js scenes** — REST API's animated 3D layers halt (after author migration to `pausableRaf`).
7. **Frame-driver registered timelines** — Phase B's paused timelines stop seeking.
8. **GSAP global timeline** — every gsap tween (registered or auto-tick) halts.

Click Resume. Each source must continue from its frozen position. Click Chapter Next: current chapter tears down cleanly, next chapter restarts at beat 0. Click Chapter Restart: current chapter restarts at beat 0.

**If any motion source continues during pause, the phase is REJECTED.** This is the gate.

## Acceptance criteria

```bash
# 1. All 7 smoke targets validate (zero new errors vs. main).
for slug in a-complete-guide-to-the-checkboxes-field wpforms-rest-api-overview creating-first-form build-forms-faster-with-wpforms-ai _phase-c-editorial-pilot form-entries-guide form-notifications; do
  node tools/validate-video.js "$slug" || exit 1
done

# 2. All 7 smoke clean (sceneBooted=true, no boot/page/console errors).
for slug in a-complete-guide-to-the-checkboxes-field wpforms-rest-api-overview creating-first-form build-forms-faster-with-wpforms-ai _phase-c-editorial-pilot form-entries-guide form-notifications; do
  node tools/check-video-playback.js "$slug" --seconds 30 --allow-resource-404 2>&1 | grep -E '"(sceneBooted|bootError|pageErrors|consoleErrors)"'
done

# 3. Hidden-tab regression test (Phase B win condition must still pass).
#    Synthetic 10s paused timeline; force document.visibilityState = 'hidden'
#    for 3s via visibilitychange event; assert the timeline advanced 3.0s ± 100ms
#    via the frame driver's setTimeout fallback. Probe (Playwright):
#
#    import { chromium } from 'playwright';
#    const browser = await chromium.launch();
#    const page = await (await browser.newContext()).newPage();
#    await page.goto('http://localhost:4321/scenes/player.html?video=wpforms-rest-api-overview&debug=1');
#    await page.waitForTimeout(1500);
#    const btn = await page.$('button'); if (btn) await btn.click().catch(()=>{});
#    await page.waitForFunction(() => document.body?.dataset?.sceneBooted === 'true', null, { timeout: 60000 });
#    await page.evaluate(async () => {
#      const fd = await import('/runtime/frame-driver.js');
#      const { gsapTimelineAdapter } = await import('/runtime/frame-adapter.js');
#      if (!window.gsap) await new Promise((res, rej) => { const s = document.createElement('script'); s.src = '/vendor/gsap/3.15.0/gsap.min.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
#      const target = document.createElement('div'); target.style.cssText = 'position:absolute;left:-9999px';
#      document.body.appendChild(target);
#      const tl = gsap.timeline({ paused: true });
#      tl.to(target, { x: 1000, duration: 10, ease: 'none' });
#      fd.register(gsapTimelineAdapter(tl, { id: 'probe:hidden-tab' }));
#      window.__probeTl = tl;
#    });
#    await page.waitForTimeout(500);
#    const v1 = await page.evaluate(() => window.__probeTl.time());
#    await page.evaluate(() => {
#      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
#      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
#      document.dispatchEvent(new Event('visibilitychange'));
#    });
#    const tHide = Date.now();
#    await page.waitForTimeout(3000);
#    const v2 = await page.evaluate(() => window.__probeTl.time());
#    const tElapsed = (Date.now() - tHide) / 1000;
#    const drift = Math.abs((v1 + tElapsed) - v2);
#    // ASSERT: drift < 0.1 (100ms). Phase B's win condition stays the bar.

# 4. Render output regression — no MP4 quality/duration change.
#    Wall-clock baseline: 11.3s ± 0.1. Seek baseline: 10.5s ± 0.1.
node tools/render.js _phase-c-editorial-pilot --fps 30 --timeout 60
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 \
  videos/_phase-c-editorial-pilot/render/_phase-c-editorial-pilot.mp4
# ASSERT: duration ∈ [11.2, 11.4]
node tools/render.js _phase-c-editorial-pilot --seek --fps 30
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 \
  videos/_phase-c-editorial-pilot/render/_phase-c-editorial-pilot-seek.mp4
# ASSERT: duration ∈ [10.4, 10.6]

# 5. Pause win condition (manual + scripted).
#    a. Open scrubber for wpforms-rest-api-overview.
#    b. Programmatic pause via channel.postMessage({type:'pause'}).
#    c. Wait 3s. Sample camera transform, audio.currentTime, gsap.globalTimeline.paused(),
#       frameDriver.registry state, document.getAnimations() playStates.
#    d. ALL must be frozen. Document each sample in the report.
#    e. Resume; verify each continues.

# 6. Chapter seek scripted test.
#    a. Open scrubber for any baseline.
#    b. Wait until ch 1 is running; postMessage({type:'seekChapter', index: 2}).
#    c. Verify ch 1 tore down cleanly (frameDriver.registry.size === 0 after teardown)
#       and ch 2 entered from beat 0.
#    d. seekToChapter on the current chapter restarts it.
```

**Per-baseline smoke after each commit** (sleep swap, audio hooks, camera-on-driver, chapter seek): run the smoke loop above. A timing-ripple regression caught at commit-N is cheaper than at end-of-phase.

## Hard scope limits

- **Mid-chapter seek is NOT a deliverable.** Restart-from-chapter-N is the seek granularity. Document explicitly.
- **No `engine/engine.js.bak` or `engine/wpforms.js.bak` edits.** Those are dead backups.
- **No new vendored libraries.** All free GSAP plugins are vendored as of Phase A.
- **No video package transition migrations.** REST API Three.js loops migrate; nothing else changes in any video package.
- **No author-API breaking changes.** `mountTextReveal`, `registerTimeline`, `registerCameraPose`, `mountCodeCard` etc. all keep their current signatures.

## §2.2 closure annotation

At completion, edit `REFACTOR-PROGRESS.md` §2.2 second bullet (Camera transform owned by frame driver / GSAP timeline) to add the closure marker:

```
- **Camera transform owned by frame driver / GSAP timeline.** [...existing text...]
  Cost surfaces in **Phase E** when `tools/render.js` and the author scrubber land — at that point camera frames must be deterministic on `seek(t)` to make scrub-preview honest. **[CLOSED in Phase E.5 commit <camera-on-driver-commit-sha>]**
```

The other four §2.2 bullets stay as-is.

## What you do NOT do in Phase E.5

- Do not cherry-pick `6b5b6c8` or any subsequent hotfix commits from `phase-e-render-and-preview` — those patched the broken design and are obsolete.
- Do not migrate any video package other than REST API (Three.js loops only).
- Do not change `runtime/frame-driver.js` or `runtime/frame-adapter.js` — compose only.
- Do not introduce a deterministic-logic linter (Phase F).
- Do not skill-package the docs (Phase F).
- Do not add MP4 audio mux (logged Phase E follow-up; out of scope here).

## Reporting back

When done:

1. Commit on `phase-e5-real-pause-seek`. One commit per logical step (cherry-pick, pause-manager, sleep swap, audio hooks, camera-on-driver, pausableRaf + REST API migration, chapter seek, scrubber UI, docs). Bisect-friendly.
2. Reply to Umair with: branch tip SHA, files changed, validator + smoke output for all 7 targets, hidden-tab probe result, render duration check, pause win-condition sample data (8 sources × frozen/resumed), chapter seek scripted-test output, scrubber URL.
3. Do NOT push to remote. Do NOT update `REFACTOR-BRIEF.md` or `CLAUDE.md` — Claude (CTO) does that during phase merge.

## If you get stuck

- **`pausableSleep` ripple breaks a baseline.** Likely cause: a beat depended on `setTimeout` semantics that pausable-sleep doesn't preserve (e.g., a test of `Date.now()` delta during the sleep). Diagnose, document, and either fix the consuming beat (if that beat is in a Phase E.5-allowed file) or stop and ask. Do NOT silently change baseline behavior.
- **GSAP global pause halts the frame driver too.** That's intentional — pause-manager owns both. If the driver doesn't resume, check that `pauseManager.resume()` calls `frameDriver.start()` AFTER `gsap.globalTimeline.resume()`.
- **Camera-on-driver breaks a `flipBridge` swap.** The carry path reads `iframe.style.transform` today; after the refactor it must read from `cameraTimeline` state. Likely fix: update `commitPreloadedSnapshot` in `runtime/scene-helpers.js` (the flipBridge committer) to read `cameraTimeline.totalTime()` and seek the new iframe's adopted timeline to the same value. If `scene-helpers.js` is not in your authorized files, log it and ask before editing.
- **Three.js scene flickers on pause.** `renderer.render` is being called once-per-RAF inside `pausableRaf`'s skip-on-paused branch — confirm the migration drops `renderer.render` calls on paused frames, not just animation updates. The freeze must include the WebGL render call.
- **Hidden-tab regression.** The frame driver's `setTimeout(16)` fallback when RAF stalls (Phase B) must still work. Pause-manager's `pause()` calls `frameDriver.stop()`; `resume()` calls `start()`. The hidden-tab path is a separate code branch and should be unaffected. If broken, the cause is likely pause-manager touching state the driver owned.
- **Time pressure.** Pause + chapter seek + camera-on-driver are non-negotiable. Defer the prettiness of the scrubber UI (timeline strip, click-to-seek on registered timelines) to a follow-up; ship the four control buttons (pause, prev, next, restart) and the current-chapter indicator. Pause is the win condition; the UI around it is sugar.
