import { defineChapter } from '/runtime/chapter-api.js';
import sel from './_selectors/required.js';

export default defineChapter({
  slug: 'required',
  title: 'Make the field required',
  snapshot: 'builder-field-options-checkbox',
  chapter: 'required',
  prep: [
    { op: 'applyDefaultForm', keepIds: [1, 2, 4, 7], labels: { '7': 'Pizza Toppings' } },
    { op: 'stripQuizEnabled' },
    { op: 'activateFieldOptionGroup', fieldId: 7, group: 'basic' },
    { op: 'setChoiceLabels', fieldId: 7, labels: ['Pepperoni', 'Mushrooms', 'Extra cheese'] },
    { op: 'applyIconChoicesV2', fieldId: 7, glyph: 'face-smile', iconStyle: 'regular', color: '#066aab', size: 'large', style: 'default' },
    { op: 'setChoiceLayout', fieldId: 7, value: '2' },
    { op: 'setCheckedChoices', fieldId: 7, indexes: [0, 2] },
  ],
  steps: [
    {
      id: 'toggle-required',
      label: 'Turn on Required',
      do: 'clickOn',
      target: sel.toggleRequired,
      instruction: 'Turn on Required',
      direction: 'right',
      fill: 0.48,
      after: [{ op: 'setRequired', fieldId: 7, on: true }],
      narration: 'required-toggle-required',
    },
    {
      id: 'required-payoff',
      label: 'Required marker appears',
      do: 'focusPull',
      target: sel.fieldPreview,
      blur: 3,
      holdMs: 950,
      narration: 'required-payoff',
    },
  ],
});
