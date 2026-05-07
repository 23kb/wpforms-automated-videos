// Chapter 6 — MCP outro (hyperstyle, ~10.5s, parallel)
//
// 6-ability constellation returns. Beams flow OUTWARD to 3 MCP-client
// silhouettes (Claude Desktop, Cursor, Your custom client). Each phase
// gets a pixel-point-style instruction reveal teaching what's happening.
// The final lockup is a hyperstyle drop: brand-orange supernova burst →
// per-letter wordmark fall → URL mask-reveal → flash → fade to black.
//
// Phase timeline:
//   1 (0–1.5s):   6 ability hex spawns + Sullie at center
//                 Instruction: "6 REST abilities" (top-down-letters)
//   2 (1.5–3.2s): 3 client silhouettes appear in lower half
//                 Instruction: "3 MCP clients" (focus-blur-resolve)
//   3 (3.2–4.8s): 18 outbound beams draw
//                 Instruction: "Every ability → every client" (mask-reveal-up)
//   4 (4.8–6.4s): main caption ("Same API. Multiple consumers. mcp.public = true")
//                 (spring-scale-in)
//   5 (6.4–9.0s): HYPERSTYLE OUTRO
//                 - Constellation/silhouettes/beams fade fast
//                 - Brand-orange radial supernova burst from center
//                 - "WPForms REST API" letters fall in (per-letter)
//                 - URL line mask-reveal-up
//                 - Brand-orange flash
//   6 (9.0–10.5s): full fade-to-black with 25px blur

import {
  loadGsap, mountSceneLayer, injectCss,
  mountThreeScene, mountAtmospherics, runAtmospherics,
  ensureRestApiFonts, injectStageCss, COLORS,
  ABILITIES, disposeSharedScene, pausableRaf, pausableSleep,
} from './_kit.js';

ensureRestApiFonts();
injectStageCss();

export const mode = 'parallel';
export const breakStyle = 'glide';

const LOG = (...a) => console.log('[ch6]', performance.now().toFixed(0) + 'ms', ...a);

// 3 clients in LOWER half so the top is clear for caption + instructions.
// Sides at radius 5.0; bottom at radius 4.0 (so it doesn't clip viewport).
const CLIENTS = [
  { id: 'claude',  label: 'Claude Desktop',     angleDeg: 195, radius: 5.0,
    logo: '/videos/wpforms-rest-api-overview/claudecode.png' },
  { id: 'cursor',  label: 'Cursor',             angleDeg: 345, radius: 5.0,
    logo: '/videos/wpforms-rest-api-overview/cursor.jpg' },
  { id: 'custom',  label: 'Your custom client', angleDeg: 270, radius: 4.0,
    logo: null },
];

const ABILITY_RADIUS = 2.7;

let _state = null;

export async function setup() {
  ensureRestApiFonts();
  injectStageCss();

  injectCss('ra-ch6-css', `
    .ra-ch6-vignette {
      position: fixed; inset: 0; pointer-events: none; z-index: 79;
      background: radial-gradient(ellipse at center,
        rgba(10,14,20,0) 35%,
        rgba(10,14,20,0.5) 78%,
        rgba(10,14,20,0.9) 100%);
    }

    .ra-ch6-center {
      position: fixed; left: 50%; top: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none; opacity: 0;
      z-index: 84;
    }
    .ra-ch6-halo {
      position: absolute; left: 50%; top: 50%;
      width: 320px; height: 320px;
      transform: translate(-50%, -50%);
      background: radial-gradient(circle at center,
        rgba(213,78,33,0.30) 0%,
        rgba(213,78,33,0.12) 28%,
        rgba(213,78,33,0.04) 50%,
        rgba(213,78,33,0) 70%);
      filter: blur(2px);
    }
    .ra-ch6-center img {
      position: relative; display: block;
      width: 120px; height: auto;
      filter: drop-shadow(0 0 20px rgba(213,78,33,0.5))
              drop-shadow(0 6px 18px rgba(0,0,0,0.6));
    }

    .ra-ch6-client {
      position: fixed;
      pointer-events: none;
      opacity: 0;
      will-change: transform, opacity;
      display: flex; flex-direction: column; align-items: center; gap: 10px;
      z-index: 87;
    }
    .ra-ch6-client .logo-frame {
      width: 80px; height: 80px;
      border-radius: 18px;
      background: rgba(13,17,23,0.85);
      border: 1px solid rgba(78,201,255,0.35);
      display: flex; align-items: center; justify-content: center;
      box-shadow:
        0 0 0 6px rgba(78,201,255,0.06),
        0 18px 38px rgba(0,0,0,0.6),
        0 0 32px rgba(78,201,255,0.18);
      backdrop-filter: blur(6px);
      overflow: hidden;
    }
    .ra-ch6-client .logo-frame img {
      width: 60px; height: 60px;
      object-fit: contain;
    }
    .ra-ch6-client .logo-frame svg {
      width: 42px; height: 42px;
    }
    .ra-ch6-client .label {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 14px; font-weight: 600;
      letter-spacing: 0.04em;
      color: rgba(245,247,250,0.92);
      text-shadow: 0 2px 8px rgba(0,0,0,0.6);
      white-space: nowrap;
    }

    /* Phase instructions — sit at top so silhouettes (lower half) don't clash */
    .ra-ch6-phase-instr {
      position: fixed; left: 50%; top: 7%;
      transform: translate(-50%, 0);
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 18px; font-weight: 600;
      letter-spacing: 0.06em;
      color: rgba(245,247,250,0.88);
      text-shadow: 0 2px 12px rgba(0,0,0,0.6);
      pointer-events: none;
      white-space: nowrap;
      z-index: 90;
    }
    .ra-ch6-phase-instr .accent { color: ${COLORS.cyan}; }
    .ra-ch6-phase-instr .brand  { color: ${COLORS.brand}; }

    /* Phase 4 main caption — slightly lower than instructions area */
    .ra-ch6-caption {
      position: fixed; left: 50%; top: 16%;
      transform: translate(-50%, 0);
      font-family: 'Inter', system-ui, sans-serif;
      text-align: center;
      pointer-events: none; opacity: 0;
      z-index: 90;
    }
    .ra-ch6-caption .main {
      font-size: 32px; font-weight: 600;
      letter-spacing: -0.005em;
      color: #f5f7fa;
    }
    .ra-ch6-caption .main .mono {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      color: ${COLORS.cyan};
      font-weight: 600;
    }
    .ra-ch6-caption .sub {
      margin-top: 12px;
      font-size: 14px; font-weight: 500;
      letter-spacing: 0.06em;
      color: rgba(245,247,250,0.55);
    }

    /* Hyperstyle supernova burst — radial brand-orange flare */
    .ra-ch6-supernova {
      position: fixed; left: 50%; top: 50%;
      width: 40px; height: 40px;
      transform: translate(-50%, -50%) scale(0);
      border-radius: 50%;
      background: radial-gradient(circle,
        rgba(255,255,255,0.9) 0%,
        rgba(213,78,33,0.85) 12%,
        rgba(213,78,33,0.55) 28%,
        rgba(213,78,33,0.20) 52%,
        rgba(213,78,33,0) 75%);
      pointer-events: none;
      opacity: 0;
      z-index: 92;
      mix-blend-mode: screen;
    }

    /* Hyperstyle final lockup */
    .ra-ch6-lockup {
      position: fixed; left: 50%; top: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      pointer-events: none;
      z-index: 95;
    }
    .ra-ch6-wordmark {
      font-family: 'Inter', system-ui, sans-serif;
      font-weight: 800;
      font-size: 76px;
      letter-spacing: -0.018em;
      color: ${COLORS.brand};
      text-shadow:
        0 0 36px rgba(213,78,33,0.65),
        0 0 80px rgba(213,78,33,0.32);
      line-height: 1;
      white-space: nowrap;
    }
    .ra-ch6-wordmark .ch {
      display: inline-block;
      will-change: transform, opacity, filter;
    }
    .ra-ch6-url {
      margin-top: 22px;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 18px; font-weight: 500;
      letter-spacing: 0.04em;
      color: rgba(245,247,250,0.85);
      overflow: hidden;
      will-change: clip-path, opacity, transform;
    }

    /* Brand-orange flash overlay */
    .ra-ch6-flash {
      position: fixed; inset: 0;
      background: rgba(213,78,33,0.28);
      pointer-events: none;
      z-index: 98;
      opacity: 0;
      mix-blend-mode: screen;
    }
  `);

  // Tear down the shared scene from Ch.3-5 — Ch.6 mounts its own scene
  // (different ability layout, supernova-driven, no shared hex).
  await disposeSharedScene();

  const layer = mountSceneLayer('ra-ch6-layer', { z: 80 });
  layer.style.opacity = '1';
  const atm = mountAtmospherics();
  const three = await mountThreeScene('ra-ch6-three', { z: 70, cameraZ: 13 });

  _state = { layer, atm, three };
  LOG('setup done');
}

export default [{
  id: 'mcp-outro',
  duration: 0.05,
  effect: async () => {
    const gsap = await loadGsap({ flip: false, motionPath: false });
    const { THREE, scene, camera } = _state.three;
    const { layer, atm } = _state;
    LOG('effect start');

    runAtmospherics(gsap, atm, 11);

    const rim = new THREE.PointLight(0x4ec9ff, 1.0, 16);
    rim.position.set(0, 0, 4);
    scene.add(rim);

    const vignette = document.createElement('div');
    vignette.className = 'ra-ch6-vignette';
    document.body.appendChild(vignette);

    _state.stopThreeRaf = pausableRaf(() => {
      _state.three.renderer.render(_state.three.scene, _state.three.camera);
    });

    // ── Phase 1 (0–1.5s) — Sullie + 6 ability hex + instruction reveal ──

    const center = document.createElement('div');
    center.className = 'ra-ch6-center';
    center.innerHTML = `
      <div class="ra-ch6-halo"></div>
      <img src="/assets/sullie.png" alt="WPForms" draggable="false" />
    `;
    layer.appendChild(center);

    gsap.fromTo(center,
      { opacity: 0, scale: 0.86 },
      { opacity: 1, scale: 1, duration: 0.9, ease: 'expo.out' });

    // Ability nodes
    const abilities = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
      const x = Math.cos(angle) * ABILITY_RADIUS;
      const y = Math.sin(angle) * ABILITY_RADIUS;

      const group = new THREE.Group();
      const icoGeom = new THREE.IcosahedronGeometry(0.22, 0);
      const wireGeom = new THREE.WireframeGeometry(icoGeom);
      const wireMat = new THREE.LineBasicMaterial({
        color: 0x4ec9ff, transparent: true, opacity: 0,
      });
      group.add(new THREE.LineSegments(wireGeom, wireMat));

      const coreMat = new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: 0x4ec9ff, emissiveIntensity: 0,
        roughness: 0.3, metalness: 0.7,
      });
      group.add(new THREE.Mesh(new THREE.SphereGeometry(0.07, 18, 18), coreMat));

      group.position.set(x, y, 0);
      group.rotation.x = Math.random() * Math.PI;
      group.rotation.y = Math.random() * Math.PI;
      scene.add(group);

      gsap.to(group.rotation, {
        x: '+=' + (Math.PI * 2),
        y: '+=' + (Math.PI * 2.4),
        duration: 16, ease: 'none', repeat: -1,
      });

      abilities.push({ group, wireMat, coreMat, angle, x, y });

      const at = 0.4 + i * 0.07;
      gsap.to(wireMat, { opacity: 0.7, duration: 0.55, delay: at });
      gsap.to(coreMat, { emissiveIntensity: 1.4, duration: 0.55, delay: at });
    }

    // Phase 1 instruction — top-down-letters effect
    const instr1 = mountInstruction(layer,
      `<span class="brand">6</span> REST abilities`);
    await wait(400);
    await effectTopDownLetters(instr1, gsap);
    await wait(700);
    await effectFadeOutInstr(instr1, gsap);

    LOG('phase 1 done');

    // ── Phase 2 (1.5–3.2s) — 3 client silhouettes appear ──

    const clientEls = [];
    for (let i = 0; i < CLIENTS.length; i++) {
      const c = CLIENTS[i];
      const angle = (c.angleDeg * Math.PI) / 180;
      const wx = Math.cos(angle) * c.radius;
      const wy = Math.sin(angle) * c.radius;

      const el = document.createElement('div');
      el.className = 'ra-ch6-client';
      const logoHtml = c.logo
        ? `<img src="${c.logo}" alt="${c.label}" draggable="false" />`
        : abstractClientIcon();
      el.innerHTML = `
        <div class="logo-frame">${logoHtml}</div>
        <div class="label">${c.label}</div>
      `;
      layer.appendChild(el);
      clientEls.push({ el, worldX: wx, worldY: wy, label: c.label, id: c.id });
    }

    let trackerActive = true;
    const trackClients = () => {
      if (!trackerActive) return;
      for (const cli of clientEls) {
        const v = new THREE.Vector3(cli.worldX, cli.worldY, 0).project(camera);
        const sx = ((v.x + 1) / 2) * window.innerWidth;
        const sy = ((-v.y + 1) / 2) * window.innerHeight;
        cli.el.style.left = sx + 'px';
        cli.el.style.top  = sy + 'px';
        cli.el.style.transform = 'translate(-50%, -50%)';
      }
    };
    _state.stopClientTracker = pausableRaf(trackClients);

    clientEls.forEach((cli, i) => {
      gsap.to(cli.el, {
        opacity: 1, scale: 1,
        duration: 0.6, ease: 'back.out(1.4)',
        delay: i * 0.18,
      });
    });

    // Phase 2 instruction — focus-blur-resolve
    const instr2 = mountInstruction(layer,
      `<span class="accent">3</span> MCP clients connect`);
    await wait(300);
    await effectFocusBlurResolve(instr2, gsap);
    await wait(700);
    await effectFadeOutInstr(instr2, gsap);

    LOG('phase 2 done');

    // ── Phase 3 (3.2–4.8s) — 18 outbound beams ──

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    Object.assign(svg.style, {
      position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '83',
    });
    svg.setAttribute('width', String(window.innerWidth));
    svg.setAttribute('height', String(window.innerHeight));
    document.body.appendChild(svg);

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.appendChild(defs);

    const beams = [];
    let beamIdx = 0;
    for (let ai = 0; ai < abilities.length; ai++) {
      for (let ci = 0; ci < clientEls.length; ci++) {
        const gradId = `ra-ch6-beam-${beamIdx++}`;
        const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        grad.setAttribute('id', gradId);
        grad.setAttribute('gradientUnits', 'userSpaceOnUse');
        const stops = [
          ['0%',   '0.50'],
          ['50%',  '0.20'],
          ['100%', '0.05'],
        ];
        for (const [off, op] of stops) {
          const s = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
          s.setAttribute('offset', off);
          s.setAttribute('stop-color', '#4ec9ff');
          s.setAttribute('stop-opacity', op);
          grad.appendChild(s);
        }
        defs.appendChild(grad);

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('stroke', `url(#${gradId})`);
        line.setAttribute('stroke-width', '0.8');
        line.setAttribute('stroke-linecap', 'round');
        line.setAttribute('stroke-dasharray', '0 700');
        svg.appendChild(line);
        beams.push({ line, ability: abilities[ai], client: clientEls[ci], grad });
      }
    }

    const trackBeams = () => {
      if (!trackerActive) return;
      for (const b of beams) {
        const av = b.ability.group.position.clone().project(camera);
        const ax = ((av.x + 1) / 2) * window.innerWidth;
        const ay = ((-av.y + 1) / 2) * window.innerHeight;
        const cv = new THREE.Vector3(b.client.worldX, b.client.worldY, 0).project(camera);
        const cx = ((cv.x + 1) / 2) * window.innerWidth;
        const cy = ((-cv.y + 1) / 2) * window.innerHeight;
        b.line.setAttribute('x1', ax); b.line.setAttribute('y1', ay);
        b.line.setAttribute('x2', cx); b.line.setAttribute('y2', cy);
        b.grad.setAttribute('x1', ax); b.grad.setAttribute('y1', ay);
        b.grad.setAttribute('x2', cx); b.grad.setAttribute('y2', cy);
      }
    };
    _state.stopBeamTracker = pausableRaf(trackBeams);

    beams.forEach((b, i) => {
      const aIdx = abilities.indexOf(b.ability);
      const at = aIdx * 0.08;
      gsap.to(b.line, {
        attr: { 'stroke-dasharray': '700 0' },
        duration: 0.7, ease: 'expo.out',
        delay: at,
      });
    });

    // Phase 3 instruction — mask-reveal-up
    const instr3 = mountInstruction(layer,
      `Every ability <span class="accent">→</span> every client`);
    await wait(500);
    await effectMaskRevealUp(instr3, gsap);
    await wait(700);
    await effectFadeOutInstr(instr3, gsap);

    LOG('phase 3 done');

    // ── Phase 4 (4.8–6.4s) — main caption ──

    const caption = document.createElement('div');
    caption.className = 'ra-ch6-caption';
    caption.innerHTML = `
      <div class="main">Same API. Multiple consumers. <span class="mono">mcp.public = true</span></div>
      <div class="sub">Connect with the wordpress/mcp-adapter plugin</div>
    `;
    layer.appendChild(caption);

    // Spring-scale-in for the caption
    gsap.fromTo(caption,
      { opacity: 0, scale: 0.85 },
      { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.6)' });

    await wait(1500);
    LOG('phase 4 done');

    // ── Phase 5 (6.4–9.0s) — HYPERSTYLE OUTRO ──

    // 5a: fade everything out fast — and scale ability groups to 0 so
    // their meshes (cores etc) don't linger under the wordmark.
    const fadeOutTl = gsap.timeline();
    fadeOutTl.to(center, { opacity: 0, duration: 0.45 }, 0);
    abilities.forEach((a) => {
      fadeOutTl.to(a.wireMat, { opacity: 0, duration: 0.45 }, 0);
      fadeOutTl.to(a.coreMat, { emissiveIntensity: 0, duration: 0.45 }, 0);
      // Collapse the entire group to 0 — nothing left in scene when
      // the wordmark drops in
      fadeOutTl.to(a.group.scale, { x: 0, y: 0, z: 0, duration: 0.45 }, 0);
    });
    clientEls.forEach((c) => {
      fadeOutTl.to(c.el, { opacity: 0, duration: 0.4 }, 0);
    });
    beams.forEach((b) => {
      fadeOutTl.to(b.line, { opacity: 0, duration: 0.4 }, 0);
    });
    fadeOutTl.to(caption, { opacity: 0, y: -8, duration: 0.4 }, 0);

    await wait(550);

    // 5c: wordmark builds with per-letter top-down-letters effect, brand orange.
    // No supernova/flash — clean premium look, the wordmark + URL carry the moment.

    const lockup = document.createElement('div');
    lockup.className = 'ra-ch6-lockup';
    const wordmarkText = 'WPForms REST API';
    const wordmarkChars = wordmarkText.split('').map((ch) => {
      const sp = document.createElement('span');
      sp.className = 'ch';
      sp.textContent = ch === ' ' ? ' ' : ch;
      return sp;
    });

    const wordmarkEl = document.createElement('div');
    wordmarkEl.className = 'ra-ch6-wordmark';
    for (const sp of wordmarkChars) wordmarkEl.appendChild(sp);

    const urlEl = document.createElement('div');
    urlEl.className = 'ra-ch6-url';
    urlEl.textContent = 'wpforms.com/developers/rest-api';

    lockup.appendChild(wordmarkEl);
    lockup.appendChild(urlEl);
    layer.appendChild(lockup);

    // Per-letter top-down: each char drops in with stagger + slight scale
    gsap.set(wordmarkChars, {
      y: -60, opacity: 0, scale: 0.7,
      filter: 'blur(8px)',
    });
    gsap.to(wordmarkChars, {
      y: 0, opacity: 1, scale: 1,
      filter: 'blur(0px)',
      duration: 0.7, ease: 'back.out(1.6)',
      stagger: 0.035,
    });

    // 5d: URL mask-reveal-up (clip-path) + slide
    gsap.set(urlEl, {
      clipPath: 'inset(100% 0 0 0)',
      WebkitClipPath: 'inset(100% 0 0 0)',
      y: 16, opacity: 0,
    });
    gsap.to(urlEl, {
      clipPath: 'inset(0% 0 0 0)',
      WebkitClipPath: 'inset(0% 0 0 0)',
      y: 0, opacity: 1,
      duration: 0.85, ease: 'expo.out',
      delay: 0.55,
    });

    // No flash overlay — the wordmark's own brand-orange text-shadow
    // carries the visual weight without aggressive screen-fill.

    await wait(2200);
    LOG('phase 5 done');

    // ── Phase 6 (9.0–10.5s) — full fade-to-black with 25px blur ──

    await new Promise((res) => gsap.to(_state.layer, {
      opacity: 0, filter: 'blur(25px)',
      duration: 1.2, ease: 'power2.in',
      onComplete: res,
    }));

    LOG('exit done');

    trackerActive = false;
    _state.stopClientTracker?.();
    _state.stopBeamTracker?.();
    _state.stopThreeRaf?.();
    svg.remove();
    vignette.remove();
    _state.three.dispose();
    _state.atm.dispose();
    _state.layer.remove();
    _state = null;
  },
}];

// ── Phase-instruction helpers ──

function mountInstruction(layer, html) {
  const el = document.createElement('div');
  el.className = 'ra-ch6-phase-instr';
  el.innerHTML = html;
  // Hide the parent until the effect explicitly reveals it — prevents
  // the brief flash of plain text before chars are split + animated.
  el.style.opacity = '0';
  layer.appendChild(el);
  return el;
}

// pixel-point-style "top-down-letters" — split chars into spans, each
// drops from y:-30 with stagger. Parent is opacity:0 from mount; chars
// are pre-hidden BEFORE parent is revealed so there's no plain-text flash.
async function effectTopDownLetters(el, gsap) {
  const chars = splitCharSpans(el);
  gsap.set(chars, { y: -30, opacity: 0 });
  // Reveal parent only after chars are hidden — prevents double-animation
  el.style.opacity = '1';
  return new Promise((res) => {
    gsap.to(chars, {
      y: 0, opacity: 1,
      duration: 0.5, ease: 'sine.out',
      stagger: 0.025,
      onComplete: res,
    });
  });
}

// pixel-point-style "focus-blur-resolve" — element starts blurry+invisible,
// sharpens into focus
async function effectFocusBlurResolve(el, gsap) {
  gsap.set(el, { opacity: 0, filter: 'blur(20px)', scale: 0.96 });
  return new Promise((res) => {
    gsap.to(el, {
      opacity: 1, filter: 'blur(0px)', scale: 1,
      duration: 0.7, ease: 'expo.out',
      onComplete: res,
    });
  });
}

// pixel-point-style "mask-reveal-up" — clip-path slides from below upward
async function effectMaskRevealUp(el, gsap) {
  gsap.set(el, {
    clipPath: 'inset(100% 0 0 0)',
    WebkitClipPath: 'inset(100% 0 0 0)',
    y: 12, opacity: 0,
  });
  return new Promise((res) => {
    gsap.to(el, {
      clipPath: 'inset(0% 0 0 0)',
      WebkitClipPath: 'inset(0% 0 0 0)',
      y: 0, opacity: 1,
      duration: 0.7, ease: 'expo.out',
      onComplete: res,
    });
  });
}

async function effectFadeOutInstr(el, gsap) {
  return new Promise((res) => {
    gsap.to(el, {
      opacity: 0, y: -8,
      duration: 0.35, ease: 'sine.in',
      onComplete: () => { el.remove(); res(); },
    });
  });
}

// Split text-bearing children into per-char spans for staggered animation
function splitCharSpans(root) {
  const out = [];
  const walk = (el) => {
    const kids = Array.from(el.childNodes);
    for (const node of kids) {
      if (node.nodeType === 3) {
        const frag = document.createDocumentFragment();
        for (const ch of node.nodeValue) {
          const sp = document.createElement('span');
          sp.style.display = 'inline-block';
          sp.textContent = ch === ' ' ? ' ' : ch;
          frag.appendChild(sp);
          out.push(sp);
        }
        el.replaceChild(frag, node);
      } else if (node.nodeType === 1) {
        walk(node);
      }
    }
  };
  walk(root);
  return out;
}

// Abstract icon for "Your custom client" — no real product UI
function abstractClientIcon() {
  return `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="3.5" width="19" height="17" rx="3" stroke="#4ec9ff" stroke-width="1.6"/>
      <path d="M6 9l3 3-3 3" stroke="#4ec9ff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M11 15h7" stroke="#4ec9ff" stroke-width="1.8" stroke-linecap="round"/>
    </svg>
  `;
}

function wait(ms) { return pausableSleep(ms); }
