import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PREFIJOS, PREFIJO_DEFECTO } from './prefijos.js';

test('lista amplia con España, y varios de canje', () => {
  assert.ok(PREFIJOS.length >= 150, `esperaba lista completa, hay ${PREFIJOS.length}`);
  assert.equal(PREFIJO_DEFECTO, '+34');
  const codigos = PREFIJOS.map((p) => p.codigo);
  for (const c of ['+34', '+54', '+51', '+58', '+212', '+380', '+44', '+81']) {
    assert.ok(codigos.includes(c), `falta prefijo ${c}`);
  }
});

test('cada entrada tiene bandera, codigo (+n) y país', () => {
  for (const p of PREFIJOS) {
    assert.match(p.codigo, /^\+\d{1,4}$/);
    assert.ok(p.pais && p.pais.length);
    assert.ok(p.bandera && [...p.bandera].length >= 1);
  }
});
