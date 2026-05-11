# Klaviyo Tutorial Video — Continuation Session

**Paste into a fresh Claude or Codex session.** This continues `videos/klaviyo-quick-connect/` — a single-HTML tutorial video that walks the viewer through the WPForms Klaviyo Addon doc end-to-end. The first pass (v2 at commit `4bed640`) is committed; this session adds the proper video shape (Intro → PostIntro → Tutorial → Outro), wires in real Klaviyo snapshots once captured, and fixes the cursor-top-left bug.

You are at `C:\Users\PC\Desktop\Video Project - HTML only` on branch `audit-shape-2026-05-10`. User is Umair — direct, "DO NOT half ass it. I will know." Cite `filename:line` for everything.

## ⛔ REQUIRED SKILL INVOCATIONS — DO THIS BEFORE ANY CODE

This prompt is the brief. The skills are the gates. Both apply. Reading skill markdown files inline does NOT trigger the skill — use the Skill tool to actually invoke each:

1. **`wpforms-video`** — at session start. Storyboard gate + tutorial shape rule + production-truth rules.
2. **`wpforms-postintro`** — before designing any postIntro morph chain. Multi-animation rule + morph-chain requirement.
3. **`wpforms-gsap-rules`** — before writing any timeline beat. L0 discipline + boundedRepeats.
4. **`wpforms-primitives`** — before building any helper. Check if it already exists in motion-primitives.js / wpforms-interactions.js / iframe-helpers.js.
5. **`wpforms-motion-audit`** — before declaring postIntro / cinematic done. HARD GATE. Record the tier (S/A/B/C/D/F). Tier B or below requires fix or explicit Umair override.

The previous Klaviyo session shipped a postIntro after 12 iterations without ever invoking `wpforms-motion-audit`. Don't repeat that. The tier rating is non-optional.

## Source of truth (READ FIRST)

1. **The actual WPForms doc this video teaches** — `C:\Users\PC\Desktop\klaviyo\Klaviyo Addon 5 - WPForms.pdf` (9 pages). The tutorial must follow its 4 major sections in order:
   - Connecting WPForms to Klaviyo (Settings → Integrations → Klaviyo → Add New Account)
   - Generating your Klaviyo API Key (on Klaviyo's dashboard)
   - Finishing the Connection in WPForms (paste key, nickname, Connect)
   - Adding a Klaviyo Integration to Your Form (Marketing tab → Add New Connection → settings panel)

2. **Current state of the video** — `videos/klaviyo-quick-connect/index.html` + `videos/klaviyo-quick-connect/storyboard.md`. Has the 4 sections wired with mock cutaways for Klaviyo-side surfaces (no real snapshots existed at v2 time). ~73 seconds, single-HTML, uses IframeManager + Cursor + WPFormsInteractions.

3. **Architecture invariants** — `docs/video-architecture-invariants-2026-05-12.md`. 10 hard rules (INV-1 through INV-10) hammered out across this session's debugging. Read all 10. Don't break any.

4. **Library philosophy** — `.claude/skills/wpforms-primitives/SKILL.md`. The 3-test promotion rule. Default to inline DOM for one-offs; promote only after recurrence proven across 3+ videos.

5. **Library scope frequency audit** — `docs/library-scope-frequency-2026-05-12.md`. Tells you which existing library methods earned status (Wave 2 Batch A retrospective).

## The new shape — Intro → PostIntro → Tutorial → Outro

Umair's instruction (verbatim):

> "the shape of the tutorial video needs to be like this:
> Intro
> postIntro -> animated stuff about the video
> then the tutorial starts."

This is the standard WPForms tutorial video shape (also used by legacy engine-path videos like `build-forms-faster-with-wpforms-ai`). The current `klaviyo-quick-connect/index.html` jumps straight from a single-card intro into Chapter 1. Restructure to:

### Section A — Intro (~3 seconds)
- Brand title card: video name + subtitle
- Sullie logo
- "WPForms" wordmark
- Brief fade-in → settle → fade-to-postIntro

### Section B — PostIntro (~10-15 seconds, animated, cinematic)
- The "what you'll learn" beat. Animated, brand-feel, sets emotional tone.
- For Klaviyo specifically, a strong concept beat would be:
  - **Identity-continuity morph**: a form submission visual → flowing/morphing into a Klaviyo profile card → expanding into a list / audience visualization
  - Use motion-primitives: `cinematicFlight` for camera, `caretType` for typed elements, `statusPillMorph` for the "Form submitted" → "Profile created" → "Added to list" beat sequence, `fieldStaggerReveal` for the audience cascade
  - Reference: `reference/html-templates/wpforms-ai-prompt-open.html` for the identity-continuity pattern (single DOM element threading the beats)
- Required by CLAUDE.md "Pure editorial / ad-style" path rule + `.claude/skills/wpforms-postintro/SKILL.md` HARD-GATE
- DO NOT cap the postIntro at a single primitive — multi-animation rule per wpforms-postintro skill

### Section C — Tutorial proper (~55-70 seconds, real product UI)
- This is the current v2 content (4 sections from the doc, mockups for Klaviyo + form-builder dialog surfaces).
- After this session captures real Klaviyo snapshots (see "snapshot pickup" below), swap mockups for real `IframeManager.load()` calls.

### Section D — Outro (~5 seconds)
- "Connected. Every submission → Klaviyo profile." card
- Sullie wave + brand sign-off (already in v2)

Total target: ~75-90 seconds.

## Snapshot pickup

Umair is capturing the 6 missing Klaviyo dashboard snapshots via the SingleFile Chrome extension + the Klaviyo form-builder dialogs:

**Klaviyo dashboard (6 snapshots, on Klaviyo's site):**
1. `klaviyo-dashboard` — Welcome panel + sidebar
2. `klaviyo-dashboard-account-menu-open` — account name clicked, menu visible
3. `klaviyo-settings-account` — Settings → Account tab
4. `klaviyo-api-keys` — API Keys page (Public + Private sections + Create button)
5. `klaviyo-api-keys-create-form` — Create Private API Key form (Name + Access Level + scopes)
6. `klaviyo-api-keys-private-confirmation` — Post-create dialog with key + copy/download

**WPForms form-builder dialogs (likely 2-3 snapshots):**
- Klaviyo Connection settings panel with Select Account + Action To Perform dropdowns visible
- Connection nickname popup (the "Enter a connection nickname" modal)
- Possibly Klaviyo Connection panel with action variations (Create/Update Profile, Unsubscribe, Remove from List)

When Umair delivers the .html files:
1. Place them at `snapshots/<slug>/index.html`
2. Run `node tools/generate-snapshot-catalog.js <slug>` for each
3. Update `snapshots/index.json` if needed
4. Test load via `IframeManager.load(slug)` in the QC preview

Until snapshots arrive, the v2 mockups are valid placeholders. Don't strip the mockup CSS — it becomes the **editorial fallback** for the editorial version (see "two video types" below).

## Two video types — focus only on the tutorial here

Umair's instruction (verbatim):

> "Klaviyo addon needs 2 types of videos. One is this tutorial we're building, the other one is editorial, full flashy ad-style video."

THIS SESSION builds the TUTORIAL only. The editorial Klaviyo video is a separate future deliverable. **Do not split focus.** If you find yourself building a glossy ad-style version, stop — that's the other video.

Tutorial qualities:
- Narration-driven (captions for now, MP3s later via `node tts/generate.js`)
- Step-by-step pacing, viewer follows along
- Real product UI dominant (mockups only where no snapshot exists)
- ~75-90s total

Editorial qualities (for the OTHER video, not this session):
- Motion-heavy, brand-forward, fast cuts
- Less product UI, more morph-chain story
- No captions or minimal captions (atmosphere carries it)
- ~20-30s

The current v2 mockups (Klaviyo cutaway, nickname popup, settings panel) are perfectly suited for the editorial version — they're stylized brand-forward. Keep them in place for the editorial follow-up.

## Open bug — cursor goes to top-left

Umair reported during v2 visual QC: "cursor keeps going to top left."

Investigation lead: probable cause is `elementToStageCoords(el)` returning `(0, 0)` when:
- The queried element doesn't exist in the current snapshot (returns null → glide defaults to 0,0)
- Iframe scrollY is unexpected (cursor coord is computed off the visible rect)
- Cutaway mock is shown but `Cursor` element is still being asked to glide to iframe coords that don't make sense behind the cutaway

Files to inspect:
- `videos/klaviyo-quick-connect/index.html` lines 350-480 (Chapter 3 + Chapter 4 cursor.glide calls)
- `videos/_shared/motion-primitives.js` Cursor class — verify glide's behavior when given falsy point
- `videos/_shared/wpforms-interactions.js` IframeManager `elementToStageCoords` — verify what it returns on null/missing element

Repro: open `http://localhost:56480/videos/klaviyo-quick-connect/index.html` and watch cursor. Note the EXACT moment(s) it jumps to top-left. Correlate with the chapter / line in `play()`.

Fix should:
- Guard `cursor.glide(null)` to no-op + warn instead of moving to (0,0)
- Or guard `elementToStageCoords(missing)` to return current cursor pos (no-op) instead of (0,0)
- Library-level fix preferred (helps all videos), not per-pilot patch

## Architecture invariants (DO NOT BREAK)

From `docs/video-architecture-invariants-2026-05-12.md`. Re-read before writing any code.

The relevant ones for this work:
- **INV-1**: Stage at native, no transform. The v2 already removed fitStage; don't reintroduce it.
- **INV-2**: Iframe at native, single direct camera transform. If you add zoom in the postIntro, apply transform DIRECTLY to the iframe — never to a parent.
- **INV-3**: Mac frame is outer chrome only. The intro/postIntro should NOT have the mac frame (per Umair's note that final videos have Mac frame "except intro and postIntro").
- **INV-4**: Cursor lives in stage-local coord space. After postIntro → tutorial transition, ensure cursor is positioned correctly.
- **INV-5**: Don't hardcode field IDs across snapshots. Use class-based selectors.
- **INV-6**: Use smoothScrollIntoView before cursor glide if target may be off-viewport.
- **INV-7**: Library is reference. Inline DOM is normal. Don't add new `WPFormsInteractions` methods speculatively.
- **INV-8**: `pointer-events: none` on iframe at rest.
- **INV-9**: Determinism — no Date.now / unseeded random / fetch / repeat: -1.
- **INV-10**: Real brand — orange `#E27730` primary, no purple, system font, real Sullie SVG.

## Concrete build plan

### Phase 1 — Investigate cursor bug (~30 min)
1. Open v2 in preview, scrub through Chapter 3 and 4. Note exact frame where cursor jumps.
2. Inspect Cursor class glide implementation in motion-primitives.js. Find null-handling.
3. Inspect IframeManager.elementToStageCoords in wpforms-interactions.js. Find missing-element behavior.
4. Fix at library level: add a null/NaN guard so `cursor.glide(missing)` no-ops with a console warn.
5. Commit: `fix(Cursor/IframeManager): no-op glide on null element instead of jumping to origin`

### Phase 2 — Restructure to Intro → PostIntro → Tutorial → Outro (~2 hours)

#### Intro (3s)
- New beat at top of `play()`. Brand title card without mac frame.
- "Klaviyo Addon" + sub "Connect WPForms to Klaviyo"
- Fade in (0.7s), hold (1.6s), fade out (0.4s)
- Brand orange wordmark + Sullie

#### PostIntro (10-15s)
- Concept beat that previews the workflow without showing real product UI yet.
- Recommended morph chain (single element threading the beats):
  - **Phase 1**: Form on screen → form submit button glows orange
  - **Phase 2**: Submit button morphs into a "submission" pill that flies toward
  - **Phase 3**: A Klaviyo profile card materializes (use Klaviyo's brand black `#1A1A1F` + clean card)
  - **Phase 4**: Profile expands into a list of 3 profiles (audience cascade via fieldStaggerReveal)
  - **Phase 5**: Camera pulls back; cinematic land into the tutorial setup
- Use motion-primitives: `caretType`, `statusPillMorph`, `cinematicFlight`, `fieldStaggerReveal`
- 8-15s per `wpforms-postintro` skill multi-animation rule
- NO mac frame around this section per Umair

#### Tutorial (current v2 content, lightly restructured)
- Once postIntro lands, mac-frame fades IN around the iframe area for the tutorial proper
- Chapter 1: WPForms → Settings → Integrations → Klaviyo
- Chapter 2: Klaviyo dashboard cutaway (or real snapshots once delivered)
- Chapter 3: Paste API key → Connect → Connected state
- Chapter 4: Form builder → Marketing → Klaviyo → Add New Connection
- Chapter 5: Connection nickname popup → Settings panel (or real snapshots)

#### Outro (5s)
- Mac frame fades OUT
- Editorial outro card: "Connected. Every submission → Klaviyo profile."
- Sullie wave

### Phase 3 — Wire real snapshots when delivered (~30 min per snapshot)

When Umair drops the captured .html files:
1. Place at `snapshots/<slug>/index.html`
2. `node tools/generate-snapshot-catalog.js <slug>` for each
3. Update the index registration
4. Replace mockup cutaway with `IframeManager.load(slug)` in the appropriate chapter
5. Test that selectors resolve (inspect snapshot via `node tools/inspect-snapshot.js <slug>`)
6. Update storyboard.md to note which sections are now real vs mockup
7. Commit per batch: `phase 5: wire real Klaviyo dashboard snapshots into klaviyo-quick-connect`

### Phase 4 — Visual QC + polish (~1 hour)

After Phases 1-3:
1. Open the full video in preview. Watch end-to-end.
2. Check: intro → postIntro → tutorial transitions feel smooth (no cuts feel jarring)
3. Check: mac frame appears/disappears at correct phase boundaries
4. Check: cursor lands on correct targets (no top-left jumps)
5. Check: text is sharp throughout (INV-1, INV-2)
6. Check: brand discipline (INV-10) — orange primary, no purple, real Sullie
7. Tighten any timing that feels long/short
8. If anything still feels mocked-up after snapshots delivered, document why

### Phase 5 — Narration (~30 min, when Voicebox is up)

When Voicebox server is running on `http://127.0.0.1:17493`:
1. Create per-chapter narration text files at `videos/klaviyo-quick-connect/narration/intro.txt`, `postintro.txt`, `chapter-1.txt` ... `chapter-5.txt`, `outro.txt`
2. Run `node tts/generate.js --video klaviyo-quick-connect`
3. Wire mp3 playback into the master timeline (use `videos/_shared/narration.js` from Phase 3 gap-fill)
4. Sync timing — each chapter's audio plays during its visual content

## Hard constraints

1. **No engine path.** Single-HTML only. Existing engine path is for legacy 12 videos; do not engage it.
2. **No new WPFormsInteractions library methods** unless they pass the 3-test promotion rule (INV-7). All Klaviyo-specific stuff stays inline in the per-video HTML.
3. **No mac frame in intro/postIntro/outro.** Mac frame is for the "demonstration" sections only.
4. **Real brand only** — no invented Klaviyo colors. Use their actual `#1A1A1F` black for the dashboard cutaway, real Sullie for WPForms branding.
5. **Architecture invariants 1-10 are non-negotiable.** Re-read before each code change.
6. **No `fitStage` transform anywhere.** Stage at native 1280×720, mac-body inside at 1180×604.
7. **Determinism rules apply.** Test with `node tools/lint-determinism.js videos/klaviyo-quick-connect`

## Files in scope

- `videos/klaviyo-quick-connect/index.html` (modify)
- `videos/klaviyo-quick-connect/storyboard.md` (update to reflect new shape)
- `videos/klaviyo-quick-connect/narration/*.txt` (create when Voicebox is up)
- `snapshots/klaviyo-*/index.html` + `catalog.md` (create when captures arrive)
- Possibly `videos/_shared/motion-primitives.js` for the cursor-glide null guard (LIBRARY fix, per INV-7 promotion rule — passes "hard-won pattern" test if jumping to (0,0) is a recurring footgun)
- Possibly `videos/_shared/wpforms-interactions.js` for `elementToStageCoords` null guard

## Deliverable at end of session

1. Working `videos/klaviyo-quick-connect/` with Intro → PostIntro → Tutorial → Outro shape
2. Cursor bug fixed at library level
3. Real Klaviyo snapshots wired (assuming they were captured)
4. Updated storyboard.md
5. Visual QC handed back to Umair with specific beats called out for approval
6. Commits per logical step (don't bundle)

## When to ping Umair

- After Phase 1 cursor-bug fix lands — confirm it's resolved on his end
- When snapshots wired and you have specific selector questions
- When intro / postIntro is built — needs his visual approval before tutorial proper continues
- If postIntro morph-chain concept needs creative direction (you can propose 2-3 alternatives)

## Reference videos for the postIntro concept beat

- `reference/html-templates/wpforms-ai-prompt-open.html` — S-tier identity-continuity morph (THE reference)
- `videos/build-forms-faster-with-wpforms-ai/chapters/scene-2-add-new.js` — engine-path winner for tutorial cinematic pacing
- `videos/wpforms-rest-api-overview-polished/chapters/intro-cold-open.js` — polish-vocabulary reference for tutorial-grade intro

## Companion deliverable (DO NOT BUILD IN THIS SESSION)

The editorial Klaviyo video is a separate task. After this tutorial ships, a separate session builds the ~20-30s editorial version reusing the mockup CSS from this video's cutaways. Document at the end of this session what's reusable for the editorial follow-up — but don't build it here.

Good luck. Re-read the PDF + the architecture invariants doc before any code.
