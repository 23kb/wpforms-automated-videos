// Shared kit for the WPForms AI announcement scenes.
//
// Self-contained: no runtime/ or engine/ imports. GSAP is fetched from CDN
// the first time any scene calls loadGsap(); subsequent scenes hit the cache.
// SFX is plain <audio> playback against /assets/sfx/*.mp3 — runtime/sfx.js
// already auto-fires built-in cursor/type/swoosh sounds; this helper covers
// the custom moments inside an effect closure.

let gsapPromise = null;
export function loadGsap() {
  if (window.gsap && window.MotionPathPlugin && window.Flip) {
    return Promise.resolve(window.gsap);
  }
  if (gsapPromise) return gsapPromise;
  const load = (src) => new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
  gsapPromise = (async () => {
    if (!window.gsap) await load('https://unpkg.com/gsap@3/dist/gsap.min.js');
    if (!window.MotionPathPlugin) await load('https://unpkg.com/gsap@3/dist/MotionPathPlugin.min.js');
    if (!window.Flip) await load('https://unpkg.com/gsap@3/dist/Flip.min.js');
    window.gsap.registerPlugin(window.MotionPathPlugin, window.Flip);
    return window.gsap;
  })();
  return gsapPromise;
}

// Full-stage editorial layer above the snapshot iframe.
export function mountSceneLayer(id, { z = 80 } = {}) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const layer = document.createElement('div');
  layer.id = id;
  layer.className = 'scene-layer';
  Object.assign(layer.style, {
    position: 'fixed', inset: '0', pointerEvents: 'none',
    zIndex: String(z), overflow: 'hidden', opacity: '0',
  });
  document.body.appendChild(layer);
  return layer;
}

// Premium headline font for the announcement scenes — Inter
// (variable axes for opsz + weight) paired with Inter for support text.
// Loaded once via Google Fonts; subsequent scenes hit the browser cache.
export function ensureFont() {
  if (document.getElementById('scene-fonts')) return;
  const l = document.createElement('link');
  l.id = 'scene-fonts';
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
  document.head.appendChild(l);
}

// Reskin the engine cursor (`.cursor` SVG inside `.overlay`) into a clean
// macOS-style black arrow. Idempotent — only swaps the SVG once.
export function customizeEngineCursor() {
  const c = document.querySelector('.cursor');
  if (!c || c.dataset.styled === 'mac-black') return;
  c.dataset.styled = 'mac-black';
  c.setAttribute('viewBox', '0 0 24 24');
  c.style.width = '34px';
  c.style.height = '34px';
  c.style.filter = 'drop-shadow(0 2px 3px rgba(0,0,0,0.34))';
  // engine.cursor.moveTo positions at x - 4 / y - 2. The supplied mac cursor
  // wants x - 6.4 / y - 3.7, so margin supplies the remaining offset.
  c.style.marginLeft = '-2.4px';
  c.style.marginTop = '-1.7px';
  c.innerHTML = `
    <path d="M5.5 3.2 V20.8 c0 .45 .54 .67 .85 .35 l4.5-4.5 a.5 .5 0 0 1 .35-.15 h6.4
             a.5 .5 0 0 0 .35-.85 L6.35 2.85 a.5 .5 0 0 0-.85 .36 Z"
          fill="#111" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/>
  `;
}

export function injectCss(id, css) {
  if (document.getElementById(id)) return;
  const s = document.createElement('style');
  s.id = id; s.textContent = css;
  document.head.appendChild(s);
}

const sfxCache = {};
export function playSfx(name, { volume = 0.7, rate = 1 } = {}) {
  try {
    if (!sfxCache[name]) sfxCache[name] = new Audio(`/assets/sfx/${name}.mp3`);
    const c = sfxCache[name].cloneNode();
    c.volume = volume;
    c.playbackRate = rate;
    c.play().catch(() => {});
  } catch (_) {}
}

// Split a text node into word + char spans for animation. Returns the spans.
export function splitText(el) {
  const text = el.textContent;
  el.textContent = '';
  const words = text.split(' ');
  const wordSpans = [];
  const charSpans = [];
  words.forEach((w, i) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'sw-word';
    wordSpan.style.display = 'inline-block';
    wordSpan.style.whiteSpace = 'nowrap';
    [...w].forEach(ch => {
      const cs = document.createElement('span');
      cs.className = 'sw-char';
      cs.style.display = 'inline-block';
      cs.textContent = ch;
      wordSpan.appendChild(cs);
      charSpans.push(cs);
    });
    el.appendChild(wordSpan);
    if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    wordSpans.push(wordSpan);
  });
  return { words: wordSpans, chars: charSpans };
}

// Promisify a GSAP timeline.
export function tlDone(tl) {
  return new Promise(resolve => tl.eventCallback('onComplete', resolve));
}

// Custom macOS-style black cursor with a subtle shadow. Returns the element + helpers.
export function mountSceneCursor(layer) {
  const c = document.createElement('div');
  c.className = 'scene-cursor';
  c.innerHTML = `
    <svg viewBox="0 0 24 24" width="34" height="34" class="sc-arrow" aria-hidden="true">
      <path d="M5.5 3.2 V20.8 c0 .45 .54 .67 .85 .35 l4.5-4.5 a.5 .5 0 0 1 .35-.15 h6.4
               a.5 .5 0 0 0 .35-.85 L6.35 2.85 a.5 .5 0 0 0-.85 .36 Z"
        fill="#111" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/>
    </svg>
  `;
  Object.assign(c.style, {
    position: 'fixed', left: '0', top: '0', pointerEvents: 'none',
    transform: 'translate(-100px, -100px)', willChange: 'transform',
    zIndex: '9999',
  });
  layer.appendChild(c);
  return c;
}

export const SCENE_CURSOR_CSS = `
.scene-cursor .sc-arrow {
  display: block;
  filter: drop-shadow(0 2px 3px rgba(0,0,0,.34));
}
`;

// Chrome freeze — the body-wipe inside engine.loadSnapshot destroys the
// mac-frame, mac-chrome, mesh-bg and watermark elements (children of body),
// then runtime/player.js's mountStageChrome remounts them. The flash-guard
// CSS keeps the new copies hidden via visibility:hidden until removeFlashGuard
// fires. Net effect: a 1–2s window across every snapshot swap where the
// mac-frame "vanishes and pops back in."
//
// Fix: before the swap, clone the chrome elements onto <html> (sibling of
// <body>, untouched by the body-wipe). Inject an override stylesheet so the
// flash-guard's `visibility: hidden !important` doesn't hide the clones.
// After the swap completes and the next scene has staged itself, drop the
// clones with a soft fade — the real (newly-remounted) chrome takes over
// seamlessly because it lives at the same fixed positions.
const FROZEN_WRAP_ID = 'wpf-chrome-freeze';
const FROZEN_STYLE_ID = 'wpf-chrome-freeze-style';

export function freezeChrome() {
  if (document.getElementById(FROZEN_WRAP_ID)) return;

  if (!document.getElementById(FROZEN_STYLE_ID)) {
    const s = document.createElement('style');
    s.id = FROZEN_STYLE_ID;
    s.textContent = `
      #${FROZEN_WRAP_ID} {
        position: fixed; inset: 0; z-index: 8995; pointer-events: none;
      }
      /* Higher specificity than the flash-guard's .mac-frame visibility:hidden
         so the clones stay visible through the body-wipe + remount window. */
      #${FROZEN_WRAP_ID} .mac-frame,
      #${FROZEN_WRAP_ID} .mac-chrome,
      #${FROZEN_WRAP_ID} .mesh-bg,
      #${FROZEN_WRAP_ID} .wpf-watermark {
        visibility: visible !important;
      }
    `;
    document.head.appendChild(s);
  }

  const wrap = document.createElement('div');
  wrap.id = FROZEN_WRAP_ID;

  // Clone in painting order: mesh-bg first (under), then mac-frame outline,
  // then mac-chrome title bar, then watermark on top.
  ['.mesh-bg', '.mac-frame', '.mac-chrome', '.wpf-watermark'].forEach(sel => {
    const el = document.querySelector(sel);
    if (!el) return;
    wrap.appendChild(el.cloneNode(true));
  });

  // Append to <html>. Body-wipe in loadSnapshot only touches body.innerHTML,
  // so this wrap survives the swap.
  document.documentElement.appendChild(wrap);
}

// Frosted blur cover — full-screen layer on <html> with backdrop-filter that
// blurs everything underneath (iframe content during a swap, real chrome
// while it's being remounted). Used together with freezeChrome (clones above
// the blur) and a chip bridge (chips migrated above the blur) to fake a
// smooth morph across a snapshot swap. The mac-frame stays sharp on top;
// inside the frame the iframe swap is hidden behind a blur instead of a
// blank cream cover.
const BLUR_COVER_ID = 'wpf-scene-blur';

export function mountBlurCover({ blur = 18, fadeInMs = 480, tint = 0.18 } = {}) {
  const existing = document.getElementById(BLUR_COVER_ID);
  if (existing) return existing;
  const c = document.createElement('div');
  c.id = BLUR_COVER_ID;
  c.style.cssText =
    'position:fixed;inset:0;z-index:8998;pointer-events:none;' +
    'background:rgba(248,250,253,0);' +
    'backdrop-filter:blur(0px) saturate(1);' +
    '-webkit-backdrop-filter:blur(0px) saturate(1);' +
    'transition:background ' + fadeInMs + 'ms cubic-bezier(.2,.8,.2,1),' +
    'backdrop-filter ' + fadeInMs + 'ms cubic-bezier(.2,.8,.2,1),' +
    '-webkit-backdrop-filter ' + fadeInMs + 'ms cubic-bezier(.2,.8,.2,1);';
  document.documentElement.appendChild(c);
  void c.offsetWidth;
  c.style.background = 'rgba(248,250,253,' + tint + ')';
  c.style.backdropFilter = 'blur(' + blur + 'px) saturate(1.05)';
  c.style.webkitBackdropFilter = 'blur(' + blur + 'px) saturate(1.05)';
  return c;
}

export async function dropBlurCover({ fadeMs = 600 } = {}) {
  const c = document.getElementById(BLUR_COVER_ID);
  if (!c) return;
  c.style.transition =
    'background ' + fadeMs + 'ms cubic-bezier(.4,0,.2,1),' +
    'backdrop-filter ' + fadeMs + 'ms cubic-bezier(.4,0,.2,1),' +
    '-webkit-backdrop-filter ' + fadeMs + 'ms cubic-bezier(.4,0,.2,1);';
  c.style.background = 'rgba(248,250,253,0)';
  c.style.backdropFilter = 'blur(0px) saturate(1)';
  c.style.webkitBackdropFilter = 'blur(0px) saturate(1)';
  await new Promise(r => setTimeout(r, fadeMs + 30));
  c.remove();
}

// Migrate a scene overlay from <body> to <html> so its contents (chips,
// caption, etc.) survive the body-wipe inside loadSnapshot. After migration
// the layer is positioned absolutely on <html> at a high z-index above the
// blur cover and chrome freeze.
export function migrateOverlayToHtml(layer, { z = 9001 } = {}) {
  if (!layer) return null;
  // Pin every fixed-position child's left/top to its current screen rect
  // before reparenting, so transforms relative to the parent don't shift.
  [...layer.children].forEach(child => {
    if (child.style.position === 'fixed' || getComputedStyle(child).position === 'fixed') {
      const r = child.getBoundingClientRect();
      child.style.left = r.left + 'px';
      child.style.top = r.top + 'px';
    }
  });
  layer.style.zIndex = String(z);
  document.documentElement.appendChild(layer);
  return layer;
}

export async function unfreezeChrome({ fadeMs = 280, hold = 40 } = {}) {
  const wrap = document.getElementById(FROZEN_WRAP_ID);
  if (!wrap) return;
  wrap.style.transition = 'opacity ' + fadeMs + 'ms ease-out';
  wrap.style.opacity = '0';
  await new Promise(r => setTimeout(r, fadeMs + hold));
  wrap.remove();
  document.getElementById(FROZEN_STYLE_ID)?.remove();
}

// Click ripple at a screen point.
export function clickRipple(layer, x, y, gsap, color = 'rgba(5,106,171,.55)') {
  const r = document.createElement('div');
  Object.assign(r.style, {
    position: 'fixed', left: (x - 6) + 'px', top: (y - 6) + 'px',
    width: '12px', height: '12px', borderRadius: '50%',
    border: `2px solid ${color}`, pointerEvents: 'none', zIndex: '9998',
  });
  layer.appendChild(r);
  gsap.timeline()
    .to(r, { width: 90, height: 90, left: x - 45, top: y - 45, opacity: 0, duration: 0.55, ease: 'power3.out' })
    .call(() => r.remove());
}
