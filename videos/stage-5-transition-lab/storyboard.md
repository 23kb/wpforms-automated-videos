# Stage 5 transition lab — storyboard (slice 5b-1.6)

Lab harness for picking a transition style for the
`runtime/player.js` path. Six chapters: four on the same snapshot to
exercise `breakStyle`, two snapshot swaps to exercise the (now-honored)
`swapStyle`. **Not a production video.** No intro / postIntro / teaser /
outro / BGM / narration.

## What changed in slice 5b-1.6

- `runtime/player.js#transitionSnapshots()` now honors `swapStyle`. When
  `manifest.defaults.swapStyle` (or `?swapStyle=…` URL override) is set,
  it routes through `runSwapTransition(style, doSwap)` from
  `runtime/transitions.js`. The inner `doSwap` mirrors the
  `runtime/scene-helpers.swapSnapshot` recipe — `installFlashGuard` →
  `loadSnapshot` (body-wipe) → re-mount mesh / chrome / watermark →
  chapter `setup(ctx)` under the cover → `removeFlashGuard`. The
  setup-under-cover invariant is preserved.
- When `swapStyle` is unset, the legacy paper-cover hardfix path runs
  unchanged — full backward compatibility for videos that haven't opted
  in yet.

## Chapters

| # | id                      | snapshot                                | banner | camera focus        |
|---|-------------------------|-----------------------------------------|--------|---------------------|
| A | `a-empty-header`        | `wpforms-ai-builder-empty`              | red    | AI chat header (top) |
| B | `b-empty-panel-wide`    | `wpforms-ai-builder-empty` (SAME)       | amber  | full AI panel (wide) |
| C | `c-empty-prompt`        | `wpforms-ai-builder-empty` (SAME)       | yellow | prompt textarea (mid)|
| D | `d-empty-send`          | `wpforms-ai-builder-empty` (SAME)       | green  | Send button (btm-rt) |
| E | `e-generated-preview`   | `wpforms-ai-builder-feedback-generated` | blue   | generated form preview |
| F | `f-empty-back`          | `wpforms-ai-builder-empty`              | purple | AI chat header (top) |

Each chapter's `setup(ctx)` removes any prior `#stage5-marker` and
appends a fresh one, so banner color is the source of truth for
chapter identity (red → amber → yellow → green → blue → purple).
Camera positions are far apart on purpose: header vs wide-panel vs
prompt-textarea vs send-button is much more dramatic than the previous
prompt→send-only motion, so breakStyle differences are visible.

## Boundary matrix

| boundary | type            | controlled by | window in playback |
|---|---|---|---|
| A → B | same-snapshot | `breakStyle` | ~3–6 s |
| B → C | same-snapshot | `breakStyle` | ~6–9 s |
| C → D | same-snapshot | `breakStyle` | ~9–12 s |
| D → E | snapshot-changed | **`swapStyle`** (now honored) | ~12–16 s |
| E → F | snapshot-changed | **`swapStyle`** (now honored) | ~16–20 s |

Three same-snapshot breaks per playthrough — one URL run produces three
data points for any given `breakStyle`. Two swap-style boundaries per
playthrough (different directions: empty → generated, generated →
empty) — one URL run produces two data points for any `swapStyle`.

## URLs for review

(start the dev server: `node serve.js` — port 4321)

Default (`breakStyle=soft-dolly`, `swapStyle=cover` from manifest):
- `http://localhost:4321/scenes/player.html?video=stage-5-transition-lab`

Five `breakStyle` strips (each fixes swapStyle to the manifest default
`cover` so only the breakStyle differs):
- glide:      `…?video=stage-5-transition-lab&breakStyle=glide`
- hold:       `…?video=stage-5-transition-lab&breakStyle=hold`
- soft-dolly: `…?video=stage-5-transition-lab&breakStyle=soft-dolly`
- dolly:      `…?video=stage-5-transition-lab&breakStyle=dolly`
- whip:       `…?video=stage-5-transition-lab&breakStyle=whip`

Five `swapStyle` strips (each fixes breakStyle to `soft-dolly` so only
the swapStyle differs). **`cover` is the plain fade-out → fade-in
candidate** the operator asked about:
- cover (fade-out/fade-in): `…?video=stage-5-transition-lab&swapStyle=cover&breakStyle=soft-dolly`
- fast:                     `…?video=stage-5-transition-lab&swapStyle=fast&breakStyle=soft-dolly`
- morph:                    `…?video=stage-5-transition-lab&swapStyle=morph&breakStyle=soft-dolly`
- push:                     `…?video=stage-5-transition-lab&swapStyle=push&breakStyle=soft-dolly`
- whip:                     `…?video=stage-5-transition-lab&swapStyle=whip&breakStyle=soft-dolly`

## Source-of-truth note for review

- Probe screenshots in `probe-out/stage-5-transition-lab/<window>/shots/`
  capture every 200 ms at 100% page zoom — banner color flicker / brief
  raw-iframe reveals / black frames are visible there.
- The `summary.txt` flash-candidate count is the same permissive
  heuristic noted in earlier slices. It fires on every sample where the
  iframe is visible and no `.fade-cover`/`.swap-cover`-classed cover is
  opaque. Treat the count as noise unless a narrow boundary window
  shows a non-zero spike *at the boundary*.

## Out of scope

- WPForms AI manifest — unchanged this slice. Once the operator picks a style
  from the screenshot strips it's a one-line manifest edit.
- Existing video chapters, snapshots, `engine/*`, descriptor /
  `chapter-runner.js` behavior — all untouched.
- New captures.

## Editorial decision (owned by the operator)

After review:

1. Pick the `breakStyle` for `videos/build-forms-faster-with-wpforms-ai/manifest.json`
   `defaults.breakStyle` (one of `glide` / `hold` / `soft-dolly` /
   `dolly` / `whip`).
2. Pick the `swapStyle` for `defaults.swapStyle` (one of `cover` /
   `fast` / `morph` / `push` / `whip`). The current value is `morph` —
   after this slice, that value is now actually honored on the
   player.js path, which is itself a behavioral change worth reviewing.
