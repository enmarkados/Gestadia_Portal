import { config } from '../config.js';

let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry - 60_000) return cachedToken;
  const url = `${config.zoho.accountsUrl}/oauth/v2/token` +
    `?refresh_token=${encodeURIComponent(config.zoho.refreshToken)}` +
    `&client_id=${encodeURIComponent(config.zoho.clientId)}` +
    `&client_secret=${encodeURIComponent(config.zoho.clientSecret)}` +
    `&grant_type=refresh_token`;
  const res = await fetch(url, { method: 'POST' });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Zoho OAuth error: ${JSON.stringify(data)}`);
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in ?? 3600) * 1000;
  return cachedToken;
}

async function zohoFetch(path, options = {}) {
  const token = await getAccessToken();
  const res = await fetch(`${config.zoho.apiUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (res.ok === false) throw new Error(`Zoho ${path} ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

// ---------- Leads (formularios informativos "Solicitar información") ----------

function normalizePhone(raw) {
  const cleaned = String(raw).trim().replace(/\s+/g, '');
  return cleaned.startsWith('+') ? cleaned : '+34' + cleaned;
}

const SERVICIO_MAP = {
  'Canje de Carnet Extranjero':        'Canje',
  'Duplicado de Carnet de Conducir':   'Duplicado Carnet De Conducir',
  'Duplicado por Cambio de Datos':     'Duplicado Carnet De Conducir',
  'Permiso Internacional de Conducir': 'Otras gestiones',
  'Transferencia de Vehículo':         'Transferencia de VEhículos',
  'Baja de Vehículo':                  'Transferencia de VEhículos',
  'Cancelación de Reserva de Dominio': 'Otras gestiones',
  'Duplicado Permiso de Circulación':  'Otras gestiones',
};

export async function createLead(leadData, clientIp) {
  const nameParts = leadData.nombre.trim().split(/\s+/);
  const lastName = nameParts.length > 1 ? nameParts.at(-1) : nameParts[0];
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : '';

  const phone = normalizePhone(leadData.telefono);
  const servicio = SERVICIO_MAP[leadData.tramite] || 'Otras gestiones';

  const record = {
    Last_Name: lastName,
    ...(firstName && { First_Name: firstName }),
    Phone: phone,
    Mobile: phone,
    Email: leadData.email,
    Lead_Source: config.zoho.leadSourceDefault,
    Lead_Status: config.zoho.leadStatusDefault,
    Pagina_Procedencia: config.zoho.pageSourceDefault,
    Campa_a: servicio,
    LOPD: true,
    Description: `Trámite de interés: ${leadData.tramite}`,
  };

  const baseUrl = `/crm/${config.zoho.apiVersion}/Leads`;
  const url = config.zoho.assignmentRuleId ? `${baseUrl}?lar_id=${config.zoho.assignmentRuleId}` : baseUrl;

  const result = await zohoFetch(url, { method: 'POST', body: JSON.stringify({ data: [record] }) });
  const status = result?.data?.[0]?.status;
  if (status !== 'success') throw new Error(`Zoho lead error: ${JSON.stringify(result)}`);
  return result.data[0].details?.id;
}

// ---------- Contacts / Deals / Notes (checkout + portal) ----------

export async function upsertContact(user) {
  if (!config.zoho.enabled) {
    console.log('[zoho:demo] upsertContact', user.email);
    return null;
  }
  const movil = user.telefono ? normalizePhone(user.telefono) : '';
  const criteria = movil ? `(Mobile:equals:${movil})` : `(Email:equals:${user.email})`;
  const search = await zohoFetch(
    `/crm/v6/Contacts/search?criteria=${encodeURIComponent(criteria)}`
  ).catch(() => null);
  const existing = search?.data?.[0];

  const deseado = {
    First_Name: user.nombre,
    Last_Name: user.apellidos || user.nombre,
    Email: user.email,
    Mobile: movil || undefined,
    N_de_documento: user.numDocumento || undefined,
    Tipo_de_documento: user.tipoDocumento || undefined,
    Lead_Source: 'Formulario web Gestadia',
  };

  if (existing) {
    // merge de huecos: solo escribimos los campos que estén vacíos en Zoho
    const parche = {};
    for (const [k, v] of Object.entries(deseado)) {
      if (v === undefined) continue;
      const actual = existing[k];
      if (actual === undefined || actual === null || actual === '') parche[k] = v;
    }
    if (Object.keys(parche).length) {
      await zohoFetch('/crm/v6/Contacts', { method: 'PUT', body: JSON.stringify({ data: [{ id: existing.id, ...parche }] }) });
    }
    return existing.id;
  }
  const created = await zohoFetch('/crm/v6/Contacts', { method: 'POST', body: JSON.stringify({ data: [deseado], trigger: ['workflow'] }) });
  return created?.data?.[0]?.details?.id ?? null;
}

export async function createDealForExpediente(expediente, user, servicio, contactId) {
  if (!config.zoho.enabled) {
    console.log('[zoho:demo] createDeal', expediente.nPedido, servicio.zoho.servicio);
    return null;
  }
  const hoy = new Date();
  const fin = new Date(hoy.getTime() + 14 * 24 * 3600 * 1000);
  const d = (x) => x.toISOString().slice(0, 10);

  const deal = {
    Deal_Name: `${servicio.nombre} — ${user.nombre} ${user.apellidos}`.slice(0, 120),
    Amount: expediente.importe,
    Pipeline: servicio.zoho.pipeline,
    // Sin `Stage`: Zoho usa la etapa por defecto del pipeline (las etapas son propias de cada pipeline).
    Contact_Name: contactId ? { id: contactId } : undefined,
    Servicio: servicio.zoho.servicio,
    ...(servicio.zoho.faseField ? { [servicio.zoho.faseField]: Object.keys(servicio.zoho.fases)[0] } : {}),
    Pago_Confirmado: true,
    Fecha_de_pago: d(hoy),
    M_todos_de_pago: expediente.pagoMetodo === 'bizum' ? 'Bizum' : 'Stripe',
    Ref_pago: expediente.pagoRef || undefined,
    N_Pedido: expediente.nPedido,
    Fecha_M_xima_para_Desistimiento: d(fin),
    Lead_Source: 'Formulario web Gestadia',
    Closing_Date: d(fin),
    Description: `Contratado online desde el portal. Pedido ${expediente.nPedido}.`,
  };

  const created = await zohoFetch('/crm/v6/Deals', { method: 'POST', body: JSON.stringify({ data: [deal], trigger: ['workflow', 'blueprint'] }) });
  return created?.data?.[0]?.details?.id ?? null;
}

export async function addDealNote(dealId, titulo, contenido) {
  if (!config.zoho.enabled || !dealId) {
    console.log('[zoho:demo] nota en deal', dealId, titulo);
    return;
  }
  await zohoFetch('/crm/v6/Notes', {
    method: 'POST',
    body: JSON.stringify({ data: [{ Note_Title: titulo, Note_Content: contenido, Parent_Id: { module: { api_name: 'Deals' }, id: dealId } }] }),
  }).catch((e) => console.error('Zoho note error:', e.message));
}
