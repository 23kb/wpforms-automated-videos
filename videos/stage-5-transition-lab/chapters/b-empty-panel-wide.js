import sel from './_selectors.js';

// Stage 5 transition lab — chapter B (amber).
// SAME snapshot as A (wpforms-ai-builder-empty). Camera pulls back to a
// wide framing on the whole AI panel — visually farthest from chapter A's
// tight header crop, so the breakStyle's camera-retarget motion is obvious.

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
  placeMarker(ctx.doc, { color: '#f5a623', label: 'B · empty · wide panel', fg: '#111' });
}

export default [
  {
    id: 'b-panel-wide',
    chapter: 'b-empty-panel-wide',
    duration: 3.0,
    camera: { focus: sel.aiPanel, level: 1.02, pad: 24 },
    overlays: [{ highlight: sel.aiPanel, label: 'Whole panel' }],
    effect: async ({ cursor, sleep }) => {
      await cursor.glideTo(sel.aiPanel, { wait: 500 });
      await sleep(2200);
    },
  },
];
