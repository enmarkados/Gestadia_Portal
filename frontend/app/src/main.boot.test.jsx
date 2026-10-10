import { beforeEach, expect, test, vi } from 'vitest';
import { waitFor } from '@testing-library/react';

const boot = vi.hoisted(() => ({ render: vi.fn(), storageFails: false, finish: vi.fn(async () => {}), keyboard: vi.fn(async () => {}) }));
vi.mock('react-dom/client', () => ({ createRoot: () => ({ render: boot.render }) }));
vi.mock('./AppContext.jsx', () => ({ AppProvider: () => null, useApp: () => ({ mode: 'visitante', data: {} }) }));
vi.mock('./PluginWebContext.jsx', () => ({ PluginWebProvider: () => null }));
vi.mock('./App.jsx', () => ({ default: () => null }));
vi.mock('./native.js', () => ({
  isNative: () => true,
  loadNativeConfig: async () => {},
  setupNativeNavigation: () => {},
  setupNativeKeyboard: boot.keyboard,
  finishSplash: boot.finish,
}));
vi.mock('./social-auth.js', () => ({ setupSocialReturn: async () => {} }));
vi.mock('./sessionStorage.js', () => ({ initializeNativeSession: async () => {
  if (boot.storageFails) throw new Error('Fallo de almacén seguro');
  // El chunk SecureStorageNative generado por Vite vuelve a importar la entrada.
  await import('./main.jsx');
} }));

beforeEach(() => {
  vi.resetModules();
  boot.render.mockClear();
  boot.keyboard.mockClear();
  boot.finish.mockClear();
  boot.storageFails = false;
  document.body.innerHTML = '<div id="root"></div>';
});

test('la entrada termina de evaluarse y permite cargar el chunk nativo que vuelve a importarla', async () => {
  const result = await Promise.race([
    import('./main.jsx').then(() => 'evaluada'),
    new Promise(resolve => setTimeout(() => resolve('bloqueada'), 1000)),
  ]);
  expect(result).toBe('evaluada');
  await waitFor(() => expect(boot.render).toHaveBeenCalledOnce());
  expect(boot.keyboard).toHaveBeenCalledOnce();
});

test('un fallo de arranque muestra recuperación y retira la pantalla inicial', async () => {
  boot.storageFails = true;
  await import('./main.jsx');
  await waitFor(() => expect(boot.render).toHaveBeenCalledOnce());
  expect(boot.render.mock.calls[0][0].props.failed).toBe(true);
  expect(boot.finish).toHaveBeenCalledOnce();
});
