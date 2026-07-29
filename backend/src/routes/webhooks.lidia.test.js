import { test } from 'node:test';
import assert from 'node:assert/strict';
import { metodoDeSesion } from './webhooks.js';

test('metodoDeSesion lee el tipo del cargo real (bizum) por encima de los permitidos', () => {
  const pi = { latest_charge: { payment_method_details: { type: 'bizum' } } };
  const session = { payment_method_types: ['card', 'bizum'] };
  assert.equal(metodoDeSesion(pi, session), 'bizum');
});

test('metodoDeSesion devuelve card cuando el cargo es de tarjeta', () => {
  const pi = { latest_charge: { payment_method_details: { type: 'card' } } };
  assert.equal(metodoDeSesion(pi, { payment_method_types: ['card', 'bizum'] }), 'card');
});

test('metodoDeSesion cae al primer método permitido si no hay cargo', () => {
  assert.equal(metodoDeSesion(null, { payment_method_types: ['bizum', 'card'] }), 'bizum');
  assert.equal(metodoDeSesion(undefined, { payment_method_types: ['card'] }), 'card');
});

test('metodoDeSesion usa card como último recurso', () => {
  assert.equal(metodoDeSesion(null, {}), 'card');
  assert.equal(metodoDeSesion(null, null), 'card');
});
