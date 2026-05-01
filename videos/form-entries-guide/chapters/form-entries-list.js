// CH — Form Entries List: tour the table + customize columns via gear icon.
import sel from './_selectors.js';

export const snapshot = 'admin-entries-list';
export const validator = { snapshot: 'admin-entries-list' };
export const mode = 'per-beat-narration';
export const breakStyle = 'glide';
export const swapStyle = 'morph';

// Editorial column-picker dropdown — DOM cloned from product truth supplied
// by the user (.wpforms-multiselect-checkbox-list). The base snapshot ships
// the cog and container but the open dropdown panel is captured-but-empty,
// so we mount the real panel structure as a staged visual aid anchored to
// the gear-icon container.
function installListInteractionStyle(doc) {
  if (doc.getElementById('fe-list-style')) return;
  const style = doc.createElement('style');
  style.id = 'fe-list-style';
  style.textContent = `
    .fe-list-cog-popover {
      position: absolute;
      top: 28px; right: 0;
      width: 240px;
      background: #fff;
      border: 1px solid rgba(40,64,92,.16);
      border-radius: 6px;
      box-shadow: 0 18px 36px rgba(24,32,42,.20);
      padding: 10px;
      transform: translateY(-12px);
      opacity: 0;
      transition: opacity 220ms ease, transform 240ms ease;
      pointer-events: none;
      z-index: 99999;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    .fe-list-cog-popover.is-open { opacity: 1; transform: translateY(0); }
    .fe-list-cog-popover input[type="search"] {
      width: 100%;
      padding: 6px 8px;
      border: 1px solid rgba(40,64,92,.16);
      border-radius: 4px;
      font: 500 13px/1.2 Inter, sans-serif;
      margin-bottom: 8px;
      box-sizing: border-box;
    }
    .fe-list-cog-popover .fe-list-cog-group {
      font: 700 11px/1 Inter, sans-serif;
      text-transform: uppercase; letter-spacing: .04em;
      color: #94a0ad;
      padding: 6px 4px 4px;
    }
    .fe-list-cog-popover label {
      display: flex; align-items: center; gap: 8px;
      padding: 5px 4px;
      font: 500 13px/1.2 Inter, sans-serif;
      color: #24364a;
      border-radius: 4px;
      transition: background 140ms ease;
    }
    .fe-list-cog-popover label:hover { background: #f5f8fb; }
    .fe-list-cog-popover input[type="checkbox"] {
      width: 14px; height: 14px; accent-color: #056AAB;
      margin: 0;
    }
    .fe-list-cog-popover .fe-list-cog-save {
      width: 100%;
      margin-top: 8px;
      padding: 7px 10px;
      background: #f4801f;
      color: #fff;
      border: none;
      border-radius: 4px;
      font: 600 13px/1 Inter, sans-serif;
      cursor: pointer;
    }
  `;
  doc.head.appendChild(style);
}

function mountColumnPicker(doc) {
  const anchor = doc.querySelector('#wpforms-list-table-ext-edit-columns-select-container');
  if (!anchor) return null;
  if (doc.querySelector('.fe-list-cog-popover')) return doc.querySelector('.fe-list-cog-popover');
  const cs = anchor.ownerDocument.defaultView.getComputedStyle(anchor);
  if (cs.position === 'static') anchor.style.position = 'relative';
  const pop = doc.createElement('div');
  pop.className = 'fe-list-cog-popover';
  pop.innerHTML = `
    <input type="search" placeholder="Search" aria-label="Search">
    <div class="fe-list-cog-group">Form Fields</div>
    <label><input type="checkbox" checked><span>Name</span></label>
    <label><input type="checkbox" checked><span>Email</span></label>
    <label><input type="checkbox" checked><span>Paragraph Text</span></label>
    <div class="fe-list-cog-group">Entry Meta</div>
    <label><input type="checkbox" checked><span>Date</span></label>
    <label><input type="checkbox"><span>Entry ID</span></label>
    <label><input type="checkbox"><span>Entry Notes</span></label>
    <label><input type="checkbox"><span>Entry Type</span></label>
    <label><input type="checkbox"><span>User IP</span></label>
    <label><input type="checkbox"><span>Geolocation Details</span></label>
    <button type="button" class="fe-list-cog-save">Save Changes</button>
  `;
  anchor.appendChild(pop);
  return pop;
}

export async function setup({ doc }) {
  installListInteractionStyle(doc);
}

export default [
  {
    id: 'list-tour-1',
    chapter: 'list-overview',
    camera: { focus: sel.listForm, level: 1.0, pad: 30 },
    narration: 'list-tour-1',
    effect: async ({ highlight, clearHighlights, sleep }) => {
      await highlight([sel.listForm], { label: 'Every submission for this form, in one table', pad: 10 });
      await sleep(1100);
      await clearHighlights();
    },
    duration: 0.2,
  },
  {
    id: 'list-tour-2',
    chapter: 'list-rows',
    camera: { focus: sel.listBody, level: 1.05, pad: 30 },
    narration: 'list-tour-2',
    effect: async ({ cursor, sleep }) => {
      await cursor.moveTo(`${sel.listBody} tr:nth-child(1)`);
      await sleep(450);
      await cursor.moveTo(`${sel.listBody} tr:nth-child(2)`);
      await sleep(450);
      await cursor.moveTo(`${sel.listBody} tr:nth-child(3)`);
      await sleep(700);
    },
    duration: 0.2,
  },
  {
    id: 'list-tour-3',
    chapter: 'list-columns',
    // Wide frame so the gear icon AND the dropdown popover beneath it are
    // both visible when the popover opens.
    camera: { focus: sel.listForm, level: 1.0, pad: 40 },
    narration: 'list-tour-3',
    effect: async ({ doc, cursor, highlight, clearHighlights, sleep }) => {
      await highlight([sel.listGearContainer], { label: 'Choose which columns appear', pad: 6 });
      await cursor.moveTo(sel.listGearIcon);
      await sleep(420);
      await clearHighlights();
      const pop = mountColumnPicker(doc);
      if (pop) {
        await sleep(80);
        pop.classList.add('is-open');
      }
      await sleep(2400);
      if (pop) pop.classList.remove('is-open');
      await sleep(360);
      if (pop && pop.parentNode) pop.parentNode.removeChild(pop);
    },
    duration: 0.2,
  },
];
