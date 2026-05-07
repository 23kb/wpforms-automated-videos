# REFACTOR-PROGRESS.md

**Running log. Append to top of §3 with every working step.** Read with [REFACTOR-BRIEF.md](REFACTOR-BRIEF.md).

---

## 1. Current state header

- **Active phase:** Phase F (skill packaging + validator extensions + deterministic-logic linter) — prompt drafting
- **Active branch:** `main` (Phase E.5 merged via `--no-ff` at `6e58fdc`)
- **Last verified-good commit:** Phase E.5 merge commit `6e58fdc` on `main`
- **Next action:** Phase F codex prompt + kickoff pair to be drafted at `docs/codex-prompts/phase-f-skills-and-linter.md` and `docs/codex-prompts/phase-f-claude-session-kickoff.md`. Pause for Umair scope-alignment before sending to Codex.
- **Phase plan reference:** see [REFACTOR-BRIEF.md](REFACTOR-BRIEF.md) §2 for the final phase (F).
- **Note on Phase E:** Phase E (`phase-e-render-and-preview`, branch tip `c09240b`) was REJECTED at oversight — render + HMR were good, scrubber UI was observation-only and contradicted the mandate. Phase E branch was NOT merged. Phase E.5 cherry-picked the render + HMR foundation and added pause/seek + camera-on-driver + a real working scrubber. The phase-e branch remains in the repo for history but is dead-ended.

---

## 2. Open questions stack

(Append to top. Closed questions move to "Decisions locked" in REFACTOR-BRIEF.md §3.)

_(none currently — all Phase A starting questions answered 2026-05-07)_

---

## 2.2 Phase C deferrals (architectural debt)

Five deviations from the Phase C prompt's stated architectural ambition. Each shipped a working simpler form that meets the Phase C win condition (cream-bleed kill on cross-snapshot transitions). The deeper integration is real debt that future phases or features will surface. Format: what was deferred, what triggered the deferral, which phase will surface the cost.

- **Element-level Flip carry across snapshot boundaries.** The prompt asked for `Flip.from(state, ...)` of named carry elements declared via a chapter-level `carry: [sel.x, sel.y]` field. Codex shipped iframe-to-iframe opacity crossfade with camera-state preservation instead. Trigger for deferral: opacity crossfade was sufficient to eliminate the cream-bleed seam (the win condition), and the simpler form did not require a chapter API extension. Cost surfaces in **Phase D** when `videos/_shared/blocks/` introduces named blocks that authors will want to carry across snapshots — at that point the `carry: [...]` field becomes worth the API extension.

- **Camera transform owned by frame driver / GSAP timeline.** The prompt asked for the iframe transform to be moved off CSS-transition land onto a GSAP timeline registered with the Phase B frame driver, so `seek(t)` would deterministically position the camera. Codex centralized CSS-transition writes into `applyCamera()` / `setCameraTransform()` but the transform stays CSS-driven. Trigger for deferral: the visible jolts (`engine.js:135–141` snap-to-scale-1, `engine.js:592–598` hard dolly) ARE fixed without timeline ownership, and the timeline-owned camera was a means to scrub-preview rather than a means to clean visuals. Cost surfaces in **Phase E** when `tools/render.js` and the author scrubber land — at that point camera frames must be deterministic on `seek(t)` to make scrub-preview honest. **[CLOSED in Phase E.5 commit ba20e47]**

- **`runtime/shared-scene.js` ships unused.** The prompt named pilot 1 as "REST API replaces `window.__raShared` with this primitive." Codex shipped the primitive but no video uses it. Trigger for deferral: REST API has no actual `__raShared` symbol to migrate — the audit's reference (`analysis-quality-and-transitions.md` §3) was pattern-level, describing what worked in REST API, not a literal singleton name. Cost surfaces whenever a future video genuinely needs a Three.js or editorial scene to survive chapter teardown — likely **Phase D or E** as marketing-mode work begins to need persistent atmospheric layers.

- **`runtime/camera-poses.js` shallow integration.** The prompt asked for pose-to-pose interpolation as a paused timeline registered through the Phase B frame driver. Codex shipped a registry + resolver wired into `player.js`'s `resolveCameraPose(b.camera)` call so `camera: 'focus'` works as a name, but the resolved spec flows through the existing `zoomTo` (CSS-transition) path. Trigger for deferral: same as the camera-routing deferral — the visible win is the named pose vocabulary, not the timeline-registered interpolation. Cost surfaces alongside the camera-on-driver debt in **Phase E** when scrub-preview demands deterministic pose seek.

- **`noChange` floor wait dropped from `min(120, duration·0.1)` to 0.** The prompt directed this change directly. Trigger for deferral: not a deferral per se — explicit prompt directive — but worth flagging as a behavioral change that hand-tuned beats with sub-noChange-threshold drift may now feel snappier than before. Cost surfaces if a future regression report names a beat that desyncs from narration after Phase C; the fix is a per-beat `postHold` rather than reverting the floor.

---

## 2.1 Known gaps (tracked, not blocking)

Issues that surfaced during Phase 0–A work and are documented but not blocking the active phase. Each entry: what, where, why deferred.

- **`assets/sfx/click-alt.mp3` referenced but missing.** `runtime/sfx.js:37` declares it; nothing in the repo provides it. Smoke reports as missing-resource; `--allow-resource-404` masks. Either alias to existing `click.mp3` or add the asset. Low priority.
- **`bgms/56.mp3` referenced but missing.** Two baseline manifests (checkboxes, AI) point at `/bgms/56.mp3`; only `1.mp3`–`5.mp3` exist. Suggests the manifests want a track Umair hasn't supplied. Confirm intent and either add the track or repoint the manifests. Low priority.

---

## 3. Per-step log (reverse chronological)

### 2026-05-07 — Phase E.5 — completed and merged

Merged `phase-e5-real-pause-seek` into `main` with `--no-ff`. Merge commit
`6e58fdc`. Phase-E.5 branch tip: `d5cc02c`. Phase E (`phase-e-render-and-preview`)
was REJECTED at oversight; that branch was NOT merged. Phase E.5 cherry-picked
the render + HMR foundation from phase-e and added the rest.

**Shipped:**

- `runtime/pause-manager.js` (new): single owner of every motion source.
  `pause()` / `resume()` / `seekToChapter(index)` / `state()`. Pairs
  `gsap.globalTimeline.pause()` with `frameDriver.stop()`. Pause hammer
  fires atomically; resume reverses each source from frozen position.
  `shiftFrameDriverClock(pausedMs)` adjusts `entry.t0` on resume so the
  registered timelines don't jump forward by the pause duration.
- `engine/engine.js` `sleep()` swap: now delegates to
  `pauseManager.pausableSleep(ms)`. Single-point change — every `sleep()`
  call site across runtime/, engine/, and chapter modules is automatically
  pausable. Behavior contract: resolves after `ms` of cumulative unpaused
  time; paused intervals do not count.
- **Camera-on-driver refactor (closes Phase C §2.2 second bullet, commit
  `ba20e47`):** `engine/engine.js` maintains a single paused GSAP timeline
  registered with the frame driver. `zoomTo` and `setCameraTransform`
  append to this timeline rather than mutating CSS directly. Camera frames
  are deterministic on `seek(t)` — necessary for scrubber + render parity.
  `flipBridge` camera carry reads from the timeline's current value.
- `scenes/shared.js` audio pause/resume: narration + BGM `<audio>` register
  with the pause manager at construction. `pauseAllAudio()` walks the set
  and calls `el.pause()`; `resumeAllAudio()` calls `el.play()` (browser
  preserves currentTime).
- `videos/_shared/kit.js` exports `pausableRaf(cb)`. **Required for any
  author-owned RAF loop in a chapter or cinematic** — vanilla
  `requestAnimationFrame` will not honor pause. Migrated 8 sites:
  `videos/wpforms-rest-api-overview/chapters/*.js` (7) and
  `runtime/cinematic-rough-thought-to-draft.js` (1).
- `runtime/chapter-runner.js` + `runtime/player.js` chapter-seek: each
  chapter-loop iteration consults `pauseManager.consumeSeekTarget()`.
  Mid-chapter wall-clock seek is NOT a deliverable — restart-from-chapter-N
  is the seek granularity. Documented as a hard scope limit.
- Real scrubber UI at `/scrubber?video=<slug>` served by both
  `tools/preview.js` (live-reload + scrubber + WebSocket) and `serve.js`
  (scrubber via the static path). Pause / Resume / Prev / Restart / Next
  buttons. Visible numeric chapter clock + 60s-ceiling progress bar.
  Chapter clock resets to 0 on every Next/Prev/Restart click. Registered-
  timeline strip filters to chapter-local entries (camera adapter, which
  registers at video-load, doesn't leak across chapter resets). Iframe
  dim + "PAUSED" overlay on pause for visual confirmation.
- `tools/render.js` (cherry-picked from rejected phase-e): Puppeteer +
  FFmpeg → MP4. Wall-clock screencast default; `--seek` mode for editorial
  videos. Tutorial seek-render is refused with a clear error message.
- `tools/preview.js` live-reload preview server with chokidar + WebSocket
  reload broadcast + injected scrubber-state client.
- Docs: `docs/pause-manager.md` (new), `docs/render.md` and `docs/preview.md`
  (cherry-picked + extended). `docs/authoring-api.md` extended with
  pausableRaf rule + scrubber/pause section. `docs/gsap-rules.md` Phase E.5
  L0 rule for author RAF loops.

**Validation:** 0 errors on all 7 targets (4 baselines + editorial pilot +
form-entries-guide + form-notifications).

**Smoke (`--seconds 30 --allow-resource-404`):** all 7 reach `sceneBooted=true`
with empty `bootError`, `pageErrors`, `consoleErrors`.

**Hidden-tab regression (Phase B win condition):** synthetic 10s paused
timeline; force `document.visibilityState='hidden'` for ~3s via
visibilitychange event; drift = 0.0003s (well under 100ms ceiling).

**Render duration regression:**
- Wall-clock: 11.233s (within `[11.2, 11.4]` baseline).
- Seek: 10.533s (within `[10.4, 10.6]` baseline).
- Seek refusal on tutorials: confirmed.

**Pause win condition (8 sources):** all frozen on UI Pause click.
- Wall-clock player: chapter advance halted (currentChapterIndex stable).
- Camera transform: matrix() static.
- Narration audio: `currentTime` static, `paused=true`.
- BGM: `currentTime` static.
- Iframe CSS animations: `playState='paused'`.
- Three.js scenes: `renderer.render` calls halt (after `pausableRaf` migration).
- Frame-driver registered timelines: tick loop stopped.
- GSAP global timeline: `gsap.globalTimeline.paused()===true`.
- Resume: each source continues from frozen position.

**Chapter seek scripted test:** `seekChapter(N)` from scrubber tears down
current chapter cleanly (`frameDriver.registry.size === 0` post-teardown);
new chapter enters at beat 0.

**Visual smoke (Umair):** PASS after four UX-iteration commits on the
scrubber clock (`f94f386`, `0d1e7b2`, `2b5319d`, `4f7de8a`) and one
follow-up scrubber UX hardening commit by Codex (`d5cc02c`) addressing:
chapter clock resets on every button click; progress-bar fill uses fixed
60s ceiling so 0.0s reads as 0% width; visible numeric clock; chapter
pill shows `—` pre-boot; pause adds visible iframe overlay.

**Doc updates this merge:**

- `CLAUDE.md`: Protected Areas adds `runtime/pause-manager.js`;
  Per-Video Files extended with pausableRaf requirement + scrubber/pause
  section.
- `tools/skill-context.js`: do-not-touch adds `runtime/pause-manager.js`;
  on-demand adds `docs/pause-manager.md`.
- `docs/authoring-api.md`: pausableRaf rule + Scrubber and pause section.
- `docs/gsap-rules.md`: Phase E.5 Patterns L0 rule for author RAF loops.
- `REFACTOR-PROGRESS.md`: this entry; §1 advanced to Phase F; §2.2 second
  bullet (camera-on-driver) annotated `[CLOSED in Phase E.5 commit ba20e47]`.

### 2026-05-07 — Phase D — completed and merged

Merged `phase-d-blocks-and-text-kit` into `main` with `--no-ff`. Phase-D
branch tip: `0fb6395`. Merge resolved one conflict in REFACTOR-PROGRESS.md
(both branches had updated §1 + §3; took main's Phase C completion entry,
discarded Codex's in-progress Phase D draft entry — replaced here).

**Shipped:**

- `videos/_shared/blocks/` (new directory): 7 parent-document editorial
  blocks (`mountCodeCard`, `mountMacWindow`, `mountPhoneFrame`, `mountPill`,
  `mountArrow`, `mountRouteLine`, `mountTerminal`) with shared
  `_utils.js` (escape, tokenize, ID generation, mountStyle, disposeBlock).
  Each block lives in the parent doc only — blocks never read iframe DOM.
  Each returns `{ el, dispose, tweenInto?(tl, opts) }` with idempotent
  dispose. `index.js` re-exports for ergonomic imports.
- `videos/_shared/text-kit.js`: extended from 7 to 24 presets. Uses
  `SplitText` when `loadGsap({ splitText: true })` has run; deterministic
  DOM fallback keeps the factory usable in older chapters and the kit
  smoke page. Factory signature unchanged. New
  `TEXT_REVEAL_PRESET_NAMES` and `listTextRevealPresets()` exports.
- `tools/_phase-d-kit-smoke.html` (sandbox): standalone page that mounts
  every block + every preset in a loop and verifies dispose. Not part of
  the regression set; can be deleted post-merge if desired.
- Helper rollouts (pinned non-baselines):
  - `videos/form-entries-guide/chapters/where-entries-live.js` —
    `cursor.moveTo(sidebarEntriesLink)` → `cursor.glideTo(sidebarEntriesLink,
    { via: sidebarWPForms, wait: 700 })`. Natural arc through the WPForms
    parent menu before landing on Entries.
  - `videos/form-notifications/chapters/managing.js` —
    `cursor.moveTo(cloneBtn)` → `cursor.glideTo(cloneBtn, { via: block2Head,
    wait: 700 })`. Cursor travels via the block header before reaching the
    clone button.
- Docs: `docs/blocks.md`, `docs/text-kit.md`, `docs/helper-rollout-backlog.md`
  (all NEW). `docs/authoring-api.md` and `docs/postintro-patterns.md`
  extended with block / text-kit / helper-rollout guidance.

**Validation:** 0 errors on all 7 targets (4 baselines + editorial pilot +
2 helper-rollout videos).

**Smoke (`--seconds 30 --allow-resource-404`):** all 7 reach
`sceneBooted=true` with `bootError=""`, `pageErrors=[]`, `consoleErrors=[]`.

**Kit-disposal + preset-coverage assertion (independently measured):** all
7 blocks mount + double-dispose without throwing. All 24 presets mount +
double-dispose without throwing. Each preset returns `{ el, dispose,
tweenInto }`. After full round-trip: `document.body.children.length`
returned to baseline (9 → 9). Style count returned to baseline + 1 (text-kit
injects one shared `<style>` once on first mount; idempotent on subsequent
mounts).

**Visual smoke:** Codex provided playable URLs for the two helper-rollout
migrations. Umair's QC owns.

**Doc updates this merge:**

- `CLAUDE.md`: Per-Video Files extended with Phase D capability-kit
  callouts (blocks, text-kit 24-preset, helper-rollout reminder).
  Protected Areas unchanged (Phase D added no runtime modules).
- `tools/skill-context.js` (Codex's pass): capabilityKits adds blocks
  index entry, bumps text-kit description from 7 to 24 presets; on-demand
  adds the 3 new docs.
- `docs/authoring-api.md` (Codex's pass): block library callout, full
  preset list reference.
- `docs/postintro-patterns.md` (Codex's pass): "when to reach for popOut /
  glideTo / lineDraw" section.
- `REFACTOR-PROGRESS.md`: this entry; §1 advanced to Phase E.

**No deviations from prompt.** All tier-1 blocks shipped; tier-2 list
landed `terminal` (the most-used pattern). Pixel-Point preset names
checked against the public Animate Text skill reference.

### 2026-05-07 — Phase C — completed and merged

Merged `phase-c-transitions-overhaul` into `main` with `--no-ff`. Merge
commit `6176826`. Phase-C branch tip: `04be1de`.

**Shipped:**

- `runtime/shared-scene.js` (new): persistent per-video scene registry with
  `getSharedScene({ id, mount })` / `disposeSharedScene(id)` / `disposeAll`.
  No video uses it yet — primitive shipped for future use (REST API doesn't
  actually have a `__raShared` to migrate; the audit reference was
  pattern-level, not literal).
- `runtime/camera-poses.js` (new): named-pose registry with `register` /
  `unregister` / `clear` / `resolveCameraPose`. Wired through `player.js`
  (`runBeatsPerNarration` and beat-mapper resolve `b.camera` against the
  registry before passing to `zoomTo`).
- `videos/_shared/kit.js`: re-exports `registerCameraPose` and
  `resolveCameraPose` for video authors.
- `engine/engine.js`: centralized iframe transform writes into
  `applyCamera()` / `setCameraTransform()` / `cameraTransform()` /
  `cameraState()`. Removed the snap-to-scale-1 + `sleep(20)` reset path
  (the documented "page-refresh feel" jolt in `zoomTo` `smooth: false`
  branch). Removed the inline 1.2s CSS transition from the iframe `.ui`
  class. `runScene` chapter-break path now delegates to
  `runtime/transitions.runChapterBreak('dolly')`. Added `adoptSnapshotIframe`
  for flipBridge handoff. **Note:** transform stays CSS-transition-driven,
  not GSAP-timeline / frame-driver-driven. The visible jolts are gone; the
  deeper "camera owned by registered timeline" architectural goal is
  deferred (defensible — Phase C win condition was the cream-bleed kill,
  not scrub-preview camera).
- `runtime/scene-helpers.js`: added `preloadSnapshot(slug, { prep })` and
  `commitPreloadedSnapshot(preloaded, { fadeMs, preserveCamera })`. The
  preload mounts a hidden iframe at z:-1 / opacity 0, awaits double-RAF
  after `load`, applies sanitize + prep against the hidden contentDocument,
  sets `data-flipbridgeArmed`. The commit copies the old iframe's transform
  to the new, calls `adoptSnapshotIframe`, runs an opacity crossfade
  (220ms ease-out), removes the old iframe, sets
  `data-flipbridgeCommitted`. **No cream cover, no body-wipe** — the cream-
  bleed seam is structurally gone for `flipBridge` swaps.
- `runtime/transitions.js`: replaced direct `style.transform` writes with
  `setCameraTransform()` calls. Added `swapFlipBridge` style (delegates to
  `doSwap` since the actual preload/adopt happens upstream in
  `bootSnapshot` / `transitionSnapshots`).
- `runtime/player.js` + `runtime/chapter-runner.js`: `surface` dispatch
  added (`iframe` | `editorial` | `mixed`). Editorial mode skips iframe
  load, Mac chrome, and watermark; chapter-runner branches on `mode:
  'editorial'` to run effect() + `sleep(duration*1000)`. `flipBridge`
  swap path integrated at `transitionSnapshots` (legacy) and `bootSnapshot`
  (descriptor) call sites.
- `runtime/chapter-runner.js`: also moved `data-sceneBooted` flag-setting
  into the descriptor path. **This explains the "Phase C fixed the §2.1
  introCard hang" win:** the videos were never actually hanging — the
  descriptor-mode path simply never set the flag, and Phase A.5 had only
  patched the legacy/effect path in player.js. Phase C made the smoke gate
  symmetric. Removed the §2.1 bullet at this merge.
- Pilot 2 (Checkboxes): both `swapStyle: 'fast'` overrides
  (`videos/a-complete-guide-to-the-checkboxes-field/chapters/edit-label.js`,
  `save-checkboxes-field.js`) migrated to `swapStyle: 'flipBridge'`.
  Multi-line workaround comments removed. The framing-carry concern that
  motivated the original `'fast'` overrides is now correct by construction
  (flipBridge preserves camera transform).
- Pilot 3 (`videos/_phase-c-editorial-pilot/`): single 11s hero beat
  proving the surface-mode dispatch fork. Atmospheric grain + sweep +
  parallax + dark backdrop, text-kit `'WPForms 2.0'` reveal, brand mark
  fade-in. Sandbox prefix `_` keeps it out of production. Smoke confirms
  `iframe.ui` count = 0, Mac chrome count = 0, viewport 1920×1080.
- `tools/validate-video.js`: `flipBridge` added to known swap styles;
  `surface` validated against `{iframe, editorial, mixed}` (warn-only).
- Docs: `docs/transitions.md`, `docs/shared-scene.md`,
  `docs/camera-poses.md` (all NEW). `docs/authoring-api.md` extended
  with §3 `surface`, §5 `flipBridge`, "Opt-in: camera poses" section.

**Validation:** 0 errors on all four baselines + `_phase-c-editorial-pilot`.

**Smoke (`--seconds 30 --allow-resource-404`):** all five targets reach
`sceneBooted=true` with `bootError=""`, `pageErrors=[]`, `consoleErrors=[]`.
Note: pre-Phase C, `a-complete-guide-to-the-checkboxes-field` and
`creating-first-form` did not reach `sceneBooted=true` because the
descriptor path didn't set the flag; Phase C made the gate symmetric.

**flipBridge marker assertion (independently measured):** open
`a-complete-guide-to-the-checkboxes-field` to chapter `edit-label`,
observe `body.dataset.flipbridgeArmed = 'builder-field-options-checkbox'`
followed by `body.dataset.flipbridgeCommitted = 'builder-field-options-
checkbox'`. Hidden-iframe preload / adopt cycle works.

**Camera-routing assertion (independently measured):** regex check on
`engine/engine.js` confirms the `transform = 'scale(1) translate(0px,0px)'
+ sleep(20)` reset path is no longer present.

**Editorial surface assertion (independently measured):** open
`_phase-c-editorial-pilot`, post-`sceneBooted` DOM has 0 `iframe.ui`
elements, 0 `.mac-frame`/`.mac-chrome` elements, `body.dataset.surface =
'editorial'`, `body.classList.contains('surface-editorial') = true`.

**Visual smoke (Umair):** PASS on all four baselines + editorial pilot.
Cream-bleed seam eliminated on Checkboxes flipBridge swaps — the Phase C
win condition met.

**Scope deviations from prompt (documented for Phase D / future planning,
not blockers):**

1. `flipBridge` is iframe-crossfade with camera-state carry, not
   `Flip.from(state)` carry of named elements. The prompt's `carry: [...]`
   chapter field is not implemented. Sufficient for cream-bleed kill;
   element-level Flip carry deferred — could land in Phase D when
   `videos/_shared/blocks/` rollout creates carry-friendly named blocks.
2. `engine.js` camera routing centralized but stays CSS-transition-driven.
   Iframe transform is not GSAP-timeline / frame-driver-owned. Scrub-
   preview / seek determinism for camera not delivered. The visible jolt
   bugs ARE fixed. Architectural goal partial — revisit if scrub-preview
   tooling lands in Phase E.
3. `runtime/shared-scene.js` shipped as a primitive but no video uses it.
   REST API has no actual `__raShared` symbol to migrate. Pilot 1 from
   the prompt was unrealized — not a regression, just unrealized.
4. `runtime/camera-poses.js` is a registry without deeper engine/frame-
   driver composition. Authors register and resolve; the resolved spec
   flows through existing `zoomTo` path. Pose-to-pose interpolation as a
   registered timeline is not delivered.
5. `noChange` floor wait dropped from `min(120, duration*0.1)` to 0 (per
   prompt directive). Smoke + visual didn't surface narration desync.

**Doc updates this merge:**

- `CLAUDE.md`: Protected Areas adds `runtime/shared-scene.js` and
  `runtime/camera-poses.js`; Per-Video Files extended with surface modes,
  `flipBridge` swap, and camera-pose vocabulary callouts.
- `tools/skill-context.js` (Codex's pass): on-demand docs adds
  `docs/transitions.md`, `docs/shared-scene.md`, `docs/camera-poses.md`;
  do-not-touch list adds the two new runtime modules.
- `docs/authoring-api.md` (Codex's pass): §3 manifest schema, §5
  `flipBridge`, "Opt-in: camera poses" section.
- `REFACTOR-PROGRESS.md`: this entry; §1 advanced to Phase D; §2.1
  introCard hang bullet removed (root cause was descriptor-path missing
  `data-sceneBooted` write, fixed in chapter-runner.js).

### 2026-05-07 — Phase B — completed and merged

Merged `phase-b-paused-timeline-driver` into `main` with `--no-ff` (preserves
phase boundary for bisect; consistent with Phase A merge at `1367e3b`).
Phase-B branch tip: `a298800`.

**Shipped:**

- `runtime/frame-adapter.js` (new): `gsapTimelineAdapter`, `waapiAdapter`.
  Duration is snapshotted at construction; `seek(t)` clamps to it. Document
  rule added to `docs/frame-driver.md`, `docs/authoring-api.md`,
  `docs/gsap-rules.md`.
- `runtime/frame-driver.js` (new): `window.__hfTimelines` registry,
  per-registration `t0`, RAF-first tick loop with `setTimeout(16)` fallback
  when `document.visibilityState !== 'visible'` or RAF is >250ms late,
  `clear()`/`stop()`/`registrySize()`/`assertRegistryEmpty()`.
- `runtime/player.js` + `runtime/chapter-runner.js`: driver started at scene
  boot, `clear()` on every chapter and postIntro teardown, `stop()` at scene
  end, debug-gated (`?debug=1`) registry-empty assertion.
- `videos/_shared/kit.js`: `registerTimeline(tl, { id })` opt-in helper.
- Pilot 1 (`videos/creating-first-form/chapters/cff-chapter-1-7.js`): single
  invisible 9s editorial timeline registered in chapter prep — proves the
  API round-trip end-to-end without changing visible output. Synthetic
  rather than wrapping an existing animation because creating-first-form is
  descriptor-mode and verbs.js is forbidden territory.
- Pilot 2 (`runtime/cinematic-rough-thought-to-draft.js`): nine GSAP
  sequences in the AI postIntro converted from auto-tick `gsap.timeline({
  onComplete: resolve })` to `gsap.timeline({ paused: true })` +
  `registerTimeline` + duration-based wait. Typed text and narration remain
  wall-clock. Three.js stays on its own clock per Phase B prompt §1.

**Validation:** 0 errors on all four baselines.

**Smoke (`--seconds 30 --allow-resource-404`):** `wpforms-rest-api-overview`
and `build-forms-faster-with-wpforms-ai` reach `sceneBooted=true` with
`bootError=""`, `pageErrors=[]`, `consoleErrors=[]`.
`a-complete-guide-to-the-checkboxes-field` and `creating-first-form` still
hang at the introCard pre-existing per §2.1 — same behavior as `main` before
Phase B; no regression.

**Hidden-tab acceptance test (independently measured):** synthetic 10s
paused timeline registered post-`sceneBooted` on REST API; tab forced
hidden 3.01s via `visibilitychange` event; timeline advanced 3.0s while
hidden — drift = 7ms, well under the 100ms ceiling. Driver successfully
fell back to `setTimeout` and continued seeking. Registry empties to 0
after `clear()`. Phase B win condition met.

**Visual smoke (Umair):** PASS on `creating-first-form`,
`build-forms-faster-with-wpforms-ai`, and
`a-complete-guide-to-the-checkboxes-field` (legacy adapter shim verified —
unmigrated package runs identically).

**Doc updates this session:**

- `CLAUDE.md`: added `runtime/frame-driver.js` and `runtime/frame-adapter.js`
  to Protected Areas; added `registerTimeline` callout under Per-Video Files.
- `tools/skill-context.js`: added kit.js→registerTimeline as a capability
  kit; added the two new runtime modules to do-not-touch and to the
  protected-core line in stage4Rules; added `docs/frame-driver.md` to
  on-demand docs.
- `docs/authoring-api.md`: duration-snapshot rule added under "Opt-in:
  registered timelines."
- `docs/gsap-rules.md`: new "Phase B Patterns" section with five hard rules
  (paused, no `tl.play()`, build-before-register, wait-by-duration,
  idempotent callbacks).
- `docs/frame-driver.md`: duration-snapshot caveat appended to
  `gsapTimelineAdapter` description.
- `REFACTOR-PROGRESS.md`: this entry; current state header advanced to
  Phase C; §2.1 introCard hang carried forward into Phase C scope.

### 2026-05-07 — Phase A.5 — smoke gate fix (sceneBooted milestone)

Merge commit `ee35378` (fast-forward; trivial micro-fix).

**Problem:** `tools/check-video-playback.js` gated exit-0 on `body.dataset.sceneDone === 'true'`, which is set in `runtime/player.js:622` only AFTER intro + chapters + outro plays through. For tutorials that's many minutes; smoke at `--seconds 90` always exited 1 even on clean boots. Phase B's "regress on baselines" gate was partially blind.

**Fix:**

- `runtime/player.js`: set `body.dataset.sceneBooted='true'` right after the intro/start-gate clears (before postIntro/teaser/chapters). Answers the real smoke question: "did boot fail or not?"
- `tools/check-video-playback.js`: poll `sceneBooted`, gate exit-0 on `(sceneDone || sceneBooted) && !bootError`.

**Result:** `wpforms-rest-api-overview` and `build-forms-faster-with-wpforms-ai` now reach `sceneBooted=true` and exit 0 at `--seconds 30`. `a-complete-guide-to-the-checkboxes-field` and `creating-first-form` still don't (introCard hang) — see Known gaps §2.1. Net-positive: the gate is now semantically correct for boot-vs-not, even if the underlying hang on two baselines is a separate bug.

**Phase B implication:** the prompt's smoke acceptance command now reads `sceneBooted` and tolerates the two slow baselines via no-error gating. Documented inline in the prompt and in §2.1.

### 2026-05-07 — Phase A — completed and merged

Merged `phase-a-gsap-foundation` into `main` as merge commit `1367e3b` (no fast-forward, preserves phase boundary for bisect).

**Shipped:**

- Vendored GSAP 3.15.0 with all free plugins under `vendor/gsap/3.15.0/`: `gsap.min.js`, `Flip.min.js`, `MotionPathPlugin.min.js`, `SplitText.min.js`, `MorphSVGPlugin.min.js`, `DrawSVGPlugin.min.js`, `CustomEase.min.js`, `GSDevTools.min.js`, `MotionPathHelper.min.js`. Bumped from 3.12.5 → 3.15.0; the original 3.12.5 folder was unused on disk so the bump is clean.
- `videos/_shared/kit.js`: `loadGsap()` extended with opt-in flags (`splitText`, `morphSVG`, `drawSVG`, `customEase`, `gsDevTools`, `motionPathHelper`); `flip` and `motionPath` remain default-on. New helpers `awaitTween` and `withGsapContext`.
- `videos/_shared/effects.js` (new): five `gsap.registerEffect()` entries — `highlightPulse`, `fieldBurst`, `labelReveal`, `popOutTilt`, `cardReflow`. Module-side-effect registers on first `effectsReady` resolve.
- `docs/gsap-rules.md`: Phase A patterns appended.
- `docs/effects-library.md` (new): per-effect API reference.

**Validation:** 0 errors on all four baselines.

**Smoke:** all four return `sceneDone: false` with no boot/page/console errors. Pre-existing on `main` before Phase A — `assets/sfx/click-alt.mp3` and `bgms/56.mp3` are referenced in manifests / `runtime/sfx.js` but never existed in git. Not a Phase A regression. Filed as a known gap to address separately (either lengthen `--seconds`, fix the `body.dataset.sceneDone` setter, or commit the missing assets).

**Doc updates this session:**

- `tools/skill-context.js`: `effects.js` flagged as a capability kit alongside `kit.js`/`atmospheric.js`.
- `docs/authoring-api.md` §Capability kits: documented `effects.js`, `awaitTween`, `withGsapContext`, and `loadGsap()` opt-in flags.
- `REFACTOR-PROGRESS.md`: this entry; current state header advanced to Phase B.

**No `CLAUDE.md` change** — Phase A was additive only.

### 2026-05-07 — Phase 0 — engine.js zoom audit (initial findings)

Read `engine/engine.js` lines 1–430 + `runScene` 580–646. Findings — full version goes into `repo-audit-findings.md` Section 17 (added in this session).

**Likely contributors to the "page refresh" feel on snapshot swap:**

1. **Hard zoom-out reset on every non-smooth zoomTo** (engine.js:135–141). When `smooth: false` (the default in many call sites), zoomTo runs:
   ```js
   state.ui.style.transition = 'none';
   state.ui.style.transform  = 'scale(1) translate(0px, 0px)';
   state.zoom = 1; state.tx = 0; state.ty = 0;
   await sleep(20);
   ```
   This is a 1-frame snap to wide before the new zoom-in. Visible as a jolt on chapter changes that don't go through `glide`/`morph` paths.
2. **`runScene` chapter-break path** (engine.js:592–598) does the same 1-second hard dolly to scale 1 + 200ms hold whenever zoom ≠ 1 and `sameChapter === false`. Legacy beats hit this; descriptor mode bypasses via `transitions.runChapterBreak`.
3. **Body-wipe in loadSnapshot** (engine.js:25): `document.body.innerHTML = '...'` blows away the entire stage. The cream cover in `runtime/transitions.js` is what hides this, but the wipe + iframe reload is where the "page refresh" feel originates. The cover is timing-tuned, not architectural.
4. **Bounds clamping vs. scrollIntoView race** (engine.js:144–160). `scrollIntoView` runs in iframe doc; if target is near doc edge, scroll can't center it. `cxClamped`/`cyClamped` then clamp the camera back inward, producing off-target framing. Symptom: "I asked to zoom on element X but the camera frames a region next to it."
5. **noChange short-circuit** (engine.js:171, 180): `noChange` skips the full transition wait but still applies the new transform. Floor wait is `min(120, duration*0.1)`. For very small drift this is fine; for hand-tuned beats it can desync from narration timing.
6. **Global iframe transition CSS** (engine.js:31): `.ui { transition: transform 1.2s cubic-bezier...; }` is set in the inline stylesheet. zoomTo overrides per-call but if a call leaves a residual transition style, the next call inherits it for 1 frame. Race condition.

**Implication for Phase B:** The paused-timeline + Frame Adapter refactor **must** route camera moves through a single owner that takes the iframe transform off CSS-transition land and onto GSAP timeline land. Then noChange / hard-reset / bounds-clamp behave deterministically on `seek(t)`.

**Implication for Phase C:** The body-wipe stays (no plan to live-mount snapshots), but Phase C pre-loads the next snapshot to a hidden iframe and crossfades, so the wipe is invisible.

### 2026-05-07 — Phase 0 — second QC capture: form-entries-guide (morph swaps)

Captured `form-entries-guide` (4 snapshot swaps, all `morph` style — vs checkboxes' 2 swaps both `fast`). Comparison answers: is morph meaningfully better than fast? **No.**

Full report: `tools/qc-out/form-entries-guide/FINDINGS.md`. Key new findings on top of checkboxes:

1. **`morph` and `fast` produce same-shape gaps.** Both flat-color windows ~1-1.5s with body content gone. Differences are noise within the same architectural failure.
2. **Two distinct failure shapes:** mid-effect swaps keep chrome mounted (~1s gap, less bad); chapter-boundary swaps unmount chrome (~1.2s gap including ~0.5s pure-flat-color).
3. **Camera-state-not-carried bug observed in the wild** at swap 4 (132.26s): incoming Tools page renders at wrong scale/position for ~600ms before next `zoomTo` corrects.
4. **Race conditions:** 4 swaps in same video produced 3 distinct visual behaviors despite identical code path. Independent timers (cover, fade-in, fade-out, chrome-remount) sometimes win in different orders. **Phase B's paused-timeline driver is the architectural fix for this** — single owner sequences all the timers.

**Phase C requirements updated:** chrome must stay ABOVE cover (never unmount); camera transform carried by default not opt-in; pre-loaded incoming iframe makes cover obsolete; two-iframe crossfade replaces cover entirely.

### 2026-05-07 — Phase 0 — frame-level transition QC capture (complete)

Wrote `tools/transition-qc.js`. Captured `a-complete-guide-to-the-checkboxes-field` end-to-end in headless Playwright at 1920×1080. 5:01 runtime, 82 events, 15.2 MB recording.

Two snapshot swaps captured (45.54s and 118.58s, both `style=fast`). Three chapter-breaks captured (all `glide`). ffmpeg extracted 5-second windows around each at 15fps.

**Diagnosis: confirmed.** Full report at `tools/qc-out/a-complete-guide-to-the-checkboxes-field/FINDINGS.md`. Highlights:

1. The "page refresh" feel **is the cover doing its job correctly on the wrong job**. `body.innerHTML = ...` wipes the stage; cover at z:999 hides the wipe with flat `#F4F7FB`; that flat-color second IS the page-refresh feel.
2. Cover sits ABOVE Mac chrome / watermark / mesh-bg, so during the swap the entire app frame disappears. Most damaging part of perceived quality.
3. Total user-perceived seam: ~1.5 seconds (fade-out start to new chapter camera settled).
4. Camera transform doesn't carry across swap. New chapter starts at 1x then zooms in from scratch.
5. **Glide chapter-breaks (no snapshot change) are clean.** Already the target quality. Problem is exclusively `body.innerHTML` swaps.

**Phase C requirements concretized:** pre-load to hidden iframe; keep Mac chrome above cover (or skip cover entirely with two-iframe crossfade); carry camera transform by default; Flip-bridge for named carry elements.

**Open question for Phase B:** the `swapStyle: 'fast'` overrides in `edit-label.js`/`save-checkboxes-field.js` should retire after Phase C ships. Don't migrate them in Phase B; remove the override after Phase C makes it unnecessary.

### 2026-05-07 — Phase 0 — Hyperframes deep audit

Confirmed Hyperframes' core mechanism: paused timelines registered globally on `window.__timelines` keyed by `data-composition-id`. Rendering walks the registry and calls `tl.pause(); tl.seek(t/fps, false)` per frame. Frame Adapter contract: `{ id, init, getDurationFrames, seekFrame(frame), destroy }`. Engine uses CDP `HeadlessExperimental.beginFrame` + FFmpeg.

Adopting paused-timeline + Frame Adapter for editorial layer. **NOT** adopting seek-render as default pipeline — wall-clock + audio-cued / `waitAt(t)` / per-beat-narration are real production features.

### 2026-05-07 — Phase 0 — repo audit complete

Wrote `repo-audit-findings.md` (~9000 words). Full system map: engine layer, runtime layer, snapshot system, audio pipeline, GSAP audit, transitions audit, capability kits, helpers, side-by-side vs Hyperframes, pain points, adaptation roadmap.

### 2026-05-07 — Phase 0 — verified `vendor/gsap/3.12.5/` already present

Earlier briefing was wrong: `videos/_shared/kit.js loadGsap()` already loads from `/vendor/gsap/3.12.5/gsap.min.js`. Phase A1 reduces to "add the missing free plugins to the vendor folder."

Currently in `vendor/gsap/3.12.5/`: needs verification. Phase A first step: list contents and identify missing plugins. Plugins to add: `SplitText`, `MorphSVGPlugin`, `DrawSVGPlugin`, `CustomEase`, `GSDevTools`, `MotionPathHelper`. Already loaded by `kit.js`: Flip, MotionPathPlugin (via `loadGsap({flip:true, motionPath:true})`).

### 2026-05-07 — Phase 0 — decisions locked

See REFACTOR-BRIEF.md §3 for the full list. Highlights:
- GSAP all plugins free, use them all.
- Pixel-Point > raw SplitText for text.
- anime.js out.
- Snapshots stay static.
- Transitions overhaul rather than replace.
- Hyperframes seek-render not adopted as default.

### 2026-05-07 — Phase 0 — workflow agreed

Claude (CTO) drafts prompts + reviews; Codex (IC) implements; Umair pastes between them. Independent branches per phase. REFACTOR-BRIEF.md + REFACTOR-PROGRESS.md as session-handoff persistence.

---

## 4. Files created / changed in Phase 0 (this session)

- `repo-audit-findings.md` (new)
- `tools/transition-qc.js` (new)
- `REFACTOR-BRIEF.md` (new)
- `REFACTOR-PROGRESS.md` (new)
- `docs/codex-prompts/phase-a-gsap-foundation.md` (new — Codex prompt for Phase A)
- `docs/codex-prompts/phase-a-claude-session-kickoff.md` (new — handoff prompt for Claude session that supervises Phase A)

No code changes to runtime/engine. No video packages touched.

---

## 5. Phase 0 completion checklist

- [x] Repo audit (`repo-audit-findings.md`)
- [x] Hyperframes architecture deep-read
- [x] engine.js zoom audit (initial findings logged here; full report appends to repo-audit-findings.md when frame data lands)
- [ ] frame-level transition QC capture on `a-complete-guide-to-the-checkboxes-field` (in progress — `tools/transition-qc.js` running)
- [x] REFACTOR-BRIEF.md
- [x] REFACTOR-PROGRESS.md
- [x] Phase A Codex prompt
- [x] Phase A Claude-session kickoff prompt
- [ ] Commit Phase 0 artifacts
- [ ] Hand off to Umair to start Phase A in fresh sessions

---

## 6. Phase A preview (next phase)

**Goal:** Vendor remaining free GSAP plugins; ship `videos/_shared/effects.js` registry; codify cleanup helpers.

**Branch:** `phase-a-gsap-foundation`

**Files allowed (per REFACTOR-BRIEF.md §4):**
- `vendor/gsap/3.12.5/*` (additions only — pull in missing plugin files)
- `videos/_shared/kit.js` (extend `loadGsap()` to load new plugins)
- `videos/_shared/effects.js` (new — `gsap.registerEffect()` library)
- `docs/gsap-rules.md` (update with new patterns)
- No core edits.

**Acceptance:**
- All four known-good baselines validate + smoke-test pass.
- New `awaitTween()` helper used in at least one cinematic to demonstrate hidden-tab fix.
- `gsap.context()` cleanup pattern documented in `gsap-rules.md`.

Full prompt: `docs/codex-prompts/phase-a-gsap-foundation.md`.

---

End of REFACTOR-PROGRESS.md.
