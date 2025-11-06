# formBuilder-ConditionalLogic

[![Ko-fi](https://img.shields.io/badge/Ko%E2%80%91fi-Support-ff5e5b?logo=kofi&logoColor=white)](https://ko-fi.com/jaimonorle)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Support-ffdd00?logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/jaimonorle)
[![Liberapay](https://img.shields.io/badge/Liberapay-Support-f6c915?logo=liberapay&logoColor=black)](https://liberapay.com/jaimonorle/)


[![DCO](https://img.shields.io/badge/DCO-1.1-blue.svg)](https://developercertificate.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Release](https://img.shields.io/github/v/release/jaimonorle/formBuilder-ConditionalLogic?display_name=tag)](https://github.com/jaimonorle/formBuilder-ConditionalLogic/releases)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-orange.svg)](https://www.conventionalcommits.org/)
[![Pages](https://github.com/jaimonorle/formBuilder-ConditionalLogic/actions/workflows/gh-pages.yml/badge.svg)](https://github.com/jaimonorle/formBuilder-ConditionalLogic/actions/workflows/gh-pages.yml)
[![Builder Demo](https://img.shields.io/badge/demo-Builder%20Demo-blue.svg)](https://jaimonorle.github.io/formBuilder-ConditionalLogic/demo/builder-static.html)
[![Render Demo](https://img.shields.io/badge/demo-Render%20Demo-blue.svg)](https://jaimonorle.github.io/formBuilder-ConditionalLogic/demo/render-static.html)

**Quick Links:** [Quick Start](#quick-start) · [Demos](#installation) · [Renderer API](#renderer-api) · [Builder API](#builder-api) · [Contributing](CONTRIBUTING.md) · [Code of Conduct](CODE_OF_CONDUCT.md) · [Changelog](CHANGELOG.md) · [Security](SECURITY.md) · [License](LICENSE)


A lightweight, name‑based **Conditional Logic** toolkit for [formBuilder](https://github.com/kevinchappell/formBuilder). Add show/hide/require/enable/disable behaviors to fields and containers without writing custom code.

* **Works with your existing formBuilder → formRender flow**
* **Renderer** evaluates rules after `formRender()` and toggles fields/containers
* **Builder UI** adds a **Visual Rules Editor** to each field (no JSON typing)
* **Logic Groups (GUI)** define reusable rule groups in a toolbar modal
* **Name‑based** rules: `hasVehicle`, `FormData12`, `city`, etc. (no class hacks)

> **Demos**: Static UMD pages (work on any static host)
>
> * `demo/builder-static.html` — drag fields, open **Conditional Logic** panel, save
> * `demo/render-static.html` — quick smoke test with `data-logic` attributes

---

## Installation

### ESM (Dev via Vite)

```bash
npm install
npm run dev
# open http://localhost:5173/demo/builder.html
```

### UMD (Static / CDN / GitHub Pages)

1. Build once:

```bash
npm run build
```

2. Serve `dist/` + `demo/*-static.html` from any static host.

```html
<!-- UMD global -->
<script src="/dist/formbuilder-conditional-logic.umd.cjs"></script>
```

---

## Quick Start

### Render‑only (HTML with `data-logic`)

```html
<form id="demo">
  <div>
    <label>Do you have a vehicle?</label>
    <label><input type="radio" name="hasVehicle" value="yes"> Yes</label>
    <label><input type="radio" name="hasVehicle" value="no" checked> No</label>
  </div>

  <div data-logic='{"groups":[{"mode":"any","rules":[{"field":"hasVehicle","op":"equals","value":"yes"}]}],"actions":["show","require"]}'>
    <input name="vehicleMake" placeholder="Vehicle Make"/>
    <input name="vehicleModel" placeholder="Vehicle Model"/>
  </div>
</form>

<script>
  const { setup } = window.FBConditionalLogic; // from UMD bundle
  setup(document.getElementById('demo'));
</script>
```

### Builder integration (Visual panel + Groups)

```html
<!-- jQuery + jQuery UI + formBuilder -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="https://code.jquery.com/ui/1.13.3/jquery-ui.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/formBuilder@3.21.1/dist/form-builder.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/formBuilder@3.21.1/dist/form-render.min.js"></script>

<!-- UMD bundle -->
<script src="/dist/formbuilder-conditional-logic.umd.cjs"></script>
<script>
  const { withConditionalLogic, attachLogicGroupsManager } = window.FBConditionalLogic.builder;

  const toolbar = document.getElementById('toolbar');
  let fb;
  const getFormArray = () => {
    const data = fb?.actions?.getData?.('json');
    return typeof data === 'string' ? JSON.parse(data) : (Array.isArray(data) ? data : []);
  };
  const getAvailableFields = () => getFormArray().filter(f => f?.name).map(f => ({
    name: f.name, type: f.type, label: f.label,
    values: Array.isArray(f.values) ? f.values.map(v => ({ label: v.label ?? v.value, value: v.value })) : undefined
  }));
  const getFieldValues = (fieldName) => {
    const f = getFormArray().find(ff => ff?.name === fieldName);
    return Array.isArray(f?.values) ? f.values.map(v => ({ label: v.label ?? v.value, value: v.value })) : null;
  };

  const options = withConditionalLogic({
    panelTitle: 'Conditional Logic',
    enableVisualEditor: true,
    getAvailableFields,
    getFieldValues
  });
  fb = window.jQuery('.build-wrap').formBuilder(options);

  attachLogicGroupsManager(toolbar, { getAvailableFields, getFieldValues });
</script>
```

---

## Concepts & Data Model

```ts
export type Action = 'show' | 'hide' | 'enable' | 'disable' | 'require';
export type Op = 'equals' | 'notEquals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte' | 'isEmpty' | 'notEmpty';
export interface Rule { field: string; op: Op; value?: any; }
export interface LogicGroup { mode: 'any' | 'all'; rules: Rule[]; actions: Action[]; }
export interface LogicConfig { groups: LogicGroup[]; actions?: Action[]; applyTo?: 'self'|'container'|'group'; logicGroup?: string; }
```

* A **Rule** reads the value of a field by its **name**.
* A **LogicGroup** evaluates rules in **ANY** (OR) or **ALL** (AND) mode and emits `true/false`.
* **Actions** run when the group evaluates **true** (`show`, `require`, etc.).
* A **LogicConfig** can be attached to a field element (`data-logic`), its wrapper (`data-logic-container`), or reference a named **Logic Group** (`data-logic-group="groupId"`).

**Apply To** (Builder UI):

* **This Field** → toggles the nearest wrapper
* **Field Container** → attaches to the wrapper node
* **Logic Group** → references a shared group defined in the Groups modal

---

## Renderer API

```ts
import { setup } from 'formbuilder-conditional-logic/renderer';

setup(formEl: HTMLElement, formData?: any, options?: {
  getValue?: (el: HTMLElement) => any;
  getWrapper?: (el: HTMLElement) => HTMLElement;
  onState?: (el: HTMLElement, visible: boolean) => void;
});
```

* **`setup(formEl, formData?)`** hydrates builder JSON into `data-logic*` attributes (when provided) and binds listeners. Returns `{ refresh(), destroy() }`.
* **`refresh()`** re‑evaluates all targets.
* **Custom wrappers**: provide `getWrapper(el)` if your markup differs.
* **Reinit** after DOM changes: `formEl.dispatchEvent(new Event('fb:reinit-logic'))`.

---

## Builder API

```ts
import { withConditionalLogic, attachLogicGroupsManager } from 'formbuilder-conditional-logic/builder';

const fb = $('.build-wrap').formBuilder(
  withConditionalLogic({
    panelTitle: 'Conditional Logic',
    enableVisualEditor: true,
    getAvailableFields: () => FieldMeta[],
    getFieldValues: (fieldName) => {label:string, value:string}[] | null
  })
);

attachLogicGroupsManager(toolbarEl, { getAvailableFields, getFieldValues });
```

* **Visual Rules Editor** writes JSON to the field’s `logic` textarea (Advanced panel is collapsed by default).
* **Logic Groups (GUI)** saves to `window.fbLogicGroups` and mirrors JSON in its Advanced panel.

---

## Browser & Compatibility

* Tested with **formBuilder 3.21.1**, **jQuery 3.7+**, **jQuery UI 1.13+**
* Modern browsers; IE not supported.

---

## Roadmap

* Persist Groups inside exported form JSON
* Visual editor for compound groups (multiple groups per target)
* Unit tests (Vitest) and CI

---

## 💖 Support my work

If this project helps you, consider supporting:

- Ko-fi: https://ko-fi.com/jaimonorle
- Buy Me a Coffee: https://buymeacoffee.com/jaimonorle
- Liberapay (recurring): https://liberapay.com/jaimonorle/

---

## Contributing

We welcome PRs! Please read [CONTRIBUTING.md](CONTRIBUTING.md) and sign off your commits per the [DCO](https://developercertificate.org/).
Also see our [Code of Conduct](CODE_OF_CONDUCT.md), [Security policy](SECURITY.md), and [Changelog](CHANGELOG.md).


## Acknowledgements

* Inspired by community demand and prior work like [**formbuilder_depends**](https://github.com/rendezz/formbuilder_depends).

## License

MIT © 2025 Jaimon Orlé

---
