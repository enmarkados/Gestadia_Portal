import { Router } from 'express';
import { createLead } from '../services/zoho.js';

export const leadsRouter = Router();

leadsRouter.post('/api/leads', async (req, res) => {
  const { nombre, telefono, email, tramite } = req.body;

  if (!nombre || !telefono || !email || !tramite) {
    return res.status(400).json({ ok: false, error: 'Faltan campos requeridos' });
  }

  const clientIp =
    req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '';

  try {
    const leadId = await createLead({ nombre, telefono, email, tramite }, clientIp);
    res.json({ ok: true, id: leadId });
  } catch (err) {
    console.error('[leads]', err.message);
    res.status(500).json({ ok: false, error: 'Error al registrar la solicitud' });
  }
});
