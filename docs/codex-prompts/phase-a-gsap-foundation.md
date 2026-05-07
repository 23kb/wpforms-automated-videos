# Codex prompt — Phase A: GSAP Foundation

Self-contained prompt for Codex. Paste verbatim. Codex must read REFACTOR-BRIEF.md and REFACTOR-PROGRESS.md first.

---

## Context

You are working on a WPForms tutorial-video repo at `C:\Users\PC\Desktop\Video Project - HTML only`. This is **Phase A of a multi-phase architectural refactor**. Phases run on independent branches.

Read these files in this order before writing any code:

1. `REFACTOR-BRIEF.md` — full mandate, decisions, protected core, baselines.
2. `REFACTOR-PROGRESS.md` — current state, what was done in Phase 0, next phases preview.
3. `CLAUDE.md` (project root) — operator manual, do-not-touch list.
4. `docs/gsap-rules.md` — current L0 discipline rules.
5. `videos/_shared/kit.js` — current `loadGsap()` implementation.

The mandate is dual: **real-WPForms-UI tutorials AND ad-style release videos**. Every decision must support both. Snapshots stay static (no plugin-JS execution). All GSAP plugins are now free (Webflow change April 2025) — use them all.

## Goal of Phase A

Three deliverables:

1. **Vendor the remaining free GSAP plugins** alongside `vendor/gsap/3.12.5/`. Currently only `gsap.min.js`, `Flip.min.js`, `MotionPathPlugin.min.js` are present. Add: `SplitText.min.js`, `MorphSVGPlugin.min.js`, `DrawSVGPlugin.min.js`, `CustomEase.min.js`, `GSDevTools.min.js`, `MotionPathHelper.min.js`. Pin to GSAP 3.13.0 (latest stable as of writing — verify on https://gsap.com/ and use the version with all plugins free; if 3.12.5 has them all, stay; if newer is needed for free plugins, bump and update folder name + `loadGsap()` paths consistently).
2. **Ship `videos/_shared/effects.js`** — a `gsap.registerEffect()` library exposing standard reusable effects: `highlightPulse`, `fieldBurst`, `labelReveal`, `popOutTilt`, `cardReflow`. Each callable as `gsap.effects.highlightPulse(target, opts)`.
3. **Codify two helpers in `videos/_shared/kit.js`**:
   - `awaitTween(tween, { duration, fallbackMs })` — fire-and-forget wrapper that resolves on `setTimeout(duration*1000)` instead of GSAP's RAF-driven `onComplete`. Solves the hidden-tab hang documented in `analysis-quality-and-transitions.md` §2.5.
   - `withGsapContext(fn, scope)` — wraps `gsap.context()` with consistent cleanup ergonomics. Returns `{ ctx, revert }`.

## Branch

Create branch `phase-a-gsap-foundation` from `main`.

## Files you may edit

- `vendor/gsap/<version>/*` (additions only — pull in plugin files; do NOT modify existing `gsap.min.js` or `Flip.min.js`)
- `videos/_shared/kit.js` (extend `loadGsap()` and add `awaitTween` + `withGsapContext`)
- `videos/_shared/effects.js` (NEW)
- `docs/gsap-rules.md` (append a section "Phase-A patterns: registerEffect library, awaitTween, withGsapContext")
- `docs/effects-library.md` (NEW — document each registered effect's API)

## Files you MUST NOT touch

- Anything in `engine/`
- `runtime/player.js`, `runtime/chapter-runner.js`, `runtime/scene-helpers.js`, `runtime/transitions.js`, any `runtime/cinematic-*.js`
- `scenes/player.html`, `scenes/shared.js`, `scenes/shared.css`
- Any video package under `videos/<slug>/` (you may NOT migrate any chapter to use the new effects yet — that's Phase D)
- Any snapshot under `snapshots/`
- `tools/validate-video.js`, `tools/check-video-playback.js` (no behavior changes; you may add lints but not in this phase)
- Existing accepted video packages

## Deliverable details

### 1. Vendor plugins

For each plugin file, place at `vendor/gsap/<version>/<PluginName>.min.js`. Source: download from `https://gsap.com/` (free for everyone since April 2025).

Update `videos/_shared/kit.js` `loadGsap()` to accept new flags:

```js
export function loadGsap({
  flip = true,
  motionPath = true,
  splitText = false,
  morphSVG = false,
  drawSVG = false,
  customEase = false,
  gsDevTools = false,
  motionPathHelper = false,
} = {}) { ... }
```

Default `false` for the new ones — opt-in per call site, no default cost. The existing `flip`/`motionPath` stay default-on for back-compat.

### 2. `videos/_shared/effects.js`

Module-side-effect registers effects when `loadGsap()` resolves. Each effect must:

- Use `gsap.registerEffect({ name, effect, defaults })`.
- Effect body uses `gsap.context()` internally so cleanup works.
- Animate transform / opacity / filter only (per L0 rule 3).
- Use `autoAlpha` not `opacity` for show/hide (per L0 rule 2).
- Finite-only — no `repeat: -1` (per L0 rule 7).

The five effects:

- **`highlightPulse(target, { color, scale, duration })`** — quick attention pulse. Scales target 1 → scale → 1, optional color flash via filter or CSS variable.
- **`fieldBurst(target, { particles, color, duration })`** — small radial burst at target center. Use simple absolute-positioned dots or SVG circles. No new DOM children left after; cleanup via gsap.context.
- **`labelReveal(target, { from, duration, stagger })`** — reveals label text with character cascade using SplitText. `from: 'mask-up' | 'fade' | 'spring'`.
- **`popOutTilt(target, { lift, rotate, shadow, duration })`** — z-pop with tilt + shadow. For "this is the thing" beats. Mirror behavior of `runtime/pop-out.js` BUT does NOT clone out of iframe — just lifts in-place. Different beast; document the difference in `docs/effects-library.md`.
- **`cardReflow(targets, { from, to, duration, stagger })`** — Flip-based layout reflow. Uses `Flip.from(state, opts)` internally. Authors call with already-mutated DOM and pre-captured state.

### 3. `videos/_shared/kit.js` additions

```js
// Promise that resolves after the tween's expected duration via setTimeout.
// Used instead of `gsap.eventCallback('onComplete', resolve)` because RAF is
// throttled in hidden tabs / headless browsers, which never fires onComplete.
// Reference: analysis-quality-and-transitions.md §2.5.
export function awaitTween(tweenOrTimeline, { duration, fallbackMs = 50 } = {}) {
  const ms = ((duration ?? tweenOrTimeline?.duration?.() ?? 0) * 1000) + fallbackMs;
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Wraps gsap.context() to make cleanup consistent at chapter swap.
// Returns { ctx, revert } so callers can either capture for manual revert or
// fire-and-forget if the chapter teardown picks it up.
export function withGsapContext(fn, scope) {
  const ctx = gsap.context(fn, scope);
  return { ctx, revert: () => ctx.revert() };
}
```

### 4. `docs/gsap-rules.md` additions

Append a section "Phase A patterns" that:
- Documents `awaitTween` with the hidden-tab rationale.
- Documents `withGsapContext` with chapter-swap cleanup rationale.
- Lists every registered effect from `effects.js` with one-line description.

### 5. `docs/effects-library.md` (new)

Per-effect API doc. For each effect: signature, defaults, what it does visually, a 5-line example, when to use vs not use.

## Acceptance criteria — DO NOT mark phase done until all pass

Run from repo root:

```bash
# 1. All four baselines still validate
for slug in a-complete-guide-to-the-checkboxes-field wpforms-rest-api-overview creating-first-form build-forms-faster-with-wpforms-ai; do
  echo "=== $slug ==="
  node tools/validate-video.js "$slug" || exit 1
done

# 2. All four baselines still smoke-test
for slug in a-complete-guide-to-the-checkboxes-field wpforms-rest-api-overview creating-first-form build-forms-faster-with-wpforms-ai; do
  echo "=== $slug ==="
  node tools/check-video-playback.js "$slug" --seconds 10 || exit 1
done
```

If validators fail, **revert and ask** — do not patch around. The point of Phase A is "additive only, no regressions."

Open `http://localhost:4321/scenes/player.html?video=a-complete-guide-to-the-checkboxes-field` and confirm postIntro + first chapter render normally. Visual smoke is required since validators don't catch all visual regressions.

## What you do NOT do in Phase A

- Do not migrate any existing chapter to use new effects (that's Phase D).
- Do not edit any cinematic-*.js (they keep their inline animations until Phase B refactor).
- Do not change any transition behavior (Phase C).
- Do not introduce paused timelines / Frame Adapters (Phase B).
- Do not change core/runtime files. If you think you need to, stop and write your reasoning in `REFACTOR-PROGRESS.md` under "Open questions stack."

## Reporting back

When done:

1. Commit on `phase-a-gsap-foundation` with message `phase A: GSAP foundation - vendor plugins + effects library + cleanup helpers`.
2. Push branch.
3. Reply to Umair with: branch name, files changed (count + names), validator output for all four baselines, link to live preview URL of one baseline, any open questions or blockers.
4. Do NOT update `REFACTOR-BRIEF.md` or `CLAUDE.md` — Claude (CTO) does that during phase merge after review.

## If you get stuck

- Conflict with protected files? Stop. Don't edit them. Report back with the specific need.
- Plugin file unavailable? Note it; we'll source it together.
- Validator failure you can't trace? Revert, run validator on `main` to confirm baseline passes, then bisect.
- Time pressure? Phase A is small enough to ship in one pass. If not, scope the smallest possible PR and ship that, with a written followup queued.
