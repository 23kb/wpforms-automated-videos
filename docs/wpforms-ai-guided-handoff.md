# WPForms AI Guided Handoff

Status: started, 2026-04-28.

Video slug:

```text
build-forms-faster-with-wpforms-ai
```

## Direction

- Guided product-video staging, not source-URL automation.
- Story stays on `online feedback survey`.
- Build chapter by chapter. First QC slice is intro plus postIntro only.
- Use Sullie-system intro/outro styling.
- Final recording should keep `manifest.hud: false`.

## Current Slice

Built first slice:

- Intro: Sullie-system title card with a cleaner cool/purple-blue paper
  background override.
- PostIntro: `rough-thought-to-draft`, a cinematic showing a messy thought
  getting edited into `online feedback survey`, then compressed into a chat
  chip and answered by Sullie with a ready form draft.
- Runtime runner note: `player.js` now tolerates intro/postIntro-only QC slices
  where no chapter snapshot ever initializes the engine cursor.

Current chapter set:

```text
generate-with-ai
prompt-form
use-form
```

Narration:

```text
Start with the form you need, even if the idea is not perfect. WPForms AI turns it into a working draft.
```

## Source UI Inventory

Real WPForms AI DOM states supplied by the user are preserved in:

```text
docs/wpforms-ai-state-inventory.md
```

## Production Issues And Fixes

Keep this section focused on problems hit while building the video and the
fixes applied, so the post-video refactor can separate reusable workflow from
one-off rescue work.

- Issue: I incorrectly created staged snapshot fixtures from user-supplied
  product HTML for WPForms AI UI instead of using exact captured WPForms UI.
  Correction: that was wrong for the guided product-video workflow.
  The repo already had the real `builder-setup` snapshot for the templates
  page, and missing AI states should be captured from the live WPForms site or
  requested from the user, not recreated as WPForms-looking HTML. Fake fixture
  folders were removed. The AI builder empty state was recaptured from:
  `http://sulliesbakery.com/wp-admin/admin.php?page=wpforms-builder&view=setup`
  after clicking the real `#wpforms-template-generate .wpforms-template-generate`
  button, writing a real snapshot to `snapshots/wpforms-ai-builder-empty/`.
- Issue: chapter 2 needed a real generated survey payoff, not local DOM
  fabrication. Fix: captured `snapshots/wpforms-ai-builder-feedback-generated/`
  by running the local WPForms AI flow, entering `online feedback survey`, and
  waiting for the generated answer and preview.
- Issue: the addon prompt was requested if it appears, but it did not appear
  during the real capture path on the current local site state. Fix: chapter 1
  avoids fabricating the prompt; it can be added later only from an exact
  captured modal state.
- Refactor lesson: future guided video skill must explicitly check existing
  snapshot inventory before authoring any replacement UI. If exact UI state is
  absent, it should ask/capture, not synthesize a product-looking snapshot.
- Issue: the WPForms AI chapters need state changes after clicks, but the
  runtime only swaps snapshots at chapter boundaries by default. Fix: used the
  existing `swapToSnapshot()` effect context to move from `builder-setup` to
  `wpforms-ai-builder-empty`, then from the empty builder to the real generated
  survey snapshot.
- Issue: chapter 1 initially clicked a hidden template button and used too-tight
  zooms. Fix: staged the real template-card hover state by adding the same
  active/selected classes and button opacity that WPForms uses, then reduced
  template and button camera levels.
- Issue: chapter 2 builder and draft payoff cameras were too tight and cropped
  the product UI awkwardly. Fix: pulled back the AI builder, prompt, and draft
  preview camera levels, and moved the draft focus-pull from a single rating
  field to the generated preview panel.
- Issue: handoff docs can drift into storyboard notes. Fix: this handoff now
  keeps implementation issues/fixes separate from story direction.
- Issue: the static validator understands descriptor-style `snapshot: "slug"`
  properties, but these two chapters use the legacy `export const snapshot`
  contract for guided DOM staging. Fix: added inert `validator = { snapshot:
  "..." }` hints to the chapter files so validation can resolve the intended
  snapshot without changing runtime behavior.
- Issue: chapter swaps felt like a page reload because `transitionSnapshots()`
  faded the iframe away, mounted a cream cover, rebuilt the page, then revealed
  the new iframe. During the generated-form swap this exposed a static-looking
  form state. First attempted fix, a detached-stage crossfade, still read like
  a frozen reload frame. Second attempted fix, the Checkboxes `morph` swap,
  still did not match the desired AI-video rhythm. Final hardfix for this
  video: make snapshot changes behave like the intro-to-postIntro handoff.
  A full paper cover mounts and becomes opaque before `loadSnapshot()` wipes
  the body, the new exact snapshot is prepared underneath it, then the cover
  drops. The viewer should see a deliberate paper handoff, not a reload.
- Issue: wide builder shots used camera levels below 1.0, which made the fixed
  Mac frame show extra space around the iframe, especially near the top-left
  WPForms chrome. Fix: chapters 1-2 now keep wide builder cameras at 1.0 or
  above.
- Issue: the prompt typing beat used the raw engine `type()` helper, so it lost
  per-keystroke SFX. Fix: `runtime/player.js` now wraps the chapter `type`
  helper with the existing `playType()` SFX while preserving the no-highlight
  typing choreography.
- Issue: after removing the heavy dim/highlight treatment, the prompt typing
  beat became too subtle and viewers could miss the input target. Fix: chapter
  2 now uses a slight camera push into the prompt textarea plus an in-iframe
  outline on the real input container while typing. Avoid using stage overlay
  highlights for this bottom-left input; the overlay box can visually span into
  the right preview panel at this camera angle.
- Issue: using `cursor.clickOn()` for the Send button after typing reintroduced
  the dark stage overlay and an orange box around the send area. Fix: the Send
  action now uses a plain cursor glide/click so the prompt beat stays focused
  on the input outline instead of dimming the whole builder.
- Issue: the generated-form focus effect cloned the preview panel into the
  parent document, so the lifted clone could escape the Mac frame. Fix:
  `focusPull()` now appends its clone inside `.stage` by default so the existing
  stage clip-path constrains it to the framed recording area.
- Issue: the generated preview focus needed more separation from the rest of
  the builder. Fix: `focusPull()` now supports a subtle stage dim behind the
  sharp clone, and the generated preview beat uses it.
- Issue: the video pacing felt slow, and the local Voicebox `/generate` schema
  does not expose a speech-rate field. The available effects list also has no
  tempo effect. Fix for this video: add `manifest.narrationSpeed` support in
  `scenes/shared.js`/`runtime/player.js` and set the WPForms AI video to 1.1x
  narration playback.
- Issue: I paused on the remaining AI Choices chapters because I thought the
  modal and inserted-choice states needed newly captured full snapshots. What
  led to that wrong call: the earlier fake-snapshot mistake made me overcorrect
  and treat every visible WPForms state as capture-only. Correction: the repo
  already has exact builder snapshots for choice fields, including
  `builder-field-options-checkbox` with the real Generate Choices button.
  For this video it is valid to stage the supplied real WPForms modal HTML over
  that exact builder snapshot, dim the builder underneath, and DOM-manipulate
  the existing choice rows/options labels after Insert Choices. Use this
  pattern for similar overlay-only AI states instead of blocking on a new
  snapshot.
- Cost issue: intro + postIntro + chapters 1-2 consumed roughly 40% of the
  Codex session budget. Main contributors were over-exploration, building fake
  snapshots instead of using/capturing exact snapshots, and repeated long smoke
  checks. Refactor target: a tighter "inventory -> capture missing states ->
  storyboard/chapter authoring -> one standard non-visual smoke" loop.

## Notes To Carry Forward

- The earlier pizza-order HTML is only a DOM-shape reference. Do not use it as
  the video story.
- The generated survey preview should show enough product proof to read the
  payoff: Name, Email, Overall rating, feedback fields, and source dropdown.
- The addon prompt should be shown intentionally in the form-generation
  chapter if it appears.
- `review-draft` was removed from the active video after review. The generated
  state chapter is `use-form`, which stays within the real
  `wpforms-ai-builder-feedback-generated` snapshot and stages the real
  `Use This Form` CTA.
- AI Choices is now represented by `generate-choices`, based on the exact
  `builder-field-options-checkbox` snapshot. The modal and inserted choices are
  staged DOM over that real builder state, following the user-supplied modal and
  options-row guidance.
- Issue: `generate-choices` initially used the exact checkbox field-options
  snapshot but skipped the established cleanup DOM pass, leaving the old Master
  Form quiz content visible in the builder preview. Correction: for topic
  chapters that reuse broad builder snapshots, first clean the preview down to
  the standard base fields plus the relevant field: Name, Email, Message, and
  the topic field. For this video, `generate-choices` now hides the quiz tabs,
  quiz helper content, pagebreaks, and unrelated fields, then keeps only the
  checkbox field active.
- Issue: cleanup still flashed because `runtime/player.js` swapped to the new
  snapshot under the paper cover, dropped the cover, and only then called the
  chapter `setup()`. That showed the raw Master Form/quiz state for a moment.
  Fix: chapter setup now runs inside the snapshot transition when the chapter
  boundary loads a new snapshot, before the cover drops. The old post-swap
  setup path remains for chapters that reuse the current snapshot.
- QC finding, do not treat as fixed: the `generate-choices` modal currently
  does not match the real WPForms AI Choices modal visual structure. It reads
  like a generic staged modal: oversized empty body, wrong spacing, wrong
  message/composer proportions, and the typed prompt state does not resemble
  the supplied WPForms popup examples closely enough. Future fix should use the
  supplied modal HTML/classes more faithfully instead of the hand-built modal
  shell.
- QC finding, do not treat as fixed: after the cleanup pass, the form preview
  area in `generate-choices` can become blank/empty instead of showing the
  expected cleaned base form. The intended visible preview for this chapter is
  still Name, Email, Message, and the relevant Checkboxes field only. Future
  fix should preserve or rebuild those exact existing preview field nodes while
  hiding unrelated quiz/payment content, not hide the whole preview content.

## Verification

```text
node tools/validate-video.js build-forms-faster-with-wpforms-ai
```

Current result:

```text
summary: 0 error(s), 0 warning(s)
```

Headless playback smoke for the intro/postIntro slice completed with no boot
errors and `document.body.dataset.sceneDone === "true"`.

Chapter-only non-visual smoke checks completed for:

```text
http://localhost:4321/scenes/player.html?video=build-forms-faster-with-wpforms-ai&chapter=generate-with-ai,prompt-form
```

Completed with:

```text
bootError: ""
document.body.dataset.sceneDone: "true"
hud: false
page/console errors: none
final snapshot title: "Online Feedback Survey"
```
