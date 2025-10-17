/**
 * Builder-side plugin helpers for formBuilder.
 * - withConditionalLogic(): returns a formBuilder options object that injects
 *   typeUserAttrs for 'logic', 'logicGroup', and 'logicApplyTo' and wires an
 *   onOpenFieldEdit callback to group the fields under a single collapsible panel.
 * - attachLogicGroupsManager(): injects a small button + modal to manage form-level groups JSON.
 */

type UserAttrs = Record<string, any>;

export interface BuilderInitOptions {
    panelTitle?: string;
    // list of formBuilder field types to extend; default covers common types
    types?: string[];
}

const DEFAULT_TYPES = [
    'text', 'textarea', 'number', 'select',
    'radio-group', 'checkbox-group',
    'date', 'paragraph', 'header', 'file', 'autocomplete'
];

/**
 * Use like:
 *   const fb = $('.build-wrap').formBuilder({
 *     ...withConditionalLogic({ panelTitle: 'Conditional Logic' })
 *   });
 */
export function withConditionalLogic(opts: BuilderInitOptions = {}) {
    const panelTitle = opts.panelTitle || 'Conditional Logic';
    const types = (opts.types && opts.types.length ? opts.types : DEFAULT_TYPES);

    // Build typeUserAttrs for target types
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

    // Group our three attrs into an accordion section in the edit panel
    function onOpenFieldEdit(editPanel: HTMLElement) {
        // Inputs are already rendered by typeUserAttrs. We just wrap them visually.
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
            const body = section.querySelector('.fb-logic-body') as HTMLElement;
            header.addEventListener('click', () => {
                const open = body.style.display !== 'none';
                body.style.display = open ? 'none' : '';
            });
        }

        const body = section!.querySelector('.fb-logic-body') as HTMLElement;
        logicControls.forEach(el => {
            const row = el.closest('.form-group') || el.closest('div') || el;
            if (row && row.parentElement !== body) body.appendChild(row as HTMLElement);
        });
    }

    return { typeUserAttrs, onOpenFieldEdit };
}

/**
 * Minimal modal to manage form-level logic groups JSON.
 * Call once on your builder page; stores groups on window.fbLogicGroups.
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
