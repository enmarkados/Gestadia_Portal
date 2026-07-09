import jwt from 'jsonwebtoken';
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
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await db.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: 'Sesión no válida' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Sesión caducada, vuelve a entrar' });
  }
}
