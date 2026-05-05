// Local kit for the Generate-card Flip tour. Self-contained (no cross-video
// imports). Mirrors the loader pattern used by other video _kits.

let p = null;
export function loadGsapFlip() {
  if (window.gsap && window.Flip) return Promise.resolve(window.gsap);
  if (p) return p;
  const load = (src) => new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = rej;
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

export function mountStageLayer(id, { z = 80 } = {}) {
  const old = document.getElementById(id);
  if (old) old.remove();
  const el = document.createElement('div');
  el.id = id;
  Object.assign(el.style, {
    position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: String(z),
  });
  document.body.appendChild(el);
  return el;
}

export function injectCss(id, css) {
  if (document.getElementById(id)) return;
  const s = document.createElement('style');
  s.id = id; s.textContent = css;
  document.head.appendChild(s);
}

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

export function flipDone(tween) {
  return new Promise((resolve) => tween.eventCallback('onComplete', resolve));
}

// Clone a real iframe element with computed styles inlined; returns the
// clone pinned to its source's screen rect via position:fixed.
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

  // Resolve relative URLs (img.src, etc.) against the iframe's base URL so
  // the host document can fetch them. Without this, "assets/foo.svg" in the
  // snapshot resolves to /scenes/assets/foo.svg on the host.
  const baseUrl = iframe.contentDocument.baseURI;
  clone.querySelectorAll('img[src]').forEach((img) => {
    try { img.src = new URL(img.getAttribute('src'), baseUrl).href; } catch {}
  });
  clone.querySelectorAll('[style*="url("]').forEach((el) => {
    el.style.cssText = el.style.cssText.replace(
      /url\(["']?([^"')]+)["']?\)/g,
      (_, u) => {
        try { return 'url(' + new URL(u, baseUrl).href + ')'; }
        catch { return 'url(' + u + ')'; }
      }
    );
  });

  // Strip event surfaces — visual actor only.
  clone.querySelectorAll('a, button').forEach((el) => {
    el.setAttribute('tabindex', '-1');
    el.style.pointerEvents = 'none';
  });

  clone.style.position = 'fixed';
  clone.style.left = Math.round(screenLeft) + 'px';
  clone.style.top = Math.round(screenTop) + 'px';
  clone.style.width = Math.round(screenW) + 'px';
  clone.style.height = Math.round(screenH) + 'px';
  clone.style.margin = '0';
  clone.style.zIndex = '1';

  return { clone, rect: { left: screenLeft, top: screenTop, width: screenW, height: screenH } };
}

function inlineComputedStylesDeep(srcWin, srcRoot, dstRoot) {
  const srcWalker = srcRoot.ownerDocument.createTreeWalker(srcRoot, NodeFilter.SHOW_ELEMENT);
  const dstWalker = document.createTreeWalker(dstRoot, NodeFilter.SHOW_ELEMENT);
  let s = srcRoot, d = dstRoot;
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
