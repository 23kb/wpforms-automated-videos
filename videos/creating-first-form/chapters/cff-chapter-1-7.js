// cff-chapter-1.7 — Wide shot of the template carousel + smooth vertical
// scroll through the grid. No cursor.

import { defineChapter } from '/runtime/chapter-api.js';
import { loadGsap, registerTimeline } from '../../_shared/kit.js';
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
      async after(doc) {
        const marker = doc.createElement('span');
        marker.dataset.frameDriverPilot = 'creating-first-form';
        marker.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;';
        doc.body.appendChild(marker);
        const gsap = await loadGsap();
        const tl = gsap.timeline({ paused: true });
        tl.to(marker, { x: 1, duration: 9, ease: 'none' });
        registerTimeline(tl, { id: 'creating-first-form:cff-chapter-1-7:wide' });
      },
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
