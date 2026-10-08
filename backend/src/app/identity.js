import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { sha256 } from "./s2s.js";
import { AppProblem } from "./problem.js";
import { UUID } from "./contracts.js";
export function accountProof(user) {
  if (!user || user.accountStatus !== "active")
    throw new AppProblem(403, "account_disabled");
  if (
    !UUID.test(user.id || "") ||
    !user.emailVerified ||
    !user.accountVerifiedAt ||
    !["email", "invitation"].includes(user.accountVerificationMethod)
  )
    throw new AppProblem(403, "identity_verification_required");
  return {
    verification_level: "account_verified",
    verified_at: new Date(user.accountVerifiedAt).toISOString(),
    method: user.accountVerificationMethod,
    account_status: "active",
  };
}
export async function recordAccountProof(db, userId, method, now = new Date()) {
  if (!["email", "invitation"].includes(method))
    throw new AppProblem(400, "invalid_payload");
  const apply = async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        accountVerifiedAt: now,
        accountVerificationMethod: method,
      },
    });
    await tx.appDeviceSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: now },
    });
  };
  return db.$transaction ? db.$transaction(apply) : apply(db);
}
export class AppIdentity {
  constructor(db, { clock = () => new Date() } = {}) {
    Object.assign(this, { db, clock });
  }
  async login(email, password, deviceLabel = "Dispositivo") {
    if (
      typeof email !== "string" ||
      email.length > 254 ||
      typeof password !== "string" ||
      password.length > 1024 ||
      typeof deviceLabel !== "string" ||
      !deviceLabel.trim() ||
      deviceLabel.length > 80
    )
      throw new AppProblem(400, "invalid_payload");
    const user = await this.db.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (
      !user?.passwordHash ||
      !(await bcrypt.compare(password, user.passwordHash))
    )
      throw new AppProblem(401, "invalid_credentials");
    accountProof(user);
    const token = `ga_${randomBytes(32).toString("base64url")}`,
      now = this.clock();
    const row = await this.db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM User WHERE id = ${user.id} FOR UPDATE`;
      const current = await tx.user.findUnique({ where: { id: user.id } });
      accountProof(current);
      if (current.passwordHash !== user.passwordHash)
        throw new AppProblem(401, "invalid_credentials");
      return tx.appDeviceSession.create({
        data: {
          userId: user.id,
          tokenHash: sha256(token),
          deviceLabel,
          expiresAt: new Date(now.getTime() + 30 * 86400000),
        },
      });
    });
    return {
      token,
      session_id: row.id,
      expires_at: row.expiresAt.toISOString(),
    };
  }
  async authenticate(token) {
    if (typeof token !== "string" || !/^ga_[A-Za-z0-9_-]{43}$/.test(token))
      throw new AppProblem(401, "session_expired");
    const session = await this.db.appDeviceSession.findUnique({
      where: { tokenHash: sha256(token) },
      include: { user: true },
    });
    if (!session || session.revokedAt || session.expiresAt <= this.clock())
      throw new AppProblem(401, "session_expired");
    accountProof(session.user);
    return { user: session.user, session };
  }
  async logout(token, sessionId) {
    const { user, session } = await this.authenticate(token);
    await this.db.appDeviceSession.updateMany({
      where: { userId: user.id, id: sessionId || session.id, revokedAt: null },
      data: { revokedAt: this.clock() },
    });
  }
  async list(token) {
    const { user } = await this.authenticate(token);
    return (
      await this.db.appDeviceSession.findMany({
        where: {
          userId: user.id,
          revokedAt: null,
          expiresAt: { gt: this.clock() },
        },
        orderBy: { createdAt: "desc" },
      })
    ).map((x) => ({
      session_id: x.id,
      device_label: x.deviceLabel,
      created_at: x.createdAt.toISOString(),
      expires_at: x.expiresAt.toISOString(),
    }));
  }
}
export async function consumeAccountProof(
  db,
  userId,
  token,
  viaReset,
  passwordHash,
) {
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM User WHERE id = ${userId} FOR UPDATE`;
    const user = await tx.user.findUnique({ where: { id: userId } }),
      now = new Date();
    if (
      !user ||
      (viaReset
        ? user.resetToken !== token ||
          !user.resetTokenExp ||
          user.resetTokenExp <= now
        : user.inviteToken !== token)
    )
      throw new AppProblem(400, "verification_link_invalid");
    await recordAccountProof(
      tx,
      userId,
      viaReset ? "email" : "invitation",
      now,
    );
    return tx.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        inviteToken: null,
        resetToken: null,
        resetTokenExp: null,
      },
    });
  });
}
