// v4 Beat 4 — CUSTOMIZE (proof beat #1, strongest).
//
// Shot subject:  the hero graph.
// Control:       the settings gear — style icons + color swatches live-update.
// Editorial:     "Every chart, your call." (top-center, Instrument Serif)
//
// Grammar:
//   - Cool palette. No warm glow — clean airy shadow + 1px orange rim.
//   - Editorial text appears once, fades out before the menu closes.
//   - Sequence: gear opens → chart lifts → STYLE cycle (line → bar-h → pie →
//     line) with chart image cross-fading to the real rendered PNG per style
//     → COLOR cycle (black → orange → blue) on the line chart → menu closes.
//   - Lift persists via window.__v4GraphLift for the filters beat to dismiss.

import {
  SETTINGS_BTN, SETTINGS_MENU, GRAPH_CHART, GRAPH_COLOR_FILTERS,
  fakeOpenMenu, fakeCloseMenu, sleep, editorialText,
} from './_helpers.js';

export const snapshot = 'sp-results-new-418-base';
export const mode = 'parallel';

// Live-rendered chart PNGs per style (captured via
// capture/capture-chart-styles.js against the real survey-results page).
const CHART_ASSETS = {
  line:    '/videos/surveys-and-polls-v4/chart-styles/line.png',
  bar:     '/videos/surveys-and-polls-v4/chart-styles/bar.png',
  'bar-h': '/videos/surveys-and-polls-v4/chart-styles/bar-h.png',
  pie:     '/videos/surveys-and-polls-v4/chart-styles/pie.png',
};

function preloadChartAssets() {
  for (const src of Object.values(CHART_ASSETS)) {
    const img = new Image();
    img.src = src;
  }
}

async function swapChartImage(doc, style, { ms = 220 } = {}) {
  const src = CHART_ASSETS[style];
  if (!src) return;
  const img = doc.querySelector(`${GRAPH_CHART} img`);
  if (!img) return;
  // Preserve rendered box size so the layout doesn't jitter between styles.
  const rect = img.getBoundingClientRect();
  img.style.width  = rect.width  + 'px';
  img.style.height = rect.height + 'px';

  img.style.transition = `opacity ${ms}ms ease`;
  img.style.opacity = '0';
  await sleep(ms);
  img.src = src;
  // Let the new frame decode before we crossfade back in.
  await sleep(40);
  img.style.opacity = '1';
  await sleep(ms);
}

function selectStyleRadio(doc, value) {
  const radios = doc.querySelectorAll(`${SETTINGS_MENU} input[name="graph-style[11]"]`);
  radios.forEach(r => {
    r.checked = (r.value === value);
    const label = r.closest('label') || r.parentElement;
    if (label) label.classList.toggle('is-selected', r.value === value);
  });
}

function applyColor(doc, color) {
  const filter = GRAPH_COLOR_FILTERS[color] || '';
  const chart = doc.querySelector(GRAPH_CHART);
  if (chart) {
    chart.style.transition = (chart.style.transition || '') + ', filter 280ms ease';
    chart.style.filter = filter;
  }
  const valueByColor = { black: '#50575e', blue: '#056aab', orange: '#e27730' };
  const val = valueByColor[color];
  const radios = doc.querySelectorAll(`${SETTINGS_MENU} input[name="graph-color[11]"]`);
  radios.forEach(r => {
    r.checked = (r.value === val);
    const label = r.closest('label') || r.parentElement;
    if (label) label.classList.toggle('is-selected', r.value === val);
  });
}

function liftChart(doc) {
  const chart = doc.querySelector(GRAPH_CHART);
  if (!chart) return () => {};
  const prev = {
    transform: chart.style.transform,
    boxShadow: chart.style.boxShadow,
    transition: chart.style.transition,
    zIndex: chart.style.zIndex,
    position: chart.style.position,
  };
  chart.style.transition = 'transform 420ms cubic-bezier(.2,.9,.3,1.1), box-shadow 420ms ease, filter 280ms ease';
  chart.style.transformOrigin = '50% 50%';
  chart.style.transform = 'scale(1.04)';
  chart.style.boxShadow =
    '0 22px 42px -14px rgba(20,22,28,0.18), ' +
    '0 8px 18px -8px rgba(20,22,28,0.10), ' +
    '0 0 0 1px rgba(226,119,48,0.18)';
  chart.style.zIndex = '10';
  chart.style.position = 'relative';

  return function dismiss() {
    chart.style.transition = 'transform 360ms cubic-bezier(.4,.1,.3,1), box-shadow 360ms ease';
    chart.style.transform = prev.transform || '';
    chart.style.boxShadow = prev.boxShadow || '';
    setTimeout(() => {
      chart.style.zIndex = prev.zIndex || '';
      chart.style.position = prev.position || '';
    }, 380);
  };
}

export default [
  {
    id: 'customize', chapter: 'customize',
    duration: 0.2,
    effect: async ({ cursor }) => {
      const doc = document.querySelector('iframe.ui').contentDocument;
      preloadChartAssets();

      const silentClick = async (sel, { wait = 380 } = {}) => {
        await cursor.moveTo(sel, { wait });
        await cursor.click();
        try {
          const el = doc.querySelector(sel);
          if (el) {
            el.addEventListener('click', (e) => e.preventDefault(), { capture: true, once: true });
            el.click();
          }
        } catch {}
      };

      // ═════ Editorial line — top-center ═════
      const ed = editorialText('Every chart, your call.', { size: 42 });
      ed.show({ shineAfter: true });

      await sleep(320);

      // ═════ Open settings menu + lift chart ═════
      await silentClick(SETTINGS_BTN, { wait: 500 });
      await fakeOpenMenu(SETTINGS_MENU);
      const dismissLift = liftChart(doc);
      window.__v4GraphLift = { dismiss: dismissLift };
      await sleep(240);

      // ═════ STYLE cycle — cursor clicks each icon, chart PNG crossfades ═════
      // Snapshot default is bar. Cycle: line → bar-h → pie → line.
      const styleSel = (v) => `${SETTINGS_MENU} input[name="graph-style[11]"][value="${v}"]`;
      const cycleStyle = async (style) => {
        await silentClick(styleSel(style), { wait: 280 });
        selectStyleRadio(doc, style);
        await swapChartImage(doc, style, { ms: 220 });
        await sleep(80);
      };

      await cycleStyle('line');
      await cycleStyle('bar-h');
      await cycleStyle('pie');
      await cycleStyle('line');

      await sleep(160);

      // ═════ COLOR cycle — on the line chart ═════
      const swatchSel = (v) => `${SETTINGS_MENU} input[name="graph-color[11]"][value="${v}"]`;

      await silentClick(swatchSel('#50575e'), { wait: 220 });   // BLACK
      applyColor(doc, 'black');
      await sleep(320);

      await silentClick(swatchSel('#e27730'), { wait: 220 });   // ORANGE
      applyColor(doc, 'orange');
      await sleep(320);

      await silentClick(swatchSel('#056aab'), { wait: 220 });   // BLUE
      applyColor(doc, 'blue');
      await sleep(420);

      // Editorial line exits before menu closes.
      ed.exit({ ms: 300 });
      await sleep(120);

      await fakeCloseMenu(SETTINGS_MENU);
      await sleep(240);
    },
  },
];
