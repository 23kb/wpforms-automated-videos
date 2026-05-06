import { loadGsap, mountGrain, tlDone } from './_kit.js';

export const snapshot = 'admin-forms-overview';
export const validator = { snapshot: 'admin-forms-overview' };
export const mode = 'parallel';
export const narration = 'grain-only';

export async function setup() {
  const existing = document.getElementById('atmo-dark-canvas');
  if (existing) existing.remove();

  const canvas = document.createElement('canvas');
  canvas.id = 'atmo-dark-canvas';
  canvas.width = 1920;
  canvas.height = 1080;
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: '55',
    visibility: 'hidden',
  });
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0a0e14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  document.body.appendChild(canvas);
}

export default [
  {
    id: 'grain-only',
    chapter: 'grain-only',
    duration: 6,
    effect: async ({ sleep }) => {
      const gsap = await loadGsap({ flip: false, motionPath: false });
      const backdrop = document.getElementById('atmo-dark-canvas');
      const grain = mountGrain({ opacity: 0.03, seed: 1, zIndex: 60 });

      const tl = gsap.timeline();
      tl.set(backdrop, { autoAlpha: 1 });
      await tlDone(tl);

      await sleep(6000);
      grain.dispose();
      backdrop?.remove();
    },
  },
];
