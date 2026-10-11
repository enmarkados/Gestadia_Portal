import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/auth.js";
import { createAppContactService } from "../app/contact.js";
import { AppConversationRegistry } from "../app/registry.js";
import { createZohoCallbackAdapter } from "../services/zoho-callbacks.js";
export function createAppContactRouter({ db, config, service } = {}) {
  const router = Router();
  service ??= createAppContactService({ db, config, crm: createZohoCallbackAdapter(), conversations: new AppConversationRegistry(db, config) });
  router.use((req, res, next) => { res.set("Cache-Control", "no-store"); if (req.headers.authorization) return requireAuth(req, res, next); next(); });
  router.get("/context", async (req,res,next) => { try { res.json(await service.context(req.user)); } catch (e) { next(e); } });
  router.post("/chat", async (req,res,next) => { try { const result = await service.open(req.user, req.headers.authorization?.slice(7), req.get("Idempotency-Key")); res.status(result.pending ? 202 : 200).json(result); } catch (e) { next(e); } });
  router.post("/callback", rateLimit({ windowMs: 900000, limit: 10, standardHeaders: true, legacyHeaders: false }), async (req,res,next) => {
    try { const result = await service.callback(req.user ? `account:${req.user.id}` : `visitor:${req.ip}`, req.body, req.get("Idempotency-Key"), req.user); res.status(result.status === "confirmed" ? 200 : 202).json(result); } catch (e) { next(e); }
  });
  return router;
}
