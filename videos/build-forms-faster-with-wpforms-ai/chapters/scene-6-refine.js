// Scene 6 — Conversational refinement (~6s).
//
// Cinematic announcement beat, not a tutorial: the custom cursor asks WPForms
// AI for one more refinement, the chat responds "Done.", and a newsletter
// opt-in checkbox inserts itself into the generated form with a green success
// pulse. The checkbox block is cloned from the real generated preview field
// structure and staged video-locally.

import sel from './_selectors.js';
import {
  loadGsap, ensureFont, customizeEngineCursor,
  mountSceneLayer, injectCss, playSfx, tlDone,
} from './_kit.js';

export const snapshot = 'wpforms-ai-builder-feedback-generated';
export const mode = 'parallel';
export const breakStyle = 'soft-dolly';

const PROMPT = 'Add a newsletter opt-in checkbox.';

const IFRAME_CSS = `
#scene6-newsletter-field {
  overflow: hidden;
  transform-origin: 50% 0%;
  will-change: transform, opacity, filter, height;
}
#scene6-newsletter-field.scene6-hidden {
  height: 0 !important;
  min-height: 0 !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  opacity: 0 !important;
  transform: scale(0.72) translateY(-18px);
  filter: blur(10px);
}
#scene6-newsletter-field .wpforms-field {
  padding: 18px 0 18px;
}
#scene6-newsletter-field .scene6-check-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  color: #2f3a45;
  font-size: 15px;
}
#scene6-newsletter-field .scene6-box {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 2px solid #0399ED;
  background: linear-gradient(180deg, #ffffff, #eefaf0);
  box-shadow: 0 0 0 4px rgba(3,153,237,0.10);
  position: relative;
}
#scene6-newsletter-field .scene6-box::after {
  content: "";
  position: absolute;
  left: 4px;
  top: 1px;
  width: 6px;
  height: 10px;
  border: solid #0399ED;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) scale(0);
  transform-origin: center;
  transition: transform 260ms cubic-bezier(.2,.9,.2,1.5);
}
#scene6-newsletter-field.scene6-checked .scene6-box::after {
  transform: rotate(45deg) scale(1);
}
.scene6-prompt-focus {
  outline: 2px solid rgba(3,153,237,0.58);
  outline-offset: 4px;
  box-shadow:
    0 0 0 7px rgba(3,153,237,0.13),
    0 12px 28px -14px rgba(3,153,237,0.26);
  border-radius: 8px;
}
.scene6-send-glow {
  animation: scene6SendGlow 1.1s ease-in-out infinite;
}
@keyframes scene6SendGlow {
  0%, 100% { box-shadow: 0 0 0 2px rgba(3,153,237,.30), 0 0 18px rgba(3,153,237,.24); }
  50% { box-shadow: 0 0 0 3px rgba(3,153,237,.46), 0 0 30px rgba(3,153,237,.38); }
}
`;

const PAGE_CSS = `
#scene6-overlay {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  color: #14161C;
}
#scene6-overlay .scene6-caption {
  position: fixed; left: 50%; top: 7vh;
  transform: translateX(-50%);
  font-size: clamp(26px, 2.2vw, 38px);
  font-weight: 650; letter-spacing: -0.02em; line-height: 1.15;
  color: #1A2238;
  text-align: center;
  opacity: 0;
  background: rgba(255,255,255,0.84);
  border-radius: 14px;
  padding: 12px 26px;
  box-shadow: 0 14px 34px -16px rgba(20,30,60,0.22);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  pointer-events: none;
}
#scene6-overlay .scene6-caption .accent {
  background: linear-gradient(96deg, #056AAB 8%, #0399ED 92%);
  -webkit-background-clip: text; background-clip: text;
  color: transparent; -webkit-text-fill-color: transparent;
  font-style: italic; font-weight: 750;
}
#scene6-overlay .scene6-done {
  position: fixed;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255,255,255,.96), rgba(238,250,240,.92));
  border: 1px solid rgba(3,153,237,.22);
  color: #056AAB;
  box-shadow: 0 16px 38px -18px rgba(20,30,60,.24), 0 0 0 7px rgba(3,153,237,.10);
  font-size: 19px;
  font-weight: 700;
  opacity: 0;
  pointer-events: none;
}
#scene6-overlay .scene6-done::before {
  content: "";
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #0399ED;
  box-shadow: 0 0 18px rgba(3,153,237,.60);
}
#scene6-overlay .scene6-pulse {
  position: fixed;
  border-radius: 16px;
  pointer-events: none;
  opacity: 0;
  border: 2px solid rgba(3,153,237,.55);
  box-shadow: 0 0 0 8px rgba(3,153,237,.12), 0 0 34px rgba(3,153,237,.25);
}
#scene6-overlay .scene6-spark {
  position: fixed;
  width: 7px; height: 7px; border-radius: 50%;
  background: radial-gradient(closest-side, #fff 0%, rgba(3,153,237,.92) 42%, transparent 75%);
  box-shadow: 0 0 14px 4px rgba(3,153,237,.45);
  opacity: 0;
  pointer-events: none;
}
`;

export async function setup({ doc }) {
  if (!doc.getElementById('scene6-iframe-css')) {
    const s = doc.createElement('style');
    s.id = 'scene6-iframe-css';
    s.textContent = IFRAME_CSS;
    doc.head.appendChild(s);
  }
  hideEmptyGeneratedPlaceholder(doc);
  stageNewsletterField(doc);
}

export default [
  {
    id: 'refine-with-sentence',
    chapter: 'scene-6',
    effect: async ({ doc, cursor, sleep, type, zoomTo }) => {
      const gsap = await loadGsap();
      ensureFont();
      injectCss('scene6-page-css', PAGE_CSS);
      customizeEngineCursor();
      hideEmptyGeneratedPlaceholder(doc);
      stageNewsletterField(doc);

      const overlay = mountSceneLayer('scene6-overlay', { z: 74 });
      gsap.set(overlay, { opacity: 1 });
      overlay.innerHTML = `
        <div class="scene6-caption"><span class="accent">Refine it</span> with a sentence.</div>
        <div class="scene6-done">Done.</div>
      `;
      const caption = overlay.querySelector('.scene6-caption');
      const done = overlay.querySelector('.scene6-done');

      const openingZoom = zoomTo([sel.promptInputBox, sel.previewPanel], {
        level: 1.0,
        pad: 18,
        smooth: true,
        noScroll: true,
        scrollBehavior: 'auto',
        duration: 260,
      });

      gsap.fromTo(caption,
        { y: -18, opacity: 0, filter: 'blur(8px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.38, ease: 'expo.out' }
      );

      await openingZoom;
      await cursor.glideTo(sel.promptInput, { wait: 180 });
      const inputBox = doc.querySelector(sel.promptInput)?.closest('.wpforms-ai-chat-message-input');
      if (inputBox) inputBox.classList.add('scene6-prompt-focus');
      await cursor.click();

      await type(sel.promptInput, PROMPT, { cps: 46, clear: true });

      const sendBtn = doc.querySelector(sel.sendPrompt);
      if (sendBtn) {
        sendBtn.classList.add('scene6-send-glow');
        sparkleToward(overlay, sendBtn, gsap);
      }
      await sleep(180);

      await cursor.clickOn(sel.sendPrompt, { dispatch: false, magnetic: true });
      if (sendBtn) sendBtn.classList.remove('scene6-send-glow');
      if (inputBox) inputBox.classList.remove('scene6-prompt-focus');

      positionDoneBubble(done, doc.querySelector(sel.answerBubble));
      gsap.fromTo(done,
        { y: 18, scale: 0.78, opacity: 0, filter: 'blur(8px)' },
        {
          y: 0, scale: 1, opacity: 1, filter: 'blur(0px)',
          duration: 0.48, ease: 'back.out(1.65)',
        }
      );

      await sleep(360);

      await zoomTo(['#scene6-newsletter-field', sel.ratingField, sel.likeField], {
        level: 1.18,
        pad: 26,
        smooth: true,
        noScroll: false,
        scrollBehavior: 'auto',
        duration: 650,
      });

      const newsletter = doc.getElementById('scene6-newsletter-field');
      const shifted = [
        doc.querySelector(sel.likeField),
        doc.querySelector(sel.improveField),
        doc.querySelector(sel.submitButton),
      ].filter(Boolean);
      const state = window.Flip?.getState ? window.Flip.getState(shifted) : null;
      const targetHeight = newsletter?.dataset.scene6Height
        ? Number(newsletter.dataset.scene6Height)
        : 118;

      if (newsletter) {
        newsletter.classList.remove('scene6-hidden');
        gsap.set(newsletter, {
          height: 0,
          opacity: 0,
          y: -20,
          scale: 0.72,
          filter: 'blur(10px)',
        });
      }
      if (state && window.Flip) {
        window.Flip.from(state, { duration: 0.62, ease: 'power3.inOut', absolute: false });
      }
      if (newsletter) {
        gsap.to(newsletter, {
          height: targetHeight,
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.68,
          ease: 'back.out(1.35)',
          onStart: () => playSfx('pop-drop', { volume: 0.46 }),
          onComplete: () => {
            newsletter.style.height = '';
            newsletter.classList.add('scene6-checked');
          },
        });
      }

      await sleep(520);
      pulseField(overlay, newsletter, gsap);
      sparkleAroundField(overlay, newsletter, gsap);
      await sleep(950);

      const exit = gsap.timeline();
      exit.to(done, { opacity: 0, y: -10, filter: 'blur(6px)', duration: 0.36, ease: 'power2.in' });
      exit.to(caption, { opacity: 0, y: -10, filter: 'blur(6px)', duration: 0.42, ease: 'power3.in' }, '<+0.08');
      exit.to(overlay, { opacity: 0, duration: 0.3, ease: 'power2.in' }, '>');
      await tlDone(exit);
      overlay.remove();
      await sleep(40);
    },
    duration: 0.2,
  },
];

function stageNewsletterField(doc) {
  const existing = doc.getElementById('scene6-newsletter-field');
  if (existing) {
    existing.classList.add('scene6-hidden');
    existing.classList.remove('scene6-checked');
    return existing;
  }

  const source = doc.querySelector('#wpforms-generator-field-5') || doc.querySelector(sel.likeField);
  const insertBefore = doc.querySelector(sel.likeField)
    || doc.querySelector(sel.improveField)
    || doc.querySelector(sel.submitButton);
  const parent = insertBefore?.parentElement || source?.parentElement;
  if (!source || !parent) return null;

  const field = source.cloneNode(true);
  field.id = 'scene6-newsletter-field';
  field.classList.add('scene6-hidden');
  field.innerHTML = `
    <div class="placeholder fade-out"></div>
    <div class="wpforms-field wpforms-field-checkbox fade-in tooltipstered">
      <label class="label-title ">
        <span class="text">Newsletter opt-in</span>
      </label>
      <div class="scene6-check-row">
        <span class="scene6-box" aria-hidden="true"></span>
        <span>Send me restaurant updates and special offers.</span>
      </div>
    </div>
  `;
  parent.insertBefore(field, insertBefore || null);
  const measured = field.getBoundingClientRect();
  field.dataset.scene6Height = Math.max(96, Math.round(measured.height || 112)).toString();
  return field;
}

function hideEmptyGeneratedPlaceholder(doc) {
  const empty = doc.querySelector('#wpforms-generator-field-6');
  if (!empty) return;
  const text = empty.textContent.replace(/\s+/g, '').trim();
  if (text) return;
  empty.style.display = 'none';
}

function positionDoneBubble(done, anchor) {
  if (!done) return;
  const ifr = document.querySelector('iframe.ui');
  const frame = document.querySelector('.mac-frame')?.getBoundingClientRect();
  const ar = anchor?.getBoundingClientRect();
  const ir = ifr?.getBoundingClientRect();
  if (!ifr || !ir || !ar) {
    done.style.left = '68vw';
    done.style.top = '28vh';
    return;
  }
  const sx = ir.width / (ifr.offsetWidth || ir.width);
  const sy = ir.height / (ifr.offsetHeight || ir.height);
  const x = ir.left + (ar.left + Math.min(ar.width * 0.7, 260)) * sx;
  const y = ir.top + (ar.top + 28) * sy;
  done.style.left = Math.min(x, (frame?.right || window.innerWidth) - 150) + 'px';
  done.style.top = Math.max(y, (frame?.top || 0) + 96) + 'px';
}

function fieldScreenRect(el) {
  if (!el) return null;
  const ifr = document.querySelector('iframe.ui');
  if (!ifr) return null;
  const ir = ifr.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const sx = ir.width / (ifr.offsetWidth || ir.width);
  const sy = ir.height / (ifr.offsetHeight || ir.height);
  return {
    left: ir.left + r.left * sx,
    top: ir.top + r.top * sy,
    width: r.width * sx,
    height: r.height * sy,
  };
}

function pulseField(layer, field, gsap) {
  const r = fieldScreenRect(field);
  if (!r) return;
  const p = document.createElement('div');
  p.className = 'scene6-pulse';
  Object.assign(p.style, {
    left: r.left + 'px',
    top: r.top + 'px',
    width: r.width + 'px',
    height: r.height + 'px',
  });
  layer.appendChild(p);
  gsap.timeline()
    .to(p, { opacity: 1, duration: 0.18, ease: 'power2.out' })
    .to(p, {
      left: r.left - 18,
      top: r.top - 12,
      width: r.width + 36,
      height: r.height + 24,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
    })
    .call(() => p.remove());
}

function sparkleToward(layer, targetEl, gsap) {
  const ifr = document.querySelector('iframe.ui');
  if (!ifr || !targetEl) return;
  const ir = ifr.getBoundingClientRect();
  const tr = targetEl.getBoundingClientRect();
  const sx = ir.width / (ifr.offsetWidth || ir.width);
  const sy = ir.height / (ifr.offsetHeight || ir.height);
  const tx = ir.left + (tr.left + tr.width / 2) * sx;
  const ty = ir.top + (tr.top + tr.height / 2) * sy;
  for (let i = 0; i < 9; i++) {
    const sp = document.createElement('div');
    sp.className = 'scene6-spark';
    layer.appendChild(sp);
    const sx0 = tx - 220 + Math.random() * 160;
    const sy0 = ty - 80 + Math.random() * 160;
    gsap.set(sp, { left: sx0, top: sy0, opacity: 0, scale: 0.3 });
    gsap.timeline({ delay: i * 0.045 })
      .to(sp, { opacity: 0.9, scale: 1, duration: 0.2, ease: 'power2.out' })
      .to(sp, { left: tx, top: ty, duration: 0.62, ease: 'power3.in' }, '<')
      .to(sp, { opacity: 0, scale: 0.25, duration: 0.2, ease: 'power2.in' }, '>-0.08')
      .call(() => sp.remove());
  }
}

function sparkleAroundField(layer, field, gsap) {
  const r = fieldScreenRect(field);
  if (!r) return;
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  for (let i = 0; i < 14; i++) {
    const sp = document.createElement('div');
    sp.className = 'scene6-spark';
    layer.appendChild(sp);
    const angle = Math.PI * 2 * (i / 14);
    const radX = r.width * (0.25 + Math.random() * 0.25);
    const radY = r.height * (0.3 + Math.random() * 0.45);
    gsap.set(sp, { left: cx, top: cy, opacity: 0, scale: 0.35 });
    gsap.timeline({ delay: i * 0.025 })
      .to(sp, {
        left: cx + Math.cos(angle) * radX,
        top: cy + Math.sin(angle) * radY,
        opacity: 1,
        scale: 1,
        duration: 0.42,
        ease: 'power3.out',
      })
      .to(sp, { opacity: 0, scale: 0.25, duration: 0.38, ease: 'power2.in' }, '>-0.02')
      .call(() => sp.remove());
  }
}
