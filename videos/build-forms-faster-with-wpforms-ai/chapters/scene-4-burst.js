// Scene 4 — AI generation burst (~5s).
//
// IMPORTANT: this chapter shares the wpforms-ai-builder-feedback-generated
// snapshot with Scene 5 so there is NO snapshot swap between them — the
// iframe content and mac-frame stay continuously visible across the 4→5
// boundary. Setup hides every real field row + the form title under cover
// during the swap from Scene 3, so the preview area reads as empty during
// the chip cascade. Scene 5 reveals those fields and the chips morph into
// them.

import sel from './_selectors.js';
import {
  loadGsap, ensureFont, customizeEngineCursor,
  mountSceneLayer, injectCss, playSfx, tlDone,
} from './_kit.js';

export const snapshot = 'wpforms-ai-builder-feedback-generated';
export const mode = 'parallel';
// Scene 3 now uses this same snapshot, so the chapter break is same-snapshot:
// no body-wipe, no iframe/mac-frame vanish. 'hold' suppresses the swoosh and
// any dolly so the handoff is silent and continuous.
export const breakStyle = 'hold';
export const swapStyle = 'fast';

// Real fields + form title hidden under cover so Scene 4 reads as a generating
// (visually empty) preview. Scene 5 reveals them.
const HIDE_SELECTORS = [
  sel.nameField,
  sel.emailField,
  sel.ratingField,
  sel.npsField,
  sel.likeField,
  sel.improveField,
  sel.sourceField,
  sel.submitButton,
  sel.previewTitle,
];

const IFRAME_PREP_CSS = `
.scene-fields-hidden {
  opacity: 0 !important;
  visibility: hidden !important;
  transition: none !important;
}
`;

export async function setup({ doc }) {
  if (!doc.getElementById('scene-fields-hide-css')) {
    const s = doc.createElement('style');
    s.id = 'scene-fields-hide-css';
    s.textContent = IFRAME_PREP_CSS;
    doc.head.appendChild(s);
  }
  HIDE_SELECTORS.forEach(selector => {
    const el = doc.querySelector(selector);
    if (el) el.classList.add('scene-fields-hidden');
  });
}

const FIELDS = [
  { label: 'Name',            icon: 'A' },
  { label: 'Email',           icon: '@' },
  { label: 'Rating',          icon: '★' },
  { label: 'Feedback',        icon: '"' },
  { label: 'Multiple Choice', icon: '☰' },
];

const PAGE_CSS = `
#scene4-overlay {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  color: #14161C;
}
#scene4-overlay .scene4-caption {
  position: fixed; left: 50%; top: 7vh;
  transform: translateX(-50%);
  font-size: clamp(26px, 2.2vw, 38px);
  font-weight: 600; letter-spacing: -0.02em; line-height: 1.2;
  color: #1A2238;
  text-align: center;
  opacity: 0;
  background: rgba(255,255,255,0.82);
  border-radius: 14px;
  padding: 12px 26px;
  box-shadow: 0 12px 32px -14px rgba(20,30,60,0.20);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  pointer-events: none;
}
#scene4-overlay .scene4-caption .accent {
  background: linear-gradient(96deg, #0399ED 8%, #056AAB 92%);
  -webkit-background-clip: text; background-clip: text;
  color: transparent; -webkit-text-fill-color: transparent;
  font-style: italic; font-weight: 700;
}
#scene4-overlay .field-chip {
  position: absolute;
  display: inline-flex; align-items: center; gap: 8px;
  padding: 9px 14px;
  border-radius: 9px;
  background: linear-gradient(180deg, #ffffff 0%, #f6f8fc 100%);
  border: 1px solid rgba(20,30,60,0.08);
  box-shadow:
    0 14px 30px -14px rgba(20,30,60,0.22),
    0 4px 10px -4px rgba(20,30,60,0.10);
  font-size: 14px; font-weight: 600; color: #14161C;
  letter-spacing: -0.01em;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
}
#scene4-overlay .chip-clip {
  position: fixed;
  overflow: hidden;
  pointer-events: none;
  border-radius: 30px;
}
#scene4-overlay .field-chip .chip-icon {
  width: 22px; height: 22px; border-radius: 6px;
  display: inline-flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, rgba(5,106,171,0.16), rgba(226,119,48,0.16));
  color: #056AAB;
  font-style: normal; font-weight: 700; font-size: 13px;
}
#scene4-overlay .scene4-scanline {
  position: fixed; height: 80px;
  background: linear-gradient(180deg,
    transparent 0%,
    rgba(5,106,171,0.20) 30%,
    rgba(3,153,237,0.32) 50%,
    rgba(226,119,48,0.18) 70%,
    transparent 100%);
  filter: blur(10px);
  opacity: 0;
  pointer-events: none;
  mix-blend-mode: screen;
}
#scene4-overlay .scene4-sparkle {
  position: fixed; width: 7px; height: 7px; border-radius: 50%;
  background: radial-gradient(closest-side, #fff 0%, rgba(255,178,90,0.85) 40%, transparent 75%);
  box-shadow: 0 0 12px 3px rgba(255,178,90,0.55);
  opacity: 0; pointer-events: none;
}
#scene4-overlay .land-flash {
  position: absolute; border-radius: 12px; pointer-events: none;
  background: radial-gradient(closest-side, rgba(5,106,171,0.55), rgba(255,178,90,0.30), transparent 70%);
  filter: blur(12px); opacity: 0;
  mix-blend-mode: screen;
}
`;

export default [
  {
    id: 'generation-burst',
    chapter: 'scene-4',
    effect: async ({ doc, sleep, zoomTo, cursor }) => {
      const gsap = await loadGsap();
      ensureFont();
      injectCss('scene4-page-css', PAGE_CSS);
      customizeEngineCursor();

      // Hide the cursor — Scene 4 lets the AI motion be the hero.
      try { await cursor.hide(); } catch (_) {}

      // Pull back to a wide shot of the AI builder.
      const wideZoom = zoomTo([sel.aiContentWrap], {
        level: 1.0, pad: 0, smooth: true, noScroll: true,
        scrollBehavior: 'auto', duration: 700,
      });

      // Editorial overlay layer (fixed-position children, not scaled with iframe).
      const overlay = mountSceneLayer('scene4-overlay', { z: 70 });
      gsap.set(overlay, { opacity: 1 });
      overlay.innerHTML = `
        <div class="scene4-scanline"></div>
        <div class="chip-clip"></div>
        <div class="scene4-caption">
          WPForms AI <span class="accent">builds the structure</span> for you.
        </div>
      `;
      const chipClip = overlay.querySelector('.chip-clip');
      const caption = overlay.querySelector('.scene4-caption');
      const scanline = overlay.querySelector('.scene4-scanline');

      await wideZoom;

      // Caption reveal (top blur-slide-down).
      gsap.fromTo(caption,
        { y: -22, opacity: 0, filter: 'blur(8px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.7, ease: 'expo.out' }
      );

      // Compute screen anchors for prompt origin and preview target. The
      // iframe content is CSS-scaled, so we account for that here.
      const ifr = document.querySelector('iframe.ui');
      const ifrRect = ifr.getBoundingClientRect();
      const sx = ifrRect.width / (ifr.offsetWidth || ifrRect.width);
      const sy = ifrRect.height / (ifr.offsetHeight || ifrRect.height);
      const toScreen = (rect) => ({
        cx: ifrRect.left + (rect.left + rect.width / 2) * sx,
        cy: ifrRect.top + (rect.top + rect.height / 2) * sy,
        left: ifrRect.left + rect.left * sx,
        top: ifrRect.top + rect.top * sy,
        w: rect.width * sx,
        h: rect.height * sy,
      });
      const promptEl = firstUsableElement(doc, [
        sel.promptInputBox,
        'wpforms-ai-chat[mode="forms"] .wpforms-ai-chat-message-input',
        sel.aiContentWrap,
      ]);
      const previewEl = firstUsableElement(doc, [
        // In this generated snapshot the old empty-state node still exists
        // but measures 0x0. Only accept candidates with real layout boxes or
        // the chip stack gets anchored to the page origin.
        sel.emptyState,
        '.wpforms-panel-empty-state',
        sel.previewPanel,
        '#wpforms-panel-ai-form .wpforms-panel-content-wrap',
        '.wpforms-panel-content',
      ]);
      const promptScreen = promptEl
        ? toScreen(promptEl.getBoundingClientRect())
        : { cx: ifrRect.right - 320, cy: ifrRect.bottom - 200, w: 360, h: 80, left: ifrRect.right - 500, top: ifrRect.bottom - 240 };
      const previewScreen = previewEl
        ? toScreen(previewEl.getBoundingClientRect())
        : { cx: ifrRect.left + ifrRect.width * 0.32, cy: ifrRect.top + ifrRect.height * 0.5, w: 420, h: 540, left: ifrRect.left + 160, top: ifrRect.top + 100 };
      const frameRect = getMacFrameRect();
      setClipToFrame(chipClip, frameRect);
      const promptClip = toClipPoint(promptScreen, frameRect);
      const previewClip = toClipArea(previewScreen, frameRect);

      // AI thinking — vertical scan line sweeps through the preview area +
      // soft sparkle ring around the prompt.
      gsap.set(scanline, {
        left: previewScreen.left,
        top: previewScreen.top - 40,
        width: previewScreen.w,
        opacity: 0,
      });
      const scanTl = gsap.timeline();
      scanTl.to(scanline, { opacity: 0.9, duration: 0.25, ease: 'power2.out' })
            .to(scanline, {
              top: previewScreen.top + previewScreen.h + 40,
              duration: 1.3, ease: 'power2.inOut',
            })
            .to(scanline, { opacity: 0, duration: 0.3, ease: 'power2.in' }, '>-0.2');

      sparkleBurst(overlay, promptScreen.cx, promptScreen.cy, gsap, 10, 90);
      playSfx('hover', { volume: 0.45 });

      await sleep(420);

      // Chip cascade — each chip starts 180ms after the previous; their
      // animations overlap so the whole burst stays under ~2.4s.
      const chipStack = layoutChipStack(previewClip, FIELDS.length);
      const chipTls = [];
      for (let i = 0; i < FIELDS.length; i++) {
        const tl = animateChip(chipClip, gsap, FIELDS[i], promptClip, chipStack[i]);
        chipTls.push(tl);
        playSfx(i === FIELDS.length - 1 ? 'pop-drop' : 'pop-ui',
          { volume: 0.45, rate: 0.92 + i * 0.05 });
        await sleep(180);
      }

      // Block until EVERY chip timeline has finished — otherwise chips are
      // still mid-flight when we record their iframe-content anchors below
      // and the recorded positions are wrong (chip ends up at top-left in
      // Scene 5 because the anchor was captured pre-landing).
      await Promise.all(chipTls.map(tl => tlDone(tl)));
      await sleep(10);

      // Caption fades up — but CHIPS DO NOT fade. Scene 5 shares this same
      // snapshot, so there is no body-wipe between chapters and the overlay
      // simply persists in <body> across the chapter break. Scene 5 picks
      // up the chips by id and morphs them into the real field rows.
      gsap.set(caption, { opacity: 0 });
      // Strip the caption + scanline so only the chip stack remains for Scene 5.
      caption.remove();
      scanline.remove();

      // Record each chip's anchor in iframe-content coordinates using the
      // deterministic chipStack[i] target — i.e. the planned final landing
      // position in screen coords at level 1.0. Scene 5 dives the camera to
      // level 1.25, so chips are reprojected per-frame using these anchors
      // so they ride the iframe transform instead of getting stranded
      // outside the mac-frame.
      const ifrRecord = document.querySelector('iframe.ui');
      if (ifrRecord) {
        const r0 = ifrRecord.getBoundingClientRect();
        const sxInv = ifrRecord.offsetWidth / r0.width;
        const syInv = ifrRecord.offsetHeight / r0.height;
        const chips = [...chipClip.querySelectorAll('.field-chip')];
        chips.forEach((chip, i) => {
          const target = chipStack[i];
          if (!target) return;
          const ix = (frameRect.left + target.cx - r0.left) * sxInv;
          const iy = (frameRect.top + target.cy - r0.top) * syInv;
          chip.dataset.iframeX = ix.toFixed(2);
          chip.dataset.iframeY = iy.toFixed(2);
        });
      }
      await sleep(1);
    },
    duration: 0.2,
  },
];

function layoutChipStack(area, count) {
  const positions = [];
  const startX = area.cx - 110;
  const totalH = (count - 1) * 54;
  const startY = area.cy - totalH / 2;
  for (let i = 0; i < count; i++) {
    positions.push({ cx: startX, cy: startY + i * 54 });
  }
  return positions;
}

function getMacFrameRect() {
  const frame = document.querySelector('.mac-frame');
  const r = frame?.getBoundingClientRect();
  if (r?.width && r?.height) return r;
  return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
}

function setClipToFrame(clip, frameRect) {
  if (!clip) return;
  Object.assign(clip.style, {
    left: frameRect.left + 'px',
    top: frameRect.top + 'px',
    width: frameRect.width + 'px',
    height: frameRect.height + 'px',
  });
}

function toClipPoint(point, frameRect) {
  return {
    ...point,
    cx: point.cx - frameRect.left,
    cy: point.cy - frameRect.top,
    left: (point.left ?? point.cx) - frameRect.left,
    top: (point.top ?? point.cy) - frameRect.top,
  };
}

function toClipArea(area, frameRect) {
  return {
    ...area,
    cx: area.cx - frameRect.left,
    cy: area.cy - frameRect.top,
    left: area.left - frameRect.left,
    top: area.top - frameRect.top,
  };
}

function firstUsableElement(doc, selectors) {
  for (const selector of selectors) {
    const candidates = [...doc.querySelectorAll(selector)];
    const visible = candidates.find((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 20 && r.height > 20;
    });
    if (visible) return visible;
  }
  return null;
}

function animateChip(layer, gsap, field, origin, target) {
  const chip = document.createElement('div');
  chip.className = 'field-chip';
  chip.innerHTML = `<span class="chip-icon">${field.icon}</span><span>${field.label}</span>`;
  layer.appendChild(chip);

  const startX = origin.cx - 60 + (Math.random() - 0.5) * 60;
  const startY = origin.cy - 30 + (Math.random() - 0.5) * 28;
  gsap.set(chip, {
    left: startX, top: startY,
    xPercent: -50, yPercent: -50,
    opacity: 0, scale: 0.85, filter: 'blur(10px)',
  });

  // Curved 2-stage flight: rise to a midpoint above, then drop into target.
  const midX = (startX + target.cx) / 2 + (Math.random() - 0.5) * 60;
  const midY = Math.min(startY, target.cy) - 90 + Math.random() * 20;

  const tl = gsap.timeline();
  tl.to(chip, {
    opacity: 1, scale: 1, filter: 'blur(0px)',
    duration: 0.32, ease: 'power3.out',
  });
  tl.to(chip, {
    left: midX, top: midY,
    duration: 0.45, ease: 'power2.out',
  }, '>-0.1');
  tl.to(chip, {
    left: target.cx, top: target.cy,
    duration: 0.5, ease: 'power2.in',
    onComplete: () => spawnLandFlash(layer, target.cx, target.cy, gsap),
  });
  tl.to(chip, {
    scale: 1.06,
    duration: 0.16, ease: 'back.out(2.0)',
  }, '>-0.05');
  tl.to(chip, {
    scale: 1,
    duration: 0.45, ease: 'elastic.out(1, 0.7)',
  });
  return tl;
}

function spawnLandFlash(layer, cx, cy, gsap) {
  const flash = document.createElement('div');
  flash.className = 'land-flash';
  Object.assign(flash.style, {
    left: (cx - 100) + 'px',
    top: (cy - 22) + 'px',
    width: '200px',
    height: '44px',
  });
  layer.appendChild(flash);
  gsap.timeline()
    .to(flash, { opacity: 1, duration: 0.16, ease: 'power2.out' })
    .to(flash, { opacity: 0, scale: 1.4, duration: 0.42, ease: 'power2.in' })
    .call(() => flash.remove());
}

function sparkleBurst(layer, cx, cy, gsap, count = 10, radius = 80) {
  for (let i = 0; i < count; i++) {
    const sp = document.createElement('div');
    sp.className = 'scene4-sparkle';
    layer.appendChild(sp);
    const angle = (Math.PI * 2) * (i / count) + Math.random() * 0.4;
    const r = radius + Math.random() * 60;
    const tx = cx + Math.cos(angle) * r;
    const ty = cy + Math.sin(angle) * r;
    gsap.set(sp, { left: cx - 3, top: cy - 3, opacity: 0, scale: 0.3 });
    gsap.timeline({ delay: i * 0.045 })
      .to(sp, { opacity: 0.9, scale: 1, duration: 0.25, ease: 'power2.out' })
      .to(sp, { left: tx, top: ty, duration: 0.6, ease: 'power3.out' }, '<')
      .to(sp, { opacity: 0, scale: 0.3, duration: 0.3, ease: 'power2.in' }, '>-0.1')
      .call(() => sp.remove());
  }
}
