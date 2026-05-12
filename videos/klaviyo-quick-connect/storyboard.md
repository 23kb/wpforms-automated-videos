# Storyboard — klaviyo-quick-connect (v12, real Klaviyo logo + atmosphere boosted)

## Section A — Intro (0 → 3s)

Editorial card centered, no mac frame:
- Sullie logo (real SVG from `reference/wpforms-brand/assets/sullie-master.svg`)
- Heading: "Klaviyo Addon"
- Subhead: "Connect WPForms to Klaviyo"
- Fade in (0.7s) → hold (2.2s) → fade out (0.5s)

## Section B — PostIntro concept beat (3.5 → 14.5s, ~11s)

The animated "what you'll learn" beat. No mac frame, no cursor — auto-animated.

The morph chain conveys: **form submission → Klaviyo profile → audience list.**

1. **B1 — Tagline (0.7s)**: "Every submission, into your **Klaviyo audience.**" fades in at top with subhead.
2. **B2 — Form card (0.6s)**: A small WPForms-styled newsletter signup card slides up on the left. Name pre-filled "Sullie", Email empty.
3. **B3 — Type email (1.2s)**: `caretType` animates `sullie@sulliesbakery.com` into the email field with a blinking orange caret.
4. **B4 — Submit feedback (0.5s)**: Orange Subscribe button glows + squashes.
5. **B5 — Pill flight (1.4s)**: A dark "✓ Submitted" pill emerges from the submit area and flies right toward the profile spawn point.
6. **B6 — Pill morph (0.3s)**: Pill fades; profile card primes.
7. **B7 — Primary profile (0.8s)**: Klaviyo-styled profile card materializes (black header with avatar, white body) — shows Sullie's email, "Subscribed" status pill, list name.
8. **B8 — Audience cascade (1.4s total)**: 2 additional profile cards stagger in BEHIND the primary card with slight offset, implying audience growth.
9. **B9 — Fade out (0.6s)**: Entire postIntro fades; tutorial begins.

Brand discipline:
- Klaviyo brand black `#1A1A1F` for profile card headers (their actual color)
- WPForms orange `#E27730` for submit button + caret
- Real WPForms font stack throughout
- No mac frame, no purple

## Section C — Tutorial proper (14.5 → 80s, ~65s)

Mac frame fades in. Real snapshots end-to-end (one stylized fallback for the WPForms nickname popup).

### Snapshot inventory

**Real WPForms snapshots:**
- `admin-forms-overview` — All Forms list (starting page, makes the "WPForms → All Forms" Step 1 truthful)
- `admin-settings-integrations-klaviyo-form` — Klaviyo accordion + API Key/Nickname form
- `admin-settings-integrations-klaviyo-open` — post-connect state
- `builder-providers` — form builder Marketing panel
- `builder-providers-klaviyo` — Klaviyo selected + Add New Connection visible
- `builder-providers-klaviyo-connection` — **NEW** real Klaviyo Connection settings panel (with Create / Update Profile selected by default)

**Real Klaviyo snapshots (NEW in v4, captured via SingleFile):**
- `klaviyo-dashboard` — Welcome panel + sidebar
- `klaviyo-settings` — Settings page (Account tab, sidebar visible)
- `klaviyo-api-keys` — API Keys page (Public + Private API Keys + Create button)
- `klaviyo-create-api-key` — Create Private API Key form (Name + Access Level + scopes)
- `klaviyo-private-key-confirmation` — Post-create modal with key reveal + copy/download

**Stylized fallback (no capture yet):**
- WPForms "Enter a connection nickname" form-builder popup — rendered as the same overlay used in v2/v3

### Chapter 1 — WPForms → All Forms → Settings → Integrations → Klaviyo
- Load `admin-forms-overview`. URL bar `…?page=wpforms-overview`.
- **Step 1**: "WPForms → All Forms (your starting point)"
- **Step 2**: "Open Settings → Integrations" → swap to `admin-settings-integrations-klaviyo-form`
- **Step 3**: "Click Klaviyo → Add New Account"

### Chapter 2 — Generate Klaviyo API key (real Klaviyo snapshots)
- Swap through `klaviyo-dashboard` → `klaviyo-settings` → `klaviyo-api-keys` → `klaviyo-create-api-key` → `klaviyo-private-key-confirmation`
- **Step 4**: "Open Klaviyo → click your account name → Settings"
- **Step 5**: "In Settings → click API keys in the sidebar"
- **Step 6**: "Click Create Private API Key"
- **Step 7**: "Name 'WPForms key' → Full Access Key → Create"
- **Step 8**: "Copy your new Private API Key"

### Chapter 3 — Back to WPForms, paste + connect
- Swap back to `admin-settings-integrations-klaviyo-form`
- **Selector fix v3 carried forward**: all queries scoped to `#wpforms-integration-klaviyo` to avoid matching hidden ConvertKit/Kit inputs
- Cursor → API Key input → type fake key letter-by-letter (Step 9)
- Cursor → Nickname input → type "Klaviyo key"
- Cursor → Connect to Klaviyo button (orange ripple) (Step 10)
- Swap to `admin-settings-integrations-klaviyo-open` (Step 11 "Klaviyo connected ✓")

### Chapter 4 — Form builder → Marketing → Klaviyo
- Swap to `builder-providers`
- Cursor → Klaviyo sidebar tab (Step 12)
- Swap to `builder-providers-klaviyo`
- Cursor → Add New Connection button (Step 13)

### Chapter 5 — Nickname dialog + REAL Klaviyo Connection panel + action variants
- Nickname popup materializes over the iframe (Step 14 "Name the connection → OK") — stylized overlay, no real capture
- Popup fades; **swap iframe to `builder-providers-klaviyo-connection`** (real Klaviyo Connection settings panel — Create / Update Profile selected by default)
- **Step 15**: "Action: Create / Update Profile (default)"
- **Step 16**: "Map Email → form Email field, pick a list"
- **DOM puppetry (inline, per INV-7)** swaps the Action dropdown value + replaces the inner `.wpforms-builder-klaviyo-provider-actions-data` HTML + shows the matching `.wpforms-builder-klaviyo-action-description` paragraph:
  - **Step 17**: "Action: Unsubscribe (revokes consent)" — Email field only, Klaviyo's actual revocation copy
  - **Step 18**: "Action: Remove from List (keeps consent)" — Email + List dropdown (Email List preselected), Klaviyo's actual list-only copy
- Restores to Create / Update Profile before outro

## Section D — Outro (~68 → 73s)

- Mac frame fades out
- Editorial card: "Connected." — sub: "Every form submission → Klaviyo profile. **Just works.**"
- Sullie bug mounts bottom-right

## Library fixes landed in v3 (motion-primitives.js + wpforms-interactions.js)

These are library-level defensive guards triggered by the v2 cursor bug — they help all future single-HTML videos, not just Klaviyo:

1. **`Cursor.glide(to)`** — no-ops + warns when `to` is null/undefined or has non-finite coords. Previously moved cursor to (0,0).
2. **`IframeManager.elementToStageCoords(target)`** — throws with informative message when the element has an empty layout rect (width===0 && height===0 && left===0 && top===0). This pattern means the element is in the DOM but hidden / collapsed / display:none. Previously returned origin (0,0), causing the cursor jump.

## Brand discipline

- `--wpf-orange #E27730` — primary brand, Connect button ripple, submit button, caret
- `--wpf-blue-light #0399ED` — popup info icon, settings panel toggle
- Klaviyo brand black `#1A1A1F` — Klaviyo profile card header, dashboard logo
- No purple (Klaviyo is not an AI feature)

## Stage quality

- Stage at native 1280×720, NO CSS transform (INV-1)
- Iframe at native 1180×604, identity transform at rest (INV-2)
- Mac frame fades only at section boundaries — no transforms (INV-3)
- Cursor in stage-local coord space (INV-4)
- Klaviyo selectors scoped to `#wpforms-integration-klaviyo` (INV-5)

## Validation

- Open at `http://localhost:56480/videos/klaviyo-quick-connect/index.html`
- Pass: `node tools/lint-determinism.js --video klaviyo-quick-connect`
- Visual QC by Umair (>5s motion per project guidance)
