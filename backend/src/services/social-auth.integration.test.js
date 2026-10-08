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
  "Identidad social: consentimiento, email existente, prueba, replay y vínculo concurrente",
  { skip: !enabled },
  async () => {
    const { createSocialAuth } = await import("./social-auth.js");
    const { createSessionService } = await import("./auth-sessions.js");
    const db = new PrismaClient({ datasourceUrl: url });
    const suffix = randomUUID();
    const cfg = {
      enabled: true,
      google: { webClientId: "web", iosClientId: "ios" },
      apple: {
        clientId: "app",
        serviceId: "service",
        callbackUrl: "https://api.example.com/api/auth/social/apple/callback",
        returnUrl: "gestadia://auth/apple",
      },
    };
    let claims = {
      issuer: "https://accounts.google.com",
      subject: suffix,
      email: `${suffix}@example.com`,
      name: "Test",
    };
    const svc = createSocialAuth({
      db,
      config: cfg,
      verifyToken: async () => claims,
      exchangeApple: async () => {},
      seal: (x) => x,
      sessionFactory: (tx) =>
        createSessionService({ db: tx, enabled: true, secret: "fixture" }),
    });
    try {
      const attempt = await svc.start({
        provider: "google",
        platform: "android",
      });
      await assert.rejects(
        svc.complete({
          attemptId: attempt.id,
          proof: "wrong",
          idToken: "fixture",
        }),
      );
      assert.equal(
        (
          await svc.complete({
            attemptId: attempt.id,
            proof: attempt.proof,
            idToken: "fixture",
          })
        ).status,
        "account_required",
      );
      assert.equal(await db.user.count({ where: { email: claims.email } }), 0);
      await assert.rejects(
        svc.account({
          attemptId: attempt.id,
          proof: attempt.proof,
          action: "create",
          confirm: false,
        }),
      );
      const result = await svc.account({
        attemptId: attempt.id,
        proof: attempt.proof,
        action: "create",
        confirm: true,
      });
      assert.ok(result.token);
      await assert.rejects(
        svc.account({
          attemptId: attempt.id,
          proof: attempt.proof,
          action: "create",
          confirm: true,
        }),
      );
      const user = await db.user.findUnique({ where: { email: claims.email } });
      const session = await db.authSession.findFirst({
        where: { userId: user.id },
      });
      claims = { ...claims, subject: `new-${suffix}` };
      const existing = await svc.start({
        provider: "google",
        platform: "android",
      });
      assert.equal(
        (
          await svc.complete({
            attemptId: existing.id,
            proof: existing.proof,
            idToken: "fixture",
          })
        ).status,
        "existing_account_required",
      );
      await assert.rejects(
        svc.account({
          attemptId: existing.id,
          proof: existing.proof,
          action: "create",
          confirm: true,
        }),
      );
      const actor = { user, session };
      const link = await svc.start(
        { provider: "google", platform: "android", purpose: "link" },
        actor,
      );
      await svc.complete(
        { attemptId: link.id, proof: link.proof, idToken: "fixture" },
        actor,
      );
      await assert.rejects(
        svc.account(
          {
            attemptId: link.id,
            proof: link.proof,
            action: "link",
            confirm: true,
          },
          { user: { id: "other" }, session },
        ),
      );
      const results = await Promise.allSettled([
        svc.account(
          {
            attemptId: link.id,
            proof: link.proof,
            action: "link",
            confirm: true,
          },
          actor,
        ),
        svc.account(
          {
            attemptId: link.id,
            proof: link.proof,
            action: "link",
            confirm: true,
          },
          actor,
        ),
      ]);
      assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
      assert.equal(
        await db.socialIdentity.count({ where: { subject: claims.subject } }),
        1,
      );
    } finally {
      await db.pushDevice.deleteMany({
        where: { user: { email: { contains: suffix } } },
      });
      await db.authSession.deleteMany({
        where: { user: { email: { contains: suffix } } },
      });
      await db.socialIdentity.deleteMany({
        where: { subject: { contains: suffix } },
      });
      await db.user.deleteMany({ where: { email: { contains: suffix } } });
      await db.socialAuthAttempt.deleteMany({
        where: { claims: { path: "$.subject", string_contains: suffix } },
      });
      await db.$disconnect();
    }
  },
);
