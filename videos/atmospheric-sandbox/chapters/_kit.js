// Local kit for the atmospheric sandbox.
//
// Re-export the shared authoring kit, then keep in-development atmospheric
// helpers here until promotion review.

export * from '../../_shared/kit.js';

export function mountDarkBackdrop({ id = 'atmo-dark-canvas', zIndex = 55 } = {}) {
  document.getElementById(id)?.remove();
  const layer = document.createElement('canvas');
  layer.id = id;
  layer.width = 1920;
  layer.height = 1080;
  Object.assign(layer.style, {
    position: 'fixed', inset: '0', width: '100vw', height: '100vh',
    pointerEvents: 'none', zIndex: String(zIndex),
  });
  const ctx = layer.getContext('2d');
  ctx.fillStyle = '#0a0e14';
  ctx.fillRect(0, 0, layer.width, layer.height);
  document.body.appendChild(layer);
  return {
    layer,
    dispose() { layer.remove(); },
  };
}

export function mountGrain({ opacity = 0.03, seed = 1, zIndex = 60 } = {}) {
  let layer = document.createElement('canvas');
  let ctx = layer.getContext('2d');
  const width = Math.max(1920, Math.ceil(window.innerWidth));
  const height = Math.max(1080, Math.ceil(window.innerHeight));
  const alpha = Math.round(Math.max(0, Math.min(1, opacity)) * 255);
  const rand = (() => {
    let a = seed >>> 0;
    return () => {
      a += 0x6d2b79f5;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  })();

  layer.width = width;
  layer.height = height;
  Object.assign(layer.style, {
    position: 'fixed', inset: '0', width: '100vw', height: '100vh',
    pointerEvents: 'none', zIndex: String(zIndex),
  });
  const image = ctx.createImageData(width, height);
  for (let i = 0; i < image.data.length; i += 4) {
    const value = Math.floor(rand() * 256);
    image.data[i] = value;
    image.data[i + 1] = value;
    image.data[i + 2] = value;
    image.data[i + 3] = alpha;
  }
  ctx.putImageData(image, 0, 0);
  document.body.appendChild(layer);

  return {
    layer,
    dispose() {
      layer?.remove();
      layer = null;
      ctx = null;
    },
  };
}

export function mountSweep({
  color = 'rgba(255,255,255,0.18)',
  angle = 110,
  bandWidth = 0.30,
  zIndex = 65,
} = {}) {
  let layer = document.createElement('div');
  const clamped = Math.max(0, Math.min(1, bandWidth));
  const edge = (50 - clamped * 50).toFixed(2);
  const farEdge = (50 + clamped * 50).toFixed(2);
  Object.assign(layer.style, {
    position: 'fixed', inset: '0', width: '100vw', height: '100vh',
    pointerEvents: 'none', zIndex: String(zIndex),
    background: `linear-gradient(${angle}deg, transparent 0%, transparent ${edge}%, ${color} 50%, transparent ${farEdge}%, transparent 100%)`,
    willChange: 'transform',
  });
  document.body.appendChild(layer);
  // Chapter callers load GSAP before mounting so the sweep starts off-canvas without inline transform stacking.
  if (window.gsap) window.gsap.set(layer, { xPercent: -100 });
  return {
    layer,
    tweenInto(tl, { duration = 4, ease = 'sine.inOut', position = 0 } = {}) {
      return tl.fromTo(
        layer,
        { xPercent: -100 },
        { xPercent: 100, duration, ease },
        position
      );
    },
    dispose() {
      layer?.remove();
      layer = null;
    },
  };
}

export function mountParallaxPair({
  backBg = 'radial-gradient(ellipse 80% 60% at 30% 40%, rgba(40,90,130,0.35) 0%, transparent 70%)',
  frontBg = 'radial-gradient(ellipse 60% 50% at 70% 60%, rgba(120,60,140,0.30) 0%, transparent 65%)',
  zIndexBack = 57,
  zIndexFront = 58,
  backScale = { from: 1.00, to: 1.08 },
  frontScale = { from: 1.04, to: 1.00 },
  backY = { from: 0, to: 16 },
  frontY = { from: 0, to: -10 },
} = {}) {
  let layerBack = document.createElement('div');
  let layerFront = document.createElement('div');
  const mountLayer = (layer, background, zIndex) => {
    Object.assign(layer.style, {
      position: 'fixed', inset: '0', width: '100vw', height: '100vh',
      pointerEvents: 'none', zIndex: String(zIndex), background,
      willChange: 'transform',
    });
    document.body.appendChild(layer);
  };
  mountLayer(layerBack, backBg, zIndexBack);
  mountLayer(layerFront, frontBg, zIndexFront);
  // Chapter callers load GSAP before mounting so initial state lands cleanly without a flash.
  if (window.gsap) {
    window.gsap.set(layerBack, { scale: backScale.from, y: backY.from });
    window.gsap.set(layerFront, { scale: frontScale.from, y: frontY.from });
  }
  return {
    layerBack,
    layerFront,
    tweenInto(tl, { duration = 6, ease = 'sine.inOut', position = 0 } = {}) {
      tl.to(layerBack, { scale: backScale.to, y: backY.to, duration, ease }, position);
      tl.to(layerFront, { scale: frontScale.to, y: frontY.to, duration, ease }, position);
      return tl;
    },
    dispose() {
      layerBack?.remove();
      layerFront?.remove();
      layerBack = null;
      layerFront = null;
    },
  };
}

export function scalePush({ target, scaleFrom = 1.00, scaleTo = 1.02 } = {}) {
  if (!target) throw new Error('scalePush: target is required');
  // Chapter callers load GSAP before scalePush.
  if (window.gsap) window.gsap.set(target, { scale: scaleFrom });
  return {
    target,
    tweenInto(tl, { duration = 4, ease = 'sine.inOut', position = 0 } = {}) {
      return tl.fromTo(target, { scale: scaleFrom }, { scale: scaleTo, duration, ease }, position);
    },
    dispose() {
      window.gsap?.killTweensOf(target);
      target = null;
    },
  };
}

const TEXT_REVEAL_PRESETS = {
  'mask-reveal-up': { split: true, yFrom: 110, duration: 0.68, ease: 'expo.out' },
  'top-down-letters': { split: true, yFrom: -110, duration: 0.82, ease: 'expo.out' },
  'focus-blur-resolve': { filterFrom: 'blur(10px)', filterTo: 'blur(0px)', duration: 0.70, ease: 'power2.out' },
  'spring-scale-in': { scaleFrom: 0.72, scaleTo: 1, duration: 0.52, ease: 'back.out(1.4)' },
};

export function mountTextReveal(text, {
  preset = 'mask-reveal-up',
  position = { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' },
  size = 56,
  weight = 600,
  family = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  color = '#ffffff',
  stagger = 0.028,
  zIndex = 80,
} = {}) {
  const spec = TEXT_REVEAL_PRESETS[preset];
  if (!spec) throw new Error('mountTextReveal: unknown preset ' + preset);
  let el = document.createElement('div');
  Object.assign(el.style, {
    position: 'fixed', zIndex: String(zIndex), pointerEvents: 'none',
    whiteSpace: 'pre', display: 'inline-block', lineHeight: '1.2',
    fontFamily: family, fontSize: size + 'px', fontWeight: String(weight),
    color, textShadow: '0 1px 0 rgba(255,255,255,0.08)',
  }, position);
  if (spec.split) {
    [...text].forEach((char) => {
      const mask = document.createElement('span');
      const ch = document.createElement('span');
      mask.className = 'mask';
      ch.className = 'ch';
      Object.assign(mask.style, {
        display: 'inline-block', overflow: 'hidden', verticalAlign: 'baseline',
        padding: '0.12em 0', margin: '-0.12em 0', lineHeight: 'inherit',
      });
      Object.assign(ch.style, { display: 'inline-block', willChange: 'transform' });
      ch.innerHTML = char === ' ' ? '&nbsp;' : char;
      mask.appendChild(ch);
      el.appendChild(mask);
    });
  } else {
    el.textContent = text;
  }
  document.body.appendChild(el);
  const targets = spec.split ? [...el.querySelectorAll('.ch')] : [el];
  if (window.gsap) {
    if (spec.split) window.gsap.set(targets, { yPercent: spec.yFrom });
    else if (preset === 'focus-blur-resolve') window.gsap.set(el, { filter: spec.filterFrom, opacity: 0 });
    else window.gsap.set(el, { scale: spec.scaleFrom, opacity: 0 });
  }
  return {
    el,
    tweenInto(tl, { duration, position: at = 0 } = {}) {
      const total = duration ?? (spec.duration + (spec.split ? Math.max(0, targets.length - 1) * stagger : 0));
      if (spec.split) {
        const each = Math.max(0.001, total - Math.max(0, targets.length - 1) * stagger);
        return tl.to(targets, { yPercent: 0, duration: each, ease: spec.ease, stagger }, at);
      }
      if (preset === 'focus-blur-resolve') {
        return tl.to(el, { filter: spec.filterTo, opacity: 1, duration: total, ease: spec.ease }, at);
      }
      return tl.to(el, { scale: spec.scaleTo, opacity: 1, duration: total, ease: spec.ease }, at);
    },
    dispose() {
      if (window.gsap) window.gsap.killTweensOf(targets);
      el?.remove();
      el = null;
    },
  };
}
