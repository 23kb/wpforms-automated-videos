// Flip tour focused on a single real WPForms element:
// #wpforms-template-generate (the "Generate With AI" template card on the
// builder Setup panel).
//
// Each beat is a different Flip pattern applied to a clone of that exact
// card. The iframe DOM is never mutated — clones are visual actors only.
//
// Discipline rules (project_future_enhancements.md):
//   - One Flip tween per beat; await onComplete via flipDone().
//   - autoAlpha for show/hide.
//   - Animate transforms + opacity/filter only; Flip computes layout deltas.
//   - clearProps:'transform' on Flip tweens, 'all' on exit fades.
//   - Finite repeats; no repeat:-1.

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

export const snapshot = 'builder-setup';
export const validator = { snapshot: 'builder-setup' };
export const mode = 'parallel';

const STYLE = `
#flip-gen-stage { font: 500 14px/1.4 -apple-system, "Segoe UI", sans-serif; }

/* Lifted-card shell — wraps the cloned template card. Starts flat, picks up
   shadow/border/padding via Flip during the lift. */
#flip-gen-stage .gc-shell {
  position: fixed;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 0 0 rgba(0,0,0,0);
  border: 1px solid transparent;
  padding: 0;
}
#flip-gen-stage .gc-shell.lifted {
  box-shadow: 0 18px 44px rgba(0,0,0,0.24);
  border: 1px solid #E5E7EB;
  padding: 18px 22px;
}

/* Right-side "shortlist" column the card flies into during the parent-change
   beat. Editorial framing — clearly a stage element, not a fake WPForms UI. */
#flip-gen-stage .gc-shortlist {
  position: fixed;
  right: 5%;
  top: 18%;
  width: 380px;
  min-height: 280px;
  padding: 18px;
  border-radius: 14px;
  background: rgba(255,255,255,0.92);
  border: 1px solid #E5E7EB;
  box-shadow: 0 12px 32px rgba(0,0,0,0.16);
  visibility: hidden;
  opacity: 0;
}
#flip-gen-stage .gc-shortlist h4 {
  margin: 0 0 12px;
  font: 600 12px/1 -apple-system, "Segoe UI", sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6B7280;
}

/* Reflow demo — when toggled, the cloned card's body switches from its
   stock vertical layout to a horizontal layout. We wrap the cloned card in
   a host class that overrides display+flow for the inner blocks. */
#flip-gen-stage .gc-reflow-mode .wpforms-template-thumbnail {
  width: 38% !important;
  float: left !important;
  margin-right: 18px !important;
}
#flip-gen-stage .gc-reflow-mode .wpforms-template-name-wrap,
#flip-gen-stage .gc-reflow-mode .wpforms-template-desc,
#flip-gen-stage .gc-reflow-mode .wpforms-template-buttons {
  margin-left: calc(38% + 18px) !important;
  text-align: left !important;
}
`;

export async function setup() {
  injectCss('flip-gen-css', STYLE);
  mountStageLayer('flip-gen-stage', { z: 80 });
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers — live for the full tour. We keep the same clone across beats so
// each pattern operates on the same element and the tour reads as a chain.
// ────────────────────────────────────────────────────────────────────────────
let CLONE = null;
let SHELL = null;
let HOME_RECT = null; // original screen rect of the card inside the iframe

function buildClone() {
  const scale = iframeScale();
  const tx = iframeTranslate();
  if (Math.abs(scale - 1) > 0.02 || Math.abs(tx.x) > 1 || Math.abs(tx.y) > 1) {
    console.warn('[flip-generate-card] iframe transform non-identity; scale=' +
      scale + ' translate=' + tx.x + ',' + tx.y);
  }
  const cloned = cloneFromIframe(sel.generateCard, { scale });
  if (!cloned) return null;
  const { clone, rect } = cloned;
  HOME_RECT = rect;

  // Wrap clone in a "shell" that holds the lifted-card chrome.
  const shell = document.createElement('div');
  shell.className = 'gc-shell';
  shell.style.left = Math.round(rect.left) + 'px';
  shell.style.top = Math.round(rect.top) + 'px';
  shell.style.width = Math.round(rect.width) + 'px';
  shell.style.height = Math.round(rect.height) + 'px';

  // Make the clone fill the shell.
  clone.style.position = 'static';
  clone.style.left = '';
  clone.style.top = '';
  clone.style.width = '100%';
  clone.style.height = '100%';
  shell.appendChild(clone);

  document.getElementById('flip-gen-stage').appendChild(shell);
  CLONE = clone;
  SHELL = shell;
  return shell;
}

function liftedTargetRect(stageRect) {
  const w = Math.min(560, Math.round(HOME_RECT.width * 1.7));
  const h = Math.round(HOME_RECT.height * 1.55);
  const left = Math.round((stageRect.width - w) / 2);
  const top = Math.round((stageRect.height - h) / 2);
  return { left, top, width: w, height: h };
}

export default [
  // ── Beat 1 — Layout-change Flip: lift the card from its iframe slot ────
  // The card swells from its original size into a hero-sized lifted card,
  // picking up shadow + border + padding mid-tween via Flip's `props`.
  {
    id: 'gc-1-lift',
    chapter: 'gc-1',
    duration: 3.2,
    effect: async ({ sleep }) => {
      const gsap = await loadGsapFlip();
      const Flip = window.Flip;
      const shell = buildClone();
      if (!shell) return;
      gsap.set(shell, { autoAlpha: 1 });

      await sleep(400);

      const stage = document.getElementById('flip-gen-stage');
      const stageRect = stage.getBoundingClientRect();
      const t = liftedTargetRect(stageRect);

      const state = Flip.getState(shell, {
        props: 'boxShadow,borderColor,padding',
      });
      shell.classList.add('lifted');
      shell.style.left = t.left + 'px';
      shell.style.top = t.top + 'px';
      shell.style.width = t.width + 'px';
      shell.style.height = t.height + 'px';

      const tween = Flip.from(state, {
        duration: 0.95,
        ease: 'power3.inOut',
        clearProps: 'transform',
      });
      await flipDone(tween);
      await sleep(800);
    },
  },

  // ── Beat 2 — Parent-change Flip: card flies into a shortlist pane ──────
  // Real Flip strength: change parent + position with appendChild, Flip
  // animates the screen-space delta as if the card slid into the column.
  {
    id: 'gc-2-parent-change',
    chapter: 'gc-2',
    duration: 3.4,
    effect: async ({ sleep }) => {
      const gsap = await loadGsapFlip();
      const Flip = window.Flip;
      if (!SHELL) return;

      // Mount the destination parent on the stage.
      const stage = document.getElementById('flip-gen-stage');
      const shortlist = document.createElement('div');
      shortlist.className = 'gc-shortlist';
      shortlist.innerHTML = '<h4>Shortlisted</h4>';
      stage.appendChild(shortlist);
      gsap.set(shortlist, { autoAlpha: 1 });

      await sleep(300);

      const state = Flip.getState(SHELL, {
        props: 'boxShadow,borderColor,padding',
      });

      // Reparent + size for the column slot. Drop fixed positioning so it
      // lays out inside the shortlist; Flip computes the delta from the old
      // fixed rect to the new in-flow rect.
      shortlist.appendChild(SHELL);
      SHELL.style.position = 'static';
      SHELL.style.left = '';
      SHELL.style.top = '';
      SHELL.style.width = '100%';
      SHELL.style.height = 'auto';
      SHELL.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)';
      SHELL.style.padding = '12px 14px';

      const tween = Flip.from(state, {
        duration: 1.0,
        ease: 'power3.inOut',
        clearProps: 'transform',
      });
      await flipDone(tween);
      await sleep(900);
    },
  },

  // ── Beat 3 — Internal reflow Flip: card body flips vertical→horizontal ─
  // Same card, same parent. Toggle a class on the shell so its inner blocks
  // (thumbnail / name / desc / button) restack from a vertical card to a
  // horizontal media-row layout. Flip animates every child's delta in one
  // tween — the strength of the plugin in one beat.
  {
    id: 'gc-3-internal-reflow',
    chapter: 'gc-3',
    duration: 3.4,
    effect: async ({ sleep }) => {
      const gsap = await loadGsapFlip();
      const Flip = window.Flip;
      if (!CLONE) return;

      // Capture state across all immediate children that will reflow.
      const targets = CLONE.querySelectorAll(
        '.wpforms-template-thumbnail, .wpforms-template-name-wrap, .wpforms-template-desc, .wpforms-template-buttons'
      );
      const state = Flip.getState(targets);

      CLONE.classList.add('gc-reflow-mode');

      const tween = Flip.from(state, {
        duration: 0.85,
        ease: 'power2.inOut',
        stagger: (i) => i * 0.04,
        clearProps: 'transform',
      });
      await flipDone(tween);
      await sleep(900);
    },
  },

  // ── Beat 4 — Snap-back Flip: clone returns to its original iframe slot ─
  // Closes the loop: undo reflow, lift back to a free-floating shell,
  // then Flip the shell from its current shortlisted rect back onto the
  // exact screen rect of #wpforms-template-generate inside the iframe.
  {
    id: 'gc-4-snap-back',
    chapter: 'gc-4',
    duration: 3.4,
    effect: async ({ sleep }) => {
      const gsap = await loadGsapFlip();
      const Flip = window.Flip;
      if (!SHELL || !CLONE || !HOME_RECT) return;

      // Drop the reflow class — clone's children resume their stock layout.
      CLONE.classList.remove('gc-reflow-mode');

      const state = Flip.getState(SHELL, {
        props: 'boxShadow,borderColor,padding',
      });

      // Detach from shortlist; re-pin to the original screen rect.
      const stage = document.getElementById('flip-gen-stage');
      stage.appendChild(SHELL);
      SHELL.classList.remove('lifted');
      SHELL.style.position = 'fixed';
      SHELL.style.left = Math.round(HOME_RECT.left) + 'px';
      SHELL.style.top = Math.round(HOME_RECT.top) + 'px';
      SHELL.style.width = Math.round(HOME_RECT.width) + 'px';
      SHELL.style.height = Math.round(HOME_RECT.height) + 'px';
      SHELL.style.boxShadow = '0 0 0 rgba(0,0,0,0)';
      SHELL.style.border = '1px solid transparent';
      SHELL.style.padding = '0';

      const tween = Flip.from(state, {
        duration: 1.0,
        ease: 'power3.inOut',
        clearProps: 'transform',
      });
      await flipDone(tween);

      await sleep(700);
      await new Promise((r) => {
        gsap.to(SHELL, {
          autoAlpha: 0,
          duration: 0.45,
          clearProps: 'all',
          onComplete: r,
        });
      });

      // Cleanup — last beat owns it.
      document.getElementById('flip-gen-stage')?.remove();
      document.getElementById('flip-gen-css')?.remove();
      CLONE = null;
      SHELL = null;
      HOME_RECT = null;
    },
  },
];
