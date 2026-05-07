// Chapter 1 — intro cold open (~9s)
// Dark void → typed curl command → 2s hold → cursor enters from bottom →
// click at the real Enter position (end of line 2) → ripple →
// 6 wireframe-icosahedron data nodes burst outward (real 3D, rotating) →
// camera dolly-back → typewriter title "WPForms speaks REST" → hold.

import {
  loadGsap, mountSceneLayer, mountSceneCursor, SCENE_CURSOR_CSS, injectCss,
  mountThreeScene, mountAtmospherics, runAtmospherics,
  ensureRestApiFonts, injectStageCss, COLORS,
  highlightCurl, cyanRipple, pausableRaf, pausableSleep,
} from './_kit.js';

// Eager: stage CSS at module-import time so html/body bg + hide rules apply
// before the runner queries iframe.ui.contentDocument.
ensureRestApiFonts();
injectStageCss();

export const mode = 'parallel';
export const breakStyle = 'glide';

const LOG = (...a) => console.log('[ch1]', performance.now().toFixed(0) + 'ms', ...a);

let _state = null;

export async function setup() {
  ensureRestApiFonts();
  injectStageCss();
  injectCss('rest-api-cursor-css', SCENE_CURSOR_CSS);

  const layer = mountSceneLayer('ra-ch1-layer', { z: 80 });
  layer.style.opacity = '1';
  const atm = mountAtmospherics();
  const three = await mountThreeScene('ra-ch1-three', { z: 70, cameraZ: 7 });
  const cursor = mountSceneCursor(layer);
  cursor.style.opacity = '0';
  cursor.style.transform = 'translate(-200px, -200px)';

  const stopThreeRaf = pausableRaf(() => {
    three.renderer.render(three.scene, three.camera);
  });

  _state = { layer, atm, three, cursor, stopThreeRaf };
  LOG('setup done');
}

// Real top-level JSON keys returned by the REST API — match what's shown
// in chapters 3–5. Reads as "structured data spilling out of the request".
const NODE_LABELS = [
  '"forms"',
  '"id"',
  '"title"',
  '"status"',
  '"author"',
  '"total"',
];

export default [{
  id: 'cold-open',
  duration: 0.05,
  effect: async () => {
    const t0 = performance.now();
    const elapsed = () => ((performance.now() - t0) / 1000).toFixed(2) + 's';

    const gsap = await loadGsap({ flip: false, motionPath: false });
    const { THREE, scene, camera } = _state.three;
    const { layer, atm, cursor } = _state;
    LOG('effect start');

    // Atmospherics over the whole chapter (~9s)
    runAtmospherics(gsap, atm, 9);

    // ── Phase 1 (0.0 – 0.5s): grain holds in dark void ──
    await wait(500);
    LOG('phase 1 done', elapsed());

    // ── Phase 2 (0.5 – 2.5s): type curl command ──
    const cmdLine = document.createElement('div');
    cmdLine.className = 'ra-cmd-line';
    Object.assign(cmdLine.style, {
      fontSize: '24px', opacity: '0',
      whiteSpace: 'nowrap', textAlign: 'center',
      lineHeight: '1.45',
    });
    cmdLine.innerHTML = `<span class="ra-cmd-text"></span><span class="ra-cmd-caret"></span>`;
    layer.appendChild(cmdLine);
    const textEl = cmdLine.querySelector('.ra-cmd-text');
    const caretEl = cmdLine.querySelector('.ra-cmd-caret');
    textEl.innerHTML = highlightCurl('curl "$WP_SITE/wp-json/wp-abilities/v1/abilities/wpforms/list-forms/run"');

    // Split text nodes into per-char spans, hide all
    const chars = splitChars(textEl);
    LOG('split into', chars.length, 'chars');
    for (const c of chars) c.style.visibility = 'hidden';

    await gsap.to(cmdLine, { opacity: 1, duration: 0.3, ease: 'sine.out' });

    // Reveal chars over ~1.5s
    const charDur = 1500 / chars.length;
    for (const c of chars) {
      c.style.visibility = 'visible';
      await wait(charDur);
    }
    LOG('phase 2 done', elapsed());
    if (window.__debugHoldP2) await wait(30000);

    // ── Phase 3a (2.5 – 4.5s): HOLD command, no cursor yet ──
    await wait(2000);
    LOG('phase 3a hold done', elapsed());

    // ── Phase 3b (4.5 – 5.5s): cursor enters from bottom, clicks Enter ──
    // The Enter position = the END of the LAST char (line 2 in wrapped layout),
    // not the parent textEl's right edge (which equals max line width).
    const lastChar = chars[chars.length - 1];
    const lcRect = lastChar.getBoundingClientRect();
    const enterX = lcRect.right + 6;
    const enterY = lcRect.top + lcRect.height / 2;

    cursor.style.opacity = '0';
    cursor.style.transform = `translate(${enterX - 30}px, ${window.innerHeight + 50}px)`;
    // Reveal cursor
    await new Promise((res) => gsap.to(cursor, { opacity: 1, duration: 0.2, onComplete: res }));
    // Glide up from bottom to Enter position
    await new Promise((res) => gsap.to({ x: enterX - 30, y: window.innerHeight + 50 }, {
      x: enterX - 4, y: enterY - 2,
      duration: 0.7, ease: 'expo.out',
      onUpdate: function () {
        const tx = this.targets()[0].x;
        const ty = this.targets()[0].y;
        cursor.style.transform = `translate(${tx}px, ${ty}px)`;
      },
      onComplete: res,
    }));
    cyanRipple(layer, enterX, enterY, gsap);
    await wait(220);
    LOG('phase 3b done', elapsed());

    // ── Phase 4 (5.5 – 7.0s): 6 wireframe-icosahedron data nodes burst out ──
    const burstGroup = new THREE.Group();
    scene.add(burstGroup);

    // Brighter scene lights for proper 3D shading
    const rim = new THREE.PointLight(0x4ec9ff, 1.4, 18);
    rim.position.set(0, 0, 4);
    scene.add(rim);

    const burstNodes = [];
    const burstLabels = [];

    for (let i = 0; i < NODE_LABELS.length; i++) {
      const angle = (Math.PI * 2 * i) / NODE_LABELS.length - Math.PI / 2;

      // Group holds: outer wireframe icosahedron + inner solid core
      const nodeGroup = new THREE.Group();

      // Wireframe icosahedron (clearly reads as 3D)
      const icoGeom = new THREE.IcosahedronGeometry(0.32, 0);
      const wireGeom = new THREE.WireframeGeometry(icoGeom);
      const wireMat = new THREE.LineBasicMaterial({
        color: 0x4ec9ff, transparent: true, opacity: 0,
        linewidth: 1,
      });
      const wire = new THREE.LineSegments(wireGeom, wireMat);
      nodeGroup.add(wire);

      // Inner solid core — small bright sphere
      const coreGeom = new THREE.SphereGeometry(0.09, 24, 24);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: 0x4ec9ff, emissiveIntensity: 2.0,
        roughness: 0.2, metalness: 0.8,
      });
      const core = new THREE.Mesh(coreGeom, coreMat);
      nodeGroup.add(core);

      nodeGroup.position.set(0, 0, 0);
      nodeGroup.scale.setScalar(0.001);
      // Random initial tilt so each crystal looks unique
      nodeGroup.rotation.x = Math.random() * Math.PI;
      nodeGroup.rotation.y = Math.random() * Math.PI;
      burstGroup.add(nodeGroup);

      const distance = 2.6;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;

      burstNodes.push({ nodeGroup, wire, wireMat, core, coreMat, angle, tx, ty });

      // Larger, bolder label — JSON-key style, monospace, with subtle pill bg
      const lbl = document.createElement('div');
      Object.assign(lbl.style, {
        position: 'fixed', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        fontSize: '20px', fontWeight: '500',
        color: '#9cdcfe',
        letterSpacing: '0.02em',
        opacity: '0', pointerEvents: 'none',
        textShadow: '0 0 16px rgba(78,201,255,0.7), 0 2px 6px rgba(0,0,0,0.6)',
        whiteSpace: 'nowrap',
      });
      lbl.textContent = NODE_LABELS[i];
      layer.appendChild(lbl);
      burstLabels.push(lbl);
    }

    // Fade out the curl + cursor as the burst takes over
    gsap.to(cmdLine, { opacity: 0, filter: 'blur(8px)', duration: 0.5, ease: 'sine.in' });
    gsap.to(cursor, { opacity: 0, duration: 0.4 });

    // Burst out + scale-in
    const burstTl = gsap.timeline();
    burstNodes.forEach((n, i) => {
      burstTl.to(n.nodeGroup.position, { x: n.tx, y: n.ty, duration: 1.2, ease: 'expo.out' }, 0);
      burstTl.to(n.nodeGroup.scale, { x: 1, y: 1, z: 1, duration: 0.7, ease: 'back.out(1.4)' }, 0);
      burstTl.to(n.wireMat, { opacity: 0.8, duration: 0.6 }, 0);
      // Continuous slow rotation — sells the 3D-ness
      gsap.to(n.nodeGroup.rotation, {
        x: '+=' + (Math.PI * 2),
        y: '+=' + (Math.PI * 2.4),
        duration: 14, ease: 'none', repeat: -1,
      });
      burstTl.to(burstLabels[i], { opacity: 1, duration: 0.5 }, 0.5);
    });

    // RAF: project node 3D positions into screen space for label tracking
    let labelTrackerActive = true;
    const trackLabels = () => {
      if (!labelTrackerActive) return;
      for (let i = 0; i < burstNodes.length; i++) {
        const v = burstNodes[i].nodeGroup.position.clone().project(camera);
        const sx = ((v.x + 1) / 2) * window.innerWidth;
        const sy = ((-v.y + 1) / 2) * window.innerHeight;
        const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
        const dx = sx - cx, dy = sy - cy;
        const m = Math.hypot(dx, dy) || 1;
        // Push label outward 50px past the icosahedron radius
        const ox = sx + (dx / m) * 50;
        const oy = sy + (dy / m) * 50;
        burstLabels[i].style.left = ox + 'px';
        burstLabels[i].style.top = oy + 'px';
        burstLabels[i].style.transform = 'translate(-50%, -50%)';
      }
    };
    _state.stopLabelTracker = pausableRaf(trackLabels);

    // GSAP onComplete doesn't fire reliably under headless RAF throttling
    // — use setTimeout-based wait sized to the timeline duration instead.
    await wait(1200);
    LOG('phase 4 done', elapsed());
    if (window.__debugHoldP4) await wait(30000);

    // ── Phase 5 (7.0 – 9.0s): camera dolly-back + typewriter title ──
    const phase5 = gsap.timeline();
    phase5.to(camera.position, { z: 13, duration: 1.4, ease: 'sine.inOut' }, 0);
    burstLabels.forEach((l) => phase5.to(l, { opacity: 0.4, duration: 0.9 }, 0.2));
    burstNodes.forEach((n) => {
      phase5.to(n.wireMat, { opacity: 0.35, duration: 0.9 }, 0.2);
      phase5.to(n.coreMat, { emissiveIntensity: 0.6, duration: 0.9 }, 0.2);
    });

    // Title — assembled with empty char spans, then revealed by typewriter.
    const title = document.createElement('div');
    title.className = 'ra-title';
    Object.assign(title.style, {
      opacity: '1',
    });
    title.innerHTML = `
      <div class="ra-title-main"><span class="ra-tw-line"></span></div>
      <div class="ra-title-sub" style="opacity:0;"><span class="ra-tw-sub"></span></div>`;
    layer.appendChild(title);

    const mainLine = title.querySelector('.ra-tw-line');
    const subLine  = title.querySelector('.ra-tw-sub');

    // Build the main title with REST in brand-orange span
    mainLine.innerHTML = `WPForms speaks <span style="color:${COLORS.brand}; text-shadow:0 0 22px rgba(213,78,33,0.45);">REST</span>`;
    subLine.textContent = 'Available since 1.9.9';

    const mainChars = splitChars(mainLine);
    const subChars  = splitChars(subLine);
    for (const c of mainChars) c.style.visibility = 'hidden';
    for (const c of subChars)  c.style.visibility = 'hidden';

    // Mount a typewriter caret
    const tw = document.createElement('span');
    tw.style.cssText = 'display:inline-block;width:3px;height:1.05em;background:#f5f7fa;vertical-align:-2px;margin-left:4px;animation:raCaret 1s steps(2) infinite;';
    mainLine.appendChild(tw);

    // Typewriter reveal — main line over ~0.9s
    const mainDur = 900 / Math.max(1, mainChars.length);
    for (const c of mainChars) {
      c.style.visibility = 'visible';
      await wait(mainDur);
    }
    // Subtitle — fade in container, then typewriter sub
    title.querySelector('.ra-title-sub').style.opacity = '1';
    const subDur = 700 / Math.max(1, subChars.length);
    for (const c of subChars) {
      c.style.visibility = 'visible';
      await wait(subDur);
    }
    // Remove typewriter caret
    tw.remove();

    // Phase 5 timeline = 1.4s (longest tween: camera dolly). The
    // typewriter loop above already used setTimeout-based per-char wait
    // so most of phase 5 has elapsed; small tail wait covers the camera
    // dolly remainder.
    await wait(400);
    LOG('phase 5 done', elapsed());

    // DEBUG hold
    if (window.__debugHoldCh1) await wait(30000);

    // Hold the title before exit (longer, per QC)
    await wait(2000);

    // Exit: dive-zoom — fire-and-forget gsap, setTimeout-based wait
    gsap.to(_state.layer, {
      scale: 1.06, opacity: 0, filter: 'blur(20px)',
      duration: 0.6, ease: 'power2.in',
    });
    await wait(640);
    LOG('exit done', elapsed());

    // Cleanup
    labelTrackerActive = false;
    _state.stopLabelTracker?.();
    burstLabels.forEach((l) => l.remove());
    _state.stopThreeRaf?.();
    _state.three.dispose();
    _state.atm.dispose();
    _state.layer.remove();
    _state = null;
  },
}];

function wait(ms) {
  return pausableSleep(ms);
}

// Walk the element tree, replacing each text node's chars with per-char spans.
// Returns a flat array of those spans in document order.
function splitChars(root) {
  const out = [];
  const walk = (el) => {
    const kids = Array.from(el.childNodes);
    for (const node of kids) {
      if (node.nodeType === 3) {
        const frag = document.createDocumentFragment();
        for (const ch of node.nodeValue) {
          const sp = document.createElement('span');
          // Use NBSP for spaces so display:inline-block doesn't collapse them.
          sp.textContent = ch === ' ' ? ' ' : ch;
          sp.style.display = 'inline-block';
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
