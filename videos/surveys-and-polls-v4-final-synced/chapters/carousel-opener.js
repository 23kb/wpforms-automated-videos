// v4 Beat 1 — CAROUSEL OPENER (true side-by-side, announcement-grade).
//
// Direction:
//   NOT v2's depth composition (old foregrounded, new blurred/tucked). This
//   is a premium comparison stage: OLD on the left, NEW on the right, both
//   equal visual weight, both legible, both scrolling together. One muted
//   editorial line below so the beat reads as "same responses, new clarity"
//   without being instructional.
//
//   The carousel is the thesis. It is *not* the reveal — the hero-transform
//   chapter is. So this beat is deliberately restrained:
//     - no depth, no tilt-into-wings
//     - no shine, no flourish
//     - equal opacity, equal saturation, minimal 2° inward tilt
//     - synchronized scroll, ~45% of the way down the body in 3.4s
//     - one caption, fades in under the panels, fades out before handoff
//
// Handoff into the OLD reporting surface (beat 2):
//   NEW panel lifts away to the right (and fades). OLD panel scales up,
//   centers, its border/shadow dissolve, its scroll rewinds to top. Once
//   it's matching the stage iframe's framing, the overlay crossfades into
//   the real stage iframe (which was pre-loaded with sp-results-old-168
//   by the player). No cover, no reload, no cream. A shot dissolve.

export const snapshot = 'sp-results-old-168';
export const mode = 'parallel';

const OLD_SRC = '/snapshots/sp-results-old-168/index.html';
const NEW_SRC = '/snapshots/sp-results-new-418-base/index.html';

const STYLE = `
.v4-co-root {
  position: fixed; inset: 0; z-index: 710; overflow: hidden;
  background:
    radial-gradient(70% 55% at 50% 35%, rgba(255,255,255,0.55), transparent 75%),
    linear-gradient(180deg, #EEF3F9 0%, #E2EAF3 100%);
  font-family: 'Inter', -apple-system, 'Segoe UI', sans-serif;
  opacity: 1; transition: opacity 520ms ease;
  --co-panel-w: 46vw;
}
.v4-co-root.out { opacity: 0; }

.v4-co-stage {
  position: relative; width: 100vw; height: 100vh;
  display: flex; align-items: center; justify-content: center;
  gap: 3.2vw;
}

/* Panel height locked to iframe aspect ratio (1440:900) so the full card
   is filled edge-to-edge — no trailing white space below the rendered
   report content. */
.v4-co-panel {
  position: relative;
  width: var(--co-panel-w);
  aspect-ratio: 1440 / 900;
  max-width: 780px;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(20,22,28,0.06),
    0 24px 48px -18px rgba(20,22,28,0.18),
    0 8px 20px -10px rgba(20,22,28,0.10);
  opacity: 0;
  transform: translateY(14px) scale(0.985);
  transition:
    opacity 640ms cubic-bezier(.3,0,.2,1),
    transform 780ms cubic-bezier(.3,0,.2,1);
  will-change: transform, opacity;
}
.v4-co-root.in .v4-co-panel { opacity: 1; transform: translateY(0) scale(1); }

/* Tiny inward tilt only — keeps both readable, avoids "depth" composition. */
.v4-co-root.in .v4-co-panel.old { transform: translateY(0) rotateY(1.4deg); }
.v4-co-root.in .v4-co-panel.new { transform: translateY(0) rotateY(-1.4deg); }

.v4-co-label {
  position: absolute; top: 14px; left: 18px;
  font-size: 10.5px; font-weight: 600;
  letter-spacing: 0.22em; text-transform: uppercase;
  color: rgba(42,50,64,0.72);
  padding: 4px 9px;
  border-radius: 999px;
  background: rgba(247,251,254,0.92);
  backdrop-filter: blur(6px);
  z-index: 4;
  opacity: 0;
  transition: opacity 520ms ease 240ms;
}
.v4-co-root.in .v4-co-label { opacity: 1; }
.v4-co-label.new {
  color: #E27730;
  background: rgba(255,240,228,0.96);
}

.v4-co-iframe {
  position: absolute; top: 0; left: 0;
  width: 1440px; height: 900px; border: 0; background: #fff;
  transform-origin: top left;
  pointer-events: none;
}

/* Subtle divider between the two panels — a hairline orange rule that reads
   as "comparison stage" without adding depth. Fades in with the panels. */
.v4-co-divider {
  position: absolute;
  top: 18vh; bottom: 18vh;
  left: 50%; transform: translateX(-50%);
  width: 1px;
  background: linear-gradient(180deg,
    rgba(226,119,48,0.00) 0%,
    rgba(226,119,48,0.45) 30%,
    rgba(226,119,48,0.45) 70%,
    rgba(226,119,48,0.00) 100%);
  opacity: 0;
  transition: opacity 600ms ease 200ms;
}
.v4-co-root.in .v4-co-divider { opacity: 1; }

.v4-co-caption {
  position: absolute;
  left: 50%; bottom: 7vh;
  transform: translateX(-50%) translateY(6px);
  font-family: 'Instrument Serif', Georgia, serif;
  font-weight: 400;
  font-size: 26px;
  letter-spacing: -0.005em;
  color: #2A3240;
  opacity: 0;
  transition:
    opacity 520ms cubic-bezier(.3,0,.2,1) 620ms,
    transform 520ms cubic-bezier(.3,0,.2,1) 620ms;
}
.v4-co-root.in .v4-co-caption {
  opacity: 1; transform: translateX(-50%) translateY(0);
}
.v4-co-caption.out {
  opacity: 0;
  transform: translateX(-50%) translateY(-6px);
  transition:
    opacity 360ms ease,
    transform 360ms ease;
}

/* ── Handoff: NEW lifts/fades right, OLD scales up into stage frame ──── */
.v4-co-root.handoff .v4-co-panel.new {
  opacity: 0;
  transform: translate(18vw, 0) rotateY(-4deg) scale(0.94);
  transition:
    opacity 720ms cubic-bezier(.4,0,.2,1),
    transform 820ms cubic-bezier(.4,0,.2,1);
}
.v4-co-root.handoff .v4-co-panel.old {
  /* Grow to occupy the stage rect center. Shadow eases off so the final
     crossfade into the real iframe is seamless. */
  transform: rotateY(0deg) scale(1.04);
  box-shadow:
    0 0 0 1px rgba(20,22,28,0.0),
    0 0 0 0 rgba(20,22,28,0.0),
    0 0 0 0 rgba(20,22,28,0.0);
  transition:
    transform 820ms cubic-bezier(.3,0,.2,1),
    box-shadow 720ms ease;
}
.v4-co-root.handoff .v4-co-divider,
.v4-co-root.handoff .v4-co-label {
  opacity: 0;
  transition: opacity 340ms ease;
}
`;

const sleep = ms => new Promise(r => setTimeout(r, ms));

function ensureStyles() {
  if (document.getElementById('v4-co-style')) return;
  const s = document.createElement('style');
  s.id = 'v4-co-style';
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

function fitIframe(panelEl, iframeEl) {
  const r = panelEl.getBoundingClientRect();
  const s = r.width / 1440;
  iframeEl.style.transform = `scale(${s})`;
}

function waitIframe(iframe) {
  return new Promise(resolve => {
    const finish = () => {
      const doc = iframe.contentDocument;
      if (doc) doc.getElementById('wpadminbar')?.remove();
      requestAnimationFrame(() => resolve(doc));
    };
    if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') finish();
    else iframe.addEventListener('load', finish, { once: true });
  });
}

function animateScroll(win, from, to, durationMs) {
  return new Promise(resolve => {
    const t0 = performance.now();
    function tick(t) {
      const p = Math.min(1, (t - t0) / durationMs);
      const e = p < 0.5 ? 4*p*p*p : 1 - Math.pow(-2*p + 2, 3) / 2;
      try { win.scrollTo(0, from + (to - from) * e); } catch {}
      if (p < 1) requestAnimationFrame(tick);
      else resolve();
    }
    requestAnimationFrame(tick);
  });
}

export default [
  {
    id: 'carousel-opener', chapter: 'carousel-opener',
    duration: 0.2,
    effect: async ({ zoomTo }) => {
      ensureStyles();
      ensureFonts();

      // The player has pre-loaded sp-results-old-168 into the stage iframe.
      // We mount our own side-by-side overlay above it at z:710. The stage
      // iframe keeps ticking underneath — it's what we'll crossfade into.
      const root = document.createElement('div');
      root.className = 'v4-co-root';
      root.innerHTML = `
        <div class="v4-co-stage">
          <div class="v4-co-panel old">
            <div class="v4-co-label">Before</div>
            <iframe class="v4-co-iframe" src="${OLD_SRC}" loading="eager"></iframe>
          </div>
          <div class="v4-co-divider"></div>
          <div class="v4-co-panel new">
            <div class="v4-co-label new">Now</div>
            <iframe class="v4-co-iframe" src="${NEW_SRC}" loading="eager"></iframe>
          </div>
          <div class="v4-co-caption">Same responses. New clarity.</div>
        </div>
      `;
      document.body.appendChild(root);

      const oldPanel = root.querySelector('.v4-co-panel.old');
      const newPanel = root.querySelector('.v4-co-panel.new');
      const oldIfr   = oldPanel.querySelector('iframe');
      const newIfr   = newPanel.querySelector('iframe');
      const caption  = root.querySelector('.v4-co-caption');

      const [oldDoc, newDoc] = await Promise.all([waitIframe(oldIfr), waitIframe(newIfr)]);
      fitIframe(oldPanel, oldIfr);
      fitIframe(newPanel, newIfr);

      const ro = new ResizeObserver(entries => {
        for (const e of entries) {
          if (e.target === oldPanel) fitIframe(oldPanel, oldIfr);
          if (e.target === newPanel) fitIframe(newPanel, newIfr);
        }
      });
      ro.observe(oldPanel);
      ro.observe(newPanel);

      // ═════ FADE IN (≈ 0.8s) ═════
      await sleep(40);
      root.classList.add('in');
      await sleep(820);

      // ═════ SYNCHRONIZED SCROLL (≈ 3.4s) ═════
      // Both panels scroll together, ~45% of the page. Slow enough to read
      // the comparison, restrained enough to not overshadow the transformation.
      const oldWin = oldIfr.contentWindow;
      const newWin = newIfr.contentWindow;
      const oldEnd = Math.max(0, (oldDoc?.documentElement.scrollHeight || 1800) - 900);
      const newEnd = Math.max(0, (newDoc?.documentElement.scrollHeight || 1800) - 900);

      await Promise.all([
        animateScroll(oldWin, 0, oldEnd * 0.45, 3400),
        animateScroll(newWin, 0, newEnd * 0.45, 3400),
      ]);

      // Brief settle.
      await sleep(380);

      // ═════ HANDOFF (≈ 1.4s) ═════
      // Caption exits. Old panel rewinds to top (matches the stage iframe's
      // framing behind us). New panel exits right and fades.
      caption.classList.add('out');

      // Rewind the OLD iframe to top — the stage iframe underneath is at 0,
      // so the crossfade lands at a matching scroll position.
      animateScroll(oldWin, oldEnd * 0.45, 0, 720);

      root.classList.add('handoff');

      // While the overlay is still opaque, frame the stage iframe on the
      // hero card (field 11) so when we crossfade the hero-transform beat
      // picks up already zoomed in.
      setTimeout(() => {
        zoomTo(['#wpforms-survey-report .question:has(.actions[data-field-id="11"])'], {
          level: 1.0, pad: 40, smooth: true, scrollBehavior: 'instant', noScroll: true,
        }).catch(() => {});
      }, 420);

      await sleep(840);

      // Crossfade the overlay off — the stage iframe underneath is already
      // pre-framed on the hero card. No cover. No reload. Pure dissolve.
      root.classList.add('out');
      await sleep(540);
      root.remove();
    },
  },
];
