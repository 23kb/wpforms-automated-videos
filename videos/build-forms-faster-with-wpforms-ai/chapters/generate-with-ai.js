import sel from './_selectors.js';

export const snapshot = 'builder-setup';
export const mode = 'per-beat-narration';
export const validator = { snapshot: 'builder-setup' };
export const swapStyle = 'morph'; // cause→effect: Generate With AI click reveals the AI builder in the same flow

function showGenerateHover(doc) {
  const card = doc.querySelector(sel.generateCard);
  const buttons = doc.querySelector(sel.generateButtonsWrap);
  const badge = doc.querySelector(sel.generateBadge);
  card?.classList.add('active', 'selected');
  if (buttons) buttons.style.opacity = '1';
  if (badge) badge.style.opacity = '0';
}

export default [
  {
    id: 'choose-generate-with-ai',
    chapter: 'generate-with-ai',
    camera: { focus: sel.generateCard, level: 1.18, pad: 34 },
    overlays: [{ highlight: sel.generateCard, label: 'Generate With AI' }],
    narration: 'generate-with-ai-choose',
    effect: async ({ doc, cursor, sleep }) => {
      await cursor.glideTo(sel.generateCard, { wait: 420 });
      showGenerateHover(doc);
      await sleep(120);
      await cursor.glideTo(sel.generateButton, { wait: 360 });
      await sleep(180);
    },
  },
  {
    id: 'open-ai-builder',
    chapter: 'generate-with-ai',
    camera: { focus: sel.generateCard, level: 1.10, pad: 38 },
    narration: 'generate-with-ai-open',
    effect: async ({ doc, cursor, sleep, swapToSnapshot }) => {
      showGenerateHover(doc);
      await cursor.clickOn(sel.generateButton, {
        instruction: 'Generate Form',
        direction: 'right',
        dispatch: false,
      });
      await sleep(160);
      await swapToSnapshot('wpforms-ai-builder-empty');
    },
  },
];
