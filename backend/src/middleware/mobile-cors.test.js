import test from "node:test";
import assert from "node:assert/strict";
import { mobileCors } from "./mobile-cors.js";
test("CORS móvil sólo con capacidades habilitadas y orígenes nativos exactos", () => {
  function request(origin, enabled) {
    const headers = {};
    let status;
    let next = false;
    mobileCors(enabled)(
      { headers: { origin }, method: "OPTIONS" },
      {
        set: (key, value) => (headers[key] = value),
        status: (v) => {
          status = v;
          return { end() {} };
        },
      },
      () => (next = true),
    );
    return { headers, status, next };
  }
  assert.equal(
    request("capacitor://localhost", true).headers[
      "Access-Control-Allow-Origin"
    ],
    "capacitor://localhost",
  );
  assert.equal(request("https://localhost", true).status, 204);
  assert.equal(request("https://attacker.example", true).status, 403);
  assert.equal(request("capacitor://localhost", false).next, true);
});
