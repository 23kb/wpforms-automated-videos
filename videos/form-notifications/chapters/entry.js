// CH1 — Entry: sidebar → Settings → Notifications
export const snapshot = 'builder-settings-notifications';
export const mode = 'parallel';
export const narration = 'entry';

export default [
  {
    id: 'open-settings', chapter: 'entry',
    camera:   { focus: '.wpforms-panel-settings-button', level: 1.2, pad: 40 },
    overlays: [{ highlight: '.wpforms-panel-settings-button', label: 'Open Settings from the left sidebar' }],
    duration: 1.5,
  },
  {
    id: 'select-notifications', chapter: 'entry',
    camera:   { focus: '.wpforms-panel-sidebar-section-notifications', level: 1.2, pad: 40 },
    overlays: [{ highlight: '.wpforms-panel-sidebar-section-notifications', label: 'Select Notifications' }],
    duration: 1.5,
  },
];
