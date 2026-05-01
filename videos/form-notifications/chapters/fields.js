// CH2 — The 6 basic notification fields
import { N } from './_selectors.js';

export const snapshot = 'builder-settings-notifications';
export const mode = 'parallel';
export const narration = 'fields';

export default [
  { id: 'field-email',     chapter: 'fields', camera:{ focus:`#wpforms-panel-field-${N}-email-wrap`,         level:2.2, pad:14 }, overlays:[{ highlight:`#wpforms-panel-field-${N}-email-wrap`,         label:'Send To — where the notification email is sent' }],             duration:3.0 },
  { id: 'field-subject',   chapter: 'fields', camera:{ focus:`#wpforms-panel-field-${N}-subject-wrap`,       level:2.2, pad:14 }, overlays:[{ highlight:`#wpforms-panel-field-${N}-subject-wrap`,       label:'Email Subject Line — the email subject' }],                     duration:3.0 },
  { id: 'field-from-name', chapter: 'fields', camera:{ focus:`#wpforms-panel-field-${N}-sender_name-wrap`,   level:2.2, pad:14 }, overlays:[{ highlight:`#wpforms-panel-field-${N}-sender_name-wrap`,   label:'From Name — who the email appears to be from' }],                duration:3.0 },
  { id: 'field-from-email',chapter: 'fields', camera:{ focus:`#wpforms-panel-field-${N}-sender_address-wrap`,level:2.2, pad:14 }, overlays:[{ highlight:`#wpforms-panel-field-${N}-sender_address-wrap`,label:'From Email — sender address (usually keep default)' }],         duration:3.0 },
  { id: 'field-replyto',   chapter: 'fields', camera:{ focus:`#wpforms-panel-field-${N}-replyto-wrap`,       level:2.2, pad:14 }, overlays:[{ highlight:`#wpforms-panel-field-${N}-replyto-wrap`,       label:'Reply-To — where replies go when someone hits Reply' }],         duration:3.0 },
  { id: 'field-message',   chapter: 'fields', camera:{ focus:`#wpforms-panel-field-${N}-message-wrap`,       level:2.2, pad:14 }, overlays:[{ highlight:`#wpforms-panel-field-${N}-message-wrap`,       label:'Email Message — the body (defaults to {all_fields})' }],         duration:3.0 },
];
