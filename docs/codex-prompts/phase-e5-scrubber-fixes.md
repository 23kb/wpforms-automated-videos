# Codex prompt — Phase E.5 follow-up: scrubber chapter-clock + progress-bar UX

Self-contained prompt. Apply to the same branch `phase-e5-real-pause-seek` already in flight at branch tip `4f7de8a` (HEAD as of this prompt). Do NOT branch from main; the four follow-up commits here build on Codex's Phase E.5 + Claude's UX iteration.

Phase E.5 itself shipped the pause/seek/camera-on-driver work and is correct at the runtime layer. The remaining issues are scrubber-UI-only and they live in `tools/preview-client.js` + `tools/scrubber-html.js`. No runtime, engine, scenes, or video-package edits.

---

## What's broken (Umair's visual QC)

Umair has been re-testing on `serve.js` running at `:4321`, hitting `http://localhost:4321/scrubber?video=wpforms-rest-api-overview`. He's done four prior iterations with Claude (all on `phase-e5-real-pause-seek`):

- `f94f386` — wallClock honors boot + pause.
- `0d1e7b2` — registered timelines hidden pre-boot + freeze on pause.
- `2b5319d` — wallClock resets at chapter boundary (when `currentChapterIndex` changes).
- `4f7de8a` — wallClock resets on every Next/Prev/Restart click before delegating seek.

After all four, Umair reports: **"still not fixed."** The remaining ask, verbatim: "each time the buttons 'Next', 'Restart', 'Prev' are clicked, the wallclock has to be set to 0."

Claude's headless probe shows the click-time wallClock IS resetting (after a 600ms wait the value reads `~0.6s` for all three buttons, confirming reset-then-tick). So either:

1. Umair is looking at a different visual indicator than `wallClock` — most likely the **progress-bar fill** (`#clockFill` in `tools/scrubber-html.js`) which uses a misleading formula: `width = (wallClock / max(10, wallClock)) * 100%`. That formula always reads `>= some%` and approaches 100% as wallClock grows; it does NOT visibly reset to 0 even when wallClock does, because the denominator scales with the numerator. **This is the bug the user is seeing.**
2. OR the **registered-timeline strip** (camera adapter) keeps showing high progress across chapters because the camera timeline was registered at `engine.loadSnapshot` (once per snapshot load), so it persists across same-snapshot chapter transitions. When the user clicks Next/Prev/Restart, the camera row in the scrubber doesn't visually reset.
3. OR the **chapter-name pill** (`#chapterNow`) shows `chapter 1/0` pre-boot because `chapterCount` is 0 and `currentChapterIndex` is 0 → displayed as `1/0` — visually wrong.

Confirm with Umair what he's looking at if needed; the most likely culprit is (1) given the wording. Fix all three.

## Files you may edit

- `tools/preview-client.js` — already edited four times by Claude. Continue.
- `tools/scrubber-html.js` — likely the main fix surface for the progress-bar formula.

## Files you MUST NOT touch

- Anything else. No runtime, no engine, no scenes, no videos, no docs, no validators, no vendor.

## Required fixes

### 1. Progress-bar fill must visually reset to 0 on chapter clock reset

In `tools/scrubber-html.js`, current formula at line ~103:

```js
clockFill.style.setProperty('--p', Math.min(100, ((state.wallClock || 0) / Math.max(10, state.wallClock || 0)) * 100) + '%');
```

This is broken. `wallClock / max(10, wallClock)` ≈ 1 once wallClock > 10s, and never visibly drops on a chapter reset because both numerator AND denominator are equal.

Replace with a chapter-aware fill that:
- Uses a fixed visual ceiling (e.g. 60s — most chapters are under that).
- Or uses `state.chapterDurationEstimate` if you add it to the state payload.
- Or shows a thin "live cursor" bar that grows from 0% on each reset and visibly snaps back when wallClock=0.

Recommended: a fixed 60s ceiling; clamp at 100%. Author can override by extending state with chapter-specific durations later.

```js
const FILL_CEILING_S = 60;
clockFill.style.setProperty('--p', Math.min(100, ((state.wallClock || 0) / FILL_CEILING_S) * 100) + '%');
```

Crucial: when wallClock is `0`, the bar must read **0% wide** (visually empty). Verify by clicking Restart and confirming the orange fill collapses to width 0.

### 2. Display the wallClock value as text alongside the bar

The current scrubber shows the bar but not the numeric wallClock value visibly to the user. Add a text display (e.g. `0:03 / 1:00`, or just `3.05s`) inside or above the `#clockFill` row. Format as MM:SS or seconds with one decimal — Codex's call.

This makes the reset behavior obvious to the user. Right now Umair has no way to see the actual wallClock value; he only sees the bar fill, and the fill is broken (per #1).

### 3. Registered-timeline rows clear on chapter-clock reset

In `tools/preview-client.js` `timelines()`, currently returns all entries in `frameDriver.registry`. On chapter transition / Next-Prev-Restart click, the chapter clock resets — but if a registered timeline survives the transition (e.g. the `camera` adapter registered at `engine.loadSnapshot` for the whole video), its `(performance.now() - entry.t0)` keeps growing.

Add a chapter-scoped filter: only show timelines whose `t0 >= chapterStartedAt`. Camera (registered at video-load) will be filtered out post-first-chapter-reset; chapter-local registered timelines (Phase B's pilot beats) stay visible.

```js
function timelines() {
  if (!bootedAt) return [];
  const registry = window.__hfTimelines && window.__hfTimelines.registry;
  if (!registry || typeof registry.entries !== 'function') return [];
  const liveLockedMs = pausedSince != null ? performance.now() - pausedSince : 0;
  return Array.from(registry.entries())
    .filter(([id, entry]) => Number(entry?.t0) >= (chapterStartedAt || 0))
    .map(([id, entry]) => { /* same as before */ });
}
```

### 4. Chapter-name pill must be sane pre-boot

In `tools/scrubber-html.js`, the `#chapterNow` pill currently reads `chapter ${idx + 1}/${state.chapterCount || names.length || 0}` which displays `chapter 1/0` before the chapter list is known. Change to:

- Pre-boot or zero count: pill text = `—` (em dash) or hide entirely.
- Booted with count: `chapter ${idx + 1}/${count}`.

### 5. Optional but encouraged: visible "PAUSED" overlay on the iframe

When `state.paused === true`, dim the iframe (`opacity: 0.4` or a black 30%-alpha overlay) so the user has visual confirmation pause took effect. Pure CSS, no DOM mutation in the iframe.

## Acceptance — REJECT if any fails

```bash
# Pre-merge: validators + smoke must still pass on the same 7 targets.
for slug in a-complete-guide-to-the-checkboxes-field wpforms-rest-api-overview creating-first-form build-forms-faster-with-wpforms-ai _phase-c-editorial-pilot form-entries-guide form-notifications; do
  node tools/validate-video.js "$slug" || exit 1
  node tools/check-video-playback.js "$slug" --seconds 30 --allow-resource-404 2>&1 | grep -E '"(sceneBooted|bootError|pageErrors|consoleErrors)"'
done
```

**Visual acceptance (the gate):** restart `serve.js`, open `http://localhost:4321/scrubber?video=wpforms-rest-api-overview`, click Start, wait ~5s. Then:

1. Click **Restart** — orange fill bar must visibly collapse to 0% width and the numeric display must read `0.0s` (or `0:00`). Then the bar grows fresh from 0%.
2. Click **Pause** — orange fill freezes (no growth). Click **Resume** — fill resumes from frozen position.
3. Click **Next** — fill collapses to 0%. Numeric reads `0.0s`. Iframe transitions to next chapter; fill grows fresh.
4. Click **Prev** — same as Next; fill collapses to 0%.
5. Pre-boot (before Start click), the chapter pill must NOT read `chapter 1/0`. It reads `—` or is hidden.

## Reporting back

When done:

1. Commit on `phase-e5-real-pause-seek`. One commit per fix is fine; or one combined "phase E.5: scrubber UX hardening" commit. Bisect-friendly preferred.
2. Reply with: branch tip SHA, files changed (should be only the two listed), validator + smoke output for all 7 targets, a short description of what each fix does.
3. Do NOT push to remote.

## If you get stuck

- **The registered-timeline filter (#3) breaks Phase B pilot beats.** The Phase B AI postIntro registers timelines DURING `effect()` execution — those `t0` values will be `> chapterStartedAt`, so they pass the filter. Camera (registered at video-load) won't. If you find a chapter-local registered timeline being filtered out incorrectly, the bug is in chapter-clock reset timing — make sure `chapterStartedAt` is set BEFORE the chapter's `effect()` runs (i.e., the chapter-loop boundary in `runtime/chapter-runner.js` / `runtime/player.js`). Don't edit those files; instead loosen the filter to `t0 >= chapterStartedAt - 100ms` to absorb any race.
- **Numeric display flickers between values.** State is published every 500ms; rendering should match. If you see flicker, throttle the render loop or lerp.
- **The iframe-dim overlay (#5) blocks the pause button.** Make the overlay `pointer-events: none`. The pause button lives outside the iframe in the panel.
