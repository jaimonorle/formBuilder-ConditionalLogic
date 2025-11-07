import type { LogicConfig, LogicGroup, Rule, SetupOptions } from '../types';

declare global {
    interface Window {
        fbLogicGroups?: Record<string, LogicGroup>;
        __FB_LOGIC_DEBUG__?: boolean;
        FB_GET_WRAPPER?: (el: HTMLElement) => HTMLElement;
        _fbLogic?: { refresh: () => void }; // debug handle
    }
}

/* ==============================
   Utilities
============================== */

function cssEscape(name: string) {
    const CSSObj: any = (window as any).CSS;
    if (CSSObj && typeof CSSObj.escape === 'function') return CSSObj.escape(name);
    return name.replace(/([^a-zA-Z0-9_-])/g, '\\$1');
}

function sourceSelector(fieldName: string) {
    const n = cssEscape(fieldName);
    return `[name="${n}"], [name="${n}[]"], [data-fb-name="${n}"]`;
}

function defaultWrapper(el: HTMLElement): HTMLElement {
    const candidates = ['.form-group', '.fb-field-wrapper', '.form-field', '.field-wrapper', '.row', '.mb-3', '.box'];
    for (const c of candidates) {
        const found = el.closest(c);
        if (found) return found as HTMLElement;
    }
    return el.parentElement || el;
}

function getControlValue(el: HTMLElement): any {
    if (el instanceof HTMLInputElement) {
        if (el.type === 'radio') {
            const name = el.name;
            const group =
                el.form?.querySelectorAll(`input[type="radio"][name="${name}"]`) ||
                document.querySelectorAll(`input[type="radio"][name="${name}"]`);
            for (const r of Array.from(group)) {
                const rr = r as HTMLInputElement;
                if (rr.checked) return rr.value;
            }
            return null;
        }
        if (el.type === 'checkbox') {
            const name = el.name;
            const group =
                el.form?.querySelectorAll(`input[type="checkbox"][name="${name}"]`) ||
                document.querySelectorAll(`input[type="checkbox"][name="${name}"]`);
            const vals: string[] = [];
            Array.from(group).forEach((cb) => {
                const cbb = cb as HTMLInputElement;
                if (cbb.checked) vals.push(cbb.value);
            });
            return vals;
        }
        return el.value;
    }
    if (el instanceof HTMLSelectElement) {
        if (el.multiple) return Array.from(el.selectedOptions).map((o) => o.value);
        return el.value;
    }
    if (el instanceof HTMLTextAreaElement) return el.value;
    return (el as any).value ?? (el as any).textContent ?? null;
}

function testRule(value: any, rule: Rule): boolean {
    const op = rule.op;
    const expected = rule.value;

    if (Array.isArray(value)) {
        if (op === 'contains') return value.includes(expected);
        if (op === 'equals') return value.includes(expected);
        if (op === 'notEquals') return !value.includes(expected);
        if (op === 'isEmpty') return value.length === 0;
        if (op === 'notEmpty') return value.length > 0;
        return false;
    }

    const valStr = value == null ? '' : String(value);
    const expStr = expected == null ? '' : String(expected);
    const valNum = Number(value);
    const expNum = Number(expected);

    switch (op) {
        case 'equals': return value == expected;
        case 'notEquals': return value != expected;
        case 'contains': return valStr.includes(expStr);
        case 'startsWith': return valStr.startsWith(expStr);
        case 'endsWith': return valStr.endsWith(expStr);
        case 'gt': return valNum > expNum;
        case 'gte': return valNum >= expNum;
        case 'lt': return valNum < expNum;
        case 'lte': return valNum <= expNum;
        case 'isEmpty': return valStr.trim() === '';
        case 'notEmpty': return valStr.trim() !== '';
        default: return false;
    }
}

function evalGroup(form: HTMLElement, group: LogicGroup): boolean {
    const results = group.rules.map((rule) => {
        const src = form.querySelector(sourceSelector(rule.field)) as HTMLElement | null;
        if (!src) return false;
        const v = getControlValue(src);
        return testRule(v, rule);
    });
    const ok = group.mode === 'all' ? results.every(Boolean) : results.some(Boolean);
    if (window.__FB_LOGIC_DEBUG__) console.log('[fb-logic] group', group, 'results', results, 'ok?', ok);
    return ok;
}

function setDisabled(el: HTMLElement, disabled: boolean) {
    const inputs = el.querySelectorAll('input, select, textarea, button');
    inputs.forEach((n: Element) => {
        (n as HTMLInputElement).disabled = disabled;
        if (disabled) (n as HTMLInputElement).required = false;
    });
}

function setVisible(el: HTMLElement, visible: boolean) {
    (el as HTMLElement).style.display = visible ? '' : 'none';
    (el as HTMLElement).setAttribute('aria-hidden', visible ? 'false' : 'true');
}

/* ==============================
   Actions + Targets
============================== */

function applyActions(target: HTMLElement, actions: LogicGroup['actions'], truthy: boolean) {
    const shouldShow =
        actions.includes('show') ? truthy :
            actions.includes('hide') ? !truthy :
                truthy;

    setVisible(target, shouldShow);

    if (actions.includes('disable')) setDisabled(target, true);
    if (actions.includes('enable')) setDisabled(target, false);

    if (actions.includes('require')) {
        const inputs = target.querySelectorAll('input, select, textarea');
        inputs.forEach((n: Element) => { (n as HTMLInputElement).required = shouldShow; });
    }
}

function parseLogicAttr(el: HTMLElement): LogicConfig | null {
    const raw = el.getAttribute('data-logic');
    if (!raw) return null;
    try { return JSON.parse(raw) as LogicConfig; }
    catch {
        if (window.__FB_LOGIC_DEBUG__) console.warn('Invalid data-logic JSON', raw, el);
        return null;
    }
}

/* ==============================
   HYDRATION (Builder JSON → DOM)
============================== */

function strifyLogic(logic: any): string | null {
    if (!logic) return null;
    if (typeof logic === 'string') return logic;
    try { return JSON.stringify(logic); } catch { return null; }
}

function queryByNameAll(form: HTMLElement, name: string): NodeListOf<HTMLElement> {
    const n = cssEscape(name);
    return form.querySelectorAll<HTMLElement>(`[name="${n}"], [name="${n}[]"]`);
}

function hydrateFromFormData(form: HTMLElement, formData: any) {
    if (!formData) return;
    try { if (typeof formData === 'string') formData = JSON.parse(formData); } catch { return; }
    if (!Array.isArray(formData)) return;

    for (const field of formData) {
        const name: string | undefined = field?.name;
        if (!name) continue;

        const nodes = queryByNameAll(form, name);
        if (!nodes.length) continue;

        const logicJson = strifyLogic(field.logic);
        const applyTo: string = field.logicApplyTo || field.applyTo || 'self';
        const groupId: string | undefined = field.logicGroup;

        if (!logicJson && groupId && applyTo === 'group') {
            nodes.forEach((el) => el.setAttribute('data-logic-group', String(groupId)));
            continue;
        }

        if (!logicJson) continue;

        if (applyTo === 'container') {
            nodes.forEach((el) => {
                const wrap =
                    typeof window.FB_GET_WRAPPER === 'function'
                        ? window.FB_GET_WRAPPER(el)
                        : defaultWrapper(el);
                wrap.setAttribute('data-logic-container', logicJson);
            });
        } else if (applyTo === 'group' && groupId) {
            nodes.forEach((el) => el.setAttribute('data-logic-group', String(groupId)));
        } else {
            nodes.forEach((el) => el.setAttribute('data-logic', logicJson));
        }
    }
}

function normalizeActions(cfg: LogicConfig): LogicGroup['actions'] {
    const a = (cfg.actions && cfg.actions.length ? cfg.actions : ['show']);
    return a as LogicGroup['actions'];
}

/* ==============================
   Target discovery + evaluation
============================== */

function findTargets(form: HTMLElement): Array<{
    el: HTMLElement;
    cfg: LogicConfig;
    mode: 'self' | 'container' | 'group';
    groupId?: string;
}> {
    const targets: Array<{
        el: HTMLElement;
        cfg: LogicConfig;
        mode: 'self' | 'container' | 'group';
        groupId?: string;
    }> = [];

    form.querySelectorAll('[data-logic]').forEach((el) => {
        const cfg = parseLogicAttr(el as HTMLElement);
        if (cfg) targets.push({ el: el as HTMLElement, cfg, mode: 'self' });
    });

    form.querySelectorAll('[data-logic-container]').forEach((el) => {
        const raw = (el as HTMLElement).getAttribute('data-logic-container');
        if (!raw) return;
        try { targets.push({ el: el as HTMLElement, cfg: JSON.parse(raw) as LogicConfig, mode: 'container' }); }
        catch { }
    });

    form.querySelectorAll('[data-logic-group]').forEach((el) => {
        const id = (el as HTMLElement).getAttribute('data-logic-group') || '';
        const group = window.fbLogicGroups?.[id];
        if (group) {
            const cfg: LogicConfig = { groups: [group], actions: group.actions, applyTo: 'group', logicGroup: id };
            targets.push({ el: el as HTMLElement, cfg, mode: 'group', groupId: id });
        }
    });

    if (window.__FB_LOGIC_DEBUG__) {
        console.log('[fb-logic] targets found:', targets.length, targets);
    }
    return targets;
}

function reeval(form: HTMLElement, targets: ReturnType<typeof findTargets>, options: SetupOptions) {
    const getWrapper = options.getWrapper || defaultWrapper;

    targets.forEach((t) => {
        const el = t.el;

        let truthy = true;
        if (t.cfg.groups && t.cfg.groups.length) truthy = t.cfg.groups.every((g) => evalGroup(form, g));

        const wrapper =
            t.mode === 'self' ? getWrapper(el) :
                t.mode === 'container' ? el :
                    getWrapper(el);

        const actions = normalizeActions(t.cfg);
        applyActions(wrapper, actions, truthy);

        if (options.onState) options.onState(el, truthy);
        if (window.__FB_LOGIC_DEBUG__) console.log('[fb-logic] applied', { el, mode: t.mode, actions, truthy, wrapper });
    });
}

/* ==============================
   Public API
============================== */

export function setup(formEl: HTMLElement | Element, _formData?: any, options: SetupOptions = {}) {
    const form = formEl as HTMLElement;

    // --- 0) Extract Logic Groups from formData (hidden field) BEFORE target discovery
    // We look for a hidden field named "__logicGroups" (or "logicGroups") and install it on window.
    try {
        if (_formData) {
            const arr = Array.isArray(_formData)
                ? _formData
                : (typeof _formData === 'string' ? JSON.parse(_formData) : []);

            if (Array.isArray(arr)) {
                const grpField =
                    arr.find((f: any) => f?.type === 'hidden' && (f?.name === '__logicGroups' || f?.name === 'logicGroups'));
                if (grpField?.value && typeof grpField.value === 'string') {
                    try {
                        const parsed = JSON.parse(grpField.value);
                        if (parsed && typeof parsed === 'object') (window as any).fbLogicGroups = parsed;
                    } catch { /* ignore bad JSON */ }
                }
            }
        }
    } catch { /* non-fatal */ }

    // --- 1) Hydrate per-field attributes (data-logic, data-logic-container, data-logic-group)
    if (_formData) {
        try { hydrateFromFormData(form, _formData); }
        catch (e) { if (window.__FB_LOGIC_DEBUG__) console.warn('hydrateFromFormData failed', e); }
    }

    // --- 2) Discover targets and bind listeners
    const targets = findTargets(form);

    const watched = new Set<string>();
    // collect all fields referenced by rules (including group rules)
    targets.forEach((t) => {
        const groups = (t.cfg?.groups || []) as any[];
        groups.forEach((g) => {
            (g.rules || []).forEach((r: any) => {
                if (r?.field) {
                    watched.add(r.field);
                    // also watch array-notation variants, e.g. "foo[]" vs "foo"
                    watched.add(String(r.field).replace(/\[\]$/, ''));
                }
            });
        });
    });

    if (window.__FB_LOGIC_DEBUG__) console.log('[fb-logic] watching fields:', Array.from(watched));

    const handler = (ev: Event) => {
        const t = ev.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
        if (!t) return;
        const nameAttr = t.name || (t.getAttribute && t.getAttribute('name')) || '';
        if (!nameAttr) return;
        const simple = nameAttr.replace(/\[\]$/, '');
        if (watched.has(nameAttr) || watched.has(simple)) {
            if (window.__FB_LOGIC_DEBUG__) console.log('[fb-logic] change on', nameAttr, '→ reeval');
            reeval(form, targets, options);
        }
    };

    form.addEventListener('input', handler, true);
    form.addEventListener('change', handler, true);

    // First run
    reeval(form, targets, options);

    // Optional external refresh hook
    form.addEventListener('fb:reinit-logic' as any, () => reeval(form, targets, options));

    // expose for quick debugging from console
    (window as any)._fbLogic = { refresh: () => reeval(form, targets, options) };
}


export function refresh(formEl: HTMLElement | Element) {
    setup(formEl);
}

export function evaluateField(formEl: HTMLElement | Element, _name: string) {
    setup(formEl);
}
