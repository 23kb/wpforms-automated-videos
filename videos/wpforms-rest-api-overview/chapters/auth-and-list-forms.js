// Chapter 3 — Auth + list-forms (~12s)
//
// Beat 3a: type curl with `list-forms` route name pre-anchored visible,
//   text typing in around it.
// Beat 3b: response (loading → forming) returns 3 form summaries that
//   match what's actually in the admin-forms-overview snapshot. Layout
//   reflows: response Flips to bottom-left under the request, cloned
//   real WPForms admin Forms list (#wpforms-overview) appears on right
//   side. Pop-out ripple cascades on each <tr> row.
// Beat 3c: cursor lands on the Contact Us form row (id 55) — the form
//   Ch.4 will drill into via get-form.

import {
  loadGsap, mountSceneLayer, mountSceneCursor, SCENE_CURSOR_CSS, injectCss,
  mountAtmospherics, runAtmospherics,
  ensureRestApiFonts, injectStageCss, COLORS,
  highlightCurl, highlightJson, codeCard, cyanRipple,
  cloneFromIframe,
  getSharedScene, panToCrystal, panToOverview, panToStation,
  revealSharedHex, focusSharedCrystal, hideAllCrystals, pausableRaf, pausableSleep,
} from './_kit.js';

ensureRestApiFonts();
injectStageCss();

export const breakStyle = 'glide';
export const mode = 'per-beat-narration';

const LOG = (...a) => console.log('[ch3]', performance.now().toFixed(0) + 'ms', ...a);

// Forms ACTUALLY in the admin-forms-overview snapshot — keeps the JSON
// response in sync with what the cloned admin table will show.
const SNAPSHOT_FORMS = [
  { id: 55, title: 'Contact Us form',  status: 'publish',
    created: '2026-01-27 10:00:00', modified: '2026-02-15 14:30:00', author: 1 },
  { id: 53, title: 'Newsletter Signup', status: 'publish',
    created: '2026-02-08 08:00:00', modified: '2026-02-12 09:15:00', author: 1 },
  { id: 40, title: 'Job Application',   status: 'publish',
    created: '2026-02-02 11:20:00', modified: '2026-02-10 14:00:00', author: 1 },
];

// id 55 is the form Ch.4 will drill into.
const TARGET_FORM_ID = 55;

let _state = null;

async function ensureSetup() {
  if (_state) return _state;
  ensureRestApiFonts();
  injectStageCss();
  injectCss('rest-api-cursor-css', SCENE_CURSOR_CSS);

  injectCss('ra-ch3-css', `
    .ra-ch3-vignette {
      position: fixed; inset: 0; pointer-events: none; z-index: 79;
      background: radial-gradient(ellipse at center,
        rgba(10,14,20,0) 35%,
        rgba(10,14,20,0.5) 78%,
        rgba(10,14,20,0.9) 100%);
    }

    /* Response card LOADING state */
    .ra-ch3-loading {
      display: flex; flex-direction: column; gap: 10px; padding: 6px 0;
    }
    .ra-ch3-loading .bar {
      height: 10px; border-radius: 4px;
      background: linear-gradient(90deg,
        rgba(78,201,255,0.08) 0%,
        rgba(78,201,255,0.28) 50%,
        rgba(78,201,255,0.08) 100%);
      background-size: 200% 100%;
      animation: ra-ch3-shimmer 1.2s ease-in-out infinite;
    }
    @keyframes ra-ch3-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .ra-ch3-thinking-tag {
      font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
      color: rgba(78,201,255,0.7); padding: 0 0 6px;
    }
    /* Constrain response card body height so JSON doesn't overflow viewport */
    .ra-ch3-resp-body {
      max-height: 50vh;
      overflow: hidden;
      font-size: 13px;
    }

    /* Editorial admin Forms list — replicates the WP admin Forms Overview
       layout from image 2. Controlled markup so columns/spacing/typography
       are exactly right. */
    .ra-ch3-admin-host {
      position: fixed;
      left: 0; top: 0;
      pointer-events: none;
      opacity: 0;
      will-change: transform, opacity;
      border-radius: 12px;
      box-shadow:
        0 0 0 1px rgba(78,201,255,0.22),
        0 0 0 8px rgba(78,201,255,0.06),
        0 30px 80px rgba(0,0,0,0.72),
        0 0 60px rgba(78,201,255,0.14);
      background: #f0f0f1; /* WP admin gray */
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1d2327;
      -webkit-font-smoothing: antialiased;
    }
    .ra-ch3-admin-head {
      display: flex; align-items: center; gap: 14px;
      padding: 18px 22px 14px;
      background: #f0f0f1;
    }
    .ra-ch3-admin-head h1 {
      margin: 0; font-size: 23px; font-weight: 400; color: #1d2327;
      letter-spacing: -0.005em;
    }
    .ra-ch3-admin-add {
      display: inline-flex; align-items: center; gap: 6px;
      background: ${COLORS.brand}; color: #fff;
      border: none; border-radius: 4px;
      padding: 7px 14px;
      font-size: 13px; font-weight: 500;
      box-shadow: 0 1px 2px rgba(0,0,0,0.12);
    }
    .ra-ch3-admin-add::before {
      content: '+';
      font-size: 16px; line-height: 1;
      margin-right: 2px;
    }
    .ra-ch3-admin-subnav {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 22px 14px;
      font-size: 13px;
      background: #f0f0f1;
    }
    .ra-ch3-admin-subnav a { color: #2271b1; text-decoration: none; }
    .ra-ch3-admin-subnav a.current { color: #1d2327; font-weight: 600; }
    .ra-ch3-admin-subnav .sep { color: #c3c4c7; }
    .ra-ch3-admin-subnav .count { color: #646970; font-weight: 400; }
    .ra-ch3-admin-toolbar {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 22px 14px;
      background: #f0f0f1;
      flex-wrap: wrap;
    }
    .ra-ch3-admin-bulk {
      display: inline-flex; align-items: center;
      height: 30px;
      border: 1px solid #8c8f94;
      background: #fff; color: #2c3338;
      border-radius: 4px;
      padding: 0 24px 0 8px;
      font-size: 13px;
      box-shadow: 0 0 0 transparent;
      position: relative;
    }
    .ra-ch3-admin-bulk::after {
      content: '';
      position: absolute; right: 8px; top: 50%;
      width: 6px; height: 6px;
      border-right: 2px solid #50575e;
      border-bottom: 2px solid #50575e;
      transform: translateY(-65%) rotate(45deg);
    }
    .ra-ch3-admin-apply {
      height: 30px;
      border: 1px solid #2271b1;
      background: #fff; color: #2271b1;
      border-radius: 4px;
      padding: 0 12px;
      font-size: 13px; font-weight: 500;
    }
    .ra-ch3-admin-spacer { flex: 1; }
    .ra-ch3-admin-pagination {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 13px; color: #646970;
    }
    .ra-ch3-admin-pagination .pg-btn {
      width: 28px; height: 28px;
      display: inline-flex; align-items: center; justify-content: center;
      border: 1px solid #c3c4c7;
      background: #fff; color: #50575e;
      border-radius: 3px;
      font-size: 13px;
    }
    .ra-ch3-admin-pagination .pg-pages {
      width: 38px; height: 28px;
      display: inline-flex; align-items: center; justify-content: center;
      border: 1px solid #c3c4c7;
      background: #fff; color: #1d2327;
      border-radius: 3px;
    }
    .ra-ch3-admin-search {
      display: inline-flex; gap: 6px;
    }
    .ra-ch3-admin-search input {
      width: 200px; height: 30px;
      border: 1px solid #8c8f94;
      background: #fff;
      border-radius: 4px;
      padding: 0 8px;
      font: inherit; color: inherit;
    }
    .ra-ch3-admin-search button {
      height: 30px;
      border: 1px solid #2271b1;
      background: #fff; color: #2271b1;
      border-radius: 4px;
      padding: 0 12px;
      font-size: 13px; font-weight: 500;
    }

    .ra-ch3-admin-table {
      width: calc(100% - 44px);
      margin: 0 22px 22px;
      border: 1px solid #c3c4c7;
      border-radius: 4px;
      background: #fff;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 13px;
      overflow: hidden;
    }
    .ra-ch3-admin-table th,
    .ra-ch3-admin-table td {
      padding: 12px 14px;
      text-align: left;
      vertical-align: top;
      border-bottom: 1px solid #f0f0f1;
    }
    .ra-ch3-admin-table thead th {
      background: #f6f7f7;
      font-weight: 600;
      color: #1d2327;
      border-bottom: 1px solid #c3c4c7;
      white-space: nowrap;
    }
    .ra-ch3-admin-table tfoot th {
      background: #f6f7f7;
      font-weight: 600;
      color: #1d2327;
      border-top: 1px solid #c3c4c7;
      border-bottom: none;
      white-space: nowrap;
    }
    .ra-ch3-admin-table .col-check  { width: 32px; }
    .ra-ch3-admin-table .col-tags   { width: 18%; }
    .ra-ch3-admin-table .col-author { width: 14%; }
    .ra-ch3-admin-table .col-short  { width: 18%; }
    .ra-ch3-admin-table .col-date   { width: 18%; }
    .ra-ch3-admin-table .col-entries{ width: 80px; text-align: center; }
    .ra-ch3-admin-table .col-icon   { width: 36px; }
    .ra-ch3-admin-table input[type="checkbox"] {
      width: 14px; height: 14px;
      accent-color: #2271b1;
      vertical-align: middle;
    }
    .ra-ch3-admin-table .form-name {
      color: #2271b1; font-weight: 600;
      text-decoration: none;
    }
    .ra-ch3-admin-table tbody tr {
      transition: none;
    }
    .ra-ch3-admin-table tbody tr:nth-child(even) { background: #fbfbfb; }
    .ra-ch3-admin-table .author-link { color: #2271b1; text-decoration: none; }
    .ra-ch3-admin-table .shortcode {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      color: #1d2327;
    }
    .ra-ch3-admin-table .date-line .label { display: block; }
    .ra-ch3-admin-table .date-line .when {
      display: block; color: #50575e;
      margin-top: 2px;
    }
    .ra-ch3-admin-table .row-actions {
      margin-top: 4px; font-size: 12px; color: #646970;
    }
    .ra-ch3-admin-table .row-actions a { color: #2271b1; text-decoration: none; }
    .ra-ch3-admin-table .row-actions .trash { color: #b32d2e; }
    .ra-ch3-admin-table .dash { color: #c3c4c7; }
    .ra-ch3-admin-table .icon-cog,
    .ra-ch3-admin-table .icon-doc {
      display: inline-block; width: 16px; height: 16px;
      background: #50575e;
      mask-size: contain; -webkit-mask-size: contain;
      mask-repeat: no-repeat; -webkit-mask-repeat: no-repeat;
      vertical-align: middle;
    }
    /* Pop-out ripple ring (one per row) — neutral, color-free, motion-only */
    .ra-ch3-row-ring {
      position: fixed;
      pointer-events: none;
      border-radius: 4px;
      border: 1.5px solid rgba(255,255,255,0.85);
      box-shadow: 0 0 18px rgba(255,255,255,0.35);
      opacity: 0;
      z-index: 91;
    }

    .ra-ch3-admin-caption {
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

  const layer = mountSceneLayer('ra-ch3-layer', { z: 80 });
  layer.style.opacity = '1';
  const atm = mountAtmospherics();
  const cursor = mountSceneCursor(layer);
  cursor.style.opacity = '0';
  cursor.style.transform = 'translate(-9999px, -9999px)';

  // Attach to the SHARED persistent scene — never disposed by this chapter.
  // The hex was mounted once (Ch.2 in normal play; or this chapter when
  // run standalone). Camera starts focused on list-forms (idx 0).
  const TARGET_IDX = 0; // wpforms/list-forms
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
  crystalLbl.textContent = 'wpforms/list-forms';
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

  runAtmospherics(gsap, atm, 13);

  const vignette = document.createElement('div');
  vignette.className = 'ra-ch3-vignette';
  document.body.appendChild(vignette);

  _state = {
    layer, atm, three, cursor, gsap,
    crystalGroup, wireMat, coreMat,
    crystalLbl, vignette,
    abilities, targetCrystal,
  };
  _state.stopCrystalTracker = () => { trackerActive = false; stopCrystalRaf(); };

  // Crystal label fades in AFTER focusTarget completes (in beat 1 intro).
  // Don't auto-show here — would float over an invisible crystal.

  return _state;
}

export const setup = ensureSetup;

export default [
  // ── Beat 3a — type-list-forms (~5s) ────────────────────────────────────
  // The list-forms route name is pre-anchored visible from the start;
  // the rest of the curl types in around it.
  {
    id: 'type-list-forms',
    chapter: 'auth-list-forms',
    duration: 6.5,
    effect: async () => {
      const s = await ensureSetup();
      const { gsap, layer } = s;

      // Continuity: scene opens at focus(list-forms) — Ch.2 handed off
      // already zoomed-in. Pan camera back/up to "station" pose so the
      // request card has room. Crystal stays visible at the top of the
      // frame as a continuity anchor.
      await panToStation(s.targetCrystal, { duration: 0.9 });
      gsap.to(s.crystalLbl, { opacity: 1, duration: 0.4 });

      const w = Math.min(820, window.innerWidth / 2 - 100);
      const reqLeft = 80;
      const card = codeCard({
        parent: layer,
        label: 'request',
        x: 0, y: 0,                  // anchor at 0,0 — transform drives position
        width: w,
      });
      // Override: pin top-left at 0,0; use transform for everything
      card.style.left = '0px';
      card.style.top = '0px';
      s.requestCard = card;
      s.requestCardW = w;

      const cmd = `curl -u "USERNAME:APP_PASSWORD" \\
  "$WP_SITE/wp-json/wp-abilities/v1/abilities/wpforms/list-forms/run?input%5Blimit%5D=10&input%5Bstatus%5D=publish"`;

      const body = card.querySelector('.ra-card-body');
      body.innerHTML = highlightCurl(cmd);

      // Measure rendered height, then position via transform
      const reqH = card.offsetHeight;
      const reqTop = Math.max(40, (window.innerHeight - reqH) / 2);
      s.reqLeft = reqLeft;
      s.reqTop = reqTop;
      s.reqH = reqH;

      // Use GSAP transform — composited, smooth, no jitter
      gsap.set(card, { x: reqLeft - 20, y: reqTop, opacity: 0 });
      gsap.to(card, { x: reqLeft, opacity: 1, duration: 0.5, ease: 'sine.out' });
      await wait(500);

      // Type around the list-forms anchor.
      await typeAroundAnchors(body, 26, '.ra-tok-route');

      LOG('beat 3a done');
    },
  },

  // ── Beat 3b — list-forms-response (~5s) ────────────────────────────────
  {
    id: 'list-forms-response',
    chapter: 'auth-list-forms',
    duration: 5.5,
    effect: async () => {
      const s = _state;
      const { gsap, layer } = s;

      // Cursor presses Enter at last visible char of curl
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

      // Response card mounts in LOADING state, right column.
      // Anchor at 0,0; transform drives position (smooth compositing).
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

      // Apply max-height constraint to the body
      const respBody = respCard.querySelector('.ra-card-body');
      respBody.classList.add('ra-ch3-resp-body');

      const statusPill = respCard.querySelector('.ra-status-pill');
      if (statusPill) {
        statusPill.style.background = 'rgba(78,201,255,0.14)';
        statusPill.style.color = '#4ec9ff';
        statusPill.textContent = 'PENDING…';
      }

      respBody.innerHTML = `
        <div class="ra-ch3-thinking-tag">awaiting response</div>
        <div class="ra-ch3-loading">
          <div class="bar" style="width:40%;"></div>
          <div class="bar" style="width:80%;"></div>
          <div class="bar" style="width:65%;"></div>
          <div class="bar" style="width:55%;"></div>
          <div class="bar" style="width:72%;"></div>
        </div>
      `;

      const respHLoading = respCard.offsetHeight;
      const respTopLoading = Math.max(40, (window.innerHeight - respHLoading) / 2);

      // Mount via transform — anchor (respX, respTopLoading), slide-in from +60x
      gsap.set(respCard, { x: respX + 60, y: respTopLoading, opacity: 0 });
      gsap.to(respCard, {
        x: respX, opacity: 1,
        duration: 0.55, ease: 'back.out(1.4)',
      });

      await wait(900);

      // Resolve: status flips to 200 OK
      if (statusPill) {
        statusPill.textContent = '200 OK';
        statusPill.style.background = 'rgba(70,180,80,0.15)';
        statusPill.style.color = COLORS.green;
      }

      // Build JSON content matching the snapshot's actual forms
      const responseData = {
        forms: SNAPSHOT_FORMS,
        total: String(SNAPSHOT_FORMS.length),
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

      // Crystal subtle dim — keeps rotation visible
      gsap.to(s.coreMat, { emissiveIntensity: 1.3, duration: 0.6 });
      gsap.to(s.wireMat, { opacity: 0.7,  duration: 0.6 });

      await wait(700);

      // ── Layout reflow: response slides down to below request,
      //    request stays put (or shifts up); both animate via composited
      //    transforms for smooth motion. ──

      const respH = respCard.offsetHeight;
      const gap = 18;
      const stackH = s.reqH + gap + respH;
      const stackTop = Math.max(40, (window.innerHeight - stackH) / 2);
      const stackLeft = s.reqLeft;

      // Targets (transform-driven, no top/left layout changes)
      const reqTargetY = stackTop;
      const respTargetX = stackLeft;
      const respTargetY = stackTop + s.reqH + gap;

      // Animate both cards in parallel
      gsap.to(s.requestCard, {
        x: stackLeft, y: reqTargetY,
        duration: 0.85, ease: 'expo.inOut',
      });
      gsap.to(respCard, {
        x: respTargetX, y: respTargetY,
        duration: 0.85, ease: 'expo.inOut',
      });

      // Mount the cloned admin Forms list on the right
      await wait(150);
      const adminMount = await mountAdminFormsClone(s, respX, respCardW);
      s.adminMount = adminMount;

      // Pop-out ripple cascade — fast, smooth, row-by-row. Each pop is
      // ~440 ms with a 130 ms stagger, so the cascade reads as a single
      // ripple down the table rather than three discrete pops.
      if (adminMount && adminMount.rowEls && adminMount.rowEls.length) {
        await wait(420);
        for (let i = 0; i < adminMount.rowEls.length; i++) {
          tableRowPopOut(adminMount.rowEls[i], gsap);
          await wait(130);
        }
      }

      LOG('beat 3b done');
    },
  },

  // ── Beat 3c — handoff (~2s, silent) ────────────────────────────────────
  {
    id: 'list-forms-handoff',
    chapter: 'auth-list-forms',
    duration: 3.5,
    effect: async () => {
      const s = _state;
      const { gsap } = s;

      // Brief breathe before chapter content fades
      await wait(1300);

      // Fade chapter content out FIRST so the hex reform isn't visually crowded
      const fadeTl = gsap.timeline();
      fadeTl.to(s.requestCard, { opacity: 0, x: '-=40', duration: 0.4 }, 0);
      fadeTl.to(s.respCard,    { opacity: 0, x: '-=40', duration: 0.4 }, 0);
      fadeTl.to(s.crystalLbl,  { opacity: 0, duration: 0.3 }, 0);
      fadeTl.to(s.cursor,      { opacity: 0, duration: 0.3 }, 0);
      if (s.adminMount && s.adminMount.rings) {
        for (const ring of s.adminMount.rings) {
          fadeTl.to(ring, { opacity: 0, duration: 0.3 }, 0);
        }
      }
      if (s.adminMount && s.adminMount.host) {
        fadeTl.to(s.adminMount.host, {
          opacity: 0, scale: 1.05, filter: 'blur(8px)',
          duration: 0.6, ease: 'power2.in',
        }, 0.1);
        fadeTl.to(s.adminMount.caption, { opacity: 0, duration: 0.4 }, 0.1);
      }
      await wait(700);

      // Constellation continuity: pan camera back to overview while the
      // 5 hidden crystals fade back in — return to the "hex view" before
      // the next chapter pans into its own crystal.
      revealSharedHex({ duration: 0.7 });
      await panToOverview({ duration: 1.1 });

      // Brief hold on the full hex (image-3 anchor frame)
      await wait(400);

      // Fade out chapter-local DOM layer (cards already faded; this
      // removes vignette + cursor + label hosts). Shared three persists.
      gsap.to(s.layer, { opacity: 0, duration: 0.4, ease: 'sine.in' });
      await wait(420);

      // Cleanup chapter-local resources ONLY. Shared three stays alive.
      s.stopCrystalTracker();
      if (s.adminMount) {
        if (s.adminMount.host) s.adminMount.host.remove();
        if (s.adminMount.caption) s.adminMount.caption.remove();
        if (s.adminMount.rings) s.adminMount.rings.forEach((r) => r.remove());
      }
      s.crystalLbl.remove();
      s.vignette.remove();
      s.atm.dispose();
      s.layer.remove();
      _state = null;
    },
  },
];

// Build the admin Forms list as editorial markup that replicates the
// real WP admin Forms Overview layout (image 2 reference). Controlled
// markup ensures all columns/spacing/typography are exactly right, with
// no responsive collapse that the cloned snapshot suffers from.
async function mountAdminFormsClone(s, rightX, rightW) {
  const { gsap, layer } = s;

  const host = document.createElement('div');
  host.className = 'ra-ch3-admin-host';

  // Inner content matches image-2 exactly
  const subnavCounts = '<span class="count">(' + SNAPSHOT_FORMS.length + ')</span>';

  let rowsHtml = '';
  for (const f of SNAPSHOT_FORMS) {
    const isTarget = f.id === TARGET_FORM_ID;
    rowsHtml += renderFormRow(f, isTarget);
  }

  host.innerHTML = `
    <div class="ra-ch3-admin-head">
      <h1>Forms Overview</h1>
      <span class="ra-ch3-admin-add">Add New</span>
    </div>
    <div class="ra-ch3-admin-subnav">
      <a href="#" class="current">All <span class="count">(${SNAPSHOT_FORMS.length})</span></a>
      <span class="sep">|</span>
      <a href="#">Forms ${subnavCounts}</a>
      <span class="sep">|</span>
      <a href="#">Templates <span class="count">(0)</span></a>
      <span class="sep">|</span>
      <a href="#">Trash <span class="count">(1)</span></a>
    </div>
    <div class="ra-ch3-admin-toolbar">
      <span class="ra-ch3-admin-bulk">Bulk actions</span>
      <button class="ra-ch3-admin-apply">Apply</button>
      <span class="ra-ch3-admin-spacer"></span>
      <span class="ra-ch3-admin-pagination">
        <span>${SNAPSHOT_FORMS.length} items</span>
        <span class="pg-btn">«</span>
        <span class="pg-btn">‹</span>
        <span class="pg-pages">1</span>
        <span>of 1</span>
        <span class="pg-btn">›</span>
        <span class="pg-btn">»</span>
      </span>
      <span class="ra-ch3-admin-search">
        <input type="text" placeholder="" />
        <button>Search Forms</button>
      </span>
    </div>
    <table class="ra-ch3-admin-table">
      <thead>
        <tr>
          <th class="col-check"><input type="checkbox" /></th>
          <th>Name ↕</th>
          <th class="col-tags">Tags</th>
          <th class="col-author">Author ↕</th>
          <th class="col-short">Shortcode</th>
          <th class="col-date">Date ↕</th>
          <th class="col-entries">Entries</th>
          <th class="col-icon"><span class="icon-doc"></span></th>
          <th class="col-icon"><span class="icon-cog"></span></th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
      <tfoot>
        <tr>
          <th class="col-check"><input type="checkbox" /></th>
          <th>Name ↕</th>
          <th class="col-tags">Tags</th>
          <th class="col-author">Author ↕</th>
          <th class="col-short">Shortcode</th>
          <th class="col-date">Date ↕</th>
          <th class="col-entries">Entries</th>
          <th class="col-icon"><span class="icon-doc"></span></th>
          <th class="col-icon"><span class="icon-cog"></span></th>
        </tr>
      </tfoot>
    </table>
  `;

  layer.appendChild(host);

  // Position + width: anchor RIGHT — admin list sits flush against the
  // right edge of the viewport with a small margin. width is capped by
  // available space (viewport minus response-card right edge minus gap).
  const intrinsic = 880;
  const respRight = (s.reqLeft || 80) + (s.respCardW || 720);
  const gapBetween = 60;
  const rightMargin = 40;
  const availableW = window.innerWidth - respRight - gapBetween - rightMargin;
  const targetW = Math.min(intrinsic, availableW);
  const scale = targetW / intrinsic;
  // Right-anchored: place so right edge = viewport - rightMargin
  const xPos = window.innerWidth - rightMargin - (intrinsic * scale);
  // Perspective on the host so 3D tilt on TR rows reads
  host.style.width = intrinsic + 'px';
  host.style.transformOrigin = 'top left';
  host.style.perspective = '1100px';
  gsap.set(host, { x: xPos, y: 0, scale });

  // Measure post-mount, center vertically using bounding rect
  await new Promise((r) => requestAnimationFrame(r));
  const hostRect = host.getBoundingClientRect();
  const hostTop = Math.max(40, (window.innerHeight - hostRect.height) / 2);
  gsap.set(host, { y: hostTop });

  // Capture actual TR refs (not just rects) so the popOut animation can
  // transform the real row elements in-place.
  const rowEls = Array.from(host.querySelectorAll('tbody tr[data-form-id]'));
  const rowRects = rowEls.map((tr) => {
    const r = tr.getBoundingClientRect();
    return { formId: parseInt(tr.dataset.formId, 10), x: r.left, y: r.top, w: r.width, h: r.height };
  });

  // Caption pill underneath
  const caption = document.createElement('div');
  caption.className = 'ra-ch3-admin-caption';
  caption.textContent = `${SNAPSHOT_FORMS.length} forms · admin Forms list`;
  layer.appendChild(caption);
  const positionCaption = () => {
    const r = host.getBoundingClientRect();
    caption.style.left = (r.left + r.width / 2) + 'px';
    caption.style.top  = (r.bottom + 14) + 'px';
    caption.style.transform = 'translate(-50%, 0)';
  };
  positionCaption();

  // Mount-in (smooth, transform-only)
  gsap.fromTo(host,
    { opacity: 0 },
    { opacity: 1, duration: 0.7, ease: 'sine.out' });
  gsap.to(caption, { opacity: 1, duration: 0.5, delay: 0.5 });
  pausableSleep(800).then(positionCaption);

  return { host, caption, rowEls, rowRects, rings: [] };
}

// Render a single tbody <tr> matching WP admin Forms list layout from
// image 2: checkbox + Name link (with row-actions for the target row),
// tags dash, Author link, Shortcode, Created date, two zeros for Entries.
function renderFormRow(f, isTarget) {
  // Match the date format from image 2: "Created\nApril 28, 2026 at 5:33 pm"
  const dateLabel = formatDateLabel(f.created);
  const rowActions = isTarget
    ? `<div class="row-actions">
       </div>`
    : '';
  return `
    <tr data-form-id="${f.id}">
      <td class="col-check"><input type="checkbox" /></td>
      <td>
        <a class="form-name">${escapeHtml(f.title)}</a>
        ${rowActions}
      </td>
      <td class="col-tags"><span class="dash">—</span></td>
      <td class="col-author"><a class="author-link">Sullie</a></td>
      <td class="col-short"><span class="shortcode">[wpforms id="${f.id}"]</span></td>
      <td class="col-date date-line">
        <span class="label">Created</span>
        <span class="when">${escapeHtml(dateLabel)}</span>
      </td>
      <td class="col-entries">0</td>
      <td class="col-icon">0</td>
      <td class="col-icon"></td>
    </tr>
  `;
}

function formatDateLabel(iso) {
  // iso like "2026-01-27 10:00:00" → "January 27, 2026 at 10:00 am"
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/);
  if (!m) return iso;
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  const y = m[1], mo = months[parseInt(m[2], 10) - 1], d = parseInt(m[3], 10);
  let h = parseInt(m[4], 10);
  const mn = m[5];
  const ampm = h >= 12 ? 'pm' : 'am';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${mo} ${d}, ${y} at ${h}:${mn} ${ampm}`;
}

// Real popOut on a table row — fast, smooth ripple feel. The row itself
// transforms (no overlay ring). Note: runtime/pop-out.js can't be reused
// here because it's iframe-bound (cloneNode from iframe.ui contentDocument);
// editorial-mode chapters render parent-doc DOM, so this is the parent-doc
// equivalent of that motion class.
//
// Cascade tuning (per row): rise 160 → hold 80 → fall 200 = 440 ms total.
// Combined with a 130 ms inter-row stagger this reads as a quick ripple
// down the table rather than three discrete pops.
function tableRowPopOut(tr, gsap, {
  tilt = 4, lift = 1.025,
  riseMs = 160, holdMs = 80, fallMs = 200,
} = {}) {
  const orig = {
    position:        tr.style.position,
    zIndex:          tr.style.zIndex,
    transformOrigin: tr.style.transformOrigin,
    transformStyle:  tr.style.transformStyle,
    boxShadow:       tr.style.boxShadow,
    willChange:      tr.style.willChange,
  };
  tr.style.position        = 'relative';
  tr.style.zIndex          = '20';
  tr.style.transformOrigin = 'center center';
  tr.style.transformStyle  = 'preserve-3d';
  tr.style.willChange      = 'transform, box-shadow';

  gsap.timeline({
    onComplete: () => {
      Object.assign(tr.style, orig);
      tr.style.transform = '';
      tr.style.boxShadow = '';
    },
  })
    .to(tr, {
      scale: lift, rotateY: tilt, rotateX: -tilt * 0.25,
      boxShadow:
        '0 10px 26px rgba(0,0,0,0.45), ' +
        '0 0 0 1px rgba(78,201,255,0.45), ' +
        '0 0 22px rgba(78,201,255,0.28)',
      duration: riseMs / 1000, ease: 'sine.out',
    })
    .to(tr, { duration: holdMs / 1000 })
    .to(tr, {
      scale: 1, rotateY: 0, rotateX: 0,
      boxShadow: '0 0 0 rgba(0,0,0,0)',
      duration: fallMs / 1000, ease: 'sine.inOut',
    });
}

function wait(ms) { return pausableSleep(ms); }

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Type characters in `el`, but DO NOT hide chars that live inside any
// element matching `anchorSelector`. Those stay visible from the start
// — the typing fills in around them.
async function typeAroundAnchors(el, msPerChar, anchorSelector) {
  const charNodes = [];
  walkChars(el, charNodes);

  // Identify char-spans that live inside an anchor element
  const anchorEls = el.querySelectorAll(anchorSelector);
  const anchorChars = new Set();
  for (const a of anchorEls) {
    a.querySelectorAll('span').forEach((sp) => anchorChars.add(sp));
  }

  // Hide non-anchor chars; anchor chars stay visible
  for (const n of charNodes) {
    if (!anchorChars.has(n)) n.style.visibility = 'hidden';
  }

  // Reveal non-anchor chars in document order
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
