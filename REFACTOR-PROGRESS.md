# REFACTOR-PROGRESS.md

**Running log. Append to top of §3 with every working step.** Read with [REFACTOR-BRIEF.md](REFACTOR-BRIEF.md).

---

## 1. Current state header

- **Active phase:** Phase 0 (audit + briefing)
- **Active branch:** `main` (pre-refactor; phases run on independent branches)
- **Current pilot video for Phase B:** `creating-first-form` (simplest tutorial; switch to checkboxes/REST API after first migration succeeds)
- **Last verified-good commit:** `ed15f78` (chore: ignore local-only files)
- **Next action:** Phase A starts in fresh Claude session + Codex; this Phase 0 session ends after handing over briefing files and prompts.

---

## 2. Open questions stack

(Append to top. Closed questions move to "Decisions locked" in REFACTOR-BRIEF.md §3.)

_(none currently — all Phase A starting questions answered 2026-05-07)_

---

## 3. Per-step log (reverse chronological)

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
