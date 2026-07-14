import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SERVICIOS, getServicio, faseToEstado } from './catalog.js';

test('el catálogo tiene los 8 servicios del front con precios correctos', () => {
  assert.equal(Object.keys(SERVICIOS).length, 8);
  assert.equal(getServicio('canje-carnet').precio, 210);
  assert.equal(getServicio('transferencia').precio, 190);
});

test('los slugs viejos ya no existen', () => {
  assert.equal(getServicio('canje'), null);
  assert.equal(getServicio('certificados'), null);
  assert.equal(getServicio('jubilacion'), null);
  assert.equal(getServicio('otros'), null);
});

test('checklist deriva de documentos (clave + label)', () => {
  const s = getServicio('canje-carnet');
  assert.ok(Array.isArray(s.checklist) && s.checklist.length > 0);
  assert.ok(s.checklist.every((c) => c.clave && c.label));
  assert.equal(s.checklist[0].clave, 'residencia');
});

test('faseToEstado sigue funcionando para Canje', () => {
  assert.equal(faseToEstado('canje-carnet', 'Completado'), 'completado');
  assert.equal(faseToEstado('canje-carnet', 'Pte. documentación'), 'documentacion_pendiente');
});
