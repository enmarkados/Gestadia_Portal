import { config } from "../config.js";
import { zohoFetch, createLead } from "./zoho.js";
export function callbackPhone(raw) {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!/^[+\d ().-]+$/.test(value)) throw Object.assign(new Error("Teléfono inválido"), { status: 400 });
  const digits = value.replace(/[ ().-]/g, "");
  const normalized = digits.startsWith("+") ? digits : digits.startsWith("00") ? `+${digits.slice(2)}` : `+34${digits}`;
  if (!/^\+[1-9]\d{7,14}$/.test(normalized)) throw Object.assign(new Error("Teléfono inválido"), { status: 400 });
  return normalized;
}
export function createZohoCallbackAdapter({ send = zohoFetch, lead = createLead, enabled = () => config.zoho.enabled, version = config.zoho.apiVersion } = {}) {
  const prefix = `/crm/${version}`;
  return {
    available: enabled,
    async assignedManager(contactId, dealId) {
      if (!enabled() || !/^\d{5,30}$/.test(contactId || "") || !/^\d{5,30}$/.test(dealId || "")) return null;
      const deal = (await send(`${prefix}/Deals/${dealId}`))?.data?.[0];
      if (deal?.Contact_Name?.id !== contactId || !deal?.Owner?.id || !deal?.Owner?.name) return null;
      return { ownerId: deal.Owner.id, name: deal.Owner.name };
    },
    async verifiedContact(contactId) {
      if (!/^\d{5,30}$/.test(contactId || "")) return null;
      const contact = (await send(`${prefix}/Contacts/${contactId}`))?.data?.[0];
      if (contact?.id !== contactId) throw Error("Contacto CRM no verificado");
      return contactId;
    },
    async findOrCreateLead(payload) {
      const result = await send(`${prefix}/Leads/search?${new URLSearchParams({ phone: payload.telefono, converted: "false" })}`);
      const matches = (result?.data || []).filter(row => [row.Phone, row.Mobile].some(phone => { try { return callbackPhone(phone) === payload.telefono; } catch { return false; } }));
      if (matches.length > 1) throw Error("Identidad CRM ambigua");
      if (matches[0]) return matches[0].id;
      return lead({ nombre: payload.nombre, telefono: payload.telefono, tramite: "Consulta desde la APP", email: undefined, lopd: false });
    },
    async createTask(request) {
      const subject = `Llamada solicitada desde la APP · ${request.id}`;
      const module = request.contactId ? "Contacts" : "Leads", recordId = request.contactId || request.leadId;
      const parent = (await send(`${prefix}/${module}/${recordId}`))?.data?.[0];
      if (parent?.id !== recordId || !parent.Owner?.id) throw Error("Asignación CRM no verificada");
      // Replays confirmados se resuelven por el recibo durable; no repetir POST tras timeout.
      // Zoho usa Who_Id para contactos y What_Id + $se_module para leads.
      const record = { Subject: subject, Description: `${request.payload.nombre} solicita que un gestor le llame al ${request.payload.telefono}.`, Owner: { id: parent.Owner.id }, $se_module: module,
        ...(request.contactId ? { Who_Id: { id: recordId } } : { What_Id: { id: recordId } }) };
      const result = await send(`${prefix}/Tasks`, { method: "POST", body: JSON.stringify({ data: [record], trigger: ["workflow"] }) });
      const item = result?.data?.[0];
      if (item?.status !== "success" || !item?.details?.id) throw Error("Tarea CRM no confirmada");
      return item.details.id;
    },
  };
}
