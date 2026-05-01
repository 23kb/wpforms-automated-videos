// Scene 1 — Cold open / Hook (~4s).
//
// Pure editorial overlay over the builder-setup snapshot. Kinetic kicker text
// "Build forms / with AI / in seconds." with word-by-word reveal, gradient
// pop, sparkles around "AI", and a soft snap on the payoff line. Exits by
// sliding the text up and fading the gradient layer to reveal the snapshot
// underneath, ready for Scene 2.

import { loadGsap, mountSceneLayer, injectCss, playSfx, splitText, tlDone, ensureFont } from './_kit.js';

export const snapshot = 'builder-setup';
export const mode = 'parallel';
export const breakStyle = 'soft-dolly';
export const swapStyle = 'fast'; // fast keeps the cold-open snappy; the editorial gradient layer covers the snapshot anyway

// Silence every transition/swap swoosh + swipe + swoosh-entry across the whole
// video. Setup runs before the first chapter break + before any swap fires, so
// muting volumes here is enough — no per-chapter hooks needed.
export async function setup() {
  try {
    const cfg = await import('../../../runtime/overlays-config.js');
    if (cfg?.OVERLAYS_CONFIG?.sfx) {
      if (cfg.OVERLAYS_CONFIG.sfx.swoosh) cfg.OVERLAYS_CONFIG.sfx.swoosh.volume = 0;
      if (cfg.OVERLAYS_CONFIG.sfx.swooshEntry) cfg.OVERLAYS_CONFIG.sfx.swooshEntry.volume = 0;
      if (cfg.OVERLAYS_CONFIG.sfx.swipe) cfg.OVERLAYS_CONFIG.sfx.swipe.volume = 0;
    }
  } catch (_) {}
}

const CSS = `
#scene1-hook {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  color: #14161C;
  background:
    radial-gradient(60% 50% at 22% 28%, rgba(5,106,171,.20), transparent 60%),
    radial-gradient(55% 50% at 78% 72%, rgba(3,153,237,.18), transparent 65%),
    radial-gradient(40% 40% at 50% 50%, rgba(255,255,255,.92), transparent 70%),
    linear-gradient(180deg, #fbfdff 0%, #eef4fb 100%);
}
#scene1-hook .frags { position:absolute; inset:0; }
#scene1-hook .frag {
  position:absolute; border-radius: 18px;
  background: linear-gradient(180deg, rgba(255,255,255,.92), rgba(245,248,255,.78));
  box-shadow: 0 28px 70px -22px rgba(20,30,60,.20), 0 8px 22px -10px rgba(20,30,60,.10);
  filter: blur(8px); border: 1px solid rgba(20,30,60,.05);
}
#scene1-hook .frag.b { filter: blur(14px); opacity: .75; }
#scene1-hook .stage-text {
  position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
  flex-direction:column; gap: 6px; padding: 0 6vw; text-align:center;
}
#scene1-hook h1 {
  margin: 0; font-weight: 700; letter-spacing: -0.035em; line-height: 1.0;
  font-size: clamp(70px, 9vw, 144px);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  font-variation-settings: 'wght' 720, 'opsz' 96;
}
#scene1-hook h1.line2 {
  display: inline-block;
  padding: 0 0.16em;
  margin: 0 -0.16em;
  font-weight: 700;
  background: linear-gradient(96deg, #0399ED 8%, #056AAB 50%, #E27730 94%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  font-style: italic;
}
#scene1-hook h1.line3 {
  font-size: clamp(58px, 7.2vw, 116px);
  color:#0E1320;
}
#scene1-hook .sw-char { display: inline-block; will-change: transform, opacity, filter; }
#scene1-hook .ai-glow {
  position:absolute; width: 420px; height: 420px; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(255,178,90,.55), rgba(5,106,171,.28), transparent 70%);
  filter: blur(28px); opacity: 0; pointer-events:none;
}
#scene1-hook .sparkle {
  position:absolute; width:10px; height:10px; border-radius:50%;
  background: radial-gradient(closest-side, #fff 0%, #ffd9a8 35%, transparent 70%);
  box-shadow: 0 0 14px 4px rgba(255,200,140,.55); opacity: 0; pointer-events:none;
}
`;

export default [
  {
    id: 'hook',
    chapter: 'scene-1',
    effect: async ({ sleep }) => {
      const gsap = await loadGsap();
      ensureFont();
      injectCss('scene1-css', CSS);
      const layer = mountSceneLayer('scene1-hook', { z: 90 });
      layer.innerHTML = `
        <div class="frags">
          <div class="frag"   style="left:5%;  top:14%;  width:300px; height:180px;"></div>
          <div class="frag b" style="right:7%; top:10%;  width:240px; height:150px;"></div>
          <div class="frag"   style="left:12%; bottom:14%; width:260px; height:160px;"></div>
          <div class="frag b" style="right:11%; bottom:18%; width:320px; height:180px;"></div>
          <div class="frag b" style="left:42%;  top:6%;   width:200px; height:130px;"></div>
          <div class="frag b" style="left:38%;  bottom:8%; width:180px; height:120px;"></div>
        </div>
        <div class="ai-glow"></div>
        <div class="stage-text">
          <h1 class="line1">Build forms</h1>
          <h1 class="line2">with AI</h1>
          <h1 class="line3">in seconds.</h1>
        </div>
      `;

      const line1 = layer.querySelector('.line1');
      const line2 = layer.querySelector('.line2');
      const line3 = layer.querySelector('.line3');
      const aiGlow = layer.querySelector('.ai-glow');
      const frags = layer.querySelectorAll('.frag');

      // Only line 1 splits into chars (word-by-word, char-by-char reveal).
      // Lines 2 and 3 animate as whole elements so the gradient text fill on
      // line 2 renders correctly and the snap on line 3 reads as one unit.
      const s1 = splitText(line1);
      gsap.set(s1.chars, { y: 30, opacity: 0, filter: 'blur(8px)' });
      gsap.set(line2, { y: 24, opacity: 0, scale: 0.94, filter: 'blur(6px)' });
      gsap.set(line3, { y: 20, opacity: 0, scale: 0.92, filter: 'blur(5px)' });
      gsap.set(frags, { y: 50, opacity: 0, scale: 0.9 });

      const tl = gsap.timeline();

      tl.to(layer, { opacity: 1, duration: 0.35, ease: 'power2.out' }, 0);

      tl.to(frags, {
        y: 0, opacity: 1, scale: 1,
        duration: 1.0, ease: 'power3.out', stagger: 0.07,
      }, 0);

      tl.to(s1.chars, {
        y: 0, opacity: 1, filter: 'blur(0px)',
        duration: 0.65, ease: 'expo.out', stagger: 0.022,
      }, 0.18);

      // Line 2: pops in as a whole — gradient text fill, scale + blur clear,
      // sparkles burst around it, soft AI glow blooms behind.
      tl.to(line2, {
        y: 0, opacity: 1, scale: 1, filter: 'blur(0px)',
        duration: 0.7, ease: 'back.out(1.5)',
        onStart: () => {
          // Position glow behind line2 once it's mounted (use rAF to wait one frame).
          requestAnimationFrame(() => {
            const r = line2.getBoundingClientRect();
            gsap.set(aiGlow, { left: r.left + r.width/2 - 210, top: r.top + r.height/2 - 210 });
            spawnSparkles(layer, line2, gsap);
          });
        },
      }, '>-0.1')
      .to(aiGlow, { opacity: 1, scale: 1.08, duration: 0.7, ease: 'power2.out' }, '<');

      // Line 3: snap with overshoot — fast scale 0.92→1 + tiny y rise + blur clear.
      tl.to(line3, {
        y: 0, opacity: 1, scale: 1, filter: 'blur(0px)',
        duration: 0.55, ease: 'back.out(2.2)',
      }, '>-0.05');

      tl.to({}, { duration: 0.55 });

      tl.to([line1, line2, line3], {
        y: -70, opacity: 0, filter: 'blur(6px)',
        duration: 0.55, ease: 'power3.in', stagger: 0.04,
      }, '+=0.05')
      .to(aiGlow, { opacity: 0, duration: 0.4, ease: 'power2.in' }, '<')
      .to(frags, {
        y: -28, opacity: 0, duration: 0.5, ease: 'power3.in', stagger: 0.025,
      }, '<')
      .to(layer, { opacity: 0, duration: 0.45, ease: 'power2.in' }, '<+0.1');

      await tlDone(tl);
      layer.remove();
      await sleep(60);
    },
    duration: 0.2,
  },
];

function spawnSparkles(layer, refEl, gsap) {
  const r = refEl.getBoundingClientRect();
  const cx = r.left + r.width/2;
  const cy = r.top + r.height/2;
  for (let i = 0; i < 16; i++) {
    const sp = document.createElement('div');
    sp.className = 'sparkle';
    layer.appendChild(sp);
    const angle = (Math.PI * 2) * (i / 16) + Math.random() * 0.4;
    const radius = 100 + Math.random() * 220;
    const tx = cx + Math.cos(angle) * radius - 5;
    const ty = cy + Math.sin(angle) * radius - 5;
    gsap.set(sp, { left: cx - 5, top: cy - 5, opacity: 0, scale: 0.3 });
    gsap.timeline()
      .to(sp, { left: tx, top: ty, opacity: 1, scale: 1.25, duration: 0.55, ease: 'power3.out' })
      .to(sp, { opacity: 0, scale: 0.3, duration: 0.55, ease: 'power2.in' }, '+=0.1')
      .call(() => sp.remove());
  }
}
