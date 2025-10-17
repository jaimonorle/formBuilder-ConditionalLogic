# formBuilder-ConditionalLogic

A plugin-quality toolkit that adds **Conditional Logic** to [formBuilder](https://github.com/kevinchappell/formBuilder).

* Works with your existing **formBuilder → formRender** flow
* **Renderer** evaluates rules after `formRender()` and toggles fields/containers
* **Builder panel** to attach logic per field (JSON / ApplyTo / Group)
* Optional **Logic Groups** you can reuse across multiple targets
* **Name-based** binding: works with your own names (e.g., `hasVehicle`, `FormData12`, `city`)

> Tip: For a quick sanity test, open `demo/render.html` (static `data-logic` attributes). For end‑to‑end (builder JSON → render → logic), open `demo/composed.html`.

---

## Install / Dev

```bash
npm install
npm run dev
# open http://localhost:5173/demo/builder.html
```

Build:

```bash
npm run build
# outputs ./dist/formbuilder-conditional-logic.es.js and .umd.cjs
```

---

## Quick Usage (Render side)

```html
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="/vendor/form-render.min.js"></script>
<script src="/dist/formbuilder-conditional-logic.umd.cjs"></script>

<div id="render"></div>
<script>
  // Assume "formData" is your saved builder JSON (array of fields)
  const $root = $('#render');
  $root.formRender({ formData });

  // Hydrate builder JSON → data-* attributes, then bind logic
  FBConditionalLogic.setup($root[0], formData);
</script>
```

**You can also declare logic directly in HTML** (useful for quick tests):

```html
<div data-logic='{
  "groups":[{"mode":"any","rules":[{"field":"hasVehicle","op":"equals","value":"yes"}]}],
  "actions":["show","require"]
}'>
  <input name="vehicleMake">
  <input name="vehicleModel">
</div>
```

---

## Builder Side (panel + groups)

```js
import { withConditionalLogic, attachLogicGroupsManager } from 'formbuilder-conditional-logic/builder';

// Optional toolbar button to edit form-level groups (saved to window.fbLogicGroups for now)
attachLogicGroupsManager(document.getElementById('fb-toolbar'));

const options = withConditionalLogic({ panelTitle: 'Conditional Logic' });
const fb = $('.build-wrap').formBuilder(options);
```

What you get in the field edit panel:

* **Conditional Logic (JSON)** textarea
* **Apply To**: `This Field` / `Field Container` / `Logic Group`
* **Group ID**: enter a group key if using groups

**Logic Groups** modal (toolbar button):

Define JSON like:

```json
{
  "vehicleDetails": {
    "mode": "any",
    "rules": [{ "field": "hasVehicle", "op": "equals", "value": "yes" }],
    "actions": ["show","require"]
  }
}
```

Then, on targets set **Apply To: Logic Group** and **Group ID: `vehicleDetails`**.

---

## Rule Model

```ts
// Operators
// - Text: equals, notEquals, contains, startsWith, endsWith, isEmpty, notEmpty
// - Number: equals, notEquals, gt, gte, lt, lte, isEmpty, notEmpty
// - Choice (radio/select): equals, notEquals, isEmpty, notEmpty

type Op =
  | 'equals' | 'notEquals'
  | 'contains' | 'startsWith' | 'endsWith'
  | 'gt' | 'gte' | 'lt' | 'lte'
  | 'isEmpty' | 'notEmpty';

interface Rule { field: string; op: Op; value?: any; }

interface LogicGroup {
  mode: 'any' | 'all';
  rules: Rule[];
  actions: Array<'show'|'hide'|'enable'|'disable'|'require'>;
}

interface LogicConfig {
  groups: LogicGroup[];
  actions?: LogicGroup['actions']; // default ['show']
  applyTo?: 'self' | 'container' | 'group';
  logicGroup?: string;             // when applyTo === 'group'
}
```

**Behavior notes:**

* Each `group` computes to true/false; multiple groups on one target are **AND**‑ed (all must be true) before actions apply.
* `actions` interpret truthiness:

  * `show` → show when true
  * `hide` → hide when true
  * `require` → mark inputs required when shown
  * `enable` / `disable` → toggle `disabled`

---

## Demos

* **`/demo/builder.html`** — drag fields, open the **Conditional Logic** panel, and export JSON
* **`/demo/composed.html`** — paste builder JSON into `formData` and see it toggle
* **`/demo/render.html`** — static attributes (`data-logic`, etc.) for quick smoke tests

---

## Notes / Gotchas

* **Match your controller values** exactly. If `hasVehicle` radios use values `"option-1"/"option-2"`, your rule must use those exact strings—not the labels.

* If you rename or inject elements **after** rendering, dispatch a reinit:

  ```js
  document.getElementById('render').dispatchEvent(new Event('fb:reinit-logic'));
  ```

* Override wrapper resolution globally if your markup differs:

  ```js
  window.FB_GET_WRAPPER = (el) => el.closest('.your-wrapper') || el.parentElement;
  ```

* The dev‑server 404 for `assets/lang/en-US.lang` is harmless (formRender tries to load i18n by default).

---

## Roadmap

* **Visual Rules Editor** in the builder (no-JSON UI: pick field → operator → value, choose actions)
* Persist `logicGroups` **inside** the form JSON (not just `window.fbLogicGroups`)
* Unit tests (Vitest): rule ops, group modes, wrapper resolution

---

## License

MIT
