
# formBuilder-ConditionalLogic (starter)

A plugin-quality scaffold for adding **Conditional Logic** to formBuilder.
- Builder-side panel to configure rules (stub included)
- Render engine that evaluates rules after `formRender()` and toggles fields/containers

## Quick start (Visual Studio 2022)

1. Install **Node.js development** workload in Visual Studio Installer.
2. **File > Open > Folder...** and select this folder.
3. **View > Terminal**, then:
   ```powershell
   npm install
   npm run dev
   ```
4. Open the URL shown (Vite dev server). Try `demo/render.html` and `demo/builder.html`.
5. Build:
   ```powershell
   npm run build
   ```

## SWIMS usage (render side)

```html
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="/vendor/form-render.min.js"></script>
<script src="/vendor/formbuilder-conditional-logic.umd.cjs"></script>
<script>
  const $form = $('#render');
  // render JSON with formRender first
  FBConditionalLogic.setup($form[0]);
</script>
```

### Quick test rule via data attribute
```html
<input name="FormData08"
       data-logic='{"groups":[{"mode":"any","rules":[{"field":"FormData07","op":"equals","value":"yes"}]}],"actions":["show","require"]}'>
```
