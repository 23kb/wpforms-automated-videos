import sel from './_selectors.js';

// Stage 5 transition lab — chapter C (yellow).
// SAME snapshot. Camera punches in to the prompt textarea — middle-bottom
// of the right panel, well away from chapter B's wide framing.

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
  placeMarker(ctx.doc, { color: '#fbe14a', label: 'C · empty · prompt', fg: '#111' });
}

export default [
  {
    id: 'c-prompt-focus',
    chapter: 'c-empty-prompt',
    duration: 3.0,
    camera: { focus: sel.promptInput, level: 1.20, pad: 32 },
    overlays: [{ highlight: sel.promptInput, label: 'Prompt' }],
    effect: async ({ cursor, sleep }) => {
      await cursor.glideTo(sel.promptInput, { wait: 500 });
      await sleep(2200);
    },
  },
];
