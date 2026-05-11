# Storyboard — make-field-required-single-html

**Path:** Tutorial (single-HTML, the NEW default for tutorial work)
**Duration:** ~55 seconds, 3 chapters
**Slug:** `make-field-required-single-html`
**File:** `videos/make-field-required-single-html/index.html`

## Concept

"How to make a form field required" — the most common WPForms how-to. Three chapters: (1) find the field setting in the builder, (2) toggle Required, (3) verify the asterisk shows on the live form.

This is the first tutorial built on the NEW single-HTML architecture. Tests every layer of the library: IframeManager mount + swap, Cursor glide + click, snapshot DOM mutation, popOut for emphasis, markerSweep highlight, narration captions, light camera work.

## Architecture

- Single-HTML, no engine, no manifest.json, no per-chapter .js modules
- Master `gsap.timeline` is the entire video — async/await orchestration in `play()`
- 3 chapters delineated by chapter title cards + narration captions
- Mac-frame chrome around the iframe stage
- Brand sign-off at the end

## Snapshots used (all exist)

1. `builder-fields` — form builder Fields panel, all field types on canvas (Email field at `#wpforms-field-49`)
2. `builder-field-options-email` — Field Options panel for Email field, includes Required toggle at `#wpforms-field-option-row-49-required`
3. `frontend-published-form` — live form embedded on a public WP page

## Chapter 1 — Find the field setting (~12s)

- Chapter title card: "Chapter 1 — Find the field setting"
- Narration caption: "Open your form in the WPForms builder. Click the Email field to reveal its options."
- Cursor glides (with `{ via }` curved arc) to `#wpforms-field-49` (Email field on canvas)
- Cursor clicks with orange ripple
- `IframeManager.swap('builder-field-options-email')` — 450ms crossfade

## Chapter 2 — Toggle Required (~18s)

- Chapter title card: "Chapter 2 — Toggle Required"
- Narration: "Scroll down to find the Required toggle. Switch it on."
- `IframeManager.smoothScrollIntoView('#wpforms-field-option-row-49-required')` — 700ms eased scroll inside the iframe
- Cursor glides to the toggle row, clicks with ripple
- Inline DOM mutation: `.wpforms-toggle-control` gets `.wpforms-toggle-control-checked` class; `input[type="checkbox"]` checked + change event dispatched
- Narration: "A red asterisk now marks the field as mandatory."

## Chapter 3 — Verify on live form (~12s)

- Chapter title card: "Chapter 3 — Verify on the live form"
- Narration: "Now visitors must fill it in before submitting."
- `IframeManager.swap('frontend-published-form')` — 550ms crossfade
- Cursor glides to the Email field on the frontend form
- Final pause to let viewer see the live state

## Sign-off (~3s)

- Mac frame fades out + scales down slightly
- Brand sign-off appears centered: "Required. **Done.**" + "Every visitor will see the orange asterisk."
- Sullie mounts bottom-right (`mountSullieBug` with bounded yoyo float)

## Library calls

- `IframeManager` (load + swap + smoothScrollIntoView + elementToStageCoords + query): 3 snapshots
- `Cursor` class (glide + click + ripple): all chapter cursor work
- `mountSullieBug`: brand anchor at end
- (`popOut` and `markerSweep` reserved for future emphasis beats — current pilot uses light inline highlights)

## Narration

Text files at `videos/make-field-required-single-html/narration/chapter-{1,2,3}.txt`. **MP3s not generated yet** — for the pilot, captions handle the narration. Run `node tts/generate.js --video make-field-required-single-html` once the visual flow is approved to add the audio layer.

## Zoom dependency note

This pilot operates at **zoom 1 throughout** (no `cameraToElement` calls). Per the in-flight zoom-quality work, deep iframe zoom shows pixelation; this pilot avoids that issue while still demonstrating a full tutorial arc. Once the zoom-quality fix lands, the chapter 2 toggle reveal can be enhanced with a 1.5-2× camera zoom on the toggle.

Per Umair's instruction "don't defer the tutorial pilot for zoom — want to see what's pixelated," this pilot reveals the at-rest quality + cursor + interaction quality. Any zoom blur will be obvious once we add camera moves in a v2.

## File outputs

- `videos/make-field-required-single-html/index.html` (~250 lines, single self-contained)
- `videos/make-field-required-single-html/storyboard.md`
- `videos/make-field-required-single-html/narration/chapter-1.txt`
- `videos/make-field-required-single-html/narration/chapter-2.txt`
- `videos/make-field-required-single-html/narration/chapter-3.txt`

## Validation

- Open at `http://localhost:56480/videos/make-field-required-single-html/index.html`
- Visual QC checklist:
  - [ ] Mac frame fades in cleanly
  - [ ] Chapter 1 title card appears
  - [ ] Cursor lands on the Email field (no off-target)
  - [ ] Snapshot swap to field-options-email is a crossfade (no flash)
  - [ ] smoothScrollIntoView gets the Required toggle into view inside the iframe
  - [ ] Cursor lands on the toggle
  - [ ] Toggle visual state changes (checked class applied)
  - [ ] Chapter 3 swap to frontend snapshot is clean
  - [ ] Brand sign-off lands centered
  - [ ] Sullie appears
- Watch for:
  - Cursor frenzy or caret-drift (should not happen — Cursor class has anti-frenzy guards)
  - Cream-flash on snapshot swap (should not happen — IframeManager uses parallel-opacity crossfade)
  - Selector mismatches (if `#wpforms-field-49` or `#wpforms-field-option-row-49-required` don't resolve, the cursor may land at default coords; fix selectors per actual snapshot DOM)
