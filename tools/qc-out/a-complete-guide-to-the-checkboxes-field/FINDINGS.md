# Transition QC findings — a-complete-guide-to-the-checkboxes-field

Captured 2026-05-07 via `tools/transition-qc.js`. Full playback recorded headless at 1920×1080. 5:01 total runtime, 82 tagged events, 223 console lines.

Frames extracted at 15fps around two snapshot swaps and one chapter-break for comparison. All inferences below are grounded in the captured frames in `frames/swap1/`, `frames/swap2/`, `frames/glide1/`.

## Events

- **0.06s** — `[motion] active cadence breakStyle=glide swapStyle=morph coverColor=#F4F7FB`
- **45.54s** — `swapSnapshot → builder-field-options-checkbox (style=fast)`
- **61.36s** — `chapter-break: glide`
- **78.48s** — `chapter-break: glide`
- **104.83s** — `chapter-break: glide`
- **118.58s** — `swapSnapshot → builder-fields (style=fast)`

Two snapshot swaps. Three chapter-breaks (all glide).

Note on `style=fast`: manifest defaults to `morph`, but `edit-label.js` and `save-checkboxes-field.js` explicitly set `swapStyle: 'fast'` per-chapter. Author chose fast over morph deliberately — likely because morph still has the same architectural issue and `fast` at least keeps the dwell short.

## Diagnosis — frame by frame

### Swap 1 (45.54s, builder-fields → builder-field-options-checkbox, style=fast)

| Frame | Wall-clock | Description |
|---|---|---|
| f_022 | ~45.47s | Outgoing iframe ghosted at ~30% opacity, `fadeOutIframe(160)` mid-fade. Mac frame still visible. Form contents barely readable. |
| f_026 | ~45.73s | **Stage almost completely flat cool-paper.** Title bar (`Customize the Checkboxes field`) and watermark are still hanging on, but the entire body interior is empty. Mac frame outline gone. |
| f_030 | ~46.00s | Mac frame outline back (re-mounted), but body interior still empty cool-paper. Iframe is loading. |
| f_036 | ~46.40s | New content fully visible. **Snapped in at full opacity** — fade-in lasts ~3 frames @ 15fps which the 67ms-per-frame sampling misses. |
| f_045 | ~47.00s | Same content, slightly different framing — iframe at 1x scale, no zoom yet. |
| f_060 | ~48.00s | New chapter's first `zoomTo` settled. Camera now framing the field-options panel. |

**Total user-perceived seam: ~1.5 seconds.** From the moment the outgoing fade starts (45.4s) to the moment the new chapter's camera settles (~47s).

### Swap 2 (118.58s, builder-field-options-checkbox → builder-fields, style=fast)

| Frame | Wall-clock | Description |
|---|---|---|
| f_023 | ~117.53s | **Pure flat cool-paper. No Mac frame, no title bar, no chrome, no watermark.** The cover is full-screen z:999 and its background covers everything. |
| f_028 | ~117.87s | Mac frame + title bar back, body still empty. |
| f_038 | ~118.53s | New content visible, snapped in. Field options panel visible at default 1x zoom (different framing than next chapter wants). |

Worse than swap 1: at f_023 the entire stage is flat, including the Mac chrome. The cream cover at z:999 overlays the still-mounted Mac frame elements, hiding them. This is **the page-refresh feel** — the user described.

### Glide chapter-break (61.36s, no snapshot change)

| Frame | Wall-clock | Description |
|---|---|---|
| f_018 | ~61.20s | UI zoomed, Pizza Toppings panel visible, label reading "Pizza Toppings". |
| f_024 | ~61.60s | Mid smooth-pan. UI still readable, camera mid-flight. |
| f_030 | ~62.00s | Reframed at new zoom, focus on Choices column. |

Glide is **clean**. Zero gap. Smooth pan. This is what we want for everything. The Hyperframes-smooth feel.

## Root causes

The snapshot swap path produces the seam. The chapter-break path is fine.

1. **`document.body.innerHTML = ...` in `engine/engine.js loadSnapshot()`** wipes the entire stage including chrome, watermark, mesh-bg. The cover at z:999 is what's supposed to hide this — but the cover background color (`coverColor: #F4F7FB`) is exactly what we see in the empty frames. That confirms: **the page-refresh feel IS the cover doing its job**. The cover hides the wipe, but the cover itself is a flat color. Job done correctly — wrong job.
2. **Cover hides Mac chrome too.** Because cover is full-screen z:999, it covers the watermark (z:lower) and Mac-frame elements. So during the swap the user doesn't see "loading state inside an app" — they see "the app is gone, here's a flat color." This is the most damaging part of the perceived quality.
3. **No camera continuity across swap.** Frame 22 is zoomed in; frame 38 is at 1x. The new chapter's first `zoomTo` re-establishes framing from scratch. `swapMorph` in transitions.js was supposed to capture/restore the outgoing transform but isn't being used here (chapters opted for `fast`).
4. **Iframe load wait is ~600ms** (frame 26 to frame 36). Most of the seam time is the new iframe's network/parse/render budget. Pre-loading the next snapshot to a hidden iframe would close this gap to a single repaint.

## What this confirms about Phase B and Phase C

- **Phase B's paused-timeline driver doesn't directly fix the swap seam.** It enables Phase C.
- **Phase C must:**
  1. **Pre-load the incoming snapshot to a hidden iframe** during the previous chapter's last 2 seconds. Swap becomes opacity flip + Flip animation, not a load wait. Closes the ~600ms gap.
  2. **Keep Mac chrome / watermark / mesh-bg ABOVE the cover** (or stop using a cover at all in favor of crossfade between two iframes). Stage frame stays visible throughout. No "the app vanished" feel.
  3. **Carry camera transform across swap** as `morph` was meant to. Make this default, not opt-in.
  4. **Carry named "carry" elements across swap via Flip-bridge** (the killer feature). Pre-clone outgoing element to parent doc, swap iframe underneath, Flip clone onto target.
- **`swapStyle: 'fast'` should retire** once Phase C ships. It's a workaround for `morph`/`cover` being too slow. The new default makes it unnecessary.

## What this confirms about engine.js zoom

- The hard-zoom-out reset on every non-smooth zoomTo (engine.js:135–141) appears within snapshot swaps too — frame 38 to frame 45 of swap 1 shows the iframe at 1x before the new chapter's zoomTo runs. That's the 20ms-snap-then-animate behavior. **Phase B should put zoomTo on the timeline driver and remove the snap.**
- The default `smooth: false` is wrong for chapters that intend smooth continuity. **Phase B should re-evaluate the default.**

## Files captured

- `recording.webm` (15.2 MB, 5:01)
- `events.json` (82 events)
- `console.log` (223 lines)
- `frames/swap1/f_001.png` through `f_075.png` (5s @ 15fps around 45.54s seam)
- `frames/swap2/f_001.png` through `f_075.png` (5s @ 15fps around 118.58s seam)
- `frames/glide1/f_001.png` through `f_060.png` (4s @ 15fps around 61.36s glide for comparison)
