// Scene 10 - The Form Crystalizes.
//
// Bridges the standalone HyperFrames composition into the existing WPForms
// player without changing runtime/core. The composition itself lives at:
// hyperframes/wpforms-ai-scene-10/index.html

import {
  mountSceneLayer,
  injectCss,
} from './_kit.js';
import { stopBGM } from '/scenes/shared.js';

export const snapshot = 'wpforms-ai-builder-feedback-generated';
export const mode = 'parallel';
export const breakStyle = 'soft-dolly';
export const swapStyle = 'cover';

const PAGE_CSS = `
#scene10-hyperframes {
  position: fixed;
  inset: 0;
  z-index: 120;
  overflow: hidden;
  background: #f7fbff;
}
#scene10-hyperframes iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  background: #f7fbff;
}
`;

function waitForIframe(iframe) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Scene 10 HyperFrames iframe timed out')), 8000);
    iframe.addEventListener('load', () => {
      clearTimeout(timer);
      resolve();
    }, { once: true });
  });
}

function playComposition(iframe) {
  const win = iframe.contentWindow;
  const timelines = win?.__timelines;
  const timeline = timelines?.['wpforms-ai-scene-10'] || (Array.isArray(timelines) ? timelines[0] : null);
  if (!timeline) throw new Error('Scene 10 HyperFrames timeline was not registered');
  timeline.pause(0);
  timeline.play(0);
  const fadeAtMs = Math.max(0, (timeline.duration() - 0.48) * 1000);
  setTimeout(() => { stopBGM(1250).catch(() => {}); }, fadeAtMs);
  return new Promise((resolve) => timeline.eventCallback('onComplete', resolve));
}

export default [
  {
    id: 'form-crystallizes',
    chapter: 'scene-10',
    effect: async ({ cursor }) => {
      try { await cursor.hide(); } catch (_) {}

      injectCss('scene10-hyperframes-css', PAGE_CSS);
      const layer = mountSceneLayer('scene10-hyperframes', { z: 120 });
      layer.style.opacity = '1';
      layer.innerHTML = '<iframe title="WPForms AI form crystallizes" src="/hyperframes/wpforms-ai-scene-10/index.html"></iframe>';

      const iframe = layer.querySelector('iframe');
      await waitForIframe(iframe);
      await playComposition(iframe);
    },
    duration: 0.2,
  },
];
