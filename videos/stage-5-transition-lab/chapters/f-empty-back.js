import sel from './_selectors.js';

// Stage 5 transition lab — chapter F (purple).
// Snapshot CHANGES BACK to wpforms-ai-builder-empty. Second swapStyle
// boundary — gives a second data point for cover/morph/push/whip/fast
// going the OTHER direction (rich form preview → empty chat). Camera
// returns to the AI chat header so reviewers can compare front/back
// swaps from a familiar reference frame.

export const snapshot = 'wpforms-ai-builder-empty';
export const mode = 'parallel';
export const validator = { snapshot: 'wpforms-ai-builder-empty' };

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
  placeMarker(ctx.doc, { color: '#8957e5', label: 'F · empty · back to header' });
}

export default [
  {
    id: 'f-header-back',
    chapter: 'f-empty-back',
    duration: 3.0,
    camera: { focus: sel.aiChatHeader, level: 1.18, pad: 36 },
    overlays: [{ highlight: sel.aiChatHeader, label: 'Header (return)' }],
    effect: async ({ cursor, sleep }) => {
      await cursor.glideTo(sel.aiChatHeader, { wait: 500 });
      await sleep(2200);
    },
  },
];
