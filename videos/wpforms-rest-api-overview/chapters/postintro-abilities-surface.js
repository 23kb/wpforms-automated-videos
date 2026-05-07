// Chapter 2 — postIntro: "The Abilities API surface" (~10s)
//
// Continuity from Ch.1: the 6 wireframe icosahedron data crystals from
// the end of Ch.1 are already in place. Sullie (WPForms mascot) fades
// in at center. Crystal labels morph JSON keys → ability route paths.
// Soft gradient beams draw from center. Route pill rises top, API name
// drops bottom. Cursor emerges from center, glides to list-forms node,
// camera dives in, dim handoff to Ch.3.

import {
  loadGsap, mountSceneLayer, mountSceneCursor, SCENE_CURSOR_CSS, injectCss,
  mountThreeScene, mountAtmospherics, runAtmospherics,
  ensureRestApiFonts, injectStageCss, COLORS,
  ABILITIES, getSharedScene, pausableRaf, pausableSleep,
} from './_kit.js';

ensureRestApiFonts();
injectStageCss();

export const mode = 'parallel';
export const breakStyle = 'glide';

const LOG = (...a) => console.log('[ch2]', performance.now().toFixed(0) + 'ms', ...a);

const JSON_KEYS = ['"forms"', '"id"', '"title"', '"status"', '"author"', '"total"'];

let _state = null;

export async function setup() {
  ensureRestApiFonts();
  injectStageCss();
  injectCss('rest-api-cursor-css', SCENE_CURSOR_CSS);

  // Premium-pass CSS — soft vignette + refined label/pill chrome.
  injectCss('ra-ch2-css', `
    .ra-ch2-vignette {
      position: fixed; inset: 0; pointer-events: none; z-index: 79;
      background: radial-gradient(ellipse at center,
        rgba(10,14,20,0) 35%,
        rgba(10,14,20,0.45) 75%,
        rgba(10,14,20,0.85) 100%);
    }
    .ra-ch2-center {
      position: fixed; left: 50%; top: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none; opacity: 0;
    }
    .ra-ch2-center .ra-ch2-halo {
      position: absolute; left: 50%; top: 50%;
      width: 360px; height: 360px;
      transform: translate(-50%, -50%);
      background: radial-gradient(circle at center,
        rgba(213,78,33,0.34) 0%,
        rgba(213,78,33,0.14) 28%,
        rgba(213,78,33,0.04) 50%,
        rgba(213,78,33,0) 70%);
      filter: blur(2px);
    }
    .ra-ch2-center img {
      position: relative; display: block;
      width: 140px; height: auto;
      filter: drop-shadow(0 0 24px rgba(213,78,33,0.55))
              drop-shadow(0 8px 22px rgba(0,0,0,0.6));
    }
    .ra-ch2-lbl {
      position: fixed;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 14px; font-weight: 500;
      letter-spacing: 0.02em;
      color: #c9d1d9;
      opacity: 0.55;
      pointer-events: none; white-space: nowrap;
      padding: 5px 11px;
      border-radius: 999px;
      background: rgba(13,17,23,0.62);
      border: 1px solid rgba(78,201,255,0.14);
      backdrop-filter: blur(3px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.35);
      transition: none;
    }
    .ra-ch2-lbl.json-key {
      color: #9cdcfe;
      font-style: italic;
    }
    .ra-ch2-route {
      position: fixed; left: 50%; top: 6%;
      transform: translate(-50%, 0);
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 14px;
      letter-spacing: 0.01em;
      padding: 10px 22px;
      border-radius: 999px;
      background: rgba(13,17,23,0.94);
      border: 1px solid rgba(78,201,255,0.45);
      backdrop-filter: blur(6px);
      box-shadow: 0 8px 28px rgba(0,0,0,0.55), 0 0 24px rgba(78,201,255,0.18);
      color: #e6edf3;
      opacity: 0;
      pointer-events: none; white-space: nowrap;
      z-index: 90;
    }
    .ra-ch2-api {
      position: fixed; left: 50%;
      top: calc(50% + 150px);
      transform: translate(-50%, 0);
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 11px; font-weight: 500;
      letter-spacing: 0.32em;
      text-transform: uppercase;
      color: rgba(245,247,250,0.42);
      opacity: 0; pointer-events: none; white-space: nowrap;
    }
  `);

  const layer = mountSceneLayer('ra-ch2-layer', { z: 80 });
  layer.style.opacity = '1';
  const atm = mountAtmospherics();
  const three = await mountThreeScene('ra-ch2-three', { z: 70, cameraZ: 7 });
  const cursor = mountSceneCursor(layer);
  cursor.style.opacity = '0';
  cursor.style.transform = 'translate(-9999px, -9999px)';

  const stopThreeRaf = pausableRaf(() => {
    three.renderer.render(three.scene, three.camera);
  });

  _state = { layer, atm, three, cursor, stopThreeRaf };
  LOG('setup done');
}

export default [{
  id: 'abilities-surface',
  duration: 0.05,
  effect: async () => {
    const t0 = performance.now();
    const elapsed = () => ((performance.now() - t0) / 1000).toFixed(2) + 's';
    const wait = (ms) => pausableSleep(ms);

    const gsap = await loadGsap({ flip: false, motionPath: false });
    const { THREE, scene, camera } = _state.three;
    const { layer, atm, cursor } = _state;
    LOG('effect start');

    runAtmospherics(gsap, atm, 11);

    // Vignette — subtle depth on the periphery
    const vignette = document.createElement('div');
    vignette.className = 'ra-ch2-vignette';
    document.body.appendChild(vignette);

    // Refined lighting — softer, more directional
    const rim = new THREE.PointLight(0x4ec9ff, 1.0, 16);
    rim.position.set(0, 0, 4);
    scene.add(rim);
    const fill = new THREE.PointLight(0xffffff, 0.4, 14);
    fill.position.set(-3, 2, 2);
    scene.add(fill);

    // ── 6 wireframe icosahedron crystals (continuity from Ch.1) ──
    const crystals = [];
    const crystalLabels = [];
    const RADIUS = 2.5;

    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
      const x = Math.cos(angle) * RADIUS;
      const y = Math.sin(angle) * RADIUS;

      const nodeGroup = new THREE.Group();

      // Wireframe icosahedron — softer alpha for premium feel
      const icoGeom = new THREE.IcosahedronGeometry(0.28, 0);
      const wireGeom = new THREE.WireframeGeometry(icoGeom);
      const wireMat = new THREE.LineBasicMaterial({
        color: 0x4ec9ff, transparent: true, opacity: 0.32,
      });
      const wire = new THREE.LineSegments(wireGeom, wireMat);
      nodeGroup.add(wire);

      // Subtle glowing core (smaller than before)
      const coreGeom = new THREE.SphereGeometry(0.07, 24, 24);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: 0x4ec9ff, emissiveIntensity: 0.7,
        roughness: 0.3, metalness: 0.7,
        transparent: true, opacity: 1,
      });
      const core = new THREE.Mesh(coreGeom, coreMat);
      nodeGroup.add(core);

      nodeGroup.position.set(x, y, 0);
      nodeGroup.rotation.x = Math.random() * Math.PI;
      nodeGroup.rotation.y = Math.random() * Math.PI;
      scene.add(nodeGroup);

      // Slow rotation (matches Ch.1, slightly slower for premium)
      gsap.to(nodeGroup.rotation, {
        x: '+=' + (Math.PI * 2),
        y: '+=' + (Math.PI * 2.4),
        duration: 18, ease: 'none', repeat: -1,
      });

      crystals.push({ nodeGroup, wire, wireMat, core, coreMat, angle, x, y });

      // Label starts as JSON key (continuity from Ch.1)
      const lbl = document.createElement('div');
      lbl.className = 'ra-ch2-lbl json-key';
      lbl.textContent = JSON_KEYS[i];
      layer.appendChild(lbl);
      crystalLabels.push(lbl);
    }

    // RAF: project each crystal's 3D position to screen for label tracking
    let labelTrackerActive = true;
    const trackLabels = () => {
      if (!labelTrackerActive) return;
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      for (let i = 0; i < crystals.length; i++) {
        const v = crystals[i].nodeGroup.position.clone().project(camera);
        const sx = ((v.x + 1) / 2) * window.innerWidth;
        const sy = ((-v.y + 1) / 2) * window.innerHeight;
        const dx = sx - cx, dy = sy - cy;
        const m = Math.hypot(dx, dy) || 1;
        const ox = sx + (dx / m) * 70;
        const oy = sy + (dy / m) * 70;
        crystalLabels[i].style.left = ox + 'px';
        crystalLabels[i].style.top  = oy + 'px';
        crystalLabels[i].style.transform = 'translate(-50%, -50%)';
      }
    };
    _state.stopLabelTracker = pausableRaf(trackLabels);

    // ── Phase 1 (0 – 1.0s): Sullie fades in at center with halo ──
    const center = document.createElement('div');
    center.className = 'ra-ch2-center';
    center.innerHTML = `
      <div class="ra-ch2-halo"></div>
      <img src="/assets/sullie.png" alt="WPForms Sullie" draggable="false" />
    `;
    layer.appendChild(center);

    gsap.fromTo(center,
      { opacity: 0, scale: 0.86 },
      { opacity: 1, scale: 1, duration: 1.0, ease: 'expo.out' });
    await wait(1000);
    LOG('phase 1 done', elapsed());
    if (window.__ch2HoldP1) await wait(30000);

    // ── Phase 2 (1.0 – 4.0s): label morph + gradient beams draw on ──

    // Brighten crystals as they "wake up"
    crystals.forEach((c, i) => {
      gsap.to(c.wireMat, { opacity: 0.78, duration: 0.8, delay: 0.1 + i * 0.06 });
      gsap.to(c.coreMat, { emissiveIntensity: 1.4, duration: 0.8, delay: 0.1 + i * 0.06 });
    });

    // SVG layer with gradient beams
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'ra-ch2-beams';
    Object.assign(svg.style, {
      position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '78',
    });
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');

    // One linear gradient per beam — soft fade from center (transparent)
    // to crystal end (cyan). Premium = beam EMITS from the node back
    // toward the center, fading out, not a solid hard line.
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.appendChild(defs);
    document.body.appendChild(svg);

    const beams = [];
    for (let i = 0; i < crystals.length; i++) {
      const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      grad.setAttribute('id', `ra-ch2-beam-grad-${i}`);
      grad.setAttribute('gradientUnits', 'userSpaceOnUse');
      defs.appendChild(grad);
      // Two stops — center (transparent) → node (cyan)
      const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop1.setAttribute('offset', '0%');
      stop1.setAttribute('stop-color', '#4ec9ff');
      stop1.setAttribute('stop-opacity', '0');
      grad.appendChild(stop1);
      const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop2.setAttribute('offset', '40%');
      stop2.setAttribute('stop-color', '#4ec9ff');
      stop2.setAttribute('stop-opacity', '0.05');
      grad.appendChild(stop2);
      const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop3.setAttribute('offset', '100%');
      stop3.setAttribute('stop-color', '#4ec9ff');
      stop3.setAttribute('stop-opacity', '0.55');
      grad.appendChild(stop3);

      const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      ln.setAttribute('stroke', `url(#ra-ch2-beam-grad-${i})`);
      ln.setAttribute('stroke-width', '0.9');
      ln.setAttribute('stroke-linecap', 'round');
      ln.setAttribute('stroke-dasharray', '0 800');
      svg.appendChild(ln);
      beams.push({ line: ln, grad, stop1, stop2, stop3 });
    }

    // Beam screen-tracker — also updates gradient endpoints to follow crystal
    let beamsActive = true;
    const trackBeams = () => {
      if (!beamsActive) return;
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      for (let i = 0; i < beams.length; i++) {
        const v = crystals[i].nodeGroup.position.clone().project(camera);
        const sx = ((v.x + 1) / 2) * window.innerWidth;
        const sy = ((-v.y + 1) / 2) * window.innerHeight;
        // Start beam OUTSIDE the central halo (offset toward node)
        const dx = sx - cx, dy = sy - cy;
        const m = Math.hypot(dx, dy) || 1;
        const startX = cx + (dx / m) * 90;  // start outside the 360px halo
        const startY = cy + (dy / m) * 90;
        // End beam BEFORE the crystal label (offset toward center)
        const endX = sx - (dx / m) * 50;
        const endY = sy - (dy / m) * 50;
        beams[i].line.setAttribute('x1', startX);
        beams[i].line.setAttribute('y1', startY);
        beams[i].line.setAttribute('x2', endX);
        beams[i].line.setAttribute('y2', endY);
        // Sync gradient endpoints to line endpoints
        beams[i].grad.setAttribute('x1', startX);
        beams[i].grad.setAttribute('y1', startY);
        beams[i].grad.setAttribute('x2', endX);
        beams[i].grad.setAttribute('y2', endY);
      }
    };
    _state.stopBeamTracker = pausableRaf(trackBeams);

    // Stagger: relabel each crystal sequentially, beam draws after.
    for (let i = 0; i < crystals.length; i++) {
      const lbl = crystalLabels[i];
      // Fade out current (JSON-key) label
      gsap.to(lbl, { opacity: 0, duration: 0.18, ease: 'sine.in' });
      await wait(180);
      // Swap text + remove json-key class
      lbl.textContent = ABILITIES[i];
      lbl.classList.remove('json-key');
      // Fade back in (slightly higher opacity for resolved state)
      gsap.to(lbl, { opacity: 0.92, duration: 0.32, ease: 'expo.out' });
      // Beam draw-on
      gsap.to(beams[i].line, {
        attr: { 'stroke-dasharray': '800 0' },
        duration: 0.6, ease: 'expo.out',
      });
      await wait(220);
    }
    await wait(500);
    LOG('phase 2 done', elapsed());
    if (window.__ch2HoldP2) await wait(30000);

    // ── Phase 3 (4.0 – 4.7s): route prefix pill rises at top ──
    const routePill = document.createElement('div');
    routePill.className = 'ra-ch2-route';
    routePill.innerHTML = '<span style="color:#c9d1d9;">/wp-json/wp-abilities/v1/abilities/</span>' +
                         '<span style="color:' + COLORS.cyan + ';font-weight:600;">&lt;ability&gt;</span>' +
                         '<span style="color:#c9d1d9;">/run</span>';
    layer.appendChild(routePill);

    gsap.fromTo(routePill,
      { opacity: 0, y: -14 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' });
    await wait(700);
    LOG('phase 3 done', elapsed());
    if (window.__ch2HoldP3) await wait(30000);

    // ── Phase 4 (4.7 – 6.0s): API name label below center ──
    const apiLabel = document.createElement('div');
    apiLabel.className = 'ra-ch2-api';
    apiLabel.textContent = 'WordPress Abilities API · core 6.9+';
    layer.appendChild(apiLabel);

    gsap.fromTo(apiLabel,
      { opacity: 0, y: -8 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'sine.out' });
    await wait(700);
    await wait(600);
    LOG('phase 4 done', elapsed());
    if (window.__ch2HoldP4) await wait(30000);

    // ── Phase 5 (6.0 – 9.5s): cursor emerges from CENTER, glides to list-forms ──
    const target = crystals[0]; // top crystal = wpforms/list-forms
    const targetLabel = crystalLabels[0];

    // Cursor emerges from Sullie's waving-hand area (top-left of her),
    // not hidden behind her body. Sullie image ~140px wide; her hand is
    // roughly at (cx - 50, cy - 30).
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const handX = cx - 50, handY = cy - 30;
    cursor.style.transform = `translate(${handX}px, ${handY}px)`;
    gsap.to(cursor, { opacity: 1, duration: 0.45, ease: 'sine.out' });
    await wait(550);
    // Brief beat: Sullie "presents" before pointing
    await wait(150);

    // Glide outward to list-forms label
    const lblRect = targetLabel.getBoundingClientRect();
    const cursorEndX = lblRect.left + lblRect.width / 2 - 8;
    const cursorEndY = lblRect.top + lblRect.height / 2;

    const proxy = { x: handX, y: handY };
    gsap.to(proxy, {
      x: cursorEndX, y: cursorEndY,
      duration: 1.4, ease: 'expo.out',
      onUpdate: () => {
        cursor.style.transform = `translate(${proxy.x}px, ${proxy.y}px)`;
      },
    });
    await wait(1400);

    if (window.__ch2HoldCursor) await wait(30000);
    // Pulse target crystal once
    gsap.to(target.nodeGroup.scale, {
      x: 1.32, y: 1.32, z: 1.32,
      duration: 0.4, ease: 'sine.inOut',
      yoyo: true, repeat: 1,
    });
    // Brighten target label
    gsap.to(targetLabel, {
      opacity: 1, fontSize: '17px', duration: 0.5,
    });
    await wait(550);

    // Camera dives toward target's projected position so target lands at
    // screen center (matches the shared scene's centered-focus convention
    // so the Ch.2→Ch.3 hand-off is visually seamless).
    const phase5 = gsap.timeline();
    phase5.to(camera.position, {
      x: target.x, y: target.y, z: 3.5,
      duration: 1.4, ease: 'expo.in',
    }, 0);

    for (let i = 1; i < crystals.length; i++) {
      phase5.to(crystals[i].wireMat, { opacity: 0.12, duration: 0.6 }, 0);
      phase5.to(crystals[i].coreMat, { emissiveIntensity: 0.3, duration: 0.6 }, 0);
      phase5.to(crystalLabels[i], { opacity: 0.18, duration: 0.6 }, 0);
      // Beam fade
      phase5.to(beams[i].stop3, { attr: { 'stop-opacity': 0.08 }, duration: 0.6 }, 0);
    }
    phase5.to(target.wireMat, { opacity: 1.0, duration: 0.6 }, 0);
    phase5.to(target.coreMat, { emissiveIntensity: 2.0, duration: 0.6 }, 0);

    // Fade out everything else around the wordmark
    phase5.to([routePill, apiLabel, center, vignette], { opacity: 0, duration: 0.5 }, 0.1);
    phase5.to(cursor, { opacity: 0, duration: 0.4 }, 0.6);

    await wait(1500);
    LOG('phase 5 done', elapsed());
    if (window.__ch2HoldP5) await wait(30000);

    // Brief hold on target before exit
    await wait(300);

    // Mount the shared persistent scene NOW — Ch.3+ will inherit it.
    // Camera is set to (list-forms.x, list-forms.y, 3.5) which puts the
    // shared list-forms crystal at the same screen center where Ch.2's
    // own crystal currently sits. When Ch.2's three layer fades + own
    // crystals dim, the shared scene's identical-looking crystal at the
    // same screen position is revealed underneath. No blink, no jump.
    await getSharedScene({ initialFocusIdx: 0 });

    // Fade ch2's own three crystals to 0 (so the canvas goes empty) at
    // the same time we fade the DOM layer — shared scene shows through.
    for (const c of crystals) {
      gsap.to(c.wireMat, { opacity: 0, duration: 0.5 });
      gsap.to(c.coreMat, { opacity: 0, emissiveIntensity: 0, duration: 0.5 });
    }

    // Exit dive-zoom into Ch.3 (DOM only — no scale/blur on canvas)
    gsap.to(_state.layer, {
      opacity: 0,
      duration: 0.55, ease: 'power2.in',
    });
    await wait(600);
    LOG('exit done', elapsed());

    // Cleanup ch2's OWN three scene + DOM. Shared scene persists.
    labelTrackerActive = false;
    beamsActive = false;
    _state.stopLabelTracker?.();
    _state.stopBeamTracker?.();
    _state.stopThreeRaf?.();
    crystalLabels.forEach((l) => l.remove());
    svg.remove();
    vignette.remove();
    _state.three.dispose();
    _state.atm.dispose();
    _state.layer.remove();
    _state = null;
  },
}];
