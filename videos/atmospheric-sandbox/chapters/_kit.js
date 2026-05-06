// Local kit for the atmospheric sandbox.
//
// Re-export the shared authoring kit, then keep in-development atmospheric
// helpers here until promotion review.

export * from '../../_shared/kit.js';

export function mountGrain({ opacity = 0.03, seed = 1, zIndex = 60 } = {}) {
  let layer = document.createElement('canvas');
  let ctx = layer.getContext('2d');
  const width = Math.max(1, Math.ceil(window.innerWidth));
  const height = Math.max(1, Math.ceil(window.innerHeight));
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
