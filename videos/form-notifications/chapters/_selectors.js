// Shared selectors used across form-notifications chapters.
// The snapshot indexes notifications under id "notifications-2".
export const N = 'notifications-2';

export const emailWrap  = `#wpforms-panel-field-${N}-email-wrap`;
export const tagIcon    = `${emailWrap} .wpforms-show-smart-tags`;
export const dropdown   = `${emailWrap} .insert-smart-tag-dropdown`;
export const firstField = `${emailWrap} .insert-smart-tag-dropdown ul.list li[data-value="2"] .wpforms-smart-tags-widget-item`;
export const chipHostS  = `${emailWrap} .wpforms-smart-tags-widget-input`;

export const advGroup = `.wpforms-builder-notifications-advanced:has(#wpforms-panel-field-${N}-template-wrap)`;
export const advTitle = `${advGroup} > .wpforms-panel-fields-group-title`;
export const tplWrap  = `#wpforms-panel-field-${N}-template-wrap`;
export const fileWrap = `#wpforms-panel-field-${N}-file_upload_attachment_enable-wrap`;
export const csvWrap  = `#wpforms-panel-field-${N}-entry_csv_attachment_enable-wrap`;

export const block1     = `[data-block-type="notification"][data-block-id="1"]`;
export const block2     = `[data-block-type="notification"][data-block-id="2"]`;
export const addBtn     = `button.wpforms-notifications-add`;
export const cloneBtn   = `${block2} .wpforms-builder-settings-block-clone`;
export const statusBtn  = `${block2} .wpforms-builder-settings-block-status`;
export const block2Head = `${block2} .wpforms-builder-settings-block-header`;

export const firstNotificationSel = () => {
  const d = document.querySelector('iframe.ui').contentDocument;
  const all = [...d.querySelectorAll('[data-block-type="notification"][data-block-id]')];
  all.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1);
  return `[data-block-type="notification"][data-block-id="${all[0].dataset.blockId}"]`;
};
