import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { config } from '../config.js';
import { signToken } from '../middleware/auth.js';
import { sendEmail } from '../services/notify.js';

export const authRouter = Router();

authRouter.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = await db.user.findUnique({ where: { email: String(email || '').trim().toLowerCase() } });
  if (!user?.passwordHash || !(await bcrypt.compare(password || '', user.passwordHash))) {
    return res.status(401).json({ error: 'Email o contraseña incorrectos' });
  }
  res.json({ token: signToken(user), nombre: user.nombre });
});

// Establecer contraseña con token de invitación (post-checkout) o de recuperación
authRouter.post('/api/auth/set-password', async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password || password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }
  let user = await db.user.findUnique({ where: { inviteToken: token } });
  let viaReset = false;
  if (!user) {
    user = await db.user.findUnique({ where: { resetToken: token } });
    viaReset = true;
    if (!user || (user.resetTokenExp && user.resetTokenExp < new Date())) {
      return res.status(400).json({ error: 'El enlace no es válido o ha caducado' });
    }
  }
  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await bcrypt.hash(password, 12),
      emailVerified: true,
      ...(viaReset ? { resetToken: null, resetTokenExp: null } : { inviteToken: null }),
    },
  });
  res.json({ token: signToken(updated), nombre: updated.nombre });
});

authRouter.post('/api/auth/forgot', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const user = await db.user.findUnique({ where: { email } });
  if (user) {
    const token = crypto.randomBytes(24).toString('hex');
    await db.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExp: new Date(Date.now() + 2 * 3600 * 1000) },
    });
    await sendEmail(email, 'Recupera tu acceso a Gestadia',
      `<p>Hola ${user.nombre},</p>
       <p>Para crear una nueva contraseña, pulsa aquí (caduca en 2 horas):</p>
       <p><a href="${config.baseUrl}/portal.html#crear-clave/${token}">Crear nueva contraseña</a></p>`);
  }
  // Respuesta idéntica exista o no el email (no filtrar cuentas)
  res.json({ ok: true });
});
