
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'FBConditionalLogic',
      formats: ['es', 'umd'],
      fileName: (format) =>
        format === 'es' ? 'formbuilder-conditional-logic.es.js' : 'formbuilder-conditional-logic.umd.cjs',
    },
    rollupOptions: {
      external: ['jquery'],
      output: { globals: { jquery: '$' } }
    },
    sourcemap: true
  },
  plugins: [ dts({ include: ['src'] }) ]
});
