import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalogoLidia } from './lidia.js';
import { config } from '../config.js';

test('catalogoLidia resuelve canje_1_categoria con el precio del catálogo', () => {
  const cat = catalogoLidia('canje_1_categoria');
  assert.equal(cat.servicioSlug, 'canje-carnet');
  assert.equal(cat.amountMinor, 21000);
  assert.equal(cat.currency, 'EUR');
});

test('catalogoLidia devuelve null para códigos no habilitados', () => {
  assert.equal(catalogoLidia('canje_2_categorias'), null);
  assert.equal(catalogoLidia(''), null);
  assert.equal(catalogoLidia(undefined), null);
});

test('config.lidia expone TTL por defecto de 7 días y callbackUrl con la ruta fija', () => {
  assert.equal(config.lidia.intentTtlDias, 7);
  assert.equal(config.lidia.callbackKeyVersion, 'v1');
  // sin LIDIA_CALLBACK_BASE_URL la URL queda vacía (integración apagada)
  assert.equal(config.lidia.callbackUrl, '');
  assert.equal(config.lidia.enabled, false);
});
