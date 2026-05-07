# Codex prompt — Phase B: Paused-Timeline + Frame Adapter Player Driver

Self-contained prompt for Codex. Paste verbatim. Codex must read REFACTOR-BRIEF.md and REFACTOR-PROGRESS.md first.

**This is the largest phase of the refactor.** It edits protected core. The legacy adapter shim is the load-bearing piece — the existing 11 accepted video packages must keep working unchanged.

---

## Context

You are working on a WPForms tutorial-video repo at `C:\Users\PC\Desktop\Video Project - HTML only`. Phase A merged into `main` at `1367e3b`. **You are now starting Phase B on a fresh branch `phase-b-paused-timeline-driver` from `main`.**

Read these files in this order before writing any code:

1. `REFACTOR-BRIEF.md` — full mandate, decisions (§3), protected core (§4), baselines (§5).
2. `REFACTOR-PROGRESS.md` — current state, Phase A entry, engine.js zoom audit findings (Phase 0 §3).
3. `repo-audit-findings.md` — focus on §1 (system at a glance), §3–§4 (engine + runtime layers), §6 (GSAP audit), §7 (transitions audit), §10 (Hyperframes architecture), §13.2 (paused-and-registered timelines), §17 (engine.js zoom audit appendix).
4. `CLAUDE.md` (project root) — operator manual.
5. `runtime/player.js`, `runtime/chapter-runner.js`, `runtime/scene-helpers.js`, `runtime/transitions.js`, `runtime/cinematic-runner.js`, `engine/engine.js` — the surface you're going to edit.
6. `videos/_shared/kit.js` — `awaitTween` and `withGsapContext` from Phase A; you'll wire the driver to them.
7. `hyperframes/hyperframes-rest-2/` and `hyperframes/wpforms-ai-scene-10/` — reference implementations of the paused-and-registered pattern. **Read for shape only; do not copy.** The team has explicitly rejected adopting their seek-render as the default pipeline (REFACTOR-BRIEF.md §3, decision dated 2026-05-07).

The mandate is dual: real-WPForms-UI tutorials AND ad-style release videos. Wall-clock + audio-cued/`waitAt(t)`/per-beat-narration are real production features and **must keep working unchanged**. Phase B introduces an opt-in seekable surface for the **editorial layer only** — the iframe stays on wall-clock.

## Goal of Phase B

Three deliverables, in dependency order:

1. **Frame Adapter contract** — a tiny interface that any animation runtime (GSAP, WAAPI, Lottie, Three.js, raw CSS) can implement so its timeline is seekable from a single owner. Defined as a runtime helper module.

2. **Paused-and-registered timeline registry** — `window.__hfTimelines` (or equivalent under a runtime-owned namespace). Editorial-layer GSAP timelines opt in via `gsap.timeline({ paused: true })` plus a registration call. The legacy auto-tick path stays the default; opt-in is per-beat.

3. **Frame-driven player driver** — an alternative tick loop in `runtime/player.js` (or a new `runtime/frame-driver.js` it composes) that advances editorial-layer registered timelines via `tl.seek(elapsed)` at each tick. Iframe-surface choreography stays on wall-clock and chapter-runner exactly as today. The driver tolerates hidden tabs (uses `setTimeout` fallback when RAF stalls) and is the architectural fix for the documented hidden-tab GSAP hang (`analysis-quality-and-transitions.md` §2.5).

Pilot scope is **two sequential migrations** (full spec in §5):

1. ONE beat in `creating-first-form` — proves the API round-trips.
2. ONE timeline (postIntro cinematic only) in `build-forms-faster-with-wpforms-ai` — stresses the contract on a hard case (GSAP-heavy + Three.js + narration sync).

Migration 2 only runs if migration 1 is green. The other 11 video packages must run unchanged through both — the legacy adapter shim is the load-bearing piece.

## Why this matters

From Phase 0 audit:

- The engine's camera/highlight uses CSS transitions. zoomTo's `smooth: false` path forces a 1-frame snap to scale-1 + 20ms sleep before the new zoom. This is the "page refresh" jolt on chapter changes (engine.js:135–141; REFACTOR-PROGRESS.md §3 Phase 0 zoom audit).
- `gsap.to(..., onComplete: resolve)` hangs forever in hidden/headless tabs because RAF is throttled (analysis-quality-and-transitions.md §2.5). Phase A's `awaitTween` papered over this; Phase B fixes it at the architectural level.
- Phase C (cross-snapshot Flip-bridge transition) **requires** a single owner of camera/timeline state that can be paused, seeked, and rebound across snapshot boundaries. Phase B builds that owner.

## Branch

Create branch `phase-b-paused-timeline-driver` from `main` at `1367e3b`.

## Files you may edit

**Phase B is the only phase outside Phase C that may edit protected core** (REFACTOR-BRIEF.md §4). Specifically:

- `runtime/player.js`
- `runtime/chapter-runner.js`
- `runtime/scene-helpers.js`
- `runtime/cinematic-runner.js`
- `runtime/cinematic-spec-runner.js`
- `engine/engine.js` — **do not edit.** Camera-transform routing belongs with the transitions rewrite (Phase C, same family of fixes, single owner of iframe transform). Phase B is hidden-tab fix + scrubbable foundation — camera is orthogonal. If you find yourself needing engine edits, stop and log it under "Open questions stack" in REFACTOR-PROGRESS.md.
- `runtime/frame-driver.js` (NEW)
- `runtime/frame-adapter.js` (NEW) — the contract + adapter implementations for GSAP, WAAPI; Lottie/Three deferred to follow-ups unless trivially in scope.
- `videos/_shared/kit.js` — only to add a `registerTimeline()` opt-in helper that wraps the registry write so authors don't touch `window.__hfTimelines` directly.
- `videos/creating-first-form/chapters/*.js` — pilot migration #1 (ONE beat).
- `runtime/cinematic-rough-thought-to-draft.js` — pilot migration #2 (the AI-build postIntro cinematic timeline only — NOT the tutorial chapters in the AI video package). This file path is pinned; do not hunt.
- `docs/authoring-api.md` — document the opt-in registration API.
- `docs/frame-driver.md` (NEW) — architecture doc.
- `REFACTOR-PROGRESS.md` — log decisions encountered mid-phase under "Open questions stack."

## Files you MUST NOT touch

- `runtime/transitions.js` — Phase C overhauls this; do not pre-empt.
- `scenes/player.html`, `scenes/shared.js`, `scenes/shared.css` — unless you absolutely need a new `<script type="module">` import for the driver, and even then ask first.
- Any video package other than `creating-first-form` and `build-forms-faster-with-wpforms-ai` (and within the AI package, only the postIntro cinematic — not its tutorial chapters).
- Any snapshot under `snapshots/`.
- `tools/validate-video.js` and `tools/check-video-playback.js` behavior — you may add a new lint rule (e.g., "registered timeline must have `paused: true`") but as a separate validator pass that does not change exit codes for existing videos.
- `vendor/gsap/3.15.0/*` — Phase A is locked.
- `videos/_shared/effects.js` — Phase A is locked.

## Deliverable details

### 1. Frame Adapter contract — `runtime/frame-adapter.js`

```js
// Frame Adapter contract.
// Every animation-runtime adapter exposes a single seekable surface so the
// driver can drive heterogeneous timelines from one tick loop.
//
// duration is in seconds (not frames). The "frame" name is borrowed from
// Hyperframes; we use seconds because the rest of the player works in
// seconds. seek(t) is idempotent and side-effect-free (deterministic logic
// rule, REFACTOR-BRIEF.md §3).
export interface FrameAdapter {
  id: string;             // unique within a chapter scope
  duration: number;       // seconds; may be 0 for one-shots
  seek(t: number): void;  // 0 ≤ t ≤ duration
  destroy(): void;        // tear down DOM / kill tweens / revert context
}
```

Ship two concrete adapters in this file:

- `gsapTimelineAdapter(tl, { id })` — wraps a paused `gsap.timeline()`. `seek(t)` calls `tl.seek(t, false)` — note `suppressEvents=false`, **events DO fire** on each tick. Authors must guard `onComplete` / `onStart` callbacks against re-entrancy if they cause side effects (e.g., DOM mutation should be idempotent). `destroy()` calls `tl.kill()` and reverts any associated `gsap.context()`.
- `waapiAdapter(animations, { id })` — wraps an array of `Animation` objects (`element.animate(...)`). `seek(t)` sets `currentTime = t * 1000` on each. `destroy()` cancels each. Defensive: snapshots may contain CSS animations (admin spinners) we need to pause/seek for determinism.

A Lottie adapter is desirable but **deferred** — note this in `docs/frame-driver.md` and add a TODO. Three.js adapter likewise deferred.

### 2. Timeline registry — `runtime/frame-driver.js`

```js
// Single owner of all editorial-layer paused timelines.
// Authors register via videos/_shared/kit.js → registerTimeline().
// Driver iterates the registry on each tick.

const registry = new Map(); // id → FrameAdapter
let driverState = { running: false, t0: 0, lastTick: 0 };

export function register(adapter) { registry.set(adapter.id, adapter); }
export function unregister(id)    { registry.get(id)?.destroy(); registry.delete(id); }
export function clear()           { for (const a of registry.values()) a.destroy(); registry.clear(); }

export function start({ now = performance.now } = {}) { ... }
export function stop() { ... }
export function tick(elapsedSeconds) {
  for (const adapter of registry.values()) {
    const t = Math.min(adapter.duration, elapsedSeconds);
    adapter.seek(t);
  }
}
```

Tick loop preference order:
1. `requestAnimationFrame` while document is visible.
2. `setTimeout(..., 16)` fallback when `document.visibilityState !== 'visible'` OR when the previous RAF was more than 250ms late (RAF-throttling detection).

The fallback is the architectural fix for the hidden-tab hang. Document the detection logic in `docs/frame-driver.md`.

### 3. Player integration — `runtime/player.js` + `runtime/chapter-runner.js`

The legacy wall-clock pipeline stays the default. Editorial-layer registered timelines are an **additive** opt-in:

- Player starts the driver on scene boot.
- **Per-registration `t0`:** each adapter records its own `t0 = performance.now()` at the moment `registerTimeline()` is called. The driver maintains `elapsed = now - adapter.t0` per adapter and seeks each independently. This decouples driver lifetime from chapter-runner lifetime — postIntros (which run before any chapter), pre-chapter teasers, and editorial beats all anchor cleanly without coordination overhead.
- Chapter teardown calls `frameDriver.clear()` to destroy all editorial adapters from the prior chapter.
- Author opts a beat in by:
  1. Building a `gsap.timeline({ paused: true })` inside the beat's `effect()`.
  2. Calling `kit.registerTimeline(tl, { id })` (which constructs a `gsapTimelineAdapter` and registers).
  3. NOT calling `tl.play()` — the driver seeks it.
- Audio-cued mode (`waitAt`) and per-beat-narration mode are **untouched**. They remain the dominant authoring mode.

**Hard non-regression rule:** every existing accepted video other than the two pilots must run identically after Phase B with no code changes to the video packages. See §5 for the sequenced pilot plan.

### 4. Author API — `videos/_shared/kit.js`

Add ONE export:

```js
import { register } from '../../runtime/frame-driver.js';
import { gsapTimelineAdapter } from '../../runtime/frame-adapter.js';

export function registerTimeline(tl, { id }) {
  if (!tl.paused()) console.warn(`registerTimeline(${id}): timeline must be paused`);
  register(gsapTimelineAdapter(tl, { id }));
  return tl;
}
```

This is the entire opt-in surface for video authors. No other API change.

### 5. Pilot migrations — sequenced, gated

The pilots are **two migrations in sequence**, not parallel. Migration 1 proves the API round-trips. Migration 2 stresses the contract on a hard case before Phase D rolls it out repo-wide. Phase B is done only when both pass; if migration 2 reveals something the contract can't express, that is signal — better to find it now in a controlled pilot than during Phase D's mass migration.

#### Migration 1 — `creating-first-form` (ONE beat)

Pick ONE editorial beat (the postIntro is the obvious candidate) and migrate it to the registered-timeline path.

- Visual output identical to current (verify with frame-by-frame comparison if necessary; at minimum, side-by-side video smoke).
- Narration timing unchanged.
- The existing `effect()` body is replaced/wrapped with a paused timeline + `registerTimeline` call.
- Run validators + smoke + Umair's visual QC. **Only proceed to migration 2 if migration 1 is green.** If migration 1 fails, abandon and report — do not push forward.

#### Migration 2 — `build-forms-faster-with-wpforms-ai` postIntro cinematic (ONE timeline)

Migrate the postIntro cinematic timeline only — NOT the tutorial chapters. This is the most-demanding postIntro in the repo and stresses GSAP-heavy custom timeline + Three.js + narration sync — the actual surface that exposes contract bugs.

- Visual output identical to current.
- Narration timing unchanged.
- Three.js scene timing unchanged (Three.js does NOT need to register through the driver in Phase B — it stays on its own RAF loop. Only the GSAP timeline registers. The Lottie/Three Frame Adapters are deferred per §1.).
- Run validators + smoke + Umair's visual QC. **Phase B is done when both migrations pass.**

#### Hard non-regression rule

The other 11 video packages MUST run unchanged through both migrations. Their `effect()` closures stay legacy-mode auto-tick. **The legacy adapter shim is the load-bearing piece** — chapter-runner / player must continue to drive non-registered timelines exactly as today. If you find yourself needing to edit any of those 11 packages, stop and log it under "Open questions stack."

### 6. Documentation

- `docs/frame-driver.md` (NEW): architecture (registry, tick loop, RAF/setTimeout fallback, hidden-tab fix), Frame Adapter contract, GSAP/WAAPI adapter notes, Lottie/Three TODO. Worked example using the `creating-first-form` pilot beat. After migration 2, append a "lessons from the AI postIntro" section noting any contract gap surfaced.
- `docs/authoring-api.md`: append section "Opt-in: registered timelines" with the `registerTimeline` API and rationale. **Document the `awaitTween` vs frame-driver coexistence:** `awaitTween` (Phase A) stays the right tool for fire-and-forget non-registered tweens (one-shot SFX-synced animations, narration-cued effects, anything where the author has explicit control of the wall-clock timing). `registerTimeline` is for paused timelines the driver should drive (multi-phase postIntros, scrubbable beats, anything that needs hidden-tab survival). They serve different jobs and both stay supported.
- `REFACTOR-PROGRESS.md`: per-step log entries as you go (date-stamped, reverse chronological at top of §3).

## Acceptance criteria — DO NOT mark phase done until all pass

```bash
# 1. All four baselines validate (zero new errors vs. main)
for slug in a-complete-guide-to-the-checkboxes-field wpforms-rest-api-overview creating-first-form build-forms-faster-with-wpforms-ai; do
  echo "=== $slug ==="
  node tools/validate-video.js "$slug" || exit 1
done

# 2. All four baselines smoke without boot/page/console errors
#    Phase A.5 introduced `sceneBooted` — gate on (sceneBooted || sceneDone)
#    && !bootError. Two baselines (checkboxes, creating-first-form) have a
#    pre-existing introCard hang and never reach sceneBooted; for those, the
#    pass criterion is "no boot/page/console errors" (see Known gaps in
#    REFACTOR-PROGRESS.md §2.1).
for slug in a-complete-guide-to-the-checkboxes-field wpforms-rest-api-overview creating-first-form build-forms-faster-with-wpforms-ai; do
  echo "=== $slug ==="
  node tools/check-video-playback.js "$slug" --seconds 30 --allow-resource-404 2>&1 | grep -E '"(sceneBooted|bootError|pageErrors|consoleErrors)"'
  # bootError must be empty; pageErrors and consoleErrors must be []
done
```

Visual smoke required for: `creating-first-form` (migration 1), `build-forms-faster-with-wpforms-ai` (migration 2), AND `a-complete-guide-to-the-checkboxes-field` (most-tested unmigrated baseline — proves the legacy adapter shim works). Open `http://localhost:4321/scenes/player.html?video=<slug>` and confirm playback is visually identical to `main` — narration in sync, postIntro phases sequenced as before, chapter-break dollies clean.

**Hidden-tab acceptance test:** open `creating-first-form` AFTER migration 1 in a tab, switch to a different tab for 30 seconds, switch back. The video must continue from where wall-clock would put it — not hang or jump. Repeat the test on `build-forms-faster-with-wpforms-ai` AFTER migration 2. This is the Phase B win condition. Both must pass. Document the test results in your reply, including: time spent in hidden tab, behavior on return, and any drift between expected wall-clock position and observed playback position (should be < 100ms).

**Registry-empty assertion:** after each pilot's chapter teardown, assert `frameDriver.registry.size === 0`. This catches adapter cleanup leaks that would compound across chapters. Add this assertion to the chapter-runner teardown path (or a debug-only assertion gated behind a `?debug=1` URL flag) and run it during smoke. A leak here is a Phase B blocker.

## What you do NOT do in Phase B

- Do not introduce editorial-surface mode (`surface: 'editorial'`). Phase C.
- Do not touch `runtime/transitions.js` or any swap-style behavior. Phase C.
- Do not migrate any video other than the two pilots in §5, and stay within the per-pilot scope (one beat / one postIntro timeline).
- Do not change descriptor verb behavior, audio-cued mode, or per-beat-narration mode. They are not the target.
- Do not introduce a deterministic-logic linter. Phase F.
- Do not adopt Hyperframes' seek-render as the rendering default. The driver enables seekable timelines for editorial beats only; wall-clock is still the dominant pipeline (REFACTOR-BRIEF.md §3 decision).
- Do not modify the four protected baseline video packages. They are the regression set.

## Reporting back

When done:

1. Commit on `phase-b-paused-timeline-driver`. Use one commit per logical step (frame-adapter, frame-driver, player integration, kit API, pilot migration, docs) — bisect-friendly.
2. Reply to Umair with: branch tip SHA, files changed, validator output for all four baselines, smoke output for all four (boot/page/console errors only), hidden-tab test result, and links to playable URLs for both visual-smoke targets.
3. Do NOT push to remote. Do NOT update `REFACTOR-BRIEF.md` or `CLAUDE.md` — Claude (CTO) does that during phase merge.

## If you get stuck

- If the legacy adapter shim breaks any of the 11 unmigrated video packages: stop, log under "Open questions stack" in REFACTOR-PROGRESS.md, and ask. Do not patch around with version-switching shims unless that's the explicitly-approved path.
- If `runtime/transitions.js` seems to require edits: stop. Phase C territory. Propose the smallest possible Phase B-scoped workaround.
- If the hidden-tab acceptance test fails after the implementation: that is THE Phase B failure mode. Do not call the phase done. Diagnose RAF throttling vs. timer drift.
- If `engine/engine.js` zoom-reset path (engine.js:135–141) appears to need driver routing: stop. Camera routing is Phase C, not Phase B. Log it under "Open questions stack" in REFACTOR-PROGRESS.md and continue without engine edits.
- Time pressure? Phase B is genuinely big. Ship the Frame Adapter contract + driver + kit API + pilot migration even if Lottie/WAAPI adapters are deferred. The shim and driver are load-bearing; the adapters list is extensible.
