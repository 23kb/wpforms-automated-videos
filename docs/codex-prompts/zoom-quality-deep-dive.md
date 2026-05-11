# Iframe Zoom Quality — Architecture Deep Dive

**Paste into a fresh session (Codex with Opus 4.7 or strongest available, extra-high effort). This is a real architectural problem and the prior session called it "unsolvable" too early. The user is right: HTML rendering at zoom IS sharp natively (browser Ctrl+ proves it), so there's a working path we haven't found yet. Find it.**

You are at `C:\Users\PC\Desktop\Video Project - HTML only` on branch `audit-shape-2026-05-10`. User is Umair — direct, "DO NOT half ass it. I will know." This is high-stakes work: it gates the entire single-HTML video architecture for all future tutorial videos.

## The problem (verified, not speculation)

When the camera in a primitive QC page zooms into a small element of a WPForms admin snapshot loaded in an iframe, the rendered text becomes **visibly pixelated** — jagged letter edges, no subpixel AA, looks like an upscaled bitmap. Confirmed by Umair on the Entries page:

> Image showed Entry list with @ symbols and letter forms showing clear stair-step pixelation at ~3-4× zoom level.

Reproduction:
1. Open `http://localhost:56480/videos/_qc-primitives/camera-to-element.html`
2. Click "Entries default" (loads admin-entries-list snapshot)
3. Click "Entry email" — `cameraToElement(sel, { fill: 0.76, maxZoom: 3.8 })` zooms to ~3-4× on a small data cell
4. Observe pixelated text in the zoomed-in view

Interactions (Wave 1 + Wave 2 Batch A) DO NOT have the issue because they don't zoom — they operate at zoom 1 throughout, where text is sharp.

## The architectural challenge

An iframe + CSS `transform: scale(N)` is fundamentally pixel-doubled at zoom > 1 because:
- Browser rasterizes iframe contents ONCE at the iframe's CSS dimensions (1280×720)
- CSS transform creates a compositor layer with the rasterized texture
- GPU samples that texture at the transformed scale → bilinear upscaling = blur/pixelation

**But Umair's point is correct:** browser-native zoom (Ctrl+ in Chrome) produces sharp HTML at any zoom because it RE-RASTERIZES at the new size. There must be a path to achieve the same effect programmatically.

## What the prior session ruled out (verified — don't repeat)

1. **CSS `transform: scale(N)` on iframe** — pixel doubles, confirmed visible aliasing at 3-4×.
2. **OVERSAMPLE pattern** (iframe at 5120×2880 + body `zoom: 4` + transform scale-down to fit) — produced GPU resampling artifacts that killed subpixel AA at REST (color fringing visible at zoom 1 on every QC page). Already reverted.
3. **CSS `zoom` on iframe body alone** — broke WPForms admin layout. Test result: applying `body.style.zoom = '3'` on `admin-entries-list` snapshot made the wpforms-field 694px → 96px wide and wrapped vertically. WPForms admin uses fixed/absolute positioning that doesn't tolerate the logical-pixel squeeze.
4. **`will-change: transform`, `image-rendering` hints, `backface-visibility: hidden`** — all in place; can't add pixel data the source raster doesn't have.

## Approaches to EXPLORE — find one that works

You are NOT bound to these. Find the right one or invent a new one. Cite test results for each.

### Approach A: Dynamic iframe resize on settle

When camera transitions to zoom > 1:
- During the tween: use CSS transform (smooth, accepts mid-animation softness)
- At settle (`onComplete`): set iframe `width` + `height` HTML attributes (not CSS!) to oversampled values (e.g., width × N, height × N), clear CSS transform, position iframe to show focused region

The hypothesis: setting iframe width/height attributes triggers an internal viewport change → iframe re-lays out at the new size → text re-rasterizes at higher density.

Pitfall to verify: WPForms admin may render DIFFERENTLY at 5120×2880 viewport (e.g., desktop-class layouts vs collapsed sidebar at 1280×720). If layout shifts at the new viewport, you see a visual "jump" at the moment of settle. Measure and report.

### Approach B: CSS `zoom` on `html` element (not body)

The body `zoom` test broke layout because content was positioned relative to a now-smaller logical viewport. Try `documentElement.style.zoom` instead — `html` is the root, may handle fixed/absolute positioning differently. WPForms admin's `#wpwrap` is body's direct child; zooming html should scale everything including fixed elements without breaking the inner layout.

Test exactly the same way: `iframe.contentDocument.documentElement.style.zoom = '3'`, then measure a known element's getBoundingClientRect to see if it scaled 3× cleanly or got mangled.

### Approach C: Iframe `<meta name="viewport">` injection + dpr trick

Inject a viewport meta tag into the snapshot doc that says `width=1280, initial-scale=1` — but also experiment with custom DPR hints. Mobile browsers render HTML at 2× or 3× DPR for retina displays; the same mechanism may be invokable here.

Try: inject `<meta name="viewport" content="width=1280, initial-scale=3">` and see if browser re-rasterizes at 3× DPR.

### Approach D: CSS3D / SVG rendering of iframe contents

`<foreignObject>` in SVG can render HTML, and SVG scales vector-sharp. Render the iframe's contentDocument inside `<foreignObject>` of an SVG element, then scale the SVG via transform. SVG transform DOES re-rasterize on zoom.

Pitfall: getting the live WPForms admin DOM into `<foreignObject>` requires either cloning (loses interactivity) or some shadow-render trick. Investigate.

### Approach E: Capture snapshots at multiple resolutions

Pre-render each snapshot at 1×, 2×, 4× resolution (separate captured HTML files). At zoom transitions, swap the iframe to the appropriate resolution version + scale-down. This is heavier on disk/network but each level is natively sharp.

The capture pipeline already exists in `tools/capture-snapshot.js`-style utilities. Investigate whether re-capturing at 2× or 4× via Puppeteer is feasible.

### Approach F: Print-style rendering

`document.execCommand('print')` or `window.print()` renders HTML at vector quality. Some browsers expose a `paintWorklet` or print-resolution canvas. Investigate whether print-pipeline rendering can be captured into a canvas/image at high resolution.

### Approach G: Use `<object>` or `<embed>` instead of `<iframe>`

Different browser compositing behavior. Test if `<object data="..." type="text/html">` rasterizes differently from `<iframe>` under transform.

### Approach H: ResizeObserver-driven re-render

Force the iframe to re-render by changing its size via ResizeObserver / RO loop. When zoom > 1, periodically resize the iframe attributes to provoke re-rasterization.

### Approach I: Browser-native zoom API

There may be a `window.zoom` or `document.zoomLevel` API that triggers the same path Ctrl+ uses. Investigate browser-specific extensions (Chrome's `chrome.windows` API requires extension permissions but in dev mode might be reachable). `Element.scrollIntoView({behavior: 'instant'})` doesn't help, but maybe a focused investigation of WebKit/Chromium internals reveals an exposed API.

### Approach J: Two-layer trick — high-res capture on top of iframe

At zoom > 1, replace the iframe view with a high-resolution rendering of just the focused region. Render that region via Puppeteer at 4× and overlay it on top of the iframe.

This is essentially "popOut for camera zoom" — sharp because the overlaid content is rendered fresh at the target size. The iframe stays at its native zoom, the user sees the high-res overlay instead.

## Required reading

1. `videos/_shared/wpforms-interactions.js` — current IframeManager (read the camera transform code, lines 156-180)
2. `videos/_shared/motion-primitives.js#cameraToElement` (line 310) — the function that triggers the problem
3. `videos/_qc-primitives/camera-to-element.html` — the QC page that exposes it
4. `engine/engine.js` — `loadSnapshot` (90), `applyCamera` (71), `zoomTo` (~239). Engine's pattern. Worked for 12 production videos with modest zooms.
5. `snapshots/admin-entries-list/index.html` — the snapshot the user QCs on. Inspect its layout.
6. Browser docs on iframe compositing, CSS `zoom`, `transform`, and rasterization.
7. Puppeteer / playwright API docs if exploring capture-side fixes.

## What "fixed" means

Test on `videos/_qc-primitives/camera-to-element.html` with the Entries page, "Entry email" button (zoom ~3-4×):
- Letter edges are crisp, no stair-step pixelation
- Subpixel AA is preserved (or grayscale AA is sharp at the new density — either is acceptable)
- Text reads as cleanly as it does at zoom 1
- Cross-browser test: Chrome (primary), Edge, Firefox (Firefox is harder; if you have to drop Firefox sharpness, document it)

The bar is "matches what you'd see if you Ctrl+ in Chrome to 300% on the same snapshot." That's the user's reference.

## Hard constraints

1. **Don't break interactions.** All Wave 1 + Wave 2 Batch A QC pages must still pass after your changes.
2. **Don't break at-rest sharpness.** The current OVERSAMPLE=1 + pointer-events guard fix delivers sharp text at zoom 1. Whatever you do at zoom > 1 must NOT regress zoom 1.
3. **Don't break the 4 primitive QC pages just fixed** (pop-out, pop-out-entries, cinematic-flight-inter-snapshot, scattered-canvas-flight).
4. **No defeatism.** "It can't be done with HTML" is the wrong answer. Browser-native zoom proves it can. Find the path.
5. **Cite test evidence for every claim.** When you say "I tried X and Y happened," include the screenshot URL or DOM-inspection output.
6. **Cite filename:line for every code reference.**

## Deliverables

1. **Working architectural fix** to IframeManager + motion-primitives + any necessary QC page updates so that the camera-to-element.html "Entry email" zoom looks crisp.
2. **Visual proof** — screenshot of before/after at the same zoom level, side by side. Or two browser screenshots showing the fix.
3. **`docs/zoom-quality-fix-2026-05-12.md`** — a write-up of:
   - What you tested (each approach A-J or new)
   - What worked, what didn't, with citations
   - The final architecture chosen
   - Tradeoffs and any compromise
   - Cross-browser results
   - Performance impact (memory, animation smoothness, etc.)
4. **Commits**: each meaningful change as its own commit. Final commit closes the issue with the screenshot evidence.

## If you genuinely exhaust all paths

If after deep investigation, NO approach delivers Ctrl+ Chrome-equivalent sharpness, document EXACTLY what is browser-architecturally impossible, with W3C spec or Chromium source code citations. Then propose the closest-to-acceptable compromise (e.g., 2× cap + popOut for closer). But don't bail before truly exhausting the search.

## Time and effort budget

This is foundational. Take 4-6 hours if needed. The cost of a wrong "unsolvable" call is years of soft-text production videos. The cost of an extra session of deep work is one extra session.

Good luck. The user is counting on a real answer.
