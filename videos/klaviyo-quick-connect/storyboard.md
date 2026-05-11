# Storyboard — klaviyo-quick-connect

**Path:** Mixed (editorial chrome + real product UI in iframe)
**Duration:** ~27 seconds, 6 beats
**Slug:** `klaviyo-quick-connect`
**File:** `videos/klaviyo-quick-connect/index.html`

## Concept

"Connect WPForms to Klaviyo in 2 minutes." Editorial intro + outro card, real WPForms admin UI in the middle. Demonstrates the full Klaviyo onboarding: paste API key → connect → switch to form builder → assign Klaviyo provider to a form.

## Architecture

- Single-HTML, no engine, no manifest
- Mac-frame chrome wraps an `IframeManager` slot
- 5 real snapshots load + swap inside the iframe
- Captions in parent doc (over the iframe) provide step indicators
- Brand intro/outro cards bookend the demo

## Snapshots used (all exist)

1. `admin-settings-integrations-klaviyo-form` — Klaviyo accordion expanded with API key + nickname form visible
2. `admin-settings-integrations-klaviyo-open` — post-connect state (Klaviyo account listed as connected)
3. `builder-providers` — form builder Marketing panel, providers listed in sidebar
4. `builder-providers-klaviyo` — Klaviyo selected in sidebar, "Add New Connection" button visible

Note: skipped `admin-settings-integrations` (collapsed accordion entry) — the klaviyo-form snapshot already shows the form open, so we start there for a tighter narrative.

## Beat-by-beat

### Beat 1 — Intro card (0 - 3.5s)
- Editorial card centered: "Connect Klaviyo. **2 minutes.**" + sub: "Every form submission, straight to your Klaviyo audience."
- Atmosphere: warm cream with subtle orange bloom
- Card fades in from y+12 → 0 over 0.8s, holds 1.7s, exits up over 0.5s

### Beat 2 — Mac frame + Klaviyo settings (3 - 7s)
- Mac frame scales-up (0.96 → 1) + fades in (opacity 0 → 1), 800ms
- URL bar reads "sulliesbakery.com/wp-admin → Settings → Integrations"
- `IframeManager.load('admin-settings-integrations-klaviyo-form')` mounts the snapshot
- Caption pill at top: "Step 1 — Settings → Integrations → Klaviyo"

### Beat 3 — Type API key (7 - 11s)
- Cursor glides from parked position (top-right) to API key input (`input[name="api_key"]`)
- Cursor clicks → input focused
- Letter-by-letter typing: `pk_a1b2c3d4e5f6g7h8i9j0` (fake key) via inline DOM input dispatch
- Caption updates: "Step 2 — Paste your Klaviyo API key"

### Beat 4 — Click Connect + celebrate (11 - 14s)
- Cursor glides to "Connect to Klaviyo" button (`.wpforms-settings-provider-connect[data-provider="klaviyo"]`)
- Click with orange ripple
- Caption updates: "Step 3 — Click Connect to Klaviyo"
- "✓ Klaviyo connected" badge bounces in (back.out ease), holds 1.5s, fades out
- `IframeManager.swap('admin-settings-integrations-klaviyo-open')` 450ms crossfade to connected state
- Caption updates: "Step 4 — Klaviyo connection saved"

### Beat 5 — Switch to form builder (16 - 22s)
- URL bar updates: "sulliesbakery.com/wp-admin → Forms → Contact Us → Marketing"
- `IframeManager.swap('builder-providers')` to form builder Marketing panel
- Caption: "Step 5 — Open the form builder → Marketing tab"
- Cursor glides to Klaviyo sidebar item (`.wpforms-panel-sidebar-section-klaviyo`), clicks
- `IframeManager.swap('builder-providers-klaviyo')` to Klaviyo-selected state with "Add New Connection" visible
- Caption: "Step 6 — Klaviyo provider ready to map"

### Beat 6 — Editorial outro (22 - 27s)
- Mac frame fades out (scale 1 → 0.97, opacity 1 → 0)
- Outro card materializes centered: "**Done.**" + "Every form → Klaviyo profile. **Just works.**"
- Sullie mounts bottom-right with bounded yoyo float
- Hold 1.5s, scene complete

## Library calls

- `IframeManager` (load + swap, 5 snapshots): from `videos/_shared/wpforms-interactions.js`
- `Cursor` class (glide + click): from `motion-primitives.js`
- `mountSullieBug`: from `motion-primitives.js`
- `elementToStageCoords` (via IframeManager): real-DOM → stage coord projection

## Inline (DOM puppetry)

- API key letter-by-letter typing (with input event dispatch) — direct iframe DOM manipulation
- Caption pill text updates
- Connected badge bounce + fade
- Editorial intro/outro cards
- URL bar text updates per snapshot context

## Zoom dependency note

**No camera zoom used in this pilot.** All beats operate at zoom 1 — the iframe shows the snapshot at native rendering throughout. No `cameraToElement` calls, no `tweenCamera`. Side-steps the in-flight zoom-quality issue entirely. The light camera work mentioned in the original plan was dropped in favor of this simpler, sharper flow.

## File outputs

- `videos/klaviyo-quick-connect/index.html`
- `videos/klaviyo-quick-connect/storyboard.md`

## Validation

- Open at `http://localhost:56480/videos/klaviyo-quick-connect/index.html`
- Visual QC: 6 beats land in order, real WPForms UI is visible + recognizable, captions appear in sync with action, cursor moves are smooth (no frenzy), snapshots crossfade cleanly (no cream-flash)
- Brand discipline: orange `#E27730` on CTA + accents, blue `#066AAB` on connected state, no purple anywhere
- Watch for: caption pill timing, API key typewriter speed, Klaviyo sidebar click landing on the right target
