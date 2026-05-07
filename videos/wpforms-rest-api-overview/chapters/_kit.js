// videos/wpforms-rest-api-overview/chapters/_kit.js
//
// Video-local helpers for the WPForms REST API overview video. Re-exports
// shared kit primitives and adds editorial components used across chapters
// 1–6: color tokens, JetBrains Mono loader, syntax-highlighting tokenizer,
// terminal-style code card builder, jsonTree component, atmospheric layers
// (grain / gradient sweep / scale push / parallax pair), abilities
// constellation builder.
//
// Promote-at-ship-time: jsonTree, codeCard, mountAtmospherics, and the
// tokenized character-cascade are good candidates for lifting into
// videos/_shared/kit.js once a second video reuses them.

export * from '../../_shared/kit.js';
export * from '../../_shared/three-kit.js';

// ─────────────────────────────────────────────────────────────────────────
// Color tokens (brief Section 3).
// ─────────────────────────────────────────────────────────────────────────

export const COLORS = {
  bg:        '#0a0e14',
  cyan:      '#4ec9ff',
  violet:    '#b178ff',
  green:     '#46b450',
  amber:     '#f0b849',
  brand:     '#d54e21', // RESERVED — only in Ch.2 central node + Ch.6 wordmark
  cardBg:    '#0d1117',
  cardText:  '#c9d1d9',
  cardChrome:'#2f3540',
  // Code token colors
  kw:        '#c586c0',
  fn:        '#dcdcaa',
  str:       '#ce9178',
  num:       '#b5cea8',
  cmt:       '#6a9955',
  prop:      '#9cdcfe',
  // URL-segment tints (Ch.5)
  segCyan:   '#4ec9ff',
  segAmber:  '#f0b849',
  segViolet: '#b178ff',
  segNeutral:'#c9d1d9',
};

// ─────────────────────────────────────────────────────────────────────────
// Fonts — Inter + JetBrains Mono.
// ─────────────────────────────────────────────────────────────────────────

export function ensureRestApiFonts() {
  if (document.getElementById('rest-api-fonts')) return;
  const l = document.createElement('link');
  l.id = 'rest-api-fonts';
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap';
  document.head.appendChild(l);
}

// ─────────────────────────────────────────────────────────────────────────
// Global stage CSS — base body styles + shared component classes.
// Idempotent (id-keyed). Mounted by each chapter's setup().
// ─────────────────────────────────────────────────────────────────────────

export function injectStageCss() {
  if (document.getElementById('rest-api-stage-css')) return;
  const css = `
    html.rest-api-stage, body.rest-api-stage {
      background: ${COLORS.bg} !important;
      margin: 0; overflow: hidden;
    }
    .rest-api-stage .mac-frame, .rest-api-stage .mac-chrome,
    .rest-api-stage .watermark,
    .rest-api-stage .mesh-bg, .rest-api-stage .stage,
    .rest-api-stage #wpf-watermark { display: none !important; }
    /* iframe stays layout-active (opacity 0 + offscreen) so chapters
       that cloneFromIframe() get real getBoundingClientRect() values. */
    .rest-api-stage iframe.ui {
      opacity: 0 !important;
      pointer-events: none !important;
      position: fixed !important;
      left: 0 !important; top: 0 !important;
      width: 1920px !important; height: 1080px !important;
      z-index: -10 !important;
      transform: none !important;
      visibility: visible !important;
    }

    .ra-wrap {
      position: fixed; inset: 0; transform-origin: 50% 50%;
      will-change: transform; pointer-events: none;
    }

    .ra-grain {
      position: fixed; inset: 0; pointer-events: none; opacity: 0;
      mix-blend-mode: overlay; z-index: 95;
    }
    .ra-sweep {
      position: fixed; top: -20%; left: -100%; width: 200%; height: 140%;
      pointer-events: none; z-index: 90; opacity: 0;
      background: linear-gradient(115deg,
        transparent 35%,
        rgba(78,201,255,0.06) 47%,
        rgba(177,120,255,0.05) 52%,
        transparent 65%);
      transform: translateX(-50%);
    }
    .ra-parallax {
      position: fixed; inset: -10%; pointer-events: none; z-index: 88;
      opacity: 0;
    }
    .ra-parallax svg { width: 100%; height: 100%; display: block; }

    .ra-card {
      position: absolute;
      background: ${COLORS.cardBg};
      border: 1px solid ${COLORS.cardChrome};
      border-radius: 8px;
      box-shadow: 0 18px 60px rgba(0,0,0,0.55), 0 2px 0 rgba(255,255,255,0.04) inset;
      color: ${COLORS.cardText};
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 16px; line-height: 1.55;
      padding: 18px 22px;
      opacity: 0;
      will-change: transform, opacity, filter;
    }
    .ra-card .ra-card-chrome {
      display: flex; align-items: center; gap: 8px;
      margin: -8px -10px 14px;
      padding-bottom: 10px;
      border-bottom: 1px solid ${COLORS.cardChrome};
      font-size: 11px; color: #6e7681; letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .ra-card .ra-tl { width: 10px; height: 10px; border-radius: 50%; background: #3d4147; }
    .ra-card .ra-tl.r { background: #ff5f56; } .ra-card .ra-tl.y { background: #ffbd2e; } .ra-card .ra-tl.g { background: #27c93f; }
    .ra-card .ra-status-pill {
      display: inline-block; margin-left: auto;
      padding: 3px 10px; border-radius: 999px;
      background: rgba(70,180,80,0.12); color: ${COLORS.green};
      font-weight: 500; font-size: 11px; letter-spacing: 0.06em;
    }
    .ra-card pre { margin: 0; white-space: pre-wrap; font: inherit; color: inherit; }
    .ra-card .ra-shimmer {
      position: absolute; left: 0; right: 0; bottom: 0; height: 1px;
      background: linear-gradient(90deg, transparent, ${COLORS.cyan}, transparent);
      opacity: 0;
    }

    .ra-tok-kw   { color: ${COLORS.kw}; }
    .ra-tok-fn   { color: ${COLORS.fn}; }
    .ra-tok-str  { color: ${COLORS.str}; }
    .ra-tok-num  { color: ${COLORS.num}; }
    .ra-tok-cmt  { color: ${COLORS.cmt}; font-style: italic; }
    .ra-tok-prop { color: ${COLORS.prop}; }
    .ra-tok-brand { color: ${COLORS.brand}; font-weight: 600; text-shadow: 0 0 14px rgba(213,78,33,0.45); }
    .ra-tok-route { color: #ffd866; font-weight: 600; text-shadow: 0 0 14px rgba(255,216,102,0.42); }
    .ra-tok-flag { color: ${COLORS.amber}; font-weight: 500; }
    .ra-tok-cred { color: ${COLORS.violet}; }
    .ra-tok-bracket { color: ${COLORS.cyan}; }
    .ra-tok-cyan { color: ${COLORS.segCyan}; }
    .ra-tok-amber { color: ${COLORS.segAmber}; }
    .ra-tok-violet { color: ${COLORS.segViolet}; }
    .ra-tok-neutral { color: ${COLORS.segNeutral}; }
    .ra-shim { animation: raShim 900ms ease-out 1; }
    @keyframes raShim {
      0%   { background: rgba(78,201,255,0); border-radius: 2px; }
      40%  { background: rgba(78,201,255,0.35); }
      100% { background: rgba(78,201,255,0); }
    }

    .ra-title {
      position: fixed; left: 50%; top: 50%;
      transform: translate(-50%, -50%);
      font-family: 'Inter', system-ui, sans-serif;
      color: #f5f7fa; text-align: center;
      letter-spacing: 0.005em;
      pointer-events: none; opacity: 0;
    }
    .ra-title .ra-title-main { font-size: 64px; font-weight: 700; line-height: 1.05; }
    .ra-title .ra-title-sub  { font-size: 18px; font-weight: 500; opacity: 0.62; margin-top: 14px; letter-spacing: 0.18em; text-transform: uppercase; }

    .ra-pill {
      position: absolute;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 13px; color: ${COLORS.cardText};
      background: rgba(13,17,23,0.82);
      border: 1px solid ${COLORS.cardChrome};
      backdrop-filter: blur(4px);
      padding: 8px 14px; border-radius: 999px;
      opacity: 0; white-space: nowrap;
    }
    .ra-pill.amber {
      border-color: rgba(240,184,73,0.55);
      box-shadow: 0 0 24px rgba(240,184,73,0.2);
    }

    .ra-label {
      position: absolute;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 13px; color: rgba(245,247,250,0.78);
      letter-spacing: 0.06em; opacity: 0; pointer-events: none;
    }

    .ra-cmd-line {
      position: fixed; left: 50%; top: 50%;
      transform: translate(-50%, -50%);
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 22px; color: ${COLORS.cardText};
      white-space: pre; pointer-events: none;
      text-shadow: 0 0 30px rgba(78,201,255,0.18);
    }
    .ra-cmd-caret {
      display: inline-block; width: 10px; height: 22px;
      background: ${COLORS.cyan}; vertical-align: -3px;
      margin-left: 2px; opacity: 0.85;
      animation: raCaret 1s steps(2) infinite;
    }
    @keyframes raCaret { 50% { opacity: 0; } }

    .ra-wordmark {
      position: fixed; left: 50%; top: 50%;
      transform: translate(-50%, -50%);
      font-family: 'Inter', system-ui, sans-serif;
      font-weight: 800; letter-spacing: -0.02em;
      color: ${COLORS.brand}; font-size: 76px; opacity: 0;
      text-shadow: 0 0 38px rgba(213,78,33,0.25);
    }
    .ra-cta-url {
      position: fixed; left: 50%;
      transform: translate(-50%, 0);
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 15px; color: rgba(245,247,250,0.72);
      opacity: 0;
    }
  `;
  const s = document.createElement('style');
  s.id = 'rest-api-stage-css';
  s.textContent = css;
  document.head.appendChild(s);
  document.body.classList.add('rest-api-stage');
  document.documentElement.classList.add('rest-api-stage');
}

// ─────────────────────────────────────────────────────────────────────────
// Atmospherics — grain canvas, gradient sweep, scale-push wrapper, parallax
// pair. Mounted by setup(); fade in via gsap inside effect().
// Returns { wrap, grain, sweep, parallax, dispose }.
// ─────────────────────────────────────────────────────────────────────────

export function mountAtmospherics({ parallax = false } = {}) {
  let wrap = document.querySelector('.ra-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'ra-wrap';
    document.body.appendChild(wrap);
  }

  // Grain canvas — Mulberry32-seeded ~30 horizontal lines, baked once.
  const grain = document.createElement('canvas');
  grain.className = 'ra-grain';
  grain.width = 1920; grain.height = 1080;
  paintGrain(grain);

  const sweep = document.createElement('div');
  sweep.className = 'ra-sweep';

  let parallaxEl = null;
  if (parallax) {
    parallaxEl = document.createElement('div');
    parallaxEl.className = 'ra-parallax';
    parallaxEl.innerHTML = parallaxSvg();
  }

  document.body.appendChild(grain);
  document.body.appendChild(sweep);
  if (parallaxEl) document.body.appendChild(parallaxEl);

  return {
    wrap, grain, sweep, parallax: parallaxEl,
    dispose: () => {
      grain.remove(); sweep.remove();
      if (parallaxEl) parallaxEl.remove();
    },
  };
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6D2B79F5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function paintGrain(canvas) {
  const ctx = canvas.getContext('2d');
  const rand = mulberry32(0xC0FFEE);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Speckle (~30 lines worth of noise) — fine scattered dots
  const dots = 4200;
  for (let i = 0; i < dots; i++) {
    const x = (rand() * canvas.width) | 0;
    const y = (rand() * canvas.height) | 0;
    const a = 0.18 + rand() * 0.45;
    ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
    ctx.fillRect(x, y, 1, 1);
  }
}

function parallaxSvg() {
  return `
    <svg class="ra-parallax-a" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice"
         style="position:absolute;inset:0;opacity:.55">
      ${gridLines(1920, 1080, 80, 'rgba(78,201,255,0.07)')}
    </svg>
    <svg class="ra-parallax-b" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice"
         style="position:absolute;inset:0;opacity:.45">
      ${gridLines(1920, 1080, 120, 'rgba(177,120,255,0.05)')}
    </svg>`;
}

function gridLines(w, h, spacing, color) {
  let s = '';
  for (let y = 0; y <= h; y += spacing) {
    s += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="${color}" stroke-width="1"/>`;
  }
  return s;
}

// Drives ambient atmospherics: fades in grain, runs sweep, scale-push.
// Caller passes their gsap. Resolves immediately; tweens run in background
// for `durationSeconds`. Pass `parallax: true` to also drift the parallax pair.
export function runAtmospherics(gsap, atm, durationSeconds, { parallax = false } = {}) {
  gsap.to(atm.grain, { opacity: 0.03, duration: 0.8, ease: 'sine.inOut' });
  gsap.fromTo(atm.sweep,
    { opacity: 0.0, x: '-50%' },
    { opacity: 0.7, x: '50%', duration: durationSeconds, ease: 'sine.inOut' });
  gsap.fromTo(atm.wrap,
    { scale: 1.0 },
    { scale: 1.012, duration: durationSeconds, ease: 'sine.inOut' });
  if (parallax && atm.parallax) {
    gsap.to(atm.parallax, { opacity: 1, duration: 0.8 });
    const a = atm.parallax.querySelector('.ra-parallax-a');
    const b = atm.parallax.querySelector('.ra-parallax-b');
    if (a) gsap.to(a, { x: 80, duration: durationSeconds, ease: 'sine.inOut', repeat: -1, yoyo: true });
    if (b) gsap.to(b, { x: -120, duration: durationSeconds * 1.1, ease: 'sine.inOut', repeat: -1, yoyo: true });
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Tokenized inline-HTML builder — turns a code string into an HTML span
// soup with classed tokens, then `splitText()` (from kit.js) walks it for
// per-char animation. Each token is a regex-driven rough syntax pass.
// Good enough for the small set of curl/JSON snippets we render. NOT a
// general syntax highlighter.
// ─────────────────────────────────────────────────────────────────────────

const HTML_ESC = (s) => s
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// Build classed-span HTML for a curl request line. Recognizes:
//   `curl`, `-u`, `-X`, `"USERNAME:APP_PASSWORD"`, `$WP_SITE`, URL,
//   bracketed input keys, percent-encoded brackets (%5B %5D),
//   query strings, etc.
export function highlightCurl(src, _opts = {}) {
  // Minimal palette: only `wpforms` and the endpoint slug get color.
  // Everything else (curl, flags, $WP_SITE, %5B/%5D, query params) stays
  // neutral so the eye locks onto the route.
  const escaped = HTML_ESC(src);
  let out = escaped;
  out = out.replace(/\bwpforms\b/g, '<span class="ra-tok-brand">wpforms</span>');
  out = out.replace(
    /\b(list-forms|get-form-stats|get-form|get-entry-summaries|get-entry|search-entries)\b/g,
    '<span class="ra-tok-route">$1</span>'
  );
  return out;
}

// Build classed-span HTML for a JSON pretty-print.
export function highlightJson(obj, indent = 2) {
  const json = JSON.stringify(obj, null, indent);
  const escaped = HTML_ESC(json);
  return escaped
    .replace(/(&quot;[^&]+?&quot;)(\s*:)/g, '<span class="ra-tok-prop">$1</span>$2')
    .replace(/:\s*(&quot;[^&]*?&quot;)/g, ': <span class="ra-tok-str">$1</span>')
    .replace(/:\s*(true|false|null)/g, ': <span class="ra-tok-kw">$1</span>')
    .replace(/:\s*(-?\d+(\.\d+)?)/g, ': <span class="ra-tok-num">$1</span>');
}

// ─────────────────────────────────────────────────────────────────────────
// Code card — a terminal-style card with chrome + content area. Returns
// the card element; caller positions it with absolute coordinates.
// ─────────────────────────────────────────────────────────────────────────

export function codeCard({
  parent, label = 'request', x, y, width = 720, height = 'auto',
  status = null,
  contentHtml = '',
}) {
  const card = document.createElement('div');
  card.className = 'ra-card';
  Object.assign(card.style, {
    left: x + 'px', top: y + 'px',
    width: width + 'px',
    height: height === 'auto' ? 'auto' : height + 'px',
  });
  card.innerHTML = `
    <div class="ra-card-chrome">
      <span class="ra-tl r"></span><span class="ra-tl y"></span><span class="ra-tl g"></span>
      <span style="margin-left:8px">${label}</span>
      ${status ? `<span class="ra-status-pill">${status}</span>` : ''}
    </div>
    <pre class="ra-card-body">${contentHtml}</pre>
    <div class="ra-shimmer"></div>
  `;
  parent.appendChild(card);
  return card;
}

// ─────────────────────────────────────────────────────────────────────────
// jsonTree — DOM element with a syntax-highlighted JSON tree. Convenience
// wrapper around highlightJson; returns an element ready to insert into a
// codeCard's body.
// ─────────────────────────────────────────────────────────────────────────

export function jsonTree(data, { indent = 2 } = {}) {
  const pre = document.createElement('pre');
  pre.className = 'ra-card-body';
  pre.innerHTML = highlightJson(data, indent);
  return pre;
}

// ─────────────────────────────────────────────────────────────────────────
// Character-cascade typer for code cards. Walks element-tree and reveals
// chars one at a time via gsap. Skips already-tokenized spans' classes.
// Returns when last char is shown. Caller may pass `onChar` for SFX.
// ─────────────────────────────────────────────────────────────────────────

export async function typeCascade(gsap, hostEl, { stagger = 0.028, onChar = null } = {}) {
  // Walk all text nodes, wrap each char in a span, then animate sequentially.
  const chars = [];
  const walker = document.createTreeWalker(hostEl, NodeFilter.SHOW_TEXT);
  const texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  for (const t of texts) {
    const frag = document.createDocumentFragment();
    for (const ch of t.nodeValue) {
      const sp = document.createElement('span');
      sp.style.opacity = '0';
      sp.textContent = ch;
      frag.appendChild(sp);
      chars.push(sp);
    }
    t.parentNode.replaceChild(frag, t);
  }
  await new Promise((resolve) => {
    let i = 0;
    const tick = () => {
      if (i >= chars.length) return resolve();
      chars[i].style.opacity = '1';
      if (onChar && chars[i].textContent.trim()) onChar();
      i++;
      pausableSleep(stagger * 1000).then(tick);
    };
    tick();
  });
  return chars;
}

// ─────────────────────────────────────────────────────────────────────────
// Click ripple at screen coords — local color override (cyan) for the
// cinematic dark canvas. Wraps shared kit's clickRipple with a default.
// ─────────────────────────────────────────────────────────────────────────

import { clickRipple as _clickRipple, mountSceneCursor } from '../../_shared/kit.js';

export function cyanRipple(layer, x, y, gsap) {
  _clickRipple(layer, x, y, gsap, 'rgba(78,201,255,0.7)');
}

// Move a scene-cursor to (x,y) over `dur` seconds via gsap. Cursor is the
// element returned from mountSceneCursor.
export function moveCursor(gsap, cursorEl, x, y, dur = 0.6, ease = 'sine.inOut') {
  return gsap.to(cursorEl, {
    x, y, duration: dur, ease,
    onUpdate: function () {
      const tx = gsap.getProperty(cursorEl, 'x');
      const ty = gsap.getProperty(cursorEl, 'y');
      cursorEl.style.transform = `translate(${tx}px, ${ty}px)`;
    },
  });
}

export { mountSceneCursor };

// ─────────────────────────────────────────────────────────────────────────
// 6 ability route paths — used by Ch.2 + Ch.6 constellation.
// ─────────────────────────────────────────────────────────────────────────

export const ABILITIES = [
  'wpforms/list-forms',
  'wpforms/get-form',
  'wpforms/get-form-stats',
  'wpforms/get-entry-summaries',
  'wpforms/get-entry',
  'wpforms/search-entries',
];

// ─────────────────────────────────────────────────────────────────────────
// 6-ability hex constellation — shared by Ch.3/4/5 for continuity bookends.
// Each API chapter starts with the full hex visible (matching Ch.2's
// surface map), then non-target crystals fade out leaving the target at
// top. At chapter exit, the hex re-forms before the dive-zoom out.
//
// The hex is "rotated" so the target crystal always lands at top-center
// (world y = +radius). offsetIdx = (i - targetIdx + 6) % 6 means the
// target gets offsetIdx = 0 → angle PI/2 → top.
// ─────────────────────────────────────────────────────────────────────────

export function mountAbilityHex(scene, gsap, THREE, {
  targetIdx = 0,
  radius = 2.4,
  icoRadius = 0.32,
  coreRadius = 0.13,
  rotateSpeed = 16,
} = {}) {
  const abilities = [];
  for (let i = 0; i < 6; i++) {
    const offsetIdx = (i - targetIdx + 6) % 6;
    const angle = (Math.PI * 2 * offsetIdx) / 6 + Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    const group = new THREE.Group();
    // Wire: transparent, depthWrite off so it doesn't occlude the core
    // sphere behind it (transparent-material render order quirk).
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x4ec9ff, transparent: true, opacity: 0,
      depthWrite: false,
    });
    const wireMesh = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(icoRadius, 0)),
      wireMat
    );
    wireMesh.renderOrder = 2; // wire on top
    group.add(wireMesh);
    // Core: opaque MeshStandardMaterial — bright emissive cyan + white
    // diffuse. Visibility is driven by `coreMesh.scale` (NOT opacity)
    // so no transparent-blending or render-order quirks can hide it.
    // Initial scale = 0 → invisible; helpers tween scale to 1 to reveal.
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, emissive: 0x4ec9ff, emissiveIntensity: 2.2,
      roughness: 0.3, metalness: 0.7,
    });
    const coreMesh = new THREE.Mesh(new THREE.SphereGeometry(coreRadius, 24, 24), coreMat);
    coreMesh.scale.setScalar(0);
    coreMesh.renderOrder = 1;
    group.add(coreMesh);

    group.position.set(x, y, 0);
    group.rotation.x = Math.random() * Math.PI;
    group.rotation.y = Math.random() * Math.PI;
    scene.add(group);

    gsap.to(group.rotation, {
      x: '+=' + (Math.PI * 2),
      y: '+=' + (Math.PI * 2.4),
      duration: rotateSpeed, ease: 'none', repeat: -1,
    });

    abilities.push({ group, wireMat, coreMat, coreMesh, x, y, idx: i });
  }
  return { abilities, targetCrystal: abilities[targetIdx] };
}

// Phase A — full hex appears, all 6 crystals fade in with random staggers.
export async function revealHex(gsap, abilities, { duration = 0.6 } = {}) {
  for (const a of abilities) {
    const at = Math.random() * 0.3;
    gsap.to(a.wireMat, { opacity: 0.7, duration, delay: at });
    gsap.to(a.coreMat, { emissiveIntensity: 1.4, duration, delay: at });
  }
  await pausableSleep((duration + 0.45) * 1000);
}

// Phase B — non-target crystals fade out + scale to 0; target brightens.
export async function focusTarget(gsap, abilities, targetCrystal, { duration = 0.55 } = {}) {
  for (const a of abilities) {
    if (a.idx === targetCrystal.idx) continue;
    gsap.to(a.wireMat, { opacity: 0, duration });
    gsap.to(a.coreMat, { emissiveIntensity: 0, duration });
    gsap.to(a.group.scale, { x: 0.001, y: 0.001, z: 0.001, duration });
  }
  gsap.to(targetCrystal.wireMat, { opacity: 0.9, duration });
  gsap.to(targetCrystal.coreMat, { emissiveIntensity: 1.9, duration });
  await pausableSleep((duration + 0.1) * 1000);
}

// Phase Z — non-target crystals reappear, hex re-forms before chapter exit.
export async function reformHex(gsap, abilities, targetCrystal, { duration = 0.7 } = {}) {
  for (const a of abilities) {
    if (a.idx === targetCrystal.idx) continue;
    gsap.to(a.group.scale, { x: 1, y: 1, z: 1, duration });
    gsap.to(a.wireMat, { opacity: 0.7, duration });
    gsap.to(a.coreMat, { emissiveIntensity: 1.4, duration });
  }
  await pausableSleep((duration + 0.4) * 1000);
}

// ─────────────────────────────────────────────────────────────────────────
// Shared persistent three.js scene + hex constellation.
//
// Whiteboard model: hex lives at world origin, all 6 crystals at fixed
// world positions. Each chapter pans the camera to its target crystal,
// runs its content, and pans back to overview before the next chapter
// pans to the next crystal. The scene is mounted ONCE (by Ch.2) and
// disposed ONCE (by Ch.6). Eliminates the canvas-blink at chapter seams.
//
// Singleton on window.__raShared. Shape:
//   { three, gsap, abilities, allCrystals (alias) }
// ─────────────────────────────────────────────────────────────────────────

import { loadGsap, pausableRaf, pausableSleep } from '../../_shared/kit.js';
import { mountThreeScene as _mountThreeScene } from '../../_shared/three-kit.js';
import { getSharedScene as _runtimeSharedScene, disposeSharedScene as _runtimeDisposeSharedScene } from '../../../runtime/shared-scene.js';

let _sharedPromise = null;
let _sharedCurrent = null;

// initialFocusIdx: which crystal the camera starts focused on (0 = list-forms).
// allRevealed: if true, all 6 crystals start at full opacity. If false, they
// start at 0 and the caller animates them in (matches Ch.2's reveal arc).
export async function getSharedScene({
  initialFocusIdx = 0,
  allRevealed = false,
} = {}) {
  if (_sharedCurrent) return _sharedCurrent;
  if (_sharedPromise) return _sharedPromise;

  _sharedPromise = _runtimeSharedScene({
    id: 'wpforms-rest-api-overview:abilities',
    mount: async () => {
    // Mount at z=60 — BELOW per-chapter layers (z=70 three, z=80 DOM).
    // Stays alive across all chapter mount/dispose cycles.
    //
    // Camera convention: position is set to (crystal.x, crystal.y, 3.5)
    // when focusing — looking straight forward (default -Z). That puts
    // the focused crystal dead-center on screen. Makes inter-chapter
    // seams seamless: the previous chapter's last frame and the next
    // chapter's first frame both have the focused crystal at screen
    // center, so the cross-fade is invisible.
    const focusCrystal = _getCrystalWorldPos(initialFocusIdx);
    const three = await _mountThreeScene('ra-shared-three', {
      z: 60, cameraZ: 3.5,
    });
    three.camera.position.set(focusCrystal.x, focusCrystal.y, 3.5);
    const stopThreeRaf = pausableRaf(() => {
      three.renderer.render(three.scene, three.camera);
    });
    const disposeThree = three.dispose;
    three.dispose = () => {
      stopThreeRaf();
      disposeThree();
    };

    const gsap = await loadGsap({ flip: false, motionPath: false });

    // Lighting (once)
    const rim = new three.THREE.PointLight(0x4ec9ff, 1.0, 16);
    rim.position.set(0, 0, 4);
    three.scene.add(rim);
    const fill = new three.THREE.PointLight(0xffffff, 0.4, 14);
    fill.position.set(-3, 2, 2);
    three.scene.add(fill);

    // Mount the 6-ability hex. targetIdx places list-forms (idx 0) at top.
    const { abilities } = mountAbilityHex(three.scene, gsap, three.THREE, {
      targetIdx: 0, radius: 2.4, icoRadius: 0.32,
    });

    // Set initial visibility: focused crystal visible, others hidden,
    // unless allRevealed=true.
    if (allRevealed) {
      for (const a of abilities) {
        a.wireMat.opacity = 0.7;
        a.coreMesh.scale.setScalar(1);
        a.group.visible = true;
      }
    } else {
      const focus = abilities[initialFocusIdx];
      focus.wireMat.opacity = 0.9;
      focus.coreMesh.scale.setScalar(1);
      focus.group.visible = true;
      for (const a of abilities) {
        if (a.idx === initialFocusIdx) continue;
        a.wireMat.opacity = 0;
        a.coreMesh.scale.setScalar(0);
        a.group.scale.setScalar(0.001);
        a.group.visible = false;
      }
    }

    _sharedCurrent = {
      three, gsap, abilities,
      allCrystals: abilities,
    };
    return _sharedCurrent;
    },
  });
  return _sharedPromise;
}

// Pure helper — what world (x,y) does a crystal at index `idx` sit at,
// when the hex was mounted with targetIdx=0? Mirrors mountAbilityHex math.
function _getCrystalWorldPos(idx, radius = 2.4) {
  const angle = (Math.PI * 2 * idx) / 6 + Math.PI / 2;
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
}

// Camera move to focus on a specific crystal (close-up, centered).
// Camera position = (crystal.x, crystal.y, 3.5) — looking straight
// forward, crystal lands at screen center. Fire-and-forget gsap tween
// + setTimeout-based await (headless preview RAF throttling can swallow
// gsap onComplete callbacks).
export function panToCrystal(crystal, { duration = 1.2, ease = 'expo.inOut' } = {}) {
  const shared = _sharedCurrent;
  if (!shared) return Promise.resolve();
  shared.gsap.to(shared.three.camera.position, {
    x: crystal.x, y: crystal.y, z: 3.5,
    duration, ease,
  });
  return pausableSleep(duration * 1000);
}

// Camera move to overview pose (full hex centered at z=7).
export function panToOverview({ duration = 1.2, ease = 'expo.inOut' } = {}) {
  const shared = _sharedCurrent;
  if (!shared) return Promise.resolve();
  shared.gsap.to(shared.three.camera.position, {
    x: 0, y: 0, z: 7,
    duration, ease,
  });
  return pausableSleep(duration * 1000);
}

// Camera move to "station" pose for chapter content — crystal lifted
// to the upper area of the frame; camera pulled back so DOM cards have
// room in the bottom 60% of the screen.
export function panToStation(crystal, { duration = 1.0, ease = 'expo.inOut' } = {}) {
  const shared = _sharedCurrent;
  if (!shared) return Promise.resolve();
  shared.gsap.to(shared.three.camera.position, {
    x: crystal.x * 0.7,
    y: crystal.y - 1.8,
    z: 6.5,
    duration, ease,
  });
  return pausableSleep(duration * 1000);
}

// Hide ALL crystals on the shared scene. Used after panToStation so
// chapter content (cards, forms, particles) gets a clean frame without
// a tiny lingering crystal in the corner. revealSharedHex at chapter
// end restores them.
export async function hideAllCrystals({ duration = 0.4 } = {}) {
  const shared = _sharedCurrent;
  if (!shared) return;
  const { gsap, abilities } = shared;
  // Synchronously zero the core scale so it's gone IMMEDIATELY (no tween
  // race). Wire opacity still fades smoothly.
  for (const a of abilities) {
    a.coreMesh.scale.setScalar(0);
    gsap.to(a.wireMat, { opacity: 0, duration });
  }
  await pausableSleep(duration * 1000);
  for (const a of abilities) a.group.visible = false;
}

// Reveal hex crystals on the SHARED scene (animated). Used by ch3/4/5
// when returning from chapter content to the full hex view. Skips
// already-visible crystals.
export async function revealSharedHex({ duration = 0.6 } = {}) {
  const shared = _sharedCurrent;
  if (!shared) return;
  const { gsap, abilities } = shared;
  for (const a of abilities) {
    a.group.visible = true;
    a.coreMesh.scale.setScalar(1); // synchronous — guaranteed visible immediately
    const at = Math.random() * 0.25;
    gsap.to(a.group.scale, { x: 1, y: 1, z: 1, duration, delay: at });
    gsap.to(a.wireMat, { opacity: 0.7, duration, delay: at });
  }
  await pausableSleep((duration + 0.3) * 1000);
}

export async function focusSharedCrystal(crystal, { duration = 0.55 } = {}) {
  const shared = _sharedCurrent;
  if (!shared) return;
  const { gsap, abilities } = shared;
  for (const a of abilities) {
    a.group.visible = true;
    if (a.idx === crystal.idx) {
      a.coreMesh.scale.setScalar(1); // synchronous — target core visible NOW
      gsap.to(a.wireMat, { opacity: 0.9, duration });
    } else {
      a.coreMesh.scale.setScalar(0); // synchronous hide — non-targets gone
      gsap.to(a.wireMat, { opacity: 0, duration });
      gsap.to(a.group.scale, { x: 0.001, y: 0.001, z: 0.001, duration });
    }
  }
  await pausableSleep((duration + 0.1) * 1000);
  for (const a of abilities) {
    a.group.visible = (a.idx === crystal.idx);
  }
}

export async function disposeSharedScene() {
  if (!_sharedCurrent) return;
  await _runtimeDisposeSharedScene('wpforms-rest-api-overview:abilities');
  _sharedCurrent = null;
  _sharedPromise = null;
}
