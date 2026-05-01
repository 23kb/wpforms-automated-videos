// Selectors for form-entries-guide.
// Provenance: snapshots/<slug>/catalog.md anchors. Verified via tools/verify-selectors.js.

const sel = {
  // admin-forms-overview
  formsOverview:        '#wpforms-overview',                    // catalog.md#id--wpforms-overview
  formsTable:           '#wpforms-overview-table',              // catalog.md#id--wpforms-overview-table
  formsEntriesColumn:   '#entries',                             // catalog.md#id--entries (th "Entries")
  sidebarWPForms:       '#toplevel_page_wpforms-overview',      // catalog.md#id--toplevel_page_wpforms-overview
  sidebarEntriesLink:   '#toplevel_page_wpforms-overview .wp-submenu a[href="admin.php?page=wpforms-entries"]',

  // admin-entries-overview
  overviewContent:      '.wpforms-admin-content',               // catalog.md#class--wpforms-admin-content
  overviewList:         '#the-list',                            // catalog.md#id--the-list
  overviewDatepicker:   '#wpforms-datepicker-popover-button',   // catalog.md#id--wpforms-datepicker-popover-button
  overviewLastEntryCol: '#last_entry',                          // catalog.md#id--last_entry
  overviewGraphCol:     '#graph',                               // catalog.md#id--graph

  // admin-entries-list
  listContent:          '.wpforms-admin-content',               // catalog.md#class--wpforms-admin-content
  listForm:             '#wpforms-entries-table',               // catalog.md#id--wpforms-entries-table
  listBody:             '#the-list',                            // catalog.md#id--the-list
  listSearchInput:      '#wpforms-entries-search-input',        // catalog.md#id--wpforms-entries-search-input
  listSearchFieldDrop:  '.wpforms-form-search-box-field',       // catalog.md#class--wpforms-form-search-box-field
  listDateFilter:       'input.wpforms-filter-date-selector + input', // visible flatpickr alt input (catalog.md#class--wpforms-filter-date-selector)
  listToolbarTop:       '.tablenav.top',                        // top toolbar wrapping bulk actions + date filter
  listActionsCol:       '#actions',                             // catalog.md#id--actions
  listBulkActions:      '#bulk-action-selector-top',            // catalog.md#id--bulk-action-selector-top
  listGearIcon:         '#wpforms-list-table-ext-edit-columns-cog',                  // catalog.md#id--wpforms-list-table-ext-edit-columns-cog
  listGearContainer:    '#wpforms-list-table-ext-edit-columns-select-container',     // catalog.md#id--wpforms-list-table-ext-edit-columns-select-container

  // admin-entry-detail
  entrySingle:          '#wpforms-entries-single',              // catalog.md#id--wpforms-entries-single
  entryFields:          '#wpforms-entry-fields',                // catalog.md#id--wpforms-entry-fields
  entryNotes:           '#wpforms-entry-notes',                 // catalog.md#id--wpforms-entry-notes
  entryGeolocation:     '#wpforms-entry-geolocation',           // catalog.md#id--wpforms-entry-geolocation
  entryLogs:            '#wpforms-entry-logs',                  // catalog.md#id--wpforms-entry-logs
  entryDetails:         '#wpforms-entry-details',               // catalog.md#id--wpforms-entry-details
  entryActions:         '#wpforms-entry-actions',               // catalog.md#id--wpforms-entry-actions

  // admin-tools-export
  // Note: most export option sections are hidden until a form is picked,
  // so they have zero size in the captured DOM. Use visible wrappers for camera focus.
  exportTools:          '#wpforms-tools',                       // catalog.md#id--wpforms-tools
  exportContent:        '.wpforms-admin-content',               // catalog.md#class--wpforms-admin-content
  exportFirstRow:       '.wpforms-setting-row',                 // catalog.md#class--wpforms-setting-row (form picker row)
  exportForm:           '#wpforms-tools-entries-export',        // catalog.md#id--wpforms-tools-entries-export
};

export default sel;
