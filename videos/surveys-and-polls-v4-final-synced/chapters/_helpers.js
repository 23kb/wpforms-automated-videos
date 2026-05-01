// v4 helpers — carousel-opener + hero-transform need only FIELD_11 + sleep.
// The proof beats (customize/filters/export) add menu selectors and
// fakeOpen/fakeCloseMenu. Shared animate-text builder lives here too so
// customize/filters/export don't re-implement it.

export const FIELD_11 = '.wpforms-survey-graph-preview[data-field-id="11"]';

export const EXPORT_BTN    = `${FIELD_11} .wpforms-survey-graph-context-menu-export > .wpforms-survey-graph-button`;
export const EXPORT_MENU   = `${FIELD_11} .wpforms-survey-graph-context-menu-export > .wpforms-survey-graph-menu`;
export const FILTERS_BTN   = `.wpforms-survey-graph-context-menu-filters > .wpforms-survey-graph-button`;
export const FILTERS_MENU  = `.wpforms-survey-graph-context-menu-filters > .wpforms-survey-graph-menu`;
export const SETTINGS_BTN  = `${FIELD_11} .wpforms-survey-graph-context-menu-settings > .wpforms-survey-graph-button`;
export const SETTINGS_MENU = `${FIELD_11} .wpforms-survey-graph-context-menu-settings > .wpforms-survey-graph-menu`;
export const GRAPH_CHART   = `${FIELD_11} .wpforms-survey-graph-content-chart`;

// Recolor filters on the chart canvas/img. Blue is native; black/orange are
// synthetic approximations using grayscale/hue-rotate.
export const GRAPH_COLOR_FILTERS = {
  blue:   '',
  black:  'grayscale(1) contrast(1.15)',
  orange: 'hue-rotate(-165deg) saturate(1.35) brightness(1.02)',
};

export function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export async function fakeOpenMenu(menuSel) {
  const doc = document.querySelector('iframe.ui').contentDocument;
  const menu = doc.querySelector(menuSel);
  if (!menu) throw new Error('fakeOpenMenu: not found: ' + menuSel);
  menu.classList.add('wpforms-survey-graph-menu-opened');
  menu.style.transformOrigin = 'top right';
  menu.style.transition = 'none';
  menu.style.opacity = '0';
  menu.style.transform = 'scale(0.94)';
  await sleep(20);
  menu.style.transition = 'opacity 260ms ease, transform 260ms cubic-bezier(0.2,0.8,0.2,1)';
  menu.style.opacity = '1';
  menu.style.transform = 'scale(1)';
  await sleep(280);
}

export async function fakeCloseMenu(menuSel) {
  const doc = document.querySelector('iframe.ui').contentDocument;
  const menu = doc.querySelector(menuSel);
  if (!menu) return;
  menu.style.transition = 'opacity 220ms ease, transform 220ms cubic-bezier(0.2,0.8,0.2,1)';
  menu.style.opacity = '0';
  menu.style.transform = 'scale(0.96)';
  await sleep(240);
  menu.classList.remove('wpforms-survey-graph-menu-opened');
  menu.style.opacity = '';
  menu.style.transform = '';
  menu.style.transition = '';
  menu.style.transformOrigin = '';
}

// ─────────────────────────────────────────────────────────────────────────
// Editorial animate-text — pixel-point style mask slide-up reveal.
// Each character sits inside an overflow:hidden mask and rises from below
// the baseline to its rest position. Zero opacity fade, zero blur — pure
// typographic motion. Premium exponential-out easing; tight stagger.
// ─────────────────────────────────────────────────────────────────────────
const ET_STYLE = `
.v4-et {
  position: fixed; z-index: 900;
  pointer-events: none;
  font-family: 'Instrument Serif', Georgia, serif;
  font-weight: 400;
  font-size: 38px;
  letter-spacing: -0.005em;
  line-height: 1.1;
  color: #14161C;
  white-space: pre;
  display: inline-block;
  /* Prominent lift: tight white halo for chart-overlay legibility, plus
     a soft dark drop shadow beneath so the line pops off the page. */
  text-shadow:
    0 1px 0 rgba(255,255,255,0.95),
    0 2px 6px rgba(255,255,255,0.70),
    0 10px 28px rgba(20,22,28,0.28),
    0 22px 48px rgba(20,22,28,0.14);
}
.v4-et .mask {
  display: inline-block;
  overflow: hidden;
  vertical-align: baseline;
  /* Extend mask slightly beyond glyph bounds so descenders/ascenders
     aren't clipped once the character settles. Compensate with negative
     margin so layout is unchanged. */
  padding: 0.12em 0;
  margin: -0.12em 0;
  line-height: 1.1;
}
.v4-et .ch {
  display: inline-block;
  transform: translate3d(0, 110%, 0);
  transition: transform 920ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}
.v4-et.in .ch { transform: translate3d(0, 0, 0); }
.v4-et.out .ch {
  transform: translate3d(0, -110%, 0);
  transition: transform 520ms cubic-bezier(0.64, 0, 0.78, 0);
  transition-delay: 0ms !important;
}
.v4-et .v4-et-shine {
  position: absolute; top: -6%; bottom: -6%;
  left: -40%; width: 38%;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(255,255,255,0.95) 50%,
    transparent 100%);
  filter: blur(10px);
  mix-blend-mode: screen;
  opacity: 0;
  pointer-events: none;
}
.v4-et .v4-et-shine.run {
  opacity: 1;
  left: 110%;
  transition: left 1050ms cubic-bezier(.3,.05,.3,1), opacity 260ms ease;
}
`;

function ensureEditorialStyles() {
  if (document.getElementById('v4-et-style')) return;
  const s = document.createElement('style');
  s.id = 'v4-et-style';
  s.textContent = ET_STYLE;
  document.head.appendChild(s);
}

export function ensureEditorialFonts() {
  if (document.getElementById('v4-fonts')) return;
  const link = document.createElement('link');
  link.id = 'v4-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap';
  document.head.appendChild(link);
}

// Mount an editorial line at a viewport position. Returns {el, show, exit}.
// `position` is { left?, right?, top?, bottom?, transform? } in CSS. Default
// is top-center (above the chart). Each character gets its own overflow
// mask + translateY(110%) start — signature pixel-point slide-up reveal.
export function editorialText(text, {
  position = { left: '50%', top: '22vh', transform: 'translateX(-50%)' },
  stagger = 35, size = 40, color = '#14161C', align = 'center',
} = {}) {
  ensureEditorialStyles();
  ensureEditorialFonts();

  const wrap = document.createElement('div');
  wrap.className = 'v4-et';
  wrap.style.position = 'fixed';
  if (position.left   != null) wrap.style.left   = position.left;
  if (position.right  != null) wrap.style.right  = position.right;
  if (position.top    != null) wrap.style.top    = position.top;
  if (position.bottom != null) wrap.style.bottom = position.bottom;
  if (position.transform) wrap.style.transform = position.transform;
  wrap.style.fontSize = size + 'px';
  wrap.style.color = color;
  wrap.style.textAlign = align;

  const chars = [...text];
  chars.forEach((c, i) => {
    const mask = document.createElement('span');
    mask.className = 'mask';
    const span = document.createElement('span');
    span.className = 'ch';
    span.innerHTML = c === ' ' ? '&nbsp;' : c;
    span.style.transitionDelay = (i * stagger) + 'ms';
    mask.appendChild(span);
    wrap.appendChild(mask);
  });

  const shine = document.createElement('span');
  shine.className = 'v4-et-shine';
  wrap.appendChild(shine);

  document.body.appendChild(wrap);

  async function show({ shineAfter = true } = {}) {
    await sleep(40);
    requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add('in')));
    const total = chars.length * stagger + 920;
    await sleep(total);
    if (shineAfter) {
      await sleep(80);
      shine.classList.add('run');
      await sleep(1050);
    }
    return wrap;
  }

  async function exit({ ms = 520 } = {}) {
    wrap.classList.remove('in');
    wrap.classList.add('out');
    await sleep(ms);
    wrap.remove();
  }

  return { el: wrap, show, exit };
}
