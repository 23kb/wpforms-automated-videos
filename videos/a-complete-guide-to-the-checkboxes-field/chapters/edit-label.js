import { defineChapter } from '/runtime/chapter-api.js';
import sel from './_selectors/edit-label.js';

export default defineChapter({
  slug: 'edit-label',
  title: 'Give it a clear label',
  snapshot: 'builder-field-options-checkbox',
  chapter: 'edit-label',
  // Override the manifest's 'morph' swap for this boundary only. Morph
  // re-applies the outgoing iframe's transform to the incoming iframe so the
  // crossfade preserves framing — but the prev chapter ends with a focusPull
  // zoom on field-7 which doesn't match this chapter's options-panel layout,
  // so the carry-over leaves the first focusOn measuring against a stale
  // transform. 'fast' resets the iframe to identity before the swap (per
  // runtime/chapter-runner.js handling of non-morph styles), giving edit-label
  // a clean boot identical to its solo-mode behaviour.
  swapStyle: 'fast',
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
