import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { pushService } from "../services/push/runtime.js";
export const pushRouter = Router();
pushRouter.use("/api/push", requireAuth);
pushRouter.post("/api/push/devices", async (req, res, next) => {
  try {
    const d = await pushService.register(req.body || {}, {
      user: req.user,
      session: req.authSession,
    });
    res.json({ id: d.id });
  } catch (error) {
    next(error);
  }
});
pushRouter.delete(
  "/api/push/devices/:installationId",
  async (req, res, next) => {
    try {
      await pushService.revoke(req.params.installationId, {
        user: req.user,
        session: req.authSession,
      });
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  },
);
