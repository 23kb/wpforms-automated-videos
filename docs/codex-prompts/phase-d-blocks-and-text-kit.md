# Codex prompt — Phase D: blocks library + Pixel-Point text-kit completion + helper rollout

Self-contained prompt for Codex. Paste verbatim. Codex must read REFACTOR-BRIEF.md and REFACTOR-PROGRESS.md first.

**Phase D edits NO core.** All work is additive under `videos/_shared/blocks/` (new) and `videos/_shared/text-kit.js` (extension), plus targeted documentation. The hard rule: zero edits to `engine/*`, `runtime/*`, `scenes/*`. If you find yourself wanting to touch core, stop and log under "Open questions stack" in REFACTOR-PROGRESS.md.

---

## Context

You are working on a WPForms tutorial-video repo at `C:\Users\PC\Desktop\Video Project - HTML only`. Phases A → B → C have merged into `main`. Phase C merge commit `6176826` (parents `Phase B merge` ↔ phase-c tip `04be1de`). **You are starting Phase D on a fresh branch `phase-d-blocks-and-text-kit` from `main`.**

Read these files in this order before writing any code:

1. `REFACTOR-BRIEF.md` — full mandate, §3 locked decisions, §4 protected core (Phase D may NOT edit any of it), §5 baselines.
2. `REFACTOR-PROGRESS.md` — current state, Phase C completion entry.
3. `repo-audit-findings.md` — focus on §6.3 (Pixel-Point gap — text-kit ships 7 of 24 presets), §8 (capability kits), §13.4 (block registry adoption plan), §14 Phase D bullet.
4. `CLAUDE.md` (project root) — operator manual.
5. `videos/_shared/text-kit.js` — current 7-preset implementation. SplitText is now vendored (Phase A `vendor/gsap/3.15.0/SplitText.min.js`); previous "manual splitting" workaround retires.
6. `videos/_shared/atmospheric.js` — established `tweenInto(tl, opts)` pattern for kit composition.
7. `videos/_shared/effects.js` — Phase A registerEffect pattern (`highlightPulse`, `fieldBurst`, `labelReveal`, `popOutTilt`, `cardReflow`).
8. `videos/_shared/kit.js` — `loadGsap`, `awaitTween`, `withGsapContext`, `registerTimeline`, `registerCameraPose`, `resolveCameraPose`.
9. `docs/postintro-patterns.md` — what makes a postIntro work; helper composition patterns.
10. Pre-existing block surfaces in accepted videos that Phase D will lift to `videos/_shared/blocks/`. Read these only after you can name the exact block you're extracting:
    - `videos/wpforms-rest-api-overview/chapters/_kit.js` — code-card, mac-window patterns.
    - `videos/build-forms-faster-with-wpforms-ai/chapters/_kit.js` — form-card, prompt-bubble.
    - `videos/a-complete-guide-to-the-checkboxes-field/chapters/_kit.js` — pill, choice-row.
    - Other accepted packages — only if they ship a unique block.

The mandate is dual: real-WPForms-UI tutorials AND ad-style release videos. Phase D blocks are reusable editorial chrome — they sit ABOVE the iframe in tutorial mode (`surface: 'iframe'` / `'mixed'`) or stand alone in editorial mode (`surface: 'editorial'`). They do not contain product UI.

## Goal of Phase D

Three deliverables, in dependency order:

1. **`videos/_shared/blocks/` directory** — extract 6–8 reusable editorial blocks from accepted video packages into self-contained modules. Each block is a `mountX({ ... })` function returning `{ el, dispose, tweenInto?(tl, opts) }` where applicable. Document props in `docs/blocks.md` (NEW).

2. **`videos/_shared/text-kit.js` to 24 Pixel-Point presets.** SplitText is vendored (Phase A); the current 7 manually-implemented presets stay supported, the remaining 17 land using `SplitText`. Each preset keeps the existing `tweenInto(tl, opts)` shape for composition with master timelines.

3. **Helper rollout audit** — `popOut`, `cursor.glideTo`, `lineDraw` are underused. Catalog where they could replace plain highlight/click/straight-line patterns in existing videos. Land actual rollout in 1–2 video packages as proof; rest stays as a backlog doc. **Do not migrate every video** — the rollout is opt-in per storyboard, not a mass migration.

## Why this matters

From Phase 0 audit:

- Editorial chrome (code-card, mac-window, phone-frame, pill, arrow, route-line, hex, terminal, social-card, chart-bar) is currently inlined per-video. Three accepted packages each ship their own code-card variant. DRY this.
- `text-kit.js` ships 7 of 24 Pixel-Point presets manually. SplitText is vendored as of Phase A; the gap is closeable now.
- `popOut` / `glideTo` / `lineDraw` are used in 1–2 videos each despite covering high-value patterns ("this is the thing", natural cursor arcs, hand-drawn connections). Underuse is an authoring-discoverability problem, not a runtime gap.

Phase D doesn't unblock anything for Phase E or F — it's the kit-density investment that makes new videos cheaper to author and easier to keep visually consistent.

## Branch

Create branch `phase-d-blocks-and-text-kit` from `main` at the Phase C merge commit (`6176826`).

## Files you may edit

**Phase D may NOT edit any protected core** (REFACTOR-BRIEF.md §4). Specifically:

- `videos/_shared/blocks/` (NEW directory) — new block modules.
- `videos/_shared/text-kit.js` — extend with 17 more presets via SplitText.
- `videos/_shared/kit.js` — only to add a `registerBlock` / block-loader helper if discoverability requires it; do not change unrelated APIs.
- `docs/blocks.md` (NEW) — block catalog.
- `docs/text-kit.md` (NEW or extend `docs/authoring-api.md` §11.x) — full 24-preset reference.
- `docs/helper-rollout-backlog.md` (NEW) — `popOut` / `glideTo` / `lineDraw` rollout candidates.
- `docs/authoring-api.md` — extend "Capability kits" section with block-library callout and updated text-kit preset list.
- `docs/postintro-patterns.md` — extend with block-composition patterns.
- Helper-rollout targets are **pinned**: `videos/form-entries-guide/**` and `videos/form-notifications/**`. One beat each, real rollout. Do NOT migrate any of the four regression baselines (`a-complete-guide-to-the-checkboxes-field`, `wpforms-rest-api-overview`, `creating-first-form`, `build-forms-faster-with-wpforms-ai`). Document the chosen beat per video in the commit message.
- `tools/skill-context.js` — flag the new docs as on-demand reads; add `videos/_shared/blocks/` as a capability kit.
- `REFACTOR-PROGRESS.md` — log decisions encountered mid-phase under "Open questions stack."

## Files you MUST NOT touch

- `engine/*` — entire directory.
- `runtime/*` — entire directory, including `runtime/frame-driver.js`, `runtime/frame-adapter.js`, `runtime/shared-scene.js`, `runtime/camera-poses.js`, `runtime/transitions.js`, etc.
- `scenes/*` — `scenes/player.html`, `scenes/shared.js`, `scenes/shared.css`.
- `vendor/gsap/*`.
- `videos/_shared/effects.js` — Phase A locked.
- `videos/_shared/atmospheric.js` — pattern reference, do not rework.
- `videos/_shared/lottie-kit.js`, `three-kit.js` — out of scope.
- The four regression baselines (no chapter migrations into them — Phase D demonstrates rollout on non-baseline packages).
- `tools/validate-video.js` exit codes — you may add new lints (e.g., warn-only on unused block imports) but do not change exit semantics for existing videos.
- Any snapshot under `snapshots/`.

## Deliverable details

### 1. `videos/_shared/blocks/`

Extract these blocks (final list Codex's call after reading existing usage; aim for 6–8):

**Tier 1 — extract from accepted packages, very likely to land:**

- `code-card` — terminal-style code block with syntax highlight (REST API video pattern).
- `mac-window` — macOS browser/app frame with traffic-light controls.
- `phone-frame` — mobile device frame for screenshot beats.
- `pill` — labeled rounded badge for tags / states / metrics.
- `arrow` — animated arrow connector between two points (DrawSVG-backed; Phase A unlocks).
- `route-line` — curved path between elements (MotionPath-backed).

**Tier 2 — only if a clear pattern already exists in 2+ packages:**

- `hex` — hexagonal callout (REST API).
- `social-card` — Twitter/X-style card.
- `chart-bar` — single animated bar for metric beats.
- `terminal` — multi-line terminal with typed output.

**Block module shape (locked):**

```js
// videos/_shared/blocks/code-card.js
export function mountCodeCard({ code, language = 'js', title = '', zIndex = 30, ... } = {}) {
  // 1. Build DOM.
  // 2. Mount above iframe (or stage in editorial mode).
  // 3. Return { el, dispose, tweenInto?(tl, opts) }.
  return {
    el,
    dispose() { el.remove(); },
    tweenInto(tl, { duration = 0.6, position = 0 } = {}) {
      tl.from(el, { opacity: 0, y: 20, duration }, position);
    },
  };
}
```

Block requirements:

- **No iframe DOM access.** Blocks live in the parent doc, never reach into `iframe.contentDocument`. They sit ABOVE the iframe.
- **Self-contained CSS.** Inline styles or a single `<style>` element scoped to the block instance. No global CSS injection beyond the block's own scope.
- **Idempotent dispose.** Calling `dispose()` twice must not throw.
- **Optional `tweenInto`.** When provided, composes into a master timeline using the same shape as `atmospheric.js`. Some blocks (e.g., `mac-window`) may not need motion — `tweenInto` is optional, not mandatory.
- **No deterministic-logic violations.** No `Date.now()`, no unseeded `Math.random()`, no `fetch` (REFACTOR-BRIEF.md §3). Use `mulberry32` if you need pseudo-random offsets.

### 2. `videos/_shared/text-kit.js` to 24 Pixel-Point presets

Current 7 presets (keep all working, do not regress):
`mask-reveal-up`, `top-down-letters`, `focus-blur-resolve`, `spring-scale-in`, `soft-blur-in`, `per-character-rise`, `micro-scale-fade`.

Add the remaining 17. Reference list (Pixel-Point published presets — confirm exact names with their public docs; final naming Codex's call as long as it's the standard set):

`type-out-typewriter`, `glitch-resolve`, `shutter-bars`, `zoom-blur-in`, `wave-rise`, `cascade-from-edge`, `letter-flip`, `slide-mask-left`, `slide-mask-right`, `gradient-wipe`, `bounce-in-letters`, `elastic-scale-in`, `chromatic-shift`, `magnetic-snap`, `paragraph-stagger`, `word-by-word-emphasis`, `liquid-morph` (or 17 from the canonical set).

Each preset:

- Uses `SplitText` (Phase A vendored at `/vendor/gsap/3.15.0/SplitText.min.js`) for splitting into chars/words/lines as appropriate.
- Exposes `tweenInto(tl, { duration, position, stagger?, ... })`.
- Returns `{ el, dispose, tweenInto }` from a `mountTextReveal(text, { preset, ...opts })` factory — same factory as today.
- Reverts SplitText cleanly on `dispose()` (use `splitInstance.revert()` per gsap-rules.md L0 cleanup discipline).
- Respects deterministic-logic rule.

The current `mountTextReveal` factory signature stays stable. Authors who already use the 7-preset names continue to work unchanged.

### 3. Helper rollout

Three underused helpers identified in `repo-audit-findings.md` §9:

- `popOut` (`runtime/pop-out.js`) — clones a real iframe element into the parent doc, with computed-style copy + `@font-face` extraction. Ideal for "this is the thing" beats.
- `cursor.glideTo(sel, via, wait)` (`engine/interactions.js`) — natural-arc cursor move via waypoint. Should be the default for any non-trivial cursor move.
- `lineDraw` (`runtime/line-draw.js`) — SVG path stroke-on. Concept beats and connector arrows.

Deliverables:

a. **Audit doc** at `docs/helper-rollout-backlog.md`: per video, list candidate beats where the helper would replace a plainer pattern. Don't change videos in the audit doc — just catalog.

b. **Two real rollouts (pinned targets):** one beat in `videos/form-entries-guide/` and one beat in `videos/form-notifications/`. Diff should be small (the helper exists already; you're replacing a `highlight` + `clickOn` with `popOut` + `glideTo`, or a straight cursor move with `glideTo` via waypoint). Codex picks the specific beat per video based on visual fit; document the choice in the commit message.

c. **Update `docs/postintro-patterns.md`**: add a "When to reach for popOut / glideTo / lineDraw" section with concrete examples from the rollouts.

## Acceptance criteria — DO NOT mark phase done until all pass

```bash
# 1. All four regression baselines validate (zero new errors vs. main).
for slug in a-complete-guide-to-the-checkboxes-field wpforms-rest-api-overview creating-first-form build-forms-faster-with-wpforms-ai _phase-c-editorial-pilot; do
  node tools/validate-video.js "$slug" || exit 1
done

# 2. Smoke clean on all five (sceneBooted=true, no boot/page/console errors
#    excluding pre-existing 404s that --allow-resource-404 masks).
for slug in a-complete-guide-to-the-checkboxes-field wpforms-rest-api-overview creating-first-form build-forms-faster-with-wpforms-ai _phase-c-editorial-pilot; do
  node tools/check-video-playback.js "$slug" --seconds 30 --allow-resource-404 2>&1 | grep -E '"(sceneBooted|bootError|pageErrors|consoleErrors)"'
done

# 3. The two pinned helper-rollout targets validate + smoke clean.
for slug in form-entries-guide form-notifications; do
  node tools/validate-video.js "$slug" || exit 1
  node tools/check-video-playback.js "$slug" --seconds 30 --allow-resource-404 2>&1 | grep -E '"(sceneBooted|bootError|pageErrors|consoleErrors)"'
done
# 4. A kit smoke: a tiny test page that mounts each block + each text-kit preset
#    in sequence, calls dispose, and verifies no DOM leaks. Add as
#    `tools/_phase-d-kit-smoke.html` (sandbox, can be deleted post-merge).
```

**Block disposal acceptance:** for each new block, mounting and disposing in a loop must leave `document.body.children.length` unchanged (within ±1 for stylesheet caching). No leaked listeners, no orphaned DOM.

**Text-kit preset coverage assertion:** `mountTextReveal('test', { preset })` must return a working `{ el, dispose, tweenInto }` for all 24 preset names. Add a programmatic enumeration test.

**Helper rollout visual smoke:** the two migrated beats should be visually clearer than before. Umair owns visual QC; Codex provides playable URLs.

## What you do NOT do in Phase D

- Do not edit any protected core.
- Do not touch the four regression baselines for helper-rollout work.
- Do not introduce new animation runtimes (e.g., anime.js) — REFACTOR-BRIEF.md §3 locked.
- Do not adopt Hyperframes seek-render — REFACTOR-BRIEF.md §3 locked.
- Do not introduce render/preview tooling (Phase E).
- Do not add a deterministic-logic linter (Phase F).
- Do not skill-package the docs (Phase F).

## Reporting back

When done:

1. Commit on `phase-d-blocks-and-text-kit`. One commit per logical step (blocks tier 1, blocks tier 2, text-kit additions, helper rollout #1, helper rollout #2, docs).
2. Reply to Umair with: branch tip SHA, files changed, validator output for all five smoke targets, smoke output, list of blocks shipped, list of text-kit presets shipped, list of helper-rollout migrations, links to playable URLs for the two migrated videos.
3. Do NOT push to remote. Do NOT update `REFACTOR-BRIEF.md` or `CLAUDE.md` — Claude (CTO) does that during phase merge.

## If you get stuck

- **A block needs to read iframe DOM:** stop. Blocks live in the parent doc. If the block fundamentally needs iframe geometry, it's not a block — it's a beat-local helper. Log under "Open questions stack."
- **A text-kit preset needs a GSAP plugin not vendored:** all free plugins are vendored as of Phase A. If you find one that isn't, log it; don't add new vendored plugins as part of Phase D (that's a Phase A scope creep).
- **A helper rollout would touch a baseline:** stop. Pick a non-baseline video. The four baselines are immutable.
- **SplitText behavior differs from the manual 7-preset implementation:** match the existing visual output. If a preset must change behavior to use SplitText, document the diff and ask before shipping.
- **Time pressure:** ship blocks tier 1 + text-kit presets + ONE helper rollout + the rollout backlog doc, even if blocks tier 2 and the second rollout are deferred. The blocks library and text-kit completion are the load-bearing pieces.
