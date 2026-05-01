import sel from './_selectors.js';

export const snapshot = 'wpforms-ai-builder-empty';
export const mode = 'per-beat-narration';
export const validator = { snapshot: 'wpforms-ai-builder-empty' };
export const breakStyle = 'glide'; // cause→effect: continue from AI builder into prompt entry without a chapter punctuation
export const swapStyle = 'morph'; // cause→effect: prompt submit materializes generated preview in context

export default [
  {
    id: 'show-ai-builder',
    chapter: 'prompt-form',
    camera: { focus: sel.builderPanel, level: 1.0, pad: 0, noScroll: true },
    narration: 'prompt-form-builder',
    effect: async ({ sleep }) => {
      await sleep(240);
    },
  },
  {
    id: 'type-survey-prompt',
    chapter: 'prompt-form',
    camera: { focus: sel.promptInput, level: 1.08, pad: 54, noScroll: true },
    narration: 'prompt-form-type',
    effect: async ({ doc, cursor, sleep, type }) => {
      const input = doc.querySelector(sel.promptInput);
      const box = input?.closest('.wpforms-ai-chat-message-input') || input;
      if (box) {
        box.style.outline = '3px solid #E27730';
        box.style.outlineOffset = '3px';
        box.style.boxShadow = '0 0 0 6px rgba(226,119,48,0.14)';
        box.style.borderRadius = '7px';
        box.style.transition = 'outline-color 180ms ease, box-shadow 180ms ease';
      }
      await cursor.glideTo(sel.promptInput, { wait: 360 });
      await cursor.click();
      await type(sel.promptInput, 'online feedback survey', {
        cps: 34,
        clear: true,
      });
      await sleep(120);
      await cursor.glideTo(sel.sendPrompt, { wait: 260 });
      await cursor.click();
      if (box) {
        box.style.outlineColor = 'transparent';
        box.style.boxShadow = 'none';
      }
    },
  },
  {
    id: 'draft-appears',
    chapter: 'prompt-form',
    camera: { focus: sel.builderPanel, level: 1.0, pad: 0, noScroll: true },
    narration: 'prompt-form-draft',
    effect: async ({ sleep, focusPull, swapToSnapshot, zoomTo }) => {
      await swapToSnapshot('wpforms-ai-builder-feedback-generated', {
        setup: async () => {
          const doc = document.querySelector('iframe.ui')?.contentDocument;
          const panel = doc?.querySelector(sel.previewPanel);
          if (!panel) return;
          panel.style.opacity = '0';
          panel.style.transform = 'translateY(16px)';
          panel.style.transition = 'opacity 520ms ease-out, transform 520ms ease-out';
        },
      });
      const panel = document.querySelector('iframe.ui')?.contentDocument?.querySelector(sel.previewPanel);
      if (panel) {
        panel.style.opacity = '1';
        panel.style.transform = 'translateY(0)';
      }
      await sleep(280);
      await zoomTo([sel.answerBubble, sel.previewTitle, sel.ratingField, sel.npsField], {
        level: 1.0,
        pad: 24,
        smooth: true,
        noScroll: true,
      });
      await sleep(260);
      await focusPull(sel.previewPanel, { blur: 1.8, dim: 0.16, holdMs: 620, riseMs: 300, fallMs: 260 });
    },
  },
];
