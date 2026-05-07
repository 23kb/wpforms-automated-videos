// CH — Where Entries Live: from All Forms → sidebar Entries → Entries overview.
import sel from './_selectors.js';

export const snapshot = 'admin-forms-overview';
export const validator = { snapshot: 'admin-forms-overview' };
export const mode = 'per-beat-narration';
export const breakStyle = 'glide';
export const swapStyle = 'flipBridge';

export default [
  {
    id: 'where-entries-1',
    chapter: 'forms-overview',
    camera: { focus: sel.formsTable, level: 1.0, pad: 30 },
    narration: 'where-entries-1',
    effect: async ({ cursor, highlight, clearHighlights, sleep }) => {
      await highlight([sel.formsEntriesColumn], { label: 'Each form has its own entry count', pad: 8 });
      await cursor.moveTo(sel.formsEntriesColumn);
      await sleep(900);
      await clearHighlights();
    },
    duration: 0.2,
  },
  {
    id: 'where-entries-2',
    chapter: 'sidebar-nav',
    camera: { focus: sel.sidebarWPForms, level: 1.2, pad: 40 },
    narration: 'where-entries-2',
    effect: async ({ cursor, highlight, clearHighlights, sleep, swapToSnapshot }) => {
      await cursor.moveTo(sel.sidebarWPForms);
      await sleep(280);
      await highlight([sel.sidebarEntriesLink], { label: 'Click Entries in the WPForms menu', pad: 6 });
      await cursor.glideTo(sel.sidebarEntriesLink, { via: sel.sidebarWPForms, wait: 700 });
      await sleep(620);
      await clearHighlights();
      await swapToSnapshot('admin-entries-overview');
    },
    duration: 0.2,
  },
  {
    id: 'where-entries-3',
    chapter: 'entries-overview',
    camera: { focus: sel.overviewContent, level: 1.0, pad: 30 },
    narration: 'where-entries-3',
    effect: async ({ highlight, clearHighlights, sleep }) => {
      await highlight([sel.overviewList], { label: 'Site-wide entries dashboard', pad: 10 });
      await sleep(900);
      await clearHighlights();
      await highlight([sel.overviewLastEntryCol, sel.overviewGraphCol], { label: 'Last entry and recent activity per form', pad: 6 });
      await sleep(900);
      await clearHighlights();
    },
    duration: 0.2,
  },
];
