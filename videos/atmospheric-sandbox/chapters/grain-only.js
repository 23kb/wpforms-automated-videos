import { loadGsap, mountDarkBackdrop, mountGrain, tlDone } from './_kit.js';

export const snapshot = 'admin-forms-overview';
export const validator = { snapshot: 'admin-forms-overview' };
export const mode = 'parallel';
export const narration = 'grain-only';

export async function setup() {
  mountDarkBackdrop();
}

export default [
  {
    id: 'grain-only',
    chapter: 'grain-only',
    duration: 6,
    effect: async () => {
      const gsap = await loadGsap({ flip: false, motionPath: false });
      const grain = mountGrain({ opacity: 0.03, seed: 1, zIndex: 60 });

      const tl = gsap.timeline();
      tl.to({}, { duration: 6 });
      await tlDone(tl);

      grain.dispose();
      document.getElementById('atmo-dark-canvas')?.remove();
    },
  },
];
