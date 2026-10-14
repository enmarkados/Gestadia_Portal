import { canonicalJson } from "./s2s.js";
import { AppProblem } from "./problem.js";

// This is the Portal baseline, never a snapshot of agent-confirmed data.
export function profileContext(conversation, user, enabled) {
  if (!enabled) return { wire: {}, data: {} };
  const baseline = {};
  const name = [user.nombre, user.apellidos].filter(Boolean).join(" ").trim();
  if (name && name.isWellFormed() && Array.from(name).length <= 160 && !/[\p{Cc}]/u.test(name)) baseline.display_name = name;
  if (typeof user.email === "string" && user.email.length <= 254) baseline.email = user.email;
  // No inferred country, timezone, ownership, or callback consent.
  if (typeof user.telefono === "string" && /^\+[1-9]\d{6,14}$/.test(user.telefono.trim())) baseline.callback_phone = user.telefono.trim();
  const previous = conversation.profileBaseline || {}, patch = {};
  for (const key of new Set([...Object.keys(previous), ...Object.keys(baseline)])) {
    if (baseline[key] !== previous[key]) patch[key] = baseline[key] ?? null;
  }
  let revision = conversation.profileRevision || "0", lastPatch = conversation.profilePatch || {};
  const changed = Object.keys(patch).length > 0;
  if (changed) {
    revision = String(BigInt(revision) + 1n);
    if (revision.length > 20) throw new AppProblem(409, "profile_conflict");
    lastPatch = patch;
  }
  if (revision === "0") return { wire: {}, data: {} };
  return {
    wire: { profile_revision: revision, profile: lastPatch },
    data: changed ? { profileBaseline: baseline, profilePatch: lastPatch, profileRevision: revision } : {},
  };
}

export function sameProfilePatch(left, right) {
  return !!left?.profile_revision && left.profile_revision === right?.profile_revision && canonicalJson(left.profile) === canonicalJson(right.profile);
}
