# Changelog


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
