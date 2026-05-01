// cff-chapter-2 — Hover Simple Contact Form card, click Use Template.

import { defineChapter } from '/runtime/chapter-api.js';
import sel from './_selectors/builder-setup.js';

export default defineChapter({
  slug: 'cff-chapter-2',
  title: 'cff-chapter-2 — Pick Simple Contact Form',
  snapshot: 'builder-setup',
  chapter: 'pick-template',
  narration: 'cff-chapter-2',

  steps: [
    {
      id: 'focus-card',
      label: 'Frame the Simple Contact Form card',
      do: 'focus',
      target: sel.simpleContactCard,
      fill: 0.55,
      hold: 300,
    },
    {
      id: 'hover',
      label: 'Hover card → reveal Use Template button',
      do: 'hover',
      target: sel.simpleContactCard,
      wait: 700,
      hold: 700,
    },
    {
      id: 'click-use',
      label: 'Click Use Template',
      do: 'clickOn',
      target: sel.simpleContactUseBtn,
      fill: 0.55,
      instruction: 'Click Use Template',
      direction: 'down',
      postHold: 1600,
      hideCursor: true,
    },
  ],
});
