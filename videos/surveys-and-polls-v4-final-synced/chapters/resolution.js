// v4 Beat 7 — RESOLUTION.
//
// Shot subject:  the refreshed report, one final breath.
// No controls, no editorial text — the outro card is the next moment,
// and the composition should feel settled before it arrives.

import { FIELD_11, sleep } from './_helpers.js';

export const snapshot = 'sp-results-new-418-base';
export const mode = 'parallel';

export default [
  {
    id: 'resolution', chapter: 'resolution',
    duration: 0.2,
    effect: async ({ zoomTo }) => {
      // Slow inward breath on the held hero. Level stays at 1.0 — dropping
      // below reveals stage bg around the iframe. Drift is carried by pad.
      await zoomTo([FIELD_11], {
        level: 1.0, pad: 100, smooth: true, scrollBehavior: 'smooth',
      });
      await sleep(1100);
    },
  },
];
