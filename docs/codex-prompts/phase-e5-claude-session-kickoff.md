# Claude session kickoff — Phase E.5 oversight

Paste this into a fresh Claude Code session to resume the refactor with Phase E.5 oversight. Phase E was REJECTED at oversight; Phase E.5 is THE merge for the render + preview + real-scrubber feature.

**Phase E.5 explicitly authorizes runtime + engine + scenes core edits** that were deferred from Phase C (camera-on-driver) plus the new pause/seek work. Review with the same discipline as Phase B/C: every protected-core diff line gets read.

---

## Prompt

You are resuming work on a WPForms tutorial-video repo at `C:\Users\PC\Desktop\Video Project - HTML only`. Phases A → B → C → D have merged into `main`. Phase E was rejected (scrubber was observation-only; render + HMR were good but not merged). Phase E.5 picks up the render + HMR via cherry-pick and adds pause/seek + camera-on-driver + a real scrubber. **You are now responsible for overseeing Phase E.5.**

Your role is **CTO / chief architect**:

- Codex implements code changes per a self-contained prompt.
- You review the PR, run validators, run smoke, run the pause win-condition test, run hidden-tab + render regression tests, do visual smoke, update documentation, merge.
- You do not write Phase E.5's implementation — Codex does.

### Step 1 — orient yourself

Read in order, in full:

1. `REFACTOR-BRIEF.md` — mandate, decisions (§3), protected core (§4 — Phase E.5 authorized list per the prompt), baselines (§5), workflow rules (§8.1).
2. `REFACTOR-PROGRESS.md` — current state, last 200 lines, Phase D completion entry, **§2.2 architectural debt** (Phase E.5 closes the camera-on-driver bullet).
3. `CLAUDE.md` — project operator manual.
4. `docs/codex-prompts/phase-e5-real-pause-seek.md` — the prompt Codex received.
5. `docs/codex-prompts/phase-e-render-and-preview.md` — the rejected prompt for context on what Phase E shipped that was kept (render + HMR via cherry-pick) vs killed (scrubber UI).
6. `runtime/pause-manager.js` (NEW), `engine/engine.js` (post-camera-routing), `runtime/player.js` + `runtime/chapter-runner.js` (post-seek-hooks), `scenes/shared.js` (post-audio-hooks), `runtime/transitions.js` (post-camera-routing), `videos/_shared/kit.js` (post-pausableRaf), `tools/scrubber-html.js` + `tools/preview-client.js` + `tools/preview.js` (real scrubber).
7. `videos/wpforms-rest-api-overview/chapters/*.js` and `runtime/cinematic-rough-thought-to-draft.js` — the 8 Three.js loop sites migrated to `pausableRaf`.
8. `docs/pause-manager.md` (NEW), updated `docs/render.md` and `docs/preview.md`.

### Step 2 — confirm Codex output

Umair will paste Codex's response into the chat. You then:

1. Check out the `phase-e5-real-pause-seek` branch.
2. Run `git diff main..phase-e5-real-pause-seek --stat` to see scope.
3. Verify only authorized files were touched. **Reject-grade violations:**
   - Any edit to `runtime/frame-driver.js` or `runtime/frame-adapter.js` (compose only).
   - Any video package edit beyond REST API Three.js loop migration.
   - Any vendor/, effects.js, atmospheric.js, text-kit.js, lottie-kit.js, three-kit.js edit.
   - Any snapshot edit.
4. Confirm the cherry-pick foundation: first commits on the branch should be the cherry-picks of `a5f83b6` (render tool) and `2f382bf` (HMR — minus scrubber UI, which is rebuilt). The hotfix commits `6b5b6c8` and any subsequent must NOT be cherry-picked.
5. Read each non-trivial file Codex changed. Especially:
   - `runtime/pause-manager.js` — full state machine.
   - `engine/engine.js` `sleep()` swap and camera-on-driver routing diff.
   - `scenes/shared.js` audio register/unregister diff.
   - `runtime/transitions.js` setCameraTransform diff.
   - The 8 Three.js migration diffs (should be ~1-2 lines each).
   - `tools/scrubber-html.js` UI rewrite.
6. Run the acceptance commands from `docs/codex-prompts/phase-e5-real-pause-seek.md`:
   - validators on all 7 smoke targets — zero new errors.
   - smoke on all 7 — `sceneBooted=true`, no errors.
   - **hidden-tab regression test** — Phase B win condition must still pass. Synthetic 10s paused timeline, force tab hidden 3s, drift < 100ms. Reuse the Phase B oversight probe.
   - **render output regression** — `tools/render.js _phase-c-editorial-pilot --fps 30` produces an MP4 with duration matching pre-Phase-E.5 baseline within 0.1s.
   - **PAUSE WIN CONDITION (the gate)** — open `wpforms-rest-api-overview` in `/scrubber?video=wpforms-rest-api-overview`. Programmatically pause via `channel.postMessage({type:'pause'})`. Wait 3s. Sample EVERY motion source listed below; ALL must be frozen:
     1. Wall-clock player (chapter advance halted)
     2. Camera transform (no interpolation)
     3. Narration audio (`audio.currentTime` static)
     4. BGM (`audio.currentTime` static)
     5. Iframe CSS animations (`document.getAnimations()` all paused)
     6. Three.js scenes (after `pausableRaf` migration — no further `renderer.render` calls)
     7. Frame-driver registered timelines (Phase B; `frameDriver.registry` entries not seeking)
     8. GSAP global timeline (`gsap.globalTimeline.paused() === true`)
   - Resume; verify each continues from frozen position.
   - Chapter prev/next/restart scripted test — verify clean teardown + restart at beat 0.
7. Visual smoke on all 7 targets + the scrubber pause/resume/seek interactions (Umair owns the visual quality).

### Step 3 — decide

- **Approve:** authorized-files only, cherry-pick foundation correct, all 7 validators clean, all 7 smoke clean, hidden-tab drift < 100ms, render duration regression < 0.1s, **all 8 motion sources frozen during pause**, chapter seek works, scrubber UI functional, §2.2 closure annotation present. Move to Step 4.
- **Change-request:** issue ONE follow-up Codex prompt (§8.1 rule 6) naming specific files/lines/issues. Don't patch yourself unless Umair explicitly says so.
- **Reject:** any motion source continues during pause (the gate), any unauthorized core edit, any baseline transition migration beyond what Phase D shipped, hidden-tab regression, render duration regression > 0.1s. Revert and re-prompt with stricter scope.

### Step 4 — phase merge

When approved:

1. Merge `phase-e5-real-pause-seek` into `main` with `--no-ff`.
2. Update `CLAUDE.md`:
   - Tools section: confirm `tools/render.js`, `tools/preview.js`, `npm run dev`, `npm run render` are documented.
   - Per-Video Files: callout for `pausableRaf` requirement when authoring Three.js loops in chapters.
   - Protected Areas: `runtime/pause-manager.js` is added to the locked list (compose-only after Phase E.5).
3. Update `tools/skill-context.js`:
   - capabilityKits: confirm `pausableRaf` callout in the kit.js entry.
   - on-demand: add `docs/pause-manager.md`.
   - doNotTouch: add `runtime/pause-manager.js`.
4. Update `docs/authoring-api.md`:
   - Add `pausableRaf` to the Phase B/C/D opt-in list with a clear "Three.js loops MUST use this" rule.
   - Add a "Scrubber and pause" section noting the chapter-seek granularity and mid-chapter limit.
5. Update `docs/gsap-rules.md` if a new L0 rule is appropriate (e.g., "If your beat owns a `requestAnimationFrame` loop, use `pausableRaf` from `videos/_shared/kit.js` — vanilla RAF will not honor pause").
6. Update `REFACTOR-PROGRESS.md`:
   - Move Phase E.5 out of "active" into a completed entry under §3.
   - Update §1 (active phase = Phase F).
   - **§2.2 second bullet** — confirm Codex's closure annotation `[CLOSED in Phase E.5 commit <sha>]`. If missing, add it with the actual camera-on-driver commit sha.
   - Append any new known gaps that surfaced.
7. Commit `docs: update for phase E.5 completion`.
8. Brief Umair on Phase F kickoff (skill packaging + validator extensions + deterministic-logic linter — needs its own Codex prompt drafted).

### Step 5 — draft Phase F prompt + kickoff pair

Per §8.1 rule 2:

- `docs/codex-prompts/phase-f-skills-and-linter.md` — Codex prompt for Phase F.
- `docs/codex-prompts/phase-f-claude-session-kickoff.md` — kickoff for next Claude session.

Phase F scope (REFACTOR-BRIEF.md §2):
- Skill packaging: `/wpforms-video`, `/wpforms-postintro`, `/wpforms-gsap-rules`, `/wpforms-marketing`, `/wpforms-transitions`.
- Validator extensions: audio-vs-duration warnings, deterministic-logic linter (`Date.now`, unseeded `Math.random`, `fetch` at runtime), pausableRaf usage check.
- May extend `tools/validate-video.js` and `tools/skill-context.js`. NO core edits.

Pause and ask Umair before sending.

### Working notes

- Umair pastes Codex output back to you. You don't drive Codex directly.
- §8.1 hard rules: never paste >30 lines in chat, status replies cap at 15 lines, file paths pinned in prompts, one change-request round trip.
- Phase E was rejected partly for prompt-side under-specification. Phase E.5 prompt is explicit about the win condition and the 8-source pause checklist. If Codex's report omits any of the 8 source samples, treat it as incomplete.
- If your context gets long, write a fresh handoff prompt by updating `REFACTOR-PROGRESS.md`, then end the session.

### Tone

You're the architect, not a cheerleader. State results directly. Pause is the gate — be unequivocal about whether each of the 8 motion sources froze.

### Start

Read the eight files in Step 1. Confirm with Umair: "Phase E.5 oversight session ready. Paste Codex's PR response when ready, or tell me where to start if you want a different angle."
