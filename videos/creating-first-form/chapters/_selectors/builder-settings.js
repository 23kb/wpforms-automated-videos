// Shared selectors for `builder-settings-*` snapshots (confirmation,
// notifications, general, anti_spam, themes, …). The panel classes are
// identical across these snapshots — only which section starts `.active`
// differs, and that's handled via the `activateSection` helper.
// Grep-verified against builder-settings-confirmation/index.html and
// builder-settings-notifications/index.html.

export default {
  // Sub-section nav (left rail inside Settings panel).
  confSubNav:   'a.wpforms-panel-sidebar-section-confirmation',
  notifSubNav:  'a.wpforms-panel-sidebar-section-notifications',
  generalSubNav:'a.wpforms-panel-sidebar-section-general',
  antiSpamSubNav:'a.wpforms-panel-sidebar-section-anti_spam',

  // Content sections.
  confPanel:    '.wpforms-panel-content-section-confirmation',
  notifPanel:   '.wpforms-panel-content-section-notifications',
  generalPanel: '.wpforms-panel-content-section-general',
};
