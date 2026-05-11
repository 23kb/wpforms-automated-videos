# Storyboard — klaviyo-quick-connect (v2, doc-driven)

**Path:** Mixed (editorial chrome + real product UI + Klaviyo-side cutaway)
**Duration:** ~73 seconds, 5 chapters
**Source doc:** `C:\Users\PC\Desktop\klaviyo\Klaviyo Addon 5 - WPForms.pdf`
**File:** `videos/klaviyo-quick-connect/index.html`

## Why v2

The first version (~27s) over-simplified the doc. The real Klaviyo Addon tutorial has 4 major sections:
1. Connecting WPForms to Klaviyo (Settings → Integrations → Klaviyo → Add New Account)
2. Generating your Klaviyo API key (on Klaviyo's dashboard — separate workflow)
3. Finishing the connection in WPForms (paste key, nickname, Connect)
4. Adding a Klaviyo integration to your form (Marketing tab → Klaviyo → Add New Connection → settings panel)

v2 covers all 4 sections with appropriate visual surfaces (real snapshots where they exist, stylized cutaway mockups for Klaviyo dashboard where snapshots don't exist).

## Snapshot inventory

**Available (real WPForms snapshots):**
- `admin-settings-integrations-klaviyo-form` — Klaviyo accordion expanded with API Key + Nickname form
- `admin-settings-integrations-klaviyo-open` — post-connect state
- `builder-providers` — form builder Marketing panel
- `builder-providers-klaviyo` — Klaviyo selected in sidebar + "Add New Connection" visible

**Not available (built as stylized cutaway mockups in the parent doc):**
- Klaviyo dashboard (with sidebar + Welcome banner)
- Klaviyo account menu popover (Settings link)
- Klaviyo API Keys page (Create Private API Key button)
- Klaviyo Private API Key Confirmation modal (with "Full Access Key" badge + key + copy icon)
- WPForms "Enter a connection nickname" popup (form builder modal)
- WPForms Klaviyo Connection settings panel (Select Account / Action / Email / List / Subscribe toggle / Custom Fields)

The cutaway mockups are CSS-styled HTML inside the stage, brought in via opacity transitions. They sit OVER the iframe slot. Not pixel-perfect Klaviyo replicas — sufficiently styled to follow the story.

## Chapter-by-chapter

### Intro (0 – 3.5s)
Editorial card centered: "Connect Klaviyo **to WPForms.**" — sub: "Every form submission, straight to your Klaviyo audience."

### Chapter 1 — WPForms Settings → Integrations → Klaviyo (3.5 – 13s)
- Mac frame fades in
- URL bar: "sulliesbakery.com/wp-admin → Settings → Integrations"
- Load `admin-settings-integrations-klaviyo-form` snapshot (real WPForms admin with Klaviyo accordion already expanded showing the Add New Account form)
- Captions: "Step 1: WPForms → Settings → Integrations" → "Step 2: Click Klaviyo → Add New Account"

### Chapter 2 — Klaviyo dashboard cutaway: generate API key (13s – 30s)
**[Cutaway: stylized Klaviyo dashboard layered over the iframe — no snapshot]**
- URL bar updates: "klaviyo.com/dashboard → Settings → API keys"
- Caption: "Step 3: Generate your Klaviyo API key"
- 2a — Click account name (bottom-left) → menu popover with Settings highlighted
- 2b — Navigate to API Keys page (content swap to API Keys card with "+ Create Private API Key" button)
- Caption: "Step 4: Click Create Private API Key"
- 2c — API Key reveal modal: "WPForms key" name, "Full Access Key" badge, key blurred behind copy icon
- Caption: "Step 5: Name 'WPForms key' → Full Access → Create"

### Chapter 3 — Back to WPForms: paste, connect (30s – 44s)
- Cutaway fades out → iframe re-emerges with klaviyo-form snapshot (same as Chapter 1)
- URL bar back to WPForms
- Caption: "Step 6: Paste the API key in WPForms"
- Cursor clicks API Key input → letter-by-letter type `pk_W` + fake suffix
- Cursor clicks Nickname input → type "Klaviyo key"
- Caption: "Step 7: Click Connect to Klaviyo"
- Cursor clicks "Connect to Klaviyo" button (orange ripple)
- IframeManager.swap to `admin-settings-integrations-klaviyo-open` (post-connect state)
- Caption: "Step 8: Klaviyo connected ✓"

### Chapter 4 — Form builder → Marketing → Klaviyo (44s – 55s)
- URL bar: "sulliesbakery.com/wp-admin → Forms → Contact Us → Marketing"
- IframeManager.swap to `builder-providers`
- Caption: "Step 9: Open form builder → Marketing → Klaviyo"
- Cursor clicks Klaviyo sidebar item (`.wpforms-panel-sidebar-section-klaviyo`)
- Swap to `builder-providers-klaviyo`
- Caption: "Step 10: Click Add New Connection"
- Cursor clicks `.js-wpforms-builder-provider-connection-add` (Add New Connection button)

### Chapter 5 — Connection nickname popup + settings panel (55s – 68s)
**[Cutaway: nickname popup mockup, then connection settings panel mockup]**
- Nickname popup materializes (info icon + "Enter a connection nickname" + "Klaviyo Connection" input + OK/Cancel)
- Caption: "Step 11: Name the connection → OK"
- Popup fades out
- Connection settings panel mockup materializes (Klaviyo Connection header + Select Account dropdown showing "Klaviyo key" + Action To Perform dropdown "Create / Update Profile" + Email dropdown + List dropdown + Subscribe to Email Marketing toggle ON)
- Captions cycle: "Step 12: Choose Action → Create / Update Profile" → "Step 13: Map Email → form Email field" → "Step 14: Pick a list, toggle on email marketing"

### Outro (68s – 73s)
- Mac frame fades out
- Editorial card: "Connected." — sub: "Every form submission → Klaviyo profile. **Just works.**"
- Sullie mounts bottom-right

## Library calls

- `IframeManager` — load + swap with 4 real snapshots
- `Cursor` — glide + click with brand-orange ripples
- `mountSullieBug` — final brand anchor
- Inline DOM puppetry: API key letter-by-letter typing (input event dispatch), nickname typing

## Brand discipline

- `--wpf-orange #E27730` — Connect button ripple
- `--wpf-blue-light #0399ED` — popup info icon, settings panel toggle ON state (matches WPForms admin toggle color)
- Klaviyo dashboard cutaway uses #1a1a1f (their actual brand black) for the logo, account icon, and primary buttons
- No purple anywhere (Klaviyo is not an AI feature)

## Stage quality

- Stage at native 1280×720 with NO CSS transform (pixel-quality fix from prior commit)
- Iframe at native 1180×604 (matches mac-body inner) with no pre-scale, identity transform at rest
- Cutaway mockups render in parent doc with native CSS — sharp text via CPU rasterization

## Validation

- Open at `http://localhost:56480/videos/klaviyo-quick-connect/index.html`
- Visual QC focus:
  - Editorial intro fades cleanly
  - Mac frame materializes with the Klaviyo form snapshot visible inside
  - Klaviyo cutaway feels like a believable representation (not pixel-perfect, just enough to follow)
  - Snapshot swaps are crossfades (no flash)
  - API key + nickname typing is smooth
  - Cursor lands on correct targets in builder-providers / builder-providers-klaviyo
  - Connection settings panel mockup feels like the real WPForms builder panel
  - Outro card lands with Sullie

## Known limits

- Klaviyo dashboard side is a stylized mockup, not a pixel-perfect Klaviyo recreation. If you want better fidelity, capture real Klaviyo dashboard snapshots and swap the cutaway for IframeManager-loaded snapshots
- "Add New Connection" nickname popup + Connection settings panel are also mockups for the same reason
- These mockups could be promoted to motion-primitives or wpforms-marketing blocks if they get reused
