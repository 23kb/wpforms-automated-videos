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
