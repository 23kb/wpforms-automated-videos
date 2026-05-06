import { loadGsap, loadLottie, mountLottie, tlDone } from './_kit.js';

export const snapshot = 'admin-forms-overview';
export const validator = { snapshot: 'admin-forms-overview' };
export const mode = 'parallel';
export const narration = 'bumper';

export async function setup() {}

export default [
  {
    id: 'markers',
    chapter: 'markers',
    duration: 0.2,
    effect: async () => {
      const gsap = await loadGsap({ flip: false, motionPath: false });
      await loadLottie();
      const lottie = mountLottie('/videos/lottie-sandbox/assets/badge.json');
      await waitForLottie(lottie.animation);

      const tl = gsap.timeline();
      lottie.tweenMarker(tl, {
        from: 'enter',
        to: 'hold',
        duration: 0.6,
        ease: 'power2.out',
        position: 0,
      });
      tl.to({}, { duration: 0.4 });
      lottie.tweenMarker(tl, {
        from: 'hold',
        to: 'exit',
        duration: 0.6,
        ease: 'power1.inOut',
        position: '>',
      });
      await tlDone(tl);

      lottie.dispose();
    },
  },
];

function waitForLottie(animation) {
  return new Promise(resolve => {
    const check = () => {
      if (animation.isLoaded) resolve();
      else requestAnimationFrame(check);
    };
    check();
  });
}
