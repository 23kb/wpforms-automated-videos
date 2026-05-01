// CH — Export Entries: Tools → Export, pick form, download CSV/XLSX.
import sel from './_selectors.js';

export const snapshot = 'admin-tools-export';
export const validator = { snapshot: 'admin-tools-export' };
export const mode = 'per-beat-narration';
export const breakStyle = 'glide';
export const swapStyle = 'morph';

export default [
  {
    id: 'export-1',
    chapter: 'export-intro',
    camera: { focus: sel.exportContent, level: 1.0, pad: 30 },
    narration: 'export-1',
    effect: async ({ cursor, highlight, clearHighlights, sleep }) => {
      await highlight([sel.exportContent], { label: 'WPForms → Tools → Export', pad: 10 });
      await cursor.moveTo(sel.exportFirstRow);
      await sleep(1100);
      await clearHighlights();
    },
    duration: 0.2,
  },
  {
    id: 'export-2',
    chapter: 'export-flow',
    camera: { focus: sel.exportFirstRow, level: 1.15, pad: 40 },
    narration: 'export-2',
    effect: async ({ cursor, highlight, clearHighlights, sleep }) => {
      await highlight([sel.exportFirstRow], { label: 'Pick a form, choose fields and a date range, then download', pad: 8 });
      await cursor.moveTo(sel.exportFirstRow);
      await sleep(1300);
      await clearHighlights();
    },
    duration: 0.2,
  },
];
