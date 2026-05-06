import { loadGsap, mountDarkBackdrop, mountGrain, mountTextReveal, tlDone } from './_kit.js';

export const snapshot = 'admin-forms-overview';
export const validator = { snapshot: 'admin-forms-overview' };
export const mode = 'parallel';
export const narration = 'text-spring-scale-in';

export async function setup() {
  mountDarkBackdrop();
}

export default [
  {
    id: 'text-spring-scale-in',
    chapter: 'text-spring-scale-in',
    duration: 0.2,
    effect: async () => {
      const gsap = await loadGsap({ flip: false, motionPath: false });
      const grain = mountGrain({ opacity: 0.03, seed: 1, zIndex: 60 });
      const reveal = mountTextReveal('WPForms 1.9.9+', { preset: 'spring-scale-in' });

      const tl = gsap.timeline();
      reveal.tweenInto(tl, { duration: 1.2, position: 0.3 });
      tl.to({}, { duration: 4 });
      await tlDone(tl);

      reveal.dispose();
      grain.dispose();
      document.getElementById('atmo-dark-canvas')?.remove();
    },
  },
];
