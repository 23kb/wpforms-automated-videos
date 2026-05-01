// cff-chapter-3 — Visual tour of Name / Email / Message on the canvas.
// No cursor. Wide shot → combined highlight → wide shot.

import { defineChapter } from '/runtime/chapter-api.js';
import { applyDefaultForm } from '/runtime/dom-prep.js';
import sel from './_selectors/builder-fields.js';

export default defineChapter({
  slug: 'cff-chapter-3',
  title: 'cff-chapter-3 — Tour the 3 fields',
  snapshot: 'builder-fields',
  chapter: 'fields-tour',
  narration: 'cff-chapter-3',

  prep: (doc) => {
    // Keep field-3 in the DOM (hidden) so chapter 5's drag-reveal pattern
    // still finds it when the chain reaches that point.
    applyDefaultForm(doc, { keepIds: [1, 2, 3, 4] });
    doc.getElementById('wpforms-field-3')?.style.setProperty('display', 'none', 'important');
  },

  steps: [
    {
      id: 'wide',
      label: 'Wide shot of trimmed form',
      do: 'hold',
      target: sel.canvas,
      fill: 0.85,
      ms: 800,
    },
    {
      id: 'combined',
      label: 'Combined highlight on Name + Email + Message',
      do: 'highlight',
      target: sel.canvas,       // camera stays on the wide canvas frame
      fill: 0.85,
      // showHighlight accepts a selector array — engine unions the rects.
      highlights: [sel.fieldName, sel.fieldEmail, sel.fieldMessage],
      hold: 2200,
    },
    {
      id: 'wide-back',
      label: 'Return to wide shot',
      do: 'hold',
      target: sel.canvas,
      fill: 0.85,
      ms: 1500,
    },
  ],
});
