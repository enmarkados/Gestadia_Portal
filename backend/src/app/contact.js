import { createHash } from "node:crypto";
import { scopeKey, currentAccess } from "./store.js";
import { AppProblem } from "./problem.js";
import { callbackPhone } from "../services/zoho-callbacks.js";
const hash = value => createHash("sha256").update(value).digest("hex");
export function createAppContactService({ db, config, crm, conversations, now = () => new Date() }) {
  async function context(user) {
    if (!user?.zohoContactId) return { kind: "call" };
    const cases = await db.expediente.findMany({ where: { userId: user.id, zohoDealId: { not: null } }, orderBy: { createdAt: "desc" }, take: 20 });
    for (const expediente of cases) {
      const manager = await crm.assignedManager(user.zohoContactId, expediente.zohoDealId);
      if (!manager) continue;
      const access = await currentAccess(db, { purpose: "atencion", caseId: expediente.id, scopeKey: scopeKey("atencion", expediente.id) }, user, config);
      const mapping = config.managerRoutes?.find(r => r.assignmentRef === access.manager_assignment_ref && r.zohoOwnerId === manager.ownerId);
      if (config.enabled && mapping && ["history", "manager_handoff", "case_context"].every(p => access.permissions.includes(p))) return { kind: "manager", manager_name: manager.name, case_ref: expediente.id };
      return { kind: "call", manager_name: manager.name };
    }
    return { kind: "call" };
  }
  return {
    context,
    async open(user, token, key) {
      if (!/^[A-Za-z0-9._:-]{16,128}$/.test(key || "")) throw new AppProblem(400, "invalid_payload");
      if (!user || !token) throw new AppProblem(401, "session_expired");
      const target = await context(user);
      if (target.kind !== "manager") throw new AppProblem(409, "identity_link_required");
      const started = await conversations.start(token, { purpose: "atencion", case_ref: target.case_ref }, key);
      if (!started.conversation.ready) return { ...started, pending: true };
      await db.appConversation.updateMany({ where: { id: started.conversation.id, userId: user.id, purpose: "atencion" }, data: { managerName: target.manager_name } });
      const operation = await conversations.handoff(token, started.conversation.id, { target_kind: "manager", reason: "El cliente solicita hablar con su gestor desde la APP" }, `manager:${key}`);
      if (operation.status === "failed") throw new AppProblem(operation.http_status || 409, operation.error_code || "routing_unavailable");
      return { ...started, manager_name: target.manager_name, operation, pending: operation.status !== "admitted" };
    },
    async callback(scope, input, key, user = null) {
      if (!crm.available()) throw new AppProblem(503, "runtime_unavailable");
      if (!input || Object.keys(input).some(k => !["nombre", "telefono"].includes(k)) || typeof input.nombre !== "string" || input.nombre.trim().length < 2 || input.nombre.length > 120 || /[\p{Cc}]/u.test(input.nombre) || !/^[A-Za-z0-9:_-]{8,128}$/.test(key || "")) throw new AppProblem(400, "invalid_payload");
      const payload = { nombre: input.nombre.trim(), telefono: callbackPhone(input.telefono) }, payloadHash = hash(JSON.stringify(payload)), actorScope = hash(scope);
      let row;
      try { row = await db.appCallbackRequest.create({ data: { actorScope, idempotencyKey: key, payloadHash, payload } }); }
      catch (error) {
        if (error.code !== "P2002") throw error;
        row = await db.appCallbackRequest.findUnique({ where: { actorScope_idempotencyKey: { actorScope, idempotencyKey: key } } });
      }
      if (!row || row.payloadHash !== payloadHash) throw new AppProblem(409, "idempotency_conflict");
      const locked = await db.appCallbackRequest.updateMany({ where: { id: row.id, status: "prepared" }, data: { status: "dispatching" } });
      if (locked.count) {
        try {
          const contactId = row.contactId || (user?.zohoContactId ? await crm.verifiedContact(user.zohoContactId) : null);
          const leadId = contactId ? null : row.leadId || await crm.findOrCreateLead(payload);
          row = await db.appCallbackRequest.update({ where: { id: row.id }, data: { leadId, contactId } });
          const taskId = await crm.createTask(row);
          row = await db.appCallbackRequest.update({ where: { id: row.id }, data: { status: "confirmed", taskId } });
        } catch {
          // No repetir una creación de lead o tarea cuyo resultado remoto se desconoce.
          row = await db.appCallbackRequest.update({ where: { id: row.id }, data: { status: "pending_review" } });
        }
      } else row = await db.appCallbackRequest.findUnique({ where: { id: row.id } });
      return { status: row.status === "confirmed" ? "confirmed" : "pending_confirmation" };
    },
  };
}
