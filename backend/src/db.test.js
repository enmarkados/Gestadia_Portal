import { test } from 'node:test';
import assert from 'node:assert/strict';
import { db } from './db.js';

test('db.user create/findUnique round-trip returns native types', async () => {
  const email = `test-${Date.now()}@example.com`;
  const created = await db.user.create({
    data: { email, nombre: 'Ana', apellidos: 'Ruiz', inviteToken: `tok-${Date.now()}` },
  });
  assert.equal(created.emailVerified, false);
  assert.equal(typeof created.emailVerified, 'boolean');

  const found = await db.user.findUnique({ where: { email } });
  assert.equal(found.id, created.id);

  await db.expediente.create({
    data: {
      nPedido: `GST-TEST-${Date.now()}`,
      userId: created.id,
      servicioSlug: 'canje',
      titulo: 'Canje de permiso',
      importe: 149,
    },
  });

  const withExp = await db.user.findUnique({ where: { email } });
  assert.ok(withExp);

  const exps = await db.expediente.findMany({
    where: { userId: created.id },
    orderBy: { createdAt: 'desc' },
  });
  assert.equal(exps.length, 1);
  assert.equal(exps[0].estado, 'pago_pendiente');
});

test('db.documento.findFirst supports nested expediente/userId filter', async () => {
  const email = `test-doc-${Date.now()}@example.com`;
  const user = await db.user.create({ data: { email, nombre: 'Luis', apellidos: 'Pardo' } });
  const exp = await db.expediente.create({
    data: { nPedido: `GST-DOC-${Date.now()}`, userId: user.id, servicioSlug: 'canje', titulo: 'x', importe: 1 },
  });
  const doc = await db.documento.create({
    data: { expedienteId: exp.id, clave: 'dni_anverso', nombre: 'dni.jpg', mime: 'image/jpeg', size: 100, path: 'x.jpg' },
  });

  const found = await db.documento.findFirst({
    where: { id: doc.id, expediente: { id: exp.id, userId: user.id } },
  });
  assert.ok(found);

  const notFound = await db.documento.findFirst({
    where: { id: doc.id, expediente: { id: exp.id, userId: 'otro-user' } },
  });
  assert.equal(notFound, null);
});
