import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import nodemailer from 'nodemailer';
import { noticeEmail, recoveryEmail } from './email-templates.js';
const config = { baseUrl: 'https://gestadia.com', smtp: { enabled: true, host: 'smtp.example.test', port: 465, user: 'fixture', pass: 'fixture', from: 'Gestadia <remitente@example.test>' } };
const sent = [];
const transport = { sendMail: async message => { sent.push(message); return {}; } };
mock.method(nodemailer, 'createTransport', () => transport);
mock.module('../config.js', { namedExports: { config } });
mock.module('../db.js', { namedExports: { db: {} } });
mock.module('./push/runtime.js', { namedExports: { pushService: { notify: async () => ({ id: 'fixture' }) } } });
const { sendEmail, notifyUser } = await import('./notify.js');
test('SMTP conserva remitente autenticado y transmite Reply-To, HTML, texto y logo CID', async () => {
  const message = recoveryEmail({ baseUrl: config.baseUrl, nombre: 'Ana', token: 'fixture' });
  await sendEmail('destinatario@example.test', 'Recupera tu acceso', message);
  assert.equal(sent[0].from, config.smtp.from);
  assert.equal(sent[0].replyTo, 'info@gestadia.com');
  assert.equal(sent[0].to, 'destinatario@example.test');
  assert.equal(sent[0].text, message.text);
  assert.equal(sent[0].html, message.html);
  assert.equal(sent[0].attachments[0].cid, 'gestadia-logo');
});
test('avisos reales pasan por la plantilla y el error SMTP sigue siendo visible al llamante', async () => {
  await notifyUser({ id: 'u', email: 'ana@example.test', nombre: 'Ana' }, { titulo: 'En gestión', cuerpo: 'Tu trámite está en gestión.' });
  assert.match(sent.at(-1).html, /cid:gestadia-logo/);
  assert.match(sent.at(-1).text, /Tu trámite está en gestión/);
  mock.method(transport, 'sendMail', async () => { throw new Error('smtp_unavailable_fixture'); });
  await assert.rejects(sendEmail('ana@example.test', 'Aviso', noticeEmail({ baseUrl: config.baseUrl, nombre: 'Ana', titulo: 'Aviso', cuerpo: 'Prueba' })), /smtp_unavailable_fixture/);
});
