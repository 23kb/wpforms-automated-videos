// Shared selectors for the creating-first-form chapters.
// Kept thin — chapter modules import only from here.

// Admin → Forms Overview
export const addNewBtn = '.page-title-action[data-action="add"]';

// Builder Setup (template picker)
export const setupTitle    = '.wpforms-setup-title';
export const tplContact    = '#wpforms-template-simple-contact-form-template';
export const tplGrid       = '.wpforms-setup-templates-content';

// Builder Fields panel — preview rows
export const fieldName     = '.wpforms-field.wpforms-field-name';
export const fieldEmail    = '.wpforms-field.wpforms-field-email';
export const fieldTextarea = '.wpforms-field.wpforms-field-textarea';
export const fieldPhone    = '.wpforms-field.wpforms-field-phone';

// Builder Fields panel — sidebar chips
export const sidebarSearch = '#wpforms-search-fields-input';
export const chipPhone     = '#wpforms-add-fields-phone';

// Field Options (Name field selected)
export const fieldOptLabel       = '#wpforms-field-option-row-1-label';
export const fieldOptDescription = '#wpforms-field-option-row-1-description';
export const fieldOptRequired    = '#wpforms-field-option-row-1-required';

// Builder chrome buttons
export const saveBtn       = '#wpforms-save';
export const embedBtn      = '#wpforms-embed';
export const settingsBtn   = '.wpforms-panel-settings-button';

// Builder Settings panel rows (general)
export const settingFormTitle       = '#wpforms-panel-field-settings-form_title-wrap';
export const settingsSidebarNotifs  = '.wpforms-panel-sidebar-section-notifications';
export const settingsSidebarConfirm = '.wpforms-panel-sidebar-section-confirmation';

// Embed modal
export const embedModal       = '.wpforms-embed-wizard';
export const embedChooseExist = '.wpforms-embed-wizard-btn-existing';
export const embedChooseNew   = '.wpforms-embed-wizard-btn-new';

// Frontend published form
export const feForm   = '.wpforms-form';
export const feName   = '.wpforms-field-name input';
export const feEmail  = '.wpforms-field-email input';
export const feSubmit = '.wpforms-submit';
