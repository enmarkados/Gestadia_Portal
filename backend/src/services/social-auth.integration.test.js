import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
const url = process.env.GESTADIA_MOBILE_TEST_DATABASE_URL;
const enabled =
  !!url &&
  new URL(url).hostname === "127.0.0.1" &&
  ["/gestadia_mobile_test", "/gestadia_app_test"].includes(new URL(url).pathname);
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
      const { accountProof } = await import("../app/identity.js");
      assert.equal(accountProof(user).method, "email");
      assert.ok(user.accountVerifiedAt);
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

test(
  "Proveedor real valida JWT en servicio: Google y Apple Android, prueba y replay",
  { skip: !enabled },
  async () => {
    const { generateKeyPair, exportJWK, SignJWT, createLocalJWKSet } =
      await import("jose");
    const { createSocialTokenVerifier } = await import("./social-tokens.js");
    const { createSocialAuth } = await import("./social-auth.js");
    const { createSessionService } = await import("./auth-sessions.js");
    const { createMobileCrypto } = await import("./mobile-crypto.js");
    const keys = await generateKeyPair("RS256");
    const jwk = await exportJWK(keys.publicKey);
    const jwks = createLocalJWKSet({
      keys: [{ ...jwk, kid: "fixture", alg: "RS256" }],
    });
    const db = new PrismaClient({ datasourceUrl: url });
    const ids = [],
      suffix = randomUUID();
    let appleToken;
    const config = {
      enabled: true,
      google: { webClientId: "web", iosClientId: "ios" },
      apple: {
        clientId: "app",
        serviceId: "service",
        callbackUrl: "https://api.example.com/api/auth/social/apple/callback",
        returnUrl: "gestadia://auth/apple",
      },
    };
    const crypto = createMobileCrypto(Buffer.alloc(32, 1).toString("base64"));
    const service = createSocialAuth({
      db,
      config,
      verifyToken: createSocialTokenVerifier({
        keySets: { google: jwks, apple: jwks },
      }),
      exchangeApple: async () => ({
        id_token: appleToken,
        refresh_token: "private-refresh",
      }),
      seal: crypto.seal,
      sessionFactory: (tx) =>
        createSessionService({ db: tx, enabled: true, secret: "fixture" }),
    });
    const signed = (issuer, audience, nonce) =>
      new SignJWT({
        nonce,
        email: `${suffix}@example.com`,
        email_verified: true,
      })
        .setProtectedHeader({ alg: "RS256", kid: "fixture" })
        .setIssuer(issuer)
        .setSubject(suffix)
        .setAudience(audience)
        .setIssuedAt()
        .setExpirationTime("5m")
        .sign(keys.privateKey);
    try {
      const google = await service.start({
        provider: "google",
        platform: "ios",
      });
      ids.push(google.id);
      const result = await service.complete({
        attemptId: google.id,
        proof: google.proof,
        idToken: await signed(
          "https://accounts.google.com",
          "web",
          google.nonce,
        ),
      });
      assert.equal(result.status, "account_required");
      const apple = await service.start({
        provider: "apple",
        platform: "android",
      });
      ids.push(apple.id);
      appleToken = await signed(
        "https://appleid.apple.com",
        "service",
        apple.nonce,
      );
      const state = new URL(apple.authorizationUrl).searchParams.get("state");
      const outcomes = await Promise.allSettled([
        service.appleCallback({ state, code: "fixture" }),
        service.appleCallback({ state, code: "fixture" }),
      ]);
      assert.equal(outcomes.filter((x) => x.status === "fulfilled").length, 1);
      const returned = new URL(
        outcomes.find((x) => x.status === "fulfilled").value,
      );
      assert.equal(returned.searchParams.has("id_token"), false);
      assert.equal(returned.href.includes("private-refresh"), false);
      assert.equal(returned.href.includes(apple.proof), false);
      const input = {
        attemptId: apple.id,
        proof: apple.proof,
        code: returned.searchParams.get("code"),
      };
      await assert.rejects(service.complete({ ...input, proof: "stolen" }));
      assert.equal((await service.complete(input)).status, "account_required");
      await assert.rejects(service.complete(input));
    } finally {
      await db.socialAuthAttempt.deleteMany({ where: { id: { in: ids } } });
      await db.$disconnect();
    }
  },
);
