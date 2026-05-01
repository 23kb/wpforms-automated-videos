// Scene 5 — Form builder fills itself (~6s).
//
// Same snapshot as Scene 4 (wpforms-ai-builder-feedback-generated). NO swap
// between chapters — only a soft camera dolly. The iframe content and the
// mac-frame stay continuously visible. The chip stack from Scene 4 is still
// in <body> (in its scene4-overlay), and the real field rows are still
// hidden from Scene 4's setup. This effect picks up the chips, morphs each
// one onto its target real-field rect, fades the chip out as the real field
// reveals beneath it, and pulls the camera back.

import sel from './_selectors.js';
import {
  loadGsap, ensureFont, customizeEngineCursor,
  mountSceneLayer, injectCss, playSfx, tlDone,
} from './_kit.js';

export const snapshot = 'wpforms-ai-builder-feedback-generated';
export const mode = 'parallel';
export const breakStyle = 'glide';

const FIELD_SELECTORS = [
  sel.nameField,
  sel.emailField,
  sel.ratingField,
  sel.npsField,
  sel.likeField,
  sel.improveField,
  sel.sourceField,
  sel.submitButton,
];

// Iframe CSS — same `scene-fields-hidden` class Scene 4 uses to hide rows.
// Scene 5's setup is idempotent: if Scene 4 already added it, this is a
// no-op; if Scene 5 is loaded in isolation (QC), this still hides fields
// so the reveal animation has something to do.
const IFRAME_CSS = `
.scene-fields-hidden {
  opacity: 0 !important;
  visibility: hidden !important;
  transition: none !important;
}
`;

const PAGE_CSS = `
#scene5-overlay {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}
#scene5-overlay .scene5-caption {
  position: fixed; left: 50%; top: 7vh;
  transform: translateX(-50%);
  font-size: clamp(26px, 2.2vw, 38px);
  font-weight: 600; letter-spacing: -0.02em; line-height: 1.2;
  color: #1A2238;
  text-align: center;
  opacity: 0;
  background: rgba(255,255,255,0.82);
  border-radius: 14px;
  padding: 12px 26px;
  box-shadow: 0 12px 32px -14px rgba(20,30,60,0.20);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  pointer-events: none;
}
#scene5-overlay .scene5-caption .accent {
  background: linear-gradient(96deg, #0399ED 8%, #056AAB 92%);
  -webkit-background-clip: text; background-clip: text;
  color: transparent; -webkit-text-fill-color: transparent;
  font-style: italic; font-weight: 700;
}
#scene5-overlay .ai-scan {
  position: fixed; height: 90px;
  background: linear-gradient(180deg,
    transparent 0%,
    rgba(5,106,171,0.22) 30%,
    rgba(3,153,237,0.36) 50%,
    rgba(226,119,48,0.20) 70%,
    transparent 100%);
  filter: blur(12px);
  opacity: 0;
  pointer-events: none;
  mix-blend-mode: screen;
}
#scene5-overlay .field-flash {
  position: fixed; border-radius: 8px; pointer-events: none;
  background: radial-gradient(closest-side, rgba(5,106,171,0.40), rgba(255,178,90,0.20), transparent 70%);
  filter: blur(10px); opacity: 0;
  mix-blend-mode: screen;
}
`;

export async function setup({ doc }) {
  // Idempotent — Scene 4 likely already injected this style + hidden class
  // on the same snapshot, but if Scene 5 is loaded in isolation (QC slice)
  // we still want the fields hidden before the reveal.
  if (!doc.getElementById('scene-fields-hide-css')) {
    const s = doc.createElement('style');
    s.id = 'scene-fields-hide-css';
    s.textContent = IFRAME_CSS;
    doc.head.appendChild(s);
  }
  [...FIELD_SELECTORS, sel.previewTitle].forEach(selector => {
    const el = doc.querySelector(selector);
    if (el) el.classList.add('scene-fields-hidden');
  });
}

export default [
  {
    id: 'form-fills-itself',
    chapter: 'scene-5',
    effect: async ({ doc, sleep, zoomTo, cursor }) => {
      const gsap = await loadGsap();
      ensureFont();
      injectCss('scene5-page-css', PAGE_CSS);
      customizeEngineCursor();

      // Cursor stays hidden — let the AI motion be the hero.
      try { await cursor.hide(); } catch (_) {}

      // Pick up Scene 4's chip stack (still in <body> since we share the
      // same snapshot — no body-wipe between chapters).
      const sceneFourOverlay = document.getElementById('scene4-overlay');
      const chipClip = sceneFourOverlay?.querySelector('.chip-clip');
      const trackedChips = sceneFourOverlay
        ? [...sceneFourOverlay.querySelectorAll('.field-chip')]
        : [];

      // Track chips to their iframe-content anchors (recorded in Scene 4)
      // throughout the camera dive. As the iframe scales 1.0 → 1.25 and
      // translates to center on the preview panel, chips stay pinned to
      // their iframe-content position — no stranding outside the mac-frame.
      let trackingRaf = null;
      const tickChips = () => {
        const ifrEl = document.querySelector('iframe.ui');
        if (!ifrEl) return;
        const frameRect = getMacFrameRect();
        setClipToFrame(chipClip, frameRect);
        const r = ifrEl.getBoundingClientRect();
        const sxN = r.width / ifrEl.offsetWidth;
        const syN = r.height / ifrEl.offsetHeight;
        trackedChips.forEach(chip => {
          const ix = parseFloat(chip.dataset.iframeX);
          const iy = parseFloat(chip.dataset.iframeY);
          if (Number.isNaN(ix) || Number.isNaN(iy)) return;
          const screenX = r.left + ix * sxN;
          const screenY = r.top + iy * syN;
          // Chips have xPercent:-50/yPercent:-50 from Scene 4's gsap.set,
          // so left/top are interpreted as the chip's CENTER. Don't subtract
          // half-width again or the chip ends up shifted left by full width.
          chip.style.left = (screenX - frameRect.left) + 'px';
          chip.style.top = (screenY - frameRect.top) + 'px';
        });
        trackingRaf = requestAnimationFrame(tickChips);
      };
      tickChips();

      // Camera dive into the builder canvas. Chips ride the iframe transform
      // via the rAF tracker above.
      const dive = zoomTo([sel.previewPanel], {
        level: 1.25, pad: 24, smooth: true, noScroll: true,
        scrollBehavior: 'auto', duration: 260,
      });

      const overlay = mountSceneLayer('scene5-overlay', { z: 70 });
      gsap.set(overlay, { opacity: 1 });
      overlay.innerHTML = `
        <div class="ai-scan"></div>
        <div class="scene5-caption">
          <span class="accent">Complete form.</span> Real fields. Ready to refine.
        </div>
      `;
      const caption = overlay.querySelector('.scene5-caption');
      const scanline = overlay.querySelector('.ai-scan');

      await dive;

      // Dive done — stop the tracker; gsap morph will own chip positions now.
      if (trackingRaf) cancelAnimationFrame(trackingRaf);

      // Caption reveal — top blur-slide-down.
      gsap.fromTo(caption,
        { y: -22, opacity: 0, filter: 'blur(8px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.7, ease: 'expo.out' }
      );

      // Compute screen rects for each field for the scan sweep + flash overlays.
      const ifr = document.querySelector('iframe.ui');
      const ifrRect = ifr.getBoundingClientRect();
      const sx = ifrRect.width / (ifr.offsetWidth || ifrRect.width);
      const sy = ifrRect.height / (ifr.offsetHeight || ifrRect.height);
      const toScreen = (rect) => ({
        cx: ifrRect.left + (rect.left + rect.width / 2) * sx,
        cy: ifrRect.top + (rect.top + rect.height / 2) * sy,
        left: ifrRect.left + rect.left * sx,
        top: ifrRect.top + rect.top * sy,
        w: rect.width * sx,
        h: rect.height * sy,
      });

      const fieldEls = FIELD_SELECTORS
        .map(s => doc.querySelector(s))
        .filter(Boolean);
      const fieldRects = fieldEls.map(el => toScreen(el.getBoundingClientRect()));

      // ── Chip → field morph ──────────────────────────────────────────────
      // chips were tracked to iframe-content anchors during the dive, so
      // they're now sitting on the dived-in iframe (level 1.25) at their
      // expected positions inside the preview area. Settle each onto its
      // target real-field rect; fade the chip out as the real field reveals.
      // Index alignment: chips 0..4 → FIELD_SELECTORS [0,1,2,4,5].
      // Submit is a button, not an AI-created editorial chip.
      const CHIP_FIELD_INDEX = [0, 1, 2, 4, 5];
      trackedChips.forEach((chip, i) => {
        const fieldIdx = CHIP_FIELD_INDEX[i];
        const fr = fieldRects[fieldIdx];
        if (!fr) return;
        const offset = i * 0.07;
        const frameRect = getMacFrameRect();
        // Chip has xPercent:-50/yPercent:-50, so left/top = chip center.
        // Settle chip CENTER onto the field's center, scale down slightly,
        // fade out as the real field reveals beneath it.
        gsap.timeline({ delay: offset })
          .to(chip, {
            left: fr.cx - frameRect.left, top: fr.cy - frameRect.top,
            scale: 0.94,
            duration: 0.65, ease: 'power3.inOut',
          })
          .to(chip, {
            opacity: 0, scale: 0.88,
            duration: 0.35, ease: 'power2.in',
          }, '>-0.05');
      });

      // Reveal the form title above the fields with a quick blur-up.
      const titleEl = doc.querySelector(sel.previewTitle);
      if (titleEl) {
        gsap.set(titleEl, { y: 14, opacity: 0, filter: 'blur(4px)' });
        titleEl.classList.remove('scene-fields-hidden');
        gsap.to(titleEl, {
          y: 0, opacity: 1, filter: 'blur(0px)',
          duration: 0.55, ease: 'power3.out',
        });
      }

      // Field reveal — alternating x ±80 → 0, blur 6 → 0, scale 0.96 → 1.
      // Switch each field from `scene-fields-hidden` (visibility:hidden) to
      // gsap inline state so the tween has something to animate.
      const masterTl = gsap.timeline();
      fieldEls.forEach((el, i) => {
        const fromLeft = i % 2 === 0;
        const offset = i * 0.09;
        gsap.set(el, {
          x: fromLeft ? -80 : 80,
          scale: 0.96,
          opacity: 0,
          filter: 'blur(6px)',
        });
        el.classList.remove('scene-fields-hidden');
        masterTl.to(el, {
          x: 0, scale: 1, opacity: 1, filter: 'blur(0px)',
          duration: 0.7, ease: 'power4.out',
          onStart: () => {
            playSfx(i === fieldEls.length - 1 ? 'pop-drop' : 'pop-ui',
              { volume: 0.32, rate: 0.96 + i * 0.04 });
            const r = fieldRects[i];
            if (!r) return;
            const flash = document.createElement('div');
            flash.className = 'field-flash';
            Object.assign(flash.style, {
              left: r.left + 'px',
              top: r.top + 'px',
              width: r.w + 'px',
              height: r.h + 'px',
            });
            overlay.appendChild(flash);
            gsap.timeline()
              .to(flash, { opacity: 0.7, duration: 0.2, ease: 'power2.out' })
              .to(flash, { opacity: 0, duration: 0.5, ease: 'power2.in' })
              .call(() => flash.remove());
          },
        }, offset);
      });

      // AI scan line sweeps top → bottom of the form during field landing.
      if (fieldRects.length) {
        const top = Math.min(...fieldRects.map(r => r.top));
        const bottom = Math.max(...fieldRects.map(r => r.top + r.h));
        const left = Math.min(...fieldRects.map(r => r.left));
        const right = Math.max(...fieldRects.map(r => r.left + r.w));
        gsap.set(scanline, {
          left: left, top: top - 60, width: right - left, opacity: 0,
        });
        gsap.timeline({ delay: 0.2 })
          .to(scanline, { opacity: 0.85, duration: 0.25, ease: 'power2.out' })
          .to(scanline, { top: bottom + 40, duration: 1.7, ease: 'power2.inOut' })
          .to(scanline, { opacity: 0, duration: 0.3, ease: 'power2.in' }, '>-0.2');
      }

      await tlDone(masterTl);
      await sleep(80);

      // Camera pulls back to reveal the completed form.
      const pullBack = zoomTo([sel.previewPanel], {
        level: 1.0, pad: 0, smooth: true, noScroll: true,
        scrollBehavior: 'auto', duration: 480,
      });
      await pullBack;

      await sleep(80);

      // Caption fades; overlay clears for handoff to Scene 6 (refinement).
      const exit = gsap.timeline();
      exit.to(caption, {
        opacity: 0, y: -10, filter: 'blur(6px)',
        duration: 0.24, ease: 'power3.in',
      });
      exit.to(overlay, { opacity: 0, duration: 0.18, ease: 'power2.in' }, '>0.02');
      await tlDone(exit);
      overlay.remove();
      // Scene 4's overlay (with the now-faded chips) lives in <body>; clean
      // it up so Scene 6 starts with a clean stage.
      document.getElementById('scene4-overlay')?.remove();
      await sleep(40);
    },
    duration: 0.2,
  },
];

function getMacFrameRect() {
  const frame = document.querySelector('.mac-frame');
  const r = frame?.getBoundingClientRect();
  if (r?.width && r?.height) return r;
  return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
}

function setClipToFrame(clip, frameRect) {
  if (!clip) return;
  Object.assign(clip.style, {
    left: frameRect.left + 'px',
    top: frameRect.top + 'px',
    width: frameRect.width + 'px',
    height: frameRect.height + 'px',
  });
}
