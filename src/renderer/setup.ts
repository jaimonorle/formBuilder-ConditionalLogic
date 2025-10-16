
import type { LogicConfig, LogicGroup, Rule, SetupOptions } from '../types';

declare global {
  interface Window {
    fbLogicGroups?: Record<string, LogicGroup>;
    __FB_LOGIC_DEBUG__?: boolean;
  }
}

function cssEscape(name: string) {
  if ((window as any).CSS && (window as any).CSS.escape) {
    return (window as any).CSS.escape(name);
  }
  return name.replace(/([^a-zA-Z0-9_-])/g, '\\$1');
}

function sourceSelector(fieldName: string) {
  const n = cssEscape(fieldName);
  return `[name="${n}"], [name="${n}[]"], [data-fb-name="${n}"]`;
}

function defaultWrapper(el: HTMLElement): HTMLElement {
  const candidates = ['.form-group', '.fb-field-wrapper', '.form-field', '.field-wrapper'];
  for (const c of candidates) {
    const found = el.closest(c);
    if (found) return found as HTMLElement;
  }
  return el.parentElement || el;
}

function getControlValue(el: HTMLElement): any {
  if (el instanceof HTMLInputElement) {
    if (el.type === 'radio') {
      const group = el.form?.querySelectorAll(`input[type="radio"][name="${el.name}"]`)
                || document.querySelectorAll(`input[type="radio"][name="${el.name}"]`);
      for (const r of Array.from(group)) {
        const rr = r as HTMLInputElement;
        if (rr.checked) return rr.value;
      }
      return null;
    }
    if (el.type === 'checkbox') {
      const group = el.form?.querySelectorAll(`input[type="checkbox"][name="${el.name}"]`)
                || document.querySelectorAll(`input[type="checkbox"][name="${el.name}"]`);
      const vals: string[] = [];
      Array.from(group).forEach(cb => {
        const cbb = cb as HTMLInputElement;
        if (cbb.checked) vals.push(cbb.value);
      });
      return vals;
    }
    return el.value;
  }
  if (el instanceof HTMLSelectElement) {
    if (el.multiple) return Array.from(el.selectedOptions).map(o => o.value);
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
    if (op === 'notEquals') return !value.includes(expected);
    if (op === 'equals') return value.includes(expected);
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
  const results = group.rules.map(rule => {
    const src = form.querySelector(sourceSelector(rule.field)) as HTMLElement | null;
    if (!src) return false;
    const v = getControlValue(src);
    return testRule(v, rule);
  });
  return group.mode === 'all' ? results.every(Boolean) : results.some(Boolean);
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
}

function applyActions(target: HTMLElement, actions: import('../types').Action[], visible: boolean) {
  const shouldShow = actions.includes('show') ? visible
                    : actions.includes('hide') ? !visible
                    : visible;
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
  try { return JSON.parse(raw) as LogicConfig; } catch {
    if (window.__FB_LOGIC_DEBUG__) console.warn('Invalid data-logic JSON', raw, el);
    return null;
  }
}

function findTargets(form: HTMLElement): Array<{ el: HTMLElement, cfg: LogicConfig, mode: 'self'|'container'|'group', groupId?: string }> {
  const targets: Array<{ el: HTMLElement, cfg: LogicConfig, mode: 'self'|'container'|'group', groupId?: string }> = [];
  form.querySelectorAll('[data-logic]').forEach((el) => {
    const cfg = parseLogicAttr(el as HTMLElement);
    if (cfg) targets.push({ el: el as HTMLElement, cfg, mode: 'self' });
  });
  form.querySelectorAll('[data-logic-container]').forEach((el) => {
    const raw = (el as HTMLElement).getAttribute('data-logic-container');
    if (!raw) return;
    try { targets.push({ el: el as HTMLElement, cfg: JSON.parse(raw), mode: 'container' }); } catch {}
  });
  form.querySelectorAll('[data-logic-group]').forEach((el) => {
    const id = (el as HTMLElement).getAttribute('data-logic-group') || '';
    const group = window.fbLogicGroups?.[id];
    if (group) {
      const cfg: LogicConfig = { groups: [group], actions: group.actions, applyTo: 'group', logicGroup: id };
      targets.push({ el: el as HTMLElement, cfg, mode: 'group', groupId: id });
    }
  });
  return targets;
}

function reeval(form: HTMLElement, targets: ReturnType<typeof findTargets>, options: SetupOptions) {
    const DEFAULT_ACTIONS: import('../types').Action[] = ['show'];
    const getWrapper = options.getWrapper || defaultWrapper;
  targets.forEach(t => {
    const el = t.el;
    let visible = true;
    if (t.cfg.groups && t.cfg.groups.length) visible = t.cfg.groups.every(g => evalGroup(form, g));
    const wrapper = t.mode === 'self' ? getWrapper(el) : t.mode === 'container' ? el : getWrapper(el);
      const actions: import('../types').Action[] =
          (t.cfg.actions && t.cfg.actions.length ? t.cfg.actions : DEFAULT_ACTIONS);
      applyActions(wrapper, actions, visible);
    if (options.onState) options.onState(el, visible);
  });
}

export function setup(formEl: HTMLElement | Element, _formData?: any, options: SetupOptions = {}) {
  const form = formEl as HTMLElement;
  const targets = findTargets(form);
  const watched = new Set<string>();
  targets.forEach(t => { t.cfg.groups?.forEach(g => g.rules.forEach(r => watched.add(r.field))); });

  const handler = (ev: Event) => {
    const nameAttr = (ev.target as HTMLInputElement)?.name;
    if (!nameAttr) return;
    if (watched.has(nameAttr) || watched.has(nameAttr.replace(/\[\]$/, ''))) {
      reeval(form, targets, options);
    }
  };

  form.addEventListener('input', handler, true);
  form.addEventListener('change', handler, true);
  reeval(form, targets, options);
  (form as any).addEventListener('fb:reinit-logic', () => reeval(form, targets, options));
  return { refresh: () => reeval(form, targets, options) };
}

export function refresh(formEl: HTMLElement | Element) { setup(formEl); }
export function evaluateField(formEl: HTMLElement | Element, name: string) { setup(formEl); }
