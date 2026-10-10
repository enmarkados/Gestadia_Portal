import { defineConfig } from '../../../../frontend/node_modules/vite/dist/node/index.js';
import react from '../../../../frontend/node_modules/@vitejs/plugin-react/dist/index.js';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('.', import.meta.url));
const repo = fileURLToPath(new URL('../../../../', import.meta.url));
export default defineConfig({
  root, plugins: [react()],
  resolve: { alias: [
    { find: /^react$/, replacement: repo + 'frontend/node_modules/react/index.js' },
    { find: /^react-dom$/, replacement: repo + 'frontend/node_modules/react-dom/index.js' },
    { find: /^react\/jsx-dev-runtime$/, replacement: repo + 'frontend/node_modules/react/jsx-dev-runtime.js' },
    { find: /^react-dom\/client$/, replacement: repo + 'frontend/node_modules/react-dom/client.js' },
    { find: /^react\/jsx-runtime$/, replacement: repo + 'frontend/node_modules/react/jsx-runtime.js' },
  ] },
  build: { rollupOptions: { input: { tablero: root+'index.html', pantalla: root+'pantalla.html' } } },
  server: { host:'127.0.0.1', port:5190, strictPort:true, fs:{allow:[repo]} },
});
