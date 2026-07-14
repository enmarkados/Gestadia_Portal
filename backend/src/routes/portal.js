import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { ESTADOS, checklistExpediente } from '../catalog.js';
import { addDealNote } from '../services/zoho.js';

export const portalRouter = Router();
portalRouter.use('/api/me', requireAuth);
portalRouter.use('/api/expedientes', requireAuth);
portalRouter.use('/api/notificaciones', requireAuth);

const UPLOAD_DIR = path.resolve('uploads');
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.mimetype);
    cb(ok ? null : new Error('Solo se admiten imágenes (JPG, PNG) o PDF'), ok);
  },
});

// ---------- Mis datos ----------
portalRouter.get('/api/me', (req, res) => {
  const { id, email, nombre, apellidos, telefono, tipoDocumento, numDocumento } = req.user;
  res.json({ id, email, nombre, apellidos, telefono, tipoDocumento, numDocumento });
});

portalRouter.patch('/api/me', async (req, res) => {
  const { nombre, apellidos, telefono, tipoDocumento, numDocumento } = req.body || {};
  const user = await db.user.update({
    where: { id: req.user.id },
    data: {
      ...(nombre ? { nombre } : {}), ...(apellidos ? { apellidos } : {}),
      telefono: telefono ?? req.user.telefono,
      tipoDocumento: tipoDocumento ?? req.user.tipoDocumento,
      numDocumento: numDocumento ?? req.user.numDocumento,
    },
  });
  res.json({ ok: true, nombre: user.nombre });
});

// ---------- Mis servicios (expedientes) ----------
portalRouter.get('/api/expedientes', async (req, res) => {
  const expedientes = await db.expediente.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: { documentos: { select: { clave: true } } },
  });
  res.json(expedientes.map((e) => resumen(e)));
});

portalRouter.get('/api/expedientes/:id', async (req, res) => {
  const e = await db.expediente.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: { documentos: true, eventos: { orderBy: { createdAt: 'asc' } } },
  });
  if (!e) return res.status(404).json({ error: 'Expediente no encontrado' });
  const checklist = checklistExpediente(e.servicioSlug, e.paisCanje);
  res.json({
    ...resumen(e),
    eventos: e.eventos,
    documentos: e.documentos.map(({ id, clave, nombre, createdAt }) => ({ id, clave, nombre, createdAt })),
    checklist: checklist.map((c) => ({ ...c, subido: e.documentos.some((d) => d.clave === c.clave) })),
    paisCanje: e.paisCanje || null,
    direccion: e.direccion || null,
    datosPais: e.datosPais || null,
  });
});

// Subida de documentos del checklist
portalRouter.post('/api/expedientes/:id/documentos', upload.single('fichero'), async (req, res) => {
  const e = await db.expediente.findFirst({
    where: { id: req.params.id, userId: req.user.id },
    include: { documentos: true },
  });
  if (!e) return res.status(404).json({ error: 'Expediente no encontrado' });
  if (!req.file) return res.status(400).json({ error: 'No se ha recibido ningún fichero' });

  const clave = String(req.body.clave || 'otro');
  const doc = await db.documento.create({
    data: {
      expedienteId: e.id, clave,
      nombre: req.file.originalname, mime: req.file.mimetype,
      size: req.file.size, path: req.file.filename,
    },
  });

  // Aviso al gestor en Zoho
  await addDealNote(e.zohoDealId, 'Documento subido desde el portal',
    `El cliente ha subido "${req.file.originalname}" (${clave}) al expediente ${e.nPedido}.`);

  // Si el checklist está completo, se registra el hito (el gestor cambia la fase en Zoho)
  const claves = new Set([...e.documentos.map((d) => d.clave), clave]);
  const checklist = checklistExpediente(e.servicioSlug, e.paisCanje);
  const completo = checklist.length > 0 && checklist.every((c) => claves.has(c.clave));
  if (completo && e.estado === 'documentacion_pendiente') {
    await db.eventoExpediente.create({
      data: { expedienteId: e.id, estado: e.estado, nota: 'Documentación completa: pendiente de revisión por tu gestor.' },
    });
    await addDealNote(e.zohoDealId, 'Documentación completa',
      `El cliente ha completado el checklist del expediente ${e.nPedido}. Revisar y avanzar fase.`);
  }
  res.json({ ok: true, documento: { id: doc.id, clave, nombre: doc.nombre } });
});

// Descarga segura de un documento propio
portalRouter.get('/api/expedientes/:id/documentos/:docId', async (req, res) => {
  const doc = await db.documento.findFirst({
    where: { id: req.params.docId, expediente: { id: req.params.id, userId: req.user.id } },
  });
  if (!doc) return res.status(404).json({ error: 'No encontrado' });
  const filePath = path.join(UPLOAD_DIR, doc.path);
  if (!fs.existsSync(filePath)) return res.status(410).json({ error: 'Fichero no disponible' });
  res.download(filePath, doc.nombre);
});

// ---------- Notificaciones ----------
portalRouter.get('/api/notificaciones', async (req, res) => {
  const items = await db.notificacion.findMany({
    where: { userId: req.user.id }, orderBy: { createdAt: 'desc' }, take: 50,
  });
  res.json(items);
});

portalRouter.post('/api/notificaciones/:id/leer', async (req, res) => {
  await db.notificacion.updateMany({
    where: { id: req.params.id, userId: req.user.id }, data: { leida: true },
  });
  res.json({ ok: true });
});

function resumen(e) {
  const idx = ESTADOS.findIndex((s) => s.id === e.estado);
  return {
    id: e.id, nPedido: e.nPedido, titulo: e.titulo, servicioSlug: e.servicioSlug,
    estado: e.estado, faseZoho: e.faseZoho,
    estadoLabel: ESTADOS[idx]?.label || (e.estado === 'incidencia' ? 'Incidencia' : e.estado),
    progreso: idx >= 0 ? Math.round((idx / (ESTADOS.length - 1)) * 100) : 0,
    importe: e.importe, fechaPago: e.fechaPago, finDesistimiento: e.finDesistimiento,
    createdAt: e.createdAt, updatedAt: e.updatedAt,
  };
}
