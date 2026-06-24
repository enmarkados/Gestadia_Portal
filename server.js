require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ── Zoho token cache ────────────────────────────────────────────────────────

let _token = null;
let _tokenExpiresAt = 0;

async function getAccessToken() {
  if (_token && Date.now() < _tokenExpiresAt - 60_000) return _token;

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
    refresh_token: process.env.ZOHO_REFRESH_TOKEN,
  });

  const res = await fetch(`https://accounts.zoho.eu/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const data = await res.json();
  if (!data.access_token) throw new Error(`Zoho token error: ${JSON.stringify(data)}`);

  _token = data.access_token;
  _tokenExpiresAt = Date.now() + data.expires_in * 1000;
  return _token;
}

// ── Lead creation ───────────────────────────────────────────────────────────

async function createZohoLead(leadData, clientIp) {
  const token = await getAccessToken();

  const nameParts = leadData.nombre.trim().split(/\s+/);
  const lastName = nameParts.length > 1 ? nameParts.at(-1) : nameParts[0];
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : '';

  const record = {
    Last_Name: lastName,
    ...(firstName && { First_Name: firstName }),
    Phone: leadData.telefono,
    Email: leadData.email,
    Lead_Source: process.env.ZOHO_LEAD_SOURCE_DEFAULT,
    Lead_Status: process.env.ZOHO_LEAD_STATUS_DEFAULT,
    Pagina_Procedencia: process.env.ZOHO_PAGE_SOURCE_DEFAULT,
    LOPD: true,
    IP: clientIp || '',
    Description: `Trámite de interés: ${leadData.tramite}`,
  };

  if (process.env.ZOHO_CAMPAIGN_ID) {
    record.Zoho_Campaign = { id: process.env.ZOHO_CAMPAIGN_ID };
  }

  const baseUrl = `https://www.${process.env.ZOHO_DOMAIN}/crm/${process.env.ZOHO_API_VERSION}/Leads`;
  const url = process.env.ZOHO_ASSIGNMENT_RULE_ID
    ? `${baseUrl}?lar_id=${process.env.ZOHO_ASSIGNMENT_RULE_ID}`
    : baseUrl;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: [record] }),
  });

  const result = await res.json();

  // Zoho returns status per-record inside data[0]
  const status = result?.data?.[0]?.status;
  if (status !== 'success') throw new Error(`Zoho lead error: ${JSON.stringify(result)}`);

  return result.data[0].details?.id;
}

// ── API endpoint ────────────────────────────────────────────────────────────

app.post('/api/leads', async (req, res) => {
  const { nombre, telefono, email, tramite } = req.body;

  if (!nombre || !telefono || !email || !tramite) {
    return res.status(400).json({ ok: false, error: 'Faltan campos requeridos' });
  }

  const clientIp =
    req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '';

  try {
    const leadId = await createZohoLead({ nombre, telefono, email, tramite }, clientIp);
    res.json({ ok: true, id: leadId });
  } catch (err) {
    console.error('[leads]', err.message);
    res.status(500).json({ ok: false, error: 'Error al registrar la solicitud' });
  }
});

// ── Start ───────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Gestadia server → http://localhost:${PORT}`);
});
