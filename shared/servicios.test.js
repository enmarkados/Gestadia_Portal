import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SERVICIOS, checklistExpediente, validarDatosCanje } from './servicios.js';

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

test('canje-carnet tiene flags requierePais/requiereDireccion', () => {
  assert.equal(SERVICIOS['canje-carnet'].requierePais, true);
  assert.equal(SERVICIOS['canje-carnet'].requiereDireccion, true);
  assert.equal(SERVICIOS['duplicado-carnet'].requierePais, undefined);
});

test('checklistExpediente = base + extra del país', () => {
  assert.equal(checklistExpediente('canje-carnet', 'argentina').length, 4);
  assert.equal(checklistExpediente('canje-carnet', 'alemania').length, 3);
  assert.equal(checklistExpediente('canje-carnet', null).length, 3);
  const arg = checklistExpediente('canje-carnet', 'argentina');
  assert.equal(arg.at(-1).clave, 'historial_apostillado');
});

test('validarDatosCanje exige país válido y campos manuales', () => {
  const s = SERVICIOS['canje-carnet'];
  const dirOK = { nombreVia: 'Gran Vía', numero: '1', codigoPostal: '28013', municipio: 'Madrid', provincia: 'Madrid' };
  assert.equal(validarDatosCanje(s, { paisCanje: 'argentina', direccion: dirOK, datosPais: {} }), null);
  assert.match(validarDatosCanje(s, { paisCanje: '', direccion: dirOK, datosPais: {} }), /país/i);
  assert.match(validarDatosCanje(s, { paisCanje: 'zzz', direccion: dirOK, datosPais: {} }), /país/i);
  assert.match(validarDatosCanje(s, { paisCanje: 'argelia', direccion: dirOK, datosPais: { wilaya: 'Argel' } }), /Daira/i);
  assert.equal(validarDatosCanje(s, { paisCanje: 'argelia', direccion: dirOK, datosPais: { wilaya: 'Argel', daira: 'X' } }), null);
  assert.match(validarDatosCanje(s, { paisCanje: 'argentina', direccion: { nombreVia: 'x' }, datosPais: {} }), /dirección/i);
});

test('validarDatosCanje no exige nada a servicios sin flags', () => {
  assert.equal(validarDatosCanje(SERVICIOS['duplicado-carnet'], { paisCanje: '', direccion: {}, datosPais: {} }), null);
});
