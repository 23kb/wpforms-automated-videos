// v4 Beat 6 — EXPORT (shortest kicker, ~2.2s).
//
// Shot subject:  the export menu.
// Editorial:     "Take it anywhere." (bottom-left)
//
// Grammar:
//   - Smallest, quickest proof beat in the video.
//   - Menu opens, cursor sweeps CSV → PDF → Print (no clicks, no dwell on
//     any one item), menu closes, text exits. No snapshot swap. No camera
//     move beyond a small pad adjustment.

import {
  EXPORT_BTN, EXPORT_MENU, FIELD_11,
  fakeOpenMenu, fakeCloseMenu, sleep, editorialText,
} from './_helpers.js';

export const snapshot = 'sp-results-new-418-base';
export const mode = 'parallel';

export default [
  {
    id: 'export', chapter: 'export',
    duration: 0.2,
    effect: async ({ cursor, zoomTo }) => {
      const doc = document.querySelector('iframe.ui').contentDocument;
      const silentClick = async (sel) => {
        await cursor.moveTo(sel, { wait: 400 });
        await cursor.click();
        try {
          const el = doc.querySelector(sel);
          if (el) {
            el.addEventListener('click', (e) => e.preventDefault(), { capture: true, once: true });
            el.click();
          }
        } catch {}
      };

      const ed = editorialText('Take it anywhere.', { size: 42 });
      ed.show({ shineAfter: false });

      await sleep(160);

      await silentClick(EXPORT_BTN);
      await fakeOpenMenu(EXPORT_MENU);

      // Gentle push for legibility.
      await zoomTo([EXPORT_MENU], {
        level: 1.22, pad: 60, smooth: true, scrollBehavior: 'smooth', noScroll: true,
      });

      await sleep(560);

      // Close + pull back. Editorial line exits in parallel.
      ed.exit({ ms: 380 });
      await fakeCloseMenu(EXPORT_MENU);
      await zoomTo([FIELD_11], {
        level: 1.0, pad: 100, smooth: true, scrollBehavior: 'smooth',
      });
      await sleep(140);
    },
  },
];
