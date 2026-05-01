// Scene 8 — Feature burst / capability orbit (~6s).
//
// Announcement-style capability fan-out over the completed WPForms AI UI.
// The product stays centered and slightly scaled down while feature cards
// burst from the form center into a radial orbit with depth, stagger, and
// cursor-hover pulses.

import sel from './_selectors.js';
import {
  loadGsap, ensureFont, customizeEngineCursor,
  mountSceneLayer, injectCss, playSfx, tlDone,
} from './_kit.js';

export const snapshot = 'wpforms-ai-builder-feedback-generated';
export const mode = 'parallel';
export const breakStyle = 'soft-dolly';
export const swapStyle = 'cover';

const FEATURES = [
  { title: 'AI Form Generation', label: 'Idea to draft', icon: 'wand', angle: 0, depth: 1.10, hero: true },
  { title: 'AI Choices', label: 'Options in seconds', icon: 'list', angle: -145, depth: 1 },
  { title: 'Conversational Edits', label: 'Refine with words', icon: 'chat', angle: -92, depth: 1 },
  { title: 'Smart Validation', label: 'Cleaner data', icon: 'shield', angle: -38, depth: 1 },
  { title: 'Translations', label: 'Go multilingual', icon: 'globe', angle: 12, depth: 1 },
  { title: 'Calculations', label: 'Smarter totals', icon: 'calculator', angle: 64, depth: 1 },
  { title: 'Live Preview', label: 'See it instantly', icon: 'eye', angle: 116, depth: 1 },
  { title: 'Ready to Publish', label: 'Launch faster', icon: 'rocket', angle: 168, depth: 1 },
];

const ORBIT_RADIUS_X = 390;
const ORBIT_RADIUS_Y = 230;

function featureIcon(name) {
  const icons = {
    wand: '<path d="M4 20l10.5-10.5"/><path d="M13 7l4 4"/><path d="M16.5 3.5l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1z"/><path d="M6.5 4.5l.45 1.35 1.35.45-1.35.45-.45 1.35-.45-1.35-1.35-.45 1.35-.45.45-1.35z"/>',
    list: '<path d="M8 7h11"/><path d="M8 12h11"/><path d="M8 17h11"/><path d="M4.5 7h.01"/><path d="M4.5 12h.01"/><path d="M4.5 17h.01"/>',
    chat: '<path d="M5 6.5h14v9H9l-4 3v-12z"/><path d="M8.5 10h7"/><path d="M8.5 13h4.8"/>',
    shield: '<path d="M12 3.5l7 2.7v5.2c0 4.2-2.8 7.7-7 9.1-4.2-1.4-7-4.9-7-9.1V6.2l7-2.7z"/><path d="M8.6 12.1l2.2 2.2 4.8-5"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.8 12h16.4"/><path d="M12 3.5c2.1 2.3 3.1 5.1 3.1 8.5s-1 6.2-3.1 8.5"/><path d="M12 3.5C9.9 5.8 8.9 8.6 8.9 12s1 6.2 3.1 8.5"/>',
    calculator: '<rect x="6" y="3.8" width="12" height="16.4" rx="2.2"/><path d="M8.8 7.2h6.4"/><path d="M9 11h.01"/><path d="M12 11h.01"/><path d="M15 11h.01"/><path d="M9 14h.01"/><path d="M12 14h.01"/><path d="M15 14h.01"/><path d="M9 17h.01"/><path d="M12 17h.01"/><path d="M15 17h.01"/>',
    eye: '<path d="M3.5 12s3.1-5.5 8.5-5.5 8.5 5.5 8.5 5.5-3.1 5.5-8.5 5.5S3.5 12 3.5 12z"/><circle cx="12" cy="12" r="2.6"/>',
    rocket: '<path d="M13.5 4.2c2.5-.9 4.8-.7 6.3.1.8 1.5 1 3.8.1 6.3-1.1 3.1-3.7 5.6-7.8 7.4l-6.1-6.1c1.8-4.1 4.3-6.7 7.5-7.7z"/><path d="M8.2 15.8l-2.7 2.7"/><path d="M5.8 12.3l-2.3.8 3.4 3.4.8-2.3"/><path d="M11.7 18.2l-.8 2.3 3.4-3.4-.8-2.3"/><circle cx="15.5" cy="8.5" r="1.6"/>',
  };
  return `<svg class="icon-svg icon-${name}" viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.wand}</svg>`;
}

function addIconMicroAnimation(tl, { iconSvg, badge, kind, at }) {
  if (!iconSvg || !badge) return;
  if (kind === 'wand') {
    const sparkles = iconSvg.querySelectorAll('path:nth-child(n+3)');
    tl.fromTo(sparkles, { opacity: 0.35, scale: 0.72, transformOrigin: 'center' }, {
      opacity: 1,
      scale: 1.12,
      duration: 0.18,
      stagger: 0.04,
      yoyo: true,
      repeat: 1,
      ease: 'sine.inOut',
    }, at);
    return;
  }
  if (kind === 'list') {
    const lines = iconSvg.querySelectorAll('path:nth-child(-n+3)');
    tl.fromTo(lines, { scaleX: 0.28, transformOrigin: 'left center' }, {
      scaleX: 1,
      duration: 0.26,
      stagger: 0.035,
      ease: 'power2.out',
    }, at);
    return;
  }
  if (kind === 'chat') {
    tl.fromTo(iconSvg, { scale: 0.9, transformOrigin: 'center' }, {
      scale: 1.06,
      duration: 0.16,
      yoyo: true,
      repeat: 1,
      ease: 'sine.inOut',
    }, at);
    return;
  }
  if (kind === 'shield') {
    const check = iconSvg.querySelector('path:nth-child(2)');
    tl.fromTo(check, { strokeDasharray: 12, strokeDashoffset: 12 }, {
      strokeDashoffset: 0,
      duration: 0.28,
      ease: 'power2.out',
    }, at);
    return;
  }
  if (kind === 'rocket') {
    tl.to(iconSvg, {
      y: -3,
      duration: 0.16,
      yoyo: true,
      repeat: 1,
      ease: 'sine.inOut',
    }, at);
    return;
  }
  if (kind === 'eye') {
    tl.fromTo(iconSvg, { scaleY: 0.72, transformOrigin: 'center' }, {
      scaleY: 1,
      duration: 0.22,
      ease: 'back.out(1.6)',
    }, at);
    return;
  }
  if (kind === 'calculator') {
    const dots = iconSvg.querySelectorAll('path:nth-child(n+3)');
    tl.fromTo(dots, { opacity: 0.55 }, {
      opacity: 1,
      duration: 0.16,
      stagger: 0.018,
      ease: 'sine.inOut',
    }, at);
    return;
  }
  if (kind === 'globe') {
    tl.fromTo(iconSvg, { rotate: -5, transformOrigin: 'center' }, {
      rotate: 0,
      duration: 0.3,
      ease: 'power2.out',
    }, at);
  }
}

const PAGE_CSS = `
#scene8-overlay {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  color: #14161C;
}
#scene8-overlay .scene8-vignette {
  position: fixed; inset: 0;
  background:
    radial-gradient(44% 40% at 50% 50%, rgba(255,255,255,.08), rgba(246,249,253,.46) 62%, rgba(235,241,249,.78) 100%),
    radial-gradient(30% 24% at 70% 34%, rgba(5,106,171,.22), transparent 70%),
    radial-gradient(28% 24% at 31% 70%, rgba(226,119,48,.18), transparent 72%);
  pointer-events: none;
  opacity: 0;
}
#scene8-overlay .scene8-caption {
  position: fixed; left: 50%; top: 6.5vh;
  transform: translateX(-50%);
  max-width: min(660px, 70vw);
  font-size: clamp(21px, 1.72vw, 30px);
  font-weight: 650; letter-spacing: -0.02em; line-height: 1.15;
  color: #1A2238;
  text-align: center;
  opacity: 0;
  background: rgba(255,255,255,0.68);
  border: 1px solid rgba(255,255,255,.78);
  border-radius: 14px;
  padding: 13px 34px;
  box-shadow:
    0 18px 42px -24px rgba(20,30,60,0.30),
    0 8px 20px -18px rgba(5,106,171,.22),
    inset 0 1px 0 rgba(255,255,255,.95);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  pointer-events: none;
}
#scene8-overlay .scene8-central-glow {
  position: fixed;
  left: 50%;
  top: 50%;
  width: min(660px, 58vw);
  height: min(440px, 46vh);
  transform: translate(-50%, -50%);
  border-radius: 999px;
  background:
    radial-gradient(closest-side, rgba(126, 92, 255, .16), rgba(126, 92, 255, .055) 46%, transparent 74%),
    radial-gradient(closest-side at 44% 42%, rgba(3, 153, 237, .15), transparent 68%);
  filter: blur(18px);
  opacity: 0;
  pointer-events: none;
  z-index: 0;
}
#scene8-overlay .scene8-caption .accent {
  background: linear-gradient(96deg, #0399ED 8%, #056AAB 50%, #E27730 96%);
  -webkit-background-clip: text; background-clip: text;
  color: transparent; -webkit-text-fill-color: transparent;
  font-style: italic; font-weight: 760;
}
#scene8-overlay .scene8-orbit {
  position: fixed;
  left: 50%;
  top: 50%;
  width: 1px;
  height: 1px;
  pointer-events: none;
  z-index: 2;
}
#scene8-overlay .feature-card {
  position: absolute;
  left: 0;
  top: 0;
  width: 198px;
  min-height: 78px;
  transform: translate(-50%, -50%);
  display: grid;
  grid-template-columns: 46px 1fr;
  gap: 13px;
  align-items: center;
  padding: 14px 15px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.75);
  background: rgba(255,255,255,.72);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow:
    0 22px 44px -24px rgba(20,30,60,.30),
    0 10px 24px -18px rgba(5,106,171,.20),
    inset 0 1px 0 rgba(255,255,255,.92),
    inset 0 18px 28px -26px rgba(255,255,255,.95);
  opacity: 0;
  will-change: transform, opacity, filter;
}
#scene8-overlay .feature-card.is-back {
  filter: blur(.5px);
  opacity: .82;
}
#scene8-overlay .feature-card .icon {
  width: 46px; height: 46px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #0399ED 0%, #2C7BDA 68%, #E27730 100%);
  box-shadow:
    0 14px 26px -15px rgba(5,106,171,.86),
    0 8px 18px -14px rgba(226,119,48,.46),
    inset 0 1px 0 rgba(255,255,255,.48),
    inset 0 -10px 18px -16px rgba(20,30,60,.55);
  overflow: hidden;
  opacity: 0;
  will-change: transform, opacity;
}
#scene8-overlay .feature-card .icon svg {
  width: 24px;
  height: 24px;
  stroke: currentColor;
  stroke-width: 2.15;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
  opacity: 0;
  transform: translateY(4px);
  will-change: transform, opacity;
}
#scene8-overlay .feature-card .copy {
  will-change: transform, opacity;
}
#scene8-overlay .feature-card h3 {
  margin: 0 0 2px;
  font: 700 14px/1.12 'Inter', system-ui, sans-serif;
  letter-spacing: -0.01em;
  color: #151b2a;
}
#scene8-overlay .feature-card p {
  margin: 0;
  font: 500 12px/1.22 'Inter', system-ui, sans-serif;
  color: #637083;
}
#scene8-overlay .feature-card.hovered {
  box-shadow:
    0 30px 58px -26px rgba(20,30,60,.34),
    0 0 0 6px rgba(226,119,48,.12),
    0 0 34px rgba(226,119,48,.22),
    inset 0 1px 0 rgba(255,255,255,.96),
    inset 0 18px 28px -26px rgba(255,255,255,1);
}
#scene8-overlay .feature-card.is-hero {
  border-color: rgba(255,255,255,.86);
  background: rgba(255,255,255,.80);
  box-shadow:
    0 36px 78px -28px rgba(31,37,92,.42),
    0 18px 44px -22px rgba(126,92,255,.46),
    0 0 0 7px rgba(3,153,237,.075),
    0 0 46px rgba(126,92,255,.22),
    inset 0 1px 0 rgba(255,255,255,1),
    inset 0 20px 30px -26px rgba(255,255,255,1);
}
#scene8-overlay .feature-card.is-hero .icon {
  background: linear-gradient(135deg, #0399ED 0%, #2C7BDA 68%, #E27730 100%);
  box-shadow:
    0 18px 34px -15px rgba(44,123,218,.78),
    0 10px 22px -14px rgba(226,119,48,.54),
    inset 0 1px 0 rgba(255,255,255,.56),
    inset 0 -10px 18px -16px rgba(20,30,60,.55);
}
#scene8-overlay .scene8-spark {
  position: fixed;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: radial-gradient(closest-side, #fff 0%, rgba(255,180,100,.92) 42%, transparent 75%);
  box-shadow: 0 0 14px 4px rgba(226,119,48,.40);
  pointer-events: none;
  opacity: 0;
}
`;

export async function setup({ doc }) {
  // Ensure a clean generated preview if this scene is reviewed standalone after
  // Scene 4/5 changed field visibility during a sequence preview.
  doc.querySelectorAll('.scene-fields-hidden').forEach((el) => el.classList.remove('scene-fields-hidden'));
}

export default [
  {
    id: 'feature-orbit',
    chapter: 'scene-8',
    effect: async ({ doc, cursor, sleep }) => {
      const gsap = await loadGsap();
      ensureFont();
      customizeEngineCursor();
      injectCss('scene8-page-css', PAGE_CSS);

      doc.querySelectorAll('.scene-fields-hidden').forEach((el) => el.classList.remove('scene-fields-hidden'));
      try { await cursor.hide(); } catch (_) {}
      const frameEls = [
        document.querySelector('iframe.ui'),
        document.querySelector('.mac-frame'),
        document.querySelector('.mac-chrome'),
      ].filter(Boolean);

      const overlay = mountSceneLayer('scene8-overlay', { z: 76 });
      gsap.set(overlay, { opacity: 1 });
      overlay.innerHTML = `
        <div class="scene8-vignette"></div>
        <div class="scene8-caption">Everything you need to go from <span class="accent">idea to form.</span></div>
        <div class="scene8-central-glow"></div>
        <div class="scene8-orbit">
          ${FEATURES.map((feature, i) => `
            <div class="feature-card ${feature.depth < .92 ? 'is-back' : ''} ${feature.hero ? 'is-hero' : ''}" data-i="${i}">
              <div class="icon">${featureIcon(feature.icon)}</div>
              <div class="copy">
                <h3>${feature.title}</h3>
                <p>${feature.label}</p>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      const vignette = overlay.querySelector('.scene8-vignette');
      const caption = overlay.querySelector('.scene8-caption');
      const centralGlow = overlay.querySelector('.scene8-central-glow');
      const orbit = overlay.querySelector('.scene8-orbit');
      const cards = [...overlay.querySelectorAll('.feature-card')];

      frameEls.forEach((el) => {
        el.style.transition = 'filter 520ms cubic-bezier(.2,.8,.2,1), opacity 520ms ease';
        el.style.filter = 'blur(4px) saturate(.94) brightness(1.02)';
      });
      const center = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      };
      gsap.set(orbit, { left: center.x, top: center.y });
      gsap.set(vignette, { opacity: 0 });
      gsap.to(vignette, { opacity: 1, duration: 0.52, ease: 'power2.out' });
      gsap.to(centralGlow, { opacity: 1, duration: 0.62, ease: 'power2.out' });
      gsap.fromTo(caption,
        { y: -16, opacity: 0, filter: 'blur(8px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.48, ease: 'expo.out' }
      );

      const cardTl = gsap.timeline({
        onStart: () => playSfx('pop-ui', { volume: 0.42 }),
      });
      cards.forEach((card, i) => {
        const f = FEATURES[i];
        const badge = card.querySelector('.icon');
        const iconSvg = card.querySelector('.icon-svg');
        const copy = card.querySelector('.copy');
        const rad = f.angle * Math.PI / 180;
        const x = f.hero ? 0 : Math.cos(rad) * ORBIT_RADIUS_X;
        const y = f.hero ? 0 : Math.sin(rad) * ORBIT_RADIUS_Y;
        const startRot = i % 2 === 0 ? -4 : 4;
        gsap.set(card, {
          x: 0,
          y: 0,
          scale: 0.65,
          opacity: 0,
          rotate: startRot,
          filter: f.depth < .92 ? 'blur(2px)' : 'blur(8px)',
          zIndex: Math.round(f.depth * 100),
        });
        gsap.set(badge, { opacity: 0, scale: 0.55, y: 6 });
        gsap.set(iconSvg, { opacity: 0, y: 8, scale: 0.9 });
        gsap.set(copy, { opacity: 0, y: 8 });
        const at = i * 0.02;
        cardTl.to(card, {
          x,
          y,
          scale: f.depth,
          opacity: f.depth < .92 ? 0.72 : 1,
          rotate: 0,
          filter: f.depth < .92 ? 'blur(.5px)' : 'blur(0px)',
          duration: 0.62,
          ease: 'back.out(1.6)',
          onStart: () => {
            if (i % 2 === 0) playSfx('pop-ui', { volume: 0.22, rate: 0.96 + i * 0.02 });
          },
        }, at);
        cardTl.to(badge, {
          opacity: 1,
          y: 0,
          scale: 1.1,
          duration: 0.22,
          ease: 'back.out(1.4)',
        }, at + 0.04);
        cardTl.to(badge, {
          scale: 1,
          duration: 0.14,
          ease: 'power2.out',
        }, at + 0.24);
        cardTl.to(iconSvg, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.32,
          ease: 'back.out(1.4)',
        }, at + 0.08);
        cardTl.to(copy, {
          opacity: 1,
          y: 0,
          duration: 0.32,
          ease: 'power2.out',
        }, at + 0.14);
        addIconMicroAnimation(cardTl, { iconSvg, badge, kind: f.icon, at: at + 0.16 });
      });
      await tlDone(cardTl);

      const floatTweens = cards.map((card, i) => gsap.to(card, {
        y: `+=${10 + (i % 3) * 3}`,
        duration: 1.45 + (i % 4) * 0.16,
        delay: i * 0.08,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      }));

      cards.forEach((card, i) => {
        if (!FEATURES[i]?.hero) return;
        gsap.timeline({ delay: 0.18 + i * 0.045 })
          .to(card, { scale: '+=0.04', duration: 0.16, ease: 'power2.out' })
          .to(card, { scale: '-=0.04', duration: 0.42, ease: 'elastic.out(1, .72)' });
      });
      await sleep(3500);

      floatTweens.forEach((tween) => tween.kill());
      const exit = gsap.timeline();
      exit.to(cards, {
        x: 0,
        y: 0,
        scale: 0.72,
        opacity: 0,
        rotate: (i) => i % 2 === 0 ? 4 : -4,
        filter: 'blur(8px)',
        duration: 0.46,
        ease: 'power3.in',
        stagger: 0.025,
      });
      exit.to(caption, { opacity: 0, y: -10, filter: 'blur(6px)', duration: 0.3, ease: 'power2.in' }, '<+0.12');
      exit.to([vignette, centralGlow], { opacity: 0, duration: 0.38, ease: 'power2.in' }, '<');
      exit.to(overlay, { opacity: 0, duration: 0.22, ease: 'power2.in' }, '>');
      await tlDone(exit);
      frameEls.forEach((el) => {
        el.style.filter = '';
        el.style.transition = '';
      });
      overlay.remove();
      await sleep(40);
    },
    duration: 0.2,
  },
];

function getPreviewScreenCenter(doc) {
  const ifr = document.querySelector('iframe.ui');
  const targets = [sel.emailField, sel.ratingField, sel.likeField]
    .map((selector) => doc.querySelector(selector))
    .filter(Boolean);
  if (!ifr || !targets.length) return null;
  const ir = ifr.getBoundingClientRect();
  const rects = targets.map((el) => el.getBoundingClientRect());
  const left = Math.min(...rects.map((r) => r.left));
  const right = Math.max(...rects.map((r) => r.right));
  const top = Math.min(...rects.map((r) => r.top));
  const bottom = Math.max(...rects.map((r) => r.bottom));
  const tr = {
    left,
    top,
    width: right - left,
    height: bottom - top,
  };
  const sx = ir.width / (ifr.offsetWidth || ir.width);
  const sy = ir.height / (ifr.offsetHeight || ir.height);
  return {
    x: Math.min(window.innerWidth - 320, Math.max(320, ir.left + (tr.left + tr.width * 0.50) * sx)),
    y: Math.min(window.innerHeight - 260, Math.max(280, ir.top + (tr.top + tr.height * 0.42) * sy)),
  };
}

async function hoverCardsWithCursor({ cursor, cards, gsap, overlay }) {
  const picks = [2, 1, 7];
  for (const index of picks) {
    const card = cards[index];
    if (!card) continue;
    const r = card.getBoundingClientRect();
    await cursor.park({ x: r.left + r.width * 0.54, y: r.top + r.height * 0.52 });
    card.classList.add('hovered');
    playSfx('hover', { volume: 0.36 });
    pulseCard(card, gsap);
    sparkAt(overlay, r.left + r.width * 0.5, r.top + r.height * 0.5, gsap);
    await new Promise((resolve) => setTimeout(resolve, 240));
    card.classList.remove('hovered');
  }
  try { await cursor.hide(); } catch (_) {}
}

function pulseCard(card, gsap) {
  gsap.timeline()
    .to(card, { scale: '+=0.055', y: '-=8', duration: 0.16, ease: 'power2.out' })
    .to(card, { scale: '-=0.055', y: '+=8', duration: 0.42, ease: 'elastic.out(1, .72)' });
}

function sparkAt(layer, cx, cy, gsap) {
  for (let i = 0; i < 7; i++) {
    const sp = document.createElement('div');
    sp.className = 'scene8-spark';
    layer.appendChild(sp);
    const angle = Math.PI * 2 * (i / 7);
    gsap.set(sp, { left: cx, top: cy, opacity: 0, scale: 0.3 });
    gsap.timeline({ delay: i * 0.018 })
      .to(sp, {
        left: cx + Math.cos(angle) * (38 + Math.random() * 44),
        top: cy + Math.sin(angle) * (24 + Math.random() * 38),
        opacity: 1,
        scale: 1,
        duration: 0.28,
        ease: 'power3.out',
      })
      .to(sp, { opacity: 0, scale: 0.25, duration: 0.28, ease: 'power2.in' }, '>-0.02')
      .call(() => sp.remove());
  }
}
