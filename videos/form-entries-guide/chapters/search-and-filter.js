// CH — Search & Filter: real cursor-driven dropdown + flatpickr calendar.
// Uses product-truth DOM cloned from user-supplied HTML, mounted as staged
// visual aids over the captured admin-entries-list snapshot.
import sel from './_selectors.js';

export const snapshot = 'admin-entries-list';
export const validator = { snapshot: 'admin-entries-list' };
export const mode = 'per-beat-narration';
export const breakStyle = 'glide';
export const swapStyle = 'morph';

function installInteractionStyle(doc) {
  if (doc.getElementById('fe-search-style')) return;
  const style = doc.createElement('style');
  style.id = 'fe-search-style';
  style.textContent = `
    /* ── Search-field options popover ───────────────────────── */
    .fe-search-popover {
      position: absolute;
      width: 240px;
      background: #fff;
      border: 1px solid rgba(40,64,92,.16);
      border-radius: 6px;
      box-shadow: 0 18px 36px rgba(24,32,42,.18);
      padding: 6px 0;
      transform: translateY(-8px);
      opacity: 0;
      transition: opacity 220ms ease, transform 240ms ease;
      pointer-events: none;
      z-index: 80;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    .fe-search-popover.is-open { opacity: 1; transform: translateY(0); }
    .fe-search-popover .fe-sp-group {
      font: 700 11px/1 Inter, sans-serif;
      text-transform: uppercase; letter-spacing: .05em;
      color: #94a0ad;
      padding: 8px 14px 4px;
    }
    .fe-search-popover .fe-sp-option {
      display: block;
      padding: 7px 14px;
      font: 500 13px/1.3 Inter, sans-serif;
      color: #24364a;
      transition: background 140ms ease, color 140ms ease;
    }
    .fe-search-popover .fe-sp-option.is-selected,
    .fe-search-popover .fe-sp-option.is-hover {
      background: #eaf4fb; color: #056AAB; font-weight: 600;
    }

    /* ── Flatpickr-shaped calendar popover ─────────────────── */
    .fe-flatpickr {
      position: absolute;
      width: 280px;
      background: #fff;
      border: 1px solid rgba(40,64,92,.14);
      border-radius: 8px;
      box-shadow: 0 18px 36px rgba(24,32,42,.18);
      padding: 12px;
      transform: translateY(-8px);
      opacity: 0;
      transition: opacity 220ms ease, transform 240ms ease;
      pointer-events: none;
      z-index: 80;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    .fe-flatpickr.is-open { opacity: 1; transform: translateY(0); }
    .fe-flatpickr .fe-fp-head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 2px 4px 10px;
    }
    .fe-flatpickr .fe-fp-arrow {
      width: 22px; height: 22px;
      display: grid; place-items: center;
      color: #6b7785;
    }
    .fe-flatpickr .fe-fp-month {
      font: 700 13.5px/1 Inter, sans-serif;
      color: #1f2933;
    }
    .fe-flatpickr .fe-fp-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
    }
    .fe-flatpickr .fe-fp-weekday {
      font: 700 10px/1 Inter, sans-serif;
      color: #94a0ad;
      text-align: center;
      padding: 4px 0 6px;
      text-transform: uppercase; letter-spacing: .06em;
    }
    .fe-flatpickr .fe-fp-day {
      font: 500 12px/1 Inter, sans-serif;
      color: #24364a;
      text-align: center;
      padding: 6px 0;
      border-radius: 5px;
      transition: background 160ms ease, color 160ms ease;
    }
    .fe-flatpickr .fe-fp-day.is-other { color: #c8d0d8; }
    .fe-flatpickr .fe-fp-day.is-today { background: #056AAB; color: #fff; font-weight: 700; }
    .fe-flatpickr .fe-fp-day.is-in-range { background: #eaf4fb; color: #056AAB; }
    .fe-flatpickr .fe-fp-day.is-range-start,
    .fe-flatpickr .fe-fp-day.is-range-end {
      background: #056AAB; color: #fff; font-weight: 700;
    }
  `;
  doc.head.appendChild(style);
}

function mountSearchPopover(doc) {
  const trigger = doc.querySelector('.wpforms-form-search-box-field');
  if (!trigger) return null;
  if (doc.querySelector('.fe-search-popover')) return doc.querySelector('.fe-search-popover');

  const rect = trigger.getBoundingClientRect();
  const top  = rect.bottom + 6;
  const left = rect.left;

  const pop = doc.createElement('div');
  pop.className = 'fe-search-popover';
  pop.style.top  = `${top}px`;
  pop.style.left = `${left}px`;
  pop.innerHTML = `
    <div class="fe-sp-group">Form fields</div>
    <div class="fe-sp-option is-selected">Any form field</div>
    <div class="fe-sp-option">Name</div>
    <div class="fe-sp-option">Email</div>
    <div class="fe-sp-option">Paragraph Text</div>
    <div class="fe-sp-group">Advanced Options</div>
    <div class="fe-sp-option">Entry ID</div>
    <div class="fe-sp-option">Entry Notes</div>
    <div class="fe-sp-option">IP Address</div>
    <div class="fe-sp-option">User Agent</div>
  `;
  doc.body.appendChild(pop);
  return pop;
}

function mountCalendar(doc) {
  const trigger = doc.querySelector('input.wpforms-filter-date-selector + input');
  if (!trigger) return null;
  if (doc.querySelector('.fe-flatpickr')) return doc.querySelector('.fe-flatpickr');

  const rect = trigger.getBoundingClientRect();
  const top  = rect.bottom + 6;
  const left = rect.left;

  const cal = doc.createElement('div');
  cal.className = 'fe-flatpickr';
  cal.style.top  = `${top}px`;
  cal.style.left = `${left}px`;
  const days = [
    { d: 29, cls: 'is-other' }, { d: 30, cls: 'is-other' }, { d: 31, cls: 'is-other' },
    ...Array.from({ length: 30 }, (_, i) => ({ d: i + 1, cls: '' })),
    { d: 1, cls: 'is-other' }, { d: 2, cls: 'is-other' }, { d: 3, cls: 'is-other' },
    { d: 4, cls: 'is-other' }, { d: 5, cls: 'is-other' }, { d: 6, cls: 'is-other' },
    { d: 7, cls: 'is-other' }, { d: 8, cls: 'is-other' }, { d: 9, cls: 'is-other' },
  ];
  cal.innerHTML = `
    <div class="fe-fp-head">
      <span class="fe-fp-arrow">‹</span>
      <span class="fe-fp-month">April 2026</span>
      <span class="fe-fp-arrow">›</span>
    </div>
    <div class="fe-fp-grid">
      ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => `<span class="fe-fp-weekday">${d}</span>`).join('')}
      ${days.map(c => {
        const today = c.cls === '' && c.d === 30 ? ' is-today' : '';
        const inRange = c.cls === '' && c.d >= 14 && c.d <= 28 ? ' is-in-range' : '';
        const startEnd = c.cls === '' && (c.d === 14 ? ' is-range-start' : c.d === 28 ? ' is-range-end' : '');
        return `<span class="fe-fp-day ${c.cls}${today}${inRange}${startEnd}">${c.d}</span>`;
      }).join('')}
    </div>
  `;
  doc.body.appendChild(cal);
  return cal;
}

export async function setup({ doc }) {
  installInteractionStyle(doc);
}

export default [
  {
    id: 'search-filter-1',
    chapter: 'search',
    // Frame the toolbar wide so the dropdown popover beneath the trigger is visible.
    camera: { focus: sel.listForm, level: 1.0, pad: 40 },
    narration: 'search-filter-1',
    effect: async ({ doc, cursor, highlight, clearHighlights, sleep }) => {
      await cursor.moveTo(sel.listSearchFieldDrop);
      await sleep(360);
      const pop = mountSearchPopover(doc);
      if (pop) {
        await sleep(80);
        pop.classList.add('is-open');
      }
      await sleep(500);
      // Cursor flicks down through the field options.
      const opts = doc.querySelectorAll('.fe-search-popover .fe-sp-option');
      const order = [1, 2, 4, 5];
      for (const idx of order) {
        opts.forEach(o => o.classList.remove('is-hover'));
        if (opts[idx]) opts[idx].classList.add('is-hover');
        await sleep(280);
      }
      opts.forEach(o => o.classList.remove('is-hover'));
      await sleep(380);
      if (pop) pop.classList.remove('is-open');
      await sleep(280);
      if (pop && pop.parentNode) pop.parentNode.removeChild(pop);

      // Then type into the search input to show keyword search.
      await highlight([sel.listSearchInput], { label: 'Or type a keyword to search across fields', pad: 6 });
      await cursor.moveTo(sel.listSearchInput);
      await sleep(220);
      await clearHighlights();
    },
    duration: 0.2,
  },
  {
    id: 'search-filter-2',
    chapter: 'date-filter',
    camera: { focus: sel.listForm, level: 1.0, pad: 40 },
    narration: 'search-filter-2',
    effect: async ({ doc, cursor, sleep }) => {
      await cursor.moveTo(sel.listDateFilter);
      await sleep(380);
      const cal = mountCalendar(doc);
      if (cal) {
        await sleep(80);
        cal.classList.add('is-open');
      }
      await sleep(2200);
      if (cal) cal.classList.remove('is-open');
      await sleep(320);
      if (cal && cal.parentNode) cal.parentNode.removeChild(cal);
    },
    duration: 0.2,
  },
];
