import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PAISES } from './paises-canje.js';

const conv = Object.values(PAISES).filter((p) => p.tipo === 'convenio');
const ue = Object.values(PAISES).filter((p) => p.tipo === 'ue');

test('hay 33 países con convenio y 29 UE/EEE', () => {
  assert.equal(conv.length, 33);
  assert.equal(ue.length, 29);
});

test('España no está (no se canjea un permiso español)', () => {
  assert.ok(!Object.values(PAISES).some((p) => p.nombre === 'España'));
});

test('los 5 países con documento extra', () => {
  assert.equal(PAISES['argentina'].documentosExtra[0].label, 'Historial de conducción apostillado (La Haya)');
  assert.equal(PAISES['reino-unido'].documentosExtra[0].label, 'Check Code actualizado (DVLA)');
  assert.equal(PAISES['corea-del-sur'].documentosExtra[0].label, 'Traducción oficial del permiso');
  assert.equal(PAISES['filipinas'].documentosExtra[0].label, 'Pasaporte');
  assert.equal(PAISES['japon'].documentosExtra[0].label, 'Traducción y verificación del permiso');
});

test('los campos manuales por país (§5.4)', () => {
  assert.deepEqual(PAISES['argelia'].camposExtra.map((c) => c.clave), ['wilaya', 'daira']);
  assert.equal(PAISES['bolivia'].camposExtra[0].clave, 'lugar_expedicion');
  assert.equal(PAISES['nicaragua'].camposExtra[0].clave, 'lugar_expedicion');
  assert.equal(PAISES['republica-dominicana'].camposExtra[0].clave, 'lugar_expedicion');
  assert.equal(PAISES['paraguay'].camposExtra.length, 0); // Nº Computación es tarea interna
});

test('todo país tiene documentosExtra y camposExtra como arrays', () => {
  for (const p of Object.values(PAISES)) {
    assert.ok(Array.isArray(p.documentosExtra));
    assert.ok(Array.isArray(p.camposExtra));
    assert.ok(p.clave && p.nombre);
  }
});
