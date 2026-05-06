// Local kit for the GSAP Flip sandbox.
//
// Re-exports from videos/_shared/kit.js with back-compat aliases so the
// chapter file's existing imports (loadGsapFlip, mountStageLayer, flipDone)
// keep working.

export {
  loadGsap as loadGsapFlip,
  mountSceneLayer as mountStageLayer,
  injectCss,
  iframeScale,
  iframeTranslate,
  tlDone as flipDone,
  cloneFromIframe,
} from '../../_shared/kit.js';
