// src/plugin/builder.ts
/**
 * Builder plugin for formBuilder: adds Conditional Logic panel and Groups modal.
 * Exports:
 *  - withConditionalLogic(opts) → formBuilder options extension
 *  - attachLogicGroupsManager(toolbarEl, hooks)
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
    getAvailableFields?: () => FieldMeta[];
    getFieldValues?: (fieldName: string) => Array<{ label: string; value: string }> | null;
    enableVisualEditor?: boolean;
}

const DEFAULT_TYPES = [
    'text', 'textarea', 'number', 'select', 'radio-group', 'checkbox-group',
    'date', 'paragraph', 'header', 'file', 'autocomplete'
];

// -------------------------------------------------------------
// Utility: safely read option values for a field from schema
// Works even if inferFieldsFromBuilderJson() isn't present.
// -------------------------------------------------------------
type FbChoice = { value?: string | number; label?: string; text?: string };
type FbField = { name?: string; label?: string; type?: string; values?: FbChoice[]; options?: FbChoice[] };

function getFieldValuesSafe(forField: string): Array<{ value: string; label: string }> {
    try {
        // Prefer a project-provided helper if it exists, otherwise fallback to empty
        const fields: FbField[] =
            ((globalThis as any).inferFieldsFromBuilderJson?.() ?? []) as FbField[];

        const f = fields.find(x => x?.name === forField);
        const raw = (f?.values ?? f?.options ?? []) as FbChoice[];

        return raw
            .map((x: FbChoice) => {
                const value =
                    (typeof x?.value === 'number' ? String(x.value) : (x?.value as string)) ?? '';
                const label = (x?.label ?? x?.text ?? value) as string;
                return { value, label };
            })
            .filter(x => x.value !== '');
    } catch {
        return [];
    }
}



/** Build the options object to pass into $('.build-wrap').formBuilder(...) */
export function withConditionalLogic(opts: BuilderInitOptions = {}) {
    const panelTitle = opts.panelTitle || 'Conditional Logic';
    const types = (opts.types && opts.types.length ? opts.types : DEFAULT_TYPES);
    const enableVE = opts.enableVisualEditor !== false;

    // 1) inject custom user attrs so formBuilder shows inputs in the field edit panel
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
            const stage = (window as any).jQuery?.('.build-wrap');
            const inst = stage?.data('formBuilder');
            const json = inst?.actions?.getData?.('json');
            const arr = typeof json === 'string' ? JSON.parse(json) : (Array.isArray(json) ? json : []);
            return arr.filter((f: any) => f?.name).map((f: any) => ({
                name: f.name,
                type: f.type,
                label: f.label,
                values: Array.isArray(f.values)
                    ? f.values.map((v: any) => ({ label: v.label ?? v.value, value: v.value }))
                    : undefined
            }));
        } catch { return []; }
    }

    const getFields = (): FieldMeta[] => {
        try {
            const custom = opts.getAvailableFields?.();
            if (custom && custom.length) return custom;
        } catch { }
        return inferFieldsFromBuilderJson();
    };

    const getValuesFor = (fieldName: string): Array<{ label: string; value: string }> | null => {
        try {
            const custom = opts.getFieldValues?.(fieldName);
            if (custom) return custom;
        } catch { }
        const fm = getFields().find(f => f.name === fieldName);
        return fm?.values ?? null;
    };

    /** Build the little visual-editor that writes JSON into the textarea */
    function makeVE(
        htmlParent: HTMLElement,
        getTextArea: () => HTMLTextAreaElement,
        getApplyTo: () => HTMLSelectElement,
        getGroupId: () => HTMLInputElement
    ) {
        // container
        const ve = document.createElement('div');
        ve.className = 'fb-logic-ve';
        ve.style.marginBottom = '8px';

        // header
        const hdr = document.createElement('div');
        hdr.style.display = 'flex';
        hdr.style.gap = '6px';
        hdr.style.alignItems = 'center';
        const title = document.createElement('strong');
        title.textContent = 'Conditional Logic (Visual)';
        const tip = document.createElement('span');
        tip.style.fontSize = '12px';
        tip.style.opacity = '0.7';
        tip.textContent = '— use this editor then save to JSON below';
        hdr.appendChild(title);
        hdr.appendChild(tip);
        ve.appendChild(hdr);

        // body
        const veBody = document.createElement('div');
        veBody.className = 'fb-logic-ve-body';
        veBody.style.border = '1px dashed #cbd5e1';
        veBody.style.padding = '8px';
        veBody.style.marginTop = '6px';
        ve.appendChild(veBody);

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
    <label class="form-check form-check-inline"><input class="ve-act form-check-input" type="checkbox" value="show" checked> <span class="form-check-label">show</span></label>
    <label class="form-check form-check-inline"><input class="ve-act form-check-input" type="checkbox" value="require"> <span class="form-check-label">require</span></label>
    <label class="form-check form-check-inline"><input class="ve-act form-check-input" type="checkbox" value="enable"> <span class="form-check-label">enable</span></label>
    <label class="form-check form-check-inline"><input class="ve-act form-check-input" type="checkbox" value="disable"> <span class="form-check-label">disable</span></label>
    <label class="form-check form-check-inline"><input class="ve-act form-check-input" type="checkbox" value="hide"> <span class="form-check-label">hide</span></label>
  `;
        veBody.appendChild(actionsWrap);

        // rules list
        const rules = document.createElement('div');
        rules.className = 've-rules';
        rules.style.marginTop = '6px';
        rules.style.display = 'grid';
        rules.style.gap = '6px';
        veBody.appendChild(rules);

        // footer: Add rule + Save (moved here)
        const footer = document.createElement('div');
        footer.style.display = 'flex';
        footer.style.justifyContent = 'flex-end';
        footer.style.gap = '8px';
        footer.style.marginTop = '8px';

        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.className = 'btn btn-sm btn-outline-secondary';
        addBtn.textContent = 'Add rule';

        const save = document.createElement('button');
        save.type = 'button';
        save.className = 'btn btn-sm btn-primary';
        save.textContent = 'Save to JSON';

        footer.appendChild(addBtn);
        footer.appendChild(save);
        veBody.appendChild(footer);

        // helpers that always read the latest fields/values
        const getFieldsNow = (): Array<{ name: string; label?: string; type?: string; values?: { label: string; value: string }[] }> => {
            try {
                // Prefer provider the builder passed to withConditionalLogic()
                const stage = (window as any).jQuery?.('.build-wrap');
                const inst = stage?.data?.('formBuilder');
                const data = inst?.actions?.getData?.('json');
                const arr = typeof data === 'string' ? JSON.parse(data) : (Array.isArray(data) ? data : []);
                return arr.filter((f: any) => f?.name).map((f: any) => ({
                    name: f.name, type: f.type, label: f.label,
                    values: Array.isArray(f.values) ? f.values.map((v: any) => ({ label: v.label ?? v.value, value: v.value })) : undefined
                }));
            } catch { return []; }
        };

        const getChoicesFor = (fieldName: string) => {
            const fm = getFieldsNow().find(f => f.name === fieldName);
            return fm?.values ?? null;
        };

        const buildFieldSelect = () => {
            const sel = document.createElement('select');
            sel.className = 've-field form-select form-select-sm';
            sel.style.minWidth = '160px';
            const fields = getFieldsNow();
            if (!fields.length) {
                const opt = document.createElement('option');
                opt.value = '';
                opt.textContent = '(no fields yet)';
                sel.appendChild(opt);
            } else {
                fields.forEach(f => {
                    const opt = document.createElement('option');
                    opt.value = f.name;
                    opt.textContent = f.label ? `${f.label} (${f.name})` : f.name;
                    sel.appendChild(opt);
                });
            }
            return sel;
        };

        const buildOpSelect = (forField: string) => {
            const sel = document.createElement('select');
            sel.className = 've-op form-select form-select-sm';
            sel.style.minWidth = '140px';
            const fm = getFieldsNow().find(f => f.name === forField);
            const isNum = fm?.type === 'number';
            const isChoice = fm?.type === 'radio-group' || fm?.type === 'select' || !!fm?.values?.length;
            const ops = isNum
                ? ['equals', 'notEquals', 'gt', 'gte', 'lt', 'lte', 'isEmpty', 'notEmpty']
                : isChoice
                    ? ['equals', 'notEquals', 'isEmpty', 'notEmpty']
                    : ['equals', 'notEquals', 'contains', 'startsWith', 'endsWith', 'isEmpty', 'notEmpty'];
            sel.innerHTML = '';
            ops.forEach(o => {
                const opt = document.createElement('option');
                opt.value = o;
                opt.textContent = o;
                sel.appendChild(opt);
            });
            return sel;
        };

        const buildValueInput = (forField: string, current?: string) => {
            const choices = getChoicesFor(forField);
            if (choices && choices.length) {
                const sel = document.createElement('select');
                sel.className = 've-value form-select form-select-sm';
                choices.forEach((v: { value: string; label: string }) => {
                    const opt = document.createElement('option');
                    opt.value = v.value;
                    opt.textContent = v.label ?? v.value;
                    sel.appendChild(opt);
                });
                if (current != null) sel.value = current;
                return sel;
            }
            const input = document.createElement('input');
            input.className = 've-value form-control form-control-sm';
            input.type = 'text';
            if (current != null) input.value = current;
            return input;
        };

        function row(field?: string, op?: string, value?: string) {
            const row = document.createElement('div');
            row.className = 've-row';
            row.style.display = 'flex';
            row.style.gap = '6px';
            row.style.alignItems = 'center';

            const fSel = buildFieldSelect();
            const initialField = field || (fSel.options[0]?.value || '');
            const oSel = buildOpSelect(initialField);
            const vWrap = document.createElement('div');

            const renderValue = (fn: string, val?: string) => {
                vWrap.innerHTML = '';
                vWrap.appendChild(buildValueInput(fn, val));
            };

            // initialize row
            if (field) fSel.value = field;
            renderValue(fSel.value);
            if (op) {
                // rebuild ops based on chosen field
                const newOps = buildOpSelect(fSel.value);
                oSel.innerHTML = newOps.innerHTML;
                oSel.value = op;
            }
            if (value != null) {
                (vWrap.querySelector('.ve-value') as HTMLInputElement | HTMLSelectElement).value = value;
            }

            fSel.addEventListener('change', () => {
                const newOps = buildOpSelect(fSel.value);
                oSel.innerHTML = newOps.innerHTML;
                renderValue(fSel.value);
            });

            row.appendChild(fSel);
            row.appendChild(oSel);
            row.appendChild(vWrap);

            const rm = document.createElement('button');
            rm.type = 'button';
            rm.className = 'btn btn-sm btn-outline-danger';
            rm.textContent = 'Remove';
            rm.addEventListener('click', () => row.remove());
            row.appendChild(rm);

            rules.appendChild(row);
        }

        addBtn.addEventListener('click', () => row());

        save.addEventListener('click', () => {
            const _mode = (veBody.querySelector('.ve-mode') as HTMLSelectElement).value as 'any' | 'all';
            const _actions = Array.from(veBody.querySelectorAll('.ve-act') as NodeListOf<HTMLInputElement>)
                .filter(i => i.checked)
                .map(i => i.value) as Array<'show' | 'hide' | 'enable' | 'disable' | 'require'>;

            const ruleRows = Array.from(veBody.querySelectorAll('.ve-row'));
            const rulesCfg = ruleRows.map(r => {
                const f = (r.querySelector('.ve-field') as HTMLSelectElement).value;
                const o = (r.querySelector('.ve-op') as HTMLSelectElement).value;
                const valEl = (r.querySelector('.ve-value') as HTMLInputElement | HTMLSelectElement);
                const v = (valEl as any).value ?? '';
                return { field: f, op: o as any, value: v };
            });

            const cfg = { groups: [{ mode: _mode, rules: rulesCfg, actions: _actions }] };
            const ta = (getTextArea() as any) as HTMLTextAreaElement | null;
            if (ta) {
                ta.value = JSON.stringify(cfg, null, 2);
                alert('Conditional Logic JSON updated.');
            } else {
                alert('Could not find the logic JSON field to update.');
            }
        });

        // Preload from JSON (null-safe)
        try {
            const ta = (getTextArea() as any) as HTMLTextAreaElement | null;
            const raw = (ta && ta.value) || '';
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

        htmlParent.prepend(ve);
    }


    function onOpenFieldEdit(editPanel: HTMLElement) {
        const logicControls = Array.from(
            editPanel.querySelectorAll('[name="logic"], [name="logicApplyTo"], [name="logicGroup"]')
        ) as HTMLElement[];
        if (!logicControls.length) return;

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
            const body0 = section.querySelector('.fb-logic-body') as HTMLElement;
            header.addEventListener('click', () => {
                const open = body0.style.display !== 'none';
                body0.style.display = open ? 'none' : '';
            });
        }

        const body = section!.querySelector('.fb-logic-body') as HTMLElement;

        // --- Advanced (JSON) panel FIRST ---
        let adv = body.querySelector('.fb-logic-advanced') as HTMLElement | null;
        if (!adv) {
            adv = document.createElement('div');
            adv.className = 'fb-logic-advanced';
            adv.innerHTML = `
      <div class="fb-logic-adv-header" style="margin-top:10px; font-weight:600; cursor:pointer;">
        Advanced (JSON)
        <span style="font-weight:400; font-size:12px; opacity:.7"> (toggle)</span>
      </div>
      <div class="fb-logic-adv-body" style="border:1px dashed #cbd5e1; padding:8px; margin-top:6px; display:none;"></div>
    `;
            body.appendChild(adv);
            const advHeader = adv.querySelector('.fb-logic-adv-header') as HTMLElement;
            const advBody = adv.querySelector('.fb-logic-adv-body') as HTMLElement;
            advHeader.addEventListener('click', () => {
                const open = advBody.style.display !== 'none';
                advBody.style.display = open ? 'none' : '';
            });
        }

        // Move native controls inside Advanced body
        const advBody = adv!.querySelector('.fb-logic-adv-body') as HTMLElement;
        logicControls.forEach(el => {
            const row = el.closest('.form-group') || el.closest('div') || el;
            if (row && row.parentElement !== advBody) advBody.appendChild(row as HTMLElement);
        });
        // De-dup (defensive)
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

        // --- Visual Editor AFTER controls exist ---
        if (enableVE) {
            const getTextArea = () => body.querySelector('[name="logic"]') as HTMLTextAreaElement;
            const getApplyTo = () => body.querySelector('[name="logicApplyTo"]') as HTMLSelectElement;
            const getGroupId = () => body.querySelector('[name="logicGroup"]') as HTMLInputElement;

            if (!body.querySelector('.fb-logic-ve')) {
                const dupes = body.querySelectorAll('.fb-logic-ve');
                if (dupes.length > 1) dupes.forEach((el, idx) => { if (idx > 0) el.remove(); });
                makeVE(body, getTextArea, getApplyTo, getGroupId);
            }
        }
    }


    return { typeUserAttrs, onOpenFieldEdit };
}

/** Minimal Groups GUI living in a modal attached to a toolbar element */
export function attachLogicGroupsManager(
    targetContainer: HTMLElement,
    initialOrOpts?: string | {
        initialJson?: string;
        getAvailableFields?: () => FieldMeta[];
        getFieldValues?: (fieldName: string) => Array<{ label: string; value: string }> | null;
    }
) {
    const opts = (typeof initialOrOpts === 'string') ? { initialJson: initialOrOpts } : (initialOrOpts || {});
    const state = { json: opts.initialJson || '' };

    // ---- Helpers to obtain fields/values ----
    function inferFieldsFromBuilderJson(): FieldMeta[] {
        try {
            const $stage = (window as any).jQuery?.('.build-wrap');
            const fb = $stage?.data?.('formBuilder');
            const data = fb?.actions?.getData?.('json');
            const arr = typeof data === 'string' ? JSON.parse(data) : (Array.isArray(data) ? data : []);
            return arr.filter((f: any) => f?.name).map((f: any) => ({
                name: f.name, type: f.type, label: f.label,
                values: Array.isArray(f.values) ? f.values.map((v: any) => ({ label: v.label ?? v.value, value: v.value })) : undefined
            }));
        } catch { return []; }
    }
    const getFields = (): FieldMeta[] => {
        try { const x = opts.getAvailableFields?.(); if (x && x.length) return x; } catch { }
        return inferFieldsFromBuilderJson();
    };
    const getValuesFor = (fieldName: string) => {
        try { const x = opts.getFieldValues?.(fieldName); if (x) return x; } catch { }
        const fm = getFields().find(f => f.name === fieldName);
        return fm?.values ?? null;
    };

    // ---- UI scaffold: button + modal ----
    const wrapper = document.createElement('div');
    wrapper.style.margin = '8px 0';
    wrapper.innerHTML = `
    <button type="button" class="btn btn-sm btn-outline-primary">Logic Groups</button>
    <div class="fb-logic-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:99999;">
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

        <div class="fb-groups-ve-header" style="font-weight:600;">Visual Groups Editor
          <span style="font-size:12px;opacity:.7;font-weight:400;">(no JSON typing)</span>
        </div>
        <div class="fb-groups-ve-body" style="border:1px dashed #cbd5e1; padding:8px; margin-top:6px;">
          <div class="fb-groups-list"></div>
          <button type="button" class="btn btn-sm btn-outline-primary fb-groups-add" style="margin-top:8px;">Add group</button>
        </div>

        <div class="fb-groups-adv" style="margin-top:10px;">
          <div class="fb-groups-adv-header" style="font-weight:600; cursor:pointer;">
            Advanced (JSON)
            <span style="font-size:12px;opacity:.7;font-weight:400;">(toggle)</span>
          </div>
          <div class="fb-groups-adv-body" style="border:1px dashed #cbd5e1; padding:8px; margin-top:6px; display:none;">
            <p style="font-size:12px; margin:0 0 6px 0; opacity:.75;">Define reusable groups keyed by ID.</p>
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
    const addGroupBtn = modal.querySelector('.fb-groups-add') as HTMLButtonElement;

    const open = () => {
        // Seed from window or current state
        const srcObj = (window as any).fbLogicGroups && typeof (window as any).fbLogicGroups === 'object'
            ? (window as any).fbLogicGroups
            : (state.json ? safeParse(state.json) : {});
        state.json = JSON.stringify(srcObj || {}, null, 2);
        ta.value = state.json;
        renderFromJson(srcObj || {});
        modal.style.display = 'block';
    };
    const close = () => { modal.style.display = 'none'; };

    btn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

    advHdr.addEventListener('click', () => {
        const isOpen = advBody.style.display !== 'none';
        advBody.style.display = isOpen ? 'none' : '';
    });

    loadBtn.addEventListener('click', () => {
        const fields = getFields();
        const first = fields[0]?.name || 'controller';
        const obj = {
            vehicleDetails: {
                mode: 'any',
                rules: [{ field: first, op: 'equals', value: 'yes' }],
                actions: ['show', 'require']
            }
        };
        ta.value = JSON.stringify(obj, null, 2);
        renderFromJson(obj);
    });

    fromJson.addEventListener('click', () => {
        const parsed = safeParse(ta.value) || {};
        renderFromJson(parsed);
    });

    // 🔐 SAVE: keep UI intact (no setData). Persist to window + patch export.
    saveBtn.addEventListener('click', () => {
        const obj = collectFromVe();
        state.json = JSON.stringify(obj, null, 2);
        ta.value = state.json;
        (window as any).fbLogicGroups = obj;

        // Patch export so JSON returned by getData('json') contains __logicGroups (no rebuild).
        try {
            const $stage = (window as any).jQuery?.('.build-wrap');
            const fb = $stage?.data?.('formBuilder');
            if (fb?.actions?.getData && !(fb as any).__fbLogicGroupsPatched) {
                const origGetData = fb.actions.getData.bind(fb.actions);
                (fb as any).__fbLogicGroupsPatched = true;

                fb.actions.getData = (mode?: string) => {
                    const out = origGetData(mode as any);
                    if (mode !== 'json') return out;

                    // always read the latest groups from window or state
                    const groupsObj = (window as any).fbLogicGroups || (safeParse(state.json) || {});
                    const groupsStr = JSON.stringify(groupsObj);

                    try {
                        const arr = typeof out === 'string' ? JSON.parse(out) : (Array.isArray(out) ? out : []);
                        const idx = arr.findIndex((f: any) => f?.type === 'hidden' && (f?.name === '__logicGroups' || f?.name === 'logicGroups'));
                        const fieldObj = { type: 'hidden', name: '__logicGroups', value: groupsStr, label: ' ', access: false, className: 'd-none' };
                        if (idx >= 0) arr[idx] = { ...arr[idx], ...fieldObj };
                        else arr.push(fieldObj);
                        return JSON.stringify(arr);
                    } catch {
                        // if something goes off, just return original
                        return out;
                    }
                };
            }
        } catch (e) {
            console.warn('[logic-groups] export patch failed', e);
        }

        alert('Logic groups saved (no rebuild). They will be embedded into exported JSON automatically.');
        close();
    });

    // ➕ Add group now works reliably
    addGroupBtn.addEventListener('click', () => addGroupBlock());

    // ---- Helpers ----
    function safeParse(txt: string): any | null { try { return JSON.parse(txt); } catch { return null; } }
    function clearChildren(node: HTMLElement) { while (node.firstChild) node.removeChild(node.firstChild); }

    function addGroupBlock(groupId: string = '') {
        const groupWrap = document.createElement('div');
        groupWrap.className = 'fb-group-block';
        groupWrap.style.border = '1px solid #e5e7eb';
        groupWrap.style.borderRadius = '6px';
        groupWrap.style.padding = '8px';
        groupWrap.style.marginTop = '8px';

        // Header: Group ID
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

        // Inner body
        const body = document.createElement('div');
        body.style.border = '1px dashed #cbd5e1';
        body.style.padding = '8px';
        body.style.marginTop = '6px';
        groupWrap.appendChild(body);

        // Top row
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
            opt.value = v;
            opt.textContent = v.toUpperCase() + (v === 'any' ? ' (OR)' : ' (AND)');
            modeSel.appendChild(opt);
        });

        const actionsWrap = document.createElement('div');
        actionsWrap.innerHTML = `
      <label style="margin-right:8px;">Actions</label>
      <label class="form-check form-check-inline"><input class="fb-act form-check-input" type="checkbox" value="show" checked> <span class="form-check-label">show</span></label>
      <label class="form-check form-check-inline"><input class="fb-act form-check-input" type="checkbox" value="require"> <span class="form-check-label">require</span></label>
      <label class="form-check form-check-inline"><input class="fb-act form-check-input" type="checkbox" value="enable"> <span class="form-check-label">enable</span></label>
      <label class="form-check form-check-inline"><input class="fb-act form-check-input" type="checkbox" value="disable"> <span class="form-check-label">disable</span></label>
      <label class="form-check form-check-inline"><input class="fb-act form-check-input" type="checkbox" value="hide"> <span class="form-check-label">hide</span></label>
    `;

        top.appendChild(modeLbl);
        top.appendChild(modeSel);
        top.appendChild(actionsWrap);
        body.appendChild(top);

        // Rules list + add button
        const rulesList = document.createElement('div');
        rulesList.className = 'fb-group-rules';
        body.appendChild(rulesList);

        const addRuleBtn = document.createElement('button');
        addRuleBtn.type = 'button';
        addRuleBtn.className = 'btn btn-sm btn-outline-secondary';
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

            // field select
            const fSel = document.createElement('select');
            fSel.className = 'form-select form-select-sm fb-rule-field';
            const fields = getFields();
            if (!fields.length) {
                const opt = document.createElement('option');
                opt.value = '';
                opt.textContent = '(no fields yet)';
                fSel.appendChild(opt);
            } else {
                fields.forEach(f => {
                    const opt = document.createElement('option');
                    opt.value = f.name;
                    opt.textContent = f.label ? `${f.label} (${f.name})` : f.name;
                    fSel.appendChild(opt);
                });
            }
            if (field) fSel.value = field;

            // op select (dynamic by type)
            const oSel = document.createElement('select');
            oSel.className = 'form-select form-select-sm fb-rule-op';
            const setOpsForField = (fn: string) => {
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
            };
            setOpsForField(fSel.value);
            if (op) oSel.value = op;

            // value control
            const vWrap = document.createElement('div');
            vWrap.className = 'fb-rule-value-wrap';
            const renderValueControl = (fn: string, current?: string) => {
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
            };
            renderValueControl(fSel.value, value);

            // interactions
            fSel.addEventListener('change', () => {
                setOpsForField(fSel.value);
                renderValueControl(fSel.value);
            });

            // remove rule
            const rm = document.createElement('button');
            rm.type = 'button';
            rm.className = 'btn btn-sm btn-outline-danger';
            rm.textContent = 'Remove';
            rm.addEventListener('click', () => row.remove());

            // mount
            row.appendChild(fSel);
            row.appendChild(oSel);
            row.appendChild(vWrap);
            row.appendChild(rm);
            rulesList.appendChild(row);
        }

        addRuleBtn.addEventListener('click', () => addRuleRow());

        // allow preset
        (groupWrap as any)._set = (cfg: { mode?: string; actions?: string[]; rules?: any[] }) => {
            if (cfg?.mode) (modeSel.value = cfg.mode);
            const acts = new Set(cfg?.actions || []);
            actionsWrap.querySelectorAll<HTMLInputElement>('.fb-act').forEach(i => { i.checked = acts.has(i.value); });
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
            // UX: start with one blank group
            addGroupBlock('');
            return;
        }
        keys.forEach(id => {
            const w = addGroupBlock(id);
            (w as any)._set(obj[id] || {});
        });
    }

    function collectFromVe(): Record<string, any> {
        const result: Record<string, any> = {};
        const blocks = listEl.querySelectorAll('.fb-group-block');
        blocks.forEach((b: Element) => {
            const id = (b.querySelector('.fb-group-id') as HTMLInputElement).value.trim();
            if (!id) return;
            const mode = (b.querySelector('.fb-group-mode') as HTMLSelectElement).value || 'any';
            const actions = Array.from(b.querySelectorAll('.fb-act') as NodeListOf<HTMLInputElement>)
                .filter(i => i.checked).map(i => i.value);
            const rules: Array<{ field: string; op: string; value?: string }> = [];
            const rows = b.querySelectorAll('.fb-group-rule');
            rows.forEach((r: Element) => {
                const field = (r.querySelector('.fb-rule-field') as HTMLSelectElement).value;
                const op = (r.querySelector('.fb-rule-op') as HTMLSelectElement).value;
                const vEl = (r.querySelector('.fb-rule-value') as HTMLInputElement | HTMLSelectElement);
                const value = (vEl as any)?.value ?? '';
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



