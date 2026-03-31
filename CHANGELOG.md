# Changelog

✅ Field-level conditional logic (Visual + Advanced JSON) fully functional.
✅ Logic Groups authoring modal; persisted via hidden __logicGroups; autoloaded by renderer.
✅ Stable builder UX (no stage rebuild on save).
🧩 Minor UI polish (clean headers, spacing, modal overlay).

## 1.1.0 — Configurable builder selector (fixes #5)

* **New option: `builderSelector`** — both `withConditionalLogic()` and `attachLogicGroupsManager()` now accept a `builderSelector` option (default: `'.build-wrap'`) to specify the CSS selector for the formBuilder container element
* **Fix:** Field discovery fallback no longer hardcodes `.build-wrap` — users with custom container selectors can now pass `builderSelector: '#my-editor'` instead of getting "(no fields yet)"
* Backward-compatible: default remains `'.build-wrap'`, and provider callbacks (`getAvailableFields`/`getFieldValues`) still take priority over the selector fallback

## 1.0.0 — Stable release

* ISSU project template applied (CLAUDE.md, docs/, _archive/)
* No functional changes from 0.2.2

## 0.2.2 — Public demos & polish

* Add static UMD demos (`demo/builder-static.html`, `demo/render-static.html`)
* Include built bundle in `dist/` for GitHub Pages
* Builder UI polish: Advanced (JSON) panels collapsed by default, consistent headers

## 0.2.1 — GUI polish + Advanced panels
- Builder: Visual Rules Editor title moved outside dashed border (consistent with Advanced)
- Builder: Per-field **Advanced (JSON)** panel added, wrapped and **collapsed by default**
- Groups modal: **Visual Groups Editor** (GUI) added; Advanced (JSON) panel collapsed by default
- Fix: guard against duplicate Visual Editor mounts

## 0.2.0 — Visual Editors
- Builder: **Visual Rules Editor** (no-JSON) for per-field logic
- Hooks: `getAvailableFields`, `getFieldValues` to populate field/value dropdowns
- Builder: **Visual Groups Editor** (GUI) for reusable groups
- Advanced (JSON) panels now wrapped and collapsed by default
- Demo updated to wire hooks from current form JSON

## 0.1.0 — Initial release
- Renderer with hydration: `setup(formEl, formData)`
- Actions: show, hide, require, enable, disable
- Operators: equals, notEquals, contains, startsWith, endsWith, gt, gte, lt, lte, isEmpty, notEmpty
- Builder panel (JSON / ApplyTo / Group ID)
- Logic Groups modal (toolbar helper)
- Demos: builder, render (static), composed (builder JSON → render)
