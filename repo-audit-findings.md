# Repo Audit — Architecture Map + Hyperframes Adaptation Plan

Date: 2026-05-07
Scope: full-repo architectural audit of the WPForms HTML video builder, with a side-by-side comparison to HeyGen Hyperframes and a concrete adaptation plan.

## Mandate (do not lose sight of)

The system has **two equally important jobs**:

1. **Tutorial videos with real WPForms UI.** Real product DOM in an iframe, manipulated as a stage with a cursor, highlights, narration, and DOM puppetry. This is the moat — no other system can do this with the same fidelity.
2. **Occasional ad-style release / announcement videos.** Editorial DOM compositions (full 1920×1080), atmospheric motion, character cascades, hero lockups, brand-mode marketing pieces. Stripe-style.

Every recommendation in this audit must support **both modes** without compromising either. Surface modes (`iframe` / `editorial` / `mixed`) from `future-enhancements.md` are the architectural lever for this. The cross-snapshot transition overhaul (Phase C below) is the one place where the system must work identically in both modes from day one.

The goal is to keep the real-DOM core and improve everything around it (composition model, timing, transitions, GSAP discipline, atmospheric layer, render workflow) — without locking out marketing-mode.

---

## 1. System at a glance

```
              videos/<slug>/manifest.json + chapters/*.js
                          │
                          ▼
        runtime/player.js (top-level orchestrator)
                          │
        ┌─────────────────┼──────────────────┐
        ▼                 ▼                  ▼
  runtime/chapter-     runtime/         runtime/cinematic-
  runner.js            verbs.js         runner.js + specs
  (descriptor)         (closed verbs)   (postIntro)
        │                 │                  │
        └────────┬────────┴────────┬─────────┘
                 ▼                 ▼
        engine/interactions.js   runtime/scene-helpers.js
        (semantic cursor/cam)    (load, swap, hud, errors)
                 │                 │
                 ▼                 ▼
        engine/engine.js     runtime/transitions.js
        (camera/highlight/   (chapter-break + swap styles)
         pointer/cursor)
                 │
                 ▼
        engine/wpforms.js  +  engine/overlays-layer.js
        (DOM puppetry)        (config-driven overlays)

snapshots/<slug>/index.html        ← real captured WPForms DOM
narration/<slug>/*.mp3             ← TTS output
runtime/sfx.js + assets/sfx/*      ← Web Audio SFX
videos/_shared/{kit,atmospheric,text-kit,lottie-kit,three-kit}.js
                                   ← opt-in capability kits
vendor/gsap/3.12.5/                ← (not yet) — GSAP loaded floating from kit.js
hyperframes/                       ← two separate Hyperframes test projects
```

Two video authoring modes coexist:

- **Legacy / effect mode** — chapter file exports `setup`, `default` (array of beats), each beat has `effect({ ctx })` closure. Default for new videos. Allows arbitrary GSAP and editorial DOM.
- **Descriptor mode** — `defineChapter({ slug, snapshot, steps })` from `runtime/chapter-api.js`. Steps are closed-vocabulary verbs (`focus`, `clickOn`, `typeInto`, etc.). Validated, but limited.

---

## 2. Engine layer (low-level primitives)

### 2.1 `engine/engine.js` — camera + cursor + overlays
- Mounts a `.stage` flex container, an iframe at scaled origin, an `.overlay` div for highlights, and a 28×28 SVG `.cursor`.
- `loadSnapshot(slug, { iframeSize })` blows away `body.innerHTML`, rebuilds chrome, loads `/snapshots/<slug>/index.html`.
- Camera math: `zoomTo(targets, { level, pad, smooth, duration, easing })`. Computes union bbox of selectors, sets translate+scale on the iframe. CSS transition handles tween (no GSAP at this layer).
- `highlight(targets, { label, pad, fadeIn })`, `pointer(sel, { direction, label })`, `spotlight(sel, { dim })`, `cursor.{park,moveTo,click,hide,dragGrab}`, `type(target, text, { cps })`.
- `runScene(beats)` is the original beat orchestrator (now wrapped by player.js / chapter-runner.js).

### 2.2 `engine/wpforms.js` — DOM puppetry
Idempotent, selector-scoped helpers that fake real WPForms interactions without running plugin JS:
`revealSection`, `toggleControl`, `smartTag`, `selectDropdown`, `toggleBlockActive`, `duplicateBlock`, `showPrompt`, `whiteout`, `collapseBlock`, `enableConditionalLogicRule`. These are the heart of what makes the video feel like a real tutorial — they run on top of static snapshots and produce believable state changes.

### 2.3 `engine/interactions.js` — semantic verbs over engine primitives
`focusOn(sel, fill, noScroll, smooth)`, `cursor.parkAt`, `cursor.parkNearest`, `cursor.glideTo(sel, via, wait)`, `cursor.clickOn`, `cursor.hoverOn`, `cursor.typeInto`, `cursor.dragFromTo`, `cursor.toggle`. Reads `runtime/overlays-config.js` for default fill, ring color, padding, etc. Hooks SFX (`playClick`, `playHover`, `playType`).

### 2.4 `engine/overlays-layer.js` — CSS generated from `overlays-config.js`
Single source of truth for visual branding: ring color, hairline width, glow, padding, label glass-card style, ripple keyframes, write-on per-character delay. `installOverlayStyles()` is re-called after every body-wipe.

### 2.5 `engine/diag.js` — ring-buffer logger
`diag(tag, msg, data)` writes to a 200-entry ring buffer + console. Verbs emit `verbStart` / `verbEnd` / `verbErrorCrumb`. `installGlobalErrorLogger()` traps `window.onerror` and unhandled rejections. Powers the on-page error report.

`engine/engine.js.bak` and `engine/wpforms.js.bak` exist as dead backups.

---

## 3. Runtime layer (orchestration)

### 3.1 `runtime/player.js`
Top-level player. Decides legacy vs descriptor. Mounts mac chrome / mesh bg / watermark. Drives intro → postIntro → chapters → outro. Runs snapshot transitions either through `runSwapTransition` (modern) or legacy cream-cover fade. Re-installs overlay styles after every swap.

### 3.2 `runtime/chapter-runner.js`
Descriptor orchestrator. Resolves selectors against the snapshot catalog **before** boot (fails hard on missing). `awaitPostIntroReady` is a paint-anchored gate (waits for opacity ≥ threshold + non-zero size, hard 800ms cap). Tracks step state in a HUD. `postMessage`s `chapter-done` / `chapter-failed` to parent.

### 3.3 `runtime/chapter-api.js`
Pure-function descriptor normalizer. Validates slug/snapshot/chapter/steps required, normalizes prep ops, guards against duplicate step IDs and unknown verbs, throws if both chapter-level and step-level narration are set.

### 3.4 `runtime/verbs.js` (~1100 lines)
Closed vocabulary of ~20+ verbs. Each verb takes `(step, ctx)` where `ctx` has engine helpers, sleep, focusOn, sameChapter flag, helpers. Examples:
- `focus`, `hold`, `typeInto`, `clickOn`, `hoverOn`, `dragFromTo`, `smartTag`, `selectDropdown`, `revealSection`, `enableConditionalLogicRule`, `snapshotSwap`, `popOut`, `focusPull`, `lineDraw`, `sectionTitle`, `titleCard`, `animateText`, `tiltFocus`, `cinematic`.

### 3.5 `runtime/transitions.js` — chapter-break + snapshot-swap
**Chapter-break styles** (within same snapshot):
- `dolly` (700ms zoom out + 200ms hold), `softDolly` (420ms, no hold), `whip` (180ms blur+brightness), `hold` (240ms pause), `glide` (zero, continuous pan).

**Snapshot-swap styles** (DOM replacement):
- `cover` (legacy, cream fade), `morph`, `push`, `whip`. Each wraps a `doSwap()` callback that calls `loadSnapshot + setup + chrome remount` while a cover is opaque.
- The "setup-under-cover" invariant prevents intermediate flashes — the heart of the existing transition robustness.

### 3.6 `runtime/dom-prep.js` + `runtime/prep-ops.js`
Three-layer DOM staging:
1. Universal baseline (`removeAdminBar`, `removeBuilderCruft`).
2. Per-snapshot profile (`applyDefaultForm({ keepIds, labels, formName })`).
3. Chapter-local delta (`hideFields`, `setFieldLabel`, `setChoiceLabels`, `stripQuizEnabled`).

Every helper is idempotent and silent on missing selectors. `prep-ops.js` is the declarative entry point used in descriptor `prep: [...]`.

### 3.7 `runtime/scene-helpers.js`
Shared utilities: `iframeDoc`, `installFlashGuard`, `suppressAnchorNav`, `mountStageChrome`, `setWatermarkEnabled`, `bootSnapshot`, `swapSnapshot`, `createHud`, `errorReport`, `waitForStartClick`, `signalChapterDone/Failed`.

### 3.8 `runtime/sfx.js` — Web Audio
Channels: `click`, `clickAlt`, `type`, `hover`, `swoosh`, `swooshEntry`, `swipe`, `popUi`, `popDrop`. `initSfx()` creates AudioContext + master gain, kicks off `Promise.allSettled` decode of MP3s. `play*` spawns a fresh `BufferSource`. Master volume from `OVERLAYS_CONFIG.sfx.masterVolume`.

### 3.9 Cinematic system
- `runtime/cinematic-runner.js` — wrapper that resolves a spec, mounts, plays narration, awaits animation, dismisses.
- `runtime/cinematic-spec-runner.js` — generic spec→DOM/timeline executor (sub-system that several specs lean on).
- `runtime/cinematic-specs.js` — registry of postIntro archetypes keyed by kind.
- Topic-specific files (each ~10–25 KB):
  - `cinematic-rough-thought-to-draft.js` (WPForms AI)
  - `cinematic-one-answer-enough.js` (Checkboxes)
  - `cinematic-cause-effect.js` + `…-gmail.js` (Notifications)
  - `cinematic-workflow-map.js`
  - `cinematic-brand-stage-three.js`, `cinematic-sullie-title-three.js`

These are not generic helpers. Each is hand-authored for a specific topic (HTML structure + CSS keyframes + GSAP timeline).

### 3.10 Effect helpers (used by verbs and effect closures)
- `pop-out.js` — clones an element out of the iframe into the parent doc with full computed-style copy + `@font-face` rule extraction & URL rewriting (so cloned glyphs render). Then tilts/scales/shadows it.
- `focus-pull.js` — magnetic pull animation as cursor approaches a target.
- `drag.js` — drag-from-sidebar reveal.
- `tilt-focus.js` — tilt + focus on element.
- `line-draw.js` — SVG path stroke-dashoffset animation.
- `section-title.js` — animated section header.
- `title-card.js` — intro/outro title cards.
- `animate-text.js` — Pixel-Point–style text reveals (mask-reveal-up, top-down-letters, focus-blur-resolve, spring-scale-in, soft-blur-in, per-character-rise, micro-scale-fade — 7 of ~24 Pixel-Point presets).
- `teaser-form-to-inbox.js`, `teaser-dual-path.js` — pre-intro teasers.

### 3.11 Tools
- `tools/skill-context.js` — canonical context dump.
- `tools/list-snapshots.js` — inventory + cross-reference per video.
- `tools/inspect-snapshot.js` — Playwright-based selector emitter.
- `tools/verify-selectors.js` — selector existence check.
- `tools/field-state.js` — query the 132 KB field-state inventory without full-reading.
- `tools/generate-snapshot-catalog.js` — auto-build catalog.md from DOM.
- `tools/validate-video.js` (~60 KB) — selector provenance, prep-op vocab, deprecated-verb checks.
- `tools/check-video-playback.js` — non-visual smoke (boot + console errors).
- `tools/probe-overlays.js`, `probe-transitions.js` — internal QA harnesses.
- `tools/clean-builder-snapshot-canvas.js`, `bake-sanitized-snapshots.js`, `prune-snapshot-assets.js` — snapshot maintenance.

---

## 4. Snapshot system (the system's main asset)

- `snapshots/<slug>/index.html` is real captured WPForms DOM, sanitized.
- `snapshots/<slug>/catalog.md` lists known-good selectors with provenance.
- `sanitize/<slug>.js` is an optional per-snapshot post-load DOM cleanup module (dynamic-imported, swallows missing).
- The system is grounded in **product truth**: snapshots are not re-rendered, they are real frames. This is the killer feature.
- Memory note: snapshot `assets/` directories are *not* load-bearing — they're static visual fossils. Chapters do their state changes via DOM puppetry + `swapToSnapshot` cuts.

Pain: any DOM shift (e.g. WPForms version bump) silently breaks selectors. Catalog + validator are the mitigations; there is no automated migrator.

---

## 5. Audio pipeline

- BGM: `startBGM(slug)` / `stopBGM()` from `scenes/shared.js`. Loads `/narration/<slug>/bg.mp3` looped. Manifest `bgm: false | {…}`.
- Narration: `playNarration(slug)` plays a clip and awaits the `ended` event. Chapter-level OR step-level (mutually exclusive, validated). Modes: `per-beat-narration` (default), `parallel`, `audio-cued` (one clip, `waitAt(t)` inside one rich `effect()`).
- SFX: Web Audio path (zero latency). One audio graph, one master gain, separate buffer per channel.
- TTS: `tts/generate.js --video <slug>` renders narration MP3s.

The known weakness, captured in `analysis-quality-and-transitions.md`: `per-beat-narration` lets audio length dictate pacing, which often rushes or drags visual beats. Switching the REST API video to BGM-only with explicit `duration` per beat tightened it ~25%.

---

## 6. GSAP audit

### 6.1 Where GSAP runs today
- Lazy-loaded by `videos/_shared/kit.js` (`loadGsap()`) — currently from a floating `gsap@3` URL (unpinned), planned to vendor at `vendor/gsap/3.12.5/` (L1 enhancement).
- Plugins available via the loader: **Flip**, **MotionPathPlugin**.
- Used heavily inside cinematic-*.js timelines and inside chapter `effect()` closures of richer videos (REST API, AI, Checkboxes, Notifications).
- Engine.js itself uses CSS transitions, not GSAP (camera/highlight/cursor — keeps the engine independent of an animation framework).

### 6.2 What's leveraged
- `gsap.timeline()` (sequencing, position params).
- `gsap.to / from / fromTo` with eases.
- `Flip.getState` + `Flip.from` (sandboxes: `flip-sandbox`, `flip-generate-card`).
- `MotionPathPlugin` (loaded by default; usage thin in current packages).
- `gsap.killTweensOf(...)` for manual cleanup.

### 6.3 What's NOT used and could be valuable
| Capability | Status | Where it would help |
|---|---|---|
| `gsap.context(() => {…}, scope).revert()` | unused | Single-call cleanup at chapter swap; replaces ad-hoc killTweensOf |
| `gsap.registerEffect({ name, effect, defaults })` | unused | Standard library: `highlightPulse`, `fieldBurst`, `labelReveal`, `popOutTilt`, `cardReflow` — call by name |
| `gsap.utils` (clamp, mapRange, snap, random, interpolate, pipe, wrap, splitColor) | unused | Procedural motion in postIntros / atmospheric kits without hand-rolling |
| Function-based stagger | partially used | Multi-element cascades in marketing-mode beats |
| `CustomEase` (Club) | unused | Brand-specific eases; tutorial signature feel |
| `MorphSVG` (Club) | unused | Concept-beat path morphs (icon → icon, route bend) |
| `DrawSVG` (Club) | unused | Stroke-on for arrows, beams, route lines |
| `SplitText` (Club) | unused | Proper word/line/char splitting (text-kit re-implements 7 of 24 Pixel-Point presets manually) |
| `GSDevTools` (Club) | unused | Author-time scrubber for tuning beats |
| `MotionPathHelper` (Club) | unused | Curved cursor paths drawn visually instead of by guessing |
| `ScrollTrigger`, `ScrollSmoother`, `Observer`, `Draggable`, `Inertia`, `Physics2D`, `Pixi`, `ScrambleText` | unused, intentionally rejected | Wrong category; videos aren't scrollable/interactive/physics-y |

### 6.4 GSAP discipline rules (already documented in `docs/gsap-rules.md`, L0)
- Single `gsap.timeline()` per beat group; sequence with position params, no `await Promise → onComplete` chains.
- `autoAlpha` not `opacity`.
- Animate transform/opacity/filter/SVG attrs only.
- `clearProps: 'all'` after tweens that leave inline transforms.
- Function-based stagger ≥ 5 elements.
- Pin GSAP version (L1 task; today it's floating).
- Finite repeats; never `repeat: -1`.

### 6.5 GSAP failure modes the team has actually hit
From `analysis-quality-and-transitions.md`:
- `gsap.to(..., onComplete: resolve)` hangs forever in hidden/headless tabs because RAF is throttled. Fix: fire-and-forget tween + `setTimeout(duration*1000)`.
- Three.js `MeshStandardMaterial` defaults `transparent: false`, so opacity tweens to 0 leave grey balls under ambient light. Fix: always `transparent: true, opacity: 0` initial state.
- HTML escaping bug in token-class regex (`HTML_ESC` missed `"`) → 0 pills firing in Ch.4. Sound architecture lesson: text-pipeline transforms must round-trip through escaping.

---

## 7. Transitions audit

### 7.1 What works
- `transitions.js` chapter-break vocabulary is correct and well-tuned (`dolly`, `softDolly`, `whip`, `hold`, `glide`).
- Setup-under-cover invariant on snapshot swap — the cream cover hides DOM mutation, viewer never sees flicker.
- Camera state survives chapter boundaries (drone-bobbing was solved).

### 7.2 Where it's weak (already flagged in `future-enhancements.md` L3)
- Cross-snapshot transition is a hard `body.innerHTML = …` wipe under a cream cover. No real choreography across the swap. There's no mechanism to carry an element from snapshot A to snapshot B (you can't Flip across the boundary because the source DOM is gone before the target mounts).
- No editorial-surface mode in the transition layer — the transition assumes iframe-as-stage. Marketing-mode (full 1920×1080 editorial DOM, no Mac chrome) doesn't have a first-class transition vocabulary.
- Chapter-seam blink on per-chapter Three.js mounts (REST API video lesson) — fixed by a singleton "shared scene" pattern in that video, but the architecture doesn't yet enforce or expose this.

### 7.3 The pattern that worked in the REST API video
From `analysis-quality-and-transitions.md`:
- **Shared persistent context.** Singleton outside chapters (e.g., `window.__raShared` for the Three.js scene + GSAP). First chapter mounts; later chapters attach; only the outro disposes.
- **Camera conventions, not camera math.** Three named poses (`focus`, `station`, `overview`) with simple math like `(c.x, c.y, 3.5)`. Every chapter uses these.
- **Drop into shared scene before fading own layer** — the shared scene at z=60 already renders the new state under the chapter's own z=70 fading layer. No gap.
- **BGM-only + explicit per-beat `duration`** — visuals drive cadence, not audio length.

These are video-local fixes that the architecture should ideally promote to first-class primitives.

---

## 8. Capability kits (`videos/_shared/`)

| Kit | Purpose | Notes |
|---|---|---|
| `kit.js` (16.8 KB) | Universal: GSAP loader, scene layer, cursor helpers, font/measure helpers, text splitting (custom), click ripple, iframe-coord transforms, clone-from-iframe | Everything new videos lean on |
| `atmospheric.js` (5.8 KB) | Marketing-mode helpers: grain canvas, gradient sweep, parallax pair, scale push, dark backdrop. Each has `tweenInto(tl, opts)` shape | Stripe-style postIntros |
| `text-kit.js` (4.2 KB) | 7 text-reveal presets (mask-reveal-up, top-down-letters, focus-blur-resolve, spring-scale-in, soft-blur-in, per-character-rise, micro-scale-fade) | 24-preset Pixel-Point parity is deferred |
| `lottie-kit.js` (5.0 KB) | Lottie editorial bumpers, stings, badges, marker/frame-driven micros | New |
| `three-kit.js` (3.7 KB) | Three.js helpers separated from `kit.js` so 2D-only videos don't pull 600 KB Three bundle | r148+ ESM |

---

## 9. Helpers — what they actually do, and where they could be used more

| Helper | What it does | Currently | Underused for |
|---|---|---|---|
| `popOut` | Clone a real iframe element into the parent doc, with computed styles + `@font-face` injection, then tilt/scale/shadow it as a "card" | Used in feature spotlight beats | Could front almost any "this is the thing" beat — currently videos default to highlight ring + label, popOut is the more cinematic alternative |
| `focusPull` | Magnetic pull on cursor approach | Sparingly | Click prelude in tutorial beats — adds intentionality without changing semantics |
| `drag` | Sidebar drag reveal | Field-add beats only | Reordering, drag-and-drop of any DOM |
| `lineDraw` | SVG path stroke-on | Concept beats | Connecting two real iframe elements with a hand-drawn arc — currently rare |
| `tiltFocus` | Tilt + focus | Almost never | "This is important" without the ring |
| `sectionTitle` / `titleCard` / `animateText` | Editorial text | Intros/outros | Mid-chapter signposts ("Now we'll send a notification") |
| `whiteout` | Hide everything except keepers | Concept beats | Could be an alternative to spotlight/dim for clean reveals |
| `enableConditionalLogicRule` | Inject faux conditional-logic rule UI | Conditional-logic videos | Any logic-builder–style flow that lacks a real snapshot |
| `duplicateBlock` | Clone a settings/notification block with new ID | Notifications video | Anywhere a "list grows" beat is needed |
| `showPrompt` | Title-card-style modal with input + OK/Cancel | Sparingly | First-name prompts, integration auth simulations |
| `cursor.glideTo(sel, via, wait)` | Move via waypoint for natural arcs | Some videos | Should be the default for any non-trivial cursor move; straight-line moves look robotic |

---

## 10. Hyperframes architecture — what they do differently

(Source: heygen-com/hyperframes README + the two `hyperframes/` projects in this repo.)

### 10.1 Composition model
- **Plain HTML** as the composition unit. `index.html` is the root timeline. `compositions/*.html` are sub-compositions referenced by `data-composition-src`.
- Every timed element carries data attributes: `data-start`, `data-duration`, `data-track-index`, optional `data-volume`, `data-composition-id`. Visible timed elements must have `class="clip"`.
- GSAP timelines are **paused** and **registered** on a global: `window.__timelines["composition-id"] = gsap.timeline({ paused: true })`. The renderer drives them.

### 10.2 Deterministic seek-render pipeline
- Animations don't run on wall-clock. The renderer (`packages/producer` → Puppeteer + FFmpeg) seeks to each frame, lets each registered timeline settle to that frame, captures, advances. Hidden tabs / RAF throttling are irrelevant.
- "Only deterministic logic — no `Date.now()`, no `Math.random()`, no network fetches" is a hard rule.
- This is the inverse of our wall-clock pipeline (audio-cued / `waitAt` / `swapToSnapshot`). The team has explicitly **rejected** swapping our pipeline to seek-render (`future-enhancements.md` "Rejected" list) — it would break audio-cued/waitAt/swapToSnapshot. Good call.

### 10.3 Adapter pattern across animation runtimes
- GSAP, CSS animations, Lottie, Three.js, Web Animations API, anime.js — each has a "Frame Adapter" so they all seek consistently.
- Useful idea: every animation runtime exposes a single seekable surface.

### 10.4 CLI dev loop
```
npx hyperframes init      scaffold project
npx hyperframes preview   browser live-reload
npx hyperframes lint      validate composition shape
npx hyperframes inspect   metadata
npx hyperframes validate  schema
npx hyperframes render    Puppeteer + FFmpeg → MP4
npx hyperframes publish   shareable link
npx hyperframes docs <topic>
```
Every project has a `package.json` with `dev`, `check` (= lint + validate + inspect), `render`, `publish`. Plus a `meta.json` and `hyperframes.json` config (block/component registry, asset paths).

### 10.5 Skill-driven authoring
- Skills (`/hyperframes`, `/hyperframes-cli`, `/hyperframes-media`, `/gsap`, `/lottie`, `/three`, `/waapi`, `/animejs`, `/css-animations`, `/tailwind`, `/website-to-hyperframes`) are framework-specific instruction packs for AI agents. They encode `window.__timelines` registration, `data-*` semantics, etc.
- Equivalent in our repo: `docs/authoring-api.md`, `docs/gsap-rules.md`, `docs/postintro-patterns.md`. We have the content; we don't have the skill packaging or the lint/validate rigour.

### 10.6 Registry of blocks/components
- `hyperframes.json` points at a registry; `npx hyperframes add <block>` installs a block (shader transition, social overlay, data viz, etc.) into `compositions/`.
- "50+ ready-to-use blocks." Editorial chrome density patterns: code cards, phone frames, social overlays, animated charts.

### 10.7 What's already in our `hyperframes/` folder
- `hyperframes/hyperframes-rest-2/` and `hyperframes/wpforms-ai-scene-10/` — the team has scaffolded two Hyperframes projects against the WPForms brand (REST API surface map; AI launch finale). They use the `data-start`/`data-duration`/`class="clip"` pattern, paused-and-registered GSAP timelines, deterministic logic. These are testbeds.

---

## 11. Side-by-side

| Axis | This repo today | Hyperframes | Verdict |
|---|---|---|---|
| Authoring unit | JS module exporting `setup` + array of beats with `effect()` closures | HTML with `data-*` attributes + paused GSAP timelines | Their model is more declarative + agent-friendly; ours is more expressive |
| Stage | Iframe of real product DOM | HTML composition (whatever the author writes) | Ours is the killer feature for tutorials |
| Camera | CSS transform on iframe (zoomTo/translate) | Whatever the composition does | Ours is purpose-built for "look at this UI" |
| Timing model | Wall-clock; narration awaits, `waitAt(t)`, `duration`, audio-cued | Frame-deterministic; renderer seeks to each frame | Theirs is render-perfect; ours handles audio-driven cadence natively |
| Transitions | `transitions.js` — chapter-break + 4 swap styles, all wall-clock | Shader transitions registered as blocks | Ours is conceptually correct but stuck at hard `innerHTML` swaps |
| GSAP usage | Timelines, Flip, MotionPath; many free APIs unused | Paused timelines, registered globally | Both use GSAP; theirs is renderer-driven |
| Audio | BGM + narration MP3s + Web Audio SFX | Single audio track on a `<audio>` element with `muted` video | Ours is more capable for narration tutorials |
| Render | External MP4 capture; HTML preview is the deliverable | `npx hyperframes render` → Puppeteer + FFmpeg → MP4 | Theirs is built-in; ours is bring-your-own |
| Validation | `validate-video.js` + `check-video-playback.js` | `lint` + `validate` + `inspect` | Comparable rigour; theirs is prettier CLI |
| Capability kits | `videos/_shared/{kit,atmospheric,text-kit,lottie-kit,three-kit}` | Block registry with ~50 blocks | Theirs has a registry & install command |
| Skills/agent docs | Markdown docs | Installable skills (`/hyperframes`, `/gsap`, etc.) | Theirs is more agent-shaped |

---

## 12. Pain points (real, observed)

1. **Cross-snapshot transitions are hard cuts.** No mechanism to carry an element across the swap. (`future-enhancements.md` L3.)
2. **Per-chapter mount/dispose causes seam blinks.** Solved video-locally via `__raShared` singleton; not a first-class architectural primitive. (`analysis-quality-and-transitions.md` 2.1.)
3. **GSAP loader is unpinned (floating `@3`).** L1 task to vendor `vendor/gsap/<version>/` with all approved plugins. Untouched today.
4. **Free GSAP APIs underused.** `context().revert()`, `registerEffect`, `gsap.utils`, function-based stagger — no rollout plan beyond the rulebook.
5. **Text-kit only has 7 of 24 Pixel-Point presets.** Hand-rolled because no `SplitText`. Costs author time.
6. **`per-beat-narration` couples cadence to audio length.** BGM-only + explicit `duration` is the documented escape hatch but isn't the default.
7. **No timeline UI / scrubber.** Authors cannot scrub; they must boot and watch. `GSDevTools` would help; a Hyperframes-style preview server would help more.
8. **No render command.** Visual QC is the user's; MP4 capture is external. Hyperframes' `npx hyperframes render` is a gap.
9. **Chrome remount fragility after body-wipe.** Easy to forget to call `mountWatermark` / `installOverlayStyles` after a custom swap path.
10. **Chapter authoring hidden behind a closed verb vocabulary OR fully imperative effect closures.** Descriptor mode is too narrow for postIntros; effect mode has no enforcement, so quality varies wildly between videos.
11. **Hidden-tab GSAP hang.** Real bug in our preview server. Documented workaround (fire-and-forget + setTimeout) is video-local. Not architectural yet.
12. **Backup files in `engine/` (`.bak`) and stage docs in `docs/` (`stage-4-core-api-plan.md`).** Some clutter to consider.

---

## 13. Adapt Hyperframes — what to actually borrow

Each item below is independent; pick what's worth doing. None require giving up real-iframe DOM (the core benefit). All preserve wall-clock + audio-cued (we keep that pipeline; their seek-render is rejected).

### 13.1 Borrow: declarative composition primitives
- Add a tiny `data-*` shape to chapter beats so the runtime can introspect:
  - `data-start`, `data-duration`, `data-track-index` for editorial DOM elements that live alongside the iframe (postIntros, marketing-mode chapters).
  - Keep the iframe itself outside this — it's a single live surface.
- Lets us write postIntros and editorial chapters with HTML/CSS markup and **also** machine-validate them with a lint pass.

### 13.2 Borrow: paused-and-registered GSAP timelines
- For postIntro / cinematic / atmospheric layers, register timelines as `window.__hfTimelines["beat-id"] = gsap.timeline({ paused: true })`.
- Player drives them with `tl.play()` / `tl.seek()` / `tl.pause()` instead of letting them auto-tick.
- Fixes the **hidden-tab GSAP hang** at the architectural level (we'd advance via `setTimeout` ticks, not RAF).
- Keeps wall-clock for the iframe surface; only the editorial layer is paused-and-driven.

### 13.3 Borrow: CLI dev loop
Add scripts to `package.json`:
```json
"scripts": {
  "dev": "node serve.js",
  "lint": "node tools/validate-video.js --all",
  "check": "node tools/validate-video.js --all && node tools/check-video-playback.js --all",
  "render": "node tools/render.js",     // new — Puppeteer + FFmpeg
  "preview": "node tools/preview.js"     // new — live-reload preview
}
```
- `tools/render.js` would launch headless Chrome, set `document.visibilityState = 'visible'` (or use Hyperframes' seek model only for the editorial layer), and capture frames with FFmpeg. This is the biggest external dependency the system currently has.

### 13.4 Borrow: block/component registry for editorial chrome
- `videos/_shared/blocks/` directory with reusable editorial blocks: `code-card`, `mac-window`, `phone-frame`, `pill`, `arrow`, `route-line`, `hex`, `terminal`, `social-card`, `chart-bar`.
- Each block is a self-contained HTML/CSS module with documented props.
- Today these are inlined per-video (REST API video has its own code-card; AI scene has its own form-card). DRY them.

### 13.5 Borrow: skill packaging
- Bundle our existing docs into installable skills (`/wpforms-video`, `/wpforms-postintro`, `/wpforms-gsap-rules`, `/wpforms-marketing`).
- Already half-done — `docs/authoring-api.md` etc. read like skills.

### 13.6 Borrow: deterministic logic rule
- Add "no `Date.now()`, no `Math.random()` without a seeded PRNG, no `fetch` at runtime" as an L0 rule. We already enforce some of this implicitly (`atmospheric.js` uses Mulberry32). Make it explicit. Turns videos into reproducible artifacts.

### 13.7 Don't borrow
- Frame-deterministic seek-render. Confirmed in `future-enhancements.md` rejected list — it would break audio-cued, `waitAt`, `swapToSnapshot`. Leave it.
- React/TSX. Hyperframes is HTML-first; we're already HTML/JS-first. No win.
- Hyperframes' specific `data-composition-src` model. We have a chapter file model. Stay with it.

---

## 14. Recommended adaptation roadmap (prioritized)

Each phase respects existing protected-core rules and is opt-in per video. Order is safest-first.

### Phase A — discipline foundations (1-2 sessions)
- A1. **Vendor GSAP** at `vendor/gsap/3.12.5/` with Flip, MotionPath, CustomEase (free), MotionPathHelper. Update `videos/_shared/kit.js` to load from local. Pin version. (L1)
- A2. **Roll out `gsap.context()` cleanup** in cinematic-*.js and chapter `effect()` closures. One-call cleanup at chapter swap.
- A3. **Define `gsap.registerEffect()` standard library.** Start with `highlightPulse`, `fieldBurst`, `labelReveal`, `popOutTilt`, `cardReflow`. Ship as `videos/_shared/effects.js`.
- A4. **Codify the hidden-tab fix as a kit helper.** `videos/_shared/kit.js` gets `awaitTween(tween, { duration })` that does the fire-and-forget + setTimeout pattern.

### Phase B — composition primitives (2-3 sessions)
- B1. **Editorial-surface mode (L2 from `future-enhancements.md`).** Manifest field `surface: 'iframe' | 'editorial' | 'mixed'`. `editorial` skips iframe and Mac chrome; gives 1920×1080 canvas. Touches protected core; gated.
- B2. **Paused-and-registered timelines for editorial beats.** `window.__hfTimelines` registry; runtime drives via `tl.play()` not autoplay. Wall-clock still drives the iframe surface.
- B3. **`data-start` / `data-duration` / `class="clip"` schema** for editorial DOM elements only. Lint pass enforces.

### Phase C — transitions (the only "standardize this" item)
- C1. **Cross-snapshot choreography.** Pre-capture state of an element about to be carried; render a clone in the parent doc; new snapshot mounts; Flip the clone onto the new snapshot's element. Removes the hard cut.
- C2. **Shared-context primitive.** First-class `runtime/shared-scene.js` with `getSharedScene({...}) / disposeSharedScene()`. Promotes the REST API video pattern.
- C3. **Camera-pose vocabulary.** Three named poses (`focus`, `station`, `overview`) with explicit math, used by all multi-chapter Three.js videos.

### Phase D — kit expansion
- D1. **`videos/_shared/blocks/`** directory — extract code-card, mac-window, phone-frame, pill, arrow, route-line, hex from existing videos.
- D2. **Round out `text-kit.js`** to 24 Pixel-Point presets (or wrap `SplitText` if we license GSAP Club).
- D3. **`videos/_shared/effects.js`** — the `registerEffect` library from A3, broken into a dedicated kit.

### Phase E — render + preview workflow
- E1. **`tools/render.js`** — Puppeteer + FFmpeg → MP4. Captures the live HTML preview; respects wall-clock. Honors a `--seek` mode for editorial-only beats that registered paused timelines.
- E2. **`tools/preview.js`** — live-reload preview server (today `serve.js` is static).
- E3. **Author scrubber** — `GSDevTools` (Club) or a custom timeline-bar that lists registered `__hfTimelines` and lets the author scrub.

### Phase F — agent ergonomics
- F1. **Skills bundle.** `/wpforms-video`, `/wpforms-postintro`, `/wpforms-gsap-rules`, `/wpforms-marketing`. Wraps existing docs.
- F2. **Audio cue diagnostics.** Surface-tag audio length vs beat duration mismatches in the validator. Helps catch "narration drags the visual" before review.

---

## 15. Concrete questions for Umair (storyboard-stage decisions, not implementation)

1. Are we OK shipping `editorial` surface mode (Phase B1) before tackling the cross-snapshot transition (Phase C1), or should they ship together since C1 is supposed to be surface-agnostic?
2. On GSAP Club: license decision. SplitText alone unblocks `text-kit` parity. MorphSVG + DrawSVG unlock concept-beat motion. Yes/no?
3. On `tools/render.js`: do we want HTML→MP4 inside the repo, or keep capture external and just improve the preview workflow? Affects Phase E weight.
4. Skill packaging (Phase F1) — useful for cross-machine consistency, or skip if the docs are enough?
5. On the two `hyperframes/` test projects in the repo: keep as live experiments, archive, or delete? They're high-quality references but they're not part of the production build.

---

## 16. Bottom line

The repo is a focused, well-structured tutorial-video builder whose **competitive moat is real WPForms DOM in a stage**. The core (`engine/` + `runtime/player.js` + `runtime/chapter-runner.js` + snapshot system) is solid. The roughness lives in:
- transition quality across snapshots,
- GSAP discipline + plugin coverage,
- composition ergonomics for postIntros and marketing-mode beats,
- preview/render workflow.

Hyperframes' best ideas worth borrowing are the **declarative `data-*` composition layer**, the **paused-and-registered timeline model** for the editorial layer, the **CLI dev loop**, and the **block registry**. Their seek-render pipeline is right for them, wrong for us — keep wall-clock + audio-cued.

Phases A and B unlock the rest. Phase C is the one place where standardization is the right answer. Everything else stays opt-in by storyboard.
