import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalogoLidia, mapearPrefill } from './lidia.js';
import { config } from '../config.js';
import { claveDesdeISO } from '../../../shared/paises-canje.js';

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

test('claveDesdeISO mapea alfa-2 a claves del catálogo', () => {
  assert.equal(claveDesdeISO('CO'), 'colombia');
  assert.equal(claveDesdeISO('gb'), 'reino-unido');
  assert.equal(claveDesdeISO('DE'), 'alemania');
  assert.equal(claveDesdeISO('US'), null); // no canjeable
  assert.equal(claveDesdeISO(''), null);
});

test('mapearPrefill traduce el prefill del contrato al formato del formulario', () => {
  const out = mapearPrefill({
    nombre: 'Ana', apellidos: 'García López', email: 'ana@example.com',
    tipo_documento: 'PASAPORTE', num_documento: 'X1234567L',
    pais_canje: 'CO', direccion: 'Calle Ejemplo 10, Madrid', telefono: '+34600111222',
  });
  assert.deepEqual(out, {
    nombre: 'Ana', apellidos: 'García López', email: 'ana@example.com',
    tipoDocumento: 'Pasaporte', numDocumento: 'X1234567L',
    paisCanje: 'colombia', telefono: '+34600111222',
  });
});

test('mapearPrefill omite lo no mapeable sin romper', () => {
  assert.deepEqual(mapearPrefill({ tipo_documento: 'OTRO', pais_canje: 'US' }), {});
  assert.deepEqual(mapearPrefill(undefined), {});
});
