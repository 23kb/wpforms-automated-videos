# REFACTOR-DONE.md

The architectural refactor is complete. This page is the one-screen recap;
[REFACTOR-BRIEF.md](REFACTOR-BRIEF.md) holds the original mandate and locked
decisions, [REFACTOR-PROGRESS.md](REFACTOR-PROGRESS.md) holds the per-phase
log.

## What shipped

| Phase | Win condition | Key commit |
|---|---|---|
| **A** — GSAP foundation | All free GSAP plugins vendored at `vendor/gsap/3.15.0/`; `effects.js` registry; `awaitTween` + `withGsapContext` | merge `1367e3b` |
| **A.5** — Smoke gate fix | `data-sceneBooted` milestone; smoke gate semantically correct | merge `ee35378` |
| **B** — Frame driver | Paused-and-registered timeline registry; hidden-tab survival via `setTimeout` fallback (drift = 7ms verified) | merge `b6526a3` |
| **C** — Transitions overhaul | `flipBridge` swap eliminates cream-bleed seam on cross-snapshot transitions; surface modes (`iframe` / `editorial` / `mixed`); camera-pose vocabulary; shared-scene primitive | merge `6176826` |
| **D** — Blocks + text-kit | `videos/_shared/blocks/` (7 editorial blocks); text-kit 7→24 Pixel-Point presets; `cursor.glideTo` rollout | merge `0154c27` |
| **E** — Render + preview | **REJECTED** at oversight — scrubber was observation-only. Render + HMR salvaged via cherry-pick into Phase E.5. | n/a (not merged) |
| **E.5** — Real pause/seek | `runtime/pause-manager.js` hammers all 8 motion sources atomically; chapter prev/next/restart from scrubber UI; camera-on-driver refactor (closes Phase C §2.2 deferral); `pausableRaf` for author Three.js loops; in-repo `tools/render.js` (Puppeteer + FFmpeg → MP4) | merge `6e58fdc` |
| **F** — Skills + linter | 5 `.claude/skills/wpforms-*/SKILL.md` bundles; validator extensions (audio-vs-duration, raw-RAF, registerTimeline-paused); `tools/lint-determinism.js`; `npm run lint` | merge `da06464` |

## The win conditions, named

1. **Cream-bleed seam killed.** Phase 0 frame-level QC documented ~1.5s of flat-color "page-refresh feel" on cross-snapshot swaps. Phase C `flipBridge` (iframe-crossfade + camera carry, no body-wipe, no cream cover) eliminates it. Verified visually on `a-complete-guide-to-the-checkboxes-field`.
2. **Hidden-tab GSAP hang fixed.** Phase B's frame driver falls back to `setTimeout(16)` when RAF is throttled; registered timelines continue seeking. Drift measured at 7ms over a 3s hidden interval (≪ 100ms ceiling).
3. **Pause works.** Phase E.5's pause manager hammers wall-clock player, camera transform, narration audio, BGM, iframe CSS animations, Three.js scenes (after `pausableRaf` migration), Phase B registered timelines, and GSAP global timeline atomically. Resume continues each from the frozen position.
4. **Chapter seek works.** Prev / Next / Restart in the scrubber UI tear down the current chapter (frame driver registry empties) and re-enter at chapter index N from beat 0. Mid-chapter seek is documented as not supported (imperative `effect()` bodies cannot be replayed at arbitrary positions).
5. **In-repo MP4 render.** `tools/render.js` exports wall-clock screencast or `--seek`-mode editorial-only renders. No more screen-recording the live preview.
6. **Determinism enforced.** No `Date.now` outside the player driver. No unseeded `Math.random`. No `fetch` at runtime. Static linter at `tools/lint-determinism.js`.

## What's still open (no scheduled phase)

- **§2.2 architectural debt** — three bullets remain:
  - Element-level Flip carry across snapshot boundaries (currently iframe-crossfade only).
  - `runtime/shared-scene.js` ships unused (no video genuinely needs it yet).
  - `runtime/camera-poses.js` shallow integration (resolver wired; pose-to-pose interpolation as a registered timeline not delivered).
- **§2.1 known gaps** — `assets/sfx/click-alt.mp3` and `bgms/56.mp3` are referenced but missing on disk. Low priority; `--allow-resource-404` masks at smoke time.
- **`docs/deterministic-logic-findings.md`** — 56 warnings logged in Phase F. Cleanup is a per-video session at the user's pace; no behavior regression, just discipline backlog.
- **Helper rollout backlog** (Phase D) — `popOut`, `cursor.glideTo`, `lineDraw` rollout audit at `docs/helper-rollout-backlog.md`. Two real migrations landed; the rest is opt-in per storyboard.

## Where to start a new session

1. `node tools/skill-context.js` — canonical startup dump.
2. Load the narrowest `.claude/skills/wpforms-*` skill that matches the task.
3. For visual QC of an existing video: `http://localhost:4321/scenes/player.html?video=<slug>` (full) or `…/scrubber?video=<slug>` (with pause/prev/next/restart).
4. For MP4 export: `node tools/render.js <slug>` (wall-clock) or `--seek` for editorial.

## Where to find what

- Public authoring contract: `docs/authoring-api.md`.
- L0 GSAP discipline: `docs/gsap-rules.md`.
- PostIntro design: `docs/postintro-patterns.md`.
- Phase B frame driver: `docs/frame-driver.md`.
- Phase C transitions / camera poses / shared scene: `docs/transitions.md`, `docs/camera-poses.md`, `docs/shared-scene.md`.
- Phase D blocks + text-kit: `docs/blocks.md`, `docs/text-kit.md`.
- Phase E.5 pause-manager: `docs/pause-manager.md`.
- Phase F skills + determinism: `docs/skills.md`, `docs/deterministic-logic.md`.

End of REFACTOR-DONE.md.
