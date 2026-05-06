import { loadGsap, mountDarkBackdrop, mountGrain, mountParallaxPair, tlDone } from './_kit.js';

export const snapshot = 'admin-forms-overview';
export const validator = { snapshot: 'admin-forms-overview' };
export const mode = 'parallel';
export const narration = 'parallax-with-grain';

export async function setup() {
  mountDarkBackdrop();
}

export default [
  {
    id: 'parallax-with-grain',
    chapter: 'parallax-with-grain',
    duration: 0.2,
    effect: async () => {
      const gsap = await loadGsap({ flip: false, motionPath: false });
      const grain = mountGrain({ opacity: 0.03, seed: 1, zIndex: 60 });
      const parallax = mountParallaxPair({
        backBg: 'radial-gradient(ellipse 80% 60% at 30% 40%, rgba(40,90,130,0.35) 0%, transparent 70%)',
        frontBg: 'radial-gradient(ellipse 60% 50% at 70% 60%, rgba(120,60,140,0.30) 0%, transparent 65%)',
      });

      const tl = gsap.timeline();
      parallax.tweenInto(tl, { duration: 6, position: 0 });
      await tlDone(tl);

      parallax.dispose();
      grain.dispose();
      document.getElementById('atmo-dark-canvas')?.remove();
    },
  },
];
