// cff-chapter-1.7 — Wide shot of the template carousel + smooth vertical
// scroll through the grid. No cursor.

import { defineChapter } from '/runtime/chapter-api.js';
import sel from './_selectors/builder-setup.js';

export default defineChapter({
  slug: 'cff-chapter-1-7',
  title: 'cff-chapter-1.7 — Template carousel',
  snapshot: 'builder-setup',
  chapter: 'template-carousel',
  narration: 'cff-chapter-1-7',

  prep: [
    { op: 'removeAdminBar' },
  ],

  steps: [
    {
      id: 'wide',
      label: 'Wide shot of the templates grid',
      do: 'hold',
      target: sel.templatesGrid,
      fill: 0.95,
      ms: 1200,
    },
    {
      id: 'scroll',
      label: 'Smooth vertical scroll through the grid',
      do: 'scroll',
      // No target → stays on the wide shot frame.
      duration: 9000,
      distance: 400,
    },
  ],
});
