// ============================================================
// Vista de backend del catálogo compartido (shared/servicios.js).
// Expone `checklist` (= `documentos` compartidos) para que
// portal.js/checkout.js sigan funcionando sin cambios.
// Los estados del portal y los helpers viven aquí.
// ============================================================
import { SERVICIOS as SHARED } from '../../shared/servicios.js';

// Estados visibles para el cliente (orden = línea de tiempo)
export const ESTADOS = [
  { id: 'pago_pendiente',          label: 'Pago pendiente' },
  { id: 'pagado',                  label: 'Pago recibido' },
  { id: 'documentacion_pendiente', label: 'Falta documentación' },
  { id: 'en_gestion',              label: 'En gestión' },
  { id: 'presentado',              label: 'Presentado en la administración' },
  { id: 'completado',              label: 'Completado' },
];
export const ESTADO_INCIDENCIA = { id: 'incidencia', label: 'Incidencia — te contactamos' };

// El backend consume `servicio.checklist`; lo derivamos de `documentos`.
export const SERVICIOS = Object.fromEntries(
  Object.entries(SHARED).map(([slug, s]) => [slug, { ...s, checklist: s.documentos }])
);

export function getServicio(slug) {
  return SERVICIOS[slug] || null;
}

// Traduce una fase de Zoho al estado del portal (webhook de Zoho)
export function faseToEstado(servicioSlug, fase) {
  const s = SERVICIOS[servicioSlug];
  if (!s || !fase) return null;
  return s.zoho.fases[fase] ?? null;
}
