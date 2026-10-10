import { test } from "node:test";
import assert from "node:assert/strict";
import { requireLocalFixture, evaluatePreflight } from "./app-local-preflight.mjs";
const now = new Date("2026-10-07T12:00:00Z");
function fixture() { return {
  user: { accountStatus: "active", emailVerified: true, accountVerifiedAt: "2026-10-06T00:00:00Z", accountVerificationMethod: "invitation" },
  grants: [{ purpose: "sondeo", scopeKey: "sondeo", validatedAt: "2026-10-06T00:00:00Z", validUntil: "2026-10-08T08:00:00Z", permissions: ["history", "sondeo"] }],
  conversations: [{ purpose: "sondeo", scopeKey: "sondeo", remoteId: "fixture", status: "active", contextRevision: "2", syncedRevision: "2" }],
  ownedCaseIds: [], activeSessionCount: 1, pendingLifecycleCount: 0,
  portalRuntime: { ready: true }, lidia: { fixture_only: true, lidia_runtime_ready: true, effective_configuration_verified: true, database_verified: true, validity: { route: { valid_until: "2026-10-08T00:00:00Z" } } },
}; }
function rejected(change, name) { const data = fixture(); change(data); const report = evaluatePreflight(data, now); assert.equal(report.ready, false); assert.equal(report.checks.find(c => c.name === name).ok, false); }
test("shortest deadline includes LidIA route rather than just Portal grants", () => { const report = evaluatePreflight(fixture(), now); assert.equal(report.ready, true); assert.equal(report.ready_until, "2026-10-08T00:00:00.000Z"); assert.equal(report.permissions_renewed, false); });
test("expired and future authority are rejected", () => { rejected(d => d.grants[0].validUntil = now.toISOString(), "authority_valid"); rejected(d => d.grants[0].validatedAt = "2026-10-08T00:00:00Z", "authority_valid"); });
test("unknown effective LidIA checks cannot inherit a green health check", () => { rejected(d => delete d.lidia.effective_configuration_verified, "lidia_effective_runtime_verified"); rejected(d => delete d.lidia.database_verified, "lidia_effective_runtime_verified"); });
test("expired source route is rejected", () => rejected(d => d.lidia.validity.route.valid_until = now.toISOString(), "lidia_horizon_present_and_valid"));
test("unsynced contexts and pending outbox are rejected", () => { rejected(d => d.conversations[0].syncedRevision = "1", "conversations_present_and_synced"); rejected(d => d.pendingLifecycleCount = 1, "lifecycle_outbox_drained"); });
test("disabled or unverified account is rejected", () => { rejected(d => d.user.accountStatus = "disabled", "account_active_verified"); rejected(d => d.user.accountVerifiedAt = null, "account_active_verified"); });
test("foreign case grant is rejected", () => rejected(d => d.grants[0].caseId = "foreign", "case_ownership"));
test("missing session and source horizon are rejected", () => { rejected(d => d.activeSessionCount = 0, "device_session_available"); rejected(d => d.lidia.validity = {}, "lidia_horizon_present_and_valid"); });
test("fixture database guard rejects remote database and wrong namespace", () => {
 const base = { databaseUrl: "mysql://fixture:fixture@127.0.0.1:62581/gestadia_app_test", accounts: [{id:"fixture"}], backendPid: 42 };
 assert.equal(requireLocalFixture(base), "fixture");
 assert.throws(() => requireLocalFixture({...base,databaseUrl:"mysql://fixture:fixture@example.test/gestadia_app_test"}), /local_fixture_database_required/);
 assert.throws(() => requireLocalFixture({...base,databaseUrl:"mysql://fixture:fixture@127.0.0.1:62581/production"}), /local_fixture_database_required/);
});
test("report excludes private account and key data", () => { const data = fixture(); data.user.email = "never-in-report@example.test"; data.user.passwordHash = "private-hash"; data.lidia.secret = "private-key"; const report = JSON.stringify(evaluatePreflight(data, now)); for (const text of [data.user.email,data.user.passwordHash,data.lidia.secret]) assert.equal(report.includes(text), false); });

test("handoff authority without its mapping and scope mismatch are rejected", () => { rejected(d => d.grants[0].permissions.push("manager_handoff"), "authority_mapping_valid"); rejected(d => d.conversations[0].purpose = "atencion", "conversations_have_authority"); });

test("incomplete source cannot advertise Portal-only deadline as integrated horizon", () => { const data = fixture(); delete data.lidia.effective_configuration_verified; const report = evaluatePreflight(data, now); assert.equal(report.ready_until, null); assert.equal(report.portal_authority_valid_until, "2026-10-08T08:00:00.000Z"); });

test("an unresolved outbox cannot advertise usable validity", () => { const data = fixture(); data.pendingLifecycleCount = 1; const report = evaluatePreflight(data, now); assert.equal(report.ready_until, null); assert.equal(report.observed_horizon_until, "2026-10-08T00:00:00.000Z"); });
