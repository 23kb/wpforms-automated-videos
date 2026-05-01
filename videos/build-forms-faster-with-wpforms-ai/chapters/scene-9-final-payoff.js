// Scene 9 — Final payoff / brand close (~5s).
//
// Premium product-launch end frame: WPForms AI brand, Sullie, live published
// form preview, proof badge, and concise CTA copy. No cursor.

import sel from './_selectors.js';
import {
  loadGsap, ensureFont, customizeEngineCursor,
  mountSceneLayer, injectCss, playSfx, tlDone,
} from './_kit.js';

export const snapshot = 'wpforms-ai-builder-feedback-generated';
export const mode = 'parallel';
export const breakStyle = 'soft-dolly';
export const swapStyle = 'cover';

const PAGE_CSS = `
#scene9-final {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  color: #101828;
}
#scene9-final .bg {
  position: fixed; inset: 0;
  background:
    radial-gradient(34% 30% at 33% 39%, rgba(3,153,237,.18), transparent 72%),
    radial-gradient(36% 34% at 68% 55%, rgba(5,106,171,.20), transparent 70%),
    radial-gradient(26% 24% at 57% 72%, rgba(226,119,48,.13), transparent 74%),
    linear-gradient(180deg, rgba(250,253,255,.94), rgba(238,244,251,.96));
  opacity: 0;
}
#scene9-final .wrap {
  position: fixed; inset: 0;
  display: grid;
  grid-template-columns: minmax(390px, .9fr) minmax(520px, 1.1fr);
  align-items: center;
  gap: 5vw;
  padding: 10vh 9vw 8vh;
  opacity: 0;
}
#scene9-final .brand {
  position: relative;
  z-index: 2;
}
#scene9-final .sullie {
  width: 118px;
  height: 118px;
  object-fit: contain;
  display: block;
  margin-bottom: 22px;
  filter: drop-shadow(0 18px 28px rgba(20,30,60,.18));
  transform-origin: 50% 72%;
}
#scene9-final h1 {
  margin: 0;
  font-size: clamp(62px, 6.2vw, 112px);
  line-height: .92;
  letter-spacing: -0.035em;
  font-weight: 780;
  font-variation-settings: 'wght' 780, 'opsz' 96;
}
#scene9-final .title-unit {
  display: inline-block;
  will-change: transform, opacity, filter;
}
#scene9-final h1 .ai {
  background: linear-gradient(100deg, #0399ED 6%, #056AAB 56%, #E27730 98%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  font-style: italic;
}
#scene9-final .sub {
  margin: 28px 0 0;
  max-width: 640px;
  color: #344054;
  font: 650 clamp(23px, 2vw, 36px)/1.18 'Inter', system-ui, sans-serif;
  letter-spacing: -0.025em;
}
#scene9-final .sub-line {
  display: block;
  will-change: transform, opacity, filter;
}
#scene9-final .cta {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 11px;
  margin-top: 30px;
  padding: 15px 21px;
  border-radius: 14px;
  color: #fff;
  background: linear-gradient(180deg, #f08a40 0%, #E27730 58%, #cf6222 100%);
  box-shadow:
    0 20px 42px -19px rgba(226,119,48,.82),
    0 0 0 7px rgba(226,119,48,.11),
    inset 0 1px 0 rgba(255,255,255,.38);
  font: 760 18px/1 'Inter', system-ui, sans-serif;
  letter-spacing: -0.01em;
  overflow: hidden;
}
#scene9-final .cta::before {
  content: "";
  position: absolute;
  left: 12px; right: 12px; top: 1px;
  height: 42%;
  border-radius: 13px 13px 8px 8px;
  background: linear-gradient(180deg, rgba(255,255,255,.30), transparent);
  pointer-events: none;
}
#scene9-final .cta-shine,
#scene9-final .browser-sweep {
  position: absolute;
  pointer-events: none;
  transform: translateX(-140%) skewX(-18deg);
}
#scene9-final .cta-shine {
  inset: -18% auto -18% 0;
  width: 44%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.58), transparent);
  opacity: 0;
}
#scene9-final .cta-arrow {
  width: 10px;
  height: 10px;
  border-top: 2px solid currentColor;
  border-right: 2px solid currentColor;
  transform: rotate(45deg);
  will-change: transform;
}
#scene9-final .browser-wrap {
  position: relative;
  justify-self: stretch;
  max-width: 760px;
}
#scene9-final .browser-glow {
  position: absolute;
  inset: -86px -76px -90px -88px;
  border-radius: 44px;
  background:
    radial-gradient(52% 46% at 54% 48%, rgba(3,153,237,.28), transparent 70%),
    radial-gradient(42% 34% at 72% 62%, rgba(5,106,171,.19), transparent 74%);
  filter: blur(10px);
  opacity: 0;
}
#scene9-final .preview-shell {
  --sweep-angle: -32deg;
  position: relative;
  min-height: 590px;
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255,255,255,.97), rgba(248,251,255,.90));
  border: 1px solid rgba(20,30,60,.08);
  box-shadow:
    0 30px 80px -40px rgba(5,106,171,0.35),
    0 10px 35px -25px rgba(15,23,42,0.22),
    inset 0 1px 0 rgba(255,255,255,.92);
  overflow: hidden;
  transform-style: preserve-3d;
}
#scene9-final .preview-shell::before {
  content: "";
  position: absolute; inset: 0;
  background:
    radial-gradient(56% 44% at 88% 14%, rgba(5,106,171,.16), transparent 68%),
    radial-gradient(46% 38% at 10% 82%, rgba(3,153,237,.13), transparent 72%);
  pointer-events: none;
}
#scene9-final .border-sweep {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: conic-gradient(from var(--sweep-angle), transparent 0 18%, rgba(3,153,237,.70) 25%, rgba(226,119,48,.58) 32%, transparent 44% 100%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  pointer-events: none;
  z-index: 5;
}
#scene9-final .browser-sweep {
  top: -10%;
  bottom: -10%;
  left: 0;
  width: 34%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.34), rgba(3,153,237,.18), transparent);
  filter: blur(7px);
  opacity: 0;
}
#scene9-final .browser-bar {
  position: relative;
  height: 52px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 22px;
  border-bottom: 1px solid rgba(20,30,60,.08);
  background: rgba(255,255,255,.78);
}
#scene9-final .browser-bar::before {
  content: "";
  position: absolute;
  left: 0; right: 0; top: 0;
  height: 20px;
  background: linear-gradient(180deg, rgba(255,255,255,.72), rgba(255,255,255,0));
  pointer-events: none;
}
#scene9-final .dot {
  width: 13px; height: 13px; border-radius: 50%;
}
#scene9-final .dot.red { background: #f36b5f; }
#scene9-final .dot.yellow { background: #f8bf4f; }
#scene9-final .dot.green { background: #57c65f; }
#scene9-final .url {
  margin-left: 12px;
  height: 28px;
  min-width: 250px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(241,245,249,.86);
  color: #667085;
  display: inline-flex;
  align-items: center;
  font: 600 12px/1 'Inter', system-ui, sans-serif;
}
#scene9-final .form-card {
  position: relative;
  margin: 34px auto 0;
  width: min(82%, 560px);
  border-radius: 18px;
  padding: 30px 34px 32px;
  background: rgba(255,255,255,.94);
  box-shadow: 0 20px 44px -28px rgba(20,30,60,.28);
  border: 1px solid rgba(20,30,60,.06);
  will-change: transform, opacity, filter;
}
#scene9-final .form-card h2 {
  margin: 0 0 24px;
  font: 760 29px/1.12 'Inter', system-ui, sans-serif;
  letter-spacing: -0.025em;
  color: #1d2939;
}
#scene9-final .form-reveal {
  will-change: transform, opacity, filter;
}
#scene9-final .field {
  margin-top: 18px;
}
#scene9-final .label {
  margin: 0 0 8px;
  color: #344054;
  font: 720 14px/1 'Inter', system-ui, sans-serif;
}
#scene9-final .input {
  height: 43px;
  border-radius: 8px;
  border: 1px solid rgba(102,112,133,.28);
  background: linear-gradient(180deg, #fff, #f8fafc);
}
#scene9-final .row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
#scene9-final .stars {
  display: flex;
  gap: 9px;
  color: #066AAB;
  font-size: 31px;
  line-height: 1;
}
#scene9-final .textarea {
  height: 92px;
}
#scene9-final .submit {
  display: inline-flex;
  margin-top: 24px;
  padding: 13px 18px;
  border-radius: 10px;
  background: #E27730;
  color: #fff;
  font: 780 15px/1 'Inter', system-ui, sans-serif;
  box-shadow: 0 14px 26px -18px rgba(226,119,48,.72);
}
#scene9-final .counter {
  position: absolute;
  right: 28px;
  bottom: 26px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 86px;
  justify-content: center;
  padding: 10px 13px;
  border-radius: 999px;
  background: rgba(238,247,255,.94);
  color: #056AAB;
  border: 1px solid rgba(3,153,237,.18);
  box-shadow: 0 12px 30px -22px rgba(5,106,171,.45), inset 0 1px 0 rgba(255,255,255,.88);
  font: 760 13px/1 'Inter', system-ui, sans-serif;
  white-space: nowrap;
}
#scene9-final .counter-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #3B82F6;
  box-shadow: 0 0 0 0 rgba(59,130,246,.36);
}
#scene9-final .counter-text {
  color: #056AAB;
  font-variant-numeric: tabular-nums;
}
`;

export async function setup({ doc }) {
  doc.querySelectorAll('.scene-fields-hidden').forEach((el) => el.classList.remove('scene-fields-hidden'));
}

export default [
  {
    id: 'final-payoff',
    chapter: 'scene-9',
    effect: async ({ doc, cursor, sleep, zoomTo }) => {
      const gsap = await loadGsap();
      ensureFont();
      customizeEngineCursor();
      injectCss('scene9-page-css', PAGE_CSS);

      try { await cursor.hide(); } catch (_) {}
      doc.querySelectorAll('.scene-fields-hidden').forEach((el) => el.classList.remove('scene-fields-hidden'));

      const frameEls = [
        document.querySelector('iframe.ui'),
        document.querySelector('.mac-frame'),
        document.querySelector('.mac-chrome'),
      ].filter(Boolean);

      await zoomTo([sel.previewPanel], {
        level: 1.0,
        pad: 0,
        smooth: true,
        noScroll: true,
        scrollBehavior: 'auto',
        duration: 360,
      });

      const layer = mountSceneLayer('scene9-final', { z: 82 });
      injectCss('scene9-page-css', PAGE_CSS);
      layer.innerHTML = `
        <div class="bg"></div>
        <div class="wrap">
          <div class="brand">
            <img class="sullie" src="/assets/sullie.png" alt="">
            <h1 class="title"><span class="title-unit">WPForms</span> <span class="title-unit ai">AI</span></h1>
            <div class="sub">
              <span class="sub-line">Describe it. Generate it. Refine it.</span>
              <span class="sub-line">Publish it.</span>
            </div>
            <div class="cta">
              <span class="cta-shine"></span>
              <span>Build smarter forms, faster</span>
              <span class="cta-arrow"></span>
            </div>
          </div>
          <div class="browser-wrap">
            <div class="browser-glow"></div>
            <div class="preview-shell">
              <div class="border-sweep"></div>
              <div class="browser-sweep"></div>
              <div class="browser-bar">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
                <span class="url">sulliesbakery.com/feedback</span>
              </div>
              <div class="form-card">
                <h2 class="form-reveal">Online Feedback Survey</h2>
                <div class="field form-reveal">
                  <div class="label">Your Name</div>
                  <div class="row"><div class="input"></div><div class="input"></div></div>
                </div>
                <div class="field form-reveal">
                  <div class="label">Your Email</div>
                  <div class="input"></div>
                </div>
                <div class="field form-reveal">
                  <div class="label">Online Feedback Rating</div>
                  <div class="stars">★★★★★</div>
                </div>
                <div class="field form-reveal">
                  <div class="label">What did you enjoy most?</div>
                  <div class="input textarea"></div>
                </div>
                <div class="submit form-reveal">Submit</div>
              </div>
              <div class="counter">
                <span class="counter-dot"></span>
                <span class="counter-text">0 fields</span>
              </div>
            </div>
          </div>
        </div>
      `;

      const bg = layer.querySelector('.bg');
      const wrap = layer.querySelector('.wrap');
      const sullie = layer.querySelector('.sullie');
      const titleUnits = [...layer.querySelectorAll('.title-unit')];
      const subLines = [...layer.querySelectorAll('.sub-line')];
      const cta = layer.querySelector('.cta');
      const ctaShine = layer.querySelector('.cta-shine');
      const ctaArrow = layer.querySelector('.cta-arrow');
      const browserWrap = layer.querySelector('.browser-wrap');
      const browserGlow = layer.querySelector('.browser-glow');
      const preview = layer.querySelector('.preview-shell');
      const borderSweep = layer.querySelector('.border-sweep');
      const browserSweep = layer.querySelector('.browser-sweep');
      const formCard = layer.querySelector('.form-card');
      const formElements = [...layer.querySelectorAll('.form-reveal')];
      const counter = layer.querySelector('.counter');
      const counterDot = layer.querySelector('.counter-dot');
      const counterText = layer.querySelector('.counter-text');

      frameEls.forEach((el) => {
        el.style.transition = 'filter 600ms cubic-bezier(.2,.8,.2,1), opacity 600ms ease';
        el.style.filter = 'blur(9px) saturate(.84) brightness(1.03)';
        el.style.opacity = '0.38';
      });

      gsap.set(layer, { opacity: 1 });
      gsap.set(bg, { opacity: 0 });
      gsap.set(wrap, { opacity: 1 });
      gsap.set(sullie, { y: 10, opacity: 0, scale: 0.82 });
      gsap.set(titleUnits, { y: 32, opacity: 0, filter: 'blur(10px)' });
      gsap.set(subLines, { y: 16, opacity: 0, filter: 'blur(5px)' });
      gsap.set(cta, { y: 18, opacity: 0, scale: 0.96, filter: 'blur(5px)' });
      gsap.set(browserWrap, { y: 22, opacity: 0, scale: 0.965, filter: 'blur(8px)' });
      gsap.set(browserGlow, { opacity: 0, scale: 0.86 });
      gsap.set(formCard, { y: 28, opacity: 0, filter: 'blur(8px)' });
      gsap.set(formElements, { y: 10, opacity: 0, filter: 'blur(4px)' });
      gsap.set(counter, { y: 12, opacity: 0, scale: 0.88, minWidth: 78 });

      const tl = gsap.timeline();
      tl.to(bg, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0);
      tl.to(browserGlow, { opacity: 0.95, scale: 1, duration: 0.72, ease: 'power2.out' }, 0.12);
      tl.to(browserWrap, {
        y: 0, opacity: 1, scale: 1, filter: 'blur(0px)',
        duration: 0.72, ease: 'expo.out',
        onStart: () => playSfx('swoosh-entry', { volume: 0.32 }),
      }, 0.20);
      tl.to(formCard, {
        y: 0, opacity: 1, filter: 'blur(0px)',
        duration: 0.52, ease: 'power3.out',
      }, 0.43);
      tl.to(formElements, {
        y: 0, opacity: 1, filter: 'blur(0px)',
        duration: 0.34, ease: 'power3.out', stagger: 0.052,
      }, 0.62);
      tl.set(borderSweep, { '--sweep-angle': '-32deg', opacity: 0 }, 0.64);
      tl.to(borderSweep, { opacity: 1, duration: 0.08, ease: 'power2.out' }, 0.66);
      tl.to(borderSweep, { '--sweep-angle': '328deg', duration: 0.65, ease: 'power2.out' }, 0.66);
      tl.to(borderSweep, { opacity: 0, duration: 0.18, ease: 'power2.out' }, 1.13);
      tl.to(browserSweep, {
        x: '430%', opacity: 0.18,
        duration: 0.65, ease: 'power2.out',
      }, 0.82);
      tl.to(browserSweep, { opacity: 0, duration: 0.18, ease: 'power2.out' }, 1.26);

      tl.to(sullie, {
        y: 0, opacity: 1, scale: 1.04,
        duration: 0.32, ease: 'back.out(1.6)',
        onStart: () => playSfx('pop-ui', { volume: 0.45 }),
      }, 0.35);
      tl.to(sullie, { scale: 1, duration: 0.13, ease: 'power2.out' }, 0.67);
      tl.to(titleUnits, {
        y: 0, opacity: 1, filter: 'blur(0px)',
        duration: 0.72, ease: 'expo.out', stagger: 0.035,
      }, 0.48);
      tl.to(subLines, {
        y: 0, opacity: 1, filter: 'blur(0px)',
        duration: 0.46, ease: 'power3.out', stagger: 0.08,
      }, 0.95);
      tl.to(cta, {
        y: 0, opacity: 1, scale: 1, filter: 'blur(0px)',
        duration: 0.46, ease: 'back.out(1.4)',
        onStart: () => playSfx('pop-drop', { volume: 0.40 }),
      }, 1.35);
      tl.to(ctaShine, {
        x: '330%', opacity: 1,
        duration: 0.52, ease: 'power2.out',
      }, 1.66);
      tl.to(ctaShine, { opacity: 0, duration: 0.16, ease: 'power2.out' }, 2.08);
      tl.to(ctaArrow, {
        x: 4,
        duration: 0.16,
        ease: 'power2.out',
      }, 1.78);
      tl.to(ctaArrow, { x: 0, duration: 0.20, ease: 'power2.inOut' }, 1.94);

      tl.to(counter, {
        y: 0, opacity: 1, scale: 1, minWidth: 86,
        duration: 0.22, ease: 'power3.out',
      }, 1.75);
      tl.call(() => { counterText.textContent = '0 fields'; }, null, 1.78);
      tl.to(counter, { minWidth: 112, duration: 0.24, ease: 'power3.out' }, 1.98);
      tl.call(() => { counterText.textContent = '6 fields'; }, null, 2.02);
      tl.to(counter, { minWidth: 188, duration: 0.34, ease: 'power3.out' }, 2.23);
      tl.call(() => { counterText.textContent = '6 fields → complete form'; }, null, 2.28);
      tl.to(counterDot, {
        boxShadow: '0 0 0 10px rgba(59,130,246,0)',
        duration: 0.34, ease: 'power3.out',
      }, 2.43);
      tl.to(counter, {
        boxShadow: '0 15px 36px -18px rgba(5,106,171,.58), 0 0 0 5px rgba(3,153,237,.10), inset 0 1px 0 rgba(255,255,255,.88)',
        duration: 0.26, ease: 'power3.out',
      }, 2.43);

      await tlDone(tl);

      gsap.to(browserWrap, { y: -4, duration: 3.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to(bg, { opacity: 0.82, duration: 3.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      await sleep(1450);
    },
    duration: 0.2,
  },
];
