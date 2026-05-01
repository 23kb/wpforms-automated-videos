// Named selectors for the `admin-forms-overview` snapshot.
// Grep-verified against snapshots/admin-forms-overview/index.html.

export default {
  // WordPress admin sidebar — WPForms submenu items, matched by href so we
  // don't rely on fragile nth-of-type ordering. Scoped under the WPForms
  // top-level <li> so we don't collide with the admin bar at the top.
  wpformsMenu:   '#toplevel_page_wpforms-overview',
  entriesLink:   '#toplevel_page_wpforms-overview a[href="admin.php?page=wpforms-entries"]',
  paymentsLink:  '#toplevel_page_wpforms-overview a[href="admin.php?page=wpforms-payments"]',
  settingsLink:  '#toplevel_page_wpforms-overview a[href="admin.php?page=wpforms-settings"]',
};
