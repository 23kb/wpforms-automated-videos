import { defineChapter } from '/runtime/chapter-api.js';
import sel from './_selectors/save-checkboxes-field.js';

export default defineChapter({
  slug: 'save-checkboxes-field',
  title: 'Save and close out',
  snapshot: 'builder-fields',
  chapter: 'save-checkboxes-field',
  // Override the manifest's 'morph' swap for this boundary only — the prev
  // chapter ends in a different snapshot with its own zoom, and morph carries
  // that transform over so the first focusOn measures against stale state.
  // 'fast' resets the iframe to identity before the swap. (Same fix as edit-label.)
  swapStyle: 'fast',
  prep: [
    { op: 'applyDefaultForm', keepIds: [1, 2, 4, 7] },
    { op: 'setFieldLabel', id: 7, label: 'Pizza Toppings' },
    { op: 'setChoiceLabels', fieldId: 7, labels: ['Pepperoni', 'Mushrooms', 'Extra cheese'] },
    { op: 'applyIconChoicesV2', fieldId: 7, glyph: 'face-smile', iconStyle: 'regular', color: '#066aab', size: 'large', style: 'default' },
    { op: 'setChoiceLayout', fieldId: 7, value: '2' },
    { op: 'setCheckedChoices', fieldId: 7, indexes: [0, 2] },
  ],
  steps: [
    {
      id: 'final-field-preview',
      label: 'Review the finished field',
      do: 'focusPull',
      target: sel.fieldPreview,
      blur: 3,
      holdMs: 900,
      narration: 'save-checkboxes-field-final-field-preview',
    },
    {
      id: 'save-form',
      label: 'Save your form',
      do: 'clickOn',
      target: sel.saveForm,
      instruction: 'Save your form',
      fill: 0.55,
      narration: 'save-checkboxes-field-save-form',
    },
  ],
});
