import { loadGsap, loadLottie, mountLottie, tlDone } from './_kit.js';

export const snapshot = 'admin-forms-overview';
export const validator = { snapshot: 'admin-forms-overview' };
export const mode = 'parallel';
export const narration = 'bumper';

export async function setup() {}

export default [
  {
    id: 'scrub',
    chapter: 'scrub',
    duration: 0.2,
    effect: async () => {
      const gsap = await loadGsap({ flip: false, motionPath: false });
      await loadLottie();
      const lottie = mountLottie('/videos/lottie-sandbox/assets/bumper.json');
      await waitForLottie(lottie.animation);

      const tl = gsap.timeline();
      lottie.tweenFrames(tl, {
        from: 0,
        to: 30,
        duration: 1.0,
        ease: 'power2.out',
        position: 0,
      });
      tl.to({}, { duration: 0.5 });
      lottie.tweenFrames(tl, {
        from: 30,
        to: 10,
        duration: 0.8,
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
