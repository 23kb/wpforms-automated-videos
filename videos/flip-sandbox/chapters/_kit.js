// Local kit for the GSAP Flip sandbox.
//
// Mirrors the loader pattern used by videos/build-forms-faster-with-wpforms-ai/_kit.js:
// chapter-local CDN script tags, no imports from engine/runtime/scenes.
// Only loads what the sandbox needs: core GSAP + Flip plugin.

let p = null;
export function loadGsapFlip() {
  if (window.gsap && window.Flip) return Promise.resolve(window.gsap);
  if (p) return p;
  const load = (src) => new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = res;
    s.onerror = rej;
    document.head.appendChild(s);
  });
  p = (async () => {
    if (!window.gsap) await load('https://unpkg.com/gsap@3/dist/gsap.min.js');
    if (!window.Flip) await load('https://unpkg.com/gsap@3/dist/Flip.min.js');
    window.gsap.registerPlugin(window.Flip);
    return window.gsap;
  })();
  return p;
}

// Editorial stage layer mounted above the iframe. Removed and re-mounted is
// the caller's job; this helper just creates a fresh one.
export function mountStageLayer(id, { z = 80 } = {}) {
  const old = document.getElementById(id);
  if (old) old.remove();
  const el = document.createElement('div');
  el.id = id;
  Object.assign(el.style, {
    position: 'fixed',
    inset: '0',
    pointerEvents: 'none',
    zIndex: String(z),
  });
  document.body.appendChild(el);
  return el;
}

export function injectCss(id, css) {
  if (document.getElementById(id)) return;
  const s = document.createElement('style');
  s.id = id;
  s.textContent = css;
  document.head.appendChild(s);
}

// Read the iframe element's current scale factor from its inline transform.
// Identity returns 1. Used by Beat 3 to keep pin math correct if a prior
// camera move left the iframe scaled.
export function iframeScale() {
  const el = document.querySelector('iframe.ui');
  if (!el) return 1;
  const m = /scale\(([-\d.]+)\)/.exec(el.style.transform || '');
  return m ? parseFloat(m[1]) : 1;
}

export function iframeTranslate() {
  const el = document.querySelector('iframe.ui');
  if (!el) return { x: 0, y: 0 };
  const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(el.style.transform || '');
  return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : { x: 0, y: 0 };
}

// Promisify a GSAP Flip tween.
export function flipDone(tween) {
  return new Promise((resolve) => {
    tween.eventCallback('onComplete', resolve);
  });
}

// Clone a real iframe element and pin the clone onto the host stage layer at
// the original's screen rect, with computed styles inlined so it visually
// matches the live element. Returns { clone, rect } — caller mounts `clone`
// on whatever stage container they want (its position is already absolute
// relative to the viewport).
//
// Used by the "real-UI clone Flip" beat: animate a copy of a real WPForms
// element (e.g. a form table row) without touching iframe DOM.
export function cloneFromIframe(selector, { scale = 1 } = {}) {
  const iframe = document.querySelector('iframe.ui');
  const idoc = iframe?.contentDocument;
  const iwin = iframe?.contentWindow;
  if (!iframe || !idoc || !iwin) return null;
  const src = idoc.querySelector(selector);
  if (!src) return null;

  const ifrRect = iframe.getBoundingClientRect();
  const sRect = src.getBoundingClientRect();
  const screenLeft = ifrRect.left + sRect.left * scale;
  const screenTop = ifrRect.top + sRect.top * scale;
  const screenW = sRect.width * scale;
  const screenH = sRect.height * scale;

  const clone = src.cloneNode(true);
  inlineComputedStylesDeep(iwin, src, clone);

  // Strip event surfaces — clone is a visual actor only.
  clone.querySelectorAll('a, button').forEach((el) => {
    el.setAttribute('tabindex', '-1');
    el.style.pointerEvents = 'none';
  });

  // Absolute on the host stage at the source's screen position. Width/height
  // pinned so the clone's own layout matches the original; Flip will animate
  // deltas via transform when we change these later.
  clone.style.position = 'fixed';
  clone.style.left = Math.round(screenLeft) + 'px';
  clone.style.top = Math.round(screenTop) + 'px';
  clone.style.width = Math.round(screenW) + 'px';
  clone.style.height = Math.round(screenH) + 'px';
  clone.style.margin = '0';
  clone.style.zIndex = '1';

  return { clone, rect: { left: screenLeft, top: screenTop, width: screenW, height: screenH } };
}

// Walk source + clone trees in parallel, copying every computed style from
// source to clone as inline cssText. Uses the iframe window's getComputedStyle
// because the source lives in iframe.contentDocument.
function inlineComputedStylesDeep(srcWin, srcRoot, dstRoot) {
  const srcWalker = srcRoot.ownerDocument.createTreeWalker(srcRoot, NodeFilter.SHOW_ELEMENT);
  const dstWalker = document.createTreeWalker(dstRoot, NodeFilter.SHOW_ELEMENT);
  let s = srcRoot;
  let d = dstRoot;
  while (s && d) {
    copyComputedStyle(srcWin, s, d);
    s = srcWalker.nextNode();
    d = dstWalker.nextNode();
  }
}

function copyComputedStyle(win, src, dst) {
  const cs = win.getComputedStyle(src);
  let css = '';
  for (let i = 0; i < cs.length; i++) {
    const prop = cs[i];
    css += prop + ':' + cs.getPropertyValue(prop) + ';';
  }
  dst.style.cssText = css;
}
