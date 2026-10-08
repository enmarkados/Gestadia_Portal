import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
const url = process.env.GESTADIA_MOBILE_TEST_DATABASE_URL;
const enabled =
  !!url &&
  new URL(url).hostname === "127.0.0.1" &&
  new URL(url).pathname === "/gestadia_mobile_test";
test(
  "Solicitud de borrado exige sesión reciente, retira acceso y registra estado pendiente",
  { skip: !enabled },
  async () => {
    const { createAccountDeletion } = await import("./account-deletion.js");
    const db = new PrismaClient({ datasourceUrl: url });
    const id = randomUUID();
    const svc = createAccountDeletion({ db });
    try {
      const user = await db.user.create({
        data: { email: `${id}@example.com`, nombre: "Fixture", apellidos: "" },
      });
      const session = await db.authSession.create({
        data: {
          id,
          userId: user.id,
          platform: "ios",
          expiresAt: new Date(Date.now() + 100000),
        },
      });
      await assert.rejects(
        svc.request(
          { user, session: { ...session, createdAt: new Date(0) } },
          true,
        ),
      );
      await assert.rejects(svc.request({ user, session }, false));
      const result = await svc.request({ user, session }, true);
      assert.equal(result.status, "pending_review");
      assert.ok(
        (await db.user.findUnique({ where: { id: user.id } })).accessRevokedAt,
      );
      assert.ok((await db.authSession.findUnique({ where: { id } })).revokedAt);
      assert.equal(await db.user.count({ where: { id: user.id } }), 1);
    } finally {
      await db.accountDeletionRequest.deleteMany({
        where: { user: { email: `${id}@example.com` } },
      });
      await db.authSession.deleteMany({ where: { id } });
      await db.user.deleteMany({ where: { email: `${id}@example.com` } });
      await db.$disconnect();
    }
  },
);
