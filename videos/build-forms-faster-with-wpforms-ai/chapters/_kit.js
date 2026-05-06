// Shared kit for the WPForms AI announcement scenes.
//
// Universal helpers come from videos/_shared/kit.js (re-exported below so
// existing scene imports keep working). Transition-fix prototypes
// (freezeChrome, mountBlurCover, migrateOverlayToHtml) stay local — they
// are early manual fixes for cross-snapshot transitions and become inputs
// to the future transition-overhaul project. Don't promote them yet.

export {
  loadGsap,
  mountSceneLayer,
  mountSceneCursor,
  SCENE_CURSOR_CSS,
  customizeEngineCursor,
  ensureFont,
  injectCss,
  splitText,
  tlDone,
  playSfx,
  clickRipple,
} from '../../_shared/kit.js';

// ─────────────────────────────────────────────────────────────────────────
// Transition-fix prototypes — local to this video.
//
// Chrome freeze: the body-wipe inside engine.loadSnapshot destroys the
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
// ─────────────────────────────────────────────────────────────────────────

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

export async function unfreezeChrome({ fadeMs = 280, hold = 40 } = {}) {
  const wrap = document.getElementById(FROZEN_WRAP_ID);
  if (!wrap) return;
  wrap.style.transition = 'opacity ' + fadeMs + 'ms ease-out';
  wrap.style.opacity = '0';
  await new Promise(r => setTimeout(r, fadeMs + hold));
  wrap.remove();
  document.getElementById(FROZEN_STYLE_ID)?.remove();
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
