import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SERVICIOS } from './servicios.js';

const SLUGS = [
  'canje-carnet', 'duplicado-carnet', 'duplicado-datos', 'permiso-internacional',
  'transferencia', 'baja-vehiculo', 'cancelacion-dominio', 'duplicado-circulacion',
];

test('están exactamente los 8 servicios del front', () => {
  assert.deepEqual(Object.keys(SERVICIOS).sort(), [...SLUGS].sort());
});

test('cada servicio tiene precio numérico, documentos con clave+label y mapeo zoho', () => {
  for (const slug of SLUGS) {
    const s = SERVICIOS[slug];
    assert.equal(s.slug, slug);
    assert.equal(typeof s.precio, 'number');
    assert.ok(s.precio > 0);
    assert.ok(Array.isArray(s.documentos) && s.documentos.length > 0);
    for (const d of s.documentos) assert.ok(d.clave && d.label, `doc sin clave/label en ${slug}`);
    assert.ok(Array.isArray(s.includes) && s.includes.length > 0);
    assert.equal(typeof s.zoho.servicio, 'string');
    assert.ok(s.zoho.servicio.length > 0);
    assert.ok(s.zoho.fases && Object.keys(s.zoho.fases).length > 0);
  }
});

test('los precios coinciden con el front', () => {
  assert.equal(SERVICIOS['canje-carnet'].precio, 210);
  assert.equal(SERVICIOS['duplicado-carnet'].precio, 70);
  assert.equal(SERVICIOS['duplicado-datos'].precio, 70);
  assert.equal(SERVICIOS['permiso-internacional'].precio, 100);
  assert.equal(SERVICIOS['transferencia'].precio, 190);
  assert.equal(SERVICIOS['baja-vehiculo'].precio, 190);
  assert.equal(SERVICIOS['cancelacion-dominio'].precio, 120);
  assert.equal(SERVICIOS['duplicado-circulacion'].precio, 70);
});
