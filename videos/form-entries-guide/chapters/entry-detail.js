// CH — Entry Detail: real cursor-driven walkthrough of fields, notes, location, log, actions.
import sel from './_selectors.js';

export const snapshot = 'admin-entry-detail';
export const validator = { snapshot: 'admin-entry-detail' };
export const mode = 'per-beat-narration';
export const breakStyle = 'glide';
export const swapStyle = 'morph';

export default [
  {
    id: 'detail-1',
    chapter: 'detail-fields',
    camera: { focus: sel.entrySingle, level: 1.0, pad: 30 },
    narration: 'detail-1',
    effect: async ({ cursor, highlight, clearHighlights, sleep }) => {
      await cursor.moveTo(sel.entryFields);
      await sleep(280);
      await highlight([sel.entryFields], { label: 'Every field the visitor submitted', pad: 10 });
      await sleep(1100);
      await clearHighlights();
    },
    duration: 0.2,
  },
  {
    id: 'detail-2',
    chapter: 'detail-notes',
    camera: { focus: sel.entryNotes, level: 1.15, pad: 40 },
    narration: 'detail-2',
    effect: async ({ cursor, highlight, clearHighlights, sleep }) => {
      await cursor.moveTo(sel.entryNotes);
      await sleep(280);
      await highlight([sel.entryNotes], { label: 'Add internal notes for your team', pad: 10 });
      await sleep(1100);
      await clearHighlights();
    },
    duration: 0.2,
  },
  {
    id: 'detail-3',
    chapter: 'detail-context',
    camera: { focus: sel.entryGeolocation, level: 1.15, pad: 40 },
    narration: 'detail-3',
    effect: async ({ cursor, highlight, clearHighlights, sleep }) => {
      await cursor.moveTo(sel.entryGeolocation);
      await sleep(280);
      await highlight([sel.entryGeolocation], { label: 'Approximate location for context', pad: 10 });
      await sleep(900);
      await clearHighlights();
      await cursor.moveTo(sel.entryLogs);
      await highlight([sel.entryLogs], { label: 'Notification and integration log', pad: 10 });
      await sleep(900);
      await clearHighlights();
    },
    duration: 0.2,
  },
  {
    id: 'detail-4',
    chapter: 'detail-actions',
    camera: { focus: sel.entryActions, level: 1.25, pad: 30 },
    narration: 'detail-4',
    effect: async ({ cursor, highlight, clearHighlights, sleep }) => {
      await cursor.moveTo(sel.entryDetails);
      await sleep(360);
      await highlight([sel.entryDetails, sel.entryActions], { label: 'Print, export, resend, or delete this entry', pad: 8 });
      await cursor.moveTo(sel.entryActions);
      await sleep(1200);
      await clearHighlights();
    },
    duration: 0.2,
  },
];
