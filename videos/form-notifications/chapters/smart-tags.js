// CH3 — Smart Tags (audio-cued internal timeline).
// Dropdown is flipped to open upwards via `setup()` so the demo reads left→right.
import { emailWrap, tagIcon, dropdown, firstField, chipHostS, N } from './_selectors.js';

export const snapshot = 'builder-settings-notifications';
export const mode = 'audio-cued';
export const narration = 'smart-tags';

export async function setup({ doc }) {
  const dd = doc.querySelector(`#wpforms-panel-field-${N}-email-wrap .insert-smart-tag-dropdown`);
  if (dd) {
    dd.classList.remove('open-down');
    dd.classList.add('open-up');
    const ddH = dd.getBoundingClientRect().height || 280;
    dd.style.top = `-${ddH + 6}px`;
  }
}

export default [{
  id: 'smart-tags-flow', chapter: 'smart-tags',
  camera:    { focus: [emailWrap], level: 1.5, pad: 40 },
  spotlight: emailWrap,
  overlays: [
    { highlight: emailWrap, label: 'Smart Tags inject field values dynamically' },
    { pointer: tagIcon, direction: 'down', label: 'Click to open', size: 30, gap: 8 },
  ],
  labelDwell: 0, keepLabels: true,
  effect: async ({ cursor, doc, sleep, clearSpot, clearHighlights, waitAt }) => {
    await cursor.park({ x: 1300, y: 500 });
    await waitAt(5.5);
    await cursor.moveTo(tagIcon);
    await waitAt(6.0);
    await cursor.click();
    await clearHighlights({ fadeOut: 200 });
    const dd = doc.querySelector(dropdown);
    if (dd) dd.classList.remove('closed');

    await waitAt(7.6);
    await cursor.moveTo(firstField);
    await cursor.click();

    await waitAt(9.0);
    const chipHost = doc.querySelector(chipHostS);
    if (chipHost) {
      chipHost.innerHTML = '';
      const chip = doc.createElement('span');
      chip.className = 'tag';
      chip.setAttribute('contenteditable', 'false');
      chip.setAttribute('data-value', 'field_id="2"');
      chip.innerHTML = 'Email <i class="fa fa-times-circle" title="Delete smart tag"></i>';
      chip.style.cssText = 'opacity:0;transform:scale(0.7);transition:opacity .3s ease, transform .3s cubic-bezier(0.34,1.56,0.64,1);';
      chipHost.appendChild(chip);
      await sleep(30);
      chip.style.opacity = '1';
      chip.style.transform = 'scale(1)';
    }
    if (dd) dd.classList.add('closed');

    await waitAt(13.8);
    await clearSpot();
    await cursor.hide();
  },
  duration: 0.2,
}];
