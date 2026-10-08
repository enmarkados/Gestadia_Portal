import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { once } from "node:events";
import { createAppRouter } from "./routes.js";
async function serve(t, config = { enabled: false }, services = {}) {
  const app = express();
  app.use("/api/app/v1", createAppRouter({ config, ...services }));
  const s = app.listen(0, "127.0.0.1");
  await once(s, "listening");
  t.after(() => s.close());
  return `http://127.0.0.1:${s.address().port}/api/app/v1`;
}
test("gate deshabilitado y autenticación APP nunca aceptan JWT de Portal como identidad", async (t) => {
  const base = await serve(t);
  const r = await fetch(`${base}/conversations`, {
    headers: { Authorization: "Bearer legacy" },
  });
  assert.equal(r.status, 503);
  assert.match(r.headers.get("content-type"), /application\/problem\+json/);
  assert.equal((await r.json()).code, "runtime_unavailable");
});
test("router limita bytes y exige autenticación antes del proxy", async (t) => {
  const service = {
    start: async (_token, body) => {
      if (Object.keys(body).some((k) => !["purpose", "case_ref"].includes(k)))
        throw Object.assign(new Error(), { status: 400 });
      return {};
    },
  };
  const base = await serve(
    t,
    { enabled: true },
    { service, identity: { authenticate: async () => ({}) } },
  );
  const r = await fetch(`${base}/conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer x",
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify({ purpose: "sondeo", text: "x".repeat(33000) }),
  });
  assert.equal(r.status, 413);
  const missing = await fetch(`${base}/conversations`);
  assert.equal(missing.status, 401);
});
