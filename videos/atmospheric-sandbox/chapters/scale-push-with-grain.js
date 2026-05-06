import { loadGsap, mountDarkBackdrop, mountGrain, scalePush, tlDone } from './_kit.js';

export const snapshot = 'admin-forms-overview';
export const validator = { snapshot: 'admin-forms-overview' };
export const mode = 'parallel';
export const narration = 'scale-push-with-grain';

export async function setup() {
  mountDarkBackdrop();
}

function mountHeroCard() {
  const card = document.createElement('div');
  card.id = 'atmo-scale-hero-card';
  Object.assign(card.style, {
    position: 'fixed', left: '50%', top: '50%',
    width: '640px', maxWidth: 'calc(100vw - 96px)',
    padding: '48px', transform: 'translate(-50%, -50%)',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.02)',
    pointerEvents: 'none', zIndex: '70', textAlign: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    boxSizing: 'border-box', willChange: 'transform',
  });
  card.innerHTML = `
    <span style="display:block;font-size:56px;line-height:1.05;font-weight:600;color:#fff;">WPForms 1.9.9+</span>
    <span style="display:block;margin-top:16px;font-size:18px;line-height:1.35;font-weight:400;color:rgba(255,255,255,0.55);">REST API now available</span>
  `;
  document.body.appendChild(card);
  return card;
}

export default [
  {
    id: 'scale-push-with-grain',
    chapter: 'scale-push-with-grain',
    duration: 0.2,
    effect: async () => {
      const gsap = await loadGsap({ flip: false, motionPath: false });
      const grain = mountGrain({ opacity: 0.03, seed: 1, zIndex: 60 });
      const heroCard = mountHeroCard();
      const push = scalePush({ target: heroCard });

      const tl = gsap.timeline();
      push.tweenInto(tl, { duration: 4, position: 0 });
      tl.to({}, { duration: 2 });
      await tlDone(tl);

      push.dispose();
      grain.dispose();
      document.getElementById('atmo-dark-canvas')?.remove();
      heroCard.remove();
    },
  },
];
