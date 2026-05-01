# Storyboard: Customize the Checkboxes Field

Status: revised after first visual QC

## Goal

Show how the Checkboxes field can be added and shaped into a clear,
multi-select question. The video should feel like staged WPForms product
b-roll, not a narrated article summary.

## Inputs

- Slug: `a-complete-guide-to-the-checkboxes-field`
- Topic: Checkboxes field customization
- Audience: beginner
- Target duration: about 90-120 seconds
- Source/reference: existing `brief.md` article source and emitted package
- Existing package to rescue: yes
- Required title system: Sullie intro and Sullie outro from
  `/scenes/three-title-system-lab.html`.
- Required audio: render current narration with Voicebox TTS.

## Runtime Choice

- Recommended style: hybrid
- Reason: simple click/type/dropdown beats can use descriptor chapters, but the
  post-intro and the Icon Choices / layout payoff should be hand-staged if the
  descriptor version feels flat.

## Intro

- Eyebrow: WPForms Tutorial
- Title: Customize the Checkboxes field
- Subtitle: Give visitors a cleaner way to pick more than one option.
- Hold: 3 seconds

## Opening State After Intro

The form builder is open on the Add Fields panel, with the Checkboxes field
available under Standard Fields. The form preview already has a small starter
form so the Checkboxes field has context when it lands.

## Post-Intro Moment

- What viewer sees: the Checkboxes field button is found in the Add Fields
  panel, then the viewer immediately sees the field appear as a real
  multi-choice block in the form preview.
- Why it matters: this should establish the core product idea fast: Checkboxes
  are for "pick more than one."
- Implementation idea: use the existing drag/drop reveal as the post-intro
  payoff instead of a separate generic cursor pulse. If needed, start with a
  short promise label, then drag the real hidden field into place.
- Narration/on-screen promise: "Let visitors pick more than one answer."

## Chapters

### 1. Add the Checkboxes field

- Purpose: establish where the field lives and what it adds to the form.
- Snapshot/source UI: Add Fields builder panel.
- Starting UI state: Add Fields tab open, Checkboxes visible or searchable.
- Ending UI state: Checkboxes field visible in the form preview.

Beats:

1. Visible action: find or search for Checkboxes in the Add Fields panel.
   Narration: "Start in the Add Fields panel and find Checkboxes."
   UI manipulation: optional search filter if the button is not already in a
   clean frame.
   Overlay/camera: focus the Add Fields panel, then the Checkboxes button.
   Notes: keep this short; do not spend the whole intro on a pulse.

2. Visible action: drag Checkboxes into the form preview.
   Narration: "Drag it onto the form when visitors need to choose more than one
   answer."
   UI manipulation: reveal the real hidden Checkboxes field during the drag.
   Overlay/camera: cursor drag, end ring on the landed field.
   Notes: this is the first real UI payoff.

### 2. Rename the question and choices

- Purpose: make the field feel real instead of generic.
- Snapshot/source UI: Checkboxes field options, General tab.
- Starting UI state: Checkboxes field selected, Field Options open.
- Ending UI state: label and visible choices use a concrete example.

Beats:

1. Visible action: select the Checkboxes field and focus the Label input.
   Narration: "Click the field to open its options, then give the question a
   clear label."
   UI manipulation: set the label to "Pizza Toppings."
   Overlay/camera: focus the left options panel and the live field preview.
   Notes: if typing the full label feels slow, type the key words and snap the
   final value.

2. Visible action: update three choice labels.
   Narration: "Then rename the choices so the list matches what you're asking."
   UI manipulation: set visible choices to "Pepperoni", "Mushrooms", and
   "Extra cheese".
   Overlay/camera: highlight the choice rows, then the form preview.
   Notes: this beat may need a small custom setup/effect because the current
   generated video does not stage choice editing.

### 3. Show selection behavior

- Purpose: demonstrate why Checkboxes differ from single-choice controls.
- Snapshot/source UI: Checkboxes field options or form preview with the field.
- Starting UI state: field has three choices.
- Ending UI state: two choices are visibly checked.

Beats:

1. Visible action: check two boxes in the form preview.
   Narration: "Because this is Checkboxes, visitors can select more than one
   option at the same time."
   UI manipulation: visually check two real checkbox inputs.
   Overlay/camera: focusPull or clean zoom on the field preview.
   Notes: this should be a small but important product-truth moment.

### 4. Add icons to the choices

- Purpose: create the main visual wow moment.
- Snapshot/source UI: Checkboxes field options, General tab, Icon Choices
  control.
- Starting UI state: Use Icon Choices off.
- Ending UI state: icon choices are visibly enabled in options and/or preview.

Beats:

1. Visible action: toggle Use Icon Choices.
   Narration: "Turn on Use Icon Choices when each option needs a visual cue."
   UI manipulation: toggle the setting and apply the icon-choice DOM prep.
   Overlay/camera: focus the toggle, then move attention to the changed choices.
   Notes: keep the narration shorter than the current generated beat.

2. Visible action: show the field transform from plain checkboxes to icon-backed
   choices.
   Narration: "The choices become easier to scan before the visitor even
   starts reading."
   UI manipulation: staged reveal of icons on the real Checkboxes choices.
   Overlay/camera: this is the main wow/payoff; consider popOut or focusPull on
   the transformed field.
   Notes: after user feedback, include a brief Icon Picker beat by clicking the
   real icon block in the Field Options panel and showing the picker modal. Do
   not select an icon inside the popup unless asked.

### 5. Arrange choices in columns

- Purpose: show the practical layout control.
- Snapshot/source UI: Checkboxes field options, Advanced tab.
- Starting UI state: Advanced tab open, Choice Layout visible.
- Ending UI state: choices displayed in two columns.

Beats:

1. Visible action: switch to Advanced.
   Narration: "For layout controls, switch to the Advanced tab."
   UI manipulation: activate the Advanced tab.
   Overlay/camera: simple tab focus/click.
   Notes: short bridge beat.

2. Visible action: choose Two Columns from Choice Layout.
   Narration: "Set Choice Layout to two columns to keep longer lists compact."
   UI manipulation: open/select the dropdown, then apply the two-column preview
   state.
   Overlay/camera: show the dropdown, then the preview update.
   Notes: this should feel like cause and effect, not just a click.

### 6. Save the form

- Purpose: land the tutorial cleanly.
- Snapshot/source UI: builder top bar.
- Starting UI state: customized Checkboxes field visible.
- Ending UI state: Save clicked.

Beats:

1. Visible action: click Save.
   Narration: "Click Save, and your Checkboxes field is ready for visitors."
   UI manipulation: save click, optional toast if product-true or editorial
   overlay if not.
   Overlay/camera: cursor click on Save, then clean final hold.
   Notes: no recap here; outro handles that.

## Wow / Payoff Moments

1. Moment: drag/drop reveal of the Checkboxes field.
   Source UI: Add Fields panel and builder preview.
   Implementation idea: use the existing hidden-field reveal from the generated
   chapter if it looks good.
   Why it matters: proves this is product UI, not just a highlighted button.

2. Moment: plain choices become icon-backed choices.
   Source UI: Checkboxes field options and preview.
   Implementation idea: toggle Use Icon Choices, then stage the visible choice
   transformation with DOM prep and a premium focus effect.
   Why it matters: gives the video a real visual payoff.

3. Moment: one-column choices become two-column layout.
   Source UI: Advanced tab and field preview.
   Implementation idea: select Choice Layout and apply a real preview state.
   Why it matters: shows why the Advanced tab is useful.

## Narration Review

Proposed narration in order:

1. "Let visitors pick more than one answer."
2. "Start in the Add Fields panel and find Checkboxes."
3. "Drag it onto the form when visitors need to choose more than one answer."
4. "Click the field to open its options, then give the question a clear label."
5. "Then rename the choices so the list matches what you're asking."
6. "Because this is Checkboxes, visitors can select more than one option at the
   same time."
7. "Turn on Use Icon Choices when each option needs a visual cue."
8. "The choices become easier to scan before the visitor even starts reading."
9. "Click an icon in the choice settings to open the Icon Picker, where you can
   search and choose a different symbol for that option."
10. "You can also use Image Choices when a visual card is clearer than text
    alone."
11. "For layout controls, switch to the Advanced tab."
12. "Set Choice Layout to two columns to keep longer lists compact."
13. "Click Save, and your Checkboxes field is ready for visitors."

## Outro

- Final UI state: customized Checkboxes field visible in the builder.
- Eyebrow: WPForms Tutorial
- Title: That's the Checkboxes field.
- Subtitle: Use it when visitors can choose more than one answer.
- Hold: 3 seconds

## Assumptions

- The first rescue pass should prioritize the Add Field, Icon Choices, and
  Choice Layout moments.
- Bulk Add, WPForms AI, Randomize Choices, Dynamic Choices, Hide Label, and
  Disclaimer mode should not become full interactions unless the user asks for
  a longer/deeper video.
- The current generated package may contain useful selector/prep work, but it
  should not be regenerated from the article source as the creative driver.

## Approval

- User approved story: yes
- User approved narration: yes, with beat-level TTS clips required for sync
- Approval notes: Use Sullie intro/outro, WPForms style-guide wording,
  on-screen instructions, and stronger effects such as highlights, popOut, and
  focusPull.

## Implementation Status

- Manifest uses Sullie-system intro/outro.
- Voicebox TTS rendered the revised beat-level MP3 clips.
- Post-intro now has narration and uses `fields`/`selected` so the cinematic
  actually animates the selected field rows.
- Default selections are set from the Field Options choice checkboxes, not by
  clicking the builder preview.
- Image Choices gets a brief toggle mention after Icon Choices, with a longer
  hold and a wider camera view so the field remains visible.
- Icon Choices includes a brief Icon Picker modal beat.
- Required was removed from the active chapter order.
- Clean-form prep removes PayPal buttons and quiz notices from builder views.
- Active chapter order is `add-checkboxes-field`, `edit-label`,
  `multi-select-behavior`, `icon-choices`, `multi-column-layout`, and
  `save-checkboxes-field`.
- Static validation passes with zero errors.
- Import checks pass for the touched runtime modules.
- Visual QC is left to the user unless explicitly requested.
- See `docs/checkboxes-rescue-handoff.md` for verification commands and
  process notes.
