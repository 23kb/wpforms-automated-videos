// Named selectors for the `builder-fields` snapshot. Shared across every
// chapter that works against this snapshot. If a selector breaks, fix it
// HERE once, not in N chapter files.
//
// Each export is a string selector. Chapter modules never build selectors
// from scratch — they compose from this sheet.

export default {
  // Sidebar — Add Fields
  searchInput:   '#wpforms-search-fields-input',
  searchClose:   '.wpforms-search-fields-input-close',
  textBtn:       '#wpforms-add-fields-text',         // Single Line Text
  contentBtn:    '#wpforms-add-fields-content',      // Content (HTML) field
  dropdownBtn:   '#wpforms-add-fields-select',
  repeaterBtn:   '#wpforms-add-fields-repeater',
  addFieldsTab:  '#add-fields',         // TAB LINK (li wrapper) — Add Fields
  fieldOptionsTab: '#field-options',    // TAB LINK (li wrapper) — Field Options
  addFieldsTabLink:    '#add-fields > a',
  fieldOptionsTabLink: '#field-options > a',
  addFieldsPanel:   '#wpforms-add-fields-tab',  // content panel for Add Fields tab
  fieldOptionsPanel:'#wpforms-field-options',    // content panel for Field Options tab

  // Canvas
  canvas:        '#wpforms-panel-fields .wpforms-field-wrap',
  fieldsPanel:   '#wpforms-panel-fields',

  // Top nav — panel tabs
  setupTabBtn:   'button.wpforms-panel-setup-button[data-panel="setup"]',
  fieldsTabBtn:  'button.wpforms-panel-fields-button[data-panel="fields"]',
  settingsTabBtn:'button.wpforms-panel-settings-button[data-panel="settings"]',
  marketingTabBtn:'button.wpforms-panel-providers-button[data-panel="providers"]',
  paymentsTabBtn:'button.wpforms-panel-payments-button[data-panel="payments"]',
  revisionsTabBtn:'button.wpforms-panel-revisions-button[data-panel="revisions"]',

  // Default form fields (after applyDefaultForm keepIds:[1,2,3,4])
  fieldName:     '#wpforms-field-1',
  fieldEmail:    '#wpforms-field-2',
  fieldText:     '#wpforms-field-3',      // Single Line Text (kept hidden until drag-reveal)
  fieldMessage:  '#wpforms-field-4',      // Paragraph Text, relabeled "Message"
};
