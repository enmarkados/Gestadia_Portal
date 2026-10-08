import jwt from 'jsonwebtoken';
import { mobileSessions } from '../services/auth-sessions.js';
import { config } from '../config.js';
import { db } from '../db.js';

export function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, config.jwtSecret, { expiresIn: '30d' });
}

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No autenticado' });
  try {
    const payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    const user = await db.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.accessRevokedAt) return res.status(401).json({ error: 'Sesión no válida' });
    if (payload.jti) {
      req.authSession = await mobileSessions.verify(payload);
      if (!req.authSession) return res.status(401).json({ error: 'Sesión no válida' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Sesión caducada, vuelve a entrar' });
  }
}
