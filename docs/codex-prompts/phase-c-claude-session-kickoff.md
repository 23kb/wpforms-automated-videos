# Claude session kickoff — Phase C oversight

Paste this into a fresh Claude Code session to resume the refactor with Phase C oversight. The Phase C implementation work is done by Codex; this Claude session reviews, validates, and merges.

**Phase C is the highest-blast-radius phase of the refactor.** It rewrites `runtime/transitions.js`, edits `engine/engine.js`, introduces `runtime/shared-scene.js`, adds a manifest-level `surface` mode, and lands a Flip-based cross-snapshot bridge. All protected core is in scope. Review more carefully than Phase B.

---

## Prompt

You are resuming work on a WPForms tutorial-video repo at `C:\Users\PC\Desktop\Video Project - HTML only`. The multi-phase architectural refactor is in Phase C. **You are now responsible for overseeing Phase C, which Codex implements.**

Your role is **CTO / chief architect**:

- Codex implements code changes per a self-contained prompt.
- You review Codex's PR, run validators, run smoke (with the Phase A.5 `sceneBooted` gate), run the cross-snapshot seam acceptance test, do visual smoke on five targets (three pilots + two unmigrated baselines), update documentation, merge.
- You do not write Phase C's implementation — Codex does. You drafted the prompt, review the diff, decide approve / change-request / reject.

### Step 1 — orient yourself

Read in order, in full:

1. `REFACTOR-BRIEF.md` — mandate, phases, decisions (§3), protected core (§4), baselines (§5), workflow rules (§8.1 — non-negotiable).
2. `REFACTOR-PROGRESS.md` — current state, last 200 lines, Known gaps (§2.1 — the introCard hang carries into Phase C scope).
3. `CLAUDE.md` — project operator manual.
4. `docs/codex-prompts/phase-c-transitions-overhaul.md` — the prompt Codex received. Phase C is huge; reread before reviewing the diff.
5. `tools/qc-out/a-complete-guide-to-the-checkboxes-field/FINDINGS.md` — Phase 0 frame-level capture. The cross-snapshot seam this phase must eliminate.
6. `tools/qc-out/form-entries-guide/FINDINGS.md` — second QC capture proving morph and fast produce same-shape gaps.
7. `repo-audit-findings.md` — focus on §2.1 (engine.js camera math), §3.5 (transitions.js), §7 (transitions audit), §13.1–§13.4, §17 (engine.js zoom audit appendix).
8. `runtime/transitions.js` (post-rewrite), `engine/engine.js` (post-rewrite), `runtime/shared-scene.js` (NEW), `runtime/camera-poses.js` (NEW or folded into transitions.js), `runtime/player.js`, `runtime/chapter-runner.js`, `scenes/player.html` and `scenes/shared.css` (if surface mode required edits).

### Step 2 — confirm Codex output

Umair will paste Codex's response into the chat. You then:

1. Check out the `phase-c-transitions-overhaul` branch.
2. Run `git diff main..phase-c-transitions-overhaul --stat` to see scope.
3. Verify only allowed files were touched (REFACTOR-BRIEF.md §4 phase C authorization; phase-c prompt §"Files you may edit" / §"Files you MUST NOT touch"). The 9+ unmigrated video packages must be untouched.
4. Read each non-trivial file Codex changed or created. Especially: `runtime/transitions.js` (full), `engine/engine.js` (the camera-routing diff), `runtime/shared-scene.js`, the new flipBridge swap implementation, the surface-mode dispatch in `runtime/player.js`.
5. Run the acceptance commands from `docs/codex-prompts/phase-c-transitions-overhaul.md`:
   - validators on all four baselines (zero new errors vs. main; new lints for `surface` / `flipBridge` / poses must not error on videos that don't use those features)
   - smoke on all four baselines via `--seconds 30 --allow-resource-404`; gate on no boot/page/console errors and `sceneBooted` for the two baselines that reach it (REST API, AI). If the introCard hang on checkboxes/CFF was incidentally fixed by the pre-load-iframe rework, log it; if not, it carries to Phase C.5 — do not block Phase C on it.
   - **cross-snapshot seam acceptance test** — open `a-complete-guide-to-the-checkboxes-field` after pilot 2; both `flipBridge` swaps must show: chrome visible across the swap, camera pose carried, carry elements visually continuous, no flat-color "page-refresh" second. **This is the Phase C win condition.**
   - **hidden-iframe preload assertion** — verify next-snapshot iframe is painted before the old unmounts (debug-gated assertion).
   - **camera-routing assertion** — verify `engine.js:135–141` zoom-reset path is no longer reachable; no transform jolt at chapter boundaries on REST API.
6. Visual smoke on **five** targets:
   - `wpforms-rest-api-overview` (pilot 1 — shared-scene)
   - `a-complete-guide-to-the-checkboxes-field` (pilot 2 — flipBridge; the cream-bleed kill is the win)
   - `_phase-c-editorial-pilot` (pilot 3 — pre-specced sandbox proving the surface-mode dispatch fork)
   - `creating-first-form` (unmigrated; legacy shim proof)
   - `build-forms-faster-with-wpforms-ai` (unmigrated; legacy shim proof + cinematic regression check)

### Step 3 — decide

- **Approve:** all validators pass, smoke clean, cross-snapshot seam eliminated on pilot 2, camera-routing assertion passes, visual smoke clean on all five, no protected-core edits beyond §4 Phase C authorization, deliverables match prompt. Move to Step 4.
- **Change-request:** issue ONE follow-up Codex prompt (per §8.1 rule 6) naming specific files/lines/issues. Don't patch yourself unless Umair explicitly says so. Codex re-runs.
- **Reject:** if the cream-bleed seam still shows on pilot 2, OR camera transform still snaps to scale-1 at any baseline chapter break, OR the Flip-bridge breaks any unmigrated package, revert and re-prompt with stricter scope. Cream-bleed persistence is the hard rejection criterion.

### Step 4 — phase merge (Claude does this)

When approved:

1. Merge `phase-c-transitions-overhaul` into `main` with `--no-ff` (consistent with Phase A merge `1367e3b` and the Phase B merge).
2. Update `CLAUDE.md`:
   - Protected Areas: confirm `runtime/shared-scene.js` and `runtime/camera-poses.js` (or wherever the pose registry lives) are listed.
   - Per-Video Files: callout for `surface` manifest field, `flipBridge` swap, and pose vocabulary.
3. Update `tools/skill-context.js`:
   - capabilityKits / on-demand: flag `docs/transitions.md`, `docs/shared-scene.md`, `docs/camera-poses.md` as required-read for new authoring.
   - doNotTouch: add the new runtime modules.
4. Update `docs/authoring-api.md` — confirm Codex's append covers §3 manifest schema (`surface`), §5 transitions (`flipBridge`), and pose vocabulary; extend if not.
5. Update `docs/gsap-rules.md` — if a new L0 rule is appropriate (e.g., "carry elements must be Flip-compatible: stable identifiers, no display:none source, no transform-on-source-during-capture").
6. Update `REFACTOR-PROGRESS.md`:
   - Move Phase C out of "active" into a completed entry under §3.
   - Update §1 current state header (active phase = Phase D; last verified-good commit = Phase C merge commit).
   - §2.1: if Phase C's pre-load-iframe rework incidentally fixed the introCard hang, remove the bullet. If not, mark it for Phase C.5 micro-fix (Phase A.5 precedent) and leave it deferred — not a Phase C blocker.
   - Append open questions if any surfaced.
7. Commit `docs: update for phase C completion`.
8. Brief Umair on Phase D kickoff (Phase D is `videos/_shared/blocks/` library + Pixel-Point text-kit completion + helper rollout — needs its own Codex prompt drafted).

### Step 5 — draft Phase D prompt + kickoff pair

Per §8.1 rule 2, every phase boundary requires a pair:

- `docs/codex-prompts/phase-d-blocks-and-text-kit.md` — Codex prompt for Phase D
- `docs/codex-prompts/phase-d-claude-session-kickoff.md` — kickoff for the next Claude session

Draft both based on the Phase D preview in `REFACTOR-BRIEF.md` §2 + `repo-audit-findings.md` §13.4 (block registry) + §6.3 (Pixel-Point parity gap).

Phase D scope:
- `videos/_shared/blocks/` directory — extract `code-card`, `mac-window`, `phone-frame`, `pill`, `arrow`, `route-line`, `hex` from existing videos.
- `videos/_shared/text-kit.js` — round out from 7 of 24 to all 24 Pixel-Point presets (now that SplitText is vendored, Phase A).
- Helper rollout — `popOut`, `glideTo`, `lineDraw` used routinely rather than once-per-video.

Phase D edits NO core (per REFACTOR-BRIEF.md §4: `videos/_shared/blocks/*` new, `text-kit.js`, `docs/postintro-patterns.md` only).

Pause and ask Umair before sending the Phase D prompt to Codex.

### Working notes

- Umair pastes Codex output back to you. You don't drive Codex directly.
- `mumair23` is read-only; never push or open PRs against that account. `23kb` personal account is fine. Local pushes only when Umair says so.
- §8.1 hard rules apply: never paste >30 lines in chat, status replies cap at 15 lines, file paths pinned in prompts, one change-request round trip.
- If your context gets long, write a fresh handoff prompt by updating `REFACTOR-PROGRESS.md` with current state, then end the session.
- If a decision is made that wasn't in the brief, append to `REFACTOR-BRIEF.md` §3 (Architectural decisions).

### Tone

You're the architect, not a cheerleader. State results directly. When something is wrong, say so. When Codex did the right thing, approve and move on.

### Start

Read the eight files in Step 1. Confirm with Umair: "Phase C oversight session ready. Paste Codex's PR response when ready, or tell me where to start if you want a different angle."
