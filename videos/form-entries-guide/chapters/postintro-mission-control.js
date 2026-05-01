// PostIntro — "Form Entries is mission control for your form responses".
// Real WPForms UI throughout: counts tick up on admin-forms-overview with
// type-SFX accelerating, dives via snapshot swap, then enters cursor-follow
// close-up framing across the entries-list UI.

export const snapshot = 'admin-forms-overview';
export const validator = { snapshot: 'admin-forms-overview' };
export const mode = 'per-beat-narration';
export const breakStyle = 'glide';
export const swapStyle = 'morph';

// ── SFX (plain <audio> per the reference video pattern) ────────────────
const sfxCache = {};
function playSfx(name, { volume = 0.55, rate = 1 } = {}) {
  try {
    if (!sfxCache[name]) sfxCache[name] = new Audio(`/assets/sfx/${name}.mp3`);
    const c = sfxCache[name].cloneNode();
    c.volume = volume;
    c.playbackRate = rate;
    try { c.preservesPitch = false; } catch (_) {}
    c.play().catch(() => {});
  } catch (_) {}
}

function applyBlackMacCursor(cursorEl) {
  if (!cursorEl) return;
  cursorEl.setAttribute('viewBox', '0 0 24 24');
  cursorEl.innerHTML = `
    <path d="M5.5 3.2 V20.8 c0 .45 .54 .67 .85 .35 l4.5-4.5 a.5 .5 0 0 1 .35-.15 h6.4
             a.5 .5 0 0 0 .35-.85 L6.35 2.85 a.5 .5 0 0 0-.85 .36 Z"
          fill="#111" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/>
  `;
}

function mountClickBurst(x, y) {
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

function mountPayoffTitle() {
  const layer = document.createElement('div');
  layer.id = 'fe-pi-payoff-title';
  layer.style.cssText = `
    position: fixed;
    left: var(--frame-side);
    right: var(--frame-side);
    top: calc(var(--frame-top) + var(--frame-chrome-h));
    bottom: var(--frame-bottom);
    z-index: 760;
    pointer-events: none;
    display: grid;
    place-items: center;
    opacity: 0;
    transition: opacity 420ms ease;
    background: rgba(255,250,244,.08);
    backdrop-filter: blur(10px) saturate(.86) brightness(1.04);
  `;
  layer.innerHTML = `
    <div style="text-align:center; transform: translateY(10px);">
      <div style="
        display:flex; align-items:center; justify-content:center; gap:14px;
        color:#c46b33; font:700 13px/1 Inter, system-ui, sans-serif;
        letter-spacing:.42em; text-transform:uppercase; margin-bottom:22px;">
        <span style="display:inline-block;width:36px;height:1px;background:#d18455;"></span>
        <span>Form Entries</span>
        <span style="display:inline-block;width:36px;height:1px;background:#d18455;"></span>
      </div>
      <div style="
        color:#191614;
        font:500 48px/1.08 Georgia, 'Times New Roman', serif;
        letter-spacing:0;
        text-shadow:0 1px 0 rgba(255,255,255,.55);">
        Everything submitted, in one screen.
      </div>
    </div>
  `;
  document.body.appendChild(layer);
  void layer.offsetWidth;
  layer.style.opacity = '1';
  return layer;
}

async function dropPayoffTitle(layer, sleep) {
  if (!layer) return;
  layer.style.opacity = '0';
  await sleep(420);
  layer.remove();
}

// ── Style installation (idempotent per doc) ────────────────────────────
function installFormsOverviewFx(doc) {
  if (doc.getElementById('fe-pi-fo-style')) return;
  const style = doc.createElement('style');
  style.id = 'fe-pi-fo-style';
  style.textContent = `
    td.column-entries a {
      display: inline-block;
      transition: transform 180ms ease, color 200ms ease;
      transform-origin: center;
    }
    td.column-entries a.fe-pi-bump {
      animation: fe-pi-bump 320ms cubic-bezier(.2,.8,.2,1);
    }
    @keyframes fe-pi-bump {
      0%   { transform: scale(1);    color: #2271b1; }
      40%  { transform: scale(1.55); color: #f4801f; text-shadow: 0 4px 14px rgba(244,128,31,.35); }
      100% { transform: scale(1);    color: #2271b1; text-shadow: none; }
    }
    tr.fe-pi-row-pulse {
      animation: fe-pi-row-pulse 460ms ease;
    }
    @keyframes fe-pi-row-pulse {
      0%   { background: transparent; }
      50%  { background: rgba(5,106,171,.10); }
      100% { background: transparent; }
    }
  `;
  doc.head.appendChild(style);
}

function installEntriesListFx(doc) {
  if (doc.getElementById('fe-pi-el-style')) return;
  const style = doc.createElement('style');
  style.id = 'fe-pi-el-style';
  style.textContent = `
    th#actions {
      position: relative;
      transition: transform 280ms cubic-bezier(.2,.8,.2,1), color 240ms ease;
      transform-origin: center;
    }
    th#actions.fe-pi-popout {
      transform: translateY(-2px) scale(1.06);
      color: #056AAB;
    }
    th#actions.fe-pi-popout::after {
      content: '';
      position: absolute;
      left: 50%; top: 50%;
      transform: translate(-50%, -50%) scale(.4);
      width: 130%; height: 360%;
      border-radius: 14px;
      background: rgba(5,106,171,.22);
      animation: fe-pi-actions-ripple 900ms ease-out forwards;
      pointer-events: none;
      z-index: 0;
    }
    @keyframes fe-pi-actions-ripple {
      0%   { transform: translate(-50%, -50%) scale(.35); opacity: .85; }
      85%  { transform: translate(-50%, -50%) scale(2.6);  opacity: 0; }
      100% { transform: translate(-50%, -50%) scale(2.6);  opacity: 0; }
    }

    /* Per-row ripple on td.column-actions (cascades top → bottom) */
    td.column-actions {
      position: relative;
      transition: color 220ms ease;
    }
    td.column-actions.fe-pi-row-pop {
      animation: fe-pi-row-pop 700ms cubic-bezier(.2,.8,.2,1);
      color: #056AAB;
    }
    td.column-actions.fe-pi-row-pop::after {
      content: '';
      position: absolute;
      left: 0; right: 0; top: 0; bottom: 0;
      border-radius: 6px;
      background: rgba(5,106,171,.22);
      animation: fe-pi-row-ripple 700ms ease-out forwards;
      pointer-events: none;
      z-index: 0;
    }
    @keyframes fe-pi-row-pop {
      0%, 100% { transform: translateX(0); }
      35%      { transform: translateX(-3px); }
    }
    @keyframes fe-pi-row-ripple {
      0%   { opacity: .55; transform: scale(.92); }
      100% { opacity: 0;   transform: scale(1.10); }
    }

    .fe-pi-popout-on td.column-actions a { color: #056AAB; }

    .fe-pi-search-popover {
      position: absolute;
      width: 240px;
      background: #fff;
      border: 1px solid rgba(40,64,92,.16);
      border-radius: 6px;
      box-shadow: 0 18px 36px rgba(24,32,42,.20);
      padding: 6px 0;
      transform: translateY(-8px);
      opacity: 0;
      transition: opacity 220ms ease, transform 240ms ease;
      pointer-events: none;
      z-index: 99999;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    .fe-pi-search-popover.is-open { opacity: 1; transform: translateY(0); }
    .fe-pi-search-popover .fe-sp-group {
      font: 700 11px/1 Inter, sans-serif;
      text-transform: uppercase; letter-spacing: .05em;
      color: #94a0ad;
      padding: 8px 14px 4px;
    }
    .fe-pi-search-popover .fe-sp-option {
      display: block;
      padding: 7px 14px;
      font: 500 13px/1.3 Inter, sans-serif;
      color: #24364a;
      transition: background 140ms ease, color 140ms ease;
    }
    .fe-pi-search-popover .fe-sp-option.is-selected {
      background: #eaf4fb; color: #056AAB; font-weight: 600;
    }
    .fe-pi-search-popover .fe-sp-option.is-hover {
      background: #f5f8fb; color: #1f2933;
    }

    .fe-pi-flatpickr {
      position: absolute;
      width: 280px;
      background: #fff;
      border: 1px solid rgba(40,64,92,.14);
      border-radius: 8px;
      box-shadow: 0 18px 36px rgba(24,32,42,.20);
      padding: 12px;
      transform: translateY(-8px);
      opacity: 0;
      transition: opacity 220ms ease, transform 240ms ease;
      pointer-events: none;
      z-index: 99999;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    .fe-pi-flatpickr.is-open { opacity: 1; transform: translateY(0); }
    .fe-pi-flatpickr .fe-fp-head { display: flex; align-items: center; justify-content: space-between; padding: 2px 4px 10px; }
    .fe-pi-flatpickr .fe-fp-arrow { width: 22px; height: 22px; display: grid; place-items: center; color: #6b7785; }
    .fe-pi-flatpickr .fe-fp-month { font: 700 13.5px/1 Inter, sans-serif; color: #1f2933; }
    .fe-pi-flatpickr .fe-fp-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
    .fe-pi-flatpickr .fe-fp-weekday { font: 700 10px/1 Inter, sans-serif; color: #94a0ad; text-align: center; padding: 4px 0 6px; text-transform: uppercase; letter-spacing: .06em; }
    .fe-pi-flatpickr .fe-fp-day { font: 500 12px/1 Inter, sans-serif; color: #24364a; text-align: center; padding: 6px 0; border-radius: 5px; }
    .fe-pi-flatpickr .fe-fp-day.is-other { color: #c8d0d8; }
    .fe-pi-flatpickr .fe-fp-day.is-today { background: #056AAB; color: #fff; font-weight: 700; }
    .fe-pi-flatpickr .fe-fp-day.is-in-range { background: #eaf4fb; color: #056AAB; }
    .fe-pi-flatpickr .fe-fp-day.is-range-start,
    .fe-pi-flatpickr .fe-fp-day.is-range-end {
      background: #056AAB; color: #fff; font-weight: 700;
    }
  `;
  doc.head.appendChild(style);
}

function bumpEntryCount(doc, formId, value) {
  const cell = doc.querySelector(`tr input[value="${formId}"]`)?.closest('tr')?.querySelector('td.column-entries a');
  if (!cell) return;
  cell.textContent = String(value);
  cell.classList.remove('fe-pi-bump');
  void cell.offsetWidth;
  cell.classList.add('fe-pi-bump');
  const row = cell.closest('tr');
  if (row) {
    row.classList.remove('fe-pi-row-pulse');
    void row.offsetWidth;
    row.classList.add('fe-pi-row-pulse');
  }
}

function mountSearchPopover(doc) {
  if (doc.querySelector('.fe-pi-search-popover')) return doc.querySelector('.fe-pi-search-popover');
  const trigger = doc.querySelector('.wpforms-form-search-box-field');
  if (!trigger) return null;
  const rect = trigger.getBoundingClientRect();
  const top  = (rect.bottom + (doc.defaultView.scrollY || 0)) + 6;
  const left = (rect.left + (doc.defaultView.scrollX || 0));
  const pop = doc.createElement('div');
  pop.className = 'fe-pi-search-popover';
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
  pop.id = 'fe-pi-search-pop';
  return pop;
}

function mountCalendar(doc) {
  if (doc.querySelector('.fe-pi-flatpickr')) return doc.querySelector('.fe-pi-flatpickr');
  const trigger = doc.querySelector('.regular-text.wpforms-filter-date-selector.form-control.input');
  if (!trigger) return null;
  const rect = trigger.getBoundingClientRect();
  const top  = (rect.bottom + (doc.defaultView.scrollY || 0)) + 6;
  const left = (rect.left + (doc.defaultView.scrollX || 0));
  const cal = doc.createElement('div');
  cal.className = 'fe-pi-flatpickr';
  cal.id = 'fe-pi-cal';
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
  installFormsOverviewFx(doc);
}

export default [
  {
    id: 'postintro-mission-control',
    chapter: 'postintro',
    camera: { focus: 'body', level: 1, pad: 0, noScroll: true },
    narration: 'postintro-mission-control',
    effect: async ({ doc, cursor, sleep, swapToSnapshot, zoomTo }) => {
      const openingCursor = document.querySelector('.cursor');
      if (openingCursor) {
        applyBlackMacCursor(openingCursor);
        openingCursor.style.transition = 'none';
        openingCursor.style.left = `${window.innerWidth / 2 - 6.4}px`;
        openingCursor.style.top = `${window.innerHeight / 2 - 3.7}px`;
        openingCursor.classList.add('on');
      }

      const clickCursor = async (cursorEl) => {
        if (!cursorEl) return;
        const r = cursorEl.getBoundingClientRect();
        mountClickBurst(r.left + 6.4, r.top + 3.7);
        cursorEl.classList.add('click');
        cursorEl.style.transform = 'scale(.72)';
        playSfx('click', { volume: 0.45 });
        await sleep(140);
        cursorEl.classList.remove('click');
        cursorEl.style.transform = '';
        await sleep(260);
      };

      // Cubic-bezier(0.25, 0.1, 0.25, 1) — CSS "ease". Closed-form approx
      // good enough for animation timing.
      const easeCSS = (t) => {
        const cx = 3 * 0.25, bx = 3 * (0.25 - 0.25) - cx, ax = 1 - cx - bx;
        const cy = 3 * 0.1,  by = 3 * (1 - 0.1) - cy,    ay = 1 - cy - by;
        let u = t;
        for (let i = 0; i < 6; i++) {
          const x = ((ax * u + bx) * u + cx) * u - t;
          const dx = (3 * ax * u + 2 * bx) * u + cx;
          if (Math.abs(dx) < 1e-6) break;
          u -= x / dx;
        }
        return ((ay * u + by) * u + cy) * u;
      };

      const mountIframeWipe = () => {
        const wipe = document.createElement('div');
        wipe.style.cssText = `
          position: fixed;
          left: var(--frame-side);
          right: var(--frame-side);
          top: calc(var(--frame-top) + var(--frame-chrome-h));
          bottom: var(--frame-bottom);
          z-index: 850;
          pointer-events: none;
          background: rgba(255,255,255,.92);
          opacity: 0;
          backdrop-filter: blur(0px);
          transition: opacity 220ms ease, backdrop-filter 220ms ease;
        `;
        document.body.appendChild(wipe);
        void wipe.offsetWidth;
        wipe.style.opacity = '1';
        wipe.style.backdropFilter = 'blur(12px)';
        return wipe;
      };

      const dropIframeWipe = async (wipe) => {
        if (!wipe) return;
        wipe.style.transition = 'opacity 360ms ease, backdrop-filter 360ms ease';
        wipe.style.opacity = '0';
        wipe.style.backdropFilter = 'blur(0px)';
        await sleep(380);
        wipe.remove();
      };

      const zoomIntoTarget = async (selector, {
        level = 6.8,
        duration = 920,
        transitionLevel = 4.3,
        onTransition,
      } = {}) => {
        const iframe = document.querySelector('iframe.ui');
        const cursorEl = document.querySelector('.cursor');
        const target = doc.querySelector(selector);
        if (!iframe || !target) return;
        const iframeW = iframe.offsetWidth || 1440;
        const iframeH = iframe.offsetHeight || 900;
        const stageW = window.innerWidth;
        const stageH = window.innerHeight;
        const originX = (stageW - iframeW) / 2;
        const originY = (stageH - iframeH) / 2;
        const r = target.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const cxC = Math.min(Math.max(cx, iframeW / (2 * level)), iframeW - iframeW / (2 * level));
        const cyC = Math.min(Math.max(cy, iframeH / (2 * level)), iframeH - iframeH / (2 * level));
        const toTx = (stageW / 2) - originX - cxC * level;
        const toTy = (stageH / 2) - originY - cyC * level;
        iframe.style.transformOrigin = '0 0';
        iframe.style.transition = 'none';
        if (cursorEl) cursorEl.style.transition = 'none';

        const fromLevel = 1;
        const fromTx = 0;
        const fromTy = 0;
        const start = performance.now();
        let transitionStarted = false;
        let transitionWipe = null;
        await new Promise((resolve) => {
          const tick = () => {
            const t = Math.min(1, (performance.now() - start) / Math.max(duration, 1));
            const e = easeCSS(t);
            const L = fromLevel + (level - fromLevel) * e;
            const tx = fromTx + (toTx - fromTx) * e;
            const ty = fromTy + (toTy - fromTy) * e;
            iframe.style.transform = `scale(${L}) translate(${tx / L}px, ${ty / L}px)`;
            if (cursorEl) {
              const sx = originX + cx * L + tx;
              const sy = originY + cy * L + ty;
              cursorEl.style.left = `${sx - 6.4}px`;
              cursorEl.style.top = `${sy - 3.7}px`;
            }
            if (!transitionStarted && onTransition && L >= transitionLevel) {
              transitionStarted = true;
              transitionWipe = mountIframeWipe();
            }
            if (t < 1) requestAnimationFrame(tick);
            else resolve();
          };
          requestAnimationFrame(tick);
        });
        if (transitionWipe && onTransition) await onTransition(transitionWipe);
        await sleep(60);
      };

      const contentOnlySwap = async (slug, { setup, fade = true, reveal = true } = {}) => {
        const iframe = document.querySelector('iframe.ui');
        if (!iframe) return null;
        const oldDoc = iframe.contentDocument;
        if (fade && oldDoc?.documentElement) {
          oldDoc.documentElement.style.transition = 'opacity 220ms ease';
          oldDoc.documentElement.style.opacity = '0';
          await sleep(230);
        }
        const loaded = new Promise((resolve) => {
          iframe.addEventListener('load', resolve, { once: true });
        });
        iframe.src = `/snapshots/${slug}/index.html`;
        await loaded;
        const nextDoc = iframe.contentDocument;
        if (nextDoc?.documentElement) {
          nextDoc.documentElement.style.transition = 'none';
          nextDoc.documentElement.style.opacity = '0';
          void nextDoc.documentElement.offsetWidth;
        }
        if (setup) await setup(nextDoc);
        if (reveal && nextDoc?.documentElement) {
          nextDoc.documentElement.style.transition = 'opacity 300ms ease';
          nextDoc.documentElement.style.opacity = '1';
        }
        if (reveal) await sleep(320);
        return nextDoc;
      };

      const showEntriesPayoff = async () => {
        await contentOnlySwap('admin-entries-overview', { fade: true, reveal: true });
        const iframe = document.querySelector('iframe.ui');
        if (iframe) {
          iframe.style.transition = 'none';
          iframe.style.transformOrigin = '0 0';
          iframe.style.transform = 'scale(1) translate(0px, 0px)';
          iframe.style.opacity = '1';
          void iframe.offsetWidth;
        }
        const titleLayer = mountPayoffTitle();
        playSfx('pop-ui', { volume: 0.35, rate: 0.9 });
        await sleep(2200);
        await dropPayoffTitle(titleLayer, sleep);
      };

      // Forms picked from real captured DOM by deterministic form_id.
      const formIds = Array.from(doc.querySelectorAll('tr input[name="form_id[]"]'))
        .map((el) => el.value)
        .slice(0, 6);

      // ── PHASE 1: Calm establish (~1.3s) ─────────────────────
      await sleep(1300);

      // ── PHASE 2: Counts tick up — slow → fast → very fast ───
      // 28 increments across 6 forms, gap shrinks from 340ms → 65ms.
      // SFX rate accelerates with the gap so the audio pace matches.
      const sequence = [
        // slow build (5 ticks @ ~310ms)
        { i: 0, n:   3, gap: 320 },
        { i: 2, n:   2, gap: 300 },
        { i: 1, n:   6, gap: 280 },
        { i: 3, n:   4, gap: 260 },
        { i: 0, n:   9, gap: 240 },
        // mid build (8 ticks @ ~200ms)
        { i: 4, n:   7, gap: 220 },
        { i: 2, n:  11, gap: 200 },
        { i: 1, n:  14, gap: 180 },
        { i: 5, n:   9, gap: 165 },
        { i: 3, n:  13, gap: 150 },
        { i: 0, n:  19, gap: 135 },
        { i: 4, n:  16, gap: 125 },
        { i: 2, n:  21, gap: 115 },
        // fast build (8 ticks @ ~100ms)
        { i: 1, n:  28, gap: 105 },
        { i: 5, n:  19, gap:  98 },
        { i: 3, n:  26, gap:  92 },
        { i: 0, n:  34, gap:  86 },
        { i: 4, n:  31, gap:  82 },
        { i: 2, n:  39, gap:  78 },
        { i: 1, n:  47, gap:  74 },
        { i: 5, n:  35, gap:  72 },
        // surge (7 ticks @ ~65ms — rapid finish)
        { i: 3, n:  78, gap:  70 },
        { i: 0, n: 105, gap:  68 },
        { i: 4, n: 132, gap:  66 },
        { i: 2, n: 168, gap:  64 },
        { i: 1, n: 205, gap:  62 },
        { i: 5, n: 248, gap:  60 },
        { i: 3, n: 300, gap:  58 },
      ];
      let busiestIdx = 0;
      let busiestN = 0;
      const finals = formIds.map(() => 0);
      let tickIndex = 0;
      for (const step of sequence) {
        if (!formIds[step.i]) continue;
        tickIndex += 1;
        finals[step.i] = step.n;
        if (step.n > busiestN) { busiestN = step.n; busiestIdx = step.i; }
        bumpEntryCount(doc, formIds[step.i], step.n);
        // Make the acceleration unmistakable: every tick is faster than the
        // previous one, with an extra push as values climb toward 300.
        const fastness = Math.min(1, Math.max(0, (320 - step.gap) / 260));
        const countRush = Math.min(1, step.n / 300);
        const tickRush = tickIndex / sequence.length;
        const rate = 0.85 + tickRush * 1.25 + countRush * 0.45 + fastness * 0.20;
        const volume = 0.58 - fastness * 0.08;
        playSfx('type', { volume, rate });
        await sleep(step.gap);
      }
      await sleep(280);

      // ── PHASE 3: Cursor → busiest form's entry count → DIVE ─
      const chosenId = formIds[busiestIdx];
      const chosenSel = `#the-list tr input[value="${chosenId}"] ~ * a`;
      // Mark the chosen row's entries link with a stable id so we have a
      // string selector to hand to cursor.moveTo (which only accepts strings).
      const chosenLink = doc.querySelector(`tr input[value="${chosenId}"]`)?.closest('tr')?.querySelector('td.column-entries a');
      if (chosenLink) {
        chosenLink.id = 'fe-pi-chosen-link';
        if (openingCursor) {
          openingCursor.style.transition =
            'left 760ms cubic-bezier(0.25,0.1,0.25,1), ' +
            'top 760ms cubic-bezier(0.25,0.1,0.25,1), ' +
            'opacity 0.25s ease, transform 0.12s ease';
        }
        try { await cursor.moveTo('#fe-pi-chosen-link', { wait: 780 }); } catch (_) {}
        await clickCursor(openingCursor);
        await zoomIntoTarget('#fe-pi-chosen-link', {
          onTransition: async (wipe) => {
            await contentOnlySwap('admin-entries-list', {
              fade: false,
              reveal: false,
              setup: async (elDoc0) => {
                if (elDoc0) installEntriesListFx(elDoc0);
              },
            });
            const iframe = document.querySelector('iframe.ui');
            if (iframe) {
              iframe.style.transition = 'none';
              iframe.style.transformOrigin = '0 0';
              iframe.style.transform = 'scale(1) translate(0px, 0px)';
              iframe.style.opacity = '1';
              void iframe.offsetWidth;
            }
            const nextDoc = document.querySelector('iframe.ui')?.contentDocument;
            if (nextDoc?.documentElement) {
              nextDoc.documentElement.style.transition = 'none';
              nextDoc.documentElement.style.opacity = '1';
            }
            await sleep(120);
            await dropIframeWipe(wipe);
          },
        });
      }

      const elDoc = document.querySelector('iframe.ui')?.contentDocument;
      if (!elDoc) return;

      // ── Video-local follow-cam ─────────────────────────────
      // Engine zoomTo has an internal pre-mutation sleep that desyncs cursor
      // and camera. For this chapter we drive iframe.transform and the cursor
      // element directly so the camera glides to a target while the cursor
      // is positioned with the FRESHLY-applied transform. Cursor and camera
      // share the same duration + easing, so they arrive together with the
      // cursor exactly on its target.
      const iframeEl = document.querySelector('iframe.ui');
      const cursorEl = document.querySelector('.cursor');
      if (!iframeEl || !cursorEl) return;
      applyBlackMacCursor(cursorEl);

      // `swapStyle: morph` may re-apply the outgoing camera with a fallback
      // `center top` transform origin. This follow-cam maps iframe-local
      // coordinates from the top-left, so normalize the incoming iframe before
      // any cursor math runs. Otherwise each zoom level adds a large invisible
      // x-offset and the cursor drifts far to the right of the WPForms UI.
      iframeEl.style.transition = 'none';
      iframeEl.style.transformOrigin = '0 0';
      iframeEl.style.transform = 'scale(1) translate(0px, 0px)';

      const stageW = window.innerWidth;
      const stageH = window.innerHeight;
      const iframeW = iframeEl.offsetWidth || 1440;
      const iframeH = iframeEl.offsetHeight || 900;
      const iframeOriginX = (stageW - iframeW) / 2;
      const iframeOriginY = (stageH - iframeH) / 2;

      // Track the post-glide camera state ourselves so positioning math is
      // always against the values just applied.
      const cam = { level: 1, tx: 0, ty: 0 };
      const cursorPoint = { ix: null, iy: null };

      const followLevel = 2.1;
      const followPad   = 50;
      const followDur   = 540;
      const followEase  = 'cubic-bezier(.25, .1, .25, 1)';

      // Cursor transition is re-set inside followTo to match each beat's
      // duration exactly (otherwise reframes with shorter durations show
      // the cursor arriving 80ms after the camera).
      const setCursorGlide = (dur, easing) => {
        if (!cursorEl) return;
        cursorEl.style.transition =
          `left ${dur}ms ${easing}, ` +
          `top  ${dur}ms ${easing}, ` +
          `opacity 0.25s ease, transform 0.12s ease`;
      };
      setCursorGlide(followDur, followEase);

      const rectsOf = (sels) => {
        const arr = Array.isArray(sels) ? sels : [sels];
        const out = [];
        for (const s of arr) {
          const nodes = elDoc.querySelectorAll(s);
          for (const n of nodes) out.push(n.getBoundingClientRect());
        }
        return out;
      };

      const computeFraming = (sels, { level, pad }) => {
        const rs = rectsOf(sels);
        if (!rs.length) return null;
        const L = Math.min(...rs.map(r => r.left));
        const T = Math.min(...rs.map(r => r.top));
        const R = Math.max(...rs.map(r => r.left + r.width));
        const B = Math.max(...rs.map(r => r.top + r.height));
        // Pad may be a number (uniform) or an object { top, bottom, left, right }
        // for asymmetric padding — useful when a popover/calendar mounts below
        // a trigger and we want the framing centered to include both without
        // a separate reframe.
        const p = (typeof pad === 'object' && pad)
          ? { t: pad.top ?? 0, b: pad.bottom ?? 0, l: pad.left ?? 0, r: pad.right ?? 0 }
          : { t: pad, b: pad, l: pad, r: pad };
        const r = {
          left: L - p.l,
          top: T - p.t,
          width: (R - L) + p.l + p.r,
          height: (B - T) + p.t + p.b,
        };
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        // Clamp so we don't reveal area outside the iframe viewport.
        const cxC = Math.min(Math.max(cx, iframeW / (2 * level)), iframeW - iframeW / (2 * level));
        const cyC = Math.min(Math.max(cy, iframeH / (2 * level)), iframeH - iframeH / (2 * level));
        const tx = (stageW / 2) - iframeOriginX - cxC * level;
        const ty = (stageH / 2) - iframeOriginY - cyC * level;
        return { tx, ty, level };
      };

      // Resolve cursor target's iframe-content (ix, iy). Pure function — no
      // dependence on camera state. The same iframe-content point at every
      // zoom level so cursor stays glued to the target during animation.
      const cursorIframePoint = (selector, opts = {}) => {
        const el = elDoc.querySelector(selector);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        if (opts.align === 'text-left') {
          // Anchor at a fraction of element width so the offset scales
          // identically to the element under any zoom — no drift.
          return { ix: r.left + r.width * 0.15, iy: r.top + r.height / 2 };
        }
        return { ix: r.left + r.width / 2, iy: r.top + r.height / 2 };
      };

      const currentCursorIframePoint = () => {
        const r = cursorEl.getBoundingClientRect();
        const sx = r.left + 6.4;
        const sy = r.top + 3.7;
        return {
          ix: (sx - iframeOriginX - cam.tx) / cam.level,
          iy: (sy - iframeOriginY - cam.ty) / cam.level,
        };
      };

      const currentCursorScreenPoint = () => {
        const r = cursorEl.getBoundingClientRect();
        return { sx: r.left + 6.4, sy: r.top + 3.7 };
      };

      const setCursorScreenPoint = (sx, sy) => {
        cursorEl.style.left = (sx - 6.4) + 'px';
        cursorEl.style.top  = (sy - 3.7) + 'px';
        cursorEl.classList.add('on');
      };

      // Drive iframe transform frame by frame, while the cursor follows one
      // continuous screen-space glide. Interpolating iframe coordinates while
      // zoom also changes can make the pointer feel jittery, because the same
      // local delta is magnified differently every frame.
      const animateCam = (toLevel, toTx, toTy, dur, cursorIfX, cursorIfY) => new Promise((resolve) => {
        // Snap CSS transitions off — we drive frames manually.
        iframeEl.style.transition = 'none';
        cursorEl.style.transition = 'none';
        const fromLevel = cam.level, fromTx = cam.tx, fromTy = cam.ty;
        const fromCursorScreen = currentCursorScreenPoint();
        const toCursorScreen = cursorIfX == null ? null : {
          sx: iframeOriginX + cursorIfX * toLevel + toTx,
          sy: iframeOriginY + cursorIfY * toLevel + toTy,
        };
        const start = performance.now();
        const tick = () => {
          const elapsed = performance.now() - start;
          const t = Math.min(1, elapsed / Math.max(dur, 1));
          const e = easeCSS(t);
          const L  = fromLevel + (toLevel - fromLevel) * e;
          const tx = fromTx    + (toTx    - fromTx)    * e;
          const ty = fromTy    + (toTy    - fromTy)    * e;
          cam.level = L; cam.tx = tx; cam.ty = ty;
          iframeEl.style.transform = `scale(${L}) translate(${tx / L}px, ${ty / L}px)`;
          if (toCursorScreen) {
            const sx = fromCursorScreen.sx + (toCursorScreen.sx - fromCursorScreen.sx) * e;
            const sy = fromCursorScreen.sy + (toCursorScreen.sy - fromCursorScreen.sy) * e;
            setCursorScreenPoint(sx, sy);
          }
          if (t < 1) requestAnimationFrame(tick);
          else {
            if (cursorIfX != null) {
              cursorPoint.ix = cursorIfX;
              cursorPoint.iy = cursorIfY;
              setCursorScreenPoint(toCursorScreen.sx, toCursorScreen.sy);
            }
            resolve();
          }
        };
        requestAnimationFrame(tick);
      });

      const placeCursorAt = (cursorIfX, cursorIfY) => {
        cursorPoint.ix = cursorIfX;
        cursorPoint.iy = cursorIfY;
        const sx = iframeOriginX + cursorPoint.ix * cam.level + cam.tx;
        const sy = iframeOriginY + cursorPoint.iy * cam.level + cam.ty;
        cursorEl.style.transition = 'none';
        cursorEl.style.left = (sx - 6.4) + 'px';
        cursorEl.style.top  = (sy - 3.7) + 'px';
        cursorEl.classList.add('on');
      };

      const glideCursorTo = (cursorIfX, cursorIfY, dur = 180) => new Promise((resolve) => {
        const fromCursorScreen = currentCursorScreenPoint();
        const toCursorScreen = {
          sx: iframeOriginX + cursorIfX * cam.level + cam.tx,
          sy: iframeOriginY + cursorIfY * cam.level + cam.ty,
        };
        const start = performance.now();
        cursorEl.style.transition = 'none';
        const tick = () => {
          const t = Math.min(1, (performance.now() - start) / Math.max(dur, 1));
          const e = easeCSS(t);
          const sx = fromCursorScreen.sx + (toCursorScreen.sx - fromCursorScreen.sx) * e;
          const sy = fromCursorScreen.sy + (toCursorScreen.sy - fromCursorScreen.sy) * e;
          setCursorScreenPoint(sx, sy);
          if (t < 1) requestAnimationFrame(tick);
          else {
            cursorPoint.ix = cursorIfX;
            cursorPoint.iy = cursorIfY;
            setCursorScreenPoint(toCursorScreen.sx, toCursorScreen.sy);
            resolve();
          }
        };
        requestAnimationFrame(tick);
      });

      // followTo: frame `frameSels`, cursor on `cursorOn` (or first frameSel).
      // Drives camera + cursor in a JS rAF loop — no CSS-transition drift.
      const followTo = async (frameSels, opts = {}) => {
        const dur = opts.duration ?? followDur;
        const level = opts.level ?? followLevel;
        const pad = opts.pad ?? followPad;
        const f = computeFraming(frameSels, { level, pad });
        if (!f) return;
        const cursorSel = opts.cursorOn ?? (Array.isArray(frameSels) ? frameSels[0] : frameSels);
        const cIp = cursorIframePoint(cursorSel, { align: opts.cursorAlign });
        await animateCam(f.level, f.tx, f.ty, dur, cIp?.ix, cIp?.iy);
        await sleep(40);
      };

      // ── PHASE 4: Cursor → Actions header, frame the whole column ─
      // Skipped the first-rows establishing zoom — go straight to the
      // Actions framing. Frame includes header + every row's actions cell
      // so the cascade ripple is visible. Cursor lands on the visible
      // "Actions" text (left-aligned in the th), not the th's geometric
      // center which sits in empty padding ~80 px to the right of the text.
      await followTo(['#actions', '#the-list tr td.column-actions'], {
        level: 1.2, pad: 0,
        cursorOn: '#actions',
      });
      const actionsTh = elDoc.querySelector('th#actions');
      if (actionsTh) actionsTh.classList.add('fe-pi-popout');
      elDoc.body.classList.add('fe-pi-popout-on');
      playSfx('pop-ui', { volume: 0.45 });
      await sleep(360);

      // Per-row ripple cascade on td.column-actions, top → bottom.
      const actionTds = Array.from(elDoc.querySelectorAll('#the-list tr td.column-actions'));
      const cascadeStep = 90;
      for (let i = 0; i < actionTds.length; i++) {
        setTimeout(() => {
          actionTds[i].classList.add('fe-pi-row-pop');
          playSfx('pop-ui', { volume: 0.35, rate: 1.0 + i * 0.05 });
          setTimeout(() => actionTds[i].classList.remove('fe-pi-row-pop'), 700);
        }, i * cascadeStep);
      }
      await sleep(actionTds.length * cascadeStep + 500);

      // ── PHASE 5a: Follow-cam to search dropdown ─────────────
      await followTo('.wpforms-form-search-box-field', {
        cursorOn: '.wpforms-form-search-box-field',
      });
      playSfx('click', { volume: 0.45 });
      const searchPop = mountSearchPopover(elDoc);
      // Slight zoom-out so trigger + dropdown are both fully visible.
      await followTo(['.wpforms-form-search-box-field', '#fe-pi-search-pop'], {
        level: 1.75, pad: 30, duration: 460,
        cursorOn: '.wpforms-form-search-box-field',
      });
      if (searchPop) {
        await sleep(40);
        searchPop.classList.add('is-open');
      }
      await sleep(220);

      // Cursor scrubs through options. Each option gets an id so we can
      // target it deterministically.
      const opts = Array.from(elDoc.querySelectorAll('.fe-pi-search-popover .fe-sp-option'));
      opts.forEach((o, i) => { o.id = `fe-pi-opt-${i}`; });
      const scrubOrder = [0, 7];
      for (const idx of scrubOrder) {
        opts.forEach(o => o.classList.remove('is-hover'));
        if (opts[idx]) {
          const p = cursorIframePoint(`#fe-pi-opt-${idx}`);
          if (p) await glideCursorTo(p.ix, p.iy, idx === 7 ? 720 : 260);
          opts[idx].classList.add('is-hover');
          playSfx('hover', { volume: 0.35, rate: 1.1 });
          await sleep(idx === 7 ? 180 : 120);
        }
      }
      opts.forEach(o => o.classList.remove('is-hover'));
      if (searchPop) searchPop.classList.remove('is-open');
      await sleep(180);
      if (searchPop && searchPop.parentNode) searchPop.parentNode.removeChild(searchPop);

      // ── PHASE 5b: Follow-cam to date filter ────────────────
      // Use the visible flatpickr alt-input (the one that shows
      // "Select a date range"), not the hidden underlying input.
      // Cursor lands on the "Select a date range" placeholder text (left-
      // aligned) rather than the input's geometric center.
      // Asymmetric pad: extra ~240px below the trigger so the calendar that
      // mounts beneath fits in-frame without a separate reframe (zoom #7
      // dropped per user request — but we still need the calendar visible).
      const dateSel = '.regular-text.wpforms-filter-date-selector.form-control.input';
      const dateTrigger = elDoc.querySelector(dateSel);
      if (dateTrigger) dateTrigger.id = 'fe-pi-date-trigger';
      await followTo('#fe-pi-date-trigger', {
        level: 2.1,
        pad: { top: 20, bottom: 240, left: 30, right: 30 },
        cursorOn: '#fe-pi-date-trigger',
      });
      playSfx('click', { volume: 0.45 });
      const cal = mountCalendar(elDoc);
      if (cal) {
        await sleep(40);
        cal.classList.add('is-open');
      }
      await sleep(900);

      await showEntriesPayoff();

      // ── PHASE 6: Content-only handoff into next chapter ────
      await contentOnlySwap('admin-forms-overview', {
        setup: async (foDoc) => {
          if (foDoc) installFormsOverviewFx(foDoc);
        },
      });
      const handoffIframe = document.querySelector('iframe.ui');
      if (handoffIframe) {
        handoffIframe.style.transition = 'none';
        handoffIframe.style.transformOrigin = '0 0';
        handoffIframe.style.transform = 'scale(1) translate(0px, 0px)';
        handoffIframe.style.opacity = '1';
        void handoffIframe.offsetWidth;
      }

      // Cleanup so the next chapter starts on a clean snapshot.
      if (cal && cal.parentNode) cal.parentNode.removeChild(cal);
      if (actionsTh) actionsTh.classList.remove('fe-pi-popout');
      elDoc.body.classList.remove('fe-pi-popout-on');
      const iframe = document.querySelector('iframe.ui');
      if (iframe) iframe.style.opacity = '1';
      // Restore cursor's default transition so subsequent chapters get
      // the engine's standard 0.6s cursor easing.
      if (cursorEl) cursorEl.style.transition = '';
    },
    duration: 0.2,
  },
];
