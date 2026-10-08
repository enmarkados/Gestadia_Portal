import { Router, urlencoded } from "express";
import { db } from "../db.js";
import { config } from "../config.js";
import { mobileConfig } from "../mobile-config.js";
import { requireAuth } from "../middleware/auth.js";
import { createSessionService } from "../services/auth-sessions.js";
import { createSocialAuth } from "../services/social-auth.js";
import { verifySocialToken } from "../services/social-tokens.js";
import { sealCredential } from "../services/mobile-crypto.js";
import { exchangeApple } from "../services/apple-auth.js";
export const socialAuthRouter = Router();
const service = createSocialAuth({
  db,
  config: mobileConfig,
  verifyToken: verifySocialToken,
  exchangeApple,
  seal: sealCredential,
  sessionFactory: (tx) =>
    createSessionService({
      db: tx,
      secret: config.jwtSecret,
      enabled: mobileConfig.enabled,
    }),
});
function optionalAuth(req, res, next) {
  if (req.headers.authorization) return requireAuth(req, res, next);
  next();
}
for (const [path, method] of [
  ["attempts", "start"],
  ["complete", "complete"],
  ["account", "account"],
]) {
  socialAuthRouter.post(
    `/api/auth/social/${path}`,
    optionalAuth,
    async (req, res, next) => {
      try {
        const result = await service[method](req.body || {}, {
          user: req.user,
          session: req.authSession,
        });
        res.set("Cache-Control", "no-store").json(result);
      } catch (error) {
        next(error);
      }
    },
  );
}
socialAuthRouter.post(
  "/api/auth/social/apple/callback",
  urlencoded({ extended: false, limit: "16kb" }),
  async (req, res) => {
    try {
      const url = await service.appleCallback(req.body || {});
      res
        .set({ "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" })
        .redirect(303, url);
    } catch {
      res
        .status(400)
        .send(
          "No se pudo completar el acceso Apple. Vuelve a la app e inténtalo de nuevo.",
        );
    }
  },
);
