# REFACTOR-BRIEF.md

**STATUS: REFACTOR COMPLETE.** All six phases (A → B → C → D → E.5 → F) merged.
Phase E was rejected at oversight; not merged. See
[REFACTOR-DONE.md](REFACTOR-DONE.md) for the closure summary and
[REFACTOR-PROGRESS.md](REFACTOR-PROGRESS.md) for the per-phase log. Last
verified-good commit: `da06464` (Phase F merge).

This file remains as the historical mandate, locked decisions (§3), and
protected-core list (§4). Future sessions should read it for context, but no
further phase work is scheduled.

---

**Living document. Update at phase boundaries only.** Any session — Claude or Codex — reads this file first to understand the refactor's mandate, scope, decisions, and protected boundaries. Pair with [REFACTOR-PROGRESS.md](REFACTOR-PROGRESS.md) for current state.

---

## 1. Mandate

The system has two equally important jobs and every architectural decision must support both without compromising either:

1. **Tutorial videos with real WPForms UI.** Real product DOM in an iframe, manipulated as a stage with a cursor, highlights, narration, and DOM puppetry. **This is the moat.** No other system can do this with the same fidelity.
2. **Ad-style release / announcement videos.** Editorial DOM compositions (full 1920×1080), atmospheric motion, character cascades, hero lockups, brand-mode marketing pieces. Stripe-style.

If a phase improves tutorial-mode but locks out ad-mode (or vice versa), it is wrong. Surface modes (`iframe` / `editorial` / `mixed`) are the architectural lever for this duality.

---

## 2. Phase plan (overview)

Phases run **A → B → C** in order, then **D / E / F** can parallelize. Each phase ends with a documentation update step (see §6). Each phase is its own branch.

| Phase | What | Why | Transition impact |
|---|---|---|---|
| **0** | Audit + briefing files + frame-level QC of seams | Ground truth for everything below | Diagnosis |
| **A** | Vendor remaining free GSAP plugins, ship `effects.js` registry, codify `gsap.context()` cleanup + `awaitTween` helper | Discipline foundation; all GSAP capabilities available | Foundational (Flip becomes load-bearing in C) |
| **B** | Paused-timeline + Frame Adapter player driver | Eliminates RAF-hang at architectural level; enables scrub preview; required for C | Required for cross-snapshot continuity in C |
| **C** | Cross-snapshot Flip-bridge transition, shared-scene primitive, camera-pose vocabulary, editorial surface mode | Real continuity across snapshot swaps; ad-mode parity | **This is the transition fix** |
| **D** | `videos/_shared/blocks/` library; full Pixel-Point text-kit; helper rollout (popOut, glideTo, lineDraw used routinely) | Stop re-implementing chrome per video | Indirect (better blocks compose into bridge) |
| **E** | Live-reload preview with scrubber; in-repo `tools/render.js` (Puppeteer + FFmpeg → MP4) | Author scrubber; reproducible exports | Tunable transitions visually |
| **F** | Skill packaging (`/wpforms-video`, `/wpforms-postintro`, `/wpforms-gsap-rules`, `/wpforms-marketing`, `/wpforms-transitions`); validator extensions (audio-vs-duration warnings, deterministic-logic linter) | Agents start with right rules loaded | Doc layer for new transition vocabulary |

Phase details (current+next phase only) live in REFACTOR-PROGRESS.md.

---

## 3. Architectural decisions (locked)

Decisions that shouldn't be re-litigated in a future session. Each entry is dated; do not edit, only append.

- **2026-05-07 — GSAP licensing.** As of April 2025 Webflow made all GSAP plugins (former Club: SplitText, MorphSVG, DrawSVG, CustomEase, GSDevTools, MotionPathHelper, ScrollSmoother) 100% free. We use them all. No license process.
- **2026-05-07 — Pixel-Point > raw SplitText for text.** `text-kit.js` stays the authoring surface. SplitText is the splitting primitive used internally only. We round out to all 24 Pixel-Point presets.
- **2026-05-07 — anime.js out.** GSAP covers everything. One canonical animation library.
- **2026-05-07 — Adapters: GSAP (primary), Three.js, Lottie, WAAPI (defensive).** WAAPI adapter exists to pause/seek any CSS animations that snapshot DOM brings in (e.g., admin spinners) so seek-render stays deterministic.
- **2026-05-07 — Snapshots stay static.** No plugin-JS execution at load time. Tried before, broke listeners. Live-WP-in-iframe defeats determinism, version stability, network isolation, boot speed, and Phase B/C/E. If interaction is too painful to puppet, capture a post-interaction snapshot and `swapToSnapshot`.
- **2026-05-07 — Deterministic logic rule.** No `Date.now()` outside the player driver. No unseeded `Math.random()` (use mulberry32). No `fetch` at runtime. Required for Phase E render parity. Linter enforces.
- **2026-05-07 — `runtime/transitions.js` overhaul rather than replace.** Existing chapter-break vocabulary (`dolly`/`softDolly`/`whip`/`hold`/`glide`) is correct. Existing swap styles (`cover`/`fast`/`whip`/`push`/`morph`) stay supported as fallbacks. New `flipBridge` swap added in Phase C.
- **2026-05-07 — Hyperframes seek-render NOT adopted as default pipeline.** Wall-clock + audio-cued/`waitAt(t)`/per-beat-narration are real production features. Seek mode is opt-in via Frame Adapters for editorial layer + render export only.
- **2026-05-07 — `hyperframes/hyperframes-rest-2/` and `hyperframes/wpforms-ai-scene-10/` folders are kept** as reference experiments. Not part of build. Not deleted.

---

## 4. Protected core (do-not-touch by default)

Mirrors `CLAUDE.md`'s do-not-touch list. Phase B and Phase C are explicitly allowed to edit core; everything else is gated.

**Always-protected during normal video authoring:**
- `engine/*` (entire directory)
- `runtime/player.js`
- `runtime/chapter-runner.js`
- `runtime/scene-helpers.js`
- `runtime/transitions.js`
- `runtime/cinematic-runner.js`
- `runtime/cinematic-spec-runner.js`
- `scenes/shared.js`
- `scenes/player.html`
- Existing accepted video packages
- Existing snapshots
- `tools/validate-video.js` validator behavior

**Per-phase authorization:**
- Phase A: `videos/_shared/kit.js`, `videos/_shared/effects.js` (new), `vendor/gsap/<version>/*` (new files only). NO core edits.
- Phase B: ALL of the protected core list above is explicitly editable, with branch-by-branch commits and per-step validation.
- Phase C: Same as B, plus `engine/engine.js` for "load to hidden iframe" capability.
- Phase D: `videos/_shared/blocks/*` (new), `videos/_shared/text-kit.js`, `docs/postintro-patterns.md`. NO core edits.
- Phase E: `tools/preview.js` (new), `tools/render.js` (new), `serve.js` (extend). Possibly `package.json`. NO core edits.
- Phase F: `.claude/skills/*` (new), `tools/skill-context.js`, `tools/validate-video.js`. NO runtime edits.

---

## 5. Known-good baselines (regression set)

Every phase merge MUST regress on all four. If any breaks, the phase isn't done.

- `a-complete-guide-to-the-checkboxes-field` — modern tutorial, exercises everything (selector validation, prep ops, descriptor mode, postIntro cinematic).
- `wpforms-rest-api-overview` — cinematic-heavy, exercises Three.js, atmospheric layers, multi-chapter shared scene.
- `creating-first-form` — simplest tutorial, sanity check.
- `build-forms-faster-with-wpforms-ai` — best postIntro to date, mix of tutorial + cinematic.

**Validation commands per phase merge:**
```bash
for slug in a-complete-guide-to-the-checkboxes-field wpforms-rest-api-overview creating-first-form build-forms-faster-with-wpforms-ai; do
  node tools/validate-video.js "$slug"
  node tools/check-video-playback.js "$slug"
done
```

**Visual QC is owned by Umair, not by Claude or Codex.** Agents run validators + smoke tests + diff review. Visual QC of playable URLs is a human task — agents do not screen-record, frame-extract, or open headed browsers to verify visual quality, because token cost is high and Umair already does this faster locally. The Phase 0 ffmpeg QC was a one-time diagnostic; not a per-phase pattern. Exception: if a phase introduces a *new* visual primitive that has no validator coverage, agents may capture one short clip for archival, but only when explicitly approved.

---

## 6. Documentation cadence

**Update at the end of each phase, not during, not only at the very end.**

Phase X is **not done** until:

1. All Codex PRs merged and validators pass.
2. `REFACTOR-PROGRESS.md` updated with what shipped, current branch, last-known-good commit.
3. `CLAUDE.md` updated if any rule changed (protected-core list, default authoring mode, etc.).
4. `tools/skill-context.js` updated if a new doc/tool became required-read.
5. `docs/authoring-api.md` updated if the public authoring contract changed.
6. `docs/gsap-rules.md` updated if discipline rules evolved.
7. New `docs/<name>.md` for any pattern that became first-class.
8. Commit `docs: update for phase X completion`.

Claude (CTO) owns this checklist. Codex implements; Claude documents what Codex shipped.

---

## 7. Authoring quality gates (lessons from analysis-quality-and-transitions.md)

These are storyboard-stage rules, surfaced in Phase F skills. Ignoring them produces "PowerPoint" videos.

- **Topic-specific visual concept per chapter.** Every chapter must have an angle, not a default editorial template. The first cut of REST API failed because chapters reused centered-card + typewriter + fade.
- **Data canon document.** Any video that shows IDs, counts, or example data must declare them once and reuse. Reconciles snapshots across chapters.
- **PostIntro is concept, not title-card-redux.** 8–15 seconds, ≥5 distinct phases, ≥1 cursor interaction with editorial DOM, hands off into chapter 1.
- **Stage CSS hides leak surfaces.** `injectStageCss` must hide `.mesh-bg`, `.stage`, `.mac-frame`, `.mac-chrome`, `.watermark`, `#wpf-watermark` for editorial-mode videos to prevent cream-bleed.
- **BGM-only mode preferred for cinematic-heavy videos** when `per-beat-narration` makes audio dictate cadence. Tutorials still default to per-beat.

---

## 8. Workflow

- **Claude (this assistant)** = CTO / chief architect. Reads REFACTOR-BRIEF.md + REFACTOR-PROGRESS.md at session start. Plans phases, drafts Codex prompts, reviews Codex output, runs validators, updates docs, owns phase merges.
- **Codex** = IC / implementer. Receives self-contained prompt with phase + step + files-to-touch + acceptance criteria + validation commands. Doesn't write docs.
- **Umair** = product owner / approver. Reviews proposals, sends Codex prompts, pastes Codex output back to Claude.

**Session protocol:**
- Start: read REFACTOR-BRIEF.md (this file) + last 200 lines of REFACTOR-PROGRESS.md + CLAUDE.md.
- During: log decisions to REFACTOR-PROGRESS.md as they're made.
- End: append progress entry; if a decision was locked, append to §3 above; commit both.

**Branch strategy:** independent branches per phase (`phase-a-gsap-vendor`, `phase-b-player-driver`, `phase-c-transitions`). Easier to bisect.

---

## 8.1 Session output rules (HARD RULES — non-negotiable)

Violations waste tokens, break the handoff chain, and force re-do work. These apply to both Claude oversight sessions and Codex.

1. **Never paste long content into chat.** Anything > 30 lines (prompt drafts, docs, code patches, specs) is a **file**, not a chat reply. Use the Write tool. Reply in chat only with: file path + line count + 3-5 bullet summary + open questions.

2. **Phase boundaries require a pair of files, both committed.** Every phase-X completion produces both:
   - `docs/codex-prompts/phase-<N>-<name>.md` — Codex prompt for the next phase
   - `docs/codex-prompts/phase-<N>-claude-session-kickoff.md` — Oversight kickoff for the next Claude session

   Both must be **written, committed, and pushed** before claiming the boundary is done. Untracked or in-chat-only counts as not done.

3. **No "draft pasted for review" pattern.** Save the file, commit it, then in chat: "drafted at `<path>`, X lines, key open questions A/B/C — review and tell me what to change." The reviewer reads the file, not the chat.

4. **Status replies cap at 15 lines.** If you need more, you're conflating doing with explaining. Save the explanation to `REFACTOR-PROGRESS.md` and link.

5. **Pin file paths in prompts; don't make Codex hunt.** "Find the file via the manifest reference" is a leak — the prompt-writer looks it up and pins the absolute path. Codex hunting wastes more tokens than the lookup.

6. **One change-request round trip.** If review flags issues, fix all of them in one revision, save, commit, reply "fixed A/B/C; see `<path>`." Don't ask "fix A?" then "fix B?" — batch.

---

## 9. Out of scope

For this refactor — flag if reconsidering.

- Replacing the iframe surface with canvas-based capture (e.g., html2canvas, html-in-canvas).
- React/TSX rewrite. Repo is HTML/JS-first. Stays.
- Remotion / Cavalry / Motion Canvas / Revideo. Wrong input model.
- Running full WPForms plugin JS at snapshot load time (see §3 decision).
- ScrollTrigger, Observer, Draggable, Inertia, Pixi (videos aren't scrollable/interactive/physics-y).
- Anime.js (GSAP covers it).

---

## 10. Reference files (read on demand)

- `repo-audit-findings.md` — full architectural audit (Phase 0).
- `analysis-quality-and-transitions.md` — REST API video lessons (Phase 0 input).
- `future-enhancements.md` — pre-refactor enhancement plan, superseded by this brief but useful context.
- `docs/authoring-api.md` — current public authoring contract.
- `docs/gsap-rules.md` — L0 discipline rules.
- `docs/postintro-patterns.md` — postIntro design.
- `tools/skill-context.js` — canonical context dump for new sessions.

---

End of REFACTOR-BRIEF.md. For current state, see REFACTOR-PROGRESS.md.
