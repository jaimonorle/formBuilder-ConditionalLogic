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
export function attachLogicGroupsManager(
    targetContainer: HTMLElement,
    initialOrOpts?: string | {
        initialJson?: string;
        getAvailableFields?: () => FieldMeta[];
        getFieldValues?: (fieldName: string) => Array<{ label: string; value: string }> | null;
    }
) {
    const opts = (typeof initialOrOpts === 'string')
        ? { initialJson: initialOrOpts }
        : (initialOrOpts || {});

    const state = {
        json: opts.initialJson || '',
    };

    // Helpers to obtain fields/values (mirror the per-field hooks)
    function inferFieldsFromBuilderJson(): FieldMeta[] {
        try {
            const stage = (window as any).jQuery?.('.build-wrap');
            const inst = stage?.data?.('formBuilder');
            const json = inst?.actions?.getData?.('json');
            const arr = typeof json === 'string' ? JSON.parse(json) : Array.isArray(json) ? json : [];
            return arr.filter((f: any) => f?.name).map((f: any) => ({
                name: f.name, type: f.type, label: f.label,
                values: Array.isArray(f.values) ? f.values.map((v: any) => ({ label: v.label ?? v.value, value: v.value })) : undefined
            }));
        } catch { return []; }
    }

    function getFields(): FieldMeta[] {
        try { const custom = opts.getAvailableFields?.(); if (custom && custom.length) return custom; } catch { }
        return inferFieldsFromBuilderJson();
    }

    function getValuesFor(fieldName: string): Array<{ label: string; value: string }> | null {
        try { const custom = opts.getFieldValues?.(fieldName); if (custom) return custom; } catch { }
        const fm = getFields().find(f => f.name === fieldName);
        return fm?.values ?? null;
    }

    // ----- UI scaffold (button + modal) -----
    const wrapper = document.createElement('div');
    wrapper.style.margin = '8px 0';
    wrapper.innerHTML = `
    <button type="button" class="btn btn-sm btn-outline-primary">Logic Groups</button>
    <div class="fb-logic-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:99999;">
      <div style="background:#fff; max-width:900px; width:92%; margin:4% auto; padding:16px; border-radius:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:8px;">
          <strong style="font-size:16px;">Logic Groups</strong>
          <div style="display:flex; gap:8px;">
            <button type="button" class="btn btn-sm btn-secondary fb-groups-load-sample">Load sample</button>
            <button type="button" class="btn btn-sm btn-outline-secondary fb-groups-from-json">From JSON</button>
            <button type="button" class="btn btn-sm btn-primary fb-groups-save">Save</button>
            <button type="button" class="btn btn-sm btn-light fb-logic-close">Close</button>
          </div>
        </div>

        <!-- Visual Editor header outside border -->
        <div class="fb-groups-ve-header" style="font-weight:600;">Visual Groups Editor
          <span style="font-size:12px;opacity:.7;font-weight:400;">(no JSON typing)</span>
        </div>
        <div class="fb-groups-ve-body" style="border:1px dashed #cbd5e1; padding:8px; margin-top:6px;">
          <div class="fb-groups-list"></div>
          <button type="button" class="btn btn-sm btn-outline-primary fb-groups-add" style="margin-top:8px;">Add group</button>
        </div>

        <!-- Advanced (collapsed by default) -->
        <div class="fb-groups-adv" style="margin-top:10px;">
          <div class="fb-groups-adv-header" style="font-weight:600; cursor:pointer;">
            Advanced (JSON)
            <span style="font-size:12px;opacity:.7;font-weight:400;">(toggle)</span>
          </div>
          <div class="fb-groups-adv-body" style="border:1px dashed #cbd5e1; padding:8px; margin-top:6px; display:none;">
            <p style="font-size:12px; margin: 0 0 6px 0; opacity:.75;">
              Define reusable groups keyed by ID. Example:
            </p>
            <pre style="background:#f8fafc; padding:6px; border-radius:6px; font-size:12px; margin-top:0;">{
  "vehicleDetails": {
    "mode": "any",
    "rules": [{ "field": "hasVehicle", "op": "equals", "value": "yes" }],
    "actions": ["show", "require"]
  }
}</pre>
            <textarea class="fb-logic-json" style="width:100%; height:240px; font-family:monospace;"></textarea>
          </div>
        </div>
      </div>
    </div>
  `;
    targetContainer.prepend(wrapper);

    const btn = wrapper.querySelector('button') as HTMLButtonElement;
    const modal = wrapper.querySelector('.fb-logic-modal') as HTMLDivElement;
    const closeBtn = modal.querySelector('.fb-logic-close') as HTMLButtonElement;
    const loadBtn = modal.querySelector('.fb-groups-load-sample') as HTMLButtonElement;
    const saveBtn = modal.querySelector('.fb-groups-save') as HTMLButtonElement;
    const fromJson = modal.querySelector('.fb-groups-from-json') as HTMLButtonElement;
    const advHdr = modal.querySelector('.fb-groups-adv-header') as HTMLDivElement;
    const advBody = modal.querySelector('.fb-groups-adv-body') as HTMLDivElement;
    const ta = modal.querySelector('.fb-logic-json') as HTMLTextAreaElement;

    const listEl = modal.querySelector('.fb-groups-list') as HTMLDivElement;
    const addBtn = modal.querySelector('.fb-groups-add') as HTMLButtonElement;

    const open = () => {
        // Initial source: window.fbLogicGroups → state.json → textarea → VE
        const srcObj = (window as any).fbLogicGroups && typeof (window as any).fbLogicGroups === 'object'
            ? (window as any).fbLogicGroups
            : (state.json ? safeParse(state.json) : {});
        state.json = JSON.stringify(srcObj || {}, null, 2);
        ta.value = state.json;
        // Rebuild VE from current JSON
        renderFromJson(srcObj || {});
        modal.style.display = 'block';
    };
    const close = () => { modal.style.display = 'none'; };

    btn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

    advHdr.addEventListener('click', () => {
        const open = advBody.style.display !== 'none';
        advBody.style.display = open ? 'none' : '';
    });

    loadBtn.addEventListener('click', () => {
        const sample = {
            vehicleDetails: {
                mode: 'any',
                rules: [{ field: 'hasVehicle', op: 'equals', value: 'yes' }],
                actions: ['show', 'require']
            }
        };
        ta.value = JSON.stringify(sample, null, 2);
        renderFromJson(sample);
    });

    fromJson.addEventListener('click', () => {
        const parsed = safeParse(ta.value) || {};
        renderFromJson(parsed);
    });

    saveBtn.addEventListener('click', () => {
        const obj = collectFromVe();
        state.json = JSON.stringify(obj, null, 2);
        ta.value = state.json;
        (window as any).fbLogicGroups = obj;
        alert('Logic groups saved (visual & JSON). Available as window.fbLogicGroups.');
        close();
    });

    addBtn.addEventListener('click', () => addGroupBlock());

    // ---- VE rendering helpers ----
    function safeParse(txt: string): any | null {
        try { return JSON.parse(txt); } catch { return null; }
    }

    function clearChildren(node: HTMLElement) {
        while (node.firstChild) node.removeChild(node.firstChild);
    }

    function addGroupBlock(groupId: string = '') {
        const groupWrap = document.createElement('div');
        groupWrap.className = 'fb-group-block';
        groupWrap.style.border = '1px solid #e5e7eb';
        groupWrap.style.borderRadius = '6px';
        groupWrap.style.padding = '8px';
        groupWrap.style.marginTop = '8px';

        // Header: Group ID outside inner body
        const header = document.createElement('div');
        header.style.display = 'grid';
        header.style.gridTemplateColumns = '1fr auto';
        header.style.gap = '8px';
        header.style.alignItems = 'center';

        const idInput = document.createElement('input');
        idInput.className = 'form-control form-control-sm fb-group-id';
        idInput.placeholder = 'Group ID (e.g., vehicleDetails)';
        idInput.value = groupId;

        const delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'btn btn-sm btn-link text-danger';
        delBtn.textContent = 'remove group';
        delBtn.addEventListener('click', () => groupWrap.remove());

        header.appendChild(idInput);
        header.appendChild(delBtn);
        groupWrap.appendChild(header);

        // Body: dashed box like VE/Advanced bodies
        const body = document.createElement('div');
        body.style.border = '1px dashed #cbd5e1';
        body.style.padding = '8px';
        body.style.marginTop = '6px';
        groupWrap.appendChild(body);

        // Mode + Actions
        const top = document.createElement('div');
        top.style.display = 'flex';
        top.style.flexWrap = 'wrap';
        top.style.gap = '12px';
        top.style.alignItems = 'center';
        top.style.marginBottom = '6px';

        const modeLbl = document.createElement('label');
        modeLbl.textContent = 'Mode';
        const modeSel = document.createElement('select');
        modeSel.className = 'form-select form-select-sm fb-group-mode';
        ['any', 'all'].forEach(v => {
            const opt = document.createElement('option');
            opt.value = v; opt.textContent = v.toUpperCase() + (v === 'any' ? ' (OR)' : ' (AND)');
            modeSel.appendChild(opt);
        });

        const actionsWrap = document.createElement('div');
        actionsWrap.innerHTML = `
      <label style="margin-right:8px;">Actions</label>
      <label class="form-check form-check-inline"><input class="form-check-input fb-act" type="checkbox" value="show" checked> <span class="form-check-label">show</span></label>
      <label class="form-check form-check-inline"><input class="form-check-input fb-act" type="checkbox" value="require"> <span class="form-check-label">require</span></label>
      <label class="form-check form-check-inline"><input class="form-check-input fb-act" type="checkbox" value="enable"> <span class="form-check-label">enable</span></label>
      <label class="form-check form-check-inline"><input class="form-check-input fb-act" type="checkbox" value="disable"> <span class="form-check-label">disable</span></label>
      <label class="form-check form-check-inline"><input class="form-check-input fb-act" type="checkbox" value="hide"> <span class="form-check-label">hide</span></label>
    `;

        const topLeft = document.createElement('div');
        topLeft.appendChild(modeLbl);
        topLeft.appendChild(document.createTextNode(' '));
        topLeft.appendChild(modeSel);

        top.appendChild(topLeft);
        top.appendChild(actionsWrap);
        body.appendChild(top);

        // Rules list
        const rulesList = document.createElement('div');
        rulesList.className = 'fb-group-rules';
        body.appendChild(rulesList);

        const addRuleBtn = document.createElement('button');
        addRuleBtn.type = 'button';
        addRuleBtn.className = 'btn btn-sm btn-outline-primary';
        addRuleBtn.textContent = 'Add rule';
        addRuleBtn.style.marginTop = '8px';
        body.appendChild(addRuleBtn);

        function addRuleRow(field?: string, op?: string, value?: string) {
            const row = document.createElement('div');
            row.className = 'fb-group-rule';
            row.style.display = 'grid';
            row.style.gridTemplateColumns = '1fr 1fr 1fr auto';
            row.style.gap = '6px';
            row.style.marginTop = '6px';

            // Field select
            const fSel = document.createElement('select');
            fSel.className = 'form-select form-select-sm fb-rule-field';
            getFields().forEach(f => {
                const opt = document.createElement('option');
                opt.value = f.name;
                opt.textContent = f.label ? `${f.label} (${f.name})` : f.name;
                fSel.appendChild(opt);
            });
            if (field) fSel.value = field;

            // Operator
            const oSel = document.createElement('select');
            oSel.className = 'form-select form-select-sm fb-rule-op';

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
                    opt.value = o; opt.textContent = o;
                    oSel.appendChild(opt);
                });
            }

            setOpsForField(fSel.value);
            if (op) oSel.value = op;

            // Value control
            const vWrap = document.createElement('div');
            vWrap.className = 'fb-rule-value-wrap';

            function renderValueControl(fn: string, current?: string) {
                vWrap.innerHTML = '';
                const choices = getValuesFor(fn);
                if (choices && choices.length) {
                    const s = document.createElement('select');
                    s.className = 'form-select form-select-sm fb-rule-value';
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
                    i.className = 'form-control form-control-sm fb-rule-value';
                    if (current) i.value = current;
                    vWrap.appendChild(i);
                }
            }

            renderValueControl(fSel.value, value);

            // Remove rule
            const rm = document.createElement('button');
            rm.type = 'button';
            rm.className = 'btn btn-sm btn-link text-danger';
            rm.textContent = 'remove';
            rm.addEventListener('click', () => row.remove());

            // interactions
            fSel.addEventListener('change', () => {
                setOpsForField(fSel.value);
                renderValueControl(fSel.value);
            });

            // mount
            row.appendChild(fSel);
            row.appendChild(oSel);
            row.appendChild(vWrap);
            row.appendChild(rm);
            rulesList.appendChild(row);
        }

        addRuleBtn.addEventListener('click', () => addRuleRow());

        // Expose a tiny API to preset values
        (groupWrap as any)._set = (cfg: { mode?: string; actions?: string[]; rules?: any[] }) => {
            if (cfg?.mode) (modeSel.value = cfg.mode);
            const acts = new Set(cfg?.actions || []);
            (actionsWrap.querySelectorAll('.fb-act') as NodeListOf<HTMLInputElement>).forEach(i => { i.checked = acts.has(i.value); });
            clearChildren(rulesList);
            (cfg?.rules || []).forEach((r: any) => addRuleRow(r.field, r.op, r.value));
        };

        listEl.appendChild(groupWrap);
        return groupWrap;
    }

    function renderFromJson(obj: Record<string, any>) {
        clearChildren(listEl);
        const keys = Object.keys(obj || {});
        if (!keys.length) {
            // Start with one blank group
            addGroupBlock();
            return;
        }
        keys.forEach(k => {
            const g = obj[k] || {};
            const block = addGroupBlock(k);
            (block as any)._set({ mode: g.mode || 'any', actions: g.actions || [], rules: g.rules || [] });
        });
    }

    function collectFromVe(): Record<string, any> {
        const result: Record<string, any> = {};
        const blocks = Array.from(listEl.querySelectorAll('.fb-group-block'));
        blocks.forEach(b => {
            const id = (b.querySelector('.fb-group-id') as HTMLInputElement).value.trim();
            if (!id) return; // skip unnamed
            const mode = (b.querySelector('.fb-group-mode') as HTMLSelectElement).value as 'any' | 'all';
            const actions = Array.from(b.querySelectorAll('.fb-act') as NodeListOf<HTMLInputElement>)
                .filter(i => i.checked).map(i => i.value);
            const rules: any[] = [];
            b.querySelectorAll('.fb-group-rule').forEach(r => {
                const field = (r.querySelector('.fb-rule-field') as HTMLSelectElement)?.value;
                const op = (r.querySelector('.fb-rule-op') as HTMLSelectElement)?.value;
                const valEl = (r.querySelector('.fb-rule-value') as HTMLInputElement | HTMLSelectElement);
                const value = (valEl as any)?.value ?? '';
                if (field && op) rules.push({ field, op, value });
            });
            result[id] = { mode, rules, actions };
        });
        return result;
    }

    return {
        getJson: () => state.json,
        setJson: (j: string) => { state.json = j; },
        getGroups: () => safeParse(state.json || '{}') || {},
    };
}

