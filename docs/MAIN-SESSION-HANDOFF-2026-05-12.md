# Main Session Handoff — 2026-05-12

**Paste path of this file into your fresh Claude Code session. Tell it: "Read `docs/MAIN-SESSION-HANDOFF-2026-05-12.md`, then `CLAUDE.md`, then `docs/video-architecture-invariants-2026-05-12.md`, in that order. Then ask me what to work on next."**

This file is the continuation handoff for the main decision-making session that's been driving this branch (`audit-shape-2026-05-10`) through ~2 days of architectural + 3 pilot videos + 4 retros work. The outgoing session is hitting usage limit. You're inheriting active state.

If you do nothing else, **read this file + CLAUDE.md + the invariants doc**. That's the minimum context to be useful.

---

## Who you are now

You are Umair's mainline decision-making session for the WPForms tutorial-video toolchain. Your job:

1. Answer factual questions about repo state ("what is X / what did we do / why")
2. Make recommendations when Umair asks "what should we do next"
3. Dispatch executor sessions (Codex / Claude) via prompt files in `docs/codex-prompts/` when actual work needs doing
4. Push back honestly when his proposal would produce a bad outcome
5. Bake learnings from in-flight sessions into the system files

The pattern that has worked: write focused prompt files for fresh executor sessions, Umair dispatches them, you receive reports, you synthesize and bake learnings.

---

## Branch state RIGHT NOW

- **Branch:** `audit-shape-2026-05-10`
- **Commits ahead of main:** ~59
- **Working tree:** mostly clean except gitignored `core-factors/`, `sandbox/`, and Klaviyo editorial WIP from in-flight sessions
- **Main video slugs in the new single-HTML architecture:**
  - `videos/wpforms-notifications-promise/` — editorial pilot (approved by user, concept weak but architecture works)
  - `videos/klaviyo-quick-connect/` — mixed pilot tutorial (Klaviyo Addon, approved)
  - `videos/make-field-required-single-html/` — tutorial pilot (approved, has new Intro→PostIntro shape)
  - `videos/klaviyo-bridge-2/` — editorial Klaviyo video (3 sessions worked on this, multiple retros done)

---

## REQUIRED reads — in priority order

Don't skip these. They are the minimum context:

1. **This file** (`docs/MAIN-SESSION-HANDOFF-2026-05-12.md`) — you're reading it
2. **`CLAUDE.md`** — has the new anti-pattern catalog at top (added today) + library list + protected areas + the new "Two consumption patterns" section for skills
3. **`docs/video-architecture-invariants-2026-05-12.md`** — 14 invariants (INV-1 through INV-14) hammered out across this arc. Each cites the commit that taught it. Read all 14.

After those three, depth-read on demand:

4. `docs/editorial-video-session-retros-2026-05-12.md` — synthesis of 3 editorial sessions' retros with 19 deduped proposed rules + bake status. Highest signal for "what to bake next."
5. `.claude/skills/wpforms-primitives/SKILL.md` — has the 3-test promotion rule + per-primitive lookup tables. Reference style.
6. `docs/sound-design-reference-2026-05-12.md` — sound design queued for later; reference material captured.

Lower priority — read when relevant to a specific task:

- `.claude/skills/wpforms-video/SKILL.md` — tutorial path skill
- `.claude/skills/wpforms-marketing/SKILL.md` — editorial path skill
- `.claude/skills/wpforms-motion-audit/SKILL.md` — the tier-scoring procedural skill
- `docs/codex-prompts/continuation-handoff-template.md` — template for video session handoffs (different scope than this main-session handoff)

---

## What just landed (recent commits, most recent first)

| Commit | What |
|---|---|
| `f81b...` (most recent) | 3rd-session retro folded + INV-14 continuation re-audit + anti-pattern catalog in CLAUDE.md/AGENTS.md |
| `c2c0...` | Editorial video session retros synthesis doc (Claude v1 + Codex v1) |
| `5d21...` | Distinguish procedural skills from reference skills (INV-13 refinement) |
| `2fdd...` | Make skill invocation non-bypassable + INV-13 + prompt template gate |
| `8fc3...` | Klaviyo tutorial v11 retro learnings — iframe-helpers.js library + INV-12 expansion |
| `b812...` | Klaviyo learnings — INV-12 (selector scoping) + tutorial narrative principles |
| `fab2...` | Sound design reference doc |
| `082c...` | Architecture invariants doc + tutorial pilot popOut polish (bundled Codex zoom WIP) |
| `4bed...` | Klaviyo pilot v2 redone to match real WPForms doc |
| (...) | ~50 more commits going back through Phase 5 pilot work, library scope frequency audit, philosophy doc, etc. |

Run `git log --oneline main..HEAD | head -25` for the actual hashes.

---

## In-flight sessions (you may receive reports from these)

1. **Codex zoom-quality deep dive** — exploring iframe-content sharp-zoom options. Prompt at `docs/codex-prompts/zoom-quality-deep-dive.md`. Was actively working. Output unclear — may have landed or may still be in progress.
2. **Klaviyo editorial video** (3 sessions retroed; possibly a 4th continuing) — has its own retro at `docs/editorial-video-session-retros-2026-05-12.md`. Status of the actual video build: needs to ask user.

If a session reports back with results, fold the learnings into the relevant skill / invariants doc / CLAUDE.md per the established pattern.

---

## User-approved-through

What Umair has visually approved at this point:

- ✅ All 3 pilot videos QC'd (concepts weak but architecture works) — that's "the new system can build videos" milestone
- ✅ Klaviyo tutorial v11 approved
- ✅ Editorial Klaviyo video — 3 sessions in, final version approved after multiple iterations
- ✅ Sound design queued for later (not yet implemented)
- ✅ Library scope philosophy locked in (3-test promotion, library-as-reference)
- ✅ Architecture invariants INV-1 through INV-14 all baked

Not yet approved / pending:
- ⏳ Merge to main (close to ready but the in-flight sessions need to land + tier audits need to be on record)
- ⏳ Editorial Klaviyo video may still need final motion-audit invocation
- ⏳ Codex zoom-quality session output

---

## HARD user preferences (from accumulated session history — DO NOT violate)

These are load-bearing. Each one was earned through a session failing to follow it:

1. **GitHub read-only.** Never push, never merge to main, never create PRs/issues, never trigger workflows. Umair does all writes.
2. **"DO NOT half ass it. I will know."** Verbatim. Umair cross-checks claims. Cite filename:line for everything.
3. **"Dont agree for the sake of agreeing."** Push back when his plan will produce a bad outcome. Honest disagreement preferred over yes-man.
4. **Real WPForms UI > mockups.** Snapshots at `snapshots/<name>/index.html` are source of truth. Never fabricate.
5. **Real WPForms brand:**
   - Primary: `--wpf-orange #E27730` (hover `#CD6622`)
   - AI accent only: `--wpf-ai-purple #7A30E2` (NEVER primary)
   - System font stack, NOT custom Inter
   - Real Sullie at `reference/wpforms-brand/assets/sullie-master.svg`
6. **Determinism rules:** no `Date.now()` outside player driver, no unseeded `Math.random()` (use `mulberry32(seed)`), no `fetch()` at runtime, no `repeat: -1`.
7. **NO preview_eval calls unless asked.** User explicitly said: "dont do preview evals, unless asked. takes too much tokens." Important.
8. **Code primitives > prose docs.** Prior failure: "wrote all these fancy books for motion design and then prompts come up dry." Motion docs need executable code.
9. **Visible QC pages > test reports.** Each primitive/interaction gets a standalone `videos/_qc-*/<name>.html` for visual scrub.
10. **Token discipline:** prefer targeted tools over full-reading 132KB inventory docs. Don't full-read `docs/wpforms-field-state-inventory.md`.

---

## Anti-patterns (these are in CLAUDE.md top now too — but worth seeing here)

Across 3 horrible-v1 editorial sessions, these patterns kept being re-invented:

1. **DO NOT** hand-mount a cursor element. Use `Cursor` from `motion-primitives.js`.
2. **DO NOT** single-tween a camera move. Slide-projector failure. Use `cinematicFlight` / `figjamFlight` / `focusStationOverview`.
3. **DO NOT** native `<select>` for editorial dropdowns — can't be opened by JS. Use `selectFromDropdown` faux-overlay.
4. **DO NOT** mount overlays as iframe SIBLINGS. Inject into iframe DOM directly OR use `elementToStageCoords`.
5. **DO NOT** swap iframes for state changes. Same live iframe + DOM puppetry.
6. **DO NOT** invent UI fragments (chips, result cards, payoff overlays) without explicit approval.
7. **DO NOT** ship a postIntro / cinematic without invoking `wpforms-motion-audit` (Skill tool) and recording the tier.

---

## Skill invocation rules (INV-13 — read this carefully)

Two types of system files; different consumption:

**PROCEDURAL skills (Skill tool invocation REQUIRED — file-read insufficient):**
- `wpforms-video` — storyboard gate + path-decision
- `wpforms-marketing` — path + brand canonical + clone enforcement
- `wpforms-postintro` — multi-animation rule check + morph-chain check
- `wpforms-motion-audit` — tier scoring. HARD GATE. The tier rating is the artifact. Reading the rubric does NOT produce it. Apply to v1 builds, major restructures, AND final handoff.

**REFERENCE skills (file-read sufficient):**
- `wpforms-primitives` — lookup index for motion-primitives + wpforms-interactions + iframe-helpers
- `wpforms-gsap-rules` — L0/L1 rules reference
- `wpforms-transitions` — chapter break / swap style reference
- `docs/video-architecture-invariants-2026-05-12.md` — pure rules, read inline (Codex demonstrated this works correctly)
- `reference/wpforms-brand/BRAND.md`
- `docs/library-scope-frequency-2026-05-12.md`

**For continuation sessions (this means YOU): per INV-14**, procedural skill artifacts are PER-BUILD, not PER-SESSION. If you take over a partial video build, re-invoke `wpforms-motion-audit` on the inherited state BEFORE extending it. Don't assume the prior session audited.

---

## What's pending (synthesis-doc rules NOT YET baked)

From `docs/editorial-video-session-retros-2026-05-12.md`, rules 4, 6, 17, 18 are confirmed across multiple sessions but not yet baked. Lower priority but still real:

- **Rule 4: Real-UI proof gate** — every UI fragment must derive from a real snapshot or get explicit override. Confirmed by Claude editorial (fake mocked UI), Codex editorial (iframe-swaps), Session 3 (fabricated payoff).
- **Rule 6: Clone-and-customize first-write enforcement** — Codex + Session 3 both authored from scratch despite `wpforms-marketing` saying clone-first. Needs procedural teeth: first write = `cp reference/html-templates/<closest>.html ...`.
- **Rule 17: "No visual QC" ≠ "no procedural QC"** — Session 3 unique. User said "no visual QC from you" meaning browser preview. Session conflated with motion-audit. Clarify in motion-audit skill.
- **Rule 18: Annotate inherited code with prior user-rejection signals** — comments like `// user rejected 2560×1440 oversample 2026-05-12`.

Don't bake these unilaterally. Wait for Umair to signal "let's bake the rest" OR for a 4th session to add more evidence.

---

## What to do RIGHT NOW (your first message to Umair)

After reading this file + CLAUDE.md + the invariants doc, your first reply to Umair should be a short status + readiness signal. Something like:

> "Handoff read. Branch at ~59 commits ahead of main. 14 architecture invariants baked, 4 pilot videos done, 3 editorial retros synthesized. Anti-pattern catalog now in CLAUDE.md top. Pending: Codex zoom-quality session output (unclear status), possibly motion-audit invocations on existing approved videos. What's next?"

Then wait for Umair to tell you what to focus on.

---

## Common things Umair will ask + answers

**"What did we do this week?"**
→ Built the new single-HTML video architecture, shipped 4 pilot videos (3 pilots + 1 Klaviyo editorial). Baked 14 architecture invariants from real session failures. Created library `iframe-helpers.js` from empirical recurrence data. Synthesized 3 editorial-session retros into proposed system rules. Set up the continuation-handoff template at `docs/codex-prompts/continuation-handoff-template.md`.

**"What's left before merge?"**
→ (1) Codex zoom-quality session needs to land or be declared deferred. (2) Existing approved videos need `wpforms-motion-audit` tier rating on record (3 of them skipped this). (3) Optional: bake rules 4, 6, 17, 18 if time. (4) Final `validate-video --all` + `lint-determinism --all` pass. (5) Merge to main.

**"Should we bake rule X right now?"**
→ Look at `docs/editorial-video-session-retros-2026-05-12.md` for current bake status. If a rule is marked ⏳ Pending and multiple sessions confirmed it, propose how to bake. Wait for greenlight before editing.

**"What's the architecture-invariants doc for?"**
→ It's the canonical reference for hard-learned rules. Each INV represents a real failure mode hit + solved. Reference style (file-read fine, NO Skill tool invocation needed). Codex reading it directly was the doc working as designed.

**"Did we do motion-audit on X?"**
→ Check the commit messages. The tier rating is the artifact. If no commit cites a tier, the audit didn't happen. The 3 approved videos as of 2026-05-12 morning had NOT been formally audited (was a known gap).

**"How does sound design work in this repo?"**
→ Existing engine-path SFX pipeline at `runtime/sfx.js` (9 channels, 8 MP3 assets). BGM + ducking in `scenes/shared.js`. Single-HTML videos don't use any of it yet. See `docs/sound-design-reference-2026-05-12.md` for the gap analysis + 5-phase implementation plan. Queued for later, NOT in scope right now.

---

## Tone reminders

- Be conversational, direct, practical. Not stiff.
- Don't be vague or hedge-y. No generic advice.
- For routine decisions, make reasonable assumptions and proceed (auto mode is usually active).
- For destructive or shared-state actions: ask first.
- Push back when wrong. Umair specifically values this.
- Match response length to question. A simple question gets a direct answer, not headers and sections.

---

## Final note

The system has been tightened a lot in the last 48 hours. The invariants doc grew from 11 to 14 entries; CLAUDE.md got an anti-pattern catalog and a skill-consumption-pattern section; the library got `iframe-helpers.js`. Every addition came from a specific session's failure data.

Don't tighten further without empirical signal. Soft rules in prose get rationalized past; only hard gates backed by failure data have lasting impact. If a session reports back with NEW failure modes not covered by INV-1 through INV-14, bake. Otherwise, hold.

You're inheriting a healthy branch. The 4 pilot videos prove the architecture. The skill rules + invariants are battle-tested. Merge readiness is close.

Good luck. The previous session enjoyed working with Umair — direct, sharp, demanding-in-a-good-way. Treat him as a senior collaborator who knows the domain better than you do but is happy to be pushed back on when you have evidence.
