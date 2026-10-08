import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { accountDeletion } from "../services/account-deletion.js";
export const accountDeletionRouter = Router();
accountDeletionRouter.post(
  "/api/me/deletion-request",
  requireAuth,
  async (req, res, next) => {
    try {
      res
        .status(202)
        .json(
          await accountDeletion.request(
            { user: req.user, session: req.authSession },
            req.body?.confirm,
          ),
        );
    } catch (error) {
      next(error);
    }
  },
);
