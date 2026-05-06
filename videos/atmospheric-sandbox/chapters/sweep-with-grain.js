import { loadGsap, mountDarkBackdrop, mountGrain, mountSweep, tlDone } from './_kit.js';

export const snapshot = 'admin-forms-overview';
export const validator = { snapshot: 'admin-forms-overview' };
export const mode = 'parallel';
export const narration = 'sweep-with-grain';

export async function setup() {
  mountDarkBackdrop();
}

export default [
  {
    id: 'sweep-with-grain',
    chapter: 'sweep-with-grain',
    duration: 6,
    effect: async () => {
      const gsap = await loadGsap({ flip: false, motionPath: false });
      const grain = mountGrain({ opacity: 0.03, seed: 1, zIndex: 60 });
      const sweep = mountSweep();

      const tl = gsap.timeline();
      sweep.tweenInto(tl, { duration: 4, position: 0 });
      tl.to({}, { duration: 2 });
      await tlDone(tl);

      sweep.dispose();
      grain.dispose();
      document.getElementById('atmo-dark-canvas')?.remove();
    },
  },
];
