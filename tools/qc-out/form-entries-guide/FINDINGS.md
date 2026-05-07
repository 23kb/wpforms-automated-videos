# Transition QC findings — form-entries-guide

Captured 2026-05-07 via `tools/transition-qc.js`. 5:01 runtime, 60 events, 4 snapshot swaps (more than checkboxes' 2). All swaps used `swapStyle: morph` from manifest defaults — different from checkboxes which used per-chapter `swapStyle: 'fast'` overrides.

This is the comparison data for whether `morph` is meaningfully better than `fast`.

## Events

- **30.31s** — chapter-break: glide
- **46.58s** — swap morph → admin-entries-overview (mid-effect from `where-entries-live.js` chapter)
- **55.45s** — swap morph → admin-entries-list (chapter boundary 1→2)
- **81.81s** — chapter-break: glide
- **95.41s** — swap morph → admin-entry-detail (chapter boundary 3→4)
- **132.26s** — swap morph → admin-tools-export (chapter boundary 5→6)

## Diagnosis — frame by frame

### Swap 1 (46.58s, morph, mid-effect `swapToSnapshot('admin-entries-overview')`)

| Frame | t | Description |
|---|---|---|
| f_022 | ~46.5s | Outgoing fading, content still readable at ~50% |
| f_026 | ~46.7s | Mac frame title bar + edges visible; body interior almost completely flat cool-paper. Brief gap. |
| f_028 | ~46.9s | Incoming at ~30% opacity, mesh-bg/parchment edges visible around mac frame |
| f_036 | ~47.5s | Full content visible |

**Mid-effect swap window: ~1 second.** Smallest gap of the four. Mac frame partial-visible throughout. Mesh-bg visible at edges.

### Swap 2 (55.45s, morph, chapter-boundary `where-entries-live` → `form-entries-list`)

| Frame | t | Description |
|---|---|---|
| f_020 | ~54.3s | **Full-screen flat lavender. NO Mac frame, no chrome, no mesh-bg, just cover color.** |
| f_023 | ~54.5s | Same — pure flat cool-paper |
| f_026 | ~54.7s | Mac frame edges returning, body still empty |
| f_030 | ~55.0s | Incoming at low opacity, mac frame back |
| f_038 | ~55.5s | Full visible |

**Chapter-boundary swap window: ~1.2 seconds, with ~0.5s pure-flat-color (no chrome at all).** Worst of the four. Hypothesis: chrome (mac frame, watermark) is unmounted at chapter teardown, then remounted post-swap, so during the swap there's a stretch where the cover overlays bare body.

### Swap 3 (95.41s, morph, chapter-boundary `search-and-filter` → `entry-detail`)

| Frame | t | Description |
|---|---|---|
| f_022 | ~95.5s | Incoming View Entry page at ~40% opacity, mac frame visible |
| f_028 | ~96.0s | More opaque, smooth crossfade in progress |
| f_038 | ~96.7s | Full visible |

**Cleanest swap.** Mac frame visible throughout. Looks close to a real crossfade. Why this one is clean and swap 2 isn't is unclear without deeper trace — same code path on paper.

### Swap 4 (132.26s, morph, chapter-boundary `entry-detail` → `export-entries`)

| Frame | t | Description |
|---|---|---|
| f_022 | ~132.5s | Full-screen flat pale background, NO Mac frame |
| f_028 | ~133.0s | **NEW BUG: Incoming Tools page rendered at wrong scale/position. Sidebar partially cropped, content cropped, iframe at default 1x1 but stale offset from previous camera.** |
| f_038 | ~133.7s | Tools page settled at correct framing |

**~600ms of misaligned content during swap 4.** New chapter starts before previous camera transform is reset; iframe shows whatever the old transform pointed at on the new doc. Then next `zoomTo` reframes correctly. This is the camera-state-not-carried bug from `repo-audit-findings.md` §17 in the wild.

## What this changes about the diagnosis

**`morph` is not meaningfully better than `fast`.** Both produce ~1-1.5s flat-color windows with body content gone. Differences are noise within the same architectural failure mode.

**Two failure shapes worth distinguishing in Phase C:**

1. **Mid-effect swaps (where-entries-2 type):** chrome stays mounted, gap is shorter (~1s), only body is empty. **Less bad.**
2. **Chapter-boundary swaps:** chrome is unmounted then remounted, gap is longer (~1.2s), and includes ~0.5s of pure-flat-color full-screen wipe. **Worst case.**

**The camera-state bug (swap 4) is independent.** Even if Phase C closed the cover gap, swap 4 would still flash misaligned content because the new chapter inherits a stale transform on a fresh iframe doc. Fix: either reset transform at swap start AND set first-zoom from a consistent default, or carry camera state via `swapMorph`'s captured-transform path (which already exists but wasn't used here for some reason — investigate during Phase C).

## Per-swap variability

The 4 morph swaps in this video produced 3 distinct visual behaviors:
- Swap 1: ~1s gap, chrome partial
- Swap 2: ~1.2s gap, chrome fully gone
- Swap 3: clean-ish crossfade, chrome stable
- Swap 4: gap + camera misalignment

Same code path supposedly. The variability suggests **race conditions in the swap sequence** — chrome remount, iframe load, fade-in, cover-drop are all firing on independent timers and sometimes one wins, sometimes another. **Phase B's paused-timeline driver puts all of these on a single owner** which should eliminate the variability.

## Confirms Phase C requirements

1. Pre-load incoming snapshot to hidden iframe (closes the iframe-load wait that's the bulk of every gap).
2. Chrome (mac frame, watermark, mesh-bg) MUST stay above cover — never unmount during swap. If chapter teardown is currently unmounting them, that's a bug.
3. Camera transform carried by default — no opt-in via `morph` style only. Transform-carry should be the floor, with style choices on top.
4. Cover should ideally not be needed at all — two-iframe crossfade between hidden-loaded incoming and outgoing makes cover obsolete.
5. Race-condition cleanup via Phase B paused-timeline: cover, fade-in, fade-out, chrome-remount all sequenced on one timeline, not independent timers.

## Files captured

- `recording.webm` (gitignored, 14.8 MB)
- `events.json` (60 events)
- `console.log` (extracted but not committed; available locally)
- `frames/swap1/`, `frames/swap2/`, `frames/swap3/`, `frames/swap4/` (gitignored)
