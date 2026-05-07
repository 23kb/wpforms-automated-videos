# Codex prompt — Phase F: skill packaging + validator extensions + deterministic-logic linter

Self-contained prompt for Codex. Paste verbatim. Codex must read REFACTOR-BRIEF.md and REFACTOR-PROGRESS.md first.

**Phase F is the final phase of the refactor.** Pure docs + tooling. NO core edits. The scope is: bundle existing docs into installable skills, extend the validator with new lints, ship a deterministic-logic linter.

---

## Context

You are working on a WPForms tutorial-video repo at `C:\Users\PC\Desktop\Video Project - HTML only`. Phases A → B → C → D → E.5 have merged into `main`. **You are starting Phase F on a fresh branch `phase-f-skills-and-linter` from current `main`.**

Read these files in this order before writing any code:

1. `REFACTOR-BRIEF.md` — full mandate, §3 locked decisions, §4 protected core (Phase F edits NONE of it), §5 baselines.
2. `REFACTOR-PROGRESS.md` — current state, Phase E.5 completion entry, §2.2 architectural debt (one open bullet remains: shared-scene/camera-poses shallow integration — out of Phase F scope).
3. `repo-audit-findings.md` §13.5 (skill packaging plan), §13.6 (deterministic-logic rule), §14 Phase F bullet.
4. `CLAUDE.md` (project root) — operator manual.
5. Existing docs that will be re-packaged as skills:
   - `docs/authoring-api.md` (the public contract)
   - `docs/gsap-rules.md` (L0 discipline)
   - `docs/postintro-patterns.md` (postIntro design)
   - `docs/transitions.md`, `docs/blocks.md`, `docs/text-kit.md`,
     `docs/frame-driver.md`, `docs/pause-manager.md`,
     `docs/camera-poses.md`, `docs/shared-scene.md`,
     `docs/render.md`, `docs/preview.md`,
     `docs/helper-rollout-backlog.md`, `docs/effects-library.md`,
     `docs/wpforms-field-state-inventory.md` (canonical reference, not skill body)
6. `tools/validate-video.js` — current validator. Phase F adds new lint passes here.
7. `tools/skill-context.js` — current canonical context dump. Phase F may extend.
8. `runtime/pause-manager.js` (skill content), `videos/_shared/kit.js` (pausableRaf for the linter rule).

The mandate is dual: tutorial videos AND ad-style release videos. Phase F's deliverables are agent-ergonomics (skills) + correctness gates (linter) — they don't change runtime behavior on either side.

## Goal of Phase F

Three deliverables, independent (any can ship without the others):

1. **Skill packaging** — bundle existing docs into 5 installable skills under `.claude/skills/` (or wherever the repo's skill convention places them — confirm with the existing `docs/skill-context.js` pattern):
   - `/wpforms-video` — universal authoring skill. Wraps `docs/authoring-api.md` + `docs/postintro-patterns.md` + storyboarding rules from `CLAUDE.md`.
   - `/wpforms-postintro` — postIntro-only authoring skill. PostIntro patterns + canonical reference list + multi-animation rule.
   - `/wpforms-gsap-rules` — GSAP L0 discipline. Wraps `docs/gsap-rules.md` + `docs/effects-library.md` + `docs/gsap-flip-patterns.md` + Phase B `registerTimeline` rules + Phase E.5 `pausableRaf` rule.
   - `/wpforms-marketing` — editorial / ad-style mode. Surface modes from `docs/transitions.md` (`editorial` / `mixed`), atmospheric kit, text-kit, blocks library.
   - `/wpforms-transitions` — transition vocabulary. `flipBridge`, swap styles, camera poses, frame driver registered timelines, scrubber/render workflow.

   Each skill's body is markdown that re-uses (does NOT duplicate) the source docs. If the repo's skill format requires inlined content, prefer to INCLUDE the canonical doc verbatim with a clear "this content also lives at `docs/<file>.md` — keep them in sync" header. Otherwise prefer `@docs/<file>.md`-style includes if the format supports them.

2. **Validator extensions** — `tools/validate-video.js` gains new lint passes (additive; do NOT change exit codes for existing baselines):

   a. **Audio-vs-duration warning.** Per chapter that uses `mode: 'per-beat-narration'`: for each beat with a `narration` clip, warn if the clip's audio duration (read from the `.mp3` or its sidecar metadata) exceeds the beat's `duration` field by more than 1.5×. Also warn if `duration < 0.6s` for narration beats (rushes the audio).

   b. **`pausableRaf` usage check.** Lint chapter `effect()` bodies and runtime cinematic files for raw `requestAnimationFrame(` calls. Warn-only (some legitimate uses may exist — e.g. paint-anchored gates in scene-helpers). Suggest `pausableRaf` from `videos/_shared/kit.js` as the fix.

   c. **`registerTimeline` paused-precondition check.** Already a runtime warning in `videos/_shared/kit.js`; add a static lint that scans for `gsap.timeline(` calls feeding a `registerTimeline(` call without `paused: true` in the options object.

3. **Deterministic-logic linter** — separate from `validate-video.js`, ships as `tools/lint-determinism.js` (NEW). Scans `videos/<slug>/chapters/**/*.js`, `videos/_shared/**/*.js`, and `runtime/cinematic-*.js` for:

   a. `Date.now(` — fail.
   b. `Math.random(` without an adjacent `mulberry32(` or seeded-RNG call in the same module — warn (some uses are legitimate).
   c. `fetch(` at runtime — fail.
   d. `setTimeout(` outside of `runtime/`, `engine/`, `tools/`, `scenes/`, and `tests/` — warn (chapter authors should use ctx `sleep`).

   Document the rule set in `docs/deterministic-logic.md` (NEW) with rationale: render parity (Phase E `--seek` mode) requires deterministic timeline state.

   Wire `npm run lint` to call both `validate-video.js --all` and `lint-determinism.js`. Existing `tools/check-video-playback.js` exit semantics stay unchanged.

## Why this matters

From REFACTOR-BRIEF.md and Phase 0 audit:

- **Skills:** new agent sessions currently run `node tools/skill-context.js` which is good but produces a long human-readable dump. Skills give topic-scoped, smaller, opt-in context that loads on-demand. Cross-machine consistency.
- **Validator extensions:** audio-vs-duration mismatch was the root cause of the "REST API video felt rushed" lesson in `analysis-quality-and-transitions.md`. Catching it at lint time is cheaper than at visual QC. `pausableRaf` and `registerTimeline` paused-precondition are Phase E.5 / Phase B contract enforcement.
- **Deterministic-logic linter:** REFACTOR-BRIEF.md §3 made deterministic logic an architectural decision (no `Date.now`, no unseeded `Math.random`, no `fetch`). Static enforcement closes the loop. Required for Phase E `--seek` mode render parity.

## Branch

Create branch `phase-f-skills-and-linter` from `main` HEAD (Phase E.5 merge commit + docs).

## Files you may edit

**Phase F edits ZERO protected core** (REFACTOR-BRIEF.md §4):

- `.claude/skills/<name>/SKILL.md` (NEW directory + 5 SKILL.md files — uppercase filename, single file per skill, YAML frontmatter required; format pinned in §"Skill packaging" below).
- `tools/validate-video.js` — additive lint passes only. **Do not change existing exit-code semantics** for any of the 7 regression-set videos. New warnings are fine; new errors must not fire on any existing video that passed pre-Phase-F validation.
- `tools/lint-determinism.js` (NEW).
- `tools/skill-context.js` — flag the new docs and the new skill bundle as on-demand reads.
- `package.json` — extend `lint` script to compose both linters.
- `docs/deterministic-logic.md` (NEW) — rule set + rationale.
- `docs/skills.md` (NEW) — index of available skills + when to use each.
- `REFACTOR-PROGRESS.md` — log decisions encountered mid-phase under "Open questions stack."

## Files you MUST NOT touch

- `engine/*` — entire directory.
- `runtime/*` — entire directory.
- `scenes/*`.
- `vendor/*`.
- All `videos/<slug>/**` — the linter SCANS them but does not edit. No automated migration.
- `videos/_shared/*`.
- All snapshots.
- `tools/check-video-playback.js` exit-code semantics.
- `tools/render.js`, `tools/preview.js`, `tools/scrubber-html.js`, `tools/preview-client.js` — Phase E.5 locked.

## Deliverable details

### 1. Skill packaging

**Format is pinned. Do not propose alternatives.**

```
.claude/skills/<name>/
└── SKILL.md       # uppercase filename — case-sensitive
```

`SKILL.md` is a single file per skill. No separate `meta.yaml`. Required YAML frontmatter:

```yaml
---
name: wpforms-video
description: One-line "when to use this skill" — used to decide relevance.
---
```

Body is markdown after the frontmatter. This is the standard Anthropic skill convention; the case of the filename matters (skills are case-sensitive on the loader side).

For each skill, the body should:

- Open with a 2-3 line "When to use this skill" section.
- Re-use canonical docs (include verbatim or via include-syntax).
- End with a "See also" section linking to the related doc files.

Do NOT duplicate the doc content if the format supports includes — diverging copies become a maintenance burden.

### 2. Validator extensions

In `tools/validate-video.js`, add three new lint passes. Each should:

- Run on every video by default.
- Default to **warn**, not error, unless the rule is universally violated by zero existing videos (in which case error is fine).
- Be skippable via `--skip-lint <rule>` flag for targeted debugging.

For the audio-vs-duration check, read MP3 duration via `ffprobe` (assume available; if not, fall back to a header-only read using a small npm dep — log the choice). The `.txt` sidecar in `videos/<slug>/narration/` may also have hints.

For the `pausableRaf` check, scan `videos/<slug>/chapters/**/*.js` and `runtime/cinematic-*.js` for the regex `\brequestAnimationFrame\s*\(`. Allow the file to opt out via a `// lint-allow: raw-raf` comment on the same line.

### 3. Deterministic-logic linter

`tools/lint-determinism.js`:

```js
// Usage:
//   node tools/lint-determinism.js [--video <slug>] [--all]
//
// Exit codes:
//   0 — clean
//   1 — errors (Date.now, fetch, setTimeout outside allowlist)
//   2 — warnings only (Math.random without seeded-RNG)
```

The allowlist for `setTimeout` is: `runtime/`, `engine/`, `tools/`, `scenes/`, `tests/`. Outside that → warn.

`Math.random` without a `mulberry32` (or any function with `seed`-named arg) in the same module → warn.

`Date.now` and `fetch` → error, no exceptions.

## Acceptance criteria

```bash
# 1. All 7 regression-set videos validate cleanly with the extended linter.
for slug in a-complete-guide-to-the-checkboxes-field wpforms-rest-api-overview creating-first-form build-forms-faster-with-wpforms-ai _phase-c-editorial-pilot form-entries-guide form-notifications; do
  node tools/validate-video.js "$slug" || exit 1
done

# 2. Smoke remains clean on all 7 (no behavior change).
for slug in a-complete-guide-to-the-checkboxes-field wpforms-rest-api-overview creating-first-form build-forms-faster-with-wpforms-ai _phase-c-editorial-pilot form-entries-guide form-notifications; do
  node tools/check-video-playback.js "$slug" --seconds 30 --allow-resource-404 2>&1 | grep -E '"(sceneBooted|bootError|pageErrors|consoleErrors)"'
done

# 3. Deterministic-logic linter runs against all videos.
node tools/lint-determinism.js --all
# Document any failures found in existing videos as findings to address
# in a separate session (NOT this Phase F PR — Phase F does not migrate code).

# 4. Skills are loadable.
ls .claude/skills/wpforms-{video,postintro,gsap-rules,marketing,transitions}/SKILL.md

# 5. npm run lint composes both linters.
npm run lint
```

**Reporting any deterministic-logic violations:** log them in
`docs/deterministic-logic-findings.md` (NEW). Phase F does NOT fix them
— it just exposes them. Migration is a separate session.

## What you do NOT do in Phase F

- Do not edit any protected core.
- Do not migrate any video code (even to comply with the new linter).
- Do not change validator exit semantics for any existing video.
- Do not adopt seek-render as default (REFACTOR-BRIEF.md §3 locked).
- Do not introduce new vendored libraries unless absolutely required for `ffprobe` fallback (log first).

## Reporting back

When done:

1. Commit on `phase-f-skills-and-linter`. One commit per logical step (skills bundle, validator extensions, deterministic linter, docs).
2. Reply to Umair with: branch tip SHA, files changed, validator + smoke output for all 7 targets, the deterministic-logic findings doc with any violations found, list of skills shipped.
3. Do NOT push to remote. Do NOT update `REFACTOR-BRIEF.md` or `CLAUDE.md` — Claude (CTO) does that during phase merge.

## If you get stuck

- **`ffprobe` unavailable on Codex's machine.** Fall back to `mp3-parser` or similar lightweight npm dep, OR skip the audio-vs-duration lint with a `--no-audio-lint` flag and document the gap.
- **The linter flags 50+ violations across existing videos.** Log them; do NOT migrate. Phase F is enforcement; migration is a separate human-driven session.
- **Skill bundle conflicts with `tools/skill-context.js`.** The two are complementary — `skill-context.js` stays the canonical startup dump; skills are topic-scoped opt-ins. Document the relationship in `docs/skills.md`.
