// Stage 5 transition lab — selector sheet (expanded for slice 5b-1.6).
//
// Sourced from videos/build-forms-faster-with-wpforms-ai/chapters/_selectors.js
// and verified against the snapshot catalogs:
//   snapshots/wpforms-ai-builder-empty/catalog.md
//   snapshots/wpforms-ai-builder-feedback-generated/catalog.md
//
// Provenance notes (anchor → catalog):
//   #wpforms-builder                → wpforms-ai-builder-empty/catalog.md#id--wpforms-builder
//                                     and wpforms-ai-builder-feedback-generated/catalog.md (same)
//   #wpforms-panel-ai-form          → wpforms-ai-builder-empty/catalog.md#id--wpforms-panel-ai-form
//                                     and wpforms-ai-builder-feedback-generated/catalog.md#id--wpforms-panel-ai-form
//   .wpforms-ai-chat-header         → wpforms-ai-builder-empty/catalog.md#class--wpforms-ai-chat-header
//   .wpforms-ai-chat-message-input  → wpforms-ai-builder-empty/catalog.md#class--wpforms-ai-chat-message-input
//   .wpforms-ai-chat-send           → reused from production sheet (live element in
//                                     wpforms-ai-builder-empty; below catalog noise floor)
//   #wpforms-generator-field-1      → wpforms-ai-builder-feedback-generated/catalog.md#id--wpforms-generator-field-1
//   .wpforms-ai-form-generator-preview-submit
//                                   → wpforms-ai-builder-feedback-generated/catalog.md#class--wpforms-ai-form-generator-preview-submit
//
// Legacy `_selectors.js` filename — sheet-level provenance enforcement is
// skipped by validate-video.js (`inferSnapshotFromSheetName` returns null).
// Selectors are referenced via `sel.X` in chapter files (no inline
// target/from/to/anchor strings), so chapter-level inline scans don't fire
// either. Provenance is documented here for human review.

export default {
  builderRoot: '#wpforms-builder',
  aiPanel: '#wpforms-panel-ai-form',
  aiChatHeader: '.wpforms-ai-chat-header',
  promptInput: '.wpforms-ai-chat-message-input textarea',
  sendPrompt: '.wpforms-ai-chat-send',
  previewPanel: '#wpforms-panel-ai-form .wpforms-panel-content',
  nameField: '#wpforms-generator-field-1',
  submitButton: '.wpforms-ai-form-generator-preview-submit',
};
