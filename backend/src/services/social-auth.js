import { randomBytes, randomUUID } from "node:crypto";
import { digest, sameDigest } from "./mobile-crypto.js";
const fail = () => {
  throw Object.assign(new Error("Acceso social no válido o caducado"), {
    status: 400,
  });
};
const random = () => randomBytes(32).toString("base64url");
export function createSocialAuth({
  db,
  config,
  verifyToken,
  exchangeApple,
  seal,
  sessionFactory,
  now = () => new Date(),
}) {
  function actorValid(a, actor) {
    if (
      a.purpose === "link" &&
      (!actor?.session ||
        a.linkUserId !== actor.user.id ||
        a.authSessionId !== actor.session.id ||
        actor.session.revokedAt ||
        actor.session.expiresAt <= now())
    )
      fail();
  }
  async function attempt(input, actor, client = db) {
    const a = await client.socialAuthAttempt.findUnique({
      where: { id: input.attemptId },
    });
    if (
      !a ||
      a.consumedAt ||
      a.expiresAt <= now() ||
      !sameDigest(a.proofHash, digest(String(input.proof || "")))
    )
      fail();
    actorValid(a, actor);
    return a;
  }
  async function consume(tx, a) {
    const used = await tx.socialAuthAttempt.updateMany({
      where: {
        id: a.id,
        status: "verified",
        consumedAt: null,
        expiresAt: { gt: now() },
      },
      data: { status: "consumed", consumedAt: now(), handoffCodeHash: null },
    });
    if (used.count !== 1) fail();
  }
  async function decision(a, actor) {
    if (a.purpose === "link")
      return { status: "link_required", attemptId: a.id };
    const identity = await db.socialIdentity.findUnique({
      where: {
        issuer_subject: { issuer: a.claims.issuer, subject: a.claims.subject },
      },
      include: { user: true },
    });
    if (identity)
      return db.$transaction(async (tx) => {
        const fresh = await attempt(
          { attemptId: a.id, proof: actor.proof },
          null,
          tx,
        );
        await consume(tx, fresh);
        if (fresh.provider === "apple")
          await tx.socialIdentity.update({
            where: { id: identity.id },
            data: {
              appleRefreshEncrypted: fresh.appleRefreshEncrypted,
              appleAudience: fresh.audience,
              appleRevokedAt: null,
            },
          });
        return sessionFactory(tx).issue(identity.user, a.platform);
      });
    const existing =
      a.claims.email &&
      (await db.user.findUnique({ where: { email: a.claims.email } }));
    return {
      status: existing ? "existing_account_required" : "account_required",
      attemptId: a.id,
      emailAvailable: !!a.claims.email,
    };
  }
  return {
    async start({ provider, platform, purpose = "login" }, actor) {
      if (
        !config.enabled ||
        !["google", "apple"].includes(provider) ||
        !["ios", "android"].includes(platform) ||
        !["login", "link"].includes(purpose)
      )
        fail();
      if (
        purpose === "link" &&
        (!actor?.session || actor.session.platform !== platform)
      )
        fail();
      const audience =
        provider === "google"
          ? config.google.webClientId
          : platform === "ios"
            ? config.apple.clientId
            : config.apple.serviceId;
      if (!audience) fail();
      const id = randomUUID(),
        nonce = random(),
        state = random(),
        proof = random();
      await db.socialAuthAttempt.create({
        data: {
          id,
          provider,
          platform,
          purpose,
          linkUserId: purpose === "link" ? actor.user.id : null,
          authSessionId: purpose === "link" ? actor.session.id : null,
          audience,
          nonceHash: digest(nonce),
          stateHash: digest(state),
          proofHash: digest(proof),
          expiresAt: new Date(now().getTime() + 300000),
        },
      });
      const result = { id, nonce, proof };
      if (provider === "apple" && platform === "android") {
        const url = new URL("https://appleid.apple.com/auth/authorize");
        url.search = new URLSearchParams({
          client_id: audience,
          redirect_uri: config.apple.callbackUrl,
          response_type: "code",
          response_mode: "form_post",
          scope: "name email",
          state,
          nonce,
        }).toString();
        result.authorizationUrl = url.href;
      }
      return result;
    },
    async appleCallback({ state, code, error }) {
      if (
        !config.enabled ||
        error ||
        typeof state !== "string" ||
        typeof code !== "string" ||
        state.length > 200 ||
        code.length > 4096
      )
        fail();
      const a = await db.socialAuthAttempt.findUnique({
        where: { stateHash: digest(state) },
      });
      if (
        !a ||
        a.provider !== "apple" ||
        a.platform !== "android" ||
        a.status !== "pending" ||
        a.expiresAt <= now()
      )
        fail();
      const exchanged = await exchangeApple(
        code,
        a.audience,
        config.apple.callbackUrl,
      );
      const claims = await verifyToken(a, exchanged.id_token);
      if (!exchanged.refresh_token) fail();
      const handoff = random();
      const saved = await db.socialAuthAttempt.updateMany({
        where: { id: a.id, status: "pending", expiresAt: { gt: now() } },
        data: {
          status: "verified",
          claims,
          appleRefreshEncrypted: seal(
            exchanged.refresh_token,
            `apple:${claims.subject}`,
          ),
          handoffCodeHash: digest(handoff),
          handoffExpiresAt: new Date(now().getTime() + 60000),
        },
      });
      if (saved.count !== 1) fail();
      return `${config.apple.returnUrl}?code=${encodeURIComponent(handoff)}&attempt=${encodeURIComponent(a.id)}`;
    },
    async complete(input, actor) {
      let a = await attempt(input, actor);
      if (a.provider === "apple" && a.platform === "android") {
        if (
          a.status !== "verified" ||
          !a.handoffExpiresAt ||
          a.handoffExpiresAt <= now() ||
          !sameDigest(a.handoffCodeHash, digest(String(input.code || "")))
        )
          fail();
        const consumed = await db.socialAuthAttempt.updateMany({
          where: {
            id: a.id,
            handoffCodeHash: a.handoffCodeHash,
            status: "verified",
          },
          data: { handoffCodeHash: null },
        });
        if (consumed.count !== 1) fail();
      } else {
        if (a.status !== "pending") fail();
        let idToken = input.idToken,
          encrypted = null;
        if (a.provider === "apple") {
          const exchanged = await exchangeApple(
            input.authorizationCode,
            a.audience,
          );
          const nativeClaims = await verifyToken(a, idToken);
          const codeClaims = await verifyToken(a, exchanged.id_token);
          if (
            nativeClaims.subject !== codeClaims.subject ||
            !exchanged.refresh_token
          )
            fail();
          idToken = exchanged.id_token;
          encrypted = seal(
            exchanged.refresh_token,
            `apple:${codeClaims.subject}`,
          );
        }
        const claims = await verifyToken(a, idToken);
        const saved = await db.socialAuthAttempt.updateMany({
          where: { id: a.id, status: "pending", expiresAt: { gt: now() } },
          data: {
            status: "verified",
            claims,
            appleRefreshEncrypted: encrypted,
          },
        });
        if (saved.count !== 1) fail();
        a = { ...a, status: "verified", claims };
      }
      return decision(a, { ...actor, proof: input.proof });
    },
    async account(input, actor) {
      if (input.confirm !== true || !["create", "link"].includes(input.action))
        fail();
      return db.$transaction(async (tx) => {
        const a = await attempt(input, actor, tx);
        if (a.status !== "verified" || !a.claims || a.handoffCodeHash) fail();
        if ((input.action === "link") !== (a.purpose === "link")) fail();
        let user;
        if (input.action === "link") {
          const live = await tx.authSession.findUnique({
            where: { id: a.authSessionId },
            include: { user: true },
          });
          if (
            !live ||
            live.revokedAt ||
            live.expiresAt <= now() ||
            live.user.accessRevokedAt
          )
            fail();
          user = live.user;
        } else {
          if (
            !a.claims.email ||
            (await tx.user.findUnique({ where: { email: a.claims.email } }))
          )
            fail();
          user = await tx.user.create({
            data: {
              email: a.claims.email,
              nombre: a.claims.name || "Usuario",
              apellidos: "",
              emailVerified: true,
            },
          });
        }
        await consume(tx, a);
        await tx.socialIdentity.create({
          data: {
            userId: user.id,
            issuer: a.claims.issuer,
            subject: a.claims.subject,
            provider: a.provider,
            appleRefreshEncrypted: a.appleRefreshEncrypted,
            appleAudience: a.provider === "apple" ? a.audience : null,
          },
        });
        return input.action === "link"
          ? { status: "linked" }
          : sessionFactory(tx).issue(user, a.platform);
      });
    },
  };
}
