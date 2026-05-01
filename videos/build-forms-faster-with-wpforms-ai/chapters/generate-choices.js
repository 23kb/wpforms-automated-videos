import sel from './_selectors.js';

export const snapshot = 'builder-field-options-checkbox';
export const mode = 'per-beat-narration';
export const validator = { snapshot: 'builder-field-options-checkbox' };
export const swapStyle = 'cover'; // clean handoff: Use This Form lands in the real builder before the Generate Choices feature

const promptText = 'common ways customers found us';
const generatedChoices = [
  'Search engine',
  'Social media',
  'Friend or colleague',
  'Advertisement',
  'Other',
];

function ensureCleanGuardStyle(doc) {
  if (doc.querySelector('#wpforms-ai-choices-clean-guard')) return;
  const style = doc.createElement('style');
  style.id = 'wpforms-ai-choices-clean-guard';
  style.textContent = `
    body.wpforms-ai-choices-cleaning #wpforms-builder { opacity: 0 !important; }
    body.wpforms-ai-choices-ready #wpforms-builder { opacity: 1 !important; }
  `;
  doc.head.appendChild(style);
}

function stageSurveyChoiceField(doc) {
  const optionLabel = doc.querySelector(sel.choicesOptionLabel);
  if (optionLabel) {
    optionLabel.value = 'How did you hear about us?';
    optionLabel.setAttribute('value', optionLabel.value);
  }

  const fieldLabel = doc.querySelector(sel.choicesFieldLabel);
  if (fieldLabel) fieldLabel.textContent = 'How did you hear about us?';

  const previewLabel = doc.querySelector('#wpforms-field-7 .label-title .text');
  if (previewLabel) previewLabel.textContent = 'How did you hear about us?';

  const button = doc.querySelector(sel.aiChoicesButton);
  if (button) {
    button.style.boxShadow = '0 0 0 4px rgba(123,91,232,0.13)';
    button.style.transform = 'translateZ(0)';
  }
}

function cleanBuilderForm(doc) {
  ensureCleanGuardStyle(doc);
  const title = doc.querySelector('.wpforms-toolbar .wpforms-form-name, .wpforms-center-form-name');
  if (title) title.textContent = 'Online Feedback Survey';

  const content = doc.querySelector('#wpforms-panel-fields .wpforms-panel-content')
    || doc.querySelector('.wpforms-panel-content');
  if (!content) return;

  content.querySelectorAll('h1, h2, h3, .wpforms-title').forEach((heading) => {
    if (heading.textContent.trim() === 'Master Form') heading.textContent = 'Online Feedback Survey';
  });

  content.querySelectorAll(
    '.wpforms-panel-content-section-tabs-list, .wpforms-quiz-panel-content-section-tabs-list, .wpforms-pagebreak-divider, .wpforms-quiz-answer-required, [class*="quiz-panel-content-section"], [class*="wpforms-panel-content-section-quiz"]'
  ).forEach((el) => {
    const wrapper = el.closest('.wpforms-panel-content-section-tabs') || el;
    wrapper.style.display = 'none';
  });

  content.querySelectorAll('.wpforms-field').forEach((field) => {
    const keep = ['wpforms-field-1', 'wpforms-field-2', 'wpforms-field-4', 'wpforms-field-7'].includes(field.id);
    field.style.display = keep ? '' : 'none';
    if (keep) field.classList.toggle('active', field.id === 'wpforms-field-7');
  });

  const nameLabel = content.querySelector('#wpforms-field-1 .label-title .text');
  const emailLabel = content.querySelector('#wpforms-field-2 .label-title .text');
  const messageLabel = content.querySelector('#wpforms-field-4 .label-title .text');
  const checkboxesLabel = content.querySelector('#wpforms-field-7 .label-title .text');
  if (nameLabel) nameLabel.textContent = 'Name';
  if (emailLabel) emailLabel.textContent = 'Email';
  if (messageLabel) messageLabel.textContent = 'Message';
  if (checkboxesLabel) checkboxesLabel.textContent = 'How did you hear about us?';

  content.querySelectorAll(
    '.wpforms-field-payment-single, .wpforms-field-payment-checkbox, .wpforms-field-payment-multiple, .wpforms-field-payment-select, .wpforms-field-payment-total, .wpforms-field-credit-card, .wpforms-field-paypal-commerce, [class*="paypal"], [class*="PayPal"], [id*="paypal"], [id*="PayPal"]'
  ).forEach((el) => {
    el.style.display = 'none';
  });

  content.querySelectorAll('button, a, div, span').forEach((el) => {
    if (!/\bPayPal\b/i.test(el.textContent || '')) return;
    const target = el.closest('.wpforms-field, .wpforms-submit-container, .wpforms-payment-total, .wpforms-pagebreak') || el;
    target.style.display = 'none';
  });

  doc.body.classList.remove('wpforms-ai-choices-cleaning');
  doc.body.classList.add('wpforms-ai-choices-ready');
}

function ensureModalStyle(doc) {
  if (doc.querySelector('#wpforms-ai-choices-video-style')) return;
  const style = doc.createElement('style');
  style.id = 'wpforms-ai-choices-video-style';
  style.textContent = `
    .wpforms-ai-choices-video-dim {
      position: fixed;
      inset: 0;
      z-index: 99998;
      background: rgba(31, 41, 55, 0.42);
    }
    .wpforms-ai-choices-modal {
      position: fixed;
      z-index: 99999;
      left: 50%;
      top: 52%;
      width: min(660px, calc(100vw - 96px));
      transform: translate(-50%, -50%);
      background: #fff;
      border-radius: 5px;
      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.24);
      color: #2c3338;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      overflow: hidden;
    }
    .wpforms-ai-choices-modal .jconfirm-title-c {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px 15px;
      border-bottom: 1px solid #dcdcde;
      font-size: 20px;
      font-weight: 600;
    }
    .wpforms-ai-choices-modal .jconfirm-closeIcon {
      color: #787c82;
      font-size: 22px;
      line-height: 1;
    }
    .wpforms-ai-choices-modal .jconfirm-content {
      padding: 22px 24px 24px;
    }
    .wpforms-ai-choices-modal .wpforms-ai-chat {
      display: grid;
      gap: 14px;
    }
    .wpforms-ai-choices-modal .wpforms-chat-item-question {
      justify-self: end;
      max-width: 74%;
      padding: 11px 14px;
      border-radius: 12px 12px 2px 12px;
      background: #e8f3ff;
      color: #1d3d5f;
      font-size: 14px;
    }
    .wpforms-ai-choices-modal .wpforms-chat-item-answer {
      justify-self: start;
      width: 76%;
      padding: 14px 16px;
      border-radius: 12px 12px 12px 2px;
      background: #f6f7f7;
      border: 1px solid #dcdcde;
      font-size: 14px;
    }
    .wpforms-ai-choices-modal .wpforms-ai-choice-result {
      display: grid;
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .wpforms-ai-choices-modal .wpforms-ai-choice-result li {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .wpforms-ai-choices-modal .wpforms-ai-choice-result li::before {
      content: "";
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #7b5be8;
      flex: 0 0 auto;
    }
    .wpforms-ai-choices-modal .wpforms-ai-chat-message-input {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      border: 1px solid #c3c4c7;
      border-radius: 4px;
      background: #fff;
    }
    .wpforms-ai-choices-modal textarea {
      flex: 1;
      min-height: 46px;
      max-height: 70px;
      resize: none;
      border: 0 !important;
      box-shadow: none !important;
      outline: none !important;
      font-size: 14px;
      font-family: inherit;
      color: #2c3338;
    }
    .wpforms-ai-choices-modal .wpforms-ai-chat-send,
    .wpforms-ai-choices-modal .wpforms-ai-chat-choices-insert {
      border: 0;
      border-radius: 4px;
      background: #2271b1;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
    }
    .wpforms-ai-choices-modal .wpforms-ai-chat-send {
      width: 38px;
      height: 38px;
      font-size: 18px;
    }
    .wpforms-ai-choices-modal .wpforms-ai-chat-choices-insert {
      margin-top: 14px;
      padding: 9px 14px;
    }
  `;
  doc.head.appendChild(style);
}

function removeChoicesModal(doc) {
  doc.querySelectorAll('.wpforms-ai-choices-video-dim, .wpforms-ai-choices-modal').forEach((el) => el.remove());
}

function mountChoicesModal(doc, { answered = false } = {}) {
  ensureModalStyle(doc);
  removeChoicesModal(doc);

  const dim = doc.createElement('div');
  dim.className = 'wpforms-ai-choices-video-dim';
  dim.setAttribute('style', 'position:fixed !important; inset:0 !important; z-index:2147483600 !important; display:block !important; opacity:1 !important; visibility:visible !important; background:rgba(31,41,55,.42) !important;');

  const modal = doc.createElement('div');
  modal.className = 'jconfirm-box jconfirm-type-ai wpforms-ai-choices-modal';
  modal.setAttribute('style', 'position:fixed !important; z-index:2147483601 !important; left:50% !important; top:50% !important; width:min(660px, calc(100vw - 96px)) !important; min-height:300px !important; transform:translate(-50%, -50%) !important; display:block !important; opacity:1 !important; visibility:visible !important; background:#fff !important; border-radius:5px !important; box-shadow:0 24px 70px rgba(0,0,0,.24) !important; overflow:hidden !important;');
  modal.innerHTML = `
    <div class="jconfirm-title-c">
      <span>Generate Choices</span>
      <span class="jconfirm-closeIcon">x</span>
    </div>
    <div class="jconfirm-content">
      <div class="wpforms-ai-chat" mode="choices">
        ${answered ? `<div class="wpforms-chat-item-question">${promptText}</div>` : ''}
        ${answered ? `
          <div class="wpforms-chat-item-answer wpforms-chat-item-choices">
            <ul class="wpforms-ai-choice-result">
              ${generatedChoices.map((choice) => `<li>${choice}</li>`).join('')}
            </ul>
            <button type="button" class="wpforms-ai-chat-choices-insert">Insert Choices</button>
          </div>
        ` : ''}
        <div class="wpforms-ai-chat-message-input">
          <textarea placeholder="Describe the choices you want to generate"></textarea>
          <button type="button" class="wpforms-ai-chat-send" aria-label="Send">›</button>
        </div>
      </div>
    </div>
  `;

  doc.body.append(dim, modal);
}

function applyGeneratedChoices(doc) {
  const list = doc.querySelector(sel.choicesList);
  if (!list) return;

  const first = list.querySelector('li');
  if (!first) return;

  list.innerHTML = '';
  generatedChoices.forEach((choice, index) => {
    const key = String(index + 1);
    const item = first.cloneNode(true);
    item.dataset.key = key;

    const defaultInput = item.querySelector('.default');
    if (defaultInput) {
      defaultInput.name = `fields[7][choices][${key}][default]`;
      defaultInput.checked = false;
    }

    const labelInput = item.querySelector('input.label');
    if (labelInput) {
      labelInput.name = `fields[7][choices][${key}][label]`;
      labelInput.value = choice;
      labelInput.setAttribute('value', choice);
    }

    const valueInput = item.querySelector('input.value');
    if (valueInput) valueInput.name = `fields[7][choices][${key}][value]`;

    list.appendChild(item);
  });
  list.dataset.nextId = String(generatedChoices.length + 1);

  const previewItems = doc.querySelectorAll('#wpforms-field-7 .primary-input li');
  generatedChoices.forEach((choice, index) => {
    let item = previewItems[index];
    if (!item && previewItems[0]) {
      item = previewItems[0].cloneNode(true);
      previewItems[0].parentElement.appendChild(item);
    }
    if (!item) return;
    const input = item.querySelector('input');
    item.textContent = ' ';
    if (input) item.appendChild(input);
    item.append(` ${choice}`);
  });
}

export async function setup(ctx) {
  ensureCleanGuardStyle(ctx.doc);
  ctx.doc.body.classList.add('wpforms-ai-choices-cleaning');
  cleanBuilderForm(ctx.doc);
  stageSurveyChoiceField(ctx.doc);
}

export default [
  {
    id: 'open-generate-choices',
    chapter: 'generate-choices',
    camera: {
      focus: [sel.choicesRow, sel.aiChoicesButton],
      level: 1.03,
      pad: 24,
      noScroll: true,
    },
    narration: 'choices-entry',
    effect: async ({ doc, cursor, sleep }) => {
      cleanBuilderForm(doc);
      stageSurveyChoiceField(doc);
      await cursor.glideTo(sel.aiChoicesButton, { wait: 280 });
      await cursor.clickOn(sel.aiChoicesButton, { dispatch: false, magnetic: true });
      await sleep(140);
      mountChoicesModal(doc);
    },
  },
  {
    id: 'type-choices-prompt',
    chapter: 'generate-choices',
    camera: {
      focus: sel.aiChoicesModal,
      level: 1.02,
      pad: 30,
      noScroll: true,
    },
    narration: 'choices-prompt',
    effect: async ({ doc, cursor, sleep, type }) => {
      cleanBuilderForm(doc);
      if (!doc.querySelector(sel.aiChoicesModal)) mountChoicesModal(doc);
      const inputBox = doc.querySelector(sel.aiChoicesInput)?.closest('.wpforms-ai-chat-message-input');
      if (inputBox) {
        inputBox.style.outline = '3px solid #E27730';
        inputBox.style.outlineOffset = '3px';
        inputBox.style.boxShadow = '0 0 0 6px rgba(226,119,48,0.16)';
      }
      await cursor.glideTo(sel.aiChoicesInput, { wait: 260 });
      await cursor.click();
      await type(sel.aiChoicesInput, promptText, { cps: 35, clear: true });
      await sleep(120);
      await cursor.clickOn(sel.aiChoicesSend, { dispatch: false, magnetic: true });
      await sleep(220);
      mountChoicesModal(doc, { answered: true });
    },
  },
  {
    id: 'insert-ai-choices',
    chapter: 'generate-choices',
    camera: {
      focus: [sel.aiChoicesModal, sel.aiChoicesInsert],
      level: 1.02,
      pad: 28,
      noScroll: true,
    },
    narration: 'choices-insert',
    effect: async ({ doc, cursor, sleep }) => {
      cleanBuilderForm(doc);
      if (!doc.querySelector(sel.aiChoicesInsert)) mountChoicesModal(doc, { answered: true });
      await cursor.glideTo(sel.aiChoicesInsert, { wait: 260 });
      await cursor.clickOn(sel.aiChoicesInsert, { dispatch: false, magnetic: true });
      await sleep(180);
      removeChoicesModal(doc);
      applyGeneratedChoices(doc);
    },
  },
  {
    id: 'choices-editable-payoff',
    chapter: 'generate-choices',
    camera: {
      focus: [sel.choicesList, sel.choicesField],
      level: 1.0,
      pad: 22,
      noScroll: true,
    },
    narration: 'choices-payoff',
    effect: async ({ doc, sleep, focusPull }) => {
      cleanBuilderForm(doc);
      stageSurveyChoiceField(doc);
      applyGeneratedChoices(doc);
      await sleep(160);
      await focusPull(sel.choicesList, {
        blur: 1.2,
        dim: 0.12,
        holdMs: 520,
        riseMs: 240,
        fallMs: 220,
      });
    },
  },
];
