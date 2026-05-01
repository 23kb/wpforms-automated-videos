// CH6 — Conditional Logic.
// Swaps to the CL snapshot; setup hides the pre-rendered rule box so we can
// reveal it in-beat when the CL toggle is flipped.
export const snapshot = 'builder-settings-notifications-cl';
export const mode = 'per-beat-narration';

const clWrap       = `#wpforms-panel-field-notifications-1-conditional_logic-wrap`;
const clToggleBtn  = `${clWrap} .wpforms-toggle-control-icon`;
const ruleBoxSel   = `#wpforms-conditional-groups-settings-notifications-1`;
const fieldCellSel = `${ruleBoxSel} td.field`;
const opCellSel    = `${ruleBoxSel} td.operator`;
const valueCellSel = `${ruleBoxSel} td.value`;

const RULE = { action: 'Send', field: 'Message', operator: 'contains', value: 'Urgent' };

export async function setup({ doc }) {
  const ruleBox    = doc.querySelector(ruleBoxSel);
  const toggleRoot = doc.querySelector(`${clWrap} .wpforms-toggle-control`);
  const cb         = doc.querySelector(`${clWrap} input[type="checkbox"]`);
  if (ruleBox)    ruleBox.style.display = 'none';
  if (toggleRoot) toggleRoot.classList.remove('wpforms-toggle-control-checked');
  if (cb)         cb.checked = false;
}

export default [
  {
    narration: 'cl-1', id: 'cl-intro', chapter: 'conditional-logic',
    camera: { focus: clWrap, level: 2.2, pad: 30 },
    overlays: [
      { highlight: clWrap, label: 'Only send this notification when a condition is met' },
      { pointer: clToggleBtn, direction: 'down', label: 'Click to enable', size: 28, gap: 8 },
    ],
    labelDwell: 0.8,
    effect: async ({ cursor, doc }) => {
      await cursor.park({ x: 1300, y: 700 });
      await cursor.moveTo(clToggleBtn); await cursor.click(); await cursor.hide();
      const toggleRoot = doc.querySelector(`${clWrap} .wpforms-toggle-control`);
      const cb         = doc.querySelector(`${clWrap} input[type="checkbox"]`);
      const ruleBox    = doc.querySelector(ruleBoxSel);
      toggleRoot.classList.add('wpforms-toggle-control-checked');
      cb.checked = true;
      ruleBox.style.display = '';
      ruleBox.style.opacity = '0';
      ruleBox.style.transform = 'translateY(-6px)';
      ruleBox.style.transition = 'opacity 500ms ease, transform 500ms ease';
      requestAnimationFrame(() => { ruleBox.style.opacity = '1'; ruleBox.style.transform = 'translateY(0)'; });
    },
  },
  {
    narration: 'cl-2', id: 'build-rule', chapter: 'conditional-logic',
    camera: { focus: fieldCellSel, level: 2.4, pad: 20, noScroll: true },
    overlays: [{ highlight: fieldCellSel, label: `Field: ${RULE.field}` }],
    labelDwell: 0.4, keepLabels: true,
    effect: async ({ doc, sleep, zoomTo, clearLabels, highlight }) => {
      const fs = doc.querySelector(`${ruleBoxSel} .wpforms-conditional-field`);
      const fopt = [...fs.options].find(o => o.text.trim() === RULE.field);
      if (fopt) fs.value = fopt.value;
      await sleep(700);

      await clearLabels();
      await zoomTo([opCellSel], { level: 2.4, pad: 20, smooth: true, noScroll: true });
      await highlight([opCellSel], { label: `Operator: ${RULE.operator}` });
      const os = doc.querySelector(`${ruleBoxSel} .wpforms-conditional-operator`);
      [...os.options].forEach(o => { o.disabled = false; });
      const oopt = [...os.options].find(o => o.text.trim() === RULE.operator);
      if (oopt) os.value = oopt.value;
      await sleep(700);

      await clearLabels();
      await zoomTo([valueCellSel], { level: 2.4, pad: 20, smooth: true, noScroll: true });
      await highlight([valueCellSel], { label: `Value: "${RULE.value}"` });
      const cell = doc.querySelector(valueCellSel);
      const old = cell.querySelector('select, input');
      const input = doc.createElement('input');
      input.type = 'text'; input.className = 'wpforms-conditional-value';
      input.placeholder = 'Enter value';
      input.style.cssText = 'width:100%;box-sizing:border-box;';
      if (old) old.replaceWith(input); else cell.appendChild(input);
      for (let i = 1; i <= RULE.value.length; i++) { input.value = RULE.value.slice(0, i); await sleep(70); }
    },
  },
  {
    narration: 'cl-3', id: 'rule-summary', chapter: 'conditional-logic',
    camera: { focus: [ruleBoxSel], level: 1.6, pad: 10, noScroll: true },
    overlays: [{ highlight: ruleBoxSel, label: `Send if ${RULE.field} ${RULE.operator} "${RULE.value}"` }],
    labelDwell: 0.6, keepLabels: true,
  },
];
