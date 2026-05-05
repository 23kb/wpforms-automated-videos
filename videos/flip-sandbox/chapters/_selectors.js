// Real iframe selectors used by the sandbox.
// Provenance: snapshots/admin-forms-overview/catalog.md
export default {
  // catalog.md#id--wpforms-overview-search-term — Search Forms input.
  searchInput: '#wpforms-overview-search-term',
  // catalog.md#id--the-list — All Forms table tbody. The first non-hidden
  // <tr> inside is the most recently created form row ("Contact Us form").
  // We grab its primary name cell (form title + row-actions) for the
  // clone-and-Flip beat.
  formRowNameCell: '#the-list tr:not(.wpforms-hidden) td.name.column-primary',
};
