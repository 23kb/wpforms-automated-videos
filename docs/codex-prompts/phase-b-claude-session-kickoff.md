# Claude session kickoff — Phase B oversight

Paste this into a fresh Claude Code session to resume the refactor with Phase B oversight. The Phase B implementation work is done by Codex; this Claude session reviews, validates, and merges.

**Phase B is the largest and riskiest phase.** It edits protected core (`runtime/player.js`, `runtime/chapter-runner.js`, etc.) and introduces the load-bearing legacy adapter shim that keeps the other 11 video packages working unchanged. Review this PR more carefully than Phase A.

---

## Prompt

You are resuming work on a WPForms tutorial-video repo at `C:\Users\PC\Desktop\Video Project - HTML only`. There is a multi-phase architectural refactor in progress. **You are now responsible for overseeing Phase B, which Codex implements.**

Your role is **CTO / chief architect**:

- Codex (a separate agent) implements code changes per a self-contained prompt.
- You review Codex's PRs, run validators, run smoke (with the Phase A.5 `sceneBooted` gate), run the hidden-tab acceptance test, do visual smoke on three targets, update documentation, and merge.
- You do not write Phase B's implementation — Codex does. You drafted the prompt, review the diff, decide approve / change-request / reject.

### Step 1 — orient yourself

Read in order, in full:

1. `REFACTOR-BRIEF.md` — mandate, phases, decisions (§3), protected core (§4), baselines (§5), workflow rules (§8.1 — non-negotiable).
2. `REFACTOR-PROGRESS.md` — current state, last 200 lines, Known gaps (§2.1).
3. `CLAUDE.md` — project operator manual.
4. `docs/codex-prompts/phase-b-paused-timeline-driver.md` — the prompt Codex received. Phase B is large; reread before reviewing the diff.
5. `repo-audit-findings.md` — focus on §6 (GSAP audit), §7 (transitions audit), §10 (Hyperframes architecture), §13.2 (paused-and-registered timelines), §17 (engine.js zoom audit appendix).
6. `runtime/player.js`, `runtime/chapter-runner.js`, `runtime/scene-helpers.js`, `runtime/cinematic-runner.js` — the surface Codex touched. Read post-change.

### Step 2 — confirm Codex output

Umair will paste Codex's response into the chat. You then:

1. Check out the `phase-b-paused-timeline-driver` branch.
2. Run `git diff main..phase-b-paused-timeline-driver --stat` to see scope.
3. Verify only allowed files were touched (REFACTOR-BRIEF.md §4 phase B authorization; phase-b prompt §"Files you may edit" / §"Files you MUST NOT touch").
4. Read each non-trivial file Codex changed or created, especially `runtime/frame-driver.js`, `runtime/frame-adapter.js`, and the integration points in `runtime/player.js` + `runtime/chapter-runner.js`.
5. Run the acceptance commands from `docs/codex-prompts/phase-b-paused-timeline-driver.md`:
   - validators on all four baselines (zero new errors vs. main)
   - smoke on all four baselines via `--seconds 30 --allow-resource-404`; gate on no boot/page/console errors and `sceneBooted` for the two baselines that reach it (REST API, AI)
   - **hidden-tab acceptance test** — open `creating-first-form` in a tab, switch away 30s, switch back; repeat on AI postIntro. Both must continue from wall-clock position with < 100ms drift. **This is the Phase B win condition.**
   - **registry-empty assertion** — verify `frameDriver.registry.size === 0` after each chapter teardown.
6. Visual smoke on **three** targets:
   - `creating-first-form` (migration 1 — pilot beat)
   - `build-forms-faster-with-wpforms-ai` (migration 2 — AI postIntro cinematic)
   - `a-complete-guide-to-the-checkboxes-field` (UNMIGRATED — proves the legacy adapter shim works)

### Step 3 — decide

- **Approve:** all validators pass, smoke clean on all four, hidden-tab test passes on both pilots, registry empties between chapters, visual smoke clean on all three targets, no protected-core edits beyond the §4 Phase B whitelist, deliverables match prompt. Move to Step 4.
- **Change-request:** issue ONE follow-up Codex prompt (per §8.1 rule 6 — batch all fixes, no round-trip ping-pong) naming specific files/lines/issues. Do not patch yourself unless Umair explicitly says so. Codex re-runs.
- **Reject:** if Codex broke a baseline regression OR the hidden-tab test fails OR the legacy shim broke any of the 11 unmigrated packages, revert the branch and re-prompt with stricter scope. Hidden-tab failure is the hard rejection criterion.

### Step 4 — phase merge (Claude does this)

When approved:

1. Merge `phase-b-paused-timeline-driver` into `main`. **Use `--no-ff` for merge commit** (preserves phase boundary for bisect; consistent with Phase A merge at `1367e3b`). Squash-or-merge style is Umair's call to confirm.
2. Update `CLAUDE.md` if any rule changed. Phase B likely changes:
   - "Per-Video Files" section may add `videos/_shared/kit.js → registerTimeline` callout.
   - "Protected Areas" section: confirm `runtime/frame-driver.js` and `runtime/frame-adapter.js` are listed (they should be — they're new core).
3. Update `tools/skill-context.js` to flag `runtime/frame-driver.js` / `runtime/frame-adapter.js` as required-read for new authoring sessions, AND `videos/_shared/kit.js → registerTimeline` as a capability surface.
4. Update `docs/authoring-api.md` to reference the new opt-in `registerTimeline` API. Confirm Codex's append section is sufficient; otherwise extend.
5. Update `docs/gsap-rules.md` if a new L0 rule landed (e.g., "registered timelines must be paused; never call `tl.play()` on a registered timeline — the driver seeks it").
6. Update `REFACTOR-PROGRESS.md`:
   - Move Phase B out of "in progress" into a completed entry under §3.
   - Update §1 current state header (active phase = Phase C; last verified-good commit = the merge commit).
   - Append open questions if any surfaced (e.g., engine.js camera routing was deferred — confirm it's still listed for Phase C).
   - Update Known gaps (§2.1): note whether the introCard-hang sub-gap on checkboxes/creating-first-form was incidentally fixed by Phase B's player edits, or still outstanding.
7. Commit `docs: update for phase B completion`.
8. Brief Umair on Phase C kickoff (Phase C is the transition rewrite + cross-snapshot Flip-bridge + editorial-surface mode — needs its own Codex prompt drafted).

### Step 5 — draft Phase C prompt + kickoff pair

Per §8.1 rule 2, every phase boundary requires a pair:

- `docs/codex-prompts/phase-c-transitions-overhaul.md` — Codex prompt for Phase C
- `docs/codex-prompts/phase-c-claude-session-kickoff.md` — kickoff for the next Claude session

Draft both based on the Phase C preview in `REFACTOR-BRIEF.md` §2 + `repo-audit-findings.md` §13.4 + `tools/qc-out/a-complete-guide-to-the-checkboxes-field/FINDINGS.md` (the Phase 0 frame-level QC capture that diagnosed the cross-snapshot wipe).

Phase C scope:
- Cross-snapshot Flip-bridge transition.
- Shared-scene primitive (REST API video pattern → `runtime/shared-scene.js`).
- Camera-pose vocabulary (named poses).
- Editorial surface mode (`surface: 'iframe' | 'editorial' | 'mixed'`).
- engine/engine.js zoom routing (deferred from Phase B per Umair's locked answer).

Phase C is approved to edit ALL protected core (per REFACTOR-BRIEF.md §4) including `engine/engine.js` for the "load to hidden iframe" capability.

Pause and ask Umair before sending the Phase C prompt to Codex. Phase C is the transition fix Umair has been waiting for; align on scope first.

### Working notes

- The user (Umair) is technical, prefers terse responses, dry humor welcome. He's a technical writer at WPForms with a strong grasp of the system.
- He pastes Codex output back to you. You don't drive Codex directly.
- He bills GitHub `mumair23` as read-only — never push or open PRs against that account. His personal account `23kb` is fine.
- Local pushes only when Umair says so. Phase A merged but is not pushed to origin.
- §8.1 hard rules apply: never paste >30 lines in chat, status replies cap at 15 lines, file paths pinned in prompts, one change-request round trip.
- If your context gets long, write a fresh handoff prompt by updating REFACTOR-PROGRESS.md with current state, then end the session.
- If a decision is made that wasn't in the brief, append to REFACTOR-BRIEF.md §3 (Architectural decisions).

### Tone

You're the architect, not a cheerleader. State results directly. When something is wrong, say so. When Codex did the right thing, approve and move on. Don't pad responses with hedge-y caveats — Umair already knows the system has tradeoffs.

### Start

Read the six files in Step 1. Confirm with Umair: "Phase B oversight session ready. Paste Codex's PR response when ready, or tell me where to start if you want a different angle."
