// v4 Hero Transform — unified transformation interstitial.
//
// Direction (v4.3):
//   One continuous interstitial scene. OLD cluster stays faintly visible,
//   blurred behind a frosted veil. "Refreshing..." appears with premium
//   animated text + cycling dots. While the viewer reads that, the blurred
//   OLD cards get a subtle "upgrading" color transformation (easy to fake
//   because they're already soft-focused). Then the editorial headline
//   "A new way to see responses." lands INSIDE the same scene, before the
//   refreshed cards arrive. Only after the message has landed do the NEW
//   cards reveal — so the announcement lands first, the reveal confirms it.
//
// Key fixes from v4.2 (full-bleed paper scene):
//   - Interstitial is now a translucent frosted veil — backdrop-filter blur
//     keeps the OLD cluster visible as soft shapes behind. Same world,
//     not a separate flat screen.
//   - OLD cards do NOT fade to 0 anymore. They stay at ~55% opacity with
//     a mild blur, then get an "upgrading" color/brightness transformation
//     mid-scene.
//   - "Refreshing" gets a premium animate-text treatment: per-character
//     blur-to-sharp + translate-up stagger, plus a shine sweep across the
//     whole word. (Pixel Point animate-text library isn't installable here;
//     this is a bespoke inline equivalent matching the vibe.)
//   - Three dots now CYCLE correctly: `.` → `..` → `...` → reset → repeat.
//   - Headline "A new way to see responses." fires INSIDE the interstitial,
//     before the new cards reveal. Same animate-text treatment, larger
//     scale. Message lands, then visual confirms.

import { FIELD_11 } from './_helpers.js';
import {
  injectIframeFonts, inlineTreeStyles, stripBuilderChrome,
} from '../../../runtime/pop-out.js';

export const snapshot = 'sp-results-old-168';
export const mode = 'parallel';

const OLD_CARD = (id) => `#wpforms-survey-report .question:has(.actions[data-field-id="${id}"])`;
const NEW_CARD = (id) => `.wpforms-survey-graph-preview[data-field-id="${id}"]`;

const FIELDS = [
  { id: 11, role: 'hero'      },
  { id:  3, role: 'companion' },
  { id:  5, role: 'companion' },
  { id:  4, role: 'companion' },
];

// ── Styles ──────────────────────────────────────────────────────────────────
const STYLE = `
:root {
  --v4-ink:   #14161C;
  --v4-paper: #F4F8FC;
  --v4-ice:   #E7EEF7;
  --v4-rim:   #E27730;
}

.v4-lift {
  position: fixed; pointer-events: none;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  transform-origin: 50% 50%;
  transition:
    transform 900ms cubic-bezier(.2,.8,.2,1),
    left 900ms cubic-bezier(.2,.8,.2,1),
    top  900ms cubic-bezier(.2,.8,.2,1),
    width 900ms cubic-bezier(.2,.8,.2,1),
    height 900ms cubic-bezier(.2,.8,.2,1),
    box-shadow 700ms ease,
    opacity 500ms ease;
  box-shadow: 0 0 0 1px rgba(20,22,28,0.06);
  opacity: 0;
}
.v4-lift.airborne {
  box-shadow:
    0 0 0 1px rgba(20,22,28,0.08),
    0 56px 110px -22px rgba(14,18,26,0.38),
    0 26px 52px -16px rgba(14,18,26,0.26),
    0 10px 22px -10px rgba(14,18,26,0.16);
}
.v4-lift.airborne.new {
  box-shadow:
    0 0 0 1px rgba(226,119,48,0.28),
    0 60px 120px -22px rgba(14,18,26,0.42),
    0 30px 58px -16px rgba(14,18,26,0.28),
    0 12px 26px -10px rgba(14,18,26,0.16);
}
.v4-lift .v4-lift-inner { transform-origin: 0 0; will-change: transform; }

/* OLD → backdrop state: visible but soft-focused behind the veil.
   They STAY there through the whole interstitial. */
.v4-lift.backdrop {
  transition:
    opacity 540ms cubic-bezier(.4,0,.2,1),
    filter  620ms cubic-bezier(.4,0,.2,1);
  opacity: 0.60 !important;
  filter: blur(2.3px) saturate(0.92);
}

/* OLD upgrading — mid-scene transformation on blurred backdrop.
   Subtle hue/brightness shift that reads as "becoming new" without
   having to literally morph anything. */
.v4-lift.upgrading {
  transition:
    opacity 1200ms cubic-bezier(.3,0,.2,1),
    filter 1400ms cubic-bezier(.3,0,.2,1);
  opacity: 0.75 !important;
  filter: blur(1.8px) saturate(1.15) brightness(1.08) hue-rotate(-8deg);
}

/* OLD bye — clean fade at the end, as the NEW cluster is revealed.
   Because they're already blurred, the final fade is seamless. */
.v4-lift.bye {
  transition:
    opacity 560ms cubic-bezier(.4,0,.2,1),
    filter 560ms cubic-bezier(.4,0,.2,1);
  opacity: 0 !important;
  filter: blur(8px) saturate(1);
}

/* NEW reveal — crisp from frame 1, class-based initial state. */
.v4-lift.pre-reveal { opacity: 0; }
.v4-lift.reveal {
  transition:
    opacity 640ms cubic-bezier(.3,.0,.2,1),
    transform 720ms cubic-bezier(.3,.0,.2,1);
  opacity: 1;
}

.v4-lift.landing {
  transition:
    transform 1100ms cubic-bezier(.35,.01,.12,1.02),
    left 1100ms cubic-bezier(.35,.01,.12,1.02),
    top  1100ms cubic-bezier(.35,.01,.12,1.02),
    width 1100ms cubic-bezier(.35,.01,.12,1.02),
    height 1100ms cubic-bezier(.35,.01,.12,1.02),
    box-shadow 700ms ease,
    opacity 240ms ease;
}

/* Cool ambient wash — holds through the whole chapter, fades off at land. */
.v4-wash {
  position: fixed; inset: 0; z-index: 700; pointer-events: none;
  background: radial-gradient(70% 55% at 50% 50%,
    rgba(244,248,252,0.18),
    rgba(231,238,247,0.10) 55%,
    transparent 75%);
  opacity: 0;
  transition: opacity 700ms ease;
}
.v4-wash.on { opacity: 1; }

/* ── Interstitial veil ──────────────────────────────────────────────────── */
/* Translucent frosted glass — NOT a flat full-bleed paper scene.
   backdrop-filter softens everything beneath (including the blurred OLD
   cluster). Same world, one continuous scene. */
.v4-interstitial {
  position: fixed; inset: 0; z-index: 1400;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 44px;
  background: linear-gradient(180deg,
    rgba(247,251,254,0.32) 0%,
    rgba(231,238,247,0.58) 100%);
  -webkit-backdrop-filter: blur(14px) saturate(1.05);
          backdrop-filter: blur(14px) saturate(1.05);
  opacity: 0;
  transition:
    opacity 560ms cubic-bezier(.3,.0,.2,1),
    backdrop-filter 640ms cubic-bezier(.3,.0,.2,1),
    -webkit-backdrop-filter 640ms cubic-bezier(.3,.0,.2,1);
  pointer-events: none;
  font-family: 'Inter', -apple-system, 'Segoe UI', sans-serif;
}
.v4-interstitial.in  { opacity: 1; }
.v4-interstitial.out {
  opacity: 0;
  -webkit-backdrop-filter: blur(0) saturate(1);
          backdrop-filter: blur(0) saturate(1);
  transition:
    opacity 680ms cubic-bezier(.3,.0,.2,1),
    backdrop-filter 680ms cubic-bezier(.3,.0,.2,1),
    -webkit-backdrop-filter 680ms cubic-bezier(.3,.0,.2,1);
}

/* ── Premium animated text — pixel-point mask slide-up reveal ─────────── */
.v4-anim-text {
  position: relative;
  display: inline-block;
  white-space: pre;
  color: inherit;
  line-height: 1.1;
}
.v4-anim-text .mask {
  display: inline-block;
  overflow: hidden;
  vertical-align: baseline;
  padding: 0.12em 0;
  margin: -0.12em 0;
  line-height: 1.1;
}
.v4-anim-text .ch {
  display: inline-block;
  transform: translate3d(0, 110%, 0);
  transition: transform 920ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}
.v4-anim-text.in .ch { transform: translate3d(0, 0, 0); }
.v4-anim-text.out .ch {
  transform: translate3d(0, -110%, 0);
  transition: transform 520ms cubic-bezier(0.64, 0, 0.78, 0);
  transition-delay: 0ms !important;
}

.v4-anim-text .shine {
  position: absolute; top: -6%; bottom: -6%;
  left: -40%; width: 38%;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(255,255,255,0.00) 18%,
    rgba(255,255,255,0.95) 50%,
    rgba(255,255,255,0.00) 82%,
    transparent 100%);
  filter: blur(10px);
  mix-blend-mode: screen;
  opacity: 0;
  pointer-events: none;
}
.v4-anim-text .shine.run {
  opacity: 1;
  left: 110%;
  transition:
    left 1150ms cubic-bezier(.3,.05,.3,1),
    opacity 280ms ease;
}

/* ── Refreshing loader: word + cycling dots ────────────────────────────── */
/* Matches the headline's typographic family (Instrument Serif) so the
   interstitial reads as one designed moment, not two fonts competing. */
.v4-refresh {
  display: inline-flex; align-items: baseline; gap: 0;
  font-family: 'Instrument Serif', Georgia, serif;
  font-size: 40px; font-weight: 400;
  letter-spacing: -0.005em;
  color: #2A3240;
}
.v4-refresh .word { position: relative; }
.v4-refresh .dots {
  display: inline-flex;
  gap: 1px; margin-left: 3px;
}
.v4-refresh .dots .dot {
  opacity: 0;
  display: inline-block;
}
.v4-refresh.cycling .dots .dot:nth-child(1) {
  animation: v4-dot-a 1.8s ease-in-out infinite;
}
.v4-refresh.cycling .dots .dot:nth-child(2) {
  animation: v4-dot-b 1.8s ease-in-out infinite;
}
.v4-refresh.cycling .dots .dot:nth-child(3) {
  animation: v4-dot-c 1.8s ease-in-out infinite;
}
.v4-refresh.exiting .dots .dot {
  animation: none !important;
  opacity: 0;
  transition: opacity 260ms ease;
}

/* Accumulate + reset cycle: "." → ".." → "..." → reset */
@keyframes v4-dot-a {
  0%, 3%   { opacity: 0; }
  8%       { opacity: 1; }
  95%      { opacity: 1; }
  100%     { opacity: 0; }
}
@keyframes v4-dot-b {
  0%, 30%  { opacity: 0; }
  36%      { opacity: 1; }
  95%      { opacity: 1; }
  100%     { opacity: 0; }
}
@keyframes v4-dot-c {
  0%, 62%  { opacity: 0; }
  68%      { opacity: 1; }
  95%      { opacity: 1; }
  100%     { opacity: 0; }
}

/* ── Editorial headline (announcement message inside the interstitial) ── */
.v4-head {
  position: relative;
  text-align: center;
  max-width: 80vw;
  font-family: 'Instrument Serif', Georgia, serif;
  font-weight: 400;
  font-size: 54px;
  line-height: 1.08;
  letter-spacing: -0.015em;
  color: #0E1116;
  opacity: 1;
}
.v4-head.eyebrowed::before {
  content: 'SURVEYS & POLLS';
  display: block;
  font-family: 'Inter', -apple-system, sans-serif;
  font-size: 12px; font-weight: 600;
  letter-spacing: 0.36em;
  color: var(--v4-rim);
  margin-bottom: 18px;
  opacity: 0;
  animation: v4-eyebrow-in 600ms cubic-bezier(.3,.0,.2,1) 120ms forwards;
}
@keyframes v4-eyebrow-in {
  0%   { opacity: 0; transform: translateY(6px); }
  100% { opacity: 1; transform: translateY(0); }
}
`;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function ensureStyles() {
  if (document.getElementById('v4-style')) return;
  const s = document.createElement('style');
  s.id = 'v4-style';
  s.textContent = STYLE;
  document.head.appendChild(s);
}

function ensureFonts() {
  if (document.getElementById('v4-fonts')) return;
  const link = document.createElement('link');
  link.id = 'v4-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap';
  document.head.appendChild(link);
}

function iframeScale() {
  const ui = document.querySelector('iframe.ui');
  if (!ui) return 1;
  const m = new DOMMatrixReadOnly(getComputedStyle(ui).transform);
  return m.a || 1;
}

function toParentCoords(innerRect) {
  const ui = document.querySelector('iframe.ui');
  const r = ui.getBoundingClientRect();
  const z = iframeScale();
  return {
    x: r.left + innerRect.left * z,
    y: r.top  + innerRect.top  * z,
    w: innerRect.width  * z,
    h: innerRect.height * z,
  };
}

function measureContentHeight(src) {
  const box = src.getBoundingClientRect();
  let maxBottom = 0;
  src.querySelectorAll(
    '.details, .title-area, .chart-container, canvas, .table-wrap, .stats'
  ).forEach(n => {
    const r = n.getBoundingClientRect();
    if (r.height > 0 && r.bottom > maxBottom) maxBottom = r.bottom;
  });
  if (!maxBottom) return box.height;
  const h = maxBottom - box.top + 12;
  return Math.min(box.height, Math.max(140, h));
}

async function stageClone(sel, opts = {}) {
  const z = opts.zIndex ?? 800;
  const ui = document.querySelector('iframe.ui');
  const doc = ui.contentDocument;
  await injectIframeFonts(doc);
  const src = doc.querySelector(sel);
  if (!src) return null;
  const innerRect = src.getBoundingClientRect();
  const contentH = measureContentHeight(src);
  const parent = toParentCoords({
    left: innerRect.left, top: innerRect.top,
    width: innerRect.width, height: contentH,
  });
  const zoom = iframeScale();

  const wrap = document.createElement('div');
  wrap.className = 'v4-lift';
  wrap.style.left = parent.x + 'px';
  wrap.style.top  = parent.y + 'px';
  wrap.style.width  = parent.w + 'px';
  wrap.style.height = parent.h + 'px';
  wrap.style.zIndex = String(z);

  const inner = document.createElement('div');
  inner.className = 'v4-lift-inner';
  inner.style.width  = innerRect.width  + 'px';
  inner.style.height = contentH + 'px';
  inner.style.overflow = 'hidden';
  inner.style.transform = `scale(${zoom})`;

  const clone = src.cloneNode(true);
  clone.removeAttribute('id');
  clone.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
  inlineTreeStyles(src, clone);
  stripBuilderChrome(clone);
  clone.style.setProperty('margin', '0', 'important');
  clone.style.setProperty('width',  innerRect.width  + 'px', 'important');
  clone.style.setProperty('height', contentH + 'px', 'important');
  clone.style.setProperty('min-height', '0', 'important');
  clone.style.setProperty('overflow', 'hidden', 'important');

  inner.appendChild(clone);
  wrap.appendChild(inner);
  document.body.appendChild(wrap);

  const prevVis = src.style.visibility;
  if (opts.hideSource !== false) src.style.visibility = 'hidden';

  return {
    wrap,
    srcEl: src,
    nativeW: innerRect.width,
    nativeH: contentH,
    release: () => { src.style.visibility = prevVis; wrap.remove(); },
    releaseClone: () => { wrap.remove(); },
    restoreSource: () => { src.style.visibility = prevVis; },
  };
}

function moveTo(staged, rect, { tiltY = 0, tiltX = 2, extraClass } = {}) {
  const { wrap, nativeW, nativeH } = staged;
  wrap.style.left = rect.x + 'px';
  wrap.style.top  = rect.y + 'px';
  wrap.style.width  = rect.w + 'px';
  wrap.style.height = rect.h + 'px';
  const inner = wrap.querySelector('.v4-lift-inner');
  const s = Math.min(rect.w / nativeW, rect.h / nativeH);
  inner.style.transform = `scale(${s})`;
  wrap.style.transform = `perspective(1600px) rotateY(${tiltY}deg) rotateX(${tiltX}deg)`;
  wrap.classList.add('airborne');
  if (extraClass) wrap.classList.add(extraClass);
}

function captureClusterState(staged) {
  const { wrap, nativeW, nativeH } = staged;
  return {
    left: wrap.style.left,
    top: wrap.style.top,
    width: wrap.style.width,
    height: wrap.style.height,
    transform: wrap.style.transform,
    zIndex: wrap.style.zIndex,
    nativeW, nativeH,
  };
}

function applyClusterState(wrap, state) {
  wrap.style.left = state.left;
  wrap.style.top  = state.top;
  wrap.style.width  = state.width;
  wrap.style.height = state.height;
  wrap.style.transform = state.transform;
  if (state.zIndex) wrap.style.zIndex = state.zIndex;
  const inner = wrap.querySelector('.v4-lift-inner');
  const s = Math.min(parseFloat(state.width) / state.nativeW,
                    parseFloat(state.height) / state.nativeH);
  inner.style.transform = `scale(${s})`;
  wrap.classList.add('airborne');
}

function clusterSlot(fieldId) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cardW = Math.min(vw * 0.36, 640);
  const cardH = cardW * 0.56;
  const padX = vw * 0.05;
  const padY = vh * 0.09;

  const TL = { x: padX,              y: padY,              w: cardW, h: cardH };
  const TR = { x: vw - cardW - padX, y: padY,              w: cardW, h: cardH };
  const BL = { x: padX,              y: vh - cardH - padY, w: cardW, h: cardH };
  const BR = { x: vw - cardW - padX, y: vh - cardH - padY, w: cardW, h: cardH };

  return {
    11: { rect: TL, tiltY:  4, tiltX: -2, z: 804 },
    3:  { rect: TR, tiltY: -4, tiltX: -2, z: 803 },
    5:  { rect: BL, tiltY:  4, tiltX:  2, z: 802 },
    4:  { rect: BR, tiltY: -4, tiltX:  2, z: 801 },
  }[fieldId];
}

// ── Pixel-point mask slide-up reveal ───────────────────────────────────────
// Each character sits inside an overflow:hidden mask and enters from below
// the baseline. No opacity fade, no blur — pure typographic motion.
function buildAnimText(text, { stagger = 35 } = {}) {
  const wrap = document.createElement('span');
  wrap.className = 'v4-anim-text';
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
  shine.className = 'shine';
  wrap.appendChild(shine);
  return wrap;
}

async function revealAnimText(el, { stagger = 35 } = {}) {
  await sleep(40);
  requestAnimationFrame(() => requestAnimationFrame(() =>
    el.classList.add('in')
  ));
  const chars = el.querySelectorAll('.ch').length;
  const total = chars * stagger + 920;
  await sleep(total);
  return el;
}

async function shineAnimText(el) {
  const shine = el.querySelector('.shine');
  if (!shine) return;
  shine.classList.add('run');
  await sleep(1150);
}

async function exitAnimText(el, { ms = 540 } = {}) {
  el.classList.remove('in');
  el.classList.add('out');
  await sleep(ms);
  el.remove();
}

export default [
  {
    id: 'hero-transform', chapter: 'hero-transform',
    duration: 0.2,
    effect: async (ctx) => {
      const { zoomTo, swapToSnapshot } = ctx;
      ensureStyles();
      ensureFonts();

      const ui = document.querySelector('iframe.ui');
      const doc = ui.contentDocument;
      doc.getElementById('wpadminbar')?.remove();

      const wash = document.createElement('div');
      wash.className = 'v4-wash';
      document.body.appendChild(wash);

      // ═════ BEAT 1 — ESTABLISH OLD (≈ 1.2s) ═════
      const win = doc.defaultView;
      win.scrollTo(0, 0);
      await sleep(40);
      await zoomTo([OLD_CARD(11)], {
        level: 1.0, pad: 40, smooth: false, scrollBehavior: 'instant',
        noScroll: true,
      });
      await sleep(1100);

      // ═════ BEAT 2 — CLUSTER ASSEMBLY (synced: tighter, ≈ 2.6s) ═════
      const oldLift = [];
      for (let i = 0; i < FIELDS.length; i++) {
        const f = FIELDS[i];
        if (i > 0) {
          const src = doc.querySelector(OLD_CARD(f.id));
          if (src) {
            const r = src.getBoundingClientRect();
            const targetY = Math.max(0, win.scrollY + r.top - 100);
            win.scrollTo({ top: targetY, behavior: 'smooth' });
            await sleep(280);
          }
        }
        const staged = await stageClone(OLD_CARD(f.id), { zIndex: 800 });
        if (!staged) continue;
        oldLift.push({ field: f, staged });
        await sleep(40);
        staged.wrap.style.opacity = '1';
        const slot = clusterSlot(f.id);
        staged.wrap.style.zIndex = String(slot.z);
        moveTo(staged, slot.rect, { tiltY: slot.tiltY, tiltX: slot.tiltX });
        await sleep(f.role === 'hero' ? 380 : 240);
      }

      wash.classList.add('on');
      await sleep(300);

      const clusterCache = oldLift.map(({ field, staged }) => ({
        field, state: captureClusterState(staged),
      }));

      // ═════ BEAT 3 — OLD → BACKDROP (≈ 0.6s) ═════
      // Push OLD into soft-focused backdrop. They stay visible at ~55%
      // opacity with a mild blur — same world, not a separate screen.
      for (const { staged } of oldLift) staged.wrap.classList.add('backdrop');
      await sleep(120);

      // Promote OLD to documentElement so loadSnapshot's body wipe can't
      // destroy them. They're the atmospheric continuity through this beat.
      for (const { staged } of oldLift) {
        document.documentElement.appendChild(staged.wrap);
        staged.wrap.style.zIndex = '1200';
      }

      // ═════ BEAT 4 — INTERSTITIAL VEIL RISES (≈ 0.6s) ═════
      // Frosted translucent veil — backdrop-filter softens the OLD cluster
      // visible beneath. NOT a full-bleed paper scene.
      const interstitial = document.createElement('div');
      interstitial.className = 'v4-interstitial';

      const refresh = document.createElement('div');
      refresh.className = 'v4-refresh';
      const refreshWord = buildAnimText('Refreshing', { stagger: 32 });
      refreshWord.classList.add('word');
      const dotsWrap = document.createElement('span');
      dotsWrap.className = 'dots';
      dotsWrap.innerHTML = '<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>';
      refresh.appendChild(refreshWord);
      refresh.appendChild(dotsWrap);
      interstitial.appendChild(refresh);

      document.documentElement.appendChild(interstitial);
      await sleep(40);
      requestAnimationFrame(() => requestAnimationFrame(() =>
        interstitial.classList.add('in')
      ));
      await sleep(560);

      // ═════ BEAT 5 — "REFRESHING" REVEAL + DOTS CYCLING (≈ 3s) ═════
      await revealAnimText(refreshWord, { stagger: 32 });
      // Start dots cycling as the word finishes landing
      refresh.classList.add('cycling');
      await sleep(200);

      // Subtle upgrading transformation on the blurred OLD cards — signals
      // "becoming new" without needing literal morph. Fires while the user
      // reads "Refreshing...".
      for (const { staged } of oldLift) {
        staged.wrap.classList.remove('backdrop');
        staged.wrap.classList.add('upgrading');
      }

      // Kick off the technical swap in the background — hidden entirely
      // under the veil + blurred cluster.
      let newLift = [];
      const swapPromise = swapToSnapshot('sp-results-new-418-base', {
        setup: async () => {
          await sleep(40);
          const newDoc = document.querySelector('iframe.ui').contentDocument;
          newDoc.getElementById('wpadminbar')?.remove();
          newDoc.defaultView.scrollTo(0, 0);
          await sleep(40);

          for (const { field, state } of clusterCache) {
            const ndoc = document.querySelector('iframe.ui').contentDocument;
            const srcSel = NEW_CARD(field.id);
            const srcEl = ndoc.querySelector(srcSel);
            if (!srcEl) continue;
            const elRect = srcEl.getBoundingClientRect();
            if (elRect.top < 0 || elRect.top > 900) {
              ndoc.defaultView.scrollTo({
                top: ndoc.defaultView.scrollY + elRect.top - 80,
              });
              await sleep(30);
            }
            const staged = await stageClone(srcSel, { zIndex: 1200, hideSource: true });
            if (!staged) continue;
            document.documentElement.appendChild(staged.wrap);
            applyClusterState(staged.wrap, state);
            staged.wrap.style.zIndex = '1201';
            staged.wrap.classList.add('new');
            staged.wrap.classList.add('pre-reveal');
            newLift.push({ field, staged });
          }
          document.querySelector('iframe.ui').contentDocument
            .defaultView.scrollTo(0, 0);
        },
      });

      // Shine sweep across "Refreshing"
      await sleep(260);
      await shineAnimText(refreshWord);

      // Short held cue — synced version drops the extra dot cycle.
      await sleep(200);

      // ═════ BEAT 6 — REFRESHING EXITS + HEADLINE ENTERS (≈ 2s) ═════
      // The announcement message lands BEFORE the refreshed cards arrive.
      refresh.classList.add('exiting');
      exitAnimText(refreshWord, { ms: 540 });
      await sleep(540);
      refresh.remove();

      // Headline — same premium animate-text, larger scale, eyebrow above.
      const head = document.createElement('div');
      head.className = 'v4-head eyebrowed';
      const headLine = buildAnimText('A new way to see responses.', { stagger: 26 });
      head.appendChild(headLine);
      interstitial.appendChild(head);
      await revealAnimText(headLine, { stagger: 26 });

      // Shine sweep across the headline once the chars are in.
      await sleep(120);
      shineAnimText(headLine);

      // Ensure the technical swap has resolved before we start the reveal.
      await swapPromise;

      // Short read-hold — synced version keeps the message crisp but moves
      // on to the NEW reveal faster to hit the structural mark.
      await sleep(500);

      // ═════ BEAT 7 — REVEAL: OLD BYE, NEW IN, VEIL DOWN (≈ 0.7s) ═════
      // Blurred OLD cards take their final bow.
      for (const { staged } of oldLift) staged.wrap.classList.add('bye');
      // NEW clones rise into place at the same captured rects.
      for (const { staged } of newLift) {
        staged.wrap.classList.remove('pre-reveal');
        staged.wrap.classList.add('reveal');
      }
      await sleep(80);
      // Veil drops.
      interstitial.classList.remove('in');
      interstitial.classList.add('out');
      await sleep(380);
      // Headline exits as the scene resolves onto the fresh cluster.
      exitAnimText(headLine, { ms: 540 });
      await sleep(540);
      interstitial.remove();
      // Cleanup OLD now fully faded.
      for (const { staged } of oldLift) staged.wrap.remove();

      // Brief crisp hold so the viewer reads the refreshed cluster.
      await sleep(260);

      // ═════ BEAT 8 — LAND HERO + COMPANIONS (synced: parallel, ≈ 2.5s) ═════
      // All four land together — the structural "refreshed cluster" hit is
      // one moment, not four small ones. Saves ~6s off the sequential version.
      const liveDoc = document.querySelector('iframe.ui').contentDocument;
      const liveWin = liveDoc.defaultView;
      liveWin.scrollTo({ top: 0, behavior: 'instant' });
      await sleep(60);

      const landOrder = [11, 3, 5, 4];
      for (const fid of landOrder) {
        const lift = newLift.find(n => n.field.id === fid);
        if (!lift) continue;
        const srcEl = liveDoc.querySelector(NEW_CARD(fid));
        if (!srcEl) continue;
        const rect = toParentCoords(srcEl.getBoundingClientRect());
        lift.staged.wrap.classList.add('landing');
        moveTo(lift.staged, rect, { tiltY: 0, tiltX: 0, extraClass: 'new' });
      }
      await sleep(900);

      for (const fid of landOrder) {
        const lift = newLift.find(n => n.field.id === fid);
        if (!lift) continue;
        lift.staged.restoreSource();
        lift.staged.wrap.style.transition = 'opacity 260ms ease';
        lift.staged.wrap.style.opacity = '0';
        setTimeout(() => lift.staged.releaseClone(), 300);
      }
      await sleep(280);

      await zoomTo([FIELD_11], {
        level: 1.0, pad: 120, smooth: true, scrollBehavior: 'smooth',
      });
      await sleep(280);

      wash.classList.remove('on');
    },
  },
];
