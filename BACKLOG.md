# BACKLOG

Pending work + architectural debt + future-phase candidates. Living document.

History (closed phases A → G.3) lives in [REFACTOR-PROGRESS.md](REFACTOR-PROGRESS.md). Locked decisions live in [REFACTOR-BRIEF.md](REFACTOR-BRIEF.md) §3.

---

## 1. Architectural debt (refactor-deferred, real cost)

Three deferrals from Phase C that we accepted at the time. Each has a known cost and a likely surfacing phase.

### 1a. Element-level Flip carry across snapshot boundaries

**What was deferred.** Phase C's `flipBridge` swap was supposed to take a chapter-level `carry: [sel.x, sel.y]` field, capture Flip state of those elements pre-swap, then `Flip.from(state, ...)` to animate them into their new position post-swap. Codex shipped iframe-to-iframe opacity crossfade with camera-state preservation instead.

**Cost.** Tutorial videos rarely need element-level continuity. Ad-mode polish ("watch the form name fly across the swap") is unavailable. Cream-bleed seam was eliminated regardless.

**When it bites.** When ad-style work demands element-level continuity. Tracked but not blocking.

**Fix sketch.** Add `carry: [...]` chapter field. Pre-swap: `Flip.getState(carry-selectors)` + clone elements into the parent doc as ghosts. Mid-swap: ghosts visible during the iframe crossfade. Post-swap: resolve carry-selectors in new iframe; `Flip.from(state, ...)` animates ghosts onto target positions; remove ghosts.

### 1b. Camera transform owned by frame driver

**What was deferred.** Phase C was supposed to move iframe transform off CSS-transition land onto a paused GSAP timeline registered with the Phase B frame driver, so `seek(t)` deterministically positions the camera. Codex centralized CSS-transition writes into `applyCamera()` / `setCameraTransform()` but the transform stayed CSS-driven.

**Cost.** Visible jolt is gone (the user-facing win), but the **scrubber camera is approximate, not deterministic**. Author scrubber can't perfectly seek camera state mid-chapter. `tools/render.js --seek` mode for `surface: 'editorial'` works because editorial videos don't use the iframe camera; but tutorials in `--seek` mode would fail (they don't run `--seek` today).

**When it bites.** Phase E.5 scrubber accuracy + any future Phase H that wants tutorial videos to render via `--seek`.

**Fix sketch.** ~300-line refactor: `engine.js` maintains a single `cameraTimeline = gsap.timeline({ paused: true })` registered with the frame driver. `zoomTo(...)` appends `cameraTimeline.to(state.ui, { transform, duration, ease })` segments. Driver tick seeks `cameraTimeline` to wall-clock position. `flipBridge` reads carry-camera from timeline state instead of `iframe.style.transform`.

### 1c. Camera-poses shallow integration

**What was deferred.** Phase C registered named camera poses but the resolved spec flows through CSS-transition `zoomTo`, not through the frame driver. Pose-to-pose interpolation isn't seekable.

**Cost.** Same as 1b — pose changes can't be scrubbed accurately.

**When it bites.** Same as 1b. Tied to the same fix.

**Fix sketch.** After 1b lands, `resolveCameraPose(name)` becomes a lookup-then-add-to-cameraTimeline operation rather than a CSS-transition write.

### Combined fix proposal

**Phase H-deferrals** (potential micro-phase): bundle 1a + 1b + 1c into one branch. Touches `engine/engine.js`, `runtime/transitions.js`, `runtime/scene-helpers.js`, `videos/_shared/kit.js`. Per-baseline smoke per commit. ~2-3 day effort. Not currently scheduled.

---

## 2. Known asset gaps

### 2a. Missing audio assets

`assets/sfx/click-alt.mp3` and `bgms/56.mp3` are referenced in `runtime/sfx.js` and some manifests but not committed to the repo. Smoke tolerates missing audio via `--allow-resource-404`.

**Fix options:**
- Commit the assets (need to verify licensing before commit).
- Alias `clickAlt` to `click` in `runtime/sfx.js`.
- Re-record or source replacements.

Low priority. Current videos play with the missing-resource warning; production renders capture audio externally.

### 2b. `docs/surfaces/builder-settings-notifications.md` not harvested

532-line draft notifications inventory in `docs/surfaces/`. Has unique content not covered in `wpforms-field-state-inventory.md` (which has 0 mentions of "notifications"). Marked historical via `docs/surfaces/README.md`.

**Fix:** harvest unique field-state content into `wpforms-field-state-inventory.md` Notifications section, then delete the surfaces directory. Editorial work, ~1-2 hours.

---

## 3. Determinism cleanup

`tools/lint-determinism.js --all` reports **56 warnings** across existing video chapters and runtime cinematics. Logged in [docs/deterministic-logic-findings.md](docs/deterministic-logic-findings.md).

Distribution:
- `Date.now()` calls outside the player driver — some are author choice (e.g. on-screen clock displays) and shouldn't be reflexively replaced.
- `Math.random()` without an adjacent seeded RNG (`mulberry32`) — needs per-call decision: keep, replace with `mulberry32(seed)`, or accept as non-determinism with a `// lint-allow` comment.
- `setTimeout` outside the allowlist (`runtime/`, `engine/`, `tools/`, `scenes/`, `tests/`) — usually means a chapter author bypassed `ctx.sleep`.

**Fix:** per-video migration. Each cleanup needs visual QC. Not bundled because:
1. Videos already work. Replacing internals risks breaking timing.
2. Some warnings are acceptable as-is.
3. Visual QC time is the limiting factor.

**Do this opportunistically.** When working on a video for another reason, run the linter on that video, decide each warning, fix or `lint-allow`. Move on.

---

## 4. Future-phase candidates (not scheduled)

### 4a. Phase H — Tailwind v4 opt-in for marketing-mode

**What:** add Tailwind v4 (browser-runtime, no build step) as an opt-in styling system for `surface: 'editorial'` and `surface: 'mixed'` videos. Hyperframes uses this pattern.

**Why:** faster prototyping for ad-style hero compositions. Consistent design tokens across `videos/_shared/blocks/`.

**When:** if/when ad-style work picks up volume. Currently we have one editorial pilot (`_phase-c-editorial-pilot`).

**Cost:** 50KB Tailwind runtime per video boot. Refactoring existing blocks to Tailwind classes. Marginal win for tutorial videos.

**Status:** discussed, not scheduled.

### 4b. Phase I — block registry expansion

**What:** add HyperFrames-style block install command (`npx <something> add code-card`). Today blocks live in `videos/_shared/blocks/` and are imported directly. Registry pattern would let new videos pull only the blocks they use.

**Why:** as `videos/_shared/blocks/` grows beyond ~10 blocks, every video boot pays the import cost for unused ones.

**When:** when blocks library exceeds ~15 entries. Currently at 7.

**Status:** discussed, not scheduled.

### 4c. HyperFrames composition pattern for full-editorial videos

**What:** promote the test projects in `hyperframes/hyperframes-rest-2/` and `hyperframes/wpforms-ai-scene-10/` to a production-supported pattern. Single HTML file with paused-and-registered timelines, driven by `tools/render.js --seek`.

**Why:** both test projects validate the architecture works for full-editorial 1920×1080 videos. They use `data-start` / `data-duration` / `class="clip"` attributes + `window.__timelines` registration. Currently they're reference experiments, not production-supported.

**When:** when an ad-style video needs the HyperFrames composition pattern (vs. our editorial-mode chapter shape). Currently we use the chapter shape for editorial (`_phase-c-editorial-pilot`) — the HyperFrames pattern is parallel but not adopted.

**Status:** discussed, not scheduled. Decision deferred per `REFACTOR-BRIEF.md §3` — "Hyperframes seek-render NOT adopted as default pipeline."

### 4d. Phase J — element-level Flip carry (1a above) + camera-on-driver (1b above)

See section 1. Bundle as a deferred-debt micro-phase if scrubber accuracy ever blocks real work.

### 4e. Mid-chapter scrubbing

**What:** make scrubber seek to t=4s INSIDE a running chapter, not just chapter-boundary restart.

**Why:** finer-grained QC iteration.

**Cost:** very high. Imperative `effect()` bodies cannot be replayed at arbitrary positions without full state reconstruction. Would require restructuring how chapters are written (paused timelines all the way down, no `await sleep` chains).

**Status:** documented as not-a-deliverable in `wpforms-transitions` skill. Don't pursue.

### 4f. ElevenLabs TTS replacement

**What:** swap `tts/generate.js` to use ElevenLabs instead of current TTS engine.

**Why:** higher voice quality. Tracked in `REFACTOR-BRIEF.md` future-enhancements §L6.

**When:** when production renders feel limited by current TTS quality. Review URLs are fine today.

**Status:** discussed, not scheduled.

---

## 5. Tooling polish (small, opportunistic)

- `tools/skill-context.js` could ship as a JSON manifest if Node startup cost ever matters. Currently <100ms; not a problem.
- `tools/render.js` audio mux is a Phase E.5 follow-up logged in commit messages. Currently MP4s are visual-only / silent for in-repo render.
- `tools/lint-determinism.js` doesn't AST-parse — uses regex. Migrating to AST would reduce false positives. Low priority; current accuracy is acceptable.

---

## 6. New video work (the actual deliverable)

The refactor is done. The validation is shipping a video that's better than the previous baseline.

**Recommended first new videos to test the architecture:**

- **Tutorial** — pick a topic. Author with the new `wpforms-video` skill loaded. Validate the storyboard HARD-GATE works, the modern-features cheat sheet surfaces flipBridge / registerTimeline / pausableRaf, and the granular references (cursor-choreography, camera-lensing, narration-writing) get reached for at the right moments.
- **Ad-style** — a release announcement. Author with `wpforms-marketing` skill loaded. Validate `surface: 'editorial'` boots cleanly, atmospheric kit composes, blocks library covers chrome needs.

**Test incrementally.** Per-feature scenes, not "build the whole video then run validators." If `registerTimeline` breaks, find out at scene 2, not after 14 chapters.

---

End of BACKLOG.md.
