import { defineChapter } from '/runtime/chapter-api.js';
import sel from './_selectors/multi-select-behavior.js';

export default defineChapter({
  slug: 'multi-select-behavior',
  title: 'Set default selections',
  snapshot: 'builder-field-options-checkbox',
  chapter: 'multi-select-behavior',
  prep: [
    { op: 'applyDefaultForm', keepIds: [1, 2, 4, 7], labels: { '7': 'Pizza Toppings' } },
    { op: 'stripQuizEnabled' },
    { op: 'activateFieldOptionGroup', fieldId: 7, group: 'basic' },
    { op: 'setChoiceLabels', fieldId: 7, labels: ['Pepperoni', 'Mushrooms', 'Extra cheese'] },
  ],
  steps: [
    {
      id: 'select-first-choice',
      label: 'Set Pepperoni as default',
      do: 'clickOn',
      target: sel.firstChoiceDefault,
      instruction: 'Set Pepperoni as default',
      direction: 'right',
      fill: 0.58,
      after: [{ op: 'setCheckedChoices', fieldId: 7, indexes: [0] }],
      narration: 'multi-select-behavior-select-first-choice',
    },
    {
      id: 'select-third-choice',
      label: 'Set Extra cheese as default',
      do: 'clickOn',
      target: sel.thirdChoiceDefault,
      instruction: 'Set Extra cheese as default',
      direction: 'right',
      fill: 0.58,
      after: [{ op: 'setCheckedChoices', fieldId: 7, indexes: [0, 2] }],
      narration: 'multi-select-behavior-select-third-choice',
    },
    {
      id: 'multi-select-payoff',
      label: 'Defaults appear in the preview',
      do: 'focusPull',
      target: sel.fieldPreview,
      blur: 3,
      holdMs: 1100,
      narration: 'multi-select-behavior-payoff',
    },
  ],
});
