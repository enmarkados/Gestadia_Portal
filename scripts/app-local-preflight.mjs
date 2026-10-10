#!/usr/bin/env node
// Read-only diagnostic for the disposable local fixture. Never starts services or renews authority.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

function requireCondition(value, code) {
  if (!value) throw Object.assign(new Error(code), { safeCode: code });
}
export function requireLocalFixture(manifest) {
  let url;
  try { url = new URL(manifest.databaseUrl); } catch { requireCondition(false, "invalid_fixture_database"); }
  requireCondition(url.protocol === "mysql:" && url.hostname === "127.0.0.1" && url.pathname === "/gestadia_app_test", "local_fixture_database_required");
  requireCondition(manifest.accounts?.[0]?.id && Number.isInteger(manifest.backendPid) && manifest.backendPid > 1, "incomplete_fixture_manifest");
  return manifest.accounts[0].id;
}
function timestamp(value) { return typeof value === "string" || value instanceof Date ? new Date(value).getTime() : NaN; }
function iso(value) { const t = timestamp(value); return Number.isFinite(t) ? new Date(t).toISOString() : null; }

export function evaluatePreflight(snapshot, now = new Date(), minimum = 900) {
  const checks = [];
  const check = (name, ok) => checks.push({ name, ok: Boolean(ok) });
  const user = snapshot.user;
  check("account_active_verified", user?.accountStatus === "active" && user.emailVerified === true && Boolean(user.accountVerifiedAt) && Boolean(user.accountVerificationMethod));
  const grants = snapshot.grants || [];
  check("authority_present", grants.length > 0);
  const grantReport = grants.map(g => ({
    purpose: g.purpose, case_scoped: Boolean(g.caseId), valid_until: iso(g.validUntil),
    remaining_seconds: Math.floor((timestamp(g.validUntil) - now.getTime()) / 1000),
    permissions_count: Array.isArray(g.permissions) ? g.permissions.length : 0,
    mapping_present: Boolean(g.managerAssignmentRef || g.commercialAssignmentRef),
  }));
  check("authority_valid", grants.length > 0 && grants.every(g => timestamp(g.validatedAt) <= now.getTime() && timestamp(g.validUntil) - now.getTime() >= minimum * 1000 && Array.isArray(g.permissions) && g.permissions.includes("history")));
  check("authority_mapping_valid", grants.every(g => (!g.permissions?.includes("commercial_handoff") || Boolean(g.commercialAssignmentRef)) && (!g.permissions?.includes("manager_handoff") || Boolean(g.managerAssignmentRef))));
  check("case_ownership", grants.every(g => !g.caseId || snapshot.ownedCaseIds?.includes(g.caseId)));
  const conversations = (snapshot.conversations || []).map(c => ({
    purpose: c.purpose, case_scoped: Boolean(c.caseId), status: c.status,
    context_revision: c.contextRevision, synced_revision: c.syncedRevision,
    synchronized: Boolean(c.remoteId) && c.contextRevision === c.syncedRevision,
  }));
  check("conversations_present_and_synced", conversations.length > 0 && conversations.every(c => c.synchronized));
  check("conversations_have_authority", (snapshot.conversations || []).every(c => grants.some(g => g.scopeKey === c.scopeKey && g.purpose === c.purpose && (g.caseId || null) === (c.caseId || null))));
  check("device_session_available", snapshot.activeSessionCount > 0);
  check("lifecycle_outbox_drained", snapshot.pendingLifecycleCount === 0);
  check("portal_runtime_isolated", snapshot.portalRuntime?.ready === true);
  const source = snapshot.lidia || {};
  check("lidia_effective_runtime_verified", source.fixture_only === true && source.lidia_runtime_ready === true && source.effective_configuration_verified === true && source.database_verified === true);
  const validity = Object.values(source.validity || {});
  check("lidia_horizon_present_and_valid", validity.length > 0 && validity.every(v => timestamp(v.valid_until) - now.getTime() >= minimum * 1000));
  const deadlines = [...grantReport.map(g => timestamp(g.valid_until)), ...validity.map(v => timestamp(v.valid_until))];
  const sourceVerified = source.fixture_only === true && source.lidia_runtime_ready === true && source.effective_configuration_verified === true && source.database_verified === true && validity.length > 0;
  const horizon = sourceVerified && deadlines.length > 0 && deadlines.every(Number.isFinite) ? Math.min(...deadlines) : NaN;
  const remaining = Math.floor((horizon - now.getTime()) / 1000);
  const ready = checks.every(c => c.ok);
  return {
    fixture_only: true, scope: "primary_fixture_account", checked_at: now.toISOString(), ready,
    ready_until: ready && Number.isFinite(horizon) ? new Date(horizon).toISOString() : null,
    observed_horizon_until: Number.isFinite(horizon) ? new Date(horizon).toISOString() : null,
    portal_authority_valid_until: grantReport.length > 0 && grantReport.every(g => Number.isFinite(timestamp(g.valid_until))) ? new Date(Math.min(...grantReport.map(g => timestamp(g.valid_until)))).toISOString() : null,
    remaining_seconds: Number.isFinite(remaining) ? remaining : null,
    minimum_validity_seconds: minimum, permissions_renewed: false,
    warnings: remaining < 7200 ? ["local_authority_expires_in_less_than_two_hours"] : [],
    checks, account: { active: user?.accountStatus === "active", verified: Boolean(user?.accountVerifiedAt && user?.accountVerificationMethod && user?.emailVerified) },
    grants: grantReport, conversations, active_device_sessions: snapshot.activeSessionCount,
    lifecycle_outbox: { pending: snapshot.pendingLifecycleCount, latest: snapshot.latestLifecycle },
    portal_runtime: snapshot.portalRuntime, lidia_runtime_ready: source.lidia_runtime_ready === true,
    lidia_validity: Object.fromEntries(Object.entries(source.validity || {}).map(([label, v]) => [label, { valid_until: iso(v.valid_until), remaining_seconds: Math.floor((timestamp(v.valid_until) - now.getTime()) / 1000) }])),
  };
}

function readJson(file) {
  requireCondition(fs.statSync(file).size < 1024 * 1024, "fixture_file_too_large");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
async function health(url) {
  const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(5000) });
  requireCondition(response.status === 200, "portal_health_unavailable");
  return response.json();
}
function readPortalRuntime(manifest, directory, currentHealth) {
  const process = spawnSync("ps", ["-p", String(manifest.backendPid), "-o", "command="], { encoding: "utf8", timeout: 5000 });
  const script = path.join(directory, "backend.mjs");
  let live = false;
  if (process.status === 0) {
    const args = process.stdout.trim().split(/\s+/);
    try { live = args.length === 2 && path.basename(args[0]) === "node" && fs.realpathSync(args[1]) === fs.realpathSync(script); } catch { /* Missing/replaced process does not prove ownership. */ }
  }
  const records = fs.readFileSync(path.join(directory, "backend.log"), "utf8").split("\n").flatMap(line => {
    try { const value = JSON.parse(line); return value.url === "http://127.0.0.1:3001" && value.integrations ? [value.integrations] : []; } catch { return []; }
  });
  const boot = records.at(-1) || {};
  const flags = { app: boot.app === true, stripe: currentHealth.stripe === "MODO DEMO (pago simulado)", zoho: currentHealth.zoho === "desactivado (solo log)", smtp: currentHealth.email === "consola", legacy_lidia: boot.legacyLidia === false };
  return {
    ready: live && currentHealth.ok === true && flags.app && flags.stripe && flags.zoho && flags.smtp && flags.legacy_lidia && boot.stripe === false && boot.zoho === false && boot.smtp === false,
    owned_backend_running: live, app_enabled_at_startup: flags.app,
    stripe_disabled: flags.stripe, zoho_disabled: flags.zoho, smtp_disabled: flags.smtp,
    legacy_lidia_disabled_at_startup: flags.legacy_lidia,
    evidence: "live_health_for_stripe_zoho_smtp_and_owned_backend_startup_log_for_app_legacy",
  };
}
export async function main(args = process.argv.slice(2)) {
  let db;
  try {
    requireCondition(args.length === 6 && args[0] === "--manifest" && args[2] === "--lidia-checker" && args[4] === "--lidia-fixture", "usage_manifest_lidia_checker_lidia_fixture_required");
    const manifestFile = path.resolve(args[1]);
    const manifest = readJson(manifestFile); const userId = requireLocalFixture(manifest);
    const checker = path.resolve(args[3]);
    requireCondition(path.basename(checker) === "app-local-runtime.py", "unexpected_lidia_checker");
    const environment = Object.fromEntries(["PATH", "HOME", "TMPDIR", "LANG", "SHELL"].filter(k => process.env[k]).map(k => [k, process.env[k]]));
    const source = spawnSync("python3", [checker, "check", "--fixture", path.resolve(args[5])], { encoding: "utf8", timeout: 45000, maxBuffer: 1024 * 1024, env: environment });
    requireCondition(!source.error, "lidia_check_unavailable");
    let lidia; try { lidia = JSON.parse(source.stdout.trim()); } catch { requireCondition(false, "invalid_lidia_check_report"); }
    if (source.status !== 0) lidia.lidia_runtime_ready = false;
    const portalRuntime = readPortalRuntime(manifest, path.dirname(manifestFile), await health("http://127.0.0.1:3001/api/health"));
    const require = createRequire(new URL("../backend/package.json", import.meta.url));
    const { PrismaClient } = require("@prisma/client");
    db = new PrismaClient({ datasources: { db: { url: manifest.databaseUrl } } });
    const now = new Date();
    const [user, grants, conversations, ownedCases, activeSessionCount, pendingLifecycleCount, latestLifecycle] = await db.$transaction([
      db.user.findUnique({ where: { id: userId }, select: { accountStatus: true, emailVerified: true, accountVerifiedAt: true, accountVerificationMethod: true } }),
      db.appConversationAccess.findMany({ where: { userId }, select: { purpose: true, caseId: true, scopeKey: true, validatedAt: true, validUntil: true, permissions: true, managerAssignmentRef: true, commercialAssignmentRef: true } }),
      db.appConversation.findMany({ where: { userId }, select: { purpose: true, caseId: true, scopeKey: true, remoteId: true, status: true, contextRevision: true, syncedRevision: true } }),
      db.expediente.findMany({ where: { userId }, select: { id: true } }),
      db.appDeviceSession.count({ where: { userId, revokedAt: null, expiresAt: { gt: now } } }),
      db.appOperation.count({ where: { userId, kind: { in: ["context", "revocation"] }, status: { in: ["prepared", "outcome_unknown"] } } }),
      db.appOperation.findFirst({ where: { userId, kind: { in: ["context", "revocation"] } }, orderBy: { updatedAt: "desc" }, select: { kind: true, status: true, errorCode: true, updatedAt: true } }),
    ], { isolationLevel: "RepeatableRead" });
    const report = evaluatePreflight({ user, grants, conversations, ownedCaseIds: ownedCases.map(c => c.id), activeSessionCount, pendingLifecycleCount, latestLifecycle, portalRuntime, lidia }, new Date());
    console.log(JSON.stringify(report, null, 2)); return report.ready ? 0 : 1;
  } catch (error) {
    console.log(JSON.stringify({ fixture_only: true, ready: false, permissions_renewed: false, code: error.safeCode || "local_preflight_unavailable" })); return 1;
  } finally { if (db) await db.$disconnect(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) process.exitCode = await main();
