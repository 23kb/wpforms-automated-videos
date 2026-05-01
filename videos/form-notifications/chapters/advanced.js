// CH4 — Advanced: expand group, pick template, toggle file + csv attachments.
import { advGroup, advTitle, tplWrap, fileWrap, csvWrap } from './_selectors.js';

export const snapshot = 'builder-settings-notifications';
export const mode = 'per-beat-narration';

export default [
  {
    narration: 'advanced-1', id: 'reveal-advanced', chapter: 'advanced',
    camera: { focus: advTitle, level: 2.0, pad: 30 },
    spotlight: advTitle,
    overlays: [
      { highlight: advTitle, label: 'Advanced unlocks email templates and attachments' },
      { pointer: advTitle, direction: 'down', label: 'Click to expand', size: 28, gap: 8 },
    ],
    labelDwell: 1.1, keepLabels: true,
    effect: async ({ cursor, clearSpot, clearLabels, revealSection }) => {
      await cursor.park({ x: 1300, y: 700 });
      await cursor.moveTo(advTitle);
      await cursor.click();
      await clearLabels();
      await revealSection(advGroup);
      await clearSpot();
      await cursor.hide();
    },
  },
  {
    narration: 'advanced-2', id: 'template-modern', chapter: 'advanced',
    camera: { focus: tplWrap, level: 1.6, pad: 80 },
    effect: async ({ selectDropdown }) => {
      await selectDropdown(tplWrap, { pick: 'modern', direction: 'down' });
    },
  },
  {
    narration: 'advanced-3', id: 'file-toggle', chapter: 'advanced',
    camera: { focus: fileWrap, level: 2.2, pad: 18 },
    spotlight: fileWrap,
    overlays: [{ highlight: fileWrap, label: 'Attach uploaded files to the email' }],
    labelDwell: 0.8,
    effect: async ({ cursor, toggleControl }) => {
      await cursor.park({ x: 1400, y: 500 });
      await toggleControl(fileWrap, { state: 'on' });
    },
  },
  {
    narration: 'advanced-4', id: 'csv-toggle', chapter: 'advanced',
    camera: { focus: csvWrap, level: 2.2, pad: 18 },
    spotlight: csvWrap,
    overlays: [{ highlight: csvWrap, label: 'Or attach a CSV of the entry data' }],
    labelDwell: 0.8,
    effect: async ({ toggleControl }) => {
      await toggleControl(csvWrap, { state: 'on' });
    },
  },
];
