// Chapter 4 — get-form drill-in (FLIPPED v2, ~12s)
//
// Direction reversed: form is the source of truth (built from API call),
// pills emerge from its labels and fly into the response card to construct
// the JSON. Matches the actual data lineage — get-form returns the schema,
// the form is its rendering, the JSON makes that explicit.
//
// Beat 4a: same as v1 — type curl with get-form anchored.
// Beat 4b (new flow):
//   1. Cursor presses Enter, ripple at curl tail
//   2. "Fetching beam" — SVG path draws from request card right edge to
//      the right-column form-mount area
//   3. Form-card materializes on the right; brief processing scan-line
//      sweeps across it horizontally
//   4. Response card mounts bottom-left with PENDING status + skeleton
//   5. Pills (`label: Name`, `Email`, `Message`) pop out of the form's
//      label elements, fly along arcs to their corresponding JSON value
//      slots inside the response body
//   6. As pills land, status flips to 200 OK and the JSON tree
//      crossfades in; pills fade so JSON labels take over visually
// Beat 4c: brief breathe, exit dive-zoom (same as v1)

import {
  loadGsap, mountSceneLayer, mountSceneCursor, SCENE_CURSOR_CSS, injectCss,
  mountAtmospherics, runAtmospherics,
  ensureRestApiFonts, injectStageCss, COLORS,
  highlightCurl, highlightJson, codeCard, cyanRipple,
  getSharedScene, panToCrystal, panToOverview, panToStation,
  revealSharedHex, focusSharedCrystal, hideAllCrystals, pausableRaf, pausableSleep,
} from './_kit.js';
import { mountFormCardTemplate, injectFormCardCss } from './_form-card-template.js';

ensureRestApiFonts();
injectStageCss();

export const breakStyle = 'glide';
export const mode = 'per-beat-narration';

const LOG = (...a) => console.log('[ch4v2]', performance.now().toFixed(0) + 'ms', ...a);

const FORM = {
  id: 55,
  title: 'Contact Us form',
  status: 'publish',
  created: '2026-01-27 10:00:00',
  modified: '2026-02-15 14:30:00',
  author: 1,
  settings: {
    form_title: 'Contact Us form',
    form_desc: 'Get in touch with us',
    submit_text: 'Submit',
    ajax_submit: true,
    honeypot: true,
    antispam: true,
  },
  fields: [
    { id: 1, type: 'text',     label: 'Name',    description: '', required: true,  size: 'medium' },
    { id: 2, type: 'email',    label: 'Email',   description: '', required: true,  size: 'medium' },
    { id: 3, type: 'textarea', label: 'Message', description: '', required: false, size: 'medium' },
  ],
};

let _state = null;

async function ensureSetup() {
  if (_state) return _state;
  ensureRestApiFonts();
  injectStageCss();
  injectCss('rest-api-cursor-css', SCENE_CURSOR_CSS);
  injectFormCardCss();

  injectCss('ra-ch4v2-css', `
    .ra-ch4v2-vignette {
      position: fixed; inset: 0; pointer-events: none; z-index: 79;
      background: radial-gradient(ellipse at center,
        rgba(10,14,20,0) 35%,
        rgba(10,14,20,0.5) 78%,
        rgba(10,14,20,0.9) 100%);
    }
    .ra-ch4v2-loading {
      display: flex; flex-direction: column; gap: 10px; padding: 6px 0;
    }
    .ra-ch4v2-loading .bar {
      height: 10px; border-radius: 4px;
      background: linear-gradient(90deg,
        rgba(78,201,255,0.08) 0%,
        rgba(78,201,255,0.28) 50%,
        rgba(78,201,255,0.08) 100%);
      background-size: 200% 100%;
      animation: ra-ch4v2-shimmer 1.2s ease-in-out infinite;
    }
    @keyframes ra-ch4v2-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .ra-ch4v2-thinking-tag {
      font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
      color: rgba(78,201,255,0.7); padding: 0 0 6px;
    }
    .ra-ch4v2-resp-body {
      font-size: 12px; line-height: 1.5;
    }

    /* Pill — flies from form-card label to JSON value slot */
    .ra-ch4v2-pill {
      position: fixed; left: 0; top: 0;
      pointer-events: none; white-space: nowrap;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 12px; font-weight: 500;
      letter-spacing: 0.02em;
      padding: 5px 11px;
      border-radius: 999px;
      background: rgba(13,17,23,0.92);
      border: 1px solid rgba(78,201,255,0.55);
      backdrop-filter: blur(4px);
      box-shadow:
        0 6px 18px rgba(0,0,0,0.55),
        0 0 24px rgba(78,201,255,0.30);
      opacity: 0;
      z-index: 92;
      will-change: transform, opacity;
    }
    .ra-ch4v2-pill .key { color: #9cdcfe; }
    .ra-ch4v2-pill .sep { color: rgba(245,247,250,0.45); margin: 0 4px; }
    .ra-ch4v2-pill .val { color: ${COLORS.cardText}; font-weight: 600; }

    /* Form-card processing scan line */
    .ra-ch4v2-scan {
      position: absolute;
      left: 0; right: 0; height: 2px;
      pointer-events: none;
      background: linear-gradient(90deg,
        rgba(78,201,255,0) 0%,
        rgba(78,201,255,0.85) 50%,
        rgba(78,201,255,0) 100%);
      box-shadow: 0 0 18px rgba(78,201,255,0.55);
      opacity: 0;
      z-index: 5;
    }

    .ra-ch4v2-form-caption {
      position: fixed;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 13px;
      color: rgba(78,201,255,0.95);
      letter-spacing: 0.02em;
      padding: 5px 12px;
      border-radius: 999px;
      background: rgba(13,17,23,0.78);
      border: 1px solid rgba(78,201,255,0.35);
      backdrop-filter: blur(4px);
      box-shadow: 0 6px 18px rgba(0,0,0,0.5);
      opacity: 0; pointer-events: none; white-space: nowrap;
      z-index: 90;
    }
  `);

  const layer = mountSceneLayer('ra-ch4v2-layer', { z: 80 });
  layer.style.opacity = '1';
  const atm = mountAtmospherics();
  const cursor = mountSceneCursor(layer);
  cursor.style.opacity = '0';
  cursor.style.transform = 'translate(-9999px, -9999px)';

  // Attach to the SHARED persistent scene.
  const TARGET_IDX = 1; // wpforms/get-form
  const shared = await getSharedScene({ initialFocusIdx: TARGET_IDX });
  const three = shared.three;
  const gsap = shared.gsap;
  const { THREE, scene } = three;
  const abilities = shared.abilities;
  const targetCrystal = abilities[TARGET_IDX];
  const crystalGroup = targetCrystal.group;
  const wireMat = targetCrystal.wireMat;
  const coreMat = targetCrystal.coreMat;

  const crystalLbl = document.createElement('div');
  Object.assign(crystalLbl.style, {
    position: 'fixed',
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
    fontSize: '13px', fontWeight: '500',
    color: 'rgba(245,247,250,0.78)',
    letterSpacing: '0.02em',
    padding: '5px 11px',
    borderRadius: '999px',
    background: 'rgba(13,17,23,0.62)',
    border: '1px solid rgba(78,201,255,0.18)',
    backdropFilter: 'blur(3px)',
    boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
    opacity: '0',
    pointerEvents: 'none', whiteSpace: 'nowrap',
  });
  crystalLbl.innerHTML =
    '<span style="color:' + COLORS.brand + '; font-weight:600;">wpforms</span>' +
    '/<span style="color:#ffd866; font-weight:600;">get-form</span>';
  layer.appendChild(crystalLbl);

  let trackerActive = true;
  function trackCrystalLbl() {
    if (!trackerActive) return;
    const v = crystalGroup.position.clone().project(three.camera);
    const sx = ((v.x + 1) / 2) * window.innerWidth;
    const sy = ((-v.y + 1) / 2) * window.innerHeight;
    crystalLbl.style.left = (sx - crystalLbl.offsetWidth / 2) + 'px';
    crystalLbl.style.top  = (sy + 36) + 'px';
  }
  const stopCrystalRaf = pausableRaf(trackCrystalLbl);

  runAtmospherics(gsap, atm, 14);

  const vignette = document.createElement('div');
  vignette.className = 'ra-ch4v2-vignette';
  document.body.appendChild(vignette);

  _state = {
    layer, atm, three, cursor, gsap,
    crystalGroup, wireMat, coreMat,
    crystalLbl, vignette,
    abilities, targetCrystal,
  };
  _state.stopCrystalTracker = () => { trackerActive = false; stopCrystalRaf(); };

  // crystalLbl fades in only after focusTarget completes (start of beat 4a)

  return _state;
}

export const setup = ensureSetup;

export default [
  // ── Beat 4a — type-get-form (~5s) ──────────────────────────────────────
  {
    id: 'type-get-form',
    chapter: 'get-form',
    duration: 6.5,
    effect: async () => {
      const s = await ensureSetup();
      const { gsap, layer } = s;

      // Whiteboard transition: previous chapter ended at overview pose.
      // Pan into the get-form crystal, collapse the other 5, pull back
      // to station. Crystal stays visible at top of frame as a continuity
      // anchor through the chapter content.
      await panToCrystal(s.targetCrystal, { duration: 0.9 });
      focusSharedCrystal(s.targetCrystal, { duration: 0.5 });
      await panToStation(s.targetCrystal, { duration: 0.9 });
      gsap.to(s.crystalLbl, { opacity: 1, duration: 0.4 });

      const w = Math.min(820, window.innerWidth / 2 - 100);
      const reqLeft = 80;
      const card = codeCard({
        parent: layer,
        label: 'request',
        x: 0, y: 0,
        width: w,
      });
      card.style.left = '0px';
      card.style.top = '0px';
      s.requestCard = card;
      s.requestCardW = w;

      const cmd = `curl -u "USERNAME:APP_PASSWORD" \\
  "$WP_SITE/wp-json/wp-abilities/v1/abilities/wpforms/get-form/run?input%5Bform_id%5D=55&input%5Binclude_fields%5D=true"`;

      const body = card.querySelector('.ra-card-body');
      body.innerHTML = highlightCurl(cmd);

      const reqH = card.offsetHeight;

      // Final stack layout: request top + (gap) + response below.
      // Pre-compute stack so request mounts at its final position.
      const respGuessH = 380; // estimated response card height with JSON
      const gap = 18;
      const stackH = reqH + gap + respGuessH;
      const stackTop = Math.max(40, (window.innerHeight - stackH) / 2);

      s.reqLeft = reqLeft;
      s.reqTop = stackTop;
      s.reqH = reqH;
      s.gap = gap;
      s.respTopTarget = stackTop + reqH + gap;

      gsap.set(card, { x: reqLeft - 20, y: stackTop, opacity: 0 });
      gsap.to(card, { x: reqLeft, opacity: 1, duration: 0.5, ease: 'sine.out' });
      await wait(500);

      await typeAroundAnchors(body, 26, '.ra-tok-route');

      LOG('beat 4a done');
    },
  },

  // ── Beat 4b — fetching-beam → form → pills → response (~6s) ───────────
  {
    id: 'get-form-response',
    chapter: 'get-form',
    duration: 7.5,
    effect: async () => {
      const s = _state;
      const { gsap, layer } = s;

      // Cursor presses Enter at last char of curl
      const reqBody = s.requestCard.querySelector('.ra-card-body');
      const allSpans = reqBody.querySelectorAll('span');
      const lastChar = allSpans[allSpans.length - 1] || reqBody;
      const lcRect = lastChar.getBoundingClientRect();
      const tailX = lcRect.right + 8;
      const tailY = lcRect.top + lcRect.height / 2;
      s.cursor.style.opacity = '1';
      s.cursor.style.transform = `translate(${tailX}px, ${tailY}px)`;
      cyanRipple(layer, tailX, tailY, gsap);

      gsap.to(s.requestCard, {
        boxShadow: '0 0 0 1px rgba(78,201,255,0.6), 0 0 36px rgba(78,201,255,0.32)',
        duration: 0.18, yoyo: true, repeat: 1, ease: 'sine.inOut',
      });

      await wait(280);

      // ── Fetching beam: animated SVG path from request → form area ──
      // Form will mount on the right side, vertically centered.
      const formW = 480;
      const formColCenter = window.innerWidth - 80 - 360; // approximate form column center
      const formArrivalX = formColCenter;
      const formArrivalY = window.innerHeight / 2;

      const reqRect = s.requestCard.getBoundingClientRect();
      const beamFromX = reqRect.right - 6;
      const beamFromY = reqRect.top + reqRect.height / 2;

      await drawFetchingBeam(layer, gsap, beamFromX, beamFromY, formArrivalX, formArrivalY);

      // ── Form card materializes on the right ──
      const formCard = mountFormCardTemplate({
        id: FORM.id,
        title: FORM.title,
        status: FORM.status,
        author: FORM.author,
        fields: FORM.fields,
      });
      formCard.style.left = '0px';
      formCard.style.top = '0px';
      formCard.style.width = formW + 'px';
      // Internal scan-line container
      const scan = document.createElement('div');
      scan.className = 'ra-ch4v2-scan';
      formCard.style.position = 'fixed';
      formCard.appendChild(scan);
      layer.appendChild(formCard);
      s.formCard = formCard;

      await new Promise((r) => requestAnimationFrame(r));
      const formH = formCard.offsetHeight;
      const formX = window.innerWidth - formW - 80;
      const formTop = Math.max(40, (window.innerHeight - formH) / 2);

      gsap.set(formCard, { x: formX, y: formTop, opacity: 0, scale: 0.94 });
      gsap.to(formCard, {
        opacity: 1, scale: 1,
        duration: 0.55, ease: 'back.out(1.2)',
      });
      await wait(450);

      // Scan line sweep — top to bottom across form, signals "processing"
      gsap.set(scan, { top: '0px', opacity: 0 });
      gsap.timeline()
        .to(scan, { opacity: 1, duration: 0.12 })
        .to(scan, { top: (formH - 2) + 'px', duration: 0.7, ease: 'sine.inOut' }, '<')
        .to(scan, { opacity: 0, duration: 0.18 }, '-=0.18');

      await wait(700);

      // Caption pill below form
      const caption = document.createElement('div');
      caption.className = 'ra-ch4v2-form-caption';
      caption.textContent = `${FORM.title} · id ${FORM.id} · ${FORM.status} · author ${FORM.author} · ${FORM.fields.length} fields`;
      layer.appendChild(caption);
      s.formCaption = caption;
      const positionCaption = () => {
        const r = formCard.getBoundingClientRect();
        caption.style.left = (r.left + r.width / 2) + 'px';
        caption.style.top  = (r.bottom + 14) + 'px';
        caption.style.transform = 'translate(-50%, 0)';
      };
      positionCaption();
      gsap.to(caption, { opacity: 1, duration: 0.5 });

      // ── Response card mounts at left-bottom (below request) with PENDING ──
      const respCardW = s.requestCardW;
      const respLeft = s.reqLeft;
      const respTop = s.respTopTarget;

      const respCard = codeCard({
        parent: layer,
        label: 'response',
        x: 0, y: 0,
        width: respCardW,
        status: 'PENDING',
      });
      respCard.style.left = '0px';
      respCard.style.top = '0px';
      s.respCard = respCard;

      const respBody = respCard.querySelector('.ra-card-body');
      respBody.classList.add('ra-ch4v2-resp-body');

      const statusPill = respCard.querySelector('.ra-status-pill');
      if (statusPill) {
        statusPill.style.background = 'rgba(78,201,255,0.14)';
        statusPill.style.color = '#4ec9ff';
        statusPill.textContent = 'PENDING…';
      }

      // Pre-render JSON (hidden) so we can measure pill target positions
      const responseData = {
        id: FORM.id,
        title: FORM.title,
        status: FORM.status,
        settings: FORM.settings,
        fields: FORM.fields.map((f) => ({
          id: f.id,
          type: f.type,
          label: f.label,
          required: f.required,
          size: f.size,
        })),
      };
      const jsonHtml = highlightJson(responseData);
      respBody.innerHTML = jsonHtml;
      respBody.style.opacity = '0'; // hide JSON until pills land

      gsap.set(respCard, { x: respLeft, y: respTop, opacity: 0 });
      gsap.to(respCard, {
        opacity: 1, duration: 0.5, ease: 'sine.out',
      });

      // Wait for layout so respCard has rendered with JSON content
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => requestAnimationFrame(r));

      // ── Recompute stack center based on ACTUAL response height ──
      // The pre-computed positions in beat 4a used a guess; with full JSON
      // (id/title/status/settings + 3 fields) the response is ~620px tall,
      // not 380. Re-center the stack so both cards fit within the viewport.
      const actualRespH = respCard.offsetHeight;
      const newStackH = s.reqH + s.gap + actualRespH;
      const newStackTop = Math.max(40, (window.innerHeight - newStackH) / 2);
      const newReqY  = newStackTop;
      const newRespY = newStackTop + s.reqH + s.gap;

      // Animate request UP/DOWN to its new stack-top; snap response (still
      // fading in, so a position change is unnoticeable)
      gsap.to(s.requestCard, {
        y: newReqY, duration: 0.45, ease: 'sine.inOut',
      });
      gsap.set(respCard, { y: newRespY });

      await wait(470);

      // ── Pills emerge from form labels, fly to JSON value positions ──
      const pillData = collectPillsFormToResponse(formCard, respBody);
      await flyPillsAndResolveResponse(layer, gsap, pillData, respBody, statusPill);

      LOG('beat 4b done');
    },
  },

  // ── Beat 4c — handoff (~2s, silent) ────────────────────────────────────
  {
    id: 'get-form-handoff',
    chapter: 'get-form',
    duration: 3.5,
    effect: async () => {
      const s = _state;
      const { gsap } = s;

      await wait(1300);

      // Fade chapter content out FIRST so the hex reform isn't crowded
      const fadeTl = gsap.timeline();
      fadeTl.to(s.requestCard, { opacity: 0, x: '-=40', duration: 0.4 }, 0);
      fadeTl.to(s.respCard,    { opacity: 0, x: '-=40', duration: 0.4 }, 0);
      fadeTl.to(s.crystalLbl,  { opacity: 0, duration: 0.3 }, 0);
      fadeTl.to(s.cursor,      { opacity: 0, duration: 0.3 }, 0);
      if (s.formCard) {
        fadeTl.to(s.formCard, {
          opacity: 0, scale: 1.05, filter: 'blur(8px)',
          duration: 0.6, ease: 'power2.in',
        }, 0.1);
        fadeTl.to(s.formCaption, { opacity: 0, duration: 0.4 }, 0.1);
      }
      await wait(700);

      // Constellation continuity: bring 5 crystals back + pan to overview
      // (image-3 anchor frame) before next chapter pans to its crystal.
      revealSharedHex({ duration: 0.7 });
      await panToOverview({ duration: 1.1 });

      await wait(400);

      // Fade chapter-local DOM only. Shared three persists.
      gsap.to(s.layer, { opacity: 0, duration: 0.4, ease: 'sine.in' });
      await wait(420);

      s.stopCrystalTracker();
      if (s.formCard) s.formCard.remove();
      if (s.formCaption) s.formCaption.remove();
      s.crystalLbl.remove();
      s.vignette.remove();
      s.atm.dispose();
      s.layer.remove();
      _state = null;
    },
  },
];

// Draw an SVG path "fetching beam" from (fromX,fromY) → (toX,toY) using
// a stroke-dashoffset draw-on, then fade out. ~0.6s total.
async function drawFetchingBeam(layer, gsap, fromX, fromY, toX, toY) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  Object.assign(svg.style, {
    position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '85',
  });
  svg.setAttribute('width',  String(window.innerWidth));
  svg.setAttribute('height', String(window.innerHeight));

  // Defs: gradient stroke
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  grad.setAttribute('id', 'ra-ch4v2-beam-grad');
  grad.setAttribute('gradientUnits', 'userSpaceOnUse');
  grad.setAttribute('x1', String(fromX)); grad.setAttribute('y1', String(fromY));
  grad.setAttribute('x2', String(toX));   grad.setAttribute('y2', String(toY));
  const s1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  s1.setAttribute('offset', '0%');   s1.setAttribute('stop-color', '#4ec9ff');
  s1.setAttribute('stop-opacity', '0.95');
  grad.appendChild(s1);
  const s2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  s2.setAttribute('offset', '100%'); s2.setAttribute('stop-color', '#4ec9ff');
  s2.setAttribute('stop-opacity', '0.15');
  grad.appendChild(s2);
  defs.appendChild(grad);
  svg.appendChild(defs);

  // Curved path — single quadratic bezier with control point arcing upward
  const ctrlX = (fromX + toX) / 2;
  const ctrlY = Math.min(fromY, toY) - 60;
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const d = `M ${fromX},${fromY} Q ${ctrlX},${ctrlY} ${toX},${toY}`;
  path.setAttribute('d', d);
  path.setAttribute('stroke', 'url(#ra-ch4v2-beam-grad)');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('fill', 'none');
  path.setAttribute('filter', 'drop-shadow(0 0 8px rgba(78,201,255,0.55))');
  svg.appendChild(path);
  document.body.appendChild(svg);

  // Animate stroke draw-on
  const len = path.getTotalLength();
  path.style.strokeDasharray = String(len);
  path.style.strokeDashoffset = String(len);

  await new Promise((res) => {
    gsap.to(path, {
      strokeDashoffset: 0, duration: 0.55, ease: 'expo.out',
      onComplete: res,
    });
  });

  // Bright pulse at arrival point
  const burst = document.createElement('div');
  Object.assign(burst.style, {
    position: 'fixed',
    left: (toX - 14) + 'px', top: (toY - 14) + 'px',
    width: '28px', height: '28px',
    borderRadius: '50%',
    border: '2px solid rgba(78,201,255,0.9)',
    boxShadow: '0 0 32px rgba(78,201,255,0.65)',
    pointerEvents: 'none', zIndex: '86',
    opacity: '1',
  });
  document.body.appendChild(burst);
  gsap.to(burst, {
    scale: 2.4, opacity: 0,
    duration: 0.55, ease: 'expo.out',
    onComplete: () => burst.remove(),
  });

  // Fade out beam
  gsap.to(path, { opacity: 0, duration: 0.4, delay: 0.15,
    onComplete: () => svg.remove() });

  await wait(200);
}

// Find form-card label rects (sources) and matching JSON value rects
// (targets) inside the response body. Returns 3 entries {name, from, to}.
function collectPillsFormToResponse(formCard, respBody) {
  const FIELD_NAMES = ['Name', 'Email', 'Message'];
  const out = [];

  const formLabels = Array.from(formCard.querySelectorAll('.ra-formcard-field label'));
  const valueSpans = Array.from(respBody.querySelectorAll('.ra-tok-str'));

  for (let i = 0; i < FIELD_NAMES.length; i++) {
    const name = FIELD_NAMES[i];
    const sourceLabel = formLabels[i];
    const targetSpan = valueSpans.find((s) => {
      const t = s.textContent.replace(/^&quot;|^"|&quot;$|"$/g, '').trim();
      return t === name;
    });
    if (!sourceLabel || !targetSpan) continue;

    const sRect = sourceLabel.getBoundingClientRect();
    const tRect = targetSpan.getBoundingClientRect();
    out.push({
      name,
      from: { x: sRect.left + 30, y: sRect.top + sRect.height / 2 },
      to:   { x: tRect.left + tRect.width / 2, y: tRect.top + tRect.height / 2 },
    });
  }
  return out;
}

// Pills pop out of form labels, fly to JSON value slots. As the LAST
// pill arrives, status flips to 200 OK and the JSON body crossfades in
// from opacity 0 → 1. Pills then fade so JSON labels take over.
async function flyPillsAndResolveResponse(layer, gsap, pillData, respBody, statusPill) {
  if (!pillData.length) {
    // No matches found — fail-soft: just reveal the JSON
    if (statusPill) {
      statusPill.textContent = '200 OK';
      statusPill.style.background = 'rgba(70,180,80,0.15)';
      statusPill.style.color = '#46b450';
    }
    gsap.to(respBody, { opacity: 1, duration: 0.5 });
    return;
  }

  const pills = [];
  for (const d of pillData) {
    const pill = document.createElement('div');
    pill.className = 'ra-ch4v2-pill';
    pill.innerHTML =
      `<span class="key">label</span><span class="sep">:</span><span class="val">${d.name}</span>`;
    layer.appendChild(pill);
    pills.push({ el: pill, data: d });
  }

  await new Promise((r) => requestAnimationFrame(r));

  const popDur = 0.4;
  const flyDur = 1.0;
  const stagger = 0.18;

  pills.forEach((p, i) => {
    const w = p.el.offsetWidth;
    const h = p.el.offsetHeight;
    const fromX = p.data.from.x - w / 2;
    const fromY = p.data.from.y - h / 2;
    const toX   = p.data.to.x - w / 2;
    const toY   = p.data.to.y - h / 2;

    gsap.set(p.el, { x: fromX, y: fromY, scale: 0.6, opacity: 0 });

    const tl = gsap.timeline({ delay: i * stagger });
    // Pop out of form label
    tl.to(p.el, {
      scale: 1.05, opacity: 1, duration: popDur, ease: 'back.out(1.5)',
    });
    tl.to(p.el, { scale: 1, duration: 0.18, ease: 'sine.out' });
    // Fly along an arc to JSON value position
    const midX = (fromX + toX) / 2;
    const midY = Math.min(fromY, toY) - 80;
    tl.to(p.el, {
      x: midX, y: midY, duration: flyDur * 0.45, ease: 'sine.out',
    });
    tl.to(p.el, {
      x: toX, y: toY, duration: flyDur * 0.55, ease: 'sine.in',
    });
  });

  const firstArriveDelay = popDur + 0.18 + flyDur;
  const lastArriveDelay  = (pills.length - 1) * stagger + popDur + 0.18 + flyDur;

  // As first pill lands: flip status + start JSON crossfade
  pausableSleep(firstArriveDelay * 1000).then(() => {
    if (statusPill) {
      statusPill.textContent = '200 OK';
      statusPill.style.background = 'rgba(70,180,80,0.15)';
      statusPill.style.color = '#46b450';
    }
    gsap.to(respBody, {
      opacity: 1, duration: 0.55, ease: 'sine.out',
    });
  });

  // Pills fade shortly after they land
  pills.forEach((p, i) => {
    const arriveAt = i * stagger + popDur + 0.18 + flyDur;
    gsap.to(p.el, {
      opacity: 0, scale: 0.92,
      duration: 0.4, ease: 'sine.in',
      delay: arriveAt + 0.25,
      onComplete: () => p.el.remove(),
    });
  });

  await wait((lastArriveDelay + 0.7) * 1000);
}

function wait(ms) { return pausableSleep(ms); }

async function typeAroundAnchors(el, msPerChar, anchorSelector) {
  const charNodes = [];
  walkChars(el, charNodes);

  const anchorEls = el.querySelectorAll(anchorSelector);
  const anchorChars = new Set();
  for (const a of anchorEls) {
    a.querySelectorAll('span').forEach((sp) => anchorChars.add(sp));
  }

  for (const n of charNodes) {
    if (!anchorChars.has(n)) n.style.visibility = 'hidden';
  }

  for (const n of charNodes) {
    if (anchorChars.has(n)) continue;
    n.style.visibility = 'visible';
    await wait(msPerChar);
  }
}

function walkChars(root, out) {
  const queue = [...root.childNodes];
  while (queue.length) {
    const node = queue.shift();
    if (node.nodeType === 3) {
      const parent = node.parentNode;
      const frag = document.createDocumentFragment();
      for (const ch of node.nodeValue) {
        const sp = document.createElement('span');
        sp.textContent = ch === ' ' ? ' ' : ch;
        sp.style.display = 'inline-block';
        frag.appendChild(sp);
        out.push(sp);
      }
      parent.replaceChild(frag, node);
    } else if (node.nodeType === 1) {
      queue.push(...node.childNodes);
    }
  }
}
