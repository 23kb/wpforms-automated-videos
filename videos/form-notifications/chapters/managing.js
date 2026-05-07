// CH5 — Managing: add, clone, toggle active/inactive.
// Blocks are collapsed once in setup so the overview reads clearly.
import {
  block1, block2, addBtn, cloneBtn, statusBtn, block2Head,
  firstNotificationSel,
} from './_selectors.js';

export const snapshot = 'builder-settings-notifications';
export const mode = 'per-beat-narration';

export async function setup({ collapseBlock }) {
  await collapseBlock(block1);
  await collapseBlock(block2);
}

export default [
  {
    narration: 'managing-1', id: 'add-intro', chapter: 'managing',
    camera: { focus: addBtn, level: 2.2, pad: 30 },
    overlays: [
      { highlight: addBtn, label: 'Add a new notification from scratch' },
      { pointer: addBtn, direction: 'down', label: 'Click to add', size: 28, gap: 8 },
    ],
    labelDwell: 0.9, keepLabels: true,
    effect: async ({ cursor, clearLabels }) => {
      await cursor.park({ x: 1300, y: 700 });
      await cursor.moveTo(addBtn);
      await cursor.click();
      await clearLabels();
      await cursor.hide();
    },
  },
  {
    narration: 'managing-2', id: 'add-prompt-and-result', chapter: 'managing',
    camera: { focus: addBtn, level: 1.0, pad: 600, noScroll: true },
    effect: async ({ zoomTo, showPrompt, duplicateBlock, collapseBlock }) => {
      await showPrompt({ title: 'Enter a notification name', placeholder: 'Eg: User Confirmation', typeText: 'New Notification' });
      const newBlockSel = await duplicateBlock(block2, { fade: 1100, nameOverride: 'New Notification', insertBefore: firstNotificationSel(), expanded: true });
      await zoomTo([newBlockSel, block1, block2], { level: 1.2, pad: 60, smooth: true, noScroll: true });
      await collapseBlock(newBlockSel);
    },
  },
  {
    narration: 'managing-3', id: 'clone', chapter: 'managing',
    camera: { focus: block2Head, level: 1.8, pad: 40 },
    overlays: [
      { highlight: cloneBtn, label: 'Duplicate for an instant copy' },
      { pointer: cloneBtn, direction: 'down', label: 'Click to clone', size: 26, gap: 8 },
    ],
    labelDwell: 0.9, keepLabels: true,
    effect: async ({ cursor, zoomTo, clearLabels, duplicateBlock, collapseBlock }) => {
      await cursor.park({ x: 1400, y: 600 });
      await cursor.glideTo(cloneBtn, { via: block2Head, wait: 700 });
      await cursor.click();
      await clearLabels();
      await cursor.hide();
      const dupSel = await duplicateBlock(block2, { fade: 1100, nameOverride: 'Duplicated Notification', insertBefore: firstNotificationSel(), expanded: true });
      await zoomTo([dupSel, block1, block2], { level: 1.2, pad: 60, smooth: true, noScroll: true });
      await collapseBlock(dupSel);
    },
  },
  {
    narration: 'managing-4', id: 'status-toggle', chapter: 'managing',
    camera: { focus: statusBtn, level: 2.6, pad: 24 },
    overlays: [
      { highlight: statusBtn, label: 'Turn a notification off without deleting it' },
      { pointer: statusBtn, direction: 'down', label: 'Click to toggle', size: 26, gap: 8 },
    ],
    labelDwell: 1.0, keepLabels: true,
    effect: async ({ cursor, clearLabels, toggleBlockActive }) => {
      await cursor.park({ x: 1300, y: 700 });
      await toggleBlockActive(block2, { state: 'inactive' });
      await clearLabels();
    },
  },
];
