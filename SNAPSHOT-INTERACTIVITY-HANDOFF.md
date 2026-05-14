# Snapshot interactivity — session handoff

Paste this into a new Claude Code session to resume.

---

## What this is

Continuation of Track 2 from `SNAPSHOT-WORK-HANDOFF.md` (read that first for the original architecture decisions). Single source of truth for snapshot interactivity:

- **Implementation:** `snapshots/_shared/interactivity.js`
- **Wiring:** linked into every `snapshots/builder-field-options-*/index.html` via `<script src="../_shared/interactivity.js"></script>` injected by `tools/link-interactivity-script.js`
- **Branch:** `snapshot-optimization`
- **Animation standards (locked):** `fadeSwap` (180ms out / 180ms in) for any transition that changes layout / visibility / structure on the canvas; instant for attribute-only changes (placeholder, color, plain text)

## What's shipped (don't redo)

Universal handlers (fire on any snapshot matching the row class):

- Label, Required, Hide Label, Read-Only (with required cascade), Description, Field Size, Placeholder (text + subfield for Name/Address), Tab switch (General / Advanced / Smart Logic), Format select (Name / Date / Phone — single handler covers all 3 via `format-selected-*` class pattern), CSS Classes (skipped — metadata-only)

Field-specific:

- **Email:** Allowlist/Denylist filter_type, Confirmation toggle (shared with Password)
- **Date/Time:** Date Type (datepicker / dropdown)
- **Address:** Scheme (US/International), Hide subfield (address-2, postal, country)
- **Rating:** Scale, Icon (star/heart/thumb/smiley), Icon Size, Icon Color, Label Position (above/below), Lowest/Highest Label
- **Number Slider:** Default, Min (with default-clamp), Max (with default-clamp), Step, Value Display (template re-render via DOM, not innerHTML)
- **File Upload:** Style (Classic/Modern), Max File Uploads (hint text), Access Restrictions (+ User Restrictions cascade), Camera Enabled
- **Rich Text:** Style (Basic/Full), Allow Media Uploads
- **Password:** Strength toggle, Confirmation toggle (shared with Email)
- **Choices (universal across Checkbox / Radio / Multiple Choice):** Choice Layout (input_columns), Label edit, Default toggle (with radio mutual-exclusivity), Add (`<a class="add">`), Remove (`<a class="remove">`), Disclaimer toggle
- **Layout:** Display (Rows/Columns), Preset (1/50-50/33-33-33/25-25-25-25/etc. — rebuilds column wrappers, preserves dropped-in children by index)

Snapshot fixes:

- Layout preset SVG thumbnails (27 SVGs hashed into `_shared/assets/`, URLs rewritten)
- Rich Text basic toolbar sprite (4 PNGs hashed in)
- Password snapshot: all 4 toggles default OFF
- Password snapshot: `wpforms-confirm-disabled` initial state so canvas shows only one input
- Number Slider snapshot: `wpf-num-limit-slider` stray CSS class value cleared

Helpers added to `interactivity.js`:

- `getFieldId(el)`, `getField(el)`, `getFieldType(el)` — option-row → canvas lookup
- `fadeSwap(el, mutateFn, duration)` — animation primitive
- `renderSliderHint(hintEl, value)` — DOM-safe template substitution
- `clampSliderDefault(fieldId, bound, which)` — slider min/max → default sync
- `toggleRow(rowId, visible)` — option row show/hide via `wpforms-hidden`

Dispatchers:

- `change` and `input` events on document (matches transitions by event + predicate)
- `click` delegation — only `preventDefault`s when a click transition matches (so unrelated links still work)
- Dropdown overlay (existing) intercepts `<select>` mousedown inside `.wpforms-field-option` and renders the custom dropdown panel; selecting fires `change`

## Working method (locked for this stretch)

**One field at a time. Complete it fully before moving on.**

A field is "complete" when every meaningful control in its option panel either:
- Has a transition mirroring the canvas effect, OR
- Has been explicitly skipped with reason (heavy DOM rebuild, addon-only, serialization-only, metadata-only)

Skipped-with-reason candidates to revisit only on demand:
- CSS Classes (metadata only, never renders on canvas)
- Conditional Logic (Smart Logic tab, big separate beast)
- Quiz / Survey / AI fields (addon features, mostly serialization)
- Choice Order Randomize (no visible canvas effect)

## START HERE — finish Checkbox

The Checkbox field is the current focus. These are the gaps:

### 1. Add / Remove choice buttons are broken

User report: clicking the blue `+` button doesn't add a new choice; the `−` button doesn't remove. There's already `choices-add` and `choices-remove` transitions in `interactivity.js` (added this session) but they aren't working for Checkbox. Investigate:

- Open `snapshots/builder-field-options-checkbox/index.html` in browser, open DevTools console, click `+`. Add a `console.log` inside the click dispatch and inside the `choices-add` `apply` to see where the flow breaks.
- Possible causes worth eliminating:
  - The `<a class="add">` is inside a `<span class="move">` or some other wrapper that intercepts the click (check `e.target` vs `e.target.closest('.add')` — my match uses `instanceof HTMLAnchorElement && classList.contains('add')`, so a click on a child icon inside the anchor wouldn't match. **Most likely root cause.** Fix: match on closest `.add` instead of element identity).
  - The plugin's actual `name`-attr pattern for new choice key doesn't match my regex (`[choices][N]`). Verify by reading an existing choice row's `name` attrs.
  - `data-next-id` might not be present on the `<ul>` in this snapshot.

Same fix likely needed for Remove. Don't write speculative fixes — diagnose first with logs.

### 2. Image Choices toggle + sub-controls

The `Use Image Choices` toggle in Advanced reveals:
- `choices_images_style` row (Modern / Classic / None style picker)
- `choices_images_hide` row (Hide Labels toggle)

Plus side-effects on canvas (real plugin re-renders the entire choices list with image placeholders via `fieldChoiceUpdate`). For snapshot purposes:

- **Toggle on:** add `wpforms-image-choices` + `wpforms-image-choices-classic` (default style) class to canvas field; show the two sub-rows in panel; switch `input_columns` to "inline" (plugin behavior — triggers another change cascade); mutual-exclusivity with Icon Choices (uncheck the other toggle).
- **Toggle off:** remove image classes from canvas, hide sub-rows, restore `input_columns` to whatever it was before.
- **Style sub-select (classic/modern/none):** swap `wpforms-image-choices-{style}` class on canvas.
- **Hide Labels sub-toggle:** toggle a class on the choices list to hide labels (`.wpforms-image-choices-label` is the relevant CSS hook).

Plugin handler at `assets/js/admin/builder/modules/field-choices.min.js` — search for `wpforms-field-option-row-choices_images`. Already partially dumped in previous session transcript.

### 3. Icon Choices toggle + sub-controls

Same shape as Image Choices but with:
- `choices_icons_style` (Default / Classic style picker)
- `choices_icons_color` (color picker — same minicolors input as Rating)
- `choices_icons_size` (Small / Medium / Large)

Mutual-exclusivity with Image Choices. Canvas classes: `wpforms-icon-choices`, `wpforms-icon-choices-{style}`, `wpforms-icon-choices-{size}`, plus inline `color` style on the icons via the color picker.

### Architecture decision needed

The Image/Icon Choices canvas effect in the real plugin is a full DOM re-render. For snapshots, the cleanest call is to **toggle the field-level classes only** and let CSS handle the visual swap. Re-rendering each `<li>` to inject image/icon placeholder markup is heavy and adds little tutorial value (no real images/icons in snapshot anyway). Discuss this with Umair before writing the canvas-side code for sub-controls — he may be fine with class-only toggles.

## After Checkbox — next field order (rough)

Pick from this list in order, complete each fully:

1. **Radio** — should largely inherit from Checkbox work (universal `choices-*` handlers already cover it). Verify Add/Remove/Edit/Default + Image/Icon all work after Checkbox is done. Likely 1–2 small radio-specific gaps.
2. **Multiple Choice (`select` field-type)** — Dropdown Style (Classic/Modern), Multiple Options Selection, Dynamic Choices. Style toggle requires Choices.js library to truly render — discuss scope: panel-only class toggle, or skip.
3. **Date/Time** — Date Format (m/d/Y format strings for both Date Picker and Date Dropdown variants), Time Format (12h/24h), Limit Days controls
4. **Email** — already mostly done; audit if anything left (Default Method, Default Email handler)
5. **Address** — Geolocation toggle (Address Map). Likely just a panel-row reveal.
6. **Phone** — Format done; check if anything else (Default Country?)
7. **Number** (not slider) — Min, Max, Placeholder already universal
8. **Pagebreak** — Progress Indicator (no JS handler in plugin; CSS-only mirror needs custom), Indicator Color (color picker), Indicator Color Completed, Nav Align (button alignment swap), Title, Prev/Next text inputs
9. **Repeater** — MaxRows, Button Style, Add/Remove button text
10. **Signature** — likely simple (color, size)
11. **HTML / Content / Divider / Hidden** — mostly no canvas effect, fast pass

## Don't redo / don't do

- Don't redo any transition already shipped (see "What's shipped").
- Don't push to GitHub (user's work account is read-only — see memory).
- Don't run preview QC unless Umair asks (he does all visual QC on snapshot interactivity).
- Don't add CSS Classes mirroring (metadata-only — never renders).
- Don't add Conditional Logic / Quiz / Survey / AI mirroring without explicit ask.
- Don't migrate or rewrite the snapshot capture pipeline. Snapshots are static fossils; interactivity lives in the shared script.
- Don't refactor `interactivity.js` "for cleanliness." It's append-mostly. Each transition is a registry entry — keep that shape.

## How to start the new session

Suggested opener:

> "Continuing snapshot interactivity work — see `SNAPSHOT-INTERACTIVITY-HANDOFF.md` at repo root. Read it. First task: diagnose why Checkbox Add/Remove buttons aren't working (live test in snapshot, console log the click flow). Don't write fixes until you've isolated the cause. Then propose the fix in 3 lines and wait for approval."

After Add/Remove is fixed, batch Image Choices toggle + 3 sub-controls (style, hide labels, default style class). Then Icon Choices the same way. User does visual QC on each.

Pace: **3–5 transitions per session**, each user-verified visually, before moving on. Don't batch field-completions across sessions — one field, complete, sign off, next.
