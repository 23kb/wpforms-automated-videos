# WPForms Brand — Canonical Source of Truth

This folder is the canonical brand reference for any video in this repo. All assets here are real, sourced from the live WPForms plugin at `C:\Users\PC\Local Sites\newsite\app\public\wp-content\plugins\wpforms`. Detail audit: `docs/wpforms-source-inventory-2026-05-10.md`.

**Use this folder. Do not invent brand details.**

## What's here

| File | What | Source |
|---|---|---|
| `tokens.css` | CSS custom properties for colors, font stack, spinner timing | Hand-distilled from plugin admin CSS |
| `assets/sullie-master.svg` | Sullie mascot, full palette, 80×80 | `assets/images/splash/sullie.svg` |
| `assets/loading-avatar.svg` | Masked Sullie head used in builder loading overlay | `assets/images/builder/loading-avatar.svg` |
| `assets/loading-spinner.svg` | Orange ring on grey track, rotates at 0.8s linear | `assets/images/builder/loading-spinner.svg` |
| `assets/spinner-3dots.svg` | 3-dot AI chat thinking indicator | Reproduced from `getSpinnerSvg()` in `wpforms-ai-chat-element.min.js:33` |

## Use cases

### Hero / lockup beat needs the WPForms logo

The wordmark SVG already lives at `assets/wordmark.svg` (repo root, 1.1KB, single path) — that's the existing canonical. Don't duplicate. Just import.

### Sullie mascot moment

Use `reference/wpforms-brand/assets/sullie-master.svg`. Don't use the older `assets/sullie - svg.svg` (different version, may diverge from current brand).

### "AI is generating" loading state

Two options:

1. **Inline 3-dot chat spinner** (most common, matches real WPForms AI chat) — copy `spinner-3dots.svg` content directly into your DOM, the CSS animations are inline. Use inside `.wpforms-chat-item-answer-waiting > .wpforms-chat-item-spinner` for full visual fidelity with the live plugin.
2. **Full-screen builder loading overlay** (heavier, when you want the canonical "loading the form builder" feel) — combine `loading-avatar.svg` (Sullie head, static) + `loading-spinner.svg` (orange ring, rotating). Plugin source uses `wpforms-spinner-rotation 0.8s linear infinite`.

### Color tokens

Always import `tokens.css`:

```html
<link rel="stylesheet" href="/reference/wpforms-brand/tokens.css">
```

Then use vars: `var(--wpf-orange)`, `var(--wpf-blue)`, `var(--wpf-bg-warm)`, etc.

**Anti-patterns (rejected by `wpforms-motion-audit` skill):**

- `--wpf-purple: #7a30e2` as **primary** brand color — this was the bug in `videos/wpforms-ai-announcement/index.html:52-58`. Purple IS correct for AI-feature accents (chat send button, AI status indicators — `reference/html-templates/wpforms-ai-prompt-open.html` uses it correctly for these). Use `--wpf-ai-purple` token. Never primary.
- Inventing a Sullie variant, recoloring the logo, or generating a "WPForms-style" placeholder when the real asset is in this folder.

**Soft preference (not anti-patterns):**

- Plugin source uses OS system font stack only (`var(--wpf-font-stack)`). Editorial videos that want a more "designed" feel may add a webfont (e.g. Inter as in `wpforms-ai-prompt-open.html:24`); fine when it serves the editorial composition. Keep the system stack as fallback.

### UI accent icons (envelope, card, clipboard, person, document, open-mail)

Six small SVG icons live at the repo root: `assets/wpforms-icon-1.svg` through `assets/wpforms-icon-6.svg`. These are real WPForms UI accents (mail envelope, credit-card row, clipboard, open envelope, person, document) — useful as beautification glyphs in editorial composition, marker pills, lower-thirds, or anywhere a small WPForms-flavored shape adds visual texture without competing with primary content.

| File | Shape | Size | Use case |
|---|---|---|---|
| `assets/wpforms-icon-1.svg` | Envelope (closed) | 20×17 | Email/notification context |
| `assets/wpforms-icon-2.svg` | Card / credit row | 20×14 | Payment / billing context |
| `assets/wpforms-icon-3.svg` | Clipboard (portrait) | 16×21 | Form / survey context |
| `assets/wpforms-icon-4.svg` | Envelope (open) | 20×21 | Mail-opened / inbox context |
| `assets/wpforms-icon-5.svg` | Person | 20×18 | User / signup / lead context |
| `assets/wpforms-icon-6.svg` | Document | 24×24 | Document / template context |

All use `fill="#ffffff"` — recolor via parent container or override fill at use site. Don't invent new WPForms-style icons; reuse these.

### Real form templates (when a video needs to show the template gallery)

Plugin templates are CDN-fetched, not bundled. API:

```
https://wpforms.com/templates/api/get/
```

Returns JSON with thumbnails. Use it instead of inventing fake template cards (the mistake in `videos/wpforms-ai-announcement/index.html:725-757`). Cache the JSON + thumbs locally for the video build, then serve from your assets directory so the video doesn't depend on network at render time.

### AI chat HTML structure

The real WPForms AI chat is a Web Component:

```html
<wpforms-ai-chat mode="forms" class="wpforms-ai-chat-blue">
  <div class="wpforms-ai-chat">
    <div class="wpforms-ai-chat-message-list wpforms-scrollbar-compact">
      <div class="wpforms-chat-item wpforms-chat-item-question">…</div>
      <div class="wpforms-chat-item-answer-waiting">
        <div class="wpforms-chat-item-spinner">
          <!-- spinner-3dots.svg here -->
        </div>
      </div>
    </div>
    <div class="wpforms-ai-chat-message-input">
      <textarea placeholder="…"></textarea>
      <button class="wpforms-ai-chat-send"></button>
      <button class="wpforms-ai-chat-stop"></button>
    </div>
  </div>
</wpforms-ai-chat>
```

"Use This Form" button: `.wpforms-btn-orange.wpforms-ai-chat-answer-action`.

These class names are what real DOM puppetry and CSS injection should target — not invented names.

## When to update this folder

Re-pull from the live plugin source when:
- WPForms releases a brand refresh (logo, color, mascot)
- A new canonical loading state appears in the AI feature
- The 3-dot spinner CSS keyframes change

Re-pull command pattern:

```bash
cp "C:/Users/PC/Local Sites/newsite/app/public/wp-content/plugins/wpforms/assets/images/splash/sullie.svg" reference/wpforms-brand/assets/sullie-master.svg
# repeat for loading-avatar.svg, loading-spinner.svg
```

The 3-dot spinner is reproduced from JS at `wpforms-ai-chat-element.min.js:33` — re-extract by reading `getSpinnerSvg()` if it changes.

## Cross-references

- `docs/wpforms-source-inventory-2026-05-10.md` — full plugin-source audit
- `docs/winning-pattern-analysis-2026-05-10.md` — what 3 winning videos do right (incl. brand handling)
- `docs/editorial-direction-audit-2026-05-10.md` — master plan, Phase 3 brand fix scope
- `reference/html-templates/` — canonical clone-and-customize HTML templates that should adopt these tokens
- `.claude/skills/wpforms-motion-audit/SKILL.md` (built by Codex Phase 2) — audits for brand violations
