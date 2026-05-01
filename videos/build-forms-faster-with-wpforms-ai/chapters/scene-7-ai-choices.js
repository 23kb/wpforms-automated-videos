// Scene 7 — AI Choices magic (~6s).
//
// Real base: builder-field-options-checkbox. The AI Choices modal is the
// product-derived HTML supplied by the user, staged video-locally. The beat is
// launch-style: cursor trigger, modal bloom, prompt type, generated options
// resolve with a light sweep, then the real choices list updates.

import sel from './_selectors.js';
import {
  loadGsap, ensureFont, customizeEngineCursor,
  mountSceneLayer, injectCss, playSfx, tlDone,
} from './_kit.js';

export const snapshot = 'builder-field-options-checkbox';
export const mode = 'parallel';
export const validator = { snapshot: 'builder-field-options-checkbox' };
export const breakStyle = 'soft-dolly';
export const swapStyle = 'cover';

const PROMPT = 'Generate options for customer visit reasons.';
const GENERATED_CHOICES = [
  'Dine-in',
  'Takeout',
  'Delivery',
  'Catering',
  'Private event',
  'Other',
];

const PRODUCT_MODAL_HTML = `
<div class="jconfirm-content-pane no-scroll" style="transition-duration: 0.4s; transition-timing-function: cubic-bezier(0.36, 0.55, 0.19, 1); max-height: 600px; height: 800px;"><div class="jconfirm-content" id="jconfirm-box37137"><div><wpforms-ai-chat mode="choices" field-id="1">
  <div class="wpforms-ai-chat">
    <div class="wpforms-ai-chat-message-list wpforms-scrollbar-compact">
      <div class="wpforms-ai-chat-message-item item-primary">
        <div class="wpforms-ai-chat-welcome-screen">
          <div class="wpforms-ai-chat-header">
            <h3 class="wpforms-ai-chat-header-title">Generate Choices</h3>
            <span class="wpforms-ai-chat-header-description">Describe the choices you would like to create or use one of the examples below to get started.
              <a href="https://wpforms.com/features/wpforms-ai/" target="_blank" rel="noopener noreferrer">Learn More About WPForms AI</a>
            </span>
          </div>
          <ul class="wpforms-ai-chat-welcome-screen-sample-prompts">
            <li data-prompt=""><i class="scene7-sample-icon"></i><a href="#">american public holidays with dates in brackets</a></li>
            <li data-prompt=""><i class="scene7-sample-icon"></i><a href="#">provinces of canada ordered by population</a></li>
            <li data-prompt=""><i class="scene7-sample-icon"></i><a href="#">top 5 social networks in europe</a></li>
            <li data-prompt=""><i class="scene7-sample-icon"></i><a href="#">top 10 most spoken languages in the world</a></li>
            <li data-prompt=""><i class="scene7-sample-icon"></i><a href="#">top 20 most popular tropical travel destinations</a></li>
            <li data-prompt=""><i class="scene7-sample-icon"></i><a href="#">30 household item categories for a marketplace</a></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="wpforms-ai-chat-message-input">
      <textarea placeholder="What would you like to create?"></textarea>
      <button type="button" class="scene7-send"></button>
      <button type="button" class="wpforms-ai-chat-stop wpforms-hidden"></button>
    </div>
  </div>
</wpforms-ai-chat></div></div></div>`;

const IFRAME_CSS = `
#wpforms-field-option-7-ai_modal_button.scene7-hover {
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 0 0 5px rgba(5,106,171,.13), 0 12px 26px -16px rgba(5,106,171,.35) !important;
  transition: transform 260ms cubic-bezier(.2,.8,.2,1), box-shadow 260ms ease;
}
.scene7-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2147483598;
  background: rgba(31,41,55,.34);
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
  opacity: 0;
}
.wpforms-ai-choices-modal {
  position: fixed;
  z-index: 2147483599;
  left: 50%;
  top: 50%;
  width: min(720px, calc(100vw - 96px));
  max-height: min(760px, calc(100vh - 72px));
  transform: translate(-50%, -50%) scale(.78);
  transform-origin: 54% 86%;
  opacity: 0;
  background: #fff;
  border-radius: 7px;
  box-shadow: 0 34px 90px rgba(18,24,38,.28);
  overflow: hidden;
  color: #2c3338;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.wpforms-ai-choices-modal .jconfirm-content-pane {
  height: auto !important;
  max-height: none !important;
}
.wpforms-ai-choices-modal .jconfirm-content {
  padding: 0;
}
.wpforms-ai-choices-modal .wpforms-ai-chat {
  display: block;
  min-height: 0;
}
.wpforms-ai-choices-modal .wpforms-ai-chat-message-list {
  padding: 28px 30px 16px;
  overflow: visible;
}
.wpforms-ai-choices-modal .wpforms-ai-chat-header-title {
  margin: 0 0 8px;
  font-size: 24px;
  line-height: 1.16;
  color: #1d2327;
}
.wpforms-ai-choices-modal .wpforms-ai-chat-header-description {
  display: block;
  color: #50575e;
  font-size: 14px;
  line-height: 1.45;
  max-width: 580px;
}
.wpforms-ai-choices-modal .wpforms-ai-chat-welcome-screen-sample-prompts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
}
.wpforms-ai-choices-modal .wpforms-ai-chat-welcome-screen-sample-prompts li {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #dcdcde;
  background: #f6f7f7;
  border-radius: 6px;
  min-height: 48px;
  padding: 9px 12px;
  font-size: 13px;
  line-height: 1.28;
}
.wpforms-ai-choices-modal .scene7-sample-icon {
  width: 16px;
  height: 16px;
  border-radius: 5px;
  flex: 0 0 auto;
  background: linear-gradient(135deg, rgba(5,106,171,.20), rgba(3,153,237,.16));
  box-shadow: inset 0 0 0 1px rgba(5,106,171,.10);
}
.wpforms-ai-choices-modal .wpforms-ai-chat-welcome-screen-sample-prompts a {
  color: #056AAB;
  text-decoration: none;
}
.wpforms-ai-choices-modal .wpforms-ai-chat-message-input {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 24px 24px;
  padding: 10px;
  border: 1px solid #c3c4c7;
  border-radius: 7px;
  background: #fff;
  box-shadow: 0 0 0 0 rgba(5,106,171,0);
}
.wpforms-ai-choices-modal textarea {
  flex: 1;
  min-height: 44px;
  max-height: 70px;
  border: 0 !important;
  box-shadow: none !important;
  outline: none !important;
  resize: none;
  font: 14px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.wpforms-ai-choices-modal .scene7-send {
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 6px;
  background: linear-gradient(135deg, #056AAB, #0399ED);
  color: #fff;
}
.wpforms-ai-choices-modal .scene7-send::before {
  content: "";
  display: block;
  width: 11px;
  height: 11px;
  margin: 0 auto;
  border-top: 2px solid #fff;
  border-right: 2px solid #fff;
  transform: rotate(45deg);
}
.wpforms-ai-choices-modal .scene7-question {
  justify-self: end;
  max-width: 76%;
  margin-left: auto;
  padding: 12px 15px;
  border-radius: 16px 16px 3px 16px;
  background: linear-gradient(135deg, #e8f3ff, #eef0ff);
  color: #1f3d63;
  font-weight: 600;
  font-size: 14px;
}
.wpforms-ai-choices-modal .scene7-answer {
  position: relative;
  margin-top: 14px;
  padding: 14px;
  border-radius: 16px 16px 16px 4px;
  background: #f8fafc;
  border: 1px solid rgba(5,106,171,.14);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.8);
  overflow: hidden;
}
.wpforms-ai-choices-modal .scene7-answer::after {
  content: "";
  position: absolute;
  left: -30%;
  top: 0;
  width: 28%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(5,106,171,.20), rgba(3,153,237,.20), transparent);
  transform: skewX(-12deg);
  animation: scene7Sweep 1.1s cubic-bezier(.2,.8,.2,1) forwards;
}
@keyframes scene7Sweep { to { left: 112%; } }
.wpforms-ai-choices-modal .scene7-options {
  display: grid;
  gap: 7px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.wpforms-ai-choices-modal .scene7-options li {
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 30px;
  padding: 6px 8px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 0 rgba(20,30,60,.06);
  opacity: 0;
  transform: translateY(10px);
  filter: blur(6px);
}
.wpforms-ai-choices-modal .scene7-options li::before {
  content: "";
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 50%, #0399ED 0 36%, rgba(3,153,237,.14) 37% 100%);
  box-shadow: 0 0 14px rgba(3,153,237,.28);
}
.wpforms-ai-choices-modal .scene7-insert {
  margin-top: 12px;
  border: 0;
  border-radius: 6px;
  padding: 9px 14px;
  background: #E27730;
  color: #fff;
  font-weight: 700;
  box-shadow: 0 12px 26px -16px rgba(226,119,48,.58);
  opacity: 0;
}
#wpforms-field-option-7-choices-list.scene7-success {
  box-shadow: 0 0 0 5px rgba(3,153,237,.14), 0 12px 28px -20px rgba(3,153,237,.42);
  border-radius: 6px;
  transition: box-shadow 420ms ease;
}
`;

const PAGE_CSS = `
#scene7-overlay {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  color: #14161C;
}
#scene7-overlay .scene7-caption {
  position: fixed; left: 50%; top: 7vh;
  transform: translateX(-50%);
  font-size: clamp(25px, 2.1vw, 36px);
  font-weight: 650; letter-spacing: -0.02em; line-height: 1.15;
  color: #1A2238;
  text-align: center;
  opacity: 0;
  background: rgba(255,255,255,0.84);
  border-radius: 14px;
  padding: 12px 24px;
  box-shadow: 0 14px 34px -16px rgba(20,30,60,0.22);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  pointer-events: none;
}
#scene7-overlay .scene7-caption .accent {
  background: linear-gradient(96deg, #056AAB 8%, #0399ED 92%);
  -webkit-background-clip: text; background-clip: text;
  color: transparent; -webkit-text-fill-color: transparent;
  font-style: italic; font-weight: 750;
}
#scene7-overlay .scene7-spark {
  position: fixed;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: radial-gradient(closest-side, #fff 0%, rgba(5,106,171,.9) 42%, transparent 75%);
  box-shadow: 0 0 14px 4px rgba(5,106,171,.42);
  pointer-events: none;
  opacity: 0;
}
`;

export async function setup({ doc }) {
  installIframeCss(doc);
  stageChoiceField(doc);
}

export default [
  {
    id: 'ai-choices-magic',
    chapter: 'scene-7',
    effect: async ({ doc, cursor, sleep, type, zoomTo }) => {
      const gsap = await loadGsap();
      ensureFont();
      customizeEngineCursor();
      injectCss('scene7-page-css', PAGE_CSS);
      installIframeCss(doc);
      stageChoiceField(doc);

      const overlay = mountSceneLayer('scene7-overlay', { z: 74 });
      gsap.set(overlay, { opacity: 1 });
      overlay.innerHTML = `
        <div class="scene7-caption"><span class="accent">Generate choices</span> instantly.</div>
      `;
      const caption = overlay.querySelector('.scene7-caption');

      await zoomTo([sel.choicesRow, sel.aiChoicesButton], {
        level: 1.04,
        pad: 22,
        smooth: true,
        noScroll: true,
        scrollBehavior: 'auto',
        duration: 360,
      });

      gsap.fromTo(caption,
        { y: -18, opacity: 0, filter: 'blur(8px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.42, ease: 'expo.out' }
      );

      const button = doc.querySelector(sel.aiChoicesButton);
      if (button) button.classList.add('scene7-hover');
      await cursor.glideTo(sel.aiChoicesButton, { wait: 220 });
      await cursor.clickOn(sel.aiChoicesButton, { dispatch: false, magnetic: true });
      if (button) button.classList.remove('scene7-hover');

      const { backdrop, modal } = mountChoicesModal(doc);
      const modalTl = gsap.timeline();
      modalTl.to(backdrop, {
        opacity: 1,
        backdropFilter: 'blur(8px)',
        webkitBackdropFilter: 'blur(8px)',
        duration: 0.32,
        ease: 'power2.out',
      }, 0);
      modalTl.to(modal, {
        opacity: 1,
        scale: 1,
        duration: 0.52,
        ease: 'back.out(1.45)',
        onStart: () => playSfx('pop-ui', { volume: 0.55 }),
      }, 0.04);
      await tlDone(modalTl);

      await zoomTo([sel.aiChoicesModal], {
        level: 1.0,
        pad: 28,
        smooth: true,
        noScroll: true,
        scrollBehavior: 'auto',
        duration: 260,
      });

      await cursor.glideTo(sel.aiChoicesInput, { wait: 160 });
      await cursor.click();
      await type(sel.aiChoicesInput, PROMPT, { cps: 54, clear: true });

      sparkleToward(overlay, doc.querySelector('.scene7-send'), gsap);
      await sleep(120);
      await cursor.clickOn('.scene7-send', { dispatch: false, magnetic: true });

      const answer = stageGeneratedAnswer(doc);
      const items = answer ? [...answer.querySelectorAll('.scene7-options li')] : [];
      const insert = answer?.querySelector('.scene7-insert');
      gsap.to(items, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.36,
        ease: 'back.out(1.35)',
        stagger: 0.07,
        onStart: () => playSfx('hover', { volume: 0.36 }),
      });
      gsap.to(insert, {
        opacity: 1,
        y: 0,
        duration: 0.32,
        ease: 'power3.out',
        delay: 0.5,
      });

      await sleep(1050);
      await cursor.glideTo(sel.aiChoicesInsert, { wait: 180 });
      await cursor.clickOn(sel.aiChoicesInsert, { dispatch: false, magnetic: true });
      applyGeneratedChoices(doc);
      sparkleAroundChoices(overlay, doc.querySelector(sel.choicesList), gsap);
      doc.querySelector(sel.choicesList)?.classList.add('scene7-success');
      playSfx('pop-drop', { volume: 0.48 });

      const exit = gsap.timeline();
      exit.to(modal, { opacity: 0, scale: 0.94, filter: 'blur(8px)', duration: 0.34, ease: 'power3.in' }, '+=0.18');
      exit.to(backdrop, { opacity: 0, duration: 0.28, ease: 'power2.in' }, '<');
      exit.to(caption, { opacity: 0, y: -10, filter: 'blur(6px)', duration: 0.28, ease: 'power2.in' }, '<');
      await tlDone(exit);
      removeChoicesModal(doc);
      overlay.remove();
      await sleep(40);
    },
    duration: 0.2,
  },
];

function installIframeCss(doc) {
  if (doc.getElementById('scene7-iframe-css')) return;
  const style = doc.createElement('style');
  style.id = 'scene7-iframe-css';
  style.textContent = IFRAME_CSS;
  doc.head.appendChild(style);
}

function stageChoiceField(doc) {
  const label = 'Why are you visiting today?';
  const optionLabel = doc.querySelector(sel.choicesOptionLabel);
  if (optionLabel) {
    optionLabel.value = label;
    optionLabel.setAttribute('value', label);
  }
  const fieldLabel = doc.querySelector(sel.choicesFieldLabel);
  if (fieldLabel) fieldLabel.textContent = label;
  const field = doc.querySelector(sel.choicesField);
  if (field) field.classList.add('active');
}

function mountChoicesModal(doc) {
  removeChoicesModal(doc);
  const backdrop = doc.createElement('div');
  backdrop.className = 'scene7-backdrop';

  const modal = doc.createElement('div');
  modal.className = 'wpforms-ai-choices-modal';
  modal.innerHTML = PRODUCT_MODAL_HTML;
  doc.body.append(backdrop, modal);
  return { backdrop, modal };
}

function removeChoicesModal(doc) {
  doc.querySelectorAll('.scene7-backdrop, .wpforms-ai-choices-modal').forEach((el) => el.remove());
}

function stageGeneratedAnswer(doc) {
  const modal = doc.querySelector(sel.aiChoicesModal);
  const list = modal?.querySelector('.wpforms-ai-chat-message-list');
  if (!list) return null;

  list.innerHTML = `
    <div class="scene7-question">${PROMPT}</div>
    <div class="scene7-answer">
      <ul class="scene7-options">
        ${GENERATED_CHOICES.map((choice) => `<li><span>${choice}</span></li>`).join('')}
      </ul>
      <button type="button" class="scene7-insert wpforms-ai-chat-choices-insert">Insert Choices</button>
    </div>
  `;
  return list.querySelector('.scene7-answer');
}

function applyGeneratedChoices(doc) {
  const list = doc.querySelector(sel.choicesList);
  if (!list) return;
  const first = list.querySelector('li');
  if (!first) return;
  list.innerHTML = '';
  GENERATED_CHOICES.forEach((choice, index) => {
    const key = String(index + 1);
    const item = first.cloneNode(true);
    item.dataset.key = key;
    const labelInput = item.querySelector('input.label');
    if (labelInput) {
      labelInput.name = `fields[7][choices][${key}][label]`;
      labelInput.value = choice;
      labelInput.setAttribute('value', choice);
    }
    const valueInput = item.querySelector('input.value');
    if (valueInput) valueInput.name = `fields[7][choices][${key}][value]`;
    const defaultInput = item.querySelector('.default');
    if (defaultInput) defaultInput.name = `fields[7][choices][${key}][default]`;
    list.appendChild(item);
  });
  list.dataset.nextId = String(GENERATED_CHOICES.length + 1);

  const previewList = doc.querySelector('#wpforms-field-7 .primary-input');
  if (previewList) {
    previewList.innerHTML = '';
    GENERATED_CHOICES.forEach((choice, index) => {
      const li = doc.createElement('li');
      li.innerHTML = `<input type="checkbox" disabled> ${choice}`;
      previewList.appendChild(li);
    });
  }
}

function toScreenRect(el) {
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

function sparkleToward(layer, targetEl, gsap) {
  const r = toScreenRect(targetEl);
  if (!r) return;
  const tx = r.left + r.width / 2;
  const ty = r.top + r.height / 2;
  for (let i = 0; i < 10; i++) {
    const sp = document.createElement('div');
    sp.className = 'scene7-spark';
    layer.appendChild(sp);
    gsap.set(sp, {
      left: tx - 240 + Math.random() * 180,
      top: ty - 130 + Math.random() * 220,
      opacity: 0,
      scale: 0.3,
    });
    gsap.timeline({ delay: i * 0.04 })
      .to(sp, { opacity: 0.9, scale: 1, duration: 0.18, ease: 'power2.out' })
      .to(sp, { left: tx, top: ty, duration: 0.58, ease: 'power3.in' }, '<')
      .to(sp, { opacity: 0, scale: 0.2, duration: 0.18, ease: 'power2.in' }, '>-0.06')
      .call(() => sp.remove());
  }
}

function sparkleAroundChoices(layer, targetEl, gsap) {
  const r = toScreenRect(targetEl);
  if (!r) return;
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  for (let i = 0; i < 16; i++) {
    const sp = document.createElement('div');
    sp.className = 'scene7-spark';
    layer.appendChild(sp);
    const angle = Math.PI * 2 * (i / 16);
    gsap.set(sp, { left: cx, top: cy, opacity: 0, scale: 0.3 });
    gsap.timeline({ delay: i * 0.02 })
      .to(sp, {
        left: cx + Math.cos(angle) * (90 + Math.random() * 170),
        top: cy + Math.sin(angle) * (45 + Math.random() * 90),
        opacity: 1,
        scale: 1,
        duration: 0.42,
        ease: 'power3.out',
      })
      .to(sp, { opacity: 0, scale: 0.2, duration: 0.34, ease: 'power2.in' }, '>-0.02')
      .call(() => sp.remove());
  }
}
