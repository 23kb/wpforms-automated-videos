import sel from './_selectors.js';

// Stage 5 transition lab — chapter E (blue).
// Snapshot CHANGES to wpforms-ai-builder-feedback-generated. This is the
// first swapStyle boundary — exercises the patched player.js path:
// `manifest.defaults.swapStyle` (or `?swapStyle=…` URL override) routes
// through `runSwapTransition`. The whole right panel turns from "empty
// chat ready" into "rendered survey form preview", so any swap style
// produces an obvious visual cue.

export const snapshot = 'wpforms-ai-builder-feedback-generated';
export const mode = 'parallel';
export const validator = { snapshot: 'wpforms-ai-builder-feedback-generated' };

function placeMarker(doc, { color, label, fg = '#fff' }) {
  if (!doc) return;
  const prior = doc.getElementById('stage5-marker');
  if (prior) prior.remove();
  const el = doc.createElement('div');
  el.id = 'stage5-marker';
  el.textContent = label;
  el.style.cssText =
    'position:fixed;top:14px;left:50%;transform:translateX(-50%);' +
    'z-index:2147483647;padding:8px 16px;border-radius:999px;' +
    'background:' + color + ';color:' + fg + ';font:600 14px/1 system-ui,sans-serif;' +
    'letter-spacing:0.04em;text-transform:uppercase;' +
    'box-shadow:0 2px 12px rgba(0,0,0,0.25);pointer-events:none;';
  (doc.body || doc.documentElement).appendChild(el);
}

export async function setup(ctx) {
  placeMarker(ctx.doc, { color: '#1f6feb', label: 'E · generated · preview' });
}

export default [
  {
    id: 'e-preview-focus',
    chapter: 'e-generated-preview',
    duration: 3.5,
    camera: { focus: sel.previewPanel, level: 1.05, pad: 26 },
    overlays: [{ highlight: sel.nameField, label: 'Generated form' }],
    effect: async ({ cursor, sleep }) => {
      await cursor.glideTo(sel.nameField, { wait: 600 });
      await sleep(2400);
    },
  },
];
