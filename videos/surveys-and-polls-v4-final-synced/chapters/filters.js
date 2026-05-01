// v4 Beat 5 — FILTERS (proof beat #2).
//
// Shot subject:  the filters menu opening.
// Editorial:     "Slice it on the fly." (bottom-left)
//
// Grammar:
//   - Dismiss the graph lift from the customize beat as the cursor moves
//     toward the filters button — the chart settles back into the page.
//   - Open filters menu, light camera push to read it, close.
//   - No export in this beat. Export is its own short kicker chapter.

import {
  FILTERS_BTN, FILTERS_MENU, FIELD_11,
  fakeOpenMenu, fakeCloseMenu, sleep, editorialText,
} from './_helpers.js';

export const snapshot = 'sp-results-new-418-base';
export const mode = 'parallel';

export default [
  {
    id: 'filters', chapter: 'filters',
    duration: 0.2,
    effect: async ({ cursor, zoomTo }) => {
      const doc = document.querySelector('iframe.ui').contentDocument;
      const silentClick = async (sel) => {
        await cursor.moveTo(sel, { wait: 540 });
        await cursor.click();
        try {
          const el = doc.querySelector(sel);
          if (el) {
            el.addEventListener('click', (e) => e.preventDefault(), { capture: true, once: true });
            el.click();
          }
        } catch {}
      };

      // Dismiss graph lift handed off from customize beat — chart settles.
      if (window.__v4GraphLift?.dismiss) {
        window.__v4GraphLift.dismiss();
        window.__v4GraphLift = null;
      }

      const ed = editorialText('Slice it on the fly.', { size: 42 });
      ed.show({ shineAfter: true });

      await sleep(220);

      await silentClick(FILTERS_BTN);
      await fakeOpenMenu(FILTERS_MENU);

      // Small camera push for legibility — not a hero punch.
      await zoomTo([FILTERS_MENU], {
        level: 1.22, pad: 60, smooth: true, scrollBehavior: 'smooth', noScroll: true,
      });
      await sleep(520);

      await fakeCloseMenu(FILTERS_MENU);

      ed.exit({ ms: 280 });

      await zoomTo([FIELD_11], {
        level: 1.0, pad: 80, smooth: true, scrollBehavior: 'smooth',
      });
      await sleep(180);
    },
  },
];
