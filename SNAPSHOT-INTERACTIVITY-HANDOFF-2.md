# Snapshot interactivity — session handoff #2

Paste this into a new Claude Code session to resume. **Read `SNAPSHOT-INTERACTIVITY-HANDOFF.md` first** for the foundational architecture; this file is the delta on top of it.

---

## What this is

Continuation of Track 2 snapshot interactivity work. Same conventions:

- **Implementation:** `snapshots/_shared/interactivity.js`
- **Wiring:** `<script src="../_shared/interactivity.js"></script>` injected into every `snapshots/builder-field-options-*/index.html` via `tools/link-interactivity-script.js`
- **Branch:** `snapshot-optimization`
- **Animation standard:** `fadeSwap` (180ms out / 180ms in) for any layout/visibility/structure change; instant for attribute-only changes
- **Working method:** one field at a time, complete fully before moving on; Umair does all visual QC

## What shipped in this session (Checkbox — Choices area)

### Add / Remove choice buttons — FIXED
The bug from handoff #1 ("clicking `+` doesn't add"): match predicate was testing the raw `e.target` (the `<i class="fa fa-plus-circle">` child icon) instead of the parent `<a class="add">`. Fixed by switching to `closest('a.add')` / `closest('a.remove')` in both `match` and `apply`. Same fix applied to Remove. Lines ~688 and ~749 of `interactivity.js`.

### Image Choices — FULL per-`<li>` canvas re-render
Class-only toggling wasn't enough (Umair confirmed) — the canvas needs richer markup per choice. Solution:

- New helper `renderCanvasChoices(field)` in `interactivity.js` (~line 200). Reads choice rows from the option-panel `choices-list` ul (label text, `input.default` checked state, icon `<i>` class for icon mode) and rebuilds `ul.primary-input` children with the correct shape:
  - **Image mode:** `<li class="wpforms-image-choices-item [wpforms-selected]"><label><span class="wpforms-image-choices-image"><img src="../_shared/assets/placeholder-200x125.svg"></span><input class="wpforms-screen-reader-element" type="checkbox" readonly [checked]><span class="wpforms-image-choices-label">…</span></label></li>`
  - **Icon mode:** `<li class="wpforms-icon-choices-item [wpforms-selected]"><label><span class="wpforms-icon-choices-icon"><i class="ic-fa-{style} ic-fa-{name}"></i><span class="wpforms-icon-choices-icon-bg"></span></span><input class="wpforms-screen-reader-element" type="checkbox" readonly [checked]><span class="wpforms-icon-choices-label">…</span></label></li>`
  - **Plain:** restores the bare `<input> Label` shape.
- **CRITICAL:** mode classes (`wpforms-image-choices`, `wpforms-icon-choices`, and their `-{style}` / `-{size}` variants) go on `<ul.primary-input>` — **NOT** on the field div. This matches live plugin output. The snapshot CSS bundles scope rules to `ul.wpforms-image-choices-classic`, etc.
- `Use Image Choices` toggle (`image-choices-toggle`): adds the mode classes to the canvas ul, adds `show-images` to the option `<ul.choices-list>` (CSS in inline `<style>` reveals the inline `Upload Image` button per choice), shows `_style` row, hides `_hide` row (entries-only, skipped), forces `input_columns` to `inline` (re-dispatches change to fire `choices-layout`), restores prev `input_columns` on toggle-off via `el.dataset.prevColumns`. Mutex with Icon Choices.
- `Image Choice Style` select swaps `wpforms-image-choices-{modern|classic|none}` on the ul. **Classic visual difference:** the snapshot CSS already styles unselected items with `border: 1px solid #ffffff` (invisible white-on-white) and selected items with `border-color: rgba(0,0,0,0.7)` / `#6a6f76` 2px. Border only visible on `wpforms-selected` items — user must toggle a default checkbox in the option panel to see it.
- `Use Icon Choices` toggle (`icon-choices-toggle`): same shape; reads style/size/color from `choices_icons_style` / `choices_icons_size` / `choices_icons_color` inputs; sets `--wpforms-icon-choices-color` CSS variable on the canvas ul and option ul (default `#066aab` if minicolors picker not touched).
- `Icon Choice Style` and `Icon Size` selects swap the corresponding class on the ul.
- **Icon Picker modal** (clicks on `.wpforms-icon-select` inside `.choices-list`):
  - Curated 32-icon library (`ICON_LIBRARY` constant in `interactivity.js` — envelope, bullhorn, pencil, palette, etc. — all confirmed present in Font Awesome CSS bundle).
  - jconfirm-style modal (backdrop, title with search input, close ×, icon grid).
  - **Aggressive inline styles on the backdrop element** (`position:fixed; top/left/right/bottom:0; z-index:2147483647; …`). Required — relying on injected `<style>` rules wasn't enough; the modal would mount in DOM but be invisible due to some CSS conflict. **Do not regress this.**
  - Click delegation in **capture mode** (`addEventListener('click', …, true)`) so it runs before any other handler. `stopPropagation` on open/close/pick paths.
  - Search input filters icons by substring of `data-icon`.
  - Picking an icon updates the option-panel `i.ic-fa-preview` className, name `<span>`, hidden `source-icon` / `source-icon-style` inputs; re-renders canvas via `renderCanvasChoices` if the ul is in icon-choices mode; closes modal.
  - Closes on ×, backdrop click, or Escape.
- **4 resync transitions** at the END of the `TRANSITIONS` registry: `choices-resync-add`, `choices-resync-remove`, `choices-resync-label`, `choices-resync-default`. Each matches the same event + selector as its base handler PLUS a check that `ul.primary-input` has `wpforms-image-choices` or `wpforms-icon-choices`. They run AFTER the base handlers (registry order) and call `renderCanvasChoices(field)` to replace the bare-li mutation with the correct mode markup.

### Snapshot assets
- New: `snapshots/_shared/assets/placeholder-200x125.svg` — gray doc icon with baked-in green checkmark. Matches the live `wp-content/plugins/wpforms/assets/images/builder/placeholder-200x125.svg` (the live SVG already has the checkmark baked in; the CSS `:after` overlay on `.wpforms-image-choices-modern` adds an additional check on selected items).

### Skipped with reason
- **`choices_images_hide`** ("Hide Images in Entries") — entries-only, no canvas effect.
- **`choices_icons_color`** — minicolors color picker widget. Complex picker UI (swatch, hue slider, opacity slider, grid). The initial value `#066aab` IS used (read on Icon Choices toggle-on and applied to the ul via `--wpforms-icon-choices-color`), but live color editing is not wired. Propose separately if needed for a tutorial.

## Architecture decisions / gotchas (read before adding more)

1. **Mode classes go on `<ul.primary-input>`, not the field div.** This trips up everyone — the option-panel rows live on the field-option side, but the canvas-side mode classes are on the ul because that's what the snapshot CSS bundles expect (`.wpforms-panel-fields .wpforms-field-checkbox ul.wpforms-image-choices-classic …`).
2. **Per-choice markup for Image/Icon already exists in the snapshot option panel** — each option-`<li>` already contains a `<div class="wpforms-image-upload">` and a `<div class="wpforms-icon-select">`. They're hidden by default via CSS:
   - `.choices-list .wpforms-icon-select { display: none }`
   - `.choices-list.show-icons .wpforms-icon-select { display: flex }`
   So my toggle just adds `show-icons` / `show-images` to the option ul — no markup injection needed on the panel side. CANVAS side, however, needs full re-render via `renderCanvasChoices`.
3. **Modal/popover invisibility trap.** When mounting a `position:fixed` element from this snapshot, **always use inline styles directly on the element** (`element.setAttribute('style', '…')`). Don't rely on an injected `<style>` block — there's some CSS conflict from the snapshot's massive inline stylesheets that wins specificity wars. The Icon Picker modal already does this; copy the pattern for any future modals.
4. **Click delegation order matters.** Transitions in the `TRANSITIONS` array run in registry order. New resync transitions go at the END so they fire AFTER the base mutation handlers. For modal-like global handlers, register in **capture mode** so nothing upstream can swallow the click.
5. **`renderCanvasChoices` reads from the option-panel ul, not the canvas.** This is the source of truth: label text from `input.label`, checked state from `input.default`, icon from `.wpforms-icon-select i.ic-fa-preview`. Always work from option-panel → canvas, never the reverse.
6. **`wpforms-image-choices-classic` borders are invisible until items are `wpforms-selected`.** CSS base is `border: 1px solid #ffffff` (white-on-white). Don't try to "fix" this — it matches the live plugin. The user understands.

## START HERE — Next steps

### 1. Finish Checkbox (small loose ends)

- **Audit the Checkbox option panel for anything else interactive.** Open `snapshots/builder-field-options-checkbox/index.html` in the browser, click through every control on every tab (General, Advanced, Smart Logic — skip Smart Logic for now), and confirm each visible control either (a) has a transition in `interactivity.js`, or (b) is a known skipped-with-reason candidate (CSS Classes / Conditional Logic / Quiz / Survey / AI / Choice Order Randomize). Likely candidates I didn't explicitly verify this session:
  - "Generate Choices" purple button (`wpforms-ai-choices-button`) — AI feature, skip.
  - "Bulk Add" toggle link (`toggle-bulk-add-display`) — expands a hidden textarea for pasting newline-separated choices, then has Add/Cancel buttons that parse into individual choice rows. Useful for tutorials. **Propose to Umair before implementing — sizable.**
  - "Choice Limit" number input (Advanced tab) — front-end only, no canvas effect, skip.
  - "Dynamic Choices" select (Advanced tab — Off / Post Type / Taxonomy) — when set to a value, shows the "Dynamic Choices Active" alert in the choices row AND reveals a "Dynamic Type" select sub-row. Has canvas effect (replaces choices with placeholder items keyed off the selected type). **Medium complexity — propose first.**
- Don't add Conditional Logic (Smart Logic tab) — separate beast, deferred from handoff #1.

### 2. Radio field

Should largely inherit Checkbox work since the universal `choices-*` handlers cover both. Snapshot at `snapshots/builder-field-options-radio/index.html`. Steps:
1. Open snapshot, verify Add/Remove/Label/Default/Image/Icon all work after Checkbox is complete. Radios should have **mutual-exclusive defaults** (already handled in `choices-default-toggle`). Verify Image/Icon mode still applies correct mutex.
2. Check for any radio-specific rows in the option panel that Checkbox doesn't have (probably 1–2 small gaps at most).

### 3. Multiple Choice (`select` field-type)

Snapshot at `snapshots/builder-field-options-select/index.html`. Notable controls:
- **Dropdown Style** (Classic / Modern) — Classic uses a native `<select>`; Modern uses Choices.js library with a styled overlay. **Decision needed:** ship Choices.js-like overlay rendering, or skip with reason (panel-only class toggle)? Choices.js rendering is substantial work. Propose to Umair first.
- **Multiple Options Selection** toggle — adds `multiple` attribute to canvas `<select>`, changes input shape. Class-only on canvas might suffice.
- **Dynamic Choices** — same as Checkbox above.
- **Choices, Show Values, Placeholder** — universal, already covered.

### 4. Date/Time field

Snapshot at `snapshots/builder-field-options-date-time/index.html`. Notable controls:
- **Date Format** — m/d/Y format string select. Canvas-side placeholder text changes per format. Need a format → placeholder map (`mm/dd/yyyy`, `dd/mm/yyyy`, etc.). Date Picker variant ALSO needs the date in the visible input to reformat (it's a static value in the snapshot — just rewrite the text).
- **Time Format** — 12h / 24h. Canvas placeholder swap.
- **Limit Days** toggle + checkbox group — front-end behavior only, no canvas effect. Skip.
- **Date Type** (datepicker / dropdown) — already shipped in handoff #1.

### 5. Email field

Already mostly shipped (Allowlist/Denylist, Confirmation). Audit for:
- **Default Method** (Standard / AJAX) — front-end only, skip.
- **Default Email** input — universal default-value transition. Likely already covered.

### 6. Address field

Snapshot at `snapshots/builder-field-options-address/index.html`. Already shipped (Scheme, Hide subfields, Placeholder per subfield). Audit for:
- **Geolocation Address (Map)** toggle — addon feature, big DOM rebuild. Propose / skip.

### 7. Phone field

Format select done. Check for:
- **Default Country** select (international format only) — affects flag icon on canvas. Medium complexity (flag SVGs). Propose first.

### 8. Number (non-slider)

Universal placeholder + min/max likely already covered. Audit for any gaps. Probably 0–1 transitions needed.

### 9. Pagebreak

Snapshot at `snapshots/builder-field-options-pagebreak/index.html`. Large field — multiple sub-controls:
- **Progress Indicator** select (None / Circles / Connector / Progress Bar) — canvas swaps progress widget. CSS-only mirror probably won't work; will need to render different progress markup per choice.
- **Indicator Color** + **Color Completed** — minicolors widgets again. Skip until we ship a minicolors handler pattern.
- **Nav Align** (Left / Center / Right / Split) — canvas button alignment.
- **Page Title** input, **Prev Text** / **Next Text** inputs — canvas text updates.

### 10. Repeater

MaxRows, Button Style (Classic / Modern), Add/Remove button text. Probably moderate.

### 11. Signature

Likely simple — color, size.

### 12. HTML / Content / Divider / Hidden

Mostly no canvas effect; fast pass to confirm there's nothing to wire.

## Don't redo / don't do

- Don't redo any transition already shipped — full list in handoff #1 plus this session's Choices work above.
- **Don't push to GitHub** (Umair's work account is read-only — see auto-memory).
- **Don't run preview QC** unless Umair asks. He does all visual QC on snapshot interactivity. Memory entry confirms.
- **Don't add CSS Classes mirroring** — metadata-only.
- **Don't add Smart Logic / Conditional Logic** mirroring without explicit ask.
- **Don't migrate or rewrite the snapshot capture pipeline.** Snapshots are static fossils; interactivity lives in the shared script.
- **Don't refactor `interactivity.js` "for cleanliness."** Append-mostly. Each transition is a registry entry — keep that shape.
- **Don't move mode classes (image-choices/icon-choices) back to the field div.** They go on `<ul.primary-input>`.
- **Don't strip the aggressive inline styles from the Icon Picker modal.** The injected `<style>` block isn't enough.

## How to start the new session

Suggested opener:

> "Continuing snapshot interactivity work — see `SNAPSHOT-INTERACTIVITY-HANDOFF-2.md` and `SNAPSHOT-INTERACTIVITY-HANDOFF.md` at repo root. Read both. Don't write anything until I confirm the next field. Likely candidates: finish Checkbox audit (Bulk Add / Dynamic Choices propose-first), then Radio."

## Pace

**3–5 transitions per session**, each user-verified visually, before moving on. Don't batch field-completions across sessions — one field, complete, sign off, next.
