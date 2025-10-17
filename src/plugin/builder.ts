/**
 * Builder-side plugin helpers for formBuilder.
 * Adds:
 *  - typeUserAttrs for logic JSON, applyTo, logicGroup
 *  - onOpenFieldEdit panel that groups these controls
 *  - Visual Rules Editor (optional) that populates the logic JSON without typing
 */

type UserAttrs = Record<string, any>;

export interface FieldMeta {
    name: string;
    type: string;
    label?: string;
    values?: Array<{ label: string; value: string }>;
}

export interface BuilderInitOptions {
    panelTitle?: string;
    types?: string[];
    // Hooks to supply fields/values (generic); if omitted, we try to infer from builder JSON.
    getAvailableFields?: () => FieldMeta[];
    getFieldValues?: (fieldName: string) => Array<{ label: string; value: string }> | null;
    enableVisualEditor?: boolean; // default true
}

const DEFAULT_TYPES = [
    'text', 'textarea', 'number', 'select',
    'radio-group', 'checkbox-group',
    'date', 'paragraph', 'header', 'file', 'autocomplete'
];

export function withConditionalLogic(opts: BuilderInitOptions = {}) {
    const panelTitle = opts.panelTitle || 'Conditional Logic';
    const types = (opts.types && opts.types.length ? opts.types : DEFAULT_TYPES);
    const enableVE = opts.enableVisualEditor !== false;

    const typeUserAttrs: Record<string, UserAttrs> = {};
    types.forEach(t => {
        typeUserAttrs[t] = {
            logic: {
                label: `${panelTitle} (JSON)`,
                type: 'textarea',
                value: '',
                placeholder: '{ "groups":[...], "actions":["show"] }'
            },
            logicApplyTo: {
                label: `${panelTitle}: Apply To`,
                type: 'select',
                value: 'self',
                options: {
                    self: 'This Field',
                    container: 'Field Container',
                    group: 'Logic Group (below)'
                }
            },
            logicGroup: {
                label: `${panelTitle}: Group ID`,
                type: 'text',
                value: '',
                placeholder: 'e.g., vehicleDetails'
            }
        };
    });

    function inferFieldsFromBuilderJson(): FieldMeta[] {
        try {
            // formBuilder exposes the active instance via jQuery selection; we can sniff current JSON if needed.
            const stage = (window as any).jQuery?.('.build-wrap');
            const inst = stage?.data('formBuilder');
            const json = inst?.actions?.getData?.('json');
            const arr = typeof json === 'string' ? JSON.parse(json) : Array.isArray(json) ? json : [];
            return arr.filter((f: any) => f?.name).map((f: any) => ({
                name: f.name,
                type: f.type,
                label: f.label,
                values: Array.isArray(f.values) ? f.values.map((v: any) => ({ label: v.label ?? v.value, value: v.value })) : undefined
            }));
        } catch { return []; }
    }

    function getFields(): FieldMeta[] {
        try {
            const custom = opts.getAvailableFields?.();
            if (custom && custom.length) return custom;
        } catch { }
        return inferFieldsFromBuilderJson();
    }

    function getValuesFor(fieldName: string): Array<{ label: string; value: string }> | null {
        try {
            const custom = opts.getFieldValues?.(fieldName);
            if (custom) return custom;
        } catch { }
        const fm = getFields().find(f => f.name === fieldName);
        return fm?.values ?? null;
    }

    function makeVE(
        htmlParent: HTMLElement,
        getTextArea: () => HTMLTextAreaElement,
        getApplyTo: () => HTMLSelectElement,
        getGroupId: () => HTMLInputElement
    ) {
        // outer wrapper
        const ve = document.createElement('div');
        ve.className = 'fb-logic-ve';
        ve.style.marginBottom = '8px';

        // header (outside the dashed border)
        const hdr = document.createElement('div');
        hdr.className = 'fb-logic-ve-header';
        hdr.style.marginTop = '0px';
        hdr.style.fontWeight = '600';
        hdr.innerHTML = `Visual Rules Editor <span style="font-size:12px;opacity:.7;font-weight:400;">(no JSON typing)</span>`;
        ve.appendChild(hdr);

        // bordered body
        const veBody = document.createElement('div');
        veBody.className = 'fb-logic-ve-body';
        veBody.style.border = '1px dashed #cbd5e1';
        veBody.style.padding = '8px';
        veBody.style.marginTop = '6px';
        ve.appendChild(veBody);

        // ---- contents go inside veBody ----

        // mode
        const modeWrap = document.createElement('div');
        modeWrap.style.margin = '6px 0';
        modeWrap.innerHTML = `
    <label style="margin-right:8px;">Mode</label>
    <select class="ve-mode form-select form-select-sm" style="display:inline-block; width:auto;">
      <option value="any">ANY (OR)</option>
      <option value="all">ALL (AND)</option>
    </select>
  `;
        veBody.appendChild(modeWrap);

        // actions
        const actionsWrap = document.createElement('div');
        actionsWrap.style.margin = '6px 0';
        actionsWrap.innerHTML = `
    <label style="margin-right:8px;">Actions</label>
    <label class="form-check form-check-inline"><input class="form-check-input ve-act" type="checkbox" value="show" checked> <span class="form-check-label">show</span></label>
    <label class="form-check form-check-inline"><input class="form-check-input ve-act" type="checkbox" value="require"> <span class="form-check-label">require</span></label>
    <label class="form-check form-check-inline"><input class="form-check-input ve-act" type="checkbox" value="enable"> <span class="form-check-label">enable</span></label>
    <label class="form-check form-check-inline"><input class="form-check-input ve-act" type="checkbox" value="disable"> <span class="form-check-label">disable</span></label>
    <label class="form-check form-check-inline"><input class="form-check-input ve-act" type="checkbox" value="hide"> <span class="form-check-label">hide</span></label>
  `;
        veBody.appendChild(actionsWrap);

        // rules container
        const rules = document.createElement('div');
        rules.className = 've-rules';
        veBody.appendChild(rules);

        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.className = 'btn btn-sm btn-outline-primary';
        addBtn.textContent = 'Add rule';
        addBtn.style.marginTop = '8px';
        veBody.appendChild(addBtn);

        function row(field?: string, op?: string, value?: string) {
            const row = document.createElement('div');
            row.className = 've-row';
            row.style.display = 'grid';
            row.style.gridTemplateColumns = '1fr 1fr 1fr auto';
            row.style.gap = '6px';
            row.style.marginTop = '6px';

            // field select
            const fSel = document.createElement('select');
            fSel.className = 'form-select form-select-sm ve-field';
            getFields().forEach(f => {
                const opt = document.createElement('option');
                opt.value = f.name;
                opt.textContent = f.label ? `${f.label} (${f.name})` : f.name;
                fSel.appendChild(opt);
            });
            if (field) fSel.value = field;

            // operator select
            const oSel = document.createElement('select');
            oSel.className = 'form-select form-select-sm ve-op';

            function setOpsForField(fn: string) {
                const fm = getFields().find(f => f.name === fn);
                const isNum = fm?.type === 'number';
                const isChoice = fm?.type === 'radio-group' || fm?.type === 'select' || !!fm?.values?.length;
                const ops = isNum
                    ? ['equals', 'notEquals', 'gt', 'gte', 'lt', 'lte', 'isEmpty', 'notEmpty']
                    : isChoice
                        ? ['equals', 'notEquals', 'isEmpty', 'notEmpty']
                        : ['equals', 'notEquals', 'contains', 'startsWith', 'endsWith', 'isEmpty', 'notEmpty'];
                oSel.innerHTML = '';
                ops.forEach(o => {
                    const opt = document.createElement('option');
                    opt.value = o;
                    opt.textContent = o;
                    oSel.appendChild(opt);
                });
            }

            setOpsForField(fSel.value);
            if (op) oSel.value = op;

            // value control (select or input)
            const vWrap = document.createElement('div');
            vWrap.className = 've-value-wrap';

            function renderValueControl(fn: string, current?: string) {
                vWrap.innerHTML = '';
                const choices = getValuesFor(fn);
                if (choices && choices.length) {
                    const s = document.createElement('select');
                    s.className = 'form-select form-select-sm ve-value';
                    choices.forEach(c => {
                        const option = document.createElement('option');
                        option.value = c.value;
                        option.textContent = c.label ?? c.value;
                        s.appendChild(option);
                    });
                    if (current) s.value = current;
                    vWrap.appendChild(s);
                } else {
                    const i = document.createElement('input');
                    i.type = 'text';
                    i.className = 'form-control form-control-sm ve-value';
                    if (current) i.value = current;
                    vWrap.appendChild(i);
                }
            }

            renderValueControl(fSel.value, value);

            // remove btn
            const rm = document.createElement('button');
            rm.type = 'button';
            rm.className = 'btn btn-sm btn-link text-danger';
            rm.textContent = 'remove';

            // interactions
            fSel.addEventListener('change', () => {
                setOpsForField(fSel.value);
                renderValueControl(fSel.value);
            });
            rm.addEventListener('click', () => row.remove());

            // mount
            row.appendChild(fSel);
            row.appendChild(oSel);
            row.appendChild(vWrap);
            row.appendChild(rm);
            rules.appendChild(row);
        }

        addBtn.addEventListener('click', () => row());

        // Save button
        const save = document.createElement('button');
        save.type = 'button';
        save.className = 'btn btn-sm btn-primary';
        save.textContent = 'Save to JSON';
        save.style.marginTop = '8px';
        save.style.marginLeft = '8px';
        veBody.appendChild(save);

        save.addEventListener('click', () => {
            const _mode = (veBody.querySelector('.ve-mode') as HTMLSelectElement).value as 'any' | 'all';
            const _actions = Array.from(veBody.querySelectorAll('.ve-act') as NodeListOf<HTMLInputElement>)
                .filter(i => i.checked).map(i => i.value) as Array<'show' | 'hide' | 'enable' | 'disable' | 'require'>;
            const ruleRows = Array.from(veBody.querySelectorAll('.ve-row'));
            const rules = ruleRows.map(r => {
                const f = (r.querySelector('.ve-field') as HTMLSelectElement).value;
                const o = (r.querySelector('.ve-op') as HTMLSelectElement).value;
                const valEl = (r.querySelector('.ve-value') as HTMLInputElement | HTMLSelectElement);
                const v = (valEl as any).value ?? '';
                return { field: f, op: o as any, value: v };
            });
            const cfg = { groups: [{ mode: _mode, rules, actions: _actions }] };
            (getTextArea()).value = JSON.stringify(cfg, null, 2);
            alert('Conditional Logic JSON updated.\nTip: you can switch back to Visual to adjust again.');
        });

        // Preload from JSON, if present
        try {
            const raw = (getTextArea()).value;
            if (raw && raw.trim()) {
                const parsed = JSON.parse(raw);
                const g = Array.isArray(parsed.groups) ? parsed.groups[0] : null;
                if (g) {
                    (veBody.querySelector('.ve-mode') as HTMLSelectElement).value = g.mode || 'any';
                    const acts = new Set((g.actions || []) as string[]);
                    veBody.querySelectorAll('.ve-act').forEach((i: any) => { i.checked = acts.has(i.value); });
                    (g.rules || []).forEach((r: any) => row(r.field, r.op, r.value));
                }
            }
        } catch { /* ignore */ }

        // mount entire VE block
        htmlParent.prepend(ve);
    }


    function onOpenFieldEdit(editPanel: HTMLElement) {
        const logicControls = Array.from(
            editPanel.querySelectorAll('[name="logic"], [name="logicApplyTo"], [name="logicGroup"]')
        ) as HTMLElement[];
        if (!logicControls.length) return;

        // Ensure the outer Conditional Logic section exists
        let section = editPanel.querySelector('.fb-logic-section') as HTMLElement | null;
        if (!section) {
            section = document.createElement('div');
            section.className = 'fb-logic-section';
            section.innerHTML = `
        <div class="fb-logic-header" style="margin-top:8px; font-weight:600; cursor:pointer;">
          ${panelTitle}
          <span style="font-weight:400; font-size:12px; opacity:.7"> (toggle)</span>
        </div>
        <div class="fb-logic-body" style="border:1px solid #e5e7eb; padding:8px; margin-top:6px; display:none;"></div>
      `;
            editPanel.appendChild(section);

            const header = section.querySelector('.fb-logic-header') as HTMLElement;
            const body = section.querySelector('.fb-logic-body') as HTMLElement;
            header.addEventListener('click', () => {
                const open = body.style.display !== 'none';
                body.style.display = open ? 'none' : '';
            });
        }

        const body = section!.querySelector('.fb-logic-body') as HTMLElement;

        // ---------- Visual Rules Editor (top, only mount once) ----------
        if (enableVE) {
            const getTextArea = () => body.querySelector('[name="logic"]') as HTMLTextAreaElement;
            const getApplyTo = () => body.querySelector('[name="logicApplyTo"]') as HTMLSelectElement;
            const getGroupId = () => body.querySelector('[name="logicGroup"]') as HTMLInputElement;

            // Guard: only one VE
            if (!body.querySelector('.fb-logic-ve')) {
                // Clean any legacy dupes (just in case)
                const dupes = body.querySelectorAll('.fb-logic-ve');
                if (dupes.length > 1) dupes.forEach((el, idx) => { if (idx > 0) el.remove(); });

                makeVE(body, getTextArea, getApplyTo, getGroupId);
            }
        }

        // ---------- Advanced (JSON) panel (wrapped + collapsed by default) ----------
        // Build the advanced container if needed
        let adv = body.querySelector('.fb-logic-advanced') as HTMLElement | null;
        if (!adv) {
            adv = document.createElement('div');
            adv.className = 'fb-logic-advanced';
            adv.innerHTML = `
        <div class="fb-logic-adv-header" style="margin-top:10px; font-weight:600; cursor:pointer;">
          Advanced (JSON)
          <span style="font-weight:400; font-size:12px; opacity:.7"> (toggle)</span>
        </div>
        <div class="fb-logic-adv-body" style="
          border:1px dashed #cbd5e1;
          padding:8px;
          margin-top:6px;
          display:none; /* collapsed by default */
        "></div>
      `;
            body.appendChild(adv);

            const advHeader = adv.querySelector('.fb-logic-adv-header') as HTMLElement;
            const advBody = adv.querySelector('.fb-logic-adv-body') as HTMLElement;
            advHeader.addEventListener('click', () => {
                const open = advBody.style.display !== 'none';
                advBody.style.display = open ? 'none' : '';
            });
        }

        // Move the original controls into the Advanced box content
        const advBody = adv!.querySelector('.fb-logic-adv-body') as HTMLElement;
        logicControls.forEach(el => {
            const row = el.closest('.form-group') || el.closest('div') || el;
            if (row && row.parentElement !== advBody) advBody.appendChild(row as HTMLElement);
        });

        // Guard: if somehow controls were duplicated by upstream UI reflows, keep one
        const seen = new Set<string>();
        advBody.querySelectorAll<HTMLElement>('[name="logic"], [name="logicApplyTo"], [name="logicGroup"]').forEach(ctrl => {
            const n = ctrl.getAttribute('name')!;
            if (seen.has(n)) {
                const dupRow = ctrl.closest('.form-group') || ctrl.closest('div') || ctrl;
                if (dupRow && dupRow.parentElement === advBody) (dupRow as HTMLElement).remove();
            } else {
                seen.add(n);
            }
        });
    }


    return { typeUserAttrs, onOpenFieldEdit };
}

/**
 * Form-level groups JSON manager (as before)
 */
export function attachLogicGroupsManager(targetContainer: HTMLElement, initialJson: string = '') {
    const state = { json: initialJson };

    const wrapper = document.createElement('div');
    wrapper.style.margin = '8px 0';
    wrapper.innerHTML = `
    <button type="button" class="btn btn-sm btn-outline-primary">Logic Groups</button>
    <div class="fb-logic-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:99999;">
      <div style="background:#fff; max-width:720px; width:92%; margin:5% auto; padding:16px; border-radius:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <strong>Logic Groups (JSON)</strong>
          <button type="button" class="btn btn-sm btn-light fb-logic-close">Close</button>
        </div>
        <p style="font-size:12px; margin-top:0; opacity:.7;">
          Define reusable groups: { "vehicleDetails": { "mode":"any", "rules":[...], "actions":["show","require"] } }
        </p>
        <textarea class="fb-logic-json" style="width:100%; height:300px; font-family:monospace;"></textarea>
        <div style="margin-top:8px; display:flex; gap:8px; justify-content:flex-end;">
          <button type="button" class="btn btn-secondary fb-logic-load-sample">Load sample</button>
          <button type="button" class="btn btn-primary fb-logic-save">Save</button>
        </div>
      </div>
    </div>
  `;
    targetContainer.prepend(wrapper);

    const btn = wrapper.querySelector('button') as HTMLButtonElement;
    const modal = wrapper.querySelector('.fb-logic-modal') as HTMLDivElement;
    const closeBtn = modal.querySelector('.fb-logic-close') as HTMLButtonElement;
    const ta = modal.querySelector('.fb-logic-json') as HTMLTextAreaElement;
    const loadSample = modal.querySelector('.fb-logic-load-sample') as HTMLButtonElement;
    const saveBtn = modal.querySelector('.fb-logic-save') as HTMLButtonElement;

    const open = () => { ta.value = state.json || ''; modal.style.display = 'block'; };
    const close = () => { modal.style.display = 'none'; };

    btn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

    loadSample.addEventListener('click', () => {
        ta.value = JSON.stringify({
            vehicleDetails: {
                mode: "any",
                rules: [{ field: "hasVehicle", op: "equals", value: "yes" }],
                actions: ["show", "require"]
            }
        }, null, 2);
    });

    saveBtn.addEventListener('click', () => {
        state.json = ta.value;
        try {
            const parsed = JSON.parse(state.json);
            (window as any).fbLogicGroups = parsed;
            alert('Logic groups saved to window.fbLogicGroups');
            close();
        } catch {
            alert('Invalid JSON');
        }
    });

    return {
        getJson: () => state.json,
        setJson: (j: string) => { state.json = j; },
        getGroups: () => {
            try { return JSON.parse(state.json || '{}'); } catch { return {}; }
        }
    };
}
