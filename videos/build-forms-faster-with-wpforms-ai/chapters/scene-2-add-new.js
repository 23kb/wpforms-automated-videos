// Scene 2 — WPForms Add New screen + cursor entrance (~4s).
//
// The builder-setup snapshot is already on stage from Scene 1. We:
//   1. Reveal a centered-left caption "Start with a simple idea." with
//      bottom-up letter motion.
//   2. Push the camera in toward the Generate With AI card.
//   3. Glide the glowing-arrow cursor along a curved arc from off-screen
//      bottom-right to the card.
//   4. Apply a magnetic hover lift on the card with a premium AI focus ring, and
//      reveal the button buttons-wrap (matches the real product hover).
//   5. Settle the cursor onto the Generate Form button — Scene 3 will pick
//      up the actual click.

import sel from './_selectors.js';
import {
  loadGsap, ensureFont, customizeEngineCursor,
  mountSceneLayer, injectCss, playSfx, tlDone,
} from './_kit.js';

export const snapshot = 'builder-setup';
export const mode = 'parallel';
export const breakStyle = 'soft-dolly';
export const swapStyle = 'fast';

// Styles injected INTO the iframe document so the magnetic hover + focus ring
// can decorate the real captured Generate With AI card without faking UI.
const IFRAME_CSS = `
#wpforms-template-generate {
  position: relative;
  overflow: visible !important;
  transform: translateZ(0);
  --ring-angle: 0deg;
}
#wpforms-template-generate.scene-hover {
  z-index: 5;
}
#wpforms-template-generate::before {
  content: "";
  position: absolute;
  inset: -3px;
  border-radius: 18px;
  padding: 2.5px;
  background: conic-gradient(
    from var(--ring-angle),
    rgba(124, 58, 237, 0),
    rgba(124, 58, 237, 0.72),
    rgba(3, 153, 237, 0.52),
    rgba(226, 119, 48, 0.18),
    rgba(124, 58, 237, 0)
  );
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  pointer-events: none;
  transition: opacity 450ms cubic-bezier(.22,1,.36,1);
  z-index: 3;
}
#wpforms-template-generate::after {
  content: "";
  position: absolute;
  inset: -18px;
  border-radius: 28px;
  background:
    radial-gradient(circle at 50% 50%,
      rgba(124, 58, 237, 0.14),
      rgba(3, 153, 237, 0.09) 38%,
      transparent 72%);
  filter: blur(18px);
  opacity: 0;
  z-index: -1;
  pointer-events: none;
  transition: opacity 450ms cubic-bezier(.22,1,.36,1);
}
#wpforms-template-generate.scene-hover::before,
#wpforms-template-generate.scene-hover::after {
  opacity: 1;
}
#wpforms-template-generate .scene-glow-sweep {
  display: none !important;
}
#wpforms-template-generate .scene-card-shimmer {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  overflow: hidden;
  pointer-events: none;
  z-index: 4;
}
#wpforms-template-generate .scene-card-shimmer-bar {
  position: absolute;
  top: -40%;
  left: -60%;
  width: 45%;
  height: 180%;
  background: linear-gradient(
    110deg,
    transparent,
    rgba(255, 255, 255, 0.58),
    rgba(124, 58, 237, 0.10),
    transparent
  );
  opacity: 0;
  transform: translateX(-120%) rotate(12deg);
  will-change: transform, opacity;
}
`;

const PAGE_CSS = `
#scene2-overlay {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  color: #14161C;
}
#scene2-overlay .scene2-caption {
  position: absolute; left: 53vw; top: 28vh;
  transform: translate(-50%, -50%);
  max-width: 64vw;
  white-space: nowrap;
  font-size: clamp(26px, 2.35vw, 40px);
  font-weight: 650; letter-spacing: -0.018em; line-height: 1.14;
  color: #1A2238;
  opacity: 0;
  text-shadow:
    0 1px 0 rgba(255,255,255,0.75),
    0 12px 34px rgba(26,34,56,0.14);
}
#scene2-overlay .scene2-caption-pop {
  display: inline-block;
  transform-origin: 50% 58%;
  will-change: transform, filter;
}
#scene2-overlay .scene2-caption .accent {
  color: #E27730;
  font-weight: 760;
}
#scene2-overlay .scene2-caption .mask {
  display: inline-block;
  overflow: hidden;
  vertical-align: baseline;
  padding: 0.08em 0;
  margin: -0.08em 0;
}
#scene2-overlay .scene2-caption .ch {
  display: inline-block;
  transform: translate3d(0, 0, 0);
  opacity: 0;
  transform-origin: 50% 80%;
  will-change: transform, opacity, filter;
}
`;

export default [
  {
    id: 'add-new-screen',
    chapter: 'scene-2',
    effect: async ({ doc, cursor, sleep, zoomTo }) => {
      // Manual zoom so we can override the engine's 1200ms default for this scene only.
      await zoomTo([sel.generateCard], { level: 1.4, pad: 34, noScroll: true, duration: 550 });
      const gsap = await loadGsap();
      ensureFont();
      injectCss('scene2-page-css', PAGE_CSS);
      customizeEngineCursor();

      // Style + glow-sweep injection into the iframe document.
      const ifr = document.querySelector('iframe.ui');
      const ifrDoc = ifr?.contentDocument || doc;
      if (ifrDoc) {
        if (!ifrDoc.getElementById('scene2-iframe-css')) {
          const s = ifrDoc.createElement('style');
          s.id = 'scene2-iframe-css';
          s.textContent = IFRAME_CSS;
          ifrDoc.head.appendChild(s);
        }
        const card = ifrDoc.querySelector(sel.generateCard);
        if (card && !card.querySelector('.scene-card-shimmer')) {
          const shimmer = ifrDoc.createElement('div');
          shimmer.className = 'scene-card-shimmer';
          const shimmerBar = ifrDoc.createElement('div');
          shimmerBar.className = 'scene-card-shimmer-bar';
          shimmer.appendChild(shimmerBar);
          card.appendChild(shimmer);
        }
      }

      // Editorial caption layer.
      const overlay = mountSceneLayer('scene2-overlay', { z: 70 });
      gsap.set(overlay, { opacity: 1 });
      overlay.innerHTML = `
        <div class="scene2-caption" aria-label="Start with a simple idea."><span class="scene2-caption-pop"></span></div>
      `;
      const caption = overlay.querySelector('.scene2-caption');
      const captionPop = caption.querySelector('.scene2-caption-pop');
      mountBottomUpLetters(captionPop, [
        { text: 'Start with a ' },
        { text: 'simple idea.', accent: true },
      ]);

      // Park the cursor off-screen bottom-right before the camera settles.
      await cursor.park({ x: 2200, y: 1180 });

      // Pixel-point style bottom-up letter reveal.
      gsap.set(caption, { opacity: 1 });
      gsap.set(captionPop, {
        scale: 1.92,
        filter: 'drop-shadow(0 18px 30px rgba(26,34,56,0.10))',
        clearProps: 'x,y,rotation',
      });
      gsap.timeline()
        .to(captionPop, {
          scale: 1.16,
          duration: 0.34,
          ease: 'back.out(1.9)',
        })
        .to(captionPop, {
          scale: 1,
          duration: 0.36,
          ease: 'power3.out',
        }, '>-0.08');
      gsap.fromTo(captionPop.querySelectorAll('.ch'), {
        y: 30,
        scale: 0.88,
        opacity: 0,
        filter: 'blur(8px)',
      }, {
        y: 0,
        scale: 1,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.74,
        ease: 'back.out(1.7)',
        stagger: 0.018,
      });

      await sleep(280);

      // Curved cursor approach via an upper-right waypoint for a natural arc.
      await cursor.glideTo(sel.generateCard, {
        via: { x: 1700, y: 700 },
        wait: 880,
      });

      // Magnetic hover lift + full-card AI focus ring on the real card. Mirrors the
      // existing showGenerateHover pattern so the buttons wrap reveals.
      const card = ifrDoc?.querySelector(sel.generateCard);
      if (card) {
        playSfx('hover', { volume: 0.55 });
        card.classList.add('scene-hover', 'active', 'selected');
        gsap.to(card, {
          y: -9,
          scale: 1.1,
          rotationX: 0.5,
          rotationY: -0.5,
          transformPerspective: 800,
          transformOrigin: '50% 50%',
          boxShadow: '0 0 0 1px rgba(124, 58, 237, 0.16), 0 18px 45px -24px rgba(86, 84, 212, 0.38), 0 8px 24px -18px rgba(3, 153, 237, 0.28)',
          borderColor: 'rgba(124, 58, 237, 0.14)',
          duration: 0.45,
          ease: 'power3.out',
        });
        gsap.to(card, {
          '--ring-angle': '360deg',
          duration: 3.8,
          repeat: -1,
          ease: 'none',
        });
        const shimmerBar = card.querySelector('.scene-card-shimmer-bar');
        if (shimmerBar) {
          gsap.fromTo(shimmerBar,
            { xPercent: -120, opacity: 0 },
            { xPercent: 340, opacity: 1, duration: 0.75, ease: 'power2.out' },
          );
          gsap.to(shimmerBar, { opacity: 0, duration: 0.22, ease: 'power1.out', delay: 0.58 });
        }
        const btnWrap = ifrDoc.querySelector(sel.generateButtonsWrap);
        const badge = ifrDoc.querySelector(sel.generateBadge);
        if (btnWrap) {
          btnWrap.style.transition = 'opacity 320ms ease';
          btnWrap.style.opacity = '1';
        }
        if (badge) {
          badge.style.transition = 'opacity 240ms ease';
          badge.style.opacity = '0';
        }
      }

      await sleep(900);

      // Settle the cursor onto the Generate Form button — primes Scene 3.
      await cursor.glideTo(sel.generateButton, { wait: 360 });
      await missionControlClick(sleep);

      await sleep(260);

      // Caption fades for the handoff.
      const exitTl = gsap.timeline();
      exitTl.to(caption, {
        y: -10, opacity: 0, filter: 'blur(6px)',
        duration: 0.5, ease: 'power3.in',
      });
      await tlDone(exitTl);

      overlay.remove();
      await sleep(40);
    },
    duration: 0.2,
  },
];

function mountBottomUpLetters(root, runs) {
  root.textContent = '';
  for (const run of runs) {
    const wrap = document.createElement('span');
    if (run.accent) wrap.className = 'accent';
    for (const char of run.text) {
      const mask = document.createElement('span');
      mask.className = 'mask';
      const ch = document.createElement('span');
      ch.className = 'ch';
      ch.innerHTML = char === ' ' ? '&nbsp;' : char;
      mask.appendChild(ch);
      wrap.appendChild(mask);
    }
    root.appendChild(wrap);
  }
}

async function missionControlClick(sleep) {
  const cursorEl = document.querySelector('.cursor');
  if (!cursorEl) return;
  const r = cursorEl.getBoundingClientRect();
  mountMissionClickBurst(r.left + 6.4, r.top + 3.7);
  cursorEl.classList.add('click');
  cursorEl.style.transform = 'scale(.72)';
  await sleep(140);
  cursorEl.classList.remove('click');
  cursorEl.style.transform = '';
  await sleep(120);
}

function mountMissionClickBurst(x, y) {
  const burst = document.createElement('div');
  burst.style.cssText = `
    position: fixed;
    left: ${x - 22}px;
    top: ${y - 22}px;
    width: 44px;
    height: 44px;
    border: 3px solid rgba(226,119,48,.92);
    border-radius: 999px;
    z-index: 900;
    pointer-events: none;
    transform: scale(.35);
    opacity: .95;
    box-shadow: 0 0 0 8px rgba(226,119,48,.16);
    transition: transform 360ms cubic-bezier(.2,.8,.2,1), opacity 360ms ease;
  `;
  document.body.appendChild(burst);
  void burst.offsetWidth;
  burst.style.transform = 'scale(1.8)';
  burst.style.opacity = '0';
  setTimeout(() => burst.remove(), 420);
}
