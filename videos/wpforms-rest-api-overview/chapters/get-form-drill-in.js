// Chapter 4 — get-form drill-in (~12s)
//
// Mirrors Ch.3 exactly. Differences:
//   - curl is wpforms/get-form (with form_id=55, include_fields=true)
//   - response JSON is the full form payload (settings + fields[])
//   - right-side card after reflow is the real WPForms form view
//     (mountFormCardTemplate from _form-card-template.js)
// Continuity from Ch.3: open with the wpforms/get-form crystal at top
// (signals new command). Same Ch.3 cadence: type curl → response (loading
// → forming) → reflow (request+response stack left, form card slides in
// right) → brief hold → exit dive-zoom.

import {
  loadGsap, mountSceneLayer, mountSceneCursor, SCENE_CURSOR_CSS, injectCss,
  mountThreeScene, mountAtmospherics, runAtmospherics,
  ensureRestApiFonts, injectStageCss, COLORS,
  highlightCurl, highlightJson, codeCard, cyanRipple, pausableRaf, pausableSleep,
} from './_kit.js';
import { mountFormCardTemplate, injectFormCardCss } from './_form-card-template.js';

ensureRestApiFonts();
injectStageCss();

export const breakStyle = 'glide';
export const mode = 'per-beat-narration';

const LOG = (...a) => console.log('[ch4]', performance.now().toFixed(0) + 'ms', ...a);

// id 55 — matches Ch.3 TARGET_FORM_ID. Settings + fields per the brief's
// sample-data spec.
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

  injectCss('ra-ch4-css', `
    .ra-ch4-vignette {
      position: fixed; inset: 0; pointer-events: none; z-index: 79;
      background: radial-gradient(ellipse at center,
        rgba(10,14,20,0) 35%,
        rgba(10,14,20,0.5) 78%,
        rgba(10,14,20,0.9) 100%);
    }
    .ra-ch4-loading {
      display: flex; flex-direction: column; gap: 10px; padding: 6px 0;
    }
    .ra-ch4-loading .bar {
      height: 10px; border-radius: 4px;
      background: linear-gradient(90deg,
        rgba(78,201,255,0.08) 0%,
        rgba(78,201,255,0.28) 50%,
        rgba(78,201,255,0.08) 100%);
      background-size: 200% 100%;
      animation: ra-ch4-shimmer 1.2s ease-in-out infinite;
    }
    @keyframes ra-ch4-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .ra-ch4-thinking-tag {
      font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
      color: rgba(78,201,255,0.7); padding: 0 0 6px;
    }
    .ra-ch4-resp-body {
      font-size: 12px;
      line-height: 1.5;
    }
    /* Field-label pill — flies from response JSON to form-card label slot */
    .ra-ch4-pill {
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
    .ra-ch4-pill .key { color: #9cdcfe; }
    .ra-ch4-pill .sep { color: rgba(245,247,250,0.45); margin: 0 4px; }
    .ra-ch4-pill .val { color: ${COLORS.cardText}; font-weight: 600; }
    .ra-ch4-form-caption {
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

  const layer = mountSceneLayer('ra-ch4-layer', { z: 80 });
  layer.style.opacity = '1';
  const atm = mountAtmospherics();
  const three = await mountThreeScene('ra-ch4-three', { z: 70, cameraZ: 7 });
  const cursor = mountSceneCursor(layer);
  cursor.style.opacity = '0';
  cursor.style.transform = 'translate(-9999px, -9999px)';
  const gsap = await loadGsap({ flip: false, motionPath: false });

  const { THREE, scene } = three;

  const rim = new THREE.PointLight(0x4ec9ff, 1.0, 16);
  rim.position.set(0, 0, 4);
  scene.add(rim);

  // Crystal at top-center, labeled wpforms/get-form
  const crystalGroup = new THREE.Group();
  const icoGeom = new THREE.IcosahedronGeometry(0.36, 0);
  const wireGeom = new THREE.WireframeGeometry(icoGeom);
  const wireMat = new THREE.LineBasicMaterial({
    color: 0x4ec9ff, transparent: true, opacity: 0.85,
  });
  const wire = new THREE.LineSegments(wireGeom, wireMat);
  crystalGroup.add(wire);

  const coreGeom = new THREE.SphereGeometry(0.10, 24, 24);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, emissive: 0x4ec9ff, emissiveIntensity: 1.8,
    roughness: 0.3, metalness: 0.7,
  });
  const core = new THREE.Mesh(coreGeom, coreMat);
  crystalGroup.add(core);

  crystalGroup.position.set(0, 1.7, 0);
  scene.add(crystalGroup);

  gsap.to(crystalGroup.rotation, {
    x: '+=' + (Math.PI * 2),
    y: '+=' + (Math.PI * 2.4),
    duration: 16, ease: 'none', repeat: -1,
  });

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

  const stopThreeRaf = pausableRaf(() => {
    three.renderer.render(three.scene, three.camera);
  });
  runAtmospherics(gsap, atm, 13);

  const vignette = document.createElement('div');
  vignette.className = 'ra-ch4-vignette';
  document.body.appendChild(vignette);

  _state = {
    layer, atm, three, cursor, gsap,
    crystalGroup, wireMat, coreMat,
    crystalLbl, vignette, stopThreeRaf,
  };
  _state.stopCrystalTracker = () => { trackerActive = false; stopCrystalRaf(); };

  gsap.to(crystalLbl, { opacity: 1, duration: 0.6, delay: 0.2 });

  return _state;
}

export const setup = ensureSetup;

export default [
  // ── Beat 4a — type-get-form (~5s) ──────────────────────────────────────
  {
    id: 'type-get-form',
    chapter: 'get-form',
    narration: 'get-form-drill-in-fly-into-form',
    duration: 0.05,
    effect: async () => {
      const s = await ensureSetup();
      const { gsap, layer } = s;

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
      const reqTop = Math.max(40, (window.innerHeight - reqH) / 2);
      s.reqLeft = reqLeft;
      s.reqTop = reqTop;
      s.reqH = reqH;

      gsap.set(card, { x: reqLeft - 20, y: reqTop, opacity: 0 });
      gsap.to(card, { x: reqLeft, opacity: 1, duration: 0.5, ease: 'sine.out' });
      await wait(500);

      // get-form route name pre-anchored visible, text types around it
      await typeAroundAnchors(body, 26, '.ra-tok-route');

      LOG('beat 4a done');
    },
  },

  // ── Beat 4b — get-form-response (~5s) ──────────────────────────────────
  {
    id: 'get-form-response',
    chapter: 'get-form',
    narration: 'get-form-drill-in-get-form-response',
    duration: 0.05,
    effect: async () => {
      const s = _state;
      const { gsap, layer } = s;

      // Cursor presses Enter at last char of curl
      const body = s.requestCard.querySelector('.ra-card-body');
      const allSpans = body.querySelectorAll('span');
      const lastChar = allSpans[allSpans.length - 1] || body;
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

      await wait(320);

      // Response card mounts in LOADING state, right column
      const respCardW = Math.min(720, window.innerWidth / 2 - 100);
      const respX = window.innerWidth - respCardW - 80;
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
      s.respCardW = respCardW;
      s.respX = respX;

      const respBody = respCard.querySelector('.ra-card-body');
      respBody.classList.add('ra-ch4-resp-body');

      const statusPill = respCard.querySelector('.ra-status-pill');
      if (statusPill) {
        statusPill.style.background = 'rgba(78,201,255,0.14)';
        statusPill.style.color = '#4ec9ff';
        statusPill.textContent = 'PENDING…';
      }

      respBody.innerHTML = `
        <div class="ra-ch4-thinking-tag">awaiting response</div>
        <div class="ra-ch4-loading">
          <div class="bar" style="width:40%;"></div>
          <div class="bar" style="width:80%;"></div>
          <div class="bar" style="width:65%;"></div>
          <div class="bar" style="width:55%;"></div>
          <div class="bar" style="width:72%;"></div>
        </div>
      `;

      const respHLoading = respCard.offsetHeight;
      const respTopLoading = Math.max(40, (window.innerHeight - respHLoading) / 2);

      gsap.set(respCard, { x: respX + 60, y: respTopLoading, opacity: 0 });
      gsap.to(respCard, {
        x: respX, opacity: 1, duration: 0.55, ease: 'back.out(1.4)',
      });

      await wait(900);

      // Resolve: 200 OK + JSON
      if (statusPill) {
        statusPill.textContent = '200 OK';
        statusPill.style.background = 'rgba(70,180,80,0.15)';
        statusPill.style.color = COLORS.green;
      }

      // Trimmed for readability — drop created/modified/author + description.
      // All 3 fields stay visible; card no longer overflows the viewport.
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

      gsap.to(respBody, {
        opacity: 0, duration: 0.18, ease: 'sine.in',
        onComplete: () => {
          respBody.innerHTML = jsonHtml;
          gsap.to(respBody, { opacity: 1, duration: 0.32, ease: 'sine.out' });
        },
      });

      await wait(500);

      const shim = respCard.querySelector('.ra-shimmer');
      if (shim) {
        gsap.fromTo(shim,
          { opacity: 0, x: '-100%' },
          { opacity: 0.85, x: '100%', duration: 1.4, ease: 'sine.inOut' });
      }

      // Crystal subtle dim
      gsap.to(s.coreMat, { emissiveIntensity: 1.3, duration: 0.6 });
      gsap.to(s.wireMat, { opacity: 0.7,  duration: 0.6 });

      await wait(700);

      // ── Layout reflow — same Ch.3 pattern: request + response stack
      //    centered on left, form card slides in on right ──
      const respH = respCard.offsetHeight;
      const gap = 18;
      const stackH = s.reqH + gap + respH;
      const stackTop = Math.max(40, (window.innerHeight - stackH) / 2);
      const stackLeft = s.reqLeft;

      const reqTargetY = stackTop;
      const respTargetX = stackLeft;
      const respTargetY = stackTop + s.reqH + gap;

      gsap.to(s.requestCard, {
        x: stackLeft, y: reqTargetY,
        duration: 0.85, ease: 'expo.inOut',
      });
      gsap.to(respCard, {
        x: respTargetX, y: respTargetY,
        duration: 0.85, ease: 'expo.inOut',
      });

      // ── Mount form-card INVISIBLY at target so we can measure label
      //    positions for pill targeting ──
      await wait(150);
      const formCard = mountFormCardTemplate({
        id: FORM.id,
        title: FORM.title,
        status: FORM.status,
        author: FORM.author,
        fields: FORM.fields,
      });
      formCard.style.left = '0px';
      formCard.style.top = '0px';
      formCard.style.width = Math.min(respCardW, 480) + 'px';
      layer.appendChild(formCard);
      s.formCard = formCard;

      // Wait for reflow tweens to finish (response card now at its final
      // bottom-left position) before computing pill source positions.
      await wait(700);

      // Measure form-card; place it but keep it invisible
      const formH = formCard.offsetHeight;
      const formW = formCard.offsetWidth;
      const formX = respX + (respCardW - formW) / 2;
      const formTop = Math.max(40, (window.innerHeight - formH) / 2);
      gsap.set(formCard, { x: formX, y: formTop, opacity: 0, scale: 0.92 });

      // Force one more frame so form-card label rects are valid
      await new Promise((r) => requestAnimationFrame(r));

      // ── Pill choreography: pills emerge from JSON label values, fly
      //    to form-card label slots, form materializes as they arrive ──
      const pillData = collectPillTargets(respBody, formCard);
      await flyPillsToFormCard(layer, gsap, pillData, formCard);

      // Caption pill below
      const caption = document.createElement('div');
      caption.className = 'ra-ch4-form-caption';
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
      gsap.to(caption, { opacity: 1, duration: 0.5, delay: 0.5 });
      pausableSleep(900).then(positionCaption);

      LOG('beat 4b done');
    },
  },

  // ── Beat 4c — handoff (~2s, silent) ────────────────────────────────────
  {
    id: 'get-form-handoff',
    chapter: 'get-form',
    duration: 0.05,
    effect: async () => {
      const s = _state;
      const { gsap } = s;

      // Just breathe before exit (no cursor movement, no extra effects)
      await wait(1700);

      const exitTl = gsap.timeline();
      exitTl.to(s.requestCard, { opacity: 0, x: '-=40', duration: 0.4 }, 0);
      exitTl.to(s.respCard,    { opacity: 0, x: '-=40', duration: 0.4 }, 0);
      exitTl.to(s.crystalLbl,  { opacity: 0, duration: 0.3 }, 0);
      exitTl.to(s.cursor,      { opacity: 0, duration: 0.3 }, 0);
      if (s.formCard) {
        exitTl.to(s.formCard, {
          opacity: 0, scale: 1.05, filter: 'blur(8px)',
          duration: 0.6, ease: 'power2.in',
        }, 0.1);
        exitTl.to(s.formCaption, { opacity: 0, duration: 0.4 }, 0.1);
      }

      await wait(900);

      gsap.to(s.layer, {
        scale: 1.06, opacity: 0, filter: 'blur(20px)',
        duration: 0.5, ease: 'power2.in',
      });
      await wait(560);

      // Cleanup
      s.stopCrystalTracker();
      if (s.formCard) s.formCard.remove();
      if (s.formCaption) s.formCaption.remove();
      s.crystalLbl.remove();
      s.vignette.remove();
      s.stopThreeRaf?.();
      s.three.dispose();
      s.atm.dispose();
      s.layer.remove();
      _state = null;
    },
  },
];

// Collect source/target rects for the pill flight. Sources are the JSON
// label-value spans inside the response body. Targets are the field
// label elements inside the form-card template.
function collectPillTargets(respBody, formCard) {
  const FIELD_NAMES = ['Name', 'Email', 'Message'];
  const out = [];

  const valueSpans = Array.from(respBody.querySelectorAll('.ra-tok-str'));
  const formLabels = Array.from(formCard.querySelectorAll('.ra-formcard-field label'));

  for (let i = 0; i < FIELD_NAMES.length; i++) {
    const name = FIELD_NAMES[i];
    const sourceSpan = valueSpans.find((s) => {
      // strip outer quotes that highlightJson preserves
      const t = s.textContent.replace(/^&quot;|^"|&quot;$|"$/g, '').trim();
      return t === name;
    });
    const targetLabel = formLabels[i];
    if (!sourceSpan || !targetLabel) continue;

    const sRect = sourceSpan.getBoundingClientRect();
    const tRect = targetLabel.getBoundingClientRect();
    out.push({
      name,
      from: { x: sRect.left + sRect.width / 2, y: sRect.top + sRect.height / 2 },
      to:   { x: tRect.left + tRect.width / 2 + 30, y: tRect.top + tRect.height / 2 },
    });
  }
  return out;
}

// Spawn pills at the JSON label-value positions, pop them out, then
// fly each to its form-card label slot. As the last pill arrives, the
// form-card fades in. Pills then fade out so the actual form labels
// take over.
async function flyPillsToFormCard(layer, gsap, pillData, formCard) {
  if (!pillData.length) {
    // No matches found — just fade the form in normally
    gsap.to(formCard, {
      opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.2)',
    });
    return;
  }

  const pills = [];
  for (const d of pillData) {
    const pill = document.createElement('div');
    pill.className = 'ra-ch4-pill';
    pill.innerHTML =
      `<span class="key">label</span><span class="sep">:</span><span class="val">${d.name}</span>`;
    layer.appendChild(pill);
    pills.push({ el: pill, data: d });
  }

  // Wait one frame so pills have layout (offsetWidth/Height resolve)
  await new Promise((r) => requestAnimationFrame(r));

  // Pop-out from JSON value position
  const popDur = 0.4;
  const flyDur = 0.95;
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
    // Pop out of the JSON
    tl.to(p.el, {
      scale: 1.05, opacity: 1, duration: popDur, ease: 'back.out(1.5)',
    });
    tl.to(p.el, {
      scale: 1, duration: 0.18, ease: 'sine.out',
    });
    // Fly to form-card label position along an arc — use an intermediate
    // proxy point that arcs upward to give the motion lift
    const midX = (fromX + toX) / 2;
    const midY = Math.min(fromY, toY) - 80; // arc upward
    tl.to(p.el, {
      // First half: rise toward arc apex
      x: midX, y: midY,
      duration: flyDur * 0.45,
      ease: 'sine.out',
    });
    tl.to(p.el, {
      // Second half: descend onto target
      x: toX, y: toY,
      duration: flyDur * 0.55,
      ease: 'sine.in',
    });
  });

  // Total flight time per pill: popDur + 0.18 + flyDur
  const lastArriveDelay = (pills.length - 1) * stagger + popDur + 0.18 + flyDur;

  // Form-card materializes ~ when first pill lands (slightly before all done)
  const firstArriveDelay = popDur + 0.18 + flyDur;
  gsap.to(formCard, {
    opacity: 1, scale: 1,
    duration: 0.55, ease: 'back.out(1.2)',
    delay: firstArriveDelay - 0.15,
  });

  // Pills fade out shortly after they land, so the form's real labels
  // take over visually
  pills.forEach((p, i) => {
    const arriveAt = i * stagger + popDur + 0.18 + flyDur;
    gsap.to(p.el, {
      opacity: 0, scale: 0.92,
      duration: 0.35, ease: 'sine.in',
      delay: arriveAt + 0.18,
      onComplete: () => p.el.remove(),
    });
  });

  // Wait for full sequence to finish before returning
  await wait((lastArriveDelay + 0.6) * 1000);
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
        sp.textContent = ch === ' ' ? ' ' : ch;
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
