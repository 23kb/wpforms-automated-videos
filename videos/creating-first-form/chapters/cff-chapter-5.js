// cff-chapter-5 — Search "Single" in the Add Fields sidebar, then drag
// Single Line Text onto the canvas. Replaces cff-chapter-5.html.
//
// Camera plan (2 frames, not 4):
//   1. Wide sidebar frame → search + filter + highlight all share this frame
//   2. Canvas frame → drag target + settle on the dropped field share this one

import { defineChapter } from '/runtime/chapter-api.js';
import { applyDefaultForm } from '/runtime/dom-prep.js';
import sel from './_selectors/builder-fields.js';

export default defineChapter({
  slug: 'cff-chapter-5',
  title: 'cff-chapter-5 — Search + drag Single Line Text',
  snapshot: 'builder-fields',
  chapter: 'fields-drag',
  narration: 'cff-chapter-5',

  prep: (doc) => {
    applyDefaultForm(doc, { keepIds: [1, 2, 3, 4] });
    // Keep Single Line Text (#3) in the DOM but hide it until the drop
    // reveals a real field node — never fabricate UI.
    doc.getElementById('wpforms-field-3')?.style.setProperty('display', 'none', 'important');
    // Chain mode: chapter 4 left the right-rail on Field Options. Restore
    // the Add Fields panel so our search input has non-zero size.
    const add = doc.getElementById('wpforms-add-fields-tab');
    const opt = doc.getElementById('wpforms-field-options');
    add?.style.setProperty('display', 'block', 'important');
    opt?.style.setProperty('display', 'none', 'important');
    doc.querySelector('#add-fields > a')?.classList.add('active');
    doc.querySelector('#field-options > a')?.classList.remove('active');
  },

  steps: [
    {
      id: 'enter-sidebar',
      label: 'Frame the Add Fields sidebar',
      do: 'focus',
      target: sel.addFieldsTab,
      fill: 0.95,
      hold: 400,
    },
    {
      // No target → runner skips focusOn → camera stays at sidebar frame.
      id: 'search',
      label: 'Type "Single" into the field search box',
      do: 'typeInto',
      target: sel.searchInput, // focus tight on the input for the typing beat
      fill: 0.8,
      text: 'Single',
      filter: 'wpforms-add-fields-text',
      postHold: 400,
    },
    {
      // No target → stay at the search frame.
      id: 'highlight-match',
      label: 'Highlight Single Line Text in the filtered sidebar',
      do: 'highlight',
      target: sel.textBtn,
      label: 'Single Line Text',
      hold: 900,
      postHold: 300,
    },
    {
      id: 'drag',
      label: 'Drag Single Line Text onto the canvas',
      do: 'dragGrab',
      target: sel.canvas,
      fill: 0.95,
      preHold: 300,
      from: sel.textBtn,
      to: sel.canvas,
      wait: 900,
      revealAt: 650,
      reveal: sel.fieldText,
    },
    {
      id: 'settle',
      label: 'Settle + brief ring on the dropped field',
      do: 'highlight',
      target: sel.fieldText,
      fill: 0.7,
      hold: 1200,
    },
  ],
});
