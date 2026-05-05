// GSAP Flip sandbox — four beats, each exercising one Flip pattern over
// chapter-local editorial DOM. The admin-forms-overview snapshot is just a
// backdrop; no iframe DOM is mutated.
//
// Authoring discipline (from project_future_enhancements.md):
//   - One gsap.timeline() per beat group; here Flip.from returns a tween
//     and we await its onComplete.
//   - autoAlpha for show/hide, not opacity.
//   - Animate transforms + opacity/filter only; no width/height/top/left
//     tweens. (Flip computes layout deltas and animates transforms.)
//   - clearProps:'all' at the end of every Flip tween.
//   - Finite repeat counts; no repeat:-1.

import sel from './_selectors.js';
import {
  loadGsapFlip,
  mountStageLayer,
  injectCss,
  iframeScale,
  iframeTranslate,
  flipDone,
  cloneFromIframe,
} from './_kit.js';

export const snapshot = 'admin-forms-overview';
export const validator = { snapshot: 'admin-forms-overview' };
export const mode = 'parallel';

// Editorial DOM only — clearly card/chip styling, not WPForms UI mimicry.
const STYLE = `
#flip-stage { font: 500 14px/1.4 -apple-system, "Segoe UI", sans-serif; color: #14161C; }
#flip-stage .fs-card,
#flip-stage .fs-chip {
  position: absolute;
  pointer-events: none;
  background: #fff;
  border: 1px solid #E27730;
  box-shadow: 0 6px 18px rgba(0,0,0,0.18);
  border-radius: 10px;
  padding: 10px 14px;
  visibility: hidden;          /* gsap.set(autoAlpha:0) reveals it */
  opacity: 0;
}
#flip-stage .fs-card.expanded { width: 360px; height: 110px; }
#flip-stage .fs-card.compact  { width: 120px; height: 36px; }

#flip-stage .fs-bin {
  position: absolute;
  width: 220px; height: 80px;
  border: 1px dashed #B7BFCC;
  border-radius: 12px;
  padding: 12px;
  display: flex; align-items: center; justify-content: center;
  color: #6B7280; font-size: 12px;
  background: rgba(255,255,255,0.55);
  visibility: hidden;
  opacity: 0;
}
#flip-stage .fs-grid {
  position: absolute;
  display: flex; flex-wrap: wrap; gap: 10px;
  padding: 14px;
  border-radius: 12px;
  background: rgba(255,255,255,0.6);
  border: 1px solid #E5E7EB;
  visibility: hidden;
  opacity: 0;
}
#flip-stage .fs-grid.compact   { width: 240px; }
#flip-stage .fs-grid.expanded  { width: 540px; }
#flip-stage .fs-grid .fs-chip {
  position: relative;          /* lay out by flex inside grid */
  width: auto; height: auto;
  visibility: visible;
  opacity: 1;
  background: #FFF7EE;
}
#flip-stage .fs-pin {
  position: absolute;
  background: #14161C;
  color: #fff;
  border: 0;
  box-shadow: 0 6px 18px rgba(0,0,0,0.32);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 12px;
}
/* Beat 5 — wrapper around the real cloned cell. The clone keeps its inlined
   computed styles; the wrapper provides the "lifted card" shell. */
#flip-stage .fs-lift {
  position: fixed;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.22);
  overflow: hidden;
  padding: 16px 20px;
  border: 1px solid #E5E7EB;
}
`;

// Helpers --------------------------------------------------------------------
function makeCard(text, classes) {
  const el = document.createElement('div');
  el.className = 'fs-card ' + (classes || '');
  el.textContent = text;
  return el;
}
function makeChip(text) {
  const el = document.createElement('div');
  el.className = 'fs-chip';
  el.textContent = text;
  return el;
}
function makeBin(label) {
  const el = document.createElement('div');
  el.className = 'fs-bin';
  el.textContent = label;
  return el;
}

// One-time mount of all editorial DOM. Cleanup happens beat-by-beat with
// autoAlpha exits + clearProps. Layer is removed at the end of beat 4.
export async function setup() {
  injectCss('flip-sandbox-css', STYLE);
  const layer = mountStageLayer('flip-stage', { z: 80 });

  // Beat 1 — single card, mounted at compact rect.
  const card1 = makeCard('Layout-change Flip', 'compact');
  card1.id = 'fs-beat1-card';
  card1.style.left = '60px';
  card1.style.top = '120px';
  layer.appendChild(card1);

  // Beat 2 — two bins + a chip living in bin A.
  const binA = makeBin('Container A');
  binA.id = 'fs-beat2-binA';
  binA.style.left = '60px'; binA.style.top = '300px';
  const binB = makeBin('Container B');
  binB.id = 'fs-beat2-binB';
  binB.style.right = '60px'; binB.style.top = '300px';
  const chip2 = makeChip('payload');
  chip2.id = 'fs-beat2-chip';
  chip2.style.position = 'static';
  chip2.style.visibility = 'visible';
  chip2.style.opacity = '1';
  binA.appendChild(chip2);
  layer.appendChild(binA);
  layer.appendChild(binB);

  // Beat 3 — single tooltip-style card, starts centered.
  const pinCard = makeCard('Pinned to Search Forms', 'compact');
  pinCard.id = 'fs-beat3-card';
  pinCard.classList.remove('compact');
  pinCard.classList.add('fs-pin');
  pinCard.style.left = '50%';
  pinCard.style.top = '440px';
  pinCard.style.transform = 'translate(-50%, 0)';
  pinCard.style.width = '260px';
  pinCard.style.height = '52px';
  layer.appendChild(pinCard);

  // Beat 4 — grid with 5 chips; toggled later between compact/expanded.
  const grid = document.createElement('div');
  grid.id = 'fs-beat4-grid';
  grid.className = 'fs-grid compact';
  grid.style.left = '60px';
  grid.style.top = '560px';
  for (let i = 1; i <= 5; i++) {
    const chip = makeChip('Chip ' + i);
    grid.appendChild(chip);
  }
  layer.appendChild(grid);
}

export default [
  // ── Beat 1 — Layout-change Flip ─────────────────────────────────────────
  {
    id: 'beat-1-layout-change',
    chapter: 'flip-1',
    duration: 2.4,
    effect: async ({ sleep }) => {
      const gsap = await loadGsapFlip();
      const Flip = window.Flip;
      const card = document.getElementById('fs-beat1-card');

      gsap.set(card, { autoAlpha: 1 });
      await sleep(300);

      const state = Flip.getState(card);
      card.classList.remove('compact');
      card.classList.add('expanded');

      const tween = Flip.from(state, {
        duration: 0.7,
        ease: 'power2.inOut',
        clearProps: 'transform',
      });
      await flipDone(tween);

      await sleep(500);
      await new Promise((r) => {
        gsap.to(card, {
          autoAlpha: 0,
          duration: 0.3,
          clearProps: 'all',
          onComplete: r,
        });
      });
    },
  },

  // ── Beat 2 — Parent-change Flip ─────────────────────────────────────────
  {
    id: 'beat-2-parent-change',
    chapter: 'flip-2',
    duration: 2.4,
    effect: async ({ sleep }) => {
      const gsap = await loadGsapFlip();
      const Flip = window.Flip;
      const binA = document.getElementById('fs-beat2-binA');
      const binB = document.getElementById('fs-beat2-binB');
      const chip = document.getElementById('fs-beat2-chip');

      gsap.set([binA, binB], { autoAlpha: 1 });
      await sleep(300);

      const state = Flip.getState(chip);
      binB.appendChild(chip);

      const tween = Flip.from(state, {
        duration: 0.8,
        ease: 'power3.inOut',
        clearProps: 'transform',
      });
      await flipDone(tween);

      await sleep(400);
      await new Promise((r) => {
        gsap.to([binA, binB], {
          autoAlpha: 0,
          duration: 0.3,
          clearProps: 'all',
          onComplete: r,
        });
      });
    },
  },

  // ── Beat 3 — Clone-and-pin to UI Flip ───────────────────────────────────
  {
    id: 'beat-3-pin-to-ui',
    chapter: 'flip-3',
    duration: 3.6,
    effect: async ({ sleep }) => {
      const gsap = await loadGsapFlip();
      const Flip = window.Flip;
      const card = document.getElementById('fs-beat3-card');

      // Identity-transform assertion (per Phase 1 refinement). If the iframe
      // has been zoomed by a previous camera move, scale the pin math; warn
      // so QC can spot accidental drift.
      const scale = iframeScale();
      const tx = iframeTranslate();
      if (Math.abs(scale - 1) > 0.02 || Math.abs(tx.x) > 1 || Math.abs(tx.y) > 1) {
        console.warn(
          '[flip-sandbox beat-3] iframe transform is not identity; scale=' +
            scale + ' translate=' + tx.x + ',' + tx.y +
            '. Applying scale factor to pin math.'
        );
      }

      gsap.set(card, { autoAlpha: 1 });
      await sleep(300);

      // Measure target rect through the iframe.
      const iframe = document.querySelector('iframe.ui');
      const idoc = iframe?.contentDocument;
      const target = idoc && idoc.querySelector(sel.searchInput);
      if (!target) {
        console.warn('[flip-sandbox beat-3] target selector missing: ' + sel.searchInput);
        return;
      }
      const ifrRect = iframe.getBoundingClientRect();
      const tRect = target.getBoundingClientRect();
      // Iframe's getBoundingClientRect already includes its own transform.
      // Inside-iframe coords need to be multiplied by the scale that the
      // iframe element is currently painted at — which is `scale`.
      const left = Math.round(ifrRect.left + tRect.left * scale);
      const top = Math.round(ifrRect.top + tRect.top * scale);
      const width = Math.round(tRect.width * scale);
      const height = Math.round(tRect.height * scale);

      const state = Flip.getState(card);
      // Drop the centering transform; switch to absolute target rect.
      card.style.transform = '';
      card.style.left = left + 'px';
      card.style.top = top + 'px';
      card.style.width = width + 'px';
      card.style.height = height + 'px';

      const tween = Flip.from(state, {
        duration: 0.85,
        ease: 'power3.inOut',
        clearProps: 'transform',
      });
      await flipDone(tween);

      await sleep(900);
      await new Promise((r) => {
        gsap.to(card, {
          autoAlpha: 0,
          duration: 0.35,
          clearProps: 'all',
          onComplete: r,
        });
      });
    },
  },

  // ── Beat 4 — State-driven reflow Flip ───────────────────────────────────
  {
    id: 'beat-4-state-reflow',
    chapter: 'flip-4',
    duration: 3.0,
    effect: async ({ sleep }) => {
      const gsap = await loadGsapFlip();
      const Flip = window.Flip;
      const grid = document.getElementById('fs-beat4-grid');
      const chips = grid.querySelectorAll('.fs-chip');

      gsap.set(grid, { autoAlpha: 1 });
      await sleep(400);

      const state = Flip.getState(chips);
      grid.classList.remove('compact');
      grid.classList.add('expanded');

      const tween = Flip.from(state, {
        duration: 0.8,
        ease: 'power2.inOut',
        stagger: (i) => i * 0.04,
        clearProps: 'transform',
      });
      await flipDone(tween);

      await sleep(500);
      await new Promise((r) => {
        gsap.to(grid, {
          autoAlpha: 0,
          duration: 0.3,
          clearProps: 'all',
          onComplete: r,
        });
      });
    },
  },

  // ── Beat 5 — Real-UI clone Flip ─────────────────────────────────────────
  // Clone a real form table row's primary cell from the iframe, mount the
  // clone on the stage layer at its measured screen rect, then run a
  // layout-change Flip that "lifts" the clone into a center-stage preview
  // card. Iframe DOM is never mutated; the clone is a visual actor only.
  {
    id: 'beat-5-real-ui-clone',
    chapter: 'flip-5',
    duration: 4.6,
    effect: async ({ sleep }) => {
      const gsap = await loadGsapFlip();
      const Flip = window.Flip;

      // Identity-transform assertion (same as Beat 3): pin math + clone
      // positioning both depend on the iframe being un-zoomed.
      const scale = iframeScale();
      const tx = iframeTranslate();
      if (Math.abs(scale - 1) > 0.02 || Math.abs(tx.x) > 1 || Math.abs(tx.y) > 1) {
        console.warn(
          '[flip-sandbox beat-5] iframe transform is not identity; scale=' +
            scale + ' translate=' + tx.x + ',' + tx.y +
            '. Cloning with scale factor.'
        );
      }

      const cloned = cloneFromIframe(sel.formRowNameCell, { scale });
      if (!cloned) {
        console.warn('[flip-sandbox beat-5] clone target missing: ' + sel.formRowNameCell);
        return;
      }
      const { clone, rect } = cloned;

      // Wrap in a lifted-card shell so we can morph parent + child as one.
      const lift = document.createElement('div');
      lift.className = 'fs-lift';
      lift.style.left = Math.round(rect.left) + 'px';
      lift.style.top = Math.round(rect.top) + 'px';
      lift.style.width = Math.round(rect.width) + 'px';
      lift.style.height = Math.round(rect.height) + 'px';
      // Start visually flat so the lift has somewhere to go.
      lift.style.boxShadow = '0 0 0 rgba(0,0,0,0)';
      lift.style.border = '1px solid transparent';
      lift.style.padding = '0';
      lift.appendChild(clone);
      // Make the clone fill the wrapper for the starting state.
      clone.style.position = 'static';
      clone.style.left = '';
      clone.style.top = '';
      clone.style.width = '100%';
      clone.style.height = '100%';

      const stage = document.getElementById('flip-stage');
      stage.appendChild(lift);
      gsap.set(lift, { autoAlpha: 1 });

      await sleep(300);

      // Compute lifted target rect: center-of-stage, scaled up.
      const stageRect = stage.getBoundingClientRect();
      const liftedW = Math.min(640, Math.round(rect.width * 1.55));
      const liftedH = Math.round(rect.height * 1.6);
      const liftedLeft = Math.round((stageRect.width - liftedW) / 2);
      const liftedTop = Math.round((stageRect.height - liftedH) / 2);

      const state = Flip.getState(lift, { props: 'boxShadow,borderColor,padding' });
      lift.style.left = liftedLeft + 'px';
      lift.style.top = liftedTop + 'px';
      lift.style.width = liftedW + 'px';
      lift.style.height = liftedH + 'px';
      lift.style.boxShadow = '0 12px 32px rgba(0,0,0,0.22)';
      lift.style.border = '1px solid #E5E7EB';
      lift.style.padding = '16px 20px';

      const tween = Flip.from(state, {
        duration: 0.95,
        ease: 'power3.inOut',
        clearProps: 'transform',
      });
      await flipDone(tween);

      await sleep(1100);
      await new Promise((r) => {
        gsap.to(lift, {
          autoAlpha: 0,
          duration: 0.4,
          clearProps: 'all',
          onComplete: r,
        });
      });

      // Sandbox cleanup — last beat owns it.
      document.getElementById('flip-stage')?.remove();
      document.getElementById('flip-sandbox-css')?.remove();
    },
  },
];
