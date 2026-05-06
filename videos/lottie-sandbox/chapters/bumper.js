import { loadGsap, loadLottie, mountLottie, tlDone } from './_kit.js';

export const snapshot = 'admin-forms-overview';
export const validator = { snapshot: 'admin-forms-overview' };
export const mode = 'parallel';
export const narration = 'bumper';

export async function setup() {}

export default [
  {
    id: 'bumper',
    chapter: 'bumper',
    duration: 0.2,
    effect: async () => {
      const gsap = await loadGsap({ flip: false, motionPath: false });
      await loadLottie();
      const lottie = mountLottie('/videos/lottie-sandbox/assets/bumper.json');
      await new Promise(resolve => lottie.animation.addEventListener('DOMLoaded', resolve));
      const duration = lottie.animation.getDuration(false);

      const tl = gsap.timeline();
      lottie.tweenInto(tl, { duration, position: 0 });
      tl.to({}, { duration: 1 });
      await tlDone(tl);

      lottie.dispose();
    },
  },
];
