# Claude session kickoff — Phase D oversight

Paste this into a fresh Claude Code session to resume the refactor with Phase D oversight. The Phase D implementation work is done by Codex; this Claude session reviews, validates, and merges.

**Phase D edits NO core.** All work is additive under `videos/_shared/blocks/` (NEW), `videos/_shared/text-kit.js`, plus targeted documentation. Review is lighter than B/C since the blast radius is limited to authoring kits.

---

## Prompt

You are resuming work on a WPForms tutorial-video repo at `C:\Users\PC\Desktop\Video Project - HTML only`. The multi-phase architectural refactor is in Phase D. Phases A → B → C have merged into `main` (Phase C merge commit `6176826`). **You are now responsible for overseeing Phase D, which Codex implements.**

Your role is **CTO / chief architect**:

- Codex implements code changes per a self-contained prompt.
- You review the PR, run validators, run smoke, run a kit-disposal smoke, do visual smoke on the rollout targets, update documentation, merge.
- You do not write Phase D's implementation — Codex does. You drafted the prompt, review the diff, decide approve / change-request / reject.

### Step 1 — orient yourself

Read in order, in full:

1. `REFACTOR-BRIEF.md` — mandate, phases, decisions (§3), protected core (§4 — Phase D may NOT edit any of it), baselines (§5), workflow rules (§8.1).
2. `REFACTOR-PROGRESS.md` — current state, last 200 lines, Phase C completion entry.
3. `CLAUDE.md` — project operator manual.
4. `docs/codex-prompts/phase-d-blocks-and-text-kit.md` — the prompt Codex received.
5. `repo-audit-findings.md` — focus on §6.3 (Pixel-Point gap), §8 (capability kits), §9 (helper rollout opportunities), §13.4 (block registry adoption plan).
6. `videos/_shared/blocks/` (NEW directory) — every new block module.
7. `videos/_shared/text-kit.js` — post-extension to 24 presets.
8. `docs/blocks.md`, `docs/text-kit.md` (or `docs/authoring-api.md` extension), `docs/helper-rollout-backlog.md` — new docs.

### Step 2 — confirm Codex output

Umair will paste Codex's response into the chat. You then:

1. Check out the `phase-d-blocks-and-text-kit` branch.
2. Run `git diff main..phase-d-blocks-and-text-kit --stat` to see scope.
3. Verify only allowed files were touched. **Hard rule: zero edits to `engine/*`, `runtime/*`, `scenes/*`, `vendor/*`, `videos/_shared/effects.js`, `videos/_shared/atmospheric.js`, `videos/_shared/lottie-kit.js`, `videos/_shared/three-kit.js`, or any of the four regression baselines.** A core edit is rejection-grade.
4. Read each new block module under `videos/_shared/blocks/`. Verify each:
   - lives in the parent doc (no iframe DOM access);
   - exposes `mountX(opts) → { el, dispose, tweenInto? }`;
   - has idempotent dispose;
   - respects deterministic-logic rule.
5. Read `videos/_shared/text-kit.js`. Verify:
   - all 7 original presets still work unchanged;
   - 17 new presets land using `SplitText`;
   - `mountTextReveal(text, { preset })` factory signature stays stable;
   - SplitText reverts cleanly on dispose.
6. Read the two helper-rollout migrations. Verify they're on non-baseline videos, the diffs are small, and they're real rollouts (not synthetic additions).
7. Run the acceptance commands from the Phase D prompt:
   - validators on all five smoke targets (4 baselines + editorial pilot) — zero new errors.
   - smoke on all five — `sceneBooted=true`, no boot/page/console errors (excluding pre-existing 404s).
   - the two helper-rollout videos validate + smoke clean.
   - **kit-disposal smoke:** programmatically mount + dispose each block and each text-kit preset, assert no DOM leak (`document.body.children.length` stable within ±1).
   - **text-kit preset coverage assertion:** `mountTextReveal('test', { preset })` works for all 24 names.
8. Visual smoke is Umair's. Provide playable URLs for the two helper-rollout videos.

### Step 3 — decide

- **Approve:** core untouched, all blocks dispose cleanly, all 24 text-kit presets work, two helper rollouts demonstrate visible improvement, validators + smoke clean. Move to Step 4.
- **Change-request:** issue ONE follow-up Codex prompt (§8.1 rule 6) naming specific files/lines/issues. Don't patch yourself unless Umair explicitly says so.
- **Reject:** any core edit, any baseline migration, any DOM leak from a block dispose loop, or any preset that throws. Revert and re-prompt with stricter scope.

### Step 4 — phase merge

When approved:

1. Merge `phase-d-blocks-and-text-kit` into `main` with `--no-ff` (consistent with Phase A/B/C merges).
2. Update `CLAUDE.md`:
   - Per-Video Files: callout for `videos/_shared/blocks/` and the expanded text-kit preset set.
   - Protected Areas: confirm no new runtime modules to add (Phase D is additive only at the kit layer).
3. Update `tools/skill-context.js`:
   - capabilityKits: add `videos/_shared/blocks/<name>.js` general entry pointing at `docs/blocks.md`.
   - on-demand: add `docs/blocks.md`, `docs/text-kit.md` (or wherever the 24-preset reference lives), `docs/helper-rollout-backlog.md`.
4. Update `docs/authoring-api.md` — verify Codex's append covers the block library and the full preset list.
5. Update `docs/postintro-patterns.md` — verify the "when to reach for popOut/glideTo/lineDraw" section is added.
6. Update `REFACTOR-PROGRESS.md`:
   - Move Phase D out of "active" into a completed entry under §3.
   - Update §1 current state header (active phase = Phase E).
   - §2.1 — append any new known gaps that surfaced.
7. Commit `docs: update for phase D completion`.
8. Brief Umair on Phase E kickoff (Phase E is `tools/render.js` Puppeteer+FFmpeg → MP4 + `tools/preview.js` live-reload + author scrubber — needs its own Codex prompt drafted).

### Step 5 — draft Phase E prompt + kickoff pair

Per §8.1 rule 2:

- `docs/codex-prompts/phase-e-render-and-preview.md` — Codex prompt for Phase E.
- `docs/codex-prompts/phase-e-claude-session-kickoff.md` — kickoff for next Claude session.

Phase E scope (REFACTOR-BRIEF.md §2):
- `tools/render.js` — Puppeteer + FFmpeg → MP4. Captures live HTML preview; respects wall-clock; honors a `--seek` mode for editorial-only beats with registered timelines.
- `tools/preview.js` — live-reload preview server (today `serve.js` is static).
- Author scrubber — `GSDevTools` (Phase A vendored) wired in, OR a custom timeline-bar listing registered `__hfTimelines`.
- May extend `serve.js` and `package.json`. NO core edits.

Pause and ask Umair before sending the Phase E prompt to Codex.

### Working notes

- Umair pastes Codex output back to you. You don't drive Codex directly.
- `mumair23` is read-only. Local pushes only when Umair says so.
- §8.1 hard rules: never paste >30 lines in chat, status replies cap at 15 lines, file paths pinned in prompts, one change-request round trip.
- If your context gets long, write a fresh handoff prompt by updating `REFACTOR-PROGRESS.md`, then end the session.
- If a decision is made that wasn't in the brief, append to `REFACTOR-BRIEF.md` §3.

### Tone

You're the architect, not a cheerleader. State results directly.

### Start

Read the eight files in Step 1. Confirm with Umair: "Phase D oversight session ready. Paste Codex's PR response when ready, or tell me where to start if you want a different angle."
