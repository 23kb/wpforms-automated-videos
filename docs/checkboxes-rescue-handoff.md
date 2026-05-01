# Checkboxes Guided Rescue Handoff

Status: revised after first visual QC, 2026-04-28.

Video slug:

```text
a-complete-guide-to-the-checkboxes-field
```

Preview URL:

```text
http://localhost:4321/scenes/player.html?video=a-complete-guide-to-the-checkboxes-field
```

## What Was Built

- Guided/hybrid Checkboxes video package, not generated from `source.md`.
- Sullie-system intro and outro via `manifest.json` title-card variants.
- Post-intro `one-answer-enough` moment with narration.
- Recording HUD is disabled for this final video through `manifest.hud: false`.
  `runtime/chapter-runner.js` keeps a silent HUD state for diagnostics/error
  handling, but it does not render `#hud` over the screen recording.
- Six active chapters: `add-checkboxes-field`, `edit-label`,
  `multi-select-behavior`, `icon-choices`, `multi-column-layout`, and
  `save-checkboxes-field`.
- Beat-level narration text and MP3 files under:

```text
videos/a-complete-guide-to-the-checkboxes-field/narration/
```

Voicebox rendered the revised beat-level clips. The latest TTS pass rendered
1 changed postIntro clip and skipped 21 current clips.

## Runtime Support Added

The video needed small prep operations for guided staging:

- `setChoiceLabels`: updates sidebar choice labels and the live field preview.
- `setCheckedChoices`: stages multiple checked choices in the field preview.
- `applyImageChoices`: stages the Use Image Choices toggle and image-upload
  rows in the Field Options panel.

Files updated:

- `runtime/dom-prep.js`
- `runtime/prep-ops.js`
- `tools/validate-video.js`

The validator also now recognizes the existing runtime op `applyIconChoicesV2`.

The post-intro handoff now pre-covers the raw iframe between intro and
post-intro, and removes the cover after the cinematic has had a moment to
paint. Chapter-only URLs also strip `postIntro`, not just intro/outro.

Additional 2026-04-28 revision notes:

- The Required beat was removed from the active video.
- The post-intro concept is now `one-answer-enough`: first show a radio-style
  field failing to capture multiple needs, then morph it into checkboxes and
  broaden into quick use cases.
- The pizza-toppings postIntro is doable, but it needs a separate illustration
  payoff layer. For this tutorial, the support-request mismatch is the clearer
  product story; save pizza as a more playful future variant.
- Keep postIntro narration tight. The first full script rendered at 33 seconds,
  which is too long for this slot. The current postIntro is a 14.5s animated
  proof: radio limitation -> checkbox morph -> selected checkmarks -> compact
  side-note chips -> WPForms handoff. Voicebox currently renders the narration
  at about 14.38 seconds.
- Do not use the old full "User needs help with" card or a full-page use-case
  scene for this postIntro. The mismatch should be a small inline cue; use
  cases should appear as side-note chips around the main form.
- Use the existing pixel-point/mask-reveal text primitive (`mountAnimateText`)
  for postIntro text callouts, and small local pixel bursts around checkbox
  selections for the visual payoff.
- `applyIconChoicesV2` must not insert a text glyph into the `<i>` tag; the
  real Font Awesome pseudo element already renders it and text fallback creates
  duplicate stacked icons.
- `iconPickerOpen` is a runtime demo verb for the JS-mounted Icon Picker modal.
  Use it only after clicking a real `.wpforms-icon-select` block from the Field
  Options panel.
- `setCheckedChoices` now sets both `checked` and `defaultChecked` so focus
  effects and cloned previews keep default checkbox state.
- The Checkboxes manifest uses `breakStyle: glide` and `swapStyle: morph` to
  smooth chapter transitions, especially snapshot swaps into Field Options and
  back to Save.

## Verification

Run:

```text
node tools/validate-video.js a-complete-guide-to-the-checkboxes-field
```

Current result:

```text
summary: 0 error(s), 6 warning(s)
```

The warnings are all `stripQuizEnabled` migration debt. They do not block this rescue video.

Automated checks after the first visual QC revision:

- Static validator passes with zero errors.
- `runtime/prep-ops.js` imports successfully.
- `runtime/cinematic-runner.js` imports successfully.
- PostIntro-only smoke on the full player path confirms `.oae-root` and
  `.wpf-et` pixel text mount with no boot error and no page errors. Visual QC
  remains user-owned.

Visual QC is left to the user unless explicitly requested.

## Process Notes

Things that improved the process:

- Storyboard approval first kept the rescue from drifting back into article-summary output.
- Beat-level narration files made sync much easier than one long chapter clip.
- Static validation before TTS saved time; the first errors were descriptor/data-shape issues, not visual issues.
- Full browser smoke caught a real zero-size selector in `edit-label` that static validation could not catch.
- Human visual QC caught creative/product-truth issues the smoke test could not:
  post-intro config mismatch, raw iframe handoff, icon clone fidelity, default
  checkbox behavior, and snapshot cruft.
- Default checkbox state must be set from the Field Options choice list
  (`input.default`), not by clicking the checkbox field inside the builder
  preview.
- Clean form state is mandatory for generic builder chapters: Name, Email,
  Message, then the feature field. Payment buttons and quiz/addon notices
  should be removed by prep.
- Field Options choice labels use `input.label`; `input.value` is not the
  visible choice text.

Recommended next improvements:

- Add a small `node tools/check-video-playback.js <slug> --seconds <n>` wrapper so every session can run the same smoke test without pasting long Playwright snippets.
- Teach the validator or a separate visual checker to flag zero-size interaction targets before a full smoke run.
- Make `tts/generate.js --video <slug>` optionally read only narration keys referenced by the manifest/chapters, so stale `.txt` files cannot create unused audio.
- Decide whether the non-blocking 404s should be cleaned globally or explicitly ignored in smoke output.
- Add a descriptor lint that checks post-intro opts against the cinematic
  contract, for example `fields` versus the older accidental `orbit` key.

## Current Plan

The go-forward plan now lives in:

```text
docs/guided-video-tool-plan.md
```

Important rule for new sessions: the user does not need to provide a full
storyboard. If the user gives a topic and source URLs/docs, the agent should
read those sources and propose the storyboard + narration for approval before
building.

## Next Human Review

Open chapter URLs first, then the full video URL.

- Does the Sullie intro/outro feel right?
- Are the on-screen instructions clear but not noisy?
- Do the Icon Choices and two-column moments feel like real product payoffs?
- Does any beat need a smaller or larger camera move?

Make scoped beat edits after that review. Do not regenerate from article source.

## Review URLs

Chapter-only URLs skip intro and outro:

```text
http://localhost:4321/scenes/player.html?video=a-complete-guide-to-the-checkboxes-field&chapter=add-checkboxes-field
http://localhost:4321/scenes/player.html?video=a-complete-guide-to-the-checkboxes-field&chapter=edit-label
http://localhost:4321/scenes/player.html?video=a-complete-guide-to-the-checkboxes-field&chapter=multi-select-behavior
http://localhost:4321/scenes/player.html?video=a-complete-guide-to-the-checkboxes-field&chapter=icon-choices
http://localhost:4321/scenes/player.html?video=a-complete-guide-to-the-checkboxes-field&chapter=multi-column-layout
http://localhost:4321/scenes/player.html?video=a-complete-guide-to-the-checkboxes-field&chapter=save-checkboxes-field
```

Full video:

```text
http://localhost:4321/scenes/player.html?video=a-complete-guide-to-the-checkboxes-field
```
