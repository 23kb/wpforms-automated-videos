// Scene 3 — AI prompt modal opens, typewriter prompt, Generate click (~5s).
//
// Hand-off from Scene 2: cursor was settled on the Generate Form button on
// the builder-setup snapshot. We:
//   1. Swap to wpforms-ai-builder-empty (the AI builder open state).
//   2. Pre-stage the AI panel scaled-down + faded under the swap cover.
//   3. After cover drops, animate the panel into place (scale 0.78 → 1,
//      opacity 0 → 1, y 20 → 0, back.out) and ramp a backdrop blur layer.
//   4. Glide cursor into the prompt input → focus glow → typewriter
//      "Create a customer feedback form for my restaurant."
//   5. Send button picks up an animated orange-glow pulse + AI particles
//      drift toward it.
//   6. Cursor magnetics into Send → click (ripple + sound auto-fire).
//   7. Hand off to Scene 4 (AI generation burst).

import sel from './_selectors.js';
import {
  loadGsap, ensureFont, customizeEngineCursor,
  mountSceneLayer, injectCss, playSfx, tlDone,
} from './_kit.js';

// Same snapshot as Scene 4 so the chapter break is same-snapshot (no body-wipe,
// no iframe/mac-frame vanish). The generated form fields are hidden in setup
// so the preview side reads as empty during Scene 3; Scene 4 reveals them.
export const snapshot = 'wpforms-ai-builder-feedback-generated';
export const mode = 'parallel';
export const breakStyle = 'soft-dolly';
export const swapStyle = 'fast';

// Mirrors Scene 4's hide list so the generated preview reads as empty during
// the prompt phase. Scene 4 reveals these via the chip-cascade morph.
const SCENE3_HIDE_SELECTORS = [
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

const SCENE3_HIDE_CSS = `
.scene-fields-hidden {
  opacity: 0 !important;
  visibility: hidden !important;
  transition: none !important;
}
`;

const IFRAME_CSS = `
#wpforms-panel-ai-form .wpforms-panel-content-wrap {
  transform-origin: 50% 28%;
  will-change: transform, opacity;
}
/* Scene 3 depth-of-field — blur the periphery (sidebar + form-preview empty
   state) so the prompt panel reads as the focal point. The prompt area itself
   is intentionally NOT blurred. */
.wpforms-panel-sidebar.scene3-bg-blur,
.wpforms-panel-empty-state.scene3-bg-blur {
  filter: blur(5px) saturate(0.9) brightness(1.02);
  transition: filter 520ms cubic-bezier(.2,.8,.2,1);
}
.wpforms-panel-sidebar,
.wpforms-panel-empty-state {
  transition: filter 520ms cubic-bezier(.2,.8,.2,1);
}
.wpforms-ai-chat-message-input.scene3-typing {
  outline: 2px solid rgba(5,106,171,0.55);
  outline-offset: 4px;
  box-shadow:
    0 0 0 6px rgba(5,106,171,0.14),
    0 10px 26px -12px rgba(5,106,171,0.28);
  border-radius: 8px;
  transition: outline-color 240ms ease, box-shadow 240ms ease;
}
.wpforms-ai-chat-send.scene3-glow {
  position: relative;
  animation: scene3SendPulse 1.4s cubic-bezier(.4,0,.6,1) infinite !important;
}
@keyframes scene3SendPulse {
  0%, 100% {
    box-shadow:
      0 0 0 2px rgba(226,119,48,0.40),
      0 0 14px 3px rgba(226,119,48,0.30),
      0 0 30px 8px rgba(226,119,48,0.16) !important;
  }
  50% {
    box-shadow:
      0 0 0 2px rgba(226,119,48,0.55),
      0 0 22px 6px rgba(226,119,48,0.50),
      0 0 44px 12px rgba(226,119,48,0.26) !important;
  }
}
`;

const PAGE_CSS = `
#scene3-overlay {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}
#scene3-overlay .ai-particle {
  position: fixed; width: 7px; height: 7px; border-radius: 50%;
  background: radial-gradient(closest-side, #fff 0%, rgba(255,178,90,0.85) 40%, transparent 75%);
  box-shadow: 0 0 12px 3px rgba(255,178,90,0.55);
  opacity: 0; pointer-events: none;
}
`;

export async function setup({ doc }) {
  // Inject in-iframe styles for typing glow + send-button pulse, and pre-stage
  // the AI panel under the cover so the modal-entry animation is a tween from
  // a scaled-down state instead of a hard reveal.
  if (!doc.getElementById('scene3-iframe-css')) {
    const s = doc.createElement('style');
    s.id = 'scene3-iframe-css';
    s.textContent = IFRAME_CSS;
    doc.head.appendChild(s);
  }
  // Hide the generated form fields so the preview side reads as empty during
  // Scene 3. Scene 4 keeps them hidden through the burst, then Scene 5 reveals
  // them via the chip-cascade morph.
  if (!doc.getElementById('scene-fields-hide-css')) {
    const s = doc.createElement('style');
    s.id = 'scene-fields-hide-css';
    s.textContent = SCENE3_HIDE_CSS;
    doc.head.appendChild(s);
  }
  for (const selector of SCENE3_HIDE_SELECTORS) {
    const el = doc.querySelector(selector);
    if (el) el.classList.add('scene-fields-hidden');
  }
  const wrap = doc.querySelector(sel.aiContentWrap);
  if (wrap) {
    wrap.style.transform = 'translateY(20px) scale(0.78)';
    wrap.style.opacity = '0';
  }
}

export default [
  {
    id: 'modal-and-prompt',
    chapter: 'scene-3',
    // No beat-level camera: the runner's zoomTo can't accept a custom duration
    // and would snap or use the 1200ms default. We call zoomTo manually inside
    // the effect to drive a fast 600ms smooth glide to level 2.1.
    effect: async ({ doc, cursor, sleep, type, zoomTo }) => {
      const gsap = await loadGsap();
      ensureFont();
      injectCss('scene3-page-css', PAGE_CSS);
      customizeEngineCursor();

      const overlay = mountSceneLayer('scene3-overlay', { z: 60 });
      gsap.set(overlay, { opacity: 1 });

      // Depth-of-field: blur the sidebar + empty-state preview so the prompt
      // panel reads as the focal point. The prompt area stays crisp.
      const sidebar = doc.querySelector(sel.aiSidebar);
      const emptyState = doc.querySelector(sel.emptyState);
      if (sidebar) sidebar.classList.add('scene3-bg-blur');
      if (emptyState) emptyState.classList.add('scene3-bg-blur');

      // Modal entry — panel tweens from scale 0.78 / y 20 / opacity 0 to normal.
      const wrap = doc.querySelector(sel.aiContentWrap);
      if (wrap) {
        gsap.to(wrap, {
          y: 0, scale: 1, opacity: 1,
          duration: 0.75, ease: 'back.out(1.5)',
        });
      }

      // Fast 600ms smooth camera glide to level 2.1 onto the prompt input box,
      // running in parallel with the modal-entry tween above so the camera
      // arrives just as the panel settles.
      const zoomP = zoomTo([sel.promptInputBox], {
        level: 2.1,
        pad: 24,
        smooth: true,
        noScroll: true,
        scrollBehavior: 'auto',
        duration: 600,
      });

      await Promise.all([zoomP]);
      await sleep(80);

      // Cursor into the prompt input.
      await cursor.glideTo(sel.promptInput, { wait: 380 });
      const inputBox = doc.querySelector(sel.promptInput)?.closest('.wpforms-ai-chat-message-input');
      if (inputBox) inputBox.classList.add('scene3-typing');
      await cursor.click();

      // Typewriter prompt — type() auto-fires per-keystroke SFX via runtime.
      await type(sel.promptInput, 'Create a customer feedback form for my restaurant.', {
        cps: 42,
        clear: true,
      });

      await sleep(180);

      // Send button pulse glow + AI particles drift toward it.
      const sendBtn = doc.querySelector(sel.sendPrompt);
      if (sendBtn) {
        sendBtn.classList.add('scene3-glow');
        playSfx('hover', { volume: 0.45 });
        spawnAIParticlesTo(overlay, sendBtn, gsap);
      }
      if (inputBox) inputBox.classList.remove('scene3-typing');

      await sleep(420);

      // Cursor glides to Send and clicks in a single motion — no instruction
      // tooltip, no preliminary glideTo wait. Magnetic lift + click ripple +
      // click sound auto-fire from the engine clickOn.
      await cursor.clickOn(sel.sendPrompt, {
        dispatch: false,
        magnetic: true,
      });

      await sleep(200);

      // Clear the depth-of-field blur — Scene 4 will handle its own treatment.
      if (sidebar) sidebar.classList.remove('scene3-bg-blur');
      if (emptyState) emptyState.classList.remove('scene3-bg-blur');

      const exit = gsap.timeline();
      exit.to(overlay, { opacity: 0, duration: 0.4, ease: 'power2.in' });
      await tlDone(exit);
      overlay.remove();
      await sleep(40);
    },
    duration: 0.2,
  },
];

// Spawns ~14 small particles at random offsets around the send button and
// animates them drifting toward its center, fading out on arrival. Position
// math accounts for iframe transform so the particles land on the visible
// button regardless of the camera zoom level.
function spawnAIParticlesTo(layer, targetEl, gsap) {
  const ifr = document.querySelector('iframe.ui');
  if (!ifr || !targetEl) return;
  const r = targetEl.getBoundingClientRect();
  const ifrRect = ifr.getBoundingClientRect();
  const sx = ifrRect.width / (ifr.offsetWidth || ifrRect.width);
  const sy = ifrRect.height / (ifr.offsetHeight || ifrRect.height);
  const tx = ifrRect.left + (r.left + r.width / 2) * sx;
  const ty = ifrRect.top + (r.top + r.height / 2) * sy;
  for (let i = 0; i < 14; i++) {
    const p = document.createElement('div');
    p.className = 'ai-particle';
    layer.appendChild(p);
    const startX = tx + (Math.random() - 0.5) * 380;
    const startY = ty + (Math.random() - 0.5) * 220 - 30;
    gsap.set(p, { left: startX - 3, top: startY - 3, opacity: 0, scale: 0.3 });
    gsap.timeline({ delay: i * 0.045 })
      .to(p, { opacity: 1, scale: 1, duration: 0.25, ease: 'power2.out' })
      .to(p, { left: tx - 3, top: ty - 3, duration: 0.7, ease: 'power3.in' }, '<')
      .to(p, { opacity: 0, scale: 0.4, duration: 0.25, ease: 'power2.in' }, '>-0.15')
      .call(() => p.remove());
  }
}
