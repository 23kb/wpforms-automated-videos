# Codex prompt — Phase C: cross-snapshot Flip-bridge + shared-scene + camera-pose + editorial surface mode + engine.js camera routing

Self-contained prompt for Codex. Paste verbatim. Codex must read REFACTOR-BRIEF.md and REFACTOR-PROGRESS.md first.

**Phase C is the transition fix this refactor has been pointing at.** It rewrites `runtime/transitions.js`, edits `engine/engine.js`, introduces a new `runtime/shared-scene.js` primitive, adds a manifest-level surface mode, and lands a Flip-based cross-snapshot bridge. It edits the entire protected-core list. Treat it as the highest-blast-radius phase of the refactor.

---

## Context

You are working on a WPForms tutorial-video repo at `C:\Users\PC\Desktop\Video Project - HTML only`. Phase B merged into `main` via `--no-ff` (merge commit parents `ef8ffdb` ↔ phase-b tip `a298800`). **You are now starting Phase C on a fresh branch `phase-c-transitions-overhaul` from `main`.**

Read these files in this order before writing any code:

1. `REFACTOR-BRIEF.md` — full mandate, §3 locked decisions, §4 protected core (Phase C is authorized to edit all of it plus `engine/engine.js`), §5 baselines.
2. `REFACTOR-PROGRESS.md` — current state, Phase B completion entry, §2.1 known gaps (introCard hang carried forward into Phase C).
3. `repo-audit-findings.md` — focus on §2.1 (engine.js camera math), §3.5 (transitions.js), §7 (transitions audit), §13.1–§13.4 (adapt-Hyperframes plan), §17 (engine.js zoom audit appendix).
4. `tools/qc-out/a-complete-guide-to-the-checkboxes-field/FINDINGS.md` — Phase 0 frame-level capture that diagnosed the cross-snapshot wipe. The "page-refresh feel" is the cream cover doing its job correctly on the wrong job; cover sits above Mac chrome; camera transform doesn't carry; total seam ~1.5s.
5. `tools/qc-out/form-entries-guide/FINDINGS.md` — second QC capture proving `morph` and `fast` produce same-shape gaps, and that race conditions between cover/fade-in/chrome-remount/fade-out timers explain why identical code paths produce different visual behaviors.
6. `analysis-quality-and-transitions.md` §2.1 (per-chapter Three.js mounts) and §3 (REST API shared-scene pattern that worked).
7. `CLAUDE.md` (project root) — operator manual.
8. `runtime/transitions.js`, `runtime/scene-helpers.js`, `runtime/player.js`, `runtime/chapter-runner.js`, `engine/engine.js`, `runtime/frame-driver.js`, `runtime/frame-adapter.js`, `videos/_shared/kit.js` — the surface you're going to edit or compose with.
9. `runtime/cinematic-rough-thought-to-draft.js` — Phase B reference for how a cinematic uses `registerTimeline`. Phase C will introduce a similar opt-in for camera poses.

The mandate is dual: real-WPForms-UI tutorials AND ad-style release videos. Surface modes (`iframe` / `editorial` / `mixed`) are how the architecture supports both.

## Goal of Phase C

Five deliverables, in dependency order:

1. **Editorial surface mode** — manifest-level `surface: 'iframe' | 'editorial' | 'mixed'`. `'iframe'` is current behavior (default). `'editorial'` skips iframe boot and Mac chrome, gives a clean 1920×1080 stage for ad-style videos. `'mixed'` keeps iframe but allows full-bleed editorial overlays above it. Foundational for everything below — the rewrite must work in all three modes from day one.

2. **Camera-pose vocabulary** — named poses (`focus`, `station`, `overview` per the REST API pattern) with explicit math. Authors declare a pose by name; the runtime resolves the transform. Routes through the frame driver when the chapter opts into seekable camera (Phase B `registerTimeline` shape extended for camera).

3. **engine.js camera routing** — single owner of iframe transform. Move iframe transform off CSS-transition land onto GSAP timeline land. Deterministic on `seek(t)`. Removes the 1-frame snap-to-scale-1 jolt (`engine.js:135–141`) and the `runScene` 1-second hard dolly path (`engine.js:592–598`).

4. **Shared-scene primitive** — `runtime/shared-scene.js` exposing `getSharedScene({ id })` / `disposeSharedScene(id)`. Promotes the REST API video's video-local `__raShared` Three.js+GSAP singleton to a first-class runtime primitive. Solves chapter-seam blink on per-chapter Three.js mounts (`analysis-quality-and-transitions.md` §2.1).

5. **Cross-snapshot Flip-bridge transition** — new `flipBridge` swap style. Pre-loads the next snapshot into a hidden iframe, captures Flip state of carry elements, swaps, replays Flip onto the new iframe's elements. Optional opt-in via `swapStyle: 'flipBridge'` per chapter or `manifest.defaults.swapStyle = 'flipBridge'`. Existing `cover` / `morph` / `push` / `whip` / `fast` styles stay supported as fallbacks (REFACTOR-BRIEF.md §3 locked decision: overhaul rather than replace).

Pilot scope (full spec in §6) is **three sequenced migrations**, all gated:

1. `wpforms-rest-api-overview` shared-scene migration — proves the primitive replaces video-local `__raShared`.
2. `a-complete-guide-to-the-checkboxes-field` cross-snapshot Flip-bridge — proves the bridge on the most-tested baseline (its two `swapStyle: 'fast'` overrides retire after this).
3. ONE editorial-mode video (existing or new minimal) — proves `surface: 'editorial'` boots without iframe and Mac chrome.

Migrations run in order. Each must pass before the next starts. The other 9+ video packages must run unchanged.

## Why this matters

From Phase 0:

- **Cross-snapshot is the hard cut.** `body.innerHTML = '...'` wipes the stage; a cream cover hides the wipe; the cover sits ABOVE Mac chrome so the entire app frame disappears; ~1.5s total seam (`tools/qc-out/.../FINDINGS.md`).
- **Camera transform doesn't carry.** New chapter starts at scale 1 then zooms in from scratch — visible at swap 4 of `form-entries-guide` (132.26s, ~600ms wrong-frame).
- **CSS-transition camera is racy.** Independent timers for cover, fade-in, fade-out, chrome-remount sometimes win in different orders even on identical code paths (`form-entries-guide` produced 3 distinct visual behaviors from the same swap code).
- **Editorial mode has no first-class home.** Marketing-style 1920×1080 work piggybacks on the iframe stage today; the transition vocabulary assumes iframe-as-stage.
- **Shared-scene was a video-local fix.** REST API works because of `__raShared` outside the chapter loop; nothing in the architecture promotes or enforces this pattern.

Phase B made camera/timeline ownership *possible* via the frame driver. Phase C *uses* that ownership.

## Branch

Create branch `phase-c-transitions-overhaul` from `main` at the Phase B merge commit.

## Files you may edit

**Phase C is authorized to edit the entire protected-core list** (REFACTOR-BRIEF.md §4):

- `runtime/transitions.js` — the rewrite.
- `runtime/player.js`, `runtime/chapter-runner.js` — surface-mode dispatch + cross-snapshot bridge integration.
- `runtime/scene-helpers.js` — chrome mounting must layer ABOVE the cover (or the cover must go away entirely; see §3); pre-load-iframe helpers added here.
- `runtime/cinematic-runner.js`, `runtime/cinematic-spec-runner.js` — only as required by camera-pose integration; do not refactor unrelated.
- `engine/engine.js` — camera routing through frame driver. Keep public `zoomTo` / `highlight` / `pointer` / `cursor.*` / `runScene` API stable; move the transform owner.
- `runtime/shared-scene.js` (NEW).
- `runtime/camera-poses.js` (NEW) — pose registry + resolver. Or fold into `runtime/transitions.js` if simpler; explain in commit.
- `videos/_shared/kit.js` — opt-in author API for poses (`registerCameraPose`, `cutToPose` or similar — name TBD per author-API readability).
- `videos/wpforms-rest-api-overview/**` — pilot 1 shared-scene migration (chapters import from `runtime/shared-scene.js` instead of the video-local singleton).
- `videos/a-complete-guide-to-the-checkboxes-field/**` — pilot 2 Flip-bridge migration. Specifically: retire the `swapStyle: 'fast'` overrides in `edit-label.js` and `save-checkboxes-field.js` (called out in `REFACTOR-PROGRESS.md` Phase 0 §3 as "remove after Phase C makes it unnecessary"). Touch nothing else in those chapters unless the bridge requires it.
- `videos/_phase-c-editorial-pilot/**` (NEW) — pilot 3, pre-specced sandbox (see §6 Pilot 3 below). Underscore prefix marks it as a sandbox, not a production deliverable. If `tools/validate-video.js` requires a skip-list entry to ignore underscore-prefixed packages, add it.
- `scenes/player.html`, `scenes/shared.css` — only if surface mode requires conditional chrome mount or stage CSS variants. Document the smallest possible change.
- `manifest.json` schema documentation in `docs/authoring-api.md` (extend §3).
- `docs/transitions.md` (NEW) — architecture doc for the rewrite.
- `docs/shared-scene.md` (NEW) — primitive doc.
- `docs/camera-poses.md` (NEW) — pose vocabulary.
- `tools/validate-video.js` — schema validation for `surface`, `swapStyle: 'flipBridge'`, pose names. Add as new lints; do not change exit codes for existing videos that don't use these features.
- `REFACTOR-PROGRESS.md` — log decisions encountered mid-phase under "Open questions stack."

## Files you MUST NOT touch

- `runtime/frame-driver.js`, `runtime/frame-adapter.js` — Phase B locked. Compose with them; do not edit.
- `videos/_shared/effects.js`, `vendor/gsap/3.15.0/*` — Phase A locked.
- Any video package other than the three pilots and any deliberate editorial-mode pilot. The remaining 9+ packages must run unchanged through all three migrations. **The legacy adapter shim is the load-bearing piece** — everything that worked on `cover` / `morph` / `push` / `whip` / `fast` before Phase C continues to work after.
- Snapshots under `snapshots/` — Phase C does NOT recapture; the pre-loaded-iframe path uses existing snapshots.
- `tools/check-video-playback.js` exit-code semantics — you may extend the script to verify new milestones (e.g., `data-flipbridge-armed`) but do not change the existing exit semantics.

## Deliverable details

### 1. Editorial surface mode

`manifest.json` gains:

```jsonc
{
  "surface": "iframe" | "editorial" | "mixed"   // default 'iframe' if absent
}
```

Behavior matrix:

| Surface | iframe mounted | Mac chrome | mesh-bg | Cover | Editorial overlay | Default for |
|---|---|---|---|---|---|---|
| `iframe` | yes | yes | yes | as today | optional | every existing video |
| `editorial` | no | no | optional (stage-css can hide) | n/a (no body-wipe) | full-bleed | ad-style / marketing |
| `mixed` | yes | yes | yes | as today | full-bleed above iframe | hybrid postIntros |

`'iframe'` must produce byte-identical playback to today on every regression baseline. Verify with smoke + visual QC. The mode literal becomes the dispatch fork in `runtime/player.js`.

### 2. Camera-pose vocabulary

Three named poses are the seed (`focus`, `station`, `overview`), promoted from the REST API pattern. Authors declare poses on the chapter or manifest; the runtime resolves selectors → bbox → transform.

Author API draft (final naming Codex's call, document in `docs/camera-poses.md`):

```js
import { registerCameraPose } from '../../_shared/kit.js';

registerCameraPose('focus', { selector: sel.field, level: 1.18, pad: 14 });
registerCameraPose('station', { selector: sel.section, level: 1.05, pad: 24 });
registerCameraPose('overview', { selector: 'body', level: 1.0, pad: 0 });
```

Beats then reference by name (`camera: 'focus'` instead of full options). Pose changes route through the frame driver — pose-to-pose interpolation is a paused timeline registered through Phase B's API. This is how Phase B and Phase C compose.

### 3. engine.js camera routing through frame driver

Today (`engine.js:135–141, 144–160, 171–180, 592–598`):

- `state.ui.style.transform` is set directly with CSS transition.
- `smooth: false` snaps to scale-1 + 20ms sleep + new transform — the visible jolt.
- `noChange` short-circuits but still applies transform; floor wait `min(120, duration*0.1)` desyncs from narration.
- `runScene` chapter-break path duplicates the hard-dolly logic.

After Phase C:

- `state.ui` transform is owned by a single GSAP timeline (registered with the frame driver if the chapter opts into seekable camera).
- `zoomTo({ targets, level, pad, smooth, duration, easing })` builds/extends the timeline rather than mutating CSS.
- The 1-frame snap-to-scale-1 path is removed; smooth: false becomes a duration:0 tween, not a CSS-transition reset.
- `noChange` → noop on the timeline (no transform write, no sleep).
- `runScene` chapter-break path delegates to `transitions.runChapterBreak` end-to-end (consistent with descriptor mode).

Public `zoomTo` / `highlight` / `pointer` / `cursor` / `runScene` API signatures stay stable. Internal owner changes; callers don't.

### 4. Shared-scene primitive

```js
// runtime/shared-scene.js
export function getSharedScene({ id, mount }) { ... }
export function disposeSharedScene(id) { ... }
```

`mount(stage, gsap)` runs once per id; subsequent `getSharedScene({ id })` calls return the existing instance. Authors attach chapter-local layers above the shared layer (z-stack documented in `docs/shared-scene.md`). Disposal happens at video outro, not chapter teardown.

Pilot 1 (REST API) replaces `window.__raShared` with this primitive. Visual output identical.

### 5. Cross-snapshot Flip-bridge

New swap style `flipBridge`. Algorithm (high level — full sequence in `docs/transitions.md`):

1. Pre-load the next snapshot into a hidden iframe (`scene-helpers.preloadSnapshot(slug)`).
2. Wait for the hidden iframe to paint (paint-anchored gate, same threshold as `awaitPostIntroReady`).
3. Capture Flip state of any carry elements named in the chapter (`carry: [sel.x, sel.y]` on the chapter export).
4. Mount the new iframe at the same stage position.
5. `Flip.from(state, { ... })` carries the named elements visually.
6. Old iframe unmounts under the new one (no body-wipe visible to the viewer).
7. Camera transform carries by default — current pose stays unless the chapter declares a new pose.
8. Chrome (Mac frame, watermark, mesh-bg) stays mounted ABOVE the swap. The cream cover, if used at all, is no longer above the chrome.

Existing `cover` / `morph` / `push` / `whip` / `fast` styles remain supported as fallbacks for unmigrated videos. The legacy adapter shim invariant from Phase B applies: unmigrated videos keep working.

### 6. Pilot migrations — sequenced, gated

#### Pilot 1 — `wpforms-rest-api-overview` shared-scene

Replace the video-local Three.js singleton with `runtime/shared-scene.js`. Visual output identical (frame-by-frame side-by-side if needed). Smoke clean. Move on only if green.

#### Pilot 2 — `a-complete-guide-to-the-checkboxes-field` Flip-bridge

Migrate the two snapshot swaps (currently `swapStyle: 'fast'` overrides in `edit-label.js` and `save-checkboxes-field.js`) to `swapStyle: 'flipBridge'`. Retire the `'fast'` overrides. Visual smoke must show the cream-bleed seam **eliminated** — this is the Phase C win condition. Drift on carried elements should be < 1 frame (~16ms at 60fps).

#### Pilot 3 — Editorial surface mode (pre-specced sandbox)

Create the sandbox video at `videos/_phase-c-editorial-pilot/`. Underscore prefix marks it as a sandbox, not a production package — purpose is to prove the surface-mode dispatch fork end-to-end.

Spec (locked — no Umair questions mid-flight):

- **Slug:** `_phase-c-editorial-pilot`
- **Manifest:** `surface: 'editorial'`, no postIntro, no teaser, single chapter, no BGM required.
- **Duration:** 10–12 seconds, single hero beat.
- **Content (use existing kits — no new helpers):**
  1. Atmospheric grain + sweep from `videos/_shared/atmospheric.js` (`tweenInto(tl, opts)`).
  2. One text reveal "WPForms 2.0" via `videos/_shared/text-kit.js` (any preset; pick one that lands cleanly in 1920×1080 full-bleed).
  3. Brand mark fade-in (use any existing logo asset already in the repo; do not import new assets).
- **Acceptance:** boot reaches `sceneBooted=true`, no iframe element mounted in DOM, no Mac frame chrome mounted, stage is full-bleed 1920×1080, no console/page errors, smoke at `--seconds 15` exits clean.
- **Validator skip-list:** if `tools/validate-video.js` would error on a sandbox package missing chapters/snapshots/whatever a normal video has, add an underscore-prefix skip rule (or equivalent narrow exemption) so it's treated as a sandbox, not a regression.

Do NOT add this video to the regression baselines. It's a one-shot proof of the surface-mode fork.

#### Hard non-regression rule

The other 9+ video packages MUST run unchanged through all three migrations. If you find yourself needing to edit any of them, stop and log under "Open questions stack."

### 7. Documentation

- `docs/transitions.md` (NEW): architecture of the rewrite — surface modes, swap styles, Flip-bridge sequence, hidden-iframe preload, chrome-above-cover invariant.
- `docs/shared-scene.md` (NEW): primitive contract, z-stack, lifecycle.
- `docs/camera-poses.md` (NEW): named poses, registry, resolver, frame-driver composition.
- `docs/authoring-api.md`: §3 manifest schema gains `surface`; §5 transitions gains `flipBridge` and pose vocabulary; §11 / kit section gains `registerCameraPose` (final naming TBD).
- `CLAUDE.md`: Protected Areas list — reflect that Phase C is locked at merge; PostIntro section may need an editorial-mode note.
- `tools/skill-context.js`: the three new docs flagged as on-demand reads; `runtime/shared-scene.js` and `runtime/camera-poses.js` added to do-not-touch.
- `REFACTOR-PROGRESS.md`: per-step log entries as you go.

## Acceptance criteria — DO NOT mark phase done until all pass

```bash
# 1. All four baselines validate (zero new errors vs. main; new lints for
#    surface/flipBridge/poses must not error on videos that don't use them).
for slug in a-complete-guide-to-the-checkboxes-field wpforms-rest-api-overview creating-first-form build-forms-faster-with-wpforms-ai; do
  node tools/validate-video.js "$slug" || exit 1
done

# 2. All four baselines smoke without boot/page/console errors.
#    sceneBooted milestone (Phase A.5) gates REST API + AI; checkboxes/CFF
#    introCard hang per §2.1 — Phase C should re-check whether the pre-load
#    iframe rework incidentally fixes this.
for slug in a-complete-guide-to-the-checkboxes-field wpforms-rest-api-overview creating-first-form build-forms-faster-with-wpforms-ai; do
  node tools/check-video-playback.js "$slug" --seconds 30 --allow-resource-404 2>&1 | grep -E '"(sceneBooted|bootError|pageErrors|consoleErrors)"'
done
```

Visual smoke required for: the three pilot targets (REST API, checkboxes, editorial pilot) AND `creating-first-form` and `build-forms-faster-with-wpforms-ai` as unmigrated baselines.

**Cross-snapshot seam acceptance test** — open `a-complete-guide-to-the-checkboxes-field` after pilot 2; both `swapStyle: 'flipBridge'` swaps must show:
- chrome (Mac frame, watermark) visible across the entire swap;
- camera pose carried (no scale-1 reset);
- carry elements visually continuous (no flicker, no jump);
- no flat-color "page-refresh" second.

This is the Phase C win condition.

**Hidden-iframe preload assertion** — verify the next snapshot iframe is appended and painted before the old one unmounts. Add a debug-gated assertion (`?debug=1`) on `data-flipbridge-armed` or equivalent.

**Camera-routing acceptance test** — verify the engine.js zoom-reset path (`engine.js:135–141`) is no longer reachable on any baseline (the snap-to-scale-1 must be gone). Smoke on `wpforms-rest-api-overview` should show no transform jolt at chapter boundaries.

## What you do NOT do in Phase C

- Do not adopt Hyperframes' seek-render as the rendering default (REFACTOR-BRIEF.md §3).
- Do not migrate any video other than the three pilots and any agreed editorial-mode pilot.
- Do not change descriptor verb behavior, audio-cued mode, or per-beat-narration mode.
- Do not introduce a deterministic-logic linter (Phase F).
- Do not introduce render/preview tooling (Phase E).
- Do not restructure `videos/_shared/blocks/` (Phase D).

## Reporting back

When done:

1. Commit on `phase-c-transitions-overhaul`. One commit per logical step (surface mode, camera poses, engine routing, shared scene, flipBridge swap, pilot 1, pilot 2, pilot 3, docs) — bisect-friendly.
2. Reply to Umair with: branch tip SHA, files changed, validator output for all four baselines, smoke output for all four (boot/page/console errors only), cross-snapshot seam test result, camera-routing assertion result, and links to playable URLs for all visual-smoke targets.
3. Do NOT push to remote. Do NOT update `REFACTOR-BRIEF.md` or `CLAUDE.md` — Claude (CTO) does that during phase merge.

## If you get stuck

- **Legacy adapter shim breaks any of the 9+ unmigrated packages:** stop, log under "Open questions stack," ask. Do not patch around with version-switching shims.
- **Pilot 2 cream-bleed seam not eliminated:** that is THE Phase C failure mode. Diagnose in this order: hidden-iframe paint timing (paint-anchored gate threshold), Flip state-capture timing (must capture before old iframe DOM is touched), chrome z-index (must be above any cover layer), camera-pose carry (transform must persist across iframe swap).
- **engine.js camera routing breaks an existing cinematic:** the public API stayed stable, so the fault is internal. Likely candidates: `noChange` short-circuit semantics changed; CSS transition residue from a pre-routing call leaking; the GSAP timeline that owns the transform isn't getting torn down on chapter teardown. Check Phase B `frameDriver.clear()` is called.
- **Editorial surface mode can't find a clean fork point:** propose the fork happen as early as `playVideo`'s manifest read; don't try to retrofit conditionals deep in `chapter-runner` / `transitions`.
- **Time pressure:** ship surface mode + camera poses + engine routing + shared scene + flipBridge contract + pilot 1 + pilot 2 even if pilot 3 (editorial) is deferred. Pilot 3 is the only one whose deferral does not break the transition fix Umair has been waiting for. Do NOT defer pilot 2 — the cream-bleed seam is the win condition.
