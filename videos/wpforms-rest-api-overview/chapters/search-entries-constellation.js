// Chapter 5 — search-entries constellation (~13s)
//
// Layout (3-column, viewport-percentage based):
//   LEFT  (20%): request card with curl
//   CENTER(45%): constellation of entry-particles, full width spread
//   RIGHT (35%): response card with JSON (after Enter)
//
// Beat 5a: camera dollies back, ~80 entry-particles fade in around
//   constellation center, parallax grid pair activates.
// Beat 5b: request card on the left fills with the search-entries curl.
//   Particles drift bright the entire time. ON ENTER PRESS the filter
//   passes fire SEQUENTIALLY (slower, deliberate), narrowing the
//   constellation to 4 matches. Then response card slides in on the right.
// Beat 5c: amber "Uses page, not offset" callout near input[page] segment.
//   Holds 2s, fades. Exit dive-zoom.

import {
  loadGsap, mountSceneLayer, mountSceneCursor, SCENE_CURSOR_CSS, injectCss,
  mountAtmospherics, runAtmospherics,
  ensureRestApiFonts, injectStageCss, COLORS,
  highlightCurl, highlightJson, codeCard, cyanRipple,
  getSharedScene, panToCrystal, panToOverview, panToStation,
  revealSharedHex, focusSharedCrystal, hideAllCrystals, pausableRaf, pausableSleep,
} from './_kit.js';

ensureRestApiFonts();
injectStageCss();

export const breakStyle = 'glide';
export const mode = 'per-beat-narration';

const LOG = (...a) => console.log('[ch5]', performance.now().toFixed(0) + 'ms', ...a);

// Sample data — Ana Reyes / form 100, per the user-supplied response payload
const FORM_ID = 100;
const PARTICLE_COUNT     = 80;
const FORM_MATCH_COUNT   = 25; // entries on form 100
const SEARCH_MATCH_COUNT = 10; // entries matching ana@example.com
const DATE_MATCH_COUNT   = 4;  // entries also after 2026-02-01

// Constellation sits centered in the gap between request (30% LEFT) and
// response (35% RIGHT) cards — gap midpoint at screen-x 47.5%, slightly
// left of viewport center → world offset ~ -0.44.
// Particle disc spans r = 1.0 → 5.0 world units (wider area).
const CONSTELLATION_OFFSET_X = -0.44;
const SPREAD_R_MIN = 1.0;
const SPREAD_R_MAX = 5.0;
const Y_SQUASH = 0.62;

// Pre-formatted JSON string for the response card. Custom-formatted so
// each `fields[]` item sits on a single line — JSON.stringify with
// indent:2 would expand each field-object to 6 lines; this is tighter.
const RESPONSE_JSON_STR = `{
  "entries": [
    {
      "id": 11,
      "form_id": 100,
      "date": "2026-05-02 01:23:29",
      "status": "",
      "viewed": false,
      "starred": false,
      "fields": [
        { "id": 1, "name": "Name",  "value": "Ana Reyes",       "type": "name"  },
        { "id": 2, "name": "Email", "value": "ana@example.com", "type": "email" }
      ]
    }
  ],
  "total": 4,
  "total_pages": 4,
  "page": 1,
  "limit": 1
}`;

let _state = null;

async function ensureSetup() {
  if (_state) return _state;
  ensureRestApiFonts();
  injectStageCss();
  injectCss('rest-api-cursor-css', SCENE_CURSOR_CSS);

  injectCss('ra-ch5-css', `
    .ra-ch5-vignette {
      position: fixed; inset: 0; pointer-events: none; z-index: 79;
      background: radial-gradient(ellipse at center,
        rgba(10,14,20,0) 35%,
        rgba(10,14,20,0.5) 78%,
        rgba(10,14,20,0.9) 100%);
    }
    .ra-ch5-resp-body {
      font-size: 12px; line-height: 1.55;
    }
    .ra-ch5-form-anchor {
      position: fixed; left: 50%;
      transform: translate(-50%, 0);
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 20px; font-weight: 500;
      color: rgba(245,247,250,0.78);
      letter-spacing: 0.02em;
      padding: 8px 18px;
      border-radius: 999px;
      background: rgba(13,17,23,0.62);
      border: 1px solid rgba(78,201,255,0.22);
      backdrop-filter: blur(4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      opacity: 0; pointer-events: none; white-space: nowrap;
      z-index: 88;
    }
    .ra-ch5-pg-glow {
      position: absolute; pointer-events: none;
      border-radius: 6px;
      border: 1px solid rgba(78,201,255,0);
      box-shadow: 0 0 0 0 rgba(78,201,255,0);
      transition: none;
    }
    .ra-ch5-callout {
      position: fixed;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 12px; font-weight: 600;
      letter-spacing: 0.02em;
      color: ${COLORS.amber};
      background: rgba(13,17,23,0.92);
      border: 1.5px solid rgba(240,184,73,0.7);
      padding: 8px 14px;
      border-radius: 8px;
      box-shadow:
        0 14px 36px rgba(0,0,0,0.6),
        0 0 32px rgba(240,184,73,0.28);
      backdrop-filter: blur(4px);
      opacity: 0; pointer-events: none; white-space: nowrap;
      z-index: 92;
    }
    .ra-ch5-callout::after {
      content: '';
      position: absolute;
      bottom: -7px; left: 50%; transform: translateX(-50%) rotate(45deg);
      width: 12px; height: 12px;
      background: rgba(13,17,23,0.92);
      border-right: 1.5px solid rgba(240,184,73,0.7);
      border-bottom: 1.5px solid rgba(240,184,73,0.7);
    }
  `);

  const layer = mountSceneLayer('ra-ch5-layer', { z: 80 });
  layer.style.opacity = '1';
  const atm = mountAtmospherics({ parallax: true });
  const cursor = mountSceneCursor(layer);
  cursor.style.opacity = '0';
  cursor.style.transform = 'translate(-9999px, -9999px)';

  // Attach to the SHARED persistent scene.
  const TARGET_IDX = 5; // wpforms/search-entries
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
    '/<span style="color:#ffd866; font-weight:600;">search-entries</span>';
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

  // ── Constellation: 80 sprite-based glow particles, wider centered disc ──
  const particleTexture = createGlowTexture(THREE);
  const particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const r = SPREAD_R_MIN + Math.random() * (SPREAD_R_MAX - SPREAD_R_MIN);
    const theta = Math.random() * Math.PI * 2;
    const x = r * Math.cos(theta) + CONSTELLATION_OFFSET_X;
    const y = r * Math.sin(theta) * Y_SQUASH;
    const z = (Math.random() - 0.5) * 1.6;

    const mat = new THREE.SpriteMaterial({
      map: particleTexture,
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(mat);
    const scale = 0.22 + Math.random() * 0.18;
    sprite.scale.set(scale, scale, 1);
    sprite.position.set(x, y, z);
    scene.add(sprite);

    particles.push({
      mesh: sprite, material: mat,
      origX: x, origY: y, origZ: z,
      baseScale: scale,
      formMatch:   i < FORM_MATCH_COUNT,
      searchMatch: i < SEARCH_MATCH_COUNT,
      dateMatch:   i < DATE_MATCH_COUNT,
    });

    // Subtle perpetual drift
    gsap.to(sprite.position, {
      x: x + (Math.random() - 0.5) * 0.4,
      y: y + (Math.random() - 0.5) * 0.4,
      duration: 4 + Math.random() * 3,
      ease: 'sine.inOut',
      repeat: -1, yoyo: true,
    });
  }

  runAtmospherics(gsap, atm, 14, { parallax: true });

  const vignette = document.createElement('div');
  vignette.className = 'ra-ch5-vignette';
  document.body.appendChild(vignette);

  const formAnchor = document.createElement('div');
  formAnchor.className = 'ra-ch5-form-anchor';
  formAnchor.innerHTML = `<span style="color:#9cdcfe;">${PARTICLE_COUNT}</span> entries · across all forms`;
  layer.appendChild(formAnchor);

  _state = {
    layer, atm, three, cursor, gsap,
    crystalGroup, wireMat, coreMat,
    abilities, targetCrystal,
    crystalLbl, vignette, formAnchor,
    particles,
  };
  _state.stopCrystalTracker = () => { trackerActive = false; stopCrystalRaf(); };

  return _state;
}

export const setup = ensureSetup;

export default [
  // ── Beat 5a — reveal-constellation (~3s) ───────────────────────────────
  {
    id: 'reveal-constellation',
    chapter: 'search-entries',
    duration: 4.0,
    effect: async () => {
      const s = await ensureSetup();
      const { gsap, three } = s;

      // Whiteboard transition: previous chapter ended at overview pose.
      // Pan into search-entries, collapse other 5 crystals, then dolly
      // back wide for the constellation reveal. Search-entries crystal
      // stays visible as the anchor at top of frame.
      await panToCrystal(s.targetCrystal, { duration: 0.9 });
      focusSharedCrystal(s.targetCrystal, { duration: 0.5 });
      gsap.to(s.crystalLbl, { opacity: 1, duration: 0.4 });

      // Camera dollies WAY back to expose the particle constellation.
      gsap.to(three.camera.position, {
        x: 0, y: 0, z: 12, duration: 2.4, ease: 'sine.inOut',
      });

      for (const p of s.particles) {
        const targetOp = 0.55 + Math.random() * 0.35;
        gsap.to(p.material, {
          opacity: targetOp,
          duration: 1.0, ease: 'sine.out',
          delay: 0.3 + Math.random() * 1.2,
        });
      }

      gsap.to(s.formAnchor, { opacity: 1, duration: 0.6, delay: 1.6 });

      // Form anchor follows the constellation center (offset = 0)
      const positionAnchor = () => {
        const v = new three.THREE.Vector3(CONSTELLATION_OFFSET_X, -3.0, 0).project(three.camera);
        const sx = ((v.x + 1) / 2) * window.innerWidth;
        const sy = ((-v.y + 1) / 2) * window.innerHeight;
        s.formAnchor.style.left = (sx) + 'px';
        s.formAnchor.style.top  = (sy + 16) + 'px';
        s.formAnchor.style.transform = 'translate(-50%, 0)';
      };
      positionAnchor();
      let anchorTrackerActive = true;
      const trackAnchor = () => {
        if (!anchorTrackerActive) return;
        positionAnchor();
      };
      const stopAnchorRaf = pausableRaf(trackAnchor);
      const prevStop = s.stopCrystalTracker;
      s.stopCrystalTracker = () => {
        anchorTrackerActive = false;
        stopAnchorRaf();
        if (prevStop) prevStop();
      };

      LOG('beat 5a done');
    },
  },

  // ── Beat 5b — search-and-filter (~9s) ──────────────────────────────────
  {
    id: 'search-and-filter',
    chapter: 'search-entries',
    duration: 9.5,
    effect: async () => {
      const s = _state;
      const { gsap, layer } = s;

      // ── LEFT column: request card, ~30% viewport width ──
      const W = window.innerWidth, H = window.innerHeight;
      const reqW = Math.max(360, Math.floor(W * 0.30) - 40);
      const reqLeft = 40;
      const reqCard = codeCard({
        parent: layer,
        label: 'request',
        x: 0, y: 0,
        width: reqW,
      });
      reqCard.style.left = '0px';
      reqCard.style.top = '0px';
      s.reqCard = reqCard;

      const cmd = `curl "$WP_SITE/wp-json/wp-abilities/v1/abilities/wpforms/search-entries/run?input%5Bform_id%5D=100&input%5Bsearch%5D=ana%40example.com&input%5Bdate_from%5D=2026-02-01&input%5Bpage%5D=1"`;

      // Per-segment color tints
      const tints = {
        '[form_id]':   'ra-tok-neutral',
        '[search]':    'ra-tok-cyan',
        '[date_from]': 'ra-tok-amber',
        '[page]':      'ra-tok-violet',
      };

      const reqBody = reqCard.querySelector('.ra-card-body');
      reqBody.innerHTML = highlightCurl(cmd, { tints });

      const reqH = reqCard.offsetHeight;
      const reqTop = Math.max(40, (H - reqH) / 2);
      s.reqLeft = reqLeft;
      s.reqTop = reqTop;
      s.reqH = reqH;

      gsap.set(reqCard, { x: reqLeft - 20, y: reqTop, opacity: 0 });
      gsap.to(reqCard, {
        x: reqLeft, opacity: 1, duration: 0.5, ease: 'sine.out',
      });
      await wait(500);

      // ── Type curl normally — particles stay bright, NO filters yet ──
      await typeAroundAnchors(reqBody, 14, '.ra-tok-route');

      await wait(280);

      // ── Cursor presses Enter at last char ──
      const allSpans = reqBody.querySelectorAll('span');
      const lastChar = allSpans[allSpans.length - 1] || reqBody;
      const lcRect = lastChar.getBoundingClientRect();
      const tailX = lcRect.right + 8;
      const tailY = lcRect.top + lcRect.height / 2;
      s.cursor.style.opacity = '1';
      s.cursor.style.transform = `translate(${tailX}px, ${tailY}px)`;
      cyanRipple(layer, tailX, tailY, gsap);

      gsap.to(reqCard, {
        boxShadow: '0 0 0 1px rgba(78,201,255,0.6), 0 0 36px rgba(78,201,255,0.32)',
        duration: 0.18, yoyo: true, repeat: 1, ease: 'sine.inOut',
      });

      // Brief pause for the ripple to register
      await wait(400);

      // ── Sequential filter passes (slower, deliberate) ──
      fireFormFilter(s);
      await wait(1100);

      fireSearchFilter(s);
      await wait(1100);

      fireDateFilter(s);
      await wait(1300);

      firePageDisplay(s);
      await wait(500);

      // ── RIGHT column: response card, ~35% viewport width ──
      const respW = Math.max(360, Math.floor(W * 0.35) - 40);
      const respLeft = W - respW - 40;
      const respCard = codeCard({
        parent: layer,
        label: 'response',
        x: 0, y: 0,
        width: respW,
        status: '200 OK',
      });
      respCard.style.left = '0px';
      respCard.style.top = '0px';
      s.respCard = respCard;

      const respBody = respCard.querySelector('.ra-card-body');
      respBody.classList.add('ra-ch5-resp-body');
      // Use pre-formatted JSON string so fields[] items stay on single lines
      respBody.innerHTML = highlightJsonStr(RESPONSE_JSON_STR);

      // Measure post-render, vertically center
      await new Promise((r) => requestAnimationFrame(r));
      const respH = respCard.offsetHeight;
      const respTop = Math.max(40, (H - respH) / 2);

      gsap.set(respCard, { x: respLeft + 60, y: respTop, opacity: 0 });
      gsap.to(respCard, {
        x: respLeft, opacity: 1, duration: 0.6, ease: 'back.out(1.4)',
      });

      const shim = respCard.querySelector('.ra-shimmer');
      if (shim) {
        gsap.fromTo(shim,
          { opacity: 0, x: '-100%' },
          { opacity: 0.85, x: '100%', duration: 1.4, ease: 'sine.inOut' });
      }

      await wait(550);
      pulsePaginationBlock(respCard, respBody, gsap);

      LOG('beat 5b done');
    },
  },

  // ── Beat 5c — closing breath (~3s, narration only) ────────────────────
  {
    id: 'page-not-offset',
    chapter: 'search-entries',
    duration: 4.5,
    effect: async () => {
      const s = _state;
      const { gsap } = s;

      // No visual callout — narration carries the page-vs-offset point.
      await wait(2200);

      // ── Fade chapter content first (cards, cursor, particles) ──
      const fadeTl = gsap.timeline();
      fadeTl.to(s.reqCard,    { opacity: 0, x: '-=30', duration: 0.5 }, 0);
      fadeTl.to(s.respCard,   { opacity: 0, x: '+=30', duration: 0.5 }, 0);
      fadeTl.to(s.cursor,     { opacity: 0, duration: 0.4 }, 0);
      fadeTl.to(s.formAnchor, { opacity: 0, duration: 0.4 }, 0);
      for (const p of s.particles) {
        fadeTl.to(p.material, { opacity: 0, duration: 0.6 }, 0);
      }
      await wait(700);

      // ── Pan back to overview while reviving the 5 hidden crystals ──
      revealSharedHex({ duration: 0.7 });
      await panToOverview({ duration: 1.1 });
      await wait(400);

      // Fade chapter-local DOM only. Shared three persists for Ch.6.
      gsap.to(s.layer, { opacity: 0, duration: 0.4, ease: 'sine.in' });
      await wait(420);

      // Remove particles from the shared scene so they don't bleed into Ch.6.
      for (const p of s.particles) {
        try { s.three.scene.remove(p.mesh); } catch (_) { /* tolerate */ }
        try { p.material.dispose(); } catch (_) { /* tolerate */ }
      }

      s.stopCrystalTracker();
      s.crystalLbl.remove();
      s.formAnchor.remove();
      s.vignette.remove();
      if (s.callout) s.callout.remove();
      s.atm.dispose();
      s.layer.remove();
      _state = null;
    },
  },
];

// Type chars sequentially without firing any filters — particles stay
// bright until Enter is pressed. Filter passes happen post-Enter in beat 5b.
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

  for (const span of charNodes) {
    if (anchorChars.has(span)) continue;
    span.style.visibility = 'visible';
    await wait(msPerChar);
  }
}

// ── Filter passes — slower, deliberate animations (post-Enter in 5b) ──

const FILTER_DUR = 0.95; // base duration for filter dim/scale tweens
const CLUSTER_DUR = 1.1; // settle-into-cluster duration

function fireFormFilter(s) {
  const { gsap } = s;
  for (const p of s.particles) {
    if (!p.formMatch) {
      gsap.to(p.material, { opacity: 0.05, duration: FILTER_DUR, ease: 'expo.out' });
      gsap.to(p.mesh.scale, {
        x: p.baseScale * 0.55, y: p.baseScale * 0.55, z: 1,
        duration: FILTER_DUR, ease: 'expo.out',
      });
    }
  }
  swapCaption(s, `<span style="color:#9cdcfe;">${FORM_MATCH_COUNT}</span> entries · on form id ${FORM_ID}`);
}

function fireSearchFilter(s) {
  const { gsap } = s;
  for (const p of s.particles) {
    if (p.formMatch && !p.searchMatch) {
      gsap.to(p.material, { opacity: 0.04, duration: FILTER_DUR, ease: 'expo.out' });
      gsap.to(p.mesh.scale, {
        x: p.baseScale * 0.45, y: p.baseScale * 0.45, z: 1,
        duration: FILTER_DUR, ease: 'expo.out',
      });
    }
  }
  swapCaption(s, `<span style="color:#9cdcfe;">${SEARCH_MATCH_COUNT}</span> entries · matching <span style="color:${COLORS.cyan};">"ana@example.com"</span>`);
}

function fireDateFilter(s) {
  const { gsap } = s;
  for (const p of s.particles) {
    if (p.searchMatch && !p.dateMatch) {
      gsap.to(p.material, { opacity: 0.04, duration: FILTER_DUR, ease: 'expo.out' });
      gsap.to(p.mesh.scale, {
        x: p.baseScale * 0.45, y: p.baseScale * 0.45, z: 1,
        duration: FILTER_DUR, ease: 'expo.out',
      });
    } else if (p.dateMatch) {
      // Settle into tight cluster — radius 0.5-1.0 around constellation center
      const r = 0.5 + Math.random() * 0.5;
      const theta = Math.random() * Math.PI * 2;
      const tx = r * Math.cos(theta) + CONSTELLATION_OFFSET_X;
      const ty = r * Math.sin(theta) * Y_SQUASH;
      gsap.killTweensOf(p.mesh.position);
      gsap.to(p.mesh.position, {
        x: tx, y: ty,
        duration: CLUSTER_DUR, ease: 'expo.out',
      });
      gsap.to(p.material, {
        opacity: 1.0, duration: 0.6, ease: 'sine.out',
      });
      gsap.to(p.mesh.scale, {
        x: p.baseScale * 1.5, y: p.baseScale * 1.5, z: 1,
        duration: CLUSTER_DUR, ease: 'back.out(1.4)',
      });
    }
  }
  swapCaption(s, `<span style="color:#9cdcfe;">${DATE_MATCH_COUNT}</span> entries · since <span style="color:${COLORS.amber};">2026-02-01</span>`);
}

// page=1 does NOT narrow the matches — pagination just selects which slice.
// Caption updates to show pagination context; particles untouched.
function firePageDisplay(s) {
  swapCaption(
    s,
    `<span style="color:#9cdcfe;">${DATE_MATCH_COUNT}</span> matching entries · ` +
    `<span style="color:${COLORS.violet || '#b178ff'};">page 1 of 4</span>`
  );
}

function swapCaption(s, html) {
  if (!s.formAnchor) return;
  s.gsap.to(s.formAnchor, {
    opacity: 0, duration: 0.22, ease: 'sine.in',
    onComplete: () => {
      s.formAnchor.innerHTML = html;
      s.gsap.to(s.formAnchor, { opacity: 1, duration: 0.36, ease: 'sine.out' });
    },
  });
}

function createGlowTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0.00, 'rgba(255,255,255,1)');
  grad.addColorStop(0.20, 'rgba(180,230,255,0.95)');
  grad.addColorStop(0.45, 'rgba(78,201,255,0.55)');
  grad.addColorStop(0.75, 'rgba(78,201,255,0.12)');
  grad.addColorStop(1.00, 'rgba(78,201,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// Highlight a pre-formatted JSON string. Same regex as highlightJson but
// works on raw strings (so we can keep custom formatting like single-line
// fields[] items).
function highlightJsonStr(jsonStr) {
  const escaped = jsonStr
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  return escaped
    .replace(/(&quot;[^&]+?&quot;)(\s*:)/g, '<span class="ra-tok-prop">$1</span>$2')
    .replace(/:\s*(&quot;[^&]*?&quot;)/g, ': <span class="ra-tok-str">$1</span>')
    .replace(/:\s*(true|false|null)/g, ': <span class="ra-tok-kw">$1</span>')
    .replace(/:\s*(-?\d+(\.\d+)?)/g, ': <span class="ra-tok-num">$1</span>');
}

function pulsePaginationBlock(respCard, respBody, gsap) {
  const propSpans = Array.from(respBody.querySelectorAll('.ra-tok-prop'));
  const targetKeys = ['"total"', '"total_pages"', '"page"', '"limit"'];
  const targetSpans = propSpans.filter((s) => targetKeys.includes(s.textContent.trim()));
  if (!targetSpans.length) return;

  let top = Infinity, bottom = -Infinity, left = Infinity, right = -Infinity;
  for (const sp of targetSpans) {
    const r = sp.getBoundingClientRect();
    if (r.top < top) top = r.top;
    if (r.bottom > bottom) bottom = r.bottom;
    if (r.left < left) left = r.left;
    if (r.right > right) right = r.right;
  }
  const respRect = respBody.getBoundingClientRect();
  left  = respRect.left + 6;
  right = respRect.right - 6;

  const glow = document.createElement('div');
  glow.className = 'ra-ch5-pg-glow';
  Object.assign(glow.style, {
    position: 'fixed',
    left: left + 'px',
    top: (top - 4) + 'px',
    width: (right - left) + 'px',
    height: (bottom - top + 8) + 'px',
    pointerEvents: 'none',
    zIndex: '91',
  });
  document.body.appendChild(glow);

  const tl = gsap.timeline({
    onComplete: () => glow.remove(),
  });
  tl.to(glow, {
    duration: 0.5, ease: 'sine.out',
    border: '1px solid rgba(78,201,255,0.65)',
    boxShadow: '0 0 0 4px rgba(78,201,255,0.10), 0 0 28px rgba(78,201,255,0.45) inset',
  });
  tl.to(glow, {
    duration: 0.7, ease: 'sine.in', delay: 0.3,
    border: '1px solid rgba(78,201,255,0)',
    boxShadow: '0 0 0 0 rgba(78,201,255,0), 0 0 0 0 rgba(78,201,255,0) inset',
  });
}

function wait(ms) { return pausableSleep(ms); }

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
