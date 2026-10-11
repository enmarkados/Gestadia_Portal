import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { recoveryEmail, welcomeEmail, noticeEmail } from './email-templates.js';

const baseUrl = 'https://gestadia.com';
test('recuperación presenta marca, caducidad, enlace exacto y alternativa de texto', () => {
  const email = recoveryEmail({ baseUrl, nombre: 'María', token: 'token-prueba' });
  assert.match(email.html, /cid:gestadia-logo/);
  assert.match(email.html, /#2c2c2c/);
  assert.match(email.html, /#c0392b/);
  assert.match(email.html, /caduca en 2 horas/);
  assert.match(email.text, /https:\/\/gestadia.com\/portal\/crear-clave\/token-prueba/);
  assert.match(email.text, /Si no has solicitado/);
  assert.equal(email.attachments[0].cid, 'gestadia-logo');
  assert.equal(fs.readFileSync(email.attachments[0].path).subarray(1, 4).toString(), 'PNG');
});
test('los tres correos comparten responsable, derechos, contacto y privacidad', () => {
  const emails = [recoveryEmail({ baseUrl, nombre: 'Ana', token: 'x' }), welcomeEmail({ baseUrl, nombre: 'Ana', token: 'x', importe: 39, titulo: 'Trámite', pedido: '123' }), noticeEmail({ baseUrl, nombre: 'Ana', titulo: 'Actualización', cuerpo: 'En gestión' })];
  for (const email of emails) {
    for (const content of [email.html, email.text]) {
      assert.match(content, /Defensa Legal Consumidores, S\.L\./);
      assert.match(content, /B01813336/);
      assert.match(content, /info@gestadia\.com/);
      assert.match(content, /RGPD y la LOPDGDD/);
      assert.match(content, /acceso, rectificación, supresión/);
      assert.match(content, /https:\/\/gestadia\.com\/privacidad/);
    }
  }
});
test('datos del destinatario, título y nota no pueden inyectar HTML', () => {
  const email = noticeEmail({ baseUrl, nombre: '<img src=x>', titulo: '<script>alert(1)</script>', cuerpo: 'A & B\n<img src=x onerror=alert(1)>' });
  assert.doesNotMatch(email.html, /<script>|<img src=x/);
  assert.match(email.html, /&lt;img src=x/);
  assert.match(email.html, /A &amp; B<br>/);
  assert.match(email.text, /A & B\n<img src=x/);
});
test('bienvenida conserva importe, pedido y token codificado, sin operaciones de pago', () => {
  const email = welcomeEmail({ baseUrl, nombre: 'Ana', token: 'a/b?c', importe: 42.5, titulo: 'Cambio & titular', pedido: 'G-1' });
  assert.match(email.html, /42,50/);
  assert.match(email.html, /Cambio &amp; titular/);
  assert.match(email.text, /pedido G-1/);
  assert.match(email.text, /crear-clave\/a%2Fb%3Fc/);
});
test('se rechazan bases de enlace inseguras o ajenas a un origen', () => {
  for (const url of ['javascript:alert(1)', 'http://gestadia.com', 'https://u:p@gestadia.com', 'https://gestadia.com/path']) {
    assert.throws(() => recoveryEmail({ baseUrl: url, nombre: 'Ana', token: 'x' }));
  }
});
