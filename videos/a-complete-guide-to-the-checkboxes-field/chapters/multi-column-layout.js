import { defineChapter } from '/runtime/chapter-api.js';
import sel from './_selectors/multi-column-layout.js';

export default defineChapter({
  slug: 'multi-column-layout',
  title: 'Lay choices out in columns',
  snapshot: 'builder-field-options-checkbox',
  chapter: 'multi-column-layout',
  prep: [
    { op: 'applyDefaultForm', keepIds: [1, 2, 4, 7], labels: { '7': 'Pizza Toppings' } },
    { op: 'stripQuizEnabled' },
    { op: 'activateFieldOptionGroup', fieldId: 7, group: 'advanced' },
    { op: 'activateFieldOptionGroup', fieldId: 7, controlName: 'input_columns' },
    { op: 'setChoiceLabels', fieldId: 7, labels: ['Pepperoni', 'Mushrooms', 'Extra cheese'] },
    { op: 'applyIconChoicesV2', fieldId: 7, glyph: 'face-smile', iconStyle: 'regular', color: '#066aab', size: 'large', style: 'default' },
    { op: 'setCheckedChoices', fieldId: 7, indexes: [0, 2] },
  ],
  steps: [
    {
      id: 'open-advanced-tab',
      label: 'Open Advanced',
      do: 'clickOn',
      target: sel.openAdvancedTab,
      instruction: 'Open Advanced',
      fill: 0.5,
      narration: 'multi-column-layout-open-advanced-tab',
    },
    {
      id: 'pick-choice-layout',
      label: 'Choose Two Columns',
      do: 'selectFauxDropdown',
      target: sel.choiceLayoutRow,
      pick: '2',
      fill: 0.52,
      after: [{ op: 'setChoiceLayout', fieldId: 7, value: '2' }],
      narration: 'multi-column-layout-pick-choice-layout',
    },
    {
      id: 'layout-payoff',
      label: 'Choices fit in two columns',
      do: 'popOut',
      target: sel.fieldPreview,
      lift: 1.08,
      holdMs: 1050,
      narration: 'multi-column-layout-layout-payoff',
    },
  ],
});
