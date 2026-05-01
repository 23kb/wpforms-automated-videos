import sel from './_selectors.js';

export const snapshot = 'wpforms-ai-builder-feedback-generated';
export const mode = 'per-beat-narration';
export const validator = { snapshot: 'wpforms-ai-builder-feedback-generated' };
export const breakStyle = 'glide'; // cause→effect: continue from generated preview into Use This Form without extra punctuation

function stageUseForm(doc) {
  const button = doc.querySelector(sel.useFormButton);
  if (!button) return;
  button.style.transform = 'scale(1.02)';
  button.style.boxShadow = '0 0 0 4px rgba(226,119,48,0.14), 0 10px 24px rgba(226,119,48,0.20)';
  button.style.transition = 'transform 180ms ease, box-shadow 180ms ease';
}

export default [
  {
    id: 'confirm-draft-ready',
    chapter: 'use-form',
    camera: {
      focus: [sel.answerBubble, sel.useFormButton, sel.previewTitle],
      level: 1.03,
      pad: 28,
      noScroll: true,
    },
    narration: 'use-form-ready',
    effect: async ({ doc, cursor, sleep }) => {
      stageUseForm(doc);
      await sleep(180);
      await cursor.glideTo(sel.useFormButton, { wait: 360 });
      await sleep(160);
    },
  },
  {
    id: 'click-use-this-form',
    chapter: 'use-form',
    camera: {
      focus: [sel.useFormButton, sel.previewPanel],
      level: 1.02,
      pad: 32,
      noScroll: true,
    },
    narration: 'use-form-click',
    effect: async ({ doc, cursor, sleep, focusPull }) => {
      stageUseForm(doc);
      await cursor.clickOn(sel.useFormButton, {
        dispatch: false,
        magnetic: true,
      });
      await sleep(120);
      await focusPull(sel.previewPanel, {
        blur: 1.4,
        dim: 0.14,
        holdMs: 700,
        riseMs: 280,
        fallMs: 240,
      });
    },
  },
];
