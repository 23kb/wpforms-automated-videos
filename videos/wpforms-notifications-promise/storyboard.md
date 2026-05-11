# Storyboard — wpforms-notifications-promise

**Path:** Pure editorial (single-HTML, no engine, no real product UI)
**Duration:** ~18 seconds, 5 beats
**Slug:** `wpforms-notifications-promise`
**File:** `videos/wpforms-notifications-promise/index.html`

## Concept

"Notifications that just work." — confident, brand-forward, emotionally simple. Every form submission triggers a real-time email. No feature list, no bullet points. One morphing element carries the entire arc.

## Brand discipline

- Primary color: `--wpf-orange #E27730`
- Accent: `--wpf-blue #066AAB` (for the "sent" / inbox state)
- **No purple anywhere** — this is the notifications product, not AI. Purple is AI-feature-only per `reference/wpforms-brand/BRAND.md`.
- Font: system stack from `tokens.css`
- Sullie: real `sullie-master.svg`, mounted once at the end (not over-used)
- Atmosphere: warm cream/orange tones, not the purple-blue of the AI reference template

## Morph chain (load-bearing — single element carries the story)

```
CTA Button → Status Pill → Envelope → Notification List
   #morphHost (the single DOM element that transforms across all beats)
```

The morph host is a rounded `<div>` that:
- Beat 1: looks like an orange CTA button with "Submit Form" text
- Beat 2: pills out (height shrinks, width adjusts, color shifts) into a status indicator
- Beat 3: gains envelope outlines via pseudo-elements + becomes white with blue text
- Beat 4: expands into a 3-row notification list (height grows, content reveals via fieldStaggerReveal)

## Beat-by-beat

### Beat 1 — Arrival (0 - 2.5s)
- Mac-frame chrome materializes (scale 0.96 → 1, opacity 0 → 1, 600ms)
- Inside the frame: clean cream background with subtle warm bloom (orange + cream gradient, no animation, just static atmosphere)
- The `#morphHost` button arrives center: "Submit Form" — orange `#E27730`, white text, rounded 8px, ~220×56px
- Sullie does NOT appear yet (saved for sign-off)
- Cursor mounts off-stage (top-right, parked)

### Beat 2 — Submit click (2.5 - 5s)
- `Cursor.glide` from parked → CTA button center (640ms, with `{ via }` mid-waypoint for natural arc)
- `Cursor.click` (squash + ripple, the orange ripple flashes briefly)
- `#morphHost` instantly transforms: width 220 → 280, height 56 → 36, border-radius 8 → 18, background orange → cream with orange ring
- Inside, `caretType` types "Submitting…" character-by-character

### Beat 3 — Status morph (5 - 9s)
- `statusPillMorph` rotates the pill text: "Submitting…" → "Sent" → "Delivered to inbox" (3 phases, ~1s each)
- During the LAST phase, pill background shifts orange-ring → blue-ring (`#066AAB`), text from orange to blue
- An envelope outline (SVG pseudo-element layered with the pill) scales in from 0 to enclose the pill — pill is now the envelope's "body"
- Light scale-up of the morphHost (1.0 → 1.05) — subtle breathing emphasis

### Beat 4 — Envelope opens (9 - 13s)
- Envelope flap (top portion) animates: rotateX(0deg) → rotateX(180deg) with perspective, 700ms `power3.inOut`
- Inside the now-open envelope, three lines reveal:
  - Line 1 (caretType, 1.2s): "From: Marcus Rivera"
  - Line 2 (caretType, 1.2s): "Subject: New contact form submission"
  - Line 3 (small, fades in): "marcus@example.com"
- Envelope body expands slightly to accommodate the lines (height grows ~80px)

### Beat 5 — List + brand sign-off (13 - 18s)
- The envelope shrinks back to a notification card (one row), height settles to 64px
- TWO additional notification cards slide in below via `fieldStaggerReveal` (stagger 0.1s, rise 12px, fade in):
  - "From: Priya Sharma — Subject: Question about pricing"
  - "From: Emily Chen — Subject: Demo request"
- `mountSullieBug` lands Sullie bottom-right with the bounded yoyo float
- Brand tag fades in centered below the cards: "**Notifications that just work.**" (16px, --wpf-ink, system font)
- Final 1s rest, no exit (this is a single-take ad — fade-out happens at recording time, not in the timeline)

## Library calls

- `Cursor` class (motion-primitives) — glide + click + ripple
- `caretType` (motion-primitives) — Beat 2 + Beat 4 typed lines
- `statusPillMorph` (motion-primitives) — Beat 3 phase rotation
- `fieldStaggerReveal` (motion-primitives) — Beat 5 notification cards cascade
- `mountSullieBug` (motion-primitives) — Beat 5 brand anchor

## Inline (DOM puppetry, no library)

- Mac-frame mount + style
- Atmosphere bloom positioning (static)
- Envelope outline SVG layering
- Envelope flap rotation animation (custom 3D transform)
- Brand tag fade-in

## Zoom dependency

**None.** Everything is parent-doc DOM at native rendering. No iframes, no snapshot loading. Text is rasterized by the CPU at native pixel grid throughout. Sharp at every frame.

## File outputs

- `videos/wpforms-notifications-promise/index.html` (single self-contained file, vendored GSAP)
- `videos/wpforms-notifications-promise/storyboard.md` (this file)

## Validation

- Open in browser at `http://localhost:56480/videos/wpforms-notifications-promise/index.html`
- Visual QC: 5 beats land in order, morph chain visible (no jump-cuts between phases), brand orange used (not purple), Sullie appears once at end
- No engine, no manifest, no `validate-video.js` (validator is engine-path only)
