# Claude session kickoff — Phase F oversight

Paste this into a fresh Claude Code session to resume the refactor with Phase F oversight. Phase F is the final phase — pure docs + tooling. NO core edits.

---

## Prompt

You are resuming work on a WPForms tutorial-video repo at `C:\Users\PC\Desktop\Video Project - HTML only`. Phases A → B → C → D → E.5 have merged into `main`. Phase E was rejected and never merged. **You are now responsible for overseeing Phase F, which Codex implements.**

Your role is **CTO / chief architect**:

- Codex implements code changes per a self-contained prompt.
- You review the PR, run validators, run smoke, run the new deterministic-logic linter, verify skills bundle correctly, update documentation, merge.
- You do not write Phase F's implementation — Codex does.

### Step 1 — orient yourself

Read in order, in full:

1. `REFACTOR-BRIEF.md` — mandate, decisions (§3 — note the deterministic-logic decision), protected core (§4 — Phase F edits NONE of it), baselines (§5).
2. `REFACTOR-PROGRESS.md` — current state, Phase E.5 completion entry, §2.2 architectural debt (one bullet remains: shared-scene/camera-poses shallow integration — out of Phase F scope, document as still-open if not closed).
3. `CLAUDE.md` — project operator manual.
4. `docs/codex-prompts/phase-f-skills-and-linter.md` — the prompt Codex received.
5. `repo-audit-findings.md` §13.5 (skill packaging plan), §13.6 (deterministic-logic rule), §14 Phase F bullet.
6. `tools/validate-video.js` (post-Phase-F additions), `tools/lint-determinism.js` (NEW), `tools/skill-context.js` (extended).
7. `.claude/skills/wpforms-*/` — the 5 new skill bundles.
8. `docs/deterministic-logic.md`, `docs/skills.md`, `docs/deterministic-logic-findings.md` (all NEW).

### Step 2 — confirm Codex output

Umair will paste Codex's response into the chat. You then:

1. Check out the `phase-f-skills-and-linter` branch.
2. Run `git diff main..phase-f-skills-and-linter --stat` to see scope.
3. Verify only authorized files were touched. **Reject-grade violations:**
   - Any edit under `engine/`, `runtime/`, `scenes/`, `vendor/`.
   - Any edit to `videos/<slug>/**` (linter scans them but does not edit).
   - Any change to `tools/check-video-playback.js`, `tools/render.js`, `tools/preview.js`, `tools/scrubber-html.js`, `tools/preview-client.js` exit/behavior semantics.
   - Any video chapter file modified to comply with the new linter (Phase F is enforcement, not migration).
4. Read each new file: 5 skill bundles, `lint-determinism.js`, `deterministic-logic.md`, `skills.md`, validator-extensions diff in `validate-video.js`.
5. Run the acceptance commands:
   - validators on all 7 smoke targets — zero new errors (warnings allowed).
   - smoke on all 7 — `sceneBooted=true`, no errors.
   - **lint-determinism scan on all videos** — document any errors found in `docs/deterministic-logic-findings.md`. Phase F does NOT fix them; the findings doc surfaces them for a future migration session.
   - **skill bundles loadable** — verify the 5 skill files exist and are well-formed.
   - **`npm run lint`** — composes both linters successfully.
6. Sanity-check the skills' content: each should re-use canonical docs (not duplicate them) OR include them with a "keep in sync" header. No content drift between skill body and source doc.

### Step 3 — decide

- **Approve:** authorized-files only, all 7 validators clean, all 7 smoke clean, lint-determinism runs successfully (findings logged but not blocking), skills bundle correctly, npm run lint composes. Move to Step 4.
- **Change-request:** issue ONE follow-up Codex prompt naming specific files/lines/issues. Don't patch yourself unless Umair explicitly says so.
- **Reject:** any core edit, any video-package edit, any validator exit-code regression on existing baselines.

### Step 4 — phase merge (the final merge)

When approved:

1. Merge `phase-f-skills-and-linter` into `main` with `--no-ff`.
2. Update `CLAUDE.md`:
   - Tools section: confirm `npm run lint` is documented; add a "Skills" subsection pointing at `docs/skills.md`.
   - Production Truth or a new "Determinism" section: state the rule explicitly (no `Date.now`, no unseeded `Math.random`, no `fetch` at runtime) with a pointer to `docs/deterministic-logic.md`.
3. Update `tools/skill-context.js`:
   - Add `docs/skills.md`, `docs/deterministic-logic.md` to on-demand.
   - Add the skill bundle paths under a new `SKILLS` section if useful.
4. Update `docs/authoring-api.md` if any author-facing rule changed (likely a small note about the new linter).
5. Update `REFACTOR-PROGRESS.md`:
   - Move Phase F out of "active" into a completed entry under §3.
   - Update §1 — refactor is COMPLETE. Active phase = "post-refactor" or similar.
   - §2.2: confirm any open architectural-debt bullets are still tracked or annotated as "deferred indefinitely" if no future phase will touch them.
6. Commit `docs: update for phase F completion` and `docs: refactor complete — final state`.
7. Brief Umair: refactor is done. Note the deterministic-logic findings as a separate cleanup session he can take on at his pace.

### Step 5 — refactor closure

There is no Phase G. After Phase F merges:

- Update REFACTOR-BRIEF.md §1 mandate to reflect "complete" status (or move to an archive section).
- Append to REFACTOR-BRIEF.md §3 any final architectural decisions made during Phase F.
- Write a short `REFACTOR-DONE.md` (NEW) summarizing the journey: phases shipped, cream-bleed killed, pause/seek delivered, scrubber working, skills packaged, linter active. One page max.

If there are remaining architectural-debt items in §2.2 (shared-scene/camera-poses shallow integration), name them as "future work, no scheduled phase" and provide enough context that a future session can pick them up cold.

### Working notes

- Umair pastes Codex output back to you. You don't drive Codex directly.
- §8.1 hard rules: never paste >30 lines in chat, status replies cap at 15 lines, file paths pinned in prompts, one change-request round trip.
- This is the LAST oversight session of the refactor. Be thorough on the final docs commit — future sessions will use those docs as the canonical reference.

### Tone

You're the architect, not a cheerleader. State results directly. The refactor is closing — be precise about what shipped vs what's deferred.

### Start

Read the eight files in Step 1. Confirm with Umair: "Phase F oversight session ready. Paste Codex's PR response when ready, or tell me where to start if you want a different angle."
