import express from "express";
import rateLimit from "express-rate-limit";
import { randomUUID } from "node:crypto";
import { AppIdentity } from "./identity.js";
import { AppS2SClient } from "./s2s.js";
import { AppConversationService } from "./conversations.js";
import { AppProblem, problem } from "./problem.js";
export function createAppRouter({
  db,
  config,
  client,
  service,
  identity,
} = {}) {
  const router = express.Router();
  identity ??= new AppIdentity(db);
  service ??= new AppConversationService(
    db,
    client || new AppS2SClient(config),
    config,
  );
  router.use((req, res, next) => {
    res.set("Cache-Control", "no-store").vary("Authorization");
    req.correlationId = randomUUID();
    if (!config?.enabled)
      return problem(
        res,
        new AppProblem(503, "runtime_unavailable"),
        req.correlationId,
      );
    next();
  });
  const limited = (limit, windowMs) =>
    rateLimit({
      limit,
      windowMs,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) =>
        problem(res, new AppProblem(429, "rate_limited"), req.correlationId),
    });
  router.use(limited(240, 60000));
  router.use("/auth", limited(30, 900000));
  router.use(
    express.json({
      limit: "32kb",
      inflate: false,
      verify: (_req, _res, bytes) => {
        try {
          new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(
            bytes,
          );
          if (bytes[0] === 239 && bytes[1] === 187 && bytes[2] === 191)
            throw new Error("BOM");
        } catch {
          throw new AppProblem(400, "invalid_payload");
        }
      },
    }),
  );
  const run = (fn) => async (req, res, next) => {
    try {
      await fn(req, res);
    } catch (e) {
      next(e);
    }
  };
  router.post(
    "/auth/sessions",
    run(async (req, res) => {
      const body = req.body || {};
      if (
        Object.keys(body).some(
          (k) => !["email", "password", "device_label"].includes(k),
        )
      )
        throw new AppProblem(400, "invalid_payload");
      res
        .status(201)
        .json(
          await identity.login(body.email, body.password, body.device_label),
        );
    }),
  );
  router.use(async (req, _res, next) => {
    try {
      const header = req.headers.authorization;
      if (typeof header !== "string" || !header.startsWith("Bearer "))
        throw new AppProblem(401, "session_expired");
      req.appToken = header.slice(7);
      await identity.authenticate(req.appToken);
      next();
    } catch (e) {
      next(e);
    }
  });
  router.get(
    "/auth/sessions",
    run(async (req, res) =>
      res.json({ sessions: await identity.list(req.appToken) }),
    ),
  );
  router.delete(
    "/auth/sessions/current",
    run(async (req, res) => {
      await identity.logout(req.appToken);
      res.json({ revoked: true });
    }),
  );
  router.delete(
    "/auth/sessions/:id",
    run(async (req, res) => {
      await identity.logout(req.appToken, req.params.id);
      res.json({ revoked: true });
    }),
  );
  router.get(
    "/conversations",
    run(async (req, res) =>
      res.json({ conversations: await service.list(req.appToken) }),
    ),
  );
  router.post(
    "/conversations",
    run(async (req, res) => {
      const data = await service.start(
        req.appToken,
        req.body,
        req.get("Idempotency-Key"),
      );
      res.status(data.conversation.ready ? 200 : 202).json(data);
    }),
  );
  router.patch(
    "/conversations/:id",
    run(async (req, res) => res.json(await service.rename(req.appToken, req.params.id, req.body))),
  );
  router.get(
    "/conversations/:id/timeline",
    run(async (req, res) =>
      res.json(await service.timeline(req.appToken, req.params.id, req.query)),
    ),
  );
  router.post(
    "/conversations/:id/turns",
    run(async (req, res) =>
      res
        .status(202)
        .json(await service.turn(req.appToken, req.params.id, req.body)),
    ),
  );
  router.post(
    "/conversations/:id/handoff",
    run(async (req, res) =>
      res
        .status(202)
        .json(
          await service.handoff(
            req.appToken,
            req.params.id,
            req.body,
            req.get("Idempotency-Key"),
          ),
        ),
    ),
  );
  router.get(
    "/operations/:id",
    run(async (req, res) =>
      res.json(await service.operation(req.appToken, req.params.id)),
    ),
  );
  router.post(
    "/operations/:id/retry",
    run(async (req, res) => {
      if (req.body && Object.keys(req.body).length)
        throw new AppProblem(400, "invalid_payload");
      res.json(await service.retry(req.appToken, req.params.id));
    }),
  );
  router.use((req, res) =>
    problem(res, new AppProblem(404, "not_found"), req.correlationId),
  );
  router.use((error, req, res, _next) =>
    problem(
      res,
      error.type === "entity.too.large"
        ? new AppProblem(413, "payload_too_large")
        : error instanceof SyntaxError
          ? new AppProblem(400, "invalid_payload")
          : error,
      req.correlationId,
    ),
  );
  return router;
}
