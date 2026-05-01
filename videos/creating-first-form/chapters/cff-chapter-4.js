// cff-chapter-4 — Click Name field → tour General options → click Advanced
// tab → tour Advanced options.

import { defineChapter } from '/runtime/chapter-api.js';
import { applyDefaultForm } from '/runtime/dom-prep.js';
import sel from './_selectors/builder-fields.js';

const FIELD_ID = 1;
const OPTIONS_PANEL   = '#wpforms-field-option-' + FIELD_ID;
const GENERAL_GROUP   = '#wpforms-field-option-basic-' + FIELD_ID;
const ADVANCED_GROUP  = '#wpforms-field-option-advanced-' + FIELD_ID;
const ADVANCED_TAB    = ADVANCED_GROUP + ' > a.wpforms-field-option-group-toggle';

export default defineChapter({
  slug: 'cff-chapter-4',
  title: 'cff-chapter-4 — Name field options tour',
  snapshot: 'builder-fields',
  chapter: 'name-field-options',
  narration: 'cff-chapter-4',

  prep: (doc) => {
    applyDefaultForm(doc, { keepIds: [1, 2, 3, 4] });
    doc.getElementById('wpforms-field-3')?.style.setProperty('display', 'none', 'important');
  },

  steps: [
    {
      id: 'click-name',
      label: 'Click Name field → open Field Options',
      do: 'clickOn',
      target: sel.fieldName,
      openFieldOptions: FIELD_ID,
      fill: 0.55,
      instruction: 'Click Name field', direction: 'down',
      postHold: 300,
      hideCursor: true,
    },
    {
      id: 'zoom-general',
      label: 'Zoom into General options',
      do: 'hold',
      target: GENERAL_GROUP,
      fill: 0.8,
      ms: 2000,
    },
    {
      id: 'frame-panel',
      label: 'Frame options panel before clicking Advanced',
      do: 'focus',
      target: OPTIONS_PANEL,
      fill: 0.9,
      hold: 400,
    },
    {
      id: 'click-advanced',
      label: 'Click Advanced tab → switch option group',
      do: 'switchTab',
      target: ADVANCED_TAB,
      fill: 0.55,
      instruction: 'Click Advanced', direction: 'up',
      postHold: 300,
      hideCursor: true,
    },
    {
      id: 'zoom-advanced',
      label: 'Zoom into Advanced options',
      do: 'hold',
      target: ADVANCED_GROUP,
      fill: 0.8,
      ms: 2200,
    },
  ],
});
