import { defineChapter } from '/runtime/chapter-api.js';
import sel from './_selectors/edit-label.js';

export default defineChapter({
  slug: 'edit-label',
  title: 'Give it a clear label',
  snapshot: 'builder-field-options-checkbox',
  chapter: 'edit-label',
  swapStyle: 'flipBridge',
  prep: [
    { op: 'applyDefaultForm', keepIds: [1, 2, 4, 7], labels: { '7': 'Checkboxes' } },
    { op: 'stripQuizEnabled' },
    { op: 'activateFieldOptionGroup', fieldId: 7, group: 'basic' },
  ],
  steps: [
    {
      id: 'set-label',
      label: 'Type the field label',
      do: 'typeInto',
      target: sel.setLabel,
      text: 'Pizza Toppings',
      clear: true,
      fill: 0.48,
      after: [{ op: 'setFieldLabel', id: 7, label: 'Pizza Toppings' }],
      narration: 'edit-label-set-label',
    },
    {
      id: 'set-choices',
      label: 'Rename the choices',
      do: 'typeInto',
      target: sel.firstChoiceValue,
      text: 'Pepperoni',
      clear: true,
      fill: 0.5,
      after: [{ op: 'setChoiceLabels', fieldId: 7, labels: ['Pepperoni', 'Mushrooms', 'Extra cheese'] }],
      narration: 'edit-label-set-choices',
    },
    {
      id: 'preview-custom-list',
      label: 'Preview the custom list',
      do: 'popOut',
      target: sel.fieldPreview,
      lift: 1.08,
      holdMs: 950,
      narration: 'edit-label-preview-custom-list',
    },
  ],
});
